import { Link, useInRouterContext } from 'react-router-dom';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { PortfolioNav } from '../shared/PortfolioNav';
import { getInitial, splitIntroParagraphs } from '../shared/portfolioUtils';

const SectionTitle = ({ eyebrow, title }) => (
  <div className="mb-10 flex items-baseline gap-4 border-b border-neutral-200 pb-4">
    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">{eyebrow}</span>
    <h2 className="font-serif text-3xl font-bold text-neutral-900 md:text-4xl">{title}</h2>
  </div>
);

function Hero({ siteDraft }) {
  const profile = siteDraft.profile || {};
  const photoUrl = profile.photoUrl || profile.photoPreviewUrl || '';
  const introParagraphs = splitIntroParagraphs(profile.selfIntro || profile.intro || '');
  const displayName = profile.name || 'PageU 同学';
  const headline = profile.headline || profile.personalTagline || '';

  return (
    <section id="top" className="border-b border-neutral-200 pb-16 pt-10" aria-label="Portfolio hero">
      <PortfolioNav name={displayName} compact />
      <div className="mt-16 grid items-center gap-12 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            {profile.major ? `${profile.major} · ` : ''}
            {profile.targetRole || '求职者'}
          </p>
          <h1 className="mt-5 font-serif text-[clamp(40px,6vw,84px)] font-bold leading-[1.02] tracking-[-0.02em] text-neutral-900">
            {displayName}
          </h1>
          {headline ? <p className="mt-4 font-serif text-2xl font-medium text-neutral-700 md:text-3xl">{headline}</p> : null}
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-9 text-neutral-600">
            {introParagraphs.length ? introParagraphs[0] : '正在整理一段更适合展示自己的介绍。'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700" href="#featured-projects">
              查看项目
            </a>
            <a className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-500" href="#contact">
              联系我
            </a>
          </div>
        </div>
        <div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-[6px] bg-neutral-100">
            {photoUrl ? (
              <img className="h-full w-full object-cover" src={photoUrl} alt={`${displayName} 的头像`} />
            ) : (
              <div className="grid h-full w-full place-items-center text-7xl font-serif font-bold text-neutral-300">
                {getInitial(displayName)}
              </div>
            )}
          </div>
          {introParagraphs.length > 1 ? (
            <div className="mx-auto mt-6 max-w-[340px] space-y-3 border-t border-neutral-200 pt-5">
              {introParagraphs.slice(1).map((paragraph) => (
                <p key={paragraph} className="text-[15px] leading-7 text-neutral-500">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ResumeSnapshot({ siteDraft }) {
  const snapshot = siteDraft.resumeSnapshot || {};
  const skills = snapshot.skills || siteDraft.skills || [];
  const certificates = snapshot.certificates || siteDraft.certificates || [];
  const timeline = snapshot.timeline || siteDraft.experienceStory || [];

  return (
    <section id="resume" className="py-16" aria-label="Resume">
      <SectionTitle eyebrow="Resume" title="简历摘要" />
      <div className="grid gap-10 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">教育背景</p>
          <p className="mt-3 text-lg font-semibold text-neutral-900">{snapshot.school || siteDraft.profile?.school || '待补充'}</p>
          <p className="mt-1 text-sm text-neutral-500">{snapshot.major || siteDraft.profile?.major || '待补充专业'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">技能</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.length ? skills.slice(0, 8).map((skill) => <span key={skill} className="rounded-full border border-neutral-200 px-3 py-1 text-[13px] text-neutral-700">{skill}</span>) : <span className="text-sm text-neutral-400">待补充技能</span>}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">证书 / 奖项</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {certificates.length ? certificates.slice(0, 6).map((item) => <span key={item} className="rounded-full bg-neutral-100 px-3 py-1 text-[13px] text-neutral-700">{item}</span>) : <span className="text-sm text-neutral-400">待补充证书</span>}
          </div>
        </div>
      </div>
      {timeline.length ? (
        <div className="mt-10 border-t border-neutral-200 pt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">关键经历</p>
          <ul className="mt-4 space-y-4">
            {timeline.slice(0, 3).map((item) => (
              <li key={item.id || `${item.title}-${item.period}`} className="flex gap-4">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900">{item.title}</p>
                  <p className="text-sm text-neutral-500">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function ProjectCard({ project, siteId, tone }) {
  const isInRouter = useInRouterContext();
  const projectPath = `/site/${siteId || 'demo'}/project/${project.id}`;
  const ActionLink = isInRouter ? Link : 'a';
  const linkProps = isInRouter ? { to: projectPath } : { href: projectPath };

  return (
    <ActionLink aria-label="查看项目" className={`group block border-b border-neutral-200 py-8 transition ${tone === 'cinematic' ? 'hover:border-neutral-600' : 'hover:border-neutral-400'}`} {...linkProps}>
      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="order-2 md:order-1">
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            <span>{project.period || 'Project'}</span>
            {project.role ? <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-neutral-600">{project.role}</span> : null}
          </div>
          <h3 className="mt-4 font-serif text-2xl font-bold text-neutral-900 transition group-hover:text-neutral-600 md:text-3xl">{project.title}</h3>
          <p className="mt-3 max-w-xl leading-7 text-neutral-600">{project.summary}</p>
          {project.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[12px] text-neutral-500">{tag}</span>
              ))}
            </div>
          ) : null}
          <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-neutral-900">
            查看项目
            <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
        {project.coverUrl ? (
          <div className="order-1 aspect-[16/10] overflow-hidden rounded-[4px] bg-neutral-100 md:order-2">
            <img className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" src={project.coverUrl} alt={`${project.title} 封面`} />
          </div>
        ) : null}
      </div>
    </ActionLink>
  );
}

function Projects({ siteDraft }) {
  const projects = siteDraft.projects || [];
  const siteId = siteDraft.meta?.siteId || 'demo';

  if (!projects.length) {
    return null;
  }

  return (
    <section id="featured-projects" className="py-16" aria-label="Featured projects">
      <SectionTitle eyebrow="Projects" title="精选项目" />
      <div className="divide-y-0">
        {projects.map((project) => (
          <ProjectCard key={project.id || project.title} project={project} siteId={siteId} tone="resume" />
        ))}
      </div>
    </section>
  );
}

function About({ siteDraft }) {
  const about = siteDraft.about || {};
  const items = Array.isArray(about.items) && about.items.length ? about.items : [about.background, about.interests, about.strengths].filter(Boolean);

  if (!items.length) {
    return null;
  }

  return (
    <section id="about" className="py-16" aria-label="About">
      <SectionTitle eyebrow="About" title="关于我" />
      <div className="max-w-3xl space-y-5">
        {items.slice(0, 3).map((item) => (
          <p key={item} className="text-lg leading-8 text-neutral-700">{item}</p>
        ))}
      </div>
    </section>
  );
}

function Contact({ siteDraft }) {
  const profile = siteDraft.profile || {};
  const contact = siteDraft.contact || {};
  const email = profile.email || contact.email || '';
  const phone = profile.phone || contact.phone || '';

  return (
    <section id="contact" className="border-t border-neutral-200 py-16" aria-label="Contact">
      <SectionTitle eyebrow="Contact" title="联系我" />
      <p className="max-w-xl text-lg leading-8 text-neutral-600">如果你对我的经历或项目感兴趣，欢迎联系我。</p>
      <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
        <a className="group rounded-[6px] border border-neutral-200 p-6 transition hover:border-neutral-400" href={`mailto:${email}`}>
          <div className="flex items-center gap-2 text-neutral-400">
            <Mail size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">邮箱</span>
          </div>
          <p className="mt-3 text-neutral-900">{email || '暂未填写'}</p>
        </a>
        <a className="group rounded-[6px] border border-neutral-200 p-6 transition hover:border-neutral-400" href={`tel:${phone}`}>
          <div className="flex items-center gap-2 text-neutral-400">
            <Phone size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">手机号</span>
          </div>
          <p className="mt-3 text-neutral-900">{phone || '暂未填写'}</p>
        </a>
      </div>
      <footer className="mt-16 border-t border-neutral-100 pt-6 text-sm text-neutral-400">Generated by PageU</footer>
    </section>
  );
}

export function ResumeTemplate({ siteDraft }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[1080px] bg-[#faf8f4] px-6 py-8 font-sans text-neutral-800 md:px-10">
      <Hero siteDraft={siteDraft} />
      <ResumeSnapshot siteDraft={siteDraft} />
      <Projects siteDraft={siteDraft} />
      <About siteDraft={siteDraft} />
      <Contact siteDraft={siteDraft} />
    </div>
  );
}
