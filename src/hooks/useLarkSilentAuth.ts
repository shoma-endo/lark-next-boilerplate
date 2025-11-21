'use client';

import { useEffect, useState } from 'react';
import { detectLarkEnvironment, isLarkTTAvailable } from '@/lib/lark-env-detector';
import type { LarkUserInfo } from '@/types/lark-jsapi';

interface SilentAuthResult {
  isLoading: boolean;
  isLarkApp: boolean;
  error: string | null;
  userInfo: LarkUserInfo | null;
}

/**
 * Larkアプリ内でのサイレント認証フック
 */
export const useLarkSilentAuth = () => {
  const [result, setResult] = useState<SilentAuthResult>({
    isLoading: true,
    isLarkApp: false,
    error: null,
    userInfo: null,
  });

  useEffect(() => {
    const attemptSilentAuth = async () => {
      // Lark環境を検出
      const env = detectLarkEnvironment();

      if (!env.isLarkApp) {
        setResult({
          isLoading: false,
          isLarkApp: false,
          error: null,
          userInfo: null,
        });
        return;
      }

      // Larkアプリ内だが、ttオブジェクトが利用できない場合
      if (!isLarkTTAvailable()) {
        console.warn('Larkアプリ内ですが、ttオブジェクトが利用できません');
        setResult({
          isLoading: false,
          isLarkApp: true,
          error: 'Lark APIが利用できません',
          userInfo: null,
        });
        return;
      }

      try {
        // tt.getUserInfoでユーザー情報を取得
        window.tt!.getUserInfo({
          success: async (res) => {
            console.log('✅ Lark getUserInfo成功:', res);
            const userInfo = res.userInfo;

            // サーバーにユーザー情報を送信してセッションを作成
            try {
              const response = await fetch('/api/auth/silent', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  openID: userInfo.openID,
                  employeeID: userInfo.employeeID,
                }),
              });

              if (!response.ok) {
                throw new Error('サイレント認証に失敗しました');
              }

              setResult({
                isLoading: false,
                isLarkApp: true,
                error: null,
                userInfo,
              });

              // 認証成功後、ホームページにリダイレクト
              window.location.href = '/';
            } catch (error) {
              console.error('サイレント認証APIエラー:', error);
              setResult({
                isLoading: false,
                isLarkApp: true,
                error: error instanceof Error ? error.message : '認証に失敗しました',
                userInfo: null,
              });
            }
          },
          fail: (err) => {
            console.error('❌ Lark getUserInfo失敗:', err);
            setResult({
              isLoading: false,
              isLarkApp: true,
              error: err.errorMessage || 'ユーザー情報の取得に失敗しました',
              userInfo: null,
            });
          },
        });
      } catch (error) {
        console.error('サイレント認証エラー:', error);
        setResult({
          isLoading: false,
          isLarkApp: true,
          error: error instanceof Error ? error.message : '予期しないエラーが発生しました',
          userInfo: null,
        });
      }
    };

    attemptSilentAuth();
  }, []);

  return result;
};
