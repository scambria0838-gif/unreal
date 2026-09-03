# Unreal

A tiny, self-contained task board built with **Vite + React + TypeScript**. Tasks
are persisted to the browser's `localStorage`, so there is no backend, database, or
external service to configure — it runs entirely in the browser.

## Requirements

- Node.js 22+
- npm 10+

## Getting started

```bash
npm ci          # install exact, locked dependencies
npm run dev     # start the Vite dev server on http://localhost:5173
```

## Scripts

| Command             | Description                                        |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server (http://localhost:5173). |
| `npm run build`     | Type-check (`tsc -b`) and build for production.    |
| `npm run typecheck` | Type-check without emitting output.                |
| `npm run lint`      | Lint the source with oxlint.                       |
| `npm run preview`   | Preview the production build on port 4173.         |

## Features

- Add, complete, and delete tasks
- Filter by all / active / completed
- Remaining-task counter and "clear completed"
- State persisted across reloads via `localStorage`

## Cloud Agent environment

`.cursor/environment.json` configures the Cursor Cloud Agent environment:

- `install`: `npm ci`
- `terminals`: runs `npm run dev` so the app is available at http://localhost:5173
