import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { generateSiteDraft } from './lib/draftGenerator';
import { analyzeCareerDraft, normalizeAnalysisPayload } from './services/ai/aiClient';
import { answerAssistantQuestion } from './services/ai/assistantChat';
import { createAnalysisResult } from './types/analysisResult';
import { createInitialDraft, DRAFT_STORAGE_KEY } from './types/createDraft';
import { PUBLISH_STORAGE_KEY } from './types/publishDraft';
import { SITE_DRAFT_STORAGE_KEY } from './types/siteDraft';

describe('siteDraft generation', () => {
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
    expect(screen.getByRole('heading', { level: 2, name: '岗位信息' })).toBeInTheDocument();
    expect(screen.getByLabelText('岗位 JD')).toBeRequired();
    expect(screen.getByLabelText('目标公司')).toBeInTheDocument();
    expect(screen.getByLabelText('求职类型')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '让我理解一下这个岗位' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '经历信息' })).toBeInTheDocument();
    expect(screen.getByText('建议描述：背景、目标、行动、结果')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '技能证书' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('例如：React、Python、Axure、SQL、用户研究')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('例如：英语六级、奖学金、竞赛奖项')).toBeInTheDocument();
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
    expect(screen.getByText('产品设计实习生')).toBeInTheDocument();
    expect(screen.getByText('经历')).toBeInTheDocument();
    expect(screen.getByText('项目')).toBeInTheDocument();
    expect(screen.getByText('技能')).toBeInTheDocument();
    expect(screen.getByText('作品')).toBeInTheDocument();
    expect(screen.getByText('联系方式')).toBeInTheDocument();
    expect(screen.getByText('Generated by PageU')).toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: '模块区' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '发布网站' })).not.toBeInTheDocument();
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
