import { AnimatedSection } from './PortfolioMotionContext';

export function ResumeSnapshot({ siteDraft, variant = 'default' }) {
  const snapshot = siteDraft.resumeSnapshot || {};
  const skills = snapshot.skills || siteDraft.skills || [];
  const certificates = snapshot.certificates || siteDraft.certificates || [];
  const timeline = snapshot.timeline || siteDraft.experienceStory || [];
  const keyExperiences = timeline.slice(0, 3);

  return (
    <AnimatedSection id="resume" motionKey="resume" className={`portfolio-resume-snapshot portfolio-resume-${variant}`} delay={0.08}>
      <p className="portfolio-section-eyebrow">Resume</p>
      <div className="portfolio-section-heading">
        <h2>简历摘要</h2>
      </div>

      <div className="resume-snapshot-grid">
        <article>
          <span>教育背景</span>
          <strong>{snapshot.school || siteDraft.profile?.school || '待补充'}</strong>
          <p>{snapshot.major || siteDraft.profile?.major || '待补充专业'}</p>
        </article>
        <article className="resume-snapshot-wide">
          <span>技能</span>
          <div className="portfolio-pill-cloud compact">
            {skills.length ? skills.slice(0, 8).map((skill) => <span key={skill}>{skill}</span>) : <span>待补充技能</span>}
          </div>
        </article>
        <article className="resume-snapshot-wide">
          <span>证书 / 奖项</span>
          <div className="portfolio-certificate-row compact">
            {certificates.length ? certificates.slice(0, 6).map((item) => <span key={item}>{item}</span>) : <span>待补充证书</span>}
          </div>
        </article>
        <article className="resume-snapshot-wide resume-key-experiences">
          <span>关键经历摘要</span>
          {keyExperiences.length ? (
            <ul>
              {keyExperiences.map((item) => (
                <li key={item.id || `${item.title}-${item.period}`}>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>待补充经历摘要</p>
          )}
        </article>
      </div>
    </AnimatedSection>
  );
}
