#!/usr/bin/env node
/**
 * Downloads dictionary.db from GitHub Releases into resources/dictionary.db.
 * Run with:  bun run db:download
 */

import { createWriteStream, mkdirSync, renameSync, unlinkSync, existsSync, statSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const DB_URL =
  "https://github.com/bihoqo/learn-circassian-dictionary-collection/releases/latest/download/dictionary.db";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "../resources/dictionary.db");
const TMP_PATH = OUT_PATH + ".tmp";

if (existsSync(OUT_PATH)) {
  const { size } = statSync(OUT_PATH);
  console.log(`✓ resources/dictionary.db already exists (${(size / 1_048_576).toFixed(0)} MB). Delete it first to re-download.`);
  process.exit(0);
}

mkdirSync(dirname(OUT_PATH), { recursive: true });

function download(url, dest, hops = 0) {
  return new Promise((resolve, reject) => {
    if (hops > 5) return reject(new Error("Too many redirects"));
    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;
    lib.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) {
        res.resume();
        const loc = res.headers.location;
        download(loc.startsWith("/") ? `${parsed.origin}${loc}` : loc, dest, hops + 1)
          .then(resolve)
          .catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} ${res.statusMessage}`));
      }

      const total = parseInt(res.headers["content-length"] ?? "0", 10);
      let downloaded = 0;
      let lastPct = -1;

      const file = createWriteStream(dest);

      res.on("data", (chunk) => {
        downloaded += chunk.length;
        if (!file.write(chunk)) {
          res.pause();
          file.once("drain", () => res.resume());
        }
        if (total > 0) {
          const pct = Math.floor((downloaded / total) * 100);
          if (pct !== lastPct && pct % 5 === 0) {
            lastPct = pct;
            const dlMB = (downloaded / 1_048_576).toFixed(0);
            const totalMB = (total / 1_048_576).toFixed(0);
            process.stdout.write(`\r  ${pct}%  ${dlMB} / ${totalMB} MB`);
          }
        }
      });

      res.on("end", () => file.end(() => { process.stdout.write("\n"); resolve(); }));
      res.on("error", (err) => { file.destroy(); try { unlinkSync(dest); } catch {} reject(err); });
      file.on("error", (err) => { res.destroy(); try { unlinkSync(dest); } catch {} reject(err); });
    }).on("error", reject);
  });
}

console.log("Downloading dictionary.db from GitHub Releases…");
console.log(`  → ${OUT_PATH}\n`);

try {
  await download(DB_URL, TMP_PATH);
  renameSync(TMP_PATH, OUT_PATH);
  const { size } = statSync(OUT_PATH);
  console.log(`✓ Done — ${(size / 1_048_576).toFixed(0)} MB written to resources/dictionary.db`);
} catch (err) {
  try { unlinkSync(TMP_PATH); } catch {}
  console.error("✗ Download failed:", err.message);
  process.exit(1);
}
