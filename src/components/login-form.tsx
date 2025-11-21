'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const LoginForm = () => {
  const handleLogin = () => {
    const appId = process.env.NEXT_PUBLIC_LARK_APP_ID!;
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_LARK_REDIRECT_URI!);
    const loginUrl = `https://open.larksuite.com/open-apis/authen/v1/index?app_id=${appId}&redirect_uri=${redirectUri}`;
    window.location.href = loginUrl;
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 outline-none">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border-0 outline-none shadow-sm">
            <Image
              src="https://files.raycast.com/qms40tfo4jxh5ois1i8mwi7zxdox"
              alt="Lark"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            ログイン
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Larkアカウントでサインインしてください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="h-11 border-0 outline-none focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:border-0"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                パスワード
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-11 border-0 outline-none focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:border-0"
                disabled
              />
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground dark:bg-slate-900">
                または
              </span>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors border-0 outline-none focus:ring-0"
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

          <p className="text-center text-xs text-muted-foreground">
            続行することで、
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              利用規約
            </a>
            および
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              プライバシーポリシー
            </a>
            に同意したものとみなされます。
          </p>
        </CardContent>
      </Card>
    </main>
  );
};
