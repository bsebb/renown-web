import React, { useState } from "react";
import {
  BookOpen,
  Share2,
  Download,
  Volume2,
  VolumeX,
  Lock,
  Search,
  X,
  Copy,
  Sparkles
} from "lucide-react";
import { SlidingSegmented } from "./SlidingSegmented";
import { RenownBelt } from "./RenownBelt";
import { RenownInspector } from "./RenownInspector";
import { RenownDrawer, DrawerTab } from "./RenownDrawer";
import { QuickPickerModal, ImportModal } from "./RenownModals";
import { RenownGrid } from "./RenownGrid";
import { useRenownDeck } from "./useRenownDeck";

export const RenownView: React.FC = () => {
  const {
    audio,
    sfxEnabled,
    handleToggleSfx,
    activeBuildSlot,
    setActiveBuildSlot,
    currentBelt,
    clearCurrentBelt,
    markRanks,
    viewMode,
    setViewMode,
    ownedMarks,
    activeDomain,
    setActiveDomain,
    searchQuery,
    setSearchQuery,
    toastMessage,
    dragOverSlot,
    setDragOverSlot,
    draggingInfo,
    handleDragEnd,
    getEffectiveCost,
    totalNotches,
    remainingNotches,
    offenseNotches,
    equippedKeystone,
    equippedActive,
    checkEligibility,
    equipMark,
    unequipSlot,
    setSlotRank,
    handleLibraryRankChange,
    handleCardToggleEquip,
    handleDragStartCard,
    handleDragStartSocket,
    handleDragOver,
    handleDrop,
    filteredMarks,
    handleCopyInGameCommand,
    handleCopyShareUrl,
    handleImportCollection,
    handleQuickLoadStarter,
    handleUnlockAll,
    statsBonus
  } = useRenownDeck();

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("rules");
  const [quickPickerSlot, setQuickPickerSlot] = useState<number | null>(null);
  const [socketPopover, setSocketPopover] = useState<{ slotIdx: number; x: number; y: number } | null>(null);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);

  return (
    <div className="renown-container" role="region" aria-label="Renown SMP Deck Builder">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "rgba(18, 18, 22, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--accent-gold)",
            color: "#FFFFFF",
            padding: "12px 18px",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7)",
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "12px",
            fontWeight: 600,
            animation: "socket-snap 200ms ease"
          }}
        >
          <Sparkles size={16} color="var(--accent-gold)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Masthead Header */}
      <header className="renown-top-header">
        <div className="renown-brand-group">
          <img
            src="assets/pack.png"
            alt="Renown SMP Icon"
            className="renown-brand-logo"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div>
            <h1 className="renown-brand-title">Renown SMP</h1>
            <div className="renown-brand-sub">10-Notch Theorycraft & In-Game Loadout Planner</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>BUILD DECK:</span>
          <SlidingSegmented
            options={[
              { id: 1, label: "Slot 1" },
              { id: 2, label: "Slot 2" },
              { id: 3, label: "Slot 3" }
            ]}
            value={activeBuildSlot}
            onChange={(val) => {
              setActiveBuildSlot(val);
              audio.play("click");
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="renown-btn"
            onClick={() => setImportModalOpen(true)}
            title="Import collection from /renown export command"
          >
            <Download size={13} />
            <span>Import Collection</span>
          </button>

          <button
            type="button"
            className="renown-btn"
            onClick={handleCopyInGameCommand}
            title="Copy /renown loadout command to paste in-game"
          >
            <Copy size={13} />
            <span>Export Command</span>
          </button>

          <button
            type="button"
            className="renown-btn"
            onClick={handleCopyShareUrl}
            title="Copy shareable loadout link"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>

          <button
            type="button"
            className="renown-btn"
            onClick={() => {
              setDrawerTab("rules");
              setDrawerOpen(true);
              audio.play("click");
            }}
          >
            <BookOpen size={13} />
            <span>Guide & Chronicles</span>
          </button>

          <button
            type="button"
            className="renown-btn"
            onClick={handleToggleSfx}
            title={sfxEnabled ? "Mute audio" : "Enable Web Audio SFX"}
            aria-label="Toggle Sound Effects"
          >
            {sfxEnabled ? <Volume2 size={14} color="var(--accent-gold)" /> : <VolumeX size={14} />}
          </button>
        </div>
      </header>

      {/* Belt Chassis */}
      <RenownBelt
        currentBelt={currentBelt}
        activeBuildSlot={activeBuildSlot}
        totalNotches={totalNotches}
        remainingNotches={remainingNotches}
        offenseNotches={offenseNotches}
        hasKeystone={Boolean(equippedKeystone)}
        dragOverSlot={dragOverSlot}
        draggingInfo={draggingInfo}
        setDragOverSlot={setDragOverSlot}
        onDragStartSocket={handleDragStartSocket}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        onClear={clearCurrentBelt}
        onSlotClick={(e, idx) => {
          if (currentBelt[idx]) {
            const rect = e.currentTarget.getBoundingClientRect();
            setSocketPopover({
              slotIdx: idx,
              x: rect.left,
              y: rect.bottom + 8
            });
          } else {
            setQuickPickerSlot(idx);
          }
        }}
        socketPopover={socketPopover}
        onClosePopover={() => setSocketPopover(null)}
        onSetSlotRank={setSlotRank}
        onSwapSlot={(targetSlot) => {
          setSocketPopover(null);
          setQuickPickerSlot(targetSlot);
        }}
        onUnequipSlot={unequipSlot}
        getEffectiveCost={getEffectiveCost}
      />

      {/* Workspace */}
      <div className="renown-workspace">
        <section className="renown-library-panel" aria-label="Marks Library">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <SlidingSegmented
              options={[
                { id: "all", label: "All 55 Marks (Theorycraft)" },
                {
                  id: "owned",
                  label: (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <Lock size={12} />
                      <span>My Collection ({Object.keys(ownedMarks).length}/55)</span>
                    </span>
                  )
                }
              ]}
              value={viewMode}
              onChange={(val) => {
                setViewMode(val as "all" | "owned");
                audio.play("click");
              }}
            />

            <div style={{ position: "relative", minWidth: "200px" }}>
              <Search
                size={14}
                style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Search marks, perks, advancements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "6px 10px 6px 30px",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>DOMAIN:</span>
            <SlidingSegmented
              options={[
                { id: "ALL", label: "All Domains" },
                { id: "Offense", label: "Offense" },
                { id: "Defense", label: "Defense" },
                { id: "Mobility", label: "Mobility" },
                { id: "Utility", label: "Utility" }
              ]}
              value={activeDomain}
              onChange={(val) => {
                setActiveDomain(val);
                audio.play("click");
              }}
            />
          </div>

          <RenownGrid
            marks={filteredMarks}
            currentBelt={currentBelt}
            markRanks={markRanks}
            ownedMarks={ownedMarks}
            viewMode={viewMode}
            getEffectiveCost={getEffectiveCost}
            checkEligibility={checkEligibility}
            onDragStartCard={handleDragStartCard}
            onLibraryRankChange={handleLibraryRankChange}
            onCardToggleEquip={handleCardToggleEquip}
          />
        </section>

        <RenownInspector
          statsBonus={statsBonus}
          equippedActive={equippedActive}
        />
      </div>

      <QuickPickerModal
        slotIdx={quickPickerSlot}
        onClose={() => setQuickPickerSlot(null)}
        onSelectMark={(markId, slotIdx, rank) => equipMark(markId, slotIdx, rank)}
        viewMode={viewMode}
        ownedMarks={ownedMarks}
        markRanks={markRanks}
        currentBelt={currentBelt}
        getEffectiveCost={getEffectiveCost}
        remainingNotches={remainingNotches}
      />

      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportCollection}
        onQuickLoadStarter={handleQuickLoadStarter}
        onUnlockAll={handleUnlockAll}
      />

      <RenownDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeTab={drawerTab}
        onChangeTab={(tab) => {
          setDrawerTab(tab);
          audio.play("click");
        }}
      />
    </div>
  );
};
