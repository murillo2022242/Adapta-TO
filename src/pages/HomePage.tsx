import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Calendar, MessageCircle } from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';
import { ResilientImage, SpecialtyIcon } from '../components/ClinicIcon.tsx';

const DEFAULT_DIFFERENTIALS = [
  {
    title: 'Atendimento humanizado',
    description:
      'Escuta acolhedora, empatia e respeito à história e às particularidades de cada criança e sua família desde o primeiro contato.',
  },
  {
    title: 'Acompanhamento individualizado',
    description:
      'Planos terapêuticos construídos sob medida após avaliação clínica cuidadosa, respeitando o tempo e os interesses de cada criança.',
  },
  {
    title: 'Ambiente acolhedor',
    description:
      'Consultórios preparados para transmitir tranquilidade, conforto sensorial, ludicidade e segurança para bebês e crianças.',
  },
  {
    title: 'Profissionais qualificados',
    description:
      'Equipe dedicada à fonoaudiologia infantil, comprometida com ética profissional, atualização científica contínua e prática responsável.',
  },
  {
    title: 'Orientação às famílias',
    description:
      'Parceria transparente com pais, responsáveis e escolas para apoiar o desenvolvimento comunicativo no cotidiano da criança.',
  },
];

const CARE_JOURNEY = [
  {
    step: '01',
    title: 'Primeiro contato',
    description:
      'Os responsáveis escolhem o atendimento infantil e o melhor horário pelo site ou conversam diretamente com nossa recepção pelo WhatsApp.',
  },
  {
    step: '02',
    title: 'Avaliação cuidadosa',
    description:
      'Realizamos uma escuta acolhedora com a família e uma avaliação lúdica para compreender o momento e as necessidades da criança.',
  },
  {
    step: '03',
    title: 'Plano individualizado',
    description:
      'Estruturamos metas terapêuticas sob medida, respeitando o ritmo, a idade e os interesses reais de cada criança.',
  },
  {
    step: '04',
    title: 'Parceria contínua',
    description:
      'Compartilhamos orientações claras com pais, cuidadores e escolas para fortalecer cada conquista da criança no dia a dia.',
  },
];

const SECTION_REVEAL = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

export function HomePage() {
  const { data, navigate, goToBooking, buildWhatsAppUrl } = useClinic();
  const content = data?.settings.content;
  const images = data?.settings.images;
  const contact = data?.settings.contact;
  const specialties = (data?.specialties || []).slice(0, 6);

  const differentials =
    content?.differentials && content.differentials.length > 0
      ? content.differentials
      : DEFAULT_DIFFERENTIALS;

  const highlights = (
    content?.introHighlights || 'Avaliação infantil cuidadosa · Escuta às famílias · Respeito a cada fase'
  )
    .split('·')
    .map((h) => h.trim())
    .filter(Boolean);

  return (
    <div>
      {/* 1. Asymmetric Editorial Hero */}
      <section className="bg-[var(--color-beige)] border-b border-[var(--color-gray-soft)] overflow-hidden">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-5">
                {content?.heroKicker || 'Fonoaudiologia Infantil · Atendimento Humanizado'}
              </p>
              <h1 className="font-display text-[clamp(2.35rem,4.1vw,3.65rem)] font-normal leading-[1.09] tracking-tight text-[var(--color-forest)] mb-6">
                {content?.heroTitle ||
                  'Comunicação, desenvolvimento e cuidado em cada fase da infância.'}
              </h1>
              <p className="text-base sm:text-[17px] text-[var(--color-ink-muted)] leading-relaxed max-w-xl mb-9">
                {content?.heroSubtitle ||
                  'Na adaptaTO, acreditamos que cada criança tem seu próprio ritmo. Oferecemos atendimento fonoaudiológico infantil humanizado, individualizado e acolhedor junto à sua família.'}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => goToBooking()}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-[var(--color-forest)] text-white text-sm font-medium hover:opacity-92 transition-all duration-200 shadow-[0_14px_30px_-14px_rgba(36,48,40,0.55)] whitespace-nowrap cursor-pointer"
                >
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>{content?.heroPrimaryButton || 'Agendar atendimento'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/sobre')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[var(--color-white)] text-[var(--color-forest)] border border-[var(--color-gray-soft)] text-sm font-medium hover:border-[var(--color-sage)] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>{content?.heroSecondaryButton || 'Conheça nossa clínica'}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-10 pt-6 border-t border-[var(--color-gray-soft)] flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-ink-muted)]">
                <span>Atendimento exclusivo para crianças</span>
                <span aria-hidden="true" className="text-[var(--color-sage)]">·</span>
                <span>Acompanhamento individualizado</span>
                <span aria-hidden="true" className="text-[var(--color-sage)]">·</span>
                <button
                  type="button"
                  onClick={() => navigate('/agendamento?aba=acompanhar')}
                  className="text-[var(--color-forest)] font-medium hover:underline cursor-pointer"
                >
                  Acompanhar protocolo
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
              className="lg:col-span-6"
            >
              <div className="h-full min-h-[340px] sm:min-h-[440px] rounded-[28px] p-2.5 bg-[var(--color-white)] border border-[var(--color-gray-soft)] luxury-photo-frame">
                <div className="relative h-full w-full rounded-[20px] overflow-hidden">
                  <ResilientImage
                    src={images?.heroImage || ''}
                    alt="Sala acolhedora de atendimento fonoaudiológico da clínica adaptaTO"
                    fallbackTitle={content?.clinicName || 'Clínica adaptaTO'}
                    className="w-full h-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 via-black/20 to-transparent"
                  />
                  <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-2 text-white">
                    <div>
                      <div className="font-display text-lg font-normal leading-tight">
                        {content?.clinicName || 'adaptaTO'} Fonoaudiologia
                      </div>
                      <div className="text-xs text-white/85 mt-0.5">
                        {contact?.hours || 'Segunda a Sexta, 07h30 às 20h'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Presentation Section */}
      <motion.section
        {...SECTION_REVEAL}
        className="bg-[var(--color-white)] border-b border-[var(--color-gray-soft)]"
      >
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="p-2 rounded-[26px] bg-[var(--color-beige)]/65 border border-[var(--color-gray-soft)]">
                <div className="aspect-[4/3] rounded-[18px] overflow-hidden">
                  <ResilientImage
                    src={images?.aboutSpaceImage || ''}
                    alt="Ambiente de acolhimento da clínica adaptaTO"
                    fallbackTitle={`Espaço ${content?.clinicName || 'adaptaTO'}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
              <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-4">
                {content?.introKicker || 'Nossa proposta de cuidado'}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-normal text-[var(--color-forest)] tracking-tight leading-[1.15] mb-6">
                {content?.introTitle || 'Seu desenvolvimento merece atenção especial.'}
              </h2>
              <p className="text-base sm:text-[17px] text-[var(--color-ink-muted)] leading-relaxed mb-8 max-w-2xl">
                {content?.introText}
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-5 border-t border-[var(--color-gray-soft)] text-sm text-[var(--color-ink)]">
                {highlights.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <span aria-hidden="true" className="text-[var(--color-sage)]">
                        ·
                      </span>
                    )}
                    <span>{item}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 3. Specialties Section */}
      <motion.section
        {...SECTION_REVEAL}
        className="bg-[var(--color-beige)] border-b border-[var(--color-gray-soft)]"
      >
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-3">
                {content?.specialtiesSectionKicker || 'Áreas de atuação'}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-normal text-[var(--color-forest)] tracking-tight">
                {content?.specialtiesSectionTitle || 'Especialidades em fonoaudiologia'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/especialidades')}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-forest)] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Ver todas as especialidades</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map((spec, idx) => (
              <article
                key={spec.id}
                className="luxury-card bg-[var(--color-white)] border border-[var(--color-gray-soft)] hover:border-[var(--color-sage)] rounded-[24px] p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-beige)] text-[var(--color-forest)] flex items-center justify-center">
                      <SpecialtyIcon name={spec.icon} className="w-5 h-5" />
                    </div>
                    <span className="font-display text-sm text-[var(--color-taupe)] tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-medium text-[var(--color-forest)] mb-3">
                    {spec.name}
                  </h3>
                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-7">
                    {spec.shortDescription}
                  </p>
                </div>
                <div className="pt-4 border-t border-[var(--color-gray-soft)] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/especialidades/${spec.slug}`)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-forest)] hover:underline cursor-pointer"
                  >
                    <span>Saiba mais</span>
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  {spec.confirmationStatus === 'to_confirm' && (
                    <span className="text-xs text-[var(--color-taupe)]">Sob consulta</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 4. Care Journey (4-Step Process) */}
      <motion.section
        {...SECTION_REVEAL}
        className="bg-[var(--color-white)] border-b border-[var(--color-gray-soft)]"
      >
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 py-20 lg:py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-3">
                Como funciona o acompanhamento
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-normal text-[var(--color-forest)] tracking-tight">
                Uma jornada terapêutica clara e tranquila desde o início
              </h2>
            </div>
            <button
              type="button"
              onClick={() => goToBooking()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-gray-soft)] text-sm font-medium text-[var(--color-forest)] hover:bg-[var(--color-beige)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>Iniciar agendamento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {CARE_JOURNEY.map((item) => (
              <div
                key={item.step}
                className="pt-6 border-t border-[var(--color-sage)] flex flex-col"
              >
                <span className="font-display text-3xl font-normal text-[var(--color-taupe)] tabular-nums mb-4">
                  {item.step}
                </span>
                <h3 className="font-display text-lg font-medium text-[var(--color-forest)] mb-2.5">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 5. Differentials Section */}
      <motion.section
        {...SECTION_REVEAL}
        className="bg-[var(--color-beige)] border-b border-[var(--color-gray-soft)]"
      >
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-taupe)] mb-3">
                {content?.differentialsKicker || 'Nossos diferenciais'}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-normal text-[var(--color-forest)] tracking-tight leading-[1.15] mb-4">
                {content?.differentialsTitle || 'Um cuidado pensado para cada história'}
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
                Cada detalhe do nosso atendimento foi estruturado para oferecer serenidade, clareza e vínculo genuíno com pacientes e famílias.
              </p>
            </div>

            <div className="lg:col-span-8 bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-[24px] px-6 sm:px-10 divide-y divide-[var(--color-gray-soft)]">
              {differentials.map((item, idx) => (
                <div
                  key={idx}
                  className="py-7 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 items-baseline"
                >
                  <div className="sm:col-span-1 font-display text-sm text-[var(--color-taupe)] tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h3 className="sm:col-span-4 font-display text-lg font-medium text-[var(--color-forest)]">
                    {item.title}
                  </h3>
                  <p className="sm:col-span-7 text-sm sm:text-[15px] text-[var(--color-ink-muted)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* 6. Final Architectural CTA Section */}
      <motion.section {...SECTION_REVEAL} className="bg-[var(--color-white)]">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 py-20 lg:py-24">
          <div className="relative overflow-hidden bg-[var(--color-forest)] text-white rounded-[28px] px-7 py-14 sm:px-14 sm:py-18 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <svg
              aria-hidden="true"
              className="absolute -right-24 -top-24 w-96 h-96 text-white/10 pointer-events-none"
              viewBox="0 0 200 200"
              fill="none"
            >
              <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="1" />
              <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="1" />
              <circle cx="100" cy="100" r="35" stroke="currentColor" strokeWidth="1" />
            </svg>

            <div className="relative max-w-xl">
              <h2 className="font-display text-3xl sm:text-4xl font-normal tracking-tight mb-4">
                {content?.ctaTitle || 'Vamos dar o próximo passo juntos?'}
              </h2>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                {content?.ctaSubtitle ||
                  'Fale diretamente com nossa equipe pelo WhatsApp ou solicite seu horário pelo sistema de agendamento do site.'}
              </p>
            </div>
            <div className="relative flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[var(--color-white)] text-[var(--color-forest)] text-sm font-semibold hover:bg-[var(--color-beige)] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>{content?.ctaButtonText || 'Agende seu atendimento pelo WhatsApp'}</span>
              </a>
              <button
                type="button"
                onClick={() => goToBooking()}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>Agendar pelo site</span>
              </button>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
