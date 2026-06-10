import { motion } from 'framer-motion';
import { templates } from '../data/templates';
import { normalizeSiteDraft } from '../types/siteDraft';

const templateIds = new Set(templates.map((template) => template.id));

const animationFor = (previewMode) => (previewMode === 'mobile' ? { opacity: 0, y: 10 } : { opacity: 0, y: 18 });

function Hero({ siteDraft, variant = 'default' }) {
  return (
    <section className={`portfolio-hero portfolio-hero-${variant}`} aria-label="个人网站首屏">
      <div className="portfolio-hero-mark" aria-hidden="true">
        {siteDraft.profile.name.slice(0, 1) || 'U'}
      </div>
      <div className="portfolio-hero-copy">
        <p className="portfolio-eyebrow">{siteDraft.hero.eyebrow}</p>
        <h1>{siteDraft.hero.title || siteDraft.profile.name}</h1>
        <strong>{siteDraft.hero.subtitle || siteDraft.profile.intro}</strong>
        <div className="portfolio-hero-actions">
          <a href="#featured-projects">{siteDraft.hero.primaryCta || '查看项目'}</a>
          <a href="#contact">{siteDraft.hero.secondaryCta || '联系我'}</a>
        </div>
      </div>
    </section>
  );
}

function About({ siteDraft, compact = false }) {
  return (
    <section className={`portfolio-section portfolio-about ${compact ? 'compact' : ''}`} aria-label="About">
      <span className="portfolio-section-kicker">About</span>
      <h2>关于我</h2>
      <p>{siteDraft.profile.intro || '正在整理更完整的个人介绍。'}</p>
      <div className="portfolio-meta-line">
        {siteDraft.profile.school ? <span>{siteDraft.profile.school}</span> : null}
        {siteDraft.profile.major ? <span>{siteDraft.profile.major}</span> : null}
        {siteDraft.stylePreference ? <span>{siteDraft.stylePreference}</span> : null}
      </div>
    </section>
  );
}

function Highlights({ items = [], mode = 'cards' }) {
  return (
    <section className={`portfolio-section portfolio-highlights portfolio-highlights-${mode}`} aria-label="Highlights">
      <span className="portfolio-section-kicker">Highlights</span>
      <h2>个人亮点</h2>
      <div className="portfolio-highlight-list">
        {items.map((item) => (
          <article key={`${item.label}-${item.value}`}>
            <span>{item.label}</span>
            <h3>{item.value}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project, featured = false }) {
  return (
    <article className={`portfolio-project-card ${featured ? 'featured' : ''}`}>
      <div className="portfolio-project-head">
        <span>{project.period || 'Project'}</span>
        <strong>{project.role}</strong>
      </div>
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <div className="portfolio-project-points">
        {project.problem ? (
          <div>
            <span>Problem</span>
            <p>{project.problem}</p>
          </div>
        ) : null}
        {project.action ? (
          <div>
            <span>Action</span>
            <p>{project.action}</p>
          </div>
        ) : null}
        {project.result ? (
          <div>
            <span>Result</span>
            <p>{project.result}</p>
          </div>
        ) : null}
      </div>
      <p className="portfolio-project-fit">{project.jdRelevance}</p>
      <div className="portfolio-tags">
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      {project.link ? (
        <a className="portfolio-link-button" href={project.link} target="_blank" rel="noreferrer">
          查看项目
        </a>
      ) : null}
    </article>
  );
}

function Projects({ projects = [], mode = 'grid' }) {
  return (
    <section id="featured-projects" className={`portfolio-section portfolio-projects portfolio-projects-${mode}`}>
      <span className="portfolio-section-kicker">Featured</span>
      <h2>Featured Projects</h2>
      <div className="portfolio-project-list">
        {projects.map((project, index) => (
          <ProjectCard featured={index === 0} key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

function ExperienceStory({ items = [] }) {
  return (
    <section className="portfolio-section portfolio-story" aria-label="Experience Story">
      <span className="portfolio-section-kicker">Story</span>
      <h2>成长线索</h2>
      <div className="portfolio-story-list">
        {items.map((item) => (
          <article key={`${item.title}-${item.period}`}>
            <span>{item.period || '阶段经历'}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            {item.impact ? <strong>{item.impact}</strong> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function Skills({ skills = [], certificates = [], mode = 'chips' }) {
  return (
    <section className={`portfolio-section portfolio-skills portfolio-skills-${mode}`} aria-label="Skills and Certificates">
      <span className="portfolio-section-kicker">Skills</span>
      <h2>技能与证书</h2>
      <div className="portfolio-skill-list">
        {skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
      {certificates.length ? (
        <div className="portfolio-certificate-list">
          {certificates.map((certificate) => (
            <span key={certificate}>{certificate}</span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Works({ works = [], mode = 'cards' }) {
  return (
    <section className={`portfolio-section portfolio-works portfolio-works-${mode}`} aria-label="Works and Links">
      <span className="portfolio-section-kicker">Works</span>
      <h2>作品与链接</h2>
      {works.length ? (
        <div className="portfolio-work-list">
          {works.map((work) => (
            <article key={`${work.title}-${work.url}`}>
              <h3>{work.title}</h3>
              {work.description ? <p>{work.description}</p> : null}
              <a className="portfolio-link-button" href={work.url} target="_blank" rel="noreferrer">
                查看作品
              </a>
            </article>
          ))}
        </div>
      ) : (
        <p className="portfolio-empty-copy">作品链接还没有填写，可以先通过项目卡片了解我的经历。</p>
      )}
    </section>
  );
}

function Contact({ siteDraft }) {
  return (
    <section id="contact" className="portfolio-section portfolio-contact" aria-label="Contact">
      <span className="portfolio-section-kicker">Contact</span>
      <h2>联系我</h2>
      <p>{siteDraft.profile.contact || '欢迎通过简历或作品链接继续了解我。'}</p>
      <div className="portfolio-contact-links">
        {siteDraft.contact.links.slice(0, 3).map((link) => (
          <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
            {link.title}
          </a>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return <footer className="generated-footer">Generated by PageU</footer>;
}

function NeoTemplate({ siteDraft }) {
  return (
    <>
      <Hero siteDraft={siteDraft} variant="neo" />
      <Highlights items={siteDraft.highlights} mode="floating" />
      <Projects projects={siteDraft.projects} mode="showcase" />
      <Skills skills={siteDraft.skills} certificates={siteDraft.certificates} mode="glow" />
      <Works works={siteDraft.works} mode="strip" />
      <Contact siteDraft={siteDraft} />
    </>
  );
}

function PureTemplate({ siteDraft }) {
  return (
    <>
      <Hero siteDraft={siteDraft} variant="pure" />
      <About siteDraft={siteDraft} />
      <Projects projects={siteDraft.projects} mode="case-study" />
      <ExperienceStory items={siteDraft.experienceStory} />
      <Skills skills={siteDraft.skills} certificates={siteDraft.certificates} mode="minimal" />
      <Works works={siteDraft.works} mode="plain" />
      <Contact siteDraft={siteDraft} />
    </>
  );
}

function FlowTemplate({ siteDraft }) {
  return (
    <>
      <div className="portfolio-flow-hero-grid">
        <Hero siteDraft={siteDraft} variant="flow" />
        <About siteDraft={siteDraft} compact />
      </div>
      <ExperienceStory items={siteDraft.experienceStory} />
      <Projects projects={siteDraft.projects} mode="story" />
      <Works works={siteDraft.works} mode="editorial" />
      <Highlights items={siteDraft.highlights} mode="soft" />
      <Skills skills={siteDraft.skills} certificates={siteDraft.certificates} mode="soft" />
      <Contact siteDraft={siteDraft} />
    </>
  );
}

function GridTemplate({ siteDraft }) {
  return (
    <>
      <Hero siteDraft={siteDraft} variant="grid" />
      <div className="portfolio-grid-dashboard">
        <Highlights items={siteDraft.highlights} mode="dashboard" />
        <Skills skills={siteDraft.skills} certificates={siteDraft.certificates} mode="cards" />
      </div>
      <Projects projects={siteDraft.projects} mode="matrix" />
      <Works works={siteDraft.works} mode="cards" />
      <Contact siteDraft={siteDraft} />
    </>
  );
}

function CanvasTemplate({ siteDraft }) {
  return (
    <>
      <Hero siteDraft={siteDraft} variant="canvas" />
      <Works works={siteDraft.works} mode="exhibition" />
      <Projects projects={siteDraft.projects} mode="exhibition" />
      <div className="portfolio-canvas-split">
        <Highlights items={siteDraft.highlights} mode="bold" />
        <Skills skills={siteDraft.skills} certificates={siteDraft.certificates} mode="bold" />
      </div>
      <Contact siteDraft={siteDraft} />
    </>
  );
}

function GlassTemplate({ siteDraft }) {
  return (
    <>
      <Hero siteDraft={siteDraft} variant="glass" />
      <Highlights items={siteDraft.highlights} mode="glass" />
      <Projects projects={siteDraft.projects} mode="glass" />
      <Skills skills={siteDraft.skills} certificates={siteDraft.certificates} mode="glass" />
      <Works works={siteDraft.works} mode="glass" />
      <Contact siteDraft={siteDraft} />
    </>
  );
}

const templateMap = {
  neo: NeoTemplate,
  pure: PureTemplate,
  flow: FlowTemplate,
  grid: GridTemplate,
  canvas: CanvasTemplate,
  glass: GlassTemplate,
};

export function TemplateRenderer({ siteDraft, as: Surface = 'article', previewMode = 'desktop', className = '' }) {
  const normalizedDraft = normalizeSiteDraft(siteDraft);
  const template = templateIds.has(normalizedDraft.template) ? normalizedDraft.template : 'neo';
  const Template = templateMap[template] || NeoTemplate;
  const initial = animationFor(previewMode);

  return (
    <Surface
      className={`generated-site portfolio-site template-${template}-site portfolio-layout-${template} ${previewMode === 'mobile' ? 'generated-site-mobile' : ''} ${className}`}
      data-template={template}
      style={{
        '--generated-primary': normalizedDraft.theme.primaryColor,
        '--generated-bg': normalizedDraft.theme.background,
        '--generated-text': normalizedDraft.theme.textColor,
      }}
    >
      <motion.div className="portfolio-site-inner" initial={initial} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.46 }}>
        <Template siteDraft={normalizedDraft} />
        <Footer />
      </motion.div>
    </Surface>
  );
}
