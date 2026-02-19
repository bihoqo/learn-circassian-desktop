# Learn Circassian Desktop

An offline desktop dictionary for the Circassian languages (West Circassian and East Circassian). Runs on **Windows, macOS, and Linux**. Searches across 35+ bilingual dictionaries entirely on-device — no internet connection required after the first-run download.

Built with **Electron 34**, **React 18**, **electron-vite 5**, **Tailwind CSS v4**, **better-sqlite3**, and **Zustand 5**.

---

## How It Works

The app is fully offline. The only time it needs an internet connection is the **one-time database download** on first launch.

### First launch

When you open the app for the first time, it checks whether the dictionary database exists locally. If not, it shows a setup screen:

- **Automatic download** — click "Download Dictionary (~242 MB)" and the app streams the database directly from [GitHub Releases](https://github.com/bihoqo/learn-circassian-dictionary-collection/releases/latest). A progress bar shows the download status.
- **Manual install** — if you prefer, the setup screen shows the exact file path where the database should be placed, with a Copy button and an OS-native "Open folder" button (Show in Finder / Open in Explorer / Open in Files) to navigate there directly.

Once the database is in place the app opens immediately — no restart needed.

### After setup

All dictionary lookups run locally via SQLite (`better-sqlite3` in the Electron main process). The renderer never touches the database directly; it calls the main process through a typed IPC bridge (`window.electronAPI`).

- **Search** — type in the left panel. Supports "Starts with" and "Contains" modes, paginated 50 results at a time.
- **Word detail** — click a result to open its entry in the right panel. Multiple words can be open in tabs simultaneously. Each entry is rendered HTML from the source dictionary.
- **Language filters** — narrow results by source or target language.
- **Virtual keyboard** — 5 layouts (Circassian, Russian, Turkish, Arabic, English) with shift toggle. Inserts characters at the cursor position in the search field.

### Settings

Click the gear icon (⚙) in the top-right corner to open Settings. It shows the full path where the database is stored on your machine, with buttons to copy the path or open the folder in your file manager. If you delete the database file, the app will detect this on the next search or when you return from Settings, and redirect you back to the setup screen.

---

## Features

- **Offline-first** — database downloaded once on first launch; no network needed after that
- **35+ dictionaries** — Circassian paired with Russian, English, Turkish, Arabic, and more
- **Two-panel layout** — search + keyboard on the left, word detail on the right
- **Virtual keyboard** — 5 layouts with shift toggle; collapsible
- **Two search modes** — "Starts with" and "Contains" (3+ chars)
- **Paginated results** — 50 results per page with a "Show more" button
- **Word detail view** — expandable cards per dictionary entry, language filters
- **Dark / light mode** — toggle in the header, persisted across sessions
- **Cross-platform** — Windows, macOS, Linux

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

### 3. Start in development mode

```bash
bun run dev
```

The Electron window opens with hot-reload for the renderer and auto-restart for the main process.

---

## Dictionary Database

The 242 MB SQLite database is **not bundled** in the repository or the installer. It is downloaded on first launch (or via `bun run db:download`) from:

```
https://github.com/bihoqo/learn-circassian-dictionary-collection/releases/latest/download/dictionary.db
```

To download it manually for development (skips the in-app download screen):

```bash
bun run db:download
# places the file at: resources/dictionary.db
```

In **development mode**, the app looks for the database at `resources/dictionary.db`.
In **production (packaged)**, the database is stored in the app's user-data directory and downloaded on first launch — it is not included in the installer.

---

## Building Executables

```bash
bun run package
```

Runs `electron-vite build` then `electron-builder`. Output is placed in `dist/`.

> **Note:** `resources/dictionary.db` must exist before packaging. Run `bun run db:download` first.

### Platform outputs

| Platform | Installer | Portable |
|----------|-----------|---------|
| **macOS** | `Learn Circassian Desktop x.x.x macOS.dmg` | `Learn Circassian Desktop x.x.x macOS Portable.zip` |
| **Windows** | `Learn Circassian Desktop Setup x.x.x Windows.exe` | `Learn Circassian Desktop x.x.x Windows Portable.zip` |
| **Linux** | — | `Learn Circassian Desktop x.x.x Linux.AppImage` |

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
│           ├── App.tsx        # Root: SetupScreen, SettingsScreen, two-panel dictionary UI
│           ├── env.d.ts       # Window.electronAPI type declarations
│           ├── lib/
│           │   ├── consts.ts  # Keyboard layouts, LANGUAGE_DISPLAY_MAP, toPalochka
│           │   └── utils.ts   # cn() helper
│           ├── store/         # useThemeStore, useDictionaryStore
│           ├── hooks/         # useDictionarySearch, useWordLookup
│           └── components/    # SearchInput, SearchResultsList, WordEntryCard, etc.
├── electron.vite.config.ts
├── tsconfig.json
└── package.json
```

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

## Troubleshooting

### `Error: Cannot find module 'better-sqlite3'`
```bash
bun run rebuild:native
```

### Database not found on startup
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
