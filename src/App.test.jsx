import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { generateSiteDraft } from './lib/draftGenerator';
import { TemplateRenderer } from './renderers/TemplateRenderer';
import { analyzeCareerDraft, normalizeAnalysisPayload } from './services/ai/aiClient';
import { answerAssistantQuestion } from './services/ai/assistantChat';
import { createAnalysisResult } from './types/analysisResult';
import { createInitialDraft, DRAFT_STORAGE_KEY, normalizeDraft } from './types/createDraft';
import { PUBLISH_STORAGE_KEY } from './types/publishDraft';
import { SITE_DRAFT_STORAGE_KEY } from './types/siteDraft';

describe('siteDraft generation', () => {
  it('normalizes Phase 8 createDraft portfolio fields for old and new drafts', () => {
    const normalized = normalizeDraft({
      basicInfo: { name: '陈一诺', personalTagline: 'AI产品｜用户研究｜把想法做成产品' },
      jobInfo: { jd: '产品经理实习生', motivation: '希望连接用户问题与 AI 能力。' },
      experiences: [{ id: 'legacy', title: 'PageU 项目', description: '做了创建流程。' }],
      worksInfo: { rawLinks: 'PageU Demo | https://example.com | AI个人网站生成器' },
      stylePreference: '科技未来',
    });

    expect(normalized.basicInfo.personalTagline).toBe('AI产品｜用户研究｜把想法做成产品');
    expect(normalized.jobInfo.motivation).toBe('希望连接用户问题与 AI 能力。');
    expect(normalized.experiences[0]).toMatchObject({
      role: '',
      period: '',
      link: '',
    });
    expect(normalized.worksInfo.rawLinks).toContain('PageU Demo');
    expect(normalized.stylePreference).toBe('科技未来');
  });

  it('derives a siteDraft from createDraft and analysisResult', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = '林小雨';
    createDraft.basicInfo.major = '数字媒体技术';
    createDraft.jobInfo.jd = '前端实习生，负责 React 页面开发和用户体验优化。';
    createDraft.experiences = [
      {
        id: 'experience-campus',
        title: '校园招聘小程序',
        description: '负责前端页面和报名流程。',
        collapsed: false,
      },
    ];
    createDraft.template = 'flow';

    const analysisResult = createAnalysisResult(createDraft);
    const siteDraft = generateSiteDraft(createDraft, analysisResult);

    expect(siteDraft.template).toBe('flow');
    expect(siteDraft.profile.name).toBe('林小雨');
    expect(siteDraft.profile.targetRole).toBe('前端实习生');
    expect(siteDraft.sections.map((section) => section.type)).toEqual([
      'avatar',
      'intro',
      'experience',
      'project',
      'skills',
      'works',
      'contact',
    ]);
    expect(siteDraft.sections.find((section) => section.type === 'experience').items[0].title).toBe('校园招聘小程序');
  });

  it('generates portfolio website data with hero, projects and works', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = '陈一诺';
    createDraft.basicInfo.school = '南山大学';
    createDraft.basicInfo.major = '数字媒体技术';
    createDraft.basicInfo.personalTagline = 'AI产品｜用户研究｜把想法做成产品';
    createDraft.jobInfo.jd = '用户体验设计实习生，负责用户研究和原型设计。';
    createDraft.jobInfo.motivation = '希望把用户问题转化为可以落地的 AI 产品体验。';
    createDraft.experiences = [
      {
        id: 'experience-ai',
        title: 'AI 简历优化项目',
        role: '产品设计负责人',
        period: '2025.09 - 2025.12',
        description: '调研同学求职痛点，设计简历分析和建议生成流程，完成可演示原型。',
        link: 'https://example.com/demo',
        collapsed: false,
      },
    ];
    createDraft.skillsInfo.keywords = 'React、Python、用户研究、Axure';
    createDraft.skillsInfo.certificates = '英语六级、校级奖学金';
    createDraft.worksInfo.rawLinks = 'PageU Demo | https://pageu.example.com | AI个人网站生成器';
    createDraft.stylePreference = '科技未来';

    const siteDraft = generateSiteDraft(createDraft, createAnalysisResult(createDraft));

    expect(siteDraft.profile.personalTagline).toBe('AI产品｜用户研究｜把想法做成产品');
    expect(siteDraft.hero).toMatchObject({
      title: '陈一诺',
      primaryCta: '查看项目',
      secondaryCta: '联系我',
    });
    expect(siteDraft.hero.subtitle).toBe('AI产品｜用户研究｜把想法做成产品');
    expect(siteDraft.highlights).toHaveLength(3);
    expect(siteDraft.projects[0]).toMatchObject({
      title: 'AI 简历优化项目',
      role: '产品设计负责人',
      period: '2025.09 - 2025.12',
      link: 'https://example.com/demo',
    });
    expect(siteDraft.projects[0].summary).not.toBe(createDraft.experiences[0].description);
    expect(siteDraft.projects[0].tags.length).toBeGreaterThanOrEqual(3);
    expect(siteDraft.works).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'PageU Demo',
          url: 'https://pageu.example.com',
        }),
        expect.objectContaining({
          title: 'AI 简历优化项目',
          url: 'https://example.com/demo',
        }),
      ]),
    );
    expect(siteDraft.skills).toEqual(expect.arrayContaining(['React', 'Python', '用户研究', 'Axure']));
    expect(siteDraft.certificates).toEqual(expect.arrayContaining(['英语六级', '校级奖学金']));
  });

  it('renders works links and distinct template structures in TemplateRenderer', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = '陈一诺';
    createDraft.jobInfo.jd = '产品经理实习生';
    createDraft.worksInfo.rawLinks = '作品链接 | https://example.com | 项目说明';
    const siteDraft = generateSiteDraft(createDraft);

    render(<TemplateRenderer siteDraft={siteDraft} />);
    expect(screen.getByRole('link', { name: '查看作品' })).toHaveAttribute('href', 'https://example.com');

    const templateClasses = ['neo', 'pure', 'flow', 'grid', 'canvas', 'glass'].map((template) => {
      const { container, unmount } = render(<TemplateRenderer siteDraft={{ ...siteDraft, template }} />);
      const className = container.firstChild.className;
      unmount();
      return className;
    });

    expect(new Set(templateClasses).size).toBe(6);
    expect(templateClasses).toEqual(expect.arrayContaining([expect.stringMatching(/template-neo-site/)]));
    expect(templateClasses).toEqual(expect.arrayContaining([expect.stringMatching(/template-canvas-site/)]));
  });

  it('renders TemplateRenderer in separate site and preview modes', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = 'Portfolio User';
    createDraft.template = 'neo';
    const siteDraft = generateSiteDraft(createDraft);

    const { container, rerender } = render(<TemplateRenderer as="main" mode="site" siteDraft={siteDraft} />);
    expect(container.firstChild).toHaveClass('portfolio-site-mode');
    expect(container.querySelector('.portfolio-shell')).toBeInTheDocument();
    expect(container.querySelector('.portfolio-preview-scale')).not.toBeInTheDocument();

    rerender(<TemplateRenderer mode="preview" previewMode="mobile" siteDraft={siteDraft} />);
    expect(container.firstChild).toHaveClass('portfolio-preview-mode');
    expect(container.querySelector('.portfolio-preview-scale')).toBeInTheDocument();
  });

  it('renders portfolio hero navigation and CTA links', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = 'Portfolio User';
    createDraft.jobInfo.jd = 'Product Designer Intern';
    const siteDraft = generateSiteDraft(createDraft);

    render(<TemplateRenderer as="main" mode="site" siteDraft={siteDraft} />);

    expect(screen.getByRole('navigation', { name: 'Portfolio navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '#about');
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '#featured-projects');
    expect(screen.getByRole('link', { name: '查看项目' })).toHaveAttribute('href', '#featured-projects');
    expect(screen.getByRole('link', { name: '联系我' })).toHaveAttribute('href', '#contact');
  });

  it('renders ProjectCard as portfolio case content instead of narrow Problem Action Result columns', () => {
    const createDraft = createInitialDraft();
    createDraft.experiences = [
      {
        id: 'experience-case',
        title: 'Campus AI Portfolio',
        role: 'Product Designer',
        period: '2026',
        description: '访谈同学并整理求职痛点。设计输入流程和作品集展示结构。完成可演示原型。',
        link: 'https://example.com/case',
        collapsed: false,
      },
    ];
    const siteDraft = generateSiteDraft(createDraft);

    const { container } = render(<TemplateRenderer mode="site" siteDraft={siteDraft} />);

    expect(screen.getByText('我做了什么')).toBeInTheDocument();
    expect(screen.getByText('产出与价值')).toBeInTheDocument();
    expect(screen.getByText('岗位关联')).toBeInTheDocument();
    expect(container.querySelector('.portfolio-project-points')).not.toBeInTheDocument();
    expect(screen.queryByText('Problem')).not.toBeInTheDocument();
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Result')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '查看项目' }).some((link) => link.getAttribute('href') === 'https://example.com/case')).toBe(true);
  });
});

describe('AI analysis service', () => {
  it('falls back to mock and returns the standard analysis structure in tests', async () => {
    const createDraft = createInitialDraft();
    createDraft.jobInfo.jd = '产品经理实习生，负责需求分析和用户沟通。';

    const analysisResult = await analyzeCareerDraft(createDraft, '');

    expect(analysisResult.jobKeywords.length).toBeGreaterThan(0);
    expect(analysisResult.abilityFocus.length).toBeGreaterThan(0);
    expect(analysisResult.displayOrder.length).toBeGreaterThan(0);
    expect(analysisResult.highlightedExperiences.length).toBeGreaterThan(0);
    expect(analysisResult.meta).toMatchObject({
      provider: 'mock',
      fallback: true,
      error: null,
    });
  });

  it('normalizes short AI arrays by backfilling mock values', () => {
    const createDraft = createInitialDraft();
    const fallbackResult = createAnalysisResult(createDraft);
    const normalized = normalizeAnalysisPayload(
      {
        jobKeywords: ['AI'],
        abilityFocus: ['表达能力'],
        displayOrder: ['项目经历'],
        highlightedExperiences: ['校园项目经历'],
      },
      fallbackResult,
      {
        provider: 'qwen',
        fallback: false,
        error: null,
        updatedAt: '2026-06-10T00:00:00.000Z',
      },
    );

    expect(normalized.jobKeywords.length).toBeGreaterThanOrEqual(3);
    expect(normalized.abilityFocus.length).toBeGreaterThanOrEqual(3);
    expect(normalized.displayOrder.length).toBeGreaterThanOrEqual(3);
    expect(normalized.highlightedExperiences.length).toBeGreaterThanOrEqual(3);
    expect(normalized.jobKeywords.length).toBeLessThanOrEqual(6);
  });

  it('answers Xiaou questions through the AI assistant service with mock fallback in tests', async () => {
    const createDraft = createInitialDraft();
    createDraft.jobInfo.jd = '产品经理实习生，负责需求分析和用户沟通。';

    const result = await answerAssistantQuestion({
      question: '模板怎么选',
      pathname: '/create',
      createDraft,
    });

    expect(result.answer).toContain('模板只影响视觉风格');
    expect(result.meta).toMatchObject({
      provider: 'mock',
      fallback: true,
      error: null,
    });
  });
});

describe('PageU app shell', () => {
  it('renders the landing page with the required core content', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText('PageU')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '生成你的个人网站' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '立即创建' })).toHaveAttribute('href', '/create');
    expect(screen.getByText('小U:')).toBeInTheDocument();
    expect(screen.getByText('准备好开始了吗')).toBeInTheDocument();
  });

  it('navigates to the create flow from the landing CTA', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: '立即创建' }));

    expect(screen.getByRole('heading', { level: 1, name: '告诉我你的经历' })).toBeInTheDocument();
    expect(screen.getByText('个人基本信息')).toBeInTheDocument();
  });

  it('renders the full create flow input surface', () => {
    render(
      <MemoryRouter initialEntries={['/create']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '告诉我你的经历' })).toBeInTheDocument();
    expect(screen.getByRole('form', { name: '创建个人网站信息' })).toHaveAttribute('autocomplete', 'off');
    expect(screen.getByRole('heading', { level: 2, name: '个人基本信息' })).toBeInTheDocument();
    expect(screen.getByLabelText('照片')).toBeInTheDocument();
    expect(screen.getByLabelText('姓名')).toBeInTheDocument();
    expect(screen.getByLabelText('姓名')).toHaveAttribute('autocomplete', 'off');
    expect(screen.getByLabelText('联系方式')).toBeInTheDocument();
    expect(screen.getByLabelText('学校')).toBeInTheDocument();
    expect(screen.getByLabelText('学校')).toHaveAttribute('autocomplete', 'off');
    expect(screen.getByLabelText('专业')).toBeInTheDocument();
    expect(screen.getByLabelText('个人标签 / 一句话定位')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '岗位信息' })).toBeInTheDocument();
    expect(screen.getByLabelText('岗位 JD')).toBeRequired();
    expect(screen.getByLabelText('目标公司')).toBeInTheDocument();
    expect(screen.getByLabelText('求职类型')).toBeInTheDocument();
    expect(screen.getByLabelText('为什么想做这个岗位')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '让我理解一下这个岗位' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '经历信息' })).toBeInTheDocument();
    expect(screen.getByText('建议描述：背景、目标、行动、结果')).toBeInTheDocument();
    expect(screen.getByLabelText('我的角色 1')).toBeInTheDocument();
    expect(screen.getByLabelText('时间 / 阶段 1')).toBeInTheDocument();
    expect(screen.getByLabelText('项目/作品链接 1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '技能证书' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('React、Python、SQL、Axure、用户研究、产品设计')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('英语六级、奖学金、竞赛奖项、优秀学生干部')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '作品 / 项目链接' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '作品 / 项目链接' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '你希望网站给人的感觉' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '科技未来' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '生成我的个人网站' })).toBeInTheDocument();

    for (const template of ['Neo', 'Pure', 'Flow', 'Grid', 'Canvas', 'Glass']) {
      expect(screen.getByRole('radio', { name: template })).toBeInTheDocument();
    }
  });

  it('adds, edits, collapses, deletes experiences and selects a template', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/create']}>
        <App />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText('经历标题 1'), '校园招聘小程序');
    await user.type(screen.getByLabelText('经历描述 1'), '负责前端页面和报名流程。');
    await user.click(screen.getByRole('button', { name: '继续添加经历' }));

    const secondCard = screen.getByRole('group', { name: '经历2' });
    expect(within(secondCard).getByLabelText('经历标题 2')).toBeInTheDocument();

    await user.click(within(secondCard).getByRole('button', { name: '折叠经历2' }));
    expect(within(secondCard).queryByLabelText('经历标题 2')).not.toBeInTheDocument();
    await user.click(within(secondCard).getByRole('button', { name: '编辑经历2' }));
    await user.click(within(secondCard).getByRole('button', { name: '删除经历2' }));

    expect(screen.queryByRole('group', { name: '经历2' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Glass' }));
    expect(screen.getByRole('radio', { name: 'Glass' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Neo' })).not.toBeChecked();
  });

  it('keeps createDraft values after navigation and routes generation to analyze', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/create']}>
        <App />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText('姓名'), '林小雨');
    await user.type(screen.getByLabelText('岗位 JD'), '前端实习生，负责 React 页面开发。');
    await user.click(screen.getByRole('radio', { name: 'Flow' }));

    await user.click(screen.getByRole('button', { name: '生成我的个人网站' }));
    expect(await screen.findByRole('heading', { level: 1, name: '分析结果' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'PageU' }));
    await user.click(screen.getByRole('link', { name: '立即创建' }));

    expect(screen.getByLabelText('姓名')).toHaveValue('林小雨');
    expect(screen.getByLabelText('岗位 JD')).toHaveValue('前端实习生，负责 React 页面开发。');
    expect(screen.getByRole('radio', { name: 'Flow' })).toBeChecked();
  });

  it('opens, answers and closes the Xiaou assistant chat', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/create']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText('有什么问题可以问我哦')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '打开小U咨询助手' }));
    expect(screen.getByRole('dialog', { name: '小U咨询助手' })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('问问小U，比如：怎么填写经历'), '怎么填写经历');
    await user.click(screen.getByRole('button', { name: '发送问题' }));

    expect(screen.getByText('建议描述背景、目标、行动、结果，我会帮你整理成适合个人网站展示的内容。')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '关闭小U咨询助手' }));
    expect(screen.queryByRole('dialog', { name: '小U咨询助手' })).not.toBeInTheDocument();
  });

  it('clears Xiaou assistant chat state after closing the chat', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/create']}>
        <App />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: '打开小U咨询助手' }));
    await user.type(screen.getByPlaceholderText('问问小U，比如：怎么填写经历'), '怎么填写经历');
    await user.click(screen.getByRole('button', { name: '发送问题' }));
    expect(await screen.findByText('建议描述背景、目标、行动、结果，我会帮你整理成适合个人网站展示的内容。')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '关闭小U咨询助手' }));
    await user.click(screen.getByRole('button', { name: '打开小U咨询助手' }));

    expect(screen.getByText('可以问我怎么填写经历、JD 是什么、模板怎么选。')).toBeInTheDocument();
    expect(screen.queryByText('建议描述背景、目标、行动、结果，我会帮你整理成适合个人网站展示的内容。')).not.toBeInTheDocument();
    expect(screen.getByLabelText('向小U提问')).toHaveValue('');
  });

  it('renders the mock analyze page with four analysis cards', async () => {
    render(
      <MemoryRouter initialEntries={['/analyze']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '分析中' })).toBeInTheDocument();
    expect(screen.getByText('小U 正在理解你的经历…')).toBeInTheDocument();
    expect(await screen.findByRole('article', { name: '岗位关键词' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '分析结果' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: '能力重点' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: '推荐展示顺序' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: '推荐强调经历' })).toBeInTheDocument();
    expect(screen.getByText('有什么问题可以问我哦')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '返回修改' })).toHaveAttribute('href', '/create');
    expect(screen.getByText('当前使用演示分析结果，真实 AI 暂不可用。')).toBeInTheDocument();
  });

  it('routes from analyze confirmation to editor', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/analyze']}>
        <App />
      </MemoryRouter>,
    );

    await screen.findByRole('article', { name: '岗位关键词' });
    await user.click(screen.getByRole('button', { name: '确认生成' }));

    expect(screen.getByRole('heading', { level: 1, name: '再调整一下，让它更像你' })).toBeInTheDocument();
  });

  it('regenerates the editor draft from current create input after analyze confirmation', async () => {
    const user = userEvent.setup();
    const staleDraft = generateSiteDraft(createInitialDraft());
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(staleDraft));

    render(
      <MemoryRouter initialEntries={['/create']}>
        <App />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText('姓名'), '陈一诺');
    await user.type(screen.getByLabelText('岗位 JD'), '用户体验设计实习生，负责用户研究和原型设计。');
    await user.type(screen.getByLabelText('经历标题 1'), 'AI 简历优化项目');
    await user.type(screen.getByLabelText('经历描述 1'), '负责访谈用户并整理优化建议。');
    await user.click(screen.getByRole('button', { name: '生成我的个人网站' }));

    await screen.findByRole('heading', { level: 1, name: '分析结果' });
    await user.click(screen.getByRole('button', { name: '确认生成' }));

    expect(screen.getByRole('heading', { level: 1, name: '再调整一下，让它更像你' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '陈一诺' })).toBeInTheDocument();
    expect(screen.getAllByText(/用户体验设计实习生/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('AI 简历优化项目').length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { level: 2, name: 'PageU 同学' })).not.toBeInTheDocument();
  });

  it('opens adjustment input and simulates reanalysis', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/analyze']}>
        <App />
      </MemoryRouter>,
    );

    await screen.findByRole('article', { name: '岗位关键词' });
    await user.click(screen.getByRole('button', { name: '哪里需要调整' }));

    const adjustmentInput = screen.getByPlaceholderText('比如：我想突出比赛经历，弱化技术背景');
    expect(adjustmentInput).toBeInTheDocument();

    await user.type(adjustmentInput, '我想突出比赛经历');
    await user.click(screen.getByRole('button', { name: '重新分析' }));

    expect(await screen.findByText('已根据你的补充重新整理理解')).toBeInTheDocument();
    expect(screen.getByRole('article', { name: '岗位关键词' })).toBeInTheDocument();
  });

  it('renders the editor with modules, preview and editing panel', () => {
    render(
      <MemoryRouter initialEntries={['/editor']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '再调整一下，让它更像你' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: '模块区' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '实时预览' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: '编辑区' })).toBeInTheDocument();
    expect(screen.getByText('有什么问题可以问我哦')).toBeInTheDocument();

    for (const moduleName of ['头像', '个人介绍', '经历', '项目', '技能', '作品', '联系方式']) {
      expect(screen.getByRole('button', { name: `选择${moduleName}` })).toBeInTheDocument();
    }
  });

  it('updates the live preview from the edit panel and autosaves', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/editor']}>
        <App />
      </MemoryRouter>,
    );

    await user.clear(screen.getByLabelText('标题'));
    await user.type(screen.getByLabelText('标题'), '我的个人主页');

    expect(screen.getByText('我的个人主页')).toBeInTheDocument();
    expect(screen.getByText('正在保存')).toBeInTheDocument();
    expect(await screen.findByText('已保存')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('pageu.siteDraft')).profile.headline).toBe('我的个人主页');
  });

  it('routes editor publish action to publish page', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/editor']}>
        <App />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: '发布网站' }));

    expect(screen.getByRole('heading', { name: '你的个人网站准备好了' })).toBeInTheDocument();
  });

  it('renders the publish page with preview, link, qr code and visibility options', async () => {
    const siteDraft = generateSiteDraft(createInitialDraft());
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(siteDraft));

    render(
      <MemoryRouter initialEntries={['/publish']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '你的个人网站准备好了' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '网站预览' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '/site/demo' })).toHaveAttribute('href', '/site/demo');
    expect(await screen.findByRole('img', { name: '当前网站二维码' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '公开' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '私密' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '密码访问' })).toBeInTheDocument();
    expect(screen.getByText('有什么问题可以问我哦')).toBeInTheDocument();
  });

  it('shows toast feedback for copying the site link and downloading the qr code', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/publish']}>
        <App />
      </MemoryRouter>,
    );

    await screen.findByRole('img', { name: '当前网站二维码' });
    await user.click(screen.getByRole('button', { name: '复制链接' }));
    expect(screen.getByRole('status')).toHaveTextContent('已复制链接');

    await user.click(screen.getByRole('button', { name: '下载二维码' }));
    expect(screen.getByRole('status')).toHaveTextContent('二维码已下载');
  });

  it('saves publishDraft and routes to the generated site', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/publish']}>
        <App />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('radio', { name: '密码访问' }));
    await user.click(screen.getByRole('button', { name: '访问网站' }));

    expect(JSON.parse(localStorage.getItem('pageu.publish'))).toMatchObject({
      published: true,
      siteId: 'demo',
      visibility: 'password',
    });
    expect(screen.getByText('Generated by PageU')).toBeInTheDocument();
  });

  it('starts a new site from publish by clearing PageU draft storage and returning to create', async () => {
    const user = userEvent.setup();
    const siteDraft = generateSiteDraft(createInitialDraft());
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(siteDraft));
    localStorage.setItem(PUBLISH_STORAGE_KEY, JSON.stringify({ published: true, siteId: 'demo', visibility: 'password' }));

    render(
      <MemoryRouter initialEntries={['/create']}>
        <App />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText('姓名'), '林小雨');
    await user.type(screen.getByLabelText('岗位 JD'), '前端实习生，负责 React 页面开发。');
    await user.click(screen.getByRole('button', { name: '生成我的个人网站' }));
    await screen.findByRole('heading', { level: 1, name: '分析结果' });
    await user.click(screen.getByRole('button', { name: '确认生成' }));
    await user.click(screen.getByRole('button', { name: '发布网站' }));

    await user.click(screen.getByRole('button', { name: '创建新的个人网站' }));

    expect(screen.getByRole('heading', { level: 1, name: '告诉我你的经历' })).toBeInTheDocument();
    expect(screen.getByLabelText('姓名')).toHaveValue('');
    expect(screen.getByLabelText('岗位 JD')).toHaveValue('');
    expect(localStorage.getItem(SITE_DRAFT_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(PUBLISH_STORAGE_KEY)).toBeNull();
    expect(JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY)).basicInfo.name).toBe('');
  });

  it('starts a new site from the generated site page', async () => {
    const user = userEvent.setup();
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = '林小雨';
    const siteDraft = generateSiteDraft(createDraft);
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(siteDraft));
    localStorage.setItem(PUBLISH_STORAGE_KEY, JSON.stringify({ published: true, siteId: 'demo', visibility: 'public' }));

    render(
      <MemoryRouter initialEntries={['/site/demo']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '林小雨' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '创建新的个人网站' }));

    expect(screen.getByRole('heading', { level: 1, name: '告诉我你的经历' })).toBeInTheDocument();
    expect(screen.getByLabelText('姓名')).toHaveValue('');
    expect(localStorage.getItem(SITE_DRAFT_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(PUBLISH_STORAGE_KEY)).toBeNull();
  });

  it('renders the generated site from siteDraft without editor controls', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = '林小雨';
    createDraft.jobInfo.jd = '产品设计实习生，负责需求分析和体验优化。';
    createDraft.template = 'glass';
    const siteDraft = generateSiteDraft(createDraft);
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(siteDraft));

    render(
      <MemoryRouter initialEntries={['/site/demo']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('main')).toHaveAttribute('data-template', 'glass');
    expect(screen.getByRole('heading', { level: 1, name: '林小雨' })).toBeInTheDocument();
    expect(screen.getAllByText(/产品设计实习生/).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 2, name: 'Featured Projects' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '技能与证书' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '作品 / 链接' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '联系我' })).toBeInTheDocument();
    expect(screen.getByText('Generated by PageU')).toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: '模块区' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '发布网站' })).not.toBeInTheDocument();
  });

  it('renders /site/demo as a portfolio website with hero and featured projects', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = '陈一诺';
    createDraft.basicInfo.personalTagline = 'AI产品｜用户研究｜把想法做成产品';
    createDraft.jobInfo.jd = '用户体验设计实习生，负责用户研究和原型设计。';
    createDraft.experiences = [
      {
        id: 'experience-ai',
        title: 'AI 简历优化项目',
        role: '产品设计负责人',
        period: '2025.09 - 2025.12',
        description: '调研同学求职痛点，设计简历分析和建议生成流程。',
        link: 'https://example.com/demo',
        collapsed: false,
      },
    ];
    const siteDraft = generateSiteDraft(createDraft);
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(siteDraft));

    render(
      <MemoryRouter initialEntries={['/site/demo']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '陈一诺' })).toBeInTheDocument();
    expect(screen.getAllByText('AI产品｜用户研究｜把想法做成产品').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 2, name: 'Featured Projects' })).toBeInTheDocument();
    expect(screen.getAllByText('AI 简历优化项目').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: '查看项目' }).some((link) => link.getAttribute('href') === 'https://example.com/demo')).toBe(true);
  });

  it('switches generated site layout class when the selected template changes', () => {
    const createDraft = createInitialDraft();
    const gridDraft = generateSiteDraft(createDraft);
    gridDraft.template = 'grid';
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(gridDraft));

    const { unmount } = render(
      <MemoryRouter initialEntries={['/site/demo']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('main')).toHaveClass('template-grid-site');
    unmount();

    const flowDraft = generateSiteDraft(createDraft);
    flowDraft.template = 'flow';
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(flowDraft));

    render(
      <MemoryRouter initialEntries={['/site/demo']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('main')).toHaveClass('template-flow-site');
  });
});
