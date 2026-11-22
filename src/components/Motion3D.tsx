import React, { useEffect, useRef, useState } from 'react';
import { use3DCapability, useReveal3D } from '../hooks/use3DCapability.ts';

export type Reveal3DVariant = 'rise' | 'depth-card' | 'flip-left' | 'flip-right' | 'horizon';

function getInitialTransform(variant: Reveal3DVariant): string {
  switch (variant) {
    case 'depth-card':
      return 'perspective(1100px) translate3d(0, 26px, -42px) rotateX(7deg) scale3d(0.965, 0.965, 1)';
    case 'flip-left':
      return 'perspective(1100px) translate3d(-24px, 10px, -28px) rotateY(8deg) scale3d(0.98, 0.98, 1)';
    case 'flip-right':
      return 'perspective(1100px) translate3d(24px, 10px, -28px) rotateY(-8deg) scale3d(0.98, 0.98, 1)';
    case 'horizon':
      return 'perspective(1100px) translate3d(0, 20px, -24px) rotateX(4deg)';
    case 'rise':
    default:
      return 'perspective(960px) translate3d(0, 18px, -18px) rotateX(4deg)';
  }
}

/**
 * Lightweight 3D scroll reveal.
 * - Uses 1 shared IntersectionObserver (unobserves immediately once revealed).
 * - Animates only GPU compositor transform + opacity.
 * - Clears 3D transform to `none` after settling so compositor tile memory is released.
 * - Instantly static on low-memory/save-data/reduced-motion devices.
 */
export function Reveal3D({
  children,
  className = '',
  delayMs = 0,
  variant = 'rise',
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  variant?: Reveal3DVariant;
}) {
  const { tier } = use3DCapability();
  const isReduced = tier === 'reduced';
  const { ref, visible } = useReveal3D(isReduced);
  const [settled, setSettled] = useState(isReduced);

  useEffect(() => {
    if (isReduced) {
      setSettled(true);
      return;
    }
    if (!visible) return;
    const t = window.setTimeout(() => setSettled(true), 680 + Math.min(delayMs, 260));
    return () => window.clearTimeout(t);
  }, [visible, isReduced, delayMs]);

  if (isReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={className}
      style={
        settled
          ? undefined
          : {
              opacity: visible ? 1 : 0,
              transform: visible
                ? 'perspective(1100px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
                : getInitialTransform(variant),
              transitionProperty: 'transform, opacity',
              transitionDuration: '620ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: `${Math.min(delayMs, 260)}ms`,
              willChange: 'transform, opacity',
            }
      }
    >
      {children}
    </div>
  );
}

/**
 * Interactive 3D perspective card tilt for desktop pointer devices only.
 * - Attaches zero event listeners on mobile touch or low-spec devices.
 * - Caches element bounding rect on pointerenter (no per-frame reflows).
 * - Uses single requestAnimationFrame throttling, subtle ±4° tilt, and optional specular sheen.
 */
export function Tilt3DCard({
  children,
  className = '',
  maxTiltDeg = 3.8,
  enableSheen = true,
}: {
  children: React.ReactNode;
  className?: string;
  maxTiltDeg?: number;
  enableSheen?: boolean;
}) {
  const { canHoverTilt } = use3DCapability();
  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!canHoverTilt) {
    return <div className={className}>{children}</div>;
  }

  const handlePointerEnter = () => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    rectRef.current = {
      left: rect.left,
      top: rect.top,
      width: rect.width || 1,
      height: rect.height || 1,
    };
    if (enableSheen) {
      el.style.setProperty('--sheen-o', '1');
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !rectRef.current) return;
    const { left, top, width, height } = rectRef.current;
    const nx = Math.max(0, Math.min(1, (e.clientX - left) / width));
    const ny = Math.max(0, Math.min(1, (e.clientY - top) / height));
    const px = nx - 0.5;
    const py = ny - 0.5;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = cardRef.current;
      if (!el) return;
      const rotX = (-py * maxTiltDeg * 2).toFixed(2);
      const rotY = (px * maxTiltDeg * 2).toFixed(2);
      el.style.transform = `perspective(980px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate3d(0, -4px, 8px) scale3d(1.01, 1.01, 1)`;
      if (enableSheen) {
        el.style.setProperty('--mx', `${(nx * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(ny * 100).toFixed(1)}%`);
      }
    });
  };

  const handlePointerLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rectRef.current = null;
    const el = cardRef.current;
    if (el) {
      el.style.transform = '';
      if (enableSheen) {
        el.style.setProperty('--sheen-o', '0');
      }
    }
  };

  return (
    <div
      ref={cardRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`transition-transform duration-300 ease-out [transform-style:preserve-3d] ${
        enableSheen ? 'adaptato-tilt-sheen rounded-2xl' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Scroll-linked 3D depth plane for editorial showcases & photo stages.
 * Smoothly tilts from a gentle forward angle into flat architectural alignment as it enters viewport.
 */
export function ScrollDepthFrame({
  children,
  className = '',
  maxAngle = 5,
}: {
  children: React.ReactNode;
  className?: string;
  maxAngle?: number;
}) {
  const { tier, isPageVisible } = use3DCapability();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tier === 'reduced' || !isPageVisible) return;
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    const update = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const center = rect.top + rect.height * 0.5;
      // Normalized -1 (bottom) -> 0 (center) -> +1 (top)
      const delta = Math.max(-1, Math.min(1, (vh * 0.52 - center) / (vh * 0.75)));
      const rotX = (-delta * maxAngle).toFixed(2);
      const scale = (1 - Math.abs(delta) * 0.025).toFixed(4);
      const tz = (-Math.abs(delta) * 18).toFixed(1);
      el.style.transform = `perspective(1200px) translate3d(0, 0, ${tz}px) rotateX(${rotX}deg) scale3d(${scale}, ${scale}, 1)`;
    };

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      window.removeEventListener('scroll', schedule);
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = '';
    };
  }, [tier, isPageVisible, maxAngle]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}

/**
 * Interactive 3D Hero Stage tailored to Espaço Adapta T.O's clinical themes.
 * Renders a layered preserve-3d frame where foreground clinical theme cards sit on elevated Z-planes.
 */
export function HeroStage3D({
  children,
  topBadgeTitle,
  topBadgeSubtitle,
  bottomCardTitle,
  bottomCardSubtitle,
  className = '',
}: {
  children: React.ReactNode;
  topBadgeTitle: string;
  topBadgeSubtitle: string;
  bottomCardTitle: string;
  bottomCardSubtitle: string;
  className?: string;
}) {
  const { tier, canHoverTilt, isPageVisible } = use3DCapability();
  const stageRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (tier === 'reduced' || !isPageVisible) return;
    const el = stageRef.current;
    if (!el) return;

    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const y = Math.min(window.scrollY || 0, 520);
        const scrollTilt = (y / 520) * 3.5;
        el.style.setProperty('--scroll-tilt', `${scrollTilt.toFixed(2)}deg`);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }, [tier, isPageVisible]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePointerEnter = () => {
    if (!canHoverTilt || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    rectRef.current = {
      left: rect.left,
      top: rect.top,
      width: rect.width || 1,
      height: rect.height || 1,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canHoverTilt || e.pointerType !== 'mouse' || !rectRef.current) return;
    const { left, top, width, height } = rectRef.current;
    const px = Math.max(-0.5, Math.min(0.5, (e.clientX - left) / width - 0.5));
    const py = Math.max(-0.5, Math.min(0.5, (e.clientY - top) / height - 0.5));

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = stageRef.current;
      if (!el) return;
      const rotX = (-py * 6.5).toFixed(2);
      const rotY = (px * 7.5).toFixed(2);
      el.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
  };

  const handlePointerLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rectRef.current = null;
    if (stageRef.current) {
      stageRef.current.style.transform = '';
    }
  };

  const isFull = tier === 'full';

  return (
    <div
      ref={stageRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        isFull
          ? ({
              transformStyle: 'preserve-3d',
              transform: 'perspective(1200px) rotateX(var(--scroll-tilt, 0deg))',
            } as React.CSSProperties)
          : undefined
      }
      className={`relative transition-transform duration-300 ease-out ${className}`}
    >
      {/* Main Photo Plane */}
      <div className={isFull ? 'adaptato-preserve-3d' : ''}>{children}</div>

      {/* Elevated 3D Plane 1: Clinical Approach Layer (top-right) */}
      <div
        style={isFull ? { transform: 'translate3d(0, 0, 26px)' } : undefined}
        className={`hidden sm:block absolute -top-3 right-4 lg:right-5 bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-[0_14px_30px_-16px_rgba(31,41,55,0.22)] pointer-events-none ${
          isFull ? 'adaptato-float-3d' : ''
        }`}
      >
        <div className="text-[11px] font-semibold text-[var(--color-forest)] leading-tight">
          {topBadgeTitle}
        </div>
        <div className="text-xs font-medium text-[var(--color-ink)] mt-0.5 leading-tight">
          {topBadgeSubtitle}
        </div>
      </div>

      {/* Elevated 3D Plane 2: Therapeutic Focus Layer (bottom-left) */}
      <div
        style={isFull ? { transform: 'translate3d(0, 0, 34px)' } : undefined}
        className="hidden sm:block absolute -bottom-3.5 left-4 lg:left-5 bg-white border border-slate-200/90 rounded-2xl px-4 py-3 shadow-[0_16px_34px_-16px_rgba(31,41,55,0.24)] pointer-events-none max-w-[270px]"
      >
        <div className="text-xs font-bold font-display text-[var(--color-ink)] leading-snug">
          {bottomCardTitle}
        </div>
        <div className="text-[11px] text-[var(--color-ink-muted)] mt-0.5 leading-snug">
          {bottomCardSubtitle}
        </div>
      </div>
    </div>
  );
}


