import { NextRequest, NextResponse } from 'next/server';
import { larkClient } from '@/lib/lark';
import { LarkAccessTokenResponse } from '@/types/user';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');

  // デバッグ情報を収集
  const allCookies = req.cookies.getAll();
  const savedState = req.cookies.get('oauth_state')?.value;

  console.log('=== OAuth Callback Debug Info ===');
  console.log('Request URL:', req.url);
  console.log('Request headers (cookie):', req.headers.get('cookie'));
  console.log('Received code:', code ? code.substring(0, 20) + '...' : 'null');
  console.log('Received state:', state ? state.substring(0, 20) + '...' : 'null');
  console.log('Saved state from cookie:', savedState ? savedState.substring(0, 20) + '...' : 'undefined');
  console.log('All cookies:', allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })));
  console.log('All URL params:', Object.fromEntries(req.nextUrl.searchParams.entries()));

  if (!code) {
    console.error('❌ Code parameter is missing from callback URL');
    return NextResponse.json({ error: '認証コードがありません。' }, { status: 400 });
  }

  // stateパラメータの検証（CSRF攻撃防止）
  // 開発環境でのデバッグモード: 環境変数で検証をスキップ可能
  const skipStateValidation = process.env.NODE_ENV === 'development' && process.env.SKIP_OAUTH_STATE_VALIDATION === 'true';

  if (skipStateValidation) {
    console.warn('⚠️ DEVELOPMENT MODE: OAuth state validation is DISABLED');
    console.warn('⚠️ This should NEVER be used in production!');
  }

  if (!state && !skipStateValidation) {
    console.error('❌ State parameter is missing from callback URL');
    console.error('⚠️ This indicates that Lark did not return the state parameter.');
    console.error('⚠️ Possible causes:');
    console.error('   1. The state was not included in the initial authorization URL');
    console.error('   2. Lark application configuration issue');
    console.error('   3. Redirect URI mismatch');
    console.error('');
    console.error('💡 To temporarily bypass this check for debugging, set:');
    console.error('   SKIP_OAUTH_STATE_VALIDATION=true');
    return NextResponse.json(
      {
        error: 'State parameter is missing from Lark callback',
        debug: process.env.NODE_ENV === 'development' ? {
          receivedState: state,
          savedState: savedState,
          hint: 'Check that the authorization URL includes the state parameter',
          bypassHint: 'Set SKIP_OAUTH_STATE_VALIDATION=true in .env.local to temporarily bypass',
        } : undefined
      },
      { status: 400 }
    );
  }

  if (!savedState && !skipStateValidation) {
    console.error('❌ OAuth state cookie not found');
    console.error('Available cookies:', allCookies.map(c => c.name));
    return NextResponse.json(
      {
        error: 'OAuth state cookie not found. Please try logging in again.',
        debug: process.env.NODE_ENV === 'development' ? {
          message: 'Cookie may not have been set or was cleared. Check that cookies are enabled and redirect_uri matches exactly.',
          receivedState: state,
          availableCookies: allCookies.map(c => c.name),
        } : undefined
      },
      { status: 400 }
    );
  }

  if (state && savedState && state !== savedState) {
    console.error('❌ State mismatch - Possible CSRF attack');
    console.error('Received:', state);
    console.error('Expected:', savedState);
    return NextResponse.json(
      {
        error: 'Invalid state parameter. Possible CSRF attack.',
        debug: process.env.NODE_ENV === 'development' ? {
          receivedState: state,
          savedState: savedState,
          match: state === savedState,
        } : undefined
      },
      { status: 400 }
    );
  }

  if (!skipStateValidation) {
    console.log('✅ State validation passed');
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
