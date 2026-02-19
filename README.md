# Learn Circassian Desktop

An offline desktop dictionary for the Circassian languages (West Circassian and East Circassian). Runs on **Windows, macOS, and Linux**. Searches across 35+ bilingual dictionaries entirely on-device — no internet connection required after the first-run download.

Built with **Electron 34**, **React 18**, **electron-vite 5**, **Tailwind CSS v4**, **better-sqlite3**, and **Zustand 5**.

---

## Features

- **Offline-first** — the database is downloaded once on first launch; no network needed after that
- **35+ dictionaries** — Circassian paired with Russian, English, Turkish, Arabic, and more
- **Two-panel layout** — search + keyboard on the left, word detail on the right
- **Virtual keyboard** — 5 layouts (Circassian, Russian, Turkish, Arabic, English) with shift toggle; collapsible
- **Cursor-aware key insertion** — virtual keyboard inserts at the cursor position in the search field
- **Two search modes** — "Starts with" and "Contains" (3+ chars)
- **Paginated results** — 50 results per page with a "Show more" button
- **Word detail view** — expandable cards per dictionary entry (rendered HTML), language filters
- **Dark / light mode** — toggle in the header, persisted across sessions via localStorage
- **Cross-platform** — builds to `.dmg` (macOS), `.exe` NSIS installer (Windows), `.AppImage` (Linux)

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Node.js](https://nodejs.org/) | 18 LTS or later | Required for native module compilation |
| [Bun](https://bun.sh/) | 1.3+ | Package manager used in this project |
| Python | 3.11 or earlier | Only needed if native module prebuilts are unavailable |

> **Python note:** `better-sqlite3` ships prebuilt binaries for Electron 34 on Linux x64, Windows x64, and macOS. Python is not required on those platforms. If prebuilts are unavailable, `node-gyp` compiles from source and needs Python ≤ 3.11.

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/bihoqo/learn-circassian-desktop.git
cd learn-circassian-desktop
```

### 2. Install and set up

```bash
bun run setup
```

This runs three steps:
1. `bun install --ignore-scripts` — installs packages without triggering the native build
2. `electron-rebuild -f -w better-sqlite3` — downloads the prebuilt binary for Electron 34
3. `bun run db:download` — downloads `dictionary.db` from GitHub Releases

Or run the steps individually:

```bash
bun install --ignore-scripts
bun run rebuild:native
bun run db:download
```

### 3. Start in development mode

```bash
bun run dev
```

The Electron window opens with hot-reload for the renderer and auto-restart for the main process. On first launch the app shows a **"Download Dictionary"** screen if the database hasn't been downloaded yet — click the button to download it. Alternatively, run `bun run db:download` beforehand.

---

## Dictionary Database

The 242 MB SQLite database is **not bundled** in the repository. It is downloaded at runtime on first launch from:

```
https://github.com/bihoqo/learn-circassian-dictionary-collection/releases/latest/download/dictionary.db
```

To download it manually for development (skips the in-app download screen):

```bash
bun run db:download
# places the file at: resources/dictionary.db
```

Re-running is a no-op if the file already exists.

In **development mode**, the app looks for the database at `resources/dictionary.db`.
In **production (packaged)**, the database is bundled with the installer.

---

## Building Executables

```bash
bun run package
```

Runs `electron-vite build` then `electron-builder`. Output is placed in `dist/`.

> **Note:** `resources/dictionary.db` must exist before packaging. Run `bun run db:download` first.

### Platform outputs

| Platform | Output file |
|----------|-------------|
| **macOS** | `dist/Learn Circassian Desktop-x.x.x.dmg` |
| **Windows** | `dist/Learn Circassian Desktop Setup x.x.x.exe` |
| **Linux** | `dist/Learn Circassian Desktop-x.x.x.AppImage` |

### GitHub Actions (CI/CD)

Pushing a `v*` tag triggers the **Build & Release** workflow (`.github/workflows/release.yml`). It builds all three platforms in parallel and uploads the artifacts as GitHub Release assets.

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## Project Structure

```
learn-circassian-desktop/
├── .github/workflows/
│   └── release.yml            # Build & release workflow (triggered by v* tags)
├── resources/
│   ├── icon.png               # App icon
│   └── dictionary.db          # SQLite DB (242 MB, gitignored — downloaded at runtime)
├── scripts/
│   └── download-db.mjs        # Downloads DB to resources/dictionary.db
├── src/
│   ├── main/
│   │   ├── index.ts           # Electron main: BrowserWindow, IPC handlers, download logic
│   │   ├── db.ts              # better-sqlite3 queries (search + word lookup)
│   │   └── utils.ts           # decodeHtmlEntities, escapeLike
│   ├── preload/
│   │   └── index.ts           # contextBridge: exposes window.electronAPI
│   └── renderer/
│       ├── index.html
│       └── src/
│           ├── App.tsx        # Root: two-panel layout, SetupScreen (first-run download)
│           ├── env.d.ts       # Window.electronAPI type declarations
│           ├── lib/
│           │   ├── consts.ts  # Keyboard layouts, LANGUAGE_DISPLAY_MAP, toPalochka
│           │   └── utils.ts   # cn() helper
│           ├── store/         # useThemeStore, useDictionaryStore
│           ├── hooks/         # useDictionarySearch, useWordLookup
│           └── components/    # SearchInput, SearchResultsList, WordEntryCard, etc.
├── electron.vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── package.json
```

---

## Architecture

### IPC Design

```typescript
// Exposed in renderer as window.electronAPI
window.electronAPI.searchWords({ query, mode, page, limit })
// → Promise<{ data: string[], page: number, totalPages: number }>

window.electronAPI.getWord(word)
// → Promise<IWordWithDictionaries | null>

window.electronAPI.downloadDb()
// → Promise<{ ok: true }>  (streams DB from GitHub Releases, sends progress events)

window.electronAPI.onDownloadProgress(cb)
// → unsubscribe function
```

### Database

| Table | Columns | Description |
|-------|---------|-------------|
| `dictionaries` | `id`, `title`, `from_lang`, `to_lang` | One row per dictionary source |
| `words` | `word` (PK), `entries` (JSON) | One row per headword; entries = `[{id, html}, …]` |

### Palochka Convention

The Circassian palochka (Ӏ, U+04C0) is stored as `1` in the database:

- **`toPalochka(text)`** — `1` → `Ӏ` for display (`src/renderer/src/lib/consts.ts`)
- **`normalizeQuery(q)`** — `Ӏ` → `1` before querying (`useDictionarySearch.ts`)

### Tailwind CSS v4

Uses `@tailwindcss/vite` (no `tailwind.config.js` needed). Dark mode via custom variant:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

The `dark` class is toggled on `<html>` in `App.tsx`.

---

## Commands

| Command | Description |
|---------|-------------|
| `bun run setup` | Install deps, rebuild native module, download DB |
| `bun run dev` | Start development (hot-reload) |
| `bun run db:download` | Download DB to `resources/dictionary.db` |
| `bun run rebuild:native` | Rebuild better-sqlite3 for current Electron version |
| `bun run package` | Build production installer |
| `bun test` | Run unit tests |

---

## Testing

Uses Bun's built-in test runner:

```bash
bun test
```

Tests live in `__tests__/` directories next to the code they test.

---

## Troubleshooting

### `Error: Cannot find module 'better-sqlite3'`
```bash
bun run rebuild:native
```

### `Error: Database not found` on startup
```bash
bun run db:download
```

### `Error: Python ... No module named 'distutils'` during install
Use the recommended path — `bun install --ignore-scripts` + `bun run rebuild:native` (skips `node-gyp`).

---

## Related Repositories

| Repository | Description |
|------------|-------------|
| [`learn-circassian-web`](https://github.com/bihoqo/learn-circassian-web) | Next.js web dictionary app |
| [`learn-circassian-mobile`](https://github.com/bihoqo/learn-circassian-mobile) | React Native / Expo Android app |
| [`learn-circassian-dictionary-collection`](https://github.com/bihoqo/learn-circassian-dictionary-collection) | SQLite dictionary database releases |

---

## License

MIT
