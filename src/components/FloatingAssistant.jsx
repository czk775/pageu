import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { answerAssistantQuestion } from '../services/ai/assistantChat';
import { useCreateDraft } from '../state/CreateDraftContext';

const pageGuides = {
  '/create': '我在创建页陪你整理信息，经历、JD、模板都可以问我。',
  '/analyze': '我正在帮你理解岗位和经历，也可以解释分析结果。',
  '/editor': '我可以帮你想想怎么调整模块、颜色和展示重点。',
  '/publish': '我可以帮你确认链接、二维码和访问权限。',
};

export function FloatingAssistant({ hint = '有什么问题可以问我哦' }) {
  const { pathname } = useLocation();
  const { createDraft } = useCreateDraft();
  const [chatOpen, setChatOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [assistantMeta, setAssistantMeta] = useState(null);
  const [chatStatus, setChatStatus] = useState('idle');

  const displayHint = hovered || chatOpen ? '有什么问题可以问我哦' : hint;
  const pageGuide = useMemo(() => pageGuides[pathname] || '我可以陪你走完整个 PageU 创建流程。', [pathname]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const currentQuestion = question.trim();
    setChatStatus('loading');
    setAnswer('');
    setAssistantMeta(null);
    setQuestion('');

    const result = await answerAssistantQuestion({
      question: currentQuestion,
      pathname,
      createDraft,
    });

    setAnswer(result.answer);
    setAssistantMeta(result.meta);
    setChatStatus('idle');
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setQuestion('');
    setAnswer('');
    setAssistantMeta(null);
    setChatStatus('idle');
  };

  return (
    <motion.aside
      className={`xiaou-wrap ${chatOpen ? 'xiaou-open' : ''}`}
      aria-label="小U 光团助手"
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: chatOpen ? -10 : 0, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {chatOpen ? (
        <motion.div
          className="xiaou-chat"
          role="dialog"
          aria-label="小U咨询助手"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
        >
          <div className="xiaou-chat-head">
            <span>小U</span>
            <button type="button" aria-label="关闭小U咨询助手" onClick={handleCloseChat}>
              ×
            </button>
          </div>
          <p>可以问我怎么填写经历、JD 是什么、模板怎么选。</p>
          <p>{pageGuide}</p>
          {chatStatus === 'loading' ? <div className="xiaou-answer" role="status">小U 正在思考…</div> : null}
          {answer ? (
            <div className="xiaou-answer">
              <span>{answer}</span>
              {assistantMeta?.fallback ? <small>AI 暂不可用，已用本地引导回答</small> : null}
            </div>
          ) : null}
          <form className="xiaou-chat-form" onSubmit={handleSubmit}>
            <input
              aria-label="向小U提问"
              placeholder="问问小U，比如：怎么填写经历"
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
            <button type="submit" aria-label="发送问题" disabled={chatStatus === 'loading'}>
              {chatStatus === 'loading' ? '思考中' : '发送'}
            </button>
          </form>
        </motion.div>
      ) : null}

      <motion.button
        type="button"
        className="xiaou-trigger"
        aria-label="打开小U咨询助手"
        whileHover={{ scale: 1.04, rotate: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setChatOpen((open) => !open)}
      >
        <motion.div
          className="xiaou-glow"
          animate={{ y: hovered || chatOpen ? [0, -13, 0] : [0, -9, 0], rotate: hovered || chatOpen ? [-2, 2, -2] : [-1, 1, -1] }}
          transition={{ duration: hovered || chatOpen ? 3.1 : 4.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="xiaou-eye xiaou-eye-left" />
          <span className="xiaou-eye xiaou-eye-right" />
        </motion.div>
        <div className="xiaou-copy">
          <span>小U</span>
          <p>{displayHint}</p>
        </div>
      </motion.button>
    </motion.aside>
  );
}
