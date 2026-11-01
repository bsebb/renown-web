import React from "react";
import { Trash2, RotateCcw, Lock, Zap, Crown } from "lucide-react";
import { ALL_MARKS, MarkItem } from "../data/renownData";
import {
  BeltCapacityTier,
  KEYSTONE_SLOT_INDEX,
  PASSIVE_OFFENSE_CAP,
  UNANCHORED_PURIST_BONUS
} from "./deckValidation";
import { SlidingSegmented } from "./SlidingSegmented";
import { DraggingInfo } from "./useRenownDeck";

export interface EquippedSlot {
  markId: number;
  rank: number;
}

interface RenownBeltProps {
  currentBelt: (EquippedSlot | null)[];
  activeBuildSlot: number;
  beltCapacity: BeltCapacityTier;
  onChangeBeltCapacity: (cap: BeltCapacityTier) => void;
  totalNotches: number;
  remainingNotches: number;
  offenseNotches: number;
  hasKeystone: boolean;
  dragOverSlot: number | null;
  draggingInfo: DraggingInfo | null;
  setDragOverSlot: (slot: number | null) => void;
  onDragStartSocket: (e: React.DragEvent, idx: number) => void;
  onDragOver: (e: React.DragEvent, idx: number) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, idx: number) => void;
  onClear: () => void;
  onSlotClick: (e: React.MouseEvent<HTMLDivElement>, idx: number) => void;
  socketPopover: { slotIdx: number; x: number; y: number } | null;
  onClosePopover: () => void;
  onSetSlotRank: (slotIdx: number, rank: number) => void;
  onSwapSlot: (slotIdx: number) => void;
  onUnequipSlot: (slotIdx: number) => void;
  getEffectiveCost: (mark: MarkItem, rank: number) => number;
}

export const RenownBelt: React.FC<RenownBeltProps> = ({
  currentBelt,
  activeBuildSlot,
  beltCapacity,
  onChangeBeltCapacity,
  totalNotches,
  remainingNotches,
  offenseNotches,
  hasKeystone,
  dragOverSlot,
  draggingInfo,
  setDragOverSlot,
  onDragStartSocket,
  onDragOver,
  onDragEnd,
  onDrop,
  onClear,
  onSlotClick,
  socketPopover,
  onClosePopover,
  onSetSlotRank,
  onSwapSlot,
  onUnequipSlot,
  getEffectiveCost
}) => {
  const effectiveCap = beltCapacity + (hasKeystone ? 0 : UNANCHORED_PURIST_BONUS);
  const isOverBudget = totalNotches > effectiveCap;

  return (
    <section className="renown-belt-chassis" aria-label="Equipped Loadout Belt">
      <div className="renown-chassis-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
            Symmetrical 9-Slot Belt
          </span>
          <span
            style={{
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "4px",
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              fontWeight: 600
            }}
          >
            Deck {activeBuildSlot}
          </span>

          <SlidingSegmented
            options={[
              { id: 6, label: "Day 1 (6N)" },
              { id: 7, label: "Crucible (7N)" },
              { id: 8, label: "Sovereign (8N)" }
            ]}
            value={beltCapacity}
            onChange={(val) => onChangeBeltCapacity(val as BeltCapacityTier)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div className="renown-meter-badge">
            <span style={{ color: "var(--text-muted)" }}>Passive:</span>
            <span
              style={{
                color: isOverBudget
                  ? "#EF4444"
                  : totalNotches === effectiveCap
                  ? "var(--accent-gold)"
                  : "var(--text-primary)",
                fontVariantNumeric: "tabular-nums"
              }}
            >
              {totalNotches} / {effectiveCap} Notches{!hasKeystone ? " (+1N Purist)" : ""}
            </span>
          </div>

          <div className="renown-meter-badge">
            <span style={{ color: "var(--text-muted)" }}>Offense:</span>
            <span
              style={{
                color: offenseNotches >= PASSIVE_OFFENSE_CAP ? "#EF4444" : "var(--text-primary)",
                fontVariantNumeric: "tabular-nums"
              }}
            >
              {offenseNotches} / {PASSIVE_OFFENSE_CAP} Notches
            </span>
          </div>

          <div className="renown-meter-badge">
            <span style={{ color: "var(--text-muted)" }}>Keystone:</span>
            <span style={{ color: hasKeystone ? "var(--accent-gold)" : "var(--text-secondary)" }}>
              {hasKeystone ? "1 / 1 (0N)" : "Empty (+1N Purist)"}
            </span>
          </div>

          <button
            type="button"
            className="renown-btn"
            style={{ padding: "4px 8px", fontSize: "11px" }}
            onClick={onClear}
            title="Clear all equipped marks from this deck"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Progress Bar for Passive Notch Capacity */}
      <div
        className="renown-notch-bar-wrap"
        role="progressbar"
        aria-valuenow={totalNotches}
        aria-valuemax={effectiveCap}
      >
        <div
          className={`renown-notch-bar-fill ${
            isOverBudget ? "danger" : totalNotches === effectiveCap ? "full" : ""
          }`}
          style={{ width: `${Math.min((totalNotches / effectiveCap) * 100, 100)}%` }}
        />
      </div>

      {/* 9 Belt Sockets: 4 Passive Left + 1 Center Zero-Notch Keystone Anchor + 4 Passive Right */}
      <div className="renown-slots-grid">
        {currentBelt.map((slotItem, idx) => {
          const isKeystoneAnchor = idx === KEYSTONE_SLOT_INDEX;
          const mark = slotItem ? ALL_MARKS.find((m) => m.id === slotItem.markId) : null;
          const effCost = mark && slotItem ? getEffectiveCost(mark, slotItem.rank) : 0;
          const isHovered = dragOverSlot === idx;

          let dragClass = "";
          if (draggingInfo) {
            if (isKeystoneAnchor) {
              dragClass = draggingInfo.isKeystone ? "drag-drop-valid" : "drag-drop-invalid";
            } else {
              if (draggingInfo.isKeystone) {
                dragClass = "drag-drop-invalid";
              } else if (!slotItem && draggingInfo.cost > remainingNotches) {
                dragClass = "drag-drop-invalid";
              } else {
                dragClass = "drag-drop-valid";
              }
            }
          }

          const isCapacityLocked = !slotItem && !isKeystoneAnchor && remainingNotches === 0;
          const passiveLabelNum = idx < KEYSTONE_SLOT_INDEX ? idx + 1 : idx;

          return (
            <div
              key={idx}
              className={`renown-slot ${slotItem ? "occupied" : ""} ${
                isKeystoneAnchor ? "keystone-anchor" : ""
              } ${slotItem?.rank && mark?.active ? "active-marked" : ""} ${
                isCapacityLocked ? "slot-capacity-locked" : ""
              } ${isHovered ? "drag-target-hover" : ""} ${dragClass}`}
              draggable={Boolean(slotItem)}
              onDragStart={(e) => slotItem && onDragStartSocket(e, idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDragLeave={() => setDragOverSlot(null)}
              onDragEnd={onDragEnd}
              onDrop={(e) => onDrop(e, idx)}
              onClick={(e) => onSlotClick(e, idx)}
              title={
                slotItem
                  ? `${mark?.name} (R${slotItem.rank}) - ${
                      mark?.keystone ? "Zero-Notch Keystone" : `Cost: ${effCost}N`
                    }${mark?.active ? " - Active (Shift+F)" : ""}`
                  : isKeystoneAnchor
                  ? "Center Slot 5: Socket 1 of 12 Keystones (0N), or leave empty for +1 Unanchored Purist Notch"
                  : isCapacityLocked
                  ? `Slot Locked: All ${effectiveCap} Passive Notches allocated. Unequip a mark or upgrade belt tier.`
                  : `Passive Socket ${passiveLabelNum} (${remainingNotches} Notches available)`
              }
            >
              {slotItem && mark ? (
                <>
                  {isKeystoneAnchor && <div className="keystone-inner-halo" />}
                  <img
                    src={`assets/marks/mark_${String(mark.id).padStart(2, "0")}.png`}
                    alt={mark.name}
                    className={isKeystoneAnchor ? "keystone-occupied-img" : undefined}
                    onError={(e) => {
                      (e.target as HTMLElement).style.opacity = "0.2";
                    }}
                  />
                  <span className={`slot-rank ${isKeystoneAnchor ? "keystone-slot-rank" : ""}`}>
                    R{slotItem.rank}
                  </span>
                  <span className={`slot-cost ${isKeystoneAnchor ? "keystone-slot-cost" : ""}`}>
                    {mark.keystone ? "0N" : `${effCost}N`}
                  </span>

                  {mark.keystone && (
                    <span
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "5px",
                        color: "var(--accent-gold)"
                      }}
                      title="Zero-Notch Keystone Anchor"
                    >
                      <Crown size={12} />
                    </span>
                  )}
                  {mark.active && (
                    <span
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "5px",
                        color: "#DDD6FE"
                      }}
                      title="Active Ability (Shift+F)"
                    >
                      <Zap size={11} />
                    </span>
                  )}

                  {!mark.keystone && effCost > 0 && (
                    <div className="renown-notch-pips">
                      {Array.from({ length: effCost }).map((_, pIdx) => (
                        <span key={pIdx} className="renown-notch-pip" />
                      ))}
                    </div>
                  )}
                </>
              ) : isKeystoneAnchor ? (
                <div className="keystone-empty-crest">
                  <Crown size={18} color="var(--accent-gold)" className="keystone-crown-icon" />
                  <span className="keystone-empty-title">KEYSTONE</span>
                  <span className="keystone-empty-sub">0N | +1N Purist</span>
                </div>
              ) : isCapacityLocked ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    textAlign: "center",
                    padding: "4px"
                  }}
                >
                  <Lock size={12} color="var(--text-muted)" />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                    Full
                  </span>
                  <span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.35)" }}>
                    {totalNotches}/{effectiveCap}N
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    textAlign: "center"
                  }}
                >
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>
                    {passiveLabelNum}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>
                    max {remainingNotches}N
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Socket Context Popover */}
      {socketPopover && currentBelt[socketPopover.slotIdx] && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 499 }} onClick={onClosePopover} />
          <div
            className="renown-socket-popover"
            style={{
              top: `${Math.min(socketPopover.y, window.innerHeight - 260)}px`,
              left: `${Math.max(16, Math.min(socketPopover.x, window.innerWidth - 240))}px`
            }}
          >
            {(() => {
              const item = currentBelt[socketPopover.slotIdx]!;
              const mark = ALL_MARKS.find((m) => m.id === item.markId);
              if (!mark) return null;
              const effCost = getEffectiveCost(mark, item.rank);
              const isKeystone = socketPopover.slotIdx === KEYSTONE_SLOT_INDEX;

              return (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img
                      src={`assets/marks/mark_${String(mark.id).padStart(2, "0")}.png`}
                      alt={mark.name}
                      style={{ width: "32px", height: "32px", imageRendering: "pixelated" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {mark.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--accent-gold)" }}>
                        {isKeystone ? "Keystone (0N)" : `${effCost} Notches`} | {mark.tier}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid var(--border-subtle)",
                      paddingTop: "8px"
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Mastery:</span>
                    <div className="renown-rank-selector">
                      {[1, 2, 3].map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={`renown-rank-btn ${item.rank === r ? "active" : ""}`}
                          onClick={() => onSetSlotRank(socketPopover.slotIdx, r)}
                        >
                          R{r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "6px", paddingTop: "4px" }}>
                    <button
                      type="button"
                      className="renown-btn"
                      style={{ flex: 1, padding: "5px 8px", fontSize: "11px", justifyContent: "center" }}
                      onClick={() => onSwapSlot(socketPopover.slotIdx)}
                    >
                      <RotateCcw size={11} />
                      <span>Swap</span>
                    </button>
                    <button
                      type="button"
                      className="renown-btn"
                      style={{
                        flex: 1,
                        padding: "5px 8px",
                        fontSize: "11px",
                        justifyContent: "center",
                        borderColor: "rgba(239, 68, 68, 0.4)",
                        color: "#FCA5A5"
                      }}
                      onClick={() => onUnequipSlot(socketPopover.slotIdx)}
                    >
                      <Trash2 size={11} />
                      <span>Unequip</span>
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}
    </section>
  );
};
