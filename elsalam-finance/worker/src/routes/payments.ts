import { Hono } from 'hono';
import { Env, Variables, Payment } from '../types';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { sanitizeMonth, sanitizeInt, sanitizeAmount, sanitizeDate, sanitizePaymentType, sanitizeString } from '../utils/sanitize';

const payments = new Hono<{ Bindings: Env; Variables: Variables }>();

payments.get('/', authMiddleware, async (c) => {
  const rawMonth = c.req.query('month');
  const month = rawMonth ? sanitizeMonth(rawMonth) : '';
  const residentId = sanitizeInt(c.req.query('resident_id'));

  let query = `
    SELECT p.*, r.name as resident_name, r.apartment_number
    FROM payments p
    JOIN residents r ON r.id = p.resident_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (month) {
    query += ' AND p.month = ?';
    params.push(month);
  }

  if (residentId !== null) {
    query += ' AND p.resident_id = ?';
    params.push(residentId);
  }

  query += ' ORDER BY p.date DESC, p.id DESC';

  const result = await c.env.DB.prepare(query).bind(...params).all<Payment>();
  return c.json({ payments: result.results });
});

payments.post('/', authMiddleware, adminOnly, async (c) => {
  try {
    const payload = c.get('user');
    const body = await c.req.json().catch(() => null);

    const resident_id = sanitizeInt(body?.resident_id);
    const month = sanitizeMonth(body?.month);
    const date = sanitizeDate(body?.date);
    const amount = sanitizeAmount(body?.amount);
    const payment_type = sanitizePaymentType(body?.payment_type) || 'cash';
    const note = sanitizeString(body?.note, 255);

    if (resident_id === null || !month || !date || amount === null) {
      return c.json({ error: 'Champs requis manquants ou invalides: resident_id, month, date, amount' }, 400);
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO payments (resident_id, month, date, amount, payment_type, note, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      resident_id,
      month,
      date,
      amount,
      payment_type,
      note || null,
      payload.userId
    ).run();

    // Audit log
    await c.env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      payload.userId,
      'create',
      'payment',
      result.meta.last_row_id,
      JSON.stringify({ resident_id, month, amount, payment_type })
    ).run();

    return c.json({
      success: true,
      id: result.meta.last_row_id
    }, 201);
  } catch (error) {
    return c.json({ error: 'Échec de l\'ajout du paiement' }, 500);
  }
});

payments.put('/:id', authMiddleware, adminOnly, async (c) => {
  try {
    const id = sanitizeInt(c.req.param('id'));
    if (id === null) {
      return c.json({ error: 'Identifiant invalide' }, 400);
    }

    const payload = c.get('user');
    const body = await c.req.json().catch(() => null);

    const resident_id = sanitizeInt(body?.resident_id);
    const month = sanitizeMonth(body?.month);
    const date = sanitizeDate(body?.date);
    const amount = sanitizeAmount(body?.amount);
    const payment_type = sanitizePaymentType(body?.payment_type) || 'cash';
    const note = sanitizeString(body?.note, 255);

    if (resident_id === null || !month || !date || amount === null) {
      return c.json({ error: 'Champs requis manquants ou invalides: resident_id, month, date, amount' }, 400);
    }

    // Get old payment for audit
    const old = await c.env.DB.prepare('SELECT * FROM payments WHERE id = ?').bind(id).first<Payment>();

    await c.env.DB.prepare(
      'UPDATE payments SET resident_id = ?, month = ?, date = ?, amount = ?, payment_type = ?, note = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(resident_id, month, date, amount, payment_type, note || null, id).run();

    // Audit log
    await c.env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      payload.userId,
      'update',
      'payment',
      id,
      JSON.stringify({ old, new: { resident_id, month, date, amount, payment_type } })
    ).run();

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Échec de la mise à jour du paiement' }, 500);
  }
});

payments.delete('/:id', authMiddleware, adminOnly, async (c) => {
  try {
    const id = sanitizeInt(c.req.param('id'));
    if (id === null) {
      return c.json({ error: 'Identifiant invalide' }, 400);
    }

    const payload = c.get('user');

    const payment = await c.env.DB.prepare('SELECT * FROM payments WHERE id = ?').bind(id).first<Payment>();

    if (!payment) {
      return c.json({ error: 'Paiement introuvable' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM payments WHERE id = ?').bind(id).run();

    // Audit log
    await c.env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      payload.userId,
      'delete',
      'payment',
      id,
      JSON.stringify(payment)
    ).run();

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Échec de la suppression du paiement' }, 500);
  }
});

export default payments;
