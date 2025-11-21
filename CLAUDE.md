# CLAUDE.md
Be sure to answer in Japanese.
After completing the task, please hit npx ccusage@latest to display the cost.
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- Follow the user’s requirements carefully & to the letter.
- First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail.
- Confirm, then write code!
- Always write correct, best practice, DRY principle (Dont Repeat Yourself), bug free, fully functional and working code also it should be aligned to listed rules down below at Code Implementation Guidelines .
- Focus on easy and readability code, over being performant.
- Fully implement all requested functionality.
- Leave NO todo’s, placeholders or missing pieces.
- Ensure code is complete! Verify thoroughly finalised.
- Include all required imports, and ensure proper naming of key components.
- Be concise Minimize any other prose.
- If you think there might not be a correct answer, you say so.
- If you do not know the answer, say so, instead of guessing.

## Project Overview

This is a Next.js 15 boilerplate with Lark (Feishu) integration, featuring OAuth authentication, silent authentication for Lark apps, automatic token refresh, and a modern UI built with Tailwind CSS and shadcn/ui components.

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
- **Silent Authentication**: Automatic login when accessed from within Lark desktop/mobile app using `tt.getUserInfo()` API
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

**Silent Authentication System**:
- **Environment Detection** (`src/lib/lark-env-detector.ts`): Detects if app is running within Lark desktop/mobile app via User Agent
- **Silent Auth Hook** (`src/hooks/useLarkSilentAuth.ts`): React hook that attempts silent authentication on login page
- **Silent Auth API** (`src/app/api/auth/silent/route.ts`): Server endpoint that creates session from Lark user info

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
  - `src/app/api/auth/callback/`: OAuth callback handler
  - `src/app/api/auth/silent/`: Silent authentication endpoint
  - `src/app/api/auth/logout/`: Logout handler
- `src/app/lib/`: Core business logic (auth, Lark client, utilities)
- `src/components/`: Reusable UI components organized by feature
- `src/lib/`: Shared utilities and helpers
  - `src/lib/lark-env-detector.ts`: Lark environment detection
- `src/hooks/`: React hooks
  - `src/hooks/useLarkSilentAuth.ts`: Silent authentication hook
- `src/types/`: TypeScript type definitions
  - `src/types/lark-jsapi.d.ts`: Lark JSAPI type definitions

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

### Silent Authentication (Lark App Only)
When users access the web app from within Lark desktop/mobile app, silent authentication automatically logs them in:

```typescript
// The login page automatically uses this hook
import { useLarkSilentAuth } from '@/hooks/useLarkSilentAuth';

const { isLoading, isLarkApp, error, userInfo } = useLarkSilentAuth();
```

**How it works:**
1. User opens web app from Lark workbench or app
2. `useLarkSilentAuth` hook detects Lark environment via User Agent
3. Calls `window.tt.getUserInfo()` to get current Lark user
4. Sends user info to `/api/auth/silent` to create session
5. User is automatically logged in without clicking anything

**Requirements:**
- App must be added to Lark Workbench
- User must be logged into Lark desktop/mobile app
- App must have "Contact Information" read permission

## Important Notes

- Token refresh happens automatically 1.5 hours before expiration
- All routes except `/login` and auth APIs require authentication
- Environment variables are validated at startup using Zod schemas
- The setup script (`scripts/setup.js`) handles initial configuration
- Lark client includes intelligent retry logic for expired tokens
- **Silent Authentication**: Only works when accessed from Lark desktop/mobile app. Falls back to standard OAuth in regular browsers
- **Lark Workbench**: To enable silent authentication, add your web app to Lark Workbench in the Lark Admin Console
- **Route Groups**: Don't confuse route groups like `/(admin)/page.tsx` with nested routing. Route groups (parentheses) are not recognized as part of the routing structure. Having `/(admin)/page.tsx` and `/page.tsx` will cause conflicts as they both represent the root page.
- **Avoid Overusing useEffect**: Best practice is server-side data fetching. Create data fetching utilities in a DAL (Data Access Layer) and call them from Server Components instead of using useEffect in Client Components.
- **Implement Streaming Data Fetching**: When using Server Components for data fetching, implement streaming with Suspense boundaries for skeleton states. This provides better UX with progressive loading.
- **Prefer Server Actions**: When implementing forms or mutations, explicitly use Server Actions instead of defaulting to event handlers. Server Actions provide better type safety and reduce client-server round trips.
- **Async Params and SearchParams**: When accessing dynamic route params (`/blog/[id]`) or searchParams via `useSearchParams`, remember these are now async in Next.js 14+. Always use async/await to prevent errors.
- **Supabase Client Usage**: Use `createServerClient()` for server-side operations (Server Components, Server Actions, Route Handlers) and `createClient()` for client-side operations. Import from `@supabase/supabase-js` and `@supabase/ssr` modules.

## Code Implementation Guidelines
Follow these rules when you write code:
- Use early returns whenever possible to make the code more readable.
- Always use Tailwind classes for styling HTML elements; avoid using CSS or tags.
- Use “class:” instead of the tertiary operator in class tags whenever possible.
- Use descriptive variable and function/const names. Also, event functions should be named with a “handle” prefix, like “handleClick” for onClick and “handleKeyDown” for onKeyDown.
- Implement accessibility features on elements. For example, a tag should have a tabindex=“0”, aria-label, on:click, and on:keydown, and similar attributes.
- Use consts instead of functions, for example, “const toggle = () =>”. Also, define a type if possible.
