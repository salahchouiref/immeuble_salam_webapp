import { Context, Next } from 'hono';
import { verifyJWT } from '../utils/jwt';
import { Env, JWTPayload, Session, Variables } from '../types';

function toUtcDate(sqlDate: string): Date {
  return new Date(sqlDate.replace(' ', 'T') + 'Z');
}

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Non autorisé' }, 401);
  }

  const token = authHeader.substring(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);

  if (!payload || !payload.jti) {
    return c.json({ error: 'Session invalide ou expirée' }, 401);
  }

  const session = await c.env.DB.prepare(
    'SELECT * FROM sessions WHERE id = ?'
  ).bind(String(payload.jti)).first<Session>();

  if (!session || session.active !== 1) {
    return c.json({ error: 'Session révoquée' }, 401);
  }

  if (toUtcDate(session.expires_at).getTime() < Date.now()) {
    await c.env.DB.prepare('UPDATE sessions SET active = 0 WHERE id = ?').bind(String(payload.jti)).run();
    return c.json({ error: 'Session expirée' }, 401);
  }

  c.set('user', payload as unknown as JWTPayload);
  await next();
}

export async function adminOnly(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const user = c.get('user');

  if (user.role !== 'admin') {
    return c.json({ error: 'Accès refusé' }, 403);
  }

  await next();
}
