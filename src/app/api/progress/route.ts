import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';
import Progress from '@/models/Progress';
import Roadmap from '@/models/Roadmap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    const { searchParams } = new URL(req.url);
    const stats = searchParams.get('stats');
    
    await connectDB();
    
    // Handle stats overview request
    if (stats === 'overview') {
      const progress = await Progress.find({ user: auth.userId });
      const statsData = {
        totalRoadmaps: progress.length,
        completedRoadmaps: progress.filter((p: any) => p.percentage === 100).length,
        inProgressRoadmaps: progress.filter(
          (p: any) => p.percentage > 0 && p.percentage < 100
        ).length,
        averageProgress:
          progress.length > 0
            ? Math.round(
                progress.reduce((sum: number, p: any) => sum + p.percentage, 0) /
                  progress.length
              )
            : 0,
        totalTimeSpentMinutes: progress.reduce(
          (sum: number, p: any) => sum + (p.totalTimeSpentMinutes || 0),
          0
        ),
        totalNodesCompleted: progress.reduce(
          (sum: number, p: any) =>
            sum + p.nodeProgress.filter((n: any) => n.status === 'completed').length,
          0
        ),
      };
      return NextResponse.json({ success: true, data: statsData });
    }
    
    // Default: return all progress
    const progress = await Progress.find({ user: auth.userId })
      .populate('roadmap', 'title slug icon category')
      .populate('team', 'name')
      .sort({ lastActivityAt: -1 });

    return NextResponse.json({ success: true, data: progress });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication required' },
      { status: 401 }
    );
  }
}
