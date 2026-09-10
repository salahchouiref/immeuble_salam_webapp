import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { authMiddleware } from '../middleware/auth';
import { sanitizeMonth, sanitizeString } from '../utils/sanitize';

const history = new Hono<{ Bindings: Env; Variables: Variables }>();

history.get('/', authMiddleware, async (c) => {
  const month = sanitizeMonth(c.req.query('month'));
  const type = sanitizeString(c.req.query('type'), 10);

  let query = `
    SELECT
      'payment' as type,
      p.id,
      p.date,
      p.amount,
      p.month,
      p.note,
      p.payment_type,
      r.name as resident_name,
      r.apartment_number,
      NULL as category_name,
      NULL as category_name_ar,
      NULL as description
    FROM payments p
    JOIN residents r ON r.id = p.resident_id

    UNION ALL

    SELECT
      'expense' as type,
      e.id,
      e.date,
      e.amount,
      e.month,
      e.note,
      e.payment_method as payment_type,
      NULL as resident_name,
      NULL as apartment_number,
      c.name as category_name,
      c.name_ar as category_name_ar,
      e.description
    FROM expenses e
    JOIN categories c ON c.id = e.category_id
  `;

  const conditions: string[] = [];
  const params: any[] = [];

  if (month) {
    conditions.push('month = ?');
    params.push(month);
  }

  if (type === 'payment') {
    conditions.push('type = ?');
    params.push('payment');
  } else if (type === 'expense') {
    conditions.push('type = ?');
    params.push('expense');
  }

  if (conditions.length > 0) {
    query = `SELECT * FROM (${query}) sub WHERE ${conditions.join(' AND ')}`;
  }

  query += ' ORDER BY date DESC, id DESC';
  query += ' LIMIT 200';

  const result = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({ history: result.results });
});

export default history;
