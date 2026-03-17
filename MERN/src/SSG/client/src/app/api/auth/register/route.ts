// client/src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/config/env.config';

/**
 * Handles POST requests for user registration via the BFF pattern.
 * Proxies the request to the external API and forwards cookies if auto-login is supported.
 *
 * @param {NextRequest} request - The incoming request containing registration data.
 * @returns {Promise<NextResponse>} The response from the external API with first-party cookies.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const backendResponse = await fetch(`${ENV.API_URL}/auth/register`, {
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
    console.error('[NEXT_API_REGISTER_ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}