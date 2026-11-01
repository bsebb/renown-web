import { ALL_MARKS, MarkItem } from "../data/renownData";
import { EquippedSlot } from "./RenownBelt";

export const KEYSTONE_SLOT_INDEX = 4; // Slot 5 (0-indexed 4)

export function getEffectiveCost(mark: MarkItem, rank: number): number {
  if (mark.cost > 1 && rank === 3) {
    return mark.cost - 1; // Mastery discount
  }
  return mark.cost;
}

export interface BeltTotals {
  totalNotches: number;
  remainingNotches: number;
  offenseNotches: number;
  remainingOffenseNotches: number;
  equippedKeystone?: EquippedSlot;
  equippedActive?: EquippedSlot;
  itemsCount: number;
}

export function calculateBeltTotals(currentBelt: (EquippedSlot | null)[]): BeltTotals {
  const items = currentBelt.filter((s): s is EquippedSlot => s !== null);

  const totalNotches = items.reduce((sum, item) => {
    const m = ALL_MARKS.find((x) => x.id === item.markId);
    return sum + (m ? getEffectiveCost(m, item.rank) : 0);
  }, 0);

  const offenseNotches = items.reduce((sum, item) => {
    const m = ALL_MARKS.find((x) => x.id === item.markId);
    return sum + (m && m.domain === "Offense" ? getEffectiveCost(m, item.rank) : 0);
  }, 0);

  const equippedKeystone = items.find((item) => {
    const m = ALL_MARKS.find((x) => x.id === item.markId);
    return m?.keystone === true;
  });

  const equippedActive = items.find((item) => {
    const m = ALL_MARKS.find((x) => x.id === item.markId);
    return m?.active === true;
  });

  return {
    totalNotches,
    remainingNotches: Math.max(0, 10 - totalNotches),
    offenseNotches,
    remainingOffenseNotches: Math.max(0, 6 - offenseNotches),
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
  ownedMarks: Record<number, number> = {}
): EligibilityResult {
  // 1. Is it currently equipped in belt?
  const equippedIdx = currentBelt.findIndex((s) => s?.markId === mark.id);
  if (equippedIdx !== -1) {
    return {
      eligible: true,
      actionLabel: `Unequip (Slot ${equippedIdx + 1})`,
      actionType: "unequip"
    };
  }

  // 2. Is it owned (if in owned mode)?
  if (viewMode === "owned" && !ownedMarks[mark.id]) {
    return {
      eligible: false,
      reason: `Locked in Collection (Advancement: ${mark.advancement})`,
      actionLabel: "Locked",
      actionType: "disabled"
    };
  }

  const cost = getEffectiveCost(mark, rank);
  const currentTotals = calculateBeltTotals(currentBelt);

  // If replacing a specific slot, subtract that slot's cost
  const replacedItem =
    targetSlotIdx !== undefined && currentBelt[targetSlotIdx] ? currentBelt[targetSlotIdx] : null;
  const replacedMark = replacedItem ? ALL_MARKS.find((x) => x.id === replacedItem.markId) : null;
  const replacedCost = replacedItem && replacedMark ? getEffectiveCost(replacedMark, replacedItem.rank) : 0;
  const replacedOffenseCost =
    replacedItem && replacedMark && replacedMark.domain === "Offense" ? replacedCost : 0;

  const netRemainingNotches = currentTotals.remainingNotches + replacedCost;
  const netRemainingOffense = currentTotals.remainingOffenseNotches + replacedOffenseCost;

  // 3. Slot Role Constraints
  if (targetSlotIdx === KEYSTONE_SLOT_INDEX && !mark.keystone) {
    return {
      eligible: false,
      reason: "Slot 5 is the Keystone Anchor. Only Keystone marks can be socketed here.",
      actionLabel: "Keystones Only",
      actionType: "disabled"
    };
  }

  if (targetSlotIdx !== undefined && targetSlotIdx !== KEYSTONE_SLOT_INDEX && mark.keystone) {
    return {
      eligible: false,
      reason: "Keystones must be equipped in the Keystone Anchor (Slot 5).",
      actionLabel: "Keystone Anchor Only",
      actionType: "disabled"
    };
  }

  // 4. Keystone uniqueness check
  if (mark.keystone) {
    if (currentTotals.equippedKeystone && targetSlotIdx !== KEYSTONE_SLOT_INDEX) {
      return {
        eligible: true,
        reason: "Socketing this Keystone will replace your current Keystone.",
        actionLabel: "Replace Keystone",
        actionType: "replace_keystone"
      };
    }
  }

  // 5. Active Ability uniqueness check
  if (mark.active && currentTotals.equippedActive) {
    const activeSlotIdx = currentBelt.findIndex((s) => {
      const m = s ? ALL_MARKS.find((x) => x.id === s.markId) : null;
      return m?.active === true;
    });
    if (activeSlotIdx !== targetSlotIdx) {
      return {
        eligible: true,
        reason: "Equipping this will replace your active Shift+F ability.",
        actionLabel: "Replace Active",
        actionType: "replace_active"
      };
    }
  }

  // 6. Capacity check
  if (cost > netRemainingNotches) {
    return {
      eligible: false,
      reason: `Requires ${cost} Notches, but only ${netRemainingNotches} remain!`,
      actionLabel: `Needs ${cost}N (${netRemainingNotches}N left)`,
      actionType: "disabled"
    };
  }

  // 7. Offense domain cap check
  if (mark.domain === "Offense" && cost > netRemainingOffense) {
    return {
      eligible: false,
      reason: `Exceeds 6-Notch Offense limit (${currentTotals.offenseNotches - replacedOffenseCost + cost}/6)!`,
      actionLabel: "Offense Cap (6/6N)",
      actionType: "disabled"
    };
  }

  // 8. If no empty slots left (when targetSlotIdx not specified)
  if (targetSlotIdx === undefined && currentBelt.every((s) => s !== null)) {
    return {
      eligible: false,
      reason: "All 10 belt sockets are occupied! Unequip a mark first.",
      actionLabel: "Belt Full",
      actionType: "disabled"
    };
  }

  return {
    eligible: true,
    actionLabel: mark.keystone ? "Socket Keystone" : "Equip",
    actionType: "equip"
  };
}
