// ============================================================
// Transit Station System — Core Security Module
// ============================================================

const SESSION_KEY = 'ts_session';
const SESSION_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

// ------------------------------------------------------------------
// 1. PASSWORD HASHING — SHA-256 via Web Crypto API (no dependencies)
// ------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === storedHash;
}

// ------------------------------------------------------------------
// 2. CRYPTOGRAPHIC SESSION TOKEN
// ------------------------------------------------------------------

export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface SessionData {
  token: string;
  userId: string;
  role: string;
  createdAt: number;
  lastActivity: number;
}

export function createSession(userId: string, role: string): string {
  const token = generateSessionToken();
  const now = Date.now();
  const session: SessionData = {
    token,
    userId,
    role,
    createdAt: now,
    lastActivity: now,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return token;
}

export function refreshSession(): void {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return;
  try {
    const session: SessionData = JSON.parse(raw);
    session.lastActivity = Date.now();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function validateSession(): boolean {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return false;
  try {
    const session: SessionData = JSON.parse(raw);
    const now = Date.now();
    const expired = now - session.lastActivity > SESSION_EXPIRY_MS;
    if (expired) {
      clearSession();
      return false;
    }
    return true;
  } catch {
    clearSession();
    return false;
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSessionUserId(): string | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session: SessionData = JSON.parse(raw);
    return session.userId;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// 3. LOGIN ATTEMPTS / AUDIT (No account lockout per user preference)
// ------------------------------------------------------------------

export function isAccountLocked(_username?: string): boolean {
  return false;
}

export function getAccountLockoutUntil(_username?: string): number | null {
  return null;
}

export function recordFailedAttempt(username: string): number {
  logSecurityEvent('FAILED_LOGIN', username, 'Failed password attempt');
  return -1;
}

export function clearFailedAttempts(_username?: string): void {
  // no-op
}

// ------------------------------------------------------------------
// 4. INPUT SANITIZATION — strip dangerous characters
// ------------------------------------------------------------------

/** Remove HTML tags, script injections, and dangerous characters from input */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/** Sanitize an entire object's string fields recursively */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      result[key] = sanitizeInput(val);
    } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      result[key] = sanitizeObject(val as Record<string, unknown>);
    } else {
      result[key] = val;
    }
  }
  return result as T;
}

// ------------------------------------------------------------------
// 5. SECURITY AUDIT LOGGER
// ------------------------------------------------------------------

interface SecurityEvent {
  type: string;
  username: string;
  message: string;
  timestamp: string;
  userAgent: string;
}

const SECURITY_LOG_KEY = 'ts_security_log';
const MAX_LOG_ENTRIES = 100;

export function logSecurityEvent(
  type: string,
  username: string,
  message: string
): void {
  try {
    const raw = localStorage.getItem(SECURITY_LOG_KEY);
    const log: SecurityEvent[] = raw ? JSON.parse(raw) : [];
    log.unshift({
      type,
      username,
      message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 100),
    });
    // Keep only last N entries
    if (log.length > MAX_LOG_ENTRIES) log.splice(MAX_LOG_ENTRIES);
    localStorage.setItem(SECURITY_LOG_KEY, JSON.stringify(log));
  } catch {
    // Non-critical; fail silently
  }
}

export function getSecurityLog(): SecurityEvent[] {
  try {
    const raw = localStorage.getItem(SECURITY_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ------------------------------------------------------------------
// 6. PRE-COMPUTED HASHES for demo users
//    Password: Transit@2025!
//    SHA-256 hash (pre-computed so no async needed at init time)
// ------------------------------------------------------------------
export const DEMO_PASSWORD_HASH =
  'c9f3f50f99e75aad05e5b51f6dee3f00ba0b46ba1b2d4a2e6d4bfb98ff9e5d42';

// Runtime compute for verification (used in login flow)
export async function getDemoPasswordHash(): Promise<string> {
  return hashPassword('Transit@2025!');
}
