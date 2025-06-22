import { z } from 'zod';

/**
 * UI表示やセッション管理などで利用するLarkユーザー型
 */
export type LarkUser = {
  name?: string;
  avatar_url?: string;
  open_id?: string;
};

/**
 * Lark OAuth 認証後に返ってくるトークンとユーザー情報のレスポンス型
 */
export type LarkAccessTokenResponse = {
  access_token: string;
  refresh_token: string;
  name: string;
  avatar_url: string;
  open_id: string;
  union_id?: string;
  tenant_key?: string;
};

/**
 * Larkユーザーの Zod スキーマ（APIレスポンス検証用）
 */
export const LarkUserSchema = z.object({
  name: z.string(),
  avatar_url: z.string().url().optional(),
  open_id: z.string(),
});

/**
 * Larkアクセストークン取得後のレスポンス用 Zod スキーマ
 */
export const LarkAccessTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  name: z.string(),
  avatar_url: z.string().url(),
  open_id: z.string(),
  union_id: z.string().optional(),
  tenant_key: z.string().optional(),
});
