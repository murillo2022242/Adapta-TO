import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileSearch,
  MessageCircle,
  Printer,
  User,
  XCircle,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';
import { ResilientImage, SpecialtyIcon } from '../components/ClinicIcon.tsx';
import {
  computeFallbackMonthAvailability,
  computeFallbackSlotsForDate,
} from '../data/defaultClinicData.ts';
import type { AppointmentStatus, DayAvailabilitySummary } from '../types.ts';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const STATUS_DISPLAY: Record<AppointmentStatus, { label: string; desc: string; tone: string }> = {
  pendente: {
    label: 'Aguardando confirmação',
    desc: 'Sua solicitação foi recebida pela clínica e aguarda confirmação final pela nossa equipe.',
    tone: 'border-amber-200 bg-amber-50/70 text-amber-900',
  },
  confirmado: {
    label: 'Horário confirmado',
    desc: 'Seu atendimento está confirmado na agenda da clínica. Caso precise alterar, avise com antecedência.',
    tone: 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
  },
  reagendado: {
    label: 'Reagendado',
    desc: 'Seu horário foi ajustado pela nossa administração.',
    tone: 'border-slate-200 bg-slate-50 text-slate-900',
  },
  cancelado: {
    label: 'Cancelado',
    desc: 'Este agendamento encontra-se cancelado e o horário foi liberado na agenda.',
    tone: 'border-red-200 bg-red-50/70 text-red-900',
  },
};

function formatDateBr(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split('-');
  if (!y || !m || !d) return yyyyMmDd;
  return `${d}/${m}/${y}`;
}

function downloadIcsEvent(opts: {
  protocolCode: string;
  specialtyName: string;
  professionalName: string;
  date: string;
  time: string;
  address?: string;
}) {
  const [y, m, d] = opts.date.split('-');
  const [hh, mm] = opts.time.split(':');
  if (!y || !m || !d || !hh || !mm) return;

  const startLocal = `${y}${m}${d}T${hh}${mm}00`;
  const startDate = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm) + 45);
  const endY = String(startDate.getFullYear());
  const endM = String(startDate.getMonth() + 1).padStart(2, '0');
  const endD = String(startDate.getDate()).padStart(2, '0');
  const endHh = String(startDate.getHours()).padStart(2, '0');
  const endMm = String(startDate.getMinutes()).padStart(2, '0');
  const endLocal = `${endY}${endM}${endD}T${endHh}${endMm}00`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//adaptaTO//Agendamento Online//PT-BR',
    'BEGIN:VEVENT',
    `UID:${opts.protocolCode}@adaptato`,
    `DTSTAMP:${startLocal}`,
    `DTSTART:${startLocal}`,
    `DTEND:${endLocal}`,
    `SUMMARY:adaptaTO — ${opts.specialtyName}`,
    `DESCRIPTION:Protocolo ${opts.protocolCode} · Profissional: ${opts.professionalName}. Solicitação sujeita à confirmação final da clínica.`,
    `LOCATION:${(opts.address || 'Clínica adaptaTO').replace(/\r?\n/g, ' ')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([lines], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `consulta-${opts.protocolCode}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function BookingPage() {
  const {
    data,
    navigate,
    preselectedSpecialtyId,
    preselectedProfessionalId,
    buildWhatsAppUrl,
  } = useClinic();

  const specialties = data?.specialties || [];
  const professionals = data?.professionals || [];

  const [mode, setMode] = useState<'new' | 'lookup'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('aba') === 'acompanhar' ? 'lookup' : 'new';
  });

  useEffect(() => {
    const syncFromSearch = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('aba') === 'acompanhar') setMode('lookup');
    };
    window.addEventListener('popstate', syncFromSearch);
    return () => window.removeEventListener('popstate', syncFromSearch);
  }, []);

  const [step, setStep] = useState<number>(1);
  const [specialtyId, setSpecialtyId] = useState<number | null>(preselectedSpecialtyId);
  const [professionalId, setProfessionalId] = useState<number | null>(preselectedProfessionalId);
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [monthDays, setMonthDays] = useState<DayAvailabilitySummary[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotNotice, setSlotNotice] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Patient form
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [notes, setNotes] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedReceipt, setConfirmedReceipt] = useState<{
    protocolCode: string;
    specialtyName: string;
    professionalName: string;
    date: string;
    time: string;
    patientName: string;
  } | null>(null);

  // Lookup tab state
  const [lookupProtocol, setLookupProtocol] = useState('');
  const [lookupPhoneLast4, setLookupPhoneLast4] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<{
    protocolCode: string;
    status: AppointmentStatus;
    date: string;
    time: string;
    specialtyName: string;
    professionalName: string;
    patientFirstName: string;
    createdAt: string;
  } | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelBoxOpen, setCancelBoxOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedSpecialtyId && !specialtyId) {
      setSpecialtyId(preselectedSpecialtyId);
    }
    if (preselectedProfessionalId && !professionalId) {
      setProfessionalId(preselectedProfessionalId);
    }
  }, [preselectedSpecialtyId, preselectedProfessionalId, specialtyId, professionalId]);

  const filteredProfessionals = useMemo(() => {
    if (!specialtyId) return professionals;
    const matched = professionals.filter(
      (p) => p.specialtyIds.length === 0 || p.specialtyIds.includes(specialtyId)
    );
    return matched.length > 0 ? matched : professionals;
  }, [professionals, specialtyId]);

  const selectedSpecialty = specialties.find((s) => s.id === specialtyId);
  const selectedProfessional = professionals.find((p) => p.id === professionalId);

  useEffect(() => {
    if (!professionalId) return;
    let cancelled = false;
    setLoadingMonth(true);
    fetch(
      `/api/appointments/month-availability?professionalId=${professionalId}&month=${currentMonth}`
    )
      .then(async (res) => {
        const ct = res.headers.get('content-type') || '';
        if (!res.ok || !ct.includes('application/json')) throw new Error('unavailable');
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setMonthDays(json.days || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMonthDays(computeFallbackMonthAvailability(selectedProfessional, currentMonth));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingMonth(false);
      });
    return () => {
      cancelled = true;
    };
  }, [professionalId, currentMonth, selectedProfessional]);

  useEffect(() => {
    if (!professionalId || !selectedDate) {
      setAvailableSlots([]);
      setSlotNotice('');
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    setSlotNotice('');
    fetch(`/api/appointments/availability?professionalId=${professionalId}&date=${selectedDate}`)
      .then(async (res) => {
        const ct = res.headers.get('content-type') || '';
        if (!res.ok || !ct.includes('application/json')) throw new Error('unavailable');
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setAvailableSlots(json.slots || []);
          if ((json.slots || []).length === 0) {
            setSlotNotice(json.reason || 'Sem horários disponíveis nesta data.');
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = computeFallbackSlotsForDate(selectedProfessional, selectedDate);
          setAvailableSlots(fallback.slots);
          if (fallback.slots.length === 0) {
            setSlotNotice(fallback.reason || 'Sem horários disponíveis nesta data.');
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [professionalId, selectedDate, selectedProfessional]);

  const changeMonth = (delta: number) => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, (m || 1) - 1 + delta, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(next);
  };

  const firstWeekdayOffset = useMemo(() => {
    const [y, m] = currentMonth.split('-').map(Number);
    return new Date(y, (m || 1) - 1, 1).getDay();
  }, [currentMonth]);

  const monthLabel = useMemo(() => {
    const [y, m] = currentMonth.split('-').map(Number);
    return `${MONTH_NAMES[(m || 1) - 1]} de ${y}`;
  }, [currentMonth]);

  const handleConfirmSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialtyId,
          professionalId,
          date: selectedDate,
          time: selectedTime,
          patientName,
          patientPhone,
          patientEmail,
          guardianName,
          notes,
          lgpdConsent,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.error || 'Não foi possível registrar sua solicitação.');
        return;
      }
      setConfirmedReceipt({
        protocolCode: json.protocolCode,
        specialtyName: json.specialtyName,
        professionalName: json.professionalName,
        date: json.date,
        time: json.time,
        patientName: json.patientName,
      });
    } catch {
      setSubmitError('Erro de conexão ao enviar sua solicitação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setCancelSuccessMsg(null);
    setCancelBoxOpen(false);
    setLookupResult(null);
    setLookupLoading(true);
    try {
      const res = await fetch(
        `/api/appointments/lookup?protocol=${encodeURIComponent(lookupProtocol.trim())}&phoneLast4=${encodeURIComponent(lookupPhoneLast4.trim())}`
      );
      const json = await res.json();
      if (!res.ok) {
        setLookupError(json.error || 'Protocolo não encontrado.');
        return;
      }
      setLookupResult(json.appointment);
    } catch {
      setLookupError('Erro de conexão ao consultar protocolo.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCancelFromPortal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupResult) return;
    setCancelling(true);
    setLookupError(null);
    try {
      const res = await fetch('/api/appointments/request-cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolCode: lookupResult.protocolCode,
          phoneLast4: lookupPhoneLast4.trim(),
          reason: cancelReason,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setLookupError(json.error || 'Não foi possível registrar o cancelamento.');
        return;
      }
      setLookupResult({ ...lookupResult, status: 'cancelado' });
      setCancelBoxOpen(false);
      setCancelSuccessMsg(json.message);
    } catch {
      setLookupError('Erro de conexão ao processar cancelamento.');
    } finally {
      setCancelling(false);
    }
  };

  const patientFormValid =
    patientName.trim().length >= 3 &&
    patientPhone.replace(/\D/g, '').length >= 10 &&
    lgpdConsent;

  const whatsappBookingMessage = confirmedReceipt
    ? `Olá! Solicitei um agendamento pelo site da adaptaTO (Protocolo ${confirmedReceipt.protocolCode}).\nNome do paciente: ${confirmedReceipt.patientName}\nAtendimento desejado: ${confirmedReceipt.specialtyName}\nProfissional: ${confirmedReceipt.professionalName}\nData pretendida: ${formatDateBr(confirmedReceipt.date)}\nHorário pretendido: ${confirmedReceipt.time}\nAguardo a confirmação da equipe.`
    : '';

  if (confirmedReceipt) {
    return (
      <section className="bg-[var(--color-beige)] py-14 sm:py-20">
        <div className="max-w-[780px] mx-auto px-4 sm:px-6">
          <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-[28px] p-8 sm:p-12 shadow-[0_24px_60px_-32px_rgba(36,48,40,0.22)]">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-sage)]/30 text-[var(--color-forest)] flex items-center justify-center mb-6">
              <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
            </div>
            <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-2 tabular-nums">
              Protocolo {confirmedReceipt.protocolCode} · Status: Aguardando confirmação
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-normal text-[var(--color-forest)] mb-4">
              Solicitação de agendamento registrada
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed mb-8">
              Sua solicitação foi enviada para a equipe da clínica adaptaTO.{' '}
              <strong className="font-semibold text-[var(--color-ink)]">
                Este horário ainda não está confirmado definitivamente
              </strong>
              : nossa administração verificará a agenda e confirmará o atendimento pelo WhatsApp ou
              telefone. Guarde o código{' '}
              <strong className="font-semibold text-[var(--color-forest)] tabular-nums">
                {confirmedReceipt.protocolCode}
              </strong>{' '}
              para acompanhar o status a qualquer momento.
            </p>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-6 rounded-2xl bg-[var(--color-beige)]/65 border border-[var(--color-gray-soft)] text-sm mb-8">
              <div>
                <dt className="text-xs text-[var(--color-taupe)]">Paciente</dt>
                <dd className="font-medium text-[var(--color-forest)] mt-1">
                  {confirmedReceipt.patientName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-taupe)]">Atendimento</dt>
                <dd className="font-medium text-[var(--color-forest)] mt-1">
                  {confirmedReceipt.specialtyName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-taupe)]">Profissional</dt>
                <dd className="font-medium text-[var(--color-forest)] mt-1">
                  {confirmedReceipt.professionalName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-taupe)]">Data e horário pretendidos</dt>
                <dd className="font-medium text-[var(--color-forest)] mt-1 tabular-nums">
                  {formatDateBr(confirmedReceipt.date)} às {confirmedReceipt.time}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-3 no-print">
              {data?.settings.contact.whatsappAutoRedirect !== false && (
                <a
                  href={buildWhatsAppUrl(whatsappBookingMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-92"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Confirmar solicitação pelo WhatsApp</span>
                </a>
              )}
              <button
                type="button"
                onClick={() =>
                  downloadIcsEvent({
                    ...confirmedReceipt,
                    address: data?.settings.contact.address,
                  })
                }
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[var(--color-gray-soft)] text-[var(--color-forest)] text-sm font-medium hover:bg-[var(--color-beige)] cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4" aria-hidden="true" />
                <span>Adicionar ao calendário</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[var(--color-gray-soft)] text-[var(--color-forest)] text-sm font-medium hover:bg-[var(--color-beige)] cursor-pointer"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Imprimir</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-[var(--color-ink-muted)] text-sm font-medium hover:text-[var(--color-forest)] cursor-pointer"
              >
                <span>Voltar para o início</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const stepLabels = [
    'Atendimento',
    'Profissional',
    'Data',
    'Horário',
    'Dados',
    'Confirmação',
  ];

  return (
    <div className="bg-[var(--color-beige)] min-h-[78vh]">
      <section className="bg-[var(--color-white)] border-b border-[var(--color-gray-soft)]">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-2.5">
                {data?.settings.content.bookingPageKicker || 'Agendamento online · Solicitação em 6 etapas'}
              </p>
              <h1 className="font-display text-3xl sm:text-5xl font-normal text-[var(--color-forest)] tracking-tight leading-[1.12] mb-2">
                {data?.settings.content.bookingPageTitle || 'Solicite sua consulta na adaptaTO'}
              </h1>
              {data?.settings.content.bookingPageSubtitle && (
                <p className="text-sm sm:text-base text-[var(--color-ink-muted)] max-w-2xl">
                  {data.settings.content.bookingPageSubtitle}
                </p>
              )}
            </div>

            {/* Mode Segmented Control */}
            <div
              role="tablist"
              aria-label="Modo de agendamento"
              className="inline-flex p-1 rounded-xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)] shrink-0 self-start"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'new'}
                onClick={() => setMode('new')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  mode === 'new'
                    ? 'bg-[var(--color-forest)] text-white'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-forest)]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Nova solicitação</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'lookup'}
                onClick={() => setMode('lookup')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  mode === 'lookup'
                    ? 'bg-[var(--color-forest)] text-white'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-forest)]'
                }`}
              >
                <FileSearch className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Acompanhar protocolo</span>
              </button>
            </div>
          </div>

          {/* Stepper (only in new booking mode) */}
          {mode === 'new' && (
            <ol className="grid grid-cols-3 sm:grid-cols-6 gap-2" aria-label="Etapas do agendamento">
              {stepLabels.map((label, idx) => {
                const num = idx + 1;
                const isCurrent = step === num;
                const isDone = step > num;
                return (
                  <li
                    key={label}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs transition-colors ${
                      isCurrent
                        ? 'border-[var(--color-forest)] bg-[var(--color-forest)] text-white font-medium'
                        : isDone
                        ? 'border-[var(--color-sage)] bg-[var(--color-beige)] text-[var(--color-forest)] font-medium'
                        : 'border-[var(--color-gray-soft)] bg-[var(--color-white)] text-[var(--color-ink-muted)]'
                    }`}
                  >
                    <span className="tabular-nums mr-1">{num}.</span>
                    <span>{label}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      {/* LOOKUP PROTOCOL TAB */}
      {mode === 'lookup' ? (
        <section className="max-w-[780px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-[24px] p-7 sm:p-10">
            <h2 className="font-display text-2xl font-normal text-[var(--color-forest)] mb-2">
              Consultar status do seu agendamento
            </h2>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-7">
              Digite o código de protocolo gerado ao final da solicitação (ex.: ADP-A1B2C3) e os 4
              últimos dígitos do telefone cadastrado para conferir a situação atual.
            </p>

            <form onSubmit={handleLookupSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-5">
                <label
                  htmlFor="lookup-protocol"
                  className="block text-xs font-medium text-[var(--color-forest)] mb-1.5"
                >
                  Código do protocolo *
                </label>
                <input
                  id="lookup-protocol"
                  type="text"
                  required
                  value={lookupProtocol}
                  onChange={(e) => setLookupProtocol(e.target.value.toUpperCase())}
                  placeholder="ADP-XXXXXX"
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm uppercase tabular-nums focus:border-[var(--color-forest)] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-4">
                <label
                  htmlFor="lookup-phone4"
                  className="block text-xs font-medium text-[var(--color-forest)] mb-1.5"
                >
                  4 últimos dígitos do telefone *
                </label>
                <input
                  id="lookup-phone4"
                  type="text"
                  required
                  maxLength={4}
                  value={lookupPhoneLast4}
                  onChange={(e) => setLookupPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Ex.: 9876"
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm tabular-nums focus:border-[var(--color-forest)] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="w-full h-11 px-5 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {lookupLoading ? 'Consultando...' : 'Consultar'}
                </button>
              </div>
            </form>

            {lookupError && (
              <div
                role="alert"
                className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{lookupError}</span>
              </div>
            )}

            {cancelSuccessMsg && (
              <div
                role="status"
                className="mt-6 p-4 rounded-xl bg-[var(--color-sage)]/25 border border-[var(--color-sage)] text-[var(--color-forest)] text-sm"
              >
                {cancelSuccessMsg}
              </div>
            )}

            {lookupResult && (
              <div className="mt-8 pt-7 border-t border-[var(--color-gray-soft)] space-y-6">
                <div
                  className={`p-5 rounded-2xl border ${
                    STATUS_DISPLAY[lookupResult.status]?.tone || STATUS_DISPLAY.pendente.tone
                  }`}
                >
                  <div className="text-xs font-medium tabular-nums opacity-80">
                    Protocolo {lookupResult.protocolCode} · Paciente: {lookupResult.patientFirstName}
                  </div>
                  <div className="font-display text-xl font-medium mt-1">
                    {STATUS_DISPLAY[lookupResult.status]?.label || lookupResult.status}
                  </div>
                  <p className="text-xs mt-1.5 leading-relaxed opacity-90">
                    {STATUS_DISPLAY[lookupResult.status]?.desc}
                  </p>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[var(--color-beige)]/60 border border-[var(--color-gray-soft)] text-sm">
                  <div>
                    <dt className="text-xs text-[var(--color-taupe)]">Atendimento</dt>
                    <dd className="font-medium text-[var(--color-forest)] mt-0.5">
                      {lookupResult.specialtyName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--color-taupe)]">Profissional</dt>
                    <dd className="font-medium text-[var(--color-forest)] mt-0.5">
                      {lookupResult.professionalName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--color-taupe)]">Data e horário</dt>
                    <dd className="font-medium text-[var(--color-forest)] mt-0.5 tabular-nums">
                      {formatDateBr(lookupResult.date)} às {lookupResult.time}
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={buildWhatsAppUrl(
                      `Olá! Estou consultando o protocolo ${lookupResult.protocolCode} (${formatDateBr(lookupResult.date)} às ${lookupResult.time}) e gostaria de falar com a equipe.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-90"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Falar no WhatsApp</span>
                  </a>

                  {lookupResult.status !== 'cancelado' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          downloadIcsEvent({
                            protocolCode: lookupResult.protocolCode,
                            specialtyName: lookupResult.specialtyName,
                            professionalName: lookupResult.professionalName,
                            date: lookupResult.date,
                            time: lookupResult.time,
                            address: data?.settings.contact.address,
                          })
                        }
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-gray-soft)] text-[var(--color-forest)] text-sm font-medium hover:bg-[var(--color-beige)] cursor-pointer"
                      >
                        <CalendarPlus className="w-4 h-4" aria-hidden="true" />
                        <span>Adicionar ao calendário</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCancelBoxOpen((prev) => !prev)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" aria-hidden="true" />
                        <span>Cancelar solicitação</span>
                      </button>
                    </>
                  )}
                </div>

                {cancelBoxOpen && lookupResult.status !== 'cancelado' && (
                  <form
                    onSubmit={handleCancelFromPortal}
                    className="p-5 rounded-2xl bg-red-50/60 border border-red-200 space-y-3"
                  >
                    <label
                      htmlFor="portal-cancel-reason"
                      className="block text-xs font-medium text-red-900"
                    >
                      Motivo do cancelamento (opcional)
                    </label>
                    <input
                      id="portal-cancel-reason"
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Ex.: Precisarei reagendar para outra semana."
                      className="w-full h-10 px-3 rounded-xl border border-red-200 bg-white text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={cancelling}
                        className="px-4 py-2 rounded-xl bg-red-700 text-white text-xs font-medium hover:opacity-90 cursor-pointer"
                      >
                        {cancelling ? 'Cancelando...' : 'Confirmar cancelamento'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancelBoxOpen(false)}
                        className="px-4 py-2 rounded-xl border border-red-200 text-xs text-red-800 cursor-pointer"
                      >
                        Manter agendamento
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>
      ) : (
        /* NEW BOOKING WORKSPACE WITH LIVE SIDEBAR SUMMARY */
        <section className="max-w-[1140px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-[24px] p-6 sm:p-9">
              {/* STEP 1: SPECIALTY */}
              {step === 1 && (
                <div>
                  <h2 className="font-display text-2xl font-normal text-[var(--color-forest)] mb-2">
                    Etapa 1: Escolha o tipo de atendimento
                  </h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mb-7">
                    Selecione a especialidade ou atendimento que melhor corresponde à sua necessidade.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {specialties.map((spec) => {
                      const active = specialtyId === spec.id;
                      return (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => {
                            setSpecialtyId(spec.id);
                            setProfessionalId(null);
                            setSelectedDate('');
                            setSelectedTime('');
                          }}
                          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                            active
                              ? 'border-[var(--color-forest)] bg-[var(--color-beige)]/80 shadow-xs'
                              : 'border-[var(--color-gray-soft)] hover:border-[var(--color-sage)]'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-beige)] text-[var(--color-forest)] flex items-center justify-center shrink-0">
                              <SpecialtyIcon name={spec.icon} className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-[var(--color-forest)]">
                                {spec.name}
                              </div>
                              <p className="text-xs text-[var(--color-ink-muted)] mt-1 leading-relaxed">
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
                      );
                    })}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      disabled={!specialtyId}
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 cursor-pointer"
                    >
                      <span>Continuar</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PROFESSIONAL */}
              {step === 2 && (
                <div>
                  <h2 className="font-display text-2xl font-normal text-[var(--color-forest)] mb-2">
                    Etapa 2: Escolha o profissional
                  </h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mb-7">
                    Selecione com quem você deseja solicitar seu horário de atendimento.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredProfessionals.map((prof) => {
                      const active = professionalId === prof.id;
                      return (
                        <button
                          key={prof.id}
                          type="button"
                          onClick={() => {
                            setProfessionalId(prof.id);
                            setSelectedDate('');
                            setSelectedTime('');
                          }}
                          className={`text-left p-5 rounded-2xl border transition-all flex gap-4 items-start cursor-pointer ${
                            active
                              ? 'border-[var(--color-forest)] bg-[var(--color-beige)]/80 shadow-xs'
                              : 'border-[var(--color-gray-soft)] hover:border-[var(--color-sage)]'
                          }`}
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-[var(--color-gray-soft)] shrink-0">
                            <ResilientImage
                              src={prof.photoUrl}
                              alt={prof.name}
                              fallbackTitle={prof.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-base text-[var(--color-forest)]">
                              {prof.name}
                            </div>
                            {prof.crfa && (
                              <div className="text-xs text-[var(--color-taupe)] mt-0.5 tabular-nums">
                                {prof.crfa}
                              </div>
                            )}
                            <div className="text-xs font-medium text-[var(--color-ink)] mt-1">
                              {prof.specialtySummary}
                            </div>
                            <p className="text-xs text-[var(--color-ink-muted)] mt-2 line-clamp-2">
                              {prof.bio}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-gray-soft)] text-sm font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Voltar</span>
                    </button>
                    <button
                      type="button"
                      disabled={!professionalId}
                      onClick={() => setStep(3)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 cursor-pointer"
                    >
                      <span>Escolher data</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: INTERACTIVE CALENDAR */}
              {step === 3 && (
                <div>
                  <h2 className="font-display text-2xl font-normal text-[var(--color-forest)] mb-2">
                    Etapa 3: Escolha a data
                  </h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mb-7">
                    Datas disponíveis para <strong className="text-[var(--color-forest)]">{selectedProfessional?.name}</strong>.
                    Datas passadas, férias ou feriados bloqueados são desabilitados automaticamente.
                  </p>

                  <div className="max-w-lg mx-auto border border-[var(--color-gray-soft)] rounded-2xl p-4 sm:p-6 bg-[var(--color-beige)]/35">
                    <div className="flex items-center justify-between mb-5">
                      <button
                        type="button"
                        onClick={() => changeMonth(-1)}
                        aria-label="Mês anterior"
                        className="w-10 h-10 rounded-xl border border-[var(--color-gray-soft)] bg-[var(--color-white)] flex items-center justify-center text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <h3 className="font-display text-lg font-normal text-[var(--color-forest)]">
                        {monthLabel}
                      </h3>
                      <button
                        type="button"
                        onClick={() => changeMonth(1)}
                        aria-label="Próximo mês"
                        className="w-10 h-10 rounded-xl border border-[var(--color-gray-soft)] bg-[var(--color-white)] flex items-center justify-center text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-[var(--color-taupe)] mb-2">
                      {WEEKDAYS_SHORT.map((w) => (
                        <div key={w} className="py-1">
                          {w}
                        </div>
                      ))}
                    </div>

                    {loadingMonth ? (
                      <div className="py-12 text-center text-sm text-[var(--color-ink-muted)]">
                        Consultando agenda do mês...
                      </div>
                    ) : (
                      <div className="grid grid-cols-7 gap-1.5">
                        {Array.from({ length: firstWeekdayOffset }).map((_, i) => (
                          <div key={`empty-${i}`} aria-hidden="true" />
                        ))}
                        {monthDays.map((day) => {
                          const dayNum = Number(day.date.split('-')[2]);
                          const isAvailable = day.availableCount > 0 && !day.blocked;
                          const isSelected = selectedDate === day.date;
                          return (
                            <button
                              key={day.date}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => {
                                setSelectedDate(day.date);
                                setSelectedTime('');
                              }}
                              title={
                                isAvailable
                                  ? `${day.availableCount} horários livres`
                                  : day.reason || 'Indisponível'
                              }
                              className={`h-12 rounded-xl flex flex-col items-center justify-center text-sm tabular-nums transition-colors ${
                                isSelected
                                  ? 'bg-[var(--color-forest)] text-white font-semibold'
                                  : isAvailable
                                  ? 'bg-[var(--color-white)] border border-[var(--color-sage)] text-[var(--color-forest)] font-medium hover:bg-[var(--color-sage)]/20 cursor-pointer'
                                  : 'bg-[var(--color-gray-soft)]/50 text-[var(--color-ink-muted)]/45 cursor-not-allowed'
                              }`}
                            >
                              <span>{dayNum}</span>
                              {isAvailable && (
                                <span
                                  className={`text-[10px] leading-none mt-0.5 ${
                                    isSelected ? 'text-white/85' : 'text-[var(--color-taupe)]'
                                  }`}
                                >
                                  {day.availableCount}h
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-[var(--color-gray-soft)] flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--color-ink-muted)]">
                      <span>Borda sálvia: dias com horários livres</span>
                      <span>·</span>
                      <span>Cinza: indisponível</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-gray-soft)] text-sm font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Voltar</span>
                    </button>
                    <button
                      type="button"
                      disabled={!selectedDate}
                      onClick={() => setStep(4)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 cursor-pointer"
                    >
                      <span>Escolher horário</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: TIME SLOT */}
              {step === 4 && (
                <div>
                  <h2 className="font-display text-2xl font-normal text-[var(--color-forest)] mb-2">
                    Etapa 4: Escolha o horário
                  </h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mb-7">
                    Horários livres em{' '}
                    <strong className="text-[var(--color-forest)] tabular-nums">
                      {formatDateBr(selectedDate)}
                    </strong>{' '}
                    com {selectedProfessional?.name}.
                  </p>

                  {loadingSlots ? (
                    <p className="py-8 text-sm text-[var(--color-ink-muted)]">
                      Carregando horários disponíveis...
                    </p>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-6 rounded-xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)] text-sm text-[var(--color-ink-muted)]">
                      {slotNotice || 'Não há horários disponíveis para esta data. Volte e selecione outro dia.'}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {[
                        {
                          label: 'Manhã',
                          items: availableSlots.filter((s) => s < '12:00'),
                        },
                        {
                          label: 'Tarde',
                          items: availableSlots.filter((s) => s >= '12:00' && s < '18:00'),
                        },
                        {
                          label: 'Noite',
                          items: availableSlots.filter((s) => s >= '18:00'),
                        },
                      ]
                        .filter((group) => group.items.length > 0)
                        .map((group) => (
                          <div key={group.label}>
                            <h3 className="text-xs font-semibold text-[var(--color-taupe)] mb-3">
                              {group.label} · {group.items.length} horários
                            </h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                              {group.items.map((slot) => {
                                const active = selectedTime === slot;
                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSelectedTime(slot)}
                                    className={`h-11 rounded-xl border text-sm font-medium tabular-nums flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                      active
                                        ? 'bg-[var(--color-forest)] border-[var(--color-forest)] text-white'
                                        : 'bg-[var(--color-white)] border-[var(--color-gray-soft)] text-[var(--color-forest)] hover:border-[var(--color-sage)]'
                                    }`}
                                  >
                                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>{slot}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-gray-soft)] text-sm font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Voltar</span>
                    </button>
                    <button
                      type="button"
                      disabled={!selectedTime}
                      onClick={() => setStep(5)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 cursor-pointer"
                    >
                      <span>Preencher dados</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: PATIENT DATA */}
              {step === 5 && (
                <div>
                  <h2 className="font-display text-2xl font-normal text-[var(--color-forest)] mb-2">
                    Etapa 5: Dados para contato e agendamento
                  </h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mb-7">
                    Solicitamos apenas as informações necessárias para organizar sua solicitação. Não
                    envie informações clínicas sensíveis neste formulário.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="booking-patient-name"
                        className="block text-sm font-medium text-[var(--color-forest)] mb-1.5"
                      >
                        Nome completo da criança *
                      </label>
                      <input
                        id="booking-patient-name"
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Ex.: Maria Clara Oliveira"
                        className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="booking-patient-phone"
                        className="block text-sm font-medium text-[var(--color-forest)] mb-1.5"
                      >
                        Telefone / WhatsApp com DDD *
                      </label>
                      <input
                        id="booking-patient-phone"
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="booking-patient-email"
                        className="block text-sm font-medium text-[var(--color-forest)] mb-1.5"
                      >
                        E-mail (opcional)
                      </label>
                      <input
                        id="booking-patient-email"
                        type="email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="nome@exemplo.com"
                        className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="booking-guardian"
                        className="block text-sm font-medium text-[var(--color-forest)] mb-1.5"
                      >
                        Nome do pai, mãe ou responsável pela criança
                      </label>
                      <input
                        id="booking-guardian"
                        type="text"
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        placeholder="Ex.: Ana Paula Oliveira (mãe ou responsável)"
                        className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="booking-notes"
                        className="block text-sm font-medium text-[var(--color-forest)] mb-1.5"
                      >
                        Observação administrativa breve (opcional — ex.: preferência de contato)
                      </label>
                      <textarea
                        id="booking-notes"
                        rows={2}
                        maxLength={400}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ex.: Prefiro contato por WhatsApp no período da tarde."
                        className="w-full p-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lgpdConsent}
                          onChange={(e) => setLgpdConsent(e.target.checked)}
                          className="mt-1 w-4 h-4 accent-[var(--color-forest)]"
                        />
                        <span className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                          Concordo com o tratamento dos meus dados exclusivamente para fins de
                          solicitação e confirmação de atendimento, conforme a{' '}
                          <a
                            href="/privacidade"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate('/privacidade');
                            }}
                            className="underline text-[var(--color-forest)] font-medium"
                          >
                            Política de Privacidade (LGPD)
                          </a>
                          .
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-gray-soft)] text-sm font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Voltar</span>
                    </button>
                    <button
                      type="button"
                      disabled={!patientFormValid}
                      onClick={() => setStep(6)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 cursor-pointer"
                    >
                      <span>Revisar solicitação</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: SUMMARY & CONFIRMATION */}
              {step === 6 && (
                <div>
                  <h2 className="font-display text-2xl font-normal text-[var(--color-forest)] mb-2">
                    Etapa 6: Revise sua solicitação
                  </h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mb-7">
                    Ao clicar em <strong>Confirmar solicitação</strong>, seu pedido será enviado à nossa
                    equipe para confirmação definitiva do horário.
                  </p>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-2xl bg-[var(--color-beige)]/65 border border-[var(--color-gray-soft)] text-sm mb-6">
                    <div>
                      <dt className="text-xs text-[var(--color-taupe)]">Tipo de atendimento</dt>
                      <dd className="font-semibold text-[var(--color-forest)] mt-0.5">
                        {selectedSpecialty?.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--color-taupe)]">Profissional escolhido</dt>
                      <dd className="font-semibold text-[var(--color-forest)] mt-0.5">
                        {selectedProfessional?.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--color-taupe)]">Data pretendida</dt>
                      <dd className="font-semibold text-[var(--color-forest)] mt-0.5 tabular-nums">
                        {formatDateBr(selectedDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--color-taupe)]">Horário pretendido</dt>
                      <dd className="font-semibold text-[var(--color-forest)] mt-0.5 tabular-nums">
                        {selectedTime}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--color-taupe)]">Paciente</dt>
                      <dd className="font-medium text-[var(--color-ink)] mt-0.5">{patientName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--color-taupe)]">Telefone / WhatsApp</dt>
                      <dd className="font-medium text-[var(--color-ink)] mt-0.5">{patientPhone}</dd>
                    </div>
                    {guardianName && (
                      <div>
                        <dt className="text-xs text-[var(--color-taupe)]">Responsável</dt>
                        <dd className="font-medium text-[var(--color-ink)] mt-0.5">{guardianName}</dd>
                      </div>
                    )}
                    {patientEmail && (
                      <div>
                        <dt className="text-xs text-[var(--color-taupe)]">E-mail</dt>
                        <dd className="font-medium text-[var(--color-ink)] mt-0.5">{patientEmail}</dd>
                      </div>
                    )}
                  </dl>

                  {submitError && (
                    <div
                      role="alert"
                      className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-gray-soft)] text-sm font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Voltar</span>
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleConfirmSubmit}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--color-forest)] text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      <span>{submitting ? 'Enviando solicitação...' : 'Confirmar solicitação'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Architectural Summary Sidebar */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-[24px] p-6 space-y-5">
              <div className="pb-4 border-b border-[var(--color-gray-soft)]">
                <div className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)]">
                  Resumo da solicitação
                </div>
                <h2 className="font-display text-xl font-normal text-[var(--color-forest)] mt-1">
                  Seu atendimento
                </h2>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs text-[var(--color-taupe)]">Especialidade</div>
                  <div className="font-medium text-[var(--color-forest)] mt-0.5">
                    {selectedSpecialty ? selectedSpecialty.name : 'Ainda não selecionada'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[var(--color-taupe)]">Profissional</div>
                  {selectedProfessional ? (
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--color-gray-soft)] shrink-0">
                        <ResilientImage
                          src={selectedProfessional.photoUrl}
                          alt={selectedProfessional.name}
                          fallbackTitle={selectedProfessional.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--color-forest)] truncate">
                          {selectedProfessional.name}
                        </div>
                        {selectedProfessional.crfa && (
                          <div className="text-xs text-[var(--color-taupe)] tabular-nums">
                            {selectedProfessional.crfa}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[var(--color-ink-muted)] mt-0.5">A escolher na etapa 2</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--color-gray-soft)]">
                  <div>
                    <div className="text-xs text-[var(--color-taupe)]">Data</div>
                    <div className="font-medium text-[var(--color-forest)] mt-0.5 tabular-nums">
                      {selectedDate ? formatDateBr(selectedDate) : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-taupe)]">Horário</div>
                    <div className="font-medium text-[var(--color-forest)] mt-0.5 tabular-nums">
                      {selectedTime || '—'}
                    </div>
                  </div>
                </div>

                {patientName && (
                  <div className="pt-2 border-t border-[var(--color-gray-soft)]">
                    <div className="text-xs text-[var(--color-taupe)]">Paciente</div>
                    <div className="font-medium text-[var(--color-ink)] mt-0.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[var(--color-taupe)]" aria-hidden="true" />
                      <span className="truncate">{patientName}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--color-gray-soft)] text-xs text-[var(--color-ink-muted)] leading-relaxed">
                Prefere falar diretamente com a recepção?{' '}
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-forest)] font-medium underline"
                >
                  Atendimento pelo WhatsApp
                </a>
                .
              </div>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}
