import { useEffect, useRef, useState } from 'react';

export const navItems = [
  { id: 'resume', label: '简历' },
  { id: 'featured-projects', label: '项目' },
  { id: 'contact', label: '联系我' },
];

export function PortfolioNav({ name = 'PageU', compact = false }) {
  const [activeSection, setActiveSection] = useState('');
  const [eggVisible, setEggVisible] = useState(false);
  const logoClicks = useRef(0);
  const eggTimer = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (activeEntry?.target?.id) {
          setActiveSection(activeEntry.target.id);
        }
      },
      {
        rootMargin: '-35% 0px -48% 0px',
        threshold: [0.18, 0.35, 0.5],
      },
    );

    navItems.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (eggTimer.current) {
        window.clearTimeout(eggTimer.current);
      }
    },
    [],
  );

  const scrollToSection = (event, id) => {
    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    window.history.replaceState(null, '', `#${id}`);
    setActiveSection(id);
  };

  const handleLogoClick = (event) => {
    scrollToSection(event, 'top');
    logoClicks.current += 1;

    if (logoClicks.current >= 3) {
      setEggVisible(true);
      logoClicks.current = 0;

      if (eggTimer.current) {
        window.clearTimeout(eggTimer.current);
      }

      eggTimer.current = window.setTimeout(() => setEggVisible(false), 2200);
    }
  };

  return (
    <nav className={`portfolio-nav ${compact ? 'portfolio-nav-compact' : ''}`} aria-label="Portfolio navigation">
      <a className="portfolio-nav-logo" href="#top" onClick={handleLogoClick}>
        {name || 'PageU'}
      </a>
      <div className="portfolio-nav-links">
        {navItems.map((item) => (
          <a
            aria-current={activeSection === item.id ? 'page' : undefined}
            className={activeSection === item.id ? 'active' : ''}
            href={`#${item.id}`}
            key={item.id}
            onClick={(event) => scrollToSection(event, item.id)}
          >
            {item.label}
          </a>
        ))}
      </div>
      {eggVisible ? (
        <div className="portfolio-easter-egg" role="status">
          你发现了一个小彩蛋 ✨
        </div>
      ) : null}
    </nav>
  );
}
