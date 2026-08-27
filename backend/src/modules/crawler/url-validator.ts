import { Logger } from '@nestjs/common';
import * as dns from 'dns';

const logger = new Logger('URLValidator');

// Private/loopback IP ranges to block
const PRIVATE_IP_RANGES = [
  /^127\./,                    // Loopback
  /^10\./,                     // Class A private
  /^172\.(1[6-9]|2\d|3[01])\./, // Class B private
  /^192\.168\./,               // Class C private
  /^169\.254\./,               // Link-local
  /^0\./,                      // Current network
  /^::1$/,                     // IPv6 loopback
  /^fc00:/,                    // IPv6 ULA
  /^fe80:/,                    // IPv6 link-local
  /^fd00:/,                    // IPv6 ULA
];

// Blocked header keys
const BLOCKED_HEADERS = [
  'host', 'authorization', 'cookie', 'set-cookie',
  'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto',
  'x-real-ip', 'x-client-ip', 'x-cluster-client-ip',
  'true-client-ip', 'cf-connecting-ip',
];

export function isPrivateIP(hostname: string): boolean {
  return PRIVATE_IP_RANGES.some((range) => range.test(hostname));
}

export function validateUrl(url: string, allowedDomains?: string[]): { valid: boolean; reason: string } {
  try {
    const parsed = new URL(url);

    // Only allow http/https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, reason: `Blocked protocol: ${parsed.protocol}` };
    }

    // Check for private IP in hostname
    const hostname = parsed.hostname.toLowerCase();
    if (isPrivateIP(hostname)) {
      return { valid: false, reason: `Blocked private IP: ${hostname}` };
    }

    // Check for encoded bypasses
    if (hostname.includes('%') || url.includes('@') || url.includes('\\')) {
      return { valid: false, reason: `Suspicious URL encoding detected` };
    }

    // Check allowed domains if provided
    if (allowedDomains && allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some((d) => hostname === d || hostname.endsWith(`.${d}`));
      if (!isAllowed) {
        return { valid: false, reason: `Domain not in allowlist: ${hostname}` };
      }
    }

    return { valid: true, reason: 'OK' };
  } catch (e) {
    return { valid: false, reason: `Invalid URL: ${(e as Error).message}` };
  }
}

export function validateHeaders(headersJson: string): { valid: boolean; safe: Record<string, string>; blocked: string[] } {
  let headers: Record<string, string>;
  try {
    headers = JSON.parse(headersJson);
  } catch {
    return { valid: false, safe: {}, blocked: ['Invalid JSON'] };
  }

  const safe: Record<string, string> = {};
  const blocked: string[] = [];

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    if (BLOCKED_HEADERS.includes(lowerKey)) {
      blocked.push(key);
    } else {
      safe[key] = String(value).substring(0, 200); // Limit value length
    }
  }

  return { valid: blocked.length === 0, safe, blocked };
}

export function sanitizeError(error: unknown): string {
  const msg = (error as Error).message || 'Unknown error';
  // Remove file paths, IPs, internal details
  return msg
    .replace(/[A-Z]:\\[^\s]+/g, '[path]')
    .replace(/\/[^\s]+/g, '[path]')
    .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[ip]')
    .substring(0, 200);
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizeEmailSubject(subject: string): string {
  // Strip newlines and carriage returns to prevent header injection
  return subject.replace(/[\r\n]/g, '').substring(0, 200);
}
