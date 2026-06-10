export const getInitial = (name = '') => String(name || 'U').trim().slice(0, 1).toUpperCase() || 'U';

export const getAboutCopy = (siteDraft) => {
  const profile = siteDraft.profile || {};
  const intro = profile.intro || siteDraft.hero?.subtitle || '';
  const schoolLine = [profile.school, profile.major].filter(Boolean).join(' / ');
  const roleLine = profile.targetRole ? `目标方向是 ${profile.targetRole}。` : '';
  const styleLine = siteDraft.stylePreference ? `希望网站传达 ${siteDraft.stylePreference} 的感觉。` : '';

  return [intro, schoolLine ? `${schoolLine} 背景。` : '', roleLine, styleLine].filter(Boolean).slice(0, 3);
};

export const splitActionPoints = (project) => {
  const source = [project.action, project.problem, project.summary].filter(Boolean).join('。');
  const points = source
    .split(/[。！？!?；;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return points.length
    ? points.slice(0, 3)
    : ['梳理项目目标与关键场景', '推进方案设计与内容表达', '沉淀可展示的项目成果'];
};

export const getProjectValue = (project) =>
  project.result || project.summary || '沉淀了可用于个人网站展示的项目素材。';

export const getProjectFit = (project) =>
  project.jdRelevance || '这段经历可以帮助展示与目标岗位相关的理解、表达和落地能力。';

export const ensureItems = (items = [], fallback = []) => (items.length ? items : fallback);
