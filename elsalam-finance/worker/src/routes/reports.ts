import { Hono } from 'hono';
import { Env, Variables, MonthlyReport } from '../types';
import { authMiddleware } from '../middleware/auth';
import { sanitizeMonth } from '../utils/sanitize';

const reports = new Hono<{ Bindings: Env; Variables: Variables }>();

reports.get('/monthly', authMiddleware, async (c) => {
  try {
    const rawMonth = c.req.query('month');
    const month = rawMonth ? sanitizeMonth(rawMonth) : '';
    if (!month) {
      return c.json({ error: 'Paramètre mois invalide' }, 400);
    }

    const db = c.env.DB;

    // Get settings
    const settingsResult = await db.prepare(
      'SELECT value FROM settings WHERE key = \'monthly_contribution\''
    ).first<{ value: string }>();
    const monthlyContribution = parseInt(settingsResult?.value || '100');

    // Total payments for month
    const paymentsResult = await db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE month = ?'
    ).bind(month).first<{ total: number }>();

    // Total expenses for month
    const expensesResult = await db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE month = ?'
    ).bind(month).first<{ total: number }>();

    // Active residents
    const residentsResult = await db.prepare(
      'SELECT COUNT(*) as count FROM residents WHERE active = 1'
    ).first<{ count: number }>();

    // Payment status
    const activeResidents = await db.prepare(
      'SELECT id, apartment_number, name FROM residents WHERE active = 1 ORDER BY apartment_number'
    ).all();

    let paidCount = 0;
    let partialCount = 0;
    let notPaidCount = 0;

    for (const resident of activeResidents.results) {
      const paid = await db.prepare(
        'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE resident_id = ? AND month = ?'
      ).bind((resident as any).id, month).first<{ total: number }>();

      const amount = paid?.total || 0;
      if (amount >= monthlyContribution) paidCount++;
      else if (amount > 0) partialCount++;
      else notPaidCount++;
    }

    // Expense breakdown
    const expenseBreakdown = await db.prepare(`
      SELECT c.id as categoryId, c.name as categoryName, c.name_ar as categoryNameAr,
             COALESCE(SUM(e.amount), 0) as total
      FROM categories c
      LEFT JOIN expenses e ON e.category_id = c.id AND e.month = ?
      WHERE c.active = 1
      GROUP BY c.id
      HAVING total > 0
      ORDER BY total DESC
    `).bind(month).all();

    const totalPayments = paymentsResult?.total || 0;
    const totalExpenses = expensesResult?.total || 0;
    const residentsCount = residentsResult?.count || 0;

    const report: MonthlyReport = {
      month,
      totalPayments,
      totalExpenses,
      monthlyBalance: totalPayments - totalExpenses,
      expectedContributions: residentsCount * monthlyContribution,
      receivedContributions: totalPayments,
      remainingToReceive: (residentsCount * monthlyContribution) - totalPayments,
      residentsCount,
      paidCount,
      partialCount,
      notPaidCount,
      expenseBreakdown: expenseBreakdown.results as any,
    };

    return c.json({ report });
  } catch (error) {
    console.error('Report error:', error);
    return c.json({ error: 'Échec de la génération du rapport' }, 500);
  }
});

export default reports;
