import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // milliseconds, 0 = no auto-dismiss
}

interface ToastState {
  toasts: Toast[];
}

function createToastStore() {
  const { subscribe, set, update } = writable<ToastState>({
    toasts: [],
  });

  let id = 0;

  return {
    subscribe,

    show: (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
      const toastId = `toast-${++id}`;

      update((state) => ({
        ...state,
        toasts: [
          ...state.toasts,
          {
            id: toastId,
            message,
            type,
            duration,
          },
        ],
      }));

      // Auto-dismiss if duration is set
      if (duration > 0) {
        setTimeout(() => {
          update((state) => ({
            ...state,
            toasts: state.toasts.filter((t) => t.id !== toastId),
          }));
        }, duration);
      }

      return toastId;
    },

    success: (message: string, duration = 3000) => {
      return createToastStore().show(message, 'success', duration);
    },

    error: (message: string, duration = 5000) => {
      return createToastStore().show(message, 'error', duration);
    },

    warning: (message: string, duration = 4000) => {
      return createToastStore().show(message, 'warning', duration);
    },

    info: (message: string, duration = 3000) => {
      return createToastStore().show(message, 'info', duration);
    },

    dismiss: (id: string) => {
      update((state) => ({
        ...state,
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },

    clear: () => {
      set({ toasts: [] });
    },
  };
}

export const toastStore = createToastStore();
