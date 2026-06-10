import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { HighlightsStrip } from '../shared/HighlightsStrip';
import { ProjectsSection } from '../shared/ProjectsSection';
import { SkillPills } from '../shared/SkillPills';
import { WorksLinks } from '../shared/WorksLinks';

export function CanvasTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-canvas">
      <HeroSection siteDraft={siteDraft} variant="canvas" />
      <WorksLinks works={siteDraft.works} variant="canvas" />
      <ProjectsSection projects={siteDraft.projects} layout="canvas" title="Selected Exhibits" />
      <div className="portfolio-canvas-board">
        <AboutSection siteDraft={siteDraft} framed />
        <HighlightsStrip items={siteDraft.highlights} variant="canvas" />
        <SkillPills certificates={siteDraft.certificates} skills={siteDraft.skills} variant="canvas" />
      </div>
      <ContactSection siteDraft={siteDraft} variant="canvas" />
    </div>
  );
}
