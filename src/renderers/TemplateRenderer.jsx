import { motion } from 'framer-motion';
import { templates } from '../data/templates';
import { normalizeSiteDraft } from '../types/siteDraft';
import { CanvasTemplate } from './templates/CanvasTemplate';
import { FlowTemplate } from './templates/FlowTemplate';
import { GlassTemplate } from './templates/GlassTemplate';
import { GridTemplate } from './templates/GridTemplate';
import { NeoTemplate } from './templates/NeoTemplate';
import { PureTemplate } from './templates/PureTemplate';
import { PortfolioMotionProvider, usePrefersReducedMotion } from './shared/PortfolioMotionContext';

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
  const prefersReducedMotion = usePrefersReducedMotion();
  const initial = prefersReducedMotion ? false : animationFor(mode, previewMode);
  const isPreview = mode === 'preview';
  const handlePointerMove = (event) => {
    if (isPreview || prefersReducedMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 28;
    const y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 20;
    event.currentTarget.style.setProperty('--pointer-shift-x', `${x.toFixed(1)}px`);
    event.currentTarget.style.setProperty('--pointer-shift-y', `${y.toFixed(1)}px`);
  };

  const handlePointerLeave = (event) => {
    if (isPreview) {
      return;
    }

    event.currentTarget.style.setProperty('--pointer-shift-x', '0px');
    event.currentTarget.style.setProperty('--pointer-shift-y', '0px');
  };

  return (
    <Surface
      className={[
        'generated-site',
        'portfolio-site',
        'portfolio-motion-ready',
        isPreview ? 'portfolio-preview-mode' : 'portfolio-site-mode',
        `template-${template}-site`,
        `portfolio-layout-${template}`,
        previewMode === 'mobile' ? 'generated-site-mobile' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-render-mode={mode}
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      data-template={template}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      style={{
        '--generated-primary': normalizedDraft.theme.primaryColor,
        '--generated-bg': normalizedDraft.theme.background,
        '--generated-text': normalizedDraft.theme.textColor,
        '--pointer-shift-x': '0px',
        '--pointer-shift-y': '0px',
      }}
    >
      <PortfolioMotionProvider mode={mode} reducedMotion={prefersReducedMotion}>
        <motion.div
          className="portfolio-motion-layer"
          initial={initial}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: isPreview ? 0.52 : 0.92, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className={isPreview ? 'portfolio-preview-scale' : 'portfolio-site-canvas'}>
            <Template siteDraft={normalizedDraft} />
          </div>
        </motion.div>
      </PortfolioMotionProvider>
    </Surface>
  );
}
