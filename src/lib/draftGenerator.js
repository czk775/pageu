import { createAnalysisResult } from '../types/analysisResult';
import { createSection, defaultSectionOrder } from '../types/siteDraft';

const fallbackSkills = ['产品思维', '技术理解', '表达能力', '执行力'];
const fallbackProjectTitle = '校园项目经历';

const clean = (value = '') => String(value || '').trim();

const cleanPreviewUrl = (value = '') => {
  if (typeof value !== 'string') {
    return '';
  }

  const url = value.trim();
  return /^(data:image\/|blob:|https?:\/\/)/i.test(url) ? url : '';
};

const splitListText = (value = '') =>
  clean(value)
    .split(/[、,，;；\n\r\t]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const splitSentences = (value = '') =>
  clean(value)
    .split(/[。.!！?？；;\n\r]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const unique = (items = []) => [...new Set(items.map((item) => clean(item)).filter(Boolean))];

const extractTargetRole = (jd = '') => {
  const firstPhrase = clean(jd)
    .split(/[，,。；;\n\r]/)
    .find(Boolean)
    ?.trim();
  return firstPhrase || '目标岗位';
};

const pickTags = (experience, analysisResult) =>
  unique([
    ...splitListText(experience.role),
    ...(analysisResult?.jobKeywords || []),
    ...(analysisResult?.abilityFocus || []),
  ]).slice(0, 5);

const buildProjectActions = (description) => {
  const points = splitSentences(description);
  if (points.length) {
    return points.slice(0, 3);
  }

  return ['梳理项目目标与用户场景', '推进方案设计与内容表达', '沉淀可展示的项目成果'];
};

const toProjects = (experiences = [], targetRole, analysisResult) => {
  const filled = experiences
    .map((experience) => ({
      id: experience.id,
      title: clean(experience.title),
      role: clean(experience.role),
      period: clean(experience.period),
      summary: clean(experience.summary),
      description: clean(experience.description),
      coverUrl: cleanPreviewUrl(experience.coverUrl),
      link: clean(experience.link),
    }))
    .filter((experience) => experience.title || experience.summary || experience.description || experience.link || experience.coverUrl);

  const source = filled.length
    ? filled
    : [
        {
          id: 'experience-default',
          title: fallbackProjectTitle,
          role: '项目参与者',
          period: '',
          summary: '把你的项目、比赛或校园实践整理成更适合展示的故事。',
          description: '',
          coverUrl: '',
          link: '',
        },
      ];

  return source.map((experience, index) => {
    const title = experience.title || `项目经历 ${index + 1}`;
    const role = experience.role || '项目参与者';
    const actions = buildProjectActions(experience.description);
    const summary = experience.summary || splitSentences(experience.description)[0] || `围绕「${title}」沉淀了一段完整的项目实践。`;

    return {
      id: `project-${index + 1}`,
      sourceExperienceId: experience.id,
      title,
      role,
      period: experience.period,
      summary,
      coverUrl: experience.coverUrl,
      externalLink: experience.link,
      link: experience.link,
      background: experience.description || `围绕 ${targetRole} 的真实场景，梳理项目背景、用户需求和关键问题。`,
      goal: `让项目目标、个人角色和产出价值被清晰地看见。`,
      actions,
      result: experience.description ? '形成了清晰的项目叙事、关键行动和可展示成果。' : '完成了项目经历的初步梳理。',
      jdRelevance: `这段经历体现了我对 ${targetRole} 所需能力的理解，也训练了沟通、拆解和落地能力。`,
      tags: pickTags(experience, analysisResult),
    };
  });
};

const toExperienceStory = (projects = []) =>
  projects.map((project) => ({
    title: project.title,
    period: project.period,
    description: project.summary,
    impact: project.result,
  }));

const toWorks = (createDraft, projects) => {
  const projectWorks = projects
    .filter((project) => project.externalLink)
    .map((project, index) => ({
      id: `project-work-${index + 1}`,
      title: project.title,
      url: project.externalLink,
      description: project.summary,
    }));

  return projectWorks;
};

const buildHighlights = (createDraft, analysisResult, projects, skills) => {
  const targetRole = extractTargetRole(createDraft?.jobInfo?.jd);
  const major = clean(createDraft?.basicInfo?.major);
  const highlighted = analysisResult?.highlightedExperiences?.[0] || projects[0]?.title || '项目经历';

  return [
    {
      label: '目标方向',
      value: analysisResult?.jobKeywords?.[0] || targetRole,
      description: `围绕 ${targetRole} 组织个人展示内容。`,
    },
    {
      label: '能力组合',
      value: skills.slice(0, 2).join(' / ') || '复合能力',
      description: major ? `${major}背景与项目表达结合。` : '把技能、项目和表达集中呈现。',
    },
    {
      label: '精选项目',
      value: highlighted,
      description: `优先展示 ${projects.length} 段项目/实践素材。`,
    },
  ];
};

const buildResumeSnapshot = (createDraft, projects, skills, certificates) => {
  const school = clean(createDraft?.basicInfo?.school);
  const major = clean(createDraft?.basicInfo?.major);
  const timeline = projects.map((project) => ({
    id: `${project.id}-timeline`,
    title: project.title,
    period: project.period || '项目经历',
    description: project.summary,
  }));

  return {
    school,
    major,
    skills,
    certificates,
    timeline,
  };
};

const buildTheme = (template = 'neo') => {
  const themeMap = {
    neo: { primaryColor: '#22b9e9', background: '#eefbff', textColor: '#12384c' },
    pure: { primaryColor: '#111111', background: '#fbfbf7', textColor: '#151515' },
    flow: { primaryColor: '#8d7cf6', background: '#fff8f4', textColor: '#2f2748' },
    grid: { primaryColor: '#2563eb', background: '#f8fafc', textColor: '#0f172a' },
    canvas: { primaryColor: '#ff7a59', background: '#fff4df', textColor: '#25150f' },
    glass: { primaryColor: '#20c7d8', background: '#f1fdff', textColor: '#12384c' },
  };

  return themeMap[template] || themeMap.neo;
};

export const generateSiteDraft = (createDraft, analysisResult = createAnalysisResult(createDraft)) => {
  const name = clean(createDraft?.basicInfo?.name) || 'PageU 同学';
  const major = clean(createDraft?.basicInfo?.major);
  const school = clean(createDraft?.basicInfo?.school);
  const personalTagline = clean(createDraft?.basicInfo?.personalTagline);
  const targetRole = extractTargetRole(createDraft?.jobInfo?.jd);
  const motivation = clean(createDraft?.jobInfo?.motivation);
  const template = createDraft?.template || 'neo';
  const skills = unique([
    ...splitListText(createDraft?.skillsInfo?.keywords),
    ...(analysisResult?.abilityFocus?.length ? analysisResult.abilityFocus : fallbackSkills),
  ]).slice(0, 10);
  const certificates = unique(splitListText(createDraft?.skillsInfo?.certificates));
  const projects = toProjects(createDraft?.experiences, targetRole, analysisResult);
  const works = toWorks(createDraft, projects);
  const experienceStory = toExperienceStory(projects);
  const intro =
    motivation ||
    personalTagline ||
    (major ? `${major}背景，正在面向 ${targetRole} 打造个人网站。` : `正在面向 ${targetRole} 打造个人网站。`);
  const highlights = buildHighlights(createDraft, analysisResult, projects, skills);
  const legacyContact = clean(createDraft?.basicInfo?.contact);
  const phone = clean(createDraft?.basicInfo?.phone) || (/^\+?[\d\s-]{6,}$/.test(legacyContact) ? legacyContact : '');
  const email = clean(createDraft?.basicInfo?.email) || (legacyContact.includes('@') ? legacyContact : '');
  const photoPreviewUrl = clean(createDraft?.basicInfo?.photoPreviewUrl);
  const resumeSnapshot = buildResumeSnapshot(createDraft, projects, skills, certificates);

  const sectionMap = {
    avatar: createSection('avatar', {
      content: photoPreviewUrl || createDraft?.basicInfo?.photoName || '',
    }),
    intro: createSection('intro', {
      content: intro,
    }),
    experience: createSection('experience', {
      items: experienceStory.map((story, index) => ({
        id: `experience-item-${index + 1}`,
        title: story.title,
        description: story.description,
      })),
    }),
    project: createSection('project', {
      items: projects.map((project) => ({
        id: project.id,
        title: project.title,
        description: project.summary,
        link: project.externalLink,
        coverUrl: project.coverUrl,
      })),
    }),
    skills: createSection('skills', {
      items: [...skills, ...certificates].map((skill, index) => ({
        id: `skill-${index + 1}`,
        title: skill,
      })),
    }),
    works: createSection('works', {
      items: works.map((work, index) => ({
        id: work.id || `work-${index + 1}`,
        title: work.title,
        description: work.description,
        url: work.url,
      })),
    }),
    contact: createSection('contact', {
      content: [email, phone].filter(Boolean).join(' / '),
    }),
  };

  return {
    profile: {
      name,
      targetRole,
      headline: personalTagline || `${name}的个人主页`,
      intro,
      contact: sectionMap.contact.content,
      phone,
      email,
      school,
      major,
      photoName: createDraft?.basicInfo?.photoName || '',
      photoPreviewUrl,
      personalTagline,
    },
    hero: {
      eyebrow: major ? `${major}背景｜${targetRole}` : `个人主页｜${targetRole}`,
      title: name,
      subtitle: personalTagline || intro,
      primaryCta: '查看项目',
      secondaryCta: '联系我',
    },
    highlights,
    projects,
    experienceStory,
    skills,
    certificates,
    works,
    resumeSnapshot,
    contact: {
      email,
      phone,
      raw: sectionMap.contact.content,
      links: [],
    },
    sections: defaultSectionOrder.map((type) => sectionMap[type]),
    theme: buildTheme(template),
    template,
    stylePreference: createDraft?.stylePreference || '',
    meta: {
      version: 3,
      updatedAt: new Date().toISOString(),
    },
  };
};
