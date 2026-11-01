import { ALL_MARKS } from "../data/renownData";
import { EquippedSlot } from "./RenownBelt";
import { CombatStats } from "./RenownInspector";
import { BELT_TOTAL_SLOTS, BeltCapacityTier } from "./deckValidation";

export interface DeepLinkResult {
  capacity?: BeltCapacityTier;
  ownedMarks?: Record<number, number>;
  belt?: (EquippedSlot | null)[];
  toast?: string;
}

export function parseRenownDeepLink(hash: string): DeepLinkResult {
  const result: DeepLinkResult = {};
  const capMatch = hash.match(/[?&]c=(6|7|8)/);
  if (capMatch && capMatch[1]) {
    result.capacity = parseInt(capMatch[1], 10) as BeltCapacityTier;
  }

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
          if (id >= 1 && id <= 55) parsed[id] = Math.min(Math.max(r, 1), 3);
        });
        if (Object.keys(parsed).length > 0) {
          result.ownedMarks = parsed;
          result.toast = `Imported ${Object.keys(parsed).length} owned marks from link!`;
        }
      } catch {
        // ignore malformed hash
      }
    }
  } else if (hash.includes("b=")) {
    const match = hash.match(/b=([^&]+)/);
    if (match && match[1]) {
      try {
        const tokens = match[1].split(",");
        const newBelt: (EquippedSlot | null)[] = new Array(BELT_TOTAL_SLOTS).fill(null);
        tokens.forEach((t, idx) => {
          if (idx < BELT_TOTAL_SLOTS && t && t !== "0") {
            const [idStr, rStr] = t.split(":");
            const id = parseInt(idStr, 10);
            const r = parseInt(rStr, 10) || 1;
            if (id >= 1 && id <= 55) newBelt[idx] = { markId: id, rank: Math.min(Math.max(r, 1), 3) };
          }
        });
        result.belt = newBelt;
        result.toast = "Imported build loadout from deep link!";
      } catch {
        // ignore malformed hash
      }
    }
  }

  return result;
}

export function parseImportedCollection(importStr: string): Record<number, number> | null {
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

    return Object.keys(parsed).length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function buildDay1StarterCollection(): Record<number, number> {
  const starter: Record<number, number> = {};
  for (let i = 1; i <= 16; i++) starter[i] = 1;
  starter[3] = 2;
  starter[14] = 2;
  starter[45] = 1;
  return starter;
}

export function buildMaxSovereignCollection(): Record<number, number> {
  const all: Record<number, number> = {};
  for (let i = 1; i <= 55; i++) all[i] = 3;
  return all;
}

export function computeBeltStats(equippedItems: EquippedSlot[]): CombatStats {
  let rawHp = 0;
  let rawReach = 0;
  let rawToughness = 0;
  let rawKb = 0;
  let rawSpeed = 0;
  let safeFall = 0;

  equippedItems.forEach((item) => {
    const m = ALL_MARKS.find((x) => x.id === item.markId);
    if (!m) return;
    const mult = item.rank === 3 ? 1.35 : item.rank === 2 ? 1.2 : 1.0;
    const s = m.stats || {};
    if (s.hp_bonus) rawHp += s.hp_bonus;
    if (s.reach_grounded) rawReach += s.reach_grounded;
    if (s.toughness) rawToughness += s.toughness * (item.rank === 3 ? 1.2 : 1.0);
    if (s.toughness_r3 && item.rank === 3) rawToughness += s.toughness_r3;
    if (s.kb_resist) rawKb += s.kb_resist * 100;
    if (s.speed_bonus) rawSpeed += s.speed_bonus * 1000 * (s.speed_bonus > 0 ? mult : 1.0);
    if (s.safe_fall) safeFall += Math.round(s.safe_fall * mult);
  });

  const bonusHp = Math.min(4.0, rawHp);
  const reachBonus = Math.min(0.25, rawReach);
  const toughness = Math.min(6.0, rawToughness);
  const kbResistPct = Math.min(60, Math.round(rawKb));
  const speedPct = Math.max(-12, Math.min(10, Math.round(rawSpeed)));

  return {
    bonusHp,
    totalHp: 20 + bonusHp,
    reach: 3.0 + reachBonus,
    reachBonus,
    toughness,
    kbResistPct,
    speedPct,
    safeFall
  };
}
