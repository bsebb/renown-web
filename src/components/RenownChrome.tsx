import React from "react";
import {
  ArrowUp,
  BookOpen,
  Copy,
  Crown,
  Download,
  Share2,
  SlidersHorizontal,
  Swords,
  Volume2,
  VolumeX
} from "lucide-react";
import { ALL_MARKS, MarkItem } from "../data/renownData";
import { BeltTotals, EquippedSlot, KEYSTONE_SLOT_INDEX } from "./deckValidation";
import { ActivePointerDrag } from "./usePointerDeckDrag";

export type MobileTab = "deck" | "stats" | "guide";

interface DragGhostCardProps {
  activeDrag: ActivePointerDrag;
  mark: MarkItem;
  hoverDeckArea: boolean;
  hoverSlotIdx: number | null;
}

export const DragGhostCard: React.FC<DragGhostCardProps> = ({
  activeDrag,
  mark,
  hoverDeckArea,
  hoverSlotIdx
}) => {
  const isDroppingRemove =
    activeDrag.source === "socket" && !hoverDeckArea && hoverSlotIdx === null;

  return (
    <div
      className={`cr-drag-ghost ${isDroppingRemove ? "is-dropping-remove" : ""}`}
      style={{
        transform: `translate3d(${activeDrag.x - 42}px, ${
          activeDrag.y - 54
        }px, 0) rotate(3deg) scale(1.06)`
      }}
    >
      <span className={`cr-cost-gem ${mark.keystone ? "is-gold-text" : ""}`}>
        {mark.keystone ? "0N" : `${activeDrag.cost}N`}
      </span>
      <img
        src={`assets/marks/mark_${String(mark.id).padStart(2, "0")}.png`}
        alt={mark.name}
      />
      <span className="cr-ghost-label">
        {isDroppingRemove ? "Release to Remove" : mark.name}
      </span>
    </div>
  );
};

interface StickyMiniDeckProps {
  currentBelt: (EquippedSlot | null)[];
  totals: BeltTotals;
  hoverSlotIdx: number | null;
  onScrollToDeck: () => void;
}

export const StickyMiniDeck: React.FC<StickyMiniDeckProps> = ({
  currentBelt,
  totals,
  hoverSlotIdx,
  onScrollToDeck
}) => (
  <div className="cr-sticky-mini-deck">
    <div className="cr-mini-deck-inner">
      <div className="cr-mini-slots">
        {currentBelt.map((s, idx) => {
          const m = s ? ALL_MARKS.find((x) => x.id === s.markId) : null;
          const isKey = idx === KEYSTONE_SLOT_INDEX;
          return (
            <button
              key={idx}
              type="button"
              data-belt-slot={idx}
              className={`cr-mini-slot ${isKey ? "is-key" : ""} ${
                hoverSlotIdx === idx ? "is-drag-hover" : ""
              }`}
              onClick={onScrollToDeck}
              title={m ? m.name : isKey ? "Empty Keystone (+1N Purist)" : "Empty Socket"}
            >
              {m ? (
                <img
                  src={`assets/marks/mark_${String(m.id).padStart(2, "0")}.png`}
                  alt={m.name}
                />
              ) : isKey ? (
                <Crown size={12} color="var(--accent-gold)" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="cr-mini-right">
        <span className="cr-mini-notches font-tabular">
          {totals.totalNotches}/{totals.effectiveBeltCapacity}N
        </span>
        <button
          type="button"
          className="renown-btn cr-mini-up-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll back to Battle Deck"
        >
          <ArrowUp size={13} />
          <span className="hide-xs">Deck</span>
        </button>
      </div>
    </div>
  </div>
);

interface MastheadHeaderProps {
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  onOpenImport: () => void;
  onCopyCommand: () => void;
  onCopyShareUrl: () => void;
  onOpenGuide: () => void;
}

export const MastheadHeader: React.FC<MastheadHeaderProps> = ({
  sfxEnabled,
  onToggleSfx,
  onOpenImport,
  onCopyCommand,
  onCopyShareUrl,
  onOpenGuide
}) => (
  <header className="cr-top-header">
    <div className="cr-brand">
      <img
        src="assets/pack.png"
        alt="Renown SMP"
        className="cr-brand-logo"
        onError={(e) => {
          (e.target as HTMLElement).style.display = "none";
        }}
      />
      <div>
        <h1 className="cr-brand-title">Renown Deck Builder</h1>
        <div className="cr-brand-sub">9-Slot Belt · 12 Keystones · +1N Purist</div>
      </div>
    </div>

    <div className="cr-header-actions">
      <button type="button" className="renown-btn hide-mobile" onClick={onOpenImport}>
        <Download size={13} />
        <span>Import</span>
      </button>

      <button
        type="button"
        className="renown-btn renown-btn-gold"
        onClick={onCopyCommand}
        title="Copy /renown loadout command"
      >
        <Copy size={13} />
        <span className="hide-xs">Copy Command</span>
      </button>

      <button
        type="button"
        className="renown-btn"
        onClick={onCopyShareUrl}
        title="Copy shareable deck URL"
      >
        <Share2 size={13} />
        <span className="hide-mobile">Share</span>
      </button>

      <button type="button" className="renown-btn hide-mobile" onClick={onOpenGuide}>
        <BookOpen size={13} />
        <span>Codex Guide</span>
      </button>

      <button
        type="button"
        className="renown-btn cr-icon-btn"
        onClick={onToggleSfx}
        aria-label="Toggle Sound Effects"
      >
        {sfxEnabled ? <Volume2 size={14} color="var(--accent-gold)" /> : <VolumeX size={14} />}
      </button>
    </div>
  </header>
);

interface MobileBottomNavProps {
  mobileTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  mobileTab,
  onSelectTab
}) => (
  <nav className="cr-mobile-bottom-nav" aria-label="Mobile Navigation">
    <button
      type="button"
      className={`cr-mobile-nav-btn ${mobileTab === "deck" ? "active" : ""}`}
      onClick={() => onSelectTab("deck")}
    >
      <Swords size={18} />
      <span>Battle Deck</span>
    </button>

    <button
      type="button"
      className={`cr-mobile-nav-btn ${mobileTab === "stats" ? "active" : ""}`}
      onClick={() => onSelectTab("stats")}
    >
      <SlidersHorizontal size={18} />
      <span>Stats &amp; Presets</span>
    </button>

    <button
      type="button"
      className={`cr-mobile-nav-btn ${mobileTab === "guide" ? "active" : ""}`}
      onClick={() => onSelectTab("guide")}
    >
      <BookOpen size={18} />
      <span>Codex Guide</span>
    </button>
  </nav>
);
