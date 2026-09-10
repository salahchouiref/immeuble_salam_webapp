import { AuthResponse, User, Resident, Category, Payment, Expense, DashboardData, MonthlyReport, HistoryItem, Settings, AuditLog } from '../types';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const isLoginRequest = endpoint === '/auth/login';
    const isLogoutRequest = endpoint === '/auth/logout';

    if (response.status === 401 && !isLoginRequest && !isLogoutRequest) {
      this.token = null;
      localStorage.removeItem('elsalam-token');
      localStorage.removeItem('elsalam-user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    // Logout returns empty body in some configs
    if (isLogoutRequest && (response.status === 200 || response.status === 204 || response.status === 401)) {
      return undefined as T;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = (data && data.error) || 'Request failed';
      const err = new Error(message) as Error & { status?: number };
      err.status = response.status;
      throw err;
    }

    return data;
  }

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe(): Promise<{ user: User }> {
    return this.request('/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Dashboard
  async getDashboard(): Promise<{ data: DashboardData; currentMonth: string }> {
    return this.request('/dashboard');
  }

  // Residents
  async getResidents(): Promise<{ residents: Resident[] }> {
    return this.request('/residents');
  }

  async createResident(data: Partial<Resident>): Promise<{ success: boolean; id: number }> {
    return this.request('/residents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateResident(id: number, data: Partial<Resident>): Promise<{ success: boolean }> {
    return this.request(`/residents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateResidentStatus(id: number, active: boolean): Promise<{ success: boolean }> {
    return this.request(`/residents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
  }

  async deleteResident(id: number): Promise<{ success: boolean }> {
    return this.request(`/residents/${id}`, {
      method: 'DELETE',
    });
  }

  // Payments
  async getPayments(month?: string, residentId?: number): Promise<{ payments: Payment[] }> {
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (residentId) params.set('resident_id', String(residentId));
    const query = params.toString();
    return this.request(`/payments${query ? `?${query}` : ''}`);
  }

  async createPayment(data: Partial<Payment>): Promise<{ success: boolean; id: number }> {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayment(id: number, data: Partial<Payment>): Promise<{ success: boolean }> {
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePayment(id: number): Promise<{ success: boolean }> {
    return this.request(`/payments/${id}`, {
      method: 'DELETE',
    });
  }

  // Expenses
  async getExpenses(month?: string, categoryId?: number): Promise<{ expenses: Expense[] }> {
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (categoryId) params.set('category_id', String(categoryId));
    const query = params.toString();
    return this.request(`/expenses${query ? `?${query}` : ''}`);
  }

  async createExpense(data: Partial<Expense>): Promise<{ success: boolean; id: number }> {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExpense(id: number, data: Partial<Expense>): Promise<{ success: boolean }> {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExpense(id: number): Promise<{ success: boolean }> {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    return this.request('/categories');
  }

  async createCategory(data: { name: string; name_ar: string }): Promise<{ success: boolean; id: number }> {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: { name: string; name_ar: string }): Promise<{ success: boolean }> {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateCategoryStatus(id: number, active: boolean): Promise<{ success: boolean }> {
    return this.request(`/categories/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
  }

  // Reports
  async getMonthlyReport(month: string): Promise<{ report: MonthlyReport }> {
    return this.request(`/reports/monthly?month=${month}`);
  }

  // Settings
  async getSettings(): Promise<{ settings: Settings }> {
    return this.request('/settings');
  }

  async updateSettings(data: Record<string, string>): Promise<{ success: boolean }> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // History
  async getHistory(month?: string, type?: string): Promise<{ history: HistoryItem[] }> {
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (type) params.set('type', type);
    const query = params.toString();
    return this.request(`/history${query ? `?${query}` : ''}`);
  }

  // Audit logs
  async getAuditLogs(limit?: number, offset?: number, entityType?: string): Promise<{ logs: AuditLog[]; total: number }> {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    if (offset) params.set('offset', String(offset));
    if (entityType) params.set('entity_type', entityType);
    const query = params.toString();
    return this.request(`/audit-logs${query ? `?${query}` : ''}`);
  }
}

export const api = new ApiClient();
