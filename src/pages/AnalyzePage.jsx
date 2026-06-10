import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Highlighter, ListChecks, RotateCcw, Tags } from 'lucide-react';
import { DynamicBackground } from '../components/DynamicBackground';
import { FloatingAssistant } from '../components/FloatingAssistant';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusToast } from '../components/StatusToast';
import { analyzeCareerDraft } from '../services/ai/aiClient';
import { useCreateDraft } from '../state/CreateDraftContext';

function AnalysisCard({ icon: Icon, title, children }) {
  return (
    <GlassCard as="article" className="analysis-card" aria-label={title}>
      <div className="analysis-card-title">
        <span className="analysis-icon">
          <Icon size={21} strokeWidth={2.4} aria-hidden="true" />
        </span>
        <h2>{title}</h2>
      </div>
      {children}
    </GlassCard>
  );
}

export function AnalyzePage() {
  const navigate = useNavigate();
  const { createDraft } = useCreateDraft();
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [userAdjustment, setUserAdjustment] = useState('');
  const [analysisMessage, setAnalysisMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('loading');

  const runAnalysis = async (adjustment = '') => {
    setAnalysisStatus('loading');
    setAnalysisMessage('');
    const result = await analyzeCareerDraft(createDraft, adjustment);
    setAnalysisResult(result);
    setAnalysisStatus(result.meta?.fallback ? 'fallback' : 'success');
    return result;
  };

  useEffect(() => {
    let active = true;

    setAnalysisStatus('loading');
    setAnalysisMessage('');
    analyzeCareerDraft(createDraft, '').then((result) => {
      if (!active) {
        return;
      }

      setAnalysisResult(result);
      setAnalysisStatus(result.meta?.fallback ? 'fallback' : 'success');
    });

    return () => {
      active = false;
    };
  }, [createDraft]);

  const handleReanalyze = async () => {
    await runAnalysis(userAdjustment);
    setAnalysisMessage('已根据你的补充重新整理理解');
  };

  const pageTitle = analysisStatus === 'loading' ? '分析中' : '分析结果';

  return (
    <main className="analyze-page">
      <DynamicBackground />
      <section className="analyze-flow" aria-labelledby="analyze-title">
        <header className="analyze-header">
          <Link className="placeholder-brand" to="/">
            PageU
          </Link>
          <Link className="return-action" to="/create">
            返回修改
          </Link>
          <h1 id="analyze-title">{pageTitle}</h1>
        </header>

        {analysisStatus === 'loading' ? <p className="analysis-loading">小U 正在理解你的经历…</p> : null}

        {analysisResult ? (
          <div className="analysis-grid">
            <AnalysisCard icon={Tags} title="岗位关键词">
              <div className="analysis-tags">
                {analysisResult.jobKeywords.map((keyword) => (
                  <span key={keyword}>{keyword}</span>
                ))}
              </div>
            </AnalysisCard>

            <AnalysisCard icon={Brain} title="能力重点">
              <div className="analysis-tags focus-tags">
                {analysisResult.abilityFocus.map((ability) => (
                  <span key={ability}>{ability}</span>
                ))}
              </div>
            </AnalysisCard>

            <AnalysisCard icon={ListChecks} title="推荐展示顺序">
              <ol className="analysis-order">
                {analysisResult.displayOrder.map((item, index) => (
                  <li key={`${item}-${index}`}>
                    <span>{index + 1}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </AnalysisCard>

            <AnalysisCard icon={Highlighter} title="推荐强调经历">
              <ul className="analysis-list">
                {analysisResult.highlightedExperiences.map((experience) => (
                  <li key={experience}>{experience}</li>
                ))}
              </ul>
            </AnalysisCard>
          </div>
        ) : null}

        {analysisStatus === 'fallback' ? (
          <p className="analysis-fallback-note">当前使用演示分析结果，真实 AI 暂不可用。</p>
        ) : null}

        <div className="analyze-actions">
          <PrimaryButton icon={ArrowRight} onClick={() => navigate('/editor')}>
            确认生成
          </PrimaryButton>
          <button className="adjust-action" type="button" onClick={() => setAdjustmentOpen((open) => !open)}>
            哪里需要调整
          </button>
        </div>

        {adjustmentOpen ? (
          <div className="adjustment-panel">
            <textarea
              aria-label="补充调整说明"
              placeholder="比如：我想突出比赛经历，弱化技术背景"
              rows={4}
              value={userAdjustment}
              onChange={(event) => {
                setUserAdjustment(event.target.value);
                setAnalysisMessage('');
              }}
            />
            <button className="secondary-action" type="button" onClick={handleReanalyze}>
              <RotateCcw size={17} aria-hidden="true" />
              重新分析
            </button>
            <StatusToast message={analysisMessage} />
          </div>
        ) : null}
      </section>
      <FloatingAssistant />
    </main>
  );
}
