import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/config/env.config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(`${ENV.API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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