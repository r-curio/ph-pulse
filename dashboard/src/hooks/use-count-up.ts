"use client";

import { useEffect, useRef, useState } from "react";
import { ANIMATION } from "@/lib/constants";

/**
 * Animates a number from 0 to `target` using requestAnimationFrame with easeOutCubic easing.
 * @param target - The target number to animate toward.
 * @param duration - Animation duration in milliseconds (defaults to ANIMATION.COUNT_UP_MS).
 * @returns The current animated value.
 */
export function useCountUp(
  target: number,
  duration: number = ANIMATION.COUNT_UP_MS
): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setValue(eased * target);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration]);

  return value;
}
