// screen_agent.jsx — Tela 3: Execução de um agente (compositor de input)

function InputTypePills({ agent }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {agent.inputs.map(t => (
        <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)',
          padding: '4px 11px', borderRadius: 'var(--radius-full)', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <Icon name={INPUT[t].icon} size={13} color="var(--accent)" />{INPUT[t].label}
        </span>
      ))}
    </div>
  );
}

// ── image dropzone ──────────────────────────────────────
function ImageInput({ images, setImages }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(116px, 1fr))', gap: 10 }}>
        {images.map((im, i) => (
          <div key={i} style={{ position: 'relative', aspectRatio: '16/10', borderRadius: 'var(--radius-md)', overflow: 'hidden',
            background: `linear-gradient(135deg, var(--rose-100), var(--rose-200))`, border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="image" size={22} color="var(--rose-400)" />
            <span style={{ position: 'absolute', bottom: 5, left: 7, fontSize: 10, color: 'var(--rose-700)', fontWeight: 500 }}>{im}</span>
            <button onClick={() => setImages(images.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><Icon name="x" size={12} sw={2.2} /></button>
          </div>
        ))}
        <button onClick={() => setImages([...images, `print-${images.length + 1}.png`])}
          style={{ all: 'unset', cursor: 'pointer', aspectRatio: '16/10', border: '1.5px dashed var(--border-strong)', borderRadius: 'var(--radius-md)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-tertiary)', transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
          <Icon name="upload" size={20} /><span style={{ fontSize: 11.5, fontWeight: 500 }}>Adicionar print</span>
        </button>
      </div>
    </div>
  );
}

// ── artifact selector ───────────────────────────────────
function ArtifactSelect({ project, selected, setSelected, expected }) {
  const arts = project.artifacts || [];
  if (arts.length === 0) return (
    <div style={{ padding: '16px 18px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-strong)', fontSize: 13, color: 'var(--text-secondary)' }}>
      Nenhum artefato disponível neste projeto ainda.
    </div>
  );
  const toggle = id => setSelected(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {arts.map(a => {
        const agent = agentById(a.agentId);
        const on = selected.includes(a.id);
        const rec = expected && a.name === expected;
        return (
          <div key={a.id} onClick={() => toggle(a.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all .15s',
            border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border)'), background: on ? 'var(--accent-light)' : 'var(--bg-surface)' }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: on ? 'none' : '1.5px solid var(--border-strong)', background: on ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={13} color="#fff" sw={2.6} />}</span>
            <AgentGlyph agent={agent} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</span>
                {rec && <Badge tone="rose" style={{ fontSize: 9.5, padding: '1px 7px' }}>Recomendado</Badge>}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 1 }}>{agent.name} · {a.when}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NarrativeSelect({ value, setValue }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {NARRATIVE_MODELS.map(m => {
        const on = value === m.id;
        return (
          <button key={m.id} onClick={() => setValue(m.id)} style={{ all: 'unset', cursor: 'pointer', padding: '13px 15px', borderRadius: 'var(--radius-md)', transition: 'all .15s',
            border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border)'), background: on ? 'var(--accent-light)' : 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: on ? 'var(--accent)' : 'var(--text-primary)' }}>{m.name}</span>
              <span style={{ width: 16, height: 16, borderRadius: 999, border: '1.5px solid ' + (on ? 'var(--accent)' : 'var(--border-strong)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--accent)' }} />}</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{m.blurb}</div>
          </button>
        );
      })}
    </div>
  );
}

// ── sources (Roteirista editorial policy) ───────────────
function SourcesInput({ sources, setSources }) {
  const [draft, setDraft] = useState('');
  const add = () => { if (draft.trim()) { setSources([...sources, draft.trim()]); setDraft(''); } };
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: sources.length ? 12 : 0 }}>
        <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Cole o link ou trecho de uma fonte (artigo, matéria, dado)…"
          style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-surface)' }} />
        <Button variant="secondary" icon="plus" onClick={add}>Adicionar</Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sources.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <Icon name="link" size={15} color="var(--accent)" />
            <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</span>
            <button onClick={() => setSources(sources.filter((_, j) => j !== i))} style={{ all: 'unset', cursor: 'pointer', color: 'var(--text-tertiary)' }}><Icon name="x" size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── composer section wrapper ────────────────────────────
function Field({ label, hint, optional, children, icon }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
        {icon && <Icon name={icon} size={15} color="var(--text-tertiary)" style={{ alignSelf: 'center' }} />}
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
        {optional && <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>opcional</span>}
        {hint && <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function AgentScreen({ project, agent, nav, tweaks }) {
  const dual = agent.dualContext;
  const [ctxMode, setCtxMode] = useState(dual ? 'rascunho' : null);
  // effective agent view — for dual-context agents the inputs/desc/produces swap by mode
  const ctx = dual ? agent.contexts[ctxMode] : null;
  const eff = {
    inputs: ctx ? ctx.inputs : agent.inputs,
    inputArtifact: ctx ? ctx.inputArtifact : agent.inputArtifact,
    produces: ctx ? ctx.produces : agent.produces,
    requiresSources: agent.requiresSources,
    narrative: agent.narrative,
  };

  const [images, setImages] = useState(agent.inputs.includes('image') && !project.empty ? ['lista-videos.png', 'painel-canal.png'] : []);
  const [text, setText] = useState('');
  const [selArts, setSelArts] = useState(() => {
    const a = (project.artifacts || []).find(x => x.name === agent.inputArtifact);
    return a ? [a.id] : [];
  });
  const [narrative, setNarrative] = useState('hibrido');
  const [sources, setSources] = useState([]);
  const [model, setModel] = useState(project.model);
  const [running, setRunning] = useState(false);

  const sourcesMissing = eff.requiresSources && eff.inputs.includes('sources') && sources.length === 0;
  const refMissing = dual && ctxMode === 'referencia' && text.trim().length === 0;
  const canRun = !sourcesMissing && !refMissing;

  const run = () => {
    if (!canRun) return;
    setRunning(true);
    setTimeout(() => nav.artifact(project.id, null, agent.id), 2100);
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px 90px' }}>
      {/* header */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 28 }}>
        <AgentGlyph agent={agent} size={56} style={{ borderRadius: 'var(--radius-md)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <SectionLabel>{CATEGORIES[agent.cat].label}</SectionLabel>
            <RoleTag role={agent.role} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.15 }}>{agent.name}</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: 620 }}>{dual ? ctx.desc : agent.desc}</p>
        </div>
        <Button variant="ghost" size="sm" icon="settings" onClick={() => nav.customize(project.id, agent.id)} style={{ flexShrink: 0 }}>Customizar</Button>
      </div>

      {/* dual-context mode switch */}
      {dual && (
        <div style={{ marginBottom: 28 }}>
          <SectionLabel style={{ marginBottom: 10 }}>Em que momento você está?</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {Object.entries(agent.contexts).map(([k, c]) => {
              const on = ctxMode === k;
              return (
                <button key={k} onClick={() => setCtxMode(k)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 13, padding: '15px 17px', borderRadius: 'var(--radius-lg)', transition: 'all .16s',
                  border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border)'), background: on ? 'var(--accent-light)' : 'var(--bg-surface)' }}>
                  <span style={{ width: 18, height: 18, borderRadius: 999, flexShrink: 0, marginTop: 2, border: '1.5px solid ' + (on ? 'var(--accent)' : 'var(--border-strong)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <span style={{ width: 9, height: 9, borderRadius: 999, background: 'var(--accent)' }} />}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, fontWeight: 600, color: on ? 'var(--accent)' : 'var(--text-primary)' }}>{c.label}</span>
                      <Badge tone={k === 'referencia' ? 'gold' : 'rose'} style={{ fontSize: 9.5, padding: '1px 7px' }}>{c.sub}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45, marginTop: 4 }}>{k === 'referencia' ? 'Aprende com um roteiro externo que você admira.' : 'Revisa o seu próprio rascunho antes de gravar.'}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* composer */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>Monte o contexto</span>
            <span style={{ marginLeft: 'auto' }}><InputTypePills agent={{ inputs: eff.inputs }} /></span>
          </div>

          {/* editorial policy banner */}
          {agent.requiresSources && (
            <div style={{ display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: 24,
              background: 'var(--gold-light)', border: '1px solid var(--gold-300)' }}>
              <Icon name="lock" size={18} color="var(--gold-600)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--gold-600)', marginBottom: 2 }}>Política editorial</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>O Roteirista escreve <strong>somente</strong> a partir das fontes que você fornecer. Sem fontes, ele não roda — nada de inventar dados.</div>
              </div>
            </div>
          )}

          {eff.inputs.includes('image') && (
            <Field label="Prints do YouTube" icon="image" hint={`${images.length} ${images.length === 1 ? 'imagem' : 'imagens'}`}>
              <ImageInput images={images} setImages={setImages} />
            </Field>
          )}

          {eff.inputs.includes('artifact') && (
            <Field label="Artefatos do projeto" icon="layers" optional={eff.inputs.length > 1 && !eff.inputArtifact}>
              <ArtifactSelect project={project} selected={selArts} setSelected={setSelArts} expected={eff.inputArtifact} />
            </Field>
          )}

          {/* external reference script (dual-context referência mode) */}
          {dual && ctxMode === 'referencia' && (
            <Field label="Roteiro de referência" icon="fileText" hint={refMissing ? 'obrigatório' : `${text.trim().split(/\s+/).filter(Boolean).length} palavras`}>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={7}
                placeholder="Cole aqui a transcrição ou roteiro do vídeo de referência que você quer analisar…"
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px',
                  fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--text-primary)', outline: 'none', resize: 'vertical', lineHeight: 1.6, background: 'var(--bg-surface)' }} />
            </Field>
          )}

          {eff.inputs.includes('sources') && (
            <Field label="Fontes" icon="link" hint={sourcesMissing ? 'obrigatório' : `${sources.length} ${sources.length === 1 ? 'fonte' : 'fontes'}`}>
              <SourcesInput sources={sources} setSources={setSources} />
            </Field>
          )}

          {eff.inputs.includes('text') && !(dual && ctxMode === 'referencia') && (
            <Field label={eff.requiresSources ? 'Direcionamentos extras' : 'Texto livre'} icon="text" optional={eff.inputs.length > 1}>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={4}
                placeholder={eff.requiresSources ? 'Tom de voz, ênfases, o que evitar…' : 'Contexto, tema, ângulo que você quer explorar…'}
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px',
                  fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--text-primary)', outline: 'none', resize: 'vertical', lineHeight: 1.6, background: 'var(--bg-surface)' }} />
            </Field>
          )}

          {eff.narrative && (
            <Field label="Modelo narrativo" icon="blocks">
              <NarrativeSelect value={narrative} setValue={setNarrative} />
            </Field>
          )}
        </div>

        {/* right rail */}
        <aside style={{ width: 300, flexShrink: 0, position: 'sticky', top: 24 }}>
          <Card style={{ padding: 20 }}>
            <SectionLabel style={{ marginBottom: 12 }}>Vai produzir</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}><Icon name={agent.producesIcon} size={19} /></span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)' }}>{eff.produces}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <SectionLabel>Modelo de IA</SectionLabel>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-tertiary)' }}><Icon name="clock" size={11} color="var(--text-tertiary)" />só nesta execução</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {Object.keys(MODELS).map(k => {
                const on = model === k;
                return (
                  <button key={k} onClick={() => setModel(k)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 'var(--radius-md)',
                    border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border)'), background: on ? 'var(--accent-light)' : 'transparent', transition: 'all .15s' }}>
                    <ModelChip model={k} size="sm" showName={false} />
                    <span style={{ flex: 1, fontSize: 12.5, fontWeight: on ? 600 : 500, color: on ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{MODELS[k].name}</span>
                    {on && k === project.model && <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>padrão</span>}
                    {on && <Icon name="check" size={15} color="var(--accent)" sw={2.4} />}
                  </button>
                );
              })}
            </div>
            <Button full size="lg" icon={running ? null : 'play'} onClick={run} disabled={!canRun || running}>
              {running ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}><Spinner />Gerando…</span> : `Rodar agente`}
            </Button>
            {sourcesMissing && <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, fontSize: 12, color: 'var(--gold-600)', justifyContent: 'center' }}><Icon name="alert" size={14} />Aguardando fontes</div>}
            {refMissing && <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, fontSize: 12, color: 'var(--text-tertiary)', justifyContent: 'center' }}><Icon name="alert" size={14} />Cole o roteiro de referência</div>}
            <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>O artefato será salvo na biblioteca do projeto.</div>
          </Card>
        </aside>
      </div>

      {running && <RunOverlay agent={agent} />}
    </div>
  );
}

function Spinner({ size = 16, color = '#fff' }) {
  return <span style={{ width: size, height: size, borderRadius: 999, border: `2px solid ${color}`, borderTopColor: 'transparent', display: 'inline-block', animation: 'pauta-spin .7s linear infinite' }} />;
}

function RunOverlay({ agent }) {
  const steps = ['Lendo o contexto…', 'Aplicando a política do agente…', `Gerando ${agent.produces.toLowerCase()}…`];
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(p => Math.min(p + 1, steps.length - 1)), 650); return () => clearInterval(t); }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--bg) 70%, transparent)', backdropFilter: 'blur(3px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <span style={{ position: 'relative', width: 64, height: 64, borderRadius: 18, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
          <Icon name={agent.icon} size={30} />
          <span style={{ position: 'absolute', inset: -4, borderRadius: 20, border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'pauta-spin .9s linear infinite' }} />
        </span>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{steps[i]}</div>
      </div>
    </div>
  );
}

window.AgentScreen = AgentScreen;
