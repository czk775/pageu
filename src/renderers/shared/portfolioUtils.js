export const getInitial = (name = '') => String(name || 'U').trim().slice(0, 1).toUpperCase() || 'U';

export const splitIntroParagraphs = (value = '') => {
  const text = String(value || '').trim();
  if (!text) {
    return [];
  }

  const manualParagraphs = text
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (manualParagraphs.length > 1) {
    return manualParagraphs;
  }

  const sentenceParagraphs = text.match(/[^。！？!?；;]+[。！？!?；;]?/g)?.map((item) => item.trim()).filter(Boolean) || [];
  return sentenceParagraphs.length > 1 ? sentenceParagraphs : [text];
};

export const splitActionPoints = (project) => {
  const source = Array.isArray(project.actions) && project.actions.length ? project.actions.join('。') : [project.action, project.background, project.summary].filter(Boolean).join('。');
  const points = source
    .split(/[。.!！?？；;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return points.length ? points.slice(0, 3) : ['梳理项目目标与关键场景', '推进方案设计与内容表达', '沉淀可展示的项目成果'];
};

export const ensureItems = (items = [], fallback = []) => (items.length ? items : fallback);
