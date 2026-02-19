/// <reference types="vite/client" />

declare module "*.png" {
  const src: string;
  export default src;
}

interface IWordEntryWithDictionary {
  id: number;
  html: string;
  dictionary: {
    id: number;
    title: string;
    from_lang: string;
    to_lang: string;
  };
}

interface IWordWithDictionaries {
  word: string;
  entries: IWordEntryWithDictionary[];
}

interface IPaginatedResult {
  data: string[];
  page: number;
  totalPages: number;
}

interface Window {
  electronAPI: {
    // Dictionary queries
    searchWords: (args: {
      query: string;
      mode: "starts_with" | "contains";
      page: number;
      limit: number;
    }) => Promise<IPaginatedResult>;
    getWord: (word: string) => Promise<IWordWithDictionaries | null>;

    // First-launch DB setup
    dbCheck: () => Promise<{ needsSetup: boolean }>;
    getDbPath: () => Promise<string>;
    downloadDb: () => Promise<{ ok: boolean }>;
    onDownloadProgress: (cb: (pct: number) => void) => () => void;

    // OS info & file-system helpers
    getPlatform: () => Promise<string>;
    openDbFolder: () => Promise<void>;

  };
}
