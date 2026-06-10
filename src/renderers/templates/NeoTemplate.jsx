import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { HighlightsStrip } from '../shared/HighlightsStrip';
import { ProjectsSection } from '../shared/ProjectsSection';
import { SkillPills } from '../shared/SkillPills';
import { WorksLinks } from '../shared/WorksLinks';

export function NeoTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-neo">
      <HeroSection siteDraft={siteDraft} variant="neo" />
      <HighlightsStrip items={siteDraft.highlights} variant="neo" />
      <AboutSection siteDraft={siteDraft} framed />
      <ProjectsSection projects={siteDraft.projects} layout="neo" />
      <SkillPills certificates={siteDraft.certificates} skills={siteDraft.skills} variant="neo" />
      <WorksLinks works={siteDraft.works} variant="neo" />
      <ContactSection siteDraft={siteDraft} variant="neo" />
    </div>
  );
}
