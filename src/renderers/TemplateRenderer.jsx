import { motion } from 'framer-motion';
import { templates } from '../data/templates';
import { normalizeSiteDraft } from '../types/siteDraft';
import { CanvasTemplate } from './templates/CanvasTemplate';
import { FlowTemplate } from './templates/FlowTemplate';
import { GlassTemplate } from './templates/GlassTemplate';
import { GridTemplate } from './templates/GridTemplate';
import { NeoTemplate } from './templates/NeoTemplate';
import { PureTemplate } from './templates/PureTemplate';

const templateIds = new Set(templates.map((template) => template.id));

const templateMap = {
  neo: NeoTemplate,
  pure: PureTemplate,
  flow: FlowTemplate,
  grid: GridTemplate,
  canvas: CanvasTemplate,
  glass: GlassTemplate,
};

const animationFor = (mode, previewMode) => {
  if (mode === 'preview') {
    return previewMode === 'mobile' ? { opacity: 0, y: 8 } : { opacity: 0, y: 12 };
  }

  return { opacity: 0, y: 22 };
};

export function TemplateRenderer({
  siteDraft,
  as: Surface = 'article',
  mode = 'site',
  previewMode = 'desktop',
  className = '',
}) {
  const normalizedDraft = normalizeSiteDraft(siteDraft);
  const template = templateIds.has(normalizedDraft.template) ? normalizedDraft.template : 'neo';
  const Template = templateMap[template] || NeoTemplate;
  const initial = animationFor(mode, previewMode);
  const isPreview = mode === 'preview';

  return (
    <Surface
      className={[
        'generated-site',
        'portfolio-site',
        isPreview ? 'portfolio-preview-mode' : 'portfolio-site-mode',
        `template-${template}-site`,
        `portfolio-layout-${template}`,
        previewMode === 'mobile' ? 'generated-site-mobile' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-render-mode={mode}
      data-template={template}
      style={{
        '--generated-primary': normalizedDraft.theme.primaryColor,
        '--generated-bg': normalizedDraft.theme.background,
        '--generated-text': normalizedDraft.theme.textColor,
      }}
    >
      <motion.div
        className={isPreview ? 'portfolio-preview-scale' : 'portfolio-site-canvas'}
        initial={initial}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.46 }}
      >
        <Template siteDraft={normalizedDraft} />
      </motion.div>
    </Surface>
  );
}
