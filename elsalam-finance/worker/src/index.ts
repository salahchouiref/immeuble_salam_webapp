import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, Variables } from './types';
import auth from './routes/auth';
import dashboard from './routes/dashboard';
import residents from './routes/residents';
import payments from './routes/payments';
import expenses from './routes/expenses';
import categories from './routes/categories';
import reports from './routes/reports';
import settings from './routes/settings';
import audit from './routes/audit';
import history from './routes/history';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// API routes
app.route('/api/auth', auth);
app.route('/api/dashboard', dashboard);
app.route('/api/residents', residents);
app.route('/api/payments', payments);
app.route('/api/expenses', expenses);
app.route('/api/categories', categories);
app.route('/api/reports', reports);
app.route('/api/settings', settings);
app.route('/api/audit-logs', audit);
app.route('/api/history', history);

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
