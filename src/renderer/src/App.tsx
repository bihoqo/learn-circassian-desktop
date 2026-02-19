import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Sun,
  Moon,
  Keyboard,
  ChevronRight,
  Loader2,
  X,
  Settings,
  ArrowLeft,
  FolderOpen,
  Copy,
  Check,
} from "lucide-react";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { useThemeStore } from "@renderer/store/useThemeStore";
import { useDictionaryStore } from "@renderer/store/useDictionaryStore";
import { useDictionarySearch } from "@renderer/hooks/useDictionarySearch";
import { useWordLookup } from "@renderer/hooks/useWordLookup";
import { SearchInput } from "@renderer/components/SearchInput";
import { SearchResultsList } from "@renderer/components/SearchResultsList";
import { VirtualKeyboard } from "@renderer/components/VirtualKeyboard";
import { WordEntryCard } from "@renderer/components/WordEntryCard";
import { LanguageFilter } from "@renderer/components/LanguageFilter";
import { toPalochka } from "@renderer/lib/consts";
import { cn } from "@renderer/lib/utils";
import appIcon from "./assets/icon.png";

// Module-level ref so QueryCache onError can redirect to setup without prop-drilling
const needsSetupRef = { current: () => {} };

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: () => {
      window.electronAPI
        .dbCheck()
        .then(({ needsSetup }) => {
          if (needsSetup) needsSetupRef.current();
        })
        .catch(() => {});
    },
  }),
  defaultOptions: {
    queries: { retry: 0, staleTime: 1000 * 60 * 5 },
  },
});

function langMatches(code: string, filter: string): boolean {
  if (code === "Ady/Kbd") return filter === "Ady" || filter === "Kbd";
  return code === filter;
}

interface IWordTab {
  word: string;
}

function openFolderLabel(platform: string): string {
  if (platform === "darwin") return "Show in Finder";
  if (platform === "win32") return "Open in Explorer";
  return "Open in Files";
}

// ────────────────────────────────────────────────────────────
// First-launch setup screen
// ────────────────────────────────────────────────────────────
const RELEASES_URL =
  "https://github.com/bihoqo/learn-circassian-dictionary-collection/releases/latest/download/dictionary.db";

function SetupScreen({ onDone }: { onDone: () => void }) {
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [dbPath, setDbPath] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.electronAPI.getDbPath().then(setDbPath).catch(() => null);
    window.electronAPI.getPlatform().then(setPlatform).catch(() => null);
  }, []);

  async function handleSetup() {
    setStatus("working");
    setProgress(0);
    setErrorMsg("");
    const unsub = window.electronAPI.onDownloadProgress(setProgress);
    try {
      await window.electronAPI.downloadDb();
      onDone();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setStatus("error");
    } finally {
      unsub();
    }
  }

  function handleCopyPath() {
    if (!dbPath) return;
    navigator.clipboard.writeText(dbPath).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const isWorking = status === "working";

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5 bg-zinc-950 p-8 text-center">
      <img src={appIcon} alt="Learn Circassian" className="h-20 w-20 rounded-2xl shadow-lg" />
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-50">Learn Circassian</h1>
        <p className="mt-1 text-sm font-semibold text-[#067d35]">One-time download required</p>
      </div>
      <p className="max-w-sm text-sm text-zinc-400">
        The dictionary database (~242 MB) will be downloaded once. Make sure you have an internet
        connection.
      </p>

      {status === "error" && (
        <p className="max-w-sm text-sm text-red-400">{errorMsg}</p>
      )}

      {isWorking ? (
        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-[#067d35]" />
          <p className="text-sm text-zinc-400">Downloading… {Math.round(progress * 100)}%</p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-[#067d35] transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <button
          onClick={handleSetup}
          className="cursor-pointer rounded-xl bg-[#067d35] px-8 py-3 text-base font-bold text-white transition-colors hover:bg-[#056028]"
        >
          {status === "error" ? "Try Again" : "Download Dictionary (~242 MB)"}
        </button>
      )}

      {/* Manual install instructions */}
      <div className="mt-2 w-full max-w-md border-t border-zinc-800 pt-5 text-left">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Or install manually
        </p>
        <ol className="space-y-3 text-sm text-zinc-400">
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
              1
            </span>
            <span>
              Download{" "}
              <a
                href={RELEASES_URL}
                onClick={(e) => { e.preventDefault(); window.open(RELEASES_URL); }}
                className="cursor-pointer text-[#067d35] underline-offset-2 hover:underline"
              >
                dictionary.db from GitHub Releases
              </a>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
              2
            </span>
            <div className="flex-1">
              <span>Place the file at:</span>
              {dbPath && (
                <span className="mt-1.5 flex flex-col gap-1.5">
                  <span className="flex items-center gap-2">
                    <code className="block flex-1 overflow-x-auto rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200 whitespace-nowrap">
                      {dbPath}
                    </code>
                    <button
                      onClick={handleCopyPath}
                      className="shrink-0 cursor-pointer rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-600"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </span>
                  <button
                    onClick={() => window.electronAPI.openDbFolder()}
                    className="flex items-center gap-1.5 self-start cursor-pointer rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
                  >
                    <FolderOpen size={12} />
                    {openFolderLabel(platform)}
                  </button>
                </span>
              )}
            </div>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
              3
            </span>
            <span>Restart the app — it will open automatically.</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Settings screen
// ────────────────────────────────────────────────────────────
function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { theme } = useThemeStore();
  const [dbPath, setDbPath] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    window.electronAPI.getDbPath().then(setDbPath).catch(() => null);
    window.electronAPI.getPlatform().then(setPlatform).catch(() => null);
  }, []);

  function handleCopyPath() {
    if (!dbPath) return;
    navigator.clipboard.writeText(dbPath).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="flex shrink-0 items-center gap-3 border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
        <button
          onClick={onBack}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Settings</span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <div className="w-full max-w-lg">
          <h2 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">Database</h2>
          <p className="mb-4 text-sm text-zinc-500">
            The dictionary database is stored at the path below. You can delete it to free up space
            — the app will ask you to download it again on next launch.
          </p>

          {dbPath ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Database path
              </p>
              <code className="block overflow-x-auto text-sm text-zinc-700 dark:text-zinc-200 whitespace-nowrap">
                {dbPath}
              </code>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={handleCopyPath}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  {copied ? <Check size={14} className="text-[#067d35]" /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy path"}
                </button>
                <button
                  onClick={() => window.electronAPI.openDbFolder()}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <FolderOpen size={14} />
                  {openFolderLabel(platform)}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-20 items-center justify-center">
              <Loader2 size={20} className="animate-spin text-zinc-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Word detail panel
// ────────────────────────────────────────────────────────────
function WordDetailPanel({ word }: { word: string }) {
  const { data, isLoading, notFound } = useWordLookup(word);
  const { fromLangFilter, setFromLangFilter, toLangFilter, setToLangFilter } =
    useDictionaryStore();
  const displayWord = toPalochka(word);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#067d35]" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300">Word not found</p>
        <p className="text-sm text-zinc-400">No entries found for "{displayWord}"</p>
      </div>
    );
  }

  const entries = data.entries;

  const matchesFilter = (entry: IWordEntryWithDictionary) => {
    if (fromLangFilter && !langMatches(entry.dictionary.from_lang, fromLangFilter)) return false;
    if (toLangFilter && !langMatches(entry.dictionary.to_lang, toLangFilter)) return false;
    return true;
  };

  const hasActiveFilter = fromLangFilter !== null || toLangFilter !== null;
  const activeEntries = hasActiveFilter ? entries.filter(matchesFilter) : entries;
  const disabledEntries = hasActiveFilter
    ? entries.filter((e: IWordEntryWithDictionary) => !matchesFilter(e))
    : [];

  return (
    <div className="px-6 py-5">
      <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
        {displayWord}
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        {entries.length} {entries.length === 1 ? "entry" : "entries"}
      </p>
      <div className="mt-3">
        <LanguageFilter
          entries={entries}
          fromLang={fromLangFilter}
          toLang={toLangFilter}
          onFromLangChange={setFromLangFilter}
          onToLangChange={setToLangFilter}
        />
      </div>

      <div className="mt-4">
        {activeEntries.map((entry: IWordEntryWithDictionary, i: number) => (
          <WordEntryCard
            key={`active-${i}-${entry.dictionary.id}`}
            entry={entry}
            isDisabled={false}
            defaultExpanded={activeEntries.length <= 3}
          />
        ))}

        {disabledEntries.length > 0 && (
          <>
            <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
              {disabledEntries.length} filtered{" "}
              {disabledEntries.length === 1 ? "entry" : "entries"}
            </p>
            {disabledEntries.map((entry: IWordEntryWithDictionary, i: number) => (
              <WordEntryCard
                key={`disabled-${i}-${entry.dictionary.id}`}
                entry={entry}
                isDisabled
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Welcome panel
// ────────────────────────────────────────────────────────────
function WelcomePanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-12 text-center">
      <img src={appIcon} alt="Learn Circassian" className="h-16 w-16 rounded-2xl shadow-lg" />
      <h2 className="text-2xl font-black tracking-tight text-zinc-800 dark:text-zinc-100">
        Learn Circassian
      </h2>
      <p className="max-w-xs text-sm text-zinc-400 dark:text-zinc-500">
        Search for a word on the left to see its dictionary entries from 35+ sources.
      </p>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
        <ChevronRight size={14} className="text-[#067d35]" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Tip: use the virtual keyboard to type Circassian characters
        </span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Left panel (search + keyboard + results)
// ────────────────────────────────────────────────────────────
function LeftPanel({
  selectedWord,
  onSelectWord,
}: {
  selectedWord: string | null;
  onSelectWord: (word: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, clearQuery, results, isLoading, hasMore, loadMore, isContainsTooShort } =
    useDictionarySearch();
  const { isKeyboardOpen, toggleKeyboard } = useDictionaryStore();

  const insertChar = useCallback(
    (char: string) => {
      const input = inputRef.current;
      if (!input) {
        setQuery(query + char);
        return;
      }
      const start = input.selectionStart ?? query.length;
      const end = input.selectionEnd ?? query.length;
      const newValue = query.slice(0, start) + char + query.slice(end);
      setQuery(newValue);
      requestAnimationFrame(() => {
        input.selectionStart = start + char.length;
        input.selectionEnd = start + char.length;
        input.focus();
      });
    },
    [query, setQuery],
  );

  const handleBackspace = useCallback(() => {
    const input = inputRef.current;
    if (!input) {
      setQuery(query.slice(0, -1));
      return;
    }
    const start = input.selectionStart ?? query.length;
    const end = input.selectionEnd ?? query.length;
    if (start === end && start > 0) {
      const newValue = query.slice(0, start - 1) + query.slice(end);
      setQuery(newValue);
      requestAnimationFrame(() => {
        input.selectionStart = start - 1;
        input.selectionEnd = start - 1;
        input.focus();
      });
    } else if (start !== end) {
      const newValue = query.slice(0, start) + query.slice(end);
      setQuery(newValue);
      requestAnimationFrame(() => {
        input.selectionStart = start;
        input.selectionEnd = start;
        input.focus();
      });
    }
  }, [query, setQuery]);

  return (
    <div className="flex h-full flex-col border-r border-zinc-200 dark:border-zinc-800">
      <div className="pt-2">
        <SearchInput
          value={query}
          onChange={setQuery}
          onClear={clearQuery}
          inputRef={inputRef}
        />
      </div>

      <div className="px-3 pb-1">
        <button
          onClick={toggleKeyboard}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
        >
          <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wide">
            <Keyboard size={12} />
            Virtual keyboard
          </span>
          <span>{isKeyboardOpen ? "▲" : "▼"}</span>
        </button>
      </div>

      {isKeyboardOpen && (
        <div className="shrink-0">
          <VirtualKeyboard onInsertChar={insertChar} onBackspace={handleBackspace} />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <SearchResultsList
          results={results}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          query={query}
          isContainsTooShort={isContainsTooShort}
          selectedWord={selectedWord}
          onSelectWord={onSelectWord}
        />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// App header
// ────────────────────────────────────────────────────────────
function AppHeader({
  onSettingsClick,
  settingsActive,
}: {
  onSettingsClick: () => void;
  settingsActive: boolean;
}) {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
      <div className="flex items-center gap-2.5">
        <img src={appIcon} alt="Learn Circassian" className="h-7 w-7 rounded-lg" />
        <span className="text-sm font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Learn Circassian
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onSettingsClick}
          title="Settings"
          className={cn(
            "cursor-pointer rounded-lg border p-1.5 transition-colors",
            settingsActive
              ? "border-[#067d35] bg-[#067d35]/10 text-[#067d35]"
              : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700",
          )}
        >
          <Settings size={15} />
        </button>
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="cursor-pointer rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}

// ────────────────────────────────────────────────────────────
// Dictionary app (main two-panel UI)
// ────────────────────────────────────────────────────────────
function DictionaryApp({ onNeedsSetup }: { onNeedsSetup: () => void }) {
  const { theme } = useThemeStore();
  const [view, setView] = useState<"dictionary" | "settings">("dictionary");
  const [tabs, setTabs] = useState<IWordTab[]>([]);
  const [activeTabWord, setActiveTabWord] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Keep the module-level ref pointing at our onNeedsSetup callback
  useEffect(() => {
    needsSetupRef.current = onNeedsSetup;
    return () => {
      needsSetupRef.current = () => {};
    };
  }, [onNeedsSetup]);

  async function handleSettingsBack() {
    try {
      const { needsSetup } = await window.electronAPI.dbCheck();
      if (needsSetup) {
        onNeedsSetup();
      } else {
        setView("dictionary");
      }
    } catch {
      onNeedsSetup();
    }
  }

  const handleSelectWord = useCallback((word: string) => {
    setTabs((prev) => {
      if (prev.some((t) => t.word === word)) return prev;
      return [...prev, { word }];
    });
    setActiveTabWord(word);
  }, []);

  const handleCloseTab = useCallback(
    (word: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setTabs((prev) => {
        const newTabs = prev.filter((t) => t.word !== word);
        if (activeTabWord === word) {
          const idx = prev.findIndex((t) => t.word === word);
          const next = newTabs[idx] ?? newTabs[idx - 1] ?? null;
          setActiveTabWord(next?.word ?? null);
        }
        return newTabs;
      });
    },
    [activeTabWord],
  );

  const handleCloseAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabWord(null);
  }, []);

  if (view === "settings") {
    return <SettingsScreen onBack={handleSettingsBack} />;
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <AppHeader onSettingsClick={() => setView("settings")} settingsActive={false} />
      <div className="flex min-h-0 flex-1">
        {/* Left: search + keyboard + results */}
        <div className="w-[360px] min-w-[280px] shrink-0 overflow-hidden">
          <LeftPanel selectedWord={activeTabWord} onSelectWord={handleSelectWord} />
        </div>

        {/* Right: tabs + word detail */}
        <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-zinc-950">
          {/* Tabs bar */}
          {tabs.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-stretch border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/80">
              {tabs.map((tab) => {
                const isActive = activeTabWord === tab.word;
                return (
                  <div
                    key={tab.word}
                    onClick={() => setActiveTabWord(tab.word)}
                    className={cn(
                      "group flex shrink-0 cursor-pointer items-center gap-1.5 border-r border-zinc-200 px-3 py-2 transition-colors dark:border-zinc-800",
                      isActive
                        ? "border-b-2 border-b-[#067d35] bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                        : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
                    )}
                  >
                    <span className="max-w-[120px] truncate text-sm font-medium">
                      {toPalochka(tab.word)}
                    </span>
                    <button
                      onClick={(e) => handleCloseTab(tab.word, e)}
                      className="cursor-pointer rounded p-0.5 opacity-0 transition-opacity hover:bg-zinc-200 group-hover:opacity-100 dark:hover:bg-zinc-700"
                      aria-label={`Close ${toPalochka(tab.word)}`}
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })}

              {/* Close all */}
              <button
                onClick={handleCloseAllTabs}
                className="flex cursor-pointer items-center gap-1 self-center px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label="Close all tabs"
              >
                <X size={11} />
                Close all
              </button>
            </div>
          )}

          {/* Word detail or welcome */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {activeTabWord ? <WordDetailPanel word={activeTabWord} /> : <WelcomePanel />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Root app — checks DB, shows setup or dictionary
// ────────────────────────────────────────────────────────────
type AppState = "checking" | "needs_setup" | "ready";

function RootApp() {
  const { theme } = useThemeStore();
  const [appState, setAppState] = useState<AppState>("checking");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    window.electronAPI
      .dbCheck()
      .then(({ needsSetup }) => setAppState(needsSetup ? "needs_setup" : "ready"))
      .catch(() => setAppState("needs_setup"));
  }, []);

  if (appState === "checking") {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 size={32} className="animate-spin text-[#067d35]" />
      </div>
    );
  }

  if (appState === "needs_setup") {
    return <SetupScreen onDone={() => setAppState("ready")} />;
  }

  return <DictionaryApp onNeedsSetup={() => setAppState("needs_setup")} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootApp />
    </QueryClientProvider>
  );
}
