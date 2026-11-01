import { useState, useRef, useEffect, useCallback } from "react";

export interface ActivePointerDrag {
  source: "library" | "socket";
  markId: number;
  rank: number;
  cost: number;
  isKeystone: boolean;
  fromSlotIdx?: number;
  x: number;
  y: number;
}

interface PendingGesture {
  pointerId: number;
  pointerType: string;
  source: "library" | "socket";
  markId: number;
  rank: number;
  cost: number;
  isKeystone: boolean;
  fromSlotIdx?: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  holdTimer: number | null;
}

interface UsePointerDeckDragOptions {
  onDropOnSlot: (drag: ActivePointerDrag, targetSlotIdx: number) => void;
  onDropOutsideBelt: (drag: ActivePointerDrag) => void;
  onDragActivated?: () => void;
}

export function usePointerDeckDrag({
  onDropOnSlot,
  onDropOutsideBelt,
  onDragActivated
}: UsePointerDeckDragOptions) {
  const [activeDrag, setActiveDrag] = useState<ActivePointerDrag | null>(null);
  const [hoverSlotIdx, setHoverSlotIdx] = useState<number | null>(null);
  const [hoverDeckArea, setHoverDeckArea] = useState<boolean>(false);

  const pendingRef = useRef<PendingGesture | null>(null);
  const activeDragRef = useRef<ActivePointerDrag | null>(null);
  const hoverSlotRef = useRef<number | null>(null);
  const hoverDeckRef = useRef<boolean>(false);
  const suppressClickUntilRef = useRef<number>(0);

  const clearPendingTimer = () => {
    if (pendingRef.current?.holdTimer) {
      window.clearTimeout(pendingRef.current.holdTimer);
      pendingRef.current.holdTimer = null;
    }
  };

  const resolveSlotUnderPoint = (clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return { slotIdx: null, inDeck: false };
    const slotEl = el.closest("[data-belt-slot]") as HTMLElement | null;
    const deckEl = el.closest("[data-battle-deck]") as HTMLElement | null;
    const parsedSlot = slotEl ? parseInt(slotEl.getAttribute("data-belt-slot") || "-1", 10) : -1;
    return {
      slotIdx: parsedSlot >= 0 ? parsedSlot : null,
      inDeck: Boolean(deckEl)
    };
  };

  const activateGesture = useCallback(
    (g: PendingGesture, x: number, y: number) => {
      const drag: ActivePointerDrag = {
        source: g.source,
        markId: g.markId,
        rank: g.rank,
        cost: g.cost,
        isKeystone: g.isKeystone,
        fromSlotIdx: g.fromSlotIdx,
        x,
        y
      };
      activeDragRef.current = drag;
      setActiveDrag(drag);
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(10);
      }
      onDragActivated?.();
      const target = resolveSlotUnderPoint(x, y);
      hoverSlotRef.current = target.slotIdx;
      hoverDeckRef.current = target.inDeck;
      setHoverSlotIdx(target.slotIdx);
      setHoverDeckArea(target.inDeck);
    },
    [onDragActivated]
  );

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const pending = pendingRef.current;
      const active = activeDragRef.current;

      if (active) {
        if (e.cancelable) e.preventDefault();
        const next = { ...active, x: e.clientX, y: e.clientY };
        activeDragRef.current = next;
        setActiveDrag(next);

        const target = resolveSlotUnderPoint(e.clientX, e.clientY);
        if (target.slotIdx !== hoverSlotRef.current) {
          hoverSlotRef.current = target.slotIdx;
          setHoverSlotIdx(target.slotIdx);
        }
        if (target.inDeck !== hoverDeckRef.current) {
          hoverDeckRef.current = target.inDeck;
          setHoverDeckArea(target.inDeck);
        }
        return;
      }

      if (!pending || pending.pointerId !== e.pointerId) return;
      pending.lastX = e.clientX;
      pending.lastY = e.clientY;
      const dx = e.clientX - pending.startX;
      const dy = e.clientY - pending.startY;
      const dist = Math.hypot(dx, dy);

      if (pending.pointerType === "mouse") {
        if (dist > 6) {
          clearPendingTimer();
          activateGesture(pending, e.clientX, e.clientY);
        }
      } else {
        // On touch: socket cards drag immediately; library cards allow vertical scroll unless held
        if (pending.source === "socket" && dist > 9) {
          clearPendingTimer();
          activateGesture(pending, e.clientX, e.clientY);
        } else if (pending.source === "library" && dist > 10) {
          // User is scrolling the collection naturally
          clearPendingTimer();
          pendingRef.current = null;
        }
      }
    };

    const finishGesture = () => {
      clearPendingTimer();
      const active = activeDragRef.current;
      if (active) {
        suppressClickUntilRef.current = Date.now() + 260;
        const slotIdx = hoverSlotRef.current;
        const inDeck = hoverDeckRef.current;
        if (slotIdx !== null) {
          onDropOnSlot(active, slotIdx);
        } else if (active.source === "socket" && !inDeck) {
          onDropOutsideBelt(active);
        }
      }
      pendingRef.current = null;
      activeDragRef.current = null;
      hoverSlotRef.current = null;
      hoverDeckRef.current = false;
      setActiveDrag(null);
      setHoverSlotIdx(null);
      setHoverDeckArea(false);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", finishGesture);
    window.addEventListener("pointercancel", finishGesture);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", finishGesture);
      window.removeEventListener("pointercancel", finishGesture);
    };
  }, [activateGesture, onDropOnSlot, onDropOutsideBelt]);

  const startPointerGesture = (
    e: React.PointerEvent,
    payload: Omit<ActivePointerDrag, "x" | "y">
  ) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    clearPendingTimer();

    const gesture: PendingGesture = {
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      ...payload,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      holdTimer: null
    };

    if (e.pointerType !== "mouse" && payload.source === "library") {
      gesture.holdTimer = window.setTimeout(() => {
        if (pendingRef.current && pendingRef.current.pointerId === gesture.pointerId) {
          activateGesture(
            pendingRef.current,
            pendingRef.current.lastX,
            pendingRef.current.lastY
          );
        }
      }, 200);
    }

    pendingRef.current = gesture;
  };

  const shouldSuppressClick = () => Date.now() < suppressClickUntilRef.current;

  return {
    activeDrag,
    hoverSlotIdx,
    hoverDeckArea,
    startPointerGesture,
    shouldSuppressClick
  };
}
