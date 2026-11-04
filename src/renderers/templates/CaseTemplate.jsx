import { Link, useInRouterContext } from 'react-router-dom';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { PortfolioNav } from '../shared/PortfolioNav';
import { getInitial, splitIntroParagraphs } from '../shared/portfolioUtils';

function Hero({ siteDraft }) {
  const profile = siteDraft.profile || {};
  const photoUrl = profile.photoUrl || profile.photoPreviewUrl || '';
  const introParagraphs = splitIntroParagraphs(profile.selfIntro || profile.intro || '');
  const displayName = profile.name || 'PageU 同学';

  return (
    <section id="top" className="px-6 pb-16 pt-10 md:px-10" aria-label="Portfolio hero">
      <div className="mx-auto max-w-[1120px]">
        <PortfolioNav name={displayName} />
        <div className="mt-16 grid items-center gap-12 md:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.7fr)]">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[#4f46e5]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#4f46e5]">{profile.targetRole || '求职者'}</span>
              {profile.major ? <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">{profile.major}</span> : null}
            </div>
            <h1 className="text-balance text-[clamp(36px,5.5vw,68px)] font-black leading-[1.05] tracking-[-0.02em] text-slate-900">{displayName}</h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-slate-600">
              {introParagraphs.length ? introParagraphs[0] : '正在整理一段更适合展示自己的介绍。'}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a className="rounded-lg bg-[#4f46e5] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#4338ca]" href="#featured-projects">查看项目</a>
              <a className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-500" href="#contact">联系我</a>
            </div>
          </div>
          <div>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-lg shadow-slate-200/60">
              {photoUrl ? (
                <img className="h-full w-full object-cover" src={photoUrl} alt={`${displayName} 的头像`} />
              ) : (
                <div className="grid h-full w-full place-items-center text-7xl font-black text-slate-300">{getInitial(displayName)}</div>
              )}
            </div>
          </div>
        </div>
        {introParagraphs.length > 1 ? (
          <div className="mx-auto mt-10 max-w-[1120px] space-y-3 border-l-4 border-[#4f46e5]/30 pl-6">
            {introParagraphs.slice(1).map((paragraph) => (
              <p key={paragraph} className="max-w-2xl text-[15px] leading-7 text-slate-500">{paragraph}</p>
            ))}
          </div>
        ) : null}
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
    <section id="resume" className="bg-white px-6 py-16 md:px-10" aria-label="Resume">
      <div className="mx-auto max-w-[1120px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">Resume</p>
        <h2 className="mt-2 text-balance text-3xl font-black text-slate-900 md:text-4xl">简历摘要</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">教育背景</p>
            <p className="mt-3 text-lg font-bold text-slate-900">{snapshot.school || siteDraft.profile?.school || '待补充'}</p>
            <p className="mt-1 text-sm text-slate-500">{snapshot.major || siteDraft.profile?.major || '待补充专业'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">技能</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.length ? skills.slice(0, 8).map((skill) => <span key={skill} className="rounded bg-[#4f46e5]/10 px-2 py-1 text-[12px] font-medium text-[#4f46e5]">{skill}</span>) : <span className="text-sm text-slate-400">待补充技能</span>}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">证书 / 奖项</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {certificates.length ? certificates.slice(0, 5).map((item) => <span key={item} className="rounded bg-slate-100 px-2 py-1 text-[12px] font-medium text-slate-600">{item}</span>) : <span className="text-sm text-slate-400">待补充证书</span>}
            </div>
          </div>
        </div>
        {timeline.length ? (
          <div className="mt-6 rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">关键经历</p>
            <ul className="mt-4 space-y-3">
              {timeline.slice(0, 3).map((item) => (
                <li key={item.id || `${item.title}-${item.period}`} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#4f46e5]" />
                  <div>
                    <p className="font-bold text-slate-900">{item.title} <span className="ml-2 text-xs font-medium text-slate-400">{item.period}</span></p>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
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
    <ActionLink aria-label="查看项目" className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-[#4f46e5]/60 hover:shadow-lg hover:shadow-slate-200/70" {...linkProps}>
      {project.coverUrl ? (
        <div className="aspect-[16/9] overflow-hidden bg-slate-100">
          <img className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" src={project.coverUrl} alt={`${project.title} 封面`} />
        </div>
      ) : (
        <div className="grid aspect-[16/9] place-items-center bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff]">
          <span className="text-5xl font-black text-[#a5b4fc]">{getInitial(project.title)}</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">{project.period || 'Project'}</span>
          {project.role ? <span className="font-medium">{project.role}</span> : null}
        </div>
        <h3 className="mt-3 text-lg font-black text-slate-900">{project.title}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-500">{project.summary}</p>
        {project.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded bg-[#4f46e5]/10 px-2 py-0.5 text-[11px] font-medium text-[#4f46e5]">{tag}</span>)}
          </div>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#4f46e5]">
          查看项目
          <ArrowUpRight size={15} />
        </span>
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
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">Projects</p>
        <h2 className="mt-2 text-balance text-3xl font-black text-slate-900 md:text-4xl">精选项目</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
    <section id="about" className="bg-white px-6 py-16 md:px-10" aria-label="About">
      <div className="mx-auto max-w-[1120px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">About</p>
        <h2 className="mt-2 text-balance text-3xl font-black text-slate-900 md:text-4xl">关于我</h2>
        <div className="mt-6 max-w-3xl space-y-4">
          {items.slice(0, 3).map((item) => <p key={item} className="text-lg leading-8 text-slate-600">{item}</p>)}
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
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f46e5]">Contact</p>
        <h2 className="mt-2 text-balance text-3xl font-black text-slate-900 md:text-4xl">联系我</h2>
        <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">如果你对我的经历或项目感兴趣，欢迎联系我。</p>
        <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-slate-400"><Mail size={16} /><span className="text-xs font-semibold uppercase tracking-wider">邮箱</span></div>
            <p className="mt-2 font-semibold text-slate-900">{email || '暂未填写'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-slate-400"><Phone size={16} /><span className="text-xs font-semibold uppercase tracking-wider">手机号</span></div>
            <p className="mt-2 font-semibold text-slate-900">{phone || '暂未填写'}</p>
          </div>
        </div>
        <footer className="mt-16 border-t border-slate-100 pt-6 text-sm text-slate-400">Generated by PageU</footer>
      </div>
    </section>
  );
}

export function CaseTemplate({ siteDraft }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      <Hero siteDraft={siteDraft} />
      <ResumeSnapshot siteDraft={siteDraft} />
      <Projects siteDraft={siteDraft} />
      <About siteDraft={siteDraft} />
      <Contact siteDraft={siteDraft} />
    </div>
  );
}
