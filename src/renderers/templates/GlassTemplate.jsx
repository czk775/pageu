import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { ProjectsSection } from '../shared/ProjectsSection';
import { ResumeSnapshot } from '../shared/ResumeSnapshot';

export function GlassTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-glass">
      <HeroSection siteDraft={siteDraft} variant="glass" />
      <AboutSection siteDraft={siteDraft} framed />
      <ResumeSnapshot siteDraft={siteDraft} variant="glass" />
      <ProjectsSection siteDraft={siteDraft} layout="glass" />
      <ContactSection siteDraft={siteDraft} variant="glass" />
    </div>
  );
}
