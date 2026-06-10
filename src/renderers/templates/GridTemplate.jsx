import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { HighlightsStrip } from '../shared/HighlightsStrip';
import { ProjectsSection } from '../shared/ProjectsSection';
import { SkillPills } from '../shared/SkillPills';
import { WorksLinks } from '../shared/WorksLinks';

export function GridTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-grid">
      <HeroSection siteDraft={siteDraft} variant="grid" />
      <div className="portfolio-bento-row">
        <AboutSection siteDraft={siteDraft} framed />
        <HighlightsStrip items={siteDraft.highlights} variant="grid" />
      </div>
      <ProjectsSection projects={siteDraft.projects} layout="grid" />
      <div className="portfolio-bento-row compact">
        <SkillPills certificates={siteDraft.certificates} skills={siteDraft.skills} variant="grid" />
        <WorksLinks works={siteDraft.works} variant="grid" />
      </div>
      <ContactSection siteDraft={siteDraft} variant="grid" />
    </div>
  );
}
