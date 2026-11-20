import React from 'react';
import { ArrowUpRight, Info } from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';
import { ResilientImage } from '../components/ClinicIcon.tsx';

export function AboutPage() {
  const { data, navigate, goToBooking } = useClinic();
  const content = data?.settings.content;
  const images = data?.settings.images;
  const professionals = data?.professionals || [];

  const valuesList = (content?.aboutValues || '')
    .split(';')
    .map((v) => v.trim())
    .filter(Boolean);

  return (
    <div className="bg-[var(--color-beige)]">
      {/* Header */}
      <section className="border-b border-[var(--color-gray-soft)] bg-[var(--color-white)]">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 py-16 sm:py-22">
          <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-4">
            {content?.aboutKicker || 'Institucional · Sobre a clínica'}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-normal text-[var(--color-forest)] tracking-tight leading-[1.12] max-w-3xl mb-6">
            {content?.aboutPageTitle ||
              'Cuidado fonoaudiológico com acolhimento, escuta e responsabilidade clínica.'}
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
            {content?.introText}
          </p>

          {content?.aboutNotice && (
            <div className="mt-9 p-5 rounded-2xl bg-[var(--color-beige)]/70 border border-[var(--color-gray-soft)] flex items-start gap-3 max-w-3xl">
              <Info className="w-5 h-5 text-[var(--color-forest)] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                {content.aboutNotice}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* History & Space Photos */}
      <section className="max-w-[1220px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-8">
            <div>
              <span className="font-display text-xs text-[var(--color-taupe)] tabular-nums">01 · Trajetória</span>
              <h2 className="font-display text-2xl sm:text-3xl font-normal text-[var(--color-forest)] mt-1 mb-3">
                História da clínica
              </h2>
              <p className="text-base text-[var(--color-ink-muted)] leading-relaxed">
                {content?.aboutHistory}
              </p>
            </div>
            <div className="pt-7 border-t border-[var(--color-gray-soft)]">
              <span className="font-display text-xs text-[var(--color-taupe)] tabular-nums">02 · Propósito</span>
              <h2 className="font-display text-2xl sm:text-3xl font-normal text-[var(--color-forest)] mt-1 mb-3">
                Filosofia de atendimento
              </h2>
              <p className="text-base text-[var(--color-ink-muted)] leading-relaxed">
                {content?.aboutPhilosophy}
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-2 rounded-[24px] bg-[var(--color-white)] border border-[var(--color-gray-soft)] luxury-photo-frame">
              <div className="aspect-[4/5] rounded-[18px] overflow-hidden">
                <ResilientImage
                  src={images?.aboutSpaceImage || ''}
                  alt="Recepção acolhedora da clínica adaptaTO"
                  fallbackTitle="Recepção adaptaTO"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="p-2 rounded-[24px] bg-[var(--color-white)] border border-[var(--color-gray-soft)] luxury-photo-frame sm:mt-8">
              <div className="aspect-[4/5] rounded-[18px] overflow-hidden">
                <ResilientImage
                  src={images?.aboutSessionImage || ''}
                  alt="Ambiente terapêutico e materiais fonoaudiológicos"
                  fallbackTitle="Sala terapêutica"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="bg-[var(--color-white)] border-y border-[var(--color-gray-soft)]">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            <div className="p-8 rounded-[24px] bg-[var(--color-beige)]/65 border border-[var(--color-gray-soft)]">
              <span className="font-display text-xs text-[var(--color-taupe)] tabular-nums">01 / Missão</span>
              <h2 className="font-display text-2xl font-normal text-[var(--color-forest)] mt-2 mb-3">
                Missão
              </h2>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                {content?.aboutMission}
              </p>
            </div>
            <div className="p-8 rounded-[24px] bg-[var(--color-beige)]/65 border border-[var(--color-gray-soft)]">
              <span className="font-display text-xs text-[var(--color-taupe)] tabular-nums">02 / Visão</span>
              <h2 className="font-display text-2xl font-normal text-[var(--color-forest)] mt-2 mb-3">
                Visão
              </h2>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                {content?.aboutVision}
              </p>
            </div>
            <div className="p-8 rounded-[24px] bg-[var(--color-beige)]/65 border border-[var(--color-gray-soft)]">
              <span className="font-display text-xs text-[var(--color-taupe)] tabular-nums">03 / Princípios</span>
              <h2 className="font-display text-2xl font-normal text-[var(--color-forest)] mt-2 mb-3">
                Valores
              </h2>
              <ul className="space-y-2.5 text-sm text-[var(--color-ink-muted)]">
                {valuesList.map((val, i) => (
                  <li key={i} className="leading-relaxed">
                    · {val}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Preview */}
      <section className="max-w-[1220px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-3">
              {content?.aboutTeamKicker || 'Nossa equipe'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-[var(--color-forest)]">
              {content?.aboutTeamTitle || 'Profissionais dedicados ao seu acompanhamento'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/profissionais')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-forest)] hover:underline cursor-pointer"
          >
            <span>Ver detalhes da equipe</span>
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {professionals.map((prof) => (
            <article
              key={prof.id}
              className="luxury-card bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-[24px] p-7 flex flex-col sm:flex-row gap-6 items-start"
            >
              <div className="w-28 h-28 rounded-2xl overflow-hidden border border-[var(--color-gray-soft)] shrink-0">
                <ResilientImage
                  src={prof.photoUrl}
                  alt={`Foto de ${prof.name}`}
                  fallbackTitle={prof.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl font-medium text-[var(--color-forest)]">
                  {prof.name}
                </h3>
                <p className="text-xs text-[var(--color-taupe)] mt-1 mb-2.5">
                  {prof.crfa ? `${prof.crfa} · ` : ''}
                  {prof.specialtySummary}
                </p>
                <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-4">
                  {prof.bio}
                </p>
                <button
                  type="button"
                  onClick={() => goToBooking({ professionalId: prof.id })}
                  className="text-sm font-medium text-[var(--color-forest)] hover:underline cursor-pointer"
                >
                  Solicitar horário com {prof.name.split(' ')[0]} →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
