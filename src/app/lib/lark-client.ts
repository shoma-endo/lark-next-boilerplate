import * as lark from '@larksuiteoapi/node-sdk';
import { env } from '@/app/env';
import { cookies } from 'next/headers';

// トークンの有効期限をチェックする関数
function isTokenExpired(tokenTimestamp: number): boolean {
  const now = Date.now();
  const tokenAge = now - tokenTimestamp;
  // 1.5時間（5400秒）で期限切れとみなす（通常2時間が有効期限）
  return tokenAge > 5400 * 1000;
}

// 自動リフレッシュ機能付きのLarkクライアント
class AutoRefreshLarkClient {
  private client: lark.Client;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenTimestamp: number = 0;

  constructor() {
    this.client = new lark.Client({
      appId: env.LARK_APP_ID,
      appSecret: env.LARK_APP_SECRET,
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Lark,
    });
  }

  // トークンを初期化
  async initializeTokens(): Promise<void> {
    const cookieStore = await cookies();
    this.accessToken = cookieStore.get('lark_token')?.value || null;
    this.refreshToken = cookieStore.get('lark_refresh')?.value || null;
    
    // トークンタイムスタンプを取得（Cookieに保存されていない場合は現在時刻）
    const timestampCookie = cookieStore.get('lark_token_timestamp')?.value;
    this.tokenTimestamp = timestampCookie ? parseInt(timestampCookie) : Date.now();
  }

  // トークンを自動更新
  async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) {
      console.error('リフレッシュトークンがありません');
      return null;
    }

    try {
      const response = await fetch('https://open.larksuite.com/open-apis/authen/v1/refresh_access_token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({ 
          grant_type: 'refresh_token', 
          refresh_token: this.refreshToken 
        }),
      });

      const data = await response.json();
      
      if (data.code === 0 && data.data) {
        this.accessToken = data.data.access_token;
        this.refreshToken = data.data.refresh_token;
        this.tokenTimestamp = Date.now();
        
        console.log('✅ トークンの自動更新が成功しました');
        return this.accessToken;
      } else {
        console.error('❌ トークンの更新に失敗しました:', data.msg);
        return null;
      }
    } catch (error) {
      console.error('❌ トークンの更新中にエラーが発生しました:', error);
      return null;
    }
  }

  // 有効なアクセストークンを取得（必要に応じて自動更新）
  async getValidAccessToken(): Promise<string | null> {
    await this.initializeTokens();

    // トークンがないか期限切れの場合は更新
    if (!this.accessToken || isTokenExpired(this.tokenTimestamp)) {
      console.log('🔄 トークンを更新中...');
      const newToken = await this.refreshAccessToken();
      return newToken;
    }

    return this.accessToken;
  }

  // API呼び出し用のメソッド（自動リトライ機能付き）
  async apiCall<T>(apiFunction: (token: string) => Promise<T>, maxRetries: number = 2): Promise<T> {
    let attempts = 0;
    
    while (attempts <= maxRetries) {
      const token = await this.getValidAccessToken();
      
      if (!token) {
        throw new Error('有効なアクセストークンを取得できませんでした');
      }

      try {
        return await apiFunction(token);
      } catch (error: any) {
        attempts++;
        
        // トークン期限切れエラーの場合
        if (error.code === 99991677 && attempts <= maxRetries) {
          console.log(`🔄 トークン期限切れエラー。再試行中... (${attempts}/${maxRetries})`);
          // トークンを強制的に更新
          this.tokenTimestamp = 0;
          continue;
        }
        
        throw error;
      }
    }
    
    throw new Error('最大リトライ回数に達しました');
  }

  // 新しいトークンをCookieに保存する（NextResponse使用時）
  updateCookies(response: any): void {
    if (this.accessToken && this.refreshToken) {
      response.cookies.set('lark_token', this.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7日間
      });
      
      response.cookies.set('lark_refresh', this.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30日間
      });
      
      response.cookies.set('lark_token_timestamp', this.tokenTimestamp.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30日間
      });
    }
  }
}

export const autoRefreshLarkClient = new AutoRefreshLarkClient(); 