import { ALL_MARKS, MarkItem } from "../data/renownData";
import { EquippedSlot } from "./RenownBelt";

export const BELT_TOTAL_SLOTS = 9;     // 4 Passive + 1 Center Keystone Anchor + 4 Passive
export const KEYSTONE_SLOT_INDEX = 4;  // True mathematical center (Slot 5 of 9)
export const PASSIVE_OFFENSE_CAP = 4;  // Max 4 Passive Offense Notches
export const UNANCHORED_PURIST_BONUS = 1; // +1 Passive Notch when Center Keystone Slot 5 is empty

export type BeltCapacityTier = 6 | 7 | 8;

export function getEffectiveCost(mark: MarkItem, rank: number): number {
  if (mark.keystone) {
    return 0;
  }
  if (mark.cost >= 3 && rank === 3) {
    return mark.cost - 1; // Tier III+ Mastery discount (-1N)
  }
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
      actionLabel: `Unequip (Slot ${equippedIdx + 1})`,
      actionType: "unequip"
    };
  }

  if (viewMode === "owned" && !ownedMarks[mark.id]) {
    return {
      eligible: false,
      reason: `Locked in Collection (Advancement: ${mark.advancement})`,
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

  // 1. Slot Role Constraints
  if (targetSlotIdx === KEYSTONE_SLOT_INDEX && !mark.keystone) {
    return {
      eligible: false,
      reason: "Center Slot 5 is the Zero-Notch Keystone Anchor. Only Keystone marks can be socketed here.",
      actionLabel: "Keystones Only",
      actionType: "disabled"
    };
  }

  if (targetSlotIdx !== undefined && targetSlotIdx !== KEYSTONE_SLOT_INDEX && mark.keystone) {
    return {
      eligible: false,
      reason: "Keystones must be socketed in the Center Keystone Anchor (Slot 5).",
      actionLabel: "Anchor Slot Only",
      actionType: "disabled"
    };
  }

  // 2. Keystone uniqueness & Unanchored Purist revalidation check
  if (mark.keystone) {
    if (!currentTotals.equippedKeystone && currentTotals.totalNotches > beltCapacity) {
      return {
        eligible: false,
        reason: `Unanchored Purist active (${currentTotals.totalNotches}/${currentTotals.effectiveBeltCapacity}N used). Free 1 Passive Notch before socketing a Keystone.`,
        actionLabel: "Free 1N First",
        actionType: "disabled"
      };
    }
    if (currentTotals.equippedKeystone && targetSlotIdx !== KEYSTONE_SLOT_INDEX) {
      return {
        eligible: true,
        reason: "Socketing this Keystone will replace your current Center Keystone.",
        actionLabel: "Replace Keystone",
        actionType: "replace_keystone"
      };
    }
    return {
      eligible: true,
      actionLabel: "Socket Keystone (0N)",
      actionType: "equip"
    };
  }

  // 3. Active Ability uniqueness check
  if (mark.active && currentTotals.equippedActive) {
    const activeSlotIdx = currentBelt.findIndex((s) => {
      const m = s ? ALL_MARKS.find((x) => x.id === s.markId) : null;
      return m?.active === true;
    });
    if (activeSlotIdx !== targetSlotIdx) {
      if (cost > netRemainingNotches) {
        // Check if replacing the existing active frees enough notches
        const existingActive = activeSlotIdx >= 0 ? currentBelt[activeSlotIdx] : null;
        const existingMark = existingActive ? ALL_MARKS.find((x) => x.id === existingActive.markId) : null;
        const freed = existingActive && existingMark ? getEffectiveCost(existingMark, existingActive.rank) : 0;
        if (cost > netRemainingNotches + freed) {
          return {
            eligible: false,
            reason: `Requires ${cost} Notches, exceeding your ${currentTotals.effectiveBeltCapacity}-Notch belt capacity!`,
            actionLabel: `Needs ${cost}N`,
            actionType: "disabled"
          };
        }
      }
      return {
        eligible: true,
        reason: "Equipping this will replace your active Shift+F ability.",
        actionLabel: "Replace Active",
        actionType: "replace_active"
      };
    }
  }

  // 4. Passive Capacity check (6N / 7N / 8N + +1N Unanchored Purist when Slot 5 empty)
  if (cost > netRemainingNotches) {
    return {
      eligible: false,
      reason: `Requires ${cost} Notches, but only ${netRemainingNotches} of ${currentTotals.effectiveBeltCapacity} Notches remain!`,
      actionLabel: `Needs ${cost}N (${netRemainingNotches}N left)`,
      actionType: "disabled"
    };
  }

  // 5. Passive Offense domain cap check (4N)
  if (mark.domain === "Offense" && cost > netRemainingOffense) {
    return {
      eligible: false,
      reason: `Exceeds ${PASSIVE_OFFENSE_CAP}-Notch Passive Offense limit (${
        currentTotals.offenseNotches - replacedOffenseCost + cost
      }/${PASSIVE_OFFENSE_CAP})!`,
      actionLabel: `Offense Cap (${PASSIVE_OFFENSE_CAP}/${PASSIVE_OFFENSE_CAP}N)`,
      actionType: "disabled"
    };
  }

  // 6. Empty passive socket check
  const hasEmptyPassive = currentBelt.some((s, idx) => s === null && idx !== KEYSTONE_SLOT_INDEX);
  if (targetSlotIdx === undefined && !hasEmptyPassive) {
    return {
      eligible: false,
      reason: "All 8 passive belt sockets are occupied! Unequip a passive mark first.",
      actionLabel: "Passive Belt Full",
      actionType: "disabled"
    };
  }

  return {
    eligible: true,
    actionLabel: "Equip",
    actionType: "equip"
  };
}
