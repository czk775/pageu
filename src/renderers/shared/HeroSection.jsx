import { PortfolioNav } from './PortfolioNav';
import { getInitial } from './portfolioUtils';

export function HeroSection({ siteDraft, variant = 'neo', aside = null }) {
  const profile = siteDraft.profile || {};
  const hero = siteDraft.hero || {};
  const avatarAlt = `${profile.name || 'PageU 同学'} 的头像`;

  return (
    <section id="top" className={`portfolio-full-hero portfolio-full-hero-${variant}`} aria-label="Portfolio hero">
      <PortfolioNav name={profile.name || hero.title} />
      <div className="portfolio-hero-layout">
        <div className="portfolio-hero-content">
          <p className="portfolio-hero-kicker portfolio-reveal-line reveal-delay-1">{hero.eyebrow || 'Personal Portfolio'}</p>
          <h1 className="portfolio-reveal-line reveal-delay-2">{hero.title || profile.name}</h1>
          <p className="portfolio-hero-role portfolio-reveal-line reveal-delay-3">{profile.targetRole || hero.subtitle}</p>
          <p className="portfolio-hero-tagline portfolio-reveal-line reveal-delay-4">{hero.subtitle || profile.personalTagline || profile.intro}</p>
          <div className="portfolio-hero-cta portfolio-reveal-line reveal-delay-5">
            <a className="portfolio-primary-cta" href="#featured-projects">
              {hero.primaryCta || '查看项目'}
            </a>
            <a className="portfolio-secondary-cta" href="#contact">
              {hero.secondaryCta || '联系我'}
            </a>
          </div>
        </div>
        <div className="portfolio-hero-visual portfolio-avatar-float portfolio-reveal-visual">
          <div className="portfolio-avatar-frame">
            {profile.photoPreviewUrl ? (
              <img className="portfolio-avatar-image" src={profile.photoPreviewUrl} alt={avatarAlt} />
            ) : (
              <div className="portfolio-avatar-fallback" aria-label={avatarAlt}>
                {getInitial(profile.name)}
              </div>
            )}
          </div>
          <div className="portfolio-visual-card">
            <span>Focus</span>
            <strong>{profile.targetRole || 'Portfolio'}</strong>
          </div>
          <div className="portfolio-visual-card muted">
            <span>Template</span>
            <strong>{siteDraft.template || 'PageU'}</strong>
          </div>
        </div>
        {aside}
      </div>
    </section>
  );
}
