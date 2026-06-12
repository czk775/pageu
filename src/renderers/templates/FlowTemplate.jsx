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
        <AboutSection siteDraft={siteDraft} framed />
      </div>
      <ProjectsSection siteDraft={siteDraft} layout="flow" title="Stories & Projects" />
      <ResumeSnapshot siteDraft={siteDraft} variant="flow" />
      <ContactSection siteDraft={siteDraft} variant="flow" />
    </div>
  );
}
