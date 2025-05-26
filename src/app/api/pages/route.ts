import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Page from '@/models/Page';

// GET all pages
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    
    await connectDB();
    
    // If a slug is provided, get that specific page
    if (slug) {
      const page = await Page.findOne({ slug });
      
      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }
      
      return NextResponse.json(page);
    }
    
    // Otherwise, get all pages
    const pages = await Page.find().select('slug title lastUpdated');
    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create or update a page
export async function POST(req: NextRequest) {
  try {
    // Check if admin is authenticated
    if (req.cookies.get('access_granted')?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    const { slug, title, content, image, metaDescription } = data;
    
    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, title, or content' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Check if page exists
    const existingPage = await Page.findOne({ slug });
    
    if (existingPage) {
      // Update existing page
      existingPage.title = title;
      existingPage.content = content;
      existingPage.metaDescription = metaDescription || '';
      if (image) existingPage.image = image;
      existingPage.lastUpdated = new Date();
      
      await existingPage.save();
      return NextResponse.json(existingPage);
    } else {
      // Create new page
      const newPage = await Page.create({
        slug,
        title,
        content,
        image,
        metaDescription: metaDescription || '',
        lastUpdated: new Date()
      });
      
      return NextResponse.json(newPage, { status: 201 });
    }
  } catch (error) {
    console.error('Error saving page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a page
export async function DELETE(req: NextRequest) {
  try {
    // Check if admin is authenticated
    if (req.cookies.get('access_granted')?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Missing required parameter: slug' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const result = await Page.deleteOne({ slug });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 