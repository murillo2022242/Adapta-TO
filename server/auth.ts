import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import { db } from './db.ts';
import type { AuthUser } from '../src/types.ts';

function resolveSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  const secretFile = path.resolve(process.cwd(), 'data', '.session_secret');
  if (fs.existsSync(secretFile)) {
    const existing = fs.readFileSync(secretFile, 'utf8').trim();
    if (existing.length >= 32) return existing;
  }
  const generated = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(secretFile, generated, { mode: 0o600 });
  return generated;
}

const SESSION_SECRET = resolveSessionSecret();
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const EDITOR_TOKEN_TTL_MS = 1000 * 60 * 60 * 2; // 2 hours

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, hashHex] = parts;
  if (!salt || !hashHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(hashHex, 'hex');
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

interface SessionPayload {
  uid: number;
  role: 'admin' | 'professional';
  exp: number;
}

interface EditorUnlockPayload {
  purpose: 'visual-editor';
  uid: number;
  exp: number;
}

function signPayload(payload: object): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

function verifySignedPayload<T>(token: string): T | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;
  if (!encoded || !signature) return null;
  const expected = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export function createSessionToken(userId: number, role: 'admin' | 'professional'): string {
  const payload: SessionPayload = {
    uid: userId,
    role,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  return signPayload(payload);
}

export function verifySessionToken(token: string): SessionPayload | null {
  const payload = verifySignedPayload<SessionPayload>(token);
  if (!payload || typeof payload.uid !== 'number' || typeof payload.exp !== 'number') {
    return null;
  }
  if (Date.now() > payload.exp) return null;
  return payload;
}

export function createEditorUnlockToken(userId: number): string {
  const payload: EditorUnlockPayload = {
    purpose: 'visual-editor',
    uid: userId,
    exp: Date.now() + EDITOR_TOKEN_TTL_MS,
  };
  return signPayload(payload);
}

export function verifyEditorUnlockToken(token: string, userId: number): boolean {
  const payload = verifySignedPayload<EditorUnlockPayload>(token);
  if (!payload || payload.purpose !== 'visual-editor' || payload.uid !== userId) {
    return false;
  }
  return Date.now() <= payload.exp;
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthUser;
}

export function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((part) => part.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('adaptato_session=')) {
        return decodeURIComponent(cookie.slice('adaptato_session='.length));
      }
    }
  }
  return null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: 'Autenticação necessária para acessar esta área.' });
    return;
  }
  const session = verifySessionToken(token);
  if (!session) {
    res.status(401).json({ error: 'Sessão expirada ou inválida. Faça login novamente.' });
    return;
  }
  const row = db
    .prepare(
      'SELECT id, name, email, role, professional_id, active FROM users WHERE id = ? AND active = 1'
    )
    .get(session.uid) as
    | {
        id: number;
        name: string;
        email: string;
        role: 'admin' | 'professional';
        professional_id: number | null;
        active: number;
      }
    | undefined;

  if (!row) {
    res.status(401).json({ error: 'Usuário inativo ou não encontrado.' });
    return;
  }

  req.authUser = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    professionalId: row.professional_id,
    active: Boolean(row.active),
  };
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.authUser) {
    res.status(401).json({ error: 'Autenticação necessária.' });
    return;
  }
  if (req.authUser.role !== 'admin') {
    res.status(403).json({ error: 'Acesso restrito aos administradores da clínica.' });
    return;
  }
  next();
}
