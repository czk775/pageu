import { getAboutCopy } from './portfolioUtils';
import { AnimatedSection } from './PortfolioMotionContext';

export function AboutSection({ siteDraft, framed = false }) {
  const copy = getAboutCopy(siteDraft);

  return (
    <AnimatedSection id="about" motionKey="about" className={`portfolio-about-section ${framed ? 'portfolio-section-frame' : ''}`}>
      <p className="portfolio-section-eyebrow">About</p>
      <div className="portfolio-section-heading">
        <h2>关于我</h2>
      </div>
      {copy.length ? (
        <div className="portfolio-about-copy">
          {copy.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      ) : null}
    </AnimatedSection>
  );
}
