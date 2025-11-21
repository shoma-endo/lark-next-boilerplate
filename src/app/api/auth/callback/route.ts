import { NextRequest, NextResponse } from 'next/server';
import { larkClient } from '@/lib/lark';
import { LarkAccessTokenResponse } from '@/types/user';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: '認証コードがありません。' }, { status: 400 });
  }

  // stateパラメータの検証（CSRF攻撃防止）
  const savedState = req.cookies.get('oauth_state')?.value;
  if (!state || !savedState || state !== savedState) {
    return NextResponse.json(
      { error: 'Invalid state parameter. Possible CSRF attack.' },
      { status: 400 }
    );
  }

  try {
    // Larkからトークンとユーザー情報を同時取得
    const tokenRes = await larkClient.authen.accessToken.create({
      data: {
        grant_type: 'authorization_code',
        code,
      },
    });
    console.log('tokenRes', tokenRes);

    const {
      access_token,
      refresh_token,
      name,
      avatar_url,
      open_id,
    } = tokenRes.data as LarkAccessTokenResponse;

    console.log('✅ Lark 認証成功:', { name, avatar_url, open_id });

    // Cookie 設定
    const response = NextResponse.redirect(new URL('/', req.url));
    const currentTimestamp = Date.now().toString();

    // 使用済みのoauth_stateクッキーを削除
    response.cookies.delete('oauth_state');

    response.cookies.set('lark_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7日間
    });
    response.cookies.set('lark_refresh', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30日間
    });
    
    // トークンのタイムスタンプを追加
    response.cookies.set('lark_token_timestamp', currentTimestamp, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30日間
    });

    // ユーザー情報をクッキーに保存
    const userInfo = {
      name,
      avatar_url,
      open_id,
    };
    response.cookies.set('lark_user', JSON.stringify(userInfo), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7日間
    });

    return response;
  } catch (error) {
    console.error('Lark Callback Error:', error);
    return NextResponse.json({ error: '認証処理中にエラーが発生しました。' }, { status: 500 });
  }
}
