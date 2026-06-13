import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { ProjectsSection } from '../shared/ProjectsSection';
import { ResumeSnapshot } from '../shared/ResumeSnapshot';

export function FlowTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-flow">
      <div className="portfolio-flow-intro">
        <HeroSection siteDraft={siteDraft} variant="flow" />
      </div>
      <AboutSection siteDraft={siteDraft} framed />
      <ResumeSnapshot siteDraft={siteDraft} variant="flow" />
      <ProjectsSection siteDraft={siteDraft} layout="flow" />
      <ContactSection siteDraft={siteDraft} variant="flow" />
    </div>
  );
}
