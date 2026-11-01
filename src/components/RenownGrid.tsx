import React from "react";
import {
  Crown,
  Zap,
  Check,
  Lock,
  Info,
  Search,
  X,
  ArrowUpDown
} from "lucide-react";
import { MarkItem } from "../data/renownData";
import {
  BeltCapacityTier,
  EquippedSlot,
  EligibilityResult,
  findValidSwapSlots
} from "./deckValidation";
import { SlidingSegmented } from "./SlidingSegmented";
import { DomainFilter, SelectedCardState, SortMode } from "./useRenownDeck";
import { ActivePointerDrag } from "./usePointerDeckDrag";

interface RenownGridProps {
  marks: MarkItem[];
  currentBelt: (EquippedSlot | null)[];
  ownedMarks: Record<number, number>;
  viewMode: "all" | "owned";
  onChangeViewMode: (mode: "all" | "owned") => void;
  activeDomain: DomainFilter;
  onChangeDomain: (domain: DomainFilter) => void;
  sortMode: SortMode;
  onCycleSort: () => void;
  searchQuery: string;
  onChangeSearch: (q: string) => void;
  beltCapacity: BeltCapacityTier;
  selectedCard: SelectedCardState | null;
  onSelectCollectionCard: (markId: number) => void;
  onUseCard: (mark: MarkItem) => void;
  onOpenCardInfo: (markId: number) => void;
  onSetCardRank: (markId: number, rank: number) => void;
  getRankForMark: (markId: number) => number;
  getEffectiveCost: (mark: MarkItem, rank: number) => number;
  checkEligibility: (mark: MarkItem, rank: number) => EligibilityResult;
  activeDrag: ActivePointerDrag | null;
  onStartCardPointerDrag: (
    e: React.PointerEvent,
    mark: MarkItem,
    rank: number,
    cost: number
  ) => void;
  shouldSuppressClick: () => boolean;
}

const SORT_LABELS: Record<SortMode, string> = {
  cost: "By Notch",
  tier: "By Rarity",
  id: "By #ID"
};

export const RenownGrid: React.FC<RenownGridProps> = ({
  marks,
  currentBelt,
  ownedMarks,
  viewMode,
  onChangeViewMode,
  activeDomain,
  onChangeDomain,
  sortMode,
  onCycleSort,
  searchQuery,
  onChangeSearch,
  beltCapacity,
  selectedCard,
  onSelectCollectionCard,
  onUseCard,
  onOpenCardInfo,
  onSetCardRank,
  getRankForMark,
  getEffectiveCost,
  checkEligibility,
  activeDrag,
  onStartCardPointerDrag,
  shouldSuppressClick
}) => {
  return (
    <section className="cr-collection-section" aria-label="Card Collection">
      {/* Collection Filter & Search Toolbar */}
      <div className="cr-collection-toolbar">
        <div className="cr-domain-scroll">
          <SlidingSegmented
            options={[
              { id: "ALL", label: "All (55)" },
              { id: "Offense", label: "Offense" },
              { id: "Defense", label: "Defense" },
              { id: "Mobility", label: "Mobility" },
              { id: "Utility", label: "Utility" }
            ]}
            value={activeDomain}
            onChange={(val) => onChangeDomain(val as DomainFilter)}
          />
        </div>

        <div className="cr-toolbar-right">
          <SlidingSegmented
            options={[
              { id: "all", label: "Theorycraft" },
              { id: "owned", label: `Owned (${Object.keys(ownedMarks).length})` }
            ]}
            value={viewMode}
            onChange={(val) => onChangeViewMode(val as "all" | "owned")}
          />

          <button
            type="button"
            className="renown-btn"
            onClick={onCycleSort}
            title="Cycle card sort order"
          >
            <ArrowUpDown size={13} />
            <span>{SORT_LABELS[sortMode]}</span>
          </button>

          <div className="cr-search-box">
            <Search size={14} className="cr-search-icon" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => onChangeSearch(e.target.value)}
              className="cr-search-input"
              aria-label="Search Marks"
            />
            {searchQuery && (
              <button
                type="button"
                className="cr-search-clear"
                onClick={() => onChangeSearch("")}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Clash Royale Collectible Portrait Card Grid */}
      <div className="cr-collection-grid">
        {marks.map((m) => {
          const isEquipped = currentBelt.some((s) => s?.markId === m.id);
          const currentRank = getRankForMark(m.id);
          const effCost = getEffectiveCost(m, currentRank);
          const isDiscounted = !m.keystone && m.cost >= 3 && currentRank === 3;
          const isOwned = viewMode !== "owned" || Boolean(ownedMarks[m.id]);

          const isSelected =
            selectedCard?.source === "collection" && selectedCard.markId === m.id;
          const isBeingDragged =
            activeDrag?.source === "library" && activeDrag.markId === m.id;

          const directEligibility = checkEligibility(m, currentRank);
          const canSwap =
            !isEquipped &&
            !directEligibility.eligible &&
            isOwned &&
            findValidSwapSlots(currentBelt, m, currentRank, viewMode, ownedMarks, beltCapacity)
              .length > 0;

          const primaryCtaLabel = isEquipped
            ? "Remove"
            : directEligibility.eligible
            ? "Use"
            : canSwap
            ? "Swap"
            : "Locked";

          return (
            <div
              key={m.id}
              className={[
                "cr-card-wrapper",
                isSelected ? "is-expanded" : ""
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div
                role="button"
                tabIndex={0}
                aria-label={`${m.name}, ${m.keystone ? "0 Notches Keystone" : `${effCost} Notches`}`}
                className={[
                  "cr-collectible-card",
                  `rarity-${m.tier.toLowerCase()}`,
                  isEquipped ? "is-in-deck" : "",
                  isSelected ? "is-selected" : "",
                  !isOwned ? "is-unowned" : "",
                  isBeingDragged ? "is-drag-origin" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                onPointerDown={(e) => {
                  if (isOwned && !isEquipped) {
                    onStartCardPointerDrag(e, m, currentRank, effCost);
                  }
                }}
                onClick={() => {
                  if (shouldSuppressClick()) return;
                  onSelectCollectionCard(m.id);
                }}
                onDoubleClick={() => {
                  if (isOwned) onUseCard(m);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectCollectionCard(m.id);
                  }
                }}
              >
                {/* Top-Left Notch Elixir Cost Gem */}
                <span
                  className={`cr-cost-gem ${
                    m.keystone ? "is-keystone-gem" : isDiscounted ? "is-discounted-gem" : ""
                  }`}
                >
                  {m.keystone ? "0N" : `${effCost}N`}
                </span>

                {/* Single clean top-right role/deck indicator */}
                {isEquipped ? (
                  <span className="cr-equipped-check" title="Equipped in Battle Deck">
                    <Check size={11} strokeWidth={3} />
                  </span>
                ) : !isOwned ? (
                  <span className="cr-corner-icon" title="Locked in Collection">
                    <Lock size={11} />
                  </span>
                ) : m.keystone ? (
                  <span className="cr-corner-icon is-gold" title="Zero-Notch Keystone">
                    <Crown size={11} />
                  </span>
                ) : m.active ? (
                  <span className="cr-corner-icon" title="Shift+F Active">
                    <Zap size={11} />
                  </span>
                ) : null}

                {/* Pixel-Art Mark Emblem */}
                <div className="cr-card-art-stage">
                  <img
                    src={`assets/marks/mark_${String(m.id).padStart(2, "0")}.png`}
                    alt={m.name}
                    className="cr-card-sprite"
                    draggable={false}
                    loading="lazy"
                  />
                </div>

                {/* Card Title + Mastery Rank Bar */}
                <div className="cr-card-meta">
                  <div className="cr-card-title">{m.name}</div>
                  <div className="cr-card-level-row">
                    <span className="cr-card-domain">{m.domain}</span>
                    <div className="cr-rank-pips" aria-label={`Rank ${currentRank}`}>
                      {[1, 2, 3].map((r) => (
                        <span
                          key={r}
                          className={`cr-rank-pip ${r <= currentRank ? "is-lit" : ""}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Clash Royale Tap-to-Expand Floating Action Tray */}
              {isSelected && (
                <div
                  className="cr-card-action-tray"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="cr-tray-rank-row">
                    {[1, 2, 3].map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`cr-tray-rank-btn ${currentRank === r ? "active" : ""}`}
                        onClick={() => onSetCardRank(m.id, r)}
                      >
                        R{r}
                      </button>
                    ))}
                  </div>

                  <div className="cr-tray-buttons">
                    <button
                      type="button"
                      className={`cr-tray-use-btn ${
                        isEquipped ? "is-remove" : !isOwned ? "is-disabled" : ""
                      }`}
                      disabled={!isOwned && !isEquipped}
                      onClick={() => onUseCard(m)}
                    >
                      {primaryCtaLabel}
                    </button>
                    <button
                      type="button"
                      className="cr-tray-info-btn"
                      onClick={() => onOpenCardInfo(m.id)}
                      aria-label={`View ${m.name} details`}
                    >
                      <Info size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
