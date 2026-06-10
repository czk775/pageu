export const SITE_DRAFT_STORAGE_KEY = 'pageu.siteDraft';

export const defaultSectionOrder = [
  'avatar',
  'intro',
  'experience',
  'project',
  'skills',
  'works',
  'contact',
];

export const sectionLabels = {
  avatar: '头像',
  intro: '个人介绍',
  experience: '经历',
  project: '项目',
  skills: '技能',
  works: '作品',
  contact: '联系方式',
};

export const createSection = (type, overrides = {}) => ({
  id: `section-${type}`,
  type,
  title: sectionLabels[type],
  visible: true,
  collapsed: false,
  items: [],
  content: '',
  ...overrides,
});

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

export const normalizeSiteDraft = (siteDraft) => {
  if (!siteDraft || typeof siteDraft !== 'object') {
    return null;
  }

  return {
    profile: {
      name: '',
      targetRole: '',
      headline: '',
      intro: '',
      contact: '',
      school: '',
      major: '',
      photoName: '',
      personalTagline: '',
      ...siteDraft.profile,
    },
    hero: {
      eyebrow: '',
      title: '',
      subtitle: '',
      primaryCta: '查看项目',
      secondaryCta: '联系我',
      ...siteDraft.hero,
    },
    highlights: normalizeArray(siteDraft.highlights),
    projects: normalizeArray(siteDraft.projects),
    experienceStory: normalizeArray(siteDraft.experienceStory),
    skills: normalizeArray(siteDraft.skills),
    certificates: normalizeArray(siteDraft.certificates),
    works: normalizeArray(siteDraft.works),
    contact: {
      email: '',
      phone: '',
      links: [],
      ...siteDraft.contact,
      links: normalizeArray(siteDraft.contact?.links),
    },
    sections: Array.isArray(siteDraft.sections)
      ? siteDraft.sections.map((section) => ({
          ...createSection(section.type || 'intro'),
          ...section,
        }))
      : defaultSectionOrder.map((type) => createSection(type)),
    theme: {
      primaryColor: '#22b9e9',
      background: '#f1fdff',
      textColor: '#12384c',
      ...siteDraft.theme,
    },
    template: siteDraft.template || 'neo',
    stylePreference: siteDraft.stylePreference || '',
    meta: {
      version: 1,
      updatedAt: null,
      ...siteDraft.meta,
    },
  };
};
