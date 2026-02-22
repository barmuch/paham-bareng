import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';
import Progress from '@/models/Progress';
import Roadmap from '@/models/Roadmap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { roadmapId: string } }
) {
  try {
    const auth = await authenticate(req);
    await connectDB();

    let progress = await Progress.findOne({
      user: auth.userId,
      roadmap: params.roadmapId,
    });

    if (!progress) {
      const roadmap = await Roadmap.findById(params.roadmapId);
      if (!roadmap) {
        return NextResponse.json(
          { success: false, message: 'Roadmap not found' },
          { status: 404 }
        );
      }

      progress = await Progress.create({
        user: auth.userId,
        roadmap: params.roadmapId,
        nodeProgress: roadmap.nodes.map((node: any) => ({
          nodeId: node.id,
          status: 'not-started',
        })),
      });
    }

    return NextResponse.json({ success: true, data: progress });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication required' },
      { status: 401 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { roadmapId: string } }
) {
  try {
    const auth = await authenticate(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const nodeId = searchParams.get('nodeId');
    
    if (!nodeId) {
      return NextResponse.json(
        { success: false, message: 'nodeId query parameter is required' },
        { status: 400 }
      );
    }

    const { status, notes, timeSpentMinutes } = await req.json();

    let progress = await Progress.findOne({
      user: auth.userId,
      roadmap: params.roadmapId,
    });

    if (!progress) {
      const roadmap = await Roadmap.findById(params.roadmapId);
      if (!roadmap) {
        return NextResponse.json(
          { success: false, message: 'Roadmap not found' },
          { status: 404 }
        );
      }
      progress = new Progress({
        user: auth.userId,
        roadmap: params.roadmapId,
        nodeProgress: roadmap.nodes.map((node: any) => ({
          nodeId: node.id,
          status: 'not-started',
        })),
      });
    }

    const nodeIdx = progress.nodeProgress.findIndex(
      (n: any) => n.nodeId === nodeId
    );

    if (nodeIdx === -1) {
      progress.nodeProgress.push({
        nodeId: nodeId,
        status: status || 'not-started',
        notes: notes || '',
        timeSpentMinutes: timeSpentMinutes || 0,
      });
    } else {
      if (status) progress.nodeProgress[nodeIdx].status = status;
      if (notes !== undefined) progress.nodeProgress[nodeIdx].notes = notes;
      if (timeSpentMinutes) {
        progress.nodeProgress[nodeIdx].timeSpentMinutes =
          (progress.nodeProgress[nodeIdx].timeSpentMinutes || 0) + timeSpentMinutes;
      }
      if (status === 'completed') {
        progress.nodeProgress[nodeIdx].completedAt = new Date();
      }
    }

    await progress.save();
    return NextResponse.json({ success: true, data: progress });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication required' },
      { status: 401 }
    );
  }
}
