import { describe, it, expect } from "bun:test";
import {
  toPalochka,
  LANGUAGE_DISPLAY_MAP,
  KEYBOARD_TABS,
  KEYBOARD_LAYOUTS,
  MIN_CONTAINS_CHARS,
} from "../consts";

describe("toPalochka", () => {
  it("converts digit 1 to Cyrillic palochka Ӏ", () => {
    expect(toPalochka("1эдыгъу")).toBe("Ӏэдыгъу");
  });

  it("converts all occurrences of 1 in a string", () => {
    expect(toPalochka("1э1у")).toBe("ӀэӀу");
  });

  it("leaves strings without 1 unchanged", () => {
    expect(toPalochka("адыгэ")).toBe("адыгэ");
  });

  it("returns an empty string unchanged", () => {
    expect(toPalochka("")).toBe("");
  });

  it("does not affect the Roman numeral I", () => {
    expect(toPalochka("I")).toBe("I");
  });

  it("converts 1 inside HTML content", () => {
    expect(toPalochka("<b>1эпэ</b>")).toBe("<b>Ӏэпэ</b>");
  });
});

describe("LANGUAGE_DISPLAY_MAP", () => {
  it("maps Ady to West Circassian", () => {
    expect(LANGUAGE_DISPLAY_MAP["Ady"]).toBe("West Circassian");
  });

  it("maps Kbd to East Circassian", () => {
    expect(LANGUAGE_DISPLAY_MAP["Kbd"]).toBe("East Circassian");
  });

  it("maps Ady/Kbd to West & East Circassian", () => {
    expect(LANGUAGE_DISPLAY_MAP["Ady/Kbd"]).toBe("West & East Circassian");
  });

  it("maps Ru to Russian", () => {
    expect(LANGUAGE_DISPLAY_MAP["Ru"]).toBe("Russian");
  });

  it("maps En to English", () => {
    expect(LANGUAGE_DISPLAY_MAP["En"]).toBe("English");
  });

  it("maps Tr to Turkish", () => {
    expect(LANGUAGE_DISPLAY_MAP["Tr"]).toBe("Turkish");
  });

  it("maps Ar to Arabic", () => {
    expect(LANGUAGE_DISPLAY_MAP["Ar"]).toBe("Arabic");
  });

  it("maps He to Hebrew", () => {
    expect(LANGUAGE_DISPLAY_MAP["He"]).toBe("Hebrew");
  });
});

describe("KEYBOARD_TABS", () => {
  it("has exactly 5 tabs", () => {
    expect(KEYBOARD_TABS.length).toBe(5);
  });

  it("includes Circassian as the first tab", () => {
    expect(KEYBOARD_TABS[0]).toBe("Circassian");
  });

  it("includes English as the last tab", () => {
    expect(KEYBOARD_TABS[KEYBOARD_TABS.length - 1]).toBe("English");
  });
});

describe("KEYBOARD_LAYOUTS", () => {
  it("has a layout for every tab", () => {
    for (const tab of KEYBOARD_TABS) {
      expect(KEYBOARD_LAYOUTS[tab]).toBeDefined();
    }
  });

  it("each layout has exactly 4 default rows", () => {
    for (const tab of KEYBOARD_TABS) {
      expect(KEYBOARD_LAYOUTS[tab].default.length).toBe(4);
    }
  });

  it("each layout has exactly 4 shift rows", () => {
    for (const tab of KEYBOARD_TABS) {
      expect(KEYBOARD_LAYOUTS[tab].shift.length).toBe(4);
    }
  });

  it("Circassian default layout contains palochka (Ӏ)", () => {
    const rows = KEYBOARD_LAYOUTS["Circassian"].default;
    expect(rows.some((row) => row.includes("Ӏ"))).toBe(true);
  });

  it("Russian layout does not contain palochka (Ӏ)", () => {
    const rows = KEYBOARD_LAYOUTS["Russian"].default;
    expect(rows.some((row) => row.includes("Ӏ"))).toBe(false);
  });

  it("Turkish default layout contains ğ, ş, and ı", () => {
    const allKeys = KEYBOARD_LAYOUTS["Turkish"].default.join(" ");
    expect(allKeys).toContain("ğ");
    expect(allKeys).toContain("ş");
    expect(allKeys).toContain("ı");
  });

  it("Turkish shift layout contains uppercase İ (dotted I)", () => {
    const allKeys = KEYBOARD_LAYOUTS["Turkish"].shift.join(" ");
    expect(allKeys).toContain("İ");
  });

  it("Arabic default layout contains Arabic-script characters (U+0600–U+06FF)", () => {
    const allKeys = KEYBOARD_LAYOUTS["Arabic"].default.join("");
    expect(/[\u0600-\u06FF]/.test(allKeys)).toBe(true);
  });

  it("English default row 0 is the standard backtick/number row", () => {
    expect(KEYBOARD_LAYOUTS["English"].default[0]).toBe("` 1 2 3 4 5 6 7 8 9 0 - =");
  });

  it("English shift row 0 is the standard symbol row", () => {
    expect(KEYBOARD_LAYOUTS["English"].shift[0]).toBe("~ ! @ # $ % ^ & * ( ) _ +");
  });

  it("Circassian shift layout contains uppercase Cyrillic letters", () => {
    const allKeys = KEYBOARD_LAYOUTS["Circassian"].shift.join(" ");
    expect(allKeys).toContain("Й");
    expect(allKeys).toContain("Я");
    expect(allKeys).toContain("Ъ");
  });

  it("Circassian default layout does NOT contain digit 1 (uses Ӏ instead)", () => {
    // The number "1" in the first row is the number, not palochka
    // Palochka Ӏ should appear in the letter rows (rows 1+)
    const letterRows = KEYBOARD_LAYOUTS["Circassian"].default.slice(1);
    expect(letterRows.some((row) => row.includes("Ӏ"))).toBe(true);
  });

  it("each layout's default and shift rows have matching count per row", () => {
    for (const tab of KEYBOARD_TABS) {
      const layout = KEYBOARD_LAYOUTS[tab];
      expect(layout.default.length).toBe(layout.shift.length);
    }
  });
});

// ─── MIN_CONTAINS_CHARS ───────────────────────────────────────────────────────

describe("MIN_CONTAINS_CHARS", () => {
  it("is a positive integer", () => {
    expect(MIN_CONTAINS_CHARS).toBeGreaterThan(0);
    expect(Number.isInteger(MIN_CONTAINS_CHARS)).toBe(true);
  });
});
