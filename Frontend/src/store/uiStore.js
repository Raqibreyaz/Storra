import { create } from "zustand";

const useUIStore = create((set, get) => ({
  toasts: [],
  confirmDialog: null,

  toast: {
    success: (message, duration = 3000) => get().addToast(message, "success", duration),
    error: (message, duration = 4000) => get().addToast(message, "error", duration),
    info: (message, duration = 3000) => get().addToast(message, "info", duration),
  },

  addToast: (message, type, duration) => {
    const id = Date.now().toString() + Math.random().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  confirm: (options) => {
    // options: { title, message, onConfirm, onCancel?, confirmText?, cancelText?, isDestructive? }
    set({ confirmDialog: options });
  },

  closeConfirm: () => {
    set({ confirmDialog: null });
  },
}));

// Export shortcut functions for easier importing
export const toast = useUIStore.getState().toast;
export const confirmDialog = useUIStore.getState().confirm;

export default useUIStore;
