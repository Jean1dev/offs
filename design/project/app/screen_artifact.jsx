// screen_artifact.jsx — Tela 4: Visualização do artefato gerado

// ── block renderer ──────────────────────────────────────
function Block({ b }) {
  const wrap = { marginBottom: 26 };
  switch (b.t) {
    case 'lead':
      return <p style={{ ...wrap, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, lineHeight: 1.45, color: 'var(--text-primary)', textWrap: 'pretty' }}>{b.text}</p>;
    case 'h':
      return <h3 style={{ ...wrap, marginTop: 36, marginBottom: 14, fontFamily: 'var(--font-display)', fontSize: 23, fontWeight: 500, color: 'var(--text-primary)' }}>{b.text}</h3>;
    case 'p':
      return <p style={{ ...wrap, fontFamily: 'var(--font-body)', fontSize: 15.5, lineHeight: 1.75, color: 'var(--text-secondary)' }}>{b.text}</p>;
    case 'metrics':
      return (
        <div style={{ ...wrap, display: 'grid', gridTemplateColumns: `repeat(${b.items.length}, 1fr)`, gap: 12 }}>
          {b.items.map((m, i) => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 18px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1 }}>{m.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>{m.label}</div>
            </div>
          ))}
        </div>
      );
    case 'split':
      return (
        <div style={{ ...wrap, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[b.left, b.right].map((col, ci) => (
            <div key={ci} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Icon name={ci === 0 ? 'checkCircle' : 'alert'} size={17} color={ci === 0 ? 'var(--success-fg)' : 'var(--gold-600)'} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{col.title}</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.items.map((it, i) => (
                  <li key={i} style={{ display: 'flex', gap: 9, fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                    <span style={{ color: ci === 0 ? 'var(--success-fg)' : 'var(--gold-600)', flexShrink: 0, marginTop: 1 }}>{ci === 0 ? '+' : '–'}</span>{it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    case 'list':
      return (
        <div style={{ ...wrap, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {b.items.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 13 }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--accent)', flexShrink: 0, marginTop: 8 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>{it.title}</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55, marginTop: 2 }}>{it.text}</div>
              </div>
            </div>
          ))}
        </div>
      );
    case 'table':
      return (
        <div style={{ ...wrap, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
            <thead><tr style={{ background: 'var(--bg-subtle)' }}>
              {b.cols.map((c, i) => <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '11px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{c}</th>)}
            </tr></thead>
            <tbody>
              {b.rows.map((r, ri) => (
                <tr key={ri} style={{ borderTop: '1px solid var(--border)' }}>
                  {r.map((cell, ci) => <td key={ci} style={{ textAlign: ci === 0 ? 'left' : 'right', padding: '11px 16px', fontSize: 13.5, color: ci === 0 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: ci === 0 ? 500 : 400 }}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'ranked':
      return (
        <div style={{ ...wrap, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {b.items.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: i === 0 ? 'var(--accent)' : 'var(--text-tertiary)', lineHeight: 1, width: 24, flexShrink: 0 }}>{it.rank}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>{it.title}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                    <span style={{ width: 56, height: 5, borderRadius: 999, background: 'var(--bg-subtle)', overflow: 'hidden', display: 'inline-block' }}><span style={{ display: 'block', width: `${it.score}%`, height: '100%', background: it.score > 60 ? 'var(--accent)' : 'var(--text-tertiary)' }} /></span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: 22 }}>{it.score}</span>
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4 }}>{it.text}</div>
              </div>
            </div>
          ))}
        </div>
      );
    case 'blocks':
      return (
        <div style={{ ...wrap, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {b.items.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ width: 11, height: 11, borderRadius: 999, border: '2.5px solid var(--accent)', background: 'var(--bg)', marginTop: 5 }} />
                {i < b.items.length - 1 && <span style={{ width: 2, flex: 1, background: 'var(--border)' }} />}
              </div>
              <div style={{ paddingBottom: 18, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <Badge tone="rose" style={{ fontSize: 10 }}>{it.tag}</Badge>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>{it.title}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>{it.dur}</span>
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{it.text}</div>
              </div>
            </div>
          ))}
        </div>
      );
    case 'script':
      return (
        <div style={{ ...wrap, paddingLeft: 16, borderLeft: '2px solid var(--accent)' }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>{b.speaker}</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15.5, lineHeight: 1.7, color: 'var(--text-primary)', margin: 0 }}>{b.text}</p>
        </div>
      );
    case 'note':
      return <div style={{ ...wrap, display: 'flex', gap: 9, alignItems: 'center', fontSize: 12.5, color: 'var(--text-tertiary)', fontStyle: 'italic' }}><Icon name="link" size={14} color="var(--text-tertiary)" />{b.text}</div>;
    case 'score':
      return (
        <div style={{ ...wrap, display: 'flex', alignItems: 'center', gap: 18, padding: 22, background: 'linear-gradient(135deg, var(--rose-50), var(--bg-surface))', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 300, color: 'var(--accent)', lineHeight: 1 }}>{b.value}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{b.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>{b.sub}</div>
          </div>
        </div>
      );
    default: return null;
  }
}

// ── "use as input" picker ───────────────────────────────
function UsePicker({ project, onPick, onClose }) {
  const eligible = AGENTS.filter(a => a.inputs.includes('artifact'));
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(20,18,16,0.4)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 480, maxHeight: '80vh', overflowY: 'auto', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', padding: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-primary)' }}>Usar como input</span>
          <IconBtn name="x" size={32} onClick={onClose} />
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 18px', lineHeight: 1.55 }}>Escolha o agente que vai receber este artefato como contexto.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {eligible.map(a => (
            <button key={a.id} onClick={() => onPick(a.id)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13, padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}>
              <AgentGlyph agent={a} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 1 }}>Produz: {a.produces}</div>
              </div>
              <Icon name="arrowR" size={16} color="var(--text-tertiary)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function VersionSwitcher({ version, versions, nav }) {
  const [open, setOpen] = useState(false);
  if (!versions || versions <= 1) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--text-tertiary)' }}><Icon name="layers" size={13} color="var(--text-tertiary)" />v1 · única versão</span>
  );
  return (
    <span style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: 'var(--bg-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600, color: 'var(--accent)' }}>
        <Icon name="layers" size={13} color="var(--accent)" />v{version} de {versions}<Icon name="chevronD" size={12} color="var(--text-tertiary)" />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, width: 230, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 30, overflow: 'hidden' }}>
          {Array.from({ length: versions }).map((_, idx) => {
            const v = versions - idx; const cur = v === version;
            return (
              <button key={v} onClick={() => setOpen(false)} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', borderBottom: idx < versions - 1 ? '1px solid var(--border)' : 'none', background: cur ? 'var(--accent-light)' : 'transparent' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: cur ? 'var(--accent)' : 'var(--text-primary)' }}>v{v}</span>
                <span style={{ flex: 1, fontSize: 11.5, color: 'var(--text-tertiary)' }}>{v === versions ? 'mais recente' : `geração anterior`}</span>
                {cur && <Icon name="check" size={14} color="var(--accent)" sw={2.4} />}
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
}

function ArtifactScreen({ project, artifactId, fromAgent, nav }) {
  const [picker, setPicker] = useState(false);
  const meta = artifactId
    ? (() => { const a = (project.artifacts || []).find(x => x.id === artifactId); return { agentId: a.agentId, name: a.name, model: a.model, when: a.when, version: a.version, versions: a.versions }; })()
    : (() => { const ag = agentById(fromAgent); return { agentId: fromAgent, name: ag.produces, model: project.model, when: 'agora mesmo', version: 1, versions: 1 }; })();
  const agent = agentById(meta.agentId);
  const content = ARTIFACT_CONTENT[meta.agentId] || { summary: 'Artefato gerado.', blocks: [{ t: 'p', text: 'Conteúdo do artefato.' }] };
  const justGen = !artifactId;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 40px 90px' }}>
      {justGen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', marginBottom: 22, background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', border: '1px solid color-mix(in srgb, var(--success-fg) 25%, transparent)' }}>
          <Icon name="checkCircle" size={18} color="var(--success-fg)" />
          <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--success-fg)' }}>Artefato gerado e salvo na biblioteca do projeto.</span>
        </div>
      )}
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 20 }}>
        <AgentGlyph agent={agent} size={52} style={{ borderRadius: 'var(--radius-md)' }} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.12 }}>{meta.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--text-tertiary)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name={agent.icon} size={14} color="var(--text-tertiary)" />{agent.name}</span>
            <span>·</span><ModelChip model={meta.model} size="sm" />
            <span>·</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={13} color="var(--text-tertiary)" />{meta.when}</span>
            <span>·</span><VersionSwitcher version={meta.version} versions={meta.versions} nav={nav} />
          </div>
        </div>
      </div>

      {/* actions */}
      <div style={{ marginBottom: 28, paddingBottom: 22, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" icon="copy" onClick={() => nav.toast('Artefato copiado')}>Copiar</Button>
          <Button size="sm" icon="arrowR" onClick={() => setPicker(true)}>Usar como input</Button>
          <Button variant="ghost" size="sm" icon="refresh" onClick={() => nav.agent(project.id, meta.agentId)}>Regenerar</Button>
          <Button variant="ghost" size="sm" icon="edit" onClick={() => nav.toast('Renomear artefato')}>Renomear</Button>
          <span style={{ marginLeft: 'auto' }}><IconBtn name="download" title="Exportar" /></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 11.5, color: 'var(--text-tertiary)' }}>
          <Icon name="layers" size={13} color="var(--text-tertiary)" />Regenerar cria uma nova versão — a anterior fica preservada no histórico.
        </div>
      </div>

      {/* summary */}
      <div style={{ display: 'flex', gap: 13, padding: '16px 18px', background: 'var(--accent-light)', borderRadius: 'var(--radius-lg)', marginBottom: 32 }}>
        <Icon name="sparkles" size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 5 }}>Resumo</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--rose-800)', margin: 0 }}>{content.summary}</p>
        </div>
      </div>

      {/* body */}
      <div>{content.blocks.map((b, i) => <Block key={i} b={b} />)}</div>

      {picker && <UsePicker project={project} onClose={() => setPicker(false)} onPick={id => { setPicker(false); nav.agent(project.id, id); }} />}
    </div>
  );
}

window.ArtifactScreen = ArtifactScreen;
