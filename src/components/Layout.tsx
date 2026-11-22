import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Bot,
  Calendar,
  Eye,
  Facebook,
  HelpCircle,
  Instagram,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Type,
  X,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';
import { BrandMark } from './ClinicIcon.tsx';

function safeExternalUrl(raw?: string): string | null {
  const val = String(raw || '').trim();
  if (!val) return null;
  if (/^https?:\/\//i.test(val)) return val;
  if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(val)) return `https://${val}`;
  return null;
}

const NAV_ITEMS = [
  { label: 'Início', path: '/' },
  { label: 'Sobre Nós', path: '/#sobre-nos', altPath: '/sobre' },
  { label: 'O que é TEA?', path: '/#o-que-e-tea' },
  { label: 'Serviços', path: '/#nossos-servicos', altPath: '/especialidades' },
  { label: 'Ambientes', path: '/#nossos-espacos' },
  { label: 'Contato', path: '/#contato', altPath: '/contato' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const {
    data,
    currentPath,
    navigate,
    buildWhatsAppUrl,
    assistantOpen,
    setAssistantOpen,
    toggleAssistant,
  } = useClinic();
  const [menuOpen, setMenuOpen] = useState(false);
  const [largeText, setLargeText] = useState<boolean>(() => {
    try {
      return localStorage.getItem('adaptato_a11y_large') === '1';
    } catch {
      return false;
    }
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem('adaptato_a11y_contrast') === '1';
    } catch {
      return false;
    }
  });
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [currentPath]);

  useEffect(() => {
    const root = document.documentElement;
    if (largeText) root.classList.add('a11y-large-text');
    else root.classList.remove('a11y-large-text');
    try {
      localStorage.setItem('adaptato_a11y_large', largeText ? '1' : '0');
    } catch {
      // ignore
    }
  }, [largeText]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) root.classList.add('a11y-high-contrast');
    else root.classList.remove('a11y-high-contrast');
    try {
      localStorage.setItem('adaptato_a11y_contrast', highContrast ? '1' : '0');
    } catch {
      // ignore
    }
  }, [highContrast]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const onClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const clinicName = data?.settings.content.clinicName || 'Espaço Adapta T.O';
  const assistantName = data?.settings.ai.assistantName || 'Assistente Adapta T.O';
  const contact = data?.settings.contact;
  const content = data?.settings.content;
  const specialties = data?.specialties || [];

  const addressParts = (
    contact?.address ||
    'Matriz: Rua Major Gama, 950, Centro Sul - Cuiabá/MT | Filial: Rua Barão de Melgaço, 2350, Edifício Barão Center, Sala 104, Centro Sul - Cuiabá/MT'
  )
    .split('|')
    .map((p) => p.trim())
    .filter(Boolean);

  const phoneParts = (contact?.phone || '(65) 99989-3202 · (65) 99233-0091')
    .split('·')
    .map((p) => p.trim())
    .filter(Boolean);

  const isActive = (item: { path: string; altPath?: string }) => {
    if (item.path === '/') return currentPath === '/' && !window.location.hash;
    if (item.altPath && (currentPath === item.altPath || currentPath.startsWith(`${item.altPath}/`))) {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-white)] text-[var(--color-ink)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-forest)] focus:text-white focus:rounded-lg"
      >
        Ir para o conteúdo principal
      </a>

      {/* Fixed Sensory-Friendly Header */}
      <header
        ref={menuContainerRef}
        className="sticky top-0 z-40 h-[68px] sm:h-[74px] bg-[var(--color-white)] border-b border-slate-100 shadow-[0_2px_14px_-8px_rgba(31,41,55,0.08)]"
      >
        <div className="max-w-[1280px] mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-5">
          {/* Left: Espaço Adapta T.O BrandMark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            aria-label={clinicName}
            className="flex items-center shrink-0 focus-visible:outline-none"
          >
            <BrandMark />
          </a>

          {/* Center: Single-line Navigation */}
          <nav
            aria-label="Navegação principal"
            className="hidden xl:flex items-center gap-4 2xl:gap-6 text-[13.5px] font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    navigate(item.path);
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors duration-200 ${
                    active
                      ? 'border-[var(--color-forest)] text-[var(--color-forest)] font-semibold'
                      : 'border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right: Always-visible Agendar CTA + WhatsApp + Assistant + 3-bar Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
            <button
              type="button"
              onClick={() => navigate('/agendamento')}
              className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3.5 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--color-forest)] text-white hover:opacity-92 transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 sm:hidden" aria-hidden="true" />
              <span className="sm:hidden">Agendar</span>
              <span className="hidden sm:inline">
                {content?.headerCtaText || 'Agendar Avaliação'}
              </span>
            </button>

            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar pelo WhatsApp do Espaço Adapta T.O"
              title="WhatsApp"
              className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-[#1FA855] text-white text-xs sm:text-sm font-semibold hover:opacity-92 transition-all shadow-sm whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                toggleAssistant();
              }}
              aria-expanded={assistantOpen}
              aria-label={`Abrir ${assistantName}`}
              title={assistantName}
              className={`inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                assistantOpen
                  ? 'bg-[var(--color-forest)] border-[var(--color-forest)] text-white'
                  : 'adaptato-soft-tint adaptato-soft-border text-[var(--color-forest)] hover:opacity-90'
              }`}
            >
              <Bot className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden md:inline">Assistente</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAssistantOpen(false);
                setMenuOpen((prev) => !prev);
              }}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu e administração'}
              title="Menu e Administração"
              className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-[var(--color-ink)] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Complement / Accessibility / Admin Dropdown */}
            {menuOpen && (
              <div
                role="menu"
                aria-label="Menu complementar e administração"
                className="hidden xl:block absolute right-0 top-13 w-80 bg-[var(--color-white)] border border-slate-200 rounded-2xl shadow-xl p-2.5 z-50"
              >
                <a
                  href="/duvidas"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/duvidas');
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[var(--color-ink)] hover:bg-slate-50 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                  <span>Dúvidas frequentes</span>
                </a>
                <a
                  href="/privacidade"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/privacidade');
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[var(--color-ink)] hover:bg-slate-50 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                  <span>Política de privacidade</span>
                </a>

                <div className="my-2 border-t border-slate-100" />

                <div className="px-3.5 py-2">
                  <div className="text-[11px] font-medium text-slate-500 mb-2">
                    Acessibilidade de leitura
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLargeText((v) => !v)}
                      aria-pressed={largeText}
                      className={`px-2.5 py-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        largeText
                          ? 'bg-[var(--color-forest)] border-[var(--color-forest)] text-white'
                          : 'bg-slate-50 border-slate-200 text-[var(--color-ink)] hover:border-rose-300'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Texto maior</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHighContrast((v) => !v)}
                      aria-pressed={highContrast}
                      className={`px-2.5 py-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        highContrast
                          ? 'bg-[var(--color-forest)] border-[var(--color-forest)] text-white'
                          : 'bg-slate-50 border-slate-200 text-[var(--color-ink)] hover:border-rose-300'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Contraste</span>
                    </button>
                  </div>
                </div>

                <div className="my-2 border-t border-slate-100" />

                <a
                  href="/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/admin');
                  }}
                  className="flex items-start gap-3 px-3.5 py-3 rounded-xl adaptato-soft-tint hover:opacity-90 transition-opacity"
                >
                  <Lock className="w-4 h-4 text-[var(--color-forest)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-forest)]">
                      Administração do site
                    </div>
                    <div className="text-xs text-slate-600">
                      Agenda, textos, serviços, cores e fotos
                    </div>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Mobile & Tablet Navigation Drawer */}
        {menuOpen && (
          <nav
            aria-label="Menu principal móvel"
            className="xl:hidden bg-[var(--color-white)] border-b border-slate-200 px-4 py-4 shadow-lg max-h-[calc(100vh-70px)] overflow-y-auto"
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item);
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      setMenuOpen(false);
                      navigate(item.path);
                    }}
                    className={`px-3 py-3 rounded-xl text-base font-medium transition-colors ${
                      active
                        ? 'adaptato-soft-tint text-[var(--color-forest)] font-semibold'
                        : 'text-[var(--color-ink)] hover:bg-[var(--color-beige)]'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
              <a
                href="/duvidas"
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  navigate('/duvidas');
                }}
                className="px-3 py-3 rounded-xl text-base font-medium text-slate-600 hover:bg-slate-50"
              >
                Dúvidas frequentes
              </a>
              <a
                href="/privacidade"
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  navigate('/privacidade');
                }}
                className="px-3 py-3 rounded-xl text-base font-medium text-slate-600 hover:bg-slate-50"
              >
                Política de privacidade
              </a>

              <div className="pt-3 mt-2 border-t border-slate-100 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLargeText((v) => !v)}
                    aria-pressed={largeText}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                      largeText
                        ? 'bg-[var(--color-forest)] border-[var(--color-forest)] text-white'
                        : 'border-slate-200 text-[var(--color-ink)]'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Texto maior</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHighContrast((v) => !v)}
                    aria-pressed={highContrast}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                      highContrast
                        ? 'bg-[var(--color-forest)] border-[var(--color-forest)] text-white'
                        : 'border-slate-200 text-[var(--color-ink)]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Alto contraste</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/agendamento');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--color-forest)] text-white font-semibold text-center cursor-pointer"
                >
                  {content?.headerCtaText || 'Agendar Avaliação'}
                </button>
                <a
                  href="/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    navigate('/admin');
                  }}
                  className="w-full py-3 px-4 rounded-xl border adaptato-soft-border adaptato-soft-tint text-[var(--color-forest)] font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" aria-hidden="true" />
                  <span>Administração do site</span>
                </a>
              </div>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Clean Calm Footer */}
      <footer className="bg-[#182235] text-white pb-12 border-t border-slate-800">
        <div className="max-w-[1220px] mx-auto px-5 sm:px-6 pt-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            {/* Brand Column */}
            <div className="lg:col-span-4">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}
                className="inline-flex items-center mb-4"
              >
                <BrandMark light />
              </a>
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                {content?.footerTagline ||
                  'Clínica multidisciplinar especializada em atendimento TEA em Cuiabá-MT. Cuidado calmo, humanizado e baseado em evidências.'}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 mt-6">
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp da clínica"
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-[#1FA855] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                {safeExternalUrl(contact?.instagram) && (
                  <a
                    href={safeExternalUrl(contact?.instagram)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram da clínica"
                    className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-[var(--color-forest)] transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {safeExternalUrl(contact?.facebook) && (
                  <a
                    href={safeExternalUrl(contact?.facebook)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook da clínica"
                    className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-[var(--color-forest)] transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                <a
                  href="/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/admin');
                  }}
                  className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-white/10 border border-white/10 text-xs font-medium text-slate-200 hover:bg-white/15 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-[var(--color-forest)]" aria-hidden="true" />
                  <span>Administração</span>
                </a>
              </div>
            </div>

            {/* Services Column */}
            <div className="lg:col-span-3">
              <h2 className="font-display text-base font-bold text-white mb-4">Nossos Serviços</h2>
              <ul className="space-y-2 text-sm text-slate-300">
                {specialties.slice(0, 9).map((spec) => (
                  <li key={spec.id}>
                    <a
                      href={`/especialidades/${spec.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/especialidades/${spec.slug}`);
                      }}
                      className="hover:text-rose-300 transition-colors"
                    >
                      {spec.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="lg:col-span-5">
              <h2 className="font-display text-base font-bold text-white mb-4">
                Contato e Unidades
              </h2>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0 text-rose-300" aria-hidden="true" />
                  <div className="tabular-nums space-y-0.5">
                    {phoneParts.map((ph, i) => (
                      <div key={i}>{ph}</div>
                    ))}
                  </div>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 shrink-0 text-rose-300" aria-hidden="true" />
                  <span className="break-all">
                    {contact?.email || 'espacoadaptatocomercial@hotmail.com'}
                  </span>
                </li>
                {addressParts.map((addr, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-rose-300" aria-hidden="true" />
                    <span className="leading-relaxed">{addr}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              {content?.footerBottomText ||
                `© ${new Date().getFullYear()} ${clinicName} · Atendimento em TEA · Cuiabá/MT.`}
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <a
                href="/agendamento"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/agendamento');
                }}
                className="hover:text-white transition-colors"
              >
                Agendar Avaliação
              </a>
              <a
                href="/privacidade"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/privacidade');
                }}
                className="hover:text-white transition-colors"
              >
                Privacidade (LGPD)
              </a>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-1 text-slate-200 hover:text-white cursor-pointer shrink-0"
              >
                <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Topo</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
