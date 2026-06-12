import { useEffect, useState } from 'react';
import { PortfolioNav } from './PortfolioNav';
import { getInitial } from './portfolioUtils';

export function HeroSection({ siteDraft, variant = 'neo', aside = null }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const profile = siteDraft.profile || {};
  const hero = siteDraft.hero || {};
  const avatarAlt = `${profile.name || 'PageU 同学'} 的头像`;
  const photoUrl = profile.photoUrl || profile.photoPreviewUrl || '';
  const shouldShowAvatar = Boolean(photoUrl) && !avatarFailed;

  useEffect(() => {
    setAvatarFailed(false);
  }, [photoUrl]);

  return (
    <section id="top" className={`portfolio-full-hero portfolio-full-hero-${variant}`} aria-label="Portfolio hero">
      <PortfolioNav name={profile.name || hero.title} />
      <div className="portfolio-hero-layout">
        <div className="portfolio-hero-content portfolio-hero-bento-main">
          <p className="portfolio-hero-kicker portfolio-reveal-line reveal-delay-1">{hero.eyebrow || 'Personal Portfolio'}</p>
          <h1 className="portfolio-reveal-line reveal-delay-2">{hero.title || profile.name}</h1>
          <p className="portfolio-hero-role portfolio-reveal-line reveal-delay-3">{profile.targetRole || hero.subtitle}</p>
          <p className="portfolio-hero-tagline portfolio-reveal-line reveal-delay-4">{profile.selfIntro || hero.subtitle || profile.intro}</p>
          <div className="portfolio-hero-cta portfolio-reveal-line reveal-delay-5">
            <a className="portfolio-primary-cta" href="#featured-projects">
              {hero.primaryCta || '查看项目'}
            </a>
            <a className="portfolio-secondary-cta" href="#contact">
              {hero.secondaryCta || '联系我'}
            </a>
          </div>
        </div>
        <div className="portfolio-hero-visual portfolio-hero-bento-photo portfolio-avatar-float portfolio-reveal-visual">
          <div className="portfolio-avatar-frame">
            {shouldShowAvatar ? (
              <img className="portfolio-avatar-image" src={photoUrl} alt={avatarAlt} onError={() => setAvatarFailed(true)} />
            ) : (
              <div className="portfolio-avatar-fallback" aria-label={avatarAlt}>
                {getInitial(profile.name)}
              </div>
            )}
          </div>
          <div className="portfolio-visual-card">
            <span>方向</span>
            <strong>{profile.targetRole || 'Portfolio'}</strong>
          </div>
        </div>
        <div className="portfolio-hero-mini-grid portfolio-reveal-line reveal-delay-5">
          <a className="portfolio-hero-mini-card" href="#about">
            <span>关于我</span>
            <strong>{profile.school || '个人背景'}</strong>
          </a>
          <a className="portfolio-hero-mini-card" href="#featured-projects">
            <span>精选项目</span>
            <strong>{siteDraft.projects?.[0]?.title || '项目实践'}</strong>
          </a>
          <a className="portfolio-hero-mini-card" href="#contact">
            <span>联系我</span>
            <strong>{profile.email || profile.phone || '暂未填写'}</strong>
          </a>
        </div>
        {aside}
      </div>
    </section>
  );
}
