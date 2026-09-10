export function sanitizeString(value: unknown, maxLength = 200): string {
  if (typeof value !== 'string') return '';
  let cleaned = value
    // Remove script blocks entirely (XSS)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    // Remove all other HTML tags (XSS)
    .replace(/<[^>]*>/g, ' ')
    // Remove control characters
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    // Strip dangerous quoting where relevant but keep normal punctuation
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.slice(0, maxLength);
}

export function sanitizeEmail(value: unknown): string {
  const v = sanitizeString(value, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return '';
  return v;
}

export function sanitizeInt(value: unknown, min = 0, max = 1000000000): number | null {
  const n = typeof value === 'number' ? Math.round(value) : parseInt(String(value), 10);
  if (isNaN(n)) return null;
  if (n < min || n > max) return null;
  return n;
}

export function sanitizeAmount(value: unknown): number | null {
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(n) || !isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded <= 0 || rounded > 1000000000) return null;
  return rounded;
}

export function sanitizeMonth(value: unknown): string {
  const v = sanitizeString(value, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) return '';
  return v;
}

export function sanitizeDate(value: unknown): string {
  const v = sanitizeString(value, 10);
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(v)) return '';
  return v;
}

export function sanitizePhone(value: unknown): string {
  return sanitizeString(value, 20);
}

export function sanitizeBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

export const PAYMENT_TYPES = ['cash', 'bank_transfer', 'other'] as const;
export type PaymentType = typeof PAYMENT_TYPES[number];

export function sanitizePaymentType(value: unknown): PaymentType | null {
  const v = sanitizeString(value, 20);
  return PAYMENT_TYPES.includes(v as PaymentType) ? (v as PaymentType) : null;
}

export function generateSessionId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
}
