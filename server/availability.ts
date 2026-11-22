import { db } from './db.ts';
import type {
  DayAvailabilitySummary,
  LiveScheduleDay,
  SlotDetail,
  WeeklySchedule,
} from '../src/types.ts';

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAY_FULL = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function toHHMM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getClinicNowParts(timezone: string): { date: string; minutes: number } {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(now);

    const getPart = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
    const date = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
    const hour = Number(getPart('hour')) % 24;
    const minute = Number(getPart('minute'));
    return { date, minutes: hour * 60 + minute };
  } catch {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    return { date, minutes: now.getHours() * 60 + now.getMinutes() };
  }
}

function getWeekdayIndex(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utcDate = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  return utcDate.getUTCDay();
}

function getProfessionalRoomLabel(professionalId: number, clinicAddress?: string): string {
  const activeProfs = db
    .prepare('SELECT id FROM professionals WHERE active = 1 ORDER BY id ASC')
    .all() as Array<{ id: number }>;
  const idx = activeProfs.findIndex((p) => p.id === professionalId);
  const roomNumber = idx >= 0 ? idx + 1 : 1;
  const hasRealAddress =
    clinicAddress &&
    !clinicAddress.toLowerCase().includes('a confirmar') &&
    clinicAddress.trim().length > 0;
  return hasRealAddress
    ? `Consultório Infantil ${roomNumber} · ${clinicAddress}`
    : `Consultório Infantil ${roomNumber} · Unidade adaptaTO`;
}

export interface DetailedDayAvailability {
  slots: string[];
  slotDetails: SlotDetail[];
  occupiedCount: number;
  blockedCount: number;
  totalCount: number;
  blocked: boolean;
  reason?: string;
  weekdayShort: string;
  weekdayFull: string;
  location: string;
}

export function getAvailableSlotsForDate(
  professionalId: number,
  dateStr: string,
  timezone: string,
  ignoreAppointmentId?: number,
  clinicAddress?: string
): DetailedDayAvailability {
  const weekdayIdx = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? getWeekdayIndex(dateStr) : 0;
  const weekdayShort = WEEKDAY_SHORT[weekdayIdx] || '';
  const weekdayFull = WEEKDAY_FULL[weekdayIdx] || '';
  const location = getProfessionalRoomLabel(professionalId, clinicAddress);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return {
      slots: [],
      slotDetails: [],
      occupiedCount: 0,
      blockedCount: 0,
      totalCount: 0,
      blocked: true,
      reason: 'Data inválida.',
      weekdayShort,
      weekdayFull,
      location,
    };
  }

  const nowParts = getClinicNowParts(timezone);
  if (dateStr < nowParts.date) {
    return {
      slots: [],
      slotDetails: [],
      occupiedCount: 0,
      blockedCount: 0,
      totalCount: 0,
      blocked: true,
      reason: 'Data passada indisponível.',
      weekdayShort,
      weekdayFull,
      location,
    };
  }

  const prof = db
    .prepare('SELECT id, active, working_hours_json FROM professionals WHERE id = ?')
    .get(professionalId) as
    | { id: number; active: number; working_hours_json: string }
    | undefined;

  if (!prof || !prof.active) {
    return {
      slots: [],
      slotDetails: [],
      occupiedCount: 0,
      blockedCount: 0,
      totalCount: 0,
      blocked: true,
      reason: 'Profissional indisponível.',
      weekdayShort,
      weekdayFull,
      location,
    };
  }

  let schedule: WeeklySchedule = {};
  try {
    schedule = JSON.parse(prof.working_hours_json) as WeeklySchedule;
  } catch {
    return {
      slots: [],
      slotDetails: [],
      occupiedCount: 0,
      blockedCount: 0,
      totalCount: 0,
      blocked: true,
      reason: 'Agenda não configurada.',
      weekdayShort,
      weekdayFull,
      location,
    };
  }

  const dayKey = String(weekdayIdx);
  const dayConfig = schedule[dayKey];
  if (!dayConfig || !dayConfig.enabled) {
    return {
      slots: [],
      slotDetails: [],
      occupiedCount: 0,
      blockedCount: 0,
      totalCount: 0,
      blocked: false,
      reason: `Sem atendimento às ${weekdayFull.toLowerCase()}s.`,
      weekdayShort,
      weekdayFull,
      location,
    };
  }

  const blocks = db
    .prepare(
      `SELECT start_time, end_time, reason FROM blocked_dates
       WHERE date = ? AND (professional_id IS NULL OR professional_id = ?)`
    )
    .all(dateStr, professionalId) as Array<{
    start_time: string | null;
    end_time: string | null;
    reason: string;
  }>;

  const fullDayBlock = blocks.find((b) => !b.start_time || !b.end_time);
  if (fullDayBlock) {
    return {
      slots: [],
      slotDetails: [],
      occupiedCount: 0,
      blockedCount: 0,
      totalCount: 0,
      blocked: true,
      reason: fullDayBlock.reason || 'Data bloqueada pela clínica.',
      weekdayShort,
      weekdayFull,
      location,
    };
  }

  const existingAppointments = db
    .prepare(
      `SELECT id, time FROM appointments
       WHERE professional_id = ? AND date = ? AND status IN ('pendente', 'confirmado')`
    )
    .all(professionalId, dateStr) as Array<{ id: number; time: string }>;

  const takenTimes = new Set(
    existingAppointments
      .filter((a) => (ignoreAppointmentId ? a.id !== ignoreAppointmentId : true))
      .map((a) => a.time)
  );

  const startMin = toMinutes(dayConfig.start);
  const endMin = toMinutes(dayConfig.end);
  const slotMinutes = Math.max(20, Math.min(120, dayConfig.slotMinutes || 50));
  const hasBreak = Boolean(dayConfig.breakStart && dayConfig.breakEnd);
  const breakStartMin = hasBreak ? toMinutes(dayConfig.breakStart) : -1;
  const breakEndMin = hasBreak ? toMinutes(dayConfig.breakEnd) : -1;

  const slots: string[] = [];
  const slotDetails: SlotDetail[] = [];
  let occupiedCount = 0;
  let blockedCount = 0;

  for (let current = startMin; current + slotMinutes <= endMin; current += slotMinutes) {
    const slotEnd = current + slotMinutes;
    if (hasBreak && current < breakEndMin && slotEnd > breakStartMin) {
      continue;
    }

    const timeStr = toHHMM(current);
    const isBlockedRange = blocks.some((b) => {
      if (!b.start_time || !b.end_time) return false;
      const bStart = toMinutes(b.start_time);
      const bEnd = toMinutes(b.end_time);
      return current < bEnd && slotEnd > bStart;
    });

    if (takenTimes.has(timeStr)) {
      occupiedCount += 1;
      slotDetails.push({
        time: timeStr,
        status: 'ocupado',
        label: 'Já agendado',
        location,
      });
      continue;
    }

    if (isBlockedRange) {
      blockedCount += 1;
      slotDetails.push({
        time: timeStr,
        status: 'bloqueado',
        label: 'Bloqueado',
        location,
      });
      continue;
    }

    if (dateStr === nowParts.date && current <= nowParts.minutes + 15) {
      slotDetails.push({
        time: timeStr,
        status: 'indisponivel',
        label: 'Horário encerrado',
        location,
      });
      continue;
    }

    slots.push(timeStr);
    slotDetails.push({
      time: timeStr,
      status: 'livre',
      label: 'Disponível',
      location,
    });
  }

  const totalCount = slotDetails.length;
  let reason: string | undefined;
  if (slots.length === 0 && totalCount > 0) {
    reason =
      occupiedCount > 0
        ? 'Todos os horários deste dia já estão ocupados na agenda.'
        : 'Não há horários disponíveis para esta data.';
  }

  return {
    slots,
    slotDetails,
    occupiedCount,
    blockedCount,
    totalCount,
    blocked: false,
    reason,
    weekdayShort,
    weekdayFull,
    location,
  };
}

export function getMonthAvailability(
  professionalId: number,
  monthStr: string,
  timezone: string,
  clinicAddress?: string
): DayAvailabilitySummary[] {
  if (!/^\d{4}-\d{2}$/.test(monthStr)) {
    return [];
  }
  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const results: DayAvailabilitySummary[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${monthStr}-${String(d).padStart(2, '0')}`;
    const info = getAvailableSlotsForDate(professionalId, date, timezone, undefined, clinicAddress);
    results.push({
      date,
      availableCount: info.slots.length,
      occupiedCount: info.occupiedCount,
      blockedCount: info.blockedCount,
      totalCount: info.totalCount,
      blocked: info.blocked,
      reason: info.reason,
    });
  }
  return results;
}

export function getLiveWeekSchedule(
  professionalId: number,
  timezone: string,
  clinicAddress?: string,
  startDateStr?: string
): LiveScheduleDay[] {
  const nowParts = getClinicNowParts(timezone);
  const baseDateStr =
    startDateStr && /^\d{4}-\d{2}-\d{2}$/.test(startDateStr) && startDateStr >= nowParts.date
      ? startDateStr
      : nowParts.date;

  const [y, m, d] = baseDateStr.split('-').map(Number);
  const days: LiveScheduleDay[] = [];

  for (let offset = 0; offset < 7; offset++) {
    const dt = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + offset));
    const date = dt.toISOString().slice(0, 10);
    const info = getAvailableSlotsForDate(professionalId, date, timezone, undefined, clinicAddress);
    days.push({
      date,
      weekdayShort: info.weekdayShort,
      weekdayFull: info.weekdayFull,
      availableCount: info.slots.length,
      occupiedCount: info.occupiedCount,
      blockedCount: info.blockedCount,
      totalCount: info.totalCount,
      blocked: info.blocked,
      reason: info.reason,
      location: info.location,
      slots: info.slotDetails,
    });
  }

  return days;
}
