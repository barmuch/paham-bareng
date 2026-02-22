import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';
import Team from '@/models/Team';
import User from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    await connectDB();

    const teams = await Team.find({
      $or: [
        { owner: auth.userId },
        { 'members.user': auth.userId },
      ],
    })
      .populate('owner', 'name avatar')
      .populate('members.user', 'name avatar email')
      .populate('roadmaps.roadmap', 'title slug icon category');

    return NextResponse.json({ success: true, data: teams });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication required' },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const inviteCode = searchParams.get('code');

    // Handle join team action
    if (action === 'join' && inviteCode) {
      const team = await Team.findOne({ inviteCode });
      if (!team) {
        return NextResponse.json(
          { success: false, message: 'Invalid invite code' },
          { status: 404 }
        );
      }

      const isMember = team.members.some(
        (m: any) => m.user.toString() === auth.userId.toString()
      );
      if (isMember) {
        return NextResponse.json(
          { success: false, message: 'Already a member' },
          { status: 400 }
        );
      }

      if (team.members.length >= team.maxMembers) {
        return NextResponse.json(
          { success: false, message: 'Team is full' },
          { status: 400 }
        );
      }

      team.members.push({ user: auth.userId, role: 'member' });
      await team.save();

      await User.findByIdAndUpdate(auth.userId, { $addToSet: { teams: team._id } });

      return NextResponse.json({
        success: true,
        message: 'Joined team successfully',
        data: team,
      });
    }

    // Default: create new team
    const { name, description, isPublic } = await req.json();

    const team = await Team.create({
      name,
      description,
      isPublic,
      owner: auth.userId,
      members: [{ user: auth.userId, role: 'owner' }],
    });

    await User.findByIdAndUpdate(auth.userId, { $addToSet: { teams: team._id } });

    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
