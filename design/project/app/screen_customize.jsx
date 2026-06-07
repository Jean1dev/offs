// screen_customize.jsx — Tela 5: Customização de agente

const BASE_PROMPTS = {
  default: (agent) => `Você é o "${agent.name}", um agente especialista do Pauta.

OBJETIVO
${agent.desc}

ENTRADA ESPERADA
${agent.inputs.map(i => '· ' + INPUT[i].label + ' — ' + INPUT[i].hint).join('\n')}

ARTEFATO PRODUZIDO
${agent.produces}

DIRETRIZES
· Escreva sempre em português do Brasil, tom direto e produtivo.
· Estruture a saída em seções claras, prontas para reuso por outros agentes.
· Seja específico: prefira exemplos e números a generalidades.${agent.requiresSources ? '\n· POLÍTICA EDITORIAL: use exclusivamente as fontes fornecidas pelo usuário. Nunca invente dados, estatísticas ou citações.' : ''}`,
};

function CustomizeScreen({ project, agent, nav }) {
  const base = BASE_PROMPTS.default(agent);
  const [prompt, setPrompt] = useState(base);
  const [model, setModel] = useState(project.model);
  const [scope, setScope] = useState('project');
  const dirty = prompt !== base || model !== project.model;

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 40px 90px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
        <AgentGlyph agent={agent} size={50} style={{ borderRadius: 'var(--radius-md)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            <SectionLabel>Customização de agente</SectionLabel>
            <Badge tone="gold" icon="sparkle" style={{ fontSize: 10 }}>Avançado</Badge>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text-primary)', margin: 0, lineHeight: 1.15 }}>{agent.name}</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => nav.agent(project.id, agent.id)}>Cancelar</Button>
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* prompt editor */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Prompt base</span>
            <button onClick={() => { setPrompt(base); setModel(project.model); }} disabled={!dirty}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: dirty ? 'pointer' : 'default',
                fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 500, color: dirty ? 'var(--accent)' : 'var(--text-tertiary)', padding: 0 }}>
              <Icon name="refresh" size={14} />Restaurar padrão original
            </button>
          </div>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', minHeight: 420, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 18px',
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)', outline: 'none', resize: 'vertical', background: 'var(--bg-surface)', tabSize: 2 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12, color: 'var(--text-tertiary)' }}>
            <Icon name="alert" size={14} color="var(--text-tertiary)" />
            Edite com cuidado — o prompt define como o agente interpreta seus inputs e estrutura o artefato.
          </div>
        </div>

        {/* right rail */}
        <aside style={{ width: 300, flexShrink: 0, position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card style={{ padding: 20 }}>
            <SectionLabel style={{ marginBottom: 12 }}>Modelo de IA</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.keys(MODELS).map(k => {
                const on = model === k;
                return (
                  <button key={k} onClick={() => setModel(k)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 'var(--radius-md)',
                    border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border)'), background: on ? 'var(--accent-light)' : 'transparent', transition: 'all .15s' }}>
                    <ModelChip model={k} size="sm" showName={false} />
                    <span style={{ flex: 1, fontSize: 12.5, fontWeight: on ? 600 : 500, color: on ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{MODELS[k].name}</span>
                    {on && <Icon name="check" size={15} color="var(--accent)" sw={2.4} />}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card style={{ padding: 20 }}>
            <SectionLabel style={{ marginBottom: 12 }}>Salvar como</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['project', 'folder', 'Só neste projeto', 'Vale apenas para "' + project.title.slice(0, 22) + (project.title.length > 22 ? '…' : '') + '"'],
                ['global', 'grid', 'Padrão global', 'Aplica a todos os seus projetos futuros']].map(([k, ic, t, d]) => {
                const on = scope === k;
                return (
                  <button key={k} onClick={() => setScope(k)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 11, padding: '11px 12px', borderRadius: 'var(--radius-md)',
                    border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border)'), background: on ? 'var(--accent-light)' : 'transparent', transition: 'all .15s' }}>
                    <span style={{ width: 16, height: 16, borderRadius: 999, flexShrink: 0, marginTop: 2, border: '1.5px solid ' + (on ? 'var(--accent)' : 'var(--border-strong)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--accent)' }} />}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1.4 }}>{d}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Button full size="lg" icon="check" disabled={!dirty} onClick={() => { nav.toast('Versão personalizada salva'); nav.agent(project.id, agent.id); }}>Salvar versão</Button>
        </aside>
      </div>
    </div>
  );
}

window.CustomizeScreen = CustomizeScreen;
