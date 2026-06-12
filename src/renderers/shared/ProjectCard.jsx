import { Link, useInRouterContext } from 'react-router-dom';
import { AnimatedProjectArticle } from './PortfolioMotionContext';
import { getInitial, splitActionPoints } from './portfolioUtils';

export function ProjectCard({ project, featured = false, motionIndex = 0, tone = 'default', siteId = 'demo' }) {
  const projectPath = `/site/${siteId || 'demo'}/project/${project.id}`;
  const isInRouter = useInRouterContext();
  const ActionLink = isInRouter ? Link : 'a';
  const linkProps = isInRouter ? { to: projectPath } : { href: projectPath };

  return (
    <AnimatedProjectArticle
      className={`portfolio-project-card ${featured ? 'is-featured' : ''} portfolio-project-card-${tone}`}
      motionIndex={motionIndex}
    >
      <div className="portfolio-project-cover">
        {project.coverUrl ? (
          <img src={project.coverUrl} alt={`${project.title} 封面`} />
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
        <ul className="portfolio-project-bullets">
          {splitActionPoints(project).map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
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
