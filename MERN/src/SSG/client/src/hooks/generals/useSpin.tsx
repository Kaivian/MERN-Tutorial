// client/src/hooks/generals/useSpin.tsx
import { useEffect, useRef, useState } from "react";

/**
 * Custom React hook for spinning an element at a constant speed with smooth stopping.
 *
 * Features:
 * - Starts spinning forward at a specified speed in degrees per second.
 * - Stops by returning smoothly to 0° using the shortest path.
 * - Provides a `rotation` value (0–360°) and a `settling` flag indicating if the spin is returning to 0°.
 *
 * @param {number} [speed=2] - Spin speed multiplier (1 = 360°/s).
 * @returns {Object} Hook API
 * @returns {number} rotation - Current rotation angle in degrees (0–360°).
 * @returns {boolean} settling - True if currently returning to 0°.
 * @returns {() => void} start - Start spinning forward at constant speed.
 * @returns {() => void} stop - Stop spinning and return to 0°.
 * @returns {() => void} settle - Alias for `stop`.
 */
export function useSpin(speed = 2) {
  const [rotation, setRotation] = useState(0);
  const [settling, setSettling] = useState(false);

  const rafId = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);
  const angleAbs = useRef<number>(0);

  type Mode = "idle" | "spinning" | "returning";
  const mode = useRef<Mode>("idle");
  const targetAngle = useRef<number | null>(null);
  const dir = useRef<1 | -1>(1);

  const degPerSec = speed * 360;

  const cancel = () => {
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };

  const tick = (ts: number) => {
    if (lastTs.current == null) lastTs.current = ts;
    const dt = (ts - lastTs.current) / 1000;
    lastTs.current = ts;

    if (mode.current === "spinning") {
      angleAbs.current += degPerSec * dt;
    } else if (mode.current === "returning" && targetAngle.current != null) {
      const step = dir.current * degPerSec * dt;
      const next = angleAbs.current + step;

      const reached =
        (dir.current === 1 && next >= targetAngle.current) ||
        (dir.current === -1 && next <= targetAngle.current);

      angleAbs.current = reached ? targetAngle.current : next;

      if (reached) {
        mode.current = "idle";
        setSettling(false);
        targetAngle.current = null;
        angleAbs.current = Math.round(angleAbs.current / 360) * 360;
        lastTs.current = null;
        setRotation(0);
        cancel();
        return;
      }
    }

    const a = angleAbs.current % 360;
    setRotation(a < 0 ? a + 360 : a);

    rafId.current = requestAnimationFrame(tick);
  };

  const ensureRAF = () => {
    if (rafId.current == null) {
      lastTs.current = null;
      rafId.current = requestAnimationFrame(tick);
    }
  };

  const start = () => {
    mode.current = "spinning";
    setSettling(false);
    targetAngle.current = null;
    ensureRAF();
  };

  const stop = () => {
  if (mode.current === "returning") return;

  const a = angleAbs.current % 360;
  const mod = a < 0 ? a + 360 : a;

  dir.current = 1;
  const forward = (360 - mod) % 360;
  targetAngle.current = angleAbs.current + forward;

  if (forward === 0) {
    mode.current = "idle";
    setSettling(false);
    setRotation(0);
    return;
  }

  mode.current = "returning";
  setSettling(true);
  ensureRAF();
};

  const settle = stop;

  useEffect(() => cancel, []);

  return {
    rotation,
    settling,
    start,
    stop,
    settle,
  };
}
