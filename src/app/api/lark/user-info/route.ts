import { NextRequest, NextResponse } from 'next/server';
import { autoRefreshLarkClient } from '@/app/lib/lark-client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    // 自動リトライ機能付きでユーザー情報を取得
    const userInfo = await autoRefreshLarkClient.apiCall(async (token) => {
      const response = await fetch('https://open.larksuite.com/open-apis/authen/v1/user_info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.code !== 0) {
        throw { code: data.code, msg: data.msg };
      }
      
      return data.data;
    });

    const response = NextResponse.json({
      success: true,
      data: userInfo,
    });

    // 新しいトークンをCookieに保存
    autoRefreshLarkClient.updateCookies(response);
    
    return response;
  } catch (error: unknown) {
    console.error('ユーザー情報取得エラー:', error);

    const errorMessage = error && typeof error === 'object' && 'msg' in error
      ? String(error.msg)
      : 'ユーザー情報の取得に失敗しました';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
} 