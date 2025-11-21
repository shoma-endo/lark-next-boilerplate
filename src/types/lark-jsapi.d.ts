/**
 * Lark H5 JSAPI型定義
 * @see https://open.larksuite.com/document/client-docs/h5/
 */

// Larkグローバルオブジェクト
declare global {
  interface Window {
    h5sdk?: LarkH5SDK;
  }
}

export interface LarkH5SDK {
  config(options: LarkConfigOptions): void;
  ready(callback: () => void): void;
  error(callback: (error: LarkError) => void): void;
}

export interface LarkConfigOptions {
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
  jsApiList: string[];
  // オプション: ログイン前の API 呼び出しを許可
  onlyCallJsApi?: boolean;
}

export interface LarkError {
  errorMessage: string;
  errorCode: number;
}

export interface LarkUserInfo {
  employeeID: string;
  openID: string;
  name: string;
  enName?: string;
  avatarUrl?: string;
  email?: string;
}

// tt オブジェクト（Larkアプリ内で利用可能）
declare global {
  interface Window {
    tt?: {
      getUserInfo: (options: GetUserInfoOptions) => void;
      requestAuthCode: (options: RequestAuthCodeOptions) => void;
      getEnv: (options: GetEnvOptions) => void;
      checkSession: (options: CheckSessionOptions) => void;
    };
  }
}

export interface GetUserInfoOptions {
  success?: (res: { userInfo: LarkUserInfo }) => void;
  fail?: (err: LarkError) => void;
  complete?: () => void;
}

export interface RequestAuthCodeOptions {
  appId: string;
  success?: (res: { code: string }) => void;
  fail?: (err: LarkError) => void;
  complete?: () => void;
}

export interface GetEnvOptions {
  success?: (res: { isLark: boolean; platform: string }) => void;
  fail?: (err: LarkError) => void;
}

export interface CheckSessionOptions {
  success?: () => void;
  fail?: () => void;
  complete?: () => void;
}

export {};
