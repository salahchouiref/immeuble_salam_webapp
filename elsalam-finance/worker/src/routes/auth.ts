import { Hono } from 'hono';
import { Env, Variables, User } from '../types';
import { signJWT } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { authMiddleware } from '../middleware/auth';
import { sanitizeEmail, sanitizeString, generateSessionId } from '../utils/sanitize';

const MAX_CONCURRENT_SESSIONS = 30;
const MAX_SESSIONS_PER_USER = 5;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

function getClientIp(c: any): string {
  return c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() || 'unknown';
}

auth.post('/setup', async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    const email = sanitizeEmail(body?.email);
    const password = typeof body?.password === 'string' && body.password.length >= 6 ? body.password : '';
    const name = sanitizeString(body?.name, 100);

    if (!email || !password || !name) {
      return c.json({ error: 'Email, mot de passe (min 6 caractères) et nom requis' }, 400);
    }

    const existingAdmin = await c.env.DB.prepare('SELECT id FROM users WHERE role = ?').bind('admin').first();

    if (existingAdmin) {
      return c.json({
        success: true,
        message: 'Comptes déjà configurés',
        admin: { id: existingAdmin.id, email, role: 'admin' },
      }, 200);
    }

    const passwordHash = await hashPassword(password);

    const admin = await c.env.DB.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).bind(name, email, passwordHash, 'admin').run();

    // One shared read-only account for every habitant (no resident_id — building-wide)
    const residentHash = await hashPassword('habitant');
    await c.env.DB.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).bind('Habitant', 'habitant@elsalam.com', residentHash, 'resident').run();

    return c.json({
      success: true,
      message: 'Comptes créés : un admin + un compte habitant partagé',
      admin: { id: admin.meta.last_row_id, email, role: 'admin' },
      resident: { email: 'habitant@elsalam.com', password: 'habitant', role: 'resident' },
    }, 201);
  } catch (error: any) {
    return c.json({ error: error.message || 'Échec de la configuration' }, 500);
  }
});

auth.post('/login', async (c) => {
  try {
    const ip = getClientIp(c);

    const body = await c.req.json().catch(() => null);
    const email = sanitizeEmail(body?.email);
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return c.json({ error: 'Email et mot de passe requis' }, 400);
    }

    // Rate limiting: max 5 attempts per (email + IP) per 15 minutes
    // Keyed by email+IP so residents on a shared building connection are not all blocked
    const attempts = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM login_attempts WHERE email = ? AND ip = ? AND attempted_at > datetime('now', '-15 minutes')"
    ).bind(email, ip).first<{ count: number }>();

    if ((attempts?.count || 0) >= 5) {
      return c.json({ error: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.' }, 429);
    }

    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND active = 1'
    ).bind(email).first<User>();

    const recordAttempt = async () => {
      await c.env.DB.prepare('INSERT INTO login_attempts (email, ip) VALUES (?, ?)').bind(email, ip).run();
    };

    if (!user) {
      await recordAttempt();
      return c.json({ error: 'Identifiants invalides' }, 401);
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      await recordAttempt();
      return c.json({ error: 'Identifiants invalides' }, 401);
    }

    // Clean expired sessions (global)
    await c.env.DB.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();

    // Per-user cap: evict this user's OLDEST sessions so a resident
    // can always log in from any device/location (e.g. while on vacation)
    // without being blocked. No single account can hoard sessions.
    const userSessions = await c.env.DB.prepare(
      'SELECT id FROM sessions WHERE user_id = ? AND active = 1 ORDER BY created_at ASC, id ASC'
    ).bind(user.id).all<{ id: string }>();

    if (userSessions.results.length >= MAX_SESSIONS_PER_USER) {
      const toEvict = userSessions.results.slice(0, userSessions.results.length - (MAX_SESSIONS_PER_USER - 1));
      for (const s of toEvict) {
        await c.env.DB.prepare('UPDATE sessions SET active = 0 WHERE id = ?').bind(s.id).run();
      }
    }

    // Global concurrent session limit: max 30 active sessions across all users
    // This is GLOBAL, never per-IP, so users travelling or on vacation are unaffected.
    const activeCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM sessions WHERE active = 1'
    ).first<{ count: number }>();

    if ((activeCount?.count || 0) >= MAX_CONCURRENT_SESSIONS) {
      return c.json({ error: 'Nombre maximum de sessions actives atteint. Veuillez vous déconnecter sur un autre appareil.' }, 429);
    }

    // Create session
    const jti = generateSessionId();
    await c.env.DB.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))"
    ).bind(jti, user.id).run();

    // Clear rate limit on success (only this email+IP pair)
    await c.env.DB.prepare('DELETE FROM login_attempts WHERE email = ? AND ip = ?').bind(email, ip).run();

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      residentId: user.resident_id,
      jti,
    }, c.env.JWT_SECRET, SESSION_TTL_SECONDS);

    return c.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        residentId: user.resident_id,
      },
    });
  } catch (error) {
    return c.json({ error: 'Échec de la connexion' }, 500);
  }
});

auth.post('/logout', authMiddleware, async (c) => {
  const payload = c.get('user');
  if (payload?.jti) {
    await c.env.DB.prepare('UPDATE sessions SET active = 0 WHERE id = ?').bind(String(payload.jti)).run();
  }
  return c.json({ success: true });
});

auth.get('/me', authMiddleware, async (c) => {
  const payload = c.get('user');

  const user = await c.env.DB.prepare(
    'SELECT id, name, email, role, resident_id FROM users WHERE id = ?'
  ).bind(payload.userId).first();

  if (!user) {
    return c.json({ error: 'Utilisateur introuvable' }, 404);
  }

  return c.json({ user });
});

auth.post('/change-password', authMiddleware, async (c) => {
  try {
    const payload = c.get('user');
    const body = await c.req.json().catch(() => null);
    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Mot de passe actuel et nouveau requis' }, 400);
    }

    if (newPassword.length < 6 || newPassword.length > 128) {
      return c.json({ error: 'Le nouveau mot de passe doit contenir entre 6 et 128 caractères' }, 400);
    }

    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(payload.userId).first<User>();

    if (!user) {
      return c.json({ error: 'Utilisateur introuvable' }, 404);
    }

    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      return c.json({ error: 'Mot de passe actuel incorrect' }, 401);
    }

    const newHash = await hashPassword(newPassword);
    await c.env.DB.prepare(
      'UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(newHash, payload.userId).run();

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Échec du changement de mot de passe' }, 500);
  }
});

export default auth;
