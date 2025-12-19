import { writable } from 'svelte/store';

export interface AuthState {
  isAuthenticated: boolean;
  username?: string;
  loginTime?: Date;
  sessionExpiry?: Date;
}

function createAuthStore() {
  const { subscribe, set } = writable<AuthState>({
    isAuthenticated: false,
  });

  return {
    subscribe,

    login: (username: string = 'Administrator') => {
      set({
        isAuthenticated: true,
        username,
        loginTime: new Date(),
        sessionExpiry: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 Stunden
      });
    },

    logout: () => {
      set({
        isAuthenticated: false,
      });
    },

    reset: () => {
      set({
        isAuthenticated: false,
      });
    },
  };
}

export const authStore = createAuthStore();
