import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  Clock,
  Download,
  MessageCircle,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type {
  Appointment,
  AppointmentStatus,
  AuthUser,
  BlockedDate,
  DashboardStats,
  Professional,
  Specialty,
  WeeklySchedule,
} from '../../types.ts';

interface AgendaTabProps {
  user: AuthUser;
  stats: DashboardStats | null;
  appointments: Appointment[];
  professionals: Professional[];
  specialties: Specialty[];
  blocks: BlockedDate[];
  onRefresh: () => Promise<void>;
}

const STATUS_LABEL: Record<string, { label: string; style: string }> = {
  pendente: { label: 'Pendente', style: 'bg-amber-50 text-amber-800 border-amber-200' },
  confirmado: { label: 'Confirmado', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  cancelado: { label: 'Cancelado', style: 'bg-red-50 text-red-800 border-red-200' },
  reagendado: { label: 'Reagendado', style: 'bg-slate-100 text-slate-800 border-slate-200' },
};

const WEEK_KEYS = [
  { key: '1', label: 'Segunda-feira' },
  { key: '2', label: 'Terça-feira' },
  { key: '3', label: 'Quarta-feira' },
  { key: '4', label: 'Quinta-feira' },
  { key: '5', label: 'Sexta-feira' },
  { key: '6', label: 'Sábado' },
  { key: '0', label: 'Domingo' },
];

export function AgendaTab({
  user,
  stats,
  appointments,
  professionals,
  specialties,
  blocks,
  onRefresh,
}: AgendaTabProps) {
  const [viewMode, setViewMode] = useState<'list' | 'day' | 'week' | 'month'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [profFilter, setProfFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [focusDate, setFocusDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Full Edit Appointment modal state
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [editForm, setEditForm] = useState({
    specialtyId: 0,
    professionalId: 0,
    date: '',
    time: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    guardianName: '',
    notes: '',
    adminNotes: '',
    status: 'pendente' as AppointmentStatus,
    skipSlotCheck: true,
  });

  // New Manual Appointment modal state
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [newAppt, setNewAppt] = useState({
    specialtyId: specialties[0]?.id || 0,
    professionalId:
      user.role === 'professional' && user.professionalId
        ? user.professionalId
        : professionals[0]?.id || 0,
    date: new Date().toISOString().slice(0, 10),
    time: '09:00',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    guardianName: '',
    notes: '',
    adminNotes: '',
    status: 'confirmado' as 'confirmado' | 'pendente',
  });

  // Block date form
  const [blockDate, setBlockDate] = useState('');
  const [blockProfId, setBlockProfId] = useState<string>(
    user.role === 'professional' && user.professionalId ? String(user.professionalId) : ''
  );
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('');

  // Weekly hours editor
  const editableProf = useMemo(() => {
    if (user.role === 'professional') {
      return professionals.find((p) => p.id === user.professionalId) || null;
    }
    const chosenId = profFilter !== 'all' ? Number(profFilter) : professionals[0]?.id;
    return professionals.find((p) => p.id === chosenId) || null;
  }, [professionals, profFilter, user]);

  const [scheduleDraft, setScheduleDraft] = useState<WeeklySchedule | null>(null);
  const activeSchedule = scheduleDraft || editableProf?.workingHours || null;

  const filteredAppointments = useMemo(() => {
    const q = search.trim().toLowerCase();
    const todayStr = new Date().toISOString().slice(0, 10);
    const in7Days = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);
    const currentMonthPrefix = todayStr.slice(0, 7);

    return appointments.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (periodFilter === 'today' && a.date !== todayStr) return false;
      if (periodFilter === 'week' && (a.date < todayStr || a.date > in7Days)) return false;
      if (periodFilter === 'month' && !a.date.startsWith(currentMonthPrefix)) return false;
      if (user.role === 'admin' && profFilter !== 'all' && a.professionalId !== Number(profFilter)) {
        return false;
      }
      if (q) {
        const hay = `${a.patientName} ${a.patientPhone} ${a.protocolCode}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [appointments, statusFilter, periodFilter, profFilter, search, user.role]);

  const exportCsv = () => {
    const escapeCell = (val?: string) => `"${String(val || '').replace(/"/g, '""')}"`;
    const headers = [
      'Protocolo',
      'Data',
      'Horário',
      'Status',
      'Paciente',
      'Telefone',
      'E-mail',
      'Responsável',
      'Especialidade',
      'Profissional',
      'Observações',
      'Notas internas',
    ];
    const rows = filteredAppointments.map((a) =>
      [
        a.protocolCode,
        a.date,
        a.time,
        a.status,
        a.patientName,
        a.patientPhone,
        a.patientEmail || '',
        a.guardianName || '',
        a.specialtyName,
        a.professionalName,
        a.notes || '',
        a.adminNotes || '',
      ]
        .map(escapeCell)
        .join(';')
    );
    const csvContent = '\uFEFF' + [headers.map(escapeCell).join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agendamentos-adaptato-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActionMessage(`${filteredAppointments.length} registro(s) exportado(s) em CSV.`);
  };

  const weekDates = useMemo(() => {
    const [y, m, d] = focusDate.split('-').map(Number);
    const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
    const day = dt.getUTCDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(dt.getTime() + diffToMon * 86400_000);
    return Array.from({ length: 7 }).map((_, i) => {
      const cur = new Date(monday.getTime() + i * 86400_000);
      return cur.toISOString().slice(0, 10);
    });
  }, [focusDate]);

  const monthDays = useMemo(() => {
    const [y, m] = focusDate.split('-').map(Number);
    const total = new Date(y, m, 0).getDate();
    const prefix = focusDate.slice(0, 7);
    return Array.from({ length: total }).map(
      (_, idx) => `${prefix}-${String(idx + 1).padStart(2, '0')}`
    );
  }, [focusDate]);

  const updateAppointmentStatus = async (id: number, status: 'confirmado' | 'cancelado') => {
    setActionMessage(null);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionError(json.error || 'Erro ao atualizar agendamento.');
        return;
      }
      setActionMessage(`Agendamento ${status === 'confirmado' ? 'confirmado' : 'cancelado'} com sucesso.`);
      await onRefresh();
    } catch {
      setActionError('Erro de conexão ao atualizar agendamento.');
    }
  };

  const openEditModal = (appt: Appointment) => {
    setEditingAppt(appt);
    setEditForm({
      specialtyId: appt.specialtyId,
      professionalId: appt.professionalId,
      date: appt.date,
      time: appt.time,
      patientName: appt.patientName,
      patientPhone: appt.patientPhone,
      patientEmail: appt.patientEmail || '',
      guardianName: appt.guardianName || '',
      notes: appt.notes || '',
      adminNotes: appt.adminNotes || '',
      status: appt.status,
      skipSlotCheck: true,
    });
  };

  const submitEditModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppt) return;
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/appointments/${editingAppt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionError(json.error || 'Não foi possível salvar as alterações.');
        return;
      }
      setEditingAppt(null);
      setActionMessage('Agendamento atualizado com sucesso.');
      await onRefresh();
    } catch {
      setActionError('Erro de conexão ao editar agendamento.');
    }
  };

  const deleteAppointment = async (appt: Appointment) => {
    setActionError(null);
    const res = await fetch(`/api/admin/appointments/${appt.id}`, { method: 'DELETE' });
    if (res.ok) {
      setActionMessage(`Agendamento ${appt.protocolCode} excluído.`);
      await onRefresh();
    } else {
      const json = await res.json();
      setActionError(json.error || 'Não foi possível excluir.');
    }
  };

  const openCreateModal = () => {
    setNewAppt({
      specialtyId: specialties[0]?.id || 0,
      professionalId:
        user.role === 'professional' && user.professionalId
          ? user.professionalId
          : professionals[0]?.id || 0,
      date: focusDate || new Date().toISOString().slice(0, 10),
      time: '09:00',
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      guardianName: '',
      notes: '',
      adminNotes: '',
      status: 'confirmado',
    });
    setCreatingOpen(true);
  };

  const submitCreateModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppt),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionError(json.error || 'Erro ao criar agendamento.');
        return;
      }
      setCreatingOpen(false);
      setActionMessage('Agendamento manual criado com sucesso.');
      await onRefresh();
    } catch {
      setActionError('Erro de conexão ao criar agendamento.');
    }
  };

  const createBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalId: blockProfId ? Number(blockProfId) : null,
          date: blockDate,
          startTime: blockStart || null,
          endTime: blockEnd || null,
          reason: blockReason,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionError(json.error || 'Erro ao criar bloqueio.');
        return;
      }
      setBlockDate('');
      setBlockStart('');
      setBlockEnd('');
      setBlockReason('');
      setActionMessage('Bloqueio de agenda registrado.');
      await onRefresh();
    } catch {
      setActionError('Erro ao salvar bloqueio.');
    }
  };

  const deleteBlock = async (id: number) => {
    await fetch(`/api/admin/blocks/${id}`, { method: 'DELETE' });
    await onRefresh();
  };

  const saveWorkingHours = async () => {
    if (!editableProf || !activeSchedule) return;
    setActionError(null);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/professionals/${editableProf.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workingHours: activeSchedule }),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionError(json.error || 'Erro ao salvar horários.');
        return;
      }
      setScheduleDraft(null);
      setActionMessage(`Horários de atendimento de ${editableProf.name} atualizados.`);
      await onRefresh();
    } catch {
      setActionError('Erro ao atualizar horários.');
    }
  };

  const applyScheduleToAll = async () => {
    if (!activeSchedule) return;
    setActionError(null);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/apply-schedule-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workingHours: activeSchedule }),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionError(json.error || 'Erro ao aplicar grade a todos.');
        return;
      }
      setScheduleDraft(null);
      setActionMessage(json.message);
      await onRefresh();
    } catch {
      setActionError('Erro ao aplicar grade para todos.');
    }
  };

  const renderAppointmentRow = (a: Appointment) => {
    const st = STATUS_LABEL[a.status] || STATUS_LABEL.pendente;
    const digits = a.patientPhone.replace(/\D/g, '');
    const waPhone = digits.startsWith('55') ? digits : `55${digits}`;
    const waText = encodeURIComponent(
      `Olá ${a.patientName}! Aqui é da clínica adaptaTO sobre sua solicitação de ${a.specialtyName} (${a.protocolCode}) para ${a.date} às ${a.time}.`
    );

    return (
      <tr key={a.id} className="border-t border-[var(--color-gray-soft)] hover:bg-[var(--color-beige)]/35">
        <td className="py-3.5 px-4 text-xs font-medium text-[var(--color-taupe)] tabular-nums whitespace-nowrap">
          {a.protocolCode}
        </td>
        <td className="py-3.5 px-4 text-sm tabular-nums whitespace-nowrap">
          <div className="font-medium text-[var(--color-forest)]">{a.date}</div>
          <div className="text-xs text-[var(--color-ink-muted)]">{a.time}</div>
        </td>
        <td className="py-3.5 px-4 text-sm">
          <div className="font-medium text-[var(--color-ink)]">{a.patientName}</div>
          <div className="text-xs text-[var(--color-ink-muted)]">
            {a.patientPhone}
            {a.guardianName ? ` · Resp.: ${a.guardianName}` : ''}
          </div>
          {a.notes && <div className="text-xs text-[var(--color-taupe)] mt-0.5">{a.notes}</div>}
          {a.adminNotes && (
            <div className="text-[11px] text-[var(--color-forest)] mt-0.5">
              Obs. interna: {a.adminNotes}
            </div>
          )}
        </td>
        <td className="py-3.5 px-4 text-sm">
          <div className="font-medium text-[var(--color-ink)]">{a.specialtyName}</div>
          <div className="text-xs text-[var(--color-ink-muted)]">{a.professionalName}</div>
        </td>
        <td className="py-3.5 px-4 text-xs whitespace-nowrap">
          <span className={`inline-block px-2.5 py-1 rounded-md border font-medium ${st.style}`}>
            {st.label}
          </span>
        </td>
        <td className="py-3.5 px-4 text-right whitespace-nowrap">
          <div className="inline-flex items-center gap-1.5">
            {a.status !== 'confirmado' && (
              <button
                type="button"
                onClick={() => updateAppointmentStatus(a.id, 'confirmado')}
                title="Confirmar agendamento"
                className="px-2.5 py-1.5 rounded-lg bg-[var(--color-forest)] text-white text-xs font-medium hover:opacity-90 cursor-pointer"
              >
                Confirmar
              </button>
            )}
            <button
              type="button"
              onClick={() => openEditModal(a)}
              title="Editar dados, data ou horário"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--color-gray-soft)] text-[var(--color-forest)] text-xs font-medium hover:bg-[var(--color-beige)] cursor-pointer"
            >
              <Pencil className="w-3 h-3" />
              <span>Editar</span>
            </button>
            {a.status !== 'cancelado' && (
              <button
                type="button"
                onClick={() => updateAppointmentStatus(a.id, 'cancelado')}
                title="Cancelar"
                className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-medium hover:bg-red-50 cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <a
              href={`https://wa.me/${waPhone}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Contatar paciente via WhatsApp"
              className="p-1.5 rounded-lg border border-[var(--color-gray-soft)] text-[var(--color-forest)] hover:bg-[var(--color-beige)]"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            {user.role === 'admin' && (
              <button
                type="button"
                onClick={() => deleteAppointment(a)}
                title="Excluir registro"
                className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-8">
      {/* KPI Indicators (Real DB Data) */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-5">
            <div className="text-xs text-[var(--color-taupe)]">Total de solicitações</div>
            <div className="text-2xl font-semibold text-[var(--color-forest)] mt-1 tabular-nums">
              {stats.total}
            </div>
          </div>
          <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-5">
            <div className="text-xs text-[var(--color-taupe)]">Solicitações pendentes</div>
            <div className="text-2xl font-semibold text-amber-700 mt-1 tabular-nums">
              {stats.pending}
            </div>
          </div>
          <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-5">
            <div className="text-xs text-[var(--color-taupe)]">Consultas confirmadas</div>
            <div className="text-2xl font-semibold text-emerald-700 mt-1 tabular-nums">
              {stats.confirmed}
            </div>
          </div>
          <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-5">
            <div className="text-xs text-[var(--color-taupe)]">Consultas canceladas</div>
            <div className="text-2xl font-semibold text-[var(--color-ink-muted)] mt-1 tabular-nums">
              {stats.cancelled}
            </div>
          </div>
        </div>
      )}

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between">
          <span>{actionMessage}</span>
          <button type="button" onClick={() => setActionMessage(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters & Calendar View Switcher */}
      <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--color-gray-soft)]">
          <div className="flex flex-wrap items-center gap-2">
            {(['list', 'day', 'week', 'month'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === m
                    ? 'bg-[var(--color-forest)] text-white'
                    : 'bg-[var(--color-beige)] text-[var(--color-ink-muted)] hover:text-[var(--color-forest)]'
                }`}
              >
                {m === 'list' && 'Lista completa'}
                {m === 'day' && 'Calendário Diário'}
                {m === 'week' && 'Calendário Semanal'}
                {m === 'month' && 'Calendário Mensal'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--color-taupe)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar paciente ou protocolo..."
                className="h-9 pl-9 pr-3 rounded-lg border border-[var(--color-gray-soft)] text-xs focus:border-[var(--color-forest)] focus:outline-none"
              />
            </div>

            {user.role === 'admin' && (
              <select
                value={profFilter}
                onChange={(e) => {
                  setProfFilter(e.target.value);
                  setScheduleDraft(null);
                }}
                aria-label="Filtrar por profissional"
                className="h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-xs bg-[var(--color-white)]"
              >
                <option value="all">Todos os profissionais</option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
              aria-label="Filtrar por período"
              className="h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-xs bg-[var(--color-white)]"
            >
              <option value="all">Todo o período</option>
              <option value="today">Somente hoje</option>
              <option value="week">Próximos 7 dias</option>
              <option value="month">Este mês</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrar por status"
              className="h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-xs bg-[var(--color-white)]"
            >
              <option value="all">Todos os status</option>
              <option value="pendente">Pendentes</option>
              <option value="confirmado">Confirmados</option>
              <option value="cancelado">Cancelados</option>
            </select>

            {viewMode !== 'list' && (
              <input
                type="date"
                value={focusDate}
                onChange={(e) => setFocusDate(e.target.value)}
                aria-label="Data de referência"
                className="h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-xs tabular-nums"
              />
            )}

            <button
              type="button"
              onClick={openCreateModal}
              className="h-9 px-3.5 rounded-lg bg-[var(--color-forest)] text-white inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-90 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo agendamento</span>
            </button>

            <button
              type="button"
              onClick={exportCsv}
              title="Exportar lista filtrada para planilha CSV"
              className="h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-[var(--color-forest)] hover:bg-[var(--color-beige)] inline-flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={() => onRefresh()}
              aria-label="Atualizar agenda"
              className="h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-[var(--color-forest)] hover:bg-[var(--color-beige)] inline-flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* LIST OR DAY VIEW */}
        {(viewMode === 'list' || viewMode === 'day') && (
          <div className="overflow-x-auto mt-4">
            {(() => {
              const items =
                viewMode === 'day'
                  ? filteredAppointments.filter((a) => a.date === focusDate)
                  : filteredAppointments;
              if (items.length === 0) {
                return (
                  <div className="py-10 text-center text-sm text-[var(--color-ink-muted)]">
                    Nenhum agendamento encontrado para os filtros selecionados.
                  </div>
                );
              }
              return (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-medium text-[var(--color-taupe)] border-b border-[var(--color-gray-soft)]">
                      <th className="py-3 px-4">Protocolo</th>
                      <th className="py-3 px-4">Data / Hora</th>
                      <th className="py-3 px-4">Paciente</th>
                      <th className="py-3 px-4">Atendimento / Profissional</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>{items.map(renderAppointmentRow)}</tbody>
                </table>
              );
            })()}
          </div>
        )}

        {/* WEEKLY VIEW */}
        {viewMode === 'week' && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDates.map((d) => {
              const dayItems = filteredAppointments
                .filter((a) => a.date === d)
                .sort((a, b) => a.time.localeCompare(b.time));
              return (
                <div
                  key={d}
                  className="rounded-xl border border-[var(--color-gray-soft)] p-3 bg-[var(--color-beige)]/35 min-h-[180px]"
                >
                  <div className="text-xs font-semibold text-[var(--color-forest)] pb-2 mb-2 border-b border-[var(--color-gray-soft)] tabular-nums">
                    {d.split('-').reverse().join('/')}
                  </div>
                  {dayItems.length === 0 ? (
                    <div className="text-[11px] text-[var(--color-ink-muted)]">Livre</div>
                  ) : (
                    <div className="space-y-2">
                      {dayItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-2 rounded-lg bg-[var(--color-white)] border border-[var(--color-gray-soft)] text-xs"
                        >
                          <div className="font-semibold text-[var(--color-forest)] tabular-nums">
                            {item.time} · {item.status}
                          </div>
                          <div className="truncate font-medium text-[var(--color-ink)]">
                            {item.patientName}
                          </div>
                          <div className="truncate text-[11px] text-[var(--color-taupe)]">
                            {item.specialtyName}
                          </div>
                          <div className="mt-1.5 flex gap-1">
                            {item.status === 'pendente' && (
                              <button
                                type="button"
                                onClick={() => updateAppointmentStatus(item.id, 'confirmado')}
                                className="px-2 py-0.5 rounded bg-[var(--color-forest)] text-white text-[10px] cursor-pointer"
                              >
                                Confirmar
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="px-2 py-0.5 rounded border border-[var(--color-gray-soft)] text-[10px] cursor-pointer"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* MONTHLY VIEW */}
        {viewMode === 'month' && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {monthDays.map((d) => {
              const dayItems = filteredAppointments.filter((a) => a.date === d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setFocusDate(d);
                    setViewMode('day');
                  }}
                  className="text-left p-3 rounded-xl border border-[var(--color-gray-soft)] hover:border-[var(--color-sage)] bg-[var(--color-white)] min-h-[88px] flex flex-col justify-between cursor-pointer"
                >
                  <span className="text-xs font-semibold text-[var(--color-forest)] tabular-nums">
                    {d.slice(8)}/{d.slice(5, 7)}
                  </span>
                  {dayItems.length > 0 ? (
                    <span className="text-[11px] text-[var(--color-ink)] tabular-nums">
                      {dayItems.length} atendimento(s)
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--color-ink-muted)]/60">
                      Sem registros
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL EDIT APPOINTMENT MODAL */}
      {editingAppt && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={submitEditModal}
            className="bg-[var(--color-white)] rounded-2xl border border-[var(--color-gray-soft)] max-w-xl w-full p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-forest)]">
                Editar Agendamento · {editingAppt.protocolCode}
              </h3>
              <button
                type="button"
                onClick={() => setEditingAppt(null)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-beige)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Nome do paciente *
                </label>
                <input
                  type="text"
                  required
                  disabled={user.role !== 'admin'}
                  value={editForm.patientName}
                  onChange={(e) => setEditForm({ ...editForm, patientName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  disabled={user.role !== 'admin'}
                  value={editForm.patientPhone}
                  onChange={(e) => setEditForm({ ...editForm, patientPhone: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  disabled={user.role !== 'admin'}
                  value={editForm.patientEmail}
                  onChange={(e) => setEditForm({ ...editForm, patientEmail: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Responsável
                </label>
                <input
                  type="text"
                  disabled={user.role !== 'admin'}
                  value={editForm.guardianName}
                  onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Especialidade
                </label>
                <select
                  disabled={user.role !== 'admin'}
                  value={editForm.specialtyId}
                  onChange={(e) => setEditForm({ ...editForm, specialtyId: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm bg-white disabled:bg-slate-50"
                >
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Profissional
                </label>
                <select
                  disabled={user.role !== 'admin'}
                  value={editForm.professionalId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, professionalId: Number(e.target.value) })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm bg-white disabled:bg-slate-50"
                >
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  required
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Horário *
                </label>
                <input
                  type="time"
                  required
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm tabular-nums"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value as AppointmentStatus })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm bg-white"
                >
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="reagendado">Reagendado (vira Confirmado)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Observações do paciente
                </label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--color-gray-soft)] text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Anotações internas da equipe
                </label>
                <textarea
                  rows={2}
                  value={editForm.adminNotes}
                  onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--color-gray-soft)] text-xs"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-gray-soft)] text-xs font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir ficha</span>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAppt(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-gray-soft)] text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar alterações</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* CREATE MANUAL APPOINTMENT MODAL */}
      {creatingOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={submitCreateModal}
            className="bg-[var(--color-white)] rounded-2xl border border-[var(--color-gray-soft)] max-w-xl w-full p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-forest)]">
                Novo Agendamento Manual
              </h3>
              <button
                type="button"
                onClick={() => setCreatingOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-beige)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Paciente *
                </label>
                <input
                  type="text"
                  required
                  value={newAppt.patientName}
                  onChange={(e) => setNewAppt({ ...newAppt, patientName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={newAppt.patientPhone}
                  onChange={(e) => setNewAppt({ ...newAppt, patientPhone: e.target.value })}
                  placeholder="(11) 99999-0000"
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Especialidade *
                </label>
                <select
                  required
                  value={newAppt.specialtyId}
                  onChange={(e) => setNewAppt({ ...newAppt, specialtyId: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm bg-white"
                >
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Profissional *
                </label>
                <select
                  required
                  disabled={user.role === 'professional'}
                  value={newAppt.professionalId}
                  onChange={(e) =>
                    setNewAppt({ ...newAppt, professionalId: Number(e.target.value) })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm bg-white disabled:bg-slate-50"
                >
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  required
                  value={newAppt.date}
                  onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Horário *
                </label>
                <input
                  type="time"
                  required
                  value={newAppt.time}
                  onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Status inicial
                </label>
                <select
                  value={newAppt.status}
                  onChange={(e) =>
                    setNewAppt({
                      ...newAppt,
                      status: e.target.value as 'confirmado' | 'pendente',
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm bg-white"
                >
                  <option value="confirmado">Confirmado</option>
                  <option value="pendente">Pendente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Responsável (opcional)
                </label>
                <input
                  type="text"
                  value={newAppt.guardianName}
                  onChange={(e) => setNewAppt({ ...newAppt, guardianName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Anotações internas / observações
                </label>
                <textarea
                  rows={2}
                  value={newAppt.adminNotes}
                  onChange={(e) => setNewAppt({ ...newAppt, adminNotes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--color-gray-soft)] text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreatingOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--color-gray-soft)] text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar agendamento</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WORKING HOURS & BLOCKED DATES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Schedule Configuration */}
        {editableProf && activeSchedule && (
          <div className="lg:col-span-7 bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-forest)]">
                  Dias e horários de atendimento
                </h3>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Agenda configurada para: <strong>{editableProf.name}</strong>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {user.role === 'admin' && professionals.length > 1 && (
                  <button
                    type="button"
                    onClick={applyScheduleToAll}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-gray-soft)] text-xs font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
                  >
                    <span>Aplicar a todos</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={saveWorkingHours}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-forest)] text-white text-xs font-medium hover:opacity-90 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar horários</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {WEEK_KEYS.map(({ key, label }) => {
                const day = activeSchedule[key] || {
                  enabled: false,
                  start: '07:30',
                  end: '20:00',
                  breakStart: '12:00',
                  breakEnd: '13:00',
                  slotMinutes: 30,
                };
                const updateDay = (patch: Partial<typeof day>) => {
                  const base = scheduleDraft || editableProf.workingHours;
                  setScheduleDraft({
                    ...base,
                    [key]: { ...day, ...patch },
                  });
                };

                return (
                  <div
                    key={key}
                    className="p-3 rounded-xl border border-[var(--color-gray-soft)] flex flex-wrap items-center gap-3 text-xs"
                  >
                    <label className="flex items-center gap-2 min-w-[130px] font-medium text-[var(--color-forest)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.enabled}
                        onChange={(e) => updateDay({ enabled: e.target.checked })}
                        className="accent-[var(--color-forest)]"
                      />
                      <span>{label}</span>
                    </label>
                    {day.enabled && (
                      <>
                        <div className="flex items-center gap-1">
                          <span className="text-[var(--color-taupe)]">Das</span>
                          <input
                            type="time"
                            value={day.start}
                            onChange={(e) => updateDay({ start: e.target.value })}
                            className="px-2 py-1 rounded border border-[var(--color-gray-soft)] tabular-nums"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[var(--color-taupe)]">às</span>
                          <input
                            type="time"
                            value={day.end}
                            onChange={(e) => updateDay({ end: e.target.value })}
                            className="px-2 py-1 rounded border border-[var(--color-gray-soft)] tabular-nums"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[var(--color-taupe)]">Pausa:</span>
                          <input
                            type="time"
                            value={day.breakStart}
                            onChange={(e) => updateDay({ breakStart: e.target.value })}
                            className="px-2 py-1 rounded border border-[var(--color-gray-soft)] tabular-nums"
                          />
                          <span>–</span>
                          <input
                            type="time"
                            value={day.breakEnd}
                            onChange={(e) => updateDay({ breakEnd: e.target.value })}
                            className="px-2 py-1 rounded border border-[var(--color-gray-soft)] tabular-nums"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[var(--color-taupe)]" />
                          <input
                            type="number"
                            min={15}
                            max={120}
                            step={5}
                            value={day.slotMinutes}
                            onChange={(e) => updateDay({ slotMinutes: Number(e.target.value) })}
                            className="w-14 px-2 py-1 rounded border border-[var(--color-gray-soft)] tabular-nums"
                          />
                          <span className="text-[var(--color-taupe)]">min</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Blocked Dates / Holidays / Vacations */}
        <div className="lg:col-span-5 bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[var(--color-forest)] mb-1">
            Bloqueios, férias e feriados
          </h3>
          <p className="text-xs text-[var(--color-ink-muted)] mb-4">
            Datas e intervalos bloqueados não aparecem disponíveis para agendamento online.
          </p>

          <form onSubmit={createBlock} className="space-y-3 pb-5 border-b border-[var(--color-gray-soft)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  required
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-xs tabular-nums"
                />
              </div>
              {user.role === 'admin' && (
                <div>
                  <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                    Abrangência
                  </label>
                  <select
                    value={blockProfId}
                    onChange={(e) => setBlockProfId(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-xs bg-[var(--color-white)]"
                  >
                    <option value="">Toda a clínica (feriado)</option>
                    {professionals.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--color-taupe)] mb-1">
                  Início (opcional)
                </label>
                <input
                  type="time"
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--color-taupe)] mb-1">
                  Fim (opcional)
                </label>
                <input
                  type="time"
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-xs tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[var(--color-taupe)] mb-1">Motivo</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ex.: Feriado nacional, recesso ou reunião clínica"
                className="w-full h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-xs"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-forest)] text-white text-xs font-medium hover:opacity-90 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar bloqueio</span>
            </button>
          </form>

          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {blocks.length === 0 ? (
              <p className="text-xs text-[var(--color-ink-muted)]">Nenhum bloqueio cadastrado.</p>
            ) : (
              blocks.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl border border-[var(--color-gray-soft)] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-[var(--color-forest)] tabular-nums">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />
                      {b.date}{' '}
                      {b.startTime && b.endTime ? `(${b.startTime}–${b.endTime})` : '(Dia inteiro)'}
                    </div>
                    <div className="text-[var(--color-ink-muted)] mt-0.5">
                      {b.professionalName} {b.reason ? `· ${b.reason}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteBlock(b.id)}
                    aria-label="Remover bloqueio"
                    className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
