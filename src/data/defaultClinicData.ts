import type {
  DayAvailabilitySummary,
  FaqItem,
  Professional,
  SiteSettings,
  Specialty,
  WeeklySchedule,
} from '../types.ts';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
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
  content: {
    clinicName: 'adaptaTO',
    headerCtaText: 'Agendar consulta',
    heroKicker: 'Fonoaudiologia Infantil · Atendimento Humanizado',
    heroTitle: 'Comunicação, desenvolvimento e cuidado em cada fase da infância.',
    heroSubtitle:
      'Na adaptaTO, acreditamos que cada criança tem seu próprio ritmo. Oferecemos atendimento fonoaudiológico infantil humanizado, individualizado e focado no desenvolvimento de cada paciente junto à sua família.',
    heroPrimaryButton: 'Agendar atendimento',
    heroSecondaryButton: 'Conheça nossa clínica',
    introKicker: 'Nossa proposta de cuidado infantil',
    introTitle: 'O desenvolvimento da sua criança merece atenção especial.',
    introText:
      'A clínica adaptaTO nasce com o propósito de acolher bebês, crianças e suas famílias em um espaço tranquilo e lúdico, preparado para escutar, avaliar e acompanhar cada etapa da comunicação infantil com respeito, ética e embasamento clínico.',
    introHighlights: 'Avaliação infantil cuidadosa · Escuta às famílias · Respeito a cada fase',
    specialtiesSectionKicker: 'Áreas de atuação infantil',
    specialtiesSectionTitle: 'Especialidades em fonoaudiologia infantil',
    differentialsKicker: 'Nossos diferenciais',
    differentialsTitle: 'Um cuidado pensado para cada infância',
    differentials: [
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
    ],
    ctaTitle: 'Vamos dar o próximo passo juntos?',
    ctaSubtitle:
      'Fale diretamente com nossa equipe pelo WhatsApp ou solicite um horário infantil pelo sistema de agendamento do site.',
    ctaButtonText: 'Agende seu atendimento pelo WhatsApp',
    aboutKicker: 'Institucional · Sobre a clínica',
    aboutPageTitle: 'Cuidado fonoaudiológico infantil com acolhimento, escuta e responsabilidade clínica.',
    aboutHistory:
      '[Texto provisório editável] A clínica adaptaTO foi idealizada para oferecer um atendimento fonoaudiológico infantil próximo, sereno e personalizado. Este espaço está pronto para receber a história oficial da clínica, sua trajetória de fundação e marcos importantes diretamente pelo painel administrativo.',
    aboutMission:
      '[Editável] Promover o desenvolvimento da comunicação na infância com acolhimento, ludicidade, escuta ativa e prática fonoaudiológica baseada em evidências, respeitando a singularidade de cada criança.',
    aboutVision:
      '[Editável] Ser referência em cuidado fonoaudiológico infantil humanizado, construindo vínculos de confiança duradouros com crianças, familiares e equipes escolares e interdisciplinares.',
    aboutValues:
      'Acolhimento e respeito ao ritmo infantil; Ética e sigilo profissional; Atualização científica contínua; Parceria transparente com as famílias; Acessibilidade e inclusão.',
    aboutPhilosophy:
      'Acreditamos que cada conquista na fala, na linguagem, na comunicação ou nas funções orofaciais da criança acontece de forma mais consistente quando há vínculo afetivo, ludicidade, clareza nos objetivos e orientação contínua aos pais e cuidadores.',
    aboutNotice:
      'As informações institucionais e perfis abaixo são modelos editáveis e podem ser atualizados pela administração da clínica no painel protegido por senha.',
    aboutTeamKicker: 'Nossa equipe',
    aboutTeamTitle: 'Profissionais dedicados ao desenvolvimento infantil',
    specialtiesPageKicker: 'Serviços e áreas de atuação infantil',
    specialtiesPageTitle: 'Especialidades em fonoaudiologia infantil',
    specialtiesPageSubtitle:
      'Conheça as áreas voltadas ao público infantil cadastradas pela clínica adaptaTO. Cada atendimento inicia com uma avaliação individualizada para compreender as necessidades reais da criança e orientar a família.',
    professionalsPageKicker: 'Equipe clínica infantil',
    professionalsPageTitle: 'Nossos profissionais',
    professionalsPageSubtitle:
      'Conheça os fonoaudiólogos cadastrados na clínica adaptaTO, suas áreas de atuação infantil e horários disponíveis para atendimento.',
    bookingPageKicker: 'Agendamento infantil online · Solicitação em 6 etapas',
    bookingPageTitle: 'Solicite o atendimento da sua criança',
    bookingPageSubtitle:
      'Escolha o tipo de atendimento infantil, profissional, data e horário disponíveis para enviar sua solicitação à nossa equipe.',
    faqPageKicker: 'Esclarecimentos · Perguntas e respostas',
    faqPageTitle: 'Dúvidas frequentes',
    faqPageSubtitle:
      'Reunimos as principais orientações para pais e responsáveis sobre avaliações infantis, agendamentos e proteção de dados na clínica adaptaTO.',
    contactPageKicker: 'Atendimento e suporte',
    contactPageTitle: 'Fale com a adaptaTO',
    contactPageSubtitle:
      'Estamos à disposição para tirar dúvidas dos pais e responsáveis sobre especialidades infantis, horários ou funcionamento da clínica.',
    privacyPageKicker: 'Transparência e segurança · LGPD',
    privacyPageTitle: 'Política de Privacidade',
    privacyPageSubtitle:
      'Tratamento de dados pessoais da clínica de fonoaudiologia infantil em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).',
    footerTagline:
      'Clínica de fonoaudiologia infantil dedicada ao cuidado humanizado da comunicação e do desenvolvimento na infância.',
    footerBottomText: 'Fonoaudiologia infantil humanizada · Dados tratados conforme a LGPD',
  },
  images: {
    heroImage: '/src/assets/images/hero_clinic_speech_therapy_1795193184901.jpg',
    aboutSpaceImage: '/src/assets/images/clinic_space_accueil_1795193185344.jpg',
    aboutSessionImage: '/src/assets/images/clinic_therapy_session_1795193185634.jpg',
    specialtiesBannerImage: '/src/assets/images/clinic_therapy_session_1795193185634.jpg',
  },
  contact: {
    address: 'Endereço oficial a confirmar pela clínica (editável no painel administrativo)',
    phone: '(00) 0000-0000',
    whatsapp: '11999990000',
    email: 'contato@adaptato.com.br',
    hours: 'Segunda a Sexta, das 07h30 às 20h00 · Sábado, das 08h00 às 13h00',
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
    assistantName: 'Assistente adaptaTO',
    welcomeMessage:
      'Olá! Sou o assistente virtual da adaptaTO, clínica de fonoaudiologia exclusiva para crianças. Como posso ajudar você e sua família hoje?',
    customInstructions:
      'Reforce sempre que a clínica atende exclusivamente bebês e crianças (fonoaudiologia infantil). Priorize respostas claras, acolhedoras e objetivas para pais e responsáveis.',
  },
};

export const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  '0': { enabled: false, start: '08:00', end: '12:00', breakStart: '', breakEnd: '', slotMinutes: 30 },
  '1': { enabled: true, start: '07:30', end: '20:00', breakStart: '12:00', breakEnd: '13:00', slotMinutes: 30 },
  '2': { enabled: true, start: '07:30', end: '20:00', breakStart: '12:00', breakEnd: '13:00', slotMinutes: 30 },
  '3': { enabled: true, start: '07:30', end: '20:00', breakStart: '12:00', breakEnd: '13:00', slotMinutes: 30 },
  '4': { enabled: true, start: '07:30', end: '20:00', breakStart: '12:00', breakEnd: '13:00', slotMinutes: 30 },
  '5': { enabled: true, start: '07:30', end: '20:00', breakStart: '12:00', breakEnd: '13:00', slotMinutes: 30 },
  '6': { enabled: true, start: '08:00', end: '13:00', breakStart: '', breakEnd: '', slotMinutes: 30 },
};

export const PEDIATRIC_SPECIALTIES: Array<Omit<Specialty, 'id' | 'active'> & { active: number }> = [
  {
    slug: 'linguagem-infantil',
    name: 'Linguagem Infantil',
    icon: 'Baby',
    shortDescription:
      'Acompanhamento do desenvolvimento da fala, compreensão e comunicação na infância com abordagem acolhedora e lúdica.',
    fullDescription:
      'Atendimento focado em observar e estimular o desenvolvimento da linguagem oral e compreensiva em bebês e crianças, respeitando o tempo singular de cada faixa etária e envolvendo a família no processo.',
    targetAudience: 'Bebês, crianças em idade pré-escolar e escolar (mediante avaliação clínica).',
    objectives:
      'Ampliar o vocabulário, favorecer a compreensão, estimular a intenção comunicativa e apoiar a construção de frases funcionais no dia a dia.',
    howItWorks:
      'Inicia-se com entrevista familiar e avaliação fonoaudiológica infantil individualizada para definir objetivos e frequência de sessões junto aos responsáveis.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 1,
  },
  {
    slug: 'leitura-e-escrita-infantil',
    name: 'Leitura, Escrita e Aprendizagem',
    icon: 'BookOpen',
    shortDescription:
      'Apoio fonoaudiológico infantil para consciência fonológica, alfabetização, compreensão leitora e expressão escrita.',
    fullDescription:
      'Acompanhamento especializado voltado a crianças em fase de alfabetização ou ensino fundamental que apresentam dificuldades na relação entre sons e letras, fluência de leitura ou organização da escrita.',
    targetAudience: 'Crianças em idade pré-escolar e escolar (conforme avaliação fonoaudiológica).',
    objectives:
      'Fortalecer o processamento fonológico, a consciência dos sons, a decodificação leitora e a confiança da criança nas atividades escolares.',
    howItWorks:
      'Após avaliação inicial lúdica e estruturada, realizamos sessões individuais alinhadas com orientações práticas para família e escola.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 2,
  },
  {
    slug: 'desenvolvimento-da-comunicacao',
    name: 'Desenvolvimento da Comunicação',
    icon: 'Sparkles',
    shortDescription:
      'Intervenção infantil focada em interação social, troca de turnos, atenção compartilhada e comunicação funcional.',
    fullDescription:
      'Trabalho direcionado a fortalecer diferentes formas da criança se comunicar, incluindo gestos, expressões, comunicação verbal e recursos de comunicação alternativa quando indicados.',
    targetAudience: 'Bebês e crianças com atrasos ou necessidades específicas na comunicação e interação.',
    objectives:
      'Promover comunicação funcional, autonomia nas interações e participação ativa nos ambientes familiar e escolar.',
    howItWorks:
      'Atendimento lúdico e personalizado em parceria constante com familiares, cuidadores e escola, respeitando o perfil sensorial de cada criança.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 3,
  },
  {
    slug: 'fala-e-articulacao',
    name: 'Fala e Articulação Infantil',
    icon: 'AudioLines',
    shortDescription:
      'Avaliação e terapia lúdica para trocas, omissões ou distorções de sons na fala da criança, buscando clareza.',
    fullDescription:
      'Atendimento direcionado à organização fonológica e à precisão articulatória dos sons da fala infantil, auxiliando a criança a se expressar com mais clareza, naturalidade e segurança.',
    targetAudience: 'Crianças em idade pré-escolar e escolar com trocas ou alterações nos sons da fala.',
    objectives:
      'Desenvolver a percepção auditiva dos fonemas, adequar padrões articulatórios e aumentar a inteligibilidade da fala infantil.',
    howItWorks:
      'Avaliação lúdica dos órgãos fonoarticulatórios e do inventário fonológico seguida de plano terapêutico gradual.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 4,
  },
  {
    slug: 'voz',
    name: 'Voz Infantil',
    icon: 'Mic',
    shortDescription:
      'Cuidado e orientação vocal infantil para rouquidão persistente, esforço ao falar e saúde da voz na infância.',
    fullDescription:
      'Atuação voltada à avaliação perceptiva da voz infantil e à reabilitação lúdica em casos de disfonia, abuso vocal ou fadiga ao falar durante brincadeiras e atividades escolares.',
    targetAudience: 'Crianças com queixas de rouquidão frequente ou esforço vocal (mediante avaliação).',
    objectives:
      'Promover saúde vocal na infância, coordenação respiratória e hábitos saudáveis de uso da voz sem esforço.',
    howItWorks:
      'Sessões com atividades lúdicas de respiração e emissão vocal, além de orientações claras para os pais e cuidadores.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 5,
  },
  {
    slug: 'motricidade-orofacial',
    name: 'Motricidade Orofacial Infantil',
    icon: 'Smile',
    shortDescription:
      'Avaliação e terapia das funções de sucção, respiração, mastigação, deglutição e musculatura orofacial infantil.',
    fullDescription:
      'Área da fonoaudiologia dedicada ao equilíbrio da musculatura da face, lábios, língua e bochechas em bebês e crianças, atuando em integração quando necessário com odontopediatria e otorrinolaringologia.',
    targetAudience: 'Bebês e crianças com alterações na respiração, mastigação, deglutição ou hábitos orais.',
    objectives:
      'Reequilibrar padrões respiratórios, alimentares, de deglutição e postura muscular orofacial durante o crescimento infantil.',
    howItWorks:
      'Exame clínico miofuncional orofacial e sessões lúdicas com exercícios funcionais e acompanhamento evolutivo junto à família.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 6,
  },
  {
    slug: 'fluencia-e-gagueira',
    name: 'Fluência e Gagueira Infantil',
    icon: 'Wind',
    shortDescription:
      'Acolhimento e suporte clínico para disfluências na infância, favorecendo uma fala mais leve e confiante.',
    fullDescription:
      'Atendimento sensível e baseado em evidências voltado exclusivamente para crianças em fase de desenvolvimento da fala que vivenciam repetições, prolongamentos ou bloqueios na fluência.',
    targetAudience: 'Crianças em idade pré-escolar e escolar com disfluências ou gagueira.',
    objectives:
      'Reduzir tensões associadas à fala, orientar o ambiente comunicativo familiar e fortalecer a autoconfiança da criança.',
    howItWorks:
      'Avaliação específica da fluência infantil, orientação ativa aos pais e acompanhamento terapêutico contínuo.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 7,
  },
  {
    slug: 'avaliacao-fonoaudiologica',
    name: 'Avaliação Fonoaudiológica Infantil',
    icon: 'ClipboardCheck',
    shortDescription:
      'Processo inicial estruturado para compreender o desenvolvimento comunicativo da criança e orientar a família.',
    fullDescription:
      'Etapa fundamental de escuta dos pais, observação clínica lúdica e aplicação de protocolos infantis para mapear potencialidades e necessidades de fala, linguagem, aprendizagem ou motricidade orofacial.',
    targetAudience: 'Bebês e crianças em busca de esclarecimento clínico ou início de acompanhamento.',
    objectives:
      'Compreender o desenvolvimento global da criança, dialogar com os responsáveis e propor um plano terapêutico individualizado quando indicado.',
    howItWorks:
      'Realizada em encontros de anamnese com os responsáveis, sessões lúdicas com a criança e devolutiva detalhada.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 8,
  },
  {
    slug: 'orientacao-familiar',
    name: 'Orientação Familiar',
    icon: 'Users',
    shortDescription:
      'Encontros dedicados a acolher dúvidas dos pais e construir estratégias práticas para o cotidiano da criança.',
    fullDescription:
      'Espaço de diálogo e parceria com pais, mães, responsáveis e cuidadores para potencializar estímulos naturais de comunicação nas brincadeiras, refeições e rotina infantil.',
    targetAudience: 'Pais, mães, responsáveis e cuidadores de bebês e crianças.',
    objectives:
      'Oferecer segurança, clareza e ferramentas cotidianas que favoreçam o desenvolvimento infantil fora do consultório.',
    howItWorks:
      'Sessões agendadas com escuta acolhedora e orientações práticas adaptadas à rotina de cada família.',
    confirmationStatus: 'confirmed',
    active: 1,
    sortOrder: 9,
  },
  {
    slug: 'audicao',
    name: 'Audição Infantil',
    icon: 'Ear',
    shortDescription:
      'Área sujeita à confirmação de disponibilidade pela equipe clínica. Consulte nossa administração.',
    fullDescription:
      'Atendimento relacionado ao desenvolvimento e habilitação auditiva infantil, cuja oferta e modalidades específicas devem ser confirmadas diretamente com a equipe da clínica adaptaTO.',
    targetAudience: 'Crianças (disponibilidade a confirmar diretamente pela administração da clínica).',
    objectives:
      'Confirmar disponibilidade de avaliação ou acompanhamento auditivo infantil junto à equipe responsável.',
    howItWorks:
      'Esta especialidade encontra-se sinalizada como pendente de confirmação oficial no painel administrativo.',
    confirmationStatus: 'to_confirm',
    active: 1,
    sortOrder: 10,
  },
];

export const DEFAULT_PROFESSIONALS_SEED: Professional[] = [
  {
    id: 1,
    name: 'Dra. Camila Mendes',
    specialtySummary: 'Linguagem Infantil · Desenvolvimento da Comunicação · Orientação Familiar',
    crfa: 'CRFa a informar pela clínica',
    bio: '[Perfil modelo editável] Fonoaudióloga dedicada ao atendimento acolhedor de bebês, crianças e famílias, com foco no respeito ao ritmo de desenvolvimento e comunicação funcional.',
    photoUrl: '/src/assets/images/professional_portrait_one_1795193186394.jpg',
    active: true,
    workingHours: DEFAULT_WEEKLY_SCHEDULE,
    specialtyIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  {
    id: 2,
    name: 'Dr. Lucas Ferreira',
    specialtySummary: 'Fala e Articulação Infantil · Motricidade Orofacial · Fluência Infantil',
    crfa: 'CRFa a informar pela clínica',
    bio: '[Perfil modelo editável] Fonoaudiólogo dedicado ao atendimento infantil, com foco em articulação da fala, motricidade orofacial, fluência e acompanhamento individualizado junto às famílias.',
    photoUrl: '/src/assets/images/professional_portrait_two_1795193185516.jpg',
    active: true,
    workingHours: DEFAULT_WEEKLY_SCHEDULE,
    specialtyIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
];

export const DEFAULT_FAQS_SEED: FaqItem[] = [
  {
    id: 1,
    question: 'Como funciona a primeira consulta na adaptaTO?',
    answer:
      'O primeiro encontro costuma ser uma avaliação infantil ou entrevista de acolhimento com os pais, onde ouvimos as queixas, observamos a comunicação da criança e explicamos os próximos passos.',
    category: 'Atendimento',
    sortOrder: 1,
    active: true,
  },
  {
    id: 2,
    question: 'Ao solicitar um horário pelo site, minha consulta já está confirmada?',
    answer:
      'Não. O envio pelo site registra uma solicitação de agendamento com status pendente. Nossa equipe verifica a agenda e entra em contato (por telefone ou WhatsApp) para confirmar oficialmente o horário.',
    category: 'Agendamento',
    sortOrder: 2,
    active: true,
  },
  {
    id: 3,
    question: 'A clínica atende apenas crianças?',
    answer:
      'Sim. A adaptaTO é especializada exclusivamente no atendimento fonoaudiológico infantil, acompanhando bebês e crianças em cada fase da infância, sempre em parceria com os pais e responsáveis.',
    category: 'Especialidades',
    sortOrder: 3,
    active: true,
  },
  {
    id: 4,
    question: 'Como posso remarcar ou cancelar uma solicitação?',
    answer:
      'Você pode consultar ou cancelar seu protocolo diretamente na aba "Acompanhar protocolo" na página de Agendamento ou entrar em contato com nossa equipe pelo WhatsApp.',
    category: 'Agendamento',
    sortOrder: 4,
    active: true,
  },
  {
    id: 5,
    question: 'Como meus dados pessoais são protegidos?',
    answer:
      'Seguimos as diretrizes da Lei Geral de Proteção de Dados (LGPD). Coletamos apenas os dados estritamente necessários para o contato e agendamento, sem expor informações públicas de pacientes.',
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

export function computeFallbackSlotsForDate(
  professional: Professional | undefined,
  dateStr: string
): { slots: string[]; blocked: boolean; reason?: string } {
  if (!professional || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { slots: [], blocked: true, reason: 'Profissional ou data indisponível.' };
  }
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  if (dateStr < todayStr) {
    return { slots: [], blocked: true, reason: 'Data passada indisponível.' };
  }

  const [y, m, d] = dateStr.split('-').map(Number);
  const weekdayKey = String(new Date(Date.UTC(y, (m || 1) - 1, d || 1)).getUTCDay());
  const dayConfig = professional.workingHours[weekdayKey];
  if (!dayConfig || !dayConfig.enabled) {
    return { slots: [], blocked: false, reason: 'Sem atendimento neste dia da semana.' };
  }

  const startMin = toMinutes(dayConfig.start);
  const endMin = toMinutes(dayConfig.end);
  const slotMinutes = Math.max(20, Math.min(120, dayConfig.slotMinutes || 30));
  const hasBreak = Boolean(dayConfig.breakStart && dayConfig.breakEnd);
  const breakStartMin = hasBreak ? toMinutes(dayConfig.breakStart) : -1;
  const breakEndMin = hasBreak ? toMinutes(dayConfig.breakEnd) : -1;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots: string[] = [];
  for (let current = startMin; current + slotMinutes <= endMin; current += slotMinutes) {
    const slotEnd = current + slotMinutes;
    if (hasBreak && current < breakEndMin && slotEnd > breakStartMin) continue;
    if (dateStr === todayStr && current <= nowMinutes + 15) continue;
    slots.push(toHHMM(current));
  }
  return { slots, blocked: false };
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
      blocked: info.blocked,
      reason: info.reason,
    });
  }
  return results;
}
