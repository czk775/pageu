import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { ProjectsSection } from '../shared/ProjectsSection';
import { ResumeSnapshot } from '../shared/ResumeSnapshot';

export function GridTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-grid">
      <HeroSection siteDraft={siteDraft} variant="grid" />
      <div className="portfolio-bento-row">
        <AboutSection siteDraft={siteDraft} framed />
        <ResumeSnapshot siteDraft={siteDraft} variant="grid" />
      </div>
      <ProjectsSection siteDraft={siteDraft} layout="grid" />
      <ContactSection siteDraft={siteDraft} variant="grid" />
    </div>
  );
}
