import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if ('res' in admin) return admin.res;

  try {
    await connectDB();
    const roadmap = await Roadmap.findById(params.id);
    if (!roadmap) {
      return NextResponse.json({ success: false, message: 'Roadmap not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: roadmap });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch roadmap' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if ('res' in admin) return admin.res;

  try {
    await connectDB();
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // Handle publish action
    if (action === 'publish') {
      const isPublished = !!body?.isPublished;
      const roadmap = await Roadmap.findByIdAndUpdate(
        params.id,
        { isPublished },
        { new: true, runValidators: true }
      );
      if (!roadmap) {
        return NextResponse.json({ success: false, message: 'Roadmap not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: roadmap });
    }

    // Handle nodes update action
    if (action === 'nodes') {
      const nodes = Array.isArray(body?.nodes) ? body.nodes : [];
      const edges = Array.isArray(body?.edges) ? body.edges : [];
      const estimatedDuration = nodes.reduce((sum: number, node: any) => {
        return sum + (typeof node?.estimatedHours === 'number' ? node.estimatedHours : 0);
      }, 0);

      const roadmap = await Roadmap.findByIdAndUpdate(
        params.id,
        {
          nodes,
          edges,
          estimatedDuration,
          $inc: { version: 1 },
        },
        { new: true, runValidators: true }
      );
      if (!roadmap) {
        return NextResponse.json({ success: false, message: 'Roadmap not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: roadmap });
    }

    // Default: regular update
    const roadmap = await Roadmap.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true, runValidators: true }
    );

    if (!roadmap) {
      return NextResponse.json({ success: false, message: 'Roadmap not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: roadmap });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update roadmap' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if ('res' in admin) return admin.res;

  try {
    await connectDB();
    const roadmap = await Roadmap.findByIdAndDelete(params.id);
    if (!roadmap) {
      return NextResponse.json({ success: false, message: 'Roadmap not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { _id: params.id } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete roadmap' },
      { status: 500 }
    );
  }
}
