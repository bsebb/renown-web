import React from "react";
import { Lock, Sparkles, Zap } from "lucide-react";
import { MarkItem } from "../data/renownData";
import { EquippedSlot } from "./RenownBelt";
import { EligibilityResult } from "./deckValidation";

interface RenownGridProps {
  marks: MarkItem[];
  currentBelt: (EquippedSlot | null)[];
  markRanks: Record<number, number>;
  ownedMarks: Record<number, number>;
  viewMode: "all" | "owned";
  getEffectiveCost: (mark: MarkItem, rank: number) => number;
  checkEligibility: (mark: MarkItem, rank: number) => EligibilityResult;
  onDragStartCard: (e: React.DragEvent, markId: number) => void;
  onLibraryRankChange: (markId: number, rank: number, e: React.MouseEvent) => void;
  onCardToggleEquip: (mark: MarkItem) => void;
}

export const RenownGrid: React.FC<RenownGridProps> = ({
  marks,
  currentBelt,
  markRanks,
  ownedMarks,
  viewMode,
  getEffectiveCost,
  checkEligibility,
  onDragStartCard,
  onLibraryRankChange,
  onCardToggleEquip
}) => {
  return (
    <div className="renown-marks-grid">
      {marks.map((m) => {
        const isEquipped = currentBelt.some((s) => s?.markId === m.id);
        const currentItem = currentBelt.find((s) => s?.markId === m.id);
        const currentRank = currentItem ? currentItem.rank : markRanks[m.id] || 1;
        const effCost = getEffectiveCost(m, currentRank);
        const isDiscounted = !m.keystone && m.cost >= 3 && currentRank === 3;
        const isOwned = viewMode !== "owned" || Boolean(ownedMarks[m.id]);
        const ownedRank = ownedMarks[m.id] || 0;
        const descParts = m.desc.split(" | ");

        const eligibility = checkEligibility(m, currentRank);

        return (
          <div
            key={m.id}
            className={`renown-mark-card ${isEquipped ? "equipped-in-belt" : ""} ${
              !isOwned ? "unowned-locked" : ""
            }`}
            style={{
              opacity: !isOwned || (!isEquipped && !eligibility.eligible) ? 0.7 : 1
            }}
            draggable={isOwned && (isEquipped || eligibility.eligible)}
            onDragStart={(e) => isOwned && onDragStartCard(e, m.id)}
            title={
              !isOwned
                ? `${m.name} is locked in your collection. Unlock via: ${m.advancement}`
                : isEquipped
                ? `${m.name} (Equipped in Belt)`
                : eligibility.reason || `${m.name} - Drag to belt or click to equip`
            }
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <img
                src={`assets/marks/mark_${String(m.id).padStart(2, "0")}.png`}
                className="renown-card-icon"
                alt={m.name}
                onError={(e) => {
                  (e.target as HTMLElement).style.opacity = "0.2";
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {m.name}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap", marginTop: "4px" }}>
                  <span className={`renown-pill ${isDiscounted ? "renown-pill-discount" : "renown-pill-cost"}`}>
                    {m.keystone ? "0 Notches" : `${effCost} Notch${effCost === 1 ? "" : "es"}${isDiscounted ? " (R3 -1N)" : ""}`}
                  </span>
                  <span className={`renown-pill renown-pill-${m.tier.toLowerCase()}`}>
                    {m.tier}
                  </span>
                  {m.keystone && (
                    <span className="renown-pill renown-pill-keystone" style={{ gap: "3px" }}>
                      <Sparkles size={10} />
                      <span>Keystone</span>
                    </span>
                  )}
                  {m.active && (
                    <span className="renown-pill renown-pill-active" style={{ gap: "3px" }}>
                      <Zap size={10} />
                      <span>Active</span>
                    </span>
                  )}
                  {!isOwned && (
                    <span className="renown-pill renown-pill-locked">
                      <Lock size={10} />
                      <span>Locked</span>
                    </span>
                  )}
                  {viewMode === "owned" && isOwned && (
                    <span className="renown-pill" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
                      Mastery R{ownedRank}
                    </span>
                  )}
                  {!isEquipped && !eligibility.eligible && eligibility.reason && (
                    <span
                      className="renown-pill"
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#FCA5A5",
                        border: "1px solid rgba(239, 68, 68, 0.3)"
                      }}
                      title={eligibility.reason}
                    >
                      {eligibility.actionLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="renown-card-desc">
              {descParts.map((part, pIdx) => {
                const p = part.trim();
                const isR1 = currentRank === 1 && p.startsWith("R1:");
                const isR2 = currentRank === 2 && p.startsWith("R2:");
                const isR3 = currentRank === 3 && p.startsWith("R3:");
                const isActiveText = isR1 || isR2 || isR3;

                return (
                  <span key={pIdx}>
                    {pIdx > 0 && " | "}
                    <span className={isActiveText ? "renown-rank-active-text" : undefined}>{p}</span>
                  </span>
                );
              })}
            </div>

            <div className="renown-card-footer">
              <div className="renown-rank-selector">
                {[1, 2, 3].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`renown-rank-btn ${currentRank === r ? "active" : ""}`}
                    onClick={(e) => onLibraryRankChange(m.id, r, e)}
                  >
                    R{r}
                  </button>
                ))}
              </div>

              {isEquipped ? (
                <button
                  type="button"
                  className="renown-btn renown-btn-gold"
                  style={{ padding: "4px 10px", fontSize: "11px" }}
                  onClick={() => onCardToggleEquip(m)}
                >
                  Unequip
                </button>
              ) : !eligibility.eligible ? (
                <button
                  type="button"
                  className="renown-btn"
                  style={{ padding: "4px 10px", fontSize: "11px", opacity: 0.5, cursor: "not-allowed" }}
                  disabled
                  title={eligibility.reason}
                >
                  {eligibility.actionLabel}
                </button>
              ) : (
                <button
                  type="button"
                  className={`renown-btn ${m.keystone ? "renown-btn-gold" : ""}`}
                  style={{ padding: "4px 10px", fontSize: "11px" }}
                  onClick={() => onCardToggleEquip(m)}
                >
                  {eligibility.actionLabel}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
