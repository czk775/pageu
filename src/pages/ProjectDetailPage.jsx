import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { generateSiteDraft } from '../lib/draftGenerator';
import { loadSiteDraft } from '../lib/storage';
import { getInitial, getProjectFit, getProjectValue, splitActionPoints } from '../renderers/shared/portfolioUtils';
import { useCreateDraft } from '../state/CreateDraftContext';
import { createAnalysisResult } from '../types/analysisResult';

export function ProjectDetailPage() {
  const { id = 'demo', projectId } = useParams();
  const { createDraft } = useCreateDraft();
  const analysisResult = createAnalysisResult(createDraft);
  const generatedDraft = generateSiteDraft(createDraft, analysisResult);
  const siteDraft = loadSiteDraft(generatedDraft);
  const projects = siteDraft.projects || [];
  const project = projects.find((item) => item.id === projectId) || projects[0];
  const currentIndex = Math.max(projects.findIndex((item) => item.id === project?.id), 0);
  const nextProject = projects[(currentIndex + 1) % Math.max(projects.length, 1)];

  if (!project) {
    return (
      <main className="project-detail-page empty-detail-page" data-animation="fade-up-500">
        <Link className="project-detail-back" to={`/site/${id}#featured-projects`}>
          <ArrowLeft size={18} />
          返回项目
        </Link>
        <h1>项目还没有准备好</h1>
        <p>回到创建页补充经历后，这里会展示完整项目详情。</p>
      </main>
    );
  }

  return (
    <motion.main
      className={`project-detail-page template-${siteDraft.template}-site`}
      data-animation="fade-up-500"
      style={{
        '--generated-primary': siteDraft.theme?.primaryColor,
        '--generated-bg': siteDraft.theme?.background,
        '--generated-text': siteDraft.theme?.textColor,
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="project-detail-shell">
        <Link className="project-detail-back" to={`/site/${id}#featured-projects`}>
          <ArrowLeft size={18} />
          返回项目
        </Link>

        <section className="project-detail-hero">
          <div className="project-detail-cover">
            {project.coverUrl ? (
              <img src={project.coverUrl} alt={`${project.title} 封面`} />
            ) : (
              <div className="project-detail-cover-fallback" aria-hidden="true">
                {getInitial(project.title)}
              </div>
            )}
          </div>
          <div className="project-detail-heading">
            <p>{project.period || 'Portfolio Project'}</p>
            <h1>{project.title}</h1>
            <div className="project-detail-meta">
              <span>{project.role || '项目参与者'}</span>
              {(project.tags || []).slice(0, 5).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p className="project-detail-summary">{project.summary}</p>
            {project.externalLink ? (
              <a className="portfolio-link-button" href={project.externalLink} target="_blank" rel="noreferrer">
                项目链接
                <ExternalLink size={16} />
              </a>
            ) : null}
          </div>
        </section>

        <section className="project-detail-story">
          <article>
            <span>01</span>
            <h2>项目背景</h2>
            <p>{project.background || project.summary}</p>
          </article>
          <article>
            <span>02</span>
            <h2>我的目标</h2>
            <p>{project.goal || '把真实经历整理成招聘方容易理解的作品集案例。'}</p>
          </article>
          <article>
            <span>03</span>
            <h2>做了什么</h2>
            <ul>
              {splitActionPoints(project).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
          <article>
            <span>04</span>
            <h2>产出结果</h2>
            <p>{getProjectValue(project)}</p>
          </article>
          <article>
            <span>05</span>
            <h2>我学到了什么</h2>
            <p>{getProjectFit(project)}</p>
          </article>
        </section>

        <section className="project-detail-bottom">
          {nextProject ? (
            <Link className="project-next-link" to={`/site/${id}/project/${nextProject.id}`}>
              下一个项目
              <ArrowRight size={18} />
            </Link>
          ) : null}
          <a className="project-contact-link" href={`/site/${id}#contact`}>
            联系我
          </a>
        </section>
      </div>
    </motion.main>
  );
}
