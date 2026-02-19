import { useQuery } from "@tanstack/react-query";

export function useWordLookup(word: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["word", word],
    queryFn: () => window.electronAPI.getWord(word),
    enabled: word.length > 0,
  });

  return {
    data: data ?? null,
    isLoading,
    notFound: isError || (!isLoading && data === null),
  };
}
