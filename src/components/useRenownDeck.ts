import { useState, useEffect, useMemo, useRef } from "react";
import { ALL_MARKS, MarkItem } from "../data/renownData";
import { RenownAudioEngine } from "../utils/renownAudio";
import { EquippedSlot } from "./RenownBelt";
import { CombatStats } from "./RenownInspector";

export type DomainFilter = "ALL" | "Offense" | "Defense" | "Mobility" | "Utility";

export function useRenownDeck() {
  const audio = useMemo(() => new RenownAudioEngine(), []);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => audio.enabled);

  const [activeBuildSlot, setActiveBuildSlot] = useState<number>(1);
  const [buildSlots, setBuildSlots] = useState<Record<number, (EquippedSlot | null)[]>>(() => {
    const slot1: (EquippedSlot | null)[] = new Array(10).fill(null);
    slot1[0] = { markId: 13, rank: 2 };
    slot1[1] = { markId: 22, rank: 2 };
    slot1[2] = { markId: 4, rank: 1 };
    slot1[3] = { markId: 5, rank: 1 };
    slot1[4] = { markId: 43, rank: 1 };

    return {
      1: slot1,
      2: new Array(10).fill(null),
      3: new Array(10).fill(null)
    };
  });

  const [markRanks, setMarkRanks] = useState<Record<number, number>>({});
  const [viewMode, setViewMode] = useState<"all" | "owned">("all");
  const [ownedMarks, setOwnedMarks] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    for (let i = 1; i <= 24; i++) initial[i] = i % 3 === 0 ? 2 : 1;
    initial[43] = 1;
    initial[36] = 2;
    return initial;
  });

  const [activeDomain, setActiveDomain] = useState<DomainFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const dragSourceRef = useRef<{ type: "library"; markId: number } | { type: "socket"; slotIdx: number } | null>(null);

  const currentBelt = buildSlots[activeBuildSlot] || new Array(10).fill(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const handleToggleSfx = () => {
    const next = audio.toggle();
    setSfxEnabled(next);
    if (next) audio.play("click");
  };

  const getEffectiveCost = (mark: MarkItem, rank: number): number => {
    if (mark.cost > 1 && rank === 3) return mark.cost - 1;
    return mark.cost;
  };

  const equippedItems = useMemo(() => {
    return currentBelt.filter((s): s is EquippedSlot => s !== null);
  }, [currentBelt]);

  const totalNotches = useMemo(() => {
    return equippedItems.reduce((sum, item) => {
      const m = ALL_MARKS.find((x) => x.id === item.markId);
      return sum + (m ? getEffectiveCost(m, item.rank) : 0);
    }, 0);
  }, [equippedItems]);

  const offenseNotches = useMemo(() => {
    return equippedItems.reduce((sum, item) => {
      const m = ALL_MARKS.find((x) => x.id === item.markId);
      return sum + (m && m.domain === "Offense" ? getEffectiveCost(m, item.rank) : 0);
    }, 0);
  }, [equippedItems]);

  const equippedKeystone = useMemo(() => {
    return equippedItems.find((item) => {
      const m = ALL_MARKS.find((x) => x.id === item.markId);
      return m?.keystone === true;
    });
  }, [equippedItems]);

  const equippedActive = useMemo(() => {
    return equippedItems.find((item) => {
      const m = ALL_MARKS.find((x) => x.id === item.markId);
      return m?.active === true;
    });
  }, [equippedItems]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("owned=")) {
      const match = hash.match(/owned=([^&]+)/);
      if (match && match[1]) {
        try {
          const parts = match[1].split(",");
          const parsed: Record<number, number> = {};
          parts.forEach((p) => {
            const [idStr, rStr] = p.split(":");
            const id = parseInt(idStr, 10);
            const r = parseInt(rStr, 10) || 1;
            if (id >= 1 && id <= 55) parsed[id] = r;
          });
          if (Object.keys(parsed).length > 0) {
            setOwnedMarks(parsed);
            setViewMode("owned");
            showToast(`Imported ${Object.keys(parsed).length} owned marks from link!`);
          }
        } catch {
          // ignore
        }
      }
    } else if (hash.includes("b=")) {
      const match = hash.match(/b=([^&]+)/);
      if (match && match[1]) {
        try {
          const tokens = match[1].split(",");
          const newBelt: (EquippedSlot | null)[] = new Array(10).fill(null);
          tokens.forEach((t, idx) => {
            if (idx < 10 && t && t !== "0") {
              const [idStr, rStr] = t.split(":");
              const id = parseInt(idStr, 10);
              const r = parseInt(rStr, 10) || 1;
              if (id >= 1 && id <= 55) newBelt[idx] = { markId: id, rank: r };
            }
          });
          setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: newBelt }));
          showToast("Imported build loadout from deep link!");
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const validateChange = (
    tentativeBelt: (EquippedSlot | null)[]
  ): { valid: boolean; reason?: string } => {
    const items = tentativeBelt.filter((s): s is EquippedSlot => s !== null);

    const notches = items.reduce((sum, item) => {
      const m = ALL_MARKS.find((x) => x.id === item.markId);
      return sum + (m ? getEffectiveCost(m, item.rank) : 0);
    }, 0);
    if (notches > 10) return { valid: false, reason: `Rule 1 Exceeded: ${notches}/10 Notches capacity!` };

    const off = items.reduce((sum, item) => {
      const m = ALL_MARKS.find((x) => x.id === item.markId);
      return sum + (m && m.domain === "Offense" ? getEffectiveCost(m, item.rank) : 0);
    }, 0);
    if (off > 6) return { valid: false, reason: `Rule 3 Exceeded: ${off}/6 Offense Notches limit!` };

    const keystones = items.filter((item) => {
      const m = ALL_MARKS.find((x) => x.id === item.markId);
      return m?.keystone === true;
    });
    if (keystones.length > 1) return { valid: false, reason: "Rule 2 Exceeded: Maximum 1 Keystone Mark allowed!" };

    const actives = items.filter((item) => {
      const m = ALL_MARKS.find((x) => x.id === item.markId);
      return m?.active === true;
    });
    if (actives.length > 1) return { valid: false, reason: "Rule 4 Exceeded: Maximum 1 Active Mark allowed!" };

    return { valid: true };
  };

  const equipMark = (markId: number, targetSlotIdx?: number, forcedRank?: number) => {
    const mark = ALL_MARKS.find((m) => m.id === markId);
    if (!mark) return;

    if (viewMode === "owned" && !ownedMarks[markId]) {
      audio.play("error");
      showToast(`Cannot equip: ${mark.name} is locked in your collection!`);
      return;
    }

    const rankToUse = forcedRank || (viewMode === "owned" ? ownedMarks[markId] || 1 : markRanks[markId] || 1);
    const tentative = [...currentBelt];

    let destIdx = targetSlotIdx;
    if (destIdx === undefined) {
      if (mark.keystone && tentative[4] === null) {
        destIdx = 4;
      } else {
        destIdx = tentative.findIndex((s) => s === null);
      }
    }

    if (destIdx === -1 || destIdx === undefined || destIdx >= 10) {
      audio.play("error");
      showToast("All 10 belt sockets are occupied! Unequip a mark first.");
      return;
    }

    const existingIdx = tentative.findIndex((s) => s?.markId === markId);
    if (existingIdx !== -1 && existingIdx !== destIdx) {
      tentative[existingIdx] = null;
    }

    tentative[destIdx] = { markId, rank: rankToUse };

    const validation = validateChange(tentative);
    if (!validation.valid) {
      audio.play("error");
      showToast(validation.reason || "Equip rejected: violates loadout rules!");
      return;
    }

    setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: tentative }));
    audio.play("equip");
    showToast(`Equipped ${mark.name} (R${rankToUse}) in Slot ${destIdx + 1}`);
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

    const tentative = [...currentBelt];
    tentative[slotIdx] = { markId: item.markId, rank: newRank };

    const validation = validateChange(tentative);
    if (!validation.valid) {
      audio.play("error");
      showToast(validation.reason || "Rank switch violates loadout rules!");
      return;
    }

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
    if (equippedIdx !== -1) {
      setSlotRank(equippedIdx, rank);
    } else {
      audio.play("click");
    }
  };

  const handleCardToggleEquip = (mark: MarkItem) => {
    const isEquipped = currentBelt.some((s) => s?.markId === mark.id);
    if (isEquipped) {
      const idx = currentBelt.findIndex((s) => s?.markId === mark.id);
      if (idx !== -1) unequipSlot(idx);
    } else {
      equipMark(mark.id);
    }
  };

  const handleDragStartCard = (e: React.DragEvent, markId: number) => {
    dragSourceRef.current = { type: "library", markId };
    e.dataTransfer.setData("text/plain", String(markId));
    audio.play("click");
  };

  const handleDragStartSocket = (e: React.DragEvent, slotIdx: number) => {
    dragSourceRef.current = { type: "socket", slotIdx };
    e.dataTransfer.setData("text/plain", `slot:${slotIdx}`);
    audio.play("click");
  };

  const handleDragOver = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    if (dragOverSlot !== slotIdx) setDragOverSlot(slotIdx);
  };

  const handleDrop = (e: React.DragEvent, targetSlotIdx: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    const source = dragSourceRef.current;
    if (!source) return;

    if (source.type === "library") {
      equipMark(source.markId, targetSlotIdx);
    } else if (source.type === "socket") {
      const fromIdx = source.slotIdx;
      if (fromIdx === targetSlotIdx) return;

      const tentative = [...currentBelt];
      const temp = tentative[targetSlotIdx];
      tentative[targetSlotIdx] = tentative[fromIdx];
      tentative[fromIdx] = temp;

      const validation = validateChange(tentative);
      if (!validation.valid) {
        audio.play("error");
        showToast(validation.reason || "Swap violates loadout rules!");
        return;
      }

      setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: tentative }));
      audio.play("equip");
      showToast(`Swapped Slot ${fromIdx + 1} and Slot ${targetSlotIdx + 1}`);
    }

    dragSourceRef.current = null;
  };

  const filteredMarks = useMemo(() => {
    return ALL_MARKS.filter((m) => {
      const matchDomain = activeDomain === "ALL" || m.domain === activeDomain;
      const q = searchQuery.toLowerCase().trim();
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
    const url = `${window.location.origin}${window.location.pathname}#renown?b=${tokens}`;
    navigator.clipboard.writeText(url);
    audio.play("copy");
    showToast("Shareable build URL copied to clipboard!");
  };

  const handleImportCollection = (importStr: string) => {
    try {
      let str = importStr.trim();
      if (str.includes("/renown export")) str = str.replace("/renown export", "").trim();
      if (str.includes("#owned=")) str = str.split("#owned=")[1].split("&")[0];

      const pairs = str.split(",");
      const parsed: Record<number, number> = {};
      pairs.forEach((p) => {
        const [idStr, rStr] = p.split(":");
        const id = parseInt(idStr.trim(), 10);
        const r = parseInt(rStr ? rStr.trim() : "1", 10) || 1;
        if (id >= 1 && id <= 55) parsed[id] = Math.min(Math.max(r, 1), 3);
      });

      if (Object.keys(parsed).length === 0) {
        audio.play("error");
        showToast("No valid marks found in imported string!");
        return;
      }

      setOwnedMarks(parsed);
      setViewMode("owned");
      audio.play("success");
      showToast(`Successfully imported ${Object.keys(parsed).length} owned marks!`);
    } catch {
      audio.play("error");
      showToast("Malformed import string! Use format: 1:2,2:1,13:3...");
    }
  };

  const handleQuickLoadStarter = () => {
    const starter: Record<number, number> = {};
    for (let i = 1; i <= 15; i++) starter[i] = 1;
    starter[1] = 2;
    starter[13] = 2;
    starter[22] = 2;
    starter[36] = 1;
    setOwnedMarks(starter);
    setViewMode("owned");
    audio.play("success");
    showToast("Loaded Starter Pack (15 Marks unlocked)!");
  };

  const handleUnlockAll = () => {
    const all: Record<number, number> = {};
    for (let i = 1; i <= 55; i++) all[i] = 3;
    setOwnedMarks(all);
    setViewMode("owned");
    audio.play("success");
    showToast("Unlocked all 55 Marks at Rank 3!");
  };

  const statsBonus = useMemo<CombatStats>(() => {
    let bonusHp = 0;
    let reachBonus = 0;
    let toughnessBonus = 0;
    let deflectChance = 0;
    let maceExecute = 0;
    let safeFall = 0;

    equippedItems.forEach((item) => {
      const m = ALL_MARKS.find((x) => x.id === item.markId);
      if (!m) return;
      if (m.id === 36) bonusHp += item.rank === 1 ? 2.0 : item.rank === 2 ? 3.0 : 4.0;
      if (m.id === 55) bonusHp += 4.0;
      if (m.id === 47) reachBonus += item.rank === 1 ? 0.35 : 0.45;
      if (m.id === 4 && item.rank === 3) toughnessBonus += 0.5;
      if (m.id === 22) toughnessBonus += item.rank === 1 ? 1.0 : item.rank === 2 ? 1.5 : 2.5;
      if (m.id === 21) deflectChance += item.rank === 1 ? 15 : item.rank === 2 ? 25 : 40;
      if (m.id === 41) deflectChance += item.rank === 1 ? 50 : item.rank === 2 ? 75 : 100;
      if (m.id === 33) maceExecute += item.rank === 1 ? 15 : item.rank === 2 ? 25 : 35;
      if (m.id === 5) safeFall += item.rank === 1 ? 3 : item.rank === 2 ? 5 : 7;
    });

    return {
      bonusHp,
      totalHp: 20 + bonusHp,
      reach: 3.0 + reachBonus,
      reachBonus,
      toughness: toughnessBonus,
      deflect: deflectChance,
      maceExecute,
      safeFall
    };
  }, [equippedItems]);

  const clearCurrentBelt = () => {
    setBuildSlots((prev) => ({ ...prev, [activeBuildSlot]: new Array(10).fill(null) }));
    audio.play("unequip");
    showToast("Cleared equipped loadout!");
  };

  return {
    audio,
    sfxEnabled,
    handleToggleSfx,
    activeBuildSlot,
    setActiveBuildSlot,
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
    getEffectiveCost,
    totalNotches,
    offenseNotches,
    equippedKeystone,
    equippedActive,
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
