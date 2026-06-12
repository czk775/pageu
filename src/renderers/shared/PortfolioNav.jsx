export function PortfolioNav({ name = 'PageU', compact = false }) {
  return (
    <nav className={`portfolio-nav ${compact ? 'portfolio-nav-compact' : ''}`} aria-label="Portfolio navigation">
      <a className="portfolio-nav-logo" href="#top">
        {name || 'PageU'}
      </a>
      <div className="portfolio-nav-links">
        <a href="#about">关于我</a>
        <a href="#featured-projects">项目</a>
        <a href="#resume">简历</a>
        <a href="#contact">联系我</a>
      </div>
    </nav>
  );
}
