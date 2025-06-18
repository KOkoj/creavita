import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Image from '@/models/Image';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Force dynamic rendering for MongoDB routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Specify Node.js runtime for file operations

// Helper function for error responses
const errorResponse = (message: string, status: number = 500, details?: any) => {
  console.error(`API Error: ${message}`, details);
  return NextResponse.json({ 
    error: message,
    details: details || undefined
  }, { status });
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const images = await Image.find().sort({ createdAt: -1 });
    return NextResponse.json(images);
  } catch (error) {
    console.error('GET /api/images error:', error);
    return errorResponse('Failed to fetch images', 500, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authentication check
    if (req.cookies.get('access_granted')?.value !== 'true') {
      return errorResponse('Unauthorized', 401);
    }

    // Verify Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary configuration:', {
        hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
      });
      return errorResponse('Cloudinary configuration is missing', 500);
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    // Input validation
    if (!title || !description || !category) {
      return errorResponse('Missing required fields: title, description, or category', 400);
    }

    const filesField = formData.getAll('file');
    if (!filesField.length) {
      return errorResponse('No files uploaded', 400);
    }

    await connectDB();
    const uploadedImages = [];

    // Process each file
    for (const fileItem of filesField) {
      const file = fileItem as File;
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return errorResponse('Invalid file type. Only images are allowed.', 400);
      }

      // Convert file to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString('base64');
      const dataURI = `data:${file.type};base64,${base64String}`;

      // Upload to Cloudinary
      try {
        console.log('Uploading to Cloudinary...');
        const uploadResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(dataURI, {
            folder: 'gallery',
            resource_type: 'auto'
          }, (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('Cloudinary upload success:', result);
              resolve(result);
            }
          });
        });

        const { secure_url } = uploadResponse as { secure_url: string };

        // Create database entry
        const image = await Image.create({
          title: filesField.length > 1 ? `${title} - ${uploadedImages.length + 1}` : title,
          description,
          category,
          url: secure_url,
        });
        uploadedImages.push(image);
      } catch (uploadError) {
        console.error('Error in upload process:', uploadError);
        return errorResponse('Failed to upload image to cloud storage', 500, uploadError);
      }
    }

    // Return appropriate response
    return NextResponse.json(
      uploadedImages.length === 1 
        ? uploadedImages[0]
        : { 
            message: `Successfully uploaded ${uploadedImages.length} images`,
            images: uploadedImages 
          }
    );
  } catch (error) {
    console.error('Error in POST /api/images:', error);
    return errorResponse('Failed to process image upload', 500, error);
  }
} 