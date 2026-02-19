import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@renderer/lib/utils";
import { useDictionaryStore } from "@renderer/store/useDictionaryStore";
import { MIN_CONTAINS_CHARS } from "@renderer/lib/consts";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function SearchInput({ value, onChange, onClear, inputRef }: SearchInputProps) {
  const { searchMode, setSearchMode } = useDictionaryStore();

  return (
    <div className="flex flex-col gap-2 px-3 pb-2">
      {/* Text field */}
      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
        <Search size={16} className="shrink-0 text-zinc-400" />
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search words…"
          className="flex-1 bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {value.length > 0 && (
          <button
            onClick={onClear}
            className="cursor-pointer rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Mode chips */}
      <div className="flex gap-2">
        {(["starts_with", "contains"] as const).map((mode) => {
          const isActive = searchMode === mode;
          const label =
            mode === "starts_with" ? "Starts with" : `Contains (${MIN_CONTAINS_CHARS}+ chars)`;
          return (
            <button
              key={mode}
              onClick={() => setSearchMode(mode)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                isActive
                  ? "border-[#067d35] bg-[#067d35] text-white"
                  : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
