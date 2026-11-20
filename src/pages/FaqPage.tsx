import React, { useMemo, useState } from 'react';
import { ChevronDown, MessageCircle, Search } from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';

export function FaqPage() {
  const { data, buildWhatsAppUrl, navigate } = useClinic();
  const faqs = data?.faqs || [];
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [openId, setOpenId] = useState<number | null>(faqs[0]?.id ?? null);

  const categories = useMemo(() => {
    const set = new Set(faqs.map((f) => f.category || 'Geral'));
    return ['Todas', ...Array.from(set)];
  }, [faqs]);

  const filtered = useMemo(() => {
    return faqs.filter((f) => {
      const matchCat = category === 'Todas' || f.category === category;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [faqs, category, search]);

  return (
    <div className="bg-[var(--color-beige)]">
      <section className="bg-[var(--color-white)] border-b border-[var(--color-gray-soft)]">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-16 sm:py-22">
          <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-4">
            {data?.settings.content.faqPageKicker || 'Esclarecimentos · Perguntas e respostas'}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-normal text-[var(--color-forest)] tracking-tight leading-[1.12] mb-5">
            {data?.settings.content.faqPageTitle || 'Dúvidas frequentes'}
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
            {data?.settings.content.faqPageSubtitle ||
              'Reunimos as principais orientações sobre atendimentos, funcionamento do agendamento e proteção dos seus dados na clínica adaptaTO.'}
          </p>
        </div>
      </section>

      <section className="max-w-[960px] mx-auto px-4 sm:px-6 py-12 sm:py-18">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-9">
          <div className="relative flex-1 max-w-md">
            <Search
              className="w-4 h-4 text-[var(--color-taupe)] absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <label htmlFor="faq-search" className="sr-only">
              Pesquisar dúvidas frequentes
            </label>
            <input
              id="faq-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar dúvida..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--color-white)] border border-[var(--color-gray-soft)] text-sm focus:border-[var(--color-forest)] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[var(--color-white)] border border-[var(--color-gray-soft)]">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-[var(--color-forest)] text-white'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-forest)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 rounded-[24px] bg-[var(--color-white)] border border-[var(--color-gray-soft)] text-center text-sm text-[var(--color-ink-muted)]">
            Nenhuma dúvida encontrada com este filtro.
          </div>
        ) : (
          <div className="space-y-3.5">
            {filtered.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl overflow-hidden transition-colors hover:border-[var(--color-sage)]"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="w-full px-7 py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div>
                      <span className="block text-xs text-[var(--color-taupe)] mb-1">
                        {item.category}
                      </span>
                      <span className="font-display text-lg font-medium text-[var(--color-forest)]">
                        {item.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[var(--color-forest)] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="px-7 pb-6 pt-2 text-sm text-[var(--color-ink-muted)] leading-relaxed border-t border-[var(--color-gray-soft)]/70">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-14 p-8 rounded-[24px] bg-[var(--color-white)] border border-[var(--color-gray-soft)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h2 className="font-display text-2xl font-normal text-[var(--color-forest)]">
              Ainda ficou com alguma dúvida?
            </h2>
            <p className="text-sm text-[var(--color-ink-muted)] mt-1.5">
              Converse diretamente com nossa equipe pelo WhatsApp ou envie uma mensagem pela página
              de contato.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-90"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() => navigate('/contato')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-gray-soft)] text-[var(--color-forest)] text-sm font-medium hover:bg-[var(--color-beige)] cursor-pointer"
            >
              <span>Enviar mensagem</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
