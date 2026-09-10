import { Hono } from 'hono';
import { Env, Variables, Resident } from '../types';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { sanitizeString, sanitizeInt, sanitizeEmail, sanitizePhone, sanitizeBoolean } from '../utils/sanitize';

const residents = new Hono<{ Bindings: Env; Variables: Variables }>();

residents.get('/', authMiddleware, async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT * FROM residents ORDER BY apartment_number'
  ).all<Resident>();

  return c.json({ residents: result.results });
});

residents.post('/', authMiddleware, adminOnly, async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    const apartment_number = sanitizeString(body?.apartment_number, 20);
    const name = sanitizeString(body?.name, 100);
    const phone = sanitizePhone(body?.phone);
    const email = sanitizeEmail(body?.email);

    if (!apartment_number || !name) {
      return c.json({ error: 'Numéro d\'appartement et nom requis' }, 400);
    }

    const existing = await c.env.DB.prepare(
      'SELECT id FROM residents WHERE apartment_number = ?'
    ).bind(apartment_number).first();

    if (existing) {
      return c.json({ error: 'Ce numéro d\'appartement existe déjà' }, 400);
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO residents (apartment_number, name, phone, email) VALUES (?, ?, ?, ?)'
    ).bind(apartment_number, name, phone || null, email || null).run();

    return c.json({
      success: true,
      id: result.meta.last_row_id
    }, 201);
  } catch (error) {
    return c.json({ error: 'Échec de l\'ajout du résident' }, 500);
  }
});

residents.put('/:id', authMiddleware, adminOnly, async (c) => {
  try {
    const id = sanitizeInt(c.req.param('id'));
    if (id === null) {
      return c.json({ error: 'Identifiant invalide' }, 400);
    }

    const body = await c.req.json().catch(() => null);
    const apartment_number = sanitizeString(body?.apartment_number, 20);
    const name = sanitizeString(body?.name, 100);
    const phone = sanitizePhone(body?.phone);
    const email = sanitizeEmail(body?.email);

    if (!apartment_number || !name) {
      return c.json({ error: 'Numéro d\'appartement et nom requis' }, 400);
    }

    await c.env.DB.prepare(
      'UPDATE residents SET apartment_number = ?, name = ?, phone = ?, email = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(apartment_number, name, phone || null, email || null, id).run();

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Échec de la mise à jour du résident' }, 500);
  }
});

residents.patch('/:id/status', authMiddleware, adminOnly, async (c) => {
  try {
    const id = sanitizeInt(c.req.param('id'));
    if (id === null) {
      return c.json({ error: 'Identifiant invalide' }, 400);
    }

    const body = await c.req.json().catch(() => null);
    const active = sanitizeBoolean(body?.active);

    await c.env.DB.prepare(
      'UPDATE residents SET active = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(active ? 1 : 0, id).run();

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Échec de la mise à jour du statut du résident' }, 500);
  }
});

residents.delete('/:id', authMiddleware, adminOnly, async (c) => {
  try {
    const id = sanitizeInt(c.req.param('id'));
    if (id === null) {
      return c.json({ error: 'Identifiant invalide' }, 400);
    }

    // Guard: residents with payment history cannot be hard-deleted (FK + financial records).
    // Advise the admin to deactivate them instead.
    const paymentCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM payments WHERE resident_id = ?'
    ).bind(id).first<{ count: number }>();

    if ((paymentCount?.count || 0) > 0) {
      return c.json({ error: 'Cet habitant possède des paiements. Désactivez-le à la place de le supprimer.' }, 400);
    }

    await c.env.DB.prepare('DELETE FROM residents WHERE id = ?').bind(id).run();

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Échec de la suppression du résident' }, 500);
  }
});

export default residents;
