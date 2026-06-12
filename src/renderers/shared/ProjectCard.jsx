import { useEffect, useState } from 'react';
import { Link, useInRouterContext } from 'react-router-dom';
import { AnimatedProjectArticle } from './PortfolioMotionContext';
import { getInitial } from './portfolioUtils';

export function ProjectCard({ project, featured = false, motionIndex = 0, tone = 'default', siteId = 'demo' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const projectPath = `/site/${siteId || 'demo'}/project/${project.id}`;
  const isInRouter = useInRouterContext();
  const ActionLink = isInRouter ? Link : 'a';
  const linkProps = isInRouter ? { to: projectPath } : { href: projectPath };
  const shouldShowImage = Boolean(project.coverUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [project.coverUrl]);

  return (
    <AnimatedProjectArticle
      className={`portfolio-project-card ${featured ? 'is-featured' : ''} portfolio-project-card-${tone}`}
      motionIndex={motionIndex}
    >
      <div className="portfolio-project-cover">
        {shouldShowImage ? (
          <img src={project.coverUrl} alt={`${project.title} 封面`} onError={() => setImageFailed(true)} />
        ) : (
          <div className="portfolio-project-cover-placeholder" aria-hidden="true">
            {getInitial(project.title)}
          </div>
        )}
      </div>
      <div className="portfolio-project-card-body">
        <div className="portfolio-project-meta">
          <span>{project.period || 'Project'}</span>
          <strong>{project.role || '项目参与者'}</strong>
        </div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="portfolio-tags">
          {(project.tags || []).slice(0, 5).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <ActionLink aria-label="查看项目" className="portfolio-link-button portfolio-project-hover-link" {...linkProps}>
          <span>查看项目 →</span>
        </ActionLink>
      </div>
    </AnimatedProjectArticle>
  );
}
