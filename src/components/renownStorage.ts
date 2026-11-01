import { ALL_MARKS } from "../data/renownData";
import { EquippedSlot } from "./RenownBelt";
import { BELT_TOTAL_SLOTS, BeltCapacityTier, KEYSTONE_SLOT_INDEX } from "./deckValidation";

export const STORAGE_KEY_BUILD_SLOTS = "renown_build_decks_v3";
export const STORAGE_KEY_ACTIVE_DECK = "renown_active_deck_v3";
export const STORAGE_KEY_OWNED = "renown_owned_marks_v3";
export const STORAGE_KEY_MARK_RANKS = "renown_mark_ranks_v3";
export const STORAGE_KEY_BELT_CAPACITY = "renown_belt_capacity_v3";

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
  // Default Deck 1: Symmetrical 9-Slot Belt (6N Day-1 legal starter + 0N Keystone in Center Slot 5)
  const defaultDeck1: (EquippedSlot | null)[] = new Array(BELT_TOTAL_SLOTS).fill(null);
  defaultDeck1[0] = { markId: 14, rank: 2 }; // Cover Me with Diamonds (2N Defense)
  defaultDeck1[1] = { markId: 16, rank: 1 }; // Return to Sender (2N Defense Active)
  defaultDeck1[2] = { markId: 3, rank: 2 };  // We Need to Go Deeper (1N Offense)
  defaultDeck1[3] = { markId: 11, rank: 1 }; // Light as a Rabbit (1N Mobility)
  defaultDeck1[4] = { markId: 45, rank: 1 }; // Cover Me in Debris (0N Center Keystone)

  return {
    1: defaultDeck1,
    2: new Array(BELT_TOTAL_SLOTS).fill(null),
    3: new Array(BELT_TOTAL_SLOTS).fill(null)
  };
}

export function getSanitizedBuildSlots(): Record<number, (EquippedSlot | null)[]> {
  const fallback = getDefaultBuildSlots();
  const stored = loadFromStorage<Record<number, (EquippedSlot | null)[]>>(STORAGE_KEY_BUILD_SLOTS, fallback);

  if (stored && typeof stored === "object") {
    const sanitized: Record<number, (EquippedSlot | null)[]> = {};
    [1, 2, 3].forEach((slot) => {
      if (Array.isArray(stored[slot]) && stored[slot].length === BELT_TOTAL_SLOTS) {
        sanitized[slot] = stored[slot].map((item, idx) => {
          if (!item) return null;
          const m = ALL_MARKS.find((x) => x.id === item.markId);
          if (!m) return null;
          if (idx === KEYSTONE_SLOT_INDEX && !m.keystone) return null;
          if (idx !== KEYSTONE_SLOT_INDEX && m.keystone) return null;
          return item;
        });
      } else {
        sanitized[slot] = slot === 1 ? fallback[1] : new Array(BELT_TOTAL_SLOTS).fill(null);
      }
    });
    return sanitized;
  }
  return fallback;
}

export function getSanitizedBeltCapacity(): BeltCapacityTier {
  const raw = loadFromStorage<number>(STORAGE_KEY_BELT_CAPACITY, 8);
  if (raw === 6 || raw === 7 || raw === 8) return raw;
  return 8;
}

export function getDefaultOwnedMarks(): Record<number, number> {
  const initial: Record<number, number> = {};
  for (let i = 1; i <= 24; i++) initial[i] = i % 3 === 0 ? 2 : 1;
  initial[45] = 1;
  initial[52] = 1;
  initial[39] = 2;
  return initial;
}
