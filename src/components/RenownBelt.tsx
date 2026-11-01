import React from "react";
import { Trash2, RotateCcw, Lock, Zap, Crown } from "lucide-react";
import { ALL_MARKS, MarkItem } from "../data/renownData";
import { KEYSTONE_SLOT_INDEX } from "./deckValidation";
import { DraggingInfo } from "./useRenownDeck";

export interface EquippedSlot {
  markId: number;
  rank: number;
}

interface RenownBeltProps {
  currentBelt: (EquippedSlot | null)[];
  activeBuildSlot: number;
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
  return (
    <section className="renown-belt-chassis" aria-label="Equipped Loadout Belt">
      <div className="renown-chassis-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
            Equipped 10-Notch Belt
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
            Deck Slot {activeBuildSlot} Active
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div className="renown-meter-badge">
            <span style={{ color: "var(--text-muted)" }}>Capacity:</span>
            <span style={{ color: totalNotches >= 10 ? "var(--accent-gold)" : "var(--text-primary)" }}>
              {totalNotches} / 10 Notches
            </span>
          </div>

          <div className="renown-meter-badge">
            <span style={{ color: "var(--text-muted)" }}>Offense:</span>
            <span style={{ color: offenseNotches >= 6 ? "#EF4444" : "var(--text-primary)" }}>
              {offenseNotches} / 6 Notches
            </span>
          </div>

          <div className="renown-meter-badge">
            <span style={{ color: "var(--text-muted)" }}>Keystone:</span>
            <span style={{ color: hasKeystone ? "var(--accent-gold)" : "var(--text-muted)" }}>
              {hasKeystone ? "1 / 1" : "0 / 1"}
            </span>
          </div>

          <button
            type="button"
            className="renown-btn"
            style={{ padding: "4px 8px", fontSize: "11px" }}
            onClick={onClear}
            title="Clear all equipped marks from this slot"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Progress Bar for 10-Notch Capacity */}
      <div className="renown-notch-bar-wrap" role="progressbar" aria-valuenow={totalNotches} aria-valuemax={10}>
        <div
          className={`renown-notch-bar-fill ${totalNotches >= 10 ? "full" : ""}`}
          style={{ width: `${Math.min((totalNotches / 10) * 100, 100)}%` }}
        />
      </div>

      {/* 10 Belt Sockets with Strict Role Constraints */}
      <div className="renown-slots-grid">
        {currentBelt.map((slotItem, idx) => {
          const isKeystoneAnchor = idx === KEYSTONE_SLOT_INDEX;
          const mark = slotItem ? ALL_MARKS.find((m) => m.id === slotItem.markId) : null;
          const effCost = mark && slotItem ? getEffectiveCost(mark, slotItem.rank) : 0;
          const isHovered = dragOverSlot === idx;

          // Drag target validity
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
                  ? `${mark?.name} (R${slotItem.rank}) &bull; Cost: ${effCost}N ${
                      mark?.keystone ? " &bull; Keystone" : ""
                    } ${mark?.active ? " &bull; Active (Shift+F)" : ""}`
                  : isKeystoneAnchor
                  ? "Slot 5: Dedicated Keystone Anchor (Only Keystone marks can be socketed here)"
                  : isCapacityLocked
                  ? "Slot Locked: All 10 Notches allocated. Unequip a mark to unlock."
                  : `Passive Socket ${idx + 1} (${remainingNotches} Notches available)`
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
                  <span className={`slot-rank ${isKeystoneAnchor ? "keystone-slot-rank" : ""}`}>R{slotItem.rank}</span>
                  <span className={`slot-cost ${isKeystoneAnchor ? "keystone-slot-cost" : ""}`}>{effCost}N</span>

                  {/* Keystone or Active indicator badge */}
                  {mark.keystone && (
                    <span
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "5px",
                        color: "var(--accent-gold)"
                      }}
                      title="Keystone Mark (Build Centerpiece)"
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

                  {/* Notch pips under mark */}
                  <div className="renown-notch-pips">
                    {Array.from({ length: effCost }).map((_, pIdx) => (
                      <span key={pIdx} className={`renown-notch-pip ${isKeystoneAnchor ? "keystone-pip" : ""}`} />
                    ))}
                  </div>
                </>
              ) : isKeystoneAnchor ? (
                <div className="keystone-empty-crest">
                  <Crown size={18} color="var(--accent-gold)" className="keystone-crown-icon" />
                  <span className="keystone-empty-title">
                    KEYSTONE
                  </span>
                  <span className="keystone-empty-sub">
                    ANCHOR
                  </span>
                </div>
              ) : isCapacityLocked ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textAlign: "center", padding: "4px" }}>
                  <Lock size={12} color="var(--text-muted)" />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                    LOCKED
                  </span>
                  <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.25)" }}>
                    10/10N
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textAlign: "center" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>
                    &le;{remainingNotches}N
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
          <div
            style={{ position: "fixed", inset: 0, zIndex: 499 }}
            onClick={onClosePopover}
          />
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
                        {effCost} Notches &bull; {mark.tier} {isKeystone ? "&bull; Keystone" : ""}
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
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Rank:</span>
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
