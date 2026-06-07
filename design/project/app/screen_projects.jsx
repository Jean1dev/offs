// screen_projects.jsx — Tela 1: Lista de projetos (home)

function ProjectCard({ p, nav }) {
  const count = p.artifacts ? p.artifacts.length : (p.artifactCount || 0);
  const doneN = (p.done || []).length, total = GUIDED_FLOW.length;
  return (
    <Card hover onClick={() => nav.project(p.id)} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 20px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <StatusBadge status={p.status} />
          <span onClick={e => e.stopPropagation()}><IconBtn name="more" size={28} title="Opções" /></span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, lineHeight: 1.22, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 14, minHeight: 52, textWrap: 'pretty' }}>{p.title}</div>

        {/* pipeline progress */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
              <div style={{ width: `${(doneN / total) * 100}%`, height: '100%', borderRadius: 999, background: 'var(--accent)' }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>{doneN}/{total}</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', padding: '11px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          <Icon name="layers" size={14} color="var(--text-tertiary)" />{count} {count === 1 ? 'artefato' : 'artefatos'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{p.updated}</span>
          <ModelChip model={p.model} size="sm" showName={false} />
        </span>
      </div>
    </Card>
  );
}

function ProjectsScreen({ nav }) {
  const [filter, setFilter] = useState('todos');
  const real = PROJECTS.filter(p => !p.empty);
  const filtered = filter === 'todos' ? real : real.filter(p => p.status === filter);
  const filters = [['todos', 'Todos'], ['ideia', 'Ideia'], ['roteiro', 'Roteiro'], ['producao', 'Produção'], ['publicado', 'Publicado']];

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 40px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 28 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <SectionLabel style={{ marginBottom: 10 }}>Seu estúdio</SectionLabel>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 300, letterSpacing: '-0.01em', color: 'var(--text-primary)', margin: 0, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
            Seus <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>projetos</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-secondary)', margin: '14px 0 0', maxWidth: 540, lineHeight: 1.6 }}>
            Cada projeto é um vídeo em produção. Acione os agentes para analisar seu canal, achar temas e escrever o roteiro.
          </p>
        </div>
        <Button icon="plus" size="lg" onClick={() => nav.project('novo')} style={{ flexShrink: 0 }}>Novo projeto</Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        {filters.map(([k, label]) => {
          const active = filter === k;
          const n = k === 'todos' ? real.length : real.filter(p => p.status === k).length;
          return (
            <button key={k} onClick={() => setFilter(k)} style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
              padding: '7px 15px', borderRadius: 'var(--radius-full)', cursor: 'pointer', transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: 7,
              background: active ? 'var(--accent)' : 'var(--bg-surface)', color: active ? '#fff' : 'var(--text-secondary)',
              border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'), boxShadow: active ? 'var(--shadow-accent)' : 'none' }}>
              {label}<span style={{ fontSize: 11, opacity: active ? 0.8 : 0.6 }}>{n}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 18 }}>
        {filtered.map(p => <ProjectCard key={p.id} p={p} nav={nav} />)}
        {/* new project tile */}
        <button onClick={() => nav.project('novo')} style={{ all: 'unset', cursor: 'pointer', minHeight: 196,
          border: '1.5px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-tertiary)', transition: 'all .18s', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}>
          <span style={{ width: 48, height: 48, borderRadius: 999, border: '1.5px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={22} /></span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 500 }}>Criar novo projeto</span>
        </button>
      </div>
    </div>
  );
}

window.ProjectsScreen = ProjectsScreen;
