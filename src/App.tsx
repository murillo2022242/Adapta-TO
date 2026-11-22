/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Suspense, lazy } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext.tsx';
import { Layout } from './components/Layout.tsx';
import { FloatingWidgets } from './components/FloatingWidgets.tsx';
import { HomePage } from './pages/HomePage.tsx';

const AboutPage = lazy(() =>
  import('./pages/AboutPage.tsx').then((m) => ({ default: m.AboutPage }))
);
const SpecialtiesPage = lazy(() =>
  import('./pages/SpecialtiesPage.tsx').then((m) => ({ default: m.SpecialtiesPage }))
);
const BookingPage = lazy(() =>
  import('./pages/BookingPage.tsx').then((m) => ({ default: m.BookingPage }))
);
const FaqPage = lazy(() =>
  import('./pages/FaqPage.tsx').then((m) => ({ default: m.FaqPage }))
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage.tsx').then((m) => ({ default: m.ContactPage }))
);
const PrivacyPage = lazy(() =>
  import('./pages/PrivacyPage.tsx').then((m) => ({ default: m.PrivacyPage }))
);
const AdminPage = lazy(() =>
  import('./pages/AdminPage.tsx').then((m) => ({ default: m.AdminPage }))
);

function RouteLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-[#FAF9FC] text-sm text-[var(--color-forest)]">
      <div className="w-6 h-6 rounded-full border-2 border-[var(--color-sage)] border-t-[var(--color-forest)] animate-spin" />
      <span>Carregando página...</span>
    </div>
  );
}

function AppRouter() {
  const { loading, error, currentPath, navigate, refreshData } = useClinic();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[var(--color-beige)] text-sm text-[var(--color-forest)]">
        <div className="w-7 h-7 rounded-full border-2 border-[var(--color-sage)] border-t-[var(--color-forest)] animate-spin" />
        <span className="tracking-wide">Carregando Espaço Adapta T.O...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-beige)] px-4 text-center">
        <p className="text-base font-medium text-[var(--color-forest)] mb-3">{error}</p>
        <button
          type="button"
          onClick={() => refreshData()}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium cursor-pointer"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Admin route renders its own clean workspace shell
  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <AdminPage />
      </Suspense>
    );
  }

  const renderPage = () => {
    if (currentPath === '/' || currentPath === '') return <HomePage />;
    if (currentPath === '/sobre') return <AboutPage />;
    if (currentPath === '/especialidades') return <SpecialtiesPage />;
    if (currentPath.startsWith('/especialidades/')) {
      const slug = currentPath.replace('/especialidades/', '').replace(/\/$/, '');
      return <SpecialtiesPage selectedSlug={slug} />;
    }
    if (currentPath === '/profissionais') return <HomePage />;
    if (currentPath === '/agendamento') return <BookingPage />;
    if (currentPath === '/duvidas') return <FaqPage />;
    if (currentPath === '/contato') return <ContactPage />;
    if (currentPath === '/privacidade') return <PrivacyPage />;

    return (
      <section className="max-w-[720px] mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-normal text-[var(--color-forest)] mb-3">
          Página não encontrada
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)] mb-6">
          O endereço acessado não existe ou foi movido.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium cursor-pointer"
        >
          Voltar para a página inicial
        </button>
      </section>
    );
  };

  return (
    <Layout>
      <Suspense fallback={<RouteLoadingFallback />}>{renderPage()}</Suspense>
      <FloatingWidgets />
    </Layout>
  );
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err: unknown) {
    console.error('App render error:', err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9FC] px-6 text-center text-[#1F2937]">
          <h1 className="font-display text-2xl font-bold mb-2">Espaço Adapta T.O</h1>
          <p className="text-sm text-[#4B5563] max-w-md mb-6">
            Ocorreu uma falha temporária ao exibir a página. Clique abaixo para recarregar.
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.removeItem('adaptato_bootstrap_cache_v10');
              } catch {
                // ignore
              }
              window.location.reload();
            }}
            className="px-6 py-3 rounded-xl bg-[#C95874] text-white text-sm font-semibold cursor-pointer"
          >
            Recarregar site
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <ClinicProvider>
        <AppRouter />
      </ClinicProvider>
    </AppErrorBoundary>
  );
}
