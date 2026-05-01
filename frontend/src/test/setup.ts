import '@testing-library/jest-dom';

// The test environment ships a broken localStorage (missing clear/removeItem).
// Replace it with a Map-backed implementation that works correctly.
const store = new Map<string, string>();
const localStorageMock: Storage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
  get length() { return store.size; },
  key: (index) => [...store.keys()][index] ?? null,
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
