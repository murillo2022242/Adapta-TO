import { db } from './db.ts';
import { hashPassword } from './auth.ts';
import type { SiteSettings, WeeklySchedule } from '../src/types.ts';

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

const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  '0': { enabled: false, start: '08:00', end: '12:00', breakStart: '', breakEnd: '', slotMinutes: 30 },
  '1': { enabled: true, start: '07:30', end: '20:00', breakStart: '12:00', breakEnd: '13:00', slotMinutes: 30 },
  '2': { enabled: true, start: '07:30', end: '20:00', breakStart: '12:00', breakEnd: '13:00', slotMinutes: 30 },
  '3': { enabled: true, start: '07:30', end: '20:00', breakStart: '12:00', breakEnd: '13:00', slotMinutes: 30 },
  '4': { enabled: true, start: '07:30', end: '20:00', breakStart: '12:00', breakEnd: '13:00', slotMinutes: 30 },
  '5': { enabled: true, start: '07:30', end: '20:00', breakStart: '12:00', breakEnd: '13:00', slotMinutes: 30 },
  '6': { enabled: true, start: '08:00', end: '13:00', breakStart: '', breakEnd: '', slotMinutes: 30 },
};

const PEDIATRIC_SPECIALTIES = [
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

export function getSiteSettings(): SiteSettings {
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as Array<{
    key: string;
    value: string;
  }>;
  const map = new Map(rows.map((r) => [r.key, r.value]));

  const parseOrDefault = <T>(key: string, fallback: T): T => {
    const raw = map.get(key);
    if (!raw) return fallback;
    try {
      return { ...fallback, ...JSON.parse(raw) };
    } catch {
      return fallback;
    }
  };

  const parsedContent = parseOrDefault('content', DEFAULT_SITE_SETTINGS.content);
  if (!Array.isArray(parsedContent.differentials) || parsedContent.differentials.length === 0) {
    parsedContent.differentials = DEFAULT_SITE_SETTINGS.content.differentials;
  }

  return {
    theme: parseOrDefault('theme', DEFAULT_SITE_SETTINGS.theme),
    content: parsedContent,
    images: parseOrDefault('images', DEFAULT_SITE_SETTINGS.images),
    contact: parseOrDefault('contact', DEFAULT_SITE_SETTINGS.contact),
    ai: parseOrDefault('ai', DEFAULT_SITE_SETTINGS.ai),
  };
}

export function seedInitialData(): void {
  const settingsCount = (
    db.prepare('SELECT COUNT(*) as cnt FROM site_settings').get() as { cnt: number }
  ).cnt;

  if (settingsCount === 0) {
    const insertSetting = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
    insertSetting.run('theme', JSON.stringify(DEFAULT_SITE_SETTINGS.theme));
    insertSetting.run('content', JSON.stringify(DEFAULT_SITE_SETTINGS.content));
    insertSetting.run('images', JSON.stringify(DEFAULT_SITE_SETTINGS.images));
    insertSetting.run('contact', JSON.stringify(DEFAULT_SITE_SETTINGS.contact));
    insertSetting.run('ai', JSON.stringify(DEFAULT_SITE_SETTINGS.ai));
    insertSetting.run('editor_password_hash', hashPassword('murillo20'));
  }

  const specialtiesCount = (
    db.prepare('SELECT COUNT(*) as cnt FROM specialties').get() as { cnt: number }
  ).cnt;

  if (specialtiesCount === 0) {
    const stmt = db.prepare(`
      INSERT INTO specialties (
        slug, name, icon, short_description, full_description,
        target_audience, objectives, how_it_works, confirmation_status, active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of PEDIATRIC_SPECIALTIES) {
      stmt.run(
        s.slug,
        s.name,
        s.icon,
        s.shortDescription,
        s.fullDescription,
        s.targetAudience,
        s.objectives,
        s.howItWorks,
        s.confirmationStatus,
        s.active,
        s.sortOrder
      );
    }
  }

  const profCount = (
    db.prepare('SELECT COUNT(*) as cnt FROM professionals').get() as { cnt: number }
  ).cnt;

  if (profCount === 0) {
    const insertProf = db.prepare(`
      INSERT INTO professionals (name, specialty_summary, crfa, bio, photo_url, active, working_hours_json)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `);
    const p1 = insertProf.run(
      'Dra. Camila Mendes',
      'Linguagem Infantil · Desenvolvimento da Comunicação · Orientação Familiar',
      'CRFa a informar pela clínica',
      '[Perfil modelo editável] Fonoaudióloga dedicada ao atendimento acolhedor de bebês, crianças e famílias, com foco no respeito ao ritmo de desenvolvimento e comunicação funcional.',
      '/src/assets/images/professional_portrait_one_1795193186394.jpg',
      JSON.stringify(DEFAULT_WEEKLY_SCHEDULE)
    );
    const p2 = insertProf.run(
      'Dr. Lucas Ferreira',
      'Fala e Articulação Infantil · Motricidade Orofacial · Fluência Infantil',
      'CRFa a informar pela clínica',
      '[Perfil modelo editável] Fonoaudiólogo dedicado ao atendimento infantil, com foco em articulação da fala, motricidade orofacial, fluência e acompanhamento individualizado junto às famílias.',
      '/src/assets/images/professional_portrait_two_1795193185516.jpg',
      JSON.stringify(DEFAULT_WEEKLY_SCHEDULE)
    );

    const allSpecs = db.prepare('SELECT id, sort_order FROM specialties').all() as Array<{
      id: number;
      sort_order: number;
    }>;
    const linkStmt = db.prepare(
      'INSERT OR IGNORE INTO professional_specialties (professional_id, specialty_id) VALUES (?, ?)'
    );
    for (const sp of allSpecs) {
      if (sp.sort_order <= 9) {
        linkStmt.run(p1.lastInsertRowid, sp.id);
        linkStmt.run(p2.lastInsertRowid, sp.id);
      }
    }
  }

  // One-time upgrade for existing database to include expanded booking hours
  const expandedFlag = db
    .prepare("SELECT value FROM site_settings WHERE key = 'schedule_expanded_v2'")
    .get() as { value: string } | undefined;
  if (!expandedFlag) {
    db.prepare('UPDATE professionals SET working_hours_json = ?').run(
      JSON.stringify(DEFAULT_WEEKLY_SCHEDULE)
    );
    const curContactRow = db
      .prepare("SELECT value FROM site_settings WHERE key = 'contact'")
      .get() as { value: string } | undefined;
    if (curContactRow) {
      try {
        const parsed = JSON.parse(curContactRow.value);
        if (parsed.hours === 'Segunda a Sexta, das 08h00 às 18h00') {
          parsed.hours = DEFAULT_SITE_SETTINGS.contact.hours;
          db.prepare("INSERT OR REPLACE INTO site_settings (key, value) VALUES ('contact', ?)").run(
            JSON.stringify(parsed)
          );
        }
      } catch {
        // ignore
      }
    }
    db.prepare("INSERT OR REPLACE INTO site_settings (key, value) VALUES ('schedule_expanded_v2', '1')").run();
  }

  const userCount = (
    db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number }
  ).cnt;

  if (userCount === 0) {
    const firstProf = db.prepare('SELECT id FROM professionals ORDER BY id ASC LIMIT 1').get() as
      | { id: number }
      | undefined;

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, professional_id, active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);
    insertUser.run(
      'Administração adaptaTO',
      'murillo.arthur20@gmail.com',
      hashPassword('murillo20'),
      'admin',
      null
    );
    insertUser.run(
      'Dra. Camila Mendes',
      'camila@adaptato.com.br',
      hashPassword('AdaptaFono2026!'),
      'professional',
      firstProf ? firstProf.id : null
    );
  }

  // One-time update of admin & visual editor credentials
  const credsFlag = db
    .prepare("SELECT value FROM site_settings WHERE key = 'admin_credentials_v2'")
    .get() as { value: string } | undefined;
  if (!credsFlag) {
    const newHash = hashPassword('murillo20');
    db.prepare(
      "UPDATE users SET email = ?, password_hash = ? WHERE role = 'admin' AND id = (SELECT MIN(id) FROM users WHERE role = 'admin')"
    ).run('murillo.arthur20@gmail.com', newHash);
    db.prepare(
      "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('editor_password_hash', ?, datetime('now'))"
    ).run(hashPassword('murillo20'));
    db.prepare("INSERT OR REPLACE INTO site_settings (key, value) VALUES ('admin_credentials_v2', '1')").run();
  }

  const faqCount = (db.prepare('SELECT COUNT(*) as cnt FROM faqs').get() as { cnt: number }).cnt;
  if (faqCount === 0) {
    const insertFaq = db.prepare(
      'INSERT INTO faqs (question, answer, category, sort_order, active) VALUES (?, ?, ?, ?, 1)'
    );
    insertFaq.run(
      'Como funciona a primeira consulta na adaptaTO?',
      'O primeiro encontro costuma ser uma avaliação infantil ou entrevista de acolhimento com os pais, onde ouvimos as queixas, observamos a comunicação da criança e explicamos os próximos passos.',
      'Atendimento',
      1
    );
    insertFaq.run(
      'Ao solicitar um horário pelo site, minha consulta já está confirmada?',
      'Não. O envio pelo site registra uma solicitação de agendamento com status pendente. Nossa equipe verifica a agenda e entra em contato (por telefone ou WhatsApp) para confirmar oficialmente o horário.',
      'Agendamento',
      2
    );
    insertFaq.run(
      'A clínica atende apenas crianças?',
      'Sim. A adaptaTO é especializada exclusivamente no atendimento fonoaudiológico infantil, acompanhando bebês e crianças em cada fase da infância, sempre em parceria com os pais e responsáveis.',
      'Especialidades',
      3
    );
    insertFaq.run(
      'Como posso remarcar ou cancelar uma solicitação?',
      'Você pode consultar ou cancelar seu protocolo diretamente na aba "Acompanhar protocolo" na página de Agendamento ou entrar em contato com nossa equipe pelo WhatsApp.',
      'Agendamento',
      4
    );
    insertFaq.run(
      'Como meus dados pessoais são protegidos?',
      'Seguimos as diretrizes da Lei Geral de Proteção de Dados (LGPD). Coletamos apenas os dados estritamente necessários para o contato e agendamento, sem expor informações públicas de pacientes.',
      'Privacidade',
      5
    );
  }

  const kbCount = (
    db.prepare('SELECT COUNT(*) as cnt FROM knowledge_base').get() as { cnt: number }
  ).cnt;
  if (kbCount === 0) {
    const insertKb = db.prepare(
      'INSERT INTO knowledge_base (title, category, content, active) VALUES (?, ?, ?, 1)'
    );
    insertKb.run(
      'Público Atendido (Exclusivo Infantil)',
      'Institucional',
      'A clínica adaptaTO atende exclusivamente bebês e crianças (fonoaudiologia infantil) e oferece orientação aos pais, responsáveis e escolas. Não atendemos adultos ou idosos.',
    );
    insertKb.run(
      'Proposta de Atendimento adaptaTO',
      'Institucional',
      'A adaptaTO oferece atendimento fonoaudiológico infantil humanizado, individualizado e acolhedor, respeitando o ritmo de cada criança e mantendo parceria próxima com familiares e responsáveis.',
    );
    insertKb.run(
      'Regra de Confirmação de Agendamento',
      'Agendamento',
      'As solicitações realizadas pelo formulário do site ficam registradas como pendentes até a confirmação oficial da recepção ou profissional da clínica. Nunca garanta que um horário está fechado antes da confirmação da equipe.',
    );
    insertKb.run(
      'Valores e Convênios',
      'Financeiro',
      'Informações sobre valores de sessões, pacotes ou reembolsos devem ser consultadas diretamente com a equipe da clínica pelo WhatsApp oficial.',
    );
  }

  // One-time migration to tailor existing default records exclusively for pediatric speech-language clinic
  const pediatricFlag = db
    .prepare("SELECT value FROM site_settings WHERE key = 'pediatric_only_v3'")
    .get() as { value: string } | undefined;
  if (!pediatricFlag) {
    // 1. Update site_settings content and ai if using prior seeded defaults
    const contentRow = db.prepare("SELECT value FROM site_settings WHERE key = 'content'").get() as
      | { value: string }
      | undefined;
    if (contentRow) {
      try {
        const cur = JSON.parse(contentRow.value);
        const updatedContent = {
          ...cur,
          heroKicker:
            cur.heroKicker === 'Fonoaudiologia Clínica · Atendimento Humanizado'
              ? DEFAULT_SITE_SETTINGS.content.heroKicker
              : cur.heroKicker,
          heroTitle:
            cur.heroTitle === 'Comunicação, desenvolvimento e cuidado em cada etapa da vida.'
              ? DEFAULT_SITE_SETTINGS.content.heroTitle
              : cur.heroTitle,
          heroSubtitle:
            cur.heroSubtitle?.includes('cada pessoa tem seu próprio ritmo')
              ? DEFAULT_SITE_SETTINGS.content.heroSubtitle
              : cur.heroSubtitle,
          introKicker:
            cur.introKicker === 'Nossa proposta de cuidado'
              ? DEFAULT_SITE_SETTINGS.content.introKicker
              : cur.introKicker,
          introTitle:
            cur.introTitle === 'Seu desenvolvimento merece atenção especial.'
              ? DEFAULT_SITE_SETTINGS.content.introTitle
              : cur.introTitle,
          introText:
            cur.introText?.includes('crianças, adolescentes, adultos e famílias')
              ? DEFAULT_SITE_SETTINGS.content.introText
              : cur.introText,
          introHighlights:
            cur.introHighlights === 'Avaliação cuidadosa · Escuta às famílias · Respeito a cada etapa'
              ? DEFAULT_SITE_SETTINGS.content.introHighlights
              : cur.introHighlights,
          specialtiesSectionKicker:
            cur.specialtiesSectionKicker === 'Áreas de atuação'
              ? DEFAULT_SITE_SETTINGS.content.specialtiesSectionKicker
              : cur.specialtiesSectionKicker,
          specialtiesSectionTitle:
            cur.specialtiesSectionTitle === 'Especialidades em fonoaudiologia'
              ? DEFAULT_SITE_SETTINGS.content.specialtiesSectionTitle
              : cur.specialtiesSectionTitle,
          differentialsTitle:
            cur.differentialsTitle === 'Um cuidado pensado para cada história'
              ? DEFAULT_SITE_SETTINGS.content.differentialsTitle
              : cur.differentialsTitle,
          differentials: DEFAULT_SITE_SETTINGS.content.differentials,
          aboutPageTitle:
            cur.aboutPageTitle === 'Cuidado fonoaudiológico com acolhimento, escuta e responsabilidade clínica.'
              ? DEFAULT_SITE_SETTINGS.content.aboutPageTitle
              : cur.aboutPageTitle,
          aboutTeamTitle:
            cur.aboutTeamTitle === 'Profissionais dedicados ao seu acompanhamento'
              ? DEFAULT_SITE_SETTINGS.content.aboutTeamTitle
              : cur.aboutTeamTitle,
          specialtiesPageTitle:
            cur.specialtiesPageTitle === 'Especialidades fonoaudiológicas'
              ? DEFAULT_SITE_SETTINGS.content.specialtiesPageTitle
              : cur.specialtiesPageTitle,
          specialtiesPageSubtitle:
            cur.specialtiesPageSubtitle?.includes('necessidades reais do paciente')
              ? DEFAULT_SITE_SETTINGS.content.specialtiesPageSubtitle
              : cur.specialtiesPageSubtitle,
          bookingPageTitle:
            cur.bookingPageTitle === 'Solicite sua consulta na adaptaTO'
              ? DEFAULT_SITE_SETTINGS.content.bookingPageTitle
              : cur.bookingPageTitle,
          footerTagline:
            cur.footerTagline?.includes('em todas as fases da vida')
              ? DEFAULT_SITE_SETTINGS.content.footerTagline
              : cur.footerTagline,
        };
        db.prepare("INSERT OR REPLACE INTO site_settings (key, value) VALUES ('content', ?)").run(
          JSON.stringify(updatedContent)
        );
      } catch {
        // ignore
      }
    }

    const aiRow = db.prepare("SELECT value FROM site_settings WHERE key = 'ai'").get() as
      | { value: string }
      | undefined;
    if (aiRow) {
      try {
        const curAi = JSON.parse(aiRow.value);
        if (curAi.welcomeMessage?.includes('conhecer nossos atendimentos, encontrar informações')) {
          curAi.welcomeMessage = DEFAULT_SITE_SETTINGS.ai.welcomeMessage;
        }
        curAi.customInstructions = DEFAULT_SITE_SETTINGS.ai.customInstructions;
        db.prepare("INSERT OR REPLACE INTO site_settings (key, value) VALUES ('ai', ?)").run(
          JSON.stringify(curAi)
        );
      } catch {
        // ignore
      }
    }

    // 2. Replace adult specialty with pediatric reading/writing specialty & update default specialties
    const updateSpecBySlug = db.prepare(`
      UPDATE specialties
      SET slug = ?, name = ?, icon = ?, short_description = ?, full_description = ?,
          target_audience = ?, objectives = ?, how_it_works = ?
      WHERE slug = ?
    `);
    for (const s of PEDIATRIC_SPECIALTIES) {
      const targetSlug = s.slug === 'leitura-e-escrita-infantil' ? 'linguagem-adulta' : s.slug;
      updateSpecBySlug.run(
        s.slug,
        s.name,
        s.icon,
        s.shortDescription,
        s.fullDescription,
        s.targetAudience,
        s.objectives,
        s.howItWorks,
        targetSlug
      );
    }

    // 3. Update Dr. Lucas Ferreira default summary/bio if it referenced adults
    db.prepare(
      `UPDATE professionals
       SET specialty_summary = ?, bio = ?
       WHERE name = 'Dr. Lucas Ferreira' AND specialty_summary LIKE '%Adulta%'`
    ).run(
      'Fala e Articulação Infantil · Motricidade Orofacial · Fluência Infantil',
      '[Perfil modelo editável] Fonoaudiólogo dedicado ao atendimento infantil, com foco em articulação da fala, motricidade orofacial, fluência e acompanhamento individualizado junto às famílias.'
    );

    // 4. Update FAQ #3 if it asks about adults
    db.prepare(
      `UPDATE faqs
       SET question = ?, answer = ?
       WHERE question LIKE '%crianças e adultos%'`
    ).run(
      'A clínica atende apenas crianças?',
      'Sim. A adaptaTO é especializada exclusivamente no atendimento fonoaudiológico infantil, acompanhando bebês e crianças em cada fase da infância, sempre em parceria com os pais e responsáveis.'
    );

    // 5. Add explicit pediatric knowledge base rule
    const existsKb = db
      .prepare("SELECT id FROM knowledge_base WHERE title = 'Público Atendido (Exclusivo Infantil)'")
      .get();
    if (!existsKb) {
      db.prepare('INSERT INTO knowledge_base (title, category, content, active) VALUES (?, ?, ?, 1)').run(
        'Público Atendido (Exclusivo Infantil)',
        'Institucional',
        'A clínica adaptaTO atende exclusivamente bebês e crianças (fonoaudiologia infantil) e oferece orientação aos pais, responsáveis e escolas. Não atendemos adultos ou idosos.'
      );
    }

    db.prepare("INSERT OR REPLACE INTO site_settings (key, value) VALUES ('pediatric_only_v3', '1')").run();
  }
}
