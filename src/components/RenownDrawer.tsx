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
                  Rule 1: Progressive 6N -&gt; 7N -&gt; 8N Belt (+1N Unanchored Purist)
                </div>
                <p style={{ color: "var(--text-secondary)" }}>
                  Every player starts Day 1 with 6 Passive Notches + 1 Zero-Notch Keystone Anchor inside a symmetrical 9-Slot Belt. Unlock your 7th Notch at the Crucible of Ash (64 Ash + 16 Diamonds or 25/67 Chronicles) and your 8th Notch via a Sovereign Altar Ritual (or 45/67 Chronicles). Intentionally leaving Center Slot 5 empty activates the Unanchored Purist bonus (+1 Passive Notch -&gt; 7N / 8N / 9N).
                </p>
              </div>

              <div style={{ padding: "12px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "var(--accent-gold)", marginBottom: "4px" }}>
                  Rule 2: Zero-Notch Center Keystone Anchor (12 Keystones)
                </div>
                <p style={{ color: "var(--text-secondary)" }}>
                  Slot 5 (the center of the 9-Slot Belt) accepts 1 Keystone Mark at 0 Notch cost. There are 12 domain-balanced Keystones spanning Tier III-V (3 Offense, 3 Defense, 3 Mobility, 3 Utility) defining your core playstyle without taxing your passive utility budget.
                </p>
              </div>

              <div style={{ padding: "12px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "var(--accent-gold)", marginBottom: "4px" }}>
                  Rule 3: The 4-Notch Passive Offense Cap
                </div>
                <p style={{ color: "var(--text-secondary)" }}>
                  Passive Offense Marks cannot collectively consume more than 4 Notches. Your remaining passive capacity must be invested in Defense, Mobility, or Utility, creating a cyclic counter-meta where off-meta 2N-3N tech counters (Surge Protector, Blowback, Soul-Fire Brand) thrive.
                </p>
              </div>

              <div style={{ padding: "12px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "var(--accent-gold)", marginBottom: "4px" }}>
                  Rule 4: Single Active Ability (Shift+F)
                </div>
                <p style={{ color: "var(--text-secondary)" }}>
                  A loadout can equip at most ONE Active Mark (Return to Sender, Uneasy Alliance, or How Did We Get Here?) triggered via Shift+F while keeping Totems safely in your offhand.
                </p>
              </div>
            </div>
          )}

          {activeTab === "ranks" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "12px", lineHeight: 1.6 }}>
              <p style={{ color: "var(--text-secondary)" }}>
                Every Mark of Renown advances through 3 Mastery Ranks by fusing duplicate seals or earning Resonance charges:
              </p>

              <div style={{ padding: "10px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "#FFFFFF" }}>Rank 1 (Base):</div>
                <div style={{ color: "var(--text-secondary)" }}>Base mechanical effect unlocked immediately upon absorbing the Mark.</div>
              </div>

              <div style={{ padding: "10px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "#FFFFFF" }}>Rank 2 (Mastered - 3 Copies):</div>
                <div style={{ color: "var(--text-secondary)" }}>+20% potency scaling and reduced PvP stability fracture on Keystones (15% -&gt; 10%).</div>
              </div>

              <div style={{ padding: "10px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)", borderColor: "rgba(245, 158, 11, 0.4)" }}>
                <div style={{ fontWeight: 700, color: "var(--accent-gold)" }}>Rank 3 (Ascended - 10 Copies):</div>
                <div style={{ color: "var(--text-secondary)" }}>
                  Tier III+ Passives/Actives (base 3N-5N) gain a -1 Notch Mastery discount. Tier I-II Marks (1N-2N) keep their base cost and unlock cross-mark Synergy Traits; Keystones unlock Ascended R3 Mechanics.
                </div>
              </div>
            </div>
          )}

          {activeTab === "stability" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "12px", lineHeight: 1.6 }}>
              <div style={{ padding: "12px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "#FFFFFF", marginBottom: "4px" }}>Field Whetstones &amp; Quicksilver Salve</div>
                <p style={{ color: "var(--text-secondary)" }}>
                  Field Whetstones (8 Renown Ash) restore tier-proportional Stability (+45% Tier I down to +6% Tier V) with zero salvage arbitrage. Quicksilver Attunement Salves (12 Ash) clear the 30-second out-of-combat equip attunement delay; unequipping is always instant outside combat.
                </p>
              </div>

              <div style={{ padding: "12px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "#FFFFFF", marginBottom: "4px" }}>Sovereign Altar Hijacks &amp; Monolith Jackpots</div>
                <p style={{ color: "var(--text-secondary)" }}>
                  Tier V Mythic Marks require a 60s Sovereign Altar ritual within 30 blocks; slaying or driving off the summoner drops the Unbound Mythic Mark onto the pedestal for rivals to hijack! Reigning Monolith clans enjoy halved Bazaar tax (2.5%) while accumulating a Usurper Diamond Jackpot for challengers.
                </p>
              </div>
            </div>
          )}

          {activeTab === "ash" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "12px", lineHeight: 1.6 }}>
              <div style={{ padding: "12px", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontWeight: 700, color: "var(--accent-gold)", marginBottom: "4px" }}>Crucible Salvage Yield (At 100% Stability)</div>
                <p style={{ color: "var(--text-secondary)" }}>
                  Surplus Marks pulverize into Renown Ash scaled linearly by remaining Stability:
                </p>
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tier I (Common):</span> <span style={{ color: "#FFFFFF" }}>3 Ash</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tier II (Uncommon):</span> <span style={{ color: "#FFFFFF" }}>8 Ash</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tier III (Rare):</span> <span style={{ color: "#FFFFFF" }}>20 Ash</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tier IV (Epic):</span> <span style={{ color: "#FFFFFF" }}>50 Ash</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tier V (Mythic):</span> <span style={{ color: "#FFFFFF" }}>150 Ash</span></div>
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
