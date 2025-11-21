import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET() {
  // ランダムなstateパラメータを生成（CSRF攻撃防止）
  const state = randomBytes(32).toString('hex');

  console.log('=== Generating OAuth State ===');
  console.log('Generated state:', state);
  console.log('State length:', state.length);
  console.log('Environment:', process.env.NODE_ENV);

  const response = NextResponse.json({ state });

  // stateをHTTPOnly cookieに保存（XSS攻撃から保護）
  // 環境に応じて適切なCookie設定を使用
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'none';
    path: string;
    maxAge: number;
  } = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', // 本番: クロスサイト対応、開発: lax
    path: '/',
    maxAge: 60 * 10, // 10分間有効
  };

  console.log('Cookie options:', cookieOptions);
  console.log('✅ Setting cookie: oauth_state =', state.substring(0, 20) + '...');

  response.cookies.set('oauth_state', state, cookieOptions);

  // デバッグ用: 設定したCookieを確認
  const setCookieHeader = response.headers.get('set-cookie');
  console.log('Set-Cookie header:', setCookieHeader);

  return response;
}
