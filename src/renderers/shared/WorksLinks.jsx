export function WorksLinks({ works = [], variant = 'cards' }) {
  return (
    <section id="works" className={`portfolio-works-section portfolio-works-${variant}`} aria-label="Works and Links">
      <p className="portfolio-section-eyebrow">Works</p>
      <div className="portfolio-section-heading">
        <h2>作品 / 链接</h2>
        <span>作品集、Demo、GitHub 或项目材料</span>
      </div>
      {works.length ? (
        <div className="portfolio-works-grid">
          {works.map((work) => (
            <article key={`${work.title}-${work.url}`} className="portfolio-work-card">
              <h3>{work.title}</h3>
              {work.description ? <p>{work.description}</p> : null}
              <a className="portfolio-link-button" href={work.url} target="_blank" rel="noreferrer">
                查看作品
              </a>
            </article>
          ))}
        </div>
      ) : (
        <p className="portfolio-empty-copy">还没有添加作品链接，可以先通过精选项目了解这个人。</p>
      )}
    </section>
  );
}
