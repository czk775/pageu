import { useEffect, useState } from 'react';
import { PortfolioNav } from './PortfolioNav';
import { getInitial } from './portfolioUtils';

export function HeroSection({ siteDraft, variant = 'neo' }) {
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
          <h1 className="portfolio-reveal-line reveal-delay-1">{hero.title || profile.name}</h1>
          <p className="portfolio-hero-role portfolio-reveal-line reveal-delay-2">{profile.targetRole || hero.subtitle}</p>
          <p className="portfolio-hero-tagline portfolio-reveal-line reveal-delay-3">{profile.selfIntro || hero.subtitle || profile.intro}</p>
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
        </div>
      </div>
    </section>
  );
}
