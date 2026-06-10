export function HighlightsStrip({ items = [], variant = 'default' }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className={`portfolio-highlights-strip portfolio-highlights-${variant}`} aria-label="Highlights">
      {items.slice(0, 4).map((item) => (
        <article key={`${item.label}-${item.value}`}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.description ? <p>{item.description}</p> : null}
        </article>
      ))}
    </section>
  );
}
