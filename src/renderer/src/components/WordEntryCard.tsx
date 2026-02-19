import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@renderer/lib/utils";
import { LANGUAGE_DISPLAY_MAP, toPalochka } from "@renderer/lib/consts";

interface Dictionary {
  id: number;
  title: string;
  from_lang: string;
  to_lang: string;
}

interface WordEntryCardProps {
  entry: {
    id: number;
    html: string;
    dictionary: Dictionary;
  };
  isDisabled?: boolean;
  defaultExpanded?: boolean;
}

function langLabel(code: string): string {
  return LANGUAGE_DISPLAY_MAP[code] ?? code;
}

export function WordEntryCard({
  entry,
  isDisabled = false,
  defaultExpanded = false,
}: WordEntryCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { dictionary, html } = entry;

  return (
    <div
      className={cn(
        "mb-2 overflow-hidden rounded-xl border transition-all",
        isDisabled
          ? "border-zinc-100 bg-zinc-50/50 opacity-50 dark:border-zinc-800/50 dark:bg-zinc-900/30"
          : "border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex w-full cursor-pointer items-start justify-between gap-3 px-4 py-3 text-left",
          "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
        )}
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {dictionary.title}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[#067d35]/10 px-2 py-0.5 text-xs font-medium text-[#067d35] dark:bg-[#067d35]/20 dark:text-[#4ade80]">
              {langLabel(dictionary.from_lang)} → {langLabel(dictionary.to_lang)}
            </span>
          </div>
        </div>
        <span className="mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-600">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <div
            className="prose prose-sm max-w-none text-sm text-zinc-700 dark:text-zinc-300 [&_font]:text-inherit"
            dangerouslySetInnerHTML={{ __html: toPalochka(html) }}
          />
        </div>
      )}
    </div>
  );
}
