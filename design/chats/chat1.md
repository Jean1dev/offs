# Design Mockups

_Started 2026-06-06 21:02 UTC_

---

## User

siga o prompt e faca os mockups

## Assistant

_[tool: list_files]_

_[tool: read_file]_

I'll start by exploring the BeautyBook design system to understand the visual language I need to apply, since it's binding for this build.

_[tool: read_file]_

_[tool: read_file]_

Let me read the UI kit components to absorb the component patterns and icon set.

_[tool: read_file]_

_[tool: read_file]_

_[tool: update_todos]_

_[tool: set_project_title]_

_[tool: copy_files]_

This is a rich, well-specified brief. The brief itself is comprehensive (5 screens, behaviors, audience, tone all defined) and you asked me to proceed, so I'll skip a questions round and lock in smart defaults, applying the BeautyBook visual DNA (Cormorant Garamond display, DM Sans UI, rose primary, gold premium, warm neutrals, thin-stroke icons) to a focused, Linear-style desktop productivity tool.

Let me set up the project and lay out my plan.

_[tool: write_file]_

Now let me build. Starting with the extended icon set (the design system's icons are mobile-app focused; I need productivity-tool glyphs).

_[tool: write_file]_

Now the mock data — rich, realistic Brazilian content for projects, agents, and artifacts.

_[tool: write_file]_

Now shared UI atoms tuned for desktop.

_[tool: write_file]_

Now the app shell and router.

_[tool: write_file]_

Screen 1 — Projects list.

_[tool: write_file]_

Screen 2 — Project overview (the core screen: guided + free modes, artifact library, empty state).

_[tool: write_file]_

Screen 3 — Agent execution with an adaptive input composer (image / text / artifact, narrative model, editorial policy gate).

_[tool: write_file]_

Now artifact content data, then the artifact view (Screen 4).

_[tool: write_file]_

Screen 4 — Artifact view with block renderer and actions.

_[tool: write_file]_

Screen 5 — Agent customization.

_[tool: copy_starter_component]_

Now the tweaks panel. Let me copy the starter and read its API.

_[tool: read_file]_

Now I'll wire tweaks directly into `App` (the starter's `useTweaks`/`TweaksPanel` must share one hook instance). Let me update app.jsx.

_[tool: str_replace_edit]_

_[tool: write_file]_

Now the entry HTML that wires it all together.Let me preview and check for errors.

_[tool: show_html]_

_[tool: show_html]_

_[tool: str_replace_edit]_

Looks strong. One layout bug: the hero title wraps and the description overlaps it. Let me restructure that header cleanly.

_[tool: show_html]_

Let me verify the deeper screens by navigating through the prototype.

_[tool: multi_screenshot]_

_[tool: multi_screenshot]_

Project overview is excellent. Let me see the "next step" highlight and free mode.

_[tool: multi_screenshot]_

Free mode is great. Now the agent execution screen — let me open the Roteirista (it has the editorial-policy gate).

_[tool: multi_screenshot]_

The Roteirista gate works perfectly. Let me add a source to unlock it, run it, and see the generated artifact.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

The entire run flow works beautifully. Let me fix a few minor text-wrap issues I spotted (squeezed serif labels), then check the remaining screens.

## User

continue o trabalho

## Assistant

_[tool: show_html]_

Let me reload and verify the remaining screens: empty state, the rich "Guia do canal" artifact, customize, and dark mode.

_[tool: multi_screenshot]_

_[tool: multi_screenshot]_

Empty state is great. Now the rich "Guia do canal" artifact (split layout) and the customize screen.

_[tool: multi_screenshot]_

"Guia do canal" is beautifully rendered. Now the customize screen, then a dark-mode check.

_[tool: multi_screenshot]_

## Assistant

## Assistant

_[tool: save_screenshot]_

All five screens are working. Now let me verify dark mode and the accent tweaks via the panel.

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: done]_

Dark mode looks great. Everything works across all five screens. Let me finalize.

_[tool: fork_verifier_agent]_

Pronto. Construí o **Pauta**, protótipo interativo completo com as 5 telas, aplicando o design system BeautyBook (Cormorant Garamond + DM Sans, paleta rosa/dourado/neutros quentes, ícones thin-stroke).

**As telas:**
- **Projetos** — grade de cards com status (ideia → roteiro → produção → publicado), progresso do pipeline, filtros e modelo de IA por projeto.
- **Interior do projeto** — alterna **Modo guiado** (stepper que destaca o "próximo passo") e **Modo livre** (agentes por categoria: Canal do YouTube / Roteirista), com biblioteca de artefatos lateral e estado vazio para projetos novos.
- **Execução do agente** — compositor de input que se adapta ao tipo de cada agente (prints, artefatos, texto, fontes, modelo narrativo). O **Roteirista** tem a trava de política editorial: não roda sem fontes suas.
- **Artefato** — renderização rica por tipo de saída (métricas, tabelas, listas rankeadas, blocos de roteiro, laudo), com ações Copiar / Usar como input / Regenerar.
- **Customização do agente** — editor de prompt base, troca de modelo e escopo (só no projeto / global).

**Extras:** roteamento entre telas com breadcrumb, modo claro/escuro, e painel de **Tweaks** (cor de destaque, cantos, fonte dos títulos) — ative pela barra de ferramentas.

Conteúdo todo em pt-BR, ambientado num caso real ("Por que o Brasil não tem trem-bala?"). Os dados são mockados — me avise se quiser ajustar fluxo, adicionar agentes ou refinar alguma tela.

## User

Save as standalone HTML: Pauta.html

## Assistant

_[tool: str_replace_edit]_

This is a React + Babel prototype with no JS-string-referenced image assets — everything is SVG icons, CSS, and Google Fonts (all bundler-discoverable via standard tags). I just need to add the required thumbnail template, then bundle.

_[tool: super_inline_html]_

Bundled cleanly with all assets resolved. Let me verify it works offline.

_[tool: show_html]_

_[tool: show_html]_

The standalone file works perfectly offline — fonts, icons, layout, and interactions all intact. Delivering it for download.

_[tool: present_fs_item_for_download]_

Pronto — **Pauta (standalone).html** está acima, num único arquivo offline (fontes, ícones e as 5 telas embutidos). Funciona sem internet, é só abrir.

## User

<pasted_text name="Pasted text (18 lines)">
⚠️ Problemas encontrados
1. Analista de Canais fora do modo guiado
O GUIDED_FLOW não inclui o analista-canais. Isso significa que no modo guiado ele simplesmente não aparece — o usuário só o encontra no modo livre. O problema é que ele é o agente mais natural de primeira execução quando o criador quer analisar um canal concorrente antes de qualquer coisa.
Decisão necessária: o Analista de Canais deve entrar no GUIDED_FLOW antes do Analista de Conteúdo, ou deve ter algum destaque no modo livre que indique que é um bom ponto de partida?
2. Analista de Roteiro aparece apenas uma vez no fluxo guiado
Mapeamos que esse agente tem dois contextos de uso distintos — antes de escrever (análise de roteiro de referência externo) e depois do rascunho pronto (revisão). No código ele aparece só no final do GUIDED_FLOW como revisão, e seu inputArtifact está setado como 'Rascunho do roteiro', o que o trava no segundo contexto.
O primeiro uso — análise de um roteiro externo como referência — não está representado em nenhuma tela nem no fluxo guiado. Isso é uma funcionalidade de negócio perdida.
3. Roteirista recebe artefato mas não recebe fontes como input tipado
No data.jsx, o Roteirista tem inputs: ['artifact', 'text'] — ou seja, fontes são tratadas como "texto livre". Mas no screen_agent.jsx o componente SourcesInput é um campo separado e especializado (com adição item a item). Há uma inconsistência: o tipo text aparece no payload de inputs do agente, mas na interface as fontes são tratadas como um input de categoria própria que não tem representação no array inputs[].
Isso não quebra o mockup, mas quando for implementar de verdade precisará de um quarto tipo de input: sources — com regras próprias (obrigatório, bloqueia execução, cita fonte por parágrafo).
4. Artefatos sem versionamento visível
Mapeamos a funcionalidade 7 como "biblioteca de artefatos com versionamento". No mockup os artefatos têm nome, agente e data, mas não há nenhuma indicação de versão. Se o usuário regenerar um artefato com configurações diferentes, o que acontece? O modelo atual sobrescreve ou cria um novo? Isso precisa ser definido antes da implementação técnica.
5. Campo de modelo de IA por agente sem herança clara
Na Tela 3, o usuário pode mudar o modelo de IA para aquela execução específica. Isso é correto. Mas a hierarquia que mapeamos é: preferência global → modelo do projeto → modelo da execução do agente. No mockup o seletor de modelo na Tela 3 inicia com project.model, o que está certo, mas não há nenhuma indicação visual de que essa escolha é temporária (só para essa execução) ou permanente. O usuário pode se confundir achando que está mudando o modelo do projeto inteiro.

Resumo das ações necessárias
#ProblemaImpactoDecisão necessária1Analista de Canais fora do fluxo guiadoMédioIncluir no início do GUIDED_FLOW ou destacar no modo livre2Analista de Roteiro sem contexto de referência externaAltoCriar segunda entrada no fluxo ou tela própria para esse uso3Fontes sem tipo próprio no modelo de dadosBaixo agora, alto na implementaçãoAdicionar sources como quarto tipo de input4Sem versionamento de artefatosMédioDefinir comportamento ao regenerar: sobrescreve ou cria novo5Escopo da troca de modelo não está claroBaixoAdicionar label "só para esta execução" no seletor
O mais urgente para resolver antes de qualquer implementação técnica é o ponto 2 — o Analista de Roteiro em dois contextos é uma decisão de arquitetura que vai afetar como os agentes são modelados no banco de dados.
</pasted_text>

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="BeautyBook Design System (design system)">
[Design System] This project uses the **BeautyBook Design System** design system. This is a binding choice for visual style — every visual must follow it. Don't invent colors, type, spacing, or components not grounded here.

Scope: the design system is a visual style reference only. Its guide may describe example products, brands, or people that are unrelated to the user and unrelated to the subject of this conversation. Never treat anything in the design system as a fact about the user, their work, or the topic they asked about.

    Explore it to find what you need:
    - Always copy out the fonts and colors you need
    - For prototypes and designs, always copy out any relevant components
    - If the design system contains existing mocks of products, and you were asked to design or prototype something similar, copy and fork those mocks to start your design. This helps you make high-quality designs.

    Explore it quickly to find relevant UI kits (e.g. mocks of existing products you can copy and fork)

Full system at `/projects/c9ffd10d-960c-4ba2-9d9c-45a5ad0298d1/`. Its guide is reproduced below so you don't need to fetch it:

<design-system-guide>
# BeautyBook — Design System

&gt; **Elegante &amp; Sofisticado.** A refined, editorial design language for a beauty‑services
&gt; booking experience. Serif‑display headlines, a warm rose primary, a gold premium accent,
&gt; and soft warm‑grey neutrals. Built for Brazilian Portuguese (pt‑BR).

---

## 1 · Company &amp; Product Context

**BeautyBook** is a marketplace + booking app that connects clients with independent beauty
professionals (hairstylists, nail technicians, makeup artists, estheticians). The brand
positions itself as *elegante e sofisticado* — premium without being cold. The whole product
is written in **Brazilian Portuguese**.

Core jobs-to-be-done seen in the source material:
- **Discover** professionals nearby ("Profissionais próximas a você").
- **Browse** a professional's specialties, ratings, and portfolio.
- **Book** an appointment by picking an available time slot.
- **Manage** favorites, agenda, and a personal profile.
- A **Premium** tier exists (gold-accented), suggesting paid upgrades for clients or pros.

### Product surfaces
| Surface | Status | Notes |
|---|---|---|
| **Mobile app** (client-facing) | Primary, documented | Bottom-tab navigation: Início · Explorar · Agenda · Favoritos · Perfil. Booking flow, pro cards, time-slot picker. This is the surface the UI kit recreates. |
| Marketing site / pro dashboard | Not provided | No source material — **not** built here to avoid inventing designs. |

### Sources given
- **Codebase:** `design/DOCTYPE html html lang.html` — a single self-contained HTML "Design System v1.0"
  reference page (tokens, type specimens, color palette, and component gallery). This was the
  *only* source asset. Everything in this system is derived from it.
- No Figma file, no live codebase, no slide decks, and no external image/logo assets were provided.

&gt; **Note for the reader:** the original source is a static HTML token sheet, not a running app.
&gt; The UI kit screens here are faithful *extrapolations* of those documented tokens and components
&gt; into real product views — not copies of pre-existing screens (none existed).

---

## 2 · Content Fundamentals

How BeautyBook writes. All product copy observed is **Brazilian Portuguese**.

- **Voice:** warm, personal, aspirational but plain-spoken. It sells *care* and *time for
  yourself*, not features.
- **Person:** speaks **to** the user with the informal possessive — *"Agende **sua** beleza"*,
  *"**Sua** beleza, **seu** tempo"*, *"…cuide de **você** do seu jeito."* Second-person,
  intimate, never corporate.
- **Casing:** **Sentence case** everywhere for headlines and body. UPPERCASE is reserved for
  tiny tracked-out **labels/eyebrows** only (`.bb-label`, e.g. "SERVIÇOS DISPONÍVEIS").
- **Tone words:** *beleza, sofisticado, elegante, agende, cuide, seu tempo.* Verbs are gentle
  imperatives (*Agende, Ver perfil, Confirmar, Cancelar*).
- **Numbers &amp; currency:** Brazilian conventions — comma decimal and `R$` prefix:
  *"Corte e escova — R$ 80,00"*, ratings as *"4,9"*, dates as *"14 de março de 2025"*.
- **Microcopy examples:** placeholders feel like real people — *"Ana Carolina Silva"*,
  *"(11) 99999‑9999"*. Status is human — *"Disponível hoje"*, *"Última visita em…"*.
- **Emoji:** used **functionally as glyph icons** (nav, theme toggle) — never decoratively
  sprinkled in prose. Copy itself contains no emoji.
- **Vibe:** an editorial beauty magazine that happens to be an app. Generous, calm, never shouty.

**Do:** "Agende sua beleza", "Profissionais próximas a você", "Disponível hoje".
**Don't:** "BOOK NOW!!", clipped feature-speak, or English mixed into the UI.

---

## 3 · Visual Foundations

The look is **editorial + warm**: large airy serif display type over a near-white warm canvas,
with a single rose accent and a sparing gold for premium moments.

- **Color vibe:** warm and rosy. Primary **rose `#C45C58`** (think dusty terracotta-rose), a
  muted **gold `#C9A84C`** for premium/ratings, and **warm-grey neutrals** (never pure cool grey —
  the canvas is `#FAFAF9`, text `#141210`). Backgrounds tend toward `#FAFAF9` / white surfaces.
- **Typography:** a two-family pairing — **Cormorant Garamond** (a high-contrast serif) for
  display &amp; headings, weights 300–400, often *italic* in rose for romantic accents; **DM Sans**
  for all UI/body text, weights 400–500. Display is set **light (300)** and large with slightly
  negative tracking. Eyebrows/labels are 10px, 500 weight, `0.12em` uppercase tracking.
- **Spacing:** an 4-based scale — 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64. Layout is generous and
  airy; sections breathe with 48–64px gaps. Reading column maxes ~960px.
- **Backgrounds:** flat warm color — **no busy patterns, no photographic hero washes.** The one
  decorative move is a **soft rose gradient** used as an *image placeholder* on pro cards
  (`linear-gradient(135deg, rose-100, rose-200)`) and on avatars (`rose-200 → rose-300`). No
  textures, no grain, no mesh gradients.
- **Imagery:** where photos would go (pro portfolios, avatars), the system uses soft tonal
  rose gradients with an italic serif initial/word as a graceful placeholder — warm, low-contrast,
  on-brand. Real imagery should match: warm, soft, editorial.
- **Corner radii:** soft and rounded. `sm 6` · `md 12` · `lg 20` · `xl 32` · `full 999`. Buttons,
  badges, avatars, and slots are **pill / fully-round** (`full`). Cards use `lg (20)`; the bottom
  nav uses `xl (32)`. Nothing has sharp 0px corners.
- **Cards:** white surface, `1px` neutral-200 border, `radius-lg (20px)`, `shadow-md`. On hover
  they lift — `translateY(-2px)` with `shadow-lg`. Quiet, elevated, tactile.
- **Shadows:** soft, warm, low-opacity, multi-layer (`shadow-sm/md/lg`). Plus a signature
  **`--shadow-accent`** — a rosy glow `0 8px 24px rgba(196,92,88,0.25)` under primary buttons and
  selected slots. No hard or neutral-black drop shadows.
- **Borders:** hairline `1px` in `neutral-200` (light) / `neutral-700` (dark). Strong variant
  `neutral-300` for emphasis. Focus rings are a 3px rose halo (`0 0 0 3px var(--accent-light)`).
- **Hover states:** primary button → darkens (`accent` → `accent-dark`) **and** lifts
  `translateY(-1px)` with a deeper rose glow. Secondary/ghost → fill with `accent-light` or
  strengthen border. Icon buttons &amp; slots → border turns rose, text turns rose, subtle bg tint.
- **Press / selected states:** filled rose with the rose glow (`.slot-selected`,
  `.btn-primary`). Selection is communicated by **fill + glow**, not by scale-shrink.
- **Transitions:** gentle and quick — `all 0.15s–0.2s` on interactive elements, `0.3s` on the
  theme background swap. Movement is small (1–2px lifts). **No bounces, no springy easing, no
  decorative looping animation.** Calm.
- **Transparency &amp; blur:** used sparingly — semi-opaque white chips floating over the gradient
  card image (`rgba(255,255,255,0.85)` favorite button). No heavy glassmorphism/backdrop-blur.
- **Dark mode:** first-class. Canvas `#141210`, surface `neutral-800`, warm off-white text
  `#F5F2EE`; rose lightens to `rose-400`, gold to `gold-300`; gradients &amp; tints drop to low-alpha
  rose. Shadows deepen.
- **Layout rules:** centered reading column; bottom-fixed tab bar on mobile; eyebrow → headline →
  body vertical rhythm; right-aligned utility controls (e.g. theme toggle) in headers.

---

## 4 · Iconography

BeautyBook has **no custom icon font or SVG icon set** in the source. Iconography is
intentionally lightweight:

- **Unicode glyphs &amp; emoji as icons.** The system leans on geometric unicode characters and a
  few emoji used *functionally*:
  - Bottom nav: `⌂` Início · `🔍` Explorar · `📅` Agenda · `♡` Favoritos · `◯` Perfil
  - Actions: `♡` favorite, `↗` share, `★` rating star, `•` status dot
  - Theme toggle: `🌙` / `☀️`
- **No PNG/SVG icon assets** exist to copy — none were provided.
- **No builtin icon font** (no Lucide/Heroicons/Font Awesome) is referenced.

**Recommendation &amp; substitution (flagged):** the emoji-as-icons approach is fine for the token
sheet but renders inconsistently across platforms in a real product. For production UI kit work,
substitute a **thin-stroke line icon set** that matches the delicate, editorial feel — e.g.
**[Lucide](https://lucide.dev)** (1.5–2px stroke) or **Phosphor (Thin/Light)**. The UI kit in
this system uses inline thin-stroke SVGs in the spirit of Lucide so glyphs are crisp and
consistent. ⚠️ *This is a substitution, not from the source — confirm the intended icon library.*

The brand **wordmark** "Beauty**Book**" is typographic, not a graphic logo: Cormorant Garamond,
"Beauty" in `text-primary` + "Book" in *italic rose*. Reproduced in `assets/logo.html` and
`assets/favicon.svg`.

---

## 5 · File Index (manifest)

| Path | What it is |
|---|---|
| `README.md` | This document. |
| `colors_and_type.css` | All design tokens — color ramps, semantic vars, type scale, radii, shadows, spacing. Import this first. |
| `SKILL.md` | Agent-Skill manifest so this system works inside Claude Code. |
| `assets/` | Brand wordmark (`logo.html`), `favicon.svg`, icon reference. |
| `preview/` | Small HTML cards that populate the Design System tab (type, color, components, etc.). |
| `ui_kits/mobile-app/` | The client mobile app UI kit — `index.html` (interactive click-through) + JSX components. |

### UI Kits
- **`ui_kits/mobile-app/`** — BeautyBook client app. Discover → professional profile → pick a
  time slot → confirm booking, plus a favorites/agenda shell. See its own `README.md`.

---

*Generated as a design-system scaffold from the BeautyBook v1.0 token sheet. Where the source was
silent (real photography, full marketing site, production icon library), this system flags the gap
rather than inventing — see ⚠️ notes above.*

</design-system-guide>

CSS tokens: the guide may describe tokens in prose, but the exact `--*` names are defined in the design system's stylesheet(s) (`/projects/c9ffd10d-960c-4ba2-9d9c-45a5ad0298d1/colors_and_type.css`). The 86 custom properties it defines are:

--accent, --accent-dark, --accent-light, --bg, --bg-subtle, --bg-surface, --body-lh, --body-size, --body-weight, --border, --border-strong, --danger, --display-lh, --display-ls, --display-size, --display-weight, --font-body, --font-display, --gold, --gold-100, --gold-200, --gold-300, --gold-400, --gold-500, --gold-600, --gold-light, --h1-lh, --h1-ls, --h1-size, --h1-weight, --h2-lh, --h2-ls, --h2-size, --h2-weight, --h3-lh, --h3-ls, --h3-size, --h3-weight, --label-ls, --label-size, --label-weight, --neutral-100, --neutral-200, --neutral-300, --neutral-400, --neutral-50, --neutral-500, --neutral-600, --neutral-700, --neutral-800, --neutral-900, --radius-full, --radius-lg, --radius-md, --radius-sm, --radius-xl, --rose-100, --rose-200, --rose-300, --rose-400, --rose-50, --rose-500, --rose-600, --rose-700, --rose-800, --rose-900, --shadow-accent, --shadow-lg, --shadow-md, --shadow-sm, --small-ls, --small-size, --small-weight, --space-1, --space-12, --space-16, --space-2, --space-3, --space-4, --space-6, --space-8, --success-bg, --success-fg, --text-primary, --text-secondary, --text-tertiary

Only use `var(--*)` names from that list. Never guess a token name — an unresolved `var()` silently falls back to the browser default.

For assets and UI kits beyond the guide: `read_file("/projects/c9ffd10d-960c-4ba2-9d9c-45a5ad0298d1/<path>")` and `copy_files` to bring them into the current project.
</attached-skill>

## Assistant

_[tool: read_file]_

The review is sharp and actionable. These are real product-architecture gaps, not nitpicks. Let me address all five in the mockup — the most consequential being #2 (dual-context Analista de Roteiro) and #1 (Analista de Canais entry point). Here are the design decisions I'm making:

1. **Analista de Canais** → kept out of the linear flow (it's optional pre-work), but surfaced as a highlighted *"ponto de partida"* card above the guided steps **and** badged in free mode.
2. **Analista de Roteiro** → made genuinely dual-context with a mode toggle at the top of its screen: *"Roteiro de referência (externo)"* vs *"Meu rascunho"* — each with its own typed input. Appears in guided flow as the final review.
3. **Fontes** → promoted to a first-class fourth input type (`sources`) with its own rules (obrigatório, bloqueia execução).
4. **Versionamento** → regenerar now creates a new version; artifacts show `v2`, with a version switcher on the artifact screen.
5. **Escopo do modelo** → explicit *"só para esta execução"* label on the Tela 3 selector.

Let me start with the data model.

_[tool: str_replace_edit]_

Now add version data to the artifacts in the trem-bala project, so versioning has something to render.

_[tool: str_replace_edit]_

_[tool: read_file]_

Now the agent screen — dual-context toggle, sources typing, and the model-scope label. Let me read the relevant section.Now let me read the AgentScreen function head (the state setup) to wire in the dual-context mode.

_[tool: read_file]_

Now let me read the AgentScreen function signature and state block (lines ~135-150).

_[tool: read_file]_

_[tool: str_replace_edit]_

Now I'll refactor `AgentScreen` to support the dual-context mode via an effective-agent (`eff`) object, then thread it through.

_[tool: str_replace_edit]_

Now the header desc + the dual-context toggle, and update InputTypePills to use `eff`.Now update the field rendering to use `eff.inputs`, the InputTypePills, the sources field (now typed), the reference-roteiro text field, and the right rail.

_[tool: str_replace_edit]_

Now the right rail: `eff.produces`, the model-scope label, and the run-disabled hint for the reference mode. Let me read the rail section again.

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

The editorial banner correctly stays on `requiresSources`. Now the project screen: starting-point card in guided mode, the "ponto de partida" badge in free mode, and version badges in the library.Now the free-mode "ponto de partida" badge on the AgentCard, and version badge in the library.

_[tool: str_replace_edit]_

_[tool: read_file]_

Now the artifact screen — version switcher in the meta row and clarify the "Regenerar creates a new version" behavior. Let me read the header.

_[tool: str_replace_edit]_

_[tool: read_file]_

Let me add a small clarifying line about regenerate behavior under the actions row.

_[tool: str_replace_edit]_

Now let me preview the updated build and walk through the changed screens.

_[tool: show_html]_

Now let me check the guided mode with the new starting-point card, and the dual-context Analista de Roteiro screen.

_[tool: multi_screenshot]_

The starting-point card (gold, optional) sits above the guided flow, and version badges (v2, v3) show in the library. Now let me check the dual-context Analista de Roteiro screen and the Roteirista with the typed sources field.

_[tool: multi_screenshot]_

_[tool: multi_screenshot]_

The dual-context toggle is working perfectly, with "só nesta execução" and "padrão" labels on the model selector. Let me verify the reference mode switches inputs, and check the Roteirista's typed sources field.

_[tool: multi_screenshot]_

Reference mode fully addresses issue #2 — input, output ("Laudo de referência"), and run-gate all adapt. Now let me verify the Roteirista's typed sources field (#3) and the version switcher on an artifact (#4).

_[tool: multi_screenshot]_

The Roteirista now shows **Artefato · Fontes · Texto livre** as typed pills (#3 resolved). Now the version switcher on an artifact — let me open the v3 "Estrutura do roteiro".

_[tool: done]_

All five issues are resolved and rendering cleanly. Let me finalize the main file and refresh the standalone export so it's in sync.

_[tool: super_inline_html]_

_[tool: present_fs_item_for_download]_

_[tool: fork_verifier_agent]_

Resolvi os 5 pontos do review no mockup (e atualizei o HTML autônomo acima):

1. **Analista de Canais** — entra como card destacado *"Ponto de partida · opcional"* acima do fluxo guiado, e ganha selo *"Ponto de partida"* no modo livre. Fica claro que é pré-trabalho, sem poluir o caminho linear.
2. **Analista de Roteiro (dois contextos)** — agora tem o seletor *"Em que momento você está?"* com **Roteiro de referência** (antes de escrever, input de texto externo → *Laudo de referência*) e **Meu rascunho** (depois, input de artefato → *Laudo estrutural*). Os inputs, a saída e o gate de execução trocam conforme o modo.
3. **Fontes** — promovida a quarto tipo de input (`sources`), com regra própria (obrigatório, bloqueia execução). Aparece como pill tipada *"Fontes"* ao lado de Artefato e Texto livre no Roteirista.
4. **Versionamento** — artefatos mostram `v2`/`v3` na biblioteca, há um seletor *"v3 de 3"* no topo do artefato (v3 mais recente → v1) e a regra está explícita: *regenerar cria uma nova versão, a anterior fica preservada*.
5. **Escopo do modelo** — o seletor da Tela 3 agora traz o rótulo *"só nesta execução"* e marca *"padrão"* no modelo herdado do projeto.

Sobre a decisão de arquitetura mais urgente (#2): modelei o Analista de Roteiro como **um agente com dois modos de entrada**, não dois agentes — a saída é um "laudo" nos dois casos, só muda a fonte (externa vs. rascunho interno). Se preferir tratá-los como agentes distintos no banco, me avisa que eu reorganizo.

