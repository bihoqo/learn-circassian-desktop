# Learn Circassian Desktop - AI Instructions

## Project Overview

An offline Electron desktop app for learning the Circassian language. Fully offline after the first-run DB download.

**Tech stack:** Electron 34, React 18, electron-vite 5, TypeScript (strict), Tailwind CSS v4, better-sqlite3, TanStack Query v5, Zustand v5, Bun

## Key Rules

1. **Always update AI instruction files** (`CLAUDE.md`) and `README.md` when making structural changes.
2. **Use Bun** — always install with `bun install --ignore-scripts`.
3. **TypeScript strict mode.** No `any` types.
4. **Tailwind CSS v4** with `@tailwindcss/vite`. No config file needed. Dark mode: `@custom-variant dark`.
5. **IPC pattern:** All DB access in main process via `ipcMain.handle`. Renderer uses `window.electronAPI.*`.
6. **Terminology:** "West Circassian" (not Adyghe), "East Circassian" (not Kabardian).

## Database

- Not bundled in the repo. Downloaded at runtime or via `bun run db:download` → `resources/dictionary.db`.
- Download URL: `https://github.com/bihoqo/learn-circassian-dictionary-collection/releases/latest/download/dictionary.db`

### Palochka Convention
- Stored as `"1"` in DB, displayed as `Ӏ` (U+04C0)
- `toPalochka(text)` in `src/renderer/src/lib/consts.ts` for display
- `normalizeQuery(q)` in `useDictionarySearch.ts` before queries
- `decodeHtmlEntities` in `src/main/utils.ts` — `&amp;` decoded LAST (important ordering)

## Project Structure

```
src/
  main/index.ts          # BrowserWindow, IPC handlers, DB download logic
  main/db.ts             # better-sqlite3 queries
  main/utils.ts          # decodeHtmlEntities, escapeLike
  preload/index.ts       # contextBridge: window.electronAPI
  renderer/src/App.tsx   # Root: SetupScreen (first-run download) + main UI
  renderer/src/lib/      # consts.ts (keyboard, palochka), utils.ts (cn)
  renderer/src/store/    # useThemeStore, useDictionaryStore
  renderer/src/hooks/    # useDictionarySearch, useWordLookup
resources/
  dictionary.db          # 242 MB DB (gitignored)
scripts/
  download-db.mjs        # Downloads DB to resources/
.github/workflows/
  release.yml            # CI: build+release on v* tag push (requires GH_TOKEN env var)
```

## Commands

| Command | Description |
|---------|-------------|
| `bun run setup` | Install + rebuild native + download DB |
| `bun run dev` | Start dev |
| `bun run db:download` | Download DB to resources/ |
| `bun run package` | Build production installer |
| `bun test` | Run unit tests |
