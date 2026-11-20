import React from 'react';
import { Calendar, Clock, MessageCircle } from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';
import { ResilientImage } from '../components/ClinicIcon.tsx';
import type { WeeklySchedule } from '../types.ts';

const DAY_LABELS: Record<string, string> = {
  '1': 'Seg',
  '2': 'Ter',
  '3': 'Qua',
  '4': 'Qui',
  '5': 'Sex',
  '6': 'Sáb',
  '0': 'Dom',
};

function formatWorkingSummary(schedule: WeeklySchedule): string {
  const order = ['1', '2', '3', '4', '5', '6', '0'];
  const activeDays = order
    .filter((k) => schedule[k]?.enabled)
    .map((k) => `${DAY_LABELS[k]} (${schedule[k].start}–${schedule[k].end})`);
  return activeDays.length > 0 ? activeDays.join(' · ') : 'Horários sob consulta';
}

export function ProfessionalsPage() {
  const { data, goToBooking, buildWhatsAppUrl } = useClinic();
  const professionals = data?.professionals || [];

  return (
    <div className="bg-[var(--color-beige)]">
      <section className="bg-[var(--color-white)] border-b border-[var(--color-gray-soft)]">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 py-16 sm:py-22">
          <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-4">
            {data?.settings.content.professionalsPageKicker || 'Equipe clínica'}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-normal text-[var(--color-forest)] tracking-tight leading-[1.12] mb-5">
            {data?.settings.content.professionalsPageTitle || 'Nossos profissionais'}
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
            {data?.settings.content.professionalsPageSubtitle ||
              'Conheça os fonoaudiólogos cadastrados na clínica adaptaTO, suas áreas de atuação e horários de atendimento disponíveis.'}
          </p>
        </div>
      </section>

      <section className="max-w-[1220px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {professionals.map((prof) => (
            <article
              key={prof.id}
              className="luxury-card bg-[var(--color-white)] border border-[var(--color-gray-soft)] hover:border-[var(--color-sage)] rounded-[24px] overflow-hidden flex flex-col justify-between"
            >
              <div className="p-8 flex flex-col sm:flex-row gap-7 items-start">
                <div className="w-36 h-44 rounded-2xl overflow-hidden border border-[var(--color-gray-soft)] shrink-0">
                  <ResilientImage
                    src={prof.photoUrl}
                    alt={`Fotografia profissional de ${prof.name}`}
                    fallbackTitle={prof.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-2xl font-medium text-[var(--color-forest)]">
                    {prof.name}
                  </h2>
                  {prof.crfa && (
                    <p className="text-xs text-[var(--color-taupe)] mt-1 tabular-nums">{prof.crfa}</p>
                  )}
                  <p className="text-sm font-medium text-[var(--color-ink)] mt-2.5 mb-3">
                    {prof.specialtySummary}
                  </p>
                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    {prof.bio}
                  </p>
                </div>
              </div>

              <div>
                <div className="px-8 py-4 bg-[var(--color-beige)]/55 border-t border-[var(--color-gray-soft)] flex items-start gap-2.5 text-xs text-[var(--color-ink-muted)]">
                  <Clock className="w-4 h-4 text-[var(--color-forest)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-medium text-[var(--color-forest)]">Agenda semanal: </span>
                    <span className="tabular-nums">{formatWorkingSummary(prof.workingHours)}</span>
                  </div>
                </div>

                <div className="px-8 py-5 border-t border-[var(--color-gray-soft)] flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => goToBooking({ professionalId: prof.id })}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-92 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    <span>Agendar com {prof.name.split(' ')[0]}</span>
                  </button>
                  <a
                    href={buildWhatsAppUrl(
                      `Olá! Gostaria de obter informações sobre horários com ${prof.name} na clínica adaptaTO.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-gray-soft)] text-[var(--color-forest)] text-sm font-medium hover:bg-[var(--color-beige)]"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
