# Learn Circassian Desktop - AI Instructions

## Project Overview

An offline Electron desktop app for learning the Circassian language. The primary feature is a dictionary that works fully offline using a locally-stored SQLite database.

**Tech stack:** Electron 34, React 18, electron-vite 5, TypeScript (strict), Tailwind CSS v4, better-sqlite3, TanStack Query v5, Zustand v5, Bun

## Key Rules

1. **Always update AI instruction files** (`CLAUDE.md`) and `README.md` when making structural changes, changing conventions, or modifying the tech stack.
2. **Use Bun** as the package manager. Always install with `bun install --ignore-scripts` to avoid native build failures.
3. **TypeScript strict mode.** No `any` types.
4. **Use Tailwind CSS v4** with the `@tailwindcss/vite` plugin. No `tailwind.config.js`. Dark mode via `@custom-variant dark (&:where(.dark, .dark *))`.
5. **IPC pattern:** All database access happens in the main process via `ipcMain.handle`. The renderer calls `window.electronAPI.*` (exposed via `contextBridge` in preload).
6. **Terminology:** Always use "West Circassian" (not Adyghe) and "East Circassian" (not Kabardian) in UI labels and comments.

## Database

- The dictionary database (~242 MB) is **not bundled** in the repository.
- In dev: the app checks for `resources/dictionary.db` or shows a download screen.
- In production: the DB is bundled into the installer via `electron-builder`.
- `bun run db:download` → downloads to `resources/dictionary.db` (gitignored).
- Download URL: `https://github.com/bihoqo/learn-circassian-dictionary-collection/releases/latest/download/dictionary.db`

### DB Schema
- `dictionaries`: `(id, title, from_lang, to_lang)`
- `words`: `(word PK, entries JSON)` — entries = `[{id, html}, …]`

### Palochka Convention
- Stored as digit `"1"` in DB, displayed as `Ӏ` (U+04C0)
- `toPalochka(text)` in `src/renderer/src/lib/consts.ts` converts `"1"` → `"Ӏ"` for display
- `normalizeQuery(q)` in `useDictionarySearch.ts` converts `"Ӏ"` → `"1"` before queries
- `decodeHtmlEntities(text)` in `src/main/utils.ts` decodes HTML entities in DB entries; `&amp;` is decoded LAST

## Project Structure

```
src/
  main/
    index.ts            # BrowserWindow, IPC handlers (search-words, get-word, download-db, get-db-path, db-check)
    db.ts               # better-sqlite3 queries: searchWordsStartingWith, searchWordsContaining, getWordWithDictionaries
    utils.ts            # decodeHtmlEntities (bug-fix order: &amp; last), escapeLike
  preload/
    index.ts            # contextBridge: exposes window.electronAPI
  renderer/src/
    App.tsx             # Root: two-panel layout, SetupScreen (first-run download UI)
    env.d.ts            # Window.electronAPI type declarations
    lib/
      consts.ts         # KEYBOARD_LAYOUTS, KEYBOARD_TABS, LANGUAGE_DISPLAY_MAP, toPalochka, MIN_CONTAINS_CHARS
      utils.ts          # cn() Tailwind helper
    store/
      useThemeStore.ts      # dark/light, persisted to localStorage
      useDictionaryStore.ts # search mode, lang filters, keyboard tab/shift state
    hooks/
      useDictionarySearch.ts  # TanStack Query infinite search
      useWordLookup.ts        # TanStack Query single word
    components/             # SearchInput, SearchResultsList, WordEntryCard, LanguageFilter, VirtualKeyboard
resources/
  icon.png
  dictionary.db           # DB (242 MB, gitignored — downloaded via db:download or in-app)
scripts/
  download-db.mjs         # Downloads DB to resources/dictionary.db
.github/workflows/
  release.yml             # Build & Release: triggered by v* tags, builds all 3 platforms
```

## IPC API

The renderer accesses everything through `window.electronAPI`:

| Method | Description |
|--------|-------------|
| `searchWords({ query, mode, page, limit })` | Paginated word search |
| `getWord(word)` | Fetch all dictionary entries for a word |
| `dbCheck()` | Returns `{ needsSetup: boolean }` |
| `getDbPath()` | Returns absolute path where DB should be placed |
| `downloadDb()` | Streams DB download, sends `download-progress` events |
| `onDownloadProgress(cb)` | Subscribe to progress (0–1); returns unsubscribe fn |

## First-Run Download Flow

`App.tsx` orchestrates first-run setup:
1. Calls `window.electronAPI.dbCheck()` — returns `{ needsSetup: true/false }`
2. If setup needed → shows `SetupScreen` with download button + manual install instructions
3. On download: calls `downloadDb()`, listens to `onDownloadProgress`
4. On success → `onDone()` opens the main dictionary UI

## Release / CI

GitHub Actions workflow at `.github/workflows/release.yml`:
- Triggers on `push: tags: v*`
- Matrix: `ubuntu-latest` (AppImage + zip), `macos-latest` (dmg + zip), `windows-latest` (nsis + zip)
- Uses `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` for electron-builder (required even with `--publish never`)
- Uploads artifacts via `softprops/action-gh-release@v2`

## Testing

Bun's built-in test runner. Run: `bun test`. Test files in `src/**/__tests__/`.

## Commands

| Command | Description |
|---------|-------------|
| `bun run setup` | Install deps + rebuild native + download DB |
| `bun run dev` | Start dev (hot-reload) |
| `bun run db:download` | Download DB to `resources/dictionary.db` |
| `bun run rebuild:native` | Rebuild better-sqlite3 for current Electron |
| `bun run package` | Build production installer |
| `bun test` | Run unit tests |
