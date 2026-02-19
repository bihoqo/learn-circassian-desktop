import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { useDictionaryStore } from "@renderer/store/useDictionaryStore";
import { MIN_CONTAINS_CHARS } from "@renderer/lib/consts";

const PAGE_SIZE = 50;

function normalizeQuery(q: string): string {
  return q.replace(/\u04C0/g, "1").toLowerCase();
}

export function useDictionarySearch() {
  const { searchMode } = useDictionaryStore();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const normalizedQuery = normalizeQuery(debouncedQuery);

  const isContainsTooShort =
    searchMode === "contains" &&
    normalizedQuery.length > 0 &&
    normalizedQuery.length < MIN_CONTAINS_CHARS;

  const { data, isFetching, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["search", normalizedQuery, searchMode],
    queryFn: ({ pageParam }) =>
      window.electronAPI.searchWords({
        query: normalizedQuery,
        mode: searchMode,
        page: pageParam as number,
        limit: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: normalizedQuery.length > 0 && !isContainsTooShort,
  });

  const results = data?.pages.flatMap((p) => p.data) ?? [];
  const isPending = query !== debouncedQuery;

  return {
    query,
    setQuery,
    clearQuery: () => setQuery(""),
    results,
    isLoading: isFetching || isPending,
    hasMore: hasNextPage ?? false,
    loadMore: fetchNextPage,
    isContainsTooShort,
  };
}
