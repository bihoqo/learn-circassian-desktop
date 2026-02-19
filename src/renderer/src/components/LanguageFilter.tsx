import React from "react";
import { cn } from "@renderer/lib/utils";
import { LANGUAGE_DISPLAY_MAP } from "@renderer/lib/consts";

interface Entry {
  dictionary: {
    from_lang: string;
    to_lang: string;
  };
}

interface LanguageFilterProps {
  entries: Entry[];
  fromLang: string | null;
  toLang: string | null;
  onFromLangChange: (lang: string | null) => void;
  onToLangChange: (lang: string | null) => void;
}

function buildLangOptions(entries: Entry[], key: "from_lang" | "to_lang"): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of entries) {
    const code = entry.dictionary[key];
    if (code === "Ady/Kbd") {
      for (const c of ["Ady", "Kbd"]) {
        if (!seen.has(c)) {
          seen.add(c);
          result.push(c);
        }
      }
    } else if (!seen.has(code)) {
      seen.add(code);
      result.push(code);
    }
  }
  return result;
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "cursor-pointer whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition-all",
        active
          ? "border-[#067d35] bg-[#067d35] text-white"
          : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600",
      )}
    >
      {label}
    </button>
  );
}

export function LanguageFilter({
  entries,
  fromLang,
  toLang,
  onFromLangChange,
  onToLangChange,
}: LanguageFilterProps) {
  const fromOptions = buildLangOptions(entries, "from_lang");
  const toOptions = buildLangOptions(entries, "to_lang");

  if (fromOptions.length <= 1 && toOptions.length <= 1) return null;

  return (
    <div className="flex flex-col gap-2 pb-3">
      {fromOptions.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="self-center pr-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            From
          </span>
          <Chip label="All" active={fromLang === null} onClick={() => onFromLangChange(null)} />
          {fromOptions.map((code) => (
            <Chip
              key={code}
              label={LANGUAGE_DISPLAY_MAP[code] ?? code}
              active={fromLang === code}
              onClick={() => onFromLangChange(fromLang === code ? null : code)}
            />
          ))}
        </div>
      )}
      {toOptions.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="self-center pr-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            To
          </span>
          <Chip label="All" active={toLang === null} onClick={() => onToLangChange(null)} />
          {toOptions.map((code) => (
            <Chip
              key={code}
              label={LANGUAGE_DISPLAY_MAP[code] ?? code}
              active={toLang === code}
              onClick={() => onToLangChange(toLang === code ? null : code)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
