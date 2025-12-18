/**
 * Theme store for Dark Mode support
 */

import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeState {
  theme: Theme;
  isDark: boolean;
}

function createThemeStore() {
  // Check system preference
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const storedTheme = (typeof localStorage !== 'undefined'
    ? localStorage.getItem('theme')
    : null) as Theme | null;

  const initialTheme = (storedTheme || 'auto') as Theme;
  const initialIsDark = initialTheme === 'dark' || (initialTheme === 'auto' && prefersDark);

  const { subscribe, set, update } = writable<ThemeState>({
    theme: initialTheme,
    isDark: initialIsDark,
  });

  // Listen to system theme changes
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      update((state) => {
        if (state.theme === 'auto') {
          return {
            ...state,
            isDark: e.matches,
          };
        }
        return state;
      });
    });
  }

  return {
    subscribe,

    setTheme: (theme: Theme) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', theme);
      }

      const isDark =
        theme === 'dark' ||
        (theme === 'auto' &&
          (typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches));

      set({ theme, isDark });

      // Update document class
      if (typeof document !== 'undefined') {
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },

    toggleTheme: () => {
      update((state) => {
        const themes: Theme[] = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(state.theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        return { ...state, theme: nextTheme };
      });
    },
  };
}

export const themeStore = createThemeStore();
