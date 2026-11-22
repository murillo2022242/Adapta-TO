import React from 'react';
import { Info } from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';
import { ResilientImage } from '../components/ClinicIcon.tsx';
import { Reveal3D, ScrollDepthFrame, Tilt3DCard } from '../components/Motion3D.tsx';

export function AboutPage() {
  const { data } = useClinic();
  const content = data?.settings.content;
  const images = data?.settings.images;

  const valuesList = (content?.aboutValues || '')
    .split(';')
    .map((v) => v.trim())
    .filter(Boolean);

  return (
    <div className="bg-[var(--color-beige)]">
      {/* Header */}
      <section className="border-b border-[var(--color-gray-soft)] adaptato-hero-bg">
        <div className="max-w-[1220px] mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <p className="text-sm font-medium text-[var(--color-forest)] mb-3">
            {content?.aboutKicker || 'Institucional · Sobre o Espaço Adapta T.O'}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[var(--color-ink)] tracking-tight leading-[1.12] max-w-3xl mb-5">
            {content?.aboutPageTitle ||
              'Cuidado especializado, humanizado e baseado em evidências para pessoas com TEA.'}
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
            {content?.introText}
          </p>

          {content?.aboutNotice && (
            <div className="mt-8 p-5 rounded-2xl bg-[var(--color-white)] border border-[var(--color-gray-soft)] shadow-xs flex items-start gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-lg adaptato-soft-tint text-[var(--color-forest)] flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" aria-hidden="true" />
              </div>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed pt-0.5">
                {content.aboutNotice}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* History & Space Photos */}
      <section className="max-w-[1220px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] mb-4">
                Nossa História
              </h2>
              <div className="space-y-4 text-base text-[var(--color-ink-muted)] leading-[1.78] max-w-[65ch]">
                {(content?.aboutHistory || '')
                  .split(/\n+/)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
              </div>
            </div>
            <div className="pt-7 border-t border-[var(--color-gray-soft)]">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] mb-3">
                Filosofia de atendimento
              </h2>
              <p className="text-base text-[var(--color-ink-muted)] leading-[1.75] max-w-[65ch]">
                {content?.aboutPhilosophy}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ScrollDepthFrame maxAngle={4}>
              <Tilt3DCard maxTiltDeg={3.5} enableSheen={false}>
                <div className="p-2 rounded-[24px] bg-[var(--color-white)] border border-[var(--color-gray-soft)] luxury-photo-frame">
                  <div className="aspect-[4/5] rounded-[18px] overflow-hidden">
                    <ResilientImage
                      src={images?.aboutSpaceImage || ''}
                      alt="Recepção acolhedora do Espaço Adapta T.O"
                      fallbackTitle="Espaço Adapta T.O"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </Tilt3DCard>
            </ScrollDepthFrame>
            <ScrollDepthFrame maxAngle={5} className="sm:mt-8">
              <Tilt3DCard maxTiltDeg={3.5} enableSheen={false}>
                <div className="p-2 rounded-[24px] bg-[var(--color-white)] border border-[var(--color-gray-soft)] luxury-photo-frame">
                  <div className="aspect-[4/5] rounded-[18px] overflow-hidden">
                    <ResilientImage
                      src={images?.aboutSessionImage || ''}
                      alt="Ambiente terapêutico multidisciplinar"
                      fallbackTitle="Sala terapêutica"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </Tilt3DCard>
            </ScrollDepthFrame>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="bg-[var(--color-white)] border-y border-[var(--color-gray-soft)]">
        <div className="max-w-[1220px] mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal3D delayMs={0} variant="depth-card">
              <Tilt3DCard className="h-full" maxTiltDeg={3.5}>
                <div className="h-full p-8 rounded-2xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)]">
                  <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-3">
                    Missão
                  </h2>
                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    {content?.aboutMission}
                  </p>
                </div>
              </Tilt3DCard>
            </Reveal3D>
            <Reveal3D delayMs={70} variant="depth-card">
              <Tilt3DCard className="h-full" maxTiltDeg={3.5}>
                <div className="h-full p-8 rounded-2xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)]">
                  <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-3">
                    Visão
                  </h2>
                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    {content?.aboutVision}
                  </p>
                </div>
              </Tilt3DCard>
            </Reveal3D>
            <Reveal3D delayMs={140} variant="depth-card">
              <Tilt3DCard className="h-full" maxTiltDeg={3.5}>
                <div className="h-full p-8 rounded-2xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)]">
                  <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-3">
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
              </Tilt3DCard>
            </Reveal3D>
          </div>
        </div>
      </section>

    </div>
  );
}
