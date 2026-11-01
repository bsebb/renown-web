import React from "react";
import { Info, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { MarkItem } from "../data/renownData";
import { BeltTotals, EquippedSlot, PASSIVE_OFFENSE_CAP } from "./deckValidation";
import { CombatStats } from "./renownImportExport";

interface BeltSwapBannerProps {
  swapMark: MarkItem;
  swapCost: number;
  onCancelSwap: () => void;
}

export const BeltSwapBanner: React.FC<BeltSwapBannerProps> = ({
  swapMark,
  swapCost,
  onCancelSwap
}) => (
  <div className="cr-swap-banner" role="status">
    <div className="cr-swap-banner-info">
      <img
        src={`assets/marks/mark_${String(swapMark.id).padStart(2, "0")}.png`}
        alt={swapMark.name}
        className="cr-swap-thumb"
      />
      <div className="cr-swap-text">
        <div className="cr-swap-title">
          Select a wiggling card to swap in <strong>{swapMark.name}</strong> (
          {swapMark.keystone ? "0N Keystone" : `${swapCost}N`})
        </div>
        <div className="cr-swap-sub">
          {swapMark.keystone
            ? "Clears 1 passive card to step down from +1N Purist and sockets Keystone"
            : "Tap any highlighted card in your Battle Deck"}
        </div>
      </div>
    </div>
    <button type="button" className="renown-btn" onClick={onCancelSwap}>
      Cancel
    </button>
  </div>
);

interface BeltSelectedBarProps {
  slotIdx: number;
  slotItem: EquippedSlot;
  mark: MarkItem;
  effectiveCost: number;
  onSetCardRank: (markId: number, rank: number) => void;
  onOpenCardInfo: (markId: number) => void;
  onOpenSlotPicker: (slotIdx: number) => void;
  onUnequipSlot: (slotIdx: number) => void;
}

export const BeltSelectedBar: React.FC<BeltSelectedBarProps> = ({
  slotIdx,
  slotItem,
  mark,
  effectiveCost,
  onSetCardRank,
  onOpenCardInfo,
  onOpenSlotPicker,
  onUnequipSlot
}) => {
  const rankDesc = mark.desc.split(" | ")[slotItem.rank - 1] || mark.desc;

  return (
    <div className="cr-belt-selected-bar">
      <div className="cr-selected-meta">
        <img
          src={`assets/marks/mark_${String(mark.id).padStart(2, "0")}.png`}
          alt={mark.name}
          className="cr-swap-thumb"
        />
        <div className="cr-selected-copy">
          <div className="cr-selected-name">
            <span>{mark.name}</span>
            <span className="cr-selected-cost font-tabular">
              {mark.keystone ? "0N Keystone" : `${effectiveCost}N`}
            </span>
          </div>
          <div className="cr-selected-desc">{rankDesc}</div>
        </div>
      </div>

      <div className="cr-selected-controls">
        <div className="renown-rank-selector" role="group" aria-label="Mastery Rank">
          {[1, 2, 3].map((r) => (
            <button
              key={r}
              type="button"
              className={`renown-rank-btn ${slotItem.rank === r ? "active" : ""}`}
              onClick={() => onSetCardRank(mark.id, r)}
            >
              R{r}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="renown-btn"
          onClick={() => onOpenCardInfo(mark.id)}
        >
          <Info size={13} />
          <span>Info</span>
        </button>

        <button
          type="button"
          className="renown-btn"
          onClick={() => onOpenSlotPicker(slotIdx)}
        >
          <RotateCcw size={13} />
          <span>Swap</span>
        </button>

        <button
          type="button"
          className="renown-btn cr-btn-danger"
          onClick={() => onUnequipSlot(slotIdx)}
        >
          <Trash2 size={13} />
          <span>Remove</span>
        </button>
      </div>
    </div>
  );
};

interface BeltFooterProps {
  totals: BeltTotals;
  statsBonus: CombatStats;
}

export const BeltFooter: React.FC<BeltFooterProps> = ({ totals, statsBonus }) => {
  const {
    totalNotches,
    effectiveBeltCapacity,
    offenseNotches,
    equippedKeystone
  } = totals;
  const hasKeystone = Boolean(equippedKeystone);
  const isOverBudget = totalNotches > effectiveBeltCapacity;

  return (
    <div className="cr-deck-footer">
      <div className="cr-notch-meter-group">
        <div className="cr-meter-pill">
          <Sparkles size={13} color="var(--accent-gold)" />
          <span className="text-secondary">Notches</span>
          <strong
            className={[
              "font-tabular",
              isOverBudget
                ? "cr-stat-warn"
                : totalNotches === effectiveBeltCapacity
                ? "cr-stat-gold"
                : ""
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {totalNotches} / {effectiveBeltCapacity}N
            {!hasKeystone ? " (+1N Purist)" : ""}
          </strong>
        </div>

        <div className="cr-notch-segments" aria-hidden="true">
          {Array.from({ length: effectiveBeltCapacity }).map((_, i) => (
            <span
              key={i}
              className={[
                "cr-notch-seg",
                i < totalNotches ? "is-filled" : "",
                !hasKeystone && i === effectiveBeltCapacity - 1 ? "is-purist-seg" : ""
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>

        <div className="cr-meter-pill">
          <span className="text-secondary">Offense</span>
          <strong
            className={`font-tabular ${
              offenseNotches >= PASSIVE_OFFENSE_CAP ? "cr-stat-gold" : ""
            }`}
          >
            {offenseNotches} / {PASSIVE_OFFENSE_CAP}N
          </strong>
        </div>
      </div>

      <div className="cr-live-stats-strip font-tabular">
        <span>{(statsBonus.totalHp / 2).toFixed(1)} Hearts</span>
        <span className="cr-dot-sep">·</span>
        <span>{statsBonus.reach.toFixed(2)}m Reach</span>
        <span className="cr-dot-sep">·</span>
        <span>
          {statsBonus.speedPct >= 0 ? `+${statsBonus.speedPct}%` : `${statsBonus.speedPct}%`} Speed
        </span>
      </div>
    </div>
  );
};
