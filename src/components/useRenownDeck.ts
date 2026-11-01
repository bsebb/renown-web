import { useState, useEffect, useMemo, useRef } from "react";
import { ALL_MARKS, MarkItem } from "../data/renownData";
import { RenownAudioEngine } from "../utils/renownAudio";
import { EquippedSlot } from "./RenownBelt";
import { CombatStats } from "./RenownInspector";
import {
  BELT_TOTAL_SLOTS,
  KEYSTONE_SLOT_INDEX,
  BeltCapacityTier,
  getEffectiveCost,
  calculateBeltTotals,
  checkMarkEligibility,
  EligibilityResult
} from "./deckValidation";
import {
  STORAGE_KEY_BUILD_SLOTS,
  STORAGE_KEY_ACTIVE_DECK,
  STORAGE_KEY_OWNED,
  STORAGE_KEY_MARK_RANKS,
  STORAGE_KEY_BELT_CAPACITY,
  loadFromStorage,
  saveToStorage,
  getSanitizedBuildSlots,
  getSanitizedBeltCapacity,
  getDefaultOwnedMarks
} from "./renownStorage";
import {
  parseRenownDeepLink,
  parseImportedCollection,
  buildDay1StarterCollection,
  buildMaxSovereignCollection,
  computeBeltStats
} from "./renownImportExport";

export type DomainFilter = "ALL" | "Offense" | "Defense" | "Mobility" | "Utility";

export interface DraggingInfo {
  type: "library" | "socket";
  markId?: number;
  slotIdx?: number;
  isKeystone: boolean;
  cost: number;
}

export function useRenownDeck() {
  const audio = useMemo(() => new RenownAudioEngine(), []);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => audio.enabled);
  const [activeBuildSlot, setActiveBuildSlot] = useState<number>(() =>
    loadFromStorage<number>(STORAGE_KEY_ACTIVE_DECK, 1)
  );
  const [beltCapacity, setBeltCapacityState] = useState<BeltCapacityTier>(() =>
    getSanitizedBeltCapacity()
  );
  const [buildSlots, setBuildSlots] = useState<Record<number, (EquippedSlot | null)[]>>(() =>
    getSanitizedBuildSlots()
  );
  const [markRanks, setMarkRanks] = useState<Record<number, number>>(() =>
    loadFromStorage<Record<number, number>>(STORAGE_KEY_MARK_RANKS, {})
  );
  const [viewMode, setViewMode] = useState<"all" | "owned">("all");
  const [ownedMarks, setOwnedMarks] = useState<Record<number, number>>(() =>
    loadFromStorage<Record<number, number>>(STORAGE_KEY_OWNED, getDefaultOwnedMarks())
  );

  useEffect(() => saveToStorage(STORAGE_KEY_BUILD_SLOTS, buildSlots), [buildSlots]);
  useEffect(() => saveToStorage(STORAGE_KEY_ACTIVE_DECK, activeBuildSlot), [activeBuildSlot]);
  useEffect(() => saveToStorage(STORAGE_KEY_BELT_CAPACITY, beltCapacity), [beltCapacity]);
  useEffect(() => saveToStorage(STORAGE_KEY_OWNED, ownedMarks), [ownedMarks]);
  useEffect(() => saveToStorage(STORAGE_KEY_MARK_RANKS, markRanks), [markRanks]);

  const [activeDomain, setActiveDomain] = useState<DomainFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [draggingInfo, setDraggingInfo] = useState<DraggingInfo | null>(null);
  const dragSourceRef = useRef<DraggingInfo | null>(null);

  const currentBelt = buildSlots[activeBuildSlot] || new Array(BELT_TOTAL_SLOTS).fill(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  };

  const setBeltCapacity = (nextCap: BeltCapacityTier) => {
    setBeltCapacityState(nextCap);
    audio.play("click");
  };

  const handleToggleSfx = () => {
    const next = audio.toggle();
    setSfxEnabled(next);
    if (next) audio.play("click");
  };

  const totals = useMemo(
    () => calculateBeltTotals(currentBelt, beltCapacity),
    [currentBelt, beltCapacity]
  );
  const { totalNotches, remainingNotches, offenseNotches, equippedKeystone, equippedActive } =
    totals;

  const equippedItems = useMemo(
    () => currentBelt.filter((s): s is EquippedSlot => s !== null),
    [currentBelt]
  );

  useEffect(() => {
    const parsed = parseRenownDeepLink(window.location.hash);
    if (parsed.capacity) setBeltCapacityState(parsed.capacity);
    if (parsed.ownedMarks) {
      setOwnedMarks(parsed.ownedMarks);
      setViewMode("owned");
    }
    if (parsed.belt) {
      setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: parsed.belt! }));
    }
    if (parsed.toast) showToast(parsed.toast);
  }, []);

  const checkEligibility = (
    mark: MarkItem,
    rank: number,
    targetSlotIdx?: number
  ): EligibilityResult =>
    checkMarkEligibility(
      currentBelt,
      mark,
      rank,
      targetSlotIdx,
      viewMode,
      ownedMarks,
      beltCapacity
    );

  const equipMark = (markId: number, targetSlotIdx?: number, forcedRank?: number) => {
    const mark = ALL_MARKS.find((m) => m.id === markId);
    if (!mark) return;

    const rankToUse =
      forcedRank || (viewMode === "owned" ? ownedMarks[markId] || 1 : markRanks[markId] || 1);

    let destIdx = targetSlotIdx;
    if (mark.keystone) {
      if (destIdx !== undefined && destIdx !== KEYSTONE_SLOT_INDEX) {
        showToast("Keystones socket directly into the Center Keystone Anchor (Slot 5)!");
      }
      destIdx = KEYSTONE_SLOT_INDEX;
    } else {
      if (destIdx === KEYSTONE_SLOT_INDEX) {
        audio.play("error");
        showToast("Center Slot 5 is the dedicated Keystone Anchor! Only Keystone marks socket here.");
        return;
      }
      if (destIdx === undefined) {
        destIdx = currentBelt.findIndex((s, i) => s === null && i !== KEYSTONE_SLOT_INDEX);
      }
    }

    if (destIdx === -1 || destIdx === undefined || destIdx >= BELT_TOTAL_SLOTS) {
      audio.play("error");
      showToast("All 8 passive sockets in belt are occupied! Unequip a mark first.");
      return;
    }

    const check = checkEligibility(mark, rankToUse, destIdx);
    if (!check.eligible && check.actionType === "disabled") {
      audio.play("error");
      showToast(check.reason || "Cannot equip: violates belt rules!");
      return;
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

    const existingIdx = tentative.findIndex((s) => s?.markId === markId);
    if (existingIdx !== -1 && existingIdx !== destIdx) {
      tentative[existingIdx] = null;
    }

    tentative[destIdx] = { markId, rank: rankToUse };
    setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: tentative }));
    if (mark.keystone) {
      audio.play("success");
      showToast(`Socketed Zero-Notch Keystone: ${mark.name} (R${rankToUse})`);
    } else {
      audio.play("equip");
      showToast(`Equipped ${mark.name} (R${rankToUse}) in Slot ${destIdx + 1}`);
    }
  };

  const unequipSlot = (slotIdx: number) => {
    const item = currentBelt[slotIdx];
    if (!item) return;
    const mark = ALL_MARKS.find((m) => m.id === item.markId);
    const tentative = [...currentBelt];
    tentative[slotIdx] = null;
    setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: tentative }));
    audio.play("unequip");
    showToast(`Unequipped ${mark?.name || "Mark"}`);
  };

  const setSlotRank = (slotIdx: number, newRank: number) => {
    const item = currentBelt[slotIdx];
    if (!item) return;

    if (viewMode === "owned") {
      const maxOwned = ownedMarks[item.markId] || 1;
      if (newRank > maxOwned) {
        audio.play("error");
        showToast(`Cannot rank up: Your unlocked mastery is Rank ${maxOwned}!`);
        return;
      }
    }

    const mark = ALL_MARKS.find((m) => m.id === item.markId);
    if (!mark) return;

    const costDiff = getEffectiveCost(mark, newRank) - getEffectiveCost(mark, item.rank);
    if (costDiff > remainingNotches) {
      audio.play("error");
      showToast(
        `Cannot lower rank: Requires ${costDiff} more Notch, but only ${remainingNotches} available!`
      );
      return;
    }

    const tentative = [...currentBelt];
    tentative[slotIdx] = { markId: item.markId, rank: newRank };
    setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: tentative }));
    audio.play("rank");
  };

  const handleLibraryRankChange = (markId: number, rank: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === "owned") {
      const maxOwned = ownedMarks[markId] || 1;
      if (rank > maxOwned) {
        audio.play("error");
        showToast(`Rank ${rank} locked! Your current unlocked mastery is Rank ${maxOwned}.`);
        return;
      }
    }
    setMarkRanks((prev) => ({ ...prev, [markId]: rank }));
    const equippedIdx = currentBelt.findIndex((s) => s?.markId === markId);
    if (equippedIdx !== -1) setSlotRank(equippedIdx, rank);
    else audio.play("click");
  };

  const handleCardToggleEquip = (mark: MarkItem) => {
    const idx = currentBelt.findIndex((s) => s?.markId === mark.id);
    if (idx !== -1) unequipSlot(idx);
    else equipMark(mark.id);
  };

  const handleDragStartCard = (e: React.DragEvent, markId: number) => {
    const m = ALL_MARKS.find((x) => x.id === markId);
    const info: DraggingInfo = {
      type: "library",
      markId,
      isKeystone: Boolean(m?.keystone),
      cost: m ? getEffectiveCost(m, markRanks[markId] || 1) : 1
    };
    dragSourceRef.current = info;
    setDraggingInfo(info);
    e.dataTransfer.setData("text/plain", String(markId));
    audio.play("click");
  };

  const handleDragStartSocket = (e: React.DragEvent, slotIdx: number) => {
    const item = currentBelt[slotIdx];
    const m = item ? ALL_MARKS.find((x) => x.id === item.markId) : null;
    const info: DraggingInfo = {
      type: "socket",
      slotIdx,
      markId: item?.markId,
      isKeystone: Boolean(m?.keystone),
      cost: item && m ? getEffectiveCost(m, item.rank) : 0
    };
    dragSourceRef.current = info;
    setDraggingInfo(info);
    e.dataTransfer.setData("text/plain", `slot:${slotIdx}`);
    audio.play("click");
  };

  const handleDragOver = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    if (dragOverSlot !== slotIdx) setDragOverSlot(slotIdx);
  };

  const handleDragEnd = () => {
    setDragOverSlot(null);
    setDraggingInfo(null);
    dragSourceRef.current = null;
  };

  const handleDrop = (e: React.DragEvent, targetSlotIdx: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    setDraggingInfo(null);
    const source = dragSourceRef.current;
    if (!source) return;

    if (source.type === "library" && source.markId) {
      equipMark(source.markId, targetSlotIdx);
    } else if (source.type === "socket" && source.slotIdx !== undefined) {
      const fromIdx = source.slotIdx;
      if (fromIdx === targetSlotIdx) return;

      if (fromIdx === KEYSTONE_SLOT_INDEX || targetSlotIdx === KEYSTONE_SLOT_INDEX) {
        const fromItem = currentBelt[fromIdx];
        const targetItem = currentBelt[targetSlotIdx];
        const fromMark = fromItem ? ALL_MARKS.find((x) => x.id === fromItem.markId) : null;
        const targetMark = targetItem ? ALL_MARKS.find((x) => x.id === targetItem.markId) : null;

        if (targetSlotIdx === KEYSTONE_SLOT_INDEX && fromMark && !fromMark.keystone) {
          audio.play("error");
          showToast("Center Slot 5 is the Keystone Anchor! Only Keystones can be socketed here.");
          dragSourceRef.current = null;
          return;
        }
        if (
          fromIdx === KEYSTONE_SLOT_INDEX &&
          targetSlotIdx !== KEYSTONE_SLOT_INDEX &&
          (!targetMark || !targetMark.keystone)
        ) {
          audio.play("error");
          showToast("Keystones can only be socketed in the Center Keystone Anchor (Slot 5).");
          dragSourceRef.current = null;
          return;
        }
      }

      const tentative = [...currentBelt];
      const temp = tentative[targetSlotIdx];
      tentative[targetSlotIdx] = tentative[fromIdx];
      tentative[fromIdx] = temp;
      setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: tentative }));
      audio.play("equip");
      showToast(`Swapped with Slot ${targetSlotIdx + 1}`);
    }
    dragSourceRef.current = null;
  };

  const filteredMarks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ALL_MARKS.filter((m) => {
      const matchDomain = activeDomain === "ALL" || m.domain === activeDomain;
      return (
        matchDomain &&
        (!q ||
          m.name.toLowerCase().includes(q) ||
          m.desc.toLowerCase().includes(q) ||
          m.advancement.toLowerCase().includes(q))
      );
    });
  }, [activeDomain, searchQuery]);

  const handleCopyInGameCommand = () => {
    const tokens = currentBelt.map((s) => (s ? `${s.markId}:${s.rank}` : "0")).join(",");
    const cmd = `/renown loadout ${tokens}`;
    navigator.clipboard.writeText(cmd);
    audio.play("copy");
    showToast(`Copied to clipboard: ${cmd}`);
  };

  const handleCopyShareUrl = () => {
    const tokens = currentBelt.map((s) => (s ? `${s.markId}:${s.rank}` : "0")).join(",");
    const url = `${window.location.origin}${window.location.pathname}#renown?c=${beltCapacity}&b=${tokens}`;
    navigator.clipboard.writeText(url);
    audio.play("copy");
    showToast("Shareable build URL copied to clipboard!");
  };

  const handleImportCollection = (importStr: string) => {
    const parsed = parseImportedCollection(importStr);
    if (!parsed) {
      audio.play("error");
      showToast("Malformed import string! Use format: 1:2,3:1,14:2,45:1...");
      return;
    }
    setOwnedMarks(parsed);
    setViewMode("owned");
    audio.play("success");
    showToast(`Successfully imported ${Object.keys(parsed).length} owned marks!`);
  };

  const handleQuickLoadStarter = () => {
    setOwnedMarks(buildDay1StarterCollection());
    setBeltCapacityState(6);
    setViewMode("owned");
    audio.play("success");
    showToast("Loaded Day-1 Starter Pack (6-Notch Belt + 17 Marks)!");
  };

  const handleUnlockAll = () => {
    setOwnedMarks(buildMaxSovereignCollection());
    setBeltCapacityState(8);
    setViewMode("owned");
    audio.play("success");
    showToast("Unlocked all 55 Marks at Rank 3 + 8-Notch Sovereign Belt!");
  };

  const statsBonus = useMemo<CombatStats>(() => computeBeltStats(equippedItems), [equippedItems]);

  const clearCurrentBelt = () => {
    setBuildSlots((prev) => ({
      ...prev,
      [activeBuildSlot]: new Array(BELT_TOTAL_SLOTS).fill(null)
    }));
    audio.play("unequip");
    showToast("Cleared equipped loadout!");
  };

  return {
    audio,
    sfxEnabled,
    handleToggleSfx,
    activeBuildSlot,
    setActiveBuildSlot,
    beltCapacity,
    setBeltCapacity,
    buildSlots,
    currentBelt,
    clearCurrentBelt,
    markRanks,
    viewMode,
    setViewMode,
    ownedMarks,
    activeDomain,
    setActiveDomain,
    searchQuery,
    setSearchQuery,
    toastMessage,
    dragOverSlot,
    setDragOverSlot,
    draggingInfo,
    handleDragEnd,
    getEffectiveCost,
    totalNotches,
    remainingNotches,
    offenseNotches,
    equippedKeystone,
    equippedActive,
    checkEligibility,
    equipMark,
    unequipSlot,
    setSlotRank,
    handleLibraryRankChange,
    handleCardToggleEquip,
    handleDragStartCard,
    handleDragStartSocket,
    handleDragOver,
    handleDrop,
    filteredMarks,
    handleCopyInGameCommand,
    handleCopyShareUrl,
    handleImportCollection,
    handleQuickLoadStarter,
    handleUnlockAll,
    statsBonus
  };
}
