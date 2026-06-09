import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Globe2,
  Highlighter,
  ListChecks,
  LockKeyhole,
  Monitor,
  Palette,
  Plus,
  QrCode,
  RotateCcw,
  Smartphone,
  Sparkles,
  Tags,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { templates } from './data/templates';
import { generateSiteDraft } from './lib/draftGenerator';
import { TemplateRenderer } from './renderers/TemplateRenderer';
import { CreateDraftProvider, useCreateDraft } from './state/CreateDraftContext';
import { createAnalysisResult } from './types/analysisResult';
import { createPublishDraft, normalizePublishDraft, PUBLISH_STORAGE_KEY } from './types/publishDraft';
import { normalizeSiteDraft, sectionLabels, SITE_DRAFT_STORAGE_KEY } from './types/siteDraft';

const PUBLIC_SITE_PATH = '/site/demo';

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

function XiaoU({ hint = '准备好开始了吗？' }) {
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

function Field({ id, label, children }) {
  return (
    <div className="create-field">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

function CreatePage() {
  const navigate = useNavigate();
  const {
    createDraft,
    updateBasicInfo,
    updateJobInfo,
    addExperience,
    updateExperience,
    toggleExperience,
    deleteExperience,
    selectTemplate,
  } = useCreateDraft();

  const handleGenerate = (event) => {
    event.preventDefault();
    navigate('/analyze');
  };

  return (
    <main className="create-page">
      <DynamicBackground />
      <form className="create-flow" onSubmit={handleGenerate}>
        <header className="create-header">
          <Link className="placeholder-brand" to="/">
            PageU
          </Link>
          <h1>告诉我你的经历</h1>
        </header>

        <section className="create-block" aria-labelledby="basic-info-title">
          <h2 id="basic-info-title">认识一下你</h2>
          <div className="create-grid basic-grid">
            <Field id="photo" label="照片">
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(event) => updateBasicInfo('photoName', event.target.files?.[0]?.name || '')}
              />
              {createDraft.basicInfo.photoName ? (
                <span className="field-note">{createDraft.basicInfo.photoName}</span>
              ) : null}
            </Field>
            <Field id="name" label="姓名">
              <input
                id="name"
                type="text"
                value={createDraft.basicInfo.name}
                onChange={(event) => updateBasicInfo('name', event.target.value)}
              />
            </Field>
            <Field id="contact" label="联系方式">
              <input
                id="contact"
                type="text"
                value={createDraft.basicInfo.contact}
                onChange={(event) => updateBasicInfo('contact', event.target.value)}
              />
            </Field>
            <Field id="school" label="学校">
              <input
                id="school"
                type="text"
                value={createDraft.basicInfo.school}
                onChange={(event) => updateBasicInfo('school', event.target.value)}
              />
            </Field>
            <Field id="major" label="专业">
              <input
                id="major"
                type="text"
                value={createDraft.basicInfo.major}
                onChange={(event) => updateBasicInfo('major', event.target.value)}
              />
            </Field>
          </div>
        </section>

        <section className="create-block" aria-labelledby="job-info-title">
          <h2 id="job-info-title">你想成为谁</h2>
          <Field id="job-jd" label="岗位 JD">
            <textarea
              id="job-jd"
              required
              rows={5}
              value={createDraft.jobInfo.jd}
              onChange={(event) => updateJobInfo('jd', event.target.value)}
            />
          </Field>
          <div className="create-grid two-grid">
            <Field id="target-company" label="目标公司">
              <input
                id="target-company"
                type="text"
                value={createDraft.jobInfo.company}
                onChange={(event) => updateJobInfo('company', event.target.value)}
              />
            </Field>
            <Field id="job-type" label="求职类型">
              <select
                id="job-type"
                value={createDraft.jobInfo.jobType}
                onChange={(event) => updateJobInfo('jobType', event.target.value)}
              >
                <option value="">暂不选择</option>
                <option value="internship">实习</option>
                <option value="campus">校招</option>
                <option value="project">项目合作</option>
              </select>
            </Field>
          </div>
          <button className="secondary-action" type="button">
            让我理解一下这个岗位
          </button>
        </section>

        <section className="create-block" aria-labelledby="experience-title">
          <div className="block-title-row">
            <h2 id="experience-title">告诉我你的经历</h2>
            <p>建议描述：背景、目标、行动、结果</p>
          </div>

          <div className="experience-list">
            {createDraft.experiences.map((experience, index) => {
              const number = index + 1;
              return (
                <fieldset className="experience-card" key={experience.id} aria-label={`经历${number}`}>
                  <legend>经历{number}</legend>
                  <div className="experience-actions">
                    <button
                      type="button"
                      aria-label={experience.collapsed ? `编辑经历${number}` : `折叠经历${number}`}
                      onClick={() => toggleExperience(experience.id)}
                    >
                      {experience.collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                    <button type="button" aria-label={`删除经历${number}`} onClick={() => deleteExperience(experience.id)}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                  {experience.collapsed ? (
                    <p className="experience-summary">{experience.title || '还没有填写标题'}</p>
                  ) : (
                    <div className="experience-fields">
                      <Field id={`experience-title-${experience.id}`} label={`经历标题 ${number}`}>
                        <input
                          id={`experience-title-${experience.id}`}
                          type="text"
                          value={experience.title}
                          onChange={(event) => updateExperience(experience.id, 'title', event.target.value)}
                        />
                      </Field>
                      <Field id={`experience-description-${experience.id}`} label={`经历描述 ${number}`}>
                        <textarea
                          id={`experience-description-${experience.id}`}
                          rows={5}
                          value={experience.description}
                          onChange={(event) => updateExperience(experience.id, 'description', event.target.value)}
                        />
                      </Field>
                    </div>
                  )}
                </fieldset>
              );
            })}
          </div>

          <button className="add-experience-action" type="button" onClick={addExperience}>
            <Plus size={18} />
            继续添加经历
          </button>
        </section>

        <section className="create-block" aria-labelledby="template-title">
          <h2 id="template-title">选择你喜欢的主页风格</h2>
          <div className="template-grid">
            {templates.map((template) => (
              <label className="template-card" key={template.id}>
                <input
                  aria-label={template.name}
                  checked={createDraft.template === template.id}
                  name="template"
                  onChange={() => selectTemplate(template.id)}
                  type="radio"
                  value={template.id}
                />
                <span>{template.name}</span>
                <small>{template.tone}</small>
              </label>
            ))}
          </div>
        </section>

        <div className="create-footer">
          <button className="generate-action" type="submit">
            生成我的个人网站
            <ArrowRight size={21} />
          </button>
        </div>
      </form>
      <XiaoU />
    </main>
  );
}

function AnalysisCard({ icon: Icon, title, children }) {
  return (
    <article className="analysis-card" aria-label={title}>
      <div className="analysis-card-title">
        <span className="analysis-icon">
          <Icon size={21} strokeWidth={2.4} aria-hidden="true" />
        </span>
        <h2>{title}</h2>
      </div>
      {children}
    </article>
  );
}

function AnalyzePage() {
  const navigate = useNavigate();
  const { createDraft } = useCreateDraft();
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [userAdjustment, setUserAdjustment] = useState('');
  const [analysisMessage, setAnalysisMessage] = useState('');

  const analysisResult = useMemo(
    () => createAnalysisResult(createDraft, userAdjustment),
    [createDraft, userAdjustment],
  );

  const handleReanalyze = () => {
    setAnalysisMessage('已根据你的补充重新整理理解');
  };

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
          <h1 id="analyze-title">这是我对你的理解</h1>
        </header>

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

        <div className="analyze-actions">
          <button className="generate-action" type="button" onClick={() => navigate('/editor')}>
            确认生成
            <ArrowRight size={21} aria-hidden="true" />
          </button>
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
            {analysisMessage ? <p className="analysis-message">{analysisMessage}</p> : null}
          </div>
        ) : null}
      </section>
      <XiaoU hint="我先帮你整理了一版。" />
    </main>
  );
}

const loadSiteDraft = (fallbackDraft) => {
  if (typeof window === 'undefined') {
    return fallbackDraft;
  }

  try {
    const storedDraft = window.localStorage.getItem(SITE_DRAFT_STORAGE_KEY);
    return normalizeSiteDraft(JSON.parse(storedDraft)) || fallbackDraft;
  } catch {
    return fallbackDraft;
  }
};

const loadPublishDraft = () => {
  if (typeof window === 'undefined') {
    return createPublishDraft();
  }

  try {
    return normalizePublishDraft(JSON.parse(window.localStorage.getItem(PUBLISH_STORAGE_KEY)));
  } catch {
    return createPublishDraft();
  }
};

const toSvgDataUrl = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

function EditorPage() {
  const navigate = useNavigate();
  const { createDraft } = useCreateDraft();
  const analysisResult = useMemo(() => createAnalysisResult(createDraft), [createDraft]);
  const generatedDraft = useMemo(() => generateSiteDraft(createDraft, analysisResult), [analysisResult, createDraft]);
  const [siteDraft, setSiteDraft] = useState(() => loadSiteDraft(generatedDraft));
  const [selectedSectionId, setSelectedSectionId] = useState('section-intro');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [saveStatus, setSaveStatus] = useState('已保存');

  useEffect(() => {
    setSaveStatus('正在保存');
    const timer = window.setTimeout(() => {
      const nextDraft = {
        ...siteDraft,
        meta: {
          ...siteDraft.meta,
          updatedAt: new Date().toISOString(),
        },
      };
      window.localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(nextDraft));
      setSaveStatus('已保存');
    }, 350);

    return () => window.clearTimeout(timer);
  }, [siteDraft]);

  const selectedSection = siteDraft.sections.find((section) => section.id === selectedSectionId) || siteDraft.sections[0];

  const updateProfile = (field, value) => {
    setSiteDraft((draft) => ({
      ...draft,
      profile: {
        ...draft.profile,
        [field]: value,
      },
    }));
  };

  const updateTheme = (field, value) => {
    setSiteDraft((draft) => ({
      ...draft,
      theme: {
        ...draft.theme,
        [field]: value,
      },
    }));
  };

  const updateSection = (sectionId, updater) => {
    setSiteDraft((draft) => ({
      ...draft,
      sections: draft.sections.map((section) => (section.id === sectionId ? updater(section) : section)),
    }));
  };

  const moveSection = (sectionId, direction) => {
    setSiteDraft((draft) => {
      const index = draft.sections.findIndex((section) => section.id === sectionId);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= draft.sections.length) {
        return draft;
      }

      const nextSections = [...draft.sections];
      const [section] = nextSections.splice(index, 1);
      nextSections.splice(nextIndex, 0, section);

      return {
        ...draft,
        sections: nextSections,
      };
    });
  };

  const handleRegenerate = () => {
    setSiteDraft(generatedDraft);
    setSelectedSectionId('section-intro');
  };

  return (
    <main className="editor-page">
      <DynamicBackground />
      <section className="editor-shell" aria-labelledby="editor-title">
        <header className="editor-header">
          <Link className="placeholder-brand" to="/">
            PageU
          </Link>
          <div className="editor-top-actions">
            <Link className="return-action" to="/analyze">
              返回分析
            </Link>
            <button className="adjust-action" type="button" onClick={handleRegenerate}>
              重新生成
            </button>
            <button className="generate-action compact-generate" type="button" onClick={() => navigate('/publish')}>
              发布网站
            </button>
          </div>
          <h1 id="editor-title">再调整一下，让它更像你</h1>
          <p className="save-status" aria-live="polite">
            {saveStatus}
          </p>
        </header>

        <div className="editor-grid">
          <aside className="editor-panel module-panel" aria-label="模块区">
            <h2>模块区</h2>
            <div className="module-list">
              {siteDraft.sections.map((section, index) => (
                <div className={`module-item ${section.id === selectedSectionId ? 'active' : ''}`} key={section.id}>
                  <button className="module-select" type="button" onClick={() => setSelectedSectionId(section.id)}>
                    选择{section.title}
                  </button>
                  <div className="module-controls">
                    <button type="button" aria-label={`上移${section.title}`} onClick={() => moveSection(section.id, -1)} disabled={index === 0}>
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`下移${section.title}`}
                      onClick={() => moveSection(section.id, 1)}
                      disabled={index === siteDraft.sections.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      aria-label={section.visible ? `隐藏${section.title}` : `显示${section.title}`}
                      onClick={() => updateSection(section.id, (item) => ({ ...item, visible: !item.visible }))}
                    >
                      {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      type="button"
                      aria-label={section.collapsed ? `展开${section.title}` : `折叠${section.title}`}
                      onClick={() => updateSection(section.id, (item) => ({ ...item, collapsed: !item.collapsed }))}
                    >
                      {section.collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="editor-preview-wrap" aria-label="实时预览">
            <div className="preview-toolbar">
              <span>{siteDraft.template}</span>
              <div className="preview-mode-switch" aria-label="预览模式">
                <button
                  type="button"
                  className={previewMode === 'desktop' ? 'active' : ''}
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor size={17} />
                  电脑
                </button>
                <button
                  type="button"
                  className={previewMode === 'mobile' ? 'active' : ''}
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone size={17} />
                  手机
                </button>
              </div>
            </div>

            <div
              className={`site-preview ${previewMode === 'mobile' ? 'mobile-preview' : ''}`}
              style={{
                '--site-primary': siteDraft.theme.primaryColor,
                '--site-bg': siteDraft.theme.background,
                '--site-text': siteDraft.theme.textColor,
              }}
            >
              <button
                className={`preview-hero ${selectedSectionId === 'section-intro' ? 'selected' : ''}`}
                type="button"
                onClick={() => setSelectedSectionId('section-intro')}
              >
                <div className="preview-avatar" aria-hidden="true">
                  {siteDraft.profile.name.slice(0, 1) || 'U'}
                </div>
                <div>
                  <p>{siteDraft.profile.targetRole}</p>
                  <h2>{siteDraft.profile.name}</h2>
                  <strong>{siteDraft.profile.headline}</strong>
                  <span>{siteDraft.profile.intro}</span>
                </div>
              </button>

              {siteDraft.sections
                .filter((section) => section.visible && !section.collapsed && section.type !== 'intro' && section.type !== 'avatar')
                .map((section) => (
                  <button
                    className={`preview-section ${selectedSectionId === section.id ? 'selected' : ''}`}
                    key={section.id}
                    type="button"
                    onClick={() => setSelectedSectionId(section.id)}
                  >
                    <h3>{section.title}</h3>
                    {section.type === 'skills' ? (
                      <div className="preview-skills">
                        {section.items.map((item) => (
                          <span key={item.id}>{item.title}</span>
                        ))}
                      </div>
                    ) : section.items.length > 0 ? (
                      <div className="preview-items">
                        {section.items.map((item) => (
                          <article key={item.id}>
                            <h4>{item.title}</h4>
                            {item.description ? <p>{item.description}</p> : null}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p>{section.content}</p>
                    )}
                  </button>
                ))}
            </div>
          </section>

          <aside className="editor-panel edit-panel" aria-label="编辑区">
            <h2>编辑区</h2>
            <Field id="editor-title-input" label="标题">
              <input
                id="editor-title-input"
                type="text"
                value={siteDraft.profile.headline}
                onChange={(event) => updateProfile('headline', event.target.value)}
              />
            </Field>
            <Field id="editor-text-input" label="文字">
              <textarea
                id="editor-text-input"
                rows={5}
                value={selectedSection?.content || siteDraft.profile.intro}
                onChange={(event) => {
                  if (selectedSection) {
                    updateSection(selectedSection.id, (section) => ({ ...section, content: event.target.value }));
                  }
                  updateProfile('intro', event.target.value);
                }}
              />
            </Field>
            <Field id="editor-color-input" label="颜色">
              <input
                id="editor-color-input"
                type="color"
                value={siteDraft.theme.primaryColor}
                onChange={(event) => updateTheme('primaryColor', event.target.value)}
              />
            </Field>
            <Field id="editor-background-input" label="背景">
              <input
                id="editor-background-input"
                type="color"
                value={siteDraft.theme.background}
                onChange={(event) => updateTheme('background', event.target.value)}
              />
            </Field>
            <label className="module-visible-toggle">
              <input
                checked={selectedSection?.visible ?? true}
                onChange={(event) =>
                  selectedSection ? updateSection(selectedSection.id, (section) => ({ ...section, visible: event.target.checked })) : null
                }
                type="checkbox"
              />
              模块显示
            </label>
            <div className="edit-selected-note">
              <Palette size={18} />
              当前编辑：{selectedSection ? sectionLabels[selectedSection.type] : '个人介绍'}
            </div>
          </aside>
        </div>
      </section>
      <XiaoU hint="已经很不错了，再调整一下吧" />
    </main>
  );
}

function PublishPage() {
  const navigate = useNavigate();
  const { createDraft } = useCreateDraft();
  const analysisResult = useMemo(() => createAnalysisResult(createDraft), [createDraft]);
  const generatedDraft = useMemo(() => generateSiteDraft(createDraft, analysisResult), [analysisResult, createDraft]);
  const siteDraft = useMemo(() => loadSiteDraft(generatedDraft), [generatedDraft]);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [publishDraft, setPublishDraft] = useState(() => loadPublishDraft());
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const siteUrl = PUBLIC_SITE_PATH;

  useEffect(() => {
    window.localStorage.setItem(
      PUBLISH_STORAGE_KEY,
      JSON.stringify({
        ...publishDraft,
        published: true,
        siteId: 'demo',
      }),
    );
  }, [publishDraft]);

  useEffect(() => {
    let active = true;
    const absoluteUrl = `${window.location.origin}${PUBLIC_SITE_PATH}`;

    QRCode.toString(absoluteUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      type: 'svg',
      width: 220,
      color: {
        dark: '#12384c',
        light: '#f7feff',
      },
    }).then((svg) => {
      if (active) {
        setQrCodeUrl(toSvgDataUrl(svg));
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const handleVisibilityChange = (visibility) => {
    setPublishDraft((draft) =>
      createPublishDraft({
        ...draft,
        visibility,
        publishedAt: new Date().toISOString(),
      }),
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(siteUrl);
      setCopyMessage('链接已复制');
    } catch {
      setCopyMessage('链接已准备好');
    }
  };

  const handleVisit = () => {
    window.localStorage.setItem(
      PUBLISH_STORAGE_KEY,
      JSON.stringify(
        createPublishDraft({
          ...publishDraft,
          siteId: 'demo',
          published: true,
          publishedAt: new Date().toISOString(),
        }),
      ),
    );
    navigate(PUBLIC_SITE_PATH);
  };

  return (
    <main className="publish-page">
      <DynamicBackground />
      <section className="publish-shell" aria-labelledby="publish-title">
        <header className="publish-header">
          <Link className="placeholder-brand" to="/">
            PageU
          </Link>
          <h1 id="publish-title">你的个人网站准备好了</h1>
        </header>

        <section className="publish-card publish-preview-card" aria-label="网站预览">
          <div className="publish-card-title">
            <div>
              <span>区域1</span>
              <h2>网站预览</h2>
            </div>
            <div className="preview-mode-switch" aria-label="发布预览模式">
              <button
                type="button"
                className={previewMode === 'desktop' ? 'active' : ''}
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor size={17} aria-hidden="true" />
                电脑
              </button>
              <button
                type="button"
                className={previewMode === 'mobile' ? 'active' : ''}
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone size={17} aria-hidden="true" />
                手机
              </button>
            </div>
          </div>
          <div className="publish-preview-frame">
            <TemplateRenderer siteDraft={siteDraft} previewMode={previewMode} className="publish-render-preview" />
          </div>
        </section>

        <div className="publish-grid">
          <section className="publish-card" aria-label="网站地址">
            <div className="publish-card-title">
              <span className="publish-icon">
                <Globe2 size={20} aria-hidden="true" />
              </span>
              <div>
                <span>区域2</span>
                <h2>网站地址</h2>
              </div>
            </div>
            <Link className="site-link-box" to={siteUrl}>
              {siteUrl}
            </Link>
            <button className="secondary-action publish-copy-action" type="button" onClick={handleCopy}>
              <Copy size={17} aria-hidden="true" />
              复制
            </button>
            {copyMessage ? <p className="publish-message">{copyMessage}</p> : null}
          </section>

          <section className="publish-card" aria-label="二维码">
            <div className="publish-card-title">
              <span className="publish-icon">
                <QrCode size={20} aria-hidden="true" />
              </span>
              <div>
                <span>区域3</span>
                <h2>二维码</h2>
              </div>
            </div>
            <div className="qr-box">
              {qrCodeUrl ? <img alt="当前网站二维码" src={qrCodeUrl} /> : <span>生成中</span>}
            </div>
            <a className="secondary-action qr-download-action" href={qrCodeUrl || '#'} download="pageu-site-qr.svg">
              <Download size={17} aria-hidden="true" />
              下载二维码
            </a>
          </section>

          <section className="publish-card" aria-label="访问权限">
            <div className="publish-card-title">
              <span className="publish-icon">
                <LockKeyhole size={20} aria-hidden="true" />
              </span>
              <div>
                <span>区域4</span>
                <h2>访问权限</h2>
              </div>
            </div>
            <div className="visibility-options">
              {[
                ['public', '公开'],
                ['private', '私密'],
                ['password', '密码访问'],
              ].map(([value, label]) => (
                <label key={value}>
                  <input
                    checked={publishDraft.visibility === value}
                    name="visibility"
                    onChange={() => handleVisibilityChange(value)}
                    type="radio"
                    value={value}
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="publish-actions">
          <button className="generate-action" type="button" onClick={handleVisit}>
            <ExternalLink size={20} aria-hidden="true" />
            访问网站
          </button>
          <button className="adjust-action" type="button" onClick={handleCopy}>
            <Copy size={17} aria-hidden="true" />
            复制链接
          </button>
          <a className="adjust-action qr-action-link" href={qrCodeUrl || '#'} download="pageu-site-qr.svg">
            <Download size={17} aria-hidden="true" />
            下载二维码
          </a>
          <Link className="return-action" to="/editor">
            继续编辑
          </Link>
        </div>
      </section>
      <XiaoU hint="希望它能帮更多人认识你" />
    </main>
  );
}

function SitePage() {
  const { id } = useParams();
  const { createDraft } = useCreateDraft();
  const analysisResult = useMemo(() => createAnalysisResult(createDraft), [createDraft]);
  const generatedDraft = useMemo(() => generateSiteDraft(createDraft, analysisResult), [analysisResult, createDraft]);
  const siteDraft = useMemo(() => loadSiteDraft(generatedDraft), [generatedDraft]);

  return (
    <TemplateRenderer
      as="main"
      className="generated-site-page"
      previewMode="desktop"
      siteDraft={{
        ...siteDraft,
        meta: {
          ...siteDraft.meta,
          siteId: id || 'demo',
        },
      }}
    />
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
    <CreateDraftProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/site/:id" element={<SitePage />} />
      </Routes>
    </CreateDraftProvider>
  );
}
