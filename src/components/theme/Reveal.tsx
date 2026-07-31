import { motion } from 'motion/react';
import type { ReactNode } from 'react';

/** Fade+slide genérico ao entrar no viewport — usado para dar ritmo de scroll
 * às secções do storefront em vez de tudo aparecer estático no load. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.19, 1, 0.22, 1] }}
    >
      {children}
    </motion.div>
  );
}
