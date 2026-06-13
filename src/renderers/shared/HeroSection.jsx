import { useEffect, useState } from 'react';
import { PortfolioNav } from './PortfolioNav';
import { getInitial } from './portfolioUtils';

export function HeroSection({ siteDraft, variant = 'neo' }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const profile = siteDraft.profile || {};
  const hero = siteDraft.hero || {};
  const displayName = profile.name || hero.title || 'PageU 同学';
  const avatarAlt = `${displayName} 的头像`;
  const photoUrl = profile.photoUrl || profile.photoPreviewUrl || '';
  const shouldShowAvatar = Boolean(photoUrl) && !avatarFailed;
  const selfIntro = profile.selfIntro || hero.subtitle || profile.intro || '正在整理一段更适合展示自己的介绍。';

  useEffect(() => {
    setAvatarFailed(false);
  }, [photoUrl]);

  return (
    <section id="top" className={`portfolio-full-hero portfolio-full-hero-${variant}`} aria-label="Portfolio hero">
      <PortfolioNav name={displayName} />
      <div className="portfolio-hero-layout">
        <div className="portfolio-hero-horizontal-tab portfolio-reveal-visual">
          <div className="portfolio-hero-tab-photo portfolio-avatar-float">
            <div className="portfolio-avatar-frame">
              {shouldShowAvatar ? (
                <img className="portfolio-avatar-image" src={photoUrl} alt={avatarAlt} onError={() => setAvatarFailed(true)} />
              ) : (
                <div className="portfolio-avatar-fallback" aria-label={avatarAlt}>
                  {getInitial(displayName)}
                </div>
              )}
            </div>
          </div>
          <div className="portfolio-hero-tab-copy">
            <p className="portfolio-hero-self-intro portfolio-reveal-line reveal-delay-2">{selfIntro}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
