import { ProjectCard } from './ProjectCard';

export function ProjectsSection({ siteDraft, layout = 'showcase', title = 'Featured Projects' }) {
  const projects = siteDraft.projects || [];
  const siteId = siteDraft.meta?.siteId || 'demo';
  const [featuredProject, ...restProjects] = projects;

  return (
    <section id="featured-projects" className={`portfolio-projects-section portfolio-projects-${layout}`}>
      <p className="portfolio-section-eyebrow">Projects</p>
      <div className="portfolio-section-heading">
        <h2>{title}</h2>
        <span>精选项目以作品集方式呈现，点击进入完整案例。</span>
      </div>
      {featuredProject ? (
        <div className="portfolio-featured-project">
          <ProjectCard featured project={featuredProject} siteId={siteId} tone={layout} />
        </div>
      ) : null}
      {restProjects.length ? (
        <div className="portfolio-projects-masonry">
          {restProjects.map((project) => (
            <ProjectCard key={project.id || project.title} project={project} siteId={siteId} tone={layout} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
