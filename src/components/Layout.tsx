import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Bot,
  Clock,
  Eye,
  Facebook,
  FileSearch,
  HelpCircle,
  Instagram,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Music2,
  Phone,
  ShieldCheck,
  Type,
  X,
  Youtube,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';
import { BrandMark } from './ClinicIcon.tsx';

const NAV_ITEMS = [
  { label: 'Início', path: '/' },
  { label: 'Sobre nós', path: '/sobre' },
  { label: 'Especialidades', path: '/especialidades' },
  { label: 'Profissionais', path: '/profissionais' },
  { label: 'Agendamento', path: '/agendamento' },
  { label: 'Contato', path: '/contato' },
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
      // ignore storage errors
    }
  }, [largeText]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) root.classList.add('a11y-high-contrast');
    else root.classList.remove('a11y-high-contrast');
    try {
      localStorage.setItem('adaptato_a11y_contrast', highContrast ? '1' : '0');
    } catch {
      // ignore storage errors
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

  const clinicName = data?.settings.content.clinicName || 'adaptaTO';
  const assistantName = data?.settings.ai.assistantName || 'Assistente adaptaTO';
  const contact = data?.settings.contact;
  const content = data?.settings.content;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-beige)] text-[var(--color-ink)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-forest)] focus:text-white focus:rounded-lg"
      >
        Ir para o conteúdo principal
      </a>

      {/* Top Navigation Bar - Strict 3-Zone Editorial Contract */}
      <header
        ref={menuContainerRef}
        className="sticky top-0 z-40 h-[76px] bg-[var(--color-white)]/92 backdrop-blur-lg border-b border-[var(--color-gray-soft)]"
      >
        <div className="max-w-[1220px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4 lg:gap-6">
          {/* Zone 1: Brand wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 font-display text-[22px] font-medium tracking-tight text-[var(--color-forest)]"
          >
            <BrandMark className="w-7 h-7" />
            <span>{clinicName}</span>
          </a>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav
            aria-label="Navegação principal"
            className="hidden lg:flex items-center gap-5 xl:gap-7 text-[14px] font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={`whitespace-nowrap shrink-0 py-1.5 border-b-[1.5px] transition-colors duration-200 ${
                    active
                      ? 'border-[var(--color-forest)] text-[var(--color-forest)]'
                      : 'border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-forest)]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Primary CTA + AI Assistant button + 3-bar menu trigger */}
          <div className="flex items-center gap-2.5 shrink-0 relative">
            <button
              type="button"
              onClick={() => navigate('/agendamento')}
              className="hidden sm:inline-flex items-center justify-center px-4 xl:px-5 py-2.5 text-sm font-medium rounded-xl bg-[var(--color-forest)] text-white hover:opacity-92 transition-all duration-200 shadow-[0_8px_20px_-10px_rgba(36,48,40,0.45)] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {content?.headerCtaText || 'Agendar consulta'}
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                toggleAssistant();
              }}
              aria-expanded={assistantOpen}
              aria-label={`Abrir ${assistantName}`}
              title={assistantName}
              className={`inline-flex items-center justify-center gap-2 h-11 px-3 xl:px-3.5 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                assistantOpen
                  ? 'bg-[var(--color-forest)] border-[var(--color-forest)] text-white'
                  : 'bg-[var(--color-beige)]/65 border-[var(--color-sage)] text-[var(--color-forest)] hover:bg-[var(--color-beige)]'
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
              className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-[var(--color-gray-soft)] text-[var(--color-forest)] hover:bg-[var(--color-beige)] transition-colors cursor-pointer"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Dropdown Panel */}
            {menuOpen && (
              <div
                role="menu"
                aria-label="Menu complementar e administração"
                className="hidden lg:block absolute right-0 top-14 w-80 bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl shadow-[0_24px_60px_-20px_rgba(36,48,40,0.22)] p-2.5 z-50"
              >
                <a
                  href="/agendamento?aba=acompanhar"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/agendamento?aba=acompanhar');
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[var(--color-ink)] hover:bg-[var(--color-beige)] transition-colors"
                >
                  <FileSearch className="w-4 h-4 text-[var(--color-taupe)] shrink-0" aria-hidden="true" />
                  <span>Acompanhar agendamento</span>
                </a>
                <a
                  href="/duvidas"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/duvidas');
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[var(--color-ink)] hover:bg-[var(--color-beige)] transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-[var(--color-taupe)] shrink-0" aria-hidden="true" />
                  <span>Dúvidas frequentes</span>
                </a>
                <a
                  href="/privacidade"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/privacidade');
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[var(--color-ink)] hover:bg-[var(--color-beige)] transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[var(--color-taupe)] shrink-0" aria-hidden="true" />
                  <span>Política de privacidade</span>
                </a>

                <div className="my-2 border-t border-[var(--color-gray-soft)]" />

                <div className="px-3.5 py-2">
                  <div className="text-[11px] font-medium text-[var(--color-taupe)] mb-2">
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
                          : 'bg-[var(--color-beige)]/55 border-[var(--color-gray-soft)] text-[var(--color-ink)] hover:border-[var(--color-sage)]'
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
                          : 'bg-[var(--color-beige)]/55 border-[var(--color-gray-soft)] text-[var(--color-ink)] hover:border-[var(--color-sage)]'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Contraste</span>
                    </button>
                  </div>
                </div>

                <div className="my-2 border-t border-[var(--color-gray-soft)]" />

                <a
                  href="/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/admin');
                  }}
                  className="flex items-start gap-3 px-3.5 py-3 rounded-xl bg-[var(--color-beige)]/75 hover:bg-[var(--color-beige)] transition-colors"
                >
                  <Lock className="w-4 h-4 text-[var(--color-forest)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-forest)]">
                      Administração do site
                    </div>
                    <div className="text-xs text-[var(--color-ink-muted)]">
                      Agenda, textos, cores e fotos
                    </div>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Navigation Drawer */}
        {menuOpen && (
          <nav
            aria-label="Menu principal móvel"
            className="lg:hidden bg-[var(--color-white)] border-b border-[var(--color-gray-soft)] px-4 py-4 shadow-md"
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.path);
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    className={`px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      active
                        ? 'bg-[var(--color-beige)] text-[var(--color-forest)]'
                        : 'text-[var(--color-ink)] hover:bg-[var(--color-beige)]'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
              <a
                href="/agendamento?aba=acompanhar"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/agendamento?aba=acompanhar');
                }}
                className="px-3 py-3 rounded-lg text-base font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-beige)]"
              >
                Acompanhar agendamento
              </a>
              <a
                href="/duvidas"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/duvidas');
                }}
                className="px-3 py-3 rounded-lg text-base font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-beige)]"
              >
                Dúvidas frequentes
              </a>
              <a
                href="/privacidade"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/privacidade');
                }}
                className="px-3 py-3 rounded-lg text-base font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-beige)]"
              >
                Política de privacidade
              </a>

              <div className="pt-3 mt-2 border-t border-[var(--color-gray-soft)] space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLargeText((v) => !v)}
                    aria-pressed={largeText}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                      largeText
                        ? 'bg-[var(--color-forest)] border-[var(--color-forest)] text-white'
                        : 'border-[var(--color-gray-soft)] text-[var(--color-ink)]'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Texto maior</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHighContrast((v) => !v)}
                    aria-pressed={highContrast}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                      highContrast
                        ? 'bg-[var(--color-forest)] border-[var(--color-forest)] text-white'
                        : 'border-[var(--color-gray-soft)] text-[var(--color-ink)]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Alto contraste</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/agendamento')}
                  className="w-full py-3 px-4 rounded-lg bg-[var(--color-forest)] text-white font-medium text-center cursor-pointer"
                >
                  {content?.headerCtaText || 'Agendar consulta'}
                </button>
                <a
                  href="/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/admin');
                  }}
                  className="w-full py-3 px-4 rounded-lg border border-[var(--color-gray-soft)] bg-[var(--color-beige)]/70 text-[var(--color-forest)] font-semibold text-sm flex items-center justify-center gap-2"
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

      {/* Architectural Editorial Footer */}
      <footer className="bg-[var(--color-white)] border-t border-[var(--color-gray-soft)] text-[var(--color-ink)]">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
            <div className="lg:col-span-4">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}
                className="inline-flex items-center gap-2.5 font-display text-2xl font-medium text-[var(--color-forest)] mb-4"
              >
                <BrandMark className="w-7 h-7" />
                <span>{clinicName}</span>
              </a>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed max-w-sm">
                {content?.footerTagline ||
                  'Clínica de fonoaudiologia infantil dedicada ao cuidado humanizado da comunicação e do desenvolvimento na infância.'}
              </p>
              <div className="flex flex-wrap items-center gap-2.5 mt-6">
                {contact?.instagram && (
                  <a
                    href={contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram da clínica"
                    className="w-10 h-10 rounded-xl border border-[var(--color-gray-soft)] flex items-center justify-center text-[var(--color-forest)] hover:bg-[var(--color-beige)] hover:border-[var(--color-sage)] transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {contact?.facebook && (
                  <a
                    href={contact.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook da clínica"
                    className="w-10 h-10 rounded-xl border border-[var(--color-gray-soft)] flex items-center justify-center text-[var(--color-forest)] hover:bg-[var(--color-beige)] hover:border-[var(--color-sage)] transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {contact?.linkedin && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn da clínica"
                    className="w-10 h-10 rounded-xl border border-[var(--color-gray-soft)] flex items-center justify-center text-[var(--color-forest)] hover:bg-[var(--color-beige)] hover:border-[var(--color-sage)] transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {contact?.youtube && (
                  <a
                    href={contact.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube da clínica"
                    className="w-10 h-10 rounded-xl border border-[var(--color-gray-soft)] flex items-center justify-center text-[var(--color-forest)] hover:bg-[var(--color-beige)] hover:border-[var(--color-sage)] transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
                {contact?.tiktok && (
                  <a
                    href={contact.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok da clínica"
                    className="w-10 h-10 rounded-xl border border-[var(--color-gray-soft)] flex items-center justify-center text-[var(--color-forest)] hover:bg-[var(--color-beige)] hover:border-[var(--color-sage)] transition-colors"
                  >
                    <Music2 className="w-4 h-4" />
                  </a>
                )}
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp da clínica"
                  className="w-10 h-10 rounded-xl border border-[var(--color-gray-soft)] flex items-center justify-center text-[var(--color-forest)] hover:bg-[var(--color-beige)] hover:border-[var(--color-sage)] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="font-display text-base font-medium text-[var(--color-forest)] mb-4">
                Navegação
              </h2>
              <ul className="space-y-2.5 text-sm text-[var(--color-ink-muted)]">
                {NAV_ITEMS.map((item) => (
                  <li key={item.path}>
                    <a
                      href={item.path}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.path);
                      }}
                      className="hover:text-[var(--color-forest)] transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="/duvidas"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/duvidas');
                    }}
                    className="hover:text-[var(--color-forest)] transition-colors"
                  >
                    Dúvidas frequentes
                  </a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h2 className="font-display text-base font-medium text-[var(--color-forest)] mb-4">
                Contato e Horários
              </h2>
              <ul className="space-y-3 text-sm text-[var(--color-ink-muted)]">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-taupe)]" aria-hidden="true" />
                  <span>{contact?.address || 'Endereço a confirmar pela clínica'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 shrink-0 text-[var(--color-taupe)]" aria-hidden="true" />
                  <span className="tabular-nums">{contact?.phone || '(00) 0000-0000'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 shrink-0 text-[var(--color-taupe)]" aria-hidden="true" />
                  <span>{contact?.email || 'contato@adaptato.com.br'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-taupe)]" aria-hidden="true" />
                  <span>{contact?.hours || 'Segunda a Sexta, 07h30 às 20h'}</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h2 className="font-display text-base font-medium text-[var(--color-forest)] mb-4">
                Paciente e Gestão
              </h2>
              <ul className="space-y-2.5 text-sm text-[var(--color-ink-muted)]">
                <li>
                  <a
                    href="/agendamento?aba=acompanhar"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/agendamento?aba=acompanhar');
                    }}
                    className="hover:text-[var(--color-forest)] transition-colors"
                  >
                    Acompanhar protocolo
                  </a>
                </li>
                <li>
                  <a
                    href="/privacidade"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/privacidade');
                    }}
                    className="hover:text-[var(--color-forest)] transition-colors"
                  >
                    Privacidade (LGPD)
                  </a>
                </li>
                <li>
                  <a
                    href="/admin"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/admin');
                    }}
                    className="inline-flex items-center gap-1.5 hover:text-[var(--color-forest)] transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Área da Equipe</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[var(--color-gray-soft)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-ink-muted)]">
            <p>© {new Date().getFullYear()} {clinicName}. Todos os direitos reservados.</p>
            <div className="flex items-center gap-5">
              <p>{content?.footerBottomText || 'Atendimento fonoaudiológico humanizado · Dados tratados conforme a LGPD'}</p>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-1 text-[var(--color-forest)] hover:underline cursor-pointer shrink-0"
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
