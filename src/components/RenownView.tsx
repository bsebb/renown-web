import React, { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { ALL_MARKS } from "../data/renownData";
import { RenownBelt } from "./RenownBelt";
import { RenownGrid } from "./RenownGrid";
import { RenownInspector } from "./RenownInspector";
import { CodexGuideContent, DrawerTab } from "./RenownDrawer";
import { CardDetailSheet, QuickPickerModal, ImportModal } from "./RenownModals";
import {
  DragGhostCard,
  MastheadHeader,
  MobileBottomNav,
  MobileTab,
  StickyMiniDeck
} from "./RenownChrome";
import { SlideOverDrawer } from "./ui/SlideOverDrawer";
import { useRenownDeck, SortMode as DeckSortMode } from "./useRenownDeck";
import { usePointerDeckDrag } from "./usePointerDeckDrag";

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
      ([entry]) => setShowStickyMiniDeck(!entry.isIntersecting),
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [mobileTab]);

  useEffect(() => {
    if (!selectedCard && !pendingSwap) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !selectedCard) return;
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
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCard(null);
        setPendingSwap(null);
      }
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedCard, pendingSwap, setSelectedCard, setPendingSwap]);

  const cycleSort = () => {
    const order: DeckSortMode[] = ["cost", "tier", "id"];
    setSortMode(order[(order.indexOf(sortMode) + 1) % order.length]);
    audio.play("click");
  };

  const dragGhostMark = activeDrag ? ALL_MARKS.find((m) => m.id === activeDrag.markId) : null;

  return (
    <div className="cr-app-shell" role="region" aria-label="Renown SMP Deck Builder">
      {toastMessage && (
        <div className="cr-toast" role="status">
          <Sparkles size={14} color="var(--accent-gold)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {activeDrag && dragGhostMark && (
        <DragGhostCard
          activeDrag={activeDrag}
          mark={dragGhostMark}
          hoverDeckArea={hoverDeckArea}
          hoverSlotIdx={hoverSlotIdx}
        />
      )}

      {showStickyMiniDeck && mobileTab === "deck" && !pendingSwap && (
        <StickyMiniDeck
          currentBelt={currentBelt}
          totals={totals}
          hoverSlotIdx={hoverSlotIdx}
          onScrollToDeck={() => deckAnchorRef.current?.scrollIntoView({ behavior: "smooth" })}
        />
      )}

      <MastheadHeader
        sfxEnabled={sfxEnabled}
        onToggleSfx={handleToggleSfx}
        onOpenImport={() => setImportModalOpen(true)}
        onCopyCommand={handleCopyInGameCommand}
        onCopyShareUrl={handleCopyShareUrl}
        onOpenGuide={() => {
          setDesktopDrawer("guide");
          audio.play("click");
        }}
      />

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
              if (window.innerWidth <= 768) setMobileTab("stats");
              else setDesktopDrawer("stats");
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
        onSelectMark={(markId, sIdx, rank) => equipMark(markId, sIdx, rank)}
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

      <MobileBottomNav
        mobileTab={mobileTab}
        onSelectTab={(t) => {
          setMobileTab(t);
          audio.play("click");
        }}
      />
    </div>
  );
};
