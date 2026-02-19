import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Dictionary queries
  searchWords: (args: {
    query: string;
    mode: "starts_with" | "contains";
    page: number;
    limit: number;
  }) => ipcRenderer.invoke("search-words", args),

  getWord: (word: string) => ipcRenderer.invoke("get-word", word),

  // First-launch DB setup
  dbCheck: () => ipcRenderer.invoke("db-check"),
  getDbPath: () => ipcRenderer.invoke("get-db-path"),
  downloadDb: () => ipcRenderer.invoke("download-db"),
  onDownloadProgress: (cb: (pct: number) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, pct: number) => cb(pct);
    ipcRenderer.on("download-progress", handler);
    return () => ipcRenderer.off("download-progress", handler);
  },

  // OS info & file-system helpers
  getPlatform: (): Promise<string> => ipcRenderer.invoke("get-platform"),
  openDbFolder: (): Promise<void> => ipcRenderer.invoke("open-db-folder"),

});
