import * as lark from '@larksuiteoapi/node-sdk';
import 'dotenv/config';

export const larkClient = new lark.Client({
  appId: process.env.LARK_APP_ID!,
  appSecret: process.env.LARK_APP_SECRET!,
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Lark,
});