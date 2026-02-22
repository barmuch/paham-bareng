import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';
import User from '@/models/User';
import Roadmap from '@/models/Roadmap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAdmin(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.user.role !== 'admin') {
      return { res: NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 }) };
    }
    return { user: auth.user };
  } catch {
    return { res: NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 }) };
  }
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ('res' in admin) return admin.res;

  try {
    await connectDB();

    const [totalUsers, totalRoadmaps] = await Promise.all([
      User.countDocuments({}),
      Roadmap.countDocuments({}),
    ]);

    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .select('name email role createdAt');

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalRoadmaps,
        totalProjects: 0,
        activeLearnersThisWeek: 0,
        recentUsers,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
