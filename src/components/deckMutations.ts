import { ALL_MARKS, MarkItem } from "../data/renownData";
import {
  BELT_TOTAL_SLOTS,
  KEYSTONE_SLOT_INDEX,
  BeltCapacityTier,
  EquippedSlot,
  calculateBeltTotals,
  checkMarkEligibility,
  findValidSwapSlots
} from "./deckValidation";
import { ActivePointerDrag } from "./usePointerDeckDrag";

export interface BeltMutationOutcome {
  ok: boolean;
  nextBelt?: (EquippedSlot | null)[];
  pulsedSlot?: number;
  sound?: "equip" | "success" | "error";
  toast?: string;
}

export function resolveEquipToBelt(
  currentBelt: (EquippedSlot | null)[],
  mark: MarkItem,
  rankToUse: number,
  targetSlotIdx: number | undefined,
  viewMode: "all" | "owned",
  ownedMarks: Record<number, number>,
  beltCapacity: BeltCapacityTier
): BeltMutationOutcome {
  const totals = calculateBeltTotals(currentBelt, beltCapacity);
  let destIdx = targetSlotIdx;

  if (mark.keystone) {
    destIdx = KEYSTONE_SLOT_INDEX;
  } else {
    if (destIdx === KEYSTONE_SLOT_INDEX) {
      return {
        ok: false,
        sound: "error",
        toast: "Center Slot 5 only accepts Zero-Notch Keystones."
      };
    }
    if (destIdx === undefined) {
      if (mark.active && totals.equippedActive) {
        const existingActiveIdx = currentBelt.findIndex((s) => {
          const m = s ? ALL_MARKS.find((x) => x.id === s.markId) : null;
          return m?.active === true;
        });
        if (existingActiveIdx !== -1) destIdx = existingActiveIdx;
      }
      if (destIdx === undefined) {
        destIdx = currentBelt.findIndex((s, i) => s === null && i !== KEYSTONE_SLOT_INDEX);
      }
    }
  }

  if (destIdx === -1 || destIdx === undefined || destIdx >= BELT_TOTAL_SLOTS) {
    return { ok: false };
  }

  const check = checkMarkEligibility(
    currentBelt,
    mark,
    rankToUse,
    destIdx,
    viewMode,
    ownedMarks,
    beltCapacity
  );
  if (!check.eligible && check.actionType === "disabled") {
    return {
      ok: false,
      sound: "error",
      toast: check.reason || "Cannot equip card."
    };
  }

  const tentative = [...currentBelt];
  if (mark.active) {
    const existingActiveIdx = tentative.findIndex((s) => {
      const m = s ? ALL_MARKS.find((x) => x.id === s.markId) : null;
      return m?.active === true;
    });
    if (existingActiveIdx !== -1 && existingActiveIdx !== destIdx) {
      tentative[existingActiveIdx] = null;
    }
  }

  const existingIdx = tentative.findIndex((s) => s?.markId === mark.id);
  if (existingIdx !== -1 && existingIdx !== destIdx) {
    tentative[existingIdx] = null;
  }

  tentative[destIdx] = { markId: mark.id, rank: rankToUse };
  return {
    ok: true,
    nextBelt: tentative,
    pulsedSlot: destIdx,
    sound: mark.keystone ? "success" : "equip"
  };
}

export function resolveSwapIntoBelt(
  currentBelt: (EquippedSlot | null)[],
  mark: MarkItem,
  rank: number,
  slotIdx: number
): BeltMutationOutcome {
  const tentative = [...currentBelt];

  if (mark.keystone) {
    if (slotIdx !== KEYSTONE_SLOT_INDEX) {
      tentative[slotIdx] = null;
    }
    tentative[KEYSTONE_SLOT_INDEX] = { markId: mark.id, rank };
    return {
      ok: true,
      nextBelt: tentative,
      pulsedSlot: KEYSTONE_SLOT_INDEX,
      sound: "success"
    };
  }

  if (mark.active) {
    const existingActiveIdx = tentative.findIndex((s) => {
      const m = s ? ALL_MARKS.find((x) => x.id === s.markId) : null;
      return m?.active === true;
    });
    if (existingActiveIdx !== -1) tentative[existingActiveIdx] = null;
  }

  tentative[slotIdx] = { markId: mark.id, rank };
  return {
    ok: true,
    nextBelt: tentative,
    pulsedSlot: slotIdx,
    sound: "equip"
  };
}

export function resolvePointerDropOnBelt(
  currentBelt: (EquippedSlot | null)[],
  drag: ActivePointerDrag,
  targetSlotIdx: number,
  viewMode: "all" | "owned",
  ownedMarks: Record<number, number>,
  beltCapacity: BeltCapacityTier
): BeltMutationOutcome {
  const mark = ALL_MARKS.find((m) => m.id === drag.markId);
  if (!mark) return { ok: false };

  if (drag.source === "library") {
    if (mark.keystone && targetSlotIdx !== KEYSTONE_SLOT_INDEX) {
      const direct = checkMarkEligibility(
        currentBelt,
        mark,
        drag.rank,
        KEYSTONE_SLOT_INDEX,
        viewMode,
        ownedMarks,
        beltCapacity
      );
      if (direct.eligible) {
        return resolveEquipToBelt(
          currentBelt,
          mark,
          drag.rank,
          KEYSTONE_SLOT_INDEX,
          viewMode,
          ownedMarks,
          beltCapacity
        );
      }
    }

    const swapped = findValidSwapSlots(
      currentBelt,
      mark,
      drag.rank,
      viewMode,
      ownedMarks,
      beltCapacity
    );
    if (currentBelt[targetSlotIdx] && swapped.includes(targetSlotIdx)) {
      return resolveSwapIntoBelt(currentBelt, mark, drag.rank, targetSlotIdx);
    }

    return resolveEquipToBelt(
      currentBelt,
      mark,
      drag.rank,
      targetSlotIdx,
      viewMode,
      ownedMarks,
      beltCapacity
    );
  }

  const fromIdx = drag.fromSlotIdx;
  if (fromIdx === undefined || fromIdx === targetSlotIdx) return { ok: false };

  if (fromIdx === KEYSTONE_SLOT_INDEX || targetSlotIdx === KEYSTONE_SLOT_INDEX) {
    return {
      ok: false,
      sound: "error",
      toast: "Center Slot 5 is reserved exclusively for Keystones."
    };
  }

  const tentative = [...currentBelt];
  const temp = tentative[targetSlotIdx];
  tentative[targetSlotIdx] = tentative[fromIdx];
  tentative[fromIdx] = temp;
  return {
    ok: true,
    nextBelt: tentative,
    pulsedSlot: targetSlotIdx,
    sound: "equip"
  };
}
