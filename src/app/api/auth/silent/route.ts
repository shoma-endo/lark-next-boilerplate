import { NextRequest, NextResponse } from 'next/server';
import { larkClient } from '@/lib/lark';

/**
 * サイレント認証エンドポイント
 * Larkアプリ内からのログインで使用
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, employeeID, openID } = body;

    if (!code && !openID) {
      return NextResponse.json(
        { error: '認証情報が不足しています' },
        { status: 400 }
      );
    }

    let userInfo;
    let accessToken;
    let refreshToken;

    // 認証コードがある場合は通常のOAuthフロー
    if (code) {
      const tokenRes = await larkClient.authen.accessToken.create({
        data: {
          grant_type: 'authorization_code',
          code,
        },
      });

      const tokenData = tokenRes.data as any;
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;

      userInfo = {
        name: tokenData.name,
        avatar_url: tokenData.avatar_url,
        open_id: tokenData.open_id,
      };
    }
    // openIDがある場合は、既存のセッションを確認
    else if (openID) {
      // Larkアプリ内でログイン済みの場合、
      // サーバー側でapp_access_tokenを使用してユーザー情報を取得
      try {
        // ユーザー情報を取得（Lark SDKが自動的にテナントトークンを管理）
        const userRes = await larkClient.contact.user.get({
          path: {
            user_id: openID,
          },
          params: {
            user_id_type: 'open_id',
          },
        });

        const userData = userRes.data?.user;
        if (!userData) {
          throw new Error('ユーザー情報が見つかりません');
        }

        userInfo = {
          name: userData.name || '',
          avatar_url: userData.avatar?.avatar_240 || '',
          open_id: openID,
        };

        // サイレント認証の場合、短期間のセッションを作成
        // 実際のアクセストークンは発行されないため、refresh_tokenも設定しない
        accessToken = 'silent_auth_session';
        refreshToken = '';
      } catch (error) {
        console.error('ユーザー情報取得エラー:', error);
        return NextResponse.json(
          { error: 'ユーザー情報の取得に失敗しました' },
          { status: 500 }
        );
      }
    }

    if (!userInfo) {
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 401 }
      );
    }

    console.log('✅ サイレント認証成功:', userInfo);

    // Cookie設定
    const response = NextResponse.json({ success: true, user: userInfo });
    const currentTimestamp = Date.now().toString();

    if (accessToken && accessToken !== 'silent_auth_session') {
      response.cookies.set('lark_token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7日間
      });
    }

    if (refreshToken) {
      response.cookies.set('lark_refresh', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30日間
      });
    }

    response.cookies.set('lark_token_timestamp', currentTimestamp, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30日間
    });

    // ユーザー情報をクッキーに保存
    response.cookies.set('lark_user', JSON.stringify(userInfo), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7日間
    });

    return response;
  } catch (error) {
    console.error('サイレント認証エラー:', error);
    return NextResponse.json(
      { error: '認証処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
