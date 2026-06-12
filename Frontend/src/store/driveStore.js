import { create } from "zustand";

/**
 * Central Zustand store for the /app drive shell.
 *
 * Replaces:
 *  - useModals   → modals slice
 *  - useSelection → selection slice
 *  - useContextMenu → contextMenu slice
 *
 * Upload state stays in useUpload (it relies on XHR abort refs — not
 * serialisable, so keeping it as a local hook is the right call).
 */
const useDriveStore = create((set, get) => ({
  // ─── Modal slice ──────────────────────────────────────────────────────────
  modals: {
    createDir: false,
    rename: false,
    share: false,
    access: false,
    details: false,
  },
  modalData: {
    type: null,   // "file" | "directory"
    id: null,
    name: "",
    data: null,   // arbitrary extra payload (e.g. accessControl value)
  },

  openCreateDir: () =>
    set((s) => ({ modals: { ...s.modals, createDir: true } })),
  closeCreateDir: () =>
    set((s) => ({ modals: { ...s.modals, createDir: false } })),

  openRename: (type, id, name) =>
    set((s) => ({
      modalData: { ...s.modalData, type, id, name },
      modals: { ...s.modals, rename: true },
    })),
  closeRename: () =>
    set((s) => ({ modals: { ...s.modals, rename: false } })),

  openShare: (id, name) =>
    set((s) => ({
      modalData: { ...s.modalData, id, name },
      modals: { ...s.modals, share: true },
    })),
  closeShare: () =>
    set((s) => ({ modals: { ...s.modals, share: false } })),

  openAccess: (id, name, data) =>
    set((s) => ({
      modalData: { ...s.modalData, id, name, data },
      modals: { ...s.modals, access: true },
    })),
  closeAccess: () =>
    set((s) => ({ modals: { ...s.modals, access: false } })),

  openDetails: (data) =>
    set((s) => ({
      modalData: { ...s.modalData, data },
      modals: { ...s.modals, details: true },
    })),
  closeDetails: () =>
    set((s) => ({ modals: { ...s.modals, details: false } })),

  setModalData: (updater) =>
    set((s) => ({
      modalData:
        typeof updater === "function" ? updater(s.modalData) : { ...s.modalData, ...updater },
    })),

  // ─── Selection slice ──────────────────────────────────────────────────────
  selection: { dirs: [], files: [] },

  clearSelection: () => set({ selection: { dirs: [], files: [] } }),

  resetSelectionForDir: () => set({ selection: { dirs: [], files: [] } }),

  handleItemClick: (id, isDirectory, ctrlKey) => {
    const { selection } = get();
    if (ctrlKey) {
      // toggle
      const key = isDirectory ? "dirs" : "files";
      const isSelected = selection[key].includes(id);
      set({
        selection: {
          ...selection,
          [key]: isSelected
            ? selection[key].filter((i) => i !== id)
            : [...selection[key], id],
        },
      });
    } else {
      // exclusive select
      set({
        selection: {
          dirs: isDirectory ? [id] : [],
          files: isDirectory ? [] : [id],
        },
      });
    }
  },

  toggleSelectAll: (items) => {
    const { selection } = get();
    const totalSelected = selection.dirs.length + selection.files.length;
    if (totalSelected === items.length && items.length > 0) {
      set({ selection: { dirs: [], files: [] } });
    } else {
      set({
        selection: {
          dirs: items.filter((i) => i.isDirectory).map((d) => d._id),
          files: items.filter((i) => !i.isDirectory).map((f) => f._id),
        },
      });
    }
  },

  // ─── Context-menu slice ───────────────────────────────────────────────────
  contextMenu: { activeId: null, pos: { x: 0, y: 0 } },

  openContextMenu: (id, x, y) =>
    set({ contextMenu: { activeId: id, pos: { x, y } } }),
  closeContextMenu: () =>
    set({ contextMenu: { activeId: null, pos: { x: 0, y: 0 } } }),

  handleContextMenu: (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    const { contextMenu } = get();
    if (contextMenu.activeId === id) {
      set({ contextMenu: { activeId: null, pos: { x: 0, y: 0 } } });
    } else {
      set({
        contextMenu: {
          activeId: id,
          pos: { x: e.clientX - 110, y: e.clientY },
        },
      });
    }
  },
}));

export default useDriveStore;
