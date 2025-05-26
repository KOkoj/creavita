import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const authorized = req.cookies.get('access_granted')?.value === 'true';
    return NextResponse.json({ authorized });
  } catch (error) {
    console.error('Verify status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 