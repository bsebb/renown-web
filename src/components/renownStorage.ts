import { EquippedSlot } from "./RenownBelt";

export const STORAGE_KEY_BUILD_SLOTS = "renown_build_decks_v2";
export const STORAGE_KEY_ACTIVE_DECK = "renown_active_deck_v2";
export const STORAGE_KEY_OWNED = "renown_owned_marks_v2";
export const STORAGE_KEY_MARK_RANKS = "renown_mark_ranks_v2";

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined" || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Gracefully handle private browsing or quota limits
  }
}

export function getDefaultBuildSlots(): Record<number, (EquippedSlot | null)[]> {
  const defaultDeck1: (EquippedSlot | null)[] = new Array(10).fill(null);
  defaultDeck1[0] = { markId: 13, rank: 2 }; // Monster Hunter (Cost 2)
  defaultDeck1[1] = { markId: 22, rank: 2 }; // Suit Up (Cost 2)
  defaultDeck1[2] = { markId: 4, rank: 1 };  // Crafting a New Look (Cost 1)
  defaultDeck1[3] = { markId: 5, rank: 1 };  // Caves & Cliffs (Cost 1)
  defaultDeck1[4] = { markId: 43, rank: 1 }; // Cover Me in Debris (Keystone, Cost 3)

  return {
    1: defaultDeck1,
    2: new Array(10).fill(null),
    3: new Array(10).fill(null)
  };
}

export function getSanitizedBuildSlots(): Record<number, (EquippedSlot | null)[]> {
  const fallback = getDefaultBuildSlots();
  const stored = loadFromStorage<Record<number, (EquippedSlot | null)[]>>(STORAGE_KEY_BUILD_SLOTS, fallback);

  if (stored && typeof stored === "object") {
    const sanitized: Record<number, (EquippedSlot | null)[]> = {};
    [1, 2, 3].forEach((slot) => {
      if (Array.isArray(stored[slot]) && stored[slot].length === 10) {
        sanitized[slot] = stored[slot];
      } else {
        sanitized[slot] = slot === 1 ? fallback[1] : new Array(10).fill(null);
      }
    });
    return sanitized;
  }
  return fallback;
}

export function getDefaultOwnedMarks(): Record<number, number> {
  const initial: Record<number, number> = {};
  for (let i = 1; i <= 24; i++) initial[i] = i % 3 === 0 ? 2 : 1;
  initial[43] = 1;
  initial[36] = 2;
  return initial;
}
