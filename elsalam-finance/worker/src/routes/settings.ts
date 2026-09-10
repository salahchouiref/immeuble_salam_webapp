import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { sanitizeString, sanitizeInt } from '../utils/sanitize';

const settings = new Hono<{ Bindings: Env; Variables: Variables }>();

const ALLOWED_KEYS: Record<string, (v: unknown) => string> = {
  building_name: (v) => sanitizeString(v, 100),
  monthly_contribution: (v) => {
    const n = sanitizeInt(v, 1, 1000000);
    return n !== null ? String(n) : '';
  },
  currency: (v) => sanitizeString(v, 10),
  address: (v) => sanitizeString(v, 200),
  city: (v) => sanitizeString(v, 100),
};

settings.get('/', authMiddleware, async (c) => {
  const result = await c.env.DB.prepare('SELECT * FROM settings').all();

  const settingsObj: Record<string, string> = {};
  result.results.forEach((row: any) => {
    settingsObj[row.key] = row.value;
  });

  return c.json({ settings: settingsObj });
});

settings.put('/', authMiddleware, adminOnly, async (c) => {
  try {
    const payload = c.get('user');
    const updates = await c.req.json<Record<string, string>>().catch(() => null);

    if (!updates || typeof updates !== 'object') {
      return c.json({ error: 'Données invalides' }, 400);
    }

    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(updates)) {
      const sanitizer = ALLOWED_KEYS[key];
      if (!sanitizer) {
        return c.json({ error: `Clé non autorisée: ${key}` }, 400);
      }
      const clean = sanitizer(value);
      if (key === 'monthly_contribution' && clean === '') {
        return c.json({ error: `Valeur invalide pour ${key}` }, 400);
      }
      sanitized[key] = clean;
    }

    for (const [key, value] of Object.entries(sanitized)) {
      await c.env.DB.prepare(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))'
      ).bind(key, value).run();
    }

    // Audit log
    await c.env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, entity_type, details) VALUES (?, ?, ?, ?)'
    ).bind(
      payload.userId,
      'update',
      'settings',
      JSON.stringify(sanitized)
    ).run();

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Échec de la mise à jour des paramètres' }, 500);
  }
});

export default settings;
