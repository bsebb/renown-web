import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { ALL_CHRONICLES } from "../data/renownData";
import { SlidingSegmented } from "./SlidingSegmented";

export type DrawerTab = "rules" | "ranks" | "stability" | "ash" | "chronicles";
export type ChronicleTab = "ALL" | "Story" | "Adventure" | "Husbandry" | "Nether" | "End";

interface RenownDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: DrawerTab;
  onChangeTab: (tab: DrawerTab) => void;
}

export const RenownDrawer: React.FC<RenownDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onChangeTab
}) => {
  const [chronicleTab, setChronicleTab] = useState<ChronicleTab>("ALL");
  const [chronicleSearch, setChronicleSearch] = useState<string>("");

  if (!isOpen) return null;

  const filteredChronicles = ALL_CHRONICLES.filter((c) => {
    const matchTab = chronicleTab === "ALL" || c.tab === chronicleTab;
    const q = chronicleSearch.toLowerCase().trim();
    return (
      matchTab &&
      (!q ||
        c.name.toLowerCase().includes(q) ||
        c.adv.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.key.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 1000
        }}
        onClick={onClose}
      />
      <aside className="renown-drawer-panel" aria-label="Renown SMP Codex & Chronicles">
        {/* Drawer Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF" }}>
              Renown Codex & Chronicles
            </h2>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Server Mechanics, Respec Costs, and Advancement Catalog
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ color: "var(--text-muted)" }}
            aria-label="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sliding Drawer Tabs */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
          <SlidingSegmented
            options={[
              { id: "rules", label: "4 Hard Rules" },
              { id: "ranks", label: "Mastery & Ranks" },
              { id: "stability", label: "Stability & Respec" },
              { id: "ash", label: "Ash Economy" },
              { id: "chronicles", label: "67 Chronicles" }
            ]}
            value={activeTab}
            onChange={(val) => onChangeTab(val as DrawerTab)}
          />
        </div>

        {/* Drawer Body Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {activeTab === "rules" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "12px", lineHeight: 1.6 }}>
              <div style={{ padding: "12px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "var(--accent-gold)", marginBottom: "4px" }}>
                  Rule 1: The 10-Notch Loadout Ceiling
                </div>
                <p style={{ color: "var(--text-secondary)" }}>
                  Your loadout belt contains 10 Notches of capacity. Every mark consumes between 1 and 5 Notches based on its tier (Common 1N, Uncommon 2N, Rare 3N, Epic 4N, Mythic 5N). You can never equip a combination exceeding 10 Notches.
                </p>
              </div>

              <div style={{ padding: "12px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "var(--accent-gold)", marginBottom: "4px" }}>
                  Rule 2: Keystone Uniqueness
                </div>
                <p style={{ color: "var(--text-secondary)" }}>
                  A loadout may contain at most ONE Keystone Mark at any time (e.g. Cover Me in Debris, Two by Two, Free the End). Keystones provide build-defining passives and cannot be stacked together.
                </p>
              </div>

              <div style={{ padding: "12px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "var(--accent-gold)", marginBottom: "4px" }}>
                  Rule 3: The 6-Notch Offense Domain Cap
                </div>
                <p style={{ color: "var(--text-secondary)" }}>
                  To prevent degenerate one-shot glass-cannon metas, marks belonging to the Offense domain cannot collectively consume more than 6 Notches. The remaining 4 Notches must be allocated to Defense, Mobility, or Utility.
                </p>
              </div>

              <div style={{ padding: "12px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "var(--accent-gold)", marginBottom: "4px" }}>
                  Rule 4: Single Active Ability
                </div>
                <p style={{ color: "var(--text-secondary)" }}>
                  A build can contain at most ONE Active Mark (triggered via Shift+F). If an active mark is already equipped, attempting to equip another requires replacing the existing active mark.
                </p>
              </div>
            </div>
          )}

          {activeTab === "ranks" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "12px", lineHeight: 1.6 }}>
              <p style={{ color: "var(--text-secondary)" }}>
                Every Mark of Renown advances through 3 Mastery Ranks as you complete in-game tasks with the mark equipped:
              </p>

              <div style={{ padding: "10px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "#FFFFFF" }}>Rank 1 (Base):</div>
                <div style={{ color: "var(--text-secondary)" }}>Standard passive effect unlocked immediately upon acquiring the Mark.</div>
              </div>

              <div style={{ padding: "10px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "#FFFFFF" }}>Rank 2 (Mastered):</div>
                <div style={{ color: "var(--text-secondary)" }}>Amplified numerical scaling (typically +30% to +50% increase in potency).</div>
              </div>

              <div style={{ padding: "10px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)", borderColor: "rgba(245, 158, 11, 0.4)" }}>
                <div style={{ fontWeight: 700, color: "var(--accent-gold)" }}>Rank 3 (Ascended - 1 Notch Discount):</div>
                <div style={{ color: "var(--text-secondary)" }}>
                  Unlocks secondary bonus traits AND reduces the mark&apos;s Notch cost by 1 (for marks costing 2 to 5 Notches). Common 1-notch marks gain Overclock traits instead.
                </div>
              </div>
            </div>
          )}

          {activeTab === "stability" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "12px", lineHeight: 1.6 }}>
              <div style={{ padding: "12px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "#FFFFFF", marginBottom: "4px" }}>Stability Whetstones</div>
                <p style={{ color: "var(--text-secondary)" }}>
                  Crafted at the Crucible of Ash. Consuming a Stability Whetstone protects your equipped loadout from durability degradation during catastrophic boss encounters and resets respec penalty timers.
                </p>
              </div>

              <div style={{ padding: "12px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "#FFFFFF", marginBottom: "4px" }}>Respec Cost Scaling</div>
                <p style={{ color: "var(--text-secondary)" }}>
                  Swapping marks is free inside Safe Zones (Town Spawn & Sovereign Altar). In hostile wild zones, hot-swapping marks consumes 5 Renown Ash per notch and incurs a 45-second stabilization cooldown.
                </p>
              </div>
            </div>
          )}

          {activeTab === "ash" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "12px", lineHeight: 1.6 }}>
              <div style={{ padding: "12px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "var(--accent-gold)", marginBottom: "4px" }}>Salvage Breakdown Table</div>
                <p style={{ color: "var(--text-secondary)" }}>
                  Marks can be pulverized at the Crucible of Ash to obtain Renown Ash:
                </p>
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Common:</span> <span style={{ color: "#FFFFFF" }}>10 Ash</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Uncommon:</span> <span style={{ color: "#FFFFFF" }}>25 Ash</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Rare:</span> <span style={{ color: "#FFFFFF" }}>60 Ash</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Epic:</span> <span style={{ color: "#FFFFFF" }}>150 Ash</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Mythic:</span> <span style={{ color: "#FFFFFF" }}>400 Ash</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "chronicles" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <SlidingSegmented
                  options={[
                    { id: "ALL", label: "All" },
                    { id: "Story", label: "Story" },
                    { id: "Adventure", label: "Adventure" },
                    { id: "Husbandry", label: "Husbandry" },
                    { id: "Nether", label: "Nether" },
                    { id: "End", label: "End" }
                  ]}
                  value={chronicleTab}
                  onChange={(val) => setChronicleTab(val as ChronicleTab)}
                />

                <div style={{ position: "relative", flex: 1, minWidth: "160px" }}>
                  <Search
                    size={12}
                    style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                  />
                  <input
                    type="text"
                    placeholder="Filter chronicles..."
                    value={chronicleSearch}
                    onChange={(e) => setChronicleSearch(e.target.value)}
                    style={{
                      width: "100%",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "6px",
                      padding: "5px 8px 5px 26px",
                      fontSize: "11px",
                      color: "var(--text-primary)",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "500px", overflowY: "auto" }}>
                {filteredChronicles.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: "10px",
                      background: "var(--bg-card)",
                      borderRadius: "8px",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px"
                    }}
                  >
                    <img
                      src={`assets/chronicles/chronicle_${String(c.id).padStart(2, "0")}.png`}
                      alt={c.name}
                      style={{ width: "30px", height: "30px", imageRendering: "pixelated", flexShrink: 0 }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.opacity = "0.2";
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF" }}>{c.name}</span>
                        <span className="renown-pill" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
                          {c.tab}
                        </span>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--accent-gold)", marginTop: "2px" }}>
                        Advancement: {c.adv} ({c.key})
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                        {c.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
