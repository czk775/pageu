import { useEffect, useState } from 'react';
import { PortfolioNav } from './PortfolioNav';
import { getInitial } from './portfolioUtils';

const splitIntroParagraphs = (value = '') => {
  const text = String(value || '').trim();
  if (!text) {
    return [];
  }

  const manualParagraphs = text
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (manualParagraphs.length > 1) {
    return manualParagraphs;
  }

  const sentenceParagraphs = text.match(/[^。！？!?；;]+[。！？!?；;]?/g)?.map((item) => item.trim()).filter(Boolean) || [];
  return sentenceParagraphs.length > 1 ? sentenceParagraphs : [text];
};

export function HeroSection({ siteDraft, variant = 'neo' }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const profile = siteDraft.profile || {};
  const hero = siteDraft.hero || {};
  const displayName = profile.name || hero.title || 'PageU 同学';
  const avatarAlt = `${displayName} 的头像`;
  const photoUrl = profile.photoUrl || profile.photoPreviewUrl || '';
  const shouldShowAvatar = Boolean(photoUrl) && !avatarFailed;
  const selfIntro = profile.selfIntro || hero.subtitle || profile.intro || '正在整理一段更适合展示自己的介绍。';
  const introParagraphs = splitIntroParagraphs(selfIntro);

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
            <div className="portfolio-hero-intro-card portfolio-reveal-line reveal-delay-2">
              <span>个人介绍</span>
              <div className="portfolio-hero-intro-body">
                {introParagraphs.map((paragraph) => (
                  <p className="portfolio-hero-self-intro portfolio-hero-intro-card-copy portfolio-hero-intro-paragraph" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
