import React from "react";
import {
  Crown,
  Trash2,
  Zap,
  Lock,
  Plus,
  SlidersHorizontal
} from "lucide-react";
import { ALL_MARKS, MarkItem } from "../data/renownData";
import {
  BeltCapacityTier,
  BeltTotals,
  EquippedSlot,
  KEYSTONE_SLOT_INDEX
} from "./deckValidation";
import { DECK_SLOT_IDS } from "./renownStorage";
import { CombatStats } from "./renownImportExport";
import { SlidingSegmented } from "./SlidingSegmented";
import { ActivePointerDrag } from "./usePointerDeckDrag";
import { PendingSwapState, SelectedCardState } from "./useRenownDeck";
import { BeltFooter, BeltSelectedBar, BeltSwapBanner } from "./BeltSubbars";

interface RenownBeltProps {
  currentBelt: (EquippedSlot | null)[];
  activeBuildSlot: number;
  onSelectBuildSlot: (slot: number) => void;
  beltCapacity: BeltCapacityTier;
  onChangeBeltCapacity: (cap: BeltCapacityTier) => void;
  totals: BeltTotals;
  statsBonus: CombatStats;
  selectedCard: SelectedCardState | null;
  onSelectBeltSlot: (slotIdx: number) => void;
  onOpenEmptySlotPicker: (slotIdx: number) => void;
  pendingSwap: PendingSwapState | null;
  onExecuteSwap: (slotIdx: number) => void;
  onCancelSwap: () => void;
  lastEquippedSlot: number | null;
  activeDrag: ActivePointerDrag | null;
  hoverSlotIdx: number | null;
  onStartSlotPointerDrag: (
    e: React.PointerEvent,
    slotIdx: number,
    item: EquippedSlot,
    mark: MarkItem
  ) => void;
  shouldSuppressClick: () => boolean;
  onSetCardRank: (markId: number, rank: number) => void;
  onOpenCardInfo: (markId: number) => void;
  onUnequipSlot: (slotIdx: number) => void;
  onClearDeck: () => void;
  onOpenStatsDrawer: () => void;
  getEffectiveCost: (mark: MarkItem, rank: number) => number;
}

const PASSIVE_INDICES = [0, 1, 2, 3, 5, 6, 7, 8];

export const RenownBelt: React.FC<RenownBeltProps> = ({
  currentBelt,
  activeBuildSlot,
  onSelectBuildSlot,
  beltCapacity,
  onChangeBeltCapacity,
  totals,
  statsBonus,
  selectedCard,
  onSelectBeltSlot,
  onOpenEmptySlotPicker,
  pendingSwap,
  onExecuteSwap,
  onCancelSwap,
  lastEquippedSlot,
  activeDrag,
  hoverSlotIdx,
  onStartSlotPointerDrag,
  shouldSuppressClick,
  onSetCardRank,
  onOpenCardInfo,
  onUnequipSlot,
  onClearDeck,
  onOpenStatsDrawer,
  getEffectiveCost
}) => {
  const { remainingNotches } = totals;
  const swapMark = pendingSwap ? ALL_MARKS.find((m) => m.id === pendingSwap.markId) : null;
  const swapCost = swapMark && pendingSwap ? getEffectiveCost(swapMark, pendingSwap.rank) : 0;

  const selectedBeltSlotIdx =
    selectedCard?.source === "belt" && selectedCard.slotIdx !== undefined
      ? selectedCard.slotIdx
      : null;
  const selectedSlotItem =
    selectedBeltSlotIdx !== null ? currentBelt[selectedBeltSlotIdx] : null;
  const selectedSlotMark = selectedSlotItem
    ? ALL_MARKS.find((m) => m.id === selectedSlotItem.markId) || null
    : null;

  const renderSlotCard = (idx: number) => {
    const isKeystoneAnchor = idx === KEYSTONE_SLOT_INDEX;
    const slotItem = currentBelt[idx];
    const mark = slotItem ? ALL_MARKS.find((m) => m.id === slotItem.markId) || null : null;
    const effCost = mark && slotItem ? getEffectiveCost(mark, slotItem.rank) : 0;
    const isDiscounted = Boolean(mark && !mark.keystone && mark.cost >= 3 && slotItem?.rank === 3);

    const isSwapValid = Boolean(pendingSwap?.validSlots.includes(idx));
    const isSwapDimmed = Boolean(pendingSwap && !isSwapValid);
    const isSelected = selectedBeltSlotIdx === idx && !pendingSwap;
    const isJustEquipped = lastEquippedSlot === idx;
    const isDragHover = hoverSlotIdx === idx;
    const isDraggingFromHere =
      activeDrag?.source === "socket" && activeDrag.fromSlotIdx === idx;

    let dragStateClass = "";
    if (activeDrag) {
      if (isKeystoneAnchor) {
        dragStateClass = activeDrag.isKeystone ? "drop-valid" : "drop-invalid";
      } else {
        dragStateClass = activeDrag.isKeystone ? "drop-invalid" : "drop-valid";
      }
    }

    const isCapacityLocked =
      !slotItem && !isKeystoneAnchor && remainingNotches === 0 && !pendingSwap && !activeDrag;
    const passiveOrdinal = idx < KEYSTONE_SLOT_INDEX ? idx + 1 : idx;

    const handleSlotClick = () => {
      if (shouldSuppressClick()) return;
      if (pendingSwap) {
        onExecuteSwap(idx);
        return;
      }
      if (slotItem) {
        onSelectBeltSlot(idx);
      } else {
        onOpenEmptySlotPicker(idx);
      }
    };

    return (
      <div
        key={idx}
        data-belt-slot={idx}
        role="button"
        tabIndex={0}
        aria-label={
          mark
            ? `${mark.name} Rank ${slotItem?.rank}`
            : isKeystoneAnchor
            ? "Keystone Anchor Slot"
            : `Empty Passive Socket ${passiveOrdinal}`
        }
        className={[
          "cr-deck-slot",
          slotItem ? "is-occupied" : "is-empty",
          isKeystoneAnchor ? "is-keystone-slot" : "",
          isSwapValid ? "is-wiggling" : "",
          isSwapDimmed ? "is-swap-dimmed" : "",
          isSelected ? "is-selected" : "",
          isJustEquipped ? "just-equipped" : "",
          isDragHover ? "is-drag-hover" : "",
          isDraggingFromHere ? "is-drag-origin" : "",
          isCapacityLocked ? "is-locked-cap" : "",
          dragStateClass
        ]
          .filter(Boolean)
          .join(" ")}
        onPointerDown={(e) => {
          if (slotItem && mark && !pendingSwap) {
            onStartSlotPointerDrag(e, idx, slotItem, mark);
          }
        }}
        onClick={handleSlotClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSlotClick();
          }
        }}
      >
        {slotItem && mark ? (
          <>
            <span
              className={`cr-cost-gem ${
                mark.keystone || isDiscounted ? "is-gold-text" : ""
              }`}
            >
              {mark.keystone ? "0N" : `${effCost}N`}
            </span>

            {mark.keystone ? (
              <span className="cr-corner-icon is-gold" title="Zero-Notch Keystone">
                <Crown size={11} />
              </span>
            ) : mark.active ? (
              <span className="cr-corner-icon" title="Shift+F Active">
                <Zap size={11} />
              </span>
            ) : null}

            <div className="cr-slot-art">
              <img
                src={`assets/marks/mark_${String(mark.id).padStart(2, "0")}.png`}
                alt={mark.name}
                className="cr-slot-sprite"
                draggable={false}
              />
            </div>

            <div className="cr-slot-footer">
              <span className="cr-slot-name">{mark.name}</span>
              <span className={`cr-slot-level ${slotItem.rank === 3 ? "is-max-rank" : ""}`}>
                R{slotItem.rank}
              </span>
            </div>
          </>
        ) : isKeystoneAnchor ? (
          <div className="cr-empty-keystone">
            <Crown size={17} color="var(--accent-gold)" />
            <span className="cr-empty-key-title">Keystone</span>
            <span className="cr-empty-key-sub">0N · +1N Purist</span>
          </div>
        ) : isCapacityLocked ? (
          <div className="cr-empty-socket is-full-socket" aria-hidden="true">
            <Lock size={12} />
          </div>
        ) : (
          <div className="cr-empty-socket" aria-hidden="true">
            <Plus size={15} strokeWidth={1.8} />
          </div>
        )}
      </div>
    );
  };

  const keystoneItem = currentBelt[KEYSTONE_SLOT_INDEX];
  const keystoneMark = keystoneItem
    ? ALL_MARKS.find((m) => m.id === keystoneItem.markId) || null
    : null;
  const isKeystoneWiggling = Boolean(pendingSwap?.validSlots.includes(KEYSTONE_SLOT_INDEX));

  return (
    <section
      className={`cr-battle-deck-stage ${pendingSwap ? "swap-mode-active" : ""}`}
      data-battle-deck="true"
      aria-label="Battle Deck"
    >
      <div className="cr-deck-topbar">
        <div className="cr-deck-tabs-group">
          <span className="cr-deck-label">Battle Deck</span>
          <SlidingSegmented
            options={DECK_SLOT_IDS.map((n) => ({ id: n, label: `${n}` }))}
            value={activeBuildSlot}
            onChange={onSelectBuildSlot}
          />
          <SlidingSegmented
            options={[
              { id: 6, label: "6N" },
              { id: 7, label: "7N" },
              { id: 8, label: "8N" }
            ]}
            value={beltCapacity}
            onChange={(val) => onChangeBeltCapacity(val as BeltCapacityTier)}
          />
        </div>

        <div className="cr-deck-actions">
          <button
            type="button"
            className="renown-btn hide-mobile"
            onClick={onOpenStatsDrawer}
            title="View combat stats, caps, and meta deck presets"
          >
            <SlidersHorizontal size={13} />
            <span>Stats &amp; Presets</span>
          </button>
          <button
            type="button"
            className="renown-btn"
            onClick={onClearDeck}
            title="Clear all cards from current deck"
          >
            <Trash2 size={13} />
            <span className="hide-xs">Clear</span>
          </button>
        </div>
      </div>

      {pendingSwap && swapMark && (
        <BeltSwapBanner
          swapMark={swapMark}
          swapCost={swapCost}
          onCancelSwap={onCancelSwap}
        />
      )}

      {/* Desktop 9-Across Symmetrical Belt: 4 Left + Center Keystone Pedestal + 4 Right */}
      <div className="cr-deck-desktop-row">
        {currentBelt.map((_, idx) => renderSlotCard(idx))}
      </div>

      {/* Mobile Clash Royale Layout: Keystone Anchor Bar + 4x2 Battle Deck Grid */}
      <div className="cr-deck-mobile-layout">
        <div
          data-belt-slot={KEYSTONE_SLOT_INDEX}
          role="button"
          tabIndex={0}
          className={[
            "cr-mobile-keystone-bar",
            keystoneMark ? "is-occupied" : "is-empty",
            isKeystoneWiggling ? "is-wiggling" : "",
            selectedBeltSlotIdx === KEYSTONE_SLOT_INDEX && !pendingSwap ? "is-selected" : "",
            lastEquippedSlot === KEYSTONE_SLOT_INDEX ? "just-equipped" : "",
            hoverSlotIdx === KEYSTONE_SLOT_INDEX ? "is-drag-hover" : ""
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => {
            if (shouldSuppressClick()) return;
            if (pendingSwap) {
              onExecuteSwap(KEYSTONE_SLOT_INDEX);
            } else if (keystoneItem) {
              onSelectBeltSlot(KEYSTONE_SLOT_INDEX);
            } else {
              onOpenEmptySlotPicker(KEYSTONE_SLOT_INDEX);
            }
          }}
        >
          <div className="cr-mobile-key-left">
            <div className="cr-mobile-key-emblem">
              {keystoneMark ? (
                <img
                  src={`assets/marks/mark_${String(keystoneMark.id).padStart(2, "0")}.png`}
                  alt={keystoneMark.name}
                  draggable={false}
                />
              ) : (
                <Crown size={18} color="var(--accent-gold)" />
              )}
            </div>
            <div className="cr-mobile-key-text">
              <div className="cr-mobile-key-title">
                {keystoneMark ? keystoneMark.name : "Empty Keystone Anchor"}
              </div>
              <div className="cr-mobile-key-sub">
                {keystoneMark && keystoneItem
                  ? `Keystone · Rank ${keystoneItem.rank} · ${keystoneMark.domain}`
                  : "Tap for 0N Keystone, or keep +1N Purist"}
              </div>
            </div>
          </div>
          <span className="cr-mobile-key-pill">
            {keystoneMark ? "0N Anchor" : "+1N Purist"}
          </span>
        </div>

        <div className="cr-mobile-4x2-grid">
          {PASSIVE_INDICES.map((idx) => renderSlotCard(idx))}
        </div>
      </div>

      {selectedBeltSlotIdx !== null && selectedSlotItem && selectedSlotMark && !pendingSwap && (
        <BeltSelectedBar
          slotIdx={selectedBeltSlotIdx}
          slotItem={selectedSlotItem}
          mark={selectedSlotMark}
          effectiveCost={getEffectiveCost(selectedSlotMark, selectedSlotItem.rank)}
          onSetCardRank={onSetCardRank}
          onOpenCardInfo={onOpenCardInfo}
          onOpenSlotPicker={onOpenEmptySlotPicker}
          onUnequipSlot={onUnequipSlot}
        />
      )}

      <BeltFooter totals={totals} statsBonus={statsBonus} />
    </section>
  );
};
