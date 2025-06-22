'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
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
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <svg
              className="h-6 w-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            ログイン
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Larkアカウントでサインインしてください
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </main>
  );
}
