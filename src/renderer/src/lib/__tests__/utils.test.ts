import { describe, it, expect } from "bun:test";
import { cn } from "../utils";

describe("cn", () => {
  it("joins two class names with a space", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out false values", () => {
    expect(cn("foo", false, "bar")).toBe("foo bar");
  });

  it("filters out null values", () => {
    expect(cn("foo", null, "bar")).toBe("foo bar");
  });

  it("filters out undefined values", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
  });

  it("returns empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("handles a single class", () => {
    expect(cn("px-4")).toBe("px-4");
  });

  it("handles all falsy arguments", () => {
    expect(cn(false, null, undefined)).toBe("");
  });

  it("joins multiple classes correctly", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });
});
