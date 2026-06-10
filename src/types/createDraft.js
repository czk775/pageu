export const DRAFT_STORAGE_KEY = 'pageu:createDraft';

export const createEmptyExperience = (index = 1) => ({
  id: `experience-${Date.now()}-${index}`,
  title: '',
  description: '',
  collapsed: false,
});

export const createInitialDraft = () => ({
  basicInfo: {
    photoName: '',
    name: '',
    contact: '',
    school: '',
    major: '',
  },
  jobInfo: {
    jd: '',
    company: '',
    jobType: '',
  },
  skillsInfo: {
    keywords: '',
    certificates: '',
  },
  experiences: [
    {
      id: 'experience-1',
      title: '',
      description: '',
      collapsed: false,
    },
  ],
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
