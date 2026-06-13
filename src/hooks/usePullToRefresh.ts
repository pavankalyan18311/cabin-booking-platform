'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

const THRESHOLD   = 72;   // px of downward pull needed to trigger refresh
const MAX_PULL    = 100;  // cap the visual drag distance
const COOLDOWN_MS = 2000; // minimum ms between refreshes

interface Options {
  onRefresh: () => Promise<void> | void;
  /** Element to attach touch listeners to — defaults to window */
  targetRef?: React.RefObject<HTMLElement | null>;
}

export function usePullToRefresh({ onRefresh, targetRef }: Options) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing,   setRefreshing]   = useState(false);

  const startY      = useRef(0);
  const pulling     = useRef(false);
  const lastRefresh = useRef(0);

  const getTarget = useCallback(
    () => (targetRef?.current ?? window) as EventTarget,
    [targetRef],
  );

  const isAtTop = () => {
    if (targetRef?.current) return targetRef.current.scrollTop === 0;
    return window.scrollY === 0;
  };

  useEffect(() => {
    const el = getTarget();

    const onTouchStart = (e: Event) => {
      const te = e as TouchEvent;
      if (!isAtTop()) return;
      startY.current  = te.touches[0].clientY;
      pulling.current = true;
    };

    const onTouchMove = (e: Event) => {
      if (!pulling.current) return;
      const te    = e as TouchEvent;
      const delta = te.touches[0].clientY - startY.current;
      if (delta <= 0) { setPullDistance(0); return; }
      // Resist further pull with diminishing returns past threshold
      const clamped = Math.min(delta * 0.5, MAX_PULL);
      setPullDistance(clamped);
    };

    const onTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;

      const now = Date.now();
      if (pullDistance >= THRESHOLD && !refreshing && now - lastRefresh.current > COOLDOWN_MS) {
        setRefreshing(true);
        setPullDistance(0);
        lastRefresh.current = now;
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
        }
      } else {
        setPullDistance(0);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove',  onTouchMove,  { passive: true });
    el.addEventListener('touchend',   onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchend',   onTouchEnd);
    };
  }, [getTarget, onRefresh, pullDistance, refreshing]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return { pullDistance, refreshing, progress, triggered: progress >= 1 };
}
