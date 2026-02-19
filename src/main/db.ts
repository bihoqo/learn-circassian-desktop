import Database from "better-sqlite3";
import path from "path";
import { existsSync } from "fs";
import { app } from "electron";
import { decodeHtmlEntities, escapeLike } from "./utils";

export interface IDictionary {
  id: number;
  title: string;
  from_lang: string;
  to_lang: string;
}

export interface IWordEntryWithDictionary {
  id: number;
  html: string;
  dictionary: IDictionary;
}

export interface IWordWithDictionaries {
  word: string;
  entries: IWordEntryWithDictionary[];
}

export interface IPaginatedResult {
  data: string[];
  page: number;
  totalPages: number;
}

/** Path where the assembled DB is expected to live. */
export function getAssembledDbPath(): string {
  if (app.isPackaged) {
    return path.join(app.getPath("userData"), "dictionary.db");
  }
  // Dev: same location the CLI script (scripts/assemble-db.mjs) writes to
  return path.join(__dirname, "../../resources/dictionary.db");
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  const dbPath = getAssembledDbPath();
  _db = new Database(dbPath, { readonly: true });
  return _db;
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

export function isDbReady(): boolean {
  return existsSync(getAssembledDbPath());
}

export function searchWordsStartingWith(
  query: string,
  page: number,
  limit: number,
): IPaginatedResult {
  const db = getDb();
  const pattern = `${escapeLike(query)}%`;
  const offset = (page - 1) * limit;

  const countRow = db
    .prepare("SELECT COUNT(*) as total FROM words WHERE word LIKE ? ESCAPE '\\'")
    .get(pattern) as { total: number };

  const rows = db
    .prepare(
      "SELECT word FROM words WHERE word LIKE ? ESCAPE '\\' ORDER BY word LIMIT ? OFFSET ?",
    )
    .all(pattern, limit, offset) as { word: string }[];

  return {
    data: rows.map((r) => r.word),
    page,
    totalPages: Math.ceil(countRow.total / limit),
  };
}

export function searchWordsContaining(
  query: string,
  page: number,
  limit: number,
): IPaginatedResult {
  const db = getDb();
  const pattern = `%${escapeLike(query)}%`;
  const offset = (page - 1) * limit;

  const countRow = db
    .prepare("SELECT COUNT(*) as total FROM words WHERE word LIKE ? ESCAPE '\\'")
    .get(pattern) as { total: number };

  const rows = db
    .prepare(
      "SELECT word FROM words WHERE word LIKE ? ESCAPE '\\' ORDER BY word LIMIT ? OFFSET ?",
    )
    .all(pattern, limit, offset) as { word: string }[];

  return {
    data: rows.map((r) => r.word),
    page,
    totalPages: Math.ceil(countRow.total / limit),
  };
}

export function getWordWithDictionaries(word: string): IWordWithDictionaries | null {
  const db = getDb();

  const row = db
    .prepare("SELECT word, entries FROM words WHERE word = ?")
    .get(word) as { word: string; entries: string } | undefined;

  if (!row) return null;

  const entries = JSON.parse(row.entries) as IRawWordEntry[];
  const dictIds = [...new Set(entries.map((e) => e.id))];

  const placeholders = dictIds.map(() => "?").join(", ");
  const dictRows = db
    .prepare(
      `SELECT id, title, from_lang, to_lang FROM dictionaries WHERE id IN (${placeholders})`,
    )
    .all(...dictIds) as IDictionary[];

  const dictMap = new Map(dictRows.map((d) => [d.id, d]));

  return {
    word: row.word,
    entries: entries.map((entry) => ({
      ...entry,
      html: decodeHtmlEntities(entry.html),
      dictionary: dictMap.get(entry.id)!,
    })),
  };
}
