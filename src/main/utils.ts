/**
 * Decode common HTML entities in a string.
 *
 * Some dictionary entries are stored with HTML-encoded content inside an outer
 * HTML wrapper (e.g. `&lt;font color=&#39;sienna&#39;&gt;`). Decoding ensures
 * that the renderer receives raw HTML and renders tags correctly.
 *
 * `&amp;` is decoded last so that `&amp;lt;` becomes `&lt;` (not `<`).
 */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&amp;/g, "&");
}

/**
 * Escape special LIKE pattern characters for SQLite queries.
 * Use with `ESCAPE '\\'` in the SQL statement.
 */
export function escapeLike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
