import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Calendar, Info, MessageCircle, Search } from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';
import { ResilientImage, SpecialtyIcon } from '../components/ClinicIcon.tsx';
import { Reveal3D, ScrollDepthFrame, Tilt3DCard } from '../components/Motion3D.tsx';
import type { Specialty } from '../types.ts';

type AudienceFilter = 'todas' | 'comunicacao' | 'sensorial_motor' | 'emocional_aprendizagem' | 'nutricao_at';

const FILTER_OPTIONS: Array<{ id: AudienceFilter; label: string }> = [
  { id: 'todas', label: 'Todos os Serviços' },
  { id: 'emocional_aprendizagem', label: 'Psicologia e Aprendizagem' },
  { id: 'sensorial_motor', label: 'Terapia Ocupacional e Motricidade' },
  { id: 'comunicacao', label: 'Fonoaudiologia e Musicoterapia' },
  { id: 'nutricao_at', label: 'Nutrição e Acompanhamento' },
];

function matchesAudienceFilter(spec: Specialty, filter: AudienceFilter): boolean {
  if (filter === 'todas') return true;
  const hay = `${spec.name} ${spec.targetAudience} ${spec.shortDescription}`.toLowerCase();
  if (filter === 'emocional_aprendizagem') return /psicologia|psicopedagogia|aprendizagem|emocional/.test(hay);
  if (filter === 'sensorial_motor') return /ocupacional|psicomotricidade|fisioterapia|motor|sensorial/.test(hay);
  if (filter === 'comunicacao') return /fonoaudiologia|musicoterapia|comunica|linguagem|m[uú]sica/.test(hay);
  if (filter === 'nutricao_at') return /nutri|alimentar|acompanhamento|terap[eê]utico/.test(hay);
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

  if (selectedSlug && !selected) {
    return (
      <div className="bg-[var(--color-beige)] min-h-[65vh] flex items-center justify-center px-5 py-16">
        <div className="max-w-lg w-full bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-8 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
            Especialidade não encontrada
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
            O serviço informado não foi localizado ou não está disponível no momento.
          </p>
          <button
            type="button"
            onClick={() => navigate('/especialidades')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-forest)] text-white text-sm font-semibold hover:opacity-92 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Ver todos os serviços</span>
          </button>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="bg-[var(--color-beige)]">
        <section className="bg-[var(--color-white)] border-b border-[var(--color-gray-soft)]">
          <div className="max-w-[1040px] mx-auto px-5 sm:px-6 py-14 sm:py-20">
            <button
              type="button"
              onClick={() => navigate('/especialidades')}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-forest)] hover:underline mb-8 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Voltar para todos os serviços</span>
            </button>

            <div className="flex items-start gap-5 mb-7">
              <div className="w-14 h-14 rounded-2xl adaptato-soft-tint border adaptato-soft-border text-[var(--color-forest)] flex items-center justify-center shrink-0">
                <SpecialtyIcon name={selected.icon} className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-forest)] mb-1.5">
                  Atendimento multidisciplinar em TEA
                </p>
                <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[var(--color-ink)] tracking-tight leading-[1.12]">
                  {selected.name}
                </h1>
              </div>
            </div>

            {selected.confirmationStatus === 'to_confirm' && (
              <div className="mb-8 p-5 rounded-2xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)] flex items-start gap-3">
                <Info className="w-5 h-5 text-[var(--color-forest)] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-[var(--color-ink)] leading-relaxed">
                  A disponibilidade deste atendimento está em confirmação pela administração da
                  clínica. Recomendamos consultar nossa equipe pelo WhatsApp antes de confirmar sua
                  agenda.
                </p>
              </div>
            )}

            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-[1.75] max-w-3xl mb-10">
              {selected.fullDescription}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-7 rounded-2xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)]">
                <h2 className="font-display text-lg font-bold text-[var(--color-ink)] mb-2.5">
                  Público atendido
                </h2>
                <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  {selected.targetAudience}
                </p>
              </div>
              <div className="p-7 rounded-2xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)]">
                <h2 className="font-display text-lg font-bold text-[var(--color-ink)] mb-2.5">
                  Objetivos terapêuticos
                </h2>
                <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  {selected.objectives}
                </p>
              </div>
              <div className="p-7 rounded-2xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)]">
                <h2 className="font-display text-lg font-bold text-[var(--color-ink)] mb-2.5">
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
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--color-forest)] text-white text-sm font-semibold hover:opacity-92 shadow-sm cursor-pointer"
              >
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>Agendar avaliação em {selected.name}</span>
              </button>
              <a
                href={buildWhatsAppUrl(
                  `Olá! Conheci o Espaço Adapta T.O pelo site e gostaria de tirar dúvidas sobre o atendimento de ${selected.name}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--color-white)] border border-[var(--color-gray-soft)] text-[var(--color-ink)] text-sm font-medium hover:bg-[var(--color-beige)]"
              >
                <MessageCircle className="w-4 h-4 text-[var(--color-forest)]" aria-hidden="true" />
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
      <section className="adaptato-hero-bg border-b border-[var(--color-gray-soft)]">
        <div className="max-w-[1220px] mx-auto px-5 sm:px-6 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7">
            <p className="text-sm font-medium text-[var(--color-forest)] mb-2.5">
              {data?.settings.content.specialtiesPageKicker || 'Atendimento multidisciplinar em TEA'}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[var(--color-ink)] tracking-tight leading-[1.12] mb-5">
              {data?.settings.content.specialtiesPageTitle || 'Nossos Serviços'}
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] leading-relaxed max-w-2xl">
              {data?.settings.content.specialtiesPageSubtitle ||
                'Contamos com 9 especialidades integradas para oferecer acompanhamento terapêutico completo, humanizado e personalizado.'}
            </p>
          </div>
          <div className="lg:col-span-5">
            <ScrollDepthFrame maxAngle={4}>
              <Tilt3DCard maxTiltDeg={3.5} enableSheen={false}>
                <div className="p-2 rounded-[26px] bg-white border border-slate-200/80 shadow-[0_24px_60px_-28px_rgba(24,34,53,0.18)]">
                  <div className="aspect-[4/3] rounded-[18px] overflow-hidden">
                    <ResilientImage
                      src={data?.settings.images.specialtiesBannerImage || ''}
                      alt="Materiais e ambiente terapêutico do Espaço Adapta T.O"
                      fallbackTitle="Espaço Adapta T.O"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </Tilt3DCard>
            </ScrollDepthFrame>
          </div>
        </div>
      </section>

      <section className="max-w-[1220px] mx-auto px-5 sm:px-6 py-12 sm:py-16">
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
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:bg-[var(--color-white)] focus:outline-none"
            />
          </div>

          <div
            role="group"
            aria-label="Filtrar serviços por área"
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
                    : 'bg-[var(--color-beige)] border-[var(--color-gray-soft)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {filteredSpecialties.length === 0 ? (
          <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-12 text-center">
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              Nenhum serviço corresponde aos filtros selecionados.
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
          <div
            key={audienceFilter}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 adaptato-slide-3d"
          >
            {filteredSpecialties.map((spec, idx) => (
              <Reveal3D key={spec.id} delayMs={(idx % 3) * 55} variant="depth-card">
                <Tilt3DCard className="h-full" maxTiltDeg={3.6}>
                  <article className="h-full luxury-card bg-[var(--color-white)] border border-[var(--color-gray-soft)] hover:border-[var(--color-sage)] rounded-2xl p-7 flex flex-col justify-between adaptato-preserve-3d">
                <div>
                  <div className="w-11 h-11 rounded-xl adaptato-soft-tint text-[var(--color-forest)] flex items-center justify-center mb-4 adaptato-z-lift">
                    <SpecialtyIcon name={spec.icon} className="w-5 h-5" />
                  </div>

                  <h2 className="font-display text-xl font-bold text-[var(--color-ink)] mb-2.5">
                    {spec.name}
                  </h2>
                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-5">
                    {spec.shortDescription || spec.fullDescription}
                  </p>

                  {spec.targetAudience && (
                    <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] border-t border-slate-100 pt-4 mb-6 leading-relaxed">
                      <span className="font-semibold text-[var(--color-ink)]">Público: </span>
                      {spec.targetAudience}
                    </p>
                  )}
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
                </Tilt3DCard>
              </Reveal3D>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
