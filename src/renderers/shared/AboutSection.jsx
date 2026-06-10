import { getAboutCopy } from './portfolioUtils';

export function AboutSection({ siteDraft, framed = false }) {
  const copy = getAboutCopy(siteDraft);
  const profile = siteDraft.profile || {};

  return (
    <section id="about" className={`portfolio-about-section ${framed ? 'portfolio-section-frame' : ''}`}>
      <p className="portfolio-section-eyebrow">About</p>
      <div className="portfolio-section-heading">
        <h2>关于我</h2>
        <span>{profile.school || profile.major || 'PageU Portfolio'}</span>
      </div>
      <div className="portfolio-about-copy">
        {copy.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </section>
  );
}
