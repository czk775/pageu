import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { ProjectsSection } from '../shared/ProjectsSection';
import { ResumeSnapshot } from '../shared/ResumeSnapshot';

export function NeoTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-neo">
      <HeroSection siteDraft={siteDraft} variant="neo" />
      <AboutSection siteDraft={siteDraft} framed />
      <ProjectsSection siteDraft={siteDraft} layout="neo" />
      <ResumeSnapshot siteDraft={siteDraft} variant="neo" />
      <ContactSection siteDraft={siteDraft} variant="neo" />
    </div>
  );
}
