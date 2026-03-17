import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/config/env.config';

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';

    const backendResponse = await fetch(`${ENV.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    const data = await backendResponse.json();
    const response = NextResponse.json(data, {
      status: backendResponse.status,
    });

    if (backendResponse.ok) {
      const setCookieHeaders = backendResponse.headers.getSetCookie();
      for (const cookie of setCookieHeaders) {
        response.headers.append('Set-Cookie', cookie);
      }
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}