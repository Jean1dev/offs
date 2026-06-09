// Landing.tsx — public landing page shown at "/" for logged-out visitors.
// Ported from the Claude Design handoff (design/project/Landing.html); the
// cosmetic email waitlist is replaced by CTAs that drive Google sign-in (/login).

import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { LandingEffects } from "@/components/landing/LandingEffects";
import styles from "@/components/landing/Landing.module.css";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

type MockRow = { icon: IconName; name: string; sub: string; state: "done" | "run" };
const mockRows: MockRow[] = [
  { icon: "video", name: "Catálogo de vídeos", sub: "Analista de conteúdo", state: "done" },
  { icon: "target", name: "Guia do canal", sub: "Analista de oportunidade", state: "done" },
  { icon: "trending", name: "Lista de temas", sub: "Analista de temas · v2", state: "done" },
  { icon: "book", name: "Briefing do tema", sub: "Resumidor de temas", state: "done" },
  { icon: "blocks", name: "Estrutura do roteiro", sub: "Estruturador · escrevendo agora", state: "run" },
];

type FlowNode = { icon: IconName; lab: string; kind: "in" | "key" | "cap" };
const flow: FlowNode[] = [
  { icon: "image", lab: "Prints do canal", kind: "in" },
  { icon: "video", lab: "Catálogo", kind: "key" },
  { icon: "target", lab: "Guia do canal", kind: "key" },
  { icon: "trending", lab: "Lista de temas", kind: "key" },
  { icon: "book", lab: "Briefing", kind: "key" },
  { icon: "blocks", lab: "Estrutura", kind: "key" },
  { icon: "fileText", lab: "Rascunho do roteiro", kind: "key" },
  { icon: "sparkles", lab: "Introdução refinada", kind: "key" },
  { icon: "microscope", lab: "Laudo de revisão", kind: "cap" },
];

type Agent = {
  icon: IconName;
  role: "Produtor" | "Revisor";
  name: string;
  bl: string;
  in: [IconName, string];
  out: string;
};
type Category = {
  icon: IconName;
  tint: "rose" | "gold";
  title: string;
  blurb: string;
  agents: Agent[];
};
const CATS: Category[] = [
  {
    icon: "trending",
    tint: "rose",
    title: "Canal do YouTube",
    blurb: "Inteligência e estratégia do canal",
    agents: [
      { icon: "compass", role: "Produtor", name: "Analista de canais", bl: "Disseca um canal concorrente a partir de prints.", in: ["image", "Prints"], out: "Perfil do canal" },
      { icon: "video", role: "Produtor", name: "Analista de conteúdo", bl: "Transforma prints da lista de vídeos em um catálogo estruturado.", in: ["image", "Prints"], out: "Catálogo de vídeos" },
      { icon: "target", role: "Produtor", name: "Analista de oportunidade", bl: "Lê o catálogo e revela o que funciona e o que não funciona.", in: ["layers", "Catálogo"], out: "Guia do canal" },
      { icon: "trending", role: "Produtor", name: "Analista de temas", bl: "Cruza o guia com o seu contexto e rankeia temas por potencial.", in: ["layers", "Guia + contexto"], out: "Lista de temas" },
      { icon: "microscope", role: "Revisor", name: "Analista de roteiro", bl: "Laudo estrutural de um roteiro — uma referência externa ou o seu rascunho.", in: ["fileText", "Roteiro"], out: "Laudo estrutural" },
    ],
  },
  {
    icon: "edit",
    tint: "gold",
    title: "Roteirista",
    blurb: "Criação e refino do roteiro",
    agents: [
      { icon: "book", role: "Produtor", name: "Resumidor de temas", bl: "Condensa o seu contexto e a lista de temas num briefing enxuto.", in: ["layers", "Lista de temas"], out: "Briefing do tema" },
      { icon: "blocks", role: "Produtor", name: "Estruturador de roteiros", bl: "Desenha a arquitetura do vídeo em blocos, com função e ritmo.", in: ["layers", "Briefing"], out: "Estrutura do roteiro" },
      { icon: "edit", role: "Produtor", name: "Roteirista", bl: "Escreve o rascunho completo seguindo a estrutura — só com as suas fontes.", in: ["lock", "Estrutura + Fontes"], out: "Rascunho do roteiro" },
      { icon: "sparkles", role: "Produtor", name: "Roteirizador de introduções", bl: "Reescreve os primeiros 30s com foco total em retenção.", in: ["layers", "Rascunho"], out: "Introdução refinada" },
    ],
  },
];

type Diff = { icon: IconName; t: string; d: string };
const diffs: Diff[] = [
  { icon: "compass", t: "Não exige canal conectado", d: "Funciona do zero, até para quem ainda não tem canal. Você joga prints e contexto; o Pauta faz o resto. Nada de integração obrigatória." },
  { icon: "lock", t: "Sem invenção — só as suas fontes", d: "O Roteirista escreve apenas com as fontes que você fornece. Sem alucinação, sem dado que veio do nada. O que está no roteiro, você consegue defender." },
  { icon: "refresh", t: "Tudo versionado, nada se perde", d: "Cada artefato guarda seu histórico. Voltar a uma versão anterior do briefing ou comparar duas listas de temas é parte do fluxo." },
  { icon: "sparkles", t: "Claude, GPT-4o ou Gemini", d: "Escolha o modelo por projeto ou por agente. Você decide qual inteligência escreve cada parte — sem ficar preso a uma só." },
];

export function Landing() {
  return (
    <div data-landing-root>
      {/* ░░ NAV ░░ */}
      <nav id="lp-nav" className={styles.nav}>
        <div className={cx(styles.wrap, styles.navInner)}>
          <a href="#top" className={styles.brand}>
            <span className={styles.brandMark}>
              <Icon name="edit" size={18} color="#fff" />
            </span>
            Pauta
          </a>
          <div className={styles.navLinks}>
            <a className={styles.lnk} href="#problema">O problema</a>
            <a className={styles.lnk} href="#como">Como funciona</a>
            <a className={styles.lnk} href="#agentes">Agentes</a>
            <a className={styles.lnk} href="#para-quem">Para quem é</a>
          </div>
          <div className={styles.navCta}>
            <a className={cx(styles.btn, styles.btnGhost, styles.btnSm)} href="#como">Ver como funciona</a>
            <Link className={cx(styles.btn, styles.btnPrimary, styles.btnSm)} href="/login">Começar agora</Link>
          </div>
        </div>
      </nav>

      {/* ░░ HERO ░░ */}
      <section className={styles.hero} id="top">
        <div className={cx(styles.wrap, styles.heroGrid)}>
          <div className={styles.reveal} data-reveal>
            <span className={styles.eyebrow}>Narração em off · o trabalho antes da câmera</span>
            <h1>
              O roteiro pronto<br />antes de você<br />
              <span className={styles.it}>apertar o rec.</span>
            </h1>
            <p className={styles.lead}>
              Cada projeto é um vídeo. Dentro dele, agentes de IA analisam canais, encontram o tema certo e
              escrevem o roteiro — na sequência guiada ou na hora que você precisar.
            </p>
            <div className={styles.heroCta}>
              <Link className={cx(styles.btn, styles.btnPrimary)} href="/login">
                Começar agora
                <Icon name="arrowR" size={17} color="#fff" sw={1.8} />
              </Link>
              <a className={cx(styles.btn, styles.btnSecondary)} href="#como">Ver como funciona</a>
            </div>
            <div className={styles.heroNote}>
              <Icon name="target" size={15} sw={1.7} />
              Não exige canal conectado. Funciona até para o seu primeiro vídeo.
            </div>
          </div>

          {/* product mock */}
          <div className={styles.reveal} data-reveal>
            <div className={styles.mock}>
              <div className={styles.mockHead}>
                <div className={styles.mockTitle}>Por que o Brasil não tem trem-bala?</div>
                <span
                  className={cx(styles.badge, styles.rose)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--accent)", display: "inline-block" }} />
                  Roteiro
                </span>
              </div>
              <div className={styles.mockBody}>
                {mockRows.map((r) => (
                  <div key={r.name} className={cx(styles.arow, styles[r.state])}>
                    <span className={styles.glyph}>
                      <Icon name={r.icon} size={17} />
                    </span>
                    <div className={styles.arowMain}>
                      <div className={styles.arowName}>{r.name}</div>
                      <div className={styles.arowSub}>{r.sub}</div>
                    </div>
                    <div className={styles.arowEnd}>
                      {r.state === "done" ? (
                        <span className={styles.tick}>
                          <Icon name="check" size={12} sw={2.2} />
                        </span>
                      ) : (
                        <span className={styles.runtag}>
                          <span className={styles.pulse} />
                          gerando
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={cx(styles.mockFloat, styles.tl)}>
              <span className={styles.mono}>C</span> Claude Sonnet 4.5
            </div>
            <div className={cx(styles.mockFloat, styles.br)}>
              <Icon name="check" size={16} color="var(--gold-600)" sw={1.7} />
              9 artefatos versionados
            </div>
          </div>
        </div>
      </section>

      {/* ░░ PROBLEMA ░░ */}
      <section className={cx(styles.sec, styles.subtle)} id="problema">
        <div className={styles.wrap}>
          <div className={cx(styles.secHead, styles.reveal)} data-reveal>
            <span className={styles.eyebrow}>O problema</span>
            <h2>A câmera é a parte <span className={styles.it}>fácil.</span></h2>
            <p className={styles.lead}>
              O que trava o vídeo acontece antes — na pesquisa, no tema, na estrutura. É aí que a maioria
              perde horas e desiste.
            </p>
          </div>
          <div className={styles.painGrid}>
            {[
              { n: "01", h: "Horas sem saber sobre o que gravar", p: "Você abre o canal decidido a produzir e trava na primeira pergunta: qual vídeo fazer agora? O dia passa sem uma linha escrita." },
              { n: "02", h: "Escreve sem saber se o tema tem potencial", p: "Começa o roteiro no impulso e só descobre que o assunto não engata depois de gravar, editar e publicar. Tarde demais." },
              { n: "03", h: "Copia a estrutura de outro canal sem entender por quê", p: "Imita o formato de quem dá certo, mas sem enxergar o que de fato segura a retenção. O molde não cabe no seu tema." },
            ].map((pain) => (
              <div key={pain.n} className={cx(styles.pain, styles.reveal)} data-reveal>
                <div className={styles.painN}>{pain.n}</div>
                <h3>{pain.h}</h3>
                <p>{pain.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ░░ COMO FUNCIONA ░░ */}
      <section className={styles.sec} id="como">
        <div className={styles.wrap}>
          <div className={cx(styles.secHead, styles.center, styles.reveal)} data-reveal>
            <span className={cx(styles.eyebrow, styles.center)}>Como funciona</span>
            <h2>Um projeto. Uma fila de <span className={styles.it}>agentes.</span></h2>
            <p className={styles.lead}>
              Abra um projeto para cada vídeo e acione agentes especializados. Cada um recebe um insumo e
              devolve um artefato — que vira a entrada do próximo. A sequência guiada leva dos prints do canal
              ao roteiro revisado.
            </p>
          </div>

          <div className={cx(styles.flowWrap, styles.reveal)} data-reveal>
            <div className={styles.flowCap}>
              <div className={styles.t}>A sequência guiada</div>
              <div className={styles.d}>
                Passo a passo, do print bruto ao laudo de revisão. Cada etapa gera um artefato que alimenta a
                próxima.
              </div>
            </div>
            <div className={styles.flow}>
              {flow.map((n, i) => (
                <div key={n.lab} className={styles.step}>
                  <div className={cx(styles.node, n.kind === "cap" ? styles.cap : n.kind === "key" && styles.key)}>
                    <span className={styles.g}>
                      <Icon name={n.icon} size={21} />
                    </span>
                    <span className={styles.lab}>{n.lab}</span>
                  </div>
                  {i < flow.length - 1 && (
                    <span className={styles.conn}>
                      <Icon name="chevronR" size={22} sw={2} />
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.free}>
              <span className={styles.g}>
                <Icon name="route" size={19} />
              </span>
              <div>
                <b>Ou no modo livre.</b>
                <p>
                  Não precisa seguir a fila. Chame qualquer agente na hora certa — revisar uma referência antes
                  de escrever, repensar só a introdução, rankear temas de novo. A liberdade é sua.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ░░ AGENTES ░░ */}
      <section className={cx(styles.sec, styles.subtle)} id="agentes">
        <div className={styles.wrap}>
          <div className={cx(styles.secHead, styles.center, styles.reveal)} data-reveal>
            <span className={cx(styles.eyebrow, styles.center)}>Os agentes</span>
            <h2>Nove especialistas, <span className={styles.it}>duas frentes.</span></h2>
            <p className={styles.lead}>
              Cada agente faz uma coisa e faz bem. Os de Canal cuidam da estratégia; os de Roteirista, da
              escrita. Todos mostram o que recebem e o que produzem.
            </p>
          </div>
          <div>
            {CATS.map((c) => (
              <div key={c.title} className={cx(styles.catBlock, styles.reveal)} data-reveal>
                <div className={styles.catHead}>
                  <span
                    className={styles.g}
                    style={{
                      background: c.tint === "gold" ? "var(--gold-light)" : "var(--accent-light)",
                      color: c.tint === "gold" ? "var(--gold-600)" : "var(--accent)",
                    }}
                  >
                    <Icon name={c.icon} size={19} />
                  </span>
                  <div className={styles.meta}>
                    <div className={styles.t}>{c.title}</div>
                    <div className={styles.d}>{c.blurb}</div>
                  </div>
                </div>
                <div className={styles.agentGrid}>
                  {c.agents.map((a) => (
                    <div key={a.name} className={styles.agent}>
                      <div className={styles.agentTop}>
                        <span className={cx(styles.glyph, a.role === "Revisor" && styles.gold)}>
                          <Icon name={a.icon} size={17} />
                        </span>
                        <span className={cx(styles.badge, a.role === "Revisor" ? styles.gold : styles.rose)}>
                          {a.role}
                        </span>
                      </div>
                      <h3>{a.name}</h3>
                      <p className={styles.bl}>{a.bl}</p>
                      <div className={styles.io}>
                        <span className={styles.chip}>
                          <Icon name={a.in[0]} size={13} />
                          {a.in[1]}
                        </span>
                        <span className={styles.to}>
                          <Icon name="arrowR" size={15} sw={2} />
                        </span>
                        <span className={styles.out}>{a.out}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ░░ DIFERENCIAIS ░░ */}
      <section className={styles.sec} id="diferenciais">
        <div className={styles.wrap}>
          <div className={cx(styles.secHead, styles.reveal)} data-reveal>
            <span className={styles.eyebrow}>Por dentro</span>
            <h2>Decisões que respeitam <span className={styles.it}>o seu trabalho.</span></h2>
          </div>
          <div className={styles.diffGrid}>
            {diffs.map((d) => (
              <div key={d.t} className={cx(styles.diff, styles.reveal)} data-reveal>
                <span className={styles.g}>
                  <Icon name={d.icon} size={22} />
                </span>
                <div>
                  <h3>{d.t}</h3>
                  <p>{d.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ░░ PARA QUEM ░░ */}
      <section className={cx(styles.sec, styles.subtle)} id="para-quem">
        <div className={styles.wrap}>
          <div className={cx(styles.secHead, styles.center, styles.reveal)} data-reveal>
            <span className={cx(styles.eyebrow, styles.center)}>Para quem é</span>
            <h2>Do primeiro vídeo ao <span className={styles.it}>canal em escala.</span></h2>
          </div>
          <div className={styles.whoGrid}>
            <div className={cx(styles.who, styles.reveal)} data-reveal>
              <span className={styles.tag}>Começando agora</span>
              <h3>Quem vai gravar o <span className={styles.it}>primeiro vídeo</span></h3>
              <p>
                Sem canal, sem histórico, sem método. O Pauta te dá o caminho inteiro — começa analisando canais
                que você admira e termina com um roteiro pronto pra gravar.
              </p>
              <ul>
                {[
                  "Aprende a estrutura analisando referências reais",
                  "Descobre temas com potencial antes de gravar",
                  "Não depende de ter um canal conectado",
                ].map((li) => (
                  <li key={li}>
                    <Icon name="check" size={17} sw={1.8} />
                    {li}
                  </li>
                ))}
              </ul>
            </div>
            <div className={cx(styles.who, styles.reveal)} data-reveal>
              <span className={styles.tag}>Com canal ativo</span>
              <h3>Quem já produz e quer <span className={styles.it}>acelerar</span></h3>
              <p>
                Você tem canal, ritmo e talvez uma equipe. O Pauta encurta a pré-produção: mapeia oportunidades
                no seu nicho e entrega rascunhos consistentes pra você refinar e gravar mais.
              </p>
              <ul>
                {[
                  "Encontra oportunidades no que já funciona",
                  "Padroniza a pré-produção entre vídeos e equipe",
                  "Mantém todo artefato versionado, nada se perde",
                ].map((li) => (
                  <li key={li}>
                    <Icon name="check" size={17} sw={1.8} />
                    {li}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ░░ CTA FINAL ░░ */}
      <section className={styles.cta} id="cta">
        <div className={styles.wrap}>
          <div className={cx(styles.ctaCard, styles.reveal)} data-reveal>
            <div className={styles.inner}>
              <span className={cx(styles.eyebrow, styles.center)}>Comece agora</span>
              <h2>Comece o seu <span className={styles.it}>próximo vídeo</span> agora.</h2>
              <p>
                Abra um projeto, jogue os primeiros prints e veja a fila de agentes trabalhar. O roteiro te
                espera do outro lado.
              </p>
              <div className={styles.ctaAction}>
                <Link className={cx(styles.btn, styles.btnPrimary)} href="/login">
                  Começar agora
                  <Icon name="arrowR" size={17} color="#fff" sw={1.8} />
                </Link>
              </div>
              <div className={styles.ctaFine}>Entre com a sua conta Google. Sem cartão. Só o seu próximo roteiro.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ░░ OPEN SOURCE ░░ */}
      <section className={styles.openSource} data-reveal>
        <div className={styles.wrap}>
          <div className={cx(styles.osCard, styles.reveal)} data-reveal>
            <div className={styles.osIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
            </div>
            <div className={styles.osText}>
              <h3>Pauta é open-source</h3>
              <p>O código é público. Explore, contribua ou use como referência.</p>
            </div>
            <div className={styles.osActions}>
              <a
                href="https://github.com/Jean1dev/offs"
                target="_blank"
                rel="noopener noreferrer"
                className={cx(styles.btn, styles.btnGhost)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                Ver no GitHub
              </a>
              <a
                href="https://calendly.com/jeanlucafp/consultoria"
                target="_blank"
                rel="noopener noreferrer"
                className={cx(styles.btn, styles.btnPrimary)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Suporte &amp; Consultoria
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ░░ FOOTER ░░ */}
      <footer className={styles.footer}>
        <div className={cx(styles.wrap, styles.footInner)}>
          <div className={styles.footBrand}>
            <span className={styles.footMark}>
              <Icon name="edit" size={15} color="#fff" sw={1.8} />
            </span>
            Pauta
          </div>
          <div className={styles.footTag}>Tudo que acontece antes da câmera ligar.</div>
        </div>
      </footer>

      <LandingEffects
        rootSelector="[data-landing-root]"
        revealSelector="[data-reveal]"
        navId="lp-nav"
        revealInClass={styles.in}
        revealAllClass={styles.revealAll}
        scrolledClass={styles.scrolled}
      />
    </div>
  );
}
