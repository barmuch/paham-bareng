import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Roadmap from '@/models/Roadmap';
import '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Mock data for development without MongoDB
const MOCK_ROADMAPS = [
  {
    _id: '1',
    title: 'Roadmap Tauhid (Aqidah Dasar)',
    slug: 'tauhid-dasar',
    description: 'Panduan bertahap memahami tauhid, rukun iman, dan prinsip aqidah secara tematik',
    icon: '🕌',
    category: 'aqidah',
    tags: ['tauhid', 'aqidah', 'rukun-iman', 'asma-was-sifat'],
    estimatedDuration: 60,
    views: 1320,
    likes: 146,
    isFeatured: true,
    isPublished: true,
  },
  {
    _id: '2',
    title: 'Roadmap Fiqh Ibadah (Praktik Harian)',
    slug: 'fiqh-ibadah',
    description: 'Belajar fiqh ibadah dari dasar: thaharah, shalat, puasa, zakat, hingga haji',
    icon: '📿',
    category: 'fiqh',
    tags: ['fiqh', 'thaharah', 'shalat', 'puasa', 'zakat'],
    estimatedDuration: 80,
    views: 980,
    likes: 102,
    isFeatured: true,
    isPublished: true,
  },
  {
    _id: '3',
    title: 'Roadmap Sirah Nabawiyah (Sejarah & Pelajaran)',
    slug: 'sirah-nabawiyah',
    description: 'Mempelajari sirah Nabi ﷺ secara kronologis dan tematik beserta ibrah-nya',
    icon: '📖',
    category: 'sirah',
    tags: ['sirah', 'makkah', 'madinah', 'akhlaq', 'ibrah'],
    estimatedDuration: 70,
    views: 760,
    likes: 88,
    isFeatured: true,
    isPublished: true,
  },
  {
    _id: '4',
    title: 'Roadmap Al-Qur’an (Tilawah → Tadabbur)',
    slug: 'quran-tilawah-tadabbur',
    description: 'Tahsin & tajwid, hafalan bertahap, hingga dasar-dasar tadabbur dan pengamalan',
    icon: '📗',
    category: 'quran',
    tags: ['quran', 'tajwid', 'tahsin', 'hafalan', 'tadabbur'],
    estimatedDuration: 100,
    views: 610,
    likes: 75,
    isFeatured: false,
    isPublished: true,
  },
  {
    _id: '5',
    title: 'Roadmap Ulumul Hadits (Dasar Sanad & Matan)',
    slug: 'ulumul-hadits-dasar',
    description: 'Memahami istilah-istilah hadits, validasi riwayat, dan adab berinteraksi dengan sunnah',
    icon: '🧾',
    category: 'hadith',
    tags: ['hadits', 'isnad', 'matan', 'musthalah', 'adab'],
    estimatedDuration: 90,
    views: 420,
    likes: 54,
    isFeatured: false,
    isPublished: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    // Try to connect to MongoDB
    let useDatabase = true;
    try {
      await connectDB();
    } catch (dbError) {
      console.log('⚠️ MongoDB not available, using mock data');
      useDatabase = false;
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    if (!useDatabase) {
      // Return mock data
      let filtered = [...MOCK_ROADMAPS];
      
      if (category && category !== 'all') {
        filtered = filtered.filter(r => r.category === category);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(r => 
          r.title.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower)
        );
      }

      if (featured === 'true') {
        filtered = filtered.filter(r => r.isFeatured);
      }

      return NextResponse.json({
        success: true,
        data: filtered,
        pagination: {
          page: 1,
          limit: filtered.length,
          total: filtered.length,
          pages: 1,
        },
        _mock: true,
      }, { headers: corsHeaders });
    }

    let query: any = { isPublished: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const total = await Roadmap.countDocuments(query);
    const roadmaps = await Roadmap.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name')
      .select('-nodes -edges');

    return NextResponse.json({
      success: true,
      data: roadmaps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    // This would need authentication middleware
    const data = await req.json();
    
    const roadmap = await Roadmap.create(data);
    
    return NextResponse.json({
      success: true,
      data: roadmap,
    }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}