import React, { useState } from "react";
import { Search } from "lucide-react";
import { ALL_CHRONICLES } from "../data/renownData";
import { SlidingSegmented } from "./SlidingSegmented";

export type DrawerTab = "rules" | "ranks" | "ash" | "chronicles";
export type ChronicleTab = "ALL" | "Story" | "Adventure" | "Husbandry" | "Nether" | "End";

interface CodexGuideContentProps {
  activeTab: DrawerTab;
  onChangeTab: (tab: DrawerTab) => void;
}

export const CodexGuideContent: React.FC<CodexGuideContentProps> = ({
  activeTab,
  onChangeTab
}) => {
  const [chronicleTab, setChronicleTab] = useState<ChronicleTab>("ALL");
  const [chronicleSearch, setChronicleSearch] = useState<string>("");

  const filteredChronicles = ALL_CHRONICLES.filter((c) => {
    const matchTab = chronicleTab === "ALL" || c.tab === chronicleTab;
    const q = chronicleSearch.toLowerCase().trim();
    return (
      matchTab &&
      (!q ||
        c.name.toLowerCase().includes(q) ||
        c.adv.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="cr-domain-scroll">
        <SlidingSegmented
          options={[
            { id: "rules", label: "Belt Rules" },
            { id: "ranks", label: "Mastery" },
            { id: "ash", label: "Ash & Sieges" },
            { id: "chronicles", label: "67 Chronicles" }
          ]}
          value={activeTab}
          onChange={(val) => onChangeTab(val as DrawerTab)}
        />
      </div>

      {activeTab === "rules" && (
        <div className="ios-grouped-card">
          <div className="ios-hairline-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
            <strong style={{ fontSize: "13px", color: "var(--accent-gold)" }}>
              1. Progressive 6N / 7N / 8N Belt + Unanchored Purist (+1N)
            </strong>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Every player begins at 6 Passive Notches, upgrades to 7N at the Crucible of Ash (or 25/67 Chronicles), and reaches 8N at the Sovereign Altar (or 45/67 Chronicles). Leaving Center Slot 5 empty grants +1 Unanchored Purist Notch (up to 9N).
            </p>
          </div>
          <div className="ios-hairline-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
            <strong style={{ fontSize: "13px", color: "var(--accent-gold)" }}>
              2. 12 Domain-Balanced Zero-Notch Keystones
            </strong>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Center Slot 5 accepts 1 of 12 build-defining Keystones (3 Offense, 3 Defense, 3 Mobility, 3 Utility) at 0 Notch cost.
            </p>
          </div>
          <div className="ios-hairline-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
            <strong style={{ fontSize: "13px", color: "var(--accent-gold)" }}>
              3. 4-Notch Offense Cap &amp; 1 Shift+F Active
            </strong>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Non-Keystone Offense cards are capped at 4 Notches total. Up to 1 Shift+F Active ability (#16 Return to Sender, #44 Uneasy Alliance, or #55 How Did We Get Here?) can be equipped.
            </p>
          </div>
          <div className="ios-hairline-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
            <strong style={{ fontSize: "13px", color: "var(--accent-gold)" }}>
              4. Free Out-of-Combat Deck Swaps
            </strong>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Swapping cards out of combat is 100% free. Player combat applies a 15s Combat Lockout, and swapping a Keystone or Active applies a 30s Attunement delay (clearable with a 12-Ash Salve).
            </p>
          </div>
        </div>
      )}

      {activeTab === "ranks" && (
        <div className="ios-grouped-card">
          <div className="ios-hairline-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
            <strong style={{ fontSize: "13px" }}>Rank I (1st Copy Socketed)</strong>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Unlocks 100% baseline perk potency in your permanent Codex.
            </span>
          </div>
          <div className="ios-hairline-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
            <strong style={{ fontSize: "13px" }}>Rank II (3 Copies Fused)</strong>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Boosts potency by ~20% and lowers PvP death stability loss from 15% to 10%.
            </span>
          </div>
          <div className="ios-hairline-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
            <strong style={{ fontSize: "13px", color: "var(--accent-gold)" }}>
              Rank III Mastery (10 Copies Fused)
            </strong>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Non-Keystone Tier III-V Marks (3N-5N) drop by -1 Notch cost, while all 12 Zero-Notch Keystones unlock their Ascended R3 capstone trait.
            </span>
          </div>
        </div>
      )}

      {activeTab === "ash" && (
        <div className="ios-grouped-card">
          <div className="ios-hairline-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
            <strong style={{ fontSize: "13px" }}>Salvage &amp; Repair Economy</strong>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Crushing duplicate Marks yields Renown Ash (1 / 3 / 8 / 24 / 64 Ash across Tiers I-V) to repair stability fractures, craft Salves, or transmute 3-for-1 at the Ash Crucible.
            </span>
          </div>
          <div className="ios-hairline-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
            <strong style={{ fontSize: "13px", color: "var(--accent-gold)" }}>
              Saturday Monolith Clan Sieges
            </strong>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Crush a duplicate Mark in-hand during territorial Monolith battles for a 15-minute +25% War Overcharge boost.
            </span>
          </div>
        </div>
      )}

      {activeTab === "chronicles" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="cr-domain-scroll">
            <SlidingSegmented
              options={[
                { id: "ALL", label: "All (67)" },
                { id: "Story", label: "Story" },
                { id: "Adventure", label: "Adventure" },
                { id: "Husbandry", label: "Husbandry" },
                { id: "Nether", label: "Nether" },
                { id: "End", label: "End" }
              ]}
              value={chronicleTab}
              onChange={(val) => setChronicleTab(val as ChronicleTab)}
            />
          </div>

          <div className="cr-search-box" style={{ width: "100%" }}>
            <Search size={14} className="cr-search-icon" />
            <input
              type="text"
              placeholder="Search 67 ambient Chronicles..."
              value={chronicleSearch}
              onChange={(e) => setChronicleSearch(e.target.value)}
              className="cr-search-input"
            />
          </div>

          <div className="ios-grouped-card" style={{ maxHeight: "460px", overflowY: "auto" }}>
            {filteredChronicles.map((c) => (
              <div
                key={c.id}
                className="ios-hairline-row"
                style={{ flexDirection: "column", alignItems: "flex-start", gap: "3px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "8px" }}>
                  <strong style={{ fontSize: "12px" }}>
                    #{c.id} {c.name}
                  </strong>
                  <span style={{ fontSize: "11px", color: "var(--accent-gold)" }}>{c.adv}</span>
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
