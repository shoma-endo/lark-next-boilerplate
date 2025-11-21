import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET() {
  // ランダムなstateパラメータを生成（CSRF攻撃防止）
  const state = randomBytes(32).toString('hex');

  const response = NextResponse.json({ state });

  // stateをHTTPOnly cookieに保存（XSS攻撃から保護）
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10分間有効
  });

  return response;
}
