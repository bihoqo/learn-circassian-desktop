import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "path";
import { createWriteStream, existsSync, renameSync, unlinkSync, mkdirSync } from "fs";
import https from "node:https";
import http from "node:http";
import {
  searchWordsStartingWith,
  searchWordsContaining,
  getWordWithDictionaries,
  isDbReady,
  getAssembledDbPath,
  closeDb,
} from "./db";

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 700,
    minHeight: 500,
    title: "Learn Circassian Desktop",
    // In dev, set the window icon explicitly. In production, the OS uses
    // the app-bundle icon set by electron-builder ("resources/icon.png").
    ...(!app.isPackaged && {
      icon: path.join(__dirname, "../../resources/icon.png"),
    }),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  win.on("ready-to-show", () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ─── IPC: OS platform (for OS-aware UI in renderer) ──────────────────────────

ipcMain.handle("get-platform", () => process.platform);

// ─── IPC: open the folder containing the DB in the OS file manager ────────────

ipcMain.handle("open-db-folder", async () => {
  const dbPath = getAssembledDbPath();
  if (existsSync(dbPath)) {
    // Highlights the file in Finder / Explorer / Files
    shell.showItemInFolder(dbPath);
  } else {
    // File not there yet — just open the parent folder
    await shell.openPath(path.dirname(dbPath));
  }
});

// ─── IPC: check whether the DB needs first-run download ──────────────────────

ipcMain.handle("db-check", () => {
  return { needsSetup: !isDbReady() };
});

// ─── IPC: return the expected DB file path (for manual-install instructions) ──

ipcMain.handle("get-db-path", () => getAssembledDbPath());

// ─── IPC: download the DB from GitHub Releases, send progress events ──────────

const DB_URL =
  "https://github.com/bihoqo/learn-circassian-dictionary-collection/releases/latest/download/dictionary.db";

function downloadFile(
  url: string,
  dest: string,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    function request(urlStr: string, hops = 0): void {
      if (hops > 5) {
        reject(new Error("Too many redirects"));
        return;
      }
      const parsed = new URL(urlStr);
      const lib = parsed.protocol === "https:" ? https : http;
      lib
        .get(urlStr, (res) => {
          if (
            res.statusCode === 301 ||
            res.statusCode === 302 ||
            res.statusCode === 303
          ) {
            res.resume();
            const loc = res.headers.location!;
            request(
              loc.startsWith("/") ? `${parsed.origin}${loc}` : loc,
              hops + 1
            );
            return;
          }
          if (res.statusCode !== 200) {
            res.resume();
            reject(
              new Error(`HTTP ${res.statusCode} ${res.statusMessage}`)
            );
            return;
          }
          const total = parseInt(res.headers["content-length"] ?? "0", 10);
          let downloaded = 0;
          const file = createWriteStream(dest);
          res.on("data", (chunk: Buffer) => {
            downloaded += chunk.length;
            if (!file.write(chunk)) {
              res.pause();
              file.once("drain", () => res.resume());
            }
            if (total > 0) onProgress(downloaded / total);
          });
          res.on("end", () => file.end(resolve));
          res.on("error", (err) => {
            file.destroy();
            try { unlinkSync(dest); } catch { /* ignore */ }
            reject(err);
          });
          file.on("error", (err) => {
            res.destroy();
            try { unlinkSync(dest); } catch { /* ignore */ }
            reject(err);
          });
        })
        .on("error", reject);
    }
    request(url);
  });
}

ipcMain.handle("download-db", async (event) => {
  const outPath = getAssembledDbPath();
  const tmpPath = outPath + ".tmp";
  mkdirSync(path.dirname(outPath), { recursive: true });
  try {
    await downloadFile(DB_URL, tmpPath, (pct) =>
      event.sender.send("download-progress", pct)
    );
    renameSync(tmpPath, outPath);
    return { ok: true };
  } catch (e) {
    try { unlinkSync(tmpPath); } catch { /* ignore */ }
    throw e;
  }
});

// ─── IPC: search words ────────────────────────────────────────────────────────

ipcMain.handle(
  "search-words",
  (
    _event,
    args: {
      query: string;
      mode: "starts_with" | "contains";
      page: number;
      limit: number;
    },
  ) => {
    const { query, mode, page, limit } = args;
    if (mode === "contains") {
      return searchWordsContaining(query, page, limit);
    }
    return searchWordsStartingWith(query, page, limit);
  },
);

// ─── IPC: get single word with all dictionary entries ────────────────────────

ipcMain.handle("get-word", (_event, word: string) => {
  return getWordWithDictionaries(word);
});

// Close DB cleanly on exit so the process doesn't linger
app.on("before-quit", () => {
  closeDb();
});
