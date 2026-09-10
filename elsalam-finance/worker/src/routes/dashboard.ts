import { Hono } from 'hono';
import { Env, Variables, DashboardData, Resident } from '../types';
import { authMiddleware } from '../middleware/auth';

const dashboard = new Hono<{ Bindings: Env; Variables: Variables }>();

dashboard.get('/', authMiddleware, async (c) => {
  try {
    const db = c.env.DB;

    // Get total payments and expenses (all time)
    const totalPaymentsResult = await db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments'
    ).first<{ total: number }>();

    const totalExpensesResult = await db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses'
    ).first<{ total: number }>();

    // Get settings
    const settingsResult = await db.prepare(
      'SELECT value FROM settings WHERE key = \'monthly_contribution\''
    ).first<{ value: string }>();

    const monthlyContribution = parseInt(settingsResult?.value || '100');

    // Get active residents count
    const activeResidentsResult = await db.prepare(
      'SELECT COUNT(*) as count FROM residents WHERE active = 1'
    ).first<{ count: number }>();

    // Get current month (latest month with data)
    const latestMonthResult = await db.prepare(
      'SELECT DISTINCT month FROM payments ORDER BY month DESC LIMIT 1'
    ).first<{ month: string }>();

    const currentMonth = latestMonthResult?.month || new Date().toISOString().substring(0, 7);

    // Monthly payments
    const monthlyPaymentsResult = await db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE month = ?'
    ).bind(currentMonth).first<{ total: number }>();

    // Monthly expenses
    const monthlyExpensesResult = await db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE month = ?'
    ).bind(currentMonth).first<{ total: number }>();

    // Payment status per resident for current month
    const activeResidents = await db.prepare(
      'SELECT id, apartment_number, name FROM residents WHERE active = 1 ORDER BY apartment_number'
    ).all<Resident>();

    const paymentStatus = await Promise.all(
      activeResidents.results.map(async (resident: Resident) => {
        const paidResult = await db.prepare(
          'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE resident_id = ? AND month = ?'
        ).bind(resident.id, currentMonth).first<{ total: number }>();

        const paid = paidResult?.total || 0;
        const expected = monthlyContribution;
        const remaining = Math.max(0, expected - paid);

        let status: 'paid' | 'partial' | 'not_paid' = 'not_paid';
        if (paid >= expected) status = 'paid';
        else if (paid > 0) status = 'partial';

        return {
          residentId: resident.id,
          apartmentNumber: resident.apartment_number,
          residentName: resident.name,
          expected,
          paid,
          remaining,
          status,
        };
      })
    );

    // Expense breakdown for current month
    const expenseBreakdownRaw = await db.prepare(`
      SELECT c.id as categoryId, c.name as categoryName, c.name_ar as categoryNameAr,
             COALESCE(SUM(e.amount), 0) as total
      FROM categories c
      LEFT JOIN expenses e ON e.category_id = c.id AND e.month = ?
      WHERE c.active = 1
      GROUP BY c.id
      HAVING total > 0
      ORDER BY total DESC
    `).bind(currentMonth).all();

    const totalPayments = totalPaymentsResult?.total || 0;
    const totalExpenses = totalExpensesResult?.total || 0;
    const activeResidentsCount = activeResidentsResult?.count || activeResidents.results.length;

    const data: DashboardData = {
      currentBalance: totalPayments - totalExpenses,
      totalPayments,
      totalExpenses,
      totalResidents: activeResidents.results.length,
      activeResidents: activeResidentsCount,
      monthlyExpected: activeResidents.results.length * monthlyContribution,
      monthlyReceived: monthlyPaymentsResult?.total || 0,
      monthlyRemaining: (activeResidents.results.length * monthlyContribution) - (monthlyPaymentsResult?.total || 0),
      monthlyExpenses: monthlyExpensesResult?.total || 0,
      paymentStatus,
      expenseBreakdown: expenseBreakdownRaw.results as any,
    };

    return c.json({ data, currentMonth });
  } catch (error) {
    console.error('Dashboard error:', error);
    return c.json({ error: 'Failed to load dashboard' }, 500);
  }
});

export default dashboard;
