import { motion } from 'framer-motion';
import { templates } from '../data/templates';
import { normalizeSiteDraft } from '../types/siteDraft';
import { ResumeTemplate } from './templates/ResumeTemplate';
import { DeveloperTemplate } from './templates/DeveloperTemplate';
import { CaseTemplate } from './templates/CaseTemplate';
import { CinematicTemplate } from './templates/CinematicTemplate';
import { PortfolioMotionProvider, usePrefersReducedMotion } from './shared/PortfolioMotionContext';

const templateIds = new Set(templates.map((template) => template.id));

const templateMap = {
  resume: ResumeTemplate,
  developer: DeveloperTemplate,
  case: CaseTemplate,
  cinematic: CinematicTemplate,
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
  const template = templateIds.has(normalizedDraft.template) ? normalizedDraft.template : 'resume';
  const Template = templateMap[template] || ResumeTemplate;
  const prefersReducedMotion = usePrefersReducedMotion();
  const initial = prefersReducedMotion ? false : animationFor(mode, previewMode);
  const isPreview = mode === 'preview';

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
