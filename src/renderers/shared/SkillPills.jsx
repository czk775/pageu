export function SkillPills({ skills = [], certificates = [], variant = 'default' }) {
  return (
    <section className={`portfolio-skills-section portfolio-skills-${variant}`} aria-label="Skills">
      <p className="portfolio-section-eyebrow">Skills</p>
      <div className="portfolio-section-heading">
        <h2>技能与证书</h2>
        <span>面向岗位的能力组合</span>
      </div>
      <div className="portfolio-pill-cloud">
        {skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
      {certificates.length ? (
        <div className="portfolio-certificate-row">
          {certificates.map((certificate) => (
            <span key={certificate}>{certificate}</span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
