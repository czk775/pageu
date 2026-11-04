import { Link, useInRouterContext } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Mail, Phone } from 'lucide-react';
import { PortfolioNav } from '../shared/PortfolioNav';
import { getInitial, splitIntroParagraphs } from '../shared/portfolioUtils';

function Hero({ siteDraft }) {
  const profile = siteDraft.profile || {};
  const photoUrl = profile.photoUrl || profile.photoPreviewUrl || '';
  const introParagraphs = splitIntroParagraphs(profile.selfIntro || profile.intro || '');
  const displayName = profile.name || 'PageU 同学';
  const tagline = profile.personalTagline || profile.headline || `${displayName}的个人主页`;

  return (
    <section id="top" className="px-6 pb-20 pt-10 md:px-10" aria-label="Portfolio hero">
      <div className="mx-auto max-w-[1120px]">
        <PortfolioNav name={displayName} />
        <div className="mt-20 grid items-center gap-14 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">{profile.targetRole || '求职者'}</p>
            <h1 className="mt-5 text-balance text-[clamp(38px,6vw,76px)] font-black leading-[1.02] tracking-[-0.03em] text-slate-900">{tagline}</h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-9 text-slate-600">
              {introParagraphs.length ? introParagraphs[0] : '正在整理一段更适合展示自己的介绍。'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-full bg-[#2563eb] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1d4ed8]" href="#featured-projects">查看项目</a>
              <a className="rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-500" href="#contact">联系我</a>
            </div>
            {introParagraphs.length > 1 ? (
              <div className="mt-10 max-w-xl space-y-4 border-l-2 border-slate-200 pl-5">
                {introParagraphs.slice(1).map((paragraph) => (
                  <p key={paragraph} className="text-[15px] leading-7 text-slate-500">{paragraph}</p>
                ))}
              </div>
            ) : null}
          </div>
          <div>
            <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-lg shadow-slate-200/60">
              {photoUrl ? (
                <img className="h-full w-full object-cover" src={photoUrl} alt={`${displayName} 的头像`} />
              ) : (
                <div className="grid h-full w-full place-items-center text-7xl font-black text-slate-300">{getInitial(displayName)}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResumeSnapshot({ siteDraft }) {
  const snapshot = siteDraft.resumeSnapshot || {};
  const skills = snapshot.skills || siteDraft.skills || [];
  const certificates = snapshot.certificates || siteDraft.certificates || [];

  return (
    <section id="resume" className="px-6 py-16 md:px-10" aria-label="Resume">
      <div className="mx-auto max-w-[1120px]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Resume</p>
        <h2 className="mt-3 text-balance text-4xl font-black text-slate-900">简历摘要</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">教育背景</p>
            <p className="mt-3 text-lg font-bold text-slate-900">{snapshot.school || siteDraft.profile?.school || '待补充'}</p>
            <p className="mt-1 text-sm text-slate-500">{snapshot.major || siteDraft.profile?.major || '待补充专业'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">技能</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length ? skills.slice(0, 10).map((skill) => <span key={skill} className="rounded-full bg-[#eff6ff] px-3.5 py-1.5 text-[13px] font-medium text-[#2563eb]">{skill}</span>) : <span className="text-sm text-slate-400">待补充技能</span>}
            </div>
          </div>
        </div>
        {certificates.length ? (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">证书 / 奖项</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {certificates.slice(0, 6).map((item) => <span key={item} className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[13px] font-medium text-slate-600">{item}</span>)}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProjectCard({ project, siteId }) {
  const isInRouter = useInRouterContext();
  const projectPath = `/site/${siteId || 'demo'}/project/${project.id}`;
  const ActionLink = isInRouter ? Link : 'a';
  const linkProps = isInRouter ? { to: projectPath } : { href: projectPath };

  return (
    <ActionLink aria-label="查看项目" className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70" {...linkProps}>
      {project.coverUrl ? (
        <div className="aspect-[16/10] overflow-hidden bg-slate-100">
          <img className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]" src={project.coverUrl} alt={`${project.title} 封面`} />
        </div>
      ) : (
        <div className="grid aspect-[16/10] place-items-center bg-gradient-to-br from-[#eff6ff] to-[#dbeafe]">
          <span className="text-5xl font-black text-[#93c5fd]">{getInitial(project.title)}</span>
        </div>
      )}
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>{project.period || 'Project'}</span>
          {project.role ? <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">{project.role}</span> : null}
        </div>
        <h3 className="mt-3 text-xl font-black text-slate-900">{project.title}</h3>
        <p className="mt-2 text-[15px] leading-7 text-slate-500">{project.summary}</p>
        <div className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#2563eb]">
          查看项目
          <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
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
    <section id="featured-projects" className="px-6 py-16 md:px-10" aria-label="Featured projects">
      <div className="mx-auto max-w-[1120px]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Projects</p>
        <h2 className="mt-3 text-balance text-4xl font-black text-slate-900">精选项目</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id || project.title} project={project} siteId={siteId} />
          ))}
        </div>
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
    <section id="about" className="px-6 py-16 md:px-10" aria-label="About">
      <div className="mx-auto max-w-[1120px]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">About</p>
        <h2 className="mt-3 text-balance text-4xl font-black text-slate-900">关于我</h2>
        <div className="mt-8 grid max-w-3xl gap-5">
          {items.slice(0, 3).map((item) => (
            <p key={item} className="text-lg leading-8 text-slate-600">{item}</p>
          ))}
        </div>
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
    <section id="contact" className="px-6 py-16 md:px-10" aria-label="Contact">
      <div className="mx-auto max-w-[1120px]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Contact</p>
        <h2 className="mt-3 text-balance text-4xl font-black text-slate-900">联系我</h2>
        <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">如果你对我的经历或项目感兴趣，欢迎联系我。</p>
        <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
          <a className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#2563eb]" href={`mailto:${email}`}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eff6ff] text-[#2563eb]"><Mail size={18} /></span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">邮箱</span>
              <span className="font-semibold text-slate-900">{email || '暂未填写'}</span>
            </span>
          </a>
          <a className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#2563eb]" href={`tel:${phone}`}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eff6ff] text-[#2563eb]"><Phone size={18} /></span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">手机号</span>
              <span className="font-semibold text-slate-900">{phone || '暂未填写'}</span>
            </span>
          </a>
        </div>
        <footer className="mt-16 border-t border-slate-100 pt-6 text-sm text-slate-400">Generated by PageU</footer>
      </div>
    </section>
  );
}

export function DeveloperTemplate({ siteDraft }) {
  return (
    <div className="min-h-screen bg-[#f2f7ff] font-sans text-slate-800">
      <Hero siteDraft={siteDraft} />
      <ResumeSnapshot siteDraft={siteDraft} />
      <Projects siteDraft={siteDraft} />
      <About siteDraft={siteDraft} />
      <Contact siteDraft={siteDraft} />
    </div>
  );
}
