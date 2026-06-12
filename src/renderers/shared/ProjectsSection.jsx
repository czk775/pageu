import { ProjectCard } from './ProjectCard';
import { AnimatedSection } from './PortfolioMotionContext';

export function ProjectsSection({ siteDraft, layout = 'showcase', title = '精选项目' }) {
  const projects = siteDraft.projects || [];
  const siteId = siteDraft.meta?.siteId || 'demo';
  const [featuredProject, ...restProjects] = projects;

  return (
    <AnimatedSection id="featured-projects" motionKey="projects" className={`portfolio-projects-section portfolio-projects-${layout}`} delay={0.06}>
      <p className="portfolio-section-eyebrow">Projects</p>
      <div className="portfolio-section-heading">
        <h2>{title}</h2>
      </div>
      {featuredProject ? (
        <div className="portfolio-featured-project">
          <ProjectCard featured motionIndex={0} project={featuredProject} siteId={siteId} tone={layout} />
        </div>
      ) : null}
      {restProjects.length ? (
        <div className="portfolio-projects-masonry">
          {restProjects.map((project, index) => (
            <ProjectCard key={project.id || project.title} motionIndex={index + 1} project={project} siteId={siteId} tone={layout} />
          ))}
        </div>
      ) : null}
    </AnimatedSection>
  );
}
