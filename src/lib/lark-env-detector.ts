/**
 * Lark環境検出ユーティリティ
 * Larkデスクトップアプリ、モバイルアプリ、またはワークベンチ内かどうかを判定
 */

export interface LarkEnvironment {
  isLarkApp: boolean;
  platform: 'desktop' | 'mobile' | 'web' | 'unknown';
  userAgent: string;
}

/**
 * Larkアプリ内で実行されているかどうかを検出
 */
export const detectLarkEnvironment = (): LarkEnvironment => {
  if (typeof window === 'undefined') {
    return {
      isLarkApp: false,
      platform: 'unknown',
      userAgent: '',
    };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  // Lark/Feishuアプリのユーザーエージェント検出
  const isLarkDesktop = userAgent.includes('lark/') || userAgent.includes('feishu/');
  const isLarkMobile = userAgent.includes('larkmobile') || userAgent.includes('feishumobile');
  const isLarkApp = isLarkDesktop || isLarkMobile;

  let platform: LarkEnvironment['platform'] = 'web';
  if (isLarkDesktop) {
    platform = 'desktop';
  } else if (isLarkMobile) {
    platform = 'mobile';
  }

  return {
    isLarkApp,
    platform,
    userAgent,
  };
};

/**
 * Lark ttオブジェクトが利用可能かどうかをチェック
 */
export const isLarkTTAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.tt !== 'undefined';
};

/**
 * Lark H5 SDKがロードされているかどうかをチェック
 */
export const isLarkH5SDKLoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.h5sdk !== 'undefined';
};

/**
 * サイレント認証が可能な環境かどうかを判定
 */
export const canUseSilentAuth = (): boolean => {
  const env = detectLarkEnvironment();
  return env.isLarkApp && (isLarkTTAvailable() || isLarkH5SDKLoaded());
};
