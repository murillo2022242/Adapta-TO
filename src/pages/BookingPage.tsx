import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';
import { SpecialtyIcon } from '../components/ClinicIcon.tsx';
import { Reveal3D, Tilt3DCard } from '../components/Motion3D.tsx';

export function BookingPage() {
  const {
    data,
    preselectedSpecialtyId,
    buildWhatsAppUrl,
  } = useClinic();

  const clinicName = data?.settings.content.clinicName || 'Espaço Adapta T.O';
  const specialties = data?.specialties || [];

  const [specialtyId, setSpecialtyId] = useState<number | null>(preselectedSpecialtyId);
  const [selectionWarning, setSelectionWarning] = useState(false);

  useEffect(() => {
    if (preselectedSpecialtyId) {
      setSpecialtyId(preselectedSpecialtyId);
      setSelectionWarning(false);
    }
  }, [preselectedSpecialtyId]);

  const selectedSpecialty = specialties.find((s) => s.id === specialtyId) || null;

  const whatsappMessage = selectedSpecialty
    ? `Olá! Gostaria de agendar uma consulta da seguinte especialidade (${selectedSpecialty.name}).`
    : '';

  const whatsappUrl = selectedSpecialty ? buildWhatsAppUrl(whatsappMessage) : '';

  return (
    <div className="bg-[var(--color-beige)] min-h-[78vh]">
      <section className="adaptato-hero-bg border-b border-[var(--color-gray-soft)]">
        <div className="max-w-[1140px] mx-auto px-5 sm:px-6 py-12 sm:py-16">
          <p className="text-sm font-medium text-[var(--color-forest)] mb-2.5">
            {data?.settings.content.bookingPageKicker || `Agendamento Online · ${clinicName}`}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[var(--color-ink)] tracking-tight leading-[1.12] mb-3">
            {data?.settings.content.bookingPageTitle || 'Agende sua Consulta'}
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
            {data?.settings.content.bookingPageSubtitle ||
              'Escolha a especialidade desejada abaixo para falar diretamente com nossa equipe pelo WhatsApp e combinar o melhor dia e horário.'}
          </p>
        </div>
      </section>

      <section className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-3xl p-6 sm:p-10 shadow-[0_14px_34px_-22px_rgba(24,34,53,0.14)]">
          <div className="mb-7">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)] mb-1.5">
              Escolha o tipo de atendimento
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
              Selecione a especialidade desejada e siga direto para o WhatsApp da clínica com sua solicitação pronta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {specialties.map((spec, idx) => {
              const active = specialtyId === spec.id;
              return (
                <Reveal3D key={spec.id} delayMs={(idx % 2) * 45}>
                  <Tilt3DCard className="h-full" maxTiltDeg={3}>
                    <button
                      type="button"
                      onClick={() => {
                        setSpecialtyId(spec.id);
                        setSelectionWarning(false);
                      }}
                      aria-pressed={active}
                      className={`w-full h-full text-left p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        active
                          ? 'border-[var(--color-forest)] adaptato-soft-tint shadow-xs'
                          : 'border-[var(--color-gray-soft)] bg-[var(--color-white)] hover:border-[var(--color-forest)]/45'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            active
                              ? 'bg-[var(--color-forest)] text-white'
                              : 'adaptato-soft-tint text-[var(--color-forest)]'
                          }`}
                        >
                          <SpecialtyIcon name={spec.icon} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display font-bold text-sm sm:text-base text-[var(--color-ink)]">
                              {spec.name}
                            </span>
                            {active && (
                              <Check
                                className="w-4 h-4 text-[var(--color-forest)] shrink-0"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1 leading-relaxed">
                            {spec.shortDescription}
                          </p>
                          {spec.confirmationStatus === 'to_confirm' && (
                            <p className="text-xs text-[var(--color-taupe)] mt-1.5">
                              Disponibilidade sujeita à confirmação pela clínica
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  </Tilt3DCard>
                </Reveal3D>
              );
            })}
          </div>

          {selectionWarning && !selectedSpecialty && (
            <div
              role="alert"
              className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Por favor, selecione uma especialidade acima antes de ir para o WhatsApp.</span>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-[var(--color-ink)]">
                  {selectedSpecialty
                    ? `Especialidade selecionada: ${selectedSpecialty.name}`
                    : 'Nenhuma especialidade selecionada'}
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  {selectedSpecialty
                    ? `Mensagem: "${whatsappMessage}"`
                    : 'Clique em uma das opções acima para liberar o agendamento pelo WhatsApp.'}
                </p>
              </div>

              {selectedSpecialty ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#1FA855] hover:bg-[#19944A] text-white text-sm sm:text-base font-semibold shadow-[0_12px_28px_-12px_rgba(31,168,85,0.55)] transition-all whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>Agendar pelo WhatsApp</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectionWarning(true)}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-200 text-slate-600 text-sm sm:text-base font-semibold hover:bg-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>Agendar pelo WhatsApp</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--color-ink-muted)]">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[var(--color-forest)] shrink-0" aria-hidden="true" />
                <span>{data?.settings.contact.hours || 'Segunda a Sexta: 8h às 18h'}</span>
              </div>
              {data?.settings.contact.address && (
                <div className="flex items-start sm:items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-forest)] shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
                  <span className="leading-relaxed">{data.settings.contact.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
