import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Globe,
  Image as ImageIcon,
  KeyRound,
  LayoutTemplate,
  Lock,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Stethoscope,
  Trash2,
  Upload,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext.tsx';
import { ResilientImage } from '../ClinicIcon.tsx';
import { adminFetch } from '../../utils/adminAuthFetch.ts';
import type { SiteSettings, ThemeColors } from '../../types.ts';

interface VisualEditorTabProps {
  settings: SiteSettings;
  onSaved: () => Promise<void>;
  onNavigateSection?: (tab: 'catalog' | 'ai' | 'users') => void;
}

type EditorSubTab = 'colors' | 'photos' | 'home' | 'pages' | 'contact';

const COLOR_FIELDS: Array<{ key: keyof ThemeColors; label: string; hint: string }> = [
  { key: 'forest', label: 'Cor Principal (Botões & Destaques)', hint: 'Botões primários, links ativos e realces' },
  { key: 'sage', label: 'Cor Secundária (Realces Suaves)', hint: 'Bordas e fundos delicados em destaque' },
  { key: 'beige', label: 'Fundo Suave das Seções', hint: 'Fundo alternado das seções e formulários' },
  { key: 'white', label: 'Fundo Principal & Cards', hint: 'Cartões, menu superior e fundo branco' },
  { key: 'graySoft', label: 'Linhas & Divisores', hint: 'Bordas de cards e separadores' },
  { key: 'taupe', label: 'Cor de Apoio (Subtítulos)', hint: 'Rótulos curtos e detalhes sutis' },
  { key: 'ink', label: 'Títulos & Texto Principal', hint: 'Cor padrão dos títulos e parágrafos' },
  { key: 'inkMuted', label: 'Texto Secundário', hint: 'Descrições, legendas e notas' },
];

const THEME_PRESETS: Array<{ name: string; description: string; theme: ThemeColors }> = [
  {
    name: 'Espaço Adapta T.O',
    description: 'Coral-rosé acolhedor, azul-marinho e branco limpo',
    theme: {
      sage: '#F3D0DC',
      forest: '#E04F6D',
      beige: '#F8FAFC',
      white: '#FFFFFF',
      graySoft: '#E2E8F0',
      taupe: '#64748B',
      ink: '#182235',
      inkMuted: '#4B5563',
    },
  },
  {
    name: 'Sálvia & Bege',
    description: 'Verde-sálvia, verde-escuro e bege sereno',
    theme: {
      sage: '#A8BDA8',
      forest: '#526B5B',
      beige: '#F6F2EA',
      white: '#FFFFFF',
      graySoft: '#E9E9E5',
      taupe: '#817568',
      ink: '#243028',
      inkMuted: '#56524D',
    },
  },
  {
    name: 'Brisa Clínica',
    description: 'Azul-acinzentado suave e branco puro',
    theme: {
      sage: '#A7BFC2',
      forest: '#3A5A63',
      beige: '#F2F5F5',
      white: '#FFFFFF',
      graySoft: '#E2E7E7',
      taupe: '#6D7A7D',
      ink: '#1F2C30',
      inkMuted: '#526063',
    },
  },
  {
    name: 'Lavanda & Sálvia',
    description: 'Acolhimento suave com contraste elegante',
    theme: {
      sage: '#B6C2B5',
      forest: '#4D5B5C',
      beige: '#F6F3F2',
      white: '#FFFFFF',
      graySoft: '#E7E3E2',
      taupe: '#7E7278',
      ink: '#262A2B',
      inkMuted: '#5A5859',
    },
  },
  {
    name: 'Oceano Sereno',
    description: 'Azul-profundo calmante e névoa gelo',
    theme: {
      sage: '#C8DCE8',
      forest: '#245B7A',
      beige: '#F5F9FC',
      white: '#FFFFFF',
      graySoft: '#DCE6EE',
      taupe: '#5E7487',
      ink: '#142433',
      inkMuted: '#42586B',
    },
  },
  {
    name: 'Eucalipto & Linho',
    description: 'Verde-eucalipto fresco e linho claro',
    theme: {
      sage: '#C4DFD3',
      forest: '#2F6B55',
      beige: '#F7F8F5',
      white: '#FFFFFF',
      graySoft: '#DFE5DF',
      taupe: '#64786E',
      ink: '#1A2B24',
      inkMuted: '#465A51',
    },
  },
  {
    name: 'Ameixa Acolhedora',
    description: 'Ameixa delicada com lilás suave',
    theme: {
      sage: '#E5D1DF',
      forest: '#7A3E65',
      beige: '#FAF7F9',
      white: '#FFFFFF',
      graySoft: '#EAE1E7',
      taupe: '#7D6876',
      ink: '#281824',
      inkMuted: '#5B4755',
    },
  },
  {
    name: 'Terracota Suave',
    description: 'Terracota terrosa e pêssego leve',
    theme: {
      sage: '#F0D6CE',
      forest: '#9E4A36',
      beige: '#FBF8F6',
      white: '#FFFFFF',
      graySoft: '#ECE2DD',
      taupe: '#856B63',
      ink: '#2B1C18',
      inkMuted: '#5F4B45',
    },
  },
  {
    name: 'Índigo & Nuvem',
    description: 'Índigo sereno sobre fundo nuvem',
    theme: {
      sage: '#D3DBF0',
      forest: '#3D4E8A',
      beige: '#F6F8FC',
      white: '#FFFFFF',
      graySoft: '#E0E5F0',
      taupe: '#636D87',
      ink: '#171E36',
      inkMuted: '#46506B',
    },
  },
  {
    name: 'Mel & Oliva',
    description: 'Oliva natural e pistache suave',
    theme: {
      sage: '#DCE4C8',
      forest: '#566634',
      beige: '#F9FAF5',
      white: '#FFFFFF',
      graySoft: '#E4E7DA',
      taupe: '#727A5E',
      ink: '#222816',
      inkMuted: '#505842',
    },
  },
  {
    name: 'Rosa Chá & Grafite',
    description: 'Rosa antigo elegante e neutro limpo',
    theme: {
      sage: '#F2D8DF',
      forest: '#A84860',
      beige: '#FAF8F9',
      white: '#FFFFFF',
      graySoft: '#EAE3E5',
      taupe: '#786D71',
      ink: '#21242B',
      inkMuted: '#53565E',
    },
  },
  {
    name: 'Petróleo & Areia',
    description: 'Azul-petróleo equilibrado e areia fria',
    theme: {
      sage: '#C5E0E2',
      forest: '#1F636B',
      beige: '#F5F9F9',
      white: '#FFFFFF',
      graySoft: '#DCE6E7',
      taupe: '#5D7679',
      ink: '#14292C',
      inkMuted: '#415A5E',
    },
  },
  {
    name: 'Cacau & Baunilha',
    description: 'Cacau acolhedor e creme amêndoa',
    theme: {
      sage: '#E8DBD2',
      forest: '#6B4E3D',
      beige: '#FAF8F5',
      white: '#FFFFFF',
      graySoft: '#EAE2DC',
      taupe: '#7F6E63',
      ink: '#261D18',
      inkMuted: '#5A4D45',
    },
  },
  {
    name: 'Cobalto & Pérola',
    description: 'Azul-cobalto nítido e celeste claro',
    theme: {
      sage: '#D0DDF2',
      forest: '#28529E',
      beige: '#F7F9FC',
      white: '#FFFFFF',
      graySoft: '#DFE6F2',
      taupe: '#616E85',
      ink: '#162238',
      inkMuted: '#46536B',
    },
  },
];

const IMAGE_FIELDS: Array<{
  key: 'heroImage' | 'aboutSpaceImage' | 'aboutSessionImage' | 'specialtiesBannerImage';
  label: string;
  description: string;
}> = [
  {
    key: 'heroImage',
    label: 'Foto principal (Hero da Página Inicial)',
    description: 'Exibida no topo da página inicial ao lado do título principal.',
  },
  {
    key: 'aboutSpaceImage',
    label: 'Foto do espaço / recepção (Home e Sobre Nós)',
    description: 'Mostra o ambiente acolhedor da clínica adaptaTO.',
  },
  {
    key: 'aboutSessionImage',
    label: 'Foto da sala terapêutica (Sobre Nós)',
    description: 'Composição visual na galeria institucional.',
  },
  {
    key: 'specialtiesBannerImage',
    label: 'Foto da página de Especialidades',
    description: 'Imagem de destaque no cabeçalho de especialidades.',
  },
];

export function VisualEditorTab({ settings, onSaved, onNavigateSection }: VisualEditorTabProps) {
  const { applyThemePreview } = useClinic();

  const [subTab, setSubTab] = useState<EditorSubTab>('home');
  const [editorPassword, setEditorPassword] = useState('');
  const [editorToken, setEditorToken] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const [theme, setTheme] = useState<ThemeColors>(settings.theme);
  const [images, setImages] = useState(settings.images);
  const [content, setContent] = useState(settings.content);
  const [contact, setContact] = useState(settings.contact);

  useEffect(() => {
    setTheme(settings.theme);
    setImages(settings.images);
    setContent(settings.content);
    setContact(settings.contact);
  }, [settings]);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Change editor password state
  const [curEdPass, setCurEdPass] = useState('');
  const [newEdPass, setNewEdPass] = useState('');
  const [edPassMsg, setEdPassMsg] = useState<string | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    setUnlocking(true);
    try {
      const res = await adminFetch('/api/auth/verify-editor-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: editorPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setUnlockError(json.error || 'Senha incorreta.');
        return;
      }
      setEditorToken(json.editorToken);
      setEditorPassword('');
    } catch {
      setUnlockError('Erro ao verificar senha do editor visual.');
    } finally {
      setUnlocking(false);
    }
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    const next = { ...theme, [key]: value };
    setTheme(next);
    applyThemePreview(next);
  };

  const applyPreset = (presetTheme: ThemeColors) => {
    setTheme(presetTheme);
    applyThemePreview(presetTheme);
  };

  const handleImageUpload = async (
    key: keyof SiteSettings['images'],
    file: File | undefined
  ) => {
    if (!file || !editorToken) return;
    setSaveError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await adminFetch('/api/admin/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataUrl: reader.result,
            filename: file.name,
            editorToken,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          setSaveError(json.error || 'Erro ao enviar imagem.');
          return;
        }
        setImages((prev) => ({ ...prev, [key]: json.url }));
        setSaveMessage('Foto carregada! Clique em "Salvar alterações visuais" para publicar no site.');
      } catch {
        setSaveError('Falha ao enviar a foto.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveVisuals = async (resetTheme = false) => {
    if (!editorToken) return;
    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          images,
          editorToken,
          resetTheme,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveError(json.error || 'Erro ao salvar personalização.');
        return;
      }
      if (json.settings?.theme) {
        setTheme(json.settings.theme);
        applyThemePreview(json.settings.theme);
      }
      setSaveMessage(
        resetTheme
          ? 'Paleta padrão adaptaTO restaurada com sucesso!'
          : 'Cores e fotos do site atualizadas com sucesso!'
      );
      await onSaved();
    } catch {
      setSaveError('Erro ao salvar alterações visuais.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContentAndContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, contact }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveError(json.error || 'Erro ao salvar alterações.');
        return;
      }
      setSaveMessage('Todas as alterações do site foram salvas e publicadas!');
      await onSaved();
    } catch {
      setSaveError('Erro ao salvar textos e contatos.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEditorPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setEdPassMsg(null);
    const res = await adminFetch('/api/admin/editor-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentEditorPassword: curEdPass,
        newEditorPassword: newEdPass,
      }),
    });
    const json = await res.json();
    setEdPassMsg(json.message || json.error);
    if (res.ok) {
      setCurEdPass('');
      setNewEdPass('');
    }
  };

  const updateDifferential = (index: number, field: 'title' | 'description', value: string) => {
    const next = [...(content.differentials || [])];
    next[index] = { ...next[index], [field]: value };
    setContent({ ...content, differentials: next });
  };

  const addDifferential = () => {
    const next = [...(content.differentials || []), { title: '', description: '' }];
    setContent({ ...content, differentials: next });
  };

  const removeDifferential = (index: number) => {
    const next = (content.differentials || []).filter((_, i) => i !== index);
    setContent({ ...content, differentials: next });
  };

  const renderUnlockGate = () => (
    <form onSubmit={handleUnlock} className="mt-4 max-w-md space-y-4">
      <div className="p-4 rounded-xl bg-[var(--color-beige)]/60 border border-[var(--color-gray-soft)] text-xs text-[var(--color-ink-muted)] leading-relaxed">
        Esta área possui proteção adicional por senha para resguardar as cores oficiais e as fotos
        da clínica. Digite a senha do editor visual para liberar as alterações.
      </div>
      <div>
        <label
          htmlFor="visual-editor-pass"
          className="block text-sm font-medium text-[var(--color-forest)] mb-1.5"
        >
          Senha do editor visual
        </label>
        <input
          id="visual-editor-pass"
          type="password"
          required
          value={editorPassword}
          onChange={(e) => setEditorPassword(e.target.value)}
          placeholder="Digite a senha para editar cores e fotos"
          className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
        />
      </div>
      {unlockError && <p className="text-xs text-red-700">{unlockError}</p>}
      <button
        type="submit"
        disabled={unlocking}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-90 cursor-pointer"
      >
        <KeyRound className="w-4 h-4" />
        <span>{unlocking ? 'Verificando...' : 'Desbloquear cores e fotos'}</span>
      </button>
    </form>
  );

  const subTabs: Array<{
    id: EditorSubTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'home', label: 'Início & Diferenciais', icon: LayoutTemplate },
    { id: 'pages', label: 'Páginas & Rodapé', icon: FileText },
    { id: 'contact', label: 'Contatos & Redes Sociais', icon: Globe },
    { id: 'colors', label: 'Cores do Site', icon: Palette },
    { id: 'photos', label: 'Fotos do Site', icon: ImageIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Overview & Quick Jump Bar */}
      <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-forest)]">
              Modificação Completa do Site
            </h2>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              Edite títulos, textos, diferenciais, redes sociais, cores e fotos de todas as páginas.
            </p>
          </div>
          {onNavigateSection && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateSection('catalog')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-gray-soft)] bg-[var(--color-beige)]/50 text-xs font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Profissionais e Especialidades</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('users')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-gray-soft)] bg-[var(--color-beige)]/50 text-xs font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
              >
                <span>Mensagens & Contatos</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Sub-tab navigation */}
        <div className="mt-5 pt-4 border-t border-[var(--color-gray-soft)] flex flex-wrap gap-2">
          {subTabs.map((t) => {
            const Icon = t.icon;
            const active = subTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSubTab(t.id);
                  setSaveMessage(null);
                  setSaveError(null);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[var(--color-forest)] text-white'
                    : 'bg-[var(--color-beige)] text-[var(--color-ink-muted)] hover:text-[var(--color-forest)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}
      {saveError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          {saveError}
        </div>
      )}

      {/* SUB-TAB: COLORS */}
      {subTab === 'colors' && (
        <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--color-gray-soft)]">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-forest)] flex items-center gap-2">
                <Palette className="w-5 h-5" />
                <span>Paleta de Cores & Identidade Visual</span>
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                Personalize todas as cores do site com pré-visualização imediata em tempo real.
              </p>
            </div>
            {editorToken && (
              <button
                type="button"
                onClick={() => setEditorToken(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-gray-soft)] text-xs font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Bloquear editor visual</span>
              </button>
            )}
          </div>

          {!editorToken ? (
            renderUnlockGate()
          ) : (
            <div className="mt-6 space-y-8">
              {/* Presets */}
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-forest)] mb-3">
                  Paletas prontas (1 clique)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyPreset(preset.theme)}
                      className="text-left p-3.5 rounded-xl border border-[var(--color-gray-soft)] hover:border-[var(--color-forest)] bg-[var(--color-beige)]/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        {[
                          preset.theme.forest,
                          preset.theme.sage,
                          preset.theme.beige,
                          preset.theme.taupe,
                        ].map((hex, i) => (
                          <svg key={i} width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                            <rect
                              width="18"
                              height="18"
                              rx="4"
                              fill={hex}
                              stroke="#d4d4d0"
                              strokeWidth="1"
                            />
                          </svg>
                        ))}
                      </div>
                      <div className="text-xs font-semibold text-[var(--color-forest)]">
                        {preset.name}
                      </div>
                      <div className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Colors */}
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-forest)] mb-3">
                  Ajuste fino de cores
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {COLOR_FIELDS.map((field) => (
                    <div
                      key={field.key}
                      className="p-3.5 rounded-xl border border-[var(--color-gray-soft)] bg-[var(--color-beige)]/30 flex items-center gap-3"
                    >
                      <input
                        type="color"
                        aria-label={field.label}
                        value={theme[field.key] || '#526B5B'}
                        onChange={(e) => handleColorChange(field.key, e.target.value)}
                        className="w-10 h-10 rounded-lg border border-[var(--color-gray-soft)] cursor-pointer shrink-0 bg-transparent"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-[var(--color-forest)] leading-tight">
                          {field.label}
                        </div>
                        <div className="text-[11px] text-[var(--color-ink-muted)] mt-0.5 mb-1.5 leading-tight">
                          {field.hint}
                        </div>
                        <input
                          type="text"
                          value={theme[field.key] || ''}
                          onChange={(e) => handleColorChange(field.key, e.target.value)}
                          className="w-24 h-7 px-2 rounded border border-[var(--color-gray-soft)] bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--color-gray-soft)]">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveVisuals(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-gray-soft)] text-xs font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-forest)] cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar cores padrão adaptaTO</span>
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveVisuals(false)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-90 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Salvando...' : 'Salvar alterações visuais'}</span>
                </button>
              </div>

              <form
                onSubmit={handleChangeEditorPassword}
                className="pt-5 border-t border-[var(--color-gray-soft)] flex flex-wrap items-end gap-3"
              >
                <div>
                  <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                    Senha atual do editor
                  </label>
                  <input
                    type="password"
                    required
                    value={curEdPass}
                    onChange={(e) => setCurEdPass(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                    Nova senha do editor visual
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newEdPass}
                    onChange={(e) => setNewEdPass(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg border border-[var(--color-gray-soft)] text-xs font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
                >
                  Alterar senha do editor
                </button>
                {edPassMsg && <span className="text-xs text-[var(--color-forest)]">{edPassMsg}</span>}
              </form>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: PHOTOS */}
      {subTab === 'photos' && (
        <div className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--color-gray-soft)]">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-forest)] flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                <span>Fotografias das Páginas do Site</span>
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                Envie fotos do computador ou informe URLs de imagens para cada seção do site.
              </p>
            </div>
            {editorToken && (
              <button
                type="button"
                onClick={() => setEditorToken(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-gray-soft)] text-xs font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Bloquear editor visual</span>
              </button>
            )}
          </div>

          {!editorToken ? (
            renderUnlockGate()
          ) : (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {IMAGE_FIELDS.map((imgField) => (
                  <div
                    key={imgField.key}
                    className="p-4 rounded-xl border border-[var(--color-gray-soft)] space-y-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[var(--color-forest)]">
                        {imgField.label}
                      </div>
                      <p className="text-xs text-[var(--color-ink-muted)]">{imgField.description}</p>
                    </div>
                    <div className="aspect-[16/9] rounded-xl overflow-hidden border border-[var(--color-gray-soft)] bg-[var(--color-beige)]">
                      <ResilientImage
                        src={images[imgField.key]}
                        alt={imgField.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={images[imgField.key]}
                        onChange={(e) =>
                          setImages((prev) => ({ ...prev, [imgField.key]: e.target.value }))
                        }
                        placeholder="URL ou caminho da imagem"
                        className="flex-1 h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] text-xs"
                      />
                      <label className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-[var(--color-beige)] border border-[var(--color-gray-soft)] text-xs font-medium text-[var(--color-forest)] hover:bg-[var(--color-gray-soft)]/50 cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Enviar foto</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => handleImageUpload(imgField.key, e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-[var(--color-gray-soft)]">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveVisuals(false)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-90 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Salvando...' : 'Salvar fotos do site'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: HOME & DIFFERENTIALS */}
      {subTab === 'home' && (
        <form
          onSubmit={handleSaveContentAndContact}
          className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6 sm:p-7 space-y-6"
        >
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-forest)]">
              Identidade, Página Inicial & Diferenciais
            </h3>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              Edite nome da clínica, botões, títulos, subtítulos, apresentação e lista de diferenciais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Nome da Clínica (Logotipo / Título)
              </label>
              <input
                type="text"
                value={content.clinicName}
                onChange={(e) => setContent({ ...content, clinicName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Texto do Botão do Menu Superior
              </label>
              <input
                type="text"
                value={content.headerCtaText}
                onChange={(e) => setContent({ ...content, headerCtaText: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>

            <div className="md:col-span-2 pt-2 border-t border-[var(--color-gray-soft)]">
              <div className="text-xs font-semibold text-[var(--color-taupe)] mb-3">
                Seção Principal (Hero)
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Etiqueta superior (Hero)
              </label>
              <input
                type="text"
                value={content.heroKicker}
                onChange={(e) => setContent({ ...content, heroKicker: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Título Principal (Hero)
              </label>
              <input
                type="text"
                value={content.heroTitle}
                onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Subtítulo Principal (Hero)
              </label>
              <textarea
                rows={2}
                value={content.heroSubtitle}
                onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                className="w-full p-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Botão Primário (Hero)
              </label>
              <input
                type="text"
                value={content.heroPrimaryButton}
                onChange={(e) => setContent({ ...content, heroPrimaryButton: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Botão Secundário (Hero)
              </label>
              <input
                type="text"
                value={content.heroSecondaryButton}
                onChange={(e) => setContent({ ...content, heroSecondaryButton: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>

            <div className="md:col-span-2 pt-2 border-t border-[var(--color-gray-soft)]">
              <div className="text-xs font-semibold text-[var(--color-taupe)] mb-3">
                Seção de Apresentação
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Etiqueta (Apresentação)
              </label>
              <input
                type="text"
                value={content.introKicker}
                onChange={(e) => setContent({ ...content, introKicker: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Título de Apresentação (Home)
              </label>
              <input
                type="text"
                value={content.introTitle}
                onChange={(e) => setContent({ ...content, introTitle: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Texto de Apresentação da Clínica
              </label>
              <textarea
                rows={3}
                value={content.introText}
                onChange={(e) => setContent({ ...content, introText: e.target.value })}
                className="w-full p-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Destaques da Apresentação (separe usando · )
              </label>
              <input
                type="text"
                value={content.introHighlights}
                onChange={(e) => setContent({ ...content, introHighlights: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>

            <div className="md:col-span-2 pt-2 border-t border-[var(--color-gray-soft)]">
              <div className="text-xs font-semibold text-[var(--color-taupe)] mb-3">
                Cabeçalho da Seção de Especialidades (Home)
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Etiqueta (Especialidades Home)
              </label>
              <input
                type="text"
                value={content.specialtiesSectionKicker}
                onChange={(e) =>
                  setContent({ ...content, specialtiesSectionKicker: e.target.value })
                }
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Título (Especialidades Home)
              </label>
              <input
                type="text"
                value={content.specialtiesSectionTitle}
                onChange={(e) =>
                  setContent({ ...content, specialtiesSectionTitle: e.target.value })
                }
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>

            <div className="md:col-span-2 pt-2 border-t border-[var(--color-gray-soft)]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-[var(--color-taupe)]">
                  Seção de Diferenciais
                </div>
                <button
                  type="button"
                  onClick={addDifferential}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--color-gray-soft)] text-xs font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar diferencial</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Etiqueta (Diferenciais)
              </label>
              <input
                type="text"
                value={content.differentialsKicker}
                onChange={(e) => setContent({ ...content, differentialsKicker: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Título da Seção de Diferenciais
              </label>
              <input
                type="text"
                value={content.differentialsTitle}
                onChange={(e) => setContent({ ...content, differentialsTitle: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              {(content.differentials || []).map((diff, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[var(--color-gray-soft)] bg-[var(--color-beige)]/25 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--color-taupe)] tabular-nums">
                      Diferencial {String(idx + 1).padStart(2, '0')}
                    </span>
                    {(content.differentials || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDifferential(idx)}
                        className="p-1 text-red-700 hover:bg-red-50 rounded cursor-pointer"
                        title="Remover diferencial"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Título do diferencial"
                    value={diff.title}
                    onChange={(e) => updateDifferential(idx, 'title', e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[var(--color-gray-soft)] bg-white text-sm font-medium"
                  />
                  <textarea
                    rows={2}
                    placeholder="Descrição do diferencial"
                    value={diff.description}
                    onChange={(e) => updateDifferential(idx, 'description', e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[var(--color-gray-soft)] bg-white text-xs"
                  />
                </div>
              ))}
            </div>

            <div className="md:col-span-2 pt-2 border-t border-[var(--color-gray-soft)]">
              <div className="text-xs font-semibold text-[var(--color-taupe)] mb-3">
                Chamada Final para Ação (CTA)
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Título do CTA Final
              </label>
              <input
                type="text"
                value={content.ctaTitle}
                onChange={(e) => setContent({ ...content, ctaTitle: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Texto do Botão WhatsApp (CTA)
              </label>
              <input
                type="text"
                value={content.ctaButtonText}
                onChange={(e) => setContent({ ...content, ctaButtonText: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Subtítulo do CTA Final
              </label>
              <input
                type="text"
                value={content.ctaSubtitle}
                onChange={(e) => setContent({ ...content, ctaSubtitle: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--color-gray-soft)]">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-90 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salvar página inicial'}</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB: INTERNAL PAGES & FOOTER */}
      {subTab === 'pages' && (
        <form
          onSubmit={handleSaveContentAndContact}
          className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6 sm:p-7 space-y-6"
        >
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-forest)]">
              Páginas Internas & Rodapé
            </h3>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              Altere os títulos, subtítulos e textos institucionais de todas as páginas do site.
            </p>
          </div>

          {/* Sobre Nós */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[var(--color-forest)] border-b border-[var(--color-gray-soft)] pb-2">
              Página Sobre a Clínica (/sobre)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Etiqueta (Sobre Nós)
                </label>
                <input
                  type="text"
                  value={content.aboutKicker}
                  onChange={(e) => setContent({ ...content, aboutKicker: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Título Principal (Sobre Nós)
                </label>
                <input
                  type="text"
                  value={content.aboutPageTitle}
                  onChange={(e) => setContent({ ...content, aboutPageTitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Aviso Editável (faixa informativa no topo — deixe vazio para ocultar)
                </label>
                <input
                  type="text"
                  value={content.aboutNotice}
                  onChange={(e) => setContent({ ...content, aboutNotice: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  História da Clínica
                </label>
                <textarea
                  rows={3}
                  value={content.aboutHistory}
                  onChange={(e) => setContent({ ...content, aboutHistory: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Missão
                </label>
                <textarea
                  rows={2}
                  value={content.aboutMission}
                  onChange={(e) => setContent({ ...content, aboutMission: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Visão
                </label>
                <textarea
                  rows={2}
                  value={content.aboutVision}
                  onChange={(e) => setContent({ ...content, aboutVision: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Valores (separe por ponto e vírgula ;)
                </label>
                <input
                  type="text"
                  value={content.aboutValues}
                  onChange={(e) => setContent({ ...content, aboutValues: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Filosofia de Atendimento
                </label>
                <textarea
                  rows={2}
                  value={content.aboutPhilosophy}
                  onChange={(e) => setContent({ ...content, aboutPhilosophy: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Etiqueta da Seção Equipe (Sobre)
                </label>
                <input
                  type="text"
                  value={content.aboutTeamKicker}
                  onChange={(e) => setContent({ ...content, aboutTeamKicker: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Título da Seção Equipe (Sobre)
                </label>
                <input
                  type="text"
                  value={content.aboutTeamTitle}
                  onChange={(e) => setContent({ ...content, aboutTeamTitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Cabeçalhos das demais páginas */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-semibold text-[var(--color-forest)] border-b border-[var(--color-gray-soft)] pb-2">
              Cabeçalhos das Demais Páginas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Especialidades */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Especialidades — Etiqueta
                </label>
                <input
                  type="text"
                  value={content.specialtiesPageKicker}
                  onChange={(e) =>
                    setContent({ ...content, specialtiesPageKicker: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Especialidades — Título
                </label>
                <input
                  type="text"
                  value={content.specialtiesPageTitle}
                  onChange={(e) =>
                    setContent({ ...content, specialtiesPageTitle: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Especialidades — Descrição de abertura
                </label>
                <textarea
                  rows={2}
                  value={content.specialtiesPageSubtitle}
                  onChange={(e) =>
                    setContent({ ...content, specialtiesPageSubtitle: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>

              {/* Profissionais */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Profissionais — Etiqueta
                </label>
                <input
                  type="text"
                  value={content.professionalsPageKicker}
                  onChange={(e) =>
                    setContent({ ...content, professionalsPageKicker: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Profissionais — Título
                </label>
                <input
                  type="text"
                  value={content.professionalsPageTitle}
                  onChange={(e) =>
                    setContent({ ...content, professionalsPageTitle: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Profissionais — Subtítulo
                </label>
                <input
                  type="text"
                  value={content.professionalsPageSubtitle}
                  onChange={(e) =>
                    setContent({ ...content, professionalsPageSubtitle: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>

              {/* Agendamento */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Agendamento — Etiqueta
                </label>
                <input
                  type="text"
                  value={content.bookingPageKicker}
                  onChange={(e) => setContent({ ...content, bookingPageKicker: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Agendamento — Título
                </label>
                <input
                  type="text"
                  value={content.bookingPageTitle}
                  onChange={(e) => setContent({ ...content, bookingPageTitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Agendamento — Subtítulo
                </label>
                <input
                  type="text"
                  value={content.bookingPageSubtitle}
                  onChange={(e) => setContent({ ...content, bookingPageSubtitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>

              {/* Dúvidas */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Dúvidas Frequentes — Etiqueta
                </label>
                <input
                  type="text"
                  value={content.faqPageKicker}
                  onChange={(e) => setContent({ ...content, faqPageKicker: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Dúvidas Frequentes — Título
                </label>
                <input
                  type="text"
                  value={content.faqPageTitle}
                  onChange={(e) => setContent({ ...content, faqPageTitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Dúvidas Frequentes — Subtítulo
                </label>
                <input
                  type="text"
                  value={content.faqPageSubtitle}
                  onChange={(e) => setContent({ ...content, faqPageSubtitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>

              {/* Contato */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Contato — Etiqueta
                </label>
                <input
                  type="text"
                  value={content.contactPageKicker}
                  onChange={(e) => setContent({ ...content, contactPageKicker: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Contato — Título
                </label>
                <input
                  type="text"
                  value={content.contactPageTitle}
                  onChange={(e) => setContent({ ...content, contactPageTitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Contato — Subtítulo
                </label>
                <input
                  type="text"
                  value={content.contactPageSubtitle}
                  onChange={(e) => setContent({ ...content, contactPageSubtitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>

              {/* Privacidade */}
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Privacidade — Etiqueta
                </label>
                <input
                  type="text"
                  value={content.privacyPageKicker}
                  onChange={(e) => setContent({ ...content, privacyPageKicker: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Privacidade — Título
                </label>
                <input
                  type="text"
                  value={content.privacyPageTitle}
                  onChange={(e) => setContent({ ...content, privacyPageTitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Privacidade — Subtítulo
                </label>
                <input
                  type="text"
                  value={content.privacyPageSubtitle}
                  onChange={(e) => setContent({ ...content, privacyPageSubtitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-semibold text-[var(--color-forest)] border-b border-[var(--color-gray-soft)] pb-2">
              Textos do Rodapé
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Descrição da Clínica no Rodapé
                </label>
                <input
                  type="text"
                  value={content.footerTagline}
                  onChange={(e) => setContent({ ...content, footerTagline: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Linha Inferior Direita do Rodapé
                </label>
                <input
                  type="text"
                  value={content.footerBottomText}
                  onChange={(e) => setContent({ ...content, footerBottomText: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--color-gray-soft)]">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-90 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salvar páginas e rodapé'}</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB: CONTACTS & SOCIALS */}
      {subTab === 'contact' && (
        <form
          onSubmit={handleSaveContentAndContact}
          className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-6 sm:p-7 space-y-6"
        >
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-forest)]">
              Contatos, Horários, WhatsApp & Redes Sociais
            </h3>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              Mantenha atualizados os canais oficiais exibidos no rodapé, página de contato e links
              de agendamento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Endereço Completo da Clínica
              </label>
              <input
                type="text"
                value={contact.address}
                onChange={(e) => setContact({ ...contact, address: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                WhatsApp Oficial (somente números com DDD, ex.: 11999990000)
              </label>
              <input
                type="text"
                value={contact.whatsapp}
                onChange={(e) =>
                  setContact({ ...contact, whatsapp: e.target.value.replace(/\D/g, '') })
                }
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Telefone de Contato
              </label>
              <input
                type="text"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                E-mail de Contato
              </label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Horário de Funcionamento (texto exibido no site)
              </label>
              <input
                type="text"
                value={contact.hours}
                onChange={(e) => setContact({ ...contact, hours: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                Fuso horário da agenda
              </label>
              <select
                value={contact.timezone}
                onChange={(e) => setContact({ ...contact, timezone: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm bg-[var(--color-white)]"
              >
                <option value="America/Sao_Paulo">Brasília (America/Sao_Paulo)</option>
                <option value="America/Manaus">Manaus (America/Manaus)</option>
                <option value="America/Fortaleza">Fortaleza (America/Fortaleza)</option>
                <option value="America/Belem">Belém (America/Belem)</option>
              </select>
            </div>
          </div>

          <hr className="border-[var(--color-gray-soft)]" />

          <div>
            <h4 className="text-sm font-semibold text-[var(--color-forest)] mb-3">
              Redes Sociais (deixe em branco para ocultar o ícone no rodapé)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Instagram (URL completa)
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/adaptato"
                  value={contact.instagram}
                  onChange={(e) => setContact({ ...contact, instagram: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  Facebook (URL completa)
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/adaptato"
                  value={contact.facebook}
                  onChange={(e) => setContact({ ...contact, facebook: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  LinkedIn (URL completa)
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/company/adaptato"
                  value={contact.linkedin}
                  onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  YouTube (URL completa)
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/@adaptato"
                  value={contact.youtube || ''}
                  onChange={(e) => setContact({ ...contact, youtube: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-forest)] mb-1">
                  TikTok (URL completa)
                </label>
                <input
                  type="url"
                  placeholder="https://tiktok.com/@adaptato"
                  value={contact.tiktok || ''}
                  onChange={(e) => setContact({ ...contact, tiktok: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--color-gray-soft)] text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2.5 text-sm text-[var(--color-ink)] cursor-pointer">
              <input
                type="checkbox"
                checked={contact.whatsappAutoRedirect}
                onChange={(e) =>
                  setContact({ ...contact, whatsappAutoRedirect: e.target.checked })
                }
                className="accent-[var(--color-forest)]"
              />
              <span>
                Exibir botão de envio para WhatsApp após o paciente registrar solicitação de
                agendamento
              </span>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--color-gray-soft)]">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-90 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salvar contatos e redes sociais'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
