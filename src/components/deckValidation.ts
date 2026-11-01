import { ALL_MARKS, MarkItem } from "../data/renownData";

export interface EquippedSlot {
  markId: number;
  rank: number;
}

export const BELT_TOTAL_SLOTS = 9;         // 4 Passive + 1 Center Keystone Anchor + 4 Passive
export const KEYSTONE_SLOT_INDEX = 4;      // True mathematical center (Slot 5 of 9)
export const PASSIVE_OFFENSE_CAP = 4;      // Max 4 Passive Offense Notches
export const UNANCHORED_PURIST_BONUS = 1;  // +1 Passive Notch when Center Keystone Slot 5 is empty

export type BeltCapacityTier = 6 | 7 | 8;

export interface DeckPreset {
  id: string;
  name: string;
  subtitle: string;
  capacity: BeltCapacityTier;
  slots: (EquippedSlot | null)[];
}

export const DECK_PRESETS: DeckPreset[] = [
  {
    id: "skyhammer_mace",
    name: "Skyhammer Mace",
    subtitle: "Over-Overkill (0N) + Wind Launch aerial burst",
    capacity: 8,
    slots: [
      { markId: 24, rank: 2 }, // Who Needs Rockets? (2N Mobility)
      { markId: 5, rank: 2 },  // Caves & Cliffs (1N Mobility)
      { markId: 3, rank: 2 },  // We Need to Go Deeper (1N Offense)
      { markId: 18, rank: 2 }, // A Terrible Fortress (2N Offense)
      { markId: 47, rank: 2 }, // Over-Overkill (0N Keystone)
      { markId: 16, rank: 2 }, // Return to Sender (2N Active Defense)
      null,
      null,
      null
    ]
  },
  {
    id: "phantom_striker",
    name: "Phantom Striker",
    subtitle: "Bullseye (0N) grounded reach + Sculk Veil",
    capacity: 8,
    slots: [
      { markId: 22, rank: 2 }, // Sneak 100 (2N Mobility)
      { markId: 11, rank: 2 }, // Light as a Rabbit (1N Mobility)
      { markId: 18, rank: 2 }, // A Terrible Fortress (2N Offense)
      { markId: 2, rank: 2 },  // Hot Stuff (1N Offense)
      { markId: 52, rank: 2 }, // Bullseye (0N Keystone)
      { markId: 14, rank: 2 }, // Cover Me with Diamonds (2N Defense)
      null,
      null,
      null
    ]
  },
  {
    id: "alchemist_warlord",
    name: "Alchemist Warlord",
    subtitle: "Furious Cocktail (0N) + Cinder Fireball",
    capacity: 8,
    slots: [
      { markId: 44, rank: 3 }, // Uneasy Alliance (4N -> 3N Active Offense)
      { markId: 2, rank: 2 },  // Hot Stuff (1N Offense)
      { markId: 19, rank: 2 }, // Into Fire (2N Mobility)
      { markId: 14, rank: 2 }, // Cover Me with Diamonds (2N Defense)
      { markId: 54, rank: 2 }, // A Furious Cocktail (0N Keystone)
      null,
      null,
      null,
      null
    ]
  },
  {
    id: "immortal_fortress",
    name: "Immortal Fortress",
    subtitle: "Cover Me in Debris (0N) + 12-Heart bastion",
    capacity: 8,
    slots: [
      { markId: 14, rank: 3 }, // Cover Me with Diamonds (2N Defense)
      { markId: 39, rank: 3 }, // Postmortal (3N -> 2N Defense)
      { markId: 21, rank: 2 }, // Surge Protector (2N Defense)
      { markId: 16, rank: 2 }, // Return to Sender (2N Active Defense)
      { markId: 45, rank: 2 }, // Cover Me in Debris (0N Keystone)
      null,
      null,
      null,
      null
    ]
  },
  {
    id: "unanchored_purist",
    name: "Unanchored Purist (9N)",
    subtitle: "Empty Keystone Anchor grants +1 Bonus Passive Notch",
    capacity: 8,
    slots: [
      { markId: 46, rank: 3 }, // Hot Tourist Destinations (4N -> 3N Mobility)
      { markId: 14, rank: 2 }, // Cover Me with Diamonds (2N Defense)
      { markId: 18, rank: 2 }, // A Terrible Fortress (2N Offense)
      { markId: 3, rank: 2 },  // We Need to Go Deeper (1N Offense)
      null,                    // Empty Slot 5 -> +1N Purist Bonus!
      { markId: 6, rank: 2 },  // Total Beelocation (1N Utility)
      null,
      null,
      null
    ]
  },
  {
    id: "star_trader_baron",
    name: "Star Trader Syndicate",
    subtitle: "Star Trader (0N) + max ore & emerald economy",
    capacity: 6,
    slots: [
      { markId: 13, rank: 2 }, // Diamonds! (2N Utility)
      { markId: 15, rank: 2 }, // Enchanter (2N Utility)
      { markId: 1, rank: 2 },  // Acquire Hardware (1N Utility)
      { markId: 8, rank: 2 },  // Smells Interesting (1N Utility)
      { markId: 30, rank: 2 }, // Star Trader (0N Keystone)
      null,
      null,
      null,
      null
    ]
  }
];

export function getEffectiveCost(mark: MarkItem, rank: number): number {
  if (mark.keystone) return 0;
  if (mark.cost >= 3 && rank === 3) return mark.cost - 1;
  return mark.cost;
}

export interface BeltTotals {
  totalNotches: number;
  effectiveBeltCapacity: number;
  remainingNotches: number;
  offenseNotches: number;
  remainingOffenseNotches: number;
  equippedKeystone?: EquippedSlot;
  equippedActive?: EquippedSlot;
  itemsCount: number;
}

export function calculateBeltTotals(
  currentBelt: (EquippedSlot | null)[],
  beltCapacity: BeltCapacityTier = 8
): BeltTotals {
  const items = currentBelt.filter((s): s is EquippedSlot => s !== null);

  const totalNotches = items.reduce((sum, item) => {
    const m = ALL_MARKS.find((x) => x.id === item.markId);
    return sum + (m && !m.keystone ? getEffectiveCost(m, item.rank) : 0);
  }, 0);

  const offenseNotches = items.reduce((sum, item) => {
    const m = ALL_MARKS.find((x) => x.id === item.markId);
    return sum + (m && !m.keystone && m.domain === "Offense" ? getEffectiveCost(m, item.rank) : 0);
  }, 0);

  const equippedKeystone = items.find((item) => {
    const m = ALL_MARKS.find((x) => x.id === item.markId);
    return m?.keystone === true;
  });

  const equippedActive = items.find((item) => {
    const m = ALL_MARKS.find((x) => x.id === item.markId);
    return m?.active === true;
  });

  const effectiveBeltCapacity =
    beltCapacity + (equippedKeystone ? 0 : UNANCHORED_PURIST_BONUS);

  return {
    totalNotches,
    effectiveBeltCapacity,
    remainingNotches: Math.max(0, effectiveBeltCapacity - totalNotches),
    offenseNotches,
    remainingOffenseNotches: Math.max(0, PASSIVE_OFFENSE_CAP - offenseNotches),
    equippedKeystone,
    equippedActive,
    itemsCount: items.length
  };
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  actionLabel: string;
  actionType: "equip" | "unequip" | "replace_keystone" | "replace_active" | "disabled";
}

export function checkMarkEligibility(
  currentBelt: (EquippedSlot | null)[],
  mark: MarkItem,
  rank: number,
  targetSlotIdx?: number,
  viewMode: "all" | "owned" = "all",
  ownedMarks: Record<number, number> = {},
  beltCapacity: BeltCapacityTier = 8
): EligibilityResult {
  const equippedIdx = currentBelt.findIndex((s) => s?.markId === mark.id);
  if (equippedIdx !== -1) {
    return {
      eligible: true,
      actionLabel: "Remove",
      actionType: "unequip"
    };
  }

  if (viewMode === "owned" && !ownedMarks[mark.id]) {
    return {
      eligible: false,
      reason: `Locked in Collection (${mark.advancement})`,
      actionLabel: "Locked",
      actionType: "disabled"
    };
  }

  const cost = getEffectiveCost(mark, rank);
  const currentTotals = calculateBeltTotals(currentBelt, beltCapacity);

  const replacedItem =
    targetSlotIdx !== undefined && currentBelt[targetSlotIdx] ? currentBelt[targetSlotIdx] : null;
  const replacedMark = replacedItem ? ALL_MARKS.find((x) => x.id === replacedItem.markId) : null;
  const replacedCost =
    replacedItem && replacedMark && !replacedMark.keystone
      ? getEffectiveCost(replacedMark, replacedItem.rank)
      : 0;
  const replacedOffenseCost =
    replacedItem && replacedMark && !replacedMark.keystone && replacedMark.domain === "Offense"
      ? replacedCost
      : 0;

  const netRemainingNotches = currentTotals.remainingNotches + replacedCost;
  const netRemainingOffense = currentTotals.remainingOffenseNotches + replacedOffenseCost;

  if (targetSlotIdx === KEYSTONE_SLOT_INDEX && !mark.keystone) {
    return {
      eligible: false,
      reason: "Center Slot 5 only accepts Zero-Notch Keystones.",
      actionLabel: "Keystone Only",
      actionType: "disabled"
    };
  }

  if (targetSlotIdx !== undefined && targetSlotIdx !== KEYSTONE_SLOT_INDEX && mark.keystone) {
    return {
      eligible: false,
      reason: "Keystones socket exclusively into Center Slot 5.",
      actionLabel: "Center Slot Only",
      actionType: "disabled"
    };
  }

  if (mark.keystone) {
    if (!currentTotals.equippedKeystone && currentTotals.totalNotches > beltCapacity) {
      return {
        eligible: false,
        reason: `Unanchored Purist active (${currentTotals.totalNotches}/${currentTotals.effectiveBeltCapacity}N). Free 1 Passive Notch to socket a Keystone.`,
        actionLabel: "Free 1N First",
        actionType: "disabled"
      };
    }
    if (currentTotals.equippedKeystone && targetSlotIdx !== KEYSTONE_SLOT_INDEX) {
      return {
        eligible: true,
        reason: "Replaces your current Center Keystone.",
        actionLabel: "Swap Keystone",
        actionType: "replace_keystone"
      };
    }
    return {
      eligible: true,
      actionLabel: "Use (0N)",
      actionType: "equip"
    };
  }

  if (mark.active && currentTotals.equippedActive) {
    const activeSlotIdx = currentBelt.findIndex((s) => {
      const m = s ? ALL_MARKS.find((x) => x.id === s.markId) : null;
      return m?.active === true;
    });
    if (activeSlotIdx !== targetSlotIdx) {
      const existingActive = activeSlotIdx >= 0 ? currentBelt[activeSlotIdx] : null;
      const existingMark = existingActive ? ALL_MARKS.find((x) => x.id === existingActive.markId) : null;
      const freed = existingActive && existingMark ? getEffectiveCost(existingMark, existingActive.rank) : 0;
      const freedOffense =
        existingActive && existingMark && existingMark.domain === "Offense" ? freed : 0;
      if (cost > netRemainingNotches + freed) {
        return {
          eligible: false,
          reason: `Requires ${cost} Notches, exceeding your ${currentTotals.effectiveBeltCapacity}-Notch belt capacity.`,
          actionLabel: `Needs ${cost}N`,
          actionType: "disabled"
        };
      }
      if (mark.domain === "Offense" && cost > netRemainingOffense + freedOffense) {
        return {
          eligible: false,
          reason: `Exceeds ${PASSIVE_OFFENSE_CAP}-Notch Offense cap.`,
          actionLabel: "Offense Cap",
          actionType: "disabled"
        };
      }
      return {
        eligible: true,
        reason: "Replaces your equipped Shift+F Active ability.",
        actionLabel: "Swap Active",
        actionType: "replace_active"
      };
    }
  }

  if (cost > netRemainingNotches) {
    return {
      eligible: false,
      reason: `Needs ${cost}N (${netRemainingNotches}N free of ${currentTotals.effectiveBeltCapacity}N).`,
      actionLabel: `Needs ${cost}N`,
      actionType: "disabled"
    };
  }

  if (mark.domain === "Offense" && cost > netRemainingOffense) {
    return {
      eligible: false,
      reason: `Exceeds ${PASSIVE_OFFENSE_CAP}N Passive Offense cap (${currentTotals.offenseNotches}/${PASSIVE_OFFENSE_CAP}N).`,
      actionLabel: "Offense Cap",
      actionType: "disabled"
    };
  }

  const hasEmptyPassive = currentBelt.some((s, idx) => s === null && idx !== KEYSTONE_SLOT_INDEX);
  if (targetSlotIdx === undefined && !hasEmptyPassive) {
    return {
      eligible: false,
      reason: "All 8 passive sockets are occupied. Tap Swap to replace a card.",
      actionLabel: "Belt Full",
      actionType: "disabled"
    };
  }

  return {
    eligible: true,
    actionLabel: "Use",
    actionType: "equip"
  };
}

/**
 * Computes valid belt slot indices that can be tapped in Clash Royale Swap Mode
 * to atomically replace an existing card with (mark, rank).
 */
export function findValidSwapSlots(
  currentBelt: (EquippedSlot | null)[],
  mark: MarkItem,
  rank: number,
  viewMode: "all" | "owned" = "all",
  ownedMarks: Record<number, number> = {},
  beltCapacity: BeltCapacityTier = 8
): number[] {
  if (viewMode === "owned" && !ownedMarks[mark.id]) return [];

  // Special case: socketing a 0N Keystone while at full Purist (+1N) capacity.
  // Any occupied passive slot whose removal drops totalNotches <= beltCapacity is a valid 1-tap swap!
  if (mark.keystone) {
    const totals = calculateBeltTotals(currentBelt, beltCapacity);
    if (!totals.equippedKeystone && totals.totalNotches > beltCapacity) {
      const valid: number[] = [];
      currentBelt.forEach((slot, idx) => {
        if (idx === KEYSTONE_SLOT_INDEX || !slot) return;
        const m = ALL_MARKS.find((x) => x.id === slot.markId);
        const freed = m ? getEffectiveCost(m, slot.rank) : 0;
        if (totals.totalNotches - freed <= beltCapacity) {
          valid.push(idx);
        }
      });
      return valid;
    }
    return [KEYSTONE_SLOT_INDEX];
  }

  const valid: number[] = [];
  for (let idx = 0; idx < BELT_TOTAL_SLOTS; idx++) {
    if (idx === KEYSTONE_SLOT_INDEX) continue;
    if (!currentBelt[idx]) continue;

    const tentative = [...currentBelt];
    tentative[idx] = null;
    if (mark.active) {
      const existingActiveIdx = tentative.findIndex((s) => {
        const m = s ? ALL_MARKS.find((x) => x.id === s.markId) : null;
        return m?.active === true;
      });
      if (existingActiveIdx !== -1) tentative[existingActiveIdx] = null;
    }

    const res = checkMarkEligibility(
      tentative,
      mark,
      rank,
      idx,
      viewMode,
      ownedMarks,
      beltCapacity
    );
    if (res.eligible) {
      valid.push(idx);
    }
  }
  return valid;
}
