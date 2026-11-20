import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getFallbackBootstrapData } from '../data/defaultClinicData.ts';
import type { FaqItem, Professional, SiteSettings, Specialty, ThemeColors } from '../types.ts';

interface BootstrapData {
  settings: SiteSettings;
  specialties: Specialty[];
  professionals: Professional[];
  faqs: FaqItem[];
  aiConfigured: boolean;
}

const BOOTSTRAP_CACHE_KEY = 'adaptato_bootstrap_cache_v1';

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
  root.style.setProperty('--color-ink', theme.ink || '#243028');
  root.style.setProperty('--color-ink-muted', theme.inkMuted || '#56524D');
}

function readCachedBootstrap(): BootstrapData | null {
  try {
    const raw = localStorage.getItem(BOOTSTRAP_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BootstrapData;
    if (parsed?.settings?.content && Array.isArray(parsed.specialties)) {
      return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

const PAGE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'adaptaTO – Clínica de Fonoaudiologia Infantil',
    description:
      'Comunicação, desenvolvimento e cuidado em cada fase da infância. Atendimento fonoaudiológico exclusivo para crianças na adaptaTO.',
  },
  '/sobre': {
    title: 'Sobre Nós – adaptaTO Fonoaudiologia Infantil',
    description:
      'Conheça a missão, visão, valores, filosofia de atendimento infantil e equipe da clínica adaptaTO.',
  },
  '/especialidades': {
    title: 'Especialidades – adaptaTO Fonoaudiologia Infantil',
    description:
      'Conheça as áreas de atuação fonoaudiológica infantil da adaptaTO: linguagem, fala, aprendizagem, voz, motricidade orofacial, fluência e orientação familiar.',
  },
  '/profissionais': {
    title: 'Profissionais – adaptaTO Fonoaudiologia Infantil',
    description:
      'Conheça os fonoaudiólogos da clínica adaptaTO, suas especialidades infantis e horários disponíveis para atendimento.',
  },
  '/agendamento': {
    title: 'Agendamento Online – adaptaTO Fonoaudiologia Infantil',
    description:
      'Solicite o atendimento fonoaudiológico da sua criança escolhendo especialidade, profissional, data e horário disponível.',
  },
  '/duvidas': {
    title: 'Dúvidas Frequentes – adaptaTO Fonoaudiologia Infantil',
    description:
      'Respostas claras para pais e responsáveis sobre avaliações infantis, agendamentos e privacidade na clínica adaptaTO.',
  },
  '/contato': {
    title: 'Contato – adaptaTO Fonoaudiologia',
    description:
      'Entre em contato com a clínica adaptaTO por formulário, telefone, e-mail ou WhatsApp.',
  },
  '/privacidade': {
    title: 'Política de Privacidade e LGPD – adaptaTO Fonoaudiologia',
    description:
      'Saiba como a clínica adaptaTO protege seus dados pessoais em conformidade com a LGPD.',
  },
  '/admin': {
    title: 'Painel Administrativo – adaptaTO',
    description: 'Área restrita da equipe e administração da clínica adaptaTO.',
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
    try {
      setError(null);
      const res = await fetch('/api/public/bootstrap');
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error('Servidor indisponível.');
      }
      const json = (await res.json()) as BootstrapData;
      if (!json?.settings || !Array.isArray(json.specialties)) {
        throw new Error('Resposta inválida do servidor.');
      }
      setData(json);
      if (json.settings?.theme) {
        applyCssTheme(json.settings.theme);
      }
      try {
        localStorage.setItem(BOOTSTRAP_CACHE_KEY, JSON.stringify(json));
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
  }, [currentPath]);

  const navigate = useCallback((path: string) => {
    const parsed = new URL(path, window.location.origin);
    const fullTarget = `${parsed.pathname}${parsed.search}`;
    const fullCurrent = `${window.location.pathname}${window.location.search}`;
    if (fullTarget !== fullCurrent) {
      window.history.pushState({}, '', fullTarget);
      setCurrentPath(parsed.pathname || '/');
    } else if (parsed.pathname !== currentPath) {
      setCurrentPath(parsed.pathname || '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath]);

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
      const digits = (data?.settings.contact.whatsapp || '11999990000').replace(/\D/g, '');
      const phone = digits.startsWith('55') ? digits : `55${digits}`;
      const defaultMsg =
        'Olá! Conheci a clínica adaptaTO pelo site e gostaria de obter informações sobre os atendimentos e agendar uma consulta.';
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
