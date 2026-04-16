interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
}

export function createRateLimiter({ windowMs, maxRequests }: RateLimiterOptions) {
  const entries = new Map<string, RateLimitEntry>();

  return {
    isLimited(key: string): boolean {
      const now = Date.now();

      entries.forEach((value, entryKey) => {
        if (value.resetAt <= now) {
          entries.delete(entryKey);
        }
      });

      const current = entries.get(key);
      if (!current || current.resetAt <= now) {
        entries.set(key, { count: 1, resetAt: now + windowMs });
        return false;
      }

      if (current.count >= maxRequests) {
        return true;
      }

      current.count += 1;
      entries.set(key, current);
      return false;
    },
  };
}
