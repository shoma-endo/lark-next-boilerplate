import { cookies } from 'next/headers';

/**
 * アクセストークンを取得 or refreshして取得
 * Cookieの再設定は行わない（NextResponseが必要）
 * @returns string | null
 */
export async function getAccessTokenWithRefresh(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('lark_token')?.value;
  const refreshToken = cookieStore.get('lark_refresh')?.value;

  if (accessToken && accessToken.trim() !== '') {
    return accessToken;
  }

  // refresh_tokenがないなら null
  if (!refreshToken || refreshToken.trim() === '') {
    return null;
  }

  try {
    const res = await fetch('https://open.larksuite.com/open-apis/authen/v1/refresh_access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    });

    const data = await res.json();
    const newAccessToken = data.data.access_token;
    const newRefreshToken = data.data.refresh_token;

    if (!newAccessToken || !newRefreshToken) return null;

    // NextResponse などで cookie を書くのは呼び出し元の責任
    return newAccessToken;
  } catch (error) {
    console.error('アクセストークンのリフレッシュに失敗しました:', error);
    return null;
  }
}

/**
 * ログアウト処理
 */
export async function logout(): Promise<void> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('ログアウトに失敗しました');
    }

    // ログインページにリダイレクト
    window.location.href = '/login';
  } catch (error) {
    console.error('ログアウトエラー:', error);
    // エラーが発生してもログインページにリダイレクト
    window.location.href = '/login';
  }
}

/**
 * セッション情報を取得
 */
export async function getSession() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('lark_user')?.value;
  
  if (!userCookie) {
    return null;
  }

  try {
    return JSON.parse(userCookie);
  } catch (error) {
    console.error('セッション解析エラー:', error);
    return null;
  }
}
