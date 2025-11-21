import { NextRequest, NextResponse } from 'next/server';
import { larkClient } from '@/lib/lark';

/**
 * サイレント認証エンドポイント
 * Larkアプリ内からのログインで使用
 *
 * セキュリティ：認証コードのみを受け入れ、Lark APIで検証
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    // 認証コードが必須（セキュリティのため、openIDを直接受け入れない）
    if (!code) {
      return NextResponse.json(
        { error: '認証コードが必要です' },
        { status: 400 }
      );
    }

    // Lark APIで認証コードを検証してユーザー情報を取得
    const tokenRes = await larkClient.authen.accessToken.create({
      data: {
        grant_type: 'authorization_code',
        code,
      },
    });

    const tokenData = tokenRes.data as any;

    if (!tokenData || !tokenData.access_token) {
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 401 }
      );
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    const userInfo = {
      name: tokenData.name,
      avatar_url: tokenData.avatar_url,
      open_id: tokenData.open_id,
    };

    console.log('✅ サイレント認証成功:', userInfo);

    // Cookie設定（Bug 1修正: すべての認証でクッキーを設定）
    const response = NextResponse.json({ success: true, user: userInfo });
    const currentTimestamp = Date.now().toString();

    // アクセストークンを必ず設定
    response.cookies.set('lark_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7日間
    });

    // リフレッシュトークンを設定
    if (refreshToken) {
      response.cookies.set('lark_refresh', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30日間
      });
    }

    // トークンのタイムスタンプを設定
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
