import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { ProjectsSection } from '../shared/ProjectsSection';
import { ResumeSnapshot } from '../shared/ResumeSnapshot';

export function CanvasTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-canvas">
      <HeroSection siteDraft={siteDraft} variant="canvas" />
      <div className="portfolio-canvas-board">
        <ResumeSnapshot siteDraft={siteDraft} variant="canvas" />
      </div>
      <ProjectsSection siteDraft={siteDraft} layout="canvas" />
      <AboutSection siteDraft={siteDraft} framed />
      <ContactSection siteDraft={siteDraft} variant="canvas" />
    </div>
  );
}
