export const DRAFT_STORAGE_KEY = 'pageu:createDraft';

export const createEmptyExperience = (index = 1) => ({
  id: `experience-${Date.now()}-${index}`,
  title: '',
  role: '',
  period: '',
  description: '',
  link: '',
  collapsed: false,
});

export const createInitialDraft = () => ({
  basicInfo: {
    photoName: '',
    name: '',
    contact: '',
    school: '',
    major: '',
    personalTagline: '',
  },
  jobInfo: {
    jd: '',
    company: '',
    jobType: '',
    motivation: '',
  },
  skillsInfo: {
    keywords: '',
    certificates: '',
  },
  worksInfo: {
    rawLinks: '',
  },
  experiences: [
    {
      id: 'experience-1',
      title: '',
      role: '',
      period: '',
      description: '',
      link: '',
      collapsed: false,
    },
  ],
  stylePreference: '',
  template: 'neo',
  meta: {
    version: 1,
    updatedAt: null,
  },
});

export const normalizeDraft = (draft) => {
  const initialDraft = createInitialDraft();

  if (!draft || typeof draft !== 'object') {
    return initialDraft;
  }

  return {
    ...initialDraft,
    ...draft,
    basicInfo: {
      ...initialDraft.basicInfo,
      ...draft.basicInfo,
    },
    jobInfo: {
      ...initialDraft.jobInfo,
      ...draft.jobInfo,
    },
    skillsInfo: {
      ...initialDraft.skillsInfo,
      ...draft.skillsInfo,
    },
    worksInfo: {
      ...initialDraft.worksInfo,
      ...draft.worksInfo,
    },
    experiences:
      Array.isArray(draft.experiences) && draft.experiences.length > 0
        ? draft.experiences.map((experience, index) => ({
            ...createEmptyExperience(index + 1),
            ...experience,
            id: experience.id || `experience-${index + 1}`,
          }))
        : initialDraft.experiences,
    meta: {
      ...initialDraft.meta,
      ...draft.meta,
    },
  };
};
