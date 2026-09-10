import { Hono } from 'hono';
import { Env, Variables, Category } from '../types';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { sanitizeString, sanitizeInt, sanitizeBoolean } from '../utils/sanitize';

const categories = new Hono<{ Bindings: Env; Variables: Variables }>();

categories.get('/', authMiddleware, async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT * FROM categories ORDER BY sort_order, name'
  ).all<Category>();

  return c.json({ categories: result.results });
});

categories.post('/', authMiddleware, adminOnly, async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    const name = sanitizeString(body?.name, 50);
    const name_ar = sanitizeString(body?.name_ar, 50);

    if (!name || !name_ar) {
      return c.json({ error: 'Nom et nom arabe requis' }, 400);
    }

    const maxOrder = await c.env.DB.prepare(
      'SELECT MAX(sort_order) as max_order FROM categories'
    ).first<{ max_order: number }>();

    const result = await c.env.DB.prepare(
      'INSERT INTO categories (name, name_ar, sort_order) VALUES (?, ?, ?)'
    ).bind(name, name_ar, (maxOrder?.max_order || 0) + 1).run();

    return c.json({
      success: true,
      id: result.meta.last_row_id
    }, 201);
  } catch (error) {
    return c.json({ error: 'Échec de l\'ajout de la catégorie' }, 500);
  }
});

categories.put('/:id', authMiddleware, adminOnly, async (c) => {
  try {
    const id = sanitizeInt(c.req.param('id'));
    if (id === null) {
      return c.json({ error: 'Identifiant invalide' }, 400);
    }

    const body = await c.req.json().catch(() => null);
    const name = sanitizeString(body?.name, 50);
    const name_ar = sanitizeString(body?.name_ar, 50);

    if (!name || !name_ar) {
      return c.json({ error: 'Nom et nom arabe requis' }, 400);
    }

    await c.env.DB.prepare(
      'UPDATE categories SET name = ?, name_ar = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(name, name_ar, id).run();

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Échec de la mise à jour de la catégorie' }, 500);
  }
});

categories.patch('/:id/status', authMiddleware, adminOnly, async (c) => {
  try {
    const id = sanitizeInt(c.req.param('id'));
    if (id === null) {
      return c.json({ error: 'Identifiant invalide' }, 400);
    }

    const body = await c.req.json().catch(() => null);
    const active = sanitizeBoolean(body?.active);

    await c.env.DB.prepare(
      'UPDATE categories SET active = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(active ? 1 : 0, id).run();

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Échec de la mise à jour du statut de la catégorie' }, 500);
  }
});

export default categories;
