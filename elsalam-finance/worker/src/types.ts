export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export interface Variables {
  user: JWTPayload;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'resident';
  resident_id: number | null;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Resident {
  id: number;
  apartment_number: string;
  name: string;
  phone: string | null;
  email: string | null;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  name_ar: string;
  active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  resident_id: number;
  month: string;
  date: string;
  amount: number;
  payment_type: 'cash' | 'bank_transfer' | 'other';
  note: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  resident_name?: string;
  apartment_number?: string;
}

export interface Expense {
  id: number;
  category_id: number;
  month: string;
  date: string;
  description: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'other';
  note: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_name_ar?: string;
}

export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string | null;
  created_at: string;
  user_name?: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'admin' | 'resident';
  residentId?: number;
  jti: string;
}

export interface Session {
  id: string;
  user_id: number;
  created_at: string;
  expires_at: string;
  active: number;
}

export interface DashboardData {
  currentBalance: number;
  totalPayments: number;
  totalExpenses: number;
  totalResidents: number;
  activeResidents: number;
  monthlyExpected: number;
  monthlyReceived: number;
  monthlyRemaining: number;
  monthlyExpenses: number;
  paymentStatus: Array<{
    residentId: number;
    apartmentNumber: string;
    residentName: string;
    expected: number;
    paid: number;
    remaining: number;
    status: 'paid' | 'partial' | 'not_paid';
  }>;
  expenseBreakdown: Array<{
    categoryId: number;
    categoryName: string;
    categoryNameAr: string;
    total: number;
  }>;
}

export interface MonthlyReport {
  month: string;
  totalPayments: number;
  totalExpenses: number;
  monthlyBalance: number;
  expectedContributions: number;
  receivedContributions: number;
  remainingToReceive: number;
  residentsCount: number;
  paidCount: number;
  partialCount: number;
  notPaidCount: number;
  expenseBreakdown: Array<{
    categoryId: number;
    categoryName: string;
    categoryNameAr: string;
    total: number;
  }>;
}
