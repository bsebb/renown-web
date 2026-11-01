import React from "react";
import { Heart, Info } from "lucide-react";
import { ALL_MARKS } from "../data/renownData";
import { EquippedSlot } from "./RenownBelt";

export interface CombatStats {
  bonusHp: number;
  totalHp: number;
  reach: number;
  reachBonus: number;
  toughness: number;
  deflect: number;
  maceExecute: number;
  safeFall: number;
}

interface RenownInspectorProps {
  statsBonus: CombatStats;
  equippedActive?: EquippedSlot;
}

export const RenownInspector: React.FC<RenownInspectorProps> = ({
  statsBonus,
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
          Live Scaling
        </span>
      </div>

      {/* Max Health Hearts */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
          <span style={{ color: "var(--text-secondary)" }}>Effective Max Health:</span>
          <span style={{ fontWeight: 700, color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>
            {statsBonus.totalHp.toFixed(1)} HP ({Math.round(statsBonus.totalHp / 2)} Hearts)
          </span>
        </div>

        {/* Hearts row */}
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
          <span style={{ color: "var(--text-secondary)" }}>Attack Reach (Grounded):</span>
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
          <span style={{ color: "var(--text-secondary)" }}>Projectile Deflect:</span>
          <span
            style={{
              fontWeight: 700,
              color: statsBonus.deflect > 0 ? "#4BC369" : "#FFFFFF",
              fontVariantNumeric: "tabular-nums"
            }}
          >
            +{statsBonus.deflect}%
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
          <span style={{ color: "var(--text-secondary)" }}>Mace Execution Scaling:</span>
          <span
            style={{
              fontWeight: 700,
              color: statsBonus.maceExecute > 0 ? "#BE5FEB" : "#FFFFFF",
              fontVariantNumeric: "tabular-nums"
            }}
          >
            +{statsBonus.maceExecute}%
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
                Triggered in-game with Shift+F (Off-hand swap)
              </div>
            </div>
          ) : (
            <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
              None equipped. Equip an Active Mark (e.g. Over-Overkill, Uneasy Alliance, How Did We Get Here).
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
          <span>Theorycraft Rules</span>
        </div>
        <p>1. Maximum 10 Notches across all equipped marks.</p>
        <p>2. Maximum 1 Keystone mark (Anchor slot 5 recommended).</p>
        <p>3. Maximum 6 Offense marks.</p>
        <p>4. Reaching Rank 3 on 2-5 Notch marks gives a -1 Notch discount!</p>
      </div>
    </aside>
  );
};
