import { AboutSection } from '../shared/AboutSection';
import { ContactSection } from '../shared/ContactSection';
import { HeroSection } from '../shared/HeroSection';
import { ProjectsSection } from '../shared/ProjectsSection';
import { ResumeSnapshot } from '../shared/ResumeSnapshot';

export function PureTemplate({ siteDraft }) {
  return (
    <div className="portfolio-shell portfolio-shell-pure">
      <HeroSection siteDraft={siteDraft} variant="pure" />
      <ResumeSnapshot siteDraft={siteDraft} variant="pure" />
      <ProjectsSection siteDraft={siteDraft} layout="pure" />
      <AboutSection siteDraft={siteDraft} />
      <ContactSection siteDraft={siteDraft} variant="pure" />
    </div>
  );
}
