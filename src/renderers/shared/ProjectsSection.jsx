import { ProjectCard } from './ProjectCard';

export function ProjectsSection({ projects = [], layout = 'showcase', title = 'Featured Projects' }) {
  return (
    <section id="featured-projects" className={`portfolio-projects-section portfolio-projects-${layout}`}>
      <p className="portfolio-section-eyebrow">Projects</p>
      <div className="portfolio-section-heading">
        <h2>{title}</h2>
        <span>案例式展示，而不是简历条目</span>
      </div>
      <div className="portfolio-projects-grid">
        {projects.map((project, index) => (
          <ProjectCard featured={index === 0} key={project.id || project.title} project={project} tone={layout} />
        ))}
      </div>
    </section>
  );
}
