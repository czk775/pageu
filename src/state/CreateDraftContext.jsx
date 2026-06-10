import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createEmptyExperience, createInitialDraft, DRAFT_STORAGE_KEY, normalizeDraft } from '../types/createDraft';

const CreateDraftContext = createContext(null);

const loadDraft = () => {
  if (typeof window === 'undefined') {
    return createInitialDraft();
  }

  try {
    const storedDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    return storedDraft ? normalizeDraft(JSON.parse(storedDraft)) : createInitialDraft();
  } catch {
    return createInitialDraft();
  }
};

export function CreateDraftProvider({ children }) {
  const [createDraft, setCreateDraft] = useState(loadDraft);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(createDraft));
  }, [createDraft]);

  const actions = useMemo(
    () => ({
      updateBasicInfo(field, value) {
        setCreateDraft((draft) => ({
          ...draft,
          basicInfo: {
            ...draft.basicInfo,
            [field]: value,
          },
          meta: {
            ...draft.meta,
            updatedAt: new Date().toISOString(),
          },
        }));
      },
      updateJobInfo(field, value) {
        setCreateDraft((draft) => ({
          ...draft,
          jobInfo: {
            ...draft.jobInfo,
            [field]: value,
          },
          meta: {
            ...draft.meta,
            updatedAt: new Date().toISOString(),
          },
        }));
      },
      updateSkillsInfo(field, value) {
        setCreateDraft((draft) => ({
          ...draft,
          skillsInfo: {
            ...draft.skillsInfo,
            [field]: value,
          },
          meta: {
            ...draft.meta,
            updatedAt: new Date().toISOString(),
          },
        }));
      },
      addExperience() {
        setCreateDraft((draft) => ({
          ...draft,
          experiences: [...draft.experiences, createEmptyExperience(draft.experiences.length + 1)],
          meta: {
            ...draft.meta,
            updatedAt: new Date().toISOString(),
          },
        }));
      },
      updateExperience(id, field, value) {
        setCreateDraft((draft) => ({
          ...draft,
          experiences: draft.experiences.map((experience) =>
            experience.id === id ? { ...experience, [field]: value } : experience,
          ),
          meta: {
            ...draft.meta,
            updatedAt: new Date().toISOString(),
          },
        }));
      },
      toggleExperience(id) {
        setCreateDraft((draft) => ({
          ...draft,
          experiences: draft.experiences.map((experience) =>
            experience.id === id ? { ...experience, collapsed: !experience.collapsed } : experience,
          ),
          meta: {
            ...draft.meta,
            updatedAt: new Date().toISOString(),
          },
        }));
      },
      deleteExperience(id) {
        setCreateDraft((draft) => {
          if (draft.experiences.length <= 1) {
            return draft;
          }

          return {
            ...draft,
            experiences: draft.experiences.filter((experience) => experience.id !== id),
            meta: {
              ...draft.meta,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },
      selectTemplate(template) {
        setCreateDraft((draft) => ({
          ...draft,
          template,
          meta: {
            ...draft.meta,
            updatedAt: new Date().toISOString(),
          },
        }));
      },
      resetDraft() {
        setCreateDraft(createInitialDraft());
      },
    }),
    [],
  );

  const value = useMemo(() => ({ createDraft, ...actions }), [actions, createDraft]);

  return <CreateDraftContext.Provider value={value}>{children}</CreateDraftContext.Provider>;
}

export function useCreateDraft() {
  const context = useContext(CreateDraftContext);

  if (!context) {
    throw new Error('useCreateDraft must be used within CreateDraftProvider');
  }

  return context;
}
