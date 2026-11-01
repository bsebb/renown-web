import React, { useState } from "react";
import { X, Search, Sparkles } from "lucide-react";
import { ALL_MARKS, MarkItem } from "../data/renownData";
import { EquippedSlot } from "./RenownBelt";
import { BeltCapacityTier, KEYSTONE_SLOT_INDEX, checkMarkEligibility } from "./deckValidation";
import { SlidingSegmented } from "./SlidingSegmented";

interface QuickPickerModalProps {
  slotIdx: number | null;
  onClose: () => void;
  onSelectMark: (markId: number, slotIdx: number, preferredRank: number) => void;
  viewMode: "all" | "owned";
  ownedMarks: Record<number, number>;
  markRanks: Record<number, number>;
  currentBelt: (EquippedSlot | null)[];
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
  markRanks,
  currentBelt,
  getEffectiveCost,
  remainingNotches,
  beltCapacity
}) => {
  const [search, setSearch] = useState<string>("");
  const [modalDomain, setModalDomain] = useState<string>("ALL");

  if (slotIdx === null) return null;

  const isKeystoneSlot = slotIdx === KEYSTONE_SLOT_INDEX;

  const marksToDisplay = ALL_MARKS.filter((m) => {
    // 1. Role separation: Keystone slot ONLY accepts Keystones; Passive slots reject Keystones
    if (isKeystoneSlot && !m.keystone) return false;
    if (!isKeystoneSlot && m.keystone) return false;

    // 2. Collection filter
    if (viewMode === "owned" && !ownedMarks[m.id]) return false;

    // 3. Domain filter (for passive slots)
    if (!isKeystoneSlot && modalDomain !== "ALL" && m.domain !== modalDomain) return false;

    // 4. Search query
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
      <div className="renown-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isKeystoneSlot && <Sparkles size={16} color="var(--accent-gold)" />}
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
                {isKeystoneSlot
                  ? "Select Zero-Notch Keystone (Center Anchor)"
                  : `Select Passive Mark for Slot ${slotIdx + 1}`}
              </h3>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
              {isKeystoneSlot
                ? "12 Domain-Balanced Keystones (3 per domain, 0 Notches). Leaving Slot 5 empty grants +1 Purist Notch."
                : `${remainingNotches} Passive Notches available. Max 4 Offense Notches.`}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ color: "var(--text-muted)" }} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* Domain Filters for Passive Slots */}
        {!isKeystoneSlot && (
          <SlidingSegmented
            options={[
              { id: "ALL", label: "All" },
              { id: "Offense", label: "Offense" },
              { id: "Defense", label: "Defense" },
              { id: "Mobility", label: "Mobility" },
              { id: "Utility", label: "Utility" }
            ]}
            value={modalDomain}
            onChange={(val) => setModalDomain(val as string)}
          />
        )}

        <div style={{ position: "relative" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)"
            }}
          />
          <input
            type="text"
            placeholder={isKeystoneSlot ? "Search Keystone marks..." : "Search passives, perks, advancements..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              padding: "7px 10px 7px 32px",
              fontSize: "12px",
              color: "var(--text-primary)",
              outline: "none"
            }}
          />
        </div>

        {/* List of eligible marks */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxHeight: "360px",
            overflowY: "auto",
            paddingRight: "4px"
          }}
        >
          {marksToDisplay.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: "12px" }}>
              No compatible marks found matching filter.
            </div>
          ) : (
            marksToDisplay.map((m) => {
              const preferredRank = viewMode === "owned" ? ownedMarks[m.id] || 1 : markRanks[m.id] || 1;
              const effCost = getEffectiveCost(m, preferredRank);
              const eligibility = checkMarkEligibility(
                currentBelt,
                m,
                preferredRank,
                slotIdx,
                viewMode,
                ownedMarks,
                beltCapacity
              );

              const isCurrentlyInSlot = currentBelt[slotIdx]?.markId === m.id;
              const isEquippedElsewhere = currentBelt.some(
                (s, sIdx) => s?.markId === m.id && sIdx !== slotIdx
              );

              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: isCurrentlyInSlot ? "rgba(245, 158, 11, 0.08)" : "var(--bg-card)",
                    borderRadius: "8px",
                    border: `1px solid ${
                      isCurrentlyInSlot
                        ? "var(--accent-gold)"
                        : eligibility.eligible
                        ? "var(--border-subtle)"
                        : "rgba(239, 68, 68, 0.2)"
                    }`,
                    opacity: eligibility.eligible ? 1 : 0.6,
                    transition: "border-color 140ms ease, background 140ms ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0, paddingRight: "8px" }}>
                    <img
                      src={`assets/marks/mark_${String(m.id).padStart(2, "0")}.png`}
                      alt={m.name}
                      style={{ width: "32px", height: "32px", imageRendering: "pixelated", flexShrink: 0 }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.opacity = "0.2";
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {m.name}
                        </span>
                        <span className="renown-pill renown-pill-cost">{effCost}N</span>
                        <span className={`renown-pill renown-pill-${m.tier.toLowerCase()}`}>{m.tier}</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {m.desc.split(" | ")[0]}
                      </div>
                    </div>
                  </div>

                  {/* Action button / Status badge */}
                  <div>
                    {isCurrentlyInSlot ? (
                      <span className="renown-pill" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--accent-gold)" }}>
                        Equipped Here
                      </span>
                    ) : !eligibility.eligible ? (
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
                    ) : (
                      <button
                        type="button"
                        className="renown-btn renown-btn-gold"
                        style={{ padding: "4px 10px", fontSize: "11px" }}
                        onClick={() => {
                          onSelectMark(m.id, slotIdx, preferredRank);
                          onClose();
                        }}
                      >
                        {isEquippedElsewhere ? "Move Here" : "Equip"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
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
  const [importString, setImportString] = useState<string>("");

  if (!isOpen) return null;

  return (
    <div className="renown-modal-backdrop" onClick={onClose}>
      <div className="renown-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Import Collection (/renown export)
          </h3>
          <button type="button" onClick={onClose} style={{ color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          In Minecraft, run <code style={{ color: "var(--accent-gold)" }}>/renown export</code> to generate your
          unlocked collection link, or paste the tokens string below:
        </p>

        <textarea
          rows={4}
          placeholder="e.g. 1:2,2:1,4:1,5:3,13:2,22:1,43:1..."
          value={importString}
          onChange={(e) => setImportString(e.target.value)}
          style={{
            width: "100%",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "8px",
            padding: "10px",
            fontSize: "12px",
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
            outline: "none"
          }}
        />

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button type="button" className="renown-btn" onClick={onQuickLoadStarter}>
            Starter Set (15 Marks)
          </button>

          <button type="button" className="renown-btn" onClick={onUnlockAll}>
            Unlock All 55
          </button>

          <button
            type="button"
            className="renown-btn renown-btn-gold"
            onClick={() => onImport(importString)}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};
