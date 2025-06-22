import * as lark from '@larksuiteoapi/node-sdk';
import { env } from '@/app/env';

export const larkClient = new lark.Client({
  appId: env.LARK_APP_ID,
  appSecret: env.LARK_APP_SECRET,
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Lark,
});
