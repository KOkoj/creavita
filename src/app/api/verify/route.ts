import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    // ---- Logs Removed ----
    // console.log('[API /api/verify] Received code:', code);
    // console.log('[API /api/verify] Expected code (from .env.local):', process.env.UPLOAD_CODE);
    // ---- End Logs Removed ----

    if (code === process.env.UPLOAD_CODE) {
      // console.log('[API /api/verify] Codes matched!'); // Log removed
      const response = NextResponse.json({ success: true });
      response.cookies.set('access_granted', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
        sameSite: 'lax',
      });
      return response;
    }
    // console.log('[API /api/verify] Codes DID NOT match.'); // Log removed
    return NextResponse.json({ error: 'Invalid access code provided.' }, { status: 401 });
  } catch (error) {
    console.error('Verify API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 