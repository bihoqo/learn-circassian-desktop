import { describe, it, expect } from "bun:test";
import { decodeHtmlEntities, escapeLike } from "../utils";

// ─── decodeHtmlEntities ───────────────────────────────────────────────────────

describe("decodeHtmlEntities", () => {
  it("decodes &lt; and &gt; into angle brackets", () => {
    expect(decodeHtmlEntities("&lt;font&gt;")).toBe("<font>");
  });

  it("decodes &#39; into a single quote", () => {
    expect(decodeHtmlEntities("color=&#39;red&#39;")).toBe("color='red'");
  });

  it("decodes &#x27; into a single quote (hex entity)", () => {
    expect(decodeHtmlEntities("it&#x27;s")).toBe("it's");
  });

  it("decodes &quot; into a double quote", () => {
    expect(decodeHtmlEntities("&quot;hello&quot;")).toBe('"hello"');
  });

  it("decodes &#x2F; into a forward slash (hex entity)", () => {
    expect(decodeHtmlEntities("a&#x2F;b")).toBe("a/b");
  });

  it("decodes &amp; into ampersand (last so &amp;lt; becomes &lt; not <)", () => {
    expect(decodeHtmlEntities("&amp;lt;")).toBe("&lt;");
  });

  it("does NOT double-decode: &amp;lt; → &lt;, not <", () => {
    // This is the key ordering test: &amp; must be processed last
    expect(decodeHtmlEntities("&amp;lt;")).not.toBe("<");
    expect(decodeHtmlEntities("&amp;lt;")).toBe("&lt;");
  });

  it("handles a full encoded HTML tag", () => {
    const input = "&lt;font color=&#39;sienna&#39;&gt;test&lt;/font&gt;";
    expect(decodeHtmlEntities(input)).toBe("<font color='sienna'>test</font>");
  });

  it("leaves already-raw HTML unchanged", () => {
    const html = "<div style='margin-left:1em'>море</div>";
    expect(decodeHtmlEntities(html)).toBe(html);
  });

  it("returns empty string unchanged", () => {
    expect(decodeHtmlEntities("")).toBe("");
  });

  it("handles a string with no entities unchanged", () => {
    expect(decodeHtmlEntities("plain text")).toBe("plain text");
  });

  it("handles multiple different entities in one string", () => {
    expect(decodeHtmlEntities("&lt;p&gt;&quot;hello&quot;&lt;/p&gt;")).toBe('<p>"hello"</p>');
  });

  it("handles &amp; by itself", () => {
    expect(decodeHtmlEntities("&amp;")).toBe("&");
  });

  it("handles &amp;&amp; (two ampersands)", () => {
    expect(decodeHtmlEntities("&amp;&amp;")).toBe("&&");
  });

  it("handles a mix of &#39; and &#x27;", () => {
    expect(decodeHtmlEntities("it&#39;s it&#x27;s")).toBe("it's it's");
  });
});

// ─── escapeLike ───────────────────────────────────────────────────────────────

describe("escapeLike", () => {
  it("escapes backslash", () => {
    expect(escapeLike("a\\b")).toBe("a\\\\b");
  });

  it("escapes percent sign", () => {
    expect(escapeLike("100%")).toBe("100\\%");
  });

  it("escapes underscore", () => {
    expect(escapeLike("a_b")).toBe("a\\_b");
  });

  it("escapes all three special characters together", () => {
    expect(escapeLike("a%b_c\\d")).toBe("a\\%b\\_c\\\\d");
  });

  it("leaves a plain Circassian string unchanged", () => {
    expect(escapeLike("адыгэ")).toBe("адыгэ");
  });

  it("returns empty string unchanged", () => {
    expect(escapeLike("")).toBe("");
  });

  it("escapes leading percent", () => {
    expect(escapeLike("%prefix")).toBe("\\%prefix");
  });

  it("escapes trailing percent", () => {
    expect(escapeLike("suffix%")).toBe("suffix\\%");
  });

  it("escapes consecutive percent signs", () => {
    expect(escapeLike("%%")).toBe("\\%\\%");
  });

  it("escapes consecutive underscores", () => {
    expect(escapeLike("__")).toBe("\\_\\_");
  });

  it("escapes a lone backslash", () => {
    expect(escapeLike("\\")).toBe("\\\\");
  });

  it("handles a realistic search prefix pattern", () => {
    // User types "псы" → no special chars, unchanged
    expect(escapeLike("псы")).toBe("псы");
  });

  it("handles a user input that looks like a SQL wildcard", () => {
    expect(escapeLike("100%")).toBe("100\\%");
  });
});
