"use client";

import { useCallback, useRef, useState } from "react";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const startX = useRef(0);
  const startLeft = useRef(0);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    if (e.button !== 0) return;

    el.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    startLeft.current = el.scrollLeft;
    setDragging(false);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !el.hasPointerCapture(e.pointerId)) return;

    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 5) setDragging(true);
    el.scrollLeft = startLeft.current - dx;
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    if (el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    // delay reset so click capture can cancel if user dragged
    setTimeout(() => setDragging(false), 0);
  }, []);

  const onClickCapture = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [dragging]
  );

  return {
    ref,
    dragging,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onClickCapture,
    },
  };
}

