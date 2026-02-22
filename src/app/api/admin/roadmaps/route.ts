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

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ('res' in admin) return admin.res;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const total = await Roadmap.countDocuments(query);
    const roadmaps = await Roadmap.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: {
        roadmaps,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch roadmaps' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ('res' in admin) return admin.res;

  try {
    await connectDB();
    const body = await req.json();

    const roadmap = await Roadmap.create({
      ...body,
      author: admin.user._id,
    });

    return NextResponse.json({ success: true, data: roadmap });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create roadmap' },
      { status: 500 }
    );
  }
}
