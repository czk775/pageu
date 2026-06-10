export function PortfolioNav({ compact = false }) {
  return (
    <nav className={`portfolio-nav ${compact ? 'portfolio-nav-compact' : ''}`} aria-label="Portfolio navigation">
      <a href="#about">About</a>
      <a href="#featured-projects">Projects</a>
      <a href="#works">Works</a>
      <a href="#contact">Contact</a>
    </nav>
  );
}
