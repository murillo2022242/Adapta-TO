import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Lock,
  LogOut,
  Palette,
  Shield,
  Stethoscope,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';
import { VisualEditorTab } from '../components/admin/VisualEditorTab.tsx';
import {
  AiAndFaqTab,
  ContactsAndUsersTab,
  ProfessionalsAndSpecialtiesTab,
} from '../components/admin/CatalogAndAiTabs.tsx';
import { adminFetch, setAdminAuthToken } from '../utils/adminAuthFetch.ts';
import type {
  AuthUser,
  ContactMessage,
  FaqItem,
  KnowledgeItem,
  Professional,
  Specialty,
} from '../types.ts';

type AdminTab = 'visual' | 'catalog' | 'ai' | 'users';

export function AdminPage() {
  const { data, navigate, refreshData } = useClinic();

  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('visual');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);

  const loadAdminData = useCallback(async (currentUser: AuthUser) => {
    const [profRes, specRes] = await Promise.all([
      adminFetch('/api/admin/professionals'),
      adminFetch('/api/admin/specialties'),
    ]);

    if (profRes.ok) setProfessionals((await profRes.json()).professionals || []);
    if (specRes.ok) setSpecialties((await specRes.json()).specialties || []);

    if (currentUser.role === 'admin') {
      const [faqRes, kbRes, contactRes, userRes] = await Promise.all([
        adminFetch('/api/admin/faqs'),
        adminFetch('/api/admin/knowledge'),
        adminFetch('/api/admin/contacts'),
        adminFetch('/api/admin/users'),
      ]);
      if (faqRes.ok) setFaqs((await faqRes.json()).faqs || []);
      if (kbRes.ok) setKnowledge((await kbRes.json()).items || []);
      if (contactRes.ok) setContacts((await contactRes.json()).messages || []);
      if (userRes.ok) setUsers((await userRes.json()).users || []);
    } else {
      setActiveTab('users');
    }
  }, []);

  useEffect(() => {
    adminFetch('/api/auth/me')
      .then((res) => {
        if (res.status === 401) setAdminAuthToken(null);
        return res.ok ? res.json() : null;
      })
      .then((json) => {
        if (json?.user) {
          setUser(json.user);
          loadAdminData(json.user);
        }
      })
      .finally(() => setAuthLoading(false));
  }, [loadAdminData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await adminFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setLoginError(json.error || 'Falha na autenticação.');
        return;
      }
      if (json.token) {
        setAdminAuthToken(json.token);
      }
      setUser(json.user);
      setPassword('');
      setActiveTab(json.user.role === 'admin' ? 'visual' : 'users');
      await loadAdminData(json.user);
    } catch {
      setLoginError('Erro de conexão ao autenticar.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await adminFetch('/api/auth/logout', { method: 'POST' });
    setAdminAuthToken(null);
    setUser(null);
    setActiveTab('visual');
  };

  const handleRefreshAll = async () => {
    await refreshData();
    if (user) {
      await loadAdminData(user);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[var(--color-beige)] text-sm text-[var(--color-ink-muted)]">
        Verificando sessão administrativa...
      </div>
    );
  }

  if (!user) {
    return (
      <section className="min-h-[80vh] bg-[var(--color-beige)] flex items-center justify-center px-4 py-14">
        <div className="max-w-md w-full bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl p-8 space-y-6">
          <div>
            <div className="w-11 h-11 rounded-xl bg-[var(--color-beige)] text-[var(--color-forest)] flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--color-forest)]">
              Painel Administrativo Espaço Adapta T.O
            </h1>
            <p className="text-sm text-[var(--color-ink-muted)] mt-1">
              Área protegida para administração do site.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-login-email"
                className="block text-xs font-medium text-[var(--color-forest)] mb-1.5"
              >
                E-mail institucional
              </label>
              <input
                id="admin-login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="admin-login-password"
                className="block text-xs font-medium text-[var(--color-forest)] mb-1.5"
              >
                Senha
              </label>
              <input
                id="admin-login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
              />
            </div>

            {loginError && <p className="text-xs text-red-700">{loginError}</p>}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full h-11 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-90 cursor-pointer"
            >
              {loggingIn ? 'Entrando...' : 'Entrar no painel'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-forest)] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para o site público</span>
          </button>
        </div>
      </section>
    );
  }

  const unreadContactsCount = contacts.filter((c) => c.status === 'novo').length;

  const tabs: Array<{
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    adminOnly?: boolean;
    badge?: number;
  }> = [
    { id: 'visual', label: 'Modificar Site', icon: Palette, adminOnly: true },
    { id: 'catalog', label: 'Profissionais & Especialidades', icon: Stethoscope, adminOnly: true },
    { id: 'ai', label: 'IA, Base & FAQ', icon: Bot, adminOnly: true },
    {
      id: 'users',
      label: user.role === 'admin' ? 'Contatos & Usuários' : 'Minha Senha',
      icon: Shield,
      badge: user.role === 'admin' && unreadContactsCount > 0 ? unreadContactsCount : undefined,
    },
  ];

  const visibleTabs = tabs.filter((t) => !t.adminOnly || user.role === 'admin');

  return (
    <div className="min-h-[85vh] bg-[var(--color-beige)]">
      <div className="bg-[var(--color-white)] border-b border-[var(--color-gray-soft)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[var(--color-taupe)]">
              {user.role === 'admin' ? 'Administrador Geral' : 'Acesso Restrito'} · {user.email}
            </p>
            <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-forest)]">
              Olá, {user.name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl border border-[var(--color-gray-soft)] text-xs font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] cursor-pointer"
            >
              Ver site público
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-forest)] text-white text-xs font-medium hover:opacity-90 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-2 pb-3.5">
          {visibleTabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[var(--color-forest)] text-white'
                    : 'bg-[var(--color-beige)] text-[var(--color-ink-muted)] hover:text-[var(--color-forest)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--color-forest)] text-white'
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'visual' && user.role === 'admin' && data && (
          <VisualEditorTab
            settings={data.settings}
            onSaved={handleRefreshAll}
            onNavigateSection={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'catalog' && user.role === 'admin' && (
          <ProfessionalsAndSpecialtiesTab
            professionals={professionals}
            specialties={specialties}
            onRefresh={handleRefreshAll}
          />
        )}

        {activeTab === 'ai' && user.role === 'admin' && data && (
          <AiAndFaqTab
            settings={data.settings}
            faqs={faqs}
            knowledge={knowledge}
            aiConfigured={data.aiConfigured}
            onRefresh={handleRefreshAll}
          />
        )}

        {activeTab === 'users' && (
          <ContactsAndUsersTab
            user={user}
            contacts={contacts}
            users={users}
            professionals={professionals}
            onRefresh={handleRefreshAll}
          />
        )}
      </div>
    </div>
  );
}
