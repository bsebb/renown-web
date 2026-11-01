import React from "react";
import {
  Heart,
  Zap,
  Copy,
  Share2,
  Download,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { ALL_MARKS } from "../data/renownData";
import { BeltCapacityTier, DeckPreset, EquippedSlot } from "./deckValidation";
import { CombatStats } from "./renownImportExport";

interface RenownInspectorProps {
  statsBonus: CombatStats;
  beltCapacity: BeltCapacityTier;
  equippedActive?: EquippedSlot;
  presets: DeckPreset[];
  onApplyPreset: (preset: DeckPreset) => void;
  onCopyCommand: () => void;
  onCopyShareUrl: () => void;
  onOpenImportModal: () => void;
}

export const RenownInspector: React.FC<RenownInspectorProps> = ({
  statsBonus,
  beltCapacity,
  equippedActive,
  presets,
  onApplyPreset,
  onCopyCommand,
  onCopyShareUrl,
  onOpenImportModal
}) => {
  const activeMarkItem = equippedActive
    ? ALL_MARKS.find((m) => m.id === equippedActive.markId)
    : null;

  return (
    <div className="cr-inspector-content">
      {/* Live Combat Attributes */}
      <div className="cr-section-block">
        <div className="cr-section-header">
          <h3 className="cr-section-title">Combat Attributes</h3>
          <span className="cr-section-sub">Paper 1.21.4 Caps</span>
        </div>

        <div className="ios-grouped-card">
          <div className="ios-hairline-row" style={{ flexDirection: "column", alignItems: "stretch", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="text-secondary" style={{ fontSize: "13px" }}>Effective Max Health</span>
              <strong className="font-tabular" style={{ fontSize: "13px" }}>
                {statsBonus.totalHp.toFixed(1)} HP ({(statsBonus.totalHp / 2).toFixed(1)} Hearts)
              </strong>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <Heart key={i} size={15} fill="#EF4444" color="#DC2626" />
              ))}
              {statsBonus.bonusHp > 0 &&
                Array.from({ length: Math.ceil(statsBonus.bonusHp / 2) }).map((_, i) => (
                  <Heart key={`b-${i}`} size={15} fill="#F59E0B" color="#D97706" />
                ))}
            </div>
          </div>

          <div className="ios-hairline-row">
            <span className="text-secondary" style={{ fontSize: "13px" }}>Grounded Reach</span>
            <strong
              className="font-tabular"
              style={{
                fontSize: "13px",
                color: statsBonus.reachBonus > 0 ? "var(--accent-gold)" : "var(--text-primary)"
              }}
            >
              {statsBonus.reach.toFixed(2)}m {statsBonus.reachBonus > 0 ? "(+0.25m)" : ""}
            </strong>
          </div>

          <div className="ios-hairline-row">
            <span className="text-secondary" style={{ fontSize: "13px" }}>Bonus Armor Toughness</span>
            <strong className="font-tabular" style={{ fontSize: "13px" }}>
              +{statsBonus.toughness.toFixed(1)}
            </strong>
          </div>

          <div className="ios-hairline-row">
            <span className="text-secondary" style={{ fontSize: "13px" }}>Knockback Resistance</span>
            <strong className="font-tabular" style={{ fontSize: "13px" }}>
              +{statsBonus.kbResistPct}%
            </strong>
          </div>

          <div className="ios-hairline-row">
            <span className="text-secondary" style={{ fontSize: "13px" }}>Sprint Speed Delta</span>
            <strong
              className="font-tabular"
              style={{
                fontSize: "13px",
                color:
                  statsBonus.speedPct > 0
                    ? "var(--accent-gold)"
                    : statsBonus.speedPct < 0
                    ? "var(--accent-warning)"
                    : "var(--text-primary)"
              }}
            >
              {statsBonus.speedPct >= 0 ? `+${statsBonus.speedPct}%` : `${statsBonus.speedPct}%`}
            </strong>
          </div>

          <div className="ios-hairline-row">
            <span className="text-secondary" style={{ fontSize: "13px" }}>Safe Fall Bonus</span>
            <strong className="font-tabular" style={{ fontSize: "13px" }}>
              +{statsBonus.safeFall} blocks
            </strong>
          </div>

          <div className="ios-hairline-row">
            <span className="text-secondary" style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Zap size={13} color="var(--accent-gold)" />
              <span>Shift+F Active</span>
            </span>
            <strong style={{ fontSize: "13px", color: activeMarkItem ? "var(--accent-gold)" : "var(--text-muted)" }}>
              {activeMarkItem && equippedActive
                ? `${activeMarkItem.name} (R${equippedActive.rank})`
                : "None equipped"}
            </strong>
          </div>
        </div>
      </div>

      {/* Quick-Load Meta Archetype Presets */}
      <div className="cr-section-block">
        <div className="cr-section-header">
          <h3 className="cr-section-title">Meta Deck Presets</h3>
          <span className="cr-section-sub">1-Tap Archetypes</span>
        </div>

        <div className="ios-grouped-card">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="ios-hairline-row cr-preset-row"
              onClick={() => onApplyPreset(preset)}
            >
              <div style={{ textAlign: "left", minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {preset.subtitle}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                <span className="cr-preset-cap font-tabular">{preset.capacity}N</span>
                <ChevronRight size={15} color="var(--text-muted)" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sync & Export Actions */}
      <div className="cr-section-block">
        <div className="cr-section-header">
          <h3 className="cr-section-title">In-Game Sync &amp; Share</h3>
          <span className="cr-section-sub">Active Tier: {beltCapacity}N</span>
        </div>

        <div className="cr-sync-actions-grid">
          <button type="button" className="renown-btn renown-btn-gold" onClick={onCopyCommand}>
            <Copy size={14} />
            <span>Copy /renown loadout</span>
          </button>
          <button type="button" className="renown-btn" onClick={onCopyShareUrl}>
            <Share2 size={14} />
            <span>Copy Share Link</span>
          </button>
          <button type="button" className="renown-btn" onClick={onOpenImportModal}>
            <Download size={14} />
            <span>Import Collection</span>
          </button>
        </div>

        <div className="ios-grouped-card" style={{ marginTop: "10px", padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "var(--accent-gold)", marginBottom: "6px" }}>
            <Sparkles size={13} />
            <span>9-Slot Belt Invariants</span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
            <div>1. Passive capacity scales 6N (Day 1) to 7N (Crucible) to 8N (Sovereign).</div>
            <div>2. Center Slot 5 holds 1 of 12 Keystones (0N), or grants +1N Purist if empty.</div>
            <div>3. Passive Offense capped at 4N; maximum 1 Shift+F Active ability.</div>
            <div>4. Rank III reduces cost by -1N on non-Keystone Tier III+ Marks (3N-5N).</div>
          </div>
        </div>
      </div>
    </div>
  );
};
