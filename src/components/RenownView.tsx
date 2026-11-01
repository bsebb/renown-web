import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Share2,
  Download,
  Volume2,
  VolumeX,
  Copy,
  Sparkles,
  Swords,
  SlidersHorizontal,
  Crown,
  ArrowUp
} from "lucide-react";
import { ALL_MARKS } from "../data/renownData";
import { KEYSTONE_SLOT_INDEX } from "./deckValidation";
import { RenownBelt } from "./RenownBelt";
import { RenownGrid } from "./RenownGrid";
import { RenownInspector } from "./RenownInspector";
import { CodexGuideContent, DrawerTab } from "./RenownDrawer";
import { CardDetailSheet, QuickPickerModal, ImportModal } from "./RenownModals";
import { SlideOverDrawer } from "./ui/SlideOverDrawer";
import { useRenownDeck, SortMode as DeckSortMode } from "./useRenownDeck";
import { usePointerDeckDrag } from "./usePointerDeckDrag";

type MobileTab = "deck" | "stats" | "guide";

export const RenownView: React.FC = () => {
  const {
    audio,
    sfxEnabled,
    handleToggleSfx,
    activeBuildSlot,
    setActiveBuildSlot,
    beltCapacity,
    setBeltCapacity,
    currentBelt,
    clearCurrentBelt,
    getRankForMark,
    viewMode,
    setViewMode,
    ownedMarks,
    activeDomain,
    setActiveDomain,
    sortMode,
    setSortMode,
    searchQuery,
    setSearchQuery,
    toastMessage,
    selectedCard,
    setSelectedCard,
    detailMarkId,
    setDetailMarkId,
    pendingSwap,
    setPendingSwap,
    lastEquippedSlot,
    getEffectiveCost,
    totals,
    checkEligibility,
    equipMark,
    handleUseCard,
    executeSwapOnSlot,
    unequipSlot,
    setCardRank,
    handlePointerDropOnSlot,
    applyPreset,
    presets,
    filteredMarks,
    handleCopyInGameCommand,
    handleCopyShareUrl,
    handleImportCollection,
    handleQuickLoadStarter,
    handleUnlockAll,
    statsBonus
  } = useRenownDeck();

  const [mobileTab, setMobileTab] = useState<MobileTab>("deck");
  const [desktopDrawer, setDesktopDrawer] = useState<"none" | "stats" | "guide">("none");
  const [guideTab, setGuideTab] = useState<DrawerTab>("rules");
  const [quickPickerSlot, setQuickPickerSlot] = useState<number | null>(null);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [showStickyMiniDeck, setShowStickyMiniDeck] = useState<boolean>(false);

  const deckAnchorRef = useRef<HTMLDivElement | null>(null);

  const { activeDrag, hoverSlotIdx, hoverDeckArea, startPointerGesture, shouldSuppressClick } =
    usePointerDeckDrag({
      onDropOnSlot: (drag, slotIdx) => handlePointerDropOnSlot(drag, slotIdx),
      onDropOutsideBelt: (drag) => {
        if (drag.fromSlotIdx !== undefined) unequipSlot(drag.fromSlotIdx);
      },
      onDragActivated: () => {
        setSelectedCard(null);
        audio.play("click");
      }
    });

  useEffect(() => {
    const el = deckAnchorRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setShowStickyMiniDeck(!entry.isIntersecting);
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [mobileTab]);

  // Dismiss selected card tray when clicking empty background
  useEffect(() => {
    if (!selectedCard) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.closest(".cr-card-wrapper") ||
        target.closest(".cr-deck-slot") ||
        target.closest(".cr-mobile-keystone-bar") ||
        target.closest(".cr-belt-selected-bar")
      ) {
        return;
      }
      setSelectedCard(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [selectedCard, setSelectedCard]);

  const cycleSort = () => {
    const order: DeckSortMode[] = ["cost", "tier", "id"];
    const next = order[(order.indexOf(sortMode) + 1) % order.length];
    setSortMode(next);
    audio.play("click");
  };

  const dragGhostMark = activeDrag ? ALL_MARKS.find((m) => m.id === activeDrag.markId) : null;

  return (
    <div className="cr-app-shell" role="region" aria-label="Renown SMP Deck Builder">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="cr-toast" role="status">
          <Sparkles size={15} color="var(--accent-gold)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating 60fps Drag Ghost Card (Mouse & Touch) */}
      {activeDrag && dragGhostMark && (
        <div
          className={`cr-drag-ghost rarity-${dragGhostMark.tier.toLowerCase()} ${
            activeDrag.source === "socket" && !hoverDeckArea && hoverSlotIdx === null
              ? "is-dropping-remove"
              : ""
          }`}
          style={{
            transform: `translate3d(${activeDrag.x - 42}px, ${activeDrag.y - 54}px, 0) rotate(3deg) scale(1.06)`
          }}
        >
          <span className={`cr-cost-gem ${dragGhostMark.keystone ? "is-keystone-gem" : ""}`}>
            {dragGhostMark.keystone ? "0N" : `${activeDrag.cost}N`}
          </span>
          <img
            src={`assets/marks/mark_${String(dragGhostMark.id).padStart(2, "0")}.png`}
            alt={dragGhostMark.name}
          />
          <span className="cr-ghost-label">
            {activeDrag.source === "socket" && !hoverDeckArea && hoverSlotIdx === null
              ? "Release to Remove"
              : dragGhostMark.name}
          </span>
        </div>
      )}

      {/* Compact Sticky Mini-Deck Bar when scrolled down */}
      {showStickyMiniDeck && mobileTab === "deck" && !pendingSwap && (
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
                    onClick={() => {
                      deckAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    title={m ? m.name : isKey ? "Empty Keystone (+1N Purist)" : "Empty Slot"}
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
                className="renown-btn"
                style={{ padding: "5px 9px" }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Scroll back to Battle Deck"
              >
                <ArrowUp size={13} />
                <span className="hide-xs">Deck</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Masthead Header */}
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
          <button
            type="button"
            className="renown-btn hide-mobile"
            onClick={() => setImportModalOpen(true)}
          >
            <Download size={13} />
            <span>Import</span>
          </button>

          <button
            type="button"
            className="renown-btn renown-btn-gold"
            onClick={handleCopyInGameCommand}
            title="Copy /renown loadout command"
          >
            <Copy size={13} />
            <span className="hide-xs">Copy Command</span>
          </button>

          <button
            type="button"
            className="renown-btn"
            onClick={handleCopyShareUrl}
            title="Copy shareable deck URL"
          >
            <Share2 size={13} />
            <span className="hide-mobile">Share</span>
          </button>

          <button
            type="button"
            className="renown-btn hide-mobile"
            onClick={() => {
              setDesktopDrawer("guide");
              audio.play("click");
            }}
          >
            <BookOpen size={13} />
            <span>Codex Guide</span>
          </button>

          <button
            type="button"
            className="renown-btn"
            onClick={handleToggleSfx}
            aria-label="Toggle Sound Effects"
          >
            {sfxEnabled ? <Volume2 size={14} color="var(--accent-gold)" /> : <VolumeX size={14} />}
          </button>
        </div>
      </header>

      {/* Main Content Stage (Switches cleanly on Mobile Bottom Tab Bar) */}
      <div className={`cr-tab-view ${mobileTab === "deck" ? "is-active-tab" : "hide-on-mobile"}`}>
        <div ref={deckAnchorRef}>
          <RenownBelt
            currentBelt={currentBelt}
            activeBuildSlot={activeBuildSlot}
            onSelectBuildSlot={setActiveBuildSlot}
            beltCapacity={beltCapacity}
            onChangeBeltCapacity={setBeltCapacity}
            totals={totals}
            statsBonus={statsBonus}
            selectedCard={selectedCard}
            onSelectBeltSlot={(idx) => {
              setSelectedCard((prev) =>
                prev?.source === "belt" && prev.slotIdx === idx
                  ? null
                  : { markId: currentBelt[idx]!.markId, source: "belt", slotIdx: idx }
              );
              audio.play("click");
            }}
            onOpenEmptySlotPicker={(idx) => {
              setSelectedCard(null);
              setQuickPickerSlot(idx);
              audio.play("click");
            }}
            pendingSwap={pendingSwap}
            onExecuteSwap={executeSwapOnSlot}
            onCancelSwap={() => {
              setPendingSwap(null);
              audio.play("click");
            }}
            lastEquippedSlot={lastEquippedSlot}
            activeDrag={activeDrag}
            hoverSlotIdx={hoverSlotIdx}
            onStartSlotPointerDrag={(e, idx, item, mark) =>
              startPointerGesture(e, {
                source: "socket",
                markId: mark.id,
                rank: item.rank,
                cost: getEffectiveCost(mark, item.rank),
                isKeystone: mark.keystone,
                fromSlotIdx: idx
              })
            }
            shouldSuppressClick={shouldSuppressClick}
            onSetCardRank={setCardRank}
            onOpenCardInfo={(id) => setDetailMarkId(id)}
            onUnequipSlot={unequipSlot}
            onClearDeck={clearCurrentBelt}
            onOpenStatsDrawer={() => {
              if (window.innerWidth <= 768) {
                setMobileTab("stats");
              } else {
                setDesktopDrawer("stats");
              }
              audio.play("click");
            }}
            getEffectiveCost={getEffectiveCost}
          />
        </div>

        <RenownGrid
          marks={filteredMarks}
          currentBelt={currentBelt}
          ownedMarks={ownedMarks}
          viewMode={viewMode}
          onChangeViewMode={(m) => {
            setViewMode(m);
            audio.play("click");
          }}
          activeDomain={activeDomain}
          onChangeDomain={(d) => {
            setActiveDomain(d);
            setSelectedCard(null);
            audio.play("click");
          }}
          sortMode={sortMode}
          onCycleSort={cycleSort}
          searchQuery={searchQuery}
          onChangeSearch={setSearchQuery}
          beltCapacity={beltCapacity}
          selectedCard={selectedCard}
          onSelectCollectionCard={(markId) => {
            if (pendingSwap) setPendingSwap(null);
            setSelectedCard((prev) =>
              prev?.source === "collection" && prev.markId === markId
                ? null
                : { markId, source: "collection" }
            );
            audio.play("click");
          }}
          onUseCard={(m) => handleUseCard(m)}
          onOpenCardInfo={(id) => {
            setSelectedCard(null);
            setDetailMarkId(id);
            audio.play("click");
          }}
          onSetCardRank={setCardRank}
          getRankForMark={getRankForMark}
          getEffectiveCost={getEffectiveCost}
          checkEligibility={checkEligibility}
          activeDrag={activeDrag}
          onStartCardPointerDrag={(e, mark, rank, cost) =>
            startPointerGesture(e, {
              source: "library",
              markId: mark.id,
              rank,
              cost,
              isKeystone: mark.keystone
            })
          }
          shouldSuppressClick={shouldSuppressClick}
        />
      </div>

      {/* Mobile Tab 2: Stats, Presets & Sync */}
      {mobileTab === "stats" && (
        <div className="cr-mobile-only-pane">
          <RenownInspector
            statsBonus={statsBonus}
            beltCapacity={beltCapacity}
            equippedActive={totals.equippedActive}
            presets={presets}
            onApplyPreset={(p) => {
              applyPreset(p);
              setMobileTab("deck");
            }}
            onCopyCommand={handleCopyInGameCommand}
            onCopyShareUrl={handleCopyShareUrl}
            onOpenImportModal={() => setImportModalOpen(true)}
          />
        </div>
      )}

      {/* Mobile Tab 3: Codex Guide & 67 Chronicles */}
      {mobileTab === "guide" && (
        <div className="cr-mobile-only-pane">
          <CodexGuideContent
            activeTab={guideTab}
            onChangeTab={(t) => {
              setGuideTab(t);
              audio.play("click");
            }}
          />
        </div>
      )}

      {/* Desktop Slide-Over Drawers (Progressive Disclosure - Zero Dual Wide Sidebars!) */}
      <SlideOverDrawer
        open={desktopDrawer === "stats"}
        onClose={() => setDesktopDrawer("none")}
        title="Deck Stats & Archetypes"
        subtitle={`Deck ${activeBuildSlot} · ${totals.totalNotches}/${totals.effectiveBeltCapacity} Notches`}
        width="420px"
      >
        <RenownInspector
          statsBonus={statsBonus}
          beltCapacity={beltCapacity}
          equippedActive={totals.equippedActive}
          presets={presets}
          onApplyPreset={(p) => {
            applyPreset(p);
            setDesktopDrawer("none");
          }}
          onCopyCommand={handleCopyInGameCommand}
          onCopyShareUrl={handleCopyShareUrl}
          onOpenImportModal={() => {
            setDesktopDrawer("none");
            setImportModalOpen(true);
          }}
        />
      </SlideOverDrawer>

      <SlideOverDrawer
        open={desktopDrawer === "guide"}
        onClose={() => setDesktopDrawer("none")}
        title="Renown Codex & Chronicles"
        subtitle="Belt Rules, Mastery Fusion & 67 Ambient Perks"
        width="480px"
      >
        <CodexGuideContent
          activeTab={guideTab}
          onChangeTab={(t) => {
            setGuideTab(t);
            audio.play("click");
          }}
        />
      </SlideOverDrawer>

      {/* Modals / Bottom Sheets */}
      <CardDetailSheet
        markId={detailMarkId}
        onClose={() => setDetailMarkId(null)}
        currentBelt={currentBelt}
        viewMode={viewMode}
        ownedMarks={ownedMarks}
        beltCapacity={beltCapacity}
        getRankForMark={getRankForMark}
        getEffectiveCost={getEffectiveCost}
        onSetCardRank={setCardRank}
        onUseCard={(mark, rank) => handleUseCard(mark, rank)}
      />

      <QuickPickerModal
        slotIdx={quickPickerSlot}
        onClose={() => setQuickPickerSlot(null)}
        onSelectMark={(markId, sIdx, rank) => {
          equipMark(markId, sIdx, rank);
        }}
        viewMode={viewMode}
        ownedMarks={ownedMarks}
        currentBelt={currentBelt}
        getRankForMark={getRankForMark}
        getEffectiveCost={getEffectiveCost}
        remainingNotches={totals.remainingNotches}
        beltCapacity={beltCapacity}
      />

      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportCollection}
        onQuickLoadStarter={handleQuickLoadStarter}
        onUnlockAll={handleUnlockAll}
      />

      {/* Native Mobile Bottom Navigation Bar */}
      <nav className="cr-mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          type="button"
          className={`cr-mobile-nav-btn ${mobileTab === "deck" ? "active" : ""}`}
          onClick={() => {
            setMobileTab("deck");
            audio.play("click");
          }}
        >
          <Swords size={18} />
          <span>Battle Deck</span>
        </button>

        <button
          type="button"
          className={`cr-mobile-nav-btn ${mobileTab === "stats" ? "active" : ""}`}
          onClick={() => {
            setMobileTab("stats");
            audio.play("click");
          }}
        >
          <SlidersHorizontal size={18} />
          <span>Stats &amp; Presets</span>
        </button>

        <button
          type="button"
          className={`cr-mobile-nav-btn ${mobileTab === "guide" ? "active" : ""}`}
          onClick={() => {
            setMobileTab("guide");
            audio.play("click");
          }}
        >
          <BookOpen size={18} />
          <span>Codex Guide</span>
        </button>
      </nav>
    </div>
  );
};
