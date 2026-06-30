'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.slice(1);

    // Async sections (gallery, nearby locations) load data above the target
    // and grow the page after the first paint, shifting the target down. Keep
    // re-correcting until the target's position has been stable for a few
    // checks in a row, instead of giving up after a fixed delay — a fixed
    // delay can stop right as a late layout shift lands the viewport on the
    // wrong section. Stop early if the user takes manual control of scrolling.
    let lastTop: number | null = null;
    let stableChecks = 0;

    const cancel = () => { clearInterval(interval); clearTimeout(stop); };
    const interval = setInterval(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = Math.round(el.getBoundingClientRect().top);

      if (top === lastTop) {
        stableChecks++;
        if (stableChecks >= 3) cancel();
        return;
      }

      stableChecks = 0;
      lastTop = top;
      // `behavior: 'auto'` defers to CSS `scroll-behavior` (smooth here), so
      // each correction would animate and overlap the next one. Force a true
      // instant jump so corrections land immediately and reliably.
      const root = document.documentElement;
      const prevBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
      root.style.scrollBehavior = prevBehavior;
    }, 200);
    // Hard ceiling in case content never settles (e.g. a very slow network).
    const stop = setTimeout(cancel, 6000);

    window.addEventListener('wheel', cancel, { once: true });
    window.addEventListener('touchmove', cancel, { once: true });

    return () => {
      cancel();
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchmove', cancel);
    };
  }, [pathname]);

  useEffect(() => {
    const onHashChange = () => {
      const el = document.getElementById(window.location.hash.slice(1));
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return null;
}
