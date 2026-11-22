import type {
  DayAvailabilitySummary,
  FaqItem,
  LiveScheduleDay,
  Professional,
  SiteSettings,
  SlotDetail,
  Specialty,
  WeeklySchedule,
} from '../types.ts';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  theme: {
    sage: '#E6DCEB',
    forest: '#C95874',
    beige: '#FAF9FC',
    white: '#FFFFFF',
    graySoft: '#E5E7EB',
    taupe: '#64748B',
    ink: '#1F2937',
    inkMuted: '#4B5563',
  },
  content: {
    clinicName: 'Espaço Adapta T.O',
    headerCtaText: 'Agendar Avaliação',
    heroKicker: 'Espaço Adapta T.O · Cuiabá/MT',
    heroTitle: 'Clínica Multidisciplinar Especializada em TEA',
    heroSubtitle:
      'Espaço Adapta T.O – Atendimento humanizado, personalizado e baseado em evidências. Desenvolvimento, autonomia e qualidade de vida para cada pessoa.',
    heroPrimaryButton: 'Agendar Avaliação',
    heroSecondaryButton: 'Conhecer Nossos Serviços',
    introKicker: 'Nossa Missão e Diferenciais',
    introTitle: 'Sobre o Espaço Adapta T.O',
    introText:
      'Somos um espaço acolhedor dedicado ao atendimento especializado de pessoas com Transtorno do Espectro Autista (TEA) em Cuiabá/MT. Caminhamos ao lado de cada família com respeito, escuta ativa e intervenções baseadas em evidências científicas.',
    introHighlights:
      'Atendimento Humanizado · Equipe Multidisciplinar · Atendimento Personalizado',
    specialtiesSectionKicker: 'Áreas de atuação multidisciplinar',
    specialtiesSectionTitle: 'Nossos Serviços',
    differentialsKicker: 'Nossa Missão e Diferenciais',
    differentialsTitle: 'Cuidado completo para o desenvolvimento e autonomia',
    differentials: [
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
    ],
    ctaTitle: 'Agende sua Consulta',
    ctaSubtitle:
      'Nossa equipe está pronta para acolher sua família com calma e respeito. Solicite uma avaliação inicial ou envie uma mensagem pelo WhatsApp.',
    ctaButtonText: 'Agendar Avaliação',
    aboutKicker: 'Institucional · Nossa História e Equipe',
    aboutPageTitle:
      'Cuidado especializado, humanizado e baseado em evidências para pessoas com TEA em Cuiabá.',
    aboutHistory:
      'Sou Sumara Najla, Terapeuta Ocupacional, e tudo começou em 2019, quando decidi alugar uma pequena sala com o propósito de atender crianças com atraso no desenvolvimento. Desde o início, o foco sempre foi oferecer um cuidado acolhedor, técnico e individualizado, respeitando a singularidade de cada criança.\n\nCom o passar do tempo e o crescimento da demanda, percebemos que apenas uma especialidade não era suficiente para atender todas as necessidades das famílias. Assim, o espaço começou a se ampliar: primeiro com a chegada da Psicologia, depois com a Fonoaudiologia, dando origem a uma equipe multidisciplinar integrada.\n\nEm um determinado momento, o crescimento exigiu um passo ainda maior. Foi então que convidei minha irmã e atual sócia, Sâmara Ribeiro, para assumir a coordenação administrativa da clínica, enquanto eu permanecia dedicada ao atendimento clínico e à supervisão técnica. Essa parceria foi essencial para estruturar e fortalecer ainda mais o nosso propósito.\n\nHoje, o Espaço Adapta T.O conta com duas unidades e um corpo clínico completo com diversas especialidades: Psicologia, Terapia Ocupacional, Fonoaudiologia, Psicomotricidade, Psicopedagogia, Fisioterapia, Nutrição, Musicoterapia e Acompanhamento Terapêutico. Cada detalhe da clínica continua sendo pensado com cuidado, ética e dedicação para promover desenvolvimento, autonomia e qualidade de vida às famílias que atendemos.',
    aboutMission:
      'Promover o desenvolvimento integral de pessoas com TEA através de intervenções terapêuticas especializadas, respeitando a individualidade e potencializando as habilidades de cada pessoa.',
    aboutVision:
      'Ser referência em atendimento TEA e clínica de autismo em Cuiabá, construindo evolução contínua, autonomia e confiança junto às famílias.',
    aboutValues:
      'Atendimento humanizado e respeitoso; Equipe multidisciplinar integrada; Prática baseada em evidências científicas (ABA, ESDM, CAA, IS e PediaSuit); Atendimento personalizado; Ética e parceria com as famílias.',
    aboutPhilosophy:
      'Cada pessoa com TEA é única, com suas próprias características, habilidades e necessidades. Por isso, nosso atendimento é sempre personalizado, respeitoso e planejado em equipe multidisciplinar.',
    aboutNotice:
      'Sou grata a cada profissional que faz parte do nosso corpo clínico e a cada família que confia em nós. Seguimos firmes nessa missão, guiadas por Deus. — Sumara Najla, Fundadora',
    aboutTeamKicker: 'Corpo clínico multidisciplinar',
    aboutTeamTitle: 'Nossa História e Equipe',
    specialtiesPageKicker: 'Atendimento multidisciplinar em TEA',
    specialtiesPageTitle: 'Nossos Serviços',
    specialtiesPageSubtitle:
      'Contamos com 9 especialidades integradas para oferecer acompanhamento terapêutico completo, humanizado e personalizado para crianças e pessoas com TEA em Cuiabá.',
    professionalsPageKicker: 'Equipe clínica',
    professionalsPageTitle: 'Nossa Equipe',
    professionalsPageSubtitle:
      'Conheça os profissionais do Espaço Adapta T.O, suas áreas de atuação, formação e horários disponíveis.',
    bookingPageKicker: 'Agendamento Online · Espaço Adapta T.O',
    bookingPageTitle: 'Agende sua Consulta',
    bookingPageSubtitle:
      'Escolha a especialidade desejada e fale diretamente com nossa equipe pelo WhatsApp para agendar sua avaliação.',
    faqPageKicker: 'Esclarecimentos · Perguntas e respostas',
    faqPageTitle: 'Dúvidas Frequentes',
    faqPageSubtitle:
      'Reunimos as principais orientações para pais e responsáveis sobre avaliação inicial, terapias em TEA e agendamentos no Espaço Adapta T.O.',
    contactPageKicker: 'Atendimento e unidades em Cuiabá/MT',
    contactPageTitle: 'Entre em Contato',
    contactPageSubtitle:
      'Estamos prontos para ajudar sua família. Entre em contato conosco para agendar uma avaliação ou esclarecer suas dúvidas.',
    privacyPageKicker: 'Transparência e segurança · LGPD',
    privacyPageTitle: 'Política de Privacidade',
    privacyPageSubtitle:
      'Tratamento de dados pessoais do Espaço Adapta T.O em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).',
    footerTagline:
      'Clínica multidisciplinar especializada em atendimento TEA em Cuiabá-MT. Cuidado calmo, humanizado e baseado em evidências.',
    footerBottomText:
      'Espaço Adapta T.O · Cuiabá/MT · Dados tratados conforme a LGPD',
  },
  images: {
    heroImage: '/assets/aistudio/frente_0dccb97b.jpg',
    aboutSpaceImage: '/src/assets/images/clinic_space_accueil_1795193185344.jpg',
    aboutSessionImage: '/src/assets/images/sensory_integration_room_1795309877103.jpg',
    specialtiesBannerImage: '/src/assets/images/hero_clinic_speech_therapy_1795193184901.jpg',
    galleryImages: [
      '/src/assets/images/sensory_integration_room_1795309877103.jpg',
      '/assets/aistudio/frente_0dccb97b.jpg',
      '/src/assets/images/clinic_space_accueil_1795193185344.jpg',
      '/src/assets/images/hero_clinic_speech_therapy_1795193184901.jpg',
    ],
  },
  contact: {
    address:
      'Matriz: Rua Major Gama, 950, Centro Sul - Cuiabá/MT | Filial: Rua Barão de Melgaço, 2350, Edifício Barão Center, Sala 104, Centro Sul - Cuiabá/MT',
    phone: '(65) 99989-3202 · (65) 99233-0091',
    whatsapp: '5565999893202',
    email: 'espacoadaptatocomercial@hotmail.com',
    hours: 'Seg à Sex: 8h às 18h',
    instagram: 'https://instagram.com',
    facebook: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
    whatsappAutoRedirect: true,
    timezone: 'America/Sao_Paulo',
  },
  ai: {
    enabled: true,
    assistantName: 'Assistente Adapta T.O',
    welcomeMessage:
      'Olá! Sou o assistente virtual inteligente do Espaço Adapta T.O. Pode perguntar qualquer coisa — sobre nossa clínica em Cuiabá, TEA, terapias ou qualquer outro assunto que precisar!',
    customInstructions:
      'O Espaço Adapta T.O é uma clínica especializada no atendimento multidisciplinar em Transtorno do Espectro Autista (TEA) em Cuiabá/MT (Matriz na Rua Major Gama, 950, Centro Sul e Filial na Rua Barão de Melgaço, 2350, Sala 104). Possui 9 especialidades: Psicologia, Terapia Ocupacional, Psicomotricidade, Psicopedagogia, Musicoterapia, Fonoaudiologia, Fisioterapia, Nutrição e Acompanhamento Terapêutico. Horário: Segunda a Sexta das 8h às 18h.',
  },
};

export const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  '0': { enabled: false, start: '08:00', end: '12:00', breakStart: '', breakEnd: '', slotMinutes: 30 },
  '1': { enabled: true, start: '08:00', end: '18:00', breakStart: '', breakEnd: '', slotMinutes: 30 },
  '2': { enabled: true, start: '08:00', end: '18:00', breakStart: '', breakEnd: '', slotMinutes: 30 },
  '3': { enabled: true, start: '08:00', end: '18:00', breakStart: '', breakEnd: '', slotMinutes: 30 },
  '4': { enabled: true, start: '08:00', end: '18:00', breakStart: '', breakEnd: '', slotMinutes: 30 },
  '5': { enabled: true, start: '08:00', end: '18:00', breakStart: '', breakEnd: '', slotMinutes: 30 },
  '6': { enabled: false, start: '08:00', end: '12:00', breakStart: '', breakEnd: '', slotMinutes: 30 },
};

export const PEDIATRIC_SPECIALTIES: Array<Omit<Specialty, 'id' | 'active'> & { active: number }> = [
  {
    slug: 'psicologia',
    name: 'Psicologia',
    icon: 'Brain',
    shortDescription:
      'Acompanhamento psicológico especializado para desenvolvimento emocional e comportamental.',
    fullDescription:
      'Atendimento psicológico especializado voltado ao desenvolvimento emocional, social e comportamental de crianças e pessoas com TEA, utilizando abordagens baseadas em evidências científicas como a Análise do Comportamento Aplicada (ABA).',
    targetAudience: 'Crianças e jovens no espectro autista ou com necessidades do neurodesenvolvimento.',
    objectives:
      'Desenvolver regulação emocional, habilidades sociais, autonomia comportamental e repertório adaptativo no cotidiano familiar e escolar.',
    howItWorks:
      'Inicia-se com avaliação comportamental e entrevista com os pais para elaboração do plano de intervenção individualizado.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 1,
  },
  {
    slug: 'terapia-ocupacional',
    name: 'Terapia Ocupacional',
    icon: 'Hand',
    shortDescription:
      'Desenvolvimento de habilidades para atividades da vida diária e autonomia.',
    fullDescription:
      'Intervenção especializada em Terapia Ocupacional e Integração Sensorial (IS) para promover independência nas atividades da vida diária, coordenação motora fina, regulação sensorial e participação ativa em todos os ambientes.',
    targetAudience: 'Crianças com desafios sensoriais, motores ou na autonomia do dia a dia.',
    objectives:
      'Promover independência funcional, organização sensorial, brincar estruturado e habilidades motoras para a rotina diária.',
    howItWorks:
      'Avaliação do perfil sensorial e ocupacional seguida de sessões em salas preparadas com recursos específicos de integração sensorial.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 2,
  },
  {
    slug: 'psicomotricidade',
    name: 'Psicomotricidade',
    icon: 'Activity',
    shortDescription:
      'Estímulo ao desenvolvimento motor, cognitivo e afetivo através do movimento.',
    fullDescription:
      'Acompanhamento psicomotor que integra movimento, cognição e afetividade, favorecendo a consciência corporal, equilíbrio, organização espacial e planejamento motor de forma lúdica.',
    targetAudience: 'Crianças com TEA ou atrasos no desenvolvimento psicomotor.',
    objectives:
      'Ampliar esquema corporal, equilíbrio, coordenação motora global, atenção e expressão por meio do brincar e do movimento.',
    howItWorks:
      'Sessões dinâmicas e lúdicas adaptadas às características motoras e sensoriais de cada paciente.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 3,
  },
  {
    slug: 'psicopedagogia',
    name: 'Psicopedagogia',
    icon: 'BookOpen',
    shortDescription:
      'Apoio no processo de aprendizagem e desenvolvimento de habilidades acadêmicas.',
    fullDescription:
      'Atendimento psicopedagógico voltado à identificação das potencialidades e barreiras no processo de aprendizagem, oferecendo adaptações e estratégias para alfabetização, raciocínio lógico e autonomia escolar.',
    targetAudience: 'Crianças e estudantes em idade pré-escolar e escolar.',
    objectives:
      'Desenvolver atenção, funções executivas, alfabetização, compreensão e estratégias personalizadas de aprendizagem.',
    howItWorks:
      'Avaliação psicopedagógica inicial com plano estruturado e alinhamento constante com a escola e família.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 4,
  },
  {
    slug: 'musicoterapia',
    name: 'Musicoterapia',
    icon: 'Music',
    shortDescription:
      'Uso terapêutico da música para comunicação, expressão e desenvolvimento.',
    fullDescription:
      'Utilização clínica e intencional do som, ritmo e melodia para estimular a comunicação verbal e não verbal, atenção compartilhada, socialização e expressão emocional.',
    targetAudience: 'Crianças e jovens no espectro autista ou com desafios comunicativos.',
    objectives:
      'Favorecer engajamento social, intenção comunicativa, expressão afetiva, ritmo e coordenação através de vivências musicais.',
    howItWorks:
      'Sessões terapêuticas estruturadas com instrumentos musicais, voz e jogos sonoros ajustados aos objetivos clínicos.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 5,
  },
  {
    slug: 'fonoaudiologia',
    name: 'Fonoaudiologia',
    icon: 'MessageCircle',
    shortDescription:
      'Desenvolvimento da comunicação, linguagem, interação social e motricidade orofacial.',
    fullDescription:
      'Atendimento fonoaudiológico especializado em linguagem infantil, fala, interação social, Comunicação Alternativa e Aumentativa (CAA), Modelo Denver (ESDM) e motricidade orofacial.',
    targetAudience: 'Bebês e crianças com atrasos na fala, linguagem, comunicação ou alimentação.',
    objectives:
      'Estimular linguagem compreensiva e expressiva, comunicação funcional, uso de CAA quando indicado e adequação orofacial.',
    howItWorks:
      'Avaliação fonoaudiológica individualizada com escuta aos pais e plano terapêutico alinhado à equipe multidisciplinar.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 6,
  },
  {
    slug: 'fisioterapia',
    name: 'Fisioterapia',
    icon: 'Dumbbell',
    shortDescription:
      'Fortalecimento muscular, coordenação motora e desenvolvimento físico.',
    fullDescription:
      'Atuação fisioterapêutica pediátrica com foco em fortalecimento muscular, postura, marcha, equilíbrio e recursos intensivos como o método PediaSuit.',
    targetAudience: 'Crianças com necessidades motoras, hipotonia, alterações posturais ou atraso motor.',
    objectives:
      'Desenvolver força muscular, controle postural, coordenação motora ampla e independência física funcional.',
    howItWorks:
      'Avaliação físico-funcional detalhada e sessões com equipamentos terapêuticos e exercícios lúdicos.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 7,
  },
  {
    slug: 'nutricao',
    name: 'Nutrição',
    icon: 'Apple',
    shortDescription:
      'Orientação nutricional especializada em seletividade alimentar.',
    fullDescription:
      'Acompanhamento nutricional focado em seletividade alimentar, saúde intestinal e construção gradual de novos hábitos alimentares de forma respeitosa ao perfil sensorial da criança.',
    targetAudience: 'Crianças com seletividade alimentar, restrições sensoriais ou necessidades nutricionais no TEA.',
    objectives:
      'Ampliar repertório alimentar com respeito sensorial, garantir adequação nutricional e orientar a rotina alimentar da família.',
    howItWorks:
      'Anamnese nutricional detalhada com os responsáveis e estratégias graduais de exposição e educação alimentar.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 8,
  },
  {
    slug: 'acompanhamento-terapeutico',
    name: 'Acompanhamento Terapêutico',
    icon: 'UserCheck',
    shortDescription:
      'Suporte individualizado no ambiente natural para desenvolvimento de habilidades sociais e autonomia.',
    fullDescription:
      'Acompanhamento terapêutico (AT) realizado nos ambientes naturais da criança — como escola, domicílio e contextos sociais — promovendo generalização das habilidades treinadas em clínica.',
    targetAudience: 'Crianças que necessitam de suporte individualizado na escola ou rotina cotidiana.',
    objectives:
      'Generalizar habilidades sociais, comunicativas e de autonomia no ambiente escolar e comunitário.',
    howItWorks:
      'Atuação direta do acompanhante terapêutico sob supervisão clínica integrada com a equipe multidisciplinar.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 9,
  },
];

export const DEFAULT_PROFESSIONALS_SEED: Professional[] = [
  {
    id: 1,
    name: 'Sumara Najla',
    specialtySummary: 'Terapeuta Ocupacional · Fundadora e Supervisão Técnica',
    crfa: 'CREFITO · Terapia Ocupacional',
    bio: 'Terapeuta Ocupacional, fundadora do Espaço Adapta T.O (desde 2019), dedicada ao atendimento clínico, Integração Sensorial e supervisão técnica multidisciplinar em TEA.',
    photoUrl: '/src/assets/images/professional_portrait_one_1795193186394.jpg',
    active: true,
    workingHours: DEFAULT_WEEKLY_SCHEDULE,
    specialtyIds: [2, 3, 9],
  },
  {
    id: 2,
    name: 'Equipe Multidisciplinar Adapta T.O',
    specialtySummary: 'Psicologia · Fonoaudiologia · Psicopedagogia · Fisioterapia · Nutrição · Musicoterapia',
    crfa: 'Corpo Clínico Especializado em TEA',
    bio: 'Equipe multidisciplinar integrada atuando com ABA, Modelo Denver (ESDM), CAA, Integração Sensorial (IS) e PediaSuit nas unidades Matriz e Filial em Cuiabá/MT.',
    photoUrl: '/src/assets/images/professional_portrait_two_1795193185516.jpg',
    active: true,
    workingHours: DEFAULT_WEEKLY_SCHEDULE,
    specialtyIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
];

export const DEFAULT_FAQS_SEED: FaqItem[] = [
  {
    id: 1,
    question: 'Como funciona a avaliação inicial no Espaço Adapta T.O?',
    answer:
      'Na avaliação inicial, ouvimos atentamente a família e compreendemos as características e necessidades individuais para indicar o plano terapêutico multidisciplinar mais adequado.',
    category: 'Atendimento',
    sortOrder: 1,
    active: true,
  },
  {
    id: 2,
    question: 'Quais abordagens terapêuticas são utilizadas na clínica?',
    answer:
      'Trabalhamos com abordagens baseadas em evidências científicas, incluindo Análise do Comportamento Aplicada (ABA), Modelo Denver de Intervenção Precoce (ESDM), Comunicação Alternativa e Aumentativa (CAA), Integração Sensorial (IS) e PediaSuit.',
    category: 'Abordagens',
    sortOrder: 2,
    active: true,
  },
  {
    id: 3,
    question: 'Quais são os endereços e horários de funcionamento?',
    answer:
      'Atendemos de Segunda a Sexta, das 8h às 18h, em duas unidades em Cuiabá/MT: Matriz (Rua Major Gama, 950, Centro Sul) e Filial (Rua Barão de Melgaço, 2350, Edifício Barão Center, Sala 104, Centro Sul).',
    category: 'Unidades',
    sortOrder: 3,
    active: true,
  },
  {
    id: 4,
    question: 'Ao solicitar um horário pelo site, minha consulta já está confirmada?',
    answer:
      'O envio pelo site registra uma solicitação na agenda com status pendente e gera seu código de protocolo. Nossa recepção confirma os detalhes e retorna por telefone ou WhatsApp para oficializar o horário.',
    category: 'Agendamento',
    sortOrder: 4,
    active: true,
  },
  {
    id: 5,
    question: 'Como meus dados pessoais são protegidos?',
    answer:
      'Seguimos a Lei Geral de Proteção de Dados (LGPD). Coletamos apenas as informações estritamente necessárias para contato e organização do agendamento.',
    category: 'Privacidade',
    sortOrder: 5,
    active: true,
  },
];

export function getFallbackBootstrapData() {
  return {
    settings: DEFAULT_SITE_SETTINGS,
    specialties: PEDIATRIC_SPECIALTIES.map((s, idx) => ({
      ...s,
      id: idx + 1,
      active: Boolean(s.active),
    })),
    professionals: DEFAULT_PROFESSIONALS_SEED,
    faqs: DEFAULT_FAQS_SEED,
    aiConfigured: false,
  };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function toHHMM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const WEEKDAY_SHORT_FB = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAY_FULL_FB = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function computeFallbackSlotsForDate(
  professional: Professional | undefined,
  dateStr: string,
  clinicAddress?: string
): {
  slots: string[];
  slotDetails: SlotDetail[];
  occupiedCount: number;
  blockedCount: number;
  totalCount: number;
  blocked: boolean;
  reason?: string;
  weekdayShort: string;
  weekdayFull: string;
  location: string;
} {
  const [y, m, d] = dateStr.split('-').map(Number);
  const weekdayIdx = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
    ? new Date(Date.UTC(y, (m || 1) - 1, d || 1)).getUTCDay()
    : 0;
  const weekdayShort = WEEKDAY_SHORT_FB[weekdayIdx] || '';
  const weekdayFull = WEEKDAY_FULL_FB[weekdayIdx] || '';
  const location =
    clinicAddress && !clinicAddress.toLowerCase().includes('a confirmar')
      ? `Espaço Adapta T.O · Cuiabá/MT`
      : 'Espaço Adapta T.O · Unidade Matriz / Filial';

  if (!professional || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return {
      slots: [],
      slotDetails: [],
      occupiedCount: 0,
      blockedCount: 0,
      totalCount: 0,
      blocked: true,
      reason: 'Profissional ou data indisponível.',
      weekdayShort,
      weekdayFull,
      location,
    };
  }
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  if (dateStr < todayStr) {
    return {
      slots: [],
      slotDetails: [],
      occupiedCount: 0,
      blockedCount: 0,
      totalCount: 0,
      blocked: true,
      reason: 'Data passada indisponível.',
      weekdayShort,
      weekdayFull,
      location,
    };
  }

  const dayConfig = professional.workingHours[String(weekdayIdx)];
  if (!dayConfig || !dayConfig.enabled) {
    return {
      slots: [],
      slotDetails: [],
      occupiedCount: 0,
      blockedCount: 0,
      totalCount: 0,
      blocked: false,
      reason: `Sem atendimento às ${weekdayFull.toLowerCase()}s.`,
      weekdayShort,
      weekdayFull,
      location,
    };
  }

  const startMin = toMinutes(dayConfig.start);
  const endMin = toMinutes(dayConfig.end);
  const slotMinutes = Math.max(20, Math.min(120, dayConfig.slotMinutes || 30));
  const hasBreak = Boolean(dayConfig.breakStart && dayConfig.breakEnd);
  const breakStartMin = hasBreak ? toMinutes(dayConfig.breakStart) : -1;
  const breakEndMin = hasBreak ? toMinutes(dayConfig.breakEnd) : -1;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots: string[] = [];
  const slotDetails: SlotDetail[] = [];
  for (let current = startMin; current + slotMinutes <= endMin; current += slotMinutes) {
    const slotEnd = current + slotMinutes;
    if (hasBreak && current < breakEndMin && slotEnd > breakStartMin) continue;
    const timeStr = toHHMM(current);
    if (dateStr === todayStr && current <= nowMinutes + 15) {
      slotDetails.push({
        time: timeStr,
        status: 'indisponivel',
        label: 'Horário encerrado',
        location,
      });
      continue;
    }
    slots.push(timeStr);
    slotDetails.push({
      time: timeStr,
      status: 'livre',
      label: 'Disponível',
      location,
    });
  }
  return {
    slots,
    slotDetails,
    occupiedCount: 0,
    blockedCount: 0,
    totalCount: slotDetails.length,
    blocked: false,
    weekdayShort,
    weekdayFull,
    location,
  };
}

export function computeFallbackMonthAvailability(
  professional: Professional | undefined,
  monthStr: string
): DayAvailabilitySummary[] {
  if (!/^\d{4}-\d{2}$/.test(monthStr)) return [];
  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const results: DayAvailabilitySummary[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${monthStr}-${String(d).padStart(2, '0')}`;
    const info = computeFallbackSlotsForDate(professional, date);
    results.push({
      date,
      availableCount: info.slots.length,
      occupiedCount: info.occupiedCount,
      blockedCount: info.blockedCount,
      totalCount: info.totalCount,
      blocked: info.blocked,
      reason: info.reason,
    });
  }
  return results;
}

export function computeFallbackLiveWeek(
  professional: Professional | undefined,
  startDateStr?: string,
  clinicAddress?: string
): LiveScheduleDay[] {
  const baseDateStr =
    startDateStr && /^\d{4}-\d{2}-\d{2}$/.test(startDateStr)
      ? startDateStr
      : new Date().toISOString().slice(0, 10);
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const days: LiveScheduleDay[] = [];
  for (let offset = 0; offset < 7; offset++) {
    const dt = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + offset));
    const date = dt.toISOString().slice(0, 10);
    const info = computeFallbackSlotsForDate(professional, date, clinicAddress);
    days.push({
      date,
      weekdayShort: info.weekdayShort,
      weekdayFull: info.weekdayFull,
      availableCount: info.slots.length,
      occupiedCount: info.occupiedCount,
      blockedCount: info.blockedCount,
      totalCount: info.totalCount,
      blocked: info.blocked,
      reason: info.reason,
      location: info.location,
      slots: info.slotDetails,
    });
  }
  return days;
}
