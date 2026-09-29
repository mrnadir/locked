import { useEffect, useState } from 'react';

/** Milliseconds left until `until` (epoch ms), updated every second. */
export function useCountdown(until: number | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return until === null ? 0 : Math.max(0, until - now);
}
