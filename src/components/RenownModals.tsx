import React, { useState } from "react";
import { X, Search, Crown, Zap, Sparkles } from "lucide-react";
import { ALL_MARKS, MarkItem } from "../data/renownData";
import {
  BeltCapacityTier,
  EquippedSlot,
  KEYSTONE_SLOT_INDEX,
  checkMarkEligibility,
  findValidSwapSlots
} from "./deckValidation";
import { SlidingSegmented } from "./SlidingSegmented";

interface CardDetailSheetProps {
  markId: number | null;
  onClose: () => void;
  currentBelt: (EquippedSlot | null)[];
  viewMode: "all" | "owned";
  ownedMarks: Record<number, number>;
  beltCapacity: BeltCapacityTier;
  getRankForMark: (markId: number) => number;
  getEffectiveCost: (mark: MarkItem, rank: number) => number;
  onSetCardRank: (markId: number, rank: number) => void;
  onUseCard: (mark: MarkItem, rank: number) => void;
}

export const CardDetailSheet: React.FC<CardDetailSheetProps> = ({
  markId,
  onClose,
  currentBelt,
  viewMode,
  ownedMarks,
  beltCapacity,
  getRankForMark,
  getEffectiveCost,
  onSetCardRank,
  onUseCard
}) => {
  if (markId === null) return null;
  const mark = ALL_MARKS.find((m) => m.id === markId);
  if (!mark) return null;

  const rank = getRankForMark(mark.id);
  const effCost = getEffectiveCost(mark, rank);
  const isDiscounted = !mark.keystone && mark.cost >= 3 && rank === 3;
  const isEquipped = currentBelt.some((s) => s?.markId === mark.id);
  const isOwned = viewMode !== "owned" || Boolean(ownedMarks[mark.id]);
  const direct = checkMarkEligibility(
    currentBelt,
    mark,
    rank,
    undefined,
    viewMode,
    ownedMarks,
    beltCapacity
  );
  const canSwap =
    !isEquipped &&
    !direct.eligible &&
    isOwned &&
    findValidSwapSlots(currentBelt, mark, rank, viewMode, ownedMarks, beltCapacity).length > 0;

  const parts = mark.desc.split(" | ").map((p) => p.trim());

  const ctaLabel = isEquipped
    ? "Remove from Battle Deck"
    : direct.eligible
    ? mark.keystone
      ? "Socket Keystone (0N)"
      : `Use in Deck (${effCost}N)`
    : canSwap
    ? `Select Card to Swap (${mark.keystone ? "0N" : `${effCost}N`})`
    : direct.actionLabel;

  return (
    <div className="renown-modal-backdrop" onClick={onClose}>
      <div
        className="cr-detail-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={mark.name}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cr-sheet-grabber" aria-hidden="true" />

        <div className="cr-detail-header">
          <div className="cr-detail-art">
            <img
              src={`assets/marks/mark_${String(mark.id).padStart(2, "0")}.png`}
              alt={mark.name}
              draggable={false}
            />
            <span
              className={`cr-cost-gem ${
                mark.keystone || isDiscounted ? "is-gold-text" : ""
              }`}
            >
              {mark.keystone ? "0N" : `${effCost}N`}
            </span>
          </div>

          <div className="cr-detail-heading-group">
            <div className="cr-detail-title-row">
              <h3 className="cr-detail-title">{mark.name}</h3>
              {mark.keystone && <Crown size={15} color="var(--accent-gold)" />}
              {mark.active && <Zap size={15} color="var(--accent-gold)" />}
            </div>
            <div className="cr-detail-sub">
              {mark.tier} · {mark.domain} ·{" "}
              {mark.keystone
                ? "Zero-Notch Keystone"
                : `${effCost} Notch${effCost === 1 ? "" : "es"}`}
            </div>
            <div className="cr-detail-adv">Unlock: {mark.advancement}</div>
          </div>

          <button
            type="button"
            className="cr-close-btn"
            onClick={onClose}
            aria-label="Close card info"
          >
            <X size={17} />
          </button>
        </div>

        <div className="cr-detail-rank-bar">
          <span className="cr-detail-rank-label">Preview Mastery Rank</span>
          <SlidingSegmented
            options={[
              { id: 1, label: "Rank I" },
              { id: 2, label: "Rank II" },
              { id: 3, label: mark.cost >= 3 && !mark.keystone ? "Rank III (-1N)" : "Rank III" }
            ]}
            value={rank}
            onChange={(val) => onSetCardRank(mark.id, val)}
          />
        </div>

        <div className="ios-grouped-card">
          {parts.map((line, idx) => {
            const isSelectedRank =
              (rank === 1 && line.startsWith("R1:")) ||
              (rank === 2 && line.startsWith("R2:")) ||
              (rank === 3 && line.startsWith("R3:"));
            return (
              <div
                key={idx}
                className={`ios-hairline-row cr-rank-spec-row ${
                  isSelectedRank ? "is-active-rank" : ""
                }`}
              >
                {line}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className={`renown-btn cr-sheet-cta ${
            isEquipped ? "cr-btn-danger" : "renown-btn-gold"
          }`}
          disabled={!isOwned && !isEquipped}
          onClick={() => {
            onUseCard(mark, rank);
            onClose();
          }}
        >
          <span>{ctaLabel}</span>
        </button>
      </div>
    </div>
  );
};

interface QuickPickerModalProps {
  slotIdx: number | null;
  onClose: () => void;
  onSelectMark: (markId: number, slotIdx: number, preferredRank: number) => void;
  viewMode: "all" | "owned";
  ownedMarks: Record<number, number>;
  currentBelt: (EquippedSlot | null)[];
  getRankForMark: (markId: number) => number;
  getEffectiveCost: (mark: MarkItem, rank: number) => number;
  remainingNotches: number;
  beltCapacity: BeltCapacityTier;
}

export const QuickPickerModal: React.FC<QuickPickerModalProps> = ({
  slotIdx,
  onClose,
  onSelectMark,
  viewMode,
  ownedMarks,
  currentBelt,
  getRankForMark,
  getEffectiveCost,
  remainingNotches,
  beltCapacity
}) => {
  const [search, setSearch] = useState<string>("");
  const [modalDomain, setModalDomain] = useState<string>("ALL");

  if (slotIdx === null) return null;
  const isKeystoneSlot = slotIdx === KEYSTONE_SLOT_INDEX;
  const passiveOrdinal = slotIdx < KEYSTONE_SLOT_INDEX ? slotIdx + 1 : slotIdx;

  const marksToDisplay = ALL_MARKS.filter((m) => {
    if (isKeystoneSlot && !m.keystone) return false;
    if (!isKeystoneSlot && m.keystone) return false;
    if (viewMode === "owned" && !ownedMarks[m.id]) return false;
    if (!isKeystoneSlot && modalDomain !== "ALL" && m.domain !== modalDomain) return false;
    const q = search.toLowerCase().trim();
    return (
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.desc.toLowerCase().includes(q) ||
      m.advancement.toLowerCase().includes(q)
    );
  });

  return (
    <div className="renown-modal-backdrop" onClick={onClose}>
      <div className="cr-detail-sheet cr-picker-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="cr-sheet-grabber" aria-hidden="true" />
        <div className="cr-sheet-top-row">
          <div>
            <div className="cr-detail-title-row">
              {isKeystoneSlot && <Sparkles size={15} color="var(--accent-gold)" />}
              <h3 className="cr-detail-title">
                {isKeystoneSlot
                  ? "Select Zero-Notch Keystone"
                  : `Select Card for Passive Socket ${passiveOrdinal}`}
              </h3>
            </div>
            <div className="cr-detail-sub">
              {isKeystoneSlot
                ? "12 Keystones (3 per domain, 0N). Leaving Center Anchor empty grants +1N Purist."
                : `${remainingNotches} Passive Notches free · Max 4 Offense Notches`}
            </div>
          </div>
          <button type="button" className="cr-close-btn" onClick={onClose} aria-label="Close picker">
            <X size={17} />
          </button>
        </div>

        {!isKeystoneSlot && (
          <div className="cr-domain-scroll">
            <SlidingSegmented
              options={[
                { id: "ALL", label: "All" },
                { id: "Offense", label: "Offense" },
                { id: "Defense", label: "Defense" },
                { id: "Mobility", label: "Mobility" },
                { id: "Utility", label: "Utility" }
              ]}
              value={modalDomain}
              onChange={setModalDomain}
            />
          </div>
        )}

        <div className="cr-search-box is-full-width">
          <Search size={14} className="cr-search-icon" />
          <input
            type="text"
            placeholder={isKeystoneSlot ? "Search 12 Keystones..." : "Search passive marks..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cr-search-input"
          />
        </div>

        <div className="cr-picker-grid">
          {marksToDisplay.map((m) => {
            const rank = getRankForMark(m.id);
            const cost = getEffectiveCost(m, rank);
            const isDiscounted = !m.keystone && m.cost >= 3 && rank === 3;
            const check = checkMarkEligibility(
              currentBelt,
              m,
              rank,
              slotIdx,
              viewMode,
              ownedMarks,
              beltCapacity
            );
            const isEquippedHere = currentBelt[slotIdx]?.markId === m.id;
            const isEquippedElsewhere =
              !isEquippedHere && currentBelt.some((s) => s?.markId === m.id);
            const disabled =
              (!check.eligible && check.actionType === "disabled") || isEquippedElsewhere;

            return (
              <button
                key={m.id}
                type="button"
                disabled={disabled}
                className={`cr-collectible-card ${disabled ? "is-unowned" : ""}`}
                onClick={() => {
                  if (!disabled) {
                    onSelectMark(m.id, slotIdx, rank);
                    onClose();
                  }
                }}
              >
                <span
                  className={`cr-cost-gem ${
                    m.keystone || isDiscounted ? "is-gold-text" : ""
                  }`}
                >
                  {m.keystone ? "0N" : `${cost}N`}
                </span>
                <div className="cr-card-art-stage">
                  <img
                    src={`assets/marks/mark_${String(m.id).padStart(2, "0")}.png`}
                    alt={m.name}
                    className="cr-card-sprite"
                    draggable={false}
                  />
                </div>
                <div className="cr-card-meta">
                  <div className="cr-card-title">{m.name}</div>
                  <div className="cr-card-level-row">
                    <span className="cr-card-domain">
                      {disabled ? check.actionLabel : m.domain}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importStr: string) => void;
  onQuickLoadStarter: () => void;
  onUnlockAll: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onQuickLoadStarter,
  onUnlockAll
}) => {
  const [input, setInput] = useState<string>("");
  if (!isOpen) return null;

  return (
    <div className="renown-modal-backdrop" onClick={onClose}>
      <div className="cr-detail-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="cr-sheet-grabber" aria-hidden="true" />
        <div className="cr-sheet-top-row">
          <h3 className="cr-detail-title">Import Owned Collection</h3>
          <button type="button" className="cr-close-btn" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <p className="cr-import-help">
          Run <code className="cr-inline-code">/renown export</code> in-game and paste your string
          below to filter cards by your unlocked Mastery ranks.
        </p>

        <textarea
          rows={3}
          placeholder="Example: 1:2,3:2,14:2,30:1,45:1,52:1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="cr-import-textarea"
        />

        <div className="cr-import-footer">
          <div className="cr-import-presets">
            <button
              type="button"
              className="renown-btn"
              onClick={() => {
                onQuickLoadStarter();
                onClose();
              }}
            >
              Day 1 Starter
            </button>
            <button
              type="button"
              className="renown-btn"
              onClick={() => {
                onUnlockAll();
                onClose();
              }}
            >
              Unlock All 55 (R3)
            </button>
          </div>

          <button
            type="button"
            className="renown-btn renown-btn-gold"
            onClick={() => {
              onImport(input);
              onClose();
            }}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};
