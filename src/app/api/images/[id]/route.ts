import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectDb from '@/lib/mongodb';
import ImageModel from '@/models/Image';

export const dynamic = 'force-dynamic';

// Helper function to handle file deletion safely
const safeUnlink = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Successfully deleted file: ${filePath}`);
    } else {
      console.log(`File not found, skipping delete: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err);
    // Decide if you want to throw the error or just log it
  }
};

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (req.cookies.get('access_granted')?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDb();
    const { id } = params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
       return NextResponse.json({ error: 'Invalid image ID format' }, { status: 400 });
    }

    const image = await ImageModel.findById(id);
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Construct file path and delete the file
    const fileName = path.basename(image.url); // Extract filename from URL like /uploads/image.jpg
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
    safeUnlink(filePath);

    // Delete the database record
    await ImageModel.findByIdAndDelete(id); // Use findByIdAndDelete

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(`Error deleting image ${params?.id}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (req.cookies.get('access_granted')?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDb();
    const { id } = params;
    const data = await req.json();

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
       return NextResponse.json({ error: 'Invalid image ID format' }, { status: 400 });
    }

    // Basic validation for update data
    if (!data.title || !data.description || !data.category) {
      return NextResponse.json({ error: 'Missing required fields (title, description, category)' }, { status: 400 });
    }

    // NOTE: This version does not handle replacing the image file itself.
    const updatedImage = await ImageModel.findByIdAndUpdate(id, {
      title: data.title,
      description: data.description,
      category: data.category
    }, { new: true }); // { new: true } returns the updated document

    if (!updatedImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json(updatedImage);

   } catch (error) {
    console.error(`Error updating image ${params?.id}:`, error);
    // Handle potential JSON parsing errors
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 