import { motion } from 'framer-motion';

export function FloatingAssistant({ hint = '准备好开始了吗？' }) {
  return (
    <motion.aside
      className="xiaou-wrap"
      aria-label="小U 光团助手"
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <motion.div
        className="xiaou-glow"
        animate={{ y: [0, -9, 0], rotate: [-1, 1, -1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="xiaou-eye xiaou-eye-left" />
        <span className="xiaou-eye xiaou-eye-right" />
      </motion.div>
      <div className="xiaou-copy">
        <span>小U</span>
        <p>{hint}</p>
      </div>
    </motion.aside>
  );
}
