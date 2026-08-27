import { Preferences } from '@capacitor/preferences';

/**
 * Wrapper fino sobre o Preferences do Capacitor.
 *
 * Usamos ele tambem na web (onde cai em localStorage) para ter uma API unica.
 * Nao gravamos em localStorage direto porque no Android o sistema pode limpar
 * o storage do WebView; o Preferences grava em SharedPreferences/UserDefaults.
 */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      // Dado corrompido nao pode derrubar o boot do app.
      return null;
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    await Preferences.set({ key, value: JSON.stringify(value) });
  },

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  },
};
