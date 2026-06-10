import { createAnalysisResult } from '../types/analysisResult';
import { createSection, defaultSectionOrder } from '../types/siteDraft';

const fallbackSkills = ['产品思维', 'React 开发', '沟通协作', '项目落地'];
const fallbackWorks = ['个人网站作品集', '校园项目展示'];

const splitListText = (value = '') =>
  value
    .split(/[，,、；;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const extractTargetRole = (jd = '') => {
  const firstPhrase = jd.split(/[，,。.；;\n]/).find(Boolean)?.trim();
  return firstPhrase || '目标岗位';
};

const toExperienceItems = (experiences = []) => {
  const filled = experiences
    .map((experience) => ({
      title: experience.title?.trim(),
      description: experience.description?.trim(),
    }))
    .filter((experience) => experience.title || experience.description);

  return filled.length > 0
    ? filled.map((experience, index) => ({
        id: `experience-item-${index + 1}`,
        title: experience.title || `经历${index + 1}`,
        description: experience.description || '这段经历值得被看见。',
      }))
    : [
        {
          id: 'experience-item-default',
          title: '校园项目经历',
          description: '把你的项目、比赛或校园实践整理成更适合展示的故事。',
        },
      ];
};

export const generateSiteDraft = (createDraft, analysisResult = createAnalysisResult(createDraft)) => {
  const name = createDraft?.basicInfo?.name?.trim() || 'PageU 同学';
  const major = createDraft?.basicInfo?.major?.trim();
  const targetRole = extractTargetRole(createDraft?.jobInfo?.jd);
  const experienceItems = toExperienceItems(createDraft?.experiences);
  const enteredSkills = splitListText(createDraft?.skillsInfo?.keywords);
  const certificates = splitListText(createDraft?.skillsInfo?.certificates);
  const skills = [
    ...enteredSkills,
    ...(analysisResult?.abilityFocus?.length ? analysisResult.abilityFocus : fallbackSkills),
    ...certificates,
  ].slice(0, 8);

  const sectionMap = {
    avatar: createSection('avatar', {
      content: createDraft?.basicInfo?.photoName || '',
    }),
    intro: createSection('intro', {
      content: major ? `${major}背景，正在面向${targetRole}打造个人展示。` : `正在面向${targetRole}打造个人展示。`,
    }),
    experience: createSection('experience', {
      items: experienceItems,
    }),
    project: createSection('project', {
      items: experienceItems.slice(0, 2),
    }),
    skills: createSection('skills', {
      items: skills.map((skill, index) => ({
        id: `skill-${index + 1}`,
        title: skill,
      })),
    }),
    works: createSection('works', {
      items: fallbackWorks.map((work, index) => ({
        id: `work-${index + 1}`,
        title: work,
      })),
    }),
    contact: createSection('contact', {
      content: createDraft?.basicInfo?.contact || '留下联系方式，让机会找到你。',
    }),
  };

  return {
    profile: {
      name,
      targetRole,
      headline: `${name}的个人主页`,
      intro: sectionMap.intro.content,
      contact: sectionMap.contact.content,
    },
    sections: defaultSectionOrder.map((type) => sectionMap[type]),
    theme: {
      primaryColor: '#22b9e9',
      background: '#f1fdff',
      textColor: '#12384c',
    },
    template: createDraft?.template || 'neo',
    meta: {
      version: 1,
      updatedAt: new Date().toISOString(),
    },
  };
};
