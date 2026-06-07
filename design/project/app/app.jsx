// app.jsx — Pauta shell: sidebar, topbar, router. Mounts everything.

const { useState, useEffect } = React;

// ── Wordmark ────────────────────────────────────────────
function Wordmark({ onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', userSelect: 'none' }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-accent)' }}>
        <Icon name="sparkle" size={18} color="#fff" filled />
      </span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 25, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--text-primary)', lineHeight: 1 }}>
        Pauta
      </span>
    </div>
  );
}

// ── Sidebar ─────────────────────────────────────────────
function Sidebar({ nav, screen, projectId }) {
  const recents = PROJECTS.filter(p => !p.empty).slice(0, 5);
  const NavItem = ({ icon, label, active, onClick, badge }) => {
    const [h, setH] = useState(false);
    return (
      <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left',
          padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', transition: 'all .14s',
          background: active ? 'var(--accent-light)' : (h ? 'var(--bg-subtle)' : 'transparent'),
          color: active ? 'var(--accent)' : 'var(--text-secondary)', fontFamily: 'var(--font-body)',
          fontSize: 13.5, fontWeight: active ? 600 : 500 }}>
        <Icon name={icon} size={18} />
        <span style={{ flex: 1 }}>{label}</span>
        {badge != null && <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>{badge}</span>}
      </button>
    );
  };
  return (
    <aside style={{ width: 248, flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 14px' }}>
      <div style={{ padding: '0 6px 18px' }}><Wordmark onClick={() => nav.projects()} /></div>

      <Button icon="plus" full size="md" onClick={() => nav.project('novo')} style={{ marginBottom: 18 }}>Novo projeto</Button>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem icon="folder" label="Projetos" active={screen === 'projects'} onClick={() => nav.projects()} badge={PROJECTS.filter(p => !p.empty).length} />
        <NavItem icon="grid" label="Biblioteca de agentes" onClick={() => nav.projects()} />
        <NavItem icon="settings" label="Modelos & ajustes" onClick={() => nav.projects()} />
      </nav>

      <div style={{ marginTop: 24, marginBottom: 8, padding: '0 12px' }}><SectionLabel>Projetos recentes</SectionLabel></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', flex: 1 }}>
        {recents.map(p => {
          const active = screen !== 'projects' && projectId === p.id;
          return (
            <button key={p.id} onClick={() => nav.project(p.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left',
                padding: '8px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: active ? 'var(--bg-subtle)' : 'transparent', transition: 'all .14s' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, flexShrink: 0, background:
                STATUS[p.status].tone === 'rose' ? 'var(--accent)' : STATUS[p.status].tone === 'gold' ? 'var(--gold)' :
                STATUS[p.status].tone === 'success' ? 'var(--success-fg)' : 'var(--text-tertiary)' }} />
              <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12.5, color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
            </button>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px' }}>
          <span style={{ width: 34, height: 34, borderRadius: 999, background: 'linear-gradient(135deg, var(--rose-200), var(--rose-300))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)',
            fontStyle: 'italic', color: 'var(--rose-700)', flexShrink: 0, fontSize: 15 }}>A</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Ana Clara</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Plano Criador</div>
          </div>
          <IconBtn name="settings" size={30} title="Ajustes" />
        </div>
      </div>
    </aside>
  );
}

// ── Topbar (breadcrumb) ─────────────────────────────────
function Topbar({ crumbs, right }) {
  return (
    <header style={{ height: 60, flexShrink: 0, borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
      backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Icon name="chevronR" size={15} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />}
            <span onClick={c.onClick} style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, cursor: c.onClick ? 'pointer' : 'default',
              color: i === crumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: i === crumbs.length - 1 ? 600 : 500,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 340 }}>{c.label}</span>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>{right}</div>
    </header>
  );
}

// ── Tweaks ──────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "rosa",
  "corners": "soft",
  "headingFont": "serif"
}/*EDITMODE-END*/;

const ACCENTS = {
  rosa:      { l: ['#C45C58', '#F9E8E3', '#8A2927', '0 8px 24px rgba(196,92,88,0.25)'], d: ['#D97E7A', 'rgba(196,92,88,0.16)', '#E8A8A3'] },
  terracota: { l: ['#A83D3A', '#F9E8E3', '#6B1C1A', '0 8px 24px rgba(168,61,58,0.28)'],  d: ['#D97E7A', 'rgba(168,61,58,0.18)', '#E8A8A3'] },
  dourado:   { l: ['#A8863A', '#FAF3E0', '#856729', '0 8px 24px rgba(168,134,58,0.28)'], d: ['#E2C56A', 'rgba(201,168,76,0.16)', '#F0DFA8'] },
  ardosia:   { l: ['#504D45', '#F4F3F1', '#242220', '0 8px 24px rgba(80,77,69,0.26)'],   d: ['#A09C91', 'rgba(160,156,145,0.16)', '#CCC9C0'] },
};

function applyTweaks(t) {
  let el = document.getElementById('pauta-tweaks');
  if (!el) { el = document.createElement('style'); el.id = 'pauta-tweaks'; document.head.appendChild(el); }
  const A = ACCENTS[t.accent] || ACCENTS.rosa;
  let css = `:root{--accent:${A.l[0]};--accent-light:${A.l[1]};--accent-dark:${A.l[2]};--shadow-accent:${A.l[3]};}\n`;
  css += `[data-theme="dark"]{--accent:${A.d[0]};--accent-light:${A.d[1]};--accent-dark:${A.d[2]};}\n`;
  if (t.corners === 'sharp') css += `:root{--radius-sm:3px;--radius-md:5px;--radius-lg:8px;--radius-xl:12px;}\n`;
  if (t.headingFont === 'sans') css += `:root{--font-display:var(--font-body);--display-weight:300;--h1-weight:500;--h2-weight:600;}\n`;
  el.textContent = css;
}

// ── App ─────────────────────────────────────────────────
function App() {
  const [route, setRoute] = useState({ screen: 'projects' });
  const [t, setTweak] = (window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}]);
  const [toast, setToast] = useState(null);

  useEffect(() => { document.documentElement.setAttribute('data-theme', t.theme); }, [t.theme]);
  useEffect(() => { applyTweaks(t); }, [t.accent, t.corners, t.headingFont]);
  useEffect(() => { if (toast) { const id = setTimeout(() => setToast(null), 2200); return () => clearTimeout(id); } }, [toast]);

  const nav = {
    projects: () => setRoute({ screen: 'projects' }),
    project:  (projectId) => setRoute({ screen: 'project', projectId }),
    agent:    (projectId, agentId) => setRoute({ screen: 'agent', projectId, agentId }),
    artifact: (projectId, artifactId, fromAgent) => setRoute({ screen: 'artifact', projectId, artifactId, fromAgent }),
    customize:(projectId, agentId) => setRoute({ screen: 'customize', projectId, agentId }),
    toast: (msg) => setToast(msg),
  };

  let content, crumbs = [{ label: 'Projetos', onClick: () => nav.projects() }], right = null;
  const proj = route.projectId ? projectById(route.projectId) : null;

  if (route.screen === 'projects') {
    content = <ProjectsScreen nav={nav} />;
    crumbs = [{ label: 'Projetos' }];
    right = <ModelChip model="claude" size="sm" />;
  } else if (route.screen === 'project') {
    content = <ProjectScreen nav={nav} project={proj} />;
    crumbs = [{ label: 'Projetos', onClick: () => nav.projects() }, { label: proj.title }];
  } else if (route.screen === 'agent') {
    content = <AgentScreen nav={nav} project={proj} agent={agentById(route.agentId)} />;
    crumbs = [{ label: 'Projetos', onClick: () => nav.projects() }, { label: proj.title, onClick: () => nav.project(proj.id) }, { label: agentById(route.agentId).name }];
  } else if (route.screen === 'artifact') {
    content = <ArtifactScreen nav={nav} project={proj} artifactId={route.artifactId} fromAgent={route.fromAgent} />;
    crumbs = [{ label: 'Projetos', onClick: () => nav.projects() }, { label: proj.title, onClick: () => nav.project(proj.id) }, { label: 'Artefato' }];
  } else if (route.screen === 'customize') {
    content = <CustomizeScreen nav={nav} project={proj} agent={agentById(route.agentId)} />;
    const a = agentById(route.agentId);
    crumbs = [{ label: 'Projetos', onClick: () => nav.projects() }, { label: proj.title, onClick: () => nav.project(proj.id) }, { label: a.name, onClick: () => nav.agent(proj.id, a.id) }, { label: 'Customizar' }];
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar nav={nav} screen={route.screen} projectId={route.projectId} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        <Topbar crumbs={crumbs} right={right} />
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>{content}</div>
      </main>
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 100,
          background: 'var(--neutral-900)', color: 'var(--neutral-50)', padding: '11px 20px', borderRadius: 'var(--radius-full)',
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 9 }}>
          <Icon name="check" size={16} color="var(--rose-300)" />{toast}
        </div>
      )}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection label="Aparência" />
          <window.TweakRadio label="Tema" value={t.theme} options={[{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Escuro' }]} onChange={v => setTweak('theme', v)} />
          <window.TweakColor label="Cor de destaque" value={ACCENTS[t.accent].l[0]}
            options={Object.keys(ACCENTS).map(k => ACCENTS[k].l[0])}
            onChange={hex => { const k = Object.keys(ACCENTS).find(k => ACCENTS[k].l[0] === hex); if (k) setTweak('accent', k); }} />
          <window.TweakRadio label="Cantos" value={t.corners} options={[{ value: 'soft', label: 'Suaves' }, { value: 'sharp', label: 'Retos' }]} onChange={v => setTweak('corners', v)} />
          <window.TweakSection label="Tipografia" />
          <window.TweakRadio label="Títulos" value={t.headingFont} options={[{ value: 'serif', label: 'Serifa' }, { value: 'sans', label: 'Sem serifa' }]} onChange={v => setTweak('headingFont', v)} />
        </window.TweaksPanel>
      )}
    </div>
  );
}

window.App = App;
