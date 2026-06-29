import { type ReactNode } from 'react';
import { motion } from 'motion/react';

interface Props {
  children: ReactNode;
}

/**
 * Envuelve cualquier página con un fade-in + slide-up sutil.
 * Usar una sola vez por módulo (en AdminLayout rodea <Outlet />).
 * 
 * 🎯 Animación ligera: opacity + translateY (GPU-composited).
 * No usa scale (evita parpadeos de bordes en glass cards).
 */
export default function PageTransition({ children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
