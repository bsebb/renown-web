import { useState, useEffect, useMemo } from "react";
import { ALL_MARKS, MarkItem } from "../data/renownData";
import { RenownAudioEngine } from "../utils/renownAudio";
import {
  BELT_TOTAL_SLOTS,
  KEYSTONE_SLOT_INDEX,
  BeltCapacityTier,
  DECK_PRESETS,
  DeckPreset,
  EquippedSlot,
  getEffectiveCost,
  calculateBeltTotals,
  checkMarkEligibility,
  findValidSwapSlots,
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
  CombatStats,
  parseRenownDeepLink,
  parseImportedCollection,
  buildDay1StarterCollection,
  buildMaxSovereignCollection,
  computeBeltStats
} from "./renownImportExport";
import { ActivePointerDrag } from "./usePointerDeckDrag";

export type DomainFilter = "ALL" | "Offense" | "Defense" | "Mobility" | "Utility";
export type SortMode = "cost" | "tier" | "id";

export interface SelectedCardState {
  markId: number;
  source: "collection" | "belt";
  slotIdx?: number;
}

export interface PendingSwapState {
  markId: number;
  rank: number;
  validSlots: number[];
}

export function useRenownDeck() {
  const audio = useMemo(() => new RenownAudioEngine(), []);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => audio.enabled);
  const [activeBuildSlot, setActiveBuildSlotState] = useState<number>(() => {
    const saved = loadFromStorage<number>(STORAGE_KEY_ACTIVE_DECK, 1);
    return saved >= 1 && saved <= 5 ? saved : 1;
  });
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
  const [sortMode, setSortMode] = useState<SortMode>("cost");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<SelectedCardState | null>(null);
  const [detailMarkId, setDetailMarkId] = useState<number | null>(null);
  const [pendingSwap, setPendingSwap] = useState<PendingSwapState | null>(null);
  const [lastEquippedSlot, setLastEquippedSlot] = useState<number | null>(null);

  const currentBelt = buildSlots[activeBuildSlot] || new Array(BELT_TOTAL_SLOTS).fill(null);

  const pulseSlot = (slotIdx: number) => {
    setLastEquippedSlot(slotIdx);
    window.setTimeout(() => {
      setLastEquippedSlot((prev) => (prev === slotIdx ? null : prev));
    }, 420);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const setActiveBuildSlot = (slot: number) => {
    setActiveBuildSlotState(slot);
    setSelectedCard(null);
    setPendingSwap(null);
    audio.play("click");
  };

  const setBeltCapacity = (nextCap: BeltCapacityTier) => {
    setBeltCapacityState(nextCap);
    setPendingSwap(null);
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

  const getRankForMark = (markId: number): number => {
    const inBelt = currentBelt.find((s) => s?.markId === markId);
    if (inBelt) return inBelt.rank;
    if (viewMode === "owned") return ownedMarks[markId] || 1;
    return markRanks[markId] || 1;
  };

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

  const equipMark = (markId: number, targetSlotIdx?: number, forcedRank?: number): boolean => {
    const mark = ALL_MARKS.find((m) => m.id === markId);
    if (!mark) return false;

    const rankToUse = forcedRank || getRankForMark(markId);
    let destIdx = targetSlotIdx;

    if (mark.keystone) {
      destIdx = KEYSTONE_SLOT_INDEX;
    } else {
      if (destIdx === KEYSTONE_SLOT_INDEX) {
        audio.play("error");
        showToast("Center Slot 5 only accepts Zero-Notch Keystones.");
        return false;
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
      return false;
    }

    const check = checkEligibility(mark, rankToUse, destIdx);
    if (!check.eligible && check.actionType === "disabled") {
      audio.play("error");
      showToast(check.reason || "Cannot equip card.");
      return false;
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
    setSelectedCard(null);
    setPendingSwap(null);
    pulseSlot(destIdx);
    audio.play(mark.keystone ? "success" : "equip");
    return true;
  };

  /**
   * Clash Royale Primary "Use" Action:
   * - If equipped -> removes from belt
   * - If fits directly (or replaces Keystone/Active directly) -> snaps into belt
   * - Otherwise enters interactive Wiggle Swap Mode highlighting valid replacement slots!
   */
  const handleUseCard = (mark: MarkItem, forcedRank?: number) => {
    const equippedIdx = currentBelt.findIndex((s) => s?.markId === mark.id);
    if (equippedIdx !== -1) {
      unequipSlot(equippedIdx);
      return;
    }

    const rankToUse = forcedRank || getRankForMark(mark.id);
    const direct = checkEligibility(mark, rankToUse);
    if (direct.eligible) {
      equipMark(mark.id, undefined, rankToUse);
      return;
    }

    const validSlots = findValidSwapSlots(
      currentBelt,
      mark,
      rankToUse,
      viewMode,
      ownedMarks,
      beltCapacity
    );

    if (validSlots.length > 0) {
      setSelectedCard(null);
      setPendingSwap({ markId: mark.id, rank: rankToUse, validSlots });
      audio.play("click");
      const deckEl = document.querySelector("[data-battle-deck]");
      deckEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    audio.play("error");
    showToast(direct.reason || "Cannot fit card in current belt tier.");
  };

  const executeSwapOnSlot = (slotIdx: number) => {
    if (!pendingSwap) return;
    if (!pendingSwap.validSlots.includes(slotIdx)) {
      audio.play("error");
      showToast("Tap one of the highlighted wiggling slots to swap.");
      return;
    }

    const mark = ALL_MARKS.find((m) => m.id === pendingSwap.markId);
    if (!mark) return;

    const tentative = [...currentBelt];
    if (mark.keystone) {
      // Clear chosen passive slot (to step down from +1N Purist) & socket Keystone into Center Slot 5
      if (slotIdx !== KEYSTONE_SLOT_INDEX) {
        tentative[slotIdx] = null;
      }
      tentative[KEYSTONE_SLOT_INDEX] = { markId: mark.id, rank: pendingSwap.rank };
      setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: tentative }));
      setPendingSwap(null);
      pulseSlot(KEYSTONE_SLOT_INDEX);
      audio.play("success");
      return;
    }

    if (mark.active) {
      const existingActiveIdx = tentative.findIndex((s) => {
        const m = s ? ALL_MARKS.find((x) => x.id === s.markId) : null;
        return m?.active === true;
      });
      if (existingActiveIdx !== -1) tentative[existingActiveIdx] = null;
    }

    tentative[slotIdx] = { markId: mark.id, rank: pendingSwap.rank };
    setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: tentative }));
    setPendingSwap(null);
    pulseSlot(slotIdx);
    audio.play("equip");
  };

  const unequipSlot = (slotIdx: number) => {
    const item = currentBelt[slotIdx];
    if (!item) return;
    const tentative = [...currentBelt];
    tentative[slotIdx] = null;
    setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: tentative }));
    setSelectedCard(null);
    setPendingSwap(null);
    audio.play("unequip");
  };

  const setCardRank = (markId: number, newRank: number) => {
    if (viewMode === "owned") {
      const maxOwned = ownedMarks[markId] || 1;
      if (newRank > maxOwned) {
        audio.play("error");
        showToast(`Unlocked mastery is Rank ${maxOwned}.`);
        return;
      }
    }

    const equippedIdx = currentBelt.findIndex((s) => s?.markId === markId);
    if (equippedIdx !== -1) {
      const item = currentBelt[equippedIdx]!;
      const mark = ALL_MARKS.find((m) => m.id === markId);
      if (!mark) return;
      const costDiff = getEffectiveCost(mark, newRank) - getEffectiveCost(mark, item.rank);
      if (costDiff > totals.remainingNotches) {
        audio.play("error");
        showToast(`Needs ${costDiff} more Notch (${totals.remainingNotches}N free).`);
        return;
      }
      const tentative = [...currentBelt];
      tentative[equippedIdx] = { markId, rank: newRank };
      setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: tentative }));
    }

    setMarkRanks((prev) => ({ ...prev, [markId]: newRank }));
    audio.play("rank");
  };

  const handlePointerDropOnSlot = (drag: ActivePointerDrag, targetSlotIdx: number) => {
    const mark = ALL_MARKS.find((m) => m.id === drag.markId);
    if (!mark) return;

    if (drag.source === "library") {
      if (mark.keystone && targetSlotIdx !== KEYSTONE_SLOT_INDEX) {
        // Auto-route Keystone drop to Center Slot 5 if eligible!
        const direct = checkEligibility(mark, drag.rank, KEYSTONE_SLOT_INDEX);
        if (direct.eligible) {
          equipMark(mark.id, KEYSTONE_SLOT_INDEX, drag.rank);
          return;
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
        const tentative = [...currentBelt];
        if (mark.keystone) {
          tentative[targetSlotIdx] = null;
          tentative[KEYSTONE_SLOT_INDEX] = { markId: mark.id, rank: drag.rank };
          setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: tentative }));
          pulseSlot(KEYSTONE_SLOT_INDEX);
          audio.play("success");
          return;
        }
        if (mark.active) {
          const ex = tentative.findIndex((s) => ALL_MARKS.find((x) => x.id === s?.markId)?.active);
          if (ex !== -1) tentative[ex] = null;
        }
        tentative[targetSlotIdx] = { markId: mark.id, rank: drag.rank };
        setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: tentative }));
        pulseSlot(targetSlotIdx);
        audio.play("equip");
        return;
      }
      equipMark(mark.id, targetSlotIdx, drag.rank);
      return;
    }

    // Rearranging within Battle Deck sockets
    const fromIdx = drag.fromSlotIdx;
    if (fromIdx === undefined || fromIdx === targetSlotIdx) return;

    if (fromIdx === KEYSTONE_SLOT_INDEX || targetSlotIdx === KEYSTONE_SLOT_INDEX) {
      audio.play("error");
      showToast("Center Slot 5 is reserved exclusively for Keystones.");
      return;
    }

    const tentative = [...currentBelt];
    const temp = tentative[targetSlotIdx];
    tentative[targetSlotIdx] = tentative[fromIdx];
    tentative[fromIdx] = temp;
    setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: tentative }));
    setSelectedCard(null);
    pulseSlot(targetSlotIdx);
    audio.play("equip");
  };

  const applyPreset = (preset: DeckPreset) => {
    setBeltCapacityState(preset.capacity);
    setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: [...preset.slots] }));
    setSelectedCard(null);
    setPendingSwap(null);
    audio.play("success");
    showToast(`Loaded ${preset.name} into Deck ${activeBuildSlot}.`);
  };

  const filteredMarks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = ALL_MARKS.filter((m) => {
      const matchDomain = activeDomain === "ALL" || m.domain === activeDomain;
      return (
        matchDomain &&
        (!q ||
          m.name.toLowerCase().includes(q) ||
          m.desc.toLowerCase().includes(q) ||
          m.advancement.toLowerCase().includes(q))
      );
    });

    return [...list].sort((a, b) => {
      if (sortMode === "cost") {
        // Keystones (0N) first, then ascending Notch cost, then tier
        if (a.keystone !== b.keystone) return a.keystone ? -1 : 1;
        if (a.cost !== b.cost) return a.cost - b.cost;
        return b.tierNum - a.tierNum;
      }
      if (sortMode === "tier") {
        if (b.tierNum !== a.tierNum) return b.tierNum - a.tierNum;
        return a.id - b.id;
      }
      return a.id - b.id;
    });
  }, [activeDomain, searchQuery, sortMode]);

  const handleCopyInGameCommand = () => {
    const tokens = currentBelt.map((s) => (s ? `${s.markId}:${s.rank}` : "0")).join(",");
    const cmd = `/renown loadout ${tokens}`;
    navigator.clipboard?.writeText(cmd);
    audio.play("copy");
    showToast(`Copied: ${cmd}`);
  };

  const handleCopyShareUrl = () => {
    const tokens = currentBelt.map((s) => (s ? `${s.markId}:${s.rank}` : "0")).join(",");
    const url = `${window.location.origin}${window.location.pathname}#renown?c=${beltCapacity}&b=${tokens}`;
    navigator.clipboard?.writeText(url);
    audio.play("copy");
    showToast("Shareable deck link copied.");
  };

  const handleImportCollection = (importStr: string) => {
    const parsed = parseImportedCollection(importStr);
    if (!parsed) {
      audio.play("error");
      showToast("Invalid format. Expected: 1:2,3:1,14:2,45:1");
      return;
    }
    setOwnedMarks(parsed);
    setViewMode("owned");
    audio.play("success");
    showToast(`Imported ${Object.keys(parsed).length} owned marks.`);
  };

  const handleQuickLoadStarter = () => {
    setOwnedMarks(buildDay1StarterCollection());
    setBeltCapacityState(6);
    setViewMode("owned");
    audio.play("success");
    showToast("Loaded Day 1 Starter Collection (6N Belt).");
  };

  const handleUnlockAll = () => {
    setOwnedMarks(buildMaxSovereignCollection());
    setBeltCapacityState(8);
    setViewMode("owned");
    audio.play("success");
    showToast("Unlocked all 55 Marks at Rank III (8N Belt).");
  };

  const clearCurrentBelt = () => {
    setBuildSlots((prev) => ({
      ...prev,
      [activeBuildSlot]: new Array(BELT_TOTAL_SLOTS).fill(null)
    }));
    setSelectedCard(null);
    setPendingSwap(null);
    audio.play("unequip");
    showToast(`Cleared Deck ${activeBuildSlot}.`);
  };

  const statsBonus = useMemo<CombatStats>(() => computeBeltStats(equippedItems), [equippedItems]);

  return {
    audio,
    sfxEnabled,
    handleToggleSfx,
    activeBuildSlot,
    setActiveBuildSlot,
    beltCapacity,
    setBeltCapacity,
    currentBelt,
    clearCurrentBelt,
    markRanks,
    getRankForMark,
    viewMode,
    setViewMode,
    ownedMarks,
    activeDomain,
    setActiveDomain,
    sortMode,
    setSortMode,
    searchQuery,
    setSearchQuery,
    toastMessage,
    selectedCard,
    setSelectedCard,
    detailMarkId,
    setDetailMarkId,
    pendingSwap,
    setPendingSwap,
    lastEquippedSlot,
    getEffectiveCost,
    totals,
    checkEligibility,
    equipMark,
    handleUseCard,
    executeSwapOnSlot,
    unequipSlot,
    setCardRank,
    handlePointerDropOnSlot,
    applyPreset,
    presets: DECK_PRESETS,
    filteredMarks,
    handleCopyInGameCommand,
    handleCopyShareUrl,
    handleImportCollection,
    handleQuickLoadStarter,
    handleUnlockAll,
    statsBonus
  };
}
