import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Express, Request, Response } from 'express';
import { IS_EPHEMERAL_STORAGE, UPLOADS_DIR, db } from './db.ts';
import {
  createEditorUnlockToken,
  createSessionToken,
  hashPassword,
  requireAdmin,
  requireAuth,
  verifyEditorUnlockToken,
  verifyPassword,
  type AuthenticatedRequest,
} from './auth.ts';
import { DEFAULT_SITE_SETTINGS, getSiteSettings } from './seed.ts';
import {
  getAvailableSlotsForDate,
  getClinicNowParts,
  getLiveWeekSchedule,
  getMonthAvailability,
} from './availability.ts';
import { checkAiRateLimit, generateAssistantReply, streamAssistantReply } from './ai.ts';
import type { AppointmentStatus, WeeklySchedule } from '../src/types.ts';

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parsePositiveInt(raw: unknown): number | null {
  const str = String(raw ?? '').trim();
  if (!/^\d+$/.test(str)) return null;
  const num = Number(str);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
}

const SAFE_IMAGE_URL_RE = /^(\/(src\/)?assets\/|\/uploads\/|https?:\/\/|data:image\/(png|jpeg|jpg|webp);base64,)/i;

function sanitizeImageUrl(val: unknown, fallback = ''): string {
  const trimmed = String(val ?? '').trim();
  if (!trimmed) return '';
  return SAFE_IMAGE_URL_RE.test(trimmed) ? trimmed : fallback;
}

function sanitizeExternalUrl(val: unknown, fallback = ''): string {
  const trimmed = String(val ?? '').trim();
  if (!trimmed) return '';
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return fallback;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : fallback;
  } catch {
    return fallback;
  }
}

const loginRateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginRateBuckets.get(ip);
  if (!entry || now > entry.resetAt) {
    loginRateBuckets.set(ip, { count: 1, resetAt: now + 5 * 60_000 });
    return true;
  }
  if (entry.count >= 25) {
    return false;
  }
  entry.count += 1;
  return true;
}

function logAudit(userId: number | null, action: string, details = ''): void {
  try {
    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(
      userId,
      action,
      details
    );
  } catch {
    // non-fatal
  }
}

function mapSpecialtyRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    targetAudience: row.target_audience,
    objectives: row.objectives,
    howItWorks: row.how_it_works,
    confirmationStatus: row.confirmation_status,
    active: Boolean(row.active),
    sortOrder: row.sort_order,
  };
}

function mapProfessionalRow(row: any) {
  let workingHours: WeeklySchedule = {};
  try {
    workingHours = JSON.parse(row.working_hours_json) as WeeklySchedule;
  } catch {
    workingHours = {};
  }
  const specRows = db
    .prepare('SELECT specialty_id FROM professional_specialties WHERE professional_id = ?')
    .all(row.id) as Array<{ specialty_id: number }>;

  return {
    id: row.id,
    name: row.name,
    specialtySummary: row.specialty_summary,
    crfa: row.crfa,
    bio: row.bio,
    photoUrl: row.photo_url,
    active: Boolean(row.active),
    workingHours,
    specialtyIds: specRows.map((s) => s.specialty_id),
  };
}

function mapAppointmentRow(row: any) {
  return {
    id: row.id,
    protocolCode: row.protocol_code,
    specialtyId: row.specialty_id,
    specialtyName: row.specialty_name ?? '',
    professionalId: row.professional_id,
    professionalName: row.professional_name ?? '',
    date: row.date,
    time: row.time,
    patientName: row.patient_name,
    patientPhone: row.patient_phone,
    patientEmail: row.patient_email,
    guardianName: row.guardian_name,
    lgpdConsent: Boolean(row.lgpd_consent),
    notes: row.notes,
    status: row.status as AppointmentStatus,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function registerRoutes(app: Express): void {
  // === PUBLIC BOOTSTRAP ===
  app.get('/api/public/bootstrap', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const settings = getSiteSettings();
    const specialties = db
      .prepare('SELECT * FROM specialties WHERE active = 1 ORDER BY sort_order ASC, id ASC')
      .all()
      .map(mapSpecialtyRow);

    const professionals = db
      .prepare('SELECT * FROM professionals WHERE active = 1 ORDER BY id ASC')
      .all()
      .map(mapProfessionalRow);

    const faqs = db
      .prepare('SELECT id, question, answer, category, sort_order, active FROM faqs WHERE active = 1 ORDER BY sort_order ASC, id ASC')
      .all()
      .map((f: any) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category,
        sortOrder: f.sort_order,
        active: Boolean(f.active),
      }));

    res.json({
      settings,
      specialties,
      professionals,
      faqs,
      aiConfigured: Boolean(
        settings.ai.enabled &&
          process.env.GEMINI_API_KEY &&
          process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
      ),
    });
  });

  // === AVAILABILITY & PUBLIC BOOKING ===
  app.get('/api/appointments/availability', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const professionalId = Number(req.query.professionalId);
    const date = String(req.query.date || '');
    if (!professionalId || !date) {
      res.status(400).json({ error: 'Informe o profissional e a data.' });
      return;
    }
    const settings = getSiteSettings();
    const result = getAvailableSlotsForDate(
      professionalId,
      date,
      settings.contact.timezone,
      undefined,
      settings.contact.address
    );
    res.json(result);
  });

  app.get('/api/appointments/month-availability', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const professionalId = Number(req.query.professionalId);
    const month = String(req.query.month || '');
    if (!professionalId || !month) {
      res.status(400).json({ error: 'Informe o profissional e o mês (YYYY-MM).' });
      return;
    }
    const settings = getSiteSettings();
    const days = getMonthAvailability(
      professionalId,
      month,
      settings.contact.timezone,
      settings.contact.address
    );
    res.json({ days });
  });

  app.get('/api/appointments/live-schedule', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const professionalIdParam = req.query.professionalId;
    const startDate = req.query.startDate ? String(req.query.startDate).trim() : undefined;
    const settings = getSiteSettings();

    const activeProfs = db
      .prepare('SELECT id, name, specialty_summary, crfa, photo_url, working_hours_json FROM professionals WHERE active = 1 ORDER BY id ASC')
      .all() as Array<{
      id: number;
      name: string;
      specialty_summary: string;
      crfa: string;
      photo_url: string;
      working_hours_json: string;
    }>;

    const targetId =
      professionalIdParam && professionalIdParam !== 'all'
        ? Number(professionalIdParam)
        : activeProfs[0]?.id || 0;

    if (!targetId) {
      res.json({
        updatedAt: new Date().toISOString(),
        clinicAddress: settings.contact.address,
        days: [],
      });
      return;
    }

    const days = getLiveWeekSchedule(
      targetId,
      settings.contact.timezone,
      settings.contact.address,
      startDate
    );

    res.json({
      updatedAt: new Date().toISOString(),
      clinicAddress: settings.contact.address,
      professionalId: targetId,
      days,
    });
  });

  app.post('/api/appointments', (req: Request, res: Response) => {
    const {
      specialtyId,
      professionalId,
      date,
      time,
      patientName,
      patientPhone,
      patientEmail,
      guardianName,
      lgpdConsent,
      notes,
    } = req.body || {};

    const cleanName = String(patientName || '').trim();
    const cleanPhone = String(patientPhone || '').trim();
    const cleanEmail = String(patientEmail || '').trim();
    const cleanGuardian = String(guardianName || '').trim();
    const cleanNotes = String(notes || '').trim().slice(0, 500);
    const specId = Number(specialtyId);
    const profId = Number(professionalId);
    const dateStr = String(date || '').trim();
    const timeStr = String(time || '').trim();

    if (!specId || !profId || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || !/^\d{2}:\d{2}$/.test(timeStr)) {
      res.status(400).json({ error: 'Preencha atendimento, profissional, data e horário válidos.' });
      return;
    }
    if (cleanName.length < 3 || cleanName.length > 120) {
      res.status(400).json({ error: 'Informe o nome completo do paciente.' });
      return;
    }
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      res.status(400).json({ error: 'Informe um telefone válido com DDD.' });
      return;
    }
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Formato de e-mail inválido.' });
      return;
    }
    if (!lgpdConsent) {
      res.status(400).json({ error: 'É necessário concordar com a Política de Privacidade (LGPD).' });
      return;
    }

    const spec = db.prepare('SELECT id, name, active FROM specialties WHERE id = ? AND active = 1').get(specId) as
      | { id: number; name: string }
      | undefined;
    const prof = db.prepare('SELECT id, name, active FROM professionals WHERE id = ? AND active = 1').get(profId) as
      | { id: number; name: string }
      | undefined;

    if (!spec || !prof) {
      res.status(404).json({ error: 'Atendimento ou profissional não encontrado.' });
      return;
    }

    const settings = getSiteSettings();
    const protocolCode = `ADP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    try {
      const createTx = db.transaction(() => {
        const availability = getAvailableSlotsForDate(profId, dateStr, settings.contact.timezone);
        if (!availability.slots.includes(timeStr)) {
          throw new Error('SLOT_UNAVAILABLE');
        }
        const info = db
          .prepare(
            `INSERT INTO appointments (
              protocol_code, specialty_id, professional_id, date, time,
              patient_name, patient_phone, patient_email, guardian_name, lgpd_consent, notes, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'pendente')`
          )
          .run(
            protocolCode,
            specId,
            profId,
            dateStr,
            timeStr,
            cleanName,
            cleanPhone,
            cleanEmail,
            cleanGuardian,
            cleanNotes
          );
        return info.lastInsertRowid;
      });

      const createdId = createTx();
      res.status(201).json({
        id: createdId,
        protocolCode,
        status: 'pendente',
        specialtyName: spec.name,
        professionalName: prof.name,
        date: dateStr,
        time: timeStr,
        patientName: cleanName,
        message:
          'Solicitação registrada com sucesso! Nossa equipe analisará a agenda e confirmará o horário pelo WhatsApp ou telefone.',
      });
    } catch (err: any) {
      if (err?.message === 'SLOT_UNAVAILABLE' || String(err?.code) === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(409).json({
          error: 'Este horário acabou de ser reservado ou não está mais disponível. Escolha outro horário.',
        });
        return;
      }
      console.error('Appointment creation error:', err);
      res.status(500).json({ error: 'Erro interno ao registrar sua solicitação. Tente novamente.' });
    }
  });

  // === PATIENT PROTOCOL LOOKUP & SELF-SERVICE CANCELLATION (LGPD-SAFE) ===
  app.get('/api/appointments/lookup', (req: Request, res: Response) => {
    const protocol = String(req.query.protocol || '').trim().toUpperCase();
    const phoneLast4 = String(req.query.phoneLast4 || '').replace(/\D/g, '');

    if (!/^ADP-[A-Z0-9]{4,10}$/.test(protocol) || phoneLast4.length !== 4) {
      res.status(400).json({
        error: 'Informe o código de protocolo válido (ex.: ADP-A1B2C3) e os 4 últimos dígitos do telefone.',
      });
      return;
    }

    const row = db
      .prepare(
        `SELECT a.*, s.name as specialty_name, p.name as professional_name
         FROM appointments a
         LEFT JOIN specialties s ON s.id = a.specialty_id
         LEFT JOIN professionals p ON p.id = a.professional_id
         WHERE UPPER(a.protocol_code) = ?`
      )
      .get(protocol) as any;

    if (!row) {
      res.status(404).json({ error: 'Protocolo não encontrado. Verifique o código digitado.' });
      return;
    }

    const dbPhoneDigits = String(row.patient_phone || '').replace(/\D/g, '');
    if (dbPhoneDigits.slice(-4) !== phoneLast4) {
      res.status(404).json({
        error: 'Os últimos 4 dígitos do telefone não conferem com este protocolo.',
      });
      return;
    }

    const firstName = String(row.patient_name || '').trim().split(/\s+/)[0] || 'Paciente';

    res.json({
      appointment: {
        protocolCode: row.protocol_code,
        status: row.status as AppointmentStatus,
        date: row.date,
        time: row.time,
        specialtyName: row.specialty_name ?? '',
        professionalName: row.professional_name ?? '',
        patientFirstName: firstName,
        createdAt: row.created_at,
      },
    });
  });

  app.post('/api/appointments/request-cancel', (req: Request, res: Response) => {
    const protocol = String(req.body?.protocolCode || '').trim().toUpperCase();
    const phoneLast4 = String(req.body?.phoneLast4 || '').replace(/\D/g, '');
    const reason = String(req.body?.reason || '').trim().slice(0, 240);

    if (!/^ADP-[A-Z0-9]{4,10}$/.test(protocol) || phoneLast4.length !== 4) {
      res.status(400).json({ error: 'Protocolo ou últimos 4 dígitos do telefone inválidos.' });
      return;
    }

    const row = db
      .prepare('SELECT * FROM appointments WHERE UPPER(protocol_code) = ?')
      .get(protocol) as any;

    if (!row || String(row.patient_phone || '').replace(/\D/g, '').slice(-4) !== phoneLast4) {
      res.status(404).json({ error: 'Agendamento não localizado para os dados informados.' });
      return;
    }

    if (row.status === 'cancelado') {
      res.status(400).json({ error: 'Este agendamento já está cancelado.' });
      return;
    }

    const noteLine = `[Portal do paciente] Cancelamento solicitado${reason ? `: ${reason}` : '.'}`;
    const nextAdminNotes = row.admin_notes ? `${row.admin_notes}\n${noteLine}` : noteLine;

    db.prepare(
      "UPDATE appointments SET status = 'cancelado', admin_notes = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(nextAdminNotes.slice(0, 1000), row.id);

    logAudit(null, 'PATIENT_CANCEL_APPOINTMENT', `protocol=${row.protocol_code}`);
    res.json({
      ok: true,
      status: 'cancelado',
      message: 'Solicitação de cancelamento registrada. O horário foi liberado na agenda.',
    });
  });

  // === CONTACT FORM ===
  app.post('/api/contact', (req: Request, res: Response) => {
    const { name, phone, email, subject, message, lgpdConsent } = req.body || {};
    const cleanName = String(name || '').trim();
    const cleanPhone = String(phone || '').trim();
    const cleanEmail = String(email || '').trim();
    const cleanSubject = String(subject || '').trim().slice(0, 120);
    const cleanMessage = String(message || '').trim().slice(0, 2000);

    if (cleanName.length < 2) {
      res.status(400).json({ error: 'Informe seu nome.' });
      return;
    }
    if (cleanPhone.replace(/\D/g, '').length < 10) {
      res.status(400).json({ error: 'Informe um telefone ou WhatsApp válido com DDD.' });
      return;
    }
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Formato de e-mail inválido.' });
      return;
    }
    if (cleanMessage.length < 5) {
      res.status(400).json({ error: 'Escreva uma mensagem com pelo menos 5 caracteres.' });
      return;
    }
    if (!lgpdConsent) {
      res.status(400).json({ error: 'É necessário aceitar a Política de Privacidade (LGPD).' });
      return;
    }

    db.prepare(
      `INSERT INTO contact_messages (name, phone, email, subject, message, lgpd_consent, status)
       VALUES (?, ?, ?, ?, ?, 1, 'novo')`
    ).run(cleanName, cleanPhone, cleanEmail, cleanSubject, cleanMessage);

    res.status(201).json({
      message: 'Mensagem enviada com sucesso! Nossa equipe responderá em breve.',
    });
  });

  // === AI VIRTUAL ASSISTANT ===
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkAiRateLimit(clientIp)) {
      res.status(429).json({
        error: 'Muitas mensagens em sequência. Aguarde um instante ou fale conosco pelo WhatsApp.',
      });
      return;
    }

    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Envie uma pergunta válida.' });
      return;
    }

    try {
      const result = await generateAssistantReply(message, Array.isArray(history) ? history : []);
      if (result.unavailable) {
        res.status(503).json(result);
        return;
      }
      res.json(result);
    } catch (error) {
      console.error('AI assistant error:', error);
      res.status(500).json({
        error:
          'Ocorreu uma instabilidade temporária no atendimento virtual. Por favor, tente novamente em instantes.',
      });
    }
  });

  app.post('/api/ai/chat/stream', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkAiRateLimit(clientIp)) {
      res.status(429).json({
        error: 'Muitas mensagens em sequência. Aguarde um instante para continuar.',
      });
      return;
    }

    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Envie uma pergunta válida.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(': connected\n\n');

    let clientDisconnected = false;
    res.on('close', () => {
      if (!res.writableEnded) {
        clientDisconnected = true;
      }
    });

    const sendEvent = (payload: Record<string, unknown>) => {
      if (clientDisconnected || res.writableEnded) return;
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    try {
      const result = await streamAssistantReply(
        message,
        Array.isArray(history) ? history : [],
        (chunkText) => {
          sendEvent({ type: 'chunk', text: chunkText });
        }
      );

      if (result.unavailable) {
        sendEvent({ type: 'error', error: result.reply, unavailable: true });
      } else {
        sendEvent({
          type: 'done',
          reply: result.reply,
          sources: result.sources || [],
        });
      }
    } catch (error) {
      console.error('AI streaming error:', error);
      sendEvent({
        type: 'error',
        error:
          'Ocorreu uma instabilidade temporária ao gerar a resposta. Tente novamente em instantes.',
      });
    } finally {
      if (!res.writableEnded) {
        res.end();
      }
    }
  });

  // === AUTHENTICATION ===
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkLoginRateLimit(clientIp)) {
      res.status(429).json({
        error: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
      });
      return;
    }

    const { email, password } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const rawPassword = String(password || '');

    if (!cleanEmail || !rawPassword) {
      res.status(400).json({ error: 'Informe e-mail e senha.' });
      return;
    }

    const user = db
      .prepare('SELECT * FROM users WHERE LOWER(email) = ? AND active = 1')
      .get(cleanEmail) as any;

    if (!user || !verifyPassword(rawPassword, user.password_hash)) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
      return;
    }

    const token = createSessionToken(user.id, user.role);
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.cookie('adaptato_session', token, {
      httpOnly: true,
      sameSite: isSecure ? 'none' : 'lax',
      secure: isSecure,
      path: '/',
      maxAge: 1000 * 60 * 60 * 12,
    });
    logAudit(user.id, 'LOGIN', `Usuário ${user.email} autenticou`);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        professionalId: user.professional_id,
        active: Boolean(user.active),
      },
    });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.clearCookie('adaptato_session', {
      path: '/',
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
    });
    res.json({ ok: true });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.authUser });
  });

  app.post('/api/auth/change-password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword || String(newPassword).length < 6) {
      res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.authUser!.id) as
      | { password_hash: string }
      | undefined;

    if (!row || !verifyPassword(String(currentPassword), row.password_hash)) {
      res.status(400).json({ error: 'Senha atual incorreta.' });
      return;
    }

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
      hashPassword(String(newPassword)),
      req.authUser!.id
    );
    logAudit(req.authUser!.id, 'CHANGE_PASSWORD', 'Senha de acesso atualizada');
    res.json({ message: 'Senha atualizada com sucesso.' });
  });

  // === PASSWORD-PROTECTED VISUAL EDITOR (COLORS & PHOTOS) ===
  app.post(
    '/api/auth/verify-editor-password',
    requireAuth,
    requireAdmin,
    (req: AuthenticatedRequest, res: Response) => {
      const { password } = req.body || {};
      const row = db
        .prepare("SELECT value FROM site_settings WHERE key = 'editor_password_hash'")
        .get() as { value: string } | undefined;

      if (!row || !verifyPassword(String(password || ''), row.value)) {
        res.status(401).json({ error: 'Senha do editor visual incorreta.' });
        return;
      }

      const editorToken = createEditorUnlockToken(req.authUser!.id);
      logAudit(req.authUser!.id, 'UNLOCK_VISUAL_EDITOR', 'Editor visual de cores e fotos desbloqueado');
      res.json({ editorToken });
    }
  );

  app.post(
    '/api/admin/editor-password',
    requireAuth,
    requireAdmin,
    (req: AuthenticatedRequest, res: Response) => {
      const { currentEditorPassword, newEditorPassword } = req.body || {};
      if (!newEditorPassword || String(newEditorPassword).length < 6) {
        res.status(400).json({ error: 'A nova senha do editor visual deve ter ao menos 6 caracteres.' });
        return;
      }
      const row = db
        .prepare("SELECT value FROM site_settings WHERE key = 'editor_password_hash'")
        .get() as { value: string } | undefined;

      if (row && !verifyPassword(String(currentEditorPassword || ''), row.value)) {
        res.status(400).json({ error: 'Senha atual do editor visual incorreta.' });
        return;
      }

      db.prepare("INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES ('editor_password_hash', ?, datetime('now'))").run(
        hashPassword(String(newEditorPassword))
      );
      logAudit(req.authUser!.id, 'UPDATE_EDITOR_PASSWORD', 'Senha do editor visual alterada');
      res.json({ message: 'Senha do editor visual alterada com sucesso.' });
    }
  );

  // === ADMIN & PROFESSIONAL DASHBOARD ===
  app.get('/api/admin/dashboard', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const isProf = user.role === 'professional';
    const whereClause = isProf ? 'WHERE a.professional_id = ?' : '';
    const params = isProf ? [user.professionalId ?? -1] : [];

    const statsRow = db
      .prepare(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'confirmado' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) as cancelled
         FROM appointments a ${whereClause}`
      )
      .get(...params) as { total: number; pending: number; confirmed: number; cancelled: number };

    const settings = getSiteSettings();
    const today = getClinicNowParts(settings.contact.timezone).date;

    const upcomingRows = db
      .prepare(
        `SELECT a.*, s.name as specialty_name, p.name as professional_name
         FROM appointments a
         LEFT JOIN specialties s ON s.id = a.specialty_id
         LEFT JOIN professionals p ON p.id = a.professional_id
         ${isProf ? 'WHERE a.professional_id = ? AND' : 'WHERE'} a.date >= ? AND a.status IN ('pendente', 'confirmado')
         ORDER BY a.date ASC, a.time ASC
         LIMIT 12`
      )
      .all(...(isProf ? [user.professionalId ?? -1, today] : [today]));

    res.json({
      total: statsRow.total || 0,
      pending: statsRow.pending || 0,
      confirmed: statsRow.confirmed || 0,
      cancelled: statsRow.cancelled || 0,
      upcoming: upcomingRows.map(mapAppointmentRow),
    });
  });

  // === APPOINTMENTS MANAGEMENT (ADMIN + PROFESSIONAL RBAC) ===
  app.get('/api/admin/appointments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const { status, professionalId, date, dateFrom, dateTo, search } = req.query;

    const conditions: string[] = [];
    const params: any[] = [];

    if (user.role === 'professional') {
      conditions.push('a.professional_id = ?');
      params.push(user.professionalId ?? -1);
    } else if (professionalId && professionalId !== 'all') {
      conditions.push('a.professional_id = ?');
      params.push(Number(professionalId));
    }

    if (status && status !== 'all') {
      conditions.push('a.status = ?');
      params.push(String(status));
    }
    if (date) {
      conditions.push('a.date = ?');
      params.push(String(date));
    }
    if (dateFrom) {
      conditions.push('a.date >= ?');
      params.push(String(dateFrom));
    }
    if (dateTo) {
      conditions.push('a.date <= ?');
      params.push(String(dateTo));
    }
    if (search) {
      const like = `%${String(search).trim()}%`;
      conditions.push('(a.patient_name LIKE ? OR a.patient_phone LIKE ? OR a.protocol_code LIKE ?)');
      params.push(like, like, like);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = db
      .prepare(
        `SELECT a.*, s.name as specialty_name, p.name as professional_name
         FROM appointments a
         LEFT JOIN specialties s ON s.id = a.specialty_id
         LEFT JOIN professionals p ON p.id = a.professional_id
         ${where}
         ORDER BY a.date DESC, a.time ASC`
      )
      .all(...params);

    res.json({ appointments: rows.map(mapAppointmentRow) });
  });

  app.post('/api/admin/appointments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const {
      specialtyId,
      professionalId,
      date,
      time,
      patientName,
      patientPhone,
      patientEmail,
      guardianName,
      notes,
      adminNotes,
      status,
    } = req.body || {};

    const specId = Number(specialtyId);
    const targetProfId =
      user.role === 'professional' ? user.professionalId ?? 0 : Number(professionalId);
    const dateStr = String(date || '').trim();
    const timeStr = String(time || '').trim();
    const cleanName = String(patientName || '').trim();
    const cleanPhone = String(patientPhone || '').trim();
    const cleanEmail = String(patientEmail || '').trim();
    const cleanGuardian = String(guardianName || '').trim();
    const cleanNotes = String(notes || '').trim().slice(0, 500);
    const cleanAdminNotes = String(adminNotes || '').trim().slice(0, 1000);
    const nextStatus: AppointmentStatus =
      status === 'confirmado' || status === 'pendente' ? status : 'confirmado';

    if (!specId || !targetProfId || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || !/^\d{2}:\d{2}$/.test(timeStr)) {
      res.status(400).json({ error: 'Informe especialidade, profissional, data e horário válidos.' });
      return;
    }
    if (cleanName.length < 2) {
      res.status(400).json({ error: 'Informe o nome do paciente.' });
      return;
    }
    if (cleanPhone.replace(/\D/g, '').length < 8) {
      res.status(400).json({ error: 'Informe um telefone válido.' });
      return;
    }

    const protocolCode = `ADP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    try {
      const insertTx = db.transaction(() => {
        const conflict = db
          .prepare(
            `SELECT id FROM appointments
             WHERE professional_id = ? AND date = ? AND time = ? AND status IN ('pendente', 'confirmado')`
          )
          .get(targetProfId, dateStr, timeStr);
        if (conflict) {
          throw new Error('SLOT_CONFLICT');
        }

        const info = db
          .prepare(
            `INSERT INTO appointments (
              protocol_code, specialty_id, professional_id, date, time,
              patient_name, patient_phone, patient_email, guardian_name, lgpd_consent, notes, admin_notes, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`
          )
          .run(
            protocolCode,
            specId,
            targetProfId,
            dateStr,
            timeStr,
            cleanName,
            cleanPhone,
            cleanEmail,
            cleanGuardian,
            cleanNotes,
            cleanAdminNotes,
            nextStatus
          );
        return Number(info.lastInsertRowid);
      });

      const createdId = insertTx();
      logAudit(user.id, 'CREATE_ADMIN_APPOINTMENT', `ID=${createdId} ${dateStr} ${timeStr}`);
      const created = db
        .prepare(
          `SELECT a.*, s.name as specialty_name, p.name as professional_name
           FROM appointments a
           LEFT JOIN specialties s ON s.id = a.specialty_id
           LEFT JOIN professionals p ON p.id = a.professional_id
           WHERE a.id = ?`
        )
        .get(createdId);
      res.status(201).json({ appointment: mapAppointmentRow(created) });
    } catch (err: any) {
      if (err?.message === 'SLOT_CONFLICT' || String(err?.code) === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(409).json({ error: 'Já existe um agendamento ativo para este profissional neste dia e horário.' });
        return;
      }
      console.error('Admin appointment creation error:', err);
      res.status(500).json({ error: 'Erro ao criar agendamento.' });
    }
  });

  app.patch('/api/admin/appointments/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }
    const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as any;
    if (!existing) {
      res.status(404).json({ error: 'Agendamento não encontrado.' });
      return;
    }

    if (user.role === 'professional' && existing.professional_id !== user.professionalId) {
      res.status(403).json({ error: 'Você só pode gerenciar agendamentos da sua própria agenda.' });
      return;
    }

    const {
      status,
      date,
      time,
      professionalId,
      specialtyId,
      patientName,
      patientPhone,
      patientEmail,
      guardianName,
      notes,
      adminNotes,
      skipSlotCheck,
    } = req.body || {};

    const nextStatus = status ? String(status) : existing.status;
    const nextDate = date ? String(date) : existing.date;
    const nextTime = time ? String(time) : existing.time;
    const nextProfId =
      user.role === 'admin' && professionalId ? Number(professionalId) : existing.professional_id;
    const nextSpecId =
      user.role === 'admin' && specialtyId ? Number(specialtyId) : existing.specialty_id;
    const nextPatientName =
      user.role === 'admin' && patientName !== undefined
        ? String(patientName).trim()
        : existing.patient_name;
    const nextPatientPhone =
      user.role === 'admin' && patientPhone !== undefined
        ? String(patientPhone).trim()
        : existing.patient_phone;
    const nextPatientEmail =
      user.role === 'admin' && patientEmail !== undefined
        ? String(patientEmail).trim()
        : existing.patient_email;
    const nextGuardianName =
      user.role === 'admin' && guardianName !== undefined
        ? String(guardianName).trim()
        : existing.guardian_name;
    const nextNotes =
      notes !== undefined ? String(notes).trim().slice(0, 500) : existing.notes;
    const nextAdminNotes =
      adminNotes !== undefined ? String(adminNotes).slice(0, 1000) : existing.admin_notes;

    const validStatuses = ['pendente', 'confirmado', 'cancelado', 'reagendado'];
    if (!validStatuses.includes(nextStatus)) {
      res.status(400).json({ error: 'Status de agendamento inválido.' });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDate) || !/^\d{2}:\d{2}$/.test(nextTime)) {
      res.status(400).json({ error: 'Data ou horário inválidos.' });
      return;
    }
    if (!nextPatientName || nextPatientName.length < 2) {
      res.status(400).json({ error: 'Nome do paciente inválido.' });
      return;
    }

    const isTimeChanged =
      nextDate !== existing.date || nextTime !== existing.time || nextProfId !== existing.professional_id;

    try {
      const updateTx = db.transaction(() => {
        const effectiveStatus = nextStatus === 'reagendado' ? 'confirmado' : nextStatus;

        if (isTimeChanged && (effectiveStatus === 'pendente' || effectiveStatus === 'confirmado')) {
          if (!skipSlotCheck) {
            const settings = getSiteSettings();
            const avail = getAvailableSlotsForDate(
              nextProfId,
              nextDate,
              settings.contact.timezone,
              id
            );
            if (!avail.slots.includes(nextTime)) {
              throw new Error('SLOT_CONFLICT');
            }
          } else {
            const conflict = db
              .prepare(
                `SELECT id FROM appointments
                 WHERE professional_id = ? AND date = ? AND time = ? AND status IN ('pendente', 'confirmado') AND id != ?`
              )
              .get(nextProfId, nextDate, nextTime, id);
            if (conflict) {
              throw new Error('SLOT_CONFLICT');
            }
          }
        }

        db.prepare(
          `UPDATE appointments
           SET status = ?, date = ?, time = ?, professional_id = ?, specialty_id = ?,
               patient_name = ?, patient_phone = ?, patient_email = ?, guardian_name = ?,
               notes = ?, admin_notes = ?, updated_at = datetime('now')
           WHERE id = ?`
        ).run(
          effectiveStatus,
          nextDate,
          nextTime,
          nextProfId,
          nextSpecId,
          nextPatientName,
          nextPatientPhone,
          nextPatientEmail,
          nextGuardianName,
          nextNotes,
          nextAdminNotes,
          id
        );
      });

      updateTx();
      logAudit(user.id, 'UPDATE_APPOINTMENT', `ID=${id} status=${nextStatus} ${nextDate} ${nextTime}`);
      const updated = db
        .prepare(
          `SELECT a.*, s.name as specialty_name, p.name as professional_name
           FROM appointments a
           LEFT JOIN specialties s ON s.id = a.specialty_id
           LEFT JOIN professionals p ON p.id = a.professional_id
           WHERE a.id = ?`
        )
        .get(id);
      res.json({ appointment: mapAppointmentRow(updated) });
    } catch (err: any) {
      if (err?.message === 'SLOT_CONFLICT' || String(err?.code) === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(409).json({ error: 'Conflito de horário: já existe atendimento ou bloqueio nesse horário.' });
        return;
      }
      console.error('Update appointment error:', err);
      res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
    }
  });

  app.delete('/api/admin/appointments/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }
    const existing = db.prepare('SELECT id FROM appointments WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ error: 'Agendamento não encontrado.' });
      return;
    }
    db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
    logAudit(req.authUser!.id, 'DELETE_APPOINTMENT', `ID=${id}`);
    res.json({ ok: true });
  });

  // === BLOCKED DATES & HOLIDAYS ===
  app.get('/api/admin/blocks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const rows =
      user.role === 'professional'
        ? db
            .prepare(
              `SELECT b.*, p.name as professional_name FROM blocked_dates b
               LEFT JOIN professionals p ON p.id = b.professional_id
               WHERE b.professional_id IS NULL OR b.professional_id = ?
               ORDER BY b.date ASC`
            )
            .all(user.professionalId ?? -1)
        : db
            .prepare(
              `SELECT b.*, p.name as professional_name FROM blocked_dates b
               LEFT JOIN professionals p ON p.id = b.professional_id
               ORDER BY b.date ASC`
            )
            .all();

    res.json({
      blocks: rows.map((b: any) => ({
        id: b.id,
        professionalId: b.professional_id,
        professionalName: b.professional_name || 'Toda a clínica',
        date: b.date,
        startTime: b.start_time,
        endTime: b.end_time,
        reason: b.reason,
        createdAt: b.created_at,
      })),
    });
  });

  app.post('/api/admin/blocks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const { professionalId, date, startTime, endTime, reason } = req.body || {};
    const dateStr = String(date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      res.status(400).json({ error: 'Informe uma data válida (YYYY-MM-DD).' });
      return;
    }

    let targetProfId: number | null = professionalId ? Number(professionalId) : null;
    if (user.role === 'professional') {
      if (!user.professionalId) {
        res.status(403).json({ error: 'Perfil profissional não vinculado.' });
        return;
      }
      targetProfId = user.professionalId;
    }

    const sTime = startTime ? String(startTime).trim() : null;
    const eTime = endTime ? String(endTime).trim() : null;
    const cleanReason = String(reason || '').trim().slice(0, 160);

    const info = db
      .prepare(
        'INSERT INTO blocked_dates (professional_id, date, start_time, end_time, reason) VALUES (?, ?, ?, ?, ?)'
      )
      .run(targetProfId, dateStr, sTime, eTime, cleanReason);

    logAudit(user.id, 'CREATE_BLOCK', `date=${dateStr} prof=${targetProfId ?? 'ALL'}`);
    res.status(201).json({ id: info.lastInsertRowid });
  });

  app.delete('/api/admin/blocks/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }
    const block = db.prepare('SELECT * FROM blocked_dates WHERE id = ?').get(id) as any;
    if (!block) {
      res.status(404).json({ error: 'Bloqueio não encontrado.' });
      return;
    }
    if (user.role === 'professional' && block.professional_id !== user.professionalId) {
      res.status(403).json({ error: 'Você só pode remover bloqueios da sua própria agenda.' });
      return;
    }
    db.prepare('DELETE FROM blocked_dates WHERE id = ?').run(id);
    res.json({ ok: true });
  });

  // === SITE SETTINGS & PASSWORD-PROTECTED VISUAL EDITOR ===
  app.put('/api/admin/settings', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { theme, content, images, contact, ai, editorToken, resetTheme } = req.body || {};
    const current = getSiteSettings();

    const changingVisuals = Boolean(theme || images || resetTheme);
    if (changingVisuals) {
      const token = String(editorToken || '');
      if (!token || !verifyEditorUnlockToken(token, req.authUser!.id)) {
        res.status(403).json({
          error: 'Desbloqueie o Editor Visual com a senha de edição para modificar cores ou fotos do site.',
        });
        return;
      }
    }

    const upsert = db.prepare(
      "INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))"
    );

    if (resetTheme) {
      upsert.run('theme', JSON.stringify(DEFAULT_SITE_SETTINGS.theme));
    } else if (theme && typeof theme === 'object') {
      const HEX_RE = /^#[0-9a-fA-F]{6}$/;
      const sanitizedTheme: Record<string, string> = { ...current.theme };
      for (const key of Object.keys(DEFAULT_SITE_SETTINGS.theme) as Array<keyof typeof DEFAULT_SITE_SETTINGS.theme>) {
        const candidate = theme[key];
        if (typeof candidate === 'string' && HEX_RE.test(candidate.trim())) {
          sanitizedTheme[key] = candidate.trim();
        }
      }
      upsert.run('theme', JSON.stringify(sanitizedTheme));
    }

    if (images && typeof images === 'object') {
      const mergedImages = {
        heroImage:
          images.heroImage !== undefined
            ? sanitizeImageUrl(images.heroImage, current.images.heroImage)
            : current.images.heroImage,
        aboutSpaceImage:
          images.aboutSpaceImage !== undefined
            ? sanitizeImageUrl(images.aboutSpaceImage, current.images.aboutSpaceImage)
            : current.images.aboutSpaceImage,
        aboutSessionImage:
          images.aboutSessionImage !== undefined
            ? sanitizeImageUrl(images.aboutSessionImage, current.images.aboutSessionImage)
            : current.images.aboutSessionImage,
        specialtiesBannerImage:
          images.specialtiesBannerImage !== undefined
            ? sanitizeImageUrl(images.specialtiesBannerImage, current.images.specialtiesBannerImage)
            : current.images.specialtiesBannerImage,
        galleryImages: Array.isArray(images.galleryImages)
          ? images.galleryImages
              .map((u: unknown) => sanitizeImageUrl(u, ''))
              .filter(Boolean)
              .slice(0, 20)
          : current.images.galleryImages,
      };
      upsert.run('images', JSON.stringify(mergedImages));
    }
    if (content && typeof content === 'object') {
      const sanitizedDifferentials = Array.isArray(content.differentials)
        ? content.differentials
            .filter((d: any) => d && typeof d === 'object')
            .map((d: any) => ({
              title: String(d.title ?? '').trim().slice(0, 140),
              description: String(d.description ?? '').trim().slice(0, 600),
            }))
            .filter((d: { title: string; description: string }) => d.title || d.description)
        : null;
      const mergedContent = {
        ...current.content,
        ...content,
        differentials:
          sanitizedDifferentials && sanitizedDifferentials.length > 0
            ? sanitizedDifferentials
            : current.content.differentials,
      };
      upsert.run('content', JSON.stringify(mergedContent));
    }
    if (contact && typeof contact === 'object') {
      const mergedContact = {
        ...current.contact,
        ...contact,
        whatsapp: String(contact.whatsapp ?? current.contact.whatsapp).replace(/\D/g, ''),
        instagram:
          contact.instagram !== undefined
            ? sanitizeExternalUrl(contact.instagram, current.contact.instagram)
            : current.contact.instagram,
        facebook:
          contact.facebook !== undefined
            ? sanitizeExternalUrl(contact.facebook, current.contact.facebook)
            : current.contact.facebook,
        linkedin:
          contact.linkedin !== undefined
            ? sanitizeExternalUrl(contact.linkedin, current.contact.linkedin)
            : current.contact.linkedin,
        youtube:
          contact.youtube !== undefined
            ? sanitizeExternalUrl(contact.youtube, current.contact.youtube)
            : current.contact.youtube,
        tiktok:
          contact.tiktok !== undefined
            ? sanitizeExternalUrl(contact.tiktok, current.contact.tiktok)
            : current.contact.tiktok,
      };
      upsert.run('contact', JSON.stringify(mergedContact));
    }
    if (ai && typeof ai === 'object') {
      const mergedAi = { ...current.ai, ...ai };
      upsert.run('ai', JSON.stringify(mergedAi));
    }

    logAudit(req.authUser!.id, 'UPDATE_SETTINGS', changingVisuals ? 'Tema/Fotos/Configurações' : 'Configurações');
    res.json({ settings: getSiteSettings(), message: 'Alterações salvas com sucesso.' });
  });

  // === IMAGE UPLOAD (FOR VISUAL EDITOR & PROFESSIONALS) ===
  app.post('/api/admin/upload-image', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { dataUrl, filename, editorToken, skipEditorLock } = req.body || {};
    if (!skipEditorLock) {
      const token = String(editorToken || '');
      if (!token || !verifyEditorUnlockToken(token, req.authUser!.id)) {
        res.status(403).json({ error: 'Desbloqueie o Editor Visual com a senha para enviar novas fotos.' });
        return;
      }
    }

    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      res.status(400).json({ error: 'Envie uma imagem válida (PNG, JPG ou WEBP).' });
      return;
    }

    const match = /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) {
      res.status(400).json({ error: 'Formato de imagem não suportado. Use PNG, JPG ou WEBP.' });
      return;
    }

    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 4 * 1024 * 1024) {
      res.status(400).json({ error: 'A imagem excede o limite de 4 MB.' });
      return;
    }

    if (IS_EPHEMERAL_STORAGE) {
      res.status(201).json({ url: dataUrl });
      return;
    }

    const safeBase = slugify(String(filename || 'foto').replace(/\.[^.]+$/, '')) || 'foto';
    const outName = `${safeBase}-${Date.now()}.${ext}`;
    const outPath = path.join(UPLOADS_DIR, outName);
    fs.writeFileSync(outPath, buffer);

    res.status(201).json({ url: `/uploads/${outName}` });
  });

  // === PROFESSIONALS MANAGEMENT ===
  app.get('/api/admin/professionals', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
    const rows = db.prepare('SELECT * FROM professionals ORDER BY id ASC').all();
    res.json({ professionals: rows.map(mapProfessionalRow) });
  });

  app.post('/api/admin/professionals', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { name, specialtySummary, crfa, bio, photoUrl, active, workingHours, specialtyIds } = req.body || {};
    if (!name || String(name).trim().length < 2) {
      res.status(400).json({ error: 'Informe o nome do profissional.' });
      return;
    }
    const info = db
      .prepare(
        `INSERT INTO professionals (name, specialty_summary, crfa, bio, photo_url, active, working_hours_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        String(name).trim(),
        String(specialtySummary || '').trim(),
        String(crfa || '').trim(),
        String(bio || '').trim(),
        sanitizeImageUrl(photoUrl, ''),
        active === false ? 0 : 1,
        JSON.stringify(workingHours || {})
      );

    const profId = Number(info.lastInsertRowid);
    if (Array.isArray(specialtyIds)) {
      const linkStmt = db.prepare(
        'INSERT OR IGNORE INTO professional_specialties (professional_id, specialty_id) VALUES (?, ?)'
      );
      for (const sid of specialtyIds) {
        linkStmt.run(profId, Number(sid));
      }
    }

    logAudit(req.authUser!.id, 'CREATE_PROFESSIONAL', `ID=${profId}`);
    const created = db.prepare('SELECT * FROM professionals WHERE id = ?').get(profId);
    res.status(201).json({ professional: mapProfessionalRow(created) });
  });

  app.put('/api/admin/professionals/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }
    const existing = db.prepare('SELECT * FROM professionals WHERE id = ?').get(id) as any;
    if (!existing) {
      res.status(404).json({ error: 'Profissional não encontrado.' });
      return;
    }

    // Professionals can update their own workingHours only; admins can update all fields
    if (user.role === 'professional' && user.professionalId !== id) {
      res.status(403).json({ error: 'Acesso negado para editar outro profissional.' });
      return;
    }

    const { name, specialtySummary, crfa, bio, photoUrl, active, workingHours, specialtyIds } = req.body || {};
    if (user.role === 'professional') {
      let existingHours: Record<string, unknown> = {};
      try {
        existingHours = JSON.parse(existing.working_hours_json || '{}');
      } catch {
        existingHours = {};
      }
      db.prepare('UPDATE professionals SET working_hours_json = ? WHERE id = ?').run(
        JSON.stringify(workingHours || existingHours),
        id
      );
    } else {
      db.prepare(
        `UPDATE professionals
         SET name = ?, specialty_summary = ?, crfa = ?, bio = ?, photo_url = ?, active = ?, working_hours_json = ?
         WHERE id = ?`
      ).run(
        name !== undefined ? String(name).trim() : existing.name,
        specialtySummary !== undefined ? String(specialtySummary).trim() : existing.specialty_summary,
        crfa !== undefined ? String(crfa).trim() : existing.crfa,
        bio !== undefined ? String(bio).trim() : existing.bio,
        photoUrl !== undefined ? sanitizeImageUrl(photoUrl, existing.photo_url) : existing.photo_url,
        active !== undefined ? (active ? 1 : 0) : existing.active,
        workingHours !== undefined ? JSON.stringify(workingHours) : existing.working_hours_json,
        id
      );

      if (Array.isArray(specialtyIds)) {
        db.prepare('DELETE FROM professional_specialties WHERE professional_id = ?').run(id);
        const linkStmt = db.prepare(
          'INSERT OR IGNORE INTO professional_specialties (professional_id, specialty_id) VALUES (?, ?)'
        );
        for (const sid of specialtyIds) {
          linkStmt.run(id, Number(sid));
        }
      }
    }

    const updated = db.prepare('SELECT * FROM professionals WHERE id = ?').get(id);
    res.json({ professional: mapProfessionalRow(updated) });
  });

  app.delete('/api/admin/professionals/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }
    const existing = db.prepare('SELECT id FROM professionals WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ error: 'Profissional não encontrado.' });
      return;
    }
    const hasAppts = (
      db.prepare('SELECT COUNT(*) as cnt FROM appointments WHERE professional_id = ?').get(id) as {
        cnt: number;
      }
    ).cnt;
    if (hasAppts > 0) {
      db.prepare('UPDATE professionals SET active = 0 WHERE id = ?').run(id);
      res.json({ message: 'Profissional inativado (possui histórico de agendamentos).' });
      return;
    }
    db.prepare('DELETE FROM professionals WHERE id = ?').run(id);
    res.json({ ok: true });
  });

  app.post('/api/admin/apply-schedule-all', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { workingHours } = req.body || {};
    if (!workingHours || typeof workingHours !== 'object') {
      res.status(400).json({ error: 'Grade de horários inválida.' });
      return;
    }
    db.prepare('UPDATE professionals SET working_hours_json = ?').run(JSON.stringify(workingHours));
    logAudit(req.authUser!.id, 'APPLY_SCHEDULE_ALL', 'Grade semanal aplicada a todos os profissionais');
    res.json({ message: 'Grade semanal aplicada a todos os profissionais com sucesso.' });
  });

  // === SPECIALTIES MANAGEMENT ===
  app.get('/api/admin/specialties', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
    const rows = db.prepare('SELECT * FROM specialties ORDER BY sort_order ASC, id ASC').all();
    res.json({ specialties: rows.map(mapSpecialtyRow) });
  });

  app.post('/api/admin/specialties', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const {
      name,
      icon,
      shortDescription,
      fullDescription,
      targetAudience,
      objectives,
      howItWorks,
      confirmationStatus,
      active,
      sortOrder,
    } = req.body || {};
    if (!name || String(name).trim().length < 2) {
      res.status(400).json({ error: 'Informe o nome da especialidade.' });
      return;
    }
    const baseSlug = slugify(String(name));
    const slug = `${baseSlug}-${Date.now().toString(36).slice(-3)}`;
    const info = db
      .prepare(
        `INSERT INTO specialties (
          slug, name, icon, short_description, full_description,
          target_audience, objectives, how_it_works, confirmation_status, active, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        slug,
        String(name).trim(),
        String(icon || 'MessageCircle'),
        String(shortDescription || '').trim(),
        String(fullDescription || '').trim(),
        String(targetAudience || '').trim(),
        String(objectives || '').trim(),
        String(howItWorks || '').trim(),
        confirmationStatus === 'to_confirm' ? 'to_confirm' : 'confirmed',
        active === false ? 0 : 1,
        Number(sortOrder) || 99
      );
    const created = db.prepare('SELECT * FROM specialties WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ specialty: mapSpecialtyRow(created) });
  });

  app.put('/api/admin/specialties/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }
    const existing = db.prepare('SELECT * FROM specialties WHERE id = ?').get(id) as any;
    if (!existing) {
      res.status(404).json({ error: 'Especialidade não encontrada.' });
      return;
    }
    const {
      name,
      icon,
      shortDescription,
      fullDescription,
      targetAudience,
      objectives,
      howItWorks,
      confirmationStatus,
      active,
      sortOrder,
    } = req.body || {};

    db.prepare(
      `UPDATE specialties
       SET name = ?, icon = ?, short_description = ?, full_description = ?,
           target_audience = ?, objectives = ?, how_it_works = ?, confirmation_status = ?, active = ?, sort_order = ?
       WHERE id = ?`
    ).run(
      name !== undefined ? String(name).trim() : existing.name,
      icon !== undefined ? String(icon) : existing.icon,
      shortDescription !== undefined ? String(shortDescription).trim() : existing.short_description,
      fullDescription !== undefined ? String(fullDescription).trim() : existing.full_description,
      targetAudience !== undefined ? String(targetAudience).trim() : existing.target_audience,
      objectives !== undefined ? String(objectives).trim() : existing.objectives,
      howItWorks !== undefined ? String(howItWorks).trim() : existing.how_it_works,
      confirmationStatus !== undefined ? confirmationStatus : existing.confirmation_status,
      active !== undefined ? (active ? 1 : 0) : existing.active,
      sortOrder !== undefined ? Number(sortOrder) : existing.sort_order,
      id
    );
    const updated = db.prepare('SELECT * FROM specialties WHERE id = ?').get(id);
    res.json({ specialty: mapSpecialtyRow(updated) });
  });

  app.delete('/api/admin/specialties/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }
    const existing = db.prepare('SELECT id FROM specialties WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ error: 'Especialidade não encontrada.' });
      return;
    }
    const hasAppts = (
      db.prepare('SELECT COUNT(*) as cnt FROM appointments WHERE specialty_id = ?').get(id) as {
        cnt: number;
      }
    ).cnt;
    if (hasAppts > 0) {
      db.prepare('UPDATE specialties SET active = 0 WHERE id = ?').run(id);
      res.json({ message: 'Especialidade inativada (possui histórico de atendimentos).' });
      return;
    }
    db.prepare('DELETE FROM specialties WHERE id = ?').run(id);
    res.json({ ok: true });
  });

  // === FAQs MANAGEMENT ===
  app.get('/api/admin/faqs', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
    const rows = db.prepare('SELECT * FROM faqs ORDER BY sort_order ASC, id ASC').all();
    res.json({
      faqs: rows.map((f: any) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category,
        sortOrder: f.sort_order,
        active: Boolean(f.active),
      })),
    });
  });

  app.post('/api/admin/faqs', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { question, answer, category, sortOrder, active } = req.body || {};
    if (!question || !answer) {
      res.status(400).json({ error: 'Informe pergunta e resposta.' });
      return;
    }
    const info = db
      .prepare('INSERT INTO faqs (question, answer, category, sort_order, active) VALUES (?, ?, ?, ?, ?)')
      .run(String(question).trim(), String(answer).trim(), String(category || 'Geral').trim(), Number(sortOrder) || 10, active === false ? 0 : 1);
    res.status(201).json({ id: info.lastInsertRowid });
  });

  app.put('/api/admin/faqs/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }
    const { question, answer, category, sortOrder, active } = req.body || {};
    const info = db
      .prepare('UPDATE faqs SET question = ?, answer = ?, category = ?, sort_order = ?, active = ? WHERE id = ?')
      .run(
        String(question || '').trim(),
        String(answer || '').trim(),
        String(category || 'Geral').trim(),
        Number(sortOrder) || 10,
        active === false ? 0 : 1,
        id
      );
    if (info.changes === 0) {
      res.status(404).json({ error: 'Pergunta frequente não encontrada.' });
      return;
    }
    res.json({ ok: true });
  });

  app.delete('/api/admin/faqs/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }
    const info = db.prepare('DELETE FROM faqs WHERE id = ?').run(id);
    if (info.changes === 0) {
      res.status(404).json({ error: 'Pergunta frequente não encontrada.' });
      return;
    }
    res.json({ ok: true });
  });

  // === KNOWLEDGE BASE FOR AI ===
  app.get('/api/admin/knowledge', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
    const rows = db.prepare('SELECT * FROM knowledge_base ORDER BY id DESC').all();
    res.json({
      items: rows.map((k: any) => ({
        id: k.id,
        title: k.title,
        category: k.category,
        content: k.content,
        active: Boolean(k.active),
        updatedAt: k.updated_at,
      })),
    });
  });

  app.post('/api/admin/knowledge', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { title, category, content, active } = req.body || {};
    if (!title || !content) {
      res.status(400).json({ error: 'Informe título e conteúdo.' });
      return;
    }
    const info = db
      .prepare('INSERT INTO knowledge_base (title, category, content, active) VALUES (?, ?, ?, ?)')
      .run(String(title).trim(), String(category || 'Institucional').trim(), String(content).trim(), active === false ? 0 : 1);
    res.status(201).json({ id: info.lastInsertRowid });
  });

  app.put('/api/admin/knowledge/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }
    const { title, category, content, active } = req.body || {};
    const info = db
      .prepare(
        "UPDATE knowledge_base SET title = ?, category = ?, content = ?, active = ?, updated_at = datetime('now') WHERE id = ?"
      )
      .run(String(title || '').trim(), String(category || 'Institucional').trim(), String(content || '').trim(), active === false ? 0 : 1, id);
    if (info.changes === 0) {
      res.status(404).json({ error: 'Item da base de conhecimento não encontrado.' });
      return;
    }
    res.json({ ok: true });
  });

  app.delete('/api/admin/knowledge/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }
    const info = db.prepare('DELETE FROM knowledge_base WHERE id = ?').run(id);
    if (info.changes === 0) {
      res.status(404).json({ error: 'Item da base de conhecimento não encontrado.' });
      return;
    }
    res.json({ ok: true });
  });

  // === CONTACT MESSAGES ===
  app.get('/api/admin/contacts', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
    const rows = db.prepare('SELECT * FROM contact_messages ORDER BY id DESC').all();
    res.json({
      messages: rows.map((m: any) => ({
        id: m.id,
        name: m.name,
        phone: m.phone,
        email: m.email,
        subject: m.subject,
        message: m.message,
        lgpdConsent: Boolean(m.lgpd_consent),
        status: m.status,
        createdAt: m.created_at,
      })),
    });
  });

  app.patch('/api/admin/contacts/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }
    const status = req.body?.status === 'respondido' ? 'respondido' : 'novo';
    const info = db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, id);
    if (info.changes === 0) {
      res.status(404).json({ error: 'Mensagem de contato não encontrada.' });
      return;
    }
    res.json({ ok: true });
  });

  // === USERS & RBAC ===
  app.get('/api/admin/users', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
    const rows = db
      .prepare('SELECT id, name, email, role, professional_id, active, created_at FROM users ORDER BY id ASC')
      .all();
    res.json({
      users: rows.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        professionalId: u.professional_id,
        active: Boolean(u.active),
        createdAt: u.created_at,
      })),
    });
  });

  app.post('/api/admin/users', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { name, email, password, role, professionalId } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!name || String(name).trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || !password || String(password).length < 6) {
      res.status(400).json({ error: 'Preencha nome, um e-mail válido e senha com pelo menos 6 caracteres.' });
      return;
    }
    const validRole = role === 'admin' ? 'admin' : 'professional';
    try {
      const info = db
        .prepare(
          'INSERT INTO users (name, email, password_hash, role, professional_id, active) VALUES (?, ?, ?, ?, ?, 1)'
        )
        .run(
          String(name).trim(),
          cleanEmail,
          hashPassword(String(password)),
          validRole,
          validRole === 'professional' && professionalId ? Number(professionalId) : null
        );
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (err: any) {
      if (String(err?.code) === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(409).json({ error: 'Já existe um usuário cadastrado com este e-mail.' });
        return;
      }
      res.status(500).json({ error: 'Erro ao criar usuário.' });
    }
  });

  app.patch('/api/admin/users/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const id = parsePositiveInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }
    const { active, role, professionalId, newPassword } = req.body || {};
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!existing) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const nextActive = active !== undefined ? (active ? 1 : 0) : existing.active;
    const nextRole = role === 'admin' || role === 'professional' ? role : existing.role;
    const nextProfId =
      nextRole === 'professional'
        ? professionalId !== undefined
          ? professionalId
            ? Number(professionalId)
            : null
          : existing.professional_id
        : null;

    if (newPassword && String(newPassword).length >= 6) {
      db.prepare(
        'UPDATE users SET active = ?, role = ?, professional_id = ?, password_hash = ? WHERE id = ?'
      ).run(nextActive, nextRole, nextProfId, hashPassword(String(newPassword)), id);
    } else {
      db.prepare('UPDATE users SET active = ?, role = ?, professional_id = ? WHERE id = ?').run(
        nextActive,
        nextRole,
        nextProfId,
        id
      );
    }
    res.json({ ok: true });
  });
}
