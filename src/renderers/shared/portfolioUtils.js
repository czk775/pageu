export const getInitial = (name = '') => String(name || 'U').trim().slice(0, 1).toUpperCase() || 'U';

export const getAboutCopy = (siteDraft) => {
  const profile = siteDraft.profile || {};
  const schoolLine = [profile.school, profile.major].filter(Boolean).join(' / ');
  const skills = (siteDraft.skills || []).slice(0, 3).join('、');
  const roleLine = profile.targetRole ? `目标方向：${profile.targetRole}。` : '';
  const identityLine = schoolLine ? `${schoolLine} 背景。` : '';
  const skillLine = skills ? `关注 ${skills} 等能力在项目中的真实落地。` : '';

  return [identityLine, roleLine, skillLine].filter(Boolean).slice(0, 3);
};

export const splitActionPoints = (project) => {
  const source = Array.isArray(project.actions) && project.actions.length ? project.actions.join('。') : [project.action, project.background, project.summary].filter(Boolean).join('。');
  const points = source
    .split(/[。.!！?？；;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return points.length ? points.slice(0, 3) : ['梳理项目目标与关键场景', '推进方案设计与内容表达', '沉淀可展示的项目成果'];
};

export const getProjectValue = (project) => project.result || project.summary || '形成了清晰的过程记录和可展示成果。';

export const getProjectFit = (project) =>
  project.jdRelevance || '这个项目让我更熟悉从问题拆解、方案推进到结果表达的完整过程。';

export const ensureItems = (items = [], fallback = []) => (items.length ? items : fallback);
