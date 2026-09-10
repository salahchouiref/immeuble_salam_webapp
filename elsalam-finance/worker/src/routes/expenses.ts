import { Hono } from 'hono';
import { Env, Variables, Expense } from '../types';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { sanitizeMonth, sanitizeInt, sanitizeAmount, sanitizeDate, sanitizePaymentType, sanitizeString } from '../utils/sanitize';

const expenses = new Hono<{ Bindings: Env; Variables: Variables }>();

expenses.get('/', authMiddleware, async (c) => {
  const rawMonth = c.req.query('month');
  const month = rawMonth ? sanitizeMonth(rawMonth) : '';
  const categoryId = sanitizeInt(c.req.query('category_id'));

  let query = `
    SELECT e.*, c.name as category_name, c.name_ar as category_name_ar
    FROM expenses e
    JOIN categories c ON c.id = e.category_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (month) {
    query += ' AND e.month = ?';
    params.push(month);
  }

  if (categoryId !== null) {
    query += ' AND e.category_id = ?';
    params.push(categoryId);
  }

  query += ' ORDER BY e.date DESC, e.id DESC';

  const result = await c.env.DB.prepare(query).bind(...params).all<Expense>();
  return c.json({ expenses: result.results });
});

expenses.post('/', authMiddleware, adminOnly, async (c) => {
  try {
    const payload = c.get('user');
    const body = await c.req.json().catch(() => null);

    const category_id = sanitizeInt(body?.category_id);
    const month = sanitizeMonth(body?.month);
    const date = sanitizeDate(body?.date);
    const description = sanitizeString(body?.description, 255);
    const amount = sanitizeAmount(body?.amount);
    const payment_method = sanitizePaymentType(body?.payment_method) || 'cash';
    const note = sanitizeString(body?.note, 255);

    if (category_id === null || !month || !date || !description || amount === null) {
      return c.json({ error: 'Champs requis manquants ou invalides: category_id, month, date, description, amount' }, 400);
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO expenses (category_id, month, date, description, amount, payment_method, note, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      category_id,
      month,
      date,
      description,
      amount,
      payment_method,
      note || null,
      payload.userId
    ).run();

    await c.env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      payload.userId,
      'create',
      'expense',
      result.meta.last_row_id,
      JSON.stringify({ category_id, month, description, amount })
    ).run();

    return c.json({
      success: true,
      id: result.meta.last_row_id
    }, 201);
  } catch (error) {
    return c.json({ error: 'Échec de l\'ajout de la dépense' }, 500);
  }
});

expenses.put('/:id', authMiddleware, adminOnly, async (c) => {
  try {
    const id = sanitizeInt(c.req.param('id'));
    if (id === null) {
      return c.json({ error: 'Identifiant invalide' }, 400);
    }

    const payload = c.get('user');
    const body = await c.req.json().catch(() => null);

    const category_id = sanitizeInt(body?.category_id);
    const month = sanitizeMonth(body?.month);
    const date = sanitizeDate(body?.date);
    const description = sanitizeString(body?.description, 255);
    const amount = sanitizeAmount(body?.amount);
    const payment_method = sanitizePaymentType(body?.payment_method) || 'cash';
    const note = sanitizeString(body?.note, 255);

    if (category_id === null || !month || !date || !description || amount === null) {
      return c.json({ error: 'Champs requis manquants ou invalides: category_id, month, date, description, amount' }, 400);
    }

    const old = await c.env.DB.prepare('SELECT * FROM expenses WHERE id = ?').bind(id).first<Expense>();

    await c.env.DB.prepare(
      'UPDATE expenses SET category_id = ?, month = ?, date = ?, description = ?, amount = ?, payment_method = ?, note = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(category_id, month, date, description, amount, payment_method, note || null, id).run();

    await c.env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      payload.userId,
      'update',
      'expense',
      id,
      JSON.stringify({ old, new: { category_id, month, description, amount } })
    ).run();

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Échec de la mise à jour de la dépense' }, 500);
  }
});

expenses.delete('/:id', authMiddleware, adminOnly, async (c) => {
  try {
    const id = sanitizeInt(c.req.param('id'));
    if (id === null) {
      return c.json({ error: 'Identifiant invalide' }, 400);
    }

    const payload = c.get('user');

    const expense = await c.env.DB.prepare('SELECT * FROM expenses WHERE id = ?').bind(id).first<Expense>();

    if (!expense) {
      return c.json({ error: 'Dépense introuvable' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM expenses WHERE id = ?').bind(id).run();

    await c.env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      payload.userId,
      'delete',
      'expense',
      id,
      JSON.stringify(expense)
    ).run();

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Échec de la suppression de la dépense' }, 500);
  }
});

export default expenses;
