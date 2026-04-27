# NextFlow

A visual LLM workflow builder: drag, connect, and run AI pipelines.

## Overview

NextFlow is a canvas-based tool for building and running AI pipelines without writing code. Users drag nodes onto a canvas, wire them together, and hit Run. The interface is modeled closely after Krea.ai's workflow builder, with the same dark aesthetic and minimal node cards. NextFlow ships with six node types covering text input, image and video uploads, image cropping, frame extraction, and LLM generation. All node executions run through Trigger.dev, giving every workflow run a full audit trail stored in the database.

## Tech Stack

| Technology | Why |
|---|---|
| Next.js 14 (App Router) | Server components for the dashboard, API routes for workflow persistence and execution, and file-system routing for clean URL structure |
| TypeScript (strict mode) | Zero implicit `any` -- all node data and API shapes are fully typed so refactors surface errors at compile time instead of runtime |
| Tailwind CSS | Utility-first styling makes it fast to match Krea's exact color tokens and spacing without fighting a component library |
| React Flow | Purpose-built for node-edge canvases, handles drag-and-drop, zooming, panning, minimap, and custom node rendering |
| Clerk | Drop-in auth with hosted sign-in pages, session management, and middleware integration for Next.js |
| PostgreSQL via Neon | Serverless Postgres that works well with Vercel deployments -- no connection pooling setup required |
| Prisma | Type-safe ORM; the generated client matches the schema exactly and makes it easy to query workflow runs and node executions |
| Trigger.dev | Handles all node executions as background tasks with retries, timeouts, and a built-in run dashboard. Using it for every node type (not just slow ones) means the execution path is consistent and every run is observable |
| Transloadit | Managed file upload and CDN for images and videos -- avoids building upload infrastructure and gives reliable CDN URLs that Trigger.dev tasks can fetch |
| FFmpeg via Trigger.dev | Image cropping and video frame extraction run as Trigger.dev tasks that shell out to FFmpeg; this keeps heavy processing off the Next.js server |
| Google Gemini (`@google/generative-ai`) | Gemini models support multimodal input (text + images) and streaming, which maps directly to the LLM node's system prompt + user message + images inputs |
| Zustand + Immer | Zustand keeps workflow state flat and easy to subscribe to; Immer makes the undo/redo snapshot logic readable without manual deep cloning |
| Zod | Schema validation on every API route input -- no unvalidated request bodies reach the database or execution engine |
| Sonner | Minimal toast library for run started, completed, and error notifications |
| cmdk | Headless command palette component used for the Cmd+K palette |

## Features

### Core Features

- Drag nodes from the left sidebar onto the canvas
- Connect output handles to input handles with animated bezier edges
- Handle type system enforced at the UI level -- text, image, and video outputs only connect to matching inputs
- Run the full workflow with one click or Ctrl+Enter
- All node executions go through Trigger.dev with full run history stored in the database
- Workflow state auto-saves to the database on every change (debounced)
- Load workflow from the database on page load
- Right sidebar shows all previous runs with status, duration, and per-node execution details
- Node deletion via Delete or Backspace key
- Canvas pan, zoom, fit-view button, and color-coded minimap
- Export workflow as JSON / import from JSON
- Undo and redo for all node and edge operations (Ctrl+Z / Ctrl+Shift+Z)
- Pre-built "Product Marketing Kit" sample workflow on the dashboard

### Wow-Layer Features

- LLM streaming: Gemini tokens stream live into the node card as they arrive
- Cmd+K command palette: add any node type, run workflow, clear canvas, export, import
- Invalid connection tooltip: hovering a blocked connection explains why it is not allowed
- Color-coded minimap: each node type has a distinct color
- Empty canvas hint: shown when the canvas has no nodes, with a Cmd+K prompt
- Toast notifications: run started, completed successfully, failed with reason
- Node appear animation: smooth scale-in when any node is added to the canvas
- Node context menu: right-click any node to run it alone, duplicate it, or delete it
- Keyboard shortcuts: Delete, Ctrl+Z, Ctrl+Shift+Z, Ctrl+Enter to run

## Node Types

**Text Node** -- a plain textarea for entering any text. Its output handle carries the text string to downstream nodes.

**Upload Image Node** -- uploads an image (jpg, jpeg, png, webp, gif) via Transloadit and shows a preview on the node. The output is a CDN image URL.

**Upload Video Node** -- uploads a video (mp4, mov, webm, m4v) via Transloadit and shows an inline video player. The output is a CDN video URL.

**LLM Node** -- takes an optional system prompt, a required user message, and optional image attachments. Runs a selected Gemini model via Trigger.dev and streams the response directly into the node card. No separate output node needed.

**Crop Image Node** -- takes an image URL and four percentage-based crop parameters (x, y, width, height). Runs FFmpeg via Trigger.dev and outputs a cropped image URL. Input fields disable automatically when a handle is connected.

**Extract Frame Node** -- takes a video URL and a timestamp (in seconds or as a percentage string like "50%"). Runs FFmpeg via Trigger.dev and outputs a single frame as an image URL.

## Architecture and Engineering Decisions

**Why Trigger.dev for every node.** All six node types execute through Trigger.dev tasks, not just the slow or async ones. This is a deliberate choice: it makes the execution path uniform regardless of node type, gives every run a full audit trail in the database via the `NodeExecution` table, and means the workflow engine never has to special-case which nodes are "background" vs "inline." It also makes adding retries, timeouts, and observability consistent across the board.

**DAG execution engine.** The engine in `src/lib/workflow-engine.ts` uses Kahn's algorithm to topologically sort the workflow graph into parallel execution layers. Nodes with no dependencies go in layer 0, nodes whose inputs are all satisfied go in layer 1, and so on. Each layer is executed concurrently via `Promise.all`, so independent branches of the workflow run at the same time. Cycle detection runs before any execution starts using a DFS-based algorithm; if a cycle is found, the run is rejected immediately with a clear error message rather than hanging or silently failing. Three run modes are supported: `full` (all nodes), `partial` (a selected subset), and `single` (one node in isolation).

**Handle type system.** Every edge in the graph carries a type (`"text"`, `"image"`, or `"video"`) derived from the source handle's `data-handletype` attribute. React Flow's `isValidConnection` callback checks that the source and target handle types match before allowing a connection. If they do not match, the connection is blocked visually and a tooltip explains why. This is enforced client-side at the UI layer so users get immediate feedback rather than a runtime error during execution.

**Zustand store with Immer and undo/redo.** The workflow store uses Zustand's Immer middleware so state mutations can be written imperatively without manual spreading. Every destructive action (`addNode`, `removeNode`, `addEdge`, `removeEdge`, `clearCanvas`) first takes a snapshot of the current nodes and edges using Immer's `current()` function (which produces a plain JS copy of the draft), then pushes that snapshot onto an undo stack (capped at 50 entries). Redo is implemented as a second stack that is cleared whenever a new action is taken. The `loadWorkflow` action clears both stacks so undo does not cross workflow boundaries.

**Auto-save design.** Workflow changes trigger a debounced PATCH to `/api/workflows/[id]`. The save callback reads state directly from `useWorkflowStore.getState()` inside the `setTimeout` to avoid stale closures. A `skipNextSaveRef` flag is set before calling `loadWorkflow` (on initial load and on JSON import) so that loading the workflow from the server does not immediately trigger a save back to the server. This prevents a race where the loaded state is saved back with stale or empty data before the fetch completes.

## What I Would Build Next

- **Streaming via Server-Sent Events or WebSockets.** Currently Gemini tokens are streamed inside the Trigger.dev task and the final result is written to the database; the client polls or waits for the run to complete. Replacing this with SSE would let the node card update token-by-token in real time without any polling overhead.
- **Persistent undo history.** The undo/redo stack lives only in memory and is lost on page refresh. Storing snapshots in IndexedDB or in a `WorkflowSnapshot` database table would let users undo across sessions.
- **Workflow templates marketplace.** The sample workflow mechanism (see `src/lib/sample-workflow.ts`) is already a good primitive. Building a gallery of community-contributed templates that users can fork would make onboarding much faster.
- **Multi-user collaboration.** Real-time collaborative editing using CRDTs (for example, Yjs) would let multiple users edit the same workflow simultaneously, with cursor presence shown on the canvas.
- **Partial re-runs and node versioning.** When a single node is changed, only that node and its downstream dependents should need to re-run. Caching node outputs by input hash would make iteration much faster on large workflows.
- **More node types.** Speech-to-text (Whisper), text-to-speech, web search, code execution (sandboxed), and HTTP request nodes would cover most of the common LLM pipeline patterns.
- **Workflow scheduling.** A cron-based trigger so workflows can run automatically at a set interval, useful for monitoring or data pipeline use cases.

## Known Limitations

- **Large video files may time out.** FFmpeg runs inside Trigger.dev tasks, which have execution time limits on the free plan. Very large video files or high-resolution crop operations may hit these limits. The fix is to upgrade the Trigger.dev plan or split heavy operations into smaller chunks.
- **No real-time streaming to the client.** Gemini token streaming happens inside the Trigger.dev task. The client receives the full result after the task completes rather than watching tokens arrive one by one. This makes the LLM node feel slower than it would with a direct streaming API call.
- **Transloadit free tier limits.** The image and video upload nodes use Transloadit, which has monthly encoding minute limits on the free tier. Heavy use of the crop and extract-frame nodes will exhaust these limits.
- **No mobile support.** The canvas is built for mouse and keyboard. Touch events are not handled, and the layout does not adapt to small screens.
- **Single-user workflows only.** There is no sharing, collaboration, or permission model. Every workflow belongs to exactly one Clerk user and is not visible to others.

## Local Development

1. Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd NextFlow
npm install
```

2. Copy the example environment file and fill in all values:

```bash
cp .env.local.example .env.local
```

3. Push the database schema:

```bash
npx dotenv -e .env.local -- prisma db push
```

4. Start the Next.js dev server in one terminal:

```bash
npm run dev
```

5. Start the Trigger.dev dev runner in a second terminal:

```bash
npx trigger.dev@latest dev
```

The app runs at `http://localhost:3000`. Trigger.dev tasks run locally and connect to the Trigger.dev cloud for orchestration.

## Environment Variables

| Variable | Description | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for the client | Clerk dashboard > API Keys |
| `CLERK_SECRET_KEY` | Clerk secret key for the server | Clerk dashboard > API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Path for the Clerk sign-in page | Set to `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Path for the Clerk sign-up page | Set to `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign-in | Set to `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign-up | Set to `/dashboard` |
| `DATABASE_URL` | PostgreSQL connection string | Neon dashboard > Connection Details |
| `TRIGGER_SECRET_KEY` | Trigger.dev secret key for the server | Trigger.dev dashboard > API Keys |
| `NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY` | Trigger.dev public key for the client | Trigger.dev dashboard > API Keys |
| `TRANSLOADIT_KEY` | Transloadit auth key for server-side validation | Transloadit dashboard > Credentials |
| `NEXT_PUBLIC_TRANSLOADIT_KEY` | Same Transloadit auth key, exposed to the client upload widget | Same value as `TRANSLOADIT_KEY` |
| `TRANSLOADIT_SECRET` | Transloadit auth secret | Transloadit dashboard > Credentials |
| `GEMINI_API_KEY` | Google Gemini API key | Google AI Studio > API Keys |
| `NEXT_PUBLIC_APP_URL` | Full URL of the deployed app | Your Vercel deployment URL, or `http://localhost:3000` locally |

## Deployment

NextFlow is designed to deploy on Vercel.

1. Push the repo to GitHub and import it in the Vercel dashboard.
2. Add all environment variables from the table above in Vercel > Settings > Environment Variables.
3. Vercel will run `npm run build` automatically on each push to the main branch.
4. Trigger.dev tasks deploy separately -- run the following after each change to the `src/trigger/` directory:

```bash
npx trigger.dev@latest deploy
```

The database schema is managed by Prisma. After any schema change, run:

```bash
npx dotenv -e .env.local -- prisma db push
```

or use `prisma migrate deploy` for production migrations.
