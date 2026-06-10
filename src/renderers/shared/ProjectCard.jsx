import { getProjectFit, getProjectValue, splitActionPoints } from './portfolioUtils';

export function ProjectCard({ project, featured = false, tone = 'default' }) {
  const actionPoints = splitActionPoints(project);

  return (
    <article className={`portfolio-project-case ${featured ? 'is-featured' : ''} portfolio-project-case-${tone}`}>
      <div className="portfolio-project-meta">
        <span>{project.period || 'Project'}</span>
        <strong>{project.role || '项目参与者'}</strong>
      </div>
      <div className="portfolio-project-body">
        <h3>{project.title}</h3>
        <p className="portfolio-project-summary">{project.summary}</p>

        <div className="portfolio-project-narrative">
          <div>
            <h4>我做了什么</h4>
            <ul>
              {actionPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>产出与价值</h4>
            <p>{getProjectValue(project)}</p>
          </div>
          <div>
            <h4>岗位关联</h4>
            <p>{getProjectFit(project)}</p>
          </div>
        </div>

        <div className="portfolio-tags">
          {(project.tags || []).slice(0, 6).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        {project.link ? (
          <a className="portfolio-link-button" href={project.link} target="_blank" rel="noreferrer">
            查看项目
          </a>
        ) : null}
      </div>
    </article>
  );
}
