import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check if environment variables are set
    const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
    const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
    const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;

    // Test Cloudinary connection
    const testResult = await new Promise((resolve, reject) => {
      cloudinary.api.ping((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Cloudinary configuration test',
      config: {
        hasCloudName,
        hasApiKey,
        hasApiSecret,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME?.substring(0, 3) + '...',
      },
      testResult
    });
  } catch (error) {
    console.error('Cloudinary test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      }
    }, { status: 500 });
  }
} 