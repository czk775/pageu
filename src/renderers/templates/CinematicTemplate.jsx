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
    <section id="top" className="px-6 pb-20 pt-8 md:px-10" aria-label="Portfolio hero">
      <div className="mx-auto max-w-[1120px]">
        <PortfolioNav name={displayName} />
        <div className="mt-24 grid items-center gap-14 md:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.7fr)]">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[#ff6a3d]">{profile.targetRole || 'JOB SEEKER'}</p>
            <h1 className="mt-6 text-balance text-[clamp(40px,6.5vw,88px)] font-black leading-[0.98] tracking-[-0.04em] text-[#f8f4ec]">{displayName}</h1>
            <p className="mt-7 max-w-2xl text-pretty text-lg leading-9 text-[#f8f4ec]/70">
              {introParagraphs.length ? introParagraphs[0] : '正在整理一段更适合展示自己的介绍。'}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a className="rounded-full bg-[#ff6a3d] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#ff8a5e]" href="#featured-projects">查看项目</a>
              <a className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-[#f8f4ec] transition hover:border-white/50" href="#contact">联系我</a>
            </div>
          </div>
          <div>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
              {photoUrl ? (
                <img className="h-full w-full object-cover" src={photoUrl} alt={`${displayName} 的头像`} />
              ) : (
                <div className="grid h-full w-full place-items-center text-7xl font-black text-white/25">{getInitial(displayName)}</div>
              )}
            </div>
          </div>
        </div>
        {introParagraphs.length > 1 ? (
          <div className="mx-auto mt-14 max-w-[1120px] space-y-4 border-t border-white/10 pt-8">
            {introParagraphs.slice(1).map((paragraph) => (
              <p key={paragraph} className="max-w-2xl text-[15px] leading-7 text-[#f8f4ec]/55">{paragraph}</p>
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

  return (
    <section id="resume" className="px-6 py-20 md:px-10" aria-label="Resume">
      <div className="mx-auto max-w-[1120px]">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#ff6a3d]">Resume</span>
          <h2 className="text-balance text-4xl font-black text-[#f8f4ec]">简历摘要</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f8f4ec]/40">教育背景</p>
            <p className="mt-3 text-lg font-bold text-[#f8f4ec]">{snapshot.school || siteDraft.profile?.school || '待补充'}</p>
            <p className="mt-1 text-sm text-[#f8f4ec]/55">{snapshot.major || siteDraft.profile?.major || '待补充专业'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f8f4ec]/40">技能</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length ? skills.slice(0, 10).map((skill) => <span key={skill} className="rounded-full border border-[#ff6a3d]/40 px-3.5 py-1.5 text-[13px] font-medium text-[#ff8a5e]">{skill}</span>) : <span className="text-sm text-[#f8f4ec]/40">待补充技能</span>}
            </div>
          </div>
        </div>
        {certificates.length ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f8f4ec]/40">证书 / 奖项</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {certificates.slice(0, 6).map((item) => <span key={item} className="rounded-full bg-white/[0.06] px-3.5 py-1.5 text-[13px] font-medium text-[#f8f4ec]/70">{item}</span>)}
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
    <ActionLink aria-label="查看项目" className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:border-[#ff6a3d]/50 hover:bg-white/[0.07]" {...linkProps}>
      {project.coverUrl ? (
        <div className="aspect-[16/10] overflow-hidden">
          <img className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]" src={project.coverUrl} alt={`${project.title} 封面`} />
        </div>
      ) : (
        <div className="grid aspect-[16/10] place-items-center bg-gradient-to-br from-[#1a1a22] to-[#26262e]">
          <span className="text-5xl font-black text-white/15">{getInitial(project.title)}</span>
        </div>
      )}
      <div className="p-7">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-[#f8f4ec]/40">
          <span>{project.period || 'PROJECT'}</span>
          {project.role ? <span className="text-[#ff6a3d]">{project.role}</span> : null}
        </div>
        <h3 className="mt-4 text-2xl font-black text-[#f8f4ec]">{project.title}</h3>
        <p className="mt-3 text-[15px] leading-7 text-[#f8f4ec]/55">{project.summary}</p>
        {project.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-[#f8f4ec]/60">{tag}</span>)}
          </div>
        ) : null}
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#ff6a3d]">
          查看项目
          <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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
    <section id="featured-projects" className="px-6 py-20 md:px-10" aria-label="Featured projects">
      <div className="mx-auto max-w-[1120px]">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#ff6a3d]">Projects</span>
          <h2 className="text-balance text-4xl font-black text-[#f8f4ec]">精选项目</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
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
    <section id="about" className="px-6 py-20 md:px-10" aria-label="About">
      <div className="mx-auto max-w-[1120px]">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#ff6a3d]">About</span>
          <h2 className="text-balance text-4xl font-black text-[#f8f4ec]">关于我</h2>
        </div>
        <div className="mt-8 max-w-3xl space-y-4">
          {items.slice(0, 3).map((item) => <p key={item} className="text-lg leading-8 text-[#f8f4ec]/70">{item}</p>)}
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
    <section id="contact" className="px-6 py-20 md:px-10" aria-label="Contact">
      <div className="mx-auto max-w-[1120px]">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#ff6a3d]">Contact</span>
          <h2 className="text-balance text-4xl font-black text-[#f8f4ec]">联系我</h2>
        </div>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#f8f4ec]/60">如果你对我的经历或项目感兴趣，欢迎联系我。</p>
        <div className="mt-9 grid max-w-2xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center gap-2 text-[#ff6a3d]"><Mail size={16} /><span className="font-mono text-[10px] uppercase tracking-[0.2em]">邮箱</span></div>
            <p className="mt-3 font-semibold text-[#f8f4ec]">{email || '暂未填写'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center gap-2 text-[#ff6a3d]"><Phone size={16} /><span className="font-mono text-[10px] uppercase tracking-[0.2em]">手机号</span></div>
            <p className="mt-3 font-semibold text-[#f8f4ec]">{phone || '暂未填写'}</p>
          </div>
        </div>
        <footer className="mt-16 border-t border-white/10 pt-6 text-sm text-[#f8f4ec]/35">Generated by PageU</footer>
      </div>
    </section>
  );
}

export function CinematicTemplate({ siteDraft }) {
  return (
    <div className="min-h-screen bg-[#0b0b0f] font-sans text-[#f8f4ec]" style={{ backgroundImage: 'radial-gradient(circle at 80% 8%, rgba(255,106,61,0.16), transparent 32%)' }}>
      <Hero siteDraft={siteDraft} />
      <ResumeSnapshot siteDraft={siteDraft} />
      <Projects siteDraft={siteDraft} />
      <About siteDraft={siteDraft} />
      <Contact siteDraft={siteDraft} />
    </div>
  );
}
