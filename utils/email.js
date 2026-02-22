import { promises as dns } from "dns";

export function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export async function hasDeliverableDomain(email) {
  const normalized = normalizeEmail(email);
  const atIndex = normalized.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    return false;
  }

  const domain = normalized.slice(atIndex + 1);

  try {
    const mx = await dns.resolveMx(domain);
    if (Array.isArray(mx) && mx.length > 0) {
      return true;
    }
  } catch {}

  try {
    const a = await dns.resolve4(domain);
    if (Array.isArray(a) && a.length > 0) {
      return true;
    }
  } catch {}

  try {
    const aaaa = await dns.resolve6(domain);
    if (Array.isArray(aaaa) && aaaa.length > 0) {
      return true;
    }
  } catch {}

  return false;
}
