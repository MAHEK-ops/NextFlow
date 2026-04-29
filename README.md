# NextFlow

A visual AI workflow builder - drag nodes onto a canvas, wire them together, and run multi-modal LLM pipelines without writing code.

`Next.js 14` `React Flow` `Trigger.dev` `Gemini + Groq` `TypeScript` `Prisma + Neon`

---

## Node types

| Node | Description |
|------|-------------|
| **Text** | Free-form textarea. Outputs a string downstream. |
| **Upload image** | jpg / png / webp / gif. Shows preview, outputs CDN URL. |
| **Upload video** | mp4 / mov / webm. Inline player, outputs CDN URL. |
| **LLM** | System prompt + user message + images → Gemini, streamed live into the card. |
| **Crop image** | Percentage-based crop via FFmpeg. Input fields disable when a handle is connected. |
| **Extract frame** | Pull a single frame at a timestamp or percentage (e.g. `"50%"`). |

---

## Architecture

**DAG execution engine**
Kahn's algorithm builds parallel execution layers - nodes with no upstream dependencies go in layer 0, resolved nodes move to layer 1+. Independent branches run concurrently via `Promise.all`. DFS-based cycle detection runs before any execution starts; cycles are rejected immediately with a clear error.

**Trigger.dev for every node - including the fast ones**
All six node types execute through Trigger.dev tasks, not just async ones. This makes the execution path uniform, gives every run a full audit trail in the `NodeExecution` table, and keeps retries and timeouts consistent across the board.

**Handle type system**
Every edge carries a type (`"text"`, `"image"`, or `"video"`) derived from the source handle's `data-handletype`. React Flow's `isValidConnection` blocks mismatches at the UI layer with a tooltip - users get immediate feedback instead of a runtime error mid-execution.

**Zustand + Immer with undo/redo**
Every destructive action snapshots state using Immer's `current()` and pushes to an undo stack (capped at 50). Redo is a second stack cleared on any new action. `loadWorkflow` clears both so undo never crosses workflow boundaries.

**Auto-save without race conditions**
Changes trigger a debounced `PATCH` to `/api/workflows/[id]`. The save callback reads from `getState()` inside the timeout to avoid stale closures. A `skipNextSaveRef` flag prevents loading state from immediately being written back before the fetch resolves.

**LLM resilience**
Gemini runs as primary via the `v1beta` endpoint (supporting 1.5 and 2.0 model families). On a `429` rate-limit response, execution automatically falls back to Groq without any user-facing error.

---

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 + TypeScript (strict) | App Router, zero implicit `any` - all node data and API shapes are fully typed |
| Canvas | React Flow | Purpose-built for node-edge graphs: drag, zoom, pan, minimap, custom node rendering |
| Execution | Trigger.dev | Background tasks with retries, timeouts, and a built-in run dashboard |
| Database | Neon (Postgres) + Prisma | Serverless Postgres, zero pooling setup. Type-safe ORM generated from schema |
| Auth | Clerk | Hosted sign-in, session management, Next.js middleware integration |
| State | Zustand + Immer | Flat, subscribable store. Immer makes undo/redo snapshot logic readable |
| LLM | Gemini + Groq fallback | Multimodal streaming primary. Groq kicks in automatically on rate limits |
| Media | FFmpeg via Trigger.dev | Crop and frame extraction off the Next.js server. Consistent task execution model |
| Styling | Tailwind CSS | Fast token-matching for the dark aesthetic without fighting a component library |
| Validation | Zod | Schema validation on every API route - no unvalidated request bodies reach the DB |

---

## Features

- DAG execution - independent branches run in parallel via `Promise.all`
- LLM streaming - Gemini tokens appear live in the node card as they arrive
- Full run history - status, duration, and per-node execution detail in the right sidebar
- Workflow auto-saves on every change (debounced PATCH, no race conditions)
- Undo/redo - `Ctrl+Z` / `Ctrl+Shift+Z`, 50-entry stack, never crosses workflow boundaries
- Handle type enforcement - mismatched connections blocked at the UI layer with a tooltip
- `Cmd+K` command palette - add nodes, run, clear canvas, export/import JSON
- Right-click context menu - run node alone, duplicate, or delete
- SVG workflow preview thumbnails generated and persisted per workflow
- Color-coded minimap, fit-view button, pan, zoom
- Group node selection with group-delete protection
- Node appear animation, toast notifications, empty canvas hint

---

## Local development

```bash
git clone <repo-url>
cd NextFlow
npm install

cp .env.local.example .env.local
# Fill in all values - see table below

npx dotenv -e .env.local -- prisma db push

# Terminal 1
npm run dev

# Terminal 2
npx trigger.dev@latest dev
```

App runs at `http://localhost:3000`. Trigger.dev tasks run locally and connect to Trigger.dev cloud for orchestration.

### Environment variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Clerk dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk dashboard → API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in path | Set to `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up path | Set to `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Post sign-in redirect | Set to `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Post sign-up redirect | Set to `/dashboard` |
| `DATABASE_URL` | PostgreSQL connection string | Neon dashboard → Connection Details |
| `TRIGGER_SECRET_KEY` | Trigger.dev server key | Trigger.dev dashboard → API Keys |
| `NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY` | Trigger.dev public key | Trigger.dev dashboard → API Keys |
| `GEMINI_API_KEY` | Google Gemini API key | Google AI Studio → API Keys |
| `NEXT_PUBLIC_APP_URL` | Full app URL | Vercel deployment URL or `http://localhost:3000` |

---

## Deployment

NextFlow deploys on Vercel.

1. Push the repo to GitHub and import it in the Vercel dashboard.
2. Add all environment variables under Settings → Environment Variables.
3. Vercel builds automatically on every push to `main`.
4. After any change to `src/trigger/`, deploy Trigger.dev tasks separately:

```bash
npx trigger.dev@latest deploy
```

After schema changes:

```bash
npx dotenv -e .env.local -- prisma db push
# or for production:
npx prisma migrate deploy
```

---

## Known limitations

**No real-time client streaming** - Gemini tokens stream inside the Trigger.dev task. The client receives the full result after the task completes. Replacing the polling model with SSE would fix this.

**FFmpeg timeout on large files** - Tasks have execution time limits on the free plan. Very large videos may hit them. Fix: upgrade the Trigger.dev plan or chunk the operation.

**In-memory undo only** - The undo stack is lost on page refresh. Persisting snapshots to IndexedDB or a `WorkflowSnapshot` table would fix this.

**Single-user only** - No sharing or collaboration. Real-time multi-user editing would need a CRDT layer (e.g. Yjs) with cursor presence on the canvas.

---

## What I'd build next

- **SSE streaming** - push Gemini tokens to the client in real time, eliminating polling entirely
- **Output caching** - hash node inputs and skip re-execution when nothing upstream changed
- **More node types** - Whisper, text-to-speech, web search, sandboxed code execution, HTTP request
- **Workflow templates** - community gallery on top of the existing sample workflow primitive in `src/lib/sample-workflow.ts`
- **Persistent undo** - IndexedDB or a `WorkflowSnapshot` table so undo survives a page refresh
- **Workflow scheduling** - cron-based triggers for automated pipeline runs at set intervals