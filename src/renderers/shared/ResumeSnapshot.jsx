import { useState } from 'react';
import { AnimatedSection } from './PortfolioMotionContext';

export function ResumeSnapshot({ siteDraft, variant = 'default' }) {
  const [expanded, setExpanded] = useState(false);
  const snapshot = siteDraft.resumeSnapshot || {};
  const skills = snapshot.skills || siteDraft.skills || [];
  const certificates = snapshot.certificates || siteDraft.certificates || [];
  const timeline = snapshot.timeline || siteDraft.experienceStory || [];

  return (
    <AnimatedSection id="resume" motionKey="resume" className={`portfolio-resume-snapshot portfolio-resume-${variant}`} delay={0.08}>
      <p className="portfolio-section-eyebrow">Resume</p>
      <div className="portfolio-section-heading">
        <h2>Resume Snapshot</h2>
        <span>简历只是辅助，重点仍然是项目和作品。</span>
      </div>

      <div className="resume-snapshot-grid">
        <article>
          <span>学校</span>
          <strong>{snapshot.school || siteDraft.profile?.school || '待补充'}</strong>
        </article>
        <article>
          <span>专业</span>
          <strong>{snapshot.major || siteDraft.profile?.major || '待补充'}</strong>
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
      </div>

      <button className="resume-expand-action" type="button" onClick={() => setExpanded((value) => !value)}>
        {expanded ? '收起完整简历' : '展开完整简历'}
      </button>

      {expanded ? (
        <div className="resume-full-timeline">
          <h3>完整时间轴</h3>
          {timeline.length ? (
            <ol>
              {timeline.map((item) => (
                <li key={item.id || `${item.title}-${item.period}`}>
                  <span>{item.period || '经历'}</span>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p>继续在创建页补充经历后，这里会形成更完整的时间线。</p>
          )}
        </div>
      ) : null}
    </AnimatedSection>
  );
}
