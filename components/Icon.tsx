// Icon.tsx — Pauta thin-stroke icon set, 1.7px, Lucide-spirit (matches BeautyBook).
// Ported from design/project/app/icons.jsx.

import type { CSSProperties, ReactNode } from "react";

const ICON_PATHS: Record<string, ReactNode> = {
  // nav / structure
  layers: (
    <g>
      <path d="M12 3 3 8l9 5 9-5-9-5z" />
      <path d="m3 13 9 5 9-5M3 8v0" />
      <path d="m3 13 9 5 9-5" />
    </g>
  ),
  grid: (
    <g>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </g>
  ),
  route: (
    <g>
      <circle cx="6" cy="19" r="2.4" />
      <circle cx="18" cy="5" r="2.4" />
      <path d="M8.4 19H14a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h2.6" />
    </g>
  ),
  folder: (
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  ),
  home: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
  settings: (
    <g>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </g>
  ),
  search: (
    <g>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </g>
  ),

  // chevrons / arrows
  chevronL: <path d="M15 5l-7 7 7 7" />,
  chevronR: <path d="M9 5l7 7-7 7" />,
  chevronD: <path d="M5 9l7 7 7-7" />,
  chevronU: <path d="M5 15l7-7 7 7" />,
  arrowR: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowL: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  cornerDown: <path d="M4 4v7a4 4 0 0 0 4 4h12M16 11l4 4-4 4" />,

  // actions
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  checkCircle: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </g>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  copy: (
    <g>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </g>
  ),
  refresh: (
    <g>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 4v4h-4" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 20v-4h4" />
    </g>
  ),
  edit: <path d="M4 20h4L19 9a2 2 0 0 0-3-3L5 16v4zM14.5 7.5l3 3" />,
  trash: (
    <g>
      <path d="M4 7h16M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" />
      <path d="M6 7l1 13a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 20l1-13" />
    </g>
  ),
  more: (
    <g>
      <circle cx="5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="19" cy="12" r="1.4" />
    </g>
  ),
  filter: <path d="M3 5h18M6 12h12M10 19h4" />,
  external: (
    <g>
      <path d="M14 5h5v5M19 5l-8 8" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </g>
  ),
  download: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,

  // content types
  image: (
    <g>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.8" />
      <path d="m4 18 5-5 4 3.5 3-2.5 4 4" />
    </g>
  ),
  fileText: (
    <g>
      <path d="M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M14 3v5h5M8 13h8M8 17h6" />
    </g>
  ),
  text: <path d="M5 6h14M5 6v-.5M9 6v12M7 18h4M14 11h5M14 11l0 7M16 18h5" />,
  upload: (
    <g>
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <path d="M12 16V4M7 9l5-5 5 5" />
    </g>
  ),

  // semantic / agent
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  sparkles: (
    <g>
      <path d="M11 3l1.4 3.8L16 8l-3.6 1.2L11 13l-1.4-3.8L6 8l3.6-1.2z" />
      <path d="M18 13l.8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8z" />
    </g>
  ),
  target: (
    <g>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </g>
  ),
  trending: <path d="M3 17l6-6 4 4 7-7M14 8h6v6" />,
  compass: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </g>
  ),
  book: (
    <path d="M4 5a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2z" />
  ),
  blocks: (
    <g>
      <rect x="4" y="4" width="16" height="4.5" rx="1.5" />
      <rect x="4" y="11" width="9" height="4.5" rx="1.5" />
      <rect x="4" y="18" width="13" height="2.5" rx="1.25" />
    </g>
  ),
  microscope: (
    <g>
      <path d="M6 20h11" />
      <path d="M9 16a5 5 0 1 0 5-8" />
      <path d="M12 6l3-3 2 2-3 3" />
      <path d="M7 18l-2-2" />
    </g>
  ),
  lock: (
    <g>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </g>
  ),
  alert: (
    <g>
      <path d="M12 3 2.5 19.5h19z" />
      <path d="M12 10v4M12 17.5v.5" />
    </g>
  ),
  clock: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </g>
  ),
  play: <path d="M7 5l12 7-12 7z" />,
  video: (
    <g>
      <rect x="3" y="6" width="13" height="12" rx="2.5" />
      <path d="m16 10 5-3v10l-5-3z" />
    </g>
  ),
  link: (
    <g>
      <path d="M9 15l6-6" />
      <path d="M11 7l1-1a4 4 0 0 1 6 6l-1 1" />
      <path d="M13 17l-1 1a4 4 0 0 1-6-6l1-1" />
    </g>
  ),
  star: (
    <path d="M12 2.5l2.9 6.3 6.6.7-4.9 4.5 1.3 6.5L12 17.8 6.1 20.5l1.3-6.5L2.5 9.5l6.6-.7z" />
  ),
  dot: <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />,
  bell: (
    <g>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10.5 20a2 2 0 0 0 3 0" />
    </g>
  ),
  user: (
    <g>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </g>
  ),
};

export type IconName = keyof typeof ICON_PATHS;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** stroke width */
  sw?: number;
  filled?: boolean;
  style?: CSSProperties;
}

export function Icon({
  name,
  size = 20,
  color = "currentColor",
  sw = 1.7,
  filled = false,
  style = {},
}: IconProps) {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={filled && name !== "checkCircle" ? "none" : color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
    >
      {path}
    </svg>
  );
}
