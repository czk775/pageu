import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { DynamicBackground } from '../components/DynamicBackground';
import { FloatingAssistant } from '../components/FloatingAssistant';

export function HomePage() {
  return (
    <main className="page-shell">
      <DynamicBackground />
      <section className="hero-section" aria-labelledby="home-title">
        <motion.p
          className="brand-mark"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <Sparkles size={22} strokeWidth={2.4} aria-hidden="true" />
          PageU
        </motion.p>
        <motion.h1
          id="home-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: 'easeOut' }}
        >
          生成你的个人网站
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: 'easeOut' }}
        >
          <Link className="primary-action" to="/create">
            立即创建
            <ArrowRight size={22} strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </motion.div>
      </section>
      <FloatingAssistant hint="准备好开始了吗" />
    </main>
  );
}
