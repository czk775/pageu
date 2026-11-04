export const DRAFT_STORAGE_KEY = 'pageu:createDraft';

export const createInitialExperience = (index = 1) => ({
  id: `experience-${Date.now()}-${index}`,
  title: '',
  role: '',
  period: '',
  summary: '',
  description: '',
  coverName: '',
  coverUrl: '',
  link: '',
  collapsed: false,
});

export const createEmptyExperience = createInitialExperience;

export const createInitialDraft = () => ({
  basicInfo: {
    photoName: '',
    photoUrl: '',
    photoPreviewUrl: '',
    name: '',
    contact: '',
    phone: '',
    email: '',
    school: '',
    major: '',
    selfIntro: '',
    personalTagline: '',
  },
  aboutInfo: {
    interests: '',
    background: '',
    strengths: '',
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
      summary: '',
      description: '',
      coverName: '',
      coverUrl: '',
      link: '',
      collapsed: false,
    },
  ],
  stylePreference: '',
  template: 'resume',
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

  const legacyContact = String(draft.basicInfo?.contact || '').trim();
  const legacyEmail = legacyContact.includes('@') ? legacyContact : '';
  const legacyPhone = /^\+?[\d\s-]{6,}$/.test(legacyContact) ? legacyContact : '';
  const basicInfo = {
    ...initialDraft.basicInfo,
    ...draft.basicInfo,
  };

  if (!basicInfo.selfIntro && basicInfo.personalTagline) {
    basicInfo.selfIntro = basicInfo.personalTagline;
  }

  if (!basicInfo.email && legacyEmail) {
    basicInfo.email = legacyEmail;
  }

  if (!basicInfo.phone && legacyPhone) {
    basicInfo.phone = legacyPhone;
  }

  return {
    ...initialDraft,
    ...draft,
    basicInfo,
    jobInfo: {
      ...initialDraft.jobInfo,
      ...draft.jobInfo,
    },
    aboutInfo: {
      ...initialDraft.aboutInfo,
      ...draft.aboutInfo,
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
