import { db } from './db.ts';
import { hashPassword } from './auth.ts';
import {
  DEFAULT_FAQS_SEED,
  DEFAULT_PROFESSIONALS_SEED,
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
      DEFAULT_PROFESSIONALS_SEED[0].name,
      DEFAULT_PROFESSIONALS_SEED[0].specialtySummary,
      DEFAULT_PROFESSIONALS_SEED[0].crfa,
      DEFAULT_PROFESSIONALS_SEED[0].bio,
      DEFAULT_PROFESSIONALS_SEED[0].photoUrl,
      JSON.stringify(DEFAULT_WEEKLY_SCHEDULE)
    );
    const p2 = insertProf.run(
      DEFAULT_PROFESSIONALS_SEED[1].name,
      DEFAULT_PROFESSIONALS_SEED[1].specialtySummary,
      DEFAULT_PROFESSIONALS_SEED[1].crfa,
      DEFAULT_PROFESSIONALS_SEED[1].bio,
      DEFAULT_PROFESSIONALS_SEED[1].photoUrl,
      JSON.stringify(DEFAULT_WEEKLY_SCHEDULE)
    );

    const allSpecs = db.prepare('SELECT id FROM specialties WHERE active = 1').all() as Array<{
      id: number;
    }>;
    const linkStmt = db.prepare(
      'INSERT OR IGNORE INTO professional_specialties (professional_id, specialty_id) VALUES (?, ?)'
    );
    for (const sp of allSpecs) {
      linkStmt.run(p1.lastInsertRowid, sp.id);
      linkStmt.run(p2.lastInsertRowid, sp.id);
    }
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
      'Administração Espaço Adapta T.O',
      'murillo.arthur20@gmail.com',
      hashPassword('murillo20'),
      'admin',
      null
    );
    insertUser.run(
      'Sumara Najla',
      'sumara@espacoadaptato.com.br',
      hashPassword('AdaptaTO2026!'),
      'professional',
      firstProf ? firstProf.id : null
    );
  }

  // Ensure admin & visual editor credentials are set cleanly
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

  const editorPassResetFlag = db
    .prepare("SELECT value FROM site_settings WHERE key = 'editor_password_murillo20_v1'")
    .get() as { value: string } | undefined;
  if (!editorPassResetFlag) {
    db.prepare(
      "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('editor_password_hash', ?, datetime('now'))"
    ).run(hashPassword('murillo20'));
    db.prepare(
      "INSERT OR REPLACE INTO site_settings (key, value) VALUES ('editor_password_murillo20_v1', '1')"
    ).run();
  }

  const faqCount = (db.prepare('SELECT COUNT(*) as cnt FROM faqs').get() as { cnt: number }).cnt;
  if (faqCount === 0) {
    const insertFaq = db.prepare(
      'INSERT INTO faqs (question, answer, category, sort_order, active) VALUES (?, ?, ?, ?, 1)'
    );
    for (const f of DEFAULT_FAQS_SEED) {
      insertFaq.run(f.question, f.answer, f.category, f.sortOrder);
    }
  }

  const kbCount = (
    db.prepare('SELECT COUNT(*) as cnt FROM knowledge_base').get() as { cnt: number }
  ).cnt;
  if (kbCount === 0) {
    const insertKb = db.prepare(
      'INSERT INTO knowledge_base (title, category, content, active) VALUES (?, ?, ?, 1)'
    );
    insertKb.run(
      'Sobre o Espaço Adapta T.O (Especialização em TEA)',
      'Institucional',
      'O Espaço Adapta T.O é uma clínica especializada no atendimento multidisciplinar de pessoas com Transtorno do Espectro Autista (TEA), fundada em 2019 por Sumara Najla (Terapeuta Ocupacional) em parceria administrativa com sua irmã Sâmara Ribeiro.'
    );
    insertKb.run(
      'Abordagens Terapêuticas Baseadas em Evidências',
      'Abordagens',
      'Utilizamos Análise do Comportamento Aplicada (ABA), Modelo Denver de Intervenção Precoce (ESDM), Comunicação Alternativa e Aumentativa (CAA), Integração Sensorial (IS) e PediaSuit.'
    );
    insertKb.run(
      'Unidades e Horário de Atendimento em Cuiabá/MT',
      'Unidades',
      'Matriz: Rua Major Gama, 950, Centro Sul - Cuiabá/MT. Filial: Rua Barão de Melgaço, 2350, Edifício Barão Center, Sala 104, Centro Sul - Cuiabá/MT. Horário: Segunda a Sexta das 8h às 18h. Telefones: (65) 99989-3202 e (65) 99233-0091.'
    );
    insertKb.run(
      'Regra de Confirmação de Agendamento',
      'Agendamento',
      'As solicitações realizadas pelo formulário do site ficam registradas como pendentes na agenda da clínica até a confirmação oficial da recepção.'
    );
  }

  // One-time upgrade to Espaço Adapta T.O (v4) preserving existing users & appointments
  const v4Flag = db
    .prepare("SELECT value FROM site_settings WHERE key = 'espaco_adapta_to_v4'")
    .get() as { value: string } | undefined;

  if (!v4Flag) {
    const insertSetting = db.prepare(
      "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))"
    );
    insertSetting.run('theme', JSON.stringify(DEFAULT_SITE_SETTINGS.theme));
    insertSetting.run('content', JSON.stringify(DEFAULT_SITE_SETTINGS.content));
    insertSetting.run('images', JSON.stringify(DEFAULT_SITE_SETTINGS.images));
    insertSetting.run('contact', JSON.stringify(DEFAULT_SITE_SETTINGS.contact));
    insertSetting.run('ai', JSON.stringify(DEFAULT_SITE_SETTINGS.ai));

    // In-place update of existing specialty rows to the 9 Espaço Adapta T.O specialties
    // so existing appointment foreign keys remain 100% valid
    const existingSpecs = db
      .prepare('SELECT id FROM specialties ORDER BY id ASC')
      .all() as Array<{ id: number }>;

    const updateSpecById = db.prepare(`
      UPDATE specialties
      SET slug = ?, name = ?, icon = ?, short_description = ?, full_description = ?,
          target_audience = ?, objectives = ?, how_it_works = ?,
          confirmation_status = ?, active = 1, sort_order = ?
      WHERE id = ?
    `);
    const insertSpec = db.prepare(`
      INSERT INTO specialties (
        slug, name, icon, short_description, full_description,
        target_audience, objectives, how_it_works, confirmation_status, active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    const activeSpecIds: number[] = [];
    PEDIATRIC_SPECIALTIES.forEach((sp, idx) => {
      const targetRow = existingSpecs[idx];
      if (targetRow) {
        updateSpecById.run(
          sp.slug,
          sp.name,
          sp.icon,
          sp.shortDescription,
          sp.fullDescription,
          sp.targetAudience,
          sp.objectives,
          sp.howItWorks,
          sp.confirmationStatus,
          sp.sortOrder,
          targetRow.id
        );
        activeSpecIds.push(targetRow.id);
      } else {
        const res = insertSpec.run(
          sp.slug,
          sp.name,
          sp.icon,
          sp.shortDescription,
          sp.fullDescription,
          sp.targetAudience,
          sp.objectives,
          sp.howItWorks,
          sp.confirmationStatus,
          sp.sortOrder
        );
        activeSpecIds.push(Number(res.lastInsertRowid));
      }
    });

    // Deactivate extra legacy specialty rows beyond the 9 services
    if (existingSpecs.length > PEDIATRIC_SPECIALTIES.length) {
      for (let i = PEDIATRIC_SPECIALTIES.length; i < existingSpecs.length; i++) {
        db.prepare('UPDATE specialties SET active = 0 WHERE id = ?').run(existingSpecs[i].id);
      }
    }

    // Update placeholder professionals & weekly hours to Mon-Fri 8h-18h
    const existingProfs = db
      .prepare('SELECT id, name FROM professionals ORDER BY id ASC')
      .all() as Array<{ id: number; name: string }>;

    if (existingProfs[0] && existingProfs[0].name === 'Dra. Camila Mendes') {
      db.prepare(
        'UPDATE professionals SET name = ?, specialty_summary = ?, crfa = ?, bio = ?, working_hours_json = ? WHERE id = ?'
      ).run(
        DEFAULT_PROFESSIONALS_SEED[0].name,
        DEFAULT_PROFESSIONALS_SEED[0].specialtySummary,
        DEFAULT_PROFESSIONALS_SEED[0].crfa,
        DEFAULT_PROFESSIONALS_SEED[0].bio,
        JSON.stringify(DEFAULT_WEEKLY_SCHEDULE),
        existingProfs[0].id
      );
    }
    if (existingProfs[1] && existingProfs[1].name === 'Dr. Lucas Ferreira') {
      db.prepare(
        'UPDATE professionals SET name = ?, specialty_summary = ?, crfa = ?, bio = ?, working_hours_json = ? WHERE id = ?'
      ).run(
        DEFAULT_PROFESSIONALS_SEED[1].name,
        DEFAULT_PROFESSIONALS_SEED[1].specialtySummary,
        DEFAULT_PROFESSIONALS_SEED[1].crfa,
        DEFAULT_PROFESSIONALS_SEED[1].bio,
        JSON.stringify(DEFAULT_WEEKLY_SCHEDULE),
        existingProfs[1].id
      );
    }

    db.prepare('UPDATE professionals SET working_hours_json = ?').run(
      JSON.stringify(DEFAULT_WEEKLY_SCHEDULE)
    );

    const linkStmt = db.prepare(
      'INSERT OR IGNORE INTO professional_specialties (professional_id, specialty_id) VALUES (?, ?)'
    );
    for (const prof of existingProfs) {
      for (const specId of activeSpecIds) {
        linkStmt.run(prof.id, specId);
      }
    }

    // Refresh FAQs cleanly
    db.prepare('DELETE FROM faqs').run();
    const insertFaq = db.prepare(
      'INSERT INTO faqs (question, answer, category, sort_order, active) VALUES (?, ?, ?, ?, 1)'
    );
    for (const f of DEFAULT_FAQS_SEED) {
      insertFaq.run(f.question, f.answer, f.category, f.sortOrder);
    }

    // Refresh knowledge_base with Espaço Adapta T.O details
    db.prepare('DELETE FROM knowledge_base').run();
    const insertKb = db.prepare(
      'INSERT INTO knowledge_base (title, category, content, active) VALUES (?, ?, ?, 1)'
    );
    insertKb.run(
      'Sobre o Espaço Adapta T.O (Especialização em TEA)',
      'Institucional',
      'O Espaço Adapta T.O é uma clínica especializada no atendimento multidisciplinar de pessoas com Transtorno do Espectro Autista (TEA), fundada em 2019 por Sumara Najla (Terapeuta Ocupacional) em parceria administrativa com sua irmã Sâmara Ribeiro.'
    );
    insertKb.run(
      'Abordagens Terapêuticas Baseadas em Evidências',
      'Abordagens',
      'Utilizamos Análise do Comportamento Aplicada (ABA), Modelo Denver de Intervenção Precoce (ESDM), Comunicação Alternativa e Aumentativa (CAA), Integração Sensorial (IS) e PediaSuit.'
    );
    insertKb.run(
      'Unidades e Horário de Atendimento em Cuiabá/MT',
      'Unidades',
      'Matriz: Rua Major Gama, 950, Centro Sul - Cuiabá/MT. Filial: Rua Barão de Melgaço, 2350, Edifício Barão Center, Sala 104, Centro Sul - Cuiabá/MT. Horário: Segunda a Sexta das 8h às 18h. Telefones: (65) 99989-3202 e (65) 99233-0091.'
    );
    insertKb.run(
      'Regra de Confirmação de Agendamento',
      'Agendamento',
      'As solicitações realizadas pelo formulário do site ficam registradas como pendentes na agenda da clínica até a confirmação oficial da recepção.'
    );

    insertSetting.run('espaco_adapta_to_v4', '1');
  }

  // Idempotent cleanup of old "Agenda ao vivo" booking copy for already-seeded DBs
  const v5BookingCopyFlag = db
    .prepare("SELECT value FROM site_settings WHERE key = 'remove_live_agenda_copy_v5'")
    .get() as { value: string } | undefined;

  if (!v5BookingCopyFlag) {
    const contentRow = db
      .prepare("SELECT value FROM site_settings WHERE key = 'content'")
      .get() as { value: string } | undefined;
    if (contentRow?.value) {
      try {
        const parsedContent = JSON.parse(contentRow.value) as Record<string, unknown>;
        let changed = false;
        if (parsedContent.bookingPageKicker === 'Agenda ao vivo · Espaço Adapta T.O') {
          parsedContent.bookingPageKicker = DEFAULT_SITE_SETTINGS.content.bookingPageKicker;
          changed = true;
        }
        if (
          typeof parsedContent.bookingPageSubtitle === 'string' &&
          parsedContent.bookingPageSubtitle.includes('agenda em tempo real')
        ) {
          parsedContent.bookingPageSubtitle = DEFAULT_SITE_SETTINGS.content.bookingPageSubtitle;
          changed = true;
        }
        if (changed) {
          db.prepare(
            "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('content', ?, datetime('now'))"
          ).run(JSON.stringify(parsedContent));
        }
      } catch {
        // ignore JSON parse issues
      }
    }
    db.prepare(
      "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('remove_live_agenda_copy_v5', '1', datetime('now'))"
    ).run();
  }

  // Idempotent redesign upgrade (v6): soften palette & upgrade default photos/copy without overriding custom admin edits
  const v6RedesignFlag = db
    .prepare("SELECT value FROM site_settings WHERE key = 'espaco_adapta_redesign_v6'")
    .get() as { value: string } | undefined;

  if (!v6RedesignFlag) {
    const themeRow = db
      .prepare("SELECT value FROM site_settings WHERE key = 'theme'")
      .get() as { value: string } | undefined;
    if (themeRow?.value) {
      try {
        const parsedTheme = JSON.parse(themeRow.value) as Record<string, string>;
        if (parsedTheme.forest === '#E04F6D' && parsedTheme.sage === '#F3D0DC') {
          db.prepare(
            "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('theme', ?, datetime('now'))"
          ).run(JSON.stringify(DEFAULT_SITE_SETTINGS.theme));
        }
      } catch {
        // ignore JSON parse issues
      }
    }

    const imagesRow = db
      .prepare("SELECT value FROM site_settings WHERE key = 'images'")
      .get() as { value: string } | undefined;
    if (imagesRow?.value) {
      try {
        const parsedImages = JSON.parse(imagesRow.value) as Record<string, unknown>;
        if (
          parsedImages.heroImage === '/src/assets/images/hero_clinic_speech_therapy_1795193184901.jpg' ||
          parsedImages.aboutSessionImage === '/src/assets/images/clinic_therapy_session_1795193185634.jpg'
        ) {
          db.prepare(
            "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('images', ?, datetime('now'))"
          ).run(JSON.stringify(DEFAULT_SITE_SETTINGS.images));
        }
      } catch {
        // ignore JSON parse issues
      }
    }

    const contentRow = db
      .prepare("SELECT value FROM site_settings WHERE key = 'content'")
      .get() as { value: string } | undefined;
    if (contentRow?.value) {
      try {
        const parsedContent = JSON.parse(contentRow.value) as Record<string, unknown>;
        let changed = false;
        if (
          parsedContent.heroTitle ===
          'Clínica especializada para atendimento em TEA (Transtorno do Espectro Autista)'
        ) {
          parsedContent.heroTitle = DEFAULT_SITE_SETTINGS.content.heroTitle;
          parsedContent.heroSubtitle = DEFAULT_SITE_SETTINGS.content.heroSubtitle;
          parsedContent.heroSecondaryButton = DEFAULT_SITE_SETTINGS.content.heroSecondaryButton;
          parsedContent.introHighlights = DEFAULT_SITE_SETTINGS.content.introHighlights;
          parsedContent.differentials = DEFAULT_SITE_SETTINGS.content.differentials;
          changed = true;
        }
        if (changed) {
          db.prepare(
            "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('content', ?, datetime('now'))"
          ).run(JSON.stringify(parsedContent));
        }
      } catch {
        // ignore JSON parse issues
      }
    }

    db.prepare(
      "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('espaco_adapta_redesign_v6', '1', datetime('now'))"
    ).run();
  }

  // Idempotent removal of founders_sumara_samara photo from seeded DBs
  const v7NoSamaraPhotoFlag = db
    .prepare("SELECT value FROM site_settings WHERE key = 'remove_samara_photo_v7'")
    .get() as { value: string } | undefined;

  if (!v7NoSamaraPhotoFlag) {
    const imagesRow = db
      .prepare("SELECT value FROM site_settings WHERE key = 'images'")
      .get() as { value: string } | undefined;
    if (imagesRow?.value) {
      try {
        const parsedImages = JSON.parse(imagesRow.value) as Record<string, unknown>;
        if (parsedImages.aboutSpaceImage === '/src/assets/images/founders_sumara_samara_1795309875618.jpg') {
          parsedImages.aboutSpaceImage = DEFAULT_SITE_SETTINGS.images.aboutSpaceImage;
          db.prepare(
            "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('images', ?, datetime('now'))"
          ).run(JSON.stringify(parsedImages));
        }
      } catch {
        // ignore JSON parse issues
      }
    }
    db.prepare(
      "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('remove_samara_photo_v7', '1', datetime('now'))"
    ).run();
  }

  // Idempotent update of heroImage to uploaded clinic facade photo
  const v8HeroFacadeFlag = db
    .prepare("SELECT value FROM site_settings WHERE key = 'hero_facade_frente_v8'")
    .get() as { value: string } | undefined;

  if (!v8HeroFacadeFlag) {
    const imagesRow = db
      .prepare("SELECT value FROM site_settings WHERE key = 'images'")
      .get() as { value: string } | undefined;
    if (imagesRow?.value) {
      try {
        const parsedImages = JSON.parse(imagesRow.value) as Record<string, unknown>;
        parsedImages.heroImage = '/assets/aistudio/frente_0dccb97b.jpg';
        if (Array.isArray(parsedImages.galleryImages)) {
          parsedImages.galleryImages = parsedImages.galleryImages.map((item) =>
            item === '/src/assets/images/hero_adapta_clinic_1795309876444.jpg'
              ? '/assets/aistudio/frente_0dccb97b.jpg'
              : item
          );
        }
        db.prepare(
          "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('images', ?, datetime('now'))"
        ).run(JSON.stringify(parsedImages));
      } catch {
        // ignore JSON parse issues
      }
    }
    db.prepare(
      "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('hero_facade_frente_v8', '1', datetime('now'))"
    ).run();
  }
}
