import type { Request, Response } from 'express';

interface CookieOptions {
  maxAgeMs?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  path?: string;
}

export function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!name) continue;
    try {
      out[name] = decodeURIComponent(value);
    } catch {
      out[name] = value;
    }
  }
  return out;
}

export function setCookie(
  res: Response,
  name: string,
  value: string,
  opts: CookieOptions = {}
): void {
  const parts: string[] = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${opts.path ?? '/'}`);
  if (opts.httpOnly !== false) parts.push('HttpOnly');
  if (opts.secure) parts.push('Secure');
  parts.push(`SameSite=${opts.sameSite ?? 'Lax'}`);
  if (opts.maxAgeMs !== undefined) {
    parts.push(`Max-Age=${Math.floor(opts.maxAgeMs / 1000)}`);
  }
  appendSetCookie(res, parts.join('; '));
}

export function clearCookie(res: Response, name: string, path = '/'): void {
  appendSetCookie(
    res,
    `${name}=; Path=${path}; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

function appendSetCookie(res: Response, header: string): void {
  const existing = res.getHeader('Set-Cookie');
  if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, header]);
  } else if (typeof existing === 'string') {
    res.setHeader('Set-Cookie', [existing, header]);
  } else {
    res.setHeader('Set-Cookie', header);
  }
}
