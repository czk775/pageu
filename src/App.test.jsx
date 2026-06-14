import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { generateSiteDraft } from './lib/draftGenerator';
import { compressImageDataUrl } from './lib/imagePreview';
import { TemplateRenderer } from './renderers/TemplateRenderer';
import { analyzeCareerDraft, normalizeAnalysisPayload } from './services/ai/aiClient';
import { answerAssistantQuestion } from './services/ai/assistantChat';
import { publishSiteDraft } from './services/publish/sitePublisher';
import { createAnalysisResult } from './types/analysisResult';
import { createInitialDraft, DRAFT_STORAGE_KEY, normalizeDraft } from './types/createDraft';
import { PUBLISH_STORAGE_KEY } from './types/publishDraft';
import { SITE_DRAFT_STORAGE_KEY } from './types/siteDraft';

describe('image preview compression', () => {
  it('compresses oversized image data urls before storing them in draft state', async () => {
    const originalImage = globalThis.Image;
    const originalCreateElement = document.createElement.bind(document);
    const compressedPreview = 'data:image/jpeg;base64,compressed-cover';
    const drawImage = vi.fn();
    const fillRect = vi.fn();
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        drawImage,
        fillRect,
        fillStyle: '',
      })),
      toDataURL: vi.fn(() => compressedPreview),
    };

    class MockImage {
      width = 3000;
      height = 1800;
      onload = null;
      onerror = null;

      set src(_value) {
        this.onload?.();
      }
    }

    globalThis.Image = MockImage;
    vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      if (tagName === 'canvas') {
        return canvas;
      }

      return originalCreateElement(tagName, options);
    });

    try {
      const oversizedPreview = `data:image/png;base64,${'a'.repeat(900_000)}`;
      const result = await compressImageDataUrl(oversizedPreview);

      expect(result).toBe(compressedPreview);
      expect(canvas.width).toBe(1400);
      expect(canvas.height).toBe(840);
      expect(fillRect).toHaveBeenCalledWith(0, 0, 1400, 840);
      expect(drawImage).toHaveBeenCalled();
      expect(result.length).toBeLessThan(oversizedPreview.length);
    } finally {
      globalThis.Image = originalImage;
      vi.restoreAllMocks();
    }
  });
});

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
    expect(normalized.basicInfo.selfIntro).toBe('AI产品｜用户研究｜把想法做成产品');
    expect(normalized.jobInfo.motivation).toBe('希望连接用户问题与 AI 能力。');
    expect(normalized.experiences[0]).toMatchObject({
      coverName: '',
      coverUrl: '',
      role: '',
      period: '',
      summary: '',
      link: '',
    });
    expect(normalized.worksInfo.rawLinks).toContain('PageU Demo');
    expect(normalized.stylePreference).toBe('科技未来');
  });

  it('normalizes legacy experiences with complete cover and portfolio fields', () => {
    const normalized = normalizeDraft({
      experiences: [
        {
          id: 'legacy-2',
          title: '旧经历',
          description: '旧数据只有标题和描述。',
        },
      ],
    });

    expect(normalized.experiences[0]).toMatchObject({
      id: 'legacy-2',
      title: '旧经历',
      coverName: '',
      coverUrl: '',
      link: '',
      role: '',
      period: '',
      summary: '',
      collapsed: false,
    });
  });

  it('normalizes aboutInfo and renders it before resume without generated filler copy', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = 'About User';
    createDraft.basicInfo.school = '示例大学';
    createDraft.basicInfo.major = '市场营销';
    createDraft.jobInfo.jd = '产品设计实习生，负责 AI 功能规划。';
    createDraft.skillsInfo.keywords = 'Python、SQL、SPSS';
    createDraft.aboutInfo.interests = '喜欢研究校园 AI 产品和消费品牌案例。';
    createDraft.aboutInfo.background = '市场营销专业背景，关注用户洞察和增长策略。';
    createDraft.aboutInfo.strengths = '擅长访谈、数据分析和清晰表达。';

    const siteDraft = generateSiteDraft(createDraft);
    const { container } = render(<TemplateRenderer as="main" mode="site" siteDraft={siteDraft} />);

    const aboutSection = container.querySelector('#about');
    const resumeSection = container.querySelector('#resume');
    expect(aboutSection).toBeInTheDocument();
    expect(resumeSection).toBeInTheDocument();
    expect(aboutSection.compareDocumentPosition(resumeSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(aboutSection).getByText('喜欢研究校园 AI 产品和消费品牌案例。')).toBeInTheDocument();
    const backgroundCopy = within(aboutSection).getByText('市场营销专业背景，关注用户洞察和增长策略。');
    const interestsCopy = within(aboutSection).getByText('喜欢研究校园 AI 产品和消费品牌案例。');
    expect(backgroundCopy).toBeInTheDocument();
    expect(backgroundCopy.compareDocumentPosition(interestsCopy) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(aboutSection).getByText('擅长访谈、数据分析和清晰表达。')).toBeInTheDocument();
    expect(within(aboutSection).queryByText(/示例大学/)).not.toBeInTheDocument();
    expect(within(aboutSection).queryByText(/目标方向/)).not.toBeInTheDocument();
    expect(within(aboutSection).queryByText(/Python/)).not.toBeInTheDocument();
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
    createDraft.basicInfo.selfIntro = '我关注 AI 产品、用户洞察与商业创新，希望把技术理解转化为真实产品价值。';
    createDraft.basicInfo.photoPreviewUrl = 'data:image/png;base64,avatar-preview';
    createDraft.jobInfo.jd = '用户体验设计实习生，负责用户研究和原型设计。';
    createDraft.jobInfo.motivation = '希望把用户问题转化为可以落地的 AI 产品体验。';
    createDraft.experiences = [
      {
        id: 'experience-ai',
        title: 'AI 简历优化项目',
        role: '产品设计负责人',
        period: '2025.09 - 2025.12',
        summary: '为大学生求职场景设计 AI 简历优化体验。',
        description: '调研同学求职痛点，设计简历分析和建议生成流程，完成可演示原型。',
        coverUrl: 'data:image/png;base64,project-cover',
        link: 'https://example.com/demo',
        collapsed: false,
      },
    ];
    createDraft.skillsInfo.keywords = 'React、Python、用户研究、Axure';
    createDraft.skillsInfo.certificates = '英语六级、校级奖学金';
    createDraft.worksInfo.rawLinks = 'PageU Demo | https://pageu.example.com | AI个人网站生成器';
    createDraft.stylePreference = '科技未来';

    const siteDraft = generateSiteDraft(createDraft, createAnalysisResult(createDraft));

    expect(siteDraft.profile.selfIntro).toBe('我关注 AI 产品、用户洞察与商业创新，希望把技术理解转化为真实产品价值。');
    expect(siteDraft.profile.photoUrl).toBe('data:image/png;base64,avatar-preview');
    expect(siteDraft.profile.photoPreviewUrl).toBe('data:image/png;base64,avatar-preview');
    expect(siteDraft.hero).toMatchObject({
      title: '陈一诺',
      primaryCta: '查看项目',
      secondaryCta: '联系我',
    });
    expect(siteDraft.hero.subtitle).toBe('我关注 AI 产品、用户洞察与商业创新，希望把技术理解转化为真实产品价值。');
    expect(siteDraft.highlights).toHaveLength(3);
    expect(siteDraft.projects[0]).toMatchObject({
      title: 'AI 简历优化项目',
      role: '产品设计负责人',
      period: '2025.09 - 2025.12',
      coverUrl: 'data:image/png;base64,project-cover',
      externalLink: 'https://example.com/demo',
    });
    expect(siteDraft.projects[0].actions.length).toBeGreaterThan(0);
    expect(siteDraft.resumeSnapshot).toMatchObject({
      school: '南山大学',
      major: '数字媒体技术',
    });
    expect(siteDraft.projects[0].summary).not.toBe(createDraft.experiences[0].description);
    expect(siteDraft.projects[0].tags.length).toBeGreaterThanOrEqual(3);
    expect(siteDraft.works).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'AI 简历优化项目',
          url: 'https://example.com/demo',
        }),
      ]),
    );
    expect(siteDraft.works).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'PageU Demo',
          url: 'https://pageu.example.com',
        }),
      ]),
    );
    expect(siteDraft.skills).toEqual(expect.arrayContaining(['React', 'Python', '用户研究', 'Axure']));
    expect(siteDraft.certificates).toEqual(expect.arrayContaining(['英语六级', '校级奖学金']));
  });

  it('does not render legacy works links and keeps distinct template structures', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = '陈一诺';
    createDraft.jobInfo.jd = '产品经理实习生';
    createDraft.worksInfo.rawLinks = '作品链接 | https://example.com | 项目说明';
    const siteDraft = generateSiteDraft(createDraft);

    render(<TemplateRenderer siteDraft={siteDraft} />);
    expect(screen.queryByRole('link', { name: '作品链接' })).not.toBeInTheDocument();

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
    expect(container.querySelector('.portfolio-preview-scale').getAttribute('style') || '').not.toContain('transform');
  });

  it('marks generated portfolio sections for storytelling motion', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = 'Portfolio User';
    createDraft.template = 'glass';
    const siteDraft = generateSiteDraft(createDraft);

    const { container } = render(<TemplateRenderer as="main" mode="site" siteDraft={siteDraft} />);

    expect(container.firstChild).toHaveClass('portfolio-motion-ready');
    expect(container.firstChild).toHaveAttribute('data-reduced-motion', 'false');
    expect(container.querySelector('[data-motion-section="about"]')).toBeInTheDocument();
    expect(container.querySelector('[data-motion-section="projects"]')).toBeInTheDocument();
    expect(container.querySelector('[data-motion-section="resume"]')).toBeInTheDocument();
    expect(container.querySelector('[data-motion-section="contact"]')).toBeInTheDocument();
  });

  it('respects reduced motion preferences without breaking rendering', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    try {
      const siteDraft = generateSiteDraft(createInitialDraft());
      const { container } = render(<TemplateRenderer as="main" mode="site" siteDraft={siteDraft} />);

      expect(container.firstChild).toHaveAttribute('data-reduced-motion', 'true');
      expect(screen.getByRole('navigation', { name: 'Portfolio navigation' })).toBeInTheDocument();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('renders portfolio hero navigation and simplified hero text', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = 'Portfolio User';
    createDraft.basicInfo.selfIntro = '我希望把复杂经历整理成清晰的作品集表达。';
    createDraft.jobInfo.jd = 'Product Designer Intern';
    const siteDraft = generateSiteDraft(createDraft);

    render(<TemplateRenderer as="main" mode="site" siteDraft={siteDraft} />);

    const nav = screen.getByRole('navigation', { name: 'Portfolio navigation' });
    expect(nav).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: '简历' })).toHaveAttribute('href', '#resume');
    expect(within(nav).getByRole('link', { name: '项目' })).toHaveAttribute('href', '#featured-projects');
    expect(within(nav).getByRole('link', { name: '联系我' })).toHaveAttribute('href', '#contact');
    expect(within(nav).queryByRole('link', { name: '关于我' })).not.toBeInTheDocument();
    const hero = screen.getByRole('region', { name: 'Portfolio hero' });
    expect(within(nav).getByRole('link', { name: 'Portfolio User' })).toHaveAttribute('href', '#top');
    expect(document.querySelector('.portfolio-hero-horizontal-tab')).toBeInTheDocument();
    expect(within(hero).queryByText('Product Designer Intern')).not.toBeInTheDocument();
    expect(within(hero).getByText('我希望把复杂经历整理成清晰的作品集表达。')).toBeInTheDocument();
    expect(within(hero).queryByRole('link', { name: '查看项目' })).not.toBeInTheDocument();
  });

  it('renders the uploaded profile photo when the draft stores photoUrl', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = 'Photo User';
    createDraft.basicInfo.photoUrl = 'data:image/png;base64,avatar-photo-url';
    createDraft.basicInfo.selfIntro = 'Intro from the create form.';
    createDraft.jobInfo.jd = 'Product Designer Intern';
    const siteDraft = generateSiteDraft(createDraft);

    render(<TemplateRenderer as="main" mode="site" siteDraft={siteDraft} />);

    const hero = screen.getByRole('region', { name: 'Portfolio hero' });
    expect(within(hero).getByRole('img', { name: 'Photo User 的头像' })).toHaveAttribute(
      'src',
      'data:image/png;base64,avatar-photo-url',
    );
  });

  it('renders the hero as a horizontal profile tab with photo and self intro', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = 'Horizontal User';
    createDraft.basicInfo.photoPreviewUrl = 'data:image/png;base64,horizontal-avatar';
    createDraft.basicInfo.selfIntro = 'This is the self intro from basic info.';
    createDraft.jobInfo.jd = 'Product Designer Intern';
    const siteDraft = generateSiteDraft(createDraft);

    const { container } = render(<TemplateRenderer as="main" mode="site" siteDraft={siteDraft} />);

    const hero = screen.getByRole('region', { name: 'Portfolio hero' });
    const horizontalTab = container.querySelector('.portfolio-hero-horizontal-tab');
    expect(horizontalTab).toBeInTheDocument();
    expect(within(hero).getByRole('img', { name: 'Horizontal User 的头像' })).toHaveAttribute(
      'src',
      'data:image/png;base64,horizontal-avatar',
    );
    const intro = within(hero).getByText('This is the self intro from basic info.');
    expect(intro).toBeInTheDocument();
    expect(intro).toHaveClass('portfolio-hero-intro-card-copy');
    expect(container.querySelector('.portfolio-hero-intro-card')).toBeInTheDocument();
    expect(container.querySelector('.portfolio-hero-bento-main')).not.toBeInTheDocument();
  });

  it('formats long hero self intro as indented readable paragraphs', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = 'Intro User';
    createDraft.basicInfo.selfIntro = '我是曹栓康，来自山东济宁。喜欢观察问题，理解用户。希望未来持续探索 AI 与商业的结合。';
    const siteDraft = generateSiteDraft(createDraft);

    const { container } = render(<TemplateRenderer as="main" mode="site" siteDraft={siteDraft} />);

    const paragraphs = [...container.querySelectorAll('.portfolio-hero-intro-card-copy')];
    expect(paragraphs).toHaveLength(3);
    expect(paragraphs[0]).toHaveTextContent('我是曹栓康，来自山东济宁。');
    expect(paragraphs[1]).toHaveTextContent('喜欢观察问题，理解用户。');
    expect(paragraphs[2]).toHaveTextContent('希望未来持续探索 AI 与商业的结合。');
    paragraphs.forEach((paragraph) => {
      expect(paragraph).toHaveClass('portfolio-hero-intro-paragraph');
    });
  });

  it('does not use JD section labels as the hero target role', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = 'Role User';
    createDraft.basicInfo.selfIntro = 'Intro from the create form.';
    createDraft.jobInfo.jd = '岗位职责：负责 AI 产品需求分析和用户体验设计。\n任职要求：熟悉产品设计。';
    const siteDraft = generateSiteDraft(createDraft);

    render(<TemplateRenderer as="main" mode="site" siteDraft={siteDraft} />);

    const hero = screen.getByRole('region', { name: 'Portfolio hero' });
    expect(within(hero).queryByText(/岗位职责/)).not.toBeInTheDocument();
  });

  it('smooth scrolls and highlights portfolio navigation on click', async () => {
    const user = userEvent.setup();
    const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    try {
      const siteDraft = generateSiteDraft(createInitialDraft());
      render(
        <MemoryRouter initialEntries={['/site/demo']}>
          <App />
        </MemoryRouter>,
      );

      const nav = screen.getByRole('navigation', { name: 'Portfolio navigation' });
      const projectsLink = within(nav).getByRole('link', { name: '项目' });
      await user.click(projectsLink);

      expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
      expect(projectsLink).toHaveAttribute('aria-current', 'page');
      expect(window.location.hash).toBe('#featured-projects');
      expect(screen.getByRole('heading', { level: 2, name: '精选项目' })).toBeInTheDocument();
    } finally {
      window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    }
  });

  it('renders ProjectCard as portfolio case content instead of narrow Problem Action Result columns', () => {
    const createDraft = createInitialDraft();
    createDraft.experiences = [
      {
        id: 'experience-case',
        title: 'Campus AI Portfolio',
        role: 'Product Designer',
        period: '2026',
        description: '项目背景：访谈同学并整理求职痛点。我的目标：让输入流程更清晰。我的行动：设计输入流程和作品集展示结构。产出结果：完成可演示原型。',
        link: 'https://example.com/case',
        collapsed: false,
      },
    ];
    const siteDraft = generateSiteDraft(createDraft);

    const { container } = render(<TemplateRenderer mode="site" siteDraft={siteDraft} />);

    expect(screen.getAllByText('查看项目 →').length).toBeGreaterThan(0);
    expect(screen.queryByText('我做了什么')).not.toBeInTheDocument();
    expect(screen.queryByText('项目背景：访谈同学并整理求职痛点。')).not.toBeInTheDocument();
    expect(screen.queryByText('我的目标：让输入流程更清晰。')).not.toBeInTheDocument();
    expect(screen.queryByText('产出与价值')).not.toBeInTheDocument();
    expect(screen.queryByText('岗位关联')).not.toBeInTheDocument();
    expect(container.querySelector('.portfolio-project-points')).not.toBeInTheDocument();
    expect(screen.queryByText('Problem')).not.toBeInTheDocument();
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Result')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '查看项目' }).some((link) => link.getAttribute('href') === '/site/demo/project/project-1')).toBe(true);
  });

  it('renders real avatar and project cover images in the generated portfolio site', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = '陈一诺';
    createDraft.basicInfo.photoPreviewUrl = 'data:image/png;base64,avatar-preview';
    createDraft.experiences = [
      {
        id: 'experience-cover',
        title: 'AI 简历优化项目',
        role: '产品设计负责人',
        period: '2026',
        summary: '把求职经历转化成个人网站。',
        description: '调研同学求职痛点，设计输入流程。',
        coverUrl: 'data:image/png;base64,project-cover',
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

    expect(screen.getByRole('img', { name: '陈一诺 的头像' })).toHaveAttribute('src', 'data:image/png;base64,avatar-preview');
    expect(screen.getByRole('img', { name: 'AI 简历优化项目 封面' })).toHaveAttribute('src', 'data:image/png;base64,project-cover');
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

  it('does not add generic project experience to display order when real experience titles exist', () => {
    const createDraft = createInitialDraft();
    createDraft.experiences = [
      { ...createDraft.experiences[0], id: 'experience-tencent', title: '腾讯 PCG 校园 AI 产品创意大赛' },
      { ...createDraft.experiences[0], id: 'experience-loreal', title: '欧莱雅brandstorm大赛' },
      { ...createDraft.experiences[0], id: 'experience-nestle', title: '雀巢CEO挑战赛' },
    ];

    const analysisResult = createAnalysisResult(createDraft);

    expect(analysisResult.displayOrder).toEqual(['腾讯 PCG 校园 AI 产品创意大赛', '欧莱雅brandstorm大赛', '雀巢CEO挑战赛', '技能证书']);
    expect(analysisResult.displayOrder).not.toContain('项目经历');
  });

  it('filters generic project experience from normalized AI display order when real titles exist', () => {
    const createDraft = createInitialDraft();
    createDraft.experiences = [
      { ...createDraft.experiences[0], id: 'experience-tencent', title: '腾讯 PCG 校园 AI 产品创意大赛' },
      { ...createDraft.experiences[0], id: 'experience-loreal', title: '欧莱雅brandstorm大赛' },
      { ...createDraft.experiences[0], id: 'experience-nestle', title: '雀巢CEO挑战赛' },
    ];
    const fallbackResult = createAnalysisResult(createDraft);

    const normalized = normalizeAnalysisPayload(
      {
        jobKeywords: ['AI'],
        abilityFocus: ['表达能力'],
        displayOrder: ['腾讯 PCG 校园 AI 产品创意大赛', '欧莱雅brandstorm大赛', '雀巢CEO挑战赛', '项目经历'],
        highlightedExperiences: ['腾讯 PCG 校园 AI 产品创意大赛'],
      },
      fallbackResult,
      {
        provider: 'qwen',
        fallback: false,
        error: null,
        updatedAt: '2026-06-10T00:00:00.000Z',
      },
    );

    expect(normalized.displayOrder).not.toContain('项目经历');
    expect(normalized.displayOrder).toContain('技能证书');
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
    expect(screen.queryByLabelText('联系方式')).not.toBeInTheDocument();
    expect(screen.getByLabelText('手机号')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
    expect(screen.getByLabelText('学校')).toBeInTheDocument();
    expect(screen.getByLabelText('学校')).toHaveAttribute('autocomplete', 'off');
    expect(screen.getByLabelText('专业')).toBeInTheDocument();
    expect(screen.queryByLabelText('个人标签 / 一句话定位')).not.toBeInTheDocument();
    expect(screen.getByLabelText('自我介绍')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('例如：我关注 AI 产品、用户洞察与商业创新，希望把技术理解转化为真实产品价值。')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '关于我' })).toBeInTheDocument();
    expect(screen.getByText('输入更多信息进一步展示自己，比如兴趣爱好、专业背景、特长等')).toBeInTheDocument();
    expect(screen.getByLabelText('兴趣爱好')).toBeInTheDocument();
    expect(screen.getByLabelText('专业背景')).toBeInTheDocument();
    expect(
      screen.getByLabelText('专业背景').compareDocumentPosition(screen.getByLabelText('兴趣爱好')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByLabelText('特长')).toBeInTheDocument();
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
    expect(screen.getByLabelText('项目封面 1')).toBeInTheDocument();
    expect(screen.getByLabelText('项目一句话简介 1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '技能证书' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('React、Python、SQL、Axure、用户研究、产品设计')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('英语六级、奖学金、竞赛奖项、优秀学生干部')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: '作品 / 项目链接' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: '作品 / 项目链接' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: '你希望网站给人的感觉' })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: '科技未来' })).not.toBeInTheDocument();
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

  it('stores uploaded avatar and project cover previews in createDraft', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/create']}>
        <App />
      </MemoryRouter>,
    );

    await user.upload(screen.getByLabelText('照片'), new File(['avatar'], 'avatar.png', { type: 'image/png' }));
    await user.upload(screen.getByLabelText('项目封面 1'), new File(['cover'], 'cover.png', { type: 'image/png' }));

    await waitFor(() => {
      const storedDraft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY));
      expect(storedDraft.basicInfo.photoPreviewUrl).toContain('data:image/png;base64');
      expect(storedDraft.experiences[0].coverUrl).toContain('data:image/png;base64');
    });
  });

  it('uploads project covers for the first four experiences without mixing File objects into draft state', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/create']}>
        <App />
      </MemoryRouter>,
    );

    for (let index = 2; index <= 4; index += 1) {
      await user.click(screen.getByRole('button', { name: '继续添加经历' }));
      expect(screen.getByRole('group', { name: `经历${index}` })).toBeInTheDocument();
    }

    for (let index = 1; index <= 4; index += 1) {
      await user.upload(screen.getByLabelText(`项目封面 ${index}`), new File([`cover-${index}`], `cover-${index}.png`, { type: 'image/png' }));
    }

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: '告诉我你的经历' })).toBeInTheDocument();

      for (let index = 1; index <= 4; index += 1) {
        expect(screen.getByRole('img', { name: `项目封面预览 ${index}` })).toHaveAttribute('src', expect.stringContaining('data:image/png;base64'));
      }

      const storedDraft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY));
      expect(storedDraft.experiences).toHaveLength(4);
      storedDraft.experiences.forEach((experience, index) => {
        expect(experience.coverUrl).toEqual(expect.stringContaining('data:image/png;base64'));
        expect(experience.coverName).toBe(`cover-${index + 1}.png`);
        expect(experience.coverFile).toBeUndefined();
        expect(experience.file).toBeUndefined();
      });
    });
  });

  it('keeps the create page visible when autosave fails after uploading the second project cover', async () => {
    const user = userEvent.setup();
    const originalSetItem = Storage.prototype.setItem;
    let shouldThrow = false;
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function setItem(key, value) {
      if (shouldThrow && key === DRAFT_STORAGE_KEY) {
        throw new DOMException('Draft storage quota exceeded', 'QuotaExceededError');
      }

      return originalSetItem.call(this, key, value);
    });

    try {
      render(
        <MemoryRouter initialEntries={['/create']}>
          <App />
        </MemoryRouter>,
      );

      await user.click(screen.getByRole('button', { name: '继续添加经历' }));
      await user.click(screen.getByRole('button', { name: '继续添加经历' }));

      await user.upload(screen.getByLabelText('项目封面 1'), new File(['first-cover'], 'first-cover.png', { type: 'image/png' }));
      await waitFor(() => {
        expect(screen.getByRole('img', { name: '项目封面预览 1' })).toBeInTheDocument();
      });

      shouldThrow = true;
      await user.upload(screen.getByLabelText('项目封面 2'), new File(['second-cover'], 'second-cover.png', { type: 'image/png' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: '告诉我你的经历' })).toBeInTheDocument();
        expect(screen.getByRole('group', { name: '经历2' })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: '项目封面预览 2' })).toHaveAttribute('src', expect.stringContaining('data:image/png;base64'));
      });
    } finally {
      setItemSpy.mockRestore();
    }
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

  it('routes from analyze confirmation directly to the generated site', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/analyze']}>
        <App />
      </MemoryRouter>,
    );

    await screen.findByRole('article', { name: '岗位关键词' });
    await user.click(screen.getByRole('button', { name: '确认生成' }));

    expect(screen.getByRole('navigation', { name: 'Portfolio navigation' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Portfolio hero' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1, name: '你的个人网站准备好了' })).not.toBeInTheDocument();
  });

  it('still enters the generated site when saving siteDraft exceeds localStorage quota', async () => {
    const user = userEvent.setup();
    const originalSetItem = Storage.prototype.setItem;
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function setItem(key, value) {
      if (key === SITE_DRAFT_STORAGE_KEY) {
        throw new DOMException('Site draft storage quota exceeded', 'QuotaExceededError');
      }

      return originalSetItem.call(this, key, value);
    });

    try {
      render(
        <MemoryRouter initialEntries={['/analyze']}>
          <App />
        </MemoryRouter>,
      );

      await screen.findByRole('article', { name: '岗位关键词' });
      await user.click(screen.getByRole('button', { name: '确认生成' }));

      expect(screen.getByRole('navigation', { name: 'Portfolio navigation' })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Portfolio hero' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { level: 1, name: '分析结果' })).not.toBeInTheDocument();
    } finally {
      setItemSpy.mockRestore();
    }
  });

  it('regenerates the generated site from current create input after analyze confirmation', async () => {
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

    expect(screen.getByRole('navigation', { name: 'Portfolio navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '陈一诺' })).toHaveAttribute('href', '#top');
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

  it('keeps demo inputs when starting another site from publish', async () => {
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

    await user.click(screen.getByRole('button', { name: '创建新的个人网站' }));

    expect(screen.getByRole('heading', { level: 1, name: '告诉我你的经历' })).toBeInTheDocument();
    expect(screen.getByLabelText('姓名')).toHaveValue('林小雨');
    expect(screen.getByLabelText('岗位 JD')).toHaveValue('前端实习生，负责 React 页面开发。');
    expect(localStorage.getItem(SITE_DRAFT_STORAGE_KEY)).not.toBeNull();
    expect(localStorage.getItem(PUBLISH_STORAGE_KEY)).not.toBeNull();
    expect(JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY)).basicInfo.name).toBe('林小雨');
  });

  it('keeps demo inputs when starting another site from the generated site page', async () => {
    const user = userEvent.setup();
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = '林小雨';
    const siteDraft = generateSiteDraft(createDraft);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(createDraft));
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(siteDraft));
    localStorage.setItem(PUBLISH_STORAGE_KEY, JSON.stringify({ published: true, siteId: 'demo', visibility: 'public' }));

    render(
      <MemoryRouter initialEntries={['/site/demo']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: '林小雨' })).toHaveAttribute('href', '#top');
    await user.click(screen.getByRole('button', { name: '创建新的个人网站' }));

    expect(screen.getByRole('heading', { level: 1, name: '告诉我你的经历' })).toBeInTheDocument();
    expect(screen.getByLabelText('姓名')).toHaveValue('林小雨');
    expect(localStorage.getItem(SITE_DRAFT_STORAGE_KEY)).not.toBeNull();
    expect(localStorage.getItem(PUBLISH_STORAGE_KEY)).not.toBeNull();
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
    expect(screen.getByRole('main')).toHaveClass('portfolio-site-mode');
    expect(screen.getByRole('main')).not.toHaveClass('portfolio-preview-mode');
    expect(screen.getByRole('link', { name: '林小雨' })).toHaveAttribute('href', '#top');
    expect(screen.getAllByText(/产品设计实习生/).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 2, name: '简历摘要' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '精选项目' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Featured Projects' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Resume Snapshot' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '展开完整简历' })).not.toBeInTheDocument();
    expect(screen.queryByText('完整时间轴')).not.toBeInTheDocument();
    expect(screen.queryByText('简历只是辅助，重点仍然是项目和作品。')).not.toBeInTheDocument();
    expect(screen.queryByText('精选项目以作品集方式呈现，点击进入完整案例。')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '联系我' })).toBeInTheDocument();
    expect(screen.getByText('Generated by PageU')).toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: '模块区' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '发布网站' })).not.toBeInTheDocument();
  });

  it('renders /site/demo as a portfolio website with hero and featured projects', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = '陈一诺';
    createDraft.basicInfo.selfIntro = '我关注 AI 产品、用户洞察与商业创新，希望把技术理解转化为真实产品价值。';
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

    expect(screen.getByRole('link', { name: '陈一诺' })).toHaveAttribute('href', '#top');
    expect(screen.getAllByText('我关注 AI 产品、用户洞察与商业创新，希望把技术理解转化为真实产品价值。').length).toBeGreaterThan(0);
    const nav = screen.getByRole('navigation', { name: 'Portfolio navigation' });
    expect(nav).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: '简历' })).toHaveAttribute('href', '#resume');
    expect(within(nav).getByRole('link', { name: '项目' })).toHaveAttribute('href', '#featured-projects');
    expect(within(nav).getByRole('link', { name: '联系我' })).toHaveAttribute('href', '#contact');
    expect(within(nav).queryByRole('link', { name: '关于我' })).not.toBeInTheDocument();
    const resumeHeading = screen.getByRole('heading', { level: 2, name: '简历摘要' });
    const projectsHeading = screen.getByRole('heading', { level: 2, name: '精选项目' });
    expect(resumeHeading).toBeInTheDocument();
    expect(projectsHeading).toBeInTheDocument();
    expect(resumeHeading.compareDocumentPosition(projectsHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 2, name: 'Featured Projects' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Resume Snapshot' })).not.toBeInTheDocument();
    expect(screen.getAllByText('AI 简历优化项目').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: '查看项目' }).some((link) => link.getAttribute('href') === '/site/demo/project/project-1')).toBe(true);
  });

  it('renders a simplified hero with the latest uploaded profile photo from createDraft', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = '陈一诺';
    createDraft.basicInfo.school = '南山大学';
    createDraft.basicInfo.email = 'chen@example.com';
    createDraft.basicInfo.selfIntro = '我关注 AI 产品、用户洞察与商业创新，希望把技术理解转化为真实产品价值。';
    createDraft.basicInfo.photoPreviewUrl = 'data:image/png;base64,latest-avatar';
    createDraft.jobInfo.jd = 'AI 产品经理实习生，负责需求分析和产品落地。';
    createDraft.experiences = [
      {
        id: 'experience-ai',
        title: 'AI 简历优化项目',
        summary: '把求职经历转化为个人网站。',
        collapsed: false,
      },
    ];

    const staleSiteDraft = generateSiteDraft(createDraft);
    staleSiteDraft.profile.photoUrl = '';
    staleSiteDraft.profile.photoPreviewUrl = '';
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(createDraft));
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(staleSiteDraft));

    render(
      <MemoryRouter initialEntries={['/site/demo']}>
        <App />
      </MemoryRouter>,
    );

    const hero = screen.getByRole('region', { name: 'Portfolio hero' });
    expect(within(hero).queryByRole('heading', { level: 1, name: '陈一诺' })).not.toBeInTheDocument();
    expect(within(hero).queryByText('AI 产品经理实习生')).not.toBeInTheDocument();
    expect(within(hero).getByText('我关注 AI 产品、用户洞察与商业创新，希望把技术理解转化为真实产品价值。')).toBeInTheDocument();
    expect(within(hero).getByRole('img', { name: '陈一诺 的头像' })).toHaveAttribute('src', 'data:image/png;base64,latest-avatar');
    expect(within(hero).queryByText('南山大学')).not.toBeInTheDocument();
    expect(within(hero).queryByText('精选项目')).not.toBeInTheDocument();
    expect(within(hero).queryByText('AI 简历优化项目')).not.toBeInTheDocument();
    expect(within(hero).queryByText('chen@example.com')).not.toBeInTheDocument();
    expect(within(hero).queryByText('方向')).not.toBeInTheDocument();
  });

  it('renders the generated contact section with only phone and email', async () => {
    const user = userEvent.setup();
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = '陈一诺';
    createDraft.basicInfo.phone = '13800001111';
    createDraft.basicInfo.email = 'chen@example.com';
    createDraft.basicInfo.contact = '腾讯 PCG 校园 AI 产品创意大赛';
    createDraft.worksInfo.rawLinks = '作品链接 | https://example.com | 项目说明';
    createDraft.experiences = [
      {
        id: 'experience-ai',
        title: 'AI 简历优化项目',
        link: 'https://example.com/demo',
        collapsed: false,
      },
    ];
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(generateSiteDraft(createDraft)));

    render(
      <MemoryRouter initialEntries={['/site/demo']}>
        <App />
      </MemoryRouter>,
    );

    const contactSection = screen.getByRole('region', { name: 'Contact' });
    expect(within(contactSection).getByText('chen@example.com')).toBeInTheDocument();
    expect(within(contactSection).getByText('13800001111')).toBeInTheDocument();
    expect(within(contactSection).getByRole('button', { name: '复制邮箱' })).toBeInTheDocument();
    expect(within(contactSection).getByRole('button', { name: '复制手机号' })).toBeInTheDocument();
    expect(within(contactSection).queryByText('作品链接')).not.toBeInTheDocument();
    expect(within(contactSection).queryByText('腾讯 PCG 校园 AI 产品创意大赛')).not.toBeInTheDocument();
    expect(within(contactSection).queryByRole('link', { name: 'AI 简历优化项目' })).not.toBeInTheDocument();

    await user.click(within(contactSection).getByRole('button', { name: '复制邮箱' }));
    expect(screen.getByText('复制成功')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('复制成功')).not.toBeInTheDocument(), { timeout: 1500 });
  });

  it('opens a project detail page from the generated portfolio and returns to projects', async () => {
    const user = userEvent.setup();
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = '陈一诺';
    createDraft.experiences = [
      {
        id: 'experience-ai',
        title: 'AI 简历优化项目',
        role: '产品设计负责人',
        period: '2025.09 - 2025.12',
        summary: '把求职经历转化为个人网站。',
        description: '调研同学求职痛点。\n设计输入流程。\n完成可演示原型。',
        coverUrl: 'data:image/png;base64,project-cover',
        link: 'https://example.com/demo',
        collapsed: false,
      },
    ];
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(generateSiteDraft(createDraft)));

    render(
      <MemoryRouter initialEntries={['/site/demo']}>
        <App />
      </MemoryRouter>,
    );

    const projectLink = screen.getAllByRole('link', { name: '查看项目' }).find((link) => link.getAttribute('href') === '/site/demo/project/project-1');
    await user.click(projectLink);

    expect(screen.getByRole('main')).toHaveAttribute('data-animation', 'fade-up-500');
    expect(screen.getByRole('heading', { level: 1, name: 'AI 简历优化项目' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'AI 简历优化项目 封面' })).toHaveAttribute('src', 'data:image/png;base64,project-cover');
    expect(screen.getByText('项目概述')).toBeInTheDocument();
    expect(screen.queryByText('用户原始输入的项目经历')).not.toBeInTheDocument();
    const originalCopy = screen.getByTestId('project-original-experience');
    expect(originalCopy.textContent).toBe('调研同学求职痛点。\n设计输入流程。\n完成可演示原型。');
    expect(window.getComputedStyle(originalCopy).whiteSpace).toBe('pre-line');
    expect(screen.queryByText('项目背景')).not.toBeInTheDocument();
    expect(screen.queryByText('我的目标')).not.toBeInTheDocument();
    expect(screen.queryByText('我的行动')).not.toBeInTheDocument();
    expect(screen.queryByText('产出结果')).not.toBeInTheDocument();
    expect(screen.getByText('作品链接')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看作品' })).toHaveAttribute('href', 'https://example.com/demo');

    await user.click(screen.getByRole('link', { name: '返回项目' }));
    expect(screen.getByRole('heading', { level: 2, name: '精选项目' })).toBeInTheDocument();
  });

  it('does not show the project link section when a project has no link', () => {
    const createDraft = createInitialDraft();
    createDraft.experiences = [
      {
        id: 'experience-no-link',
        title: '无链接项目',
        summary: '这是一个没有外部链接的项目。',
        description: '项目背景：完成校园项目。我的目标：提升表达。我的行动：整理结构。产出结果：形成展示。',
        collapsed: false,
      },
    ];
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(generateSiteDraft(createDraft)));

    render(
      <MemoryRouter initialEntries={['/site/demo/project/project-1']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '无链接项目' })).toBeInTheDocument();
    expect(screen.queryByText('作品链接')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '查看作品' })).not.toBeInTheDocument();
  });

  it('renders a lightweight Resume Snapshot without expand controls', () => {
    const createDraft = createInitialDraft();
    createDraft.basicInfo.school = '南山大学';
    createDraft.basicInfo.major = '数字媒体技术';
    createDraft.skillsInfo.keywords = 'React、用户研究';
    createDraft.skillsInfo.certificates = '英语六级';
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(generateSiteDraft(createDraft)));

    render(
      <MemoryRouter initialEntries={['/site/demo']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 2, name: '简历摘要' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Resume Snapshot' })).not.toBeInTheDocument();
    expect(screen.queryByText('简历只是辅助，重点仍然是项目和作品。')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '展开完整简历' })).not.toBeInTheDocument();
    expect(screen.queryByText('完整时间轴')).not.toBeInTheDocument();
    expect(screen.getAllByText('南山大学').length).toBeGreaterThan(0);
    expect(screen.getAllByText('数字媒体技术').length).toBeGreaterThan(0);
    expect(screen.getAllByText('React').length).toBeGreaterThan(0);
    expect(screen.getAllByText('英语六级').length).toBeGreaterThan(0);
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

  it('publishes the generated site from the floating action and shows a share link with qr code', async () => {
    const user = userEvent.setup();
    const createDraft = createInitialDraft();
    createDraft.basicInfo.name = '发布用户';
    createDraft.basicInfo.selfIntro = '这是一段用于发布的个人介绍。';
    const siteDraft = generateSiteDraft(createDraft);
    localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(siteDraft));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        siteId: 'published-123',
        siteUrl: 'https://pageu-ai-career.netlify.app/site/published-123',
        publishedAt: '2026-06-14T10:00:00.000Z',
      }),
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock;

    try {
      render(
        <MemoryRouter initialEntries={['/site/demo']}>
          <App />
        </MemoryRouter>,
      );

      await user.click(screen.getByRole('button', { name: '上线发布' }));

      expect(fetchMock).toHaveBeenCalledWith(
        '/.netlify/functions/publish-site',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.siteDraft.profile.name).toBe('发布用户');

      expect(await screen.findByRole('dialog', { name: '发布成功' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'https://pageu-ai-career.netlify.app/site/published-123' })).toHaveAttribute(
        'href',
        'https://pageu-ai-career.netlify.app/site/published-123',
      );
      expect(await screen.findByRole('img', { name: '上线网站二维码' })).toBeInTheDocument();
      expect(JSON.parse(localStorage.getItem(PUBLISH_STORAGE_KEY))).toMatchObject({
        siteId: 'published-123',
        siteUrl: 'https://pageu-ai-career.netlify.app/site/published-123',
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('loads a published site draft by site id when local draft is unavailable', async () => {
    const remoteDraft = generateSiteDraft(createInitialDraft());
    remoteDraft.profile.name = '线上用户';
    remoteDraft.profile.selfIntro = '这是从线上读取的个人网站。';
    remoteDraft.hero.subtitle = '这是从线上读取的个人网站。';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ siteDraft: remoteDraft }),
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock;

    try {
      render(
        <MemoryRouter initialEntries={['/site/published-123']}>
          <App />
        </MemoryRouter>,
      );

      expect(fetchMock).toHaveBeenCalledWith('/.netlify/functions/get-site?id=published-123');
      expect(await screen.findByRole('link', { name: '线上用户' })).toBeInTheDocument();
      expect(screen.getByText('这是从线上读取的个人网站。')).toBeInTheDocument();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('published site service', () => {
  it('posts siteDraft to the Netlify publish function and returns a shareable result', async () => {
    const siteDraft = generateSiteDraft(createInitialDraft());
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        siteId: 'site-abc',
        siteUrl: 'https://pageu-ai-career.netlify.app/site/site-abc',
        publishedAt: '2026-06-14T10:00:00.000Z',
      }),
    });

    const result = await publishSiteDraft(siteDraft, { fetcher: fetchMock, origin: 'https://pageu-ai-career.netlify.app' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/.netlify/functions/publish-site',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      origin: 'https://pageu-ai-career.netlify.app',
      siteDraft,
    });
    expect(result).toMatchObject({
      siteId: 'site-abc',
      siteUrl: 'https://pageu-ai-career.netlify.app/site/site-abc',
      publishedAt: '2026-06-14T10:00:00.000Z',
    });
  });
});
