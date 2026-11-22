import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext.tsx';
import { ResilientImage, SpecialtyIcon } from '../components/ClinicIcon.tsx';
import { HeroStage3D, Reveal3D, ScrollDepthFrame, Tilt3DCard } from '../components/Motion3D.tsx';
import type { Specialty } from '../types.ts';

type ServiceFilter = 'todas' | 'sensorial_motor' | 'comunicacao' | 'emocional_aprendizagem' | 'nutricao_rotina';

const SERVICE_FILTERS: Array<{ id: ServiceFilter; label: string }> = [
  { id: 'todas', label: 'Todas' },
  { id: 'sensorial_motor', label: 'Sensorial e Motor' },
  { id: 'comunicacao', label: 'Comunicação e Música' },
  { id: 'emocional_aprendizagem', label: 'Emocional e Escolar' },
  { id: 'nutricao_rotina', label: 'Nutrição e Rotina' },
];

function matchesServiceFilter(spec: Specialty, filter: ServiceFilter): boolean {
  if (filter === 'todas') return true;
  const hay = `${spec.name} ${spec.targetAudience} ${spec.shortDescription}`.toLowerCase();
  if (filter === 'sensorial_motor') return /ocupacional|psicomotricidade|fisioterapia|motor|sensorial/.test(hay);
  if (filter === 'comunicacao') return /fonoaudiologia|musicoterapia|comunica|linguagem|m[uú]sica/.test(hay);
  if (filter === 'emocional_aprendizagem') return /psicologia|psicopedagogia|aprendizagem|emocional/.test(hay);
  if (filter === 'nutricao_rotina') return /nutri|alimentar|acompanhamento|terap[eê]utico/.test(hay);
  return true;
}

const TEA_CARDS = [
  {
    title: 'Neurodesenvolvimento',
    description:
      'Cada criança percebe e responde ao mundo no seu próprio ritmo — respeitar esse tempo é o ponto de partida.',
    icon: Brain,
  },
  {
    title: 'Comunicação e Vínculo',
    description:
      'Apoiamos a fala, a comunicação alternativa e as trocas afetivas para fortalecer os laços no dia a dia.',
    icon: Users,
  },
  {
    title: 'Sensorialidade e Rotina',
    description:
      'Ambientes previsíveis e estímulos dosados trazem tranquilidade, foco e segurança emocional.',
    icon: Heart,
  },
  {
    title: 'Potencialidades',
    description:
      'Partimos dos interesses naturais e talentos de cada pessoa para construir autonomia com leveza.',
    icon: BookOpen,
  },
];

const JOURNEY_STEPS = [
  {
    step: '1',
    title: 'Conversa inicial e acolhimento',
    description:
      'Você agenda pelo site ou WhatsApp e nossa equipe orienta os primeiros passos com calma.',
  },
  {
    step: '2',
    title: 'Avaliação cuidadosa',
    description:
      'Escutamos a família e conhecemos a criança para entender suas necessidades e potenciais.',
  },
  {
    step: '3',
    title: 'Plano terapêutico integrado',
    description:
      'Unimos as especialidades certas em metas práticas para a casa, a escola e a vida diária.',
  },
];

const APPROACHES = [
  {
    id: 'aba',
    acronym: 'ABA',
    name: 'Análise do Comportamento Aplicada',
    summary: 'Aprendizagem gradual de habilidades sociais, comunicativas e de autonomia.',
    details:
      'Baseada em evidências científicas, a ABA observa como cada criança aprende melhor e transforma metas grandes em conquistas possíveis no cotidiano, sempre respeitando o bem-estar e o vínculo.',
    focus: 'Comunicação funcional, autonomia diária e regulação comportamental',
  },
  {
    id: 'esdm',
    acronym: 'ESDM · Denver',
    name: 'Modelo Denver de Intervenção Precoce',
    summary: 'Desenvolvimento infantil pela brincadeira compartilhada na primeira infância.',
    details:
      'Voltado especialmente para crianças pequenas, o Modelo Denver transforma momentos naturais de brincadeira e afeto em oportunidades ricas de linguagem, imitação e interação social.',
    focus: 'Primeira infância, atenção compartilhada e linguagem inicial',
  },
  {
    id: 'caa',
    acronym: 'CAA',
    name: 'Comunicação Alternativa e Aumentativa',
    summary: 'Recursos visuais e sistemas que ampliam a expressão e a compreensão.',
    details:
      'Utilizamos pranchas, figuras e recursos digitais personalizados para dar voz, reduzir frustrações e apoiar a fala e a autonomia comunicativa em casa e na escola.',
    focus: 'Expressão de desejos, escolhas e participação social',
  },
  {
    id: 'is',
    acronym: 'Integração Sensorial',
    name: 'Integração Sensorial de Ayres',
    summary: 'Salas equipadas para ajudar o cérebro a organizar estímulos táteis e motores.',
    details:
      'Por meio de atividades lúdicas orientadas em ambientes preparados, auxiliamos a criança a lidar com sons, texturas, movimento e equilíbrio com mais conforto e segurança.',
    focus: 'Conforto sensorial, equilíbrio, coordenação e atenção',
  },
  {
    id: 'pediasuit',
    acronym: 'PediaSuit',
    name: 'Protocolo PediaSuit',
    summary: 'Treinamento motor estruturado com veste terapêutica para postura e força.',
    details:
      'Realizado com acompanhamento fisioterapêutico individualizado, favorece alinhamento corporal, ganho de força muscular, controle motor e confiança nos movimentos.',
    focus: 'Força muscular, alinhamento postural e coordenação motora',
  },
];

function renderHeroHeadline(title: string) {
  const teaIndex = title.indexOf('TEA');
  if (teaIndex >= 0) {
    return (
      <>
        {title.slice(0, teaIndex)}
        <span className="text-[var(--color-forest)]">{title.slice(teaIndex)}</span>
      </>
    );
  }
  return title;
}

export function HomePage() {
  const { data, navigate, goToBooking, buildWhatsAppUrl } = useClinic();
  const content = data?.settings.content;
  const images = data?.settings.images;
  const contact = data?.settings.contact;
  const specialties = data?.specialties || [];

  const gallerySlides = useMemo(() => {
    const list =
      images?.galleryImages && images.galleryImages.length > 0
        ? images.galleryImages
        : [
            images?.aboutSessionImage || '',
            images?.heroImage || '',
            images?.aboutSpaceImage || '',
          ];
    return list.filter(Boolean);
  }, [images]);

  const [slideIdx, setSlideIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const safeSlideIdx = gallerySlides.length > 0 ? slideIdx % gallerySlides.length : 0;

  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('todas');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [activeApproachId, setActiveApproachId] = useState<string>(APPROACHES[0].id);

  const [mapUnit, setMapUnit] = useState<'matriz' | 'filial'>('matriz');
  const [showMap, setShowMap] = useState(false);
  const [quickFormOpen, setQuickFormOpen] = useState(false);

  // Quick Contact Form State
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickMessage, setQuickMessage] = useState('');
  const [quickLgpd, setQuickLgpd] = useState(false);
  const [quickSending, setQuickSending] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [quickSuccess, setQuickSuccess] = useState<string | null>(null);
  const [lastSubmittedWhatsappText, setLastSubmittedWhatsappText] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSpecialty) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedSpecialty(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedSpecialty]);

  const filteredSpecialties = useMemo(
    () => specialties.filter((spec) => matchesServiceFilter(spec, serviceFilter)),
    [specialties, serviceFilter]
  );

  const activeApproach = useMemo(
    () => APPROACHES.find((a) => a.id === activeApproachId) || APPROACHES[0],
    [activeApproachId]
  );

  const differentials =
    content?.differentials && content.differentials.length > 0
      ? content.differentials
      : [
          {
            title: 'Atendimento Humanizado',
            description:
              'Respeito, acolhimento e empatia para cada família em todas as etapas do cuidado.',
          },
          {
            title: 'Equipe Multidisciplinar',
            description:
              'Profissionais especializados trabalhando juntos com foco integral em cada criança e jovem.',
          },
          {
            title: 'Atendimento Personalizado',
            description:
              'Estratégias adaptadas para as necessidades, ritmo e potencialidades de cada paciente.',
          },
        ];

  const heroTitle =
    content?.heroTitle || 'Clínica Multidisciplinar Especializada em TEA';

  const historyParagraphs = (content?.aboutHistory || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const visibleHistoryParagraphs = historyExpanded
    ? historyParagraphs
    : historyParagraphs.slice(0, 2);

  const phoneLines = (contact?.phone || '(65) 99989-3202 · (65) 99233-0091')
    .split('·')
    .map((p) => p.trim())
    .filter(Boolean);

  const addressLines = (
    contact?.address ||
    'Matriz: Rua Major Gama, 950, Centro Sul - Cuiabá/MT | Filial: Rua Barão de Melgaço, 2350, Edifício Barão Center, Sala 104, Centro Sul - Cuiabá/MT'
  )
    .split('|')
    .map((a) => a.trim())
    .filter(Boolean);

  const mapQuery =
    mapUnit === 'matriz'
      ? 'Rua Major Gama, 950, Centro Sul, Cuiabá, MT'
      : 'Rua Barão de Melgaço, 2350, Centro Sul, Cuiabá, MT';
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const mapExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  const scrollToSection = (sectionId: string, fallbackRoute: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(fallbackRoute);
    }
  };

  const handleQuickContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError(null);
    setQuickSuccess(null);

    const trimmedName = quickName.trim();
    const trimmedPhone = quickPhone.trim();
    const digits = trimmedPhone.replace(/\D/g, '');
    const trimmedMessage = quickMessage.trim();

    if (trimmedName.length < 2) {
      setQuickError('Por favor, informe seu nome completo.');
      return;
    }
    if (digits.length < 10) {
      setQuickError('Por favor, informe um telefone ou WhatsApp válido com DDD.');
      return;
    }
    if (trimmedMessage.length < 5) {
      setQuickError('Escreva uma breve mensagem para que possamos ajudar.');
      return;
    }
    if (!quickLgpd) {
      setQuickError('Por favor, concorde com o tratamento de dados conforme a LGPD.');
      return;
    }

    const whatsappText = `Olá, Espaço Adapta T.O! Meu nome é ${trimmedName} (${trimmedPhone}).\n\nMensagem: ${trimmedMessage}`;
    const whatsappUrl = buildWhatsAppUrl(whatsappText);

    setQuickSending(true);
    setLastSubmittedWhatsappText(whatsappText);

    // Trigger WhatsApp redirect synchronously while user gesture is active (no window.open)
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          subject: 'Mensagem via Página Inicial (WhatsApp)',
          message: trimmedMessage,
          lgpdConsent: true,
        }),
      });
    } catch {
      // Redirect to WhatsApp already proceeded; keep non-blocking
    } finally {
      setQuickSending(false);
    }

    setQuickSuccess('Redirecionando para o WhatsApp da clínica com a sua mensagem!');
    setQuickName('');
    setQuickPhone('');
    setQuickMessage('');
    setQuickLgpd(false);
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="adaptato-hero-bg border-b border-[var(--color-gray-soft)]">
        <div className="max-w-[1220px] mx-auto px-5 sm:px-6 pt-10 pb-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6">
              <p className="text-sm font-medium text-[var(--color-forest)] mb-3">
                {content?.heroKicker || 'Espaço Adapta T.O · Cuiabá/MT'}
              </p>

              <h1 className="font-display text-[2rem] sm:text-[2.75rem] lg:text-[3.15rem] font-extrabold leading-[1.1] tracking-tight text-[var(--color-ink)] mb-4">
                {renderHeroHeadline(heroTitle)}
              </h1>

              <p className="text-base sm:text-[17px] text-[var(--color-ink-muted)] leading-[1.7] mb-8 max-w-xl">
                {content?.heroSubtitle ||
                  'Acompanhamento multidisciplinar humanizado e baseado em evidências para fortalecer a autonomia, o vínculo e a qualidade de vida de crianças, adolescentes e suas famílias.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 mb-9">
                <button
                  type="button"
                  onClick={() => goToBooking()}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[var(--color-forest)] text-white text-sm sm:text-base font-semibold hover:opacity-92 transition-all shadow-[0_12px_28px_-12px_rgba(201,88,116,0.6)] whitespace-nowrap cursor-pointer"
                >
                  <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{content?.heroPrimaryButton || 'Agendar Avaliação'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('nossos-servicos', '/especialidades')}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white border border-slate-300 text-[var(--color-ink)] text-sm sm:text-base font-semibold hover:border-[var(--color-forest)]/60 hover:text-[var(--color-forest)] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>{content?.heroSecondaryButton || 'Conhecer Nossos Serviços'}</span>
                </button>
              </div>

              <div className="pt-5 border-t border-slate-200/90 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[var(--color-ink-muted)]">
                <span className="inline-flex items-center gap-1.5 text-[var(--color-ink)]">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-forest)] shrink-0" aria-hidden="true" />
                  <span>Desde 2019 em Cuiabá/MT</span>
                </span>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span>2 Unidades no Centro Sul</span>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span className="tabular-nums">{specialties.length || 9} Especialidades Integradas</span>
              </div>
            </div>

            <div className="lg:col-span-6 py-2">
              <HeroStage3D
                topBadgeTitle="Integração Sensorial · T.O."
                topBadgeSubtitle="ABA · ESDM · CAA · PediaSuit"
                bottomCardTitle="Cuidado Multidisciplinar em TEA"
                bottomCardSubtitle="Cuidado calmo, humano e personalizado em Cuiabá/MT"
              >
                <div className="p-2 sm:p-2.5 rounded-3xl bg-[var(--color-white)] border border-[var(--color-gray-soft)] shadow-[0_24px_56px_-26px_rgba(24,34,53,0.2)]">
                  <div className="rounded-[18px] overflow-hidden aspect-[4/3] sm:aspect-[16/11] bg-[var(--color-beige)]">
                    <ResilientImage
                      src={images?.heroImage || '/assets/aistudio/frente_0dccb97b.jpg'}
                      alt="Fachada acolhedora do Espaço Adapta T.O em Cuiabá"
                      fallbackTitle={content?.clinicName || 'Espaço Adapta T.O'}
                      priority
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-3 pt-3 pb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-ink-muted)]">
                    <span>Estrutura planejada para conforto sensorial e segurança</span>
                    <span className="font-semibold text-[var(--color-forest)] tabular-nums">
                      Seg à Sex · 8h às 18h
                    </span>
                  </div>
                </div>
              </HeroStage3D>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ACOLHIMENTO E DIFERENCIAIS */}
      <section className="bg-[var(--color-white)] py-16 sm:py-22">
        <div className="max-w-[1160px] mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <p className="text-sm font-medium text-[var(--color-forest)] mb-2">
                  {content?.differentialsKicker || 'Nossa Missão e Diferenciais'}
                </p>
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight leading-tight mb-3.5">
                  {content?.differentialsTitle || 'Cuidado pensado para acalmar, acolher e desenvolver'}
                </h2>
                <p className="text-[15.5px] sm:text-base text-[var(--color-ink-muted)] leading-[1.7] max-w-2xl">
                  {content?.aboutMission ||
                    'Promover o desenvolvimento integral de pessoas com TEA através de intervenções terapêuticas especializadas, respeitando a individualidade e potencializando as habilidades de cada pessoa.'}
                </p>
              </div>

              <div className="divide-y divide-[var(--color-gray-soft)] border-y border-[var(--color-gray-soft)]">
                {differentials.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="py-4 sm:py-5">
                    <h3 className="font-display text-base sm:text-lg font-bold text-[var(--color-ink)] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Reveal3D className="lg:col-span-5" delayMs={80} variant="flip-right">
              <Tilt3DCard maxTiltDeg={3.2}>
                <div className="rounded-2xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)] overflow-hidden grid grid-cols-2 divide-x divide-y divide-[var(--color-gray-soft)]">
                  <div className="p-6 sm:p-7">
                    <div className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tabular-nums">
                      2019
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[var(--color-forest)] mt-1">
                      Ano de fundação
                    </div>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-1.5 leading-relaxed">
                      Trajetória consolidada em Cuiabá/MT.
                    </p>
                  </div>

                  <div className="p-6 sm:p-7">
                    <div className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--color-forest)] tabular-nums">
                      {specialties.length || 9}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[var(--color-ink)] mt-1">
                      Especialidades
                    </div>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-1.5 leading-relaxed">
                      Equipe integrada em plano único.
                    </p>
                  </div>

                  <div className="p-6 sm:p-7">
                    <div className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tabular-nums">
                      2
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[var(--color-forest)] mt-1">
                      Unidades Centro Sul
                    </div>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-1.5 leading-relaxed">
                      Major Gama e Edifício Barão Center.
                    </p>
                  </div>

                  <div className="p-6 sm:p-7">
                    <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#4B7F5A] tabular-nums">
                      5
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[var(--color-ink)] mt-1">
                      Abordagens clínicas
                    </div>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-1.5 leading-relaxed">
                      ABA, ESDM, CAA, Integração Sensorial e PediaSuit.
                    </p>
                  </div>
                </div>
              </Tilt3DCard>
            </Reveal3D>
          </div>
        </div>
      </section>

      {/* 3. O QUE É TEA? */}
      <section
        id="o-que-e-tea"
        className="bg-[var(--color-beige)] py-16 sm:py-22 border-t border-[var(--color-gray-soft)]"
      >
        <div className="max-w-[1160px] mx-auto px-5 sm:px-6">
          <div className="max-w-3xl mb-10">
            <p className="text-sm font-medium text-[var(--color-forest)] mb-2">
              Informação com respeito e clareza
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight mb-3.5">
              O que é TEA?
            </h2>
            <p className="text-[15.5px] sm:text-base text-[var(--color-ink-muted)] leading-[1.7]">
              O Transtorno do Espectro Autista (TEA) influencia a forma como cada pessoa se comunica,
              interage e sente os estímulos do ambiente.{' '}
              <strong className="font-semibold text-[var(--color-ink)]">
                Cada criança e adolescente é único
              </strong>{' '}
              — por isso nosso plano terapêutico nasce da escuta à família.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEA_CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Reveal3D key={card.title} delayMs={idx * 65} variant="depth-card">
                  <Tilt3DCard className="h-full" maxTiltDeg={4}>
                    <div className="h-full bg-[var(--color-white)] rounded-2xl border border-[var(--color-gray-soft)] p-6 adaptato-preserve-3d">
                      <div className="w-10 h-10 rounded-xl adaptato-soft-tint text-[var(--color-forest)] flex items-center justify-center mb-4 adaptato-z-lift">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <h3 className="font-display text-base font-bold text-[var(--color-ink)] mb-1.5">
                        {card.title}
                      </h3>
                      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </Tilt3DCard>
                </Reveal3D>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. NOSSOS SERVIÇOS (COM FILTRO RÁPIDO PARA LEITURA LEVE) */}
      <section
        id="nossos-servicos"
        className="bg-[var(--color-white)] py-16 sm:py-22 border-t border-[var(--color-gray-soft)]"
      >
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-[var(--color-forest)] mb-2">
                {content?.specialtiesSectionKicker || 'Atendimento multidisciplinar'}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight mb-2.5">
                {content?.specialtiesSectionTitle || 'Nossos Serviços'}
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
                Filtre pela necessidade da sua família ou clique em uma especialidade para abrir os detalhes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/especialidades')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-forest)] hover:underline whitespace-nowrap shrink-0 self-start md:self-auto cursor-pointer"
            >
              <span>Ver catálogo completo</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div
            role="group"
            aria-label="Filtrar especialidades por área"
            className="flex flex-wrap gap-2 mb-8"
          >
            {SERVICE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setServiceFilter(f.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                  serviceFilter === f.id
                    ? 'bg-[var(--color-forest)] border-[var(--color-forest)] text-white shadow-xs'
                    : 'bg-[var(--color-beige)] border-[var(--color-gray-soft)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-sage)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div
            key={serviceFilter}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 adaptato-slide-3d"
          >
            {filteredSpecialties.map((spec, idx) => (
              <Reveal3D key={spec.id} delayMs={(idx % 3) * 55} variant="depth-card">
                <Tilt3DCard className="h-full" maxTiltDeg={3.8}>
                  <button
                    type="button"
                    onClick={() => setSelectedSpecialty(spec)}
                    className="w-full h-full group bg-[var(--color-beige)] hover:bg-[var(--color-white)] rounded-2xl p-5 sm:p-6 text-left border border-[var(--color-gray-soft)] hover:border-[var(--color-forest)]/50 luxury-card cursor-pointer flex flex-col justify-between focus-visible:outline-none adaptato-preserve-3d"
                  >
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-[var(--color-white)] border border-[var(--color-gray-soft)] text-[var(--color-forest)] flex items-center justify-center mb-4 group-hover:adaptato-soft-tint transition-colors adaptato-z-lift">
                        <SpecialtyIcon name={spec.icon} className="w-5 h-5" />
                      </div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-[var(--color-ink)] mb-1.5 leading-snug">
                        {spec.name}
                      </h3>
                      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed line-clamp-3">
                        {spec.shortDescription}
                      </p>
                    </div>
                    <span className="mt-4 pt-3 border-t border-[var(--color-gray-soft)] inline-flex items-center justify-between gap-1 text-xs font-semibold text-[var(--color-forest)] w-full">
                      <span>Ver objetivos e detalhes</span>
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    </span>
                  </button>
                </Tilt3DCard>
              </Reveal3D>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NOSSA HISTÓRIA (LEITURA FLUÍDA E EXPANSÍVEL) */}
      <section
        id="sobre-nos"
        className="bg-[var(--color-beige)] py-16 sm:py-22 border-t border-[var(--color-gray-soft)]"
      >
        <div className="max-w-[1160px] mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-5 space-y-5">
              <ScrollDepthFrame maxAngle={4.5}>
                <Tilt3DCard maxTiltDeg={3} enableSheen={false}>
                  <div className="p-2 rounded-3xl bg-[var(--color-white)] border border-[var(--color-gray-soft)] shadow-[0_20px_48px_-26px_rgba(24,34,53,0.18)]">
                    <div className="rounded-[18px] overflow-hidden aspect-[4/3] bg-slate-100">
                      <ResilientImage
                        src={
                          images?.aboutSpaceImage ||
                          '/src/assets/images/clinic_space_accueil_1795193185344.jpg'
                        }
                        alt="Recepção acolhedora do Espaço Adapta T.O em Cuiabá"
                        fallbackTitle="Espaço Adapta T.O"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </Tilt3DCard>
              </ScrollDepthFrame>

              <div className="divide-y divide-slate-200/80 border-y border-slate-200/80 text-sm">
                <div className="py-3 flex items-center justify-between gap-4">
                  <span className="text-[var(--color-ink-muted)]">Fundação</span>
                  <span className="font-semibold text-[var(--color-ink)] tabular-nums">
                    2019 · Cuiabá/MT
                  </span>
                </div>
                <div className="py-3 flex items-center justify-between gap-4">
                  <span className="text-[var(--color-ink-muted)]">Direção Técnica</span>
                  <span className="font-semibold text-[var(--color-ink)]">
                    Sumara Najla · T.O.
                  </span>
                </div>
                <div className="py-3 flex items-center justify-between gap-4">
                  <span className="text-[var(--color-ink-muted)]">Gestão Administrativa</span>
                  <span className="font-semibold text-[var(--color-ink)]">Sâmara Ribeiro</span>
                </div>
              </div>
            </div>

            <Reveal3D className="lg:col-span-7" variant="horizon">
              <p className="text-sm font-medium text-[var(--color-forest)] mb-2">
                {content?.aboutTeamKicker || 'Desde 2019 cuidando de famílias'}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight mb-5">
                Nossa História
              </h2>

              <div className="space-y-4 text-[15.5px] sm:text-base text-[var(--color-ink-muted)] leading-[1.78] max-w-[65ch]">
                {visibleHistoryParagraphs.map((paragraph, idx) => {
                  if (idx === 0 && paragraph.startsWith('Sou Sumara Najla, Terapeuta Ocupacional,')) {
                    return (
                      <p key={idx}>
                        <strong className="text-[var(--color-ink)] font-semibold">
                          Sou Sumara Najla, Terapeuta Ocupacional,
                        </strong>{' '}
                        {paragraph.replace('Sou Sumara Najla, Terapeuta Ocupacional,', '').trim()}
                      </p>
                    );
                  }
                  return <p key={idx}>{paragraph}</p>;
                })}
              </div>

              {historyParagraphs.length > 2 && (
                <button
                  type="button"
                  onClick={() => setHistoryExpanded((prev) => !prev)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-forest)] hover:underline cursor-pointer"
                >
                  <span>
                    {historyExpanded ? 'Recolher texto' : 'Continuar lendo nossa trajetória'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      historyExpanded ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
              )}

              <blockquote className="mt-7 py-5 border-y border-slate-200 max-w-[65ch]">
                <p className="text-base italic text-[var(--color-ink)] leading-relaxed">
                  &ldquo;
                  {content?.aboutNotice?.includes('Sumara Najla')
                    ? content.aboutNotice.split('—')[0].trim()
                    : 'Sou grata a cada profissional que faz parte do nosso corpo clínico e a cada família que confia em nós. Seguimos firmes nessa missão, guiadas por Deus.'}
                  &rdquo;
                </p>
                <footer className="mt-2.5 text-xs font-semibold text-[var(--color-forest)]">
                  Sumara Najla · Fundadora do Espaço Adapta T.O
                </footer>
              </blockquote>
            </Reveal3D>
          </div>
        </div>
      </section>

      {/* 6. NOSSOS AMBIENTES E ESPAÇOS */}
      <section
        id="nossos-espacos"
        className="bg-[var(--color-white)] py-16 sm:py-22 border-t border-slate-200/75"
      >
        <div className="max-w-[1160px] mx-auto px-5 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-9">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-[var(--color-forest)] mb-2">
                Conforto sensorial e segurança
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight mb-2.5">
                Nossos Ambientes e Espaços
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
                Salas planejadas com iluminação suave, integração sensorial e organização visual acolhedora.
              </p>
            </div>

            {gallerySlides.length > 1 && (
              <div className="flex items-center gap-2 self-start md:self-auto">
                {gallerySlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSlideDirection(idx >= safeSlideIdx ? 'next' : 'prev');
                      setSlideIdx(idx);
                    }}
                    aria-label={`Ver ambiente ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === safeSlideIdx
                        ? 'w-7 bg-[var(--color-forest)]'
                        : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {gallerySlides.length > 0 && (
            <ScrollDepthFrame maxAngle={4}>
              <div className="relative rounded-3xl overflow-hidden shadow-[0_22px_50px_-24px_rgba(24,34,53,0.2)] bg-slate-100 aspect-[4/3] sm:aspect-[16/9] border border-slate-200/80">
                <div
                  key={safeSlideIdx}
                  className={`w-full h-full ${
                    slideDirection === 'next' ? 'adaptato-gallery-next' : 'adaptato-gallery-prev'
                  }`}
                >
                  <ResilientImage
                    src={gallerySlides[safeSlideIdx]}
                    alt={`Ambiente terapêutico ${safeSlideIdx + 1} do Espaço Adapta T.O`}
                    fallbackTitle="Espaço Adapta T.O"
                    className="w-full h-full object-cover"
                  />
                </div>

                {gallerySlides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSlideDirection('prev');
                        setSlideIdx(
                          (prev) => (prev - 1 + gallerySlides.length) % gallerySlides.length
                        );
                      }}
                      aria-label="Foto anterior"
                      className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 border border-slate-200 text-[var(--color-ink)] shadow-md flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSlideDirection('next');
                        setSlideIdx((prev) => (prev + 1) % gallerySlides.length);
                      }}
                      aria-label="Próxima foto"
                      className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 border border-slate-200 text-[var(--color-ink)] shadow-md flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-ink-muted)]">
                <span className="tabular-nums">
                  Ambiente {safeSlideIdx + 1} de {gallerySlides.length} · Espaço Adapta T.O Cuiabá
                </span>
                <span>Estruturas pensadas para previsibilidade e bem-estar</span>
              </div>
            </ScrollDepthFrame>
          )}
        </div>
      </section>

      {/* 7. COMO INICIAMOS & ABORDAGENS (INTERATIVO E FÁCIL DE LER) */}
      <section className="bg-[var(--color-beige)] py-16 sm:py-22 border-t border-[var(--color-gray-soft)]">
        <div className="max-w-[1160px] mx-auto px-5 sm:px-6 space-y-16">
          <div>
            <div className="max-w-2xl mb-9">
              <p className="text-sm font-medium text-[var(--color-forest)] mb-2">
                Como funciona o atendimento
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">
                Da primeira conversa ao acompanhamento contínuo
              </h2>
            </div>

            <Reveal3D variant="depth-card">
              <div className="grid grid-cols-1 md:grid-cols-3 bg-[var(--color-white)] border border-[var(--color-gray-soft)] rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[var(--color-gray-soft)]">
                {JOURNEY_STEPS.map((item) => (
                  <div key={item.step} className="p-6 sm:p-8">
                    <div className="w-8 h-8 rounded-lg adaptato-soft-tint text-[var(--color-forest)] font-display text-sm font-bold flex items-center justify-center tabular-nums mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-display text-lg font-bold text-[var(--color-ink)] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal3D>
          </div>

          {/* Seletor Interativo de Abordagens: leitura limpa sem excesso de blocos */}
          <div>
            <div className="max-w-2xl mb-8">
              <p className="text-sm font-medium text-[var(--color-forest)] mb-2">
                Prática baseada em evidências
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight mb-2.5">
                Metodologias que utilizamos
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
                Clique em uma abordagem para entender de forma simples como ela ajuda no desenvolvimento da criança.
              </p>
            </div>

            <Reveal3D variant="horizon">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                <div
                  role="tablist"
                  aria-label="Abordagens terapêuticas utilizadas"
                  className="lg:col-span-5 flex flex-col gap-2"
                >
                  {APPROACHES.map((approach) => {
                    const isActive = approach.id === activeApproach.id;
                    return (
                      <button
                        key={approach.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveApproachId(approach.id)}
                        className={`w-full text-left px-5 py-4 rounded-2xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[var(--color-white)] border-[var(--color-forest)]/60 shadow-sm'
                            : 'bg-[var(--color-white)]/65 border-[var(--color-gray-soft)] hover:bg-[var(--color-white)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className={`font-display text-sm sm:text-base font-bold ${
                              isActive ? 'text-[var(--color-forest)]' : 'text-[var(--color-ink)]'
                            }`}
                          >
                            {approach.acronym}
                          </span>
                          <ArrowRight
                            className={`w-4 h-4 shrink-0 transition-transform ${
                              isActive ? 'text-[var(--color-forest)] translate-x-0.5' : 'text-slate-400'
                            }`}
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1 line-clamp-1">
                          {approach.summary}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="lg:col-span-7 flex flex-col gap-5">
                  <Tilt3DCard className="flex-1" maxTiltDeg={2.5}>
                    <div
                      key={activeApproach.id}
                      role="tabpanel"
                      className="h-full bg-[var(--color-white)] rounded-2xl border border-[var(--color-gray-soft)] p-6 sm:p-9 flex flex-col justify-between gap-6 adaptato-slide-3d"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-forest)] mb-2">
                          {activeApproach.acronym}
                        </p>
                        <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] mb-4 leading-snug">
                          {activeApproach.name}
                        </h3>
                        <p className="text-[15.5px] sm:text-base text-[var(--color-ink-muted)] leading-[1.75]">
                          {activeApproach.details}
                        </p>
                      </div>

                      <div className="pt-5 border-t border-[var(--color-gray-soft)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold text-[var(--color-ink)]">
                            Principal foco clínico
                          </div>
                          <div className="text-sm text-[var(--color-ink-muted)] mt-0.5">
                            {activeApproach.focus}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => goToBooking()}
                          className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[var(--color-forest)] text-white text-sm font-semibold hover:opacity-92 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Agendar Avaliação</span>
                        </button>
                      </div>
                    </div>
                  </Tilt3DCard>
                </div>
              </div>
            </Reveal3D>
          </div>
        </div>
      </section>

      {/* 8. CONTATO, ENDEREÇOS, MAPA E AGENDAMENTO RÁPIDO */}
      <section
        id="contato"
        className="bg-[var(--color-white)] py-16 sm:py-22 border-t border-[var(--color-gray-soft)]"
      >
        <div className="max-w-[1160px] mx-auto px-5 sm:px-6">
          <div className="max-w-2xl mb-10">
            <p className="text-sm font-medium text-[var(--color-forest)] mb-2">
              Atendimento TEA em Cuiabá/MT
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight mb-2.5">
              Contato, Unidades e Agendamento
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
              Escolha a unidade mais próxima no Centro Sul de Cuiabá, fale pelo WhatsApp ou envie sua dúvida.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 space-y-5">
              <div className="bg-[var(--color-beige)] rounded-2xl border border-[var(--color-gray-soft)] divide-y divide-[var(--color-gray-soft)]">
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 text-[var(--color-forest)] flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-display text-sm font-bold text-[var(--color-ink)]">
                        Unidades em Cuiabá/MT
                      </h3>
                      <div className="text-sm text-[var(--color-ink-muted)] space-y-1.5 leading-relaxed">
                        {addressLines.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 text-[var(--color-forest)] flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-[var(--color-ink)]">
                        Telefones e WhatsApp
                      </h3>
                      <div className="text-sm text-[var(--color-ink-muted)] tabular-nums mt-1 space-y-0.5">
                        {phoneLines.map((ph, i) => (
                          <div key={i}>{ph}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 text-[var(--color-forest)] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-[var(--color-ink)]">
                        Horário de atendimento
                      </h3>
                      <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                        {contact?.hours || 'Seg à Sex: 8h às 18h'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 text-[var(--color-forest)] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-bold text-[var(--color-ink)]">
                      E-mail institucional
                    </h3>
                    <p className="text-sm text-[var(--color-ink-muted)] break-all mt-0.5">
                      {contact?.email || 'espacoadaptatocomercial@hotmail.com'}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#1FA855] text-white text-sm font-semibold hover:opacity-92 transition-opacity"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Falar no WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-[var(--color-beige)] rounded-2xl border border-[var(--color-gray-soft)] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-[var(--color-ink)]">
                    Mapa de Localização
                  </h3>
                  <div className="inline-flex p-1 rounded-lg bg-[var(--color-white)] border border-[var(--color-gray-soft)]">
                    <button
                      type="button"
                      onClick={() => setMapUnit('matriz')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        mapUnit === 'matriz'
                          ? 'bg-[var(--color-forest)] text-white'
                          : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                      }`}
                    >
                      Matriz
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapUnit('filial')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        mapUnit === 'filial'
                          ? 'bg-[var(--color-forest)] text-white'
                          : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                      }`}
                    >
                      Filial
                    </button>
                  </div>
                </div>

                {showMap ? (
                  <div className="rounded-xl overflow-hidden border border-[var(--color-gray-soft)] aspect-[16/10] bg-[var(--color-white)]">
                    <iframe
                      title={`Mapa Espaço Adapta T.O - ${mapUnit === 'matriz' ? 'Matriz' : 'Filial'}`}
                      src={mapEmbedUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-[var(--color-gray-soft)] bg-[var(--color-white)] p-6 sm:p-8 text-center space-y-3.5">
                    <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                      <strong className="text-[var(--color-ink)]">
                        {mapUnit === 'matriz' ? 'Matriz:' : 'Filial:'}
                      </strong>{' '}
                      {mapQuery}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)] text-[var(--color-ink)] text-xs font-semibold hover:border-[var(--color-forest)] hover:text-[var(--color-forest)] transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-forest)]" aria-hidden="true" />
                      <span>Carregar mapa na página</span>
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <a
                    href={mapExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-forest)] hover:underline"
                  >
                    <span>Abrir rota no Google Maps</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                  {showMap && (
                    <button
                      type="button"
                      onClick={() => setShowMap(false)}
                      className="text-xs text-[var(--color-taupe)] hover:text-[var(--color-ink)] cursor-pointer"
                    >
                      Ocultar mapa
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Discreet collapsible message form (collapsed by default, redirects to WhatsApp) */}
          <div className="mt-8 pt-6 border-t border-slate-200/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-[var(--color-ink-muted)]">
                Prefere enviar os detalhes por escrito antes de abrir a conversa?
              </p>
              <button
                type="button"
                onClick={() => setQuickFormOpen((prev) => !prev)}
                aria-expanded={quickFormOpen}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-forest)] transition-colors self-start sm:self-auto cursor-pointer"
              >
                <span>{quickFormOpen ? 'Ocultar formulário' : 'Enviar mensagem'}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${quickFormOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </div>

            {quickFormOpen && (
              <form
                onSubmit={handleQuickContactSubmit}
                className="mt-5 max-w-2xl bg-[var(--color-beige)] rounded-2xl border border-[var(--color-gray-soft)] p-6 sm:p-8 space-y-4 adaptato-slide-3d"
              >
                <div>
                  <h3 className="font-display text-lg font-bold text-[var(--color-ink)]">
                    Enviar mensagem pelo WhatsApp
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
                    Preencha os campos abaixo e você será redirecionado ao WhatsApp da clínica com a mensagem pronta.
                  </p>
                </div>

                {quickError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{quickError}</span>
                  </div>
                )}

                {quickSuccess && (
                  <div
                    role="status"
                    className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 space-y-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2
                        className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700"
                        aria-hidden="true"
                      />
                      <span>{quickSuccess}</span>
                    </div>
                    {lastSubmittedWhatsappText && (
                      <a
                        href={buildWhatsAppUrl(lastSubmittedWhatsappText)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1FA855] text-white text-xs font-semibold hover:opacity-92"
                      >
                        <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Abrir conversa no WhatsApp</span>
                      </a>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="home-quick-name"
                      className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5"
                    >
                      Nome do responsável *
                    </label>
                    <input
                      id="home-quick-name"
                      type="text"
                      required
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-[var(--color-ink)] focus:border-[var(--color-forest)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="home-quick-phone"
                      className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5"
                    >
                      Telefone / WhatsApp *
                    </label>
                    <input
                      id="home-quick-phone"
                      type="tel"
                      required
                      value={quickPhone}
                      onChange={(e) => setQuickPhone(e.target.value)}
                      placeholder="(65) 99999-9999"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-[var(--color-ink)] focus:border-[var(--color-forest)] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="home-quick-message"
                    className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5"
                  >
                    Mensagem / Terapia de interesse *
                  </label>
                  <textarea
                    id="home-quick-message"
                    rows={3}
                    required
                    value={quickMessage}
                    onChange={(e) => setQuickMessage(e.target.value)}
                    placeholder="Conte brevemente a idade da criança e quais especialidades ou horários você procura..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-[var(--color-ink)] focus:border-[var(--color-forest)] focus:outline-none resize-none"
                  />
                </div>

                <label className="flex items-start gap-2.5 text-xs text-[var(--color-ink-muted)] leading-relaxed cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quickLgpd}
                    onChange={(e) => setQuickLgpd(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[var(--color-forest)] focus:ring-[var(--color-forest)]"
                  />
                  <span>
                    Concordo com o tratamento dos meus dados para retorno sobre atendimento e
                    avaliação, conforme a{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/privacidade')}
                      className="underline text-[var(--color-forest)] font-medium cursor-pointer"
                    >
                      Política de Privacidade (LGPD)
                    </button>
                    .
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={quickSending}
                  className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#1FA855] text-white text-sm font-semibold hover:opacity-92 transition-opacity disabled:opacity-60 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>{quickSending ? 'Redirecionando...' : 'Enviar para o WhatsApp'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* MODAL DE DETALHES DO SERVIÇO */}
      {selectedSpecialty && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="specialty-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55"
          onClick={() => setSelectedSpecialty(null)}
        >
          <div
            className="w-full max-w-xl bg-[var(--color-white)] rounded-3xl border border-[var(--color-gray-soft)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col adaptato-slide-3d"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-6 bg-[var(--color-beige)] border-b border-[var(--color-gray-soft)]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl adaptato-soft-tint border adaptato-soft-border text-[var(--color-forest)] flex items-center justify-center shrink-0">
                  <SpecialtyIcon name={selectedSpecialty.icon} className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--color-forest)]">
                    Especialidade em TEA
                  </p>
                  <h3
                    id="specialty-modal-title"
                    className="font-display text-xl sm:text-2xl font-extrabold text-[var(--color-ink)]"
                  >
                    {selectedSpecialty.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSpecialty(null)}
                aria-label="Fechar janela de detalhes"
                className="w-9 h-9 rounded-xl bg-[var(--color-white)] border border-[var(--color-gray-soft)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-sm text-[var(--color-ink-muted)] leading-relaxed">
              <p className="text-[15px] text-[var(--color-ink)] leading-relaxed">
                {selectedSpecialty.fullDescription || selectedSpecialty.shortDescription}
              </p>

              {selectedSpecialty.targetAudience && (
                <div className="rounded-2xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)] p-4">
                  <h4 className="font-display text-xs font-bold text-[var(--color-ink)] mb-1">
                    Para quem é indicado
                  </h4>
                  <p>{selectedSpecialty.targetAudience}</p>
                </div>
              )}

              {selectedSpecialty.objectives && (
                <div className="rounded-2xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)] p-4">
                  <h4 className="font-display text-xs font-bold text-[var(--color-forest)] mb-1">
                    Objetivos terapêuticos
                  </h4>
                  <p>{selectedSpecialty.objectives}</p>
                </div>
              )}

              {selectedSpecialty.howItWorks && (
                <div className="rounded-2xl bg-[var(--color-beige)] border border-[var(--color-gray-soft)] p-4">
                  <h4 className="font-display text-xs font-bold text-[#4B7F5A] mb-1">
                    Como funciona o acompanhamento
                  </h4>
                  <p>{selectedSpecialty.howItWorks}</p>
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6 bg-[var(--color-beige)] border-t border-[var(--color-gray-soft)] flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  const specId = selectedSpecialty.id;
                  setSelectedSpecialty(null);
                  goToBooking({ specialtyId: specId });
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[var(--color-forest)] text-white text-sm font-semibold hover:opacity-92 transition-opacity cursor-pointer"
              >
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>Agendar Avaliação</span>
              </button>
              <a
                href={buildWhatsAppUrl(
                  `Olá! Gostaria de saber mais detalhes sobre o atendimento em ${selectedSpecialty.name} no Espaço Adapta T.O.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#1FA855] text-white text-sm font-semibold hover:opacity-92 transition-opacity"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>Tirar dúvidas no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
