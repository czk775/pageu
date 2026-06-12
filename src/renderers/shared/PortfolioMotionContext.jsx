import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const PortfolioMotionContext = createContext({
  mode: 'site',
  isPreview: false,
  reducedMotion: false,
});

export function usePrefersReducedMotion() {
  const getInitialValue = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [reducedMotion, setReducedMotion] = useState(getInitialValue);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setReducedMotion(mediaQuery.matches);

    handleChange();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }

    return undefined;
  }, []);

  return reducedMotion;
}

export function PortfolioMotionProvider({ children, mode, reducedMotion }) {
  const value = useMemo(
    () => ({
      mode,
      isPreview: mode === 'preview',
      reducedMotion,
    }),
    [mode, reducedMotion],
  );

  return <PortfolioMotionContext.Provider value={value}>{children}</PortfolioMotionContext.Provider>;
}

export function usePortfolioMotion() {
  return useContext(PortfolioMotionContext);
}

export function AnimatedSection({ children, className = '', motionKey, delay = 0, ...props }) {
  const { reducedMotion, isPreview } = usePortfolioMotion();
  const distance = isPreview ? 14 : 24;
  const canUseViewportMotion = !reducedMotion && typeof window !== 'undefined' && typeof window.IntersectionObserver === 'function';

  return (
    <motion.section
      className={className}
      data-motion-section={motionKey}
      initial={canUseViewportMotion ? { opacity: 0, y: distance } : false}
      whileInView={canUseViewportMotion ? { opacity: 1, y: 0 } : undefined}
      viewport={canUseViewportMotion ? { once: true, amount: 0.18 } : undefined}
      transition={{ duration: 0.72, delay, ease: [0.2, 0.8, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export function AnimatedProjectArticle({ children, className = '', motionIndex = 0, ...props }) {
  const { reducedMotion, isPreview } = usePortfolioMotion();
  const direction = motionIndex % 2 === 0 ? -18 : 18;
  const x = isPreview ? direction / 2 : direction;
  const canUseViewportMotion = !reducedMotion && typeof window !== 'undefined' && typeof window.IntersectionObserver === 'function';

  return (
    <motion.article
      className={className}
      data-motion-card="project"
      initial={canUseViewportMotion ? { opacity: 0, x, y: 18 } : false}
      whileInView={canUseViewportMotion ? { opacity: 1, x: 0, y: 0 } : undefined}
      whileHover={reducedMotion ? undefined : { y: -6, scale: 1.006 }}
      viewport={canUseViewportMotion ? { once: true, amount: 0.2 } : undefined}
      transition={{ duration: 0.68, delay: Math.min(motionIndex * 0.06, 0.18), ease: [0.2, 0.8, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.article>
  );
}
