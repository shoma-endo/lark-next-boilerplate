// /lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  LARK_APP_ID: z.string().min(1, 'LARK_APP_ID is required'),
  LARK_APP_SECRET: z.string().min(1, 'LARK_APP_SECRET is required'),
  NEXT_PUBLIC_LARK_APP_ID: z.string().min(1, 'NEXT_PUBLIC_LARK_APP_ID is required'),
  NEXT_PUBLIC_LARK_REDIRECT_URI: z.string().url('NEXT_PUBLIC_LARK_REDIRECT_URI must be a valid URL'),
});

export const env = envSchema.parse({
  LARK_APP_ID: process.env.LARK_APP_ID,
  LARK_APP_SECRET: process.env.LARK_APP_SECRET,
  NEXT_PUBLIC_LARK_APP_ID: process.env.NEXT_PUBLIC_LARK_APP_ID,
  NEXT_PUBLIC_LARK_REDIRECT_URI: process.env.NEXT_PUBLIC_LARK_REDIRECT_URI,
});
