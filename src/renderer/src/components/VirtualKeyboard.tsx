import React from "react";
import { Delete } from "lucide-react";
import { cn } from "@renderer/lib/utils";
import { KEYBOARD_TABS, KEYBOARD_LAYOUTS } from "@renderer/lib/consts";
import { useDictionaryStore } from "@renderer/store/useDictionaryStore";

interface VirtualKeyboardProps {
  onInsertChar: (char: string) => void;
  onBackspace: () => void;
}

export function VirtualKeyboard({ onInsertChar, onBackspace }: VirtualKeyboardProps) {
  const { activeKeyboardTab, setActiveKeyboardTab, isShiftActive, setIsShiftActive } =
    useDictionaryStore();

  const layout = KEYBOARD_LAYOUTS[activeKeyboardTab][isShiftActive ? "shift" : "default"];

  const handleKeyClick = (key: string) => {
    onInsertChar(key);
    if (isShiftActive) setIsShiftActive(false);
  };

  return (
    <div className="flex flex-col gap-2 px-3 pb-2">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1">
        {KEYBOARD_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveKeyboardTab(tab)}
            className={cn(
              "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
              activeKeyboardTab === tab
                ? "bg-[#067d35] text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Keyboard rows */}
      <div className="flex flex-col gap-1">
        {layout.map((row, rowIndex) => {
          const keys = row.split(" ");
          return (
            <div key={rowIndex} className="flex gap-1">
              {/* Shift on last row */}
              {rowIndex === layout.length - 1 && (
                <button
                  onClick={() => setIsShiftActive(!isShiftActive)}
                  className={cn(
                    "flex h-8 min-w-[3rem] cursor-pointer items-center justify-center rounded-lg text-xs font-semibold transition-all active:scale-95",
                    isShiftActive
                      ? "bg-[#067d35] text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700",
                  )}
                >
                  Shift
                </button>
              )}

              {keys.map((key, keyIndex) => (
                <button
                  key={`${rowIndex}-${keyIndex}`}
                  onClick={() => handleKeyClick(key)}
                  className="flex h-8 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg bg-zinc-100 text-xs font-medium text-zinc-800 transition-all hover:bg-zinc-200 active:scale-95 active:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:active:bg-zinc-600"
                >
                  {key}
                </button>
              ))}

              {/* Backspace on first row */}
              {rowIndex === 0 && (
                <button
                  onClick={onBackspace}
                  className="flex h-8 min-w-[3rem] cursor-pointer items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 transition-all hover:bg-zinc-200 active:scale-95 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  <Delete size={14} />
                </button>
              )}
            </div>
          );
        })}

        {/* Space bar */}
        <div className="flex gap-1">
          <button
            onClick={() => handleKeyClick(" ")}
            className="h-8 flex-1 cursor-pointer rounded-lg bg-zinc-100 text-xs font-medium text-zinc-500 transition-all hover:bg-zinc-200 active:scale-[0.99] dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            Space
          </button>
        </div>
      </div>
    </div>
  );
}
