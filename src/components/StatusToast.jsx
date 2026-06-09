import { motion, AnimatePresence } from 'framer-motion';

export function StatusToast({ message }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          className="status-toast"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
