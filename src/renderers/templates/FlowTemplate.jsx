import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { HighlightsStrip } from '../shared/HighlightsStrip';
import { ProjectsSection } from '../shared/ProjectsSection';
import { SkillPills } from '../shared/SkillPills';
import { WorksLinks } from '../shared/WorksLinks';

export function FlowTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-flow">
      <div className="portfolio-flow-intro">
        <HeroSection siteDraft={siteDraft} variant="flow" />
        <AboutSection siteDraft={siteDraft} framed />
      </div>
      <ProjectsSection projects={siteDraft.projects} layout="flow" title="Stories & Projects" />
      <HighlightsStrip items={siteDraft.highlights} variant="flow" />
      <WorksLinks works={siteDraft.works} variant="flow" />
      <SkillPills certificates={siteDraft.certificates} skills={siteDraft.skills} variant="flow" />
      <ContactSection siteDraft={siteDraft} variant="flow" />
    </div>
  );
}
