import React, { useEffect, useState } from 'react';
import {
  Activity,
  Apple,
  AudioLines,
  Baby,
  BookOpen,
  Brain,
  ClipboardCheck,
  Dumbbell,
  Ear,
  Hand,
  HeartHandshake,
  MessageCircle,
  MessageSquare,
  Mic,
  Music,
  Smile,
  Sparkles,
  UserCheck,
  Users,
  Wind,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  Hand,
  Activity,
  BookOpen,
  Music,
  MessageCircle,
  Dumbbell,
  Apple,
  UserCheck,
  Baby,
  MessageSquare,
  Sparkles,
  AudioLines,
  Mic,
  Smile,
  Wind,
  ClipboardCheck,
  Users,
  Ear,
  HeartHandshake,
};

export const SPECIALTY_ICON_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'Brain', label: 'Psicologia / Neurodesenvolvimento' },
  { value: 'Hand', label: 'Terapia Ocupacional' },
  { value: 'Activity', label: 'Psicomotricidade' },
  { value: 'BookOpen', label: 'Psicopedagogia / Aprendizagem' },
  { value: 'Music', label: 'Musicoterapia' },
  { value: 'MessageCircle', label: 'Fonoaudiologia / Comunicação' },
  { value: 'Dumbbell', label: 'Fisioterapia' },
  { value: 'Apple', label: 'Nutrição' },
  { value: 'UserCheck', label: 'Acompanhamento Terapêutico' },
  { value: 'Baby', label: 'Infantil / Criança' },
  { value: 'MessageSquare', label: 'Linguagem / Diálogo' },
  { value: 'Sparkles', label: 'Desenvolvimento' },
  { value: 'AudioLines', label: 'Fala e Articulação' },
  { value: 'Mic', label: 'Voz' },
  { value: 'Smile', label: 'Motricidade Orofacial' },
  { value: 'Wind', label: 'Fluência e Respiração' },
  { value: 'ClipboardCheck', label: 'Avaliação Clínica' },
  { value: 'Users', label: 'Orientação Familiar' },
  { value: 'Ear', label: 'Audição' },
  { value: 'HeartHandshake', label: 'Acolhimento' },
];

export function SpecialtyIcon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || Brain;
  return <Icon className={className} aria-hidden="true" />;
}

export function BrandMark({
  className = '',
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  const uid = React.useId().replace(/:/g, '');
  const fillGradId = `adapta-fill-${uid}`;
  const ringGradId = `adapta-ring-${uid}`;

  return (
    <span className={`inline-flex items-center shrink-0 select-none ${className}`}>
      <svg
        viewBox="0 0 184 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-9 sm:h-12 w-auto shrink-0"
        role="img"
        aria-label="Espaço Adapta T.O"
      >
        <defs>
          <linearGradient id={fillGradId} x1="8%" y1="55%" x2="94%" y2="35%">
            <stop offset="0%" stopColor="#931B9E" />
            <stop offset="28%" stopColor="#D61C63" />
            <stop offset="56%" stopColor="#EA4C2B" />
            <stop offset="76%" stopColor="#E6A817" />
            <stop offset="100%" stopColor="#32A828" />
          </linearGradient>
          <linearGradient id={ringGradId} x1="0%" y1="50%" x2="100%" y2="45%">
            <stop offset="0%" stopColor="#A6249D" />
            <stop offset="35%" stopColor="#E12767" />
            <stop offset="70%" stopColor="#EF8C1A" />
            <stop offset="100%" stopColor="#2EA42A" />
          </linearGradient>
        </defs>

        {/* Outer rainbow outline ring */}
        <ellipse
          cx="92"
          cy="32"
          rx="86"
          ry="21.5"
          transform="rotate(7 92 32)"
          fill={light ? 'rgba(255,255,255,0.96)' : '#FFFFFF'}
          stroke={`url(#${ringGradId})`}
          strokeWidth="2.2"
        />

        {/* Inner spectrum oval */}
        <ellipse
          cx="92"
          cy="32"
          rx="82"
          ry="18.2"
          transform="rotate(7 92 32)"
          fill={`url(#${fillGradId})`}
        />

        {/* Crisp typography inside the mark */}
        <text
          x="35"
          y="19"
          fill="#FFFFFF"
          fontFamily="'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif"
          fontSize="7.4"
          fontWeight="600"
          letterSpacing="0.06em"
        >
          ESPAÇO
        </text>
        <text
          x="34"
          y="37"
          fill="#FFFFFF"
          fontFamily="'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif"
          fontSize="19"
          fontWeight="500"
          letterSpacing="0.04em"
        >
          ADAPTA
        </text>
        <text
          x="101"
          y="50.5"
          fill="#FFFFFF"
          fontFamily="'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif"
          fontSize="14.5"
          fontWeight="500"
          letterSpacing="0.05em"
        >
          T.O
        </text>
      </svg>
    </span>
  );
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[var(--color-beige)] border border-[var(--color-gray-soft)] text-[var(--color-forest)] p-6 text-center ${className}`}
      >
        <BrandMark className="mb-2" />
        <span className="text-sm font-medium text-[var(--color-ink-muted)]">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
