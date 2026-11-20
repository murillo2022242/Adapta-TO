import { db } from './db.ts';
import type { DayAvailabilitySummary, WeeklySchedule } from '../src/types.ts';

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

function getWeekdayKey(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utcDate = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  return String(utcDate.getUTCDay());
}

export function getAvailableSlotsForDate(
  professionalId: number,
  dateStr: string,
  timezone: string,
  ignoreAppointmentId?: number
): { slots: string[]; blocked: boolean; reason?: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { slots: [], blocked: true, reason: 'Data inválida.' };
  }

  const nowParts = getClinicNowParts(timezone);
  if (dateStr < nowParts.date) {
    return { slots: [], blocked: true, reason: 'Data passada indisponível.' };
  }

  const prof = db
    .prepare('SELECT id, active, working_hours_json FROM professionals WHERE id = ?')
    .get(professionalId) as
    | { id: number; active: number; working_hours_json: string }
    | undefined;

  if (!prof || !prof.active) {
    return { slots: [], blocked: true, reason: 'Profissional indisponível.' };
  }

  let schedule: WeeklySchedule = {};
  try {
    schedule = JSON.parse(prof.working_hours_json) as WeeklySchedule;
  } catch {
    return { slots: [], blocked: true, reason: 'Agenda não configurada.' };
  }

  const dayKey = getWeekdayKey(dateStr);
  const dayConfig = schedule[dayKey];
  if (!dayConfig || !dayConfig.enabled) {
    return { slots: [], blocked: false, reason: 'Sem atendimento neste dia da semana.' };
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
      blocked: true,
      reason: fullDayBlock.reason || 'Data bloqueada pela clínica.',
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
  for (let current = startMin; current + slotMinutes <= endMin; current += slotMinutes) {
    const slotEnd = current + slotMinutes;
    if (hasBreak && current < breakEndMin && slotEnd > breakStartMin) {
      continue;
    }
    if (dateStr === nowParts.date && current <= nowParts.minutes + 15) {
      continue;
    }
    const timeStr = toHHMM(current);
    if (takenTimes.has(timeStr)) {
      continue;
    }
    const isBlockedRange = blocks.some((b) => {
      if (!b.start_time || !b.end_time) return false;
      const bStart = toMinutes(b.start_time);
      const bEnd = toMinutes(b.end_time);
      return current < bEnd && slotEnd > bStart;
    });
    if (isBlockedRange) continue;
    slots.push(timeStr);
  }

  return { slots, blocked: false };
}

export function getMonthAvailability(
  professionalId: number,
  monthStr: string,
  timezone: string
): DayAvailabilitySummary[] {
  if (!/^\d{4}-\d{2}$/.test(monthStr)) {
    return [];
  }
  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const results: DayAvailabilitySummary[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${monthStr}-${String(d).padStart(2, '0')}`;
    const info = getAvailableSlotsForDate(professionalId, date, timezone);
    results.push({
      date,
      availableCount: info.slots.length,
      blocked: info.blocked,
      reason: info.reason,
    });
  }
  return results;
}
