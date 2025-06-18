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
export const runtime = 'nodejs';

// Helper function for error responses
const errorResponse = (message: string, status: number = 500) => {
  console.error(`API Error: ${message}`);
  return NextResponse.json({ error: message }, { status });
};

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authentication check
    if (req.cookies.get('access_granted')?.value !== 'true') {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return errorResponse('Invalid image ID format', 400);
    }

    await connectDB();
    
    const image = await Image.findById(id);
    if (!image) {
      return errorResponse('Image not found', 404);
    }

    // Extract public_id from Cloudinary URL
    const urlParts = image.url.split('/');
    const publicId = urlParts[urlParts.length - 1].split('.')[0];

    // Delete from Cloudinary
    try {
      await new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete the database record
    await Image.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error(`Error deleting image ${params?.id}:`, error);
    return errorResponse('Failed to delete image');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authentication check
    if (req.cookies.get('access_granted')?.value !== 'true') {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return errorResponse('Invalid image ID format', 400);
    }

    let data;
    try {
      data = await req.json();
    } catch (e) {
      return errorResponse('Invalid JSON body', 400);
    }

    // Validate update data
    if (!data.title || !data.description || !data.category) {
      return errorResponse('Missing required fields (title, description, category)', 400);
    }

    await connectDB();

    const updatedImage = await Image.findByIdAndUpdate(
      id,
      {
        title: data.title,
        description: data.description,
        category: data.category
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedImage) {
      return errorResponse('Image not found', 404);
    }

    return NextResponse.json({
      success: true,
      data: updatedImage
    });

  } catch (error) {
    console.error(`Error updating image ${params?.id}:`, error);
    return errorResponse('Failed to update image');
  }
} 