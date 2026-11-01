import React from "react";
import { Heart, Info } from "lucide-react";
import { ALL_MARKS } from "../data/renownData";
import { BeltCapacityTier } from "./deckValidation";
import { EquippedSlot } from "./RenownBelt";

export interface CombatStats {
  bonusHp: number;
  totalHp: number;
  reach: number;
  reachBonus: number;
  toughness: number;
  kbResistPct: number;
  speedPct: number;
  safeFall: number;
}

interface RenownInspectorProps {
  statsBonus: CombatStats;
  beltCapacity: BeltCapacityTier;
  equippedActive?: EquippedSlot;
}

export const RenownInspector: React.FC<RenownInspectorProps> = ({
  statsBonus,
  beltCapacity,
  equippedActive
}) => {
  const activeMarkItem = equippedActive ? ALL_MARKS.find((m) => m.id === equippedActive.markId) : null;

  return (
    <aside className="renown-inspector-panel" aria-label="Attribute Inspector">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "10px"
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
          Attribute Inspector
        </span>
        <span style={{ fontSize: "11px", color: "var(--accent-gold)", fontWeight: 600 }}>
          1.21 Server Caps
        </span>
      </div>

      {/* Max Health Hearts */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
          <span style={{ color: "var(--text-secondary)" }}>Effective Max Health:</span>
          <span style={{ fontWeight: 700, color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>
            {statsBonus.totalHp.toFixed(1)} HP ({(statsBonus.totalHp / 2).toFixed(1)} Hearts)
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            padding: "8px",
            background: "var(--bg-card)",
            borderRadius: "8px",
            border: "1px solid var(--border-subtle)"
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <Heart key={i} size={15} fill="#EF4444" color="#DC2626" />
          ))}
          {statsBonus.bonusHp > 0 &&
            Array.from({ length: Math.ceil(statsBonus.bonusHp / 2) }).map((_, i) => (
              <Heart key={`bonus-${i}`} size={15} fill="#F59E0B" color="#D97706" />
            ))}
        </div>
      </div>

      {/* Attributes */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 8px",
            background: "var(--bg-card)",
            borderRadius: "6px",
            fontSize: "12px"
          }}
        >
          <span style={{ color: "var(--text-secondary)" }}>Grounded Reach:</span>
          <span
            style={{
              fontWeight: 700,
              color: statsBonus.reachBonus > 0 ? "var(--accent-gold)" : "#FFFFFF",
              fontVariantNumeric: "tabular-nums"
            }}
          >
            {statsBonus.reach.toFixed(2)}m {statsBonus.reachBonus > 0 ? `(+${statsBonus.reachBonus.toFixed(2)}m)` : ""}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 8px",
            background: "var(--bg-card)",
            borderRadius: "6px",
            fontSize: "12px"
          }}
        >
          <span style={{ color: "var(--text-secondary)" }}>Bonus Armor Toughness:</span>
          <span
            style={{
              fontWeight: 700,
              color: statsBonus.toughness > 0 ? "#38BDF8" : "#FFFFFF",
              fontVariantNumeric: "tabular-nums"
            }}
          >
            +{statsBonus.toughness.toFixed(1)}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 8px",
            background: "var(--bg-card)",
            borderRadius: "6px",
            fontSize: "12px"
          }}
        >
          <span style={{ color: "var(--text-secondary)" }}>Knockback Resistance:</span>
          <span
            style={{
              fontWeight: 700,
              color: statsBonus.kbResistPct > 0 ? "#4BC369" : "#FFFFFF",
              fontVariantNumeric: "tabular-nums"
            }}
          >
            +{statsBonus.kbResistPct}%
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 8px",
            background: "var(--bg-card)",
            borderRadius: "6px",
            fontSize: "12px"
          }}
        >
          <span style={{ color: "var(--text-secondary)" }}>Sprint Speed Delta:</span>
          <span
            style={{
              fontWeight: 700,
              color:
                statsBonus.speedPct > 0
                  ? "#38BDF8"
                  : statsBonus.speedPct < 0
                  ? "#FCA5A5"
                  : "#FFFFFF",
              fontVariantNumeric: "tabular-nums"
            }}
          >
            {statsBonus.speedPct >= 0 ? `+${statsBonus.speedPct}%` : `${statsBonus.speedPct}%`}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 8px",
            background: "var(--bg-card)",
            borderRadius: "6px",
            fontSize: "12px"
          }}
        >
          <span style={{ color: "var(--text-secondary)" }}>Safe Fall Distance:</span>
          <span
            style={{
              fontWeight: 700,
              color: statsBonus.safeFall > 0 ? "#FACD46" : "#FFFFFF",
              fontVariantNumeric: "tabular-nums"
            }}
          >
            +{statsBonus.safeFall} blocks
          </span>
        </div>
      </div>

      {/* Active Ability Slot Summary */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}
      >
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
          ACTIVE ABILITY (SHIFT+F):
        </span>
        <div
          style={{
            padding: "8px 10px",
            background: "var(--bg-card)",
            borderRadius: "6px",
            border: "1px solid var(--border-subtle)",
            fontSize: "12px"
          }}
        >
          {equippedActive && activeMarkItem ? (
            <div>
              <div style={{ fontWeight: 700, color: "#DDD6FE" }}>
                {activeMarkItem.name} (R{equippedActive.rank})
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Triggered in-game with Shift+F (Totems remain safely in offhand)
              </div>
            </div>
          ) : (
            <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
              None equipped. Equip up to 1 Shift+F Active (Return to Sender, Uneasy Alliance, or How Did We Get Here?).
            </span>
          )}
        </div>
      </div>

      {/* Theorycraft Quick Rules */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "12px",
          fontSize: "11px",
          color: "var(--text-secondary)",
          lineHeight: 1.5
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--accent-gold)",
            fontWeight: 600,
            marginBottom: "4px"
          }}
        >
          <Info size={12} />
          <span>9-Slot Belt Invariants</span>
        </div>
        <p>1. Passive Belt scales 6N (Day 1) to 7N (Crucible) to 8N (Sovereign). Active tier: {beltCapacity}N.</p>
        <p>2. Center Anchor holds 1 of 12 Keystones (0N, 3 per domain), or grants +1N Purist if empty.</p>
        <p>3. Maximum 4 Passive Offense Notches.</p>
        <p>4. Rank 3 grants -1 Notch discount on non-Keystone Tier III+ Marks (3N to 5N).</p>
      </div>
    </aside>
  );
};
