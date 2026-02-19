import React from "react";
import { ChevronRight, ChevronDown, Info, Loader2 } from "lucide-react";
import { toPalochka, MIN_CONTAINS_CHARS } from "@renderer/lib/consts";

interface SearchResultsListProps {
  results: string[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  query: string;
  isContainsTooShort: boolean;
  selectedWord: string | null;
  onSelectWord: (word: string) => void;
}

export function SearchResultsList({
  results,
  isLoading,
  hasMore,
  onLoadMore,
  query,
  isContainsTooShort,
  selectedWord,
  onSelectWord,
}: SearchResultsListProps) {
  if (!query.trim()) return null;

  if (isContainsTooShort) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 pt-10 text-center">
        <Info size={28} className="text-zinc-400" />
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          More characters needed
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          "Contains" requires at least{" "}
          <span className="font-bold text-[#067d35]">{MIN_CONTAINS_CHARS} characters</span>.
        </p>
      </div>
    );
  }

  if (isLoading && results.length === 0) {
    return (
      <div className="flex items-center justify-center pt-10">
        <Loader2 size={24} className="animate-spin text-[#067d35]" />
      </div>
    );
  }

  if (!isLoading && results.length === 0) {
    return (
      <div className="px-4 pt-10 text-center text-sm text-zinc-400">
        No results for "{toPalochka(query)}"
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {results.map((word) => {
        const isSelected = word === selectedWord;
        return (
          <button
            key={word}
            onClick={() => onSelectWord(word)}
            className={`flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
              isSelected
                ? "bg-[#067d35]/10 text-[#067d35] dark:bg-[#067d35]/20 dark:text-[#4ade80]"
                : "text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
            }`}
          >
            <span className="font-medium">{toPalochka(word)}</span>
            <ChevronRight
              size={15}
              className={isSelected ? "text-[#067d35] dark:text-[#4ade80]" : "text-zinc-300 dark:text-zinc-600"}
            />
          </button>
        );
      })}

      {/* Footer */}
      {isLoading && results.length > 0 ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={18} className="animate-spin text-[#067d35]" />
        </div>
      ) : hasMore ? (
        <button
          onClick={onLoadMore}
          className="mx-3 my-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-[#067d35] transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-[#4ade80] dark:hover:bg-zinc-800/50"
        >
          <ChevronDown size={15} />
          Show more
        </button>
      ) : null}
    </div>
  );
}
