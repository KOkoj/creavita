import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGODB_URI value:', process.env.MONGODB_URI?.substring(0, 20) + '...');
    
    await connectDB();
    console.log('MongoDB connection successful!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection successful!',
      hasMongoUri: !!process.env.MONGODB_URI,
      hasUploadCode: !!process.env.UPLOAD_CODE
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      hasMongoUri: !!process.env.MONGODB_URI,
      hasUploadCode: !!process.env.UPLOAD_CODE
    }, { status: 500 });
  }
} 