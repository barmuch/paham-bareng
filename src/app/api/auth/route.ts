import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authenticate } from '@/lib/auth';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// Force Node.js runtime for MongoDB compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

// POST /api/auth?action=login
// POST /api/auth?action=register  
// GET /api/auth (get current user)
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    await connectDB();
    
    const user = await User.findById(auth.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication required' },
      { status: 401, headers: corsHeaders }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'login';
    const body = await req.json();

    // Handle registration
    if (action === 'register') {
      const { name, email, password } = body;

      if (!name || !email || !password) {
        return NextResponse.json(
          { success: false, message: 'All fields are required' },
          { status: 400, headers: corsHeaders }
        );
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already registered' },
          { status: 400, headers: corsHeaders }
        );
      }

      const user = await User.create({ name, email, password });
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: '7d',
      });

      return NextResponse.json({
        success: true,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isPremium: user.isPremium,
          },
          token,
        },
      }, { status: 201, headers: corsHeaders });
    }

    // Handle login (default)
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isPremium: user.isPremium,
        },
        token,
      },
    }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
