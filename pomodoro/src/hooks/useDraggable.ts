import { useState, useEffect, useRef, useCallback } from 'react';

export type DockPosition = 'bottom' | 'left' | 'right';

type DragState = 'idle' | 'dragging';

/**
 * Compute which dock zone a screen coordinate falls into.
 * Screen is divided horizontally:
 *   left 30%   → left zone
 *   right 30%  → right zone
 *   center 40% → bottom zone
 */
function getZone(x: number, _y: number): DockPosition {
  const w = window.innerWidth;

  if (x < w * 0.30) return 'left';
  if (x > w * 0.70) return 'right';
  return 'bottom';
}

interface UseDraggableOptions {
  position: DockPosition;
  onDock: (pos: DockPosition) => void;
  enabled: boolean;
}

export function useDraggable({ onDock, enabled }: UseDraggableOptions) {
  const [dragState, setDragState] = useState<DragState>('idle');
  const [activeZone, setActiveZone] = useState<DockPosition | null>(null);

  // Stash the latest onDock in a ref so the effect doesn't re-bind
  const onDockRef = useRef(onDock);
  onDockRef.current = onDock;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      // Only respond to primary button / touch
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      e.preventDefault();
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      setDragState('dragging');
      setActiveZone(getZone(e.clientX, e.clientY));
    },
    [enabled],
  );

  useEffect(() => {
    if (dragState !== 'dragging') return;

    const handleMove = (e: PointerEvent) => {
      setActiveZone(getZone(e.clientX, e.clientY));
    };

    const handleUp = (e: PointerEvent) => {
      const zone = getZone(e.clientX, e.clientY);
      onDockRef.current(zone);
      setDragState('idle');
      setActiveZone(null);
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerup', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragState]);

  return {
    isDragging: dragState === 'dragging',
    activeZone,
    dragHandlers: {
      onPointerDown: handlePointerDown,
    },
  };
}
