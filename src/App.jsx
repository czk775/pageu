import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronUp, Plus, Sparkles, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { templates } from './data/templates';
import { CreateDraftProvider, useCreateDraft } from './state/CreateDraftContext';

const placeholders = {
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
        <Route path="/analyze" element={<PlaceholderPage {...placeholders.analyze} />} />
        <Route path="/editor" element={<PlaceholderPage {...placeholders.editor} />} />
        <Route path="/publish" element={<PlaceholderPage {...placeholders.publish} />} />
        <Route path="/site/:id" element={<PlaceholderPage {...placeholders.site} />} />
      </Routes>
    </CreateDraftProvider>
  );
}
