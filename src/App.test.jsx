import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { generateSiteDraft } from './lib/draftGenerator';
import { createAnalysisResult } from './types/analysisResult';
import { createInitialDraft } from './types/createDraft';

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
    expect(screen.getByText('小U')).toBeInTheDocument();
    expect(screen.getByText('准备好开始了吗？')).toBeInTheDocument();
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
    expect(screen.getByText('认识一下你')).toBeInTheDocument();
  });

  it.each([
    ['/publish', '发布页', '你的个人网站准备好了'],
    ['/site/demo', '个人网站页', '这里是生成后的个人网站'],
  ])('renders the placeholder route %s', (path, title, hint) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByText(hint)).toBeInTheDocument();
  });

  it('renders the full create flow input surface', () => {
    render(
      <MemoryRouter initialEntries={['/create']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '告诉我你的经历' })).toBeInTheDocument();
    expect(screen.getByLabelText('照片')).toBeInTheDocument();
    expect(screen.getByLabelText('姓名')).toBeInTheDocument();
    expect(screen.getByLabelText('联系方式')).toBeInTheDocument();
    expect(screen.getByLabelText('学校')).toBeInTheDocument();
    expect(screen.getByLabelText('专业')).toBeInTheDocument();
    expect(screen.getByLabelText('岗位 JD')).toBeRequired();
    expect(screen.getByLabelText('目标公司')).toBeInTheDocument();
    expect(screen.getByLabelText('求职类型')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '让我理解一下这个岗位' })).toBeInTheDocument();
    expect(screen.getByText('建议描述：背景、目标、行动、结果')).toBeInTheDocument();
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
    expect(screen.getByRole('heading', { level: 1, name: '这是我对你的理解' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'PageU' }));
    await user.click(screen.getByRole('link', { name: '立即创建' }));

    expect(screen.getByLabelText('姓名')).toHaveValue('林小雨');
    expect(screen.getByLabelText('岗位 JD')).toHaveValue('前端实习生，负责 React 页面开发。');
    expect(screen.getByRole('radio', { name: 'Flow' })).toBeChecked();
  });

  it('renders the mock analyze page with four analysis cards', () => {
    render(
      <MemoryRouter initialEntries={['/analyze']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '这是我对你的理解' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: '岗位关键词' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: '能力重点' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: '推荐展示顺序' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: '推荐强调经历' })).toBeInTheDocument();
    expect(screen.getByText('我先帮你整理了一版。')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '返回修改' })).toHaveAttribute('href', '/create');
  });

  it('routes from analyze confirmation to editor', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/analyze']}>
        <App />
      </MemoryRouter>,
    );

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

    await user.click(screen.getByRole('button', { name: '哪里需要调整' }));

    const adjustmentInput = screen.getByPlaceholderText('比如：我想突出比赛经历，弱化技术背景');
    expect(adjustmentInput).toBeInTheDocument();

    await user.type(adjustmentInput, '我想突出比赛经历');
    await user.click(screen.getByRole('button', { name: '重新分析' }));

    expect(screen.getByText('已根据你的补充重新整理理解')).toBeInTheDocument();
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
    expect(screen.getByText('已经很不错了，再调整一下吧')).toBeInTheDocument();

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

    expect(screen.getByRole('heading', { name: '发布页' })).toBeInTheDocument();
  });
});
