import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Calendar, Info, MessageCircle, Search } from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';
import { ResilientImage, SpecialtyIcon } from '../components/ClinicIcon.tsx';
import type { Specialty } from '../types.ts';

type AudienceFilter = 'todas' | 'linguagem' | 'fala_voz' | 'motricidade' | 'avaliacao';

const FILTER_OPTIONS: Array<{ id: AudienceFilter; label: string }> = [
  { id: 'todas', label: 'Todas' },
  { id: 'linguagem', label: 'Linguagem e Aprendizagem' },
  { id: 'fala_voz', label: 'Fala, Voz e Fluência' },
  { id: 'motricidade', label: 'Motricidade e Comunicação' },
  { id: 'avaliacao', label: 'Avaliação e Família' },
];

function matchesAudienceFilter(spec: Specialty, filter: AudienceFilter): boolean {
  if (filter === 'todas') return true;
  const hay = `${spec.name} ${spec.targetAudience} ${spec.shortDescription}`.toLowerCase();
  if (filter === 'linguagem') return /linguagem|leitura|escrita|aprendizagem|alfabetiza/.test(hay);
  if (filter === 'fala_voz') return /fala|voz|flu[eê]ncia|gagueira|articula/.test(hay);
  if (filter === 'motricidade') return /motricidade|orofacial|comunica[cç][aã]o|audi[cç][aã]o/.test(hay);
  if (filter === 'avaliacao') return /avalia|orienta|fam[ií]lia|escola/.test(hay);
  return true;
}

export function SpecialtiesPage({ selectedSlug }: { selectedSlug?: string }) {
  const { data, navigate, goToBooking, buildWhatsAppUrl } = useClinic();
  const specialties = data?.specialties || [];
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>('todas');

  const selected = selectedSlug
    ? specialties.find((s) => s.slug === selectedSlug)
    : undefined;

  const filteredSpecialties = useMemo(() => {
    const q = search.trim().toLowerCase();
    return specialties.filter((spec) => {
      if (!matchesAudienceFilter(spec, audienceFilter)) return false;
      if (!q) return true;
      return (
        spec.name.toLowerCase().includes(q) ||
        spec.shortDescription.toLowerCase().includes(q) ||
        spec.fullDescription.toLowerCase().includes(q) ||
        spec.targetAudience.toLowerCase().includes(q)
      );
    });
  }, [specialties, search, audienceFilter]);

  if (selected) {
    return (
      <div className="bg-[var(--color-beige)]">
        <section className="bg-[var(--color-white)] border-b border-[var(--color-gray-soft)]">
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <button
              type="button"
              onClick={() => navigate('/especialidades')}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-forest)] hover:underline mb-8 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Voltar para todas as especialidades</span>
            </button>

            <div className="flex items-start gap-5 mb-7">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)] text-[var(--color-forest)] flex items-center justify-center shrink-0">
                <SpecialtyIcon name={selected.icon} className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-1.5">
                  Especialidade em Fonoaudiologia
                </p>
                <h1 className="font-display text-3xl sm:text-5xl font-normal text-[var(--color-forest)] tracking-tight leading-[1.12]">
                  {selected.name}
                </h1>
              </div>
            </div>

            {selected.confirmationStatus === 'to_confirm' && (
              <div className="mb-8 p-5 rounded-2xl bg-[var(--color-beige)] border border-[var(--color-sage)] flex items-start gap-3">
                <Info className="w-5 h-5 text-[var(--color-forest)] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-[var(--color-ink)] leading-relaxed">
                  A disponibilidade deste atendimento está em confirmação pela administração da
                  clínica. Recomendamos consultar nossa equipe pelo WhatsApp antes de confirmar sua
                  agenda.
                </p>
              </div>
            )}

            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed max-w-3xl mb-12">
              {selected.fullDescription}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-7 rounded-[22px] bg-[var(--color-beige)]/60 border border-[var(--color-gray-soft)]">
                <span className="font-display text-xs text-[var(--color-taupe)] tabular-nums">01</span>
                <h2 className="font-display text-lg font-medium text-[var(--color-forest)] mt-1 mb-2.5">
                  Público atendido
                </h2>
                <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  {selected.targetAudience}
                </p>
              </div>
              <div className="p-7 rounded-[22px] bg-[var(--color-beige)]/60 border border-[var(--color-gray-soft)]">
                <span className="font-display text-xs text-[var(--color-taupe)] tabular-nums">02</span>
                <h2 className="font-display text-lg font-medium text-[var(--color-forest)] mt-1 mb-2.5">
                  Objetivos gerais
                </h2>
                <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  {selected.objectives}
                </p>
              </div>
              <div className="p-7 rounded-[22px] bg-[var(--color-beige)]/60 border border-[var(--color-gray-soft)]">
                <span className="font-display text-xs text-[var(--color-taupe)] tabular-nums">03</span>
                <h2 className="font-display text-lg font-medium text-[var(--color-forest)] mt-1 mb-2.5">
                  Como funciona o atendimento
                </h2>
                <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  {selected.howItWorks}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-7 border-t border-[var(--color-gray-soft)]">
              <button
                type="button"
                onClick={() => goToBooking({ specialtyId: selected.id })}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-92 shadow-[0_12px_28px_-14px_rgba(36,48,40,0.5)] cursor-pointer"
              >
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>Solicitar agendamento em {selected.name}</span>
              </button>
              <a
                href={buildWhatsAppUrl(
                  `Olá! Conheci a clínica adaptaTO pelo site e gostaria de tirar dúvidas sobre o atendimento de ${selected.name}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--color-white)] border border-[var(--color-gray-soft)] text-[var(--color-forest)] text-sm font-medium hover:bg-[var(--color-beige)]"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>Tirar dúvidas pelo WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-beige)]">
      <section className="bg-[var(--color-white)] border-b border-[var(--color-gray-soft)]">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-3">
              {data?.settings.content.specialtiesPageKicker || 'Serviços e áreas de atuação'}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-normal text-[var(--color-forest)] tracking-tight leading-[1.12] mb-5">
              {data?.settings.content.specialtiesPageTitle || 'Especialidades fonoaudiológicas'}
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed max-w-2xl">
              {data?.settings.content.specialtiesPageSubtitle ||
                'Conheça as áreas cadastradas pela clínica adaptaTO. Cada atendimento inicia com uma avaliação individualizada para compreender as necessidades reais do paciente e definir o plano terapêutico adequado.'}
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="p-2 rounded-[26px] bg-[var(--color-beige)]/65 border border-[var(--color-gray-soft)] luxury-photo-frame">
              <div className="aspect-[4/3] rounded-[18px] overflow-hidden">
                <ResilientImage
                  src={data?.settings.images.specialtiesBannerImage || ''}
                  alt="Materiais e ambiente de terapia fonoaudiológica na adaptaTO"
                  fallbackTitle="Especialidades adaptaTO"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1220px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Search & Audience Segmented Filter Bar */}
        <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-4 sm:p-5 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="w-4 h-4 text-[var(--color-taupe)] absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <label htmlFor="specialty-search" className="sr-only">
              Buscar especialidade
            </label>
            <input
              id="specialty-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por área, necessidade ou público..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--color-beige)]/40 border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
            />
          </div>

          <div
            role="group"
            aria-label="Filtrar especialidades por foco"
            className="flex flex-wrap gap-1.5"
          >
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAudienceFilter(opt.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  audienceFilter === opt.id
                    ? 'bg-[var(--color-forest)] border-[var(--color-forest)] text-white'
                    : 'bg-[var(--color-beige)]/45 border-[var(--color-gray-soft)] text-[var(--color-ink-muted)] hover:text-[var(--color-forest)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {filteredSpecialties.length === 0 ? (
          <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-[24px] p-12 text-center">
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              Nenhuma especialidade corresponde aos filtros selecionados.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setAudienceFilter('todas');
              }}
              className="px-4 py-2 rounded-xl border border-[var(--color-gray-soft)] text-xs font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSpecialties.map((spec, idx) => (
              <article
                key={spec.id}
                className="luxury-card bg-[var(--color-white)] border border-[var(--color-gray-soft)] hover:border-[var(--color-sage)] rounded-[24px] p-7 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-beige)] text-[var(--color-forest)] flex items-center justify-center">
                      <SpecialtyIcon name={spec.icon} className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-[var(--color-taupe)] tabular-nums">
                      {String(idx + 1).padStart(2, '0')} ·{' '}
                      {spec.confirmationStatus === 'confirmed'
                        ? 'Disponível para agendamento'
                        : 'A confirmar com a clínica'}
                    </span>
                  </div>

                  <h2 className="font-display text-2xl font-medium text-[var(--color-forest)] mb-3">
                    {spec.name}
                  </h2>
                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-6">
                    {spec.fullDescription}
                  </p>

                  <dl className="space-y-2.5 text-sm border-t border-[var(--color-gray-soft)] pt-5 mb-7">
                    <div>
                      <dt className="font-medium text-[var(--color-forest)] inline">Público: </dt>
                      <dd className="text-[var(--color-ink-muted)] inline">{spec.targetAudience}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[var(--color-forest)] inline">Objetivos: </dt>
                      <dd className="text-[var(--color-ink-muted)] inline">{spec.objectives}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--color-gray-soft)]">
                  <button
                    type="button"
                    onClick={() => navigate(`/especialidades/${spec.slug}`)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-forest)] hover:underline cursor-pointer"
                  >
                    <span>Ver detalhes completos</span>
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goToBooking({ specialtyId: spec.id })}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--color-forest)] text-white text-xs font-medium hover:opacity-90 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Agendar</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
