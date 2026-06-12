import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { ProjectsSection } from '../shared/ProjectsSection';
import { ResumeSnapshot } from '../shared/ResumeSnapshot';

export function CanvasTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-canvas">
      <HeroSection siteDraft={siteDraft} variant="canvas" />
      <ProjectsSection siteDraft={siteDraft} layout="canvas" title="Selected Exhibits" />
      <div className="portfolio-canvas-board">
        <AboutSection siteDraft={siteDraft} framed />
        <ResumeSnapshot siteDraft={siteDraft} variant="canvas" />
      </div>
      <ContactSection siteDraft={siteDraft} variant="canvas" />
    </div>
  );
}
