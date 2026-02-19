import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KeyboardTab } from "@renderer/lib/consts";

interface DictionaryState {
  searchMode: "starts_with" | "contains";
  setSearchMode: (mode: "starts_with" | "contains") => void;

  fromLangFilter: string | null;
  setFromLangFilter: (lang: string | null) => void;

  toLangFilter: string | null;
  setToLangFilter: (lang: string | null) => void;

  activeKeyboardTab: KeyboardTab;
  setActiveKeyboardTab: (tab: KeyboardTab) => void;

  isShiftActive: boolean;
  setIsShiftActive: (active: boolean) => void;

  isKeyboardOpen: boolean;
  toggleKeyboard: () => void;
}

export const useDictionaryStore = create<DictionaryState>()(
  persist(
    (set) => ({
      searchMode: "starts_with",
      setSearchMode: (mode) => set({ searchMode: mode }),

      fromLangFilter: null,
      setFromLangFilter: (lang) => set({ fromLangFilter: lang }),

      toLangFilter: null,
      setToLangFilter: (lang) => set({ toLangFilter: lang }),

      activeKeyboardTab: "Circassian",
      setActiveKeyboardTab: (tab) => set({ activeKeyboardTab: tab }),

      isShiftActive: false,
      setIsShiftActive: (active) => set({ isShiftActive: active }),

      isKeyboardOpen: true,
      toggleKeyboard: () => set((state) => ({ isKeyboardOpen: !state.isKeyboardOpen })),
    }),
    {
      name: "dictionary-settings",
      partialize: (state) => ({
        searchMode: state.searchMode,
        activeKeyboardTab: state.activeKeyboardTab,
        isKeyboardOpen: state.isKeyboardOpen,
      }),
    },
  ),
);
