import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // For now, we'll just acknowledge receipt of metrics
    // In a production environment, you might want to store these in a database
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 