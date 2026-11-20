import React, { useEffect, useState } from 'react';
import {
  AudioLines,
  Baby,
  BookOpen,
  ClipboardCheck,
  Ear,
  HeartHandshake,
  MessageCircle,
  MessageSquare,
  Mic,
  Smile,
  Sparkles,
  Users,
  Wind,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Baby,
  BookOpen,
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
  MessageCircle,
};

export const SPECIALTY_ICON_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'Baby', label: 'Infantil / Criança' },
  { value: 'BookOpen', label: 'Leitura e Aprendizagem' },
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
  { value: 'MessageCircle', label: 'Comunicação Geral' },
];

export function SpecialtyIcon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || MessageCircle;
  return <Icon className={className} aria-hidden="true" />;
}

export function BrandMark({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="10" fill="var(--color-forest)" fillOpacity="0.1" />
      <path
        d="M11 22.5C11 16.701 15.701 12 21.5 12H25V15.5C25 21.299 20.299 26 14.5 26H11V22.5Z"
        stroke="var(--color-forest)"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 22.5C16.8 20.2 19.2 17.8 21.5 15.5"
        stroke="var(--color-taupe)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
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
        <BrandMark className="w-10 h-10 mb-2" />
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
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
