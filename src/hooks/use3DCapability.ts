import { useEffect, useRef, useState } from 'react';

export interface Device3DCapability {
  tier: 'full' | 'reduced';
  canHoverTilt: boolean;
  isPageVisible: boolean;
}

function evaluateDeviceCapability(): { tier: 'full' | 'reduced'; canHoverTilt: boolean } {
  if (typeof window === 'undefined') {
    return { tier: 'reduced', canHoverTilt: false };
  }

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if (reducedMotion) {
    return { tier: 'reduced', canHoverTilt: false };
  }

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  // Respect battery/data-saver & low-RAM/low-core devices automatically
  const saveData = Boolean(nav.connection?.saveData);
  const slowNet =
    nav.connection?.effectiveType === 'slow-2g' || nav.connection?.effectiveType === '2g';
  const lowRam = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 3;
  const lowCpu =
    typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;

  const isLowEnd = saveData || slowNet || lowRam || lowCpu;
  const canHoverTilt =
    !isLowEnd &&
    (window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false);

  return {
    tier: isLowEnd ? 'reduced' : 'full',
    canHoverTilt,
  };
}

export function use3DCapability(): Device3DCapability {
  const [cap, setCap] = useState(() => evaluateDeviceCapability());
  const [isPageVisible, setIsPageVisible] = useState(() =>
    typeof document === 'undefined' ? true : !document.hidden
  );

  useEffect(() => {
    const mqMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const mqHover = window.matchMedia?.('(hover: hover) and (pointer: fine)');

    const sync = () => setCap(evaluateDeviceCapability());
    const onVisChange = () => setIsPageVisible(!document.hidden);

    mqMotion?.addEventListener?.('change', sync);
    mqHover?.addEventListener?.('change', sync);
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      mqMotion?.removeEventListener?.('change', sync);
      mqHover?.removeEventListener?.('change', sync);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, []);

  return {
    tier: cap.tier,
    canHoverTilt: cap.canHoverTilt,
    isPageVisible,
  };
}

// Single shared IntersectionObserver for one-shot 3D reveals (zero per-card observer bloat)
type RevealCallback = () => void;
const revealCallbacks = new WeakMap<Element, RevealCallback>();
let sharedRevealObserver: IntersectionObserver | null = null;

function getSharedRevealObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return null;
  if (!sharedRevealObserver) {
    sharedRevealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cb = revealCallbacks.get(entry.target);
            sharedRevealObserver?.unobserve(entry.target);
            revealCallbacks.delete(entry.target);
            cb?.();
          }
        }
      },
      { rootMargin: '0px 0px -36px 0px', threshold: 0.06 }
    );
  }
  return sharedRevealObserver;
}

export function useReveal3D(disabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(disabled);

  useEffect(() => {
    if (disabled) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = getSharedRevealObserver();
    if (!observer) {
      setVisible(true);
      return;
    }

    revealCallbacks.set(el, () => setVisible(true));
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      revealCallbacks.delete(el);
    };
  }, [disabled]);

  return { ref, visible };
}
