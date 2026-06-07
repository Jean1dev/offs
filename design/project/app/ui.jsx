// ui.jsx — Pauta shared atoms. Built on BeautyBook tokens. Exports to window.

function SectionLabel({ children, style = {} }) {
  return <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-tertiary)', ...style }}>{children}</div>;
}

// ── Button ──────────────────────────────────────────────
function Button({ variant = 'primary', size = 'md', full = false, icon, iconR, disabled = false, children, onClick, style = {} }) {
  const [hover, setHover] = React.useState(false);
  const base = {
    fontFamily: 'var(--font-body)', fontWeight: 500, letterSpacing: '0.01em',
    border: '1px solid transparent', borderRadius: 'var(--radius-full)',
    cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all .16s', lineHeight: 1,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: full ? '100%' : undefined, whiteSpace: 'nowrap',
    padding: size === 'sm' ? '8px 14px' : size === 'lg' ? '13px 24px' : '10px 18px',
    fontSize: size === 'sm' ? 12.5 : size === 'lg' ? 14 : 13,
    opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary:   { background: hover && !disabled ? 'var(--accent-dark)' : 'var(--accent)', color: '#fff', boxShadow: disabled ? 'none' : 'var(--shadow-accent)', transform: hover && !disabled ? 'translateY(-1px)' : 'none' },
    secondary: { background: hover ? 'var(--accent-light)' : 'transparent', color: 'var(--accent)', borderColor: 'var(--accent)' },
    ghost:     { background: hover ? 'var(--bg-subtle)' : 'transparent', color: 'var(--text-secondary)', borderColor: 'var(--border)' },
    gold:      { background: hover ? 'var(--gold-500)' : 'var(--gold)', color: '#fff', letterSpacing: '0.03em' },
    subtle:    { background: hover ? 'var(--bg-subtle)' : 'transparent', color: 'var(--text-secondary)' },
    danger:    { background: hover ? 'rgba(196,88,88,0.12)' : 'transparent', color: 'var(--danger)', borderColor: 'var(--border)' },
  };
  const iconSize = size === 'sm' ? 15 : 17;
  return (
    <button onClick={disabled ? undefined : onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant], ...style }}>
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconR && <Icon name={iconR} size={iconSize} />}
    </button>
  );
}

// ── Badge ───────────────────────────────────────────────
function Badge({ tone = 'neutral', dot = false, icon, children, style = {} }) {
  const tones = {
    rose:    { background: 'var(--accent-light)', color: 'var(--rose-700)' },
    gold:    { background: 'var(--gold-light)', color: 'var(--gold-600)' },
    success: { background: 'var(--success-bg)', color: 'var(--success-fg)' },
    neutral: { background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
  };
  const dotColor = { rose: 'var(--accent)', gold: 'var(--gold)', success: 'var(--success-fg)', neutral: 'var(--text-tertiary)' };
  return (
    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 500, letterSpacing: '0.02em', padding: '3px 11px', borderRadius: 'var(--radius-full)', lineHeight: 1.5, display: 'inline-flex', alignItems: 'center', gap: 6, ...tones[tone], ...style }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: dotColor[tone], flexShrink: 0 }} />}
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}

function StatusBadge({ status, ...rest }) {
  const s = STATUS[status];
  return <Badge tone={s.tone} dot {...rest}>{s.label}</Badge>;
}

// ── ModelChip ───────────────────────────────────────────
function ModelChip({ model, size = 'md', showName = true }) {
  const m = MODELS[model];
  const d = size === 'sm' ? 18 : 22;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      <span style={{ width: d, height: d, borderRadius: 6, background: m.tint, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: size === 'sm' ? 10 : 11.5, flexShrink: 0 }}>{m.mono}</span>
      {showName && <span style={{ fontFamily: 'var(--font-body)', fontSize: size === 'sm' ? 12 : 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{size === 'sm' ? m.short : m.short}</span>}
    </span>
  );
}

// ── AgentGlyph — rounded tile w/ tinted bg + icon ───────
function AgentGlyph({ agent, size = 40, style = {} }) {
  const isRev = agent.role === 'revisor';
  return (
    <span style={{
      width: size, height: size, borderRadius: size > 44 ? 'var(--radius-md)' : 10, flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: isRev ? 'var(--gold-light)' : 'var(--accent-light)',
      color: isRev ? 'var(--gold-600)' : 'var(--accent)', ...style,
    }}>
      <Icon name={agent.icon} size={size * 0.5} />
    </span>
  );
}

// ── Card ────────────────────────────────────────────────
function Card({ hover = false, onClick, children, style = {} }) {
  const [h, setH] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={hover ? () => setH(true) : undefined}
      onMouseLeave={hover ? () => setH(false) : undefined}
      style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        boxShadow: h ? 'var(--shadow-lg)' : 'var(--shadow-sm)', transform: h ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow .2s, transform .2s, border-color .2s', cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}>{children}</div>
  );
}

// ── RoleTag ─────────────────────────────────────────────
function RoleTag({ role }) {
  return role === 'revisor'
    ? <Badge tone="gold" style={{ fontSize: 10, padding: '2px 8px' }}>Revisor</Badge>
    : <Badge tone="rose" style={{ fontSize: 10, padding: '2px 8px' }}>Produtor</Badge>;
}

// ── IconBtn (square ghost) ──────────────────────────────
function IconBtn({ name, onClick, active = false, title, size = 36, style = {} }) {
  const [h, setH] = React.useState(false);
  return (
    <button title={title} onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: size, height: size, borderRadius: 10, border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'),
        background: active ? 'var(--accent-light)' : (h ? 'var(--bg-subtle)' : 'transparent'),
        color: active ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all .15s',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, ...style }}>
      <Icon name={name} size={size * 0.5} />
    </button>
  );
}

// ── ProgressRing ────────────────────────────────────────
function ProgressRing({ value, total, size = 38, stroke = 3.5 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, pct = total ? value / total : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke}
        strokelinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset .5s' }} />
    </svg>
  );
}

Object.assign(window, { SectionLabel, Button, Badge, StatusBadge, ModelChip, AgentGlyph, Card, RoleTag, IconBtn, ProgressRing });
