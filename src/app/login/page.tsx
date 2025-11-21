'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { useLarkSilentAuth } from '@/hooks/useLarkSilentAuth';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { isLoading, isLarkApp, error, userInfo } = useLarkSilentAuth();
  const [showManualLogin, setShowManualLogin] = useState(false);

  useEffect(() => {
    // サイレント認証が失敗した場合、または一定時間経過した場合に手動ログインボタンを表示
    if (!isLoading && (!isLarkApp || error)) {
      setShowManualLogin(true);
    }
  }, [isLoading, isLarkApp, error]);

  const handleLogin = () => {
    const appId = process.env.NEXT_PUBLIC_LARK_APP_ID!;
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_LARK_REDIRECT_URI!);
    const loginUrl = `https://open.larksuite.com/open-apis/authen/v1/index?app_id=${appId}&redirect_uri=${redirectUri}`;
    window.location.href = loginUrl;
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden">
            <Image
              src="/lark-logo.png"
              alt="Lark Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            ログイン
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLoading && isLarkApp
              ? 'Larkアプリで自動ログイン中...'
              : 'Larkアカウントでサインインしてください'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* サイレント認証中の表示 */}
          {isLoading && isLarkApp && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-muted-foreground">
                認証情報を確認しています...
              </p>
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* 手動ログインボタン */}
          {showManualLogin && (
            <Button
              onClick={handleLogin}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              size="lg"
            >
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Larkでサインイン
            </Button>
          )}

          {/* Larkアプリ内での情報表示 */}
          {isLarkApp && !error && (
            <p className="text-xs text-center text-muted-foreground">
              Larkアプリから開いています
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
