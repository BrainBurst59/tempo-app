import * as SecureStore from 'expo-secure-store';

/**
 * Clerk token cache backed by the platform secure enclave (iOS Keychain /
 * Android Keystore) via expo-secure-store.
 *
 * Session tokens are Sensitive data and must NEVER be stored in AsyncStorage,
 * unencrypted files, logs, or analytics (CLAUDE.md §13). This is the only place
 * the app persists Clerk tokens.
 */
export interface TokenCache {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken: (key: string) => Promise<void>;
}

export const secureStoreTokenCache: TokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      // A corrupt/undecryptable item should not wedge auth — clear it so the
      // user can re-authenticate cleanly.
      await SecureStore.deleteItemAsync(key).catch(() => undefined);
      return null;
    }
  },
  async saveToken(key, token) {
    await SecureStore.setItemAsync(key, token);
  },
  async clearToken(key) {
    await SecureStore.deleteItemAsync(key);
  },
};
