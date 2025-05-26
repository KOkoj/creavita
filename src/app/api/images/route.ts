import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Image from '@/models/Image';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const images = await Image.find();
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (req.cookies.get('access_granted')?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    // Check if basic fields are provided
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, or category' },
        { status: 400 }
      );
    }

    // Get files from form data
    const filesField = formData.getAll('file');
    
    // Check if at least one file is provided
    if (!filesField.length) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public/uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    await connectDB();
    const uploadedImages = [];

    // Process each file
    for (const fileItem of filesField) {
      const file = fileItem as File;
      
      // Process this file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${file.name}`;
      const path = join(uploadsDir, fileName);
      await writeFile(path, buffer);

      // Create database entry
      const image = await Image.create({
        title: filesField.length > 1 ? `${title} - ${uploadedImages.length + 1}` : title,
        description,
        category,
        url: `/uploads/${fileName}`,
      });

      uploadedImages.push(image);
    }

    // Return appropriate response
    if (uploadedImages.length === 1) {
      return NextResponse.json(uploadedImages[0]);
    } else {
      return NextResponse.json({ 
        message: `Successfully uploaded ${uploadedImages.length} images`,
        images: uploadedImages 
      });
    }
  } catch (error) {
    console.error('Error uploading image(s):', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 