// screen_project.jsx — Tela 2: Interior do projeto (visão geral)

// ── Guided stepper ──────────────────────────────────────
function GuidedStep({ agent, index, state, artifact, isNext, nav, project }) {
  // state: 'done' | 'next' | 'todo'
  const [h, setH] = useState(false);
  const ring = state === 'done' ? 'var(--accent)' : isNext ? 'var(--accent)' : 'var(--border-strong)';
  return (
    <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
      {/* rail */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid ' + ring, background: state === 'done' ? 'var(--accent)' : isNext ? 'var(--accent-light)' : 'var(--bg-surface)',
          color: state === 'done' ? '#fff' : isNext ? 'var(--accent)' : 'var(--text-tertiary)', flexShrink: 0, zIndex: 1 }}>
          {state === 'done' ? <Icon name="check" size={17} sw={2.4} /> : <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{index + 1}</span>}
        </div>
        {index < GUIDED_FLOW.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 26, background: state === 'done' ? 'var(--accent)' : 'var(--border)', marginTop: 2 }} />}
      </div>
      {/* body */}
      <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ flex: 1, marginBottom: 14, padding: isNext ? '16px 18px' : '8px 4px 16px',
          borderRadius: 'var(--radius-lg)', border: isNext ? '1px solid var(--accent)' : '1px solid transparent',
          background: isNext ? 'var(--accent-light)' : 'transparent', transition: 'all .18s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{agent.name}</span>
          <RoleTag role={agent.role} />
          {isNext && <Badge tone="rose" style={{ fontSize: 10 }}>Próximo passo</Badge>}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: state === 'todo' && !isNext ? 0 : 12, maxWidth: 520 }}>{agent.blurb}</div>

        {state === 'done' && (
          <button onClick={() => artifact ? nav.artifact(project.id, artifact.id) : nav.artifact(project.id, null, agent.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 12px 7px 9px', borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)', background: 'var(--bg-surface)', cursor: 'pointer', transition: 'all .15s',
              boxShadow: h ? 'var(--shadow-sm)' : 'none' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <AgentGlyph agent={agent} size={26} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }}>{agent.produces}</span>
            <Icon name="arrowR" size={14} color="var(--text-tertiary)" />
          </button>
        )}
        {isNext && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Button size="sm" icon="play" onClick={() => nav.agent(project.id, agent.id)}>Rodar {agent.name.toLowerCase()}</Button>
            {agent.requiresSources && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gold-600)', fontWeight: 500 }}><Icon name="lock" size={14} />Requer fontes suas</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function GuidedMode({ project, nav }) {
  const done = project.done || [];
  const nextId = GUIDED_FLOW.find(id => !done.includes(id));
  const canalAgent = agentById('analista-canais');
  const canalDone = done.includes('analista-canais');
  return (
    <div>
      {/* optional pre-step: competitor analysis */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--gold-400)', background: 'var(--gold-light)', color: 'var(--gold-600)', flexShrink: 0 }}>
            {canalDone ? <Icon name="check" size={16} sw={2.4} /> : <Icon name="compass" size={16} />}
          </div>
          <div style={{ width: 2, flex: 1, minHeight: 18, background: 'var(--border)', marginTop: 2 }} />
        </div>
        <div style={{ flex: 1, marginBottom: 14, padding: '14px 16px', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--gold-300)', background: 'color-mix(in srgb, var(--gold-light) 50%, transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{canalAgent.name}</span>
            <Badge tone="gold" icon="compass" style={{ fontSize: 10 }}>Ponto de partida · opcional</Badge>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 12, maxWidth: 520 }}>Antes de mapear o seu canal, vale analisar um concorrente a partir de prints. Não é obrigatório — mas dá contexto para os próximos passos.</div>
          <Button size="sm" variant={canalDone ? 'ghost' : 'gold'} icon={canalDone ? 'check' : 'image'} onClick={() => nav.agent(project.id, 'analista-canais')}>{canalDone ? 'Perfil do canal pronto' : 'Analisar um concorrente'}</Button>
        </div>
      </div>
      {GUIDED_FLOW.map((id, i) => {
        const agent = agentById(id);
        const isDone = done.includes(id);
        const isNext = id === nextId;
        const art = (project.artifacts || []).find(a => a.agentId === id);
        return <GuidedStep key={id} agent={agent} index={i} state={isDone ? 'done' : isNext ? 'next' : 'todo'} isNext={isNext} artifact={art} nav={nav} project={project} />;
      })}
    </div>
  );
}

// ── Free mode ───────────────────────────────────────────
function AgentCard({ agent, project, nav }) {
  const [h, setH] = useState(false);
  const ran = (project.done || []).includes(agent.id);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={() => nav.agent(project.id, agent.id)}
      style={{ background: 'var(--bg-surface)', border: '1px solid ' + (h ? 'var(--accent)' : 'var(--border)'), borderRadius: 'var(--radius-lg)',
        padding: 18, cursor: 'pointer', transition: 'all .18s', boxShadow: h ? 'var(--shadow-md)' : 'none', transform: h ? 'translateY(-2px)' : 'none', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, marginBottom: 12 }}>
        <AgentGlyph agent={agent} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>{agent.name}</span>
            {agent.startingPoint && <Badge tone="gold" style={{ fontSize: 9.5, padding: '1px 7px' }}>Ponto de partida</Badge>}
          </div>
          <div style={{ marginTop: 4 }}><RoleTag role={agent.role} /></div>
        </div>
        {ran && <Icon name="checkCircle" size={18} color="var(--success-fg)" title="Já rodado" />}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 14, flex: 1 }}>{agent.blurb}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-tertiary)' }}>
          <Icon name={agent.producesIcon} size={14} />{agent.produces}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: h ? 'var(--accent)' : 'var(--text-tertiary)', transition: 'color .15s' }}>
          Rodar <Icon name="arrowR" size={14} />
        </span>
      </div>
    </div>
  );
}

function FreeMode({ project, nav }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {Object.entries(CATEGORIES).map(([key, cat]) => (
        <div key={key}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Icon name={cat.icon} size={17} color="var(--accent)" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{cat.label}</span>
            <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>· {cat.blurb}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(258px, 1fr))', gap: 14 }}>
            {AGENTS.filter(a => a.cat === key).map(a => <AgentCard key={a.id} agent={a} project={project} nav={nav} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Artifact library panel ──────────────────────────────
function LibraryPanel({ project, nav }) {
  const arts = project.artifacts || [];
  return (
    <aside style={{ width: 320, flexShrink: 0 }}>
      <div style={{ position: 'sticky', top: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--text-primary)' }}>Biblioteca</span>
          <Badge tone="neutral">{arts.length}</Badge>
        </div>
        {arts.length === 0 ? (
          <div style={{ border: '1.5px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '32px 20px', textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', width: 46, height: 46, borderRadius: 999, background: 'var(--bg-subtle)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: 'var(--text-tertiary)' }}><Icon name="layers" size={22} /></span>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Nenhum artefato ainda</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Tudo que os agentes gerarem aparece aqui, pronto para reusar.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {arts.map(a => {
              const agent = agentById(a.agentId);
              return (
                <button key={a.id} onClick={() => nav.artifact(project.id, a.id)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
                  padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-surface)', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <AgentGlyph agent={agent} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</span>
                      {a.versions > 1 && <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-light)', padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>v{a.version}</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 2 }}>{agent.name} · {a.when}</div>
                  </div>
                  <ModelChip model={a.model} size="sm" showName={false} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Project header ──────────────────────────────────────
function ProjectHeader({ project }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <StatusBadge status={project.status} />
        <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>·</span>
        <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>Atualizado {project.updated}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 400, letterSpacing: '-0.01em', color: 'var(--text-primary)', margin: 0, lineHeight: 1.18, maxWidth: 640, textWrap: 'pretty' }}>{project.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Button variant="ghost" size="sm" icon="edit">Renomear</Button>
          <Button variant="ghost" size="sm" iconR="chevronD">Mudar status</Button>
        </div>
      </div>
      {/* meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 18, padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 32, height: 32, borderRadius: 999, background: 'linear-gradient(135deg, var(--rose-200), var(--rose-300))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--rose-700)' }}>{CHANNEL.initial}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{CHANNEL.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{CHANNEL.subs} inscritos · {CHANNEL.handle}</div>
          </div>
        </div>
        <div style={{ width: 1, height: 30, background: 'var(--border)' }} />
        <div>
          <SectionLabel style={{ marginBottom: 4, whiteSpace: 'nowrap' }}>Modelo do projeto</SectionLabel>
          <ModelChip model={project.model} />
        </div>
      </div>
    </div>
  );
}

// ── Empty state header (for the new project) ────────────
function EmptyProjectBody({ project, nav }) {
  const firstAgent = agentById(GUIDED_FLOW[0]);
  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--rose-50), var(--bg-surface))', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '40px 40px 36px', textAlign: 'center', maxWidth: 620, margin: '0 auto 28px' }}>
        <span style={{ display: 'inline-flex', width: 60, height: 60, borderRadius: 999, background: 'var(--accent-light)', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: 'var(--accent)' }}><Icon name="sparkles" size={28} /></span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 27, fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 10px', lineHeight: 1.2 }}>
          Seu projeto está pronto para <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>começar</span>
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 440, margin: '0 auto 22px' }}>
          Nenhum agente rodou ainda. Siga o modo guiado para construir seu vídeo do zero — ou pule direto para qualquer agente no modo livre.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button size="lg" icon="play" onClick={() => nav.agent(project.id, firstAgent.id)}>Começar pelo {firstAgent.name.toLowerCase()}</Button>
          <Button variant="ghost" size="lg" icon="image" onClick={() => nav.agent(project.id, 'analista-canais')}>Analisar um concorrente</Button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Icon name="route" size={17} color="var(--text-tertiary)" />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.01em' }}>O caminho sugerido</span>
      </div>
      <GuidedMode project={project} nav={nav} />
    </div>
  );
}

function ProjectScreen({ project, nav }) {
  const [mode, setMode] = useState('guided');
  const isEmpty = project.empty;

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 40px 80px' }}>
      <ProjectHeader project={project} />
      <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {!isEmpty && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 26, background: 'var(--bg-subtle)', padding: 4, borderRadius: 'var(--radius-full)', width: 'fit-content' }}>
              {[['guided', 'route', 'Modo guiado'], ['free', 'grid', 'Modo livre']].map(([k, ic, label]) => (
                <button key={k} onClick={() => setMode(k)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, transition: 'all .16s',
                  background: mode === k ? 'var(--bg-surface)' : 'transparent', color: mode === k ? 'var(--accent)' : 'var(--text-secondary)', boxShadow: mode === k ? 'var(--shadow-sm)' : 'none' }}>
                  <Icon name={ic} size={16} />{label}
                </button>
              ))}
            </div>
          )}
          {isEmpty ? <EmptyProjectBody project={project} nav={nav} />
            : mode === 'guided' ? <GuidedMode project={project} nav={nav} />
            : <FreeMode project={project} nav={nav} />}
        </div>
        <LibraryPanel project={project} nav={nav} />
      </div>
    </div>
  );
}

window.ProjectScreen = ProjectScreen;
