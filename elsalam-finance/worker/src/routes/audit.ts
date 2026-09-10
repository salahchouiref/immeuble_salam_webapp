import { Hono } from 'hono';
import { Env, Variables, AuditLog } from '../types';
import { authMiddleware, adminOnly } from '../middleware/auth';

const audit = new Hono<{ Bindings: Env; Variables: Variables }>();

audit.get('/', authMiddleware, adminOnly, async (c) => {
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  const entityType = c.req.query('entity_type');

  let query = `
    SELECT a.*, u.name as user_name
    FROM audit_logs a
    LEFT JOIN users u ON u.id = a.user_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (entityType) {
    query += ' AND a.entity_type = ?';
    params.push(entityType);
  }

  query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await c.env.DB.prepare(query).bind(...params).all<AuditLog>();

  const countResult = await c.env.DB.prepare(
    'SELECT COUNT(*) as total FROM audit_logs'
  ).first<{ total: number }>();

  return c.json({
    logs: result.results,
    total: countResult?.total || 0,
  });
});

export default audit;
