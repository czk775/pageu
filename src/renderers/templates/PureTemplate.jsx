import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { ProjectsSection } from '../shared/ProjectsSection';
import { SkillPills } from '../shared/SkillPills';
import { WorksLinks } from '../shared/WorksLinks';

export function PureTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-pure">
      <HeroSection siteDraft={siteDraft} variant="pure" />
      <AboutSection siteDraft={siteDraft} />
      <ProjectsSection projects={siteDraft.projects} layout="pure" title="Case Studies" />
      <SkillPills certificates={siteDraft.certificates} skills={siteDraft.skills} variant="pure" />
      <WorksLinks works={siteDraft.works} variant="pure" />
      <ContactSection siteDraft={siteDraft} variant="pure" />
    </div>
  );
}
