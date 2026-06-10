import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { DynamicBackground } from '../components/DynamicBackground';
import { FloatingAssistant } from '../components/FloatingAssistant';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { TemplateCard } from '../components/TemplateCard';
import { templates } from '../data/templates';
import { useCreateDraft } from '../state/CreateDraftContext';

export function CreatePage() {
  const navigate = useNavigate();
  const {
    createDraft,
    updateBasicInfo,
    updateJobInfo,
    updateSkillsInfo,
    updateWorksInfo,
    updateStylePreference,
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
      <form aria-label="创建个人网站信息" autoComplete="off" className="create-flow" onSubmit={handleGenerate}>
        <header className="create-header">
          <Link className="placeholder-brand" to="/">
            PageU
          </Link>
          <h1>告诉我你的经历</h1>
        </header>

        <section className="create-block" aria-labelledby="basic-info-title">
          <h2 id="basic-info-title">个人基本信息</h2>
          <div className="create-grid basic-grid">
            <FormField id="photo" label="照片">
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(event) => updateBasicInfo('photoName', event.target.files?.[0]?.name || '')}
              />
              {createDraft.basicInfo.photoName ? <span className="field-note">{createDraft.basicInfo.photoName}</span> : null}
            </FormField>
            <FormField id="name" label="姓名">
              <input
                id="name"
                autoComplete="off"
                type="text"
                value={createDraft.basicInfo.name}
                onChange={(event) => updateBasicInfo('name', event.target.value)}
              />
            </FormField>
            <FormField id="contact" label="联系方式">
              <input
                id="contact"
                autoComplete="off"
                type="text"
                value={createDraft.basicInfo.contact}
                onChange={(event) => updateBasicInfo('contact', event.target.value)}
              />
            </FormField>
            <FormField id="school" label="学校">
              <input
                id="school"
                autoComplete="off"
                type="text"
                value={createDraft.basicInfo.school}
                onChange={(event) => updateBasicInfo('school', event.target.value)}
              />
            </FormField>
            <FormField id="major" label="专业">
              <input
                id="major"
                autoComplete="off"
                type="text"
                value={createDraft.basicInfo.major}
                onChange={(event) => updateBasicInfo('major', event.target.value)}
              />
            </FormField>
            <FormField id="personal-tagline" label="个人标签 / 一句话定位">
              <input
                id="personal-tagline"
                autoComplete="off"
                placeholder="例如：AI产品｜市场营销｜喜欢把想法做成产品"
                type="text"
                value={createDraft.basicInfo.personalTagline}
                onChange={(event) => updateBasicInfo('personalTagline', event.target.value)}
              />
            </FormField>
          </div>
        </section>

        <section className="create-block" aria-labelledby="job-info-title">
          <h2 id="job-info-title">岗位信息</h2>
          <FormField id="job-jd" label="岗位 JD">
            <textarea
              id="job-jd"
              autoComplete="off"
              required
              rows={5}
              value={createDraft.jobInfo.jd}
              onChange={(event) => updateJobInfo('jd', event.target.value)}
            />
          </FormField>
          <div className="create-grid two-grid">
            <FormField id="target-company" label="目标公司">
              <input
                id="target-company"
                autoComplete="off"
                type="text"
                value={createDraft.jobInfo.company}
                onChange={(event) => updateJobInfo('company', event.target.value)}
              />
            </FormField>
            <FormField id="job-type" label="求职类型">
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
            </FormField>
          </div>
          <FormField id="job-motivation" label="为什么想做这个岗位">
            <textarea
              id="job-motivation"
              autoComplete="off"
              placeholder="例如：希望把技术理解转化为真实产品价值，做连接用户与AI能力的人。"
              rows={4}
              value={createDraft.jobInfo.motivation}
              onChange={(event) => updateJobInfo('motivation', event.target.value)}
            />
          </FormField>
        </section>

        <section className="create-block" aria-labelledby="experience-title">
          <div className="block-title-row">
            <h2 id="experience-title">经历信息</h2>
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
                      <FormField id={`experience-title-${experience.id}`} label={`经历标题 ${number}`}>
                        <input
                          id={`experience-title-${experience.id}`}
                          autoComplete="off"
                          type="text"
                          value={experience.title}
                          onChange={(event) => updateExperience(experience.id, 'title', event.target.value)}
                        />
                      </FormField>
                      <div className="create-grid two-grid">
                        <FormField id={`experience-role-${experience.id}`} label={`我的角色 ${number}`}>
                          <input
                            id={`experience-role-${experience.id}`}
                            autoComplete="off"
                            type="text"
                            value={experience.role}
                            onChange={(event) => updateExperience(experience.id, 'role', event.target.value)}
                          />
                        </FormField>
                        <FormField id={`experience-period-${experience.id}`} label={`时间 / 阶段 ${number}`}>
                          <input
                            id={`experience-period-${experience.id}`}
                            autoComplete="off"
                            type="text"
                            value={experience.period}
                            onChange={(event) => updateExperience(experience.id, 'period', event.target.value)}
                          />
                        </FormField>
                      </div>
                      <FormField id={`experience-description-${experience.id}`} label={`经历描述 ${number}`}>
                        <textarea
                          id={`experience-description-${experience.id}`}
                          autoComplete="off"
                          rows={5}
                          value={experience.description}
                          onChange={(event) => updateExperience(experience.id, 'description', event.target.value)}
                        />
                      </FormField>
                      <FormField id={`experience-link-${experience.id}`} label={`项目/作品链接 ${number}`}>
                        <input
                          id={`experience-link-${experience.id}`}
                          autoComplete="off"
                          placeholder="https://github.com/xxx 或 https://demo.xxx.com"
                          type="url"
                          value={experience.link}
                          onChange={(event) => updateExperience(experience.id, 'link', event.target.value)}
                        />
                      </FormField>
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

        <section className="create-block" aria-labelledby="skills-title">
          <h2 id="skills-title">技能证书</h2>
          <div className="create-grid two-grid">
            <FormField id="skill-keywords" label="技能关键词">
              <textarea
                id="skill-keywords"
                autoComplete="off"
                placeholder="React、Python、SQL、Axure、用户研究、产品设计"
                rows={4}
                value={createDraft.skillsInfo.keywords}
                onChange={(event) => updateSkillsInfo('keywords', event.target.value)}
              />
            </FormField>
            <FormField id="skill-certificates" label="证书/奖项">
              <textarea
                id="skill-certificates"
                autoComplete="off"
                placeholder="英语六级、奖学金、竞赛奖项、优秀学生干部"
                rows={4}
                value={createDraft.skillsInfo.certificates}
                onChange={(event) => updateSkillsInfo('certificates', event.target.value)}
              />
            </FormField>
          </div>
        </section>

        <section className="create-block" aria-labelledby="works-title">
          <h2 id="works-title">作品 / 项目链接</h2>
          <FormField id="works-raw-links" label="作品 / 项目链接">
            <textarea
              id="works-raw-links"
              autoComplete="off"
              placeholder={'PageU Demo | https://example.com | AI个人网站生成器\nGitHub | https://github.com/xxx | 代码作品集\n毕业设计演示 | https://example.com | 校园社团管理系统演示'}
              rows={5}
              value={createDraft.worksInfo.rawLinks}
              onChange={(event) => updateWorksInfo('rawLinks', event.target.value)}
            />
          </FormField>
        </section>

        <section className="create-block" aria-labelledby="style-preference-title">
          <h2 id="style-preference-title">你希望网站给人的感觉</h2>
          <div className="style-preference-options">
            {['专业可信', '科技未来', '创意表达', '温暖亲和', '极简高级'].map((preference) => (
              <label key={preference} className={createDraft.stylePreference === preference ? 'active' : ''}>
                <input
                  checked={createDraft.stylePreference === preference}
                  name="stylePreference"
                  onChange={() => updateStylePreference(preference)}
                  type="radio"
                  value={preference}
                />
                {preference}
              </label>
            ))}
          </div>
        </section>

        <section className="create-block" aria-labelledby="template-title">
          <h2 id="template-title">选择你喜欢的主页风格</h2>
          <div className="template-grid">
            {templates.map((template) => (
              <TemplateCard
                checked={createDraft.template === template.id}
                key={template.id}
                onChange={() => selectTemplate(template.id)}
                template={template}
              />
            ))}
          </div>
        </section>

        <div className="create-footer">
          <PrimaryButton icon={ArrowRight} type="submit">
            生成我的个人网站
          </PrimaryButton>
        </div>
      </form>
      <FloatingAssistant />
    </main>
  );
}
