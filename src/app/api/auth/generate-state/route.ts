import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET() {
  // ランダムなstateパラメータを生成（CSRF攻撃防止）
  const state = randomBytes(32).toString('hex');

  console.log('=== Generating OAuth State ===');
  console.log('Generated state:', state);
  console.log('Environment:', process.env.NODE_ENV);

  const response = NextResponse.json({ state });

  // stateをHTTPOnly cookieに保存（XSS攻撃から保護）
  // sameSite: 'none'を使用してクロスサイトでも送信されるようにする
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none' as const, // クロスサイトでもCookieを送信
    path: '/',
    maxAge: 60 * 10, // 10分間有効
  };

  // 開発環境でHTTPを使用している場合は、sameSite: 'lax'にフォールバック
  if (process.env.NODE_ENV !== 'production') {
    cookieOptions.sameSite = 'lax' as const;
    cookieOptions.secure = false;
  }

  console.log('Cookie options:', cookieOptions);

  response.cookies.set('oauth_state', state, cookieOptions);

  return response;
}
