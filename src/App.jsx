import { Link, Route, Routes } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const placeholders = {
  create: {
    title: '创建页',
    hint: '告诉我你的经历',
  },
  analyze: {
    title: 'AI 分析页',
    hint: '这是我对你的理解',
  },
  editor: {
    title: '编辑页',
    hint: '再调整一下，让它更像你',
  },
  publish: {
    title: '发布页',
    hint: '你的个人网站准备好了',
  },
  site: {
    title: '个人网站页',
    hint: '这里是生成后的个人网站',
  },
};

function DynamicBackground() {
  return (
    <div className="background-stage" aria-hidden="true">
      <div className="soft-field soft-field-one" />
      <div className="soft-field soft-field-two" />
      <div className="signal-grid" />
      <div className="signal-beam signal-beam-one" />
      <div className="signal-beam signal-beam-two" />
      <div className="floating-chip chip-one" />
      <div className="floating-chip chip-two" />
      <div className="floating-chip chip-three" />
    </div>
  );
}

function XiaoU() {
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
        <p>准备好开始了吗？</p>
      </div>
    </motion.aside>
  );
}

function HomePage() {
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
      <XiaoU />
    </main>
  );
}

function PlaceholderPage({ title, hint }) {
  return (
    <main className="placeholder-page">
      <DynamicBackground />
      <section className="placeholder-content">
        <Link className="placeholder-brand" to="/">
          PageU
        </Link>
        <h1>{title}</h1>
        <p>{hint}</p>
      </section>
      <XiaoU />
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<PlaceholderPage {...placeholders.create} />} />
      <Route path="/analyze" element={<PlaceholderPage {...placeholders.analyze} />} />
      <Route path="/editor" element={<PlaceholderPage {...placeholders.editor} />} />
      <Route path="/publish" element={<PlaceholderPage {...placeholders.publish} />} />
      <Route path="/site/:id" element={<PlaceholderPage {...placeholders.site} />} />
    </Routes>
  );
}
