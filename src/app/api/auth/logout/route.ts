import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: 'ログアウトしました' },
      { status: 200 }
    );

    // セッションクッキーを削除
    response.cookies.set('lark_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0), // 過去の日付に設定して削除
    });

    response.cookies.set('lark_refresh', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0), // 過去の日付に設定して削除
    });

    response.cookies.set('lark_user', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0), // 過去の日付に設定して削除
    });

    return response;
  } catch (error) {
    console.error('ログアウトエラー:', error);
    return NextResponse.json(
      { error: 'ログアウトに失敗しました' },
      { status: 500 }
    );
  }
}

// GETメソッドでもログアウトできるようにする（リダイレクト用）
export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.redirect(new URL('/login', request.url));

    // セッションクッキーを削除
    response.cookies.set('lark_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    response.cookies.set('lark_refresh', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    response.cookies.set('lark_user', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('ログアウトエラー:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}