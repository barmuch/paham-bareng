import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';
import Team from '@/models/Team';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticate(req);
    await connectDB();

    const team = await Team.findById(params.id)
      .populate('owner', 'name avatar')
      .populate('members.user', 'name avatar email')
      .populate('roadmaps.roadmap', 'title slug icon category');

    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      );
    }

    const isMember = team.members.some(
      (m: any) => m.user._id.toString() === auth.userId.toString()
    );
    if (!isMember && !team.isPublic) {
      return NextResponse.json(
        { success: false, message: 'Not a team member' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: team });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication required' },
      { status: 401 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticate(req);
    await connectDB();

    const team = await Team.findById(params.id);
    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      );
    }

    const member = team.members.find(
      (m: any) => m.user.toString() === auth.userId.toString()
    );
    if (!member || !['owner', 'admin'].includes(member.role)) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      );
    }

    const { name, description, isPublic, skillTracking } = await req.json();
    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (isPublic !== undefined) team.isPublic = isPublic;
    if (skillTracking) team.skillTracking = skillTracking;

    await team.save();
    return NextResponse.json({ success: true, data: team });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication required' },
      { status: 500 }
    );
  }
}
