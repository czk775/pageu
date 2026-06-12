import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { ProjectsSection } from '../shared/ProjectsSection';
import { ResumeSnapshot } from '../shared/ResumeSnapshot';

export function PureTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-pure">
      <HeroSection siteDraft={siteDraft} variant="pure" />
      <AboutSection siteDraft={siteDraft} />
      <ProjectsSection siteDraft={siteDraft} layout="pure" title="Case Studies" />
      <ResumeSnapshot siteDraft={siteDraft} variant="pure" />
      <ContactSection siteDraft={siteDraft} variant="pure" />
    </div>
  );
}
