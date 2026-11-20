import { db } from './db.ts';
import { hashPassword } from './auth.ts';
import {
  DEFAULT_SITE_SETTINGS,
  DEFAULT_WEEKLY_SCHEDULE,
  PEDIATRIC_SPECIALTIES,
} from '../src/data/defaultClinicData.ts';
import type { SiteSettings } from '../src/types.ts';

export { DEFAULT_SITE_SETTINGS };

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
