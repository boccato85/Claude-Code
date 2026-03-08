# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (installs deps, generates Prisma client, runs migrations)
npm run setup

# Development server (uses Turbopack + node-compat shim)
npm run dev

# Run all tests
npm test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Lint
npm run lint

# Build for production
npm run build

# Reset database
npm run db:reset

# After editing prisma/schema.prisma
npx prisma migrate dev
npx prisma generate
```

The dev server requires `NODE_OPTIONS='--require ./node-compat.cjs'` (already in npm scripts) due to Prisma/Node.js compatibility.

## Environment

Create a `.env` file at the root:
```
ANTHROPIC_API_KEY=...   # optional; falls back to MockLanguageModel if absent
JWT_SECRET=...          # optional; defaults to "development-secret-key"
```

Without `ANTHROPIC_API_KEY`, the app uses `MockLanguageModel` in `src/lib/provider.ts`, which returns static components without calling the API.

## Architecture

UIGen is a Next.js 15 App Router application where users chat with Claude to generate React components that render live in a sandboxed iframe.

### Data flow

1. **User sends a message** → `ChatContext` (`src/lib/contexts/chat-context.tsx`) calls `/api/chat` via Vercel AI SDK's `useChat`, passing the serialized virtual file system and an optional `projectId`.
2. **API route** (`src/app/api/chat/route.ts`) reconstructs the `VirtualFileSystem`, calls Claude (or mock) with two tools: `str_replace_editor` and `file_manager`. On finish, it persists messages + file data to the project in SQLite via Prisma.
3. **Tool calls stream back** to the client → `FileSystemContext.handleToolCall` applies mutations to the in-memory `VirtualFileSystem`.
4. **Preview updates** reactively via `refreshTrigger` → `PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) calls `createImportMap` + `createPreviewHTML` from `src/lib/transform/jsx-transformer.ts`, which uses `@babel/standalone` to transpile JSX/TSX in-browser and creates blob URLs for each file, then injects an import map and a `<script type="module">` into a sandboxed iframe.

### Key abstractions

- **`VirtualFileSystem`** (`src/lib/file-system.ts`): In-memory file tree (no disk I/O). Files live only in RAM and in the `data` JSON column of the `Project` table. Exposes CRUD + `serialize`/`deserializeFromNodes` for persistence.
- **`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`): React context wrapping `VirtualFileSystem`. `handleToolCall` is the bridge between AI tool calls and the file system.
- **`ChatContext`** (`src/lib/contexts/chat-context.tsx`): Thin wrapper around Vercel AI SDK's `useChat`; routes tool call events to `FileSystemContext`.
- **`jsx-transformer.ts`** (`src/lib/transform/jsx-transformer.ts`): Client-side Babel transpilation pipeline. `createImportMap` transforms all files, resolves imports (local → blob URLs, third-party → `esm.sh`), and creates placeholder modules for missing imports. `createPreviewHTML` generates the full iframe document including Tailwind CDN, import map, and React error boundary.
- **AI Tools**: `str_replace_editor` (create/str_replace/insert commands) and `file_manager` (rename/delete commands) are defined in `src/lib/tools/`.
- **Auth**: JWT-based, cookie-stored sessions via `jose`. `src/lib/auth.ts` is server-only. Anonymous users can use the app; projects are only persisted for authenticated users.
- **Prisma/SQLite**: Schema at `prisma/schema.prisma`. Generated client outputs to `src/generated/prisma`. Two models: `User` and `Project` (stores `messages` and `data` as JSON strings).

### UI layout

`MainContent` (`src/app/main-content.tsx`) renders a two-panel resizable layout: left = chat, right = preview/code tabs. The code view has a nested resizable: file tree + Monaco editor.

### AI model

Configured in `src/lib/provider.ts`. Default model is `claude-haiku-4-5`. Falls back to `MockLanguageModel` when no API key is present.

### Testing

Vitest with jsdom environment. Tests live alongside source in `__tests__` directories. Uses `@testing-library/react` for component tests.
