import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_SITE_SETTINGS, getFallbackBootstrapData } from '../data/defaultClinicData.ts';
import type { FaqItem, Professional, SiteSettings, Specialty, ThemeColors } from '../types.ts';

interface BootstrapData {
  settings: SiteSettings;
  specialties: Specialty[];
  professionals: Professional[];
  faqs: FaqItem[];
  aiConfigured: boolean;
}

const BOOTSTRAP_CACHE_KEY = 'adaptato_bootstrap_cache_v10';

interface ClinicContextValue {
  loading: boolean;
  error: string | null;
  data: BootstrapData | null;
  currentPath: string;
  navigate: (path: string) => void;
  refreshData: () => Promise<void>;
  applyThemePreview: (theme: ThemeColors) => void;
  buildWhatsAppUrl: (customMessage?: string) => string;
  preselectedSpecialtyId: number | null;
  preselectedProfessionalId: number | null;
  goToBooking: (opts?: { specialtyId?: number | null; professionalId?: number | null }) => void;
  assistantOpen: boolean;
  setAssistantOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleAssistant: () => void;
}

const ClinicContext = createContext<ClinicContextValue | null>(null);

function applyCssTheme(theme: ThemeColors): void {
  const root = document.documentElement;
  root.style.setProperty('--color-sage', theme.sage);
  root.style.setProperty('--color-forest', theme.forest);
  root.style.setProperty('--color-beige', theme.beige);
  root.style.setProperty('--color-white', theme.white);
  root.style.setProperty('--color-gray-soft', theme.graySoft);
  root.style.setProperty('--color-taupe', theme.taupe);
  root.style.setProperty('--color-ink', theme.ink || '#182235');
  root.style.setProperty('--color-ink-muted', theme.inkMuted || '#4B5563');
}

function normalizeBootstrapData(raw: Partial<BootstrapData> | null | undefined): BootstrapData {
  const fb = getFallbackBootstrapData();
  const s = raw?.settings;
  const mergedContent = { ...DEFAULT_SITE_SETTINGS.content, ...(s?.content || {}) };
  if (!Array.isArray(mergedContent.differentials) || mergedContent.differentials.length === 0) {
    mergedContent.differentials = DEFAULT_SITE_SETTINGS.content.differentials;
  }
  const mergedImages = { ...DEFAULT_SITE_SETTINGS.images, ...(s?.images || {}) };
  if (!Array.isArray(mergedImages.galleryImages)) {
    mergedImages.galleryImages = DEFAULT_SITE_SETTINGS.images.galleryImages;
  } else {
    mergedImages.galleryImages = mergedImages.galleryImages.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0
    );
  }
  return {
    settings: {
      theme: { ...DEFAULT_SITE_SETTINGS.theme, ...(s?.theme || {}) },
      content: mergedContent,
      images: mergedImages,
      contact: { ...DEFAULT_SITE_SETTINGS.contact, ...(s?.contact || {}) },
      ai: { ...DEFAULT_SITE_SETTINGS.ai, ...(s?.ai || {}) },
    },
    specialties: Array.isArray(raw?.specialties) && raw.specialties.length > 0 ? raw.specialties : fb.specialties,
    professionals: Array.isArray(raw?.professionals) ? raw.professionals : fb.professionals,
    faqs: Array.isArray(raw?.faqs) ? raw.faqs : fb.faqs,
    aiConfigured: Boolean(raw?.aiConfigured),
  };
}

function readCachedBootstrap(): BootstrapData | null {
  try {
    const raw = localStorage.getItem(BOOTSTRAP_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BootstrapData;
    if (parsed?.settings?.content && Array.isArray(parsed.specialties)) {
      return normalizeBootstrapData(parsed);
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

const PAGE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Espaço Adapta T.O – Atendimento TEA e Clínica de Autismo em Cuiabá',
    description:
      'Clínica multidisciplinar especializada em atendimento TEA e autismo em Cuiabá-MT. Atendimento humanizado com ABA, ESDM, CAA, Integração Sensorial e PediaSuit.',
  },
  '/sobre': {
    title: 'Nossa História e Equipe – Espaço Adapta T.O Cuiabá',
    description:
      'Conheça a história de fundação por Sumara Najla e Sâmara Ribeiro, nossas abordagens em TEA (ABA, ESDM, CAA, IS, PediaSuit) e equipe clínica.',
  },
  '/especialidades': {
    title: 'Nossos Serviços em TEA – Espaço Adapta T.O Cuiabá',
    description:
      'Psicologia, Terapia Ocupacional, Psicomotricidade, Psicopedagogia, Musicoterapia, Fonoaudiologia, Fisioterapia, Nutrição e Acompanhamento Terapêutico.',
  },
  '/profissionais': {
    title: 'Equipe Clínica – Espaço Adapta T.O Cuiabá',
    description:
      'Conheça os profissionais do Espaço Adapta T.O em Cuiabá-MT, suas áreas de atuação, formação e horários disponíveis.',
  },
  '/agendamento': {
    title: 'Agendar Avaliação TEA – Espaço Adapta T.O Cuiabá',
    description:
      'Solicite seu agendamento no Espaço Adapta T.O em Cuiabá escolhendo a especialidade desejada para falar diretamente pelo WhatsApp.',
  },
  '/duvidas': {
    title: 'Dúvidas Frequentes sobre TEA – Espaço Adapta T.O',
    description:
      'Orientações para famílias sobre avaliação inicial, terapias em autismo (TEA), unidades Matriz e Filial em Cuiabá e LGPD.',
  },
  '/contato': {
    title: 'Contato e Unidades em Cuiabá – Espaço Adapta T.O',
    description:
      'Entre em contato com o Espaço Adapta T.O em Cuiabá pelos telefones (65) 99989-3202 / (65) 99233-0091, mapa e formulário rápido.',
  },
  '/privacidade': {
    title: 'Política de Privacidade e LGPD – Espaço Adapta T.O',
    description:
      'Saiba como o Espaço Adapta T.O protege os dados pessoais de crianças e famílias em conformidade com a LGPD.',
  },
  '/admin': {
    title: 'Painel Administrativo – Espaço Adapta T.O',
    description: 'Área restrita da administração e equipe do Espaço Adapta T.O.',
  },
};

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [preselectedSpecialtyId, setPreselectedSpecialtyId] = useState<number | null>(null);
  const [preselectedProfessionalId, setPreselectedProfessionalId] = useState<number | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const toggleAssistant = useCallback(() => {
    setAssistantOpen((prev) => !prev);
  }, []);

  const refreshData = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);
    try {
      setError(null);
      const res = await fetch('/api/public/bootstrap', { signal: controller.signal });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error('Servidor indisponível.');
      }
      const json = (await res.json()) as BootstrapData;
      if (!json?.settings || !Array.isArray(json.specialties)) {
        throw new Error('Resposta inválida do servidor.');
      }
      const normalized = normalizeBootstrapData(json);
      setData(normalized);
      if (normalized.settings?.theme) {
        applyCssTheme(normalized.settings.theme);
      }
      try {
        localStorage.setItem(BOOTSTRAP_CACHE_KEY, JSON.stringify(normalized));
      } catch {
        // ignore storage quota errors
      }
    } catch {
      const fallback = readCachedBootstrap() || getFallbackBootstrapData();
      setData(fallback);
      if (fallback.settings?.theme) {
        applyCssTheme(fallback.settings.theme);
      }
      setError(null);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const base = currentPath.startsWith('/especialidades/')
      ? '/especialidades'
      : currentPath;
    const meta = PAGE_META[base] || PAGE_META['/'];
    document.title = meta.title;
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute('content', meta.description);

    const canonicalHref = `${window.location.origin}${window.location.pathname}`;
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalHref);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalHref);
  }, [currentPath]);

  const navigate = useCallback(
    (path: string) => {
      try {
        const parsed = new URL(path, window.location.origin);
        const fullTarget = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        const fullCurrent = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        if (fullTarget !== fullCurrent) {
          window.history.pushState({}, '', fullTarget);
          setCurrentPath(parsed.pathname || '/');
        } else if (parsed.pathname !== currentPath) {
          setCurrentPath(parsed.pathname || '/');
        }

        if (parsed.hash) {
          const targetId = parsed.hash.slice(1);
          window.setTimeout(() => {
            const el = document.getElementById(targetId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }, 90);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch {
        window.history.pushState({}, '', '/');
        setCurrentPath('/');
      }
    },
    [currentPath]
  );

  const goToBooking = useCallback(
    (opts?: { specialtyId?: number | null; professionalId?: number | null }) => {
      if (opts?.specialtyId !== undefined) setPreselectedSpecialtyId(opts.specialtyId);
      if (opts?.professionalId !== undefined) setPreselectedProfessionalId(opts.professionalId);
      navigate('/agendamento');
    },
    [navigate]
  );

  const applyThemePreview = useCallback((theme: ThemeColors) => {
    applyCssTheme(theme);
  }, []);

  const buildWhatsAppUrl = useCallback(
    (customMessage?: string) => {
      const digits = (data?.settings.contact.whatsapp || '5565999893202').replace(/\D/g, '');
      const phone = digits.startsWith('55') ? digits : `55${digits}`;
      const defaultMsg =
        'Olá! Conheci o Espaço Adapta T.O pelo site e gostaria de obter informações sobre atendimentos em TEA e agendar uma avaliação.';
      const msg = encodeURIComponent(customMessage || defaultMsg);
      return `https://wa.me/${phone}?text=${msg}`;
    },
    [data]
  );

  return (
    <ClinicContext.Provider
      value={{
        loading,
        error,
        data,
        currentPath,
        navigate,
        refreshData,
        applyThemePreview,
        buildWhatsAppUrl,
        preselectedSpecialtyId,
        preselectedProfessionalId,
        goToBooking,
        assistantOpen,
        setAssistantOpen,
        toggleAssistant,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic(): ClinicContextValue {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic must be used within ClinicProvider');
  return ctx;
}
