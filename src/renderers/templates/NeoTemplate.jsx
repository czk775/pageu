import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { ProjectsSection } from '../shared/ProjectsSection';
import { ResumeSnapshot } from '../shared/ResumeSnapshot';

export function NeoTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-neo">
      <HeroSection siteDraft={siteDraft} variant="neo" />
      <ResumeSnapshot siteDraft={siteDraft} variant="neo" />
      <ProjectsSection siteDraft={siteDraft} layout="neo" />
      <AboutSection siteDraft={siteDraft} framed />
      <ContactSection siteDraft={siteDraft} variant="neo" />
    </div>
  );
}
