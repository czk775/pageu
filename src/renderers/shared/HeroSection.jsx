import { PortfolioNav } from './PortfolioNav';
import { getInitial } from './portfolioUtils';

export function HeroSection({ siteDraft, variant = 'neo', aside = null }) {
  const profile = siteDraft.profile || {};
  const hero = siteDraft.hero || {};

  return (
    <section className={`portfolio-full-hero portfolio-full-hero-${variant}`} aria-label="Portfolio hero">
      <PortfolioNav />
      <div className="portfolio-hero-layout">
        <div className="portfolio-hero-content">
          <p className="portfolio-hero-kicker">{hero.eyebrow || 'Personal Portfolio'}</p>
          <h1>{hero.title || profile.name}</h1>
          <p className="portfolio-hero-role">{profile.targetRole || hero.subtitle}</p>
          <p className="portfolio-hero-tagline">{hero.subtitle || profile.personalTagline || profile.intro}</p>
          <div className="portfolio-hero-cta">
            <a className="portfolio-primary-cta" href="#featured-projects">
              {hero.primaryCta || '查看项目'}
            </a>
            <a className="portfolio-secondary-cta" href="#contact">
              {hero.secondaryCta || '联系我'}
            </a>
          </div>
        </div>
        <div className="portfolio-hero-visual" aria-hidden="true">
          <div className="portfolio-avatar-orb">{getInitial(profile.name)}</div>
          <div className="portfolio-visual-card">
            <span>Focus</span>
            <strong>{profile.targetRole || 'Portfolio'}</strong>
          </div>
          <div className="portfolio-visual-card muted">
            <span>Style</span>
            <strong>{siteDraft.stylePreference || siteDraft.template || 'PageU'}</strong>
          </div>
        </div>
        {aside}
      </div>
    </section>
  );
}
