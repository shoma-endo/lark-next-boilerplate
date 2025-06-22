console.log('✅ setup.js 実行されました！');

import fs from 'fs';

// 1. ディレクトリ生成
fs.mkdirSync('src/lib', { recursive: true });

// 2. lark.ts 作成
const larkTs = `import * as lark from '@larksuiteoapi/node-sdk';
import 'dotenv/config';
export const larkClient = new lark.Client({
  appId: process.env.LARK_APP_ID,
  appSecret: process.env.LARK_APP_SECRET,
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Lark,
});`;
fs.writeFileSync('src/lib/lark.ts', larkTs);

// 3. .env.local 作成
fs.writeFileSync('.env.local', `LARK_APP_ID=your_app_id
LARK_APP_SECRET=your_app_secret
NEXT_PUBLIC_LARK_APP_ID=your_app_id
NEXT_PUBLIC_LARK_REDIRECT_URI=http://localhost:3000/api/auth/callback
`);

// 4. tailwind.config.js 作成
fs.writeFileSync('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`);

// 5. postcss.config.cjs 作成
fs.writeFileSync('postcss.config.cjs', `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`);

console.log('\x1b[32m✔  Lark boilerplate files + Tailwind config generated');
