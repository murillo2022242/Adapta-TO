import React, { useState } from 'react';
import { Bot, Check, Pencil, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import type {
  AuthUser,
  ContactMessage,
  FaqItem,
  KnowledgeItem,
  Professional,
  SiteSettings,
  Specialty,
} from '../../types.ts';
import { ResilientImage, SPECIALTY_ICON_OPTIONS } from '../ClinicIcon.tsx';

export function ProfessionalsAndSpecialtiesTab({
  professionals,
  specialties,
  onRefresh,
}: {
  professionals: Professional[];
  specialties: Specialty[];
  onRefresh: () => Promise<void>;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Edit professional state
  const [editingProfId, setEditingProfId] = useState<number | null>(null);
  const [editProfForm, setEditProfForm] = useState<{
    name: string;
    specialtySummary: string;
    crfa: string;
    bio: string;
    photoUrl: string;
    active: boolean;
    specialtyIds: number[];
  } | null>(null);

  // Create professional state
  const [newProf, setNewProf] = useState({
    name: '',
    specialtySummary: '',
    crfa: '',
    bio: '',
    photoUrl: '',
    specialtyIds: [] as number[],
  });

  // Edit specialty state
  const [editingSpecId, setEditingSpecId] = useState<number | null>(null);
  const [editSpecForm, setEditSpecForm] = useState<{
    name: string;
    icon: string;
    shortDescription: string;
    fullDescription: string;
    targetAudience: string;
    objectives: string;
    howItWorks: string;
    confirmationStatus: 'confirmed' | 'to_confirm';
    sortOrder: number;
    active: boolean;
  } | null>(null);

  // Create specialty state
  const [newSpec, setNewSpec] = useState({
    name: '',
    icon: 'MessageCircle',
    shortDescription: '',
    fullDescription: '',
    targetAudience: '',
    objectives: '',
    howItWorks: '',
    confirmationStatus: 'confirmed' as 'confirmed' | 'to_confirm',
    sortOrder: 20,
  });

  const handleUploadProfPhoto = async (
    file: File | undefined,
    mode: 'create' | 'edit' | number
  ) => {
    if (!file) return;
    setErr(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: reader.result, filename: file.name, skipEditorLock: true }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErr(json.error || 'Erro ao enviar foto.');
        return;
      }
      if (mode === 'create') {
        setNewProf((p) => ({ ...p, photoUrl: json.url }));
      } else if (mode === 'edit') {
        setEditProfForm((p) => (p ? { ...p, photoUrl: json.url } : p));
      } else {
        await fetch(`/api/admin/professionals/${mode}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoUrl: json.url }),
        });
        setMsg('Foto do profissional atualizada.');
        await onRefresh();
      }
    };
    reader.readAsDataURL(file);
  };

  const startEditProf = (p: Professional) => {
    setEditingProfId(p.id);
    setEditProfForm({
      name: p.name,
      specialtySummary: p.specialtySummary,
      crfa: p.crfa,
      bio: p.bio,
      photoUrl: p.photoUrl,
      active: p.active,
      specialtyIds: p.specialtyIds || [],
    });
  };

  const saveEditProf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfId || !editProfForm) return;
    setErr(null);
    const res = await fetch(`/api/admin/professionals/${editingProfId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editProfForm),
    });
    const json = await res.json();
    if (!res.ok) {
      setErr(json.error || 'Erro ao salvar profissional.');
      return;
    }
    setEditingProfId(null);
    setEditProfForm(null);
    setMsg('Dados do profissional atualizados com sucesso.');
    await onRefresh();
  };

  const deleteProf = async (p: Professional) => {
    const res = await fetch(`/api/admin/professionals/${p.id}`, { method: 'DELETE' });
    const json = await res.json();
    setMsg(json.message || `Profissional "${p.name}" removido/inativado.`);
    await onRefresh();
  };

  const createProf = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const defaultHours = professionals[0]?.workingHours || {};
    const specIds =
      newProf.specialtyIds.length > 0
        ? newProf.specialtyIds
        : specialties.filter((s) => s.active).map((s) => s.id);

    const res = await fetch('/api/admin/professionals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newProf.name,
        specialtySummary: newProf.specialtySummary,
        crfa: newProf.crfa,
        bio: newProf.bio,
        photoUrl: newProf.photoUrl,
        workingHours: defaultHours,
        specialtyIds: specIds,
      }),
    });
    if (res.ok) {
      setNewProf({
        name: '',
        specialtySummary: '',
        crfa: '',
        bio: '',
        photoUrl: '',
        specialtyIds: [],
      });
      setMsg('Profissional cadastrado com sucesso.');
      await onRefresh();
    } else {
      const json = await res.json();
      setErr(json.error || 'Erro ao cadastrar profissional.');
    }
  };

  const toggleProfActive = async (p: Professional) => {
    await fetch(`/api/admin/professionals/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    });
    await onRefresh();
  };

  const startEditSpec = (s: Specialty) => {
    setEditingSpecId(s.id);
    setEditSpecForm({
      name: s.name,
      icon: s.icon,
      shortDescription: s.shortDescription,
      fullDescription: s.fullDescription,
      targetAudience: s.targetAudience,
      objectives: s.objectives,
      howItWorks: s.howItWorks,
      confirmationStatus: s.confirmationStatus,
      sortOrder: s.sortOrder,
      active: s.active,
    });
  };

  const saveEditSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpecId || !editSpecForm) return;
    const res = await fetch(`/api/admin/specialties/${editingSpecId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editSpecForm),
    });
    if (res.ok) {
      setEditingSpecId(null);
      setEditSpecForm(null);
      setMsg('Especialidade atualizada com sucesso.');
      await onRefresh();
    }
  };

  const deleteSpec = async (s: Specialty) => {
    const res = await fetch(`/api/admin/specialties/${s.id}`, { method: 'DELETE' });
    const json = await res.json();
    setMsg(json.message || `Especialidade "${s.name}" removida.`);
    await onRefresh();
  };

  const createSpecialty = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/specialties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSpec),
    });
    if (res.ok) {
      setNewSpec({
        name: '',
        icon: 'MessageCircle',
        shortDescription: '',
        fullDescription: '',
        targetAudience: '',
        objectives: '',
        howItWorks: '',
        confirmationStatus: 'confirmed',
        sortOrder: 20,
      });
      setMsg('Especialidade adicionada.');
      await onRefresh();
    }
  };

  const toggleSpecStatus = async (s: Specialty, patch: Partial<Specialty>) => {
    await fetch(`/api/admin/specialties/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setMsg(`Especialidade "${s.name}" atualizada.`);
    await onRefresh();
  };

  return (
    <div className="space-y-8">
      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between">
          <span>{msg}</span>
          <button type="button" onClick={() => setMsg(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {err && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          {err}
        </div>
      )}

      {/* PROFESSIONALS */}
      <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-forest)]">
            Profissionais da Clínica
          </h2>
          <p className="text-xs text-[var(--color-ink-muted)] mt-1">
            Edite nomes, CRFa, biografia, especialidades vinculadas, foto ou cadastre novos membros.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {professionals.map((p) => {
            const isEditing = editingProfId === p.id && editProfForm;
            return (
              <div
                key={p.id}
                className="p-5 rounded-xl border border-[var(--color-gray-soft)] space-y-4"
              >
                {!isEditing ? (
                  <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                    <div className="flex gap-4 items-start">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-[var(--color-gray-soft)] shrink-0">
                        <ResilientImage
                          src={p.photoUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-base text-[var(--color-forest)]">
                          {p.name}
                        </div>
                        <div className="text-xs text-[var(--color-taupe)]">{p.crfa}</div>
                        <div className="text-xs font-medium text-[var(--color-ink)] mt-1">
                          {p.specialtySummary}
                        </div>
                        <p className="text-xs text-[var(--color-ink-muted)] mt-1.5 leading-relaxed">
                          {p.bio}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditProf(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-forest)] text-white text-xs font-medium hover:opacity-90 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-beige)] text-xs font-medium text-[var(--color-forest)] cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Trocar foto</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => handleUploadProfPhoto(e.target.files?.[0], p.id)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleProfActive(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                          p.active
                            ? 'border-emerald-200 text-emerald-800 bg-emerald-50'
                            : 'border-slate-200 text-slate-600 bg-slate-50'
                        }`}
                      >
                        {p.active ? 'Ativo no site' : 'Inativo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProf(p)}
                        title="Excluir ou inativar profissional"
                        className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={saveEditProf} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[var(--color-forest)]">
                        Editando: {p.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProfId(null);
                          setEditProfForm(null);
                        }}
                        className="p-1 rounded hover:bg-[var(--color-beige)] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Nome completo *"
                        value={editProfForm.name}
                        onChange={(e) => setEditProfForm({ ...editProfForm, name: e.target.value })}
                        className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Resumo de especialidades"
                        value={editProfForm.specialtySummary}
                        onChange={(e) =>
                          setEditProfForm({ ...editProfForm, specialtySummary: e.target.value })
                        }
                        className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                      />
                      <input
                        type="text"
                        placeholder="CRFa"
                        value={editProfForm.crfa}
                        onChange={(e) => setEditProfForm({ ...editProfForm, crfa: e.target.value })}
                        className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                      />
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Biografia / Apresentação profissional"
                      value={editProfForm.bio}
                      onChange={(e) => setEditProfForm({ ...editProfForm, bio: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="URL ou caminho da foto"
                        value={editProfForm.photoUrl}
                        onChange={(e) =>
                          setEditProfForm({ ...editProfForm, photoUrl: e.target.value })
                        }
                        className="flex-1 h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-xs"
                      />
                      <label className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-[var(--color-beige)] text-xs font-medium text-[var(--color-forest)] cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Enviar nova foto</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => handleUploadProfPhoto(e.target.files?.[0], 'edit')}
                        />
                      </label>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[var(--color-forest)] mb-2">
                        Especialidades atendidas por este profissional:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {specialties.map((sp) => {
                          const checked = editProfForm.specialtyIds.includes(sp.id);
                          return (
                            <label
                              key={sp.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer ${
                                checked
                                  ? 'bg-[var(--color-beige)] border-[var(--color-forest)] text-[var(--color-forest)] font-medium'
                                  : 'border-[var(--color-gray-soft)] text-[var(--color-ink-muted)]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...editProfForm.specialtyIds, sp.id]
                                    : editProfForm.specialtyIds.filter((id) => id !== sp.id);
                                  setEditProfForm({ ...editProfForm, specialtyIds: next });
                                }}
                                className="accent-[var(--color-forest)]"
                              />
                              <span>{sp.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProfId(null);
                          setEditProfForm(null);
                        }}
                        className="px-4 py-2 rounded-xl border border-[var(--color-gray-soft)] text-xs cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--color-forest)] text-white text-xs font-medium cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Salvar profissional</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={createProf} className="pt-5 border-t border-[var(--color-gray-soft)] space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-forest)]">
            Cadastrar novo profissional
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Nome completo *"
              value={newProf.name}
              onChange={(e) => setNewProf({ ...newProf, name: e.target.value })}
              className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
            />
            <input
              type="text"
              placeholder="Especialidades resumidas"
              value={newProf.specialtySummary}
              onChange={(e) => setNewProf({ ...newProf, specialtySummary: e.target.value })}
              className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
            />
            <input
              type="text"
              placeholder="CRFa (opcional)"
              value={newProf.crfa}
              onChange={(e) => setNewProf({ ...newProf, crfa: e.target.value })}
              className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
            />
          </div>
          <textarea
            rows={2}
            placeholder="Descrição / apresentação profissional"
            value={newProf.bio}
            onChange={(e) => setNewProf({ ...newProf, bio: e.target.value })}
            className="w-full p-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-gray-soft)] text-xs font-medium text-[var(--color-forest)] cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{newProf.photoUrl ? 'Foto selecionada' : 'Enviar foto'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleUploadProfPhoto(e.target.files?.[0], 'create')}
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--color-forest)] text-white text-xs font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar profissional</span>
            </button>
          </div>
        </form>
      </div>

      {/* SPECIALTIES */}
      <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-forest)]">
            Especialidades e Áreas de Atuação
          </h2>
          <p className="text-xs text-[var(--color-ink-muted)] mt-1">
            Edite todos os textos, ícone, ordem de exibição, status de confirmação ou visibilidade.
          </p>
        </div>

        <div className="divide-y divide-[var(--color-gray-soft)] border border-[var(--color-gray-soft)] rounded-xl">
          {specialties.map((s) => {
            const isEditing = editingSpecId === s.id && editSpecForm;
            return (
              <div key={s.id} className="p-4">
                {!isEditing ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm text-[var(--color-forest)]">
                        #{s.sortOrder} · {s.name}
                      </div>
                      <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                        {s.shortDescription}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditSpec(s)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-forest)] text-white text-xs font-medium cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toggleSpecStatus(s, {
                            confirmationStatus:
                              s.confirmationStatus === 'confirmed' ? 'to_confirm' : 'confirmed',
                          })
                        }
                        className="px-3 py-1.5 rounded-lg border border-[var(--color-gray-soft)] text-xs font-medium text-[var(--color-forest)] cursor-pointer"
                      >
                        {s.confirmationStatus === 'confirmed'
                          ? 'Confirmada pela clínica'
                          : 'A confirmar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSpecStatus(s, { active: !s.active })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                          s.active
                            ? 'border-emerald-200 text-emerald-800 bg-emerald-50'
                            : 'border-slate-200 text-slate-600 bg-slate-50'
                        }`}
                      >
                        {s.active ? 'Visível no site' : 'Oculta'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSpec(s)}
                        title="Excluir ou ocultar especialidade"
                        className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={saveEditSpec} className="space-y-3 bg-[var(--color-beige)]/25 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[var(--color-forest)]">
                        Editando: {s.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSpecId(null);
                          setEditSpecForm(null);
                        }}
                        className="p-1 rounded hover:bg-[var(--color-beige)] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Nome *"
                        value={editSpecForm.name}
                        onChange={(e) => setEditSpecForm({ ...editSpecForm, name: e.target.value })}
                        className="sm:col-span-2 h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] bg-white text-sm"
                      />
                      <select
                        value={editSpecForm.icon}
                        onChange={(e) => setEditSpecForm({ ...editSpecForm, icon: e.target.value })}
                        className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] bg-white text-xs"
                      >
                        {SPECIALTY_ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            Ícone: {opt.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        placeholder="Ordem"
                        value={editSpecForm.sortOrder}
                        onChange={(e) =>
                          setEditSpecForm({ ...editSpecForm, sortOrder: Number(e.target.value) })
                        }
                        className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] bg-white text-sm tabular-nums"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Resumo curto *"
                      value={editSpecForm.shortDescription}
                      onChange={(e) =>
                        setEditSpecForm({ ...editSpecForm, shortDescription: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] bg-white text-sm"
                    />
                    <textarea
                      rows={2}
                      required
                      placeholder="Descrição detalhada *"
                      value={editSpecForm.fullDescription}
                      onChange={(e) =>
                        setEditSpecForm({ ...editSpecForm, fullDescription: e.target.value })
                      }
                      className="w-full p-3 rounded-xl border border-[var(--color-gray-soft)] bg-white text-sm"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Público atendido"
                        value={editSpecForm.targetAudience}
                        onChange={(e) =>
                          setEditSpecForm({ ...editSpecForm, targetAudience: e.target.value })
                        }
                        className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] bg-white text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Objetivos gerais"
                        value={editSpecForm.objectives}
                        onChange={(e) =>
                          setEditSpecForm({ ...editSpecForm, objectives: e.target.value })
                        }
                        className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] bg-white text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Como funciona"
                        value={editSpecForm.howItWorks}
                        onChange={(e) =>
                          setEditSpecForm({ ...editSpecForm, howItWorks: e.target.value })
                        }
                        className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] bg-white text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <select
                        value={editSpecForm.confirmationStatus}
                        onChange={(e) =>
                          setEditSpecForm({
                            ...editSpecForm,
                            confirmationStatus: e.target.value as 'confirmed' | 'to_confirm',
                          })
                        }
                        className="h-9 px-3 rounded-xl border border-[var(--color-gray-soft)] bg-white text-xs"
                      >
                        <option value="confirmed">Confirmada pela clínica</option>
                        <option value="to_confirm">Sujeita a confirmação</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSpecId(null);
                            setEditSpecForm(null);
                          }}
                          className="px-4 py-2 rounded-xl border border-[var(--color-gray-soft)] bg-white text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--color-forest)] text-white text-xs font-medium cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Salvar especialidade</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={createSpecialty} className="pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-forest)]">
            Adicionar nova especialidade
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Nome da especialidade *"
              value={newSpec.name}
              onChange={(e) => setNewSpec({ ...newSpec, name: e.target.value })}
              className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
            />
            <select
              value={newSpec.icon}
              onChange={(e) => setNewSpec({ ...newSpec, icon: e.target.value })}
              className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm bg-white"
            >
              {SPECIALTY_ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Ícone: {opt.label}
                </option>
              ))}
            </select>
            <select
              value={newSpec.confirmationStatus}
              onChange={(e) =>
                setNewSpec({
                  ...newSpec,
                  confirmationStatus: e.target.value as 'confirmed' | 'to_confirm',
                })
              }
              className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm bg-white"
            >
              <option value="confirmed">Confirmada pela clínica</option>
              <option value="to_confirm">Sujeita a confirmação</option>
            </select>
          </div>
          <input
            type="text"
            required
            placeholder="Resumo curto *"
            value={newSpec.shortDescription}
            onChange={(e) => setNewSpec({ ...newSpec, shortDescription: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
          />
          <textarea
            rows={2}
            required
            placeholder="Descrição detalhada *"
            value={newSpec.fullDescription}
            onChange={(e) => setNewSpec({ ...newSpec, fullDescription: e.target.value })}
            className="w-full p-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Público atendido"
              value={newSpec.targetAudience}
              onChange={(e) => setNewSpec({ ...newSpec, targetAudience: e.target.value })}
              className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
            />
            <input
              type="text"
              placeholder="Objetivos gerais"
              value={newSpec.objectives}
              onChange={(e) => setNewSpec({ ...newSpec, objectives: e.target.value })}
              className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
            />
            <input
              type="text"
              placeholder="Como funciona"
              value={newSpec.howItWorks}
              onChange={(e) => setNewSpec({ ...newSpec, howItWorks: e.target.value })}
              className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--color-forest)] text-white text-xs font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar especialidade</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export function AiAndFaqTab({
  settings,
  faqs,
  knowledge,
  aiConfigured,
  onRefresh,
}: {
  settings: SiteSettings;
  faqs: FaqItem[];
  knowledge: KnowledgeItem[];
  aiConfigured: boolean;
  onRefresh: () => Promise<void>;
}) {
  const [aiForm, setAiForm] = useState(settings.ai);
  const [msg, setMsg] = useState<string | null>(null);

  const [newKb, setNewKb] = useState({ title: '', category: 'Institucional', content: '' });
  const [editingKbId, setEditingKbId] = useState<number | null>(null);
  const [editKb, setEditKb] = useState({ title: '', category: '', content: '', active: true });

  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'Geral' });
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [editFaq, setEditFaq] = useState({
    question: '',
    answer: '',
    category: 'Geral',
    sortOrder: 10,
    active: true,
  });

  const saveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ai: aiForm }),
    });
    if (res.ok) {
      setMsg('Configurações do Assistente adaptaTO salvas.');
      await onRefresh();
    }
  };

  const addKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newKb),
    });
    if (res.ok) {
      setNewKb({ title: '', category: 'Institucional', content: '' });
      setMsg('Informação adicionada à base de conhecimento da IA.');
      await onRefresh();
    }
  };

  const saveEditKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKbId) return;
    const res = await fetch(`/api/admin/knowledge/${editingKbId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editKb),
    });
    if (res.ok) {
      setEditingKbId(null);
      setMsg('Item da base de conhecimento atualizado.');
      await onRefresh();
    }
  };

  const deleteKnowledge = async (id: number) => {
    await fetch(`/api/admin/knowledge/${id}`, { method: 'DELETE' });
    await onRefresh();
  };

  const addFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFaq),
    });
    if (res.ok) {
      setNewFaq({ question: '', answer: '', category: 'Geral' });
      setMsg('Pergunta frequente cadastrada.');
      await onRefresh();
    }
  };

  const saveEditFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaqId) return;
    const res = await fetch(`/api/admin/faqs/${editingFaqId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFaq),
    });
    if (res.ok) {
      setEditingFaqId(null);
      setMsg('Dúvida frequente atualizada.');
      await onRefresh();
    }
  };

  const deleteFaq = async (id: number) => {
    await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
    await onRefresh();
  };

  return (
    <div className="space-y-8">
      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm">
          {msg}
        </div>
      )}

      {/* AI ASSISTANT CONFIG */}
      <form
        onSubmit={saveAiConfig}
        className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-forest)] flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span>Configuração do Assistente adaptaTO (IA)</span>
            </h2>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              O provedor de IA opera no servidor seguro usando as credenciais de ambiente da
              plataforma, consultando exclusivamente a base cadastrada da clínica.
            </p>
          </div>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-lg border ${
              aiConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {aiConfigured ? 'Integração ativa no servidor' : 'Aguardando ativação ou chave de servidor'}
          </span>
        </div>

        <label className="flex items-center gap-2.5 text-sm font-medium text-[var(--color-ink)] cursor-pointer">
          <input
            type="checkbox"
            checked={aiForm.enabled}
            onChange={(e) => setAiForm({ ...aiForm, enabled: e.target.checked })}
            className="accent-[var(--color-forest)]"
          />
          <span>Ativar atendimento do Assistente adaptaTO no site</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
              Nome do assistente
            </label>
            <input
              type="text"
              value={aiForm.assistantName}
              onChange={(e) => setAiForm({ ...aiForm, assistantName: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
              Mensagem inicial de boas-vindas
            </label>
            <input
              type="text"
              value={aiForm.welcomeMessage}
              onChange={(e) => setAiForm({ ...aiForm, welcomeMessage: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
              Orientações complementares para a IA (regras clínicas de segurança permanecem sempre ativas)
            </label>
            <textarea
              rows={2}
              value={aiForm.customInstructions}
              onChange={(e) => setAiForm({ ...aiForm, customInstructions: e.target.value })}
              className="w-full p-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-forest)] text-white text-xs font-medium cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Salvar configuração da IA</span>
        </button>
      </form>

      {/* KNOWLEDGE BASE */}
      <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-forest)]">
            Base de Conhecimento Administrável da IA
          </h3>
          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
            Adicione ou edite regras da clínica, orientações de atendimento, convênios ou detalhes
            que o Assistente adaptaTO poderá informar aos pacientes.
          </p>
        </div>

        <div className="space-y-2.5">
          {knowledge.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-[var(--color-gray-soft)]"
            >
              {editingKbId === item.id ? (
                <form onSubmit={saveEditKnowledge} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={editKb.title}
                      onChange={(e) => setEditKb({ ...editKb, title: e.target.value })}
                      className="h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-sm"
                    />
                    <input
                      type="text"
                      value={editKb.category}
                      onChange={(e) => setEditKb({ ...editKb, category: e.target.value })}
                      className="h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-sm"
                    />
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={editKb.content}
                    onChange={(e) => setEditKb({ ...editKb, content: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[var(--color-gray-soft)] text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingKbId(null)}
                      className="px-3 py-1.5 rounded-lg border border-[var(--color-gray-soft)] text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[var(--color-forest)] text-white text-xs font-medium cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-[var(--color-taupe)]">{item.category}</div>
                    <div className="text-sm font-semibold text-[var(--color-forest)]">
                      {item.title}
                    </div>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-1 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingKbId(item.id);
                        setEditKb({
                          title: item.title,
                          category: item.category,
                          content: item.content,
                          active: item.active,
                        });
                      }}
                      aria-label="Editar item"
                      className="p-1.5 rounded-lg text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteKnowledge(item.id)}
                      aria-label="Excluir item"
                      className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={addKnowledge} className="pt-4 border-t border-[var(--color-gray-soft)] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Título da informação *"
              value={newKb.title}
              onChange={(e) => setNewKb({ ...newKb, title: e.target.value })}
              className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
            />
            <input
              type="text"
              placeholder="Categoria (ex.: Agendamento, Convênios)"
              value={newKb.category}
              onChange={(e) => setNewKb({ ...newKb, category: e.target.value })}
              className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
            />
          </div>
          <textarea
            rows={2}
            required
            placeholder="Conteúdo oficial que a IA pode utilizar *"
            value={newKb.content}
            onChange={(e) => setNewKb({ ...newKb, content: e.target.value })}
            className="w-full p-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-forest)] text-white text-xs font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar à base da IA</span>
          </button>
        </form>
      </div>

      {/* FAQS */}
      <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6 space-y-5">
        <h3 className="text-lg font-semibold text-[var(--color-forest)]">
          Dúvidas Frequentes (FAQ do Site)
        </h3>

        <div className="space-y-2.5">
          {faqs.map((f) => (
            <div key={f.id} className="p-4 rounded-xl border border-[var(--color-gray-soft)]">
              {editingFaqId === f.id ? (
                <form onSubmit={saveEditFaq} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      value={editFaq.question}
                      onChange={(e) => setEditFaq({ ...editFaq, question: e.target.value })}
                      className="sm:col-span-2 h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-sm"
                    />
                    <input
                      type="text"
                      value={editFaq.category}
                      onChange={(e) => setEditFaq({ ...editFaq, category: e.target.value })}
                      className="h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-sm"
                    />
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={editFaq.answer}
                    onChange={(e) => setEditFaq({ ...editFaq, answer: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[var(--color-gray-soft)] text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingFaqId(null)}
                      className="px-3 py-1.5 rounded-lg border border-[var(--color-gray-soft)] text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[var(--color-forest)] text-white text-xs font-medium cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-[var(--color-taupe)]">{f.category}</div>
                    <div className="text-sm font-semibold text-[var(--color-forest)]">
                      {f.question}
                    </div>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-1">{f.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFaqId(f.id);
                        setEditFaq({
                          question: f.question,
                          answer: f.answer,
                          category: f.category,
                          sortOrder: f.sortOrder,
                          active: f.active,
                        });
                      }}
                      aria-label="Editar dúvida"
                      className="p-1.5 rounded-lg text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteFaq(f.id)}
                      aria-label="Excluir dúvida"
                      className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={addFaq} className="pt-4 border-t border-[var(--color-gray-soft)] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Pergunta *"
              value={newFaq.question}
              onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
              className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
            />
            <input
              type="text"
              placeholder="Categoria"
              value={newFaq.category}
              onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
              className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
            />
          </div>
          <textarea
            rows={2}
            required
            placeholder="Resposta *"
            value={newFaq.answer}
            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
            className="w-full p-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-forest)] text-white text-xs font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar dúvida</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export function ContactsAndUsersTab({
  user,
  contacts,
  users,
  professionals,
  onRefresh,
}: {
  user: AuthUser;
  contacts: ContactMessage[];
  users: AuthUser[];
  professionals: Professional[];
  onRefresh: () => Promise<void>;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'professional' as 'admin' | 'professional',
    professionalId: '',
  });

  const markContactDone = async (id: number) => {
    await fetch(`/api/admin/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'respondido' }),
    });
    await onRefresh();
  };

  const toggleUserActive = async (u: AuthUser) => {
    await fetch(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !u.active }),
    });
    setMsg(`Acesso de ${u.name} ${!u.active ? 'ativado' : 'desativado'}.`);
    await onRefresh();
  };

  const changeOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: curPass, newPassword: newPass }),
    });
    const json = await res.json();
    setMsg(json.message || json.error);
    if (res.ok) {
      setCurPass('');
      setNewPass('');
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newUser,
        professionalId: newUser.professionalId ? Number(newUser.professionalId) : null,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMsg(json.error);
      return;
    }
    setNewUser({ name: '', email: '', password: '', role: 'professional', professionalId: '' });
    setMsg('Usuário criado com sucesso.');
    await onRefresh();
  };

  return (
    <div className="space-y-8">
      {msg && (
        <div className="p-3.5 rounded-xl bg-[var(--color-white)] border border-[var(--color-sage)] text-sm text-[var(--color-forest)]">
          {msg}
        </div>
      )}

      {user.role === 'admin' && (
        <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-forest)]">
            Mensagens Recebidas pelo Site
          </h2>
          {contacts.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)]">Nenhuma mensagem recebida ainda.</p>
          ) : (
            <div className="space-y-3">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-[var(--color-gray-soft)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-semibold text-sm text-[var(--color-forest)]">
                      {c.name} ·{' '}
                      <span className="font-normal text-[var(--color-taupe)]">{c.phone}</span>
                    </div>
                    {c.subject && (
                      <div className="text-xs font-medium text-[var(--color-ink)] mt-0.5">
                        Assunto: {c.subject}
                      </div>
                    )}
                    <p className="text-xs text-[var(--color-ink-muted)] mt-1">{c.message}</p>
                  </div>
                  {c.status === 'novo' ? (
                    <button
                      type="button"
                      onClick={() => markContactDone(c.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-forest)] text-white text-xs font-medium shrink-0 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Marcar respondido</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-800 font-medium shrink-0">Respondido</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {user.role === 'admin' && (
        <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6 space-y-5">
          <h2 className="text-xl font-semibold text-[var(--color-forest)]">
            Usuários e Níveis de Acesso (RBAC)
          </h2>
          <div className="divide-y divide-[var(--color-gray-soft)] border border-[var(--color-gray-soft)] rounded-xl">
            {users.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between gap-4 text-sm">
                <div>
                  <div className="font-semibold text-[var(--color-forest)]">{u.name}</div>
                  <div className="text-xs text-[var(--color-ink-muted)]">
                    {u.email} · Perfil:{' '}
                    <strong>{u.role === 'admin' ? 'Administrador' : 'Profissional'}</strong>
                  </div>
                </div>
                {u.id !== user.id ? (
                  <button
                    type="button"
                    onClick={() => toggleUserActive(u)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                      u.active
                        ? 'border-emerald-200 text-emerald-800 bg-emerald-50'
                        : 'border-slate-200 text-slate-600 bg-slate-50'
                    }`}
                  >
                    {u.active ? 'Ativo' : 'Inativo'}
                  </button>
                ) : (
                  <span className="text-xs text-emerald-800 font-medium">Sessão atual</span>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={createUser} className="pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--color-forest)]">
              Criar acesso de equipe
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <input
                type="text"
                required
                placeholder="Nome *"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-xs"
              />
              <input
                type="email"
                required
                placeholder="E-mail *"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-xs"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Senha inicial *"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-xs"
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value as 'admin' | 'professional' })
                }
                className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-xs bg-white"
              >
                <option value="professional">Profissional (agenda própria)</option>
                <option value="admin">Administrador (acesso total)</option>
              </select>
              {newUser.role === 'professional' && (
                <select
                  value={newUser.professionalId}
                  onChange={(e) => setNewUser({ ...newUser, professionalId: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-xs bg-white"
                >
                  <option value="">Vincular profissional...</option>
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-forest)] text-white text-xs font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar usuário</span>
            </button>
          </form>
        </div>
      )}

      {/* Own Password */}
      <form
        onSubmit={changeOwnPassword}
        className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6 space-y-4 max-w-lg"
      >
        <h3 className="text-lg font-semibold text-[var(--color-forest)]">Alterar minha senha</h3>
        <input
          type="password"
          required
          placeholder="Senha atual"
          value={curPass}
          onChange={(e) => setCurPass(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Nova senha (mínimo 6 caracteres)"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[var(--color-forest)] text-white text-xs font-medium cursor-pointer"
        >
          Atualizar senha
        </button>
      </form>
    </div>
  );
}
