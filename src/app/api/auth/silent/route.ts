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

    console.log('🔍 サイレント認証リクエスト受信:', {
      hasCode: !!code,
      codeType: typeof code,
      codeLength: code?.length || 0,
      codeValue: code ? `${code.substring(0, 10)}...` : 'なし'
    });

    // 認証コードが必須（セキュリティのため、openIDを直接受け入れない）
    if (!code || typeof code !== 'string' || code.trim() === '') {
      console.error('❌ 認証コードが不在または不正:', {
        hasCode: !!code,
        codeType: typeof code,
        isEmpty: code === '',
        isWhitespace: code?.trim() === ''
      });
      return NextResponse.json(
        { error: '認証コードが必要です' },
        { status: 400 }
      );
    }

    console.log('📤 Lark APIにトークンリクエスト送信中...', {
      grant_type: 'authorization_code',
      codeLength: code.length
    });

    // まず直接APIを呼び出してみる（SDKをバイパス）
    const appId = process.env.LARK_APP_ID;
    const appSecret = process.env.LARK_APP_SECRET;

    if (!appId || !appSecret) {
      console.error('❌ Lark credentials not configured');
      return NextResponse.json(
        { error: 'サーバー設定エラー' },
        { status: 500 }
      );
    }

    console.log('🔍 直接API呼び出しを試行中...');

    try {
      // 直接 Lark API を呼び出す
      const apiResponse = await fetch('https://open.larksuite.com/open-apis/authen/v1/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: code.trim(),
        }),
      });

      const apiData = await apiResponse.json();
      console.log('📥 直接API呼び出しレスポンス:', {
        status: apiResponse.status,
        ok: apiResponse.ok,
        data: apiData
      });

      if (!apiResponse.ok || apiData.code !== 0) {
        console.error('❌ Lark API エラー:', apiData);
        return NextResponse.json(
          {
            error: 'Lark認証エラー',
            details: process.env.NODE_ENV === 'development' ? apiData : undefined
          },
          { status: 401 }
        );
      }

      const tokenData = apiData.data;

      if (!tokenData || !tokenData.access_token) {
        console.error('❌ アクセストークンが取得できませんでした');
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

      console.log('✅ 直接API呼び出し成功:', userInfo);

      // Cookie設定
      const response = NextResponse.json({ success: true, user: userInfo });
      const currentTimestamp = Date.now().toString();

      response.cookies.set('lark_token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      if (refreshToken) {
        response.cookies.set('lark_refresh', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        });
      }

      response.cookies.set('lark_token_timestamp', currentTimestamp, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });

      response.cookies.set('lark_user', JSON.stringify(userInfo), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    } catch (fetchError) {
      console.error('❌ 直接API呼び出しエラー:', fetchError);

      // フォールバック: SDKを使用
      console.log('🔄 SDKを使用してリトライ中...');

      const tokenRes = await larkClient.authen.accessToken.create({
        data: {
          grant_type: 'authorization_code',
          code: code.trim(),
        },
      });

      console.log('📥 SDK呼び出し結果:', {
        code: tokenRes.code,
        msg: tokenRes.msg,
        hasData: !!tokenRes.data
      });

      const sdkTokenData = tokenRes.data as {
        access_token?: string;
        refresh_token?: string;
        name?: string;
        avatar_url?: string;
        open_id?: string;
      };

      if (!sdkTokenData || !sdkTokenData.access_token) {
        throw new Error('SDKからもトークンを取得できませんでした');
      }

      // SDKでも成功した場合
      const response = NextResponse.json({ success: true, user: {
        name: sdkTokenData.name,
        avatar_url: sdkTokenData.avatar_url,
        open_id: sdkTokenData.open_id,
      }});

      const currentTimestamp = Date.now().toString();

      response.cookies.set('lark_token', sdkTokenData.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      if (sdkTokenData.refresh_token) {
        response.cookies.set('lark_refresh', sdkTokenData.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        });
      }

      response.cookies.set('lark_token_timestamp', currentTimestamp, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });

      response.cookies.set('lark_user', JSON.stringify({
        name: sdkTokenData.name,
        avatar_url: sdkTokenData.avatar_url,
        open_id: sdkTokenData.open_id,
      }), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }
  } catch (error) {
    console.error('❌ サイレント認証エラー:', error);

    // Zodエラーの詳細を出力
    if (error && typeof error === 'object' && 'issues' in error) {
      console.error('Zodバリデーションエラー詳細:', JSON.stringify(error, null, 2));
    }

    // エラーの詳細を含めたレスポンス
    const errorMessage = error instanceof Error ? error.message : '認証処理中にエラーが発生しました';
    const errorDetails = error && typeof error === 'object' ? JSON.stringify(error) : String(error);

    console.error('エラー詳細:', errorDetails);

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}
