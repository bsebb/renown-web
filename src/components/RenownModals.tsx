import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { ALL_MARKS, MarkItem } from "../data/renownData";
import { EquippedSlot } from "./RenownBelt";

interface QuickPickerModalProps {
  slotIdx: number | null;
  onClose: () => void;
  onSelectMark: (markId: number, slotIdx: number, preferredRank: number) => void;
  viewMode: "all" | "owned";
  ownedMarks: Record<number, number>;
  markRanks: Record<number, number>;
  currentBelt: (EquippedSlot | null)[];
  getEffectiveCost: (mark: MarkItem, rank: number) => number;
}

export const QuickPickerModal: React.FC<QuickPickerModalProps> = ({
  slotIdx,
  onClose,
  onSelectMark,
  viewMode,
  ownedMarks,
  markRanks,
  currentBelt,
  getEffectiveCost
}) => {
  const [search, setSearch] = useState<string>("");

  if (slotIdx === null) return null;

  const eligibleMarks = ALL_MARKS.filter((m) => {
    if (viewMode === "owned" && !ownedMarks[m.id]) return false;
    const q = search.toLowerCase().trim();
    return !q || m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q);
  });

  return (
    <div className="renown-modal-backdrop" onClick={onClose}>
      <div className="renown-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Select Mark for Belt Slot {slotIdx + 1}
          </h3>
          <button type="button" onClick={onClose} style={{ color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        </div>

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
            placeholder="Search eligible marks..."
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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            maxHeight: "360px",
            overflowY: "auto",
            paddingRight: "4px"
          }}
        >
          {eligibleMarks.map((m) => {
            const isEquippedElsewhere = currentBelt.some(
              (s, sIdx) => s?.markId === m.id && sIdx !== slotIdx
            );
            const preferredRank = viewMode === "owned" ? ownedMarks[m.id] || 1 : markRanks[m.id] || 1;
            const effCost = getEffectiveCost(m, preferredRank);

            return (
              <div
                key={m.id}
                onClick={() => {
                  onSelectMark(m.id, slotIdx, preferredRank);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "var(--bg-card)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  opacity: isEquippedElsewhere ? 0.45 : 1
                }}
                title={isEquippedElsewhere ? "Currently equipped in another slot (will be moved)" : undefined}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={`assets/marks/mark_${String(m.id).padStart(2, "0")}.png`}
                    alt={m.name}
                    style={{ width: "28px", height: "28px", imageRendering: "pixelated" }}
                  />
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF" }}>{m.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      {m.tier} &bull; {m.domain} {m.keystone ? "&bull; Keystone" : ""}
                    </div>
                  </div>
                </div>
                <span className="renown-pill renown-pill-cost">{effCost} Notch</span>
              </div>
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
