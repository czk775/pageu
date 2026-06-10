import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

const assistantAnswers = [
  {
    keywords: ['怎么填写经历', '经历怎么填', '填写经历', '经历'],
    answer: '建议描述背景、目标、行动、结果，我会帮你整理成适合个人网站展示的内容。',
  },
  {
    keywords: ['JD是什么', 'jd是什么', '岗位描述', 'JD'],
    answer: 'JD 是岗位描述，把目标岗位要求粘贴进来，我会根据岗位重点帮你组织展示内容。',
  },
  {
    keywords: ['模板怎么选', '选择模板', '模板'],
    answer: '模板只影响视觉风格，不影响你的经历内容。可以先选一个喜欢的，后面还可以调整。',
  },
  {
    keywords: ['为什么要生成个人网站', '个人网站有什么用', '生成个人网站'],
    answer: '个人网站比 PDF 更直观，可以把经历、项目、技能和作品集中展示，并生成链接和二维码分享。',
  },
  {
    keywords: ['能不能重新修改', '重新修改', '还能修改', '修改'],
    answer: '可以，生成后可以在编辑页继续调整内容、颜色、模块和模板。',
  },
];

const fallbackAnswer = '我可以帮你理解填写、分析、编辑和发布流程，你可以问我“怎么填写经历”“模板怎么选”等问题。';

const pageGuides = {
  '/create': '我在创建页陪你整理信息，经历、JD、模板都可以问我。',
  '/analyze': '我正在帮你理解岗位和经历，也可以解释分析结果。',
  '/editor': '我可以帮你想想怎么调整模块、颜色和展示重点。',
  '/publish': '我可以帮你确认链接、二维码和访问权限。',
};

const getAnswer = (question) => {
  const normalizedQuestion = question.trim().toLowerCase();
  const matched = assistantAnswers.find((item) =>
    item.keywords.some((keyword) => normalizedQuestion.includes(keyword.toLowerCase())),
  );

  return matched?.answer || fallbackAnswer;
};

export function FloatingAssistant({ hint = '有什么问题可以问我哦' }) {
  const { pathname } = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const displayHint = hovered || chatOpen ? '有什么问题可以问我哦' : hint;
  const pageGuide = useMemo(() => pageGuides[pathname] || '我可以陪你走完整个 PageU 创建流程。', [pathname]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!question.trim()) {
      setAnswer(fallbackAnswer);
      return;
    }

    setAnswer(getAnswer(question));
    setQuestion('');
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
            <button type="button" aria-label="关闭小U咨询助手" onClick={() => setChatOpen(false)}>
              ×
            </button>
          </div>
          <p>{pageGuide}</p>
          {answer ? <div className="xiaou-answer">{answer}</div> : null}
          <form className="xiaou-chat-form" onSubmit={handleSubmit}>
            <input
              aria-label="向小U提问"
              placeholder="问问小U，比如：怎么填写经历"
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
            <button type="submit" aria-label="发送问题">
              发送
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
