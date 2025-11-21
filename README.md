# lark-next-boilerplate

Lark（旧Feishu）認証を統合したNext.js 15アプリケーションのボイラープレートです。

## 🎯 主な機能

- **Lark OAuth認証**: Lark Suite APIを使用したOAuth 2.0認証フロー
- **🆕 サイレント認証**: Larkデスクトップアプリからのアクセスで自動ログイン
- **トークン自動リフレッシュ**: アクセストークンの自動更新機能
- **セキュアなセッション管理**: HTTPOnlyクッキーによる安全な認証状態保持
- **モダンUI**: Tailwind CSS + shadcn/ui による現代的なデザインシステム
- **型安全性**: TypeScript + Zod による厳密な型チェック

## 📋 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **認証**: Lark Suite OAuth 2.0
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **型検証**: Zod
- **アイコン**: Lucide React

## 🚀 セットアップ手順

### 1. 依存関係のインストール

```bash
npm run lark:init
```

または個別に実行：

```bash
# 依存関係インストール
npm run lark:install

# セットアップスクリプト実行
npm run lark:setup
```

### 2. 環境変数の設定

`.env.local` ファイルを編集して、LarkアプリケーションのCredentialsを設定：

```env
LARK_APP_ID=your_app_id
LARK_APP_SECRET=your_app_secret
NEXT_PUBLIC_LARK_APP_ID=your_app_id
NEXT_PUBLIC_LARK_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いてアプリケーションを確認してください。

## 📁 プロジェクト構造

```
lark-next-boilerplate/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/callback/       # OAuth コールバックAPI
│   │   │   └── lark/user-info/      # ユーザー情報取得API（自動更新対応）
│   │   ├── lib/
│   │   │   ├── auth.ts              # 認証ヘルパー関数
│   │   │   ├── lark.ts              # 基本Lark SDK設定
│   │   │   └── lark-client.ts       # 自動トークン更新クライアント
│   │   ├── login/                   # ログインページ
│   │   ├── env.ts                   # 環境変数の型安全な管理
│   │   ├── layout.tsx               # ルートレイアウト
│   │   └── page.tsx                 # ホームページ
│   ├── components/
│   │   ├── ui/                      # shadcn/ui コンポーネント
│   │   ├── user/                    # ユーザー関連コンポーネント
│   │   └── login-form.tsx           # ログインフォーム
│   ├── lib/
│   │   ├── lark.ts                  # Lark SDK設定
│   │   └── utils.ts                 # ユーティリティ関数
│   └── types/
│       └── user.ts                  # ユーザー型定義
├── scripts/
│   ├── lark-setup.sh               # セットアップスクリプト
│   └── setup.js                     # Node.jsセットアップスクリプト
├── middleware.ts                    # 認証ミドルウェア
└── components.json                  # shadcn/ui設定
```

## 🔐 認証フロー

### 標準OAuth認証フロー

1. **ログイン**: ユーザーがLarkでログインボタンをクリック
2. **OAuth認証**: Lark認証サーバーにリダイレクト
3. **コールバック**: 認証成功後、`/api/auth/callback`にリダイレクト
4. **トークン取得**: アクセストークンとリフレッシュトークンを取得
5. **セッション確立**: HTTPOnlyクッキーにトークンを保存
6. **ページアクセス**: 認証済みユーザーとしてアプリケーションにアクセス

### 🆕 サイレント認証フロー（Larkアプリ内限定）

Larkデスクトップアプリやモバイルアプリ内でウェブアプリを開いた場合、自動的にログインが完了します。

```mermaid
graph TD
    A[ログインページアクセス] --> B{Larkアプリ内？}
    B -->|通常ブラウザ| C[OAuth認証ボタン表示]
    B -->|Larkアプリ内| D[サイレント認証開始]

    D --> E[tt.requestAuthCode呼び出し]
    E --> F{認証コード取得成功？}

    F -->|成功| G[認証コードを/api/auth/silentにPOST]
    F -->|失敗| H[手動ログインボタン表示]

    G --> I{Lark APIで検証成功？}
    I -->|成功| J[セッション確立]
    I -->|失敗| H

    J --> K[自動的にホームページへ]

    C --> L[標準OAuthフロー]
    H --> L

    style A fill:#e1f5fe
    style K fill:#c8e6c9
    style D fill:#fff9c4
    style J fill:#c8e6c9
```

**サイレント認証の利点:**
- Larkアプリでログイン済みなら、ウェブアプリも即座にログイン完了
- ユーザーは何もクリックする必要なし
- シームレスなユーザー体験を提供

## 🔄 自動トークン更新システムフロー

```mermaid
graph TD
    A[API呼び出し要求] --> B{トークン存在確認}
    B -->|トークンなし| Z[認証エラー]
    B -->|トークンあり| C{トークン有効期限チェック}
    
    C -->|期限内| F[API実行]
    C -->|期限切れ| D[リフレッシュトークン使用]
    
    D --> E{トークン更新成功？}
    E -->|成功| G[新しいトークンでAPI実行]
    E -->|失敗| H[認証エラー - 再ログイン要求]
    
    F --> I{API呼び出し成功？}
    G --> I
    
    I -->|成功| J[結果返却 & Cookie更新]
    I -->|期限切れエラー<br/>Code: 99991677| K{リトライ可能？}
    I -->|その他エラー| L[エラー返却]
    
    K -->|リトライ回数内| M[強制トークン更新]
    K -->|リトライ限界| L
    
    M --> D
    
    style A fill:#e1f5fe
    style J fill:#c8e6c9
    style H fill:#ffcdd2
    style L fill:#ffcdd2
    style Z fill:#ffcdd2
```

### 🔧 自動更新機能の特徴

- **プロアクティブ更新**: トークン有効期限の1.5時間前に自動更新
- **リアクティブ更新**: API呼び出し時のエラーに基づく自動リトライ
- **最大2回のリトライ**: 失敗時の自動復旧機能
- **シームレスな体験**: ユーザーは再ログインの必要なし

## 🛡️ セキュリティ機能

- **HTTPOnly Cookie**: XSS攻撃からトークンを保護
- **ミドルウェア認証**: 全ページで認証状態をチェック
- **トークンリフレッシュ**: 自動的にアクセストークンを更新
- **型安全な環境変数**: Zodによる環境変数の検証

## 📝 主要なAPIエンドポイント

- `GET /` - ホームページ（認証が必要）
- `GET /login` - ログインページ（サイレント認証対応）
- `GET /api/auth/callback` - OAuth認証コールバック
- `POST /api/auth/silent` - 🆕 サイレント認証エンドポイント
- `POST /api/auth/logout` - ログアウト
- `GET /api/lark/user-info` - ユーザー情報取得（自動トークン更新対応）

### API使用例

```typescript
// 自動トークン更新機能付きAPI呼び出し
import { autoRefreshLarkClient } from '@/app/lib/lark-client';

const result = await autoRefreshLarkClient.apiCall(async (token) => {
  return await fetch('https://open.larksuite.com/open-apis/contact/v3/users/me', {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
});
```

## 🎨 UIコンポーネント

このプロジェクトは[shadcn/ui](https://ui.shadcn.com/)を使用しており、以下のコンポーネントが含まれています：

- Button
- Card
- Input
- Label
- Avatar
- Dropdown Menu

## 📦 カスタムスクリプト

- `npm run lark:install` - 依存関係のインストール
- `npm run lark:setup` - セットアップスクリプトの実行
- `npm run lark:init` - 初期セットアップ（install + setup）

## 🔧 開発のヒント

### Larkアプリケーションの設定

1. [Lark Open Platform](https://open.larksuite.com/)でアプリケーションを作成
2. OAuth設定でリダイレクトURLを `http://localhost:3000/api/auth/callback` に設定
3. 必要な権限（ユーザー情報読み取り、連絡先情報読み取り）を有効化
4. **サイレント認証を使用する場合**: Larkワークベンチにアプリを追加

### 新しいUIコンポーネントの追加

```bash
npx shadcn-ui@latest add [component-name]
```

## 📚 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [Lark Open Platform](https://open.larksuite.com/document/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🐛 トラブルシューティング

### よくある問題

1. **認証エラー**: 環境変数が正しく設定されているか確認
2. **リダイレクトエラー**: Larkアプリ設定のリダイレクトURLを確認
3. **スタイルが反映されない**: Tailwind CSSの設定を確認
4. **サイレント認証が動作しない**:
   - Larkワークベンチからアプリを開いているか確認
   - Larkアプリの権限設定を確認（連絡先情報読み取り権限が必要）
   - ブラウザのコンソールでエラーメッセージを確認

## 🔄 CI/CD設定

このプロジェクトはGitHub Actionsを使用したCI/CDパイプラインを含んでいます。

### GitHub Secretsの設定

本番環境でビルドする場合は、以下のSecretsをリポジトリ設定で追加してください：

1. GitHubリポジトリの **Settings** > **Secrets and variables** > **Actions** に移動
2. 以下のSecretsを追加：

| Secret名 | 説明 | 必須 |
|---------|------|-----|
| `LARK_APP_ID` | Larkアプリケーションのapp_id | ✅ |
| `LARK_APP_SECRET` | Larkアプリケーションのapp_secret | ✅ |
| `NEXT_PUBLIC_LARK_APP_ID` | クライアント側で使用するapp_id | ✅ |
| `NEXT_PUBLIC_LARK_REDIRECT_URI` | OAuth認証のリダイレクトURI | ✅ |
| `LARK_BOT_WEBHOOK` | Lark通知用のWebhook URL（オプション） | ❌ |

**注意**: Secretsが設定されていない場合、ビルド時にダミー値が使用されます。テスト目的のビルドは成功しますが、実際の認証は動作しません。

### ワークフロー

- **トリガー**: `main`ブランチへのプッシュまたはプルリクエスト
- **ジョブ**:
  1. Lintチェック
  2. 型チェック
  3. ビルド
  4. Lark通知（成功/失敗）

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。
