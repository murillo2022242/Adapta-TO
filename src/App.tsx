/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { MotionConfig } from 'motion/react';
import { ClinicProvider, useClinic } from './context/ClinicContext.tsx';
import { Layout } from './components/Layout.tsx';
import { FloatingWidgets } from './components/FloatingWidgets.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { SpecialtiesPage } from './pages/SpecialtiesPage.tsx';
import { ProfessionalsPage } from './pages/ProfessionalsPage.tsx';
import { BookingPage } from './pages/BookingPage.tsx';
import { FaqPage } from './pages/FaqPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { PrivacyPage } from './pages/PrivacyPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';

function AppRouter() {
  const { loading, error, currentPath, navigate, refreshData } = useClinic();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[var(--color-beige)] text-sm text-[var(--color-forest)]">
        <div className="w-7 h-7 rounded-full border-2 border-[var(--color-sage)] border-t-[var(--color-forest)] animate-spin" />
        <span className="tracking-wide">Carregando clínica adaptaTO...</span>
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
    return <AdminPage />;
  }

  const renderPage = () => {
    if (currentPath === '/' || currentPath === '') return <HomePage />;
    if (currentPath === '/sobre') return <AboutPage />;
    if (currentPath === '/especialidades') return <SpecialtiesPage />;
    if (currentPath.startsWith('/especialidades/')) {
      const slug = currentPath.replace('/especialidades/', '').replace(/\/$/, '');
      return <SpecialtiesPage selectedSlug={slug} />;
    }
    if (currentPath === '/profissionais') return <ProfessionalsPage />;
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
      {renderPage()}
      <FloatingWidgets />
    </Layout>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ClinicProvider>
        <AppRouter />
      </ClinicProvider>
    </MotionConfig>
  );
}
