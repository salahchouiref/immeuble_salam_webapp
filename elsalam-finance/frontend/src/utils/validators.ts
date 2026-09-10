export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateAmount(amount: number): boolean {
  return !isNaN(amount) && amount > 0 && isFinite(amount);
}

export function validateRequired(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

export function validateMonth(month: string): boolean {
  return /^\d{4}-\d{2}$/.test(month);
}

export function validateDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}
