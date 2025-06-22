// app/page.tsx
import { cookies } from 'next/headers';
import { LoginForm } from '@/components/login-form'; // ✅ クライアントコンポーネント
import { UserMenu } from '@/components/user/user-menu';
import { larkClient } from '@/lib/lark';
import { LarkUser } from '@/types/user';

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('lark_token')?.value;
  const userCookie = cookieStore.get('lark_user')?.value;

  if (!token) {
    return <LoginForm />;
  }

  // まずクッキーからユーザー情報を取得
  let user: LarkUser = {
    name: 'ユーザー',
    avatar_url: undefined,
    open_id: '',
  };

  if (userCookie) {
    try {
      const userData = JSON.parse(userCookie);
      user = {
        name: userData.name || 'ユーザー',
        avatar_url: userData.avatar_url,
        open_id: userData.open_id || '',
      };
    } catch (error) {
      console.error('ユーザー情報の解析エラー:', error);
      // フォールバック: APIからユーザー情報を取得
      try {
        const res = await larkClient.authen.userInfo.get({}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        user = {
          name: res.data?.name || 'ユーザー',
          avatar_url: res.data?.avatar_url,
          open_id: res.data?.open_id || '',
        };
      } catch (apiError) {
        console.error('API からのユーザー情報取得エラー:', apiError);
      }
    }
  } else {
    // クッキーにユーザー情報がない場合はAPIから取得
    try {
      const res = await larkClient.authen.userInfo.get({}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      user = {
        name: res.data?.name || 'ユーザー',
        avatar_url: res.data?.avatar_url,
        open_id: res.data?.open_id || '',
      };
    } catch (apiError) {
      console.error('API からのユーザー情報取得エラー:', apiError);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* ヘッダー */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Lark Next Boilerplate
              </h1>
            </div>
            
            {/* ユーザーメニュー */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <span>ようこそ、</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {user.name}
                </span>
                <span>さん</span>
              </div>
              <UserMenu user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ウェルカムセクション */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={`${user.name}のアバター`}
                  className="w-20 h-20 rounded-full ring-4 ring-blue-100 dark:ring-blue-900"
                />
              ) : (
                <div className="w-20 h-20 rounded-full ring-4 ring-blue-100 dark:ring-blue-900 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                こんにちは、{user.name} さん！
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Larkアカウントでのログインが完了しました。
              </p>
              <div className="mt-4 flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>認証済み</span>
              </div>
            </div>
          </div>
        </div>

        {/* ダッシュボードカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">プロフィール</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">アカウント情報を管理</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">設定</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">アプリケーション設定</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">ダッシュボード</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">統計とデータ</p>
              </div>
            </div>
          </div>
        </div>

        {/* アクションセクション */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            次のステップ
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">プロフィールを設定</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">基本情報を更新してください</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                設定する
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">アプリケーションを探索</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">利用可能な機能を确认してください</p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                探索する
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-600 dark:text-slate-400">
            <p>&copy; 2025 Lark Next Boilerplate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
