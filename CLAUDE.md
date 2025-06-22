# CLAUDE.md
Be sure to answer in Japanese.
After completing the task, please hit npx ccusage@latest to display the cost.
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 boilerplate with Lark (Feishu) integration, featuring OAuth authentication, automatic token refresh, and a modern UI built with Tailwind CSS and shadcn/ui components.

## Development Commands

```bash
# Complete setup (install dependencies + configure environment)
npm run lark:init

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Add shadcn/ui components
npx shadcn-ui@latest add [component-name]
```

## Architecture

### Authentication Flow
- **OAuth 2.0 with Lark**: Redirects to Lark for authentication, handles callback with authorization code
- **Session Management**: Uses HTTPOnly cookies for secure session storage
- **Token Refresh**: Automatic token refresh 1.5 hours before expiration via background process
- **Route Protection**: Middleware-based authentication that redirects unauthenticated users to login

### Key Components

**Authentication System** (`src/app/lib/auth.ts`):
- `login()`: Initiates OAuth flow with Lark
- `logout()`: Clears session and redirects
- `getSession()`: Retrieves current user session
- `refreshSession()`: Handles token refresh logic

**Lark Client** (`src/app/lib/lark-client.ts`):
- Auto-refreshing client that proactively manages token expiration
- Intelligent retry mechanism (up to 2 retries on token errors)
- Comprehensive error handling and logging

**Middleware** (`middleware.ts`):
- Protects all routes except `/login` and `/api/auth/*`
- Automatically redirects unauthenticated users
- Runs on Edge Runtime for optimal performance

### Environment Variables

Required environment variables (defined in `src/app/env.ts`):

```bash
# Server-side Lark credentials
LARK_APP_ID=your_app_id
LARK_APP_SECRET=your_app_secret

# Client-side OAuth configuration
NEXT_PUBLIC_LARK_APP_ID=your_app_id
NEXT_PUBLIC_LARK_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Session security
NEXTAUTH_SECRET=your_random_secret
```

## File Structure Patterns

- `src/app/api/`: API routes for authentication and Lark integration
- `src/app/lib/`: Core business logic (auth, Lark client, utilities)
- `src/components/`: Reusable UI components organized by feature
- `src/lib/`: Shared utilities and helpers
- `src/types/`: TypeScript type definitions

## Common Development Patterns

### Adding New API Routes
API routes follow the App Router pattern in `src/app/api/`. Authentication is handled automatically by middleware.

### Using the Lark Client
```typescript
import { createLarkClient } from '@/app/lib/lark-client'

const client = await createLarkClient()
const response = await client.get('/some-endpoint')
```

### Adding UI Components
Use shadcn/ui for consistent design system. Components are in `src/components/ui/` and follow the shadcn/ui patterns.

### Session Management
Sessions are managed through the auth library. Use `getSession()` to access current user data in server components.

## Important Notes

- Token refresh happens automatically 1.5 hours before expiration
- All routes except `/login` and auth APIs require authentication
- Environment variables are validated at startup using Zod schemas
- The setup script (`scripts/setup.js`) handles initial configuration
- Lark client includes intelligent retry logic for expired tokens
- **Route Groups**: Don't confuse route groups like `/(admin)/page.tsx` with nested routing. Route groups (parentheses) are not recognized as part of the routing structure. Having `/(admin)/page.tsx` and `/page.tsx` will cause conflicts as they both represent the root page.
- **Avoid Overusing useEffect**: Best practice is server-side data fetching. Create data fetching utilities in a DAL (Data Access Layer) and call them from Server Components instead of using useEffect in Client Components.
- **Implement Streaming Data Fetching**: When using Server Components for data fetching, implement streaming with Suspense boundaries for skeleton states. This provides better UX with progressive loading.
- **Prefer Server Actions**: When implementing forms or mutations, explicitly use Server Actions instead of defaulting to event handlers. Server Actions provide better type safety and reduce client-server round trips.
- **Async Params and SearchParams**: When accessing dynamic route params (`/blog/[id]`) or searchParams via `useSearchParams`, remember these are now async in Next.js 14+. Always use async/await to prevent errors.
- **Supabase Client Usage**: Use `createServerClient()` for server-side operations (Server Components, Server Actions, Route Handlers) and `createClient()` for client-side operations. Import from `@supabase/supabase-js` and `@supabase/ssr` modules.