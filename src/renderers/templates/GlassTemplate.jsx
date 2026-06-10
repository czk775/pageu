import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { HighlightsStrip } from '../shared/HighlightsStrip';
import { ProjectsSection } from '../shared/ProjectsSection';
import { SkillPills } from '../shared/SkillPills';
import { WorksLinks } from '../shared/WorksLinks';

export function GlassTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-glass">
      <HeroSection siteDraft={siteDraft} variant="glass" />
      <HighlightsStrip items={siteDraft.highlights} variant="glass" />
      <AboutSection siteDraft={siteDraft} framed />
      <ProjectsSection projects={siteDraft.projects} layout="glass" />
      <WorksLinks works={siteDraft.works} variant="glass" />
      <SkillPills certificates={siteDraft.certificates} skills={siteDraft.skills} variant="glass" />
      <ContactSection siteDraft={siteDraft} variant="glass" />
    </div>
  );
}
