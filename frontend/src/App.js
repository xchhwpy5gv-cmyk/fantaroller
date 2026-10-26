import React, { useCallback, useEffect, useState } from "react";

const API = "https://fantaroller-production.up.railway.app";
const chiaveOperazione = () => window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const storicoAtletiCache = new Map();

const caricaStoricoAtleta = (tessera) => {
  if (!tessera) return Promise.resolve(null);
  const chiave = String(tessera);
  if (!storicoAtletiCache.has(chiave)) {
    storicoAtletiCache.set(
      chiave,
      fetch(`${process.env.PUBLIC_URL}/statistiche_storiche/${encodeURIComponent(chiave)}.json`)
        .then(res => res.ok ? res.json() : null)
        .then(data => data?.atleta ? { ...data.atleta, anni: data.anni } : null)
        .catch(() => null)
    );
  }
  return storicoAtletiCache.get(chiave);
};

const confrontaRisultatiStorici = (profiloA, profiloB) => {
  if (!profiloA?.gare || !profiloB?.gare) return null;
  const chiaveGara = gara => JSON.stringify([gara.anno, gara.manifestazione, gara.categoria, gara.disciplina]);
  const gareB = new Map(profiloB.gare.map(gara => [chiaveGara(gara), gara]));
  const confronto = { gareCondivise: 0, vittorieA: 0, vittorieB: 0, piazzamentiUguali: 0 };

  profiloA.gare.forEach(garaA => {
    const garaB = gareB.get(chiaveGara(garaA));
    if (!garaB) return;
    confronto.gareCondivise += 1;
    if (garaA.posizione < garaB.posizione) confronto.vittorieA += 1;
    else if (garaA.posizione > garaB.posizione) confronto.vittorieB += 1;
    else confronto.piazzamentiUguali += 1;
  });
  confronto.confrontiDecisi = confronto.vittorieA + confronto.vittorieB;
  return confronto;
};

const icone = {
  bolt: <path d="M13 2 4 13h6l-1 9 9-12h-6l1-8Z" />,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" /></>,
  trophy: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4" /></>,
  cart: <><path d="M3 4h2l2.2 11.2A2 2 0 0 0 9.2 17H18a2 2 0 0 0 1.9-1.4L22 9H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  chat: <><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5Z" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  settings: <><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /><path d="m19.4 15 .1.1 1.1 1.9-1.7 2.9-2.2-.5a8 8 0 0 1-1.8 1L14.4 22h-3.3l-.5-2.2a8 8 0 0 1-1.8-1l-2.2.5-1.7-2.9L6 14.5a8 8 0 0 1 0-2.1L4.9 10.5l1.7-2.9 2.2.5a8 8 0 0 1 1.8-1L11.1 5h3.3l.5 2.2a8 8 0 0 1 1.8 1l2.2-.5 1.7 2.9-1.1 1.9a8 8 0 0 1-.1 2.5Z" /></>,
  tool: <><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4l-3 3-3-3 3-3Z" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-5 3 2 5-7" /></>,
  flame: <><path d="M12 22c4 0 7-3 7-7 0-3-2-5-4-7 0 3-1 4-2 4 1-5-2-8-5-10 1 5-4 8-4 13 0 4 3 7 8 7Z" /></>,
  medal: <><circle cx="12" cy="8" r="5" /><path d="m8 12-2 9 6-3 6 3-2-9M10 8h4" /></>,
  trend: <><path d="m3 17 6-6 4 4 8-9M15 6h6v6" /></>,
  handshake: <><path d="m8 12 3 3a2 2 0 0 0 3-3l-2-2M3 10l4-4 4 2 2-1 8 4-4 5M3 10l3 7 3 1M21 11l-2 7-4 1" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  key: <><circle cx="8" cy="15" r="5" /><path d="m11.5 11.5 8-8 2 2-2 2 2 2-3 3-2-2-3.5 3.5" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  warning: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5M12 17h.01" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  money: <><circle cx="12" cy="12" r="9" /><path d="M16 8.5c-.8-.8-1.8-1.2-3.2-1.2-1.7 0-2.8.8-2.8 2s.9 1.8 2.7 2.2l.6.1c1.8.4 2.7 1 2.7 2.2s-1.2 2-3 2c-1.3 0-2.5-.5-3.4-1.4M12.5 5.5v13" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  edit: <><path d="m15 5 4 4M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" /></>,
  building: <><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M10 21v-4h4v4" /></>,
  rocket: <><path d="M5 14c-2 1-2 5-2 5s4 0 5-2M14 5c3-2 6-2 7-2 0 1 0 4-2 7l-7 7-5-5 7-7Z" /><path d="m9 15-3 3M14 10h.01" /></>,
  hammer: <><path d="m14 6 4 4M12 4l8 8M4 20l9-9M3 21l3-1 1-3-3-3-3 1-1 3 3 3ZM12 4l3-3 5 5-3 3" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7" /></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6" /></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronUp: <path d="m6 15 6-6 6 6" />,
  arrowLeft: <><path d="M19 12H5M12 19l-7-7 7-7" /></>,
  arrowRight: <><path d="M5 12h14M12 5l7 7-7 7" /></>,
};

function Icon({ name, size = 18, className = "", strokeWidth = 1.8, color = "currentColor" }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {icone[name] || icone.star}
    </svg>
  );
}

const theme = {
  bg: "#0a0e1a",
  bgCard: "#111827",
  bgCardHover: "#1a2235",
  border: "#1e2d45",
  accent: "#f97316",
  accentHover: "#ea6c0a",
  blue: "#38bdf8",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#eab308",
  text: "#f1f5f9",
  textMuted: "#64748b",
  textSub: "#94a3b8",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root { width: 100%; min-width: 0; max-width: 100%; }
  html { overflow-x: hidden; }

  body {
    background: ${theme.bg};
    color: ${theme.text};
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
    min-height: 100vh;
    min-height: 100dvh;
    overflow-x: hidden;
  }

  .app-wrapper {
    max-width: 900px;
    width: 100%;
    min-width: 0;
    margin: 0 auto;
    padding: env(safe-area-inset-top, 0px) max(16px, env(safe-area-inset-right, 0px)) calc(40px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0 16px;
    border-bottom: 1px solid ${theme.border};
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .logo {
    font-family: 'Bebas Neue', cursive;
    font-size: 2rem;
    letter-spacing: 2px;
    color: ${theme.text};
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo span { color: ${theme.accent}; }

  .nav {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .nav-btn {
    background: transparent;
    border: 1px solid ${theme.border};
    color: ${theme.textSub};
    padding: 7px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
  }

  .nav-btn:hover {
    border-color: ${theme.accent};
    color: ${theme.accent};
  }

  .nav-btn.active {
    background: ${theme.accent};
    border-color: ${theme.accent};
    color: white;
  }

  .nav-btn.logout {
    border-color: #ef444430;
    color: ${theme.red};
  }

  .nav-btn.logout:hover {
    background: #ef444415;
  }

  .card {
    background: ${theme.bgCard};
    border: 1px solid ${theme.border};
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
  }

  .card-title {
    font-family: 'Bebas Neue', cursive;
    font-size: 1.4rem;
    letter-spacing: 1px;
    margin-bottom: 16px;
    color: ${theme.text};
  }

  .badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-orange { background: #f9731620; color: ${theme.accent}; }
  .badge-blue { background: #38bdf820; color: ${theme.blue}; }
  .badge-green { background: #22c55e20; color: ${theme.green}; }
  .badge-red { background: #ef444420; color: ${theme.red}; }
  .badge-purple { background: #a855f720; color: #c084fc; }

  .btn {
    padding: 9px 18px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    transition: all 0.2s;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
  }

  .btn-primary { background: ${theme.accent}; color: white; }
  .btn-primary:hover { background: ${theme.accentHover}; }
  .btn-success { background: #22c55e20; color: ${theme.green}; border: 1px solid #22c55e30; }
  .btn-success:hover { background: #22c55e30; }
  .btn-danger { background: #ef444420; color: ${theme.red}; border: 1px solid #ef444430; }
  .btn-danger:hover { background: #ef444430; }
  .btn-purple { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; }
  .btn-blue { background: #38bdf820; color: ${theme.blue}; border: 1px solid #38bdf830; }
  .btn-blue:hover { background: #38bdf830; }

  .input {
    background: #0d1526;
    border: 1px solid ${theme.border};
    color: ${theme.text};
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
    width: 100%;
    margin-bottom: 10px;
    transition: border-color 0.2s;
  }

  .input:focus {
    outline: none;
    border-color: ${theme.accent};
  }

  .input::placeholder { color: ${theme.textMuted}; }

  .select {
    background: #0d1526;
    border: 1px solid ${theme.border};
    color: ${theme.text};
    padding: 9px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
    cursor: pointer;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .inline-icon { display: inline-block; vertical-align: -0.18em; flex: 0 0 auto; }
  .drawer-item > svg, .card-title > svg, .option-card-title > svg { color: ${theme.blue}; }
  .drawer-item.active > svg { color: ${theme.accent}; }
  .drawer-title > svg, .logo > svg, .login-logo > svg { color: ${theme.yellow}; }
  .menu-toggle { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 42px; width: 42px; height: 42px; background: ${theme.bgCard}; border: 1px solid ${theme.border}; color: ${theme.textSub}; cursor: pointer; border-radius: 10px; touch-action: manipulation; }
  .menu-toggle:focus-visible { outline: 2px solid ${theme.blue}; outline-offset: 2px; }
  .market-filter-search { flex: 1 1 200px; min-width: 0; }
  .market-summary { min-width: 0; }
  .market-summary .stat-box { flex: 0 0 auto; }
  .market-table-scroll { width: 100%; max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .market-table { min-width: 520px; }
  .market-mobile-list { display: none; }
  .market-mobile-athlete {
    min-width: 0; padding: 12px; border: 1px solid ${theme.border}; border-radius: 10px;
    background: #0d1526; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px 8px;
  }
  .market-mobile-athlete + .market-mobile-athlete { margin-top: 8px; }
  .market-mobile-name { min-width: 0; overflow-wrap: anywhere; font-size: 14px; font-weight: 700; line-height: 1.25; }
  .market-mobile-category { color: ${theme.textMuted}; font-size: 11px; margin-top: 3px; overflow-wrap: anywhere; }
  .market-mobile-stats { align-self: start; min-width: 40px; min-height: 40px; padding: 6px !important; }
  .market-mobile-facts { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .market-mobile-fact { min-width: 0; padding: 7px 9px; border-radius: 7px; background: ${theme.bgCard}; }
  .market-mobile-fact-label { display: block; color: ${theme.textMuted}; font-size: 10px; text-transform: uppercase; letter-spacing: .4px; }
  .market-mobile-fact-value { display: block; margin-top: 2px; font-size: 14px; font-weight: 700; overflow-wrap: anywhere; }
  .market-mobile-buy-row { grid-column: 1 / -1; }
  .market-mobile-buy { width: 100%; min-height: 44px; font-size: 14px !important; }
  .market-mobile-unavailable { display: block; margin-top: 4px; color: ${theme.textMuted}; font-size: 11px; text-align: center; }
  .responsive-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .option-group { display: flex; gap: 10px; min-width: 0; }
  .option-group > .option-card { min-width: 0; overflow-wrap: anywhere; }
  .card, .card > *, .section-header { min-width: 0; }
  .card-title, .msg-box, .warning-box, .success-box { overflow-wrap: anywhere; }

  .table th {
    text-align: left;
    padding: 10px 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: ${theme.textMuted};
    border-bottom: 1px solid ${theme.border};
  }

  .table td {
    padding: 12px;
    border-bottom: 1px solid ${theme.border}22;
    font-size: 14px;
  }

  .table tr:hover td { background: ${theme.bgCardHover}; }
  .table tr:last-child td { border-bottom: none; }

  .stat-box {
    background: #0d1526;
    border: 1px solid ${theme.border};
    border-radius: 10px;
    padding: 14px 18px;
    display: inline-flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-label { font-size: 11px; color: ${theme.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-value { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; color: ${theme.accent}; }

  .warning-box {
    background: #eab30815;
    border: 1px solid #eab30830;
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 16px;
  }

  .warning-title { color: ${theme.yellow}; font-weight: 600; font-size: 13px; margin-bottom: 8px; }
  .warning-item { color: ${theme.textSub}; font-size: 13px; padding: 2px 0; }

  .success-box {
    background: #22c55e15;
    border: 1px solid #22c55e30;
    border-radius: 10px;
    padding: 12px 16px;
    color: ${theme.green};
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .msg-box {
    background: #22c55e15;
    border: 1px solid #22c55e30;
    border-radius: 8px;
    padding: 10px 14px;
    color: ${theme.green};
    font-size: 13px;
    margin-bottom: 12px;
  }

  .rank-number {
    font-family: 'Bebas Neue', cursive;
    font-size: 1.2rem;
    color: ${theme.textMuted};
  }

  .login-page {
    min-height: 100vh;
    min-height: 100svh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.bg};
    background-image: radial-gradient(ellipse at 20% 50%, #f9731608 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 20%, #38bdf808 0%, transparent 40%);
  }

  .login-card {
    background: ${theme.bgCard};
    border: 1px solid ${theme.border};
    border-radius: 16px;
    padding: 40px;
    width: 100%;
    max-width: 380px;
  }

  .login-logo {
    font-family: 'Bebas Neue', cursive;
    font-size: 2.8rem;
    letter-spacing: 3px;
    text-align: center;
    margin-bottom: 4px;
  }

  .login-sub {
    text-align: center;
    color: ${theme.textMuted};
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 32px;
  }

  .login-toggle {
    text-align: center;
    margin-top: 16px;
    color: ${theme.textMuted};
    font-size: 13px;
    cursor: pointer;
  }

  .login-toggle span { color: ${theme.accent}; font-weight: 600; }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .checkbox-row input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: ${theme.accent};
    cursor: pointer;
  }

  .option-card {
    background: #0d1526;
    border: 2px solid ${theme.border};
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.15s;
    flex: 1;
    text-align: center;
  }
  .option-card.selected {
    border-color: ${theme.accent};
    background: #f9731610;
  }
  .option-card-title { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
  .option-card-sub { font-size: 11px; color: ${theme.textMuted}; }

  @media (max-width: 768px) {
    .table th, .table td { font-size: 11px; padding: 6px; }
    .app-wrapper { padding-left: max(10px, env(safe-area-inset-left, 0px)); padding-right: max(10px, env(safe-area-inset-right, 0px)); padding-bottom: calc(30px + env(safe-area-inset-bottom, 0px)); }
    .header { flex-direction: row; align-items: center; flex-wrap: nowrap; gap: 8px; min-width: 0; }
    .header > div:first-child { min-width: 0; gap: 8px !important; }
    .nav { width: 100%; overflow-x: auto; padding-bottom: 4px; }
    .nav-btn { white-space: nowrap; font-size: 12px; padding: 6px 10px; }
    .card { padding: 14px; }
    .card-title { font-size: 1.1rem; }
    .table:not(.market-table) { display: block; max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .table th, .table td { padding: 8px; font-size: 12px; }
    .login-card { margin: 16px; padding: 24px; }
    .login-page { padding: max(16px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) max(16px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); }
    .stat-box { width: 100%; }
    .btn { font-size: 12px; padding: 8px 12px; }
    .drawer { top: 0; height: 100vh; height: 100dvh; padding-top: calc(16px + env(safe-area-inset-top, 0px)); padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
    .league-selector { max-width: min(42vw, 240px); min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; padding: 8px; font-size: 12px; }
    .league-dropdown { left: auto; right: 0; width: min(280px, calc(100vw - 24px)); min-width: 0; }
    .market-summary { flex-wrap: wrap; gap: 8px; }
    .market-summary .stat-box { width: auto; padding: 8px 10px; }
    .market-controls { min-width: 0; }
    .market-filter-search { flex-basis: 100%; width: 100%; }
    .market-controls .select { flex: 1 1 130px; min-width: 0; max-width: 100%; }
  }

  @media (max-width: 480px) {
    .app-wrapper { padding-left: max(8px, env(safe-area-inset-left, 0px)); padding-right: max(8px, env(safe-area-inset-right, 0px)); }
    .logo { font-size: 1.45rem; letter-spacing: 1px; gap: 4px; }
    .menu-toggle { flex-basis: 38px; width: 38px; height: 38px; }
    .header > div:first-child { gap: 6px !important; }
    .header { margin-bottom: 16px; }
    .input, .select { font-size: 16px; }
    .market-table th, .market-table td { padding: 8px !important; font-size: 12px !important; }
    .market-table td:first-child > div:first-child,
    .market-table td:first-child > div:nth-child(2) { overflow-wrap: anywhere; }
    .market-actions { gap: 6px !important; }
    .market-actions .market-stat-btn { flex: 0 0 32px; width: 32px; height: 34px; padding: 4px !important; }
    .market-actions .market-buy-btn { padding: 7px 10px !important; font-size: 12px !important; white-space: nowrap; }
    .league-selector { max-width: 38vw; }
    .drawer { width: min(300px, calc(100vw - 48px)); }
    .section-header { flex-wrap: wrap; align-items: flex-start; gap: 8px; }
    .option-group { flex-wrap: wrap; }
    .option-group > .option-card { flex: 1 1 130px; }
    .responsive-grid { grid-template-columns: minmax(0, 1fr); }
    .card > [style*="display: flex"] { flex-wrap: wrap; }
    .card > [style*="display: flex"] > * { min-width: 0; max-width: 100%; }
  }

  @media (max-width: 600px) {
    .market-mobile-list { display: block; padding: 10px; }
    .market-table-scroll { display: none; }
  }

  @media (max-width: 380px) {
    .logo { font-size: 1.25rem; }
    .league-selector { max-width: 34vw; gap: 4px; }
    .header > div:first-child { flex: 1 1 auto; }
    .option-group { flex-direction: column; }
    .option-group > .option-card { flex-basis: auto; }
  }
`;

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [pagina, setPagina] = useState("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [menuAperto, setMenuAperto] = useState(false);
  const [selettoreLegaAperto, setSelettoreLegaAperto] = useState(false);
  const [mieLeghe, setMieLeghe] = useState([]);
  const [legaAttiva, setLegaAttiva] = useState(null);

  useEffect(() => {
    if (!menuAperto) return undefined;
    const overflowOriginale = document.body.style.overflow;
    const chiudiConEsc = event => { if (event.key === "Escape") setMenuAperto(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", chiudiConEsc);
    return () => {
      document.body.style.overflow = overflowOriginale;
      window.removeEventListener("keydown", chiudiConEsc);
    };
  }, [menuAperto]);

  const caricaMieLeghe = async (t) => {
    const res = await fetch(`${API}/league/mie-leghe`, { headers: { Authorization: `Bearer ${t}` } });
    if (res.ok) {
      const data = await res.json();
      setMieLeghe(data);
      if (data.length > 0 && !legaAttiva) setLegaAttiva(data[0]);
    }
  };

  useState(() => {
    const t = localStorage.getItem("token");
    if (t) {
      fetch(`${API}/me/`, { headers: { Authorization: `Bearer ${t}` } })
        .then(r => r.json())
        .then(data => {
          setIsAdmin(data.is_admin === 1);
          setUsername(data.username);
          caricaMieLeghe(t);
        })
        .catch(() => {
          setToken(null);
          localStorage.removeItem("token");
        });
    }
  }, []);

  const dopoLogin = async (t) => {
    setToken(t);
    localStorage.setItem("token", t);
    const res = await fetch(`${API}/me/`, { headers: { Authorization: `Bearer ${t}` } });
    const data = await res.json();
    setIsAdmin(data.is_admin === 1);
    setUsername(data.username);
    setPagina("dashboard");
    caricaMieLeghe(t);
  };

  if (!token) return <Login setToken={dopoLogin} />;

  const vaiA = (p) => { setPagina(p); setMenuAperto(false); };

  const sceltaLega = (l) => {
    setLegaAttiva(l);
    setSelettoreLegaAperto(false);
    setPagina("dashboard");
  };

  return (
    <>
      <style>{styles}</style>
      <style>{`
        .drawer-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          z-index: 99; cursor: pointer;
        }
        .drawer {
          position: fixed; top: 0; left: 0; height: 100vh; height: 100dvh; width: min(270px, calc(100vw - 48px));
          background: ${theme.bgCard}; border-right: 1px solid ${theme.border};
          z-index: 100; padding: calc(24px + env(safe-area-inset-top, 0px)) 0 calc(16px + env(safe-area-inset-bottom, 0px)); display: flex; flex-direction: column;
          transform: translateX(-100%); transition: transform 0.25s ease;
          overflow-y: auto;
        }
        .drawer.open { transform: translateX(0); }
        .drawer-item {
          padding: 12px 24px; color: ${theme.textSub}; cursor: pointer;
          font-size: 14px; font-weight: 500; transition: all 0.15s;
          display: flex; align-items: center; gap: 10px;
        }
        .drawer-item:hover { background: ${theme.bgCardHover}; }
        .drawer-item.active { color: ${theme.accent}; background: ${theme.bgCardHover}; }
        .drawer-title {
          padding: 8px 24px 16px; font-family: 'Bebas Neue', cursive;
          font-size: 1.4rem; letter-spacing: 2px;
          border-bottom: 1px solid ${theme.border}; margin-bottom: 8px;
        }
        .drawer-section {
          padding: 6px 24px 4px; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1px; color: ${theme.textMuted};
          margin-top: 8px;
        }
        .league-selector {
          background: ${theme.bgCard}; border: 1px solid ${theme.border};
          border-radius: 8px; padding: 8px 12px; display: flex; align-items: center;
          gap: 8px; cursor: pointer; font-weight: 600; font-size: 14px; color: ${theme.text}; font-family: inherit;
        }
        .league-selector-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .league-dropdown {
          position: absolute; top: 100%; left: 0; margin-top: 6px;
          background: ${theme.bgCard}; border: 1px solid ${theme.border};
          border-radius: 10px; width: min(280px, calc(100vw - 32px)); min-width: 0; z-index: 50;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4); overflow: hidden;
        }
        .league-dropdown-item {
          padding: 10px 14px; cursor: pointer; font-size: 13px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .league-dropdown-item:hover { background: ${theme.bgCardHover}; }
        @media (max-width: 768px) {
          .header > .league-selector-wrap { flex: 0 1 auto; }
          .league-selector { max-width: min(42vw, 240px); min-width: 0; overflow: hidden; white-space: nowrap; padding: 8px; font-size: 12px; }
          .league-dropdown { left: auto; right: 0; width: min(280px, calc(100vw - 24px)); min-width: 0; }
        }
        @media (max-width: 480px) {
          .league-selector { max-width: 38vw; }
          .drawer { width: min(300px, calc(100vw - 48px)); }
        }
        @media (max-width: 380px) {
          .league-selector { max-width: 34vw; gap: 4px; }
          .header > div:first-child { flex: 1 1 auto; }
        }
      `}</style>

      {menuAperto && <div className="drawer-overlay" onClick={() => setMenuAperto(false)} />}
      <div id="menu-principale" className={`drawer ${menuAperto ? "open" : ""}`} aria-hidden={!menuAperto}>
        <div className="drawer-title"><Icon name="bolt" className="inline-icon" /> Fanta<span style={{ color: theme.accent }}>Roller</span></div>

        <div className="drawer-section">Gioco</div>
        <div className={`drawer-item ${pagina === "dashboard" ? "active" : ""}`} onClick={() => vaiA("dashboard")}><Icon name="home" /> Dashboard</div>
        <div className={`drawer-item ${pagina === "squadra" ? "active" : ""}`} onClick={() => vaiA("squadra")}><Icon name="trophy" /> La mia Squadra</div>
        <div className={`drawer-item ${pagina === "mercato" ? "active" : ""}`} onClick={() => vaiA("mercato")}><Icon name="cart" /> Mercato</div>
        <div className={`drawer-item ${pagina === "classifica" ? "active" : ""}`} onClick={() => vaiA("classifica")}><Icon name="medal" /> Classifica di Lega</div>
        <div className={`drawer-item ${pagina === "squadre" ? "active" : ""}`} onClick={() => vaiA("squadre")}><Icon name="users" /> Squadre</div>
        <div className={`drawer-item ${pagina === "partecipanti" ? "active" : ""}`} onClick={() => vaiA("partecipanti")}><Icon name="user" /> Partecipanti</div>
        <div className={`drawer-item ${pagina === "chat" ? "active" : ""}`} onClick={() => vaiA("chat")}><Icon name="chat" /> Chat Lega</div>
        <div className={`drawer-item ${pagina === "gare" ? "active" : ""}`} onClick={() => vaiA("gare")}><Icon name="calendar" /> Gare</div>

        <div className="drawer-section">Le mie Leghe</div>
        <div className={`drawer-item ${pagina === "leghe" ? "active" : ""}`} onClick={() => vaiA("leghe")}><Icon name="list" /> Gestisci Leghe</div>

        <div className="drawer-section">Info</div>
        <div className={`drawer-item ${pagina === "regolamento" ? "active" : ""}`} onClick={() => vaiA("regolamento")}><Icon name="list" /> Regolamento</div>
        <div className={`drawer-item ${pagina === "privacy" ? "active" : ""}`} onClick={() => vaiA("privacy")}><Icon name="lock" /> Privacy</div>

        {isAdmin && <>
          <div className="drawer-section">Admin</div>
          <div className={`drawer-item ${pagina === "admin" ? "active" : ""}`} onClick={() => vaiA("admin")}><Icon name="tool" /> Pannello Admin</div>
        </>}
        {legaAttiva && legaAttiva.is_owner && <>
          <div className="drawer-section">Admin Lega</div>
          <div className={`drawer-item ${pagina === "admin-lega" ? "active" : ""}`} onClick={() => vaiA("admin-lega")}><Icon name="settings" /> Gestisci Lega</div>
        </>}

        <button className="btn btn-danger" style={{ width: "100%", fontSize: 13, margin: "12px 0", marginLeft: "auto", marginRight: "auto", maxWidth: "calc(100% - 48px)" }} onClick={() => { setToken(null); localStorage.removeItem("token"); setPagina("dashboard"); setMenuAperto(false); }}>
          Esci
        </button>
      </div>

      <div className="app-wrapper">
        <div className="header">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              className="menu-toggle"
              aria-label={menuAperto ? "Chiudi il menu" : "Apri il menu"}
              aria-expanded={menuAperto}
              aria-controls="menu-principale"
              onClick={() => setMenuAperto(!menuAperto)}
            >
              <Icon name={menuAperto ? "close" : "menu"} size={22} />
            </button>
            <div className="logo" style={{ whiteSpace: "nowrap" }}><Icon name="bolt" className="inline-icon" /> Fanta<span>Roller</span></div>
          </div>

          <div className="league-selector-wrap" style={{ position: "relative", minWidth: 0 }}>
            <button type="button" className="league-selector" aria-expanded={selettoreLegaAperto} onClick={() => setSelettoreLegaAperto(!selettoreLegaAperto)}>
              <Icon name="medal" size={16} /> <span className="league-selector-name">{legaAttiva ? legaAttiva.nome : "Nessuna lega"}</span> <Icon name={selettoreLegaAperto ? "chevronUp" : "chevronDown"} size={14} />
            </button>
            {selettoreLegaAperto && (
              <div className="league-dropdown">
                {mieLeghe.length === 0 && <div style={{ padding: 14, fontSize: 12, color: theme.textMuted }}>Non sei in nessuna lega</div>}
                {mieLeghe.map(l => (
                  <div key={l.id} className="league-dropdown-item" onClick={() => sceltaLega(l)}>
                    <span>{l.nome}</span>
                    <span className="badge badge-blue">{l.modalita}</span>
                  </div>
                ))}
                <div className="league-dropdown-item" style={{ borderTop: `1px solid ${theme.border}`, color: theme.accent, fontWeight: 600 }} onClick={() => { setSelettoreLegaAperto(false); vaiA("leghe"); }}>
                  <Icon name="plus" size={15} /> Crea o unisciti
                </div>
              </div>
            )}
          </div>
        </div>

        {!legaAttiva && pagina !== "leghe" && pagina !== "regolamento" && pagina !== "privacy" && pagina !== "admin" ? (
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12, color: theme.blue }}><Icon name="users" size={38} /></div>
            <div className="card-title">Nessuna lega selezionata</div>
            <p style={{ color: theme.textSub, fontSize: 14, marginBottom: 16 }}>Crea una nuova lega o unisciti a una esistente per iniziare a giocare!</p>
            <button className="btn btn-primary" onClick={() => vaiA("leghe")}>Vai alle Leghe</button>
          </div>
        ) : (
          <>
            {pagina === "dashboard" && <Dashboard token={token} username={username} lega={legaAttiva} vaiA={vaiA} />}
            {pagina === "squadra" && <Squadra token={token} lega={legaAttiva} />}
            {pagina === "mercato" && <Mercato token={token} lega={legaAttiva} />}
            {pagina === "classifica" && <Classifica username={username} token={token} lega={legaAttiva} />}
            {pagina === "squadre" && <SquadreLega token={token} lega={legaAttiva} />}
            {pagina === "partecipanti" && <Partecipanti token={token} lega={legaAttiva} />}
            {pagina === "chat" && <Chat token={token} lega={legaAttiva} />}
            {pagina === "gare" && <Gare token={token} lega={legaAttiva} />}
            {pagina === "leghe" && <Leghe token={token} onCambioLeghe={() => caricaMieLeghe(token)} mieLeghe={mieLeghe} sceltaLega={sceltaLega} />}
            {pagina === "regolamento" && <Regolamento lega={legaAttiva} />}
            {pagina === "privacy" && <Privacy />}
            {pagina === "admin" && <Admin token={token} />}
            {pagina === "admin-lega" && <AdminLega token={token} lega={legaAttiva} />}
          </>
        )}
      </div>
    </>
  );
}

function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errore, setErrore] = useState("");
  const [successo, setSuccesso] = useState("");
  const [registrati, setRegistrati] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalitaCompletaProfilo, setModalitaCompletaProfilo] = useState(false);
  const [mostraOpzioniEmail, setMostraOpzioniEmail] = useState(false);
  const [nuovaEmail, setNuovaEmail] = useState("");
  const [messaggioEmail, setMessaggioEmail] = useState("");

  const emailValida = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const reinviaVerifica = async () => {
    setMessaggioEmail("Invio in corso...");
    try {
      const res = await fetch(`${API}/reinvia-verifica`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      setMessaggioEmail(res.ok ? "Email reinviata! Controlla anche lo spam." : `Errore: ${data.detail}`);
    } catch {
      setMessaggioEmail("Errore di connessione");
    }
  };

  const cambiaEmail = async () => {
    if (!emailValida(nuovaEmail)) { setMessaggioEmail("Inserisci un'email valida"); return; }
    setMessaggioEmail("Aggiornamento in corso...");
    try {
      const res = await fetch(`${API}/cambia-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email: nuovaEmail }),
      });
      const data = await res.json();
      setMessaggioEmail(res.ok ? "Email aggiornata! Controlla la posta per confermare." : `Errore: ${data.detail}`);
      if (res.ok) setNuovaEmail("");
    } catch {
      setMessaggioEmail("Errore di connessione");
    }
  };

  const handleSubmit = async () => {
    if (username.length < 3) { setErrore("Username troppo corto (min 3 caratteri)"); return; }
    if (username.length > 40) { setErrore("Username troppo lungo (max 20 caratteri)"); return; }
    if (password.length < 4) { setErrore("Password troppo corta (min 4 caratteri)"); return; }
    if (password.length > 40) { setErrore("Password troppo lunga (max 30 caratteri)"); return; }
    if ((registrati || modalitaCompletaProfilo) && !emailValida(email)) {
      setErrore("Inserisci un'email valida");
      return;
    }
    setLoading(true);
    setErrore("");

    if (modalitaCompletaProfilo) {
      try {
        const res = await fetch(`${API}/aggiungi-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, email }),
        });
        const data = await res.json();
        if (res.ok) {
          setSuccesso("Email inviata! Controlla la posta e conferma prima di rientrare.");
          setModalitaCompletaProfilo(false);
          setErrore("");
        } else {
          setErrore(`Errore: ${data.detail}`);
        }
      } catch {
        setErrore("Errore di connessione");
      }
      setLoading(false);
      return;
    }

    const url = registrati ? `${API}/register/` : `${API}/login/`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrati ? { username, password, email } : { username, password }),
      });
      const data = await res.json();
      if (registrati) {
        if (res.ok) {
          setSuccesso("Registrato! Controlla la tua email per confermare l'account, poi fai login.");
          setErrore("");
          setRegistrati(false);
        } else {
          setErrore(`Errore: ${data.detail}`);
        }
      } else if (data.access_token) {
        setToken(data.access_token);
      } else if (data.detail === "email_mancante") {
        setModalitaCompletaProfilo(true);
        setErrore("");
        setSuccesso("");
      } else if (data.detail === "email_non_verificata") {
        setErrore("Devi confermare la tua email prima di accedere. Controlla la posta.");
        setMostraOpzioniEmail(true);
      } else {
        setErrore("Credenziali errate");
      }
    } catch {
      setErrore("Errore di connessione");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo"><Icon name="bolt" className="inline-icon" /> Fanta<span style={{ color: theme.accent }}>Roller</span></div>
          <div className="login-sub">Fantasy Pattinaggio Corsa</div>

          {modalitaCompletaProfilo ? (
            <div style={{ background: "#eab30815", border: "1px solid #eab30830", borderRadius: 8, padding: "10px 14px", color: theme.yellow, fontSize: 13, marginBottom: 16, textAlign: "center" }}>
              <Icon name="mail" className="inline-icon" /> Il tuo account non ha ancora un'email associata. Inseriscila per continuare.
            </div>
          ) : (
            <div style={{ background: "#38bdf815", border: "1px solid #38bdf830", borderRadius: 8, padding: "10px 14px", color: theme.blue, fontSize: 13, marginBottom: 16, textAlign: "center" }}>
              Prima volta? Clicca su <strong>"Registrati"</strong> in fondo per creare il tuo account!
            </div>
          )}

          {successo && <div className="success-box">{successo}</div>}
          {loading && <div className="success-box"><Icon name="clock" className="inline-icon" /> Caricamento...</div>}
          {errore && <div style={{ background: "#ef444415", border: "1px solid #ef444430", borderRadius: 8, padding: "10px 14px", color: theme.red, fontSize: 13, marginBottom: 12 }}>{errore}</div>}

          <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />

          {(registrati || modalitaCompletaProfilo) && (
            <input className="input" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          )}

          <button className="btn btn-primary" style={{ width: "100%", padding: "12px", fontSize: 15 }} onClick={handleSubmit} disabled={loading}>
            {modalitaCompletaProfilo ? "Invia email di conferma" : registrati ? "Registrati" : "Entra"}
          </button>

          {modalitaCompletaProfilo ? (
            <div className="login-toggle" onClick={() => { setModalitaCompletaProfilo(false); setErrore(""); setSuccesso(""); }}><Icon name="arrowLeft" className="inline-icon" /> Torna al login</div>
          ) : (
            <div className="login-toggle" onClick={() => { setRegistrati(!registrati); setErrore(""); setSuccesso(""); }}>
              {registrati ? <>Hai già un account? <span>Login</span></> : <>Non hai un account? <span>Registrati</span></>}
            </div>
          )}

          {mostraOpzioniEmail && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${theme.border}` }}>
              {messaggioEmail && <div className="msg-box">{messaggioEmail}</div>}
              <button className="btn btn-blue" style={{ width: "100%", marginBottom: 10 }} onClick={reinviaVerifica}><Icon name="mail" className="inline-icon" /> Reinvia email di conferma</button>
              <input className="input" placeholder="Nuova email (se hai sbagliato)" type="email" value={nuovaEmail} onChange={e => setNuovaEmail(e.target.value)} />
              <button className="btn btn-primary" style={{ width: "100%" }} onClick={cambiaEmail}><Icon name="edit" className="inline-icon" /> Cambia email e reinvia</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Dashboard({ token, username, lega, vaiA }) {
  const [squadra, setSquadra] = useState(null);
  const [posizione, setPosizione] = useState(null);
  const [errore, setErrore] = useState("");

  const carica = async () => {
    if (!lega) return;
    const res = await fetch(`${API}/squadra/?league_id=${lega.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { setSquadra(await res.json()); setErrore(""); }
    else if (res.status === 404) setErrore("crea");

    const resC = await fetch(`${API}/league/classifica?league_id=${lega.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (resC.ok) {
      const classifica = await resC.json();
      const idx = classifica.findIndex(u => u.username === username);
      if (idx !== -1) setPosizione({ posizione: idx + 1, totale: classifica.length, punti: classifica[idx].punti, vincitore: idx === 0 });
      else setPosizione(null);
    }
  };

  useState(() => { carica(); }, [lega]);

  if (!lega) return null;

  if (errore === "crea") return <CreaSquadraCard token={token} lega={lega} onCreata={carica} />;

  if (!squadra) return <div className="card" style={{ color: theme.textMuted }}>Caricamento...</div>;

  const totaleAtleti = lega.atleti_per_categoria ? lega.atleti_per_categoria * 8 : 16;

  return (
    <div>
      <div className="card" style={{ background: "linear-gradient(135deg, #1a1f35, #111827)", border: `1px solid ${theme.accent}30` }}>
        <div style={{ fontSize: 11, color: theme.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>{lega.nome}</div>
        <div className="card-title" style={{ marginBottom: 12 }}><Icon name="trophy" className="inline-icon" /> {squadra.nome}</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="stat-box">
            <span className="stat-label">Posizione</span>
            <span className="stat-value">{posizione ? `${posizione.posizione}°` : "—"}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Punti</span>
            <span className="stat-value">{posizione ? posizione.punti : 0}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Atleti</span>
            <span className="stat-value">{squadra.atleti.length}/{totaleAtleti}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Budget</span>
            <span className="stat-value">{squadra.budget}</span>
          </div>
        </div>
      </div>

      {posizione && posizione.vincitore && (
        <div style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", borderRadius: 12, padding: "24px 20px", marginBottom: 16, textAlign: "center" }}>
          <div style={{ marginBottom: 8, color: "white" }}><Icon name="trophy" size={40} /></div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: "white", letterSpacing: 2 }}>CAMPIONE!</div>
          <div style={{ color: "white", fontSize: 14, marginTop: 8, fontWeight: 600 }}>Sei primo in {lega.nome}!</div>
        </div>
      )}

      <div className="card">
        <div className="card-title"><Icon name="rocket" className="inline-icon" /> Azioni rapide</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => vaiA("squadra")}><Icon name="trophy" className="inline-icon" /> La mia Squadra</button>
          {lega.modalita === "listone" && <button className="btn btn-success" onClick={() => vaiA("mercato")}><Icon name="cart" className="inline-icon" /> Vai al Mercato</button>}
          <button className="btn btn-blue" onClick={() => vaiA("classifica")}><Icon name="medal" className="inline-icon" /> Classifica</button>
        </div>
      </div>
    </div>
  );
}

function CreaSquadraCard({ token, lega, onCreata }) {
  const [nomeSquadra, setNomeSquadra] = useState("");
  const [messaggio, setMessaggio] = useState("");

  const creaSquadra = async () => {
    if (nomeSquadra.length > 25) { setMessaggio("Nome squadra troppo lungo (max 25 caratteri)"); return; }
    if (nomeSquadra.length < 3) { setMessaggio("Nome squadra troppo corto (min 3 caratteri)"); return; }
    const res = await fetch(`${API}/squadra/crea?nome=${encodeURIComponent(nomeSquadra)}&league_id=${lega.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) onCreata();
    else setMessaggio(`Errore: ${data.detail}`);
  };

  return (
    <div className="card">
      <div className="card-title"><Icon name="building" className="inline-icon" /> Crea la tua squadra in "{lega.nome}"</div>
      {messaggio && <div className="msg-box">{messaggio}</div>}
      <input className="input" placeholder="Nome squadra" value={nomeSquadra} onChange={e => setNomeSquadra(e.target.value)} />
      <button className="btn btn-primary" onClick={creaSquadra}>Crea Squadra</button>
    </div>
  );
}

function Squadra({ token, lega }) {
  const [messaggio, setMessaggio] = useState("");
  const [squadra, setSquadra] = useState(null);
  const [errore, setErrore] = useState("");
  const [nuovoNome, setNuovoNome] = useState("");
  const [rinominaAperto, setRinominaAperto] = useState(false);
  const [transazioniAperte, setTransazioniAperte] = useState(false);

  const caricaSquadra = async () => {
    if (!lega) return;
    const res = await fetch(`${API}/squadra/?league_id=${lega.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { setSquadra(await res.json()); setErrore(""); }
    else if (res.status === 404) setErrore("crea");
  };

  const rinomina = async () => {
    if (nuovoNome.length > 25) { setMessaggio("Nome squadra troppo lungo (max 25 caratteri)"); return; }
    if (nuovoNome.length < 3) { setMessaggio("Nome squadra troppo corto (min 3 caratteri)"); return; }
    const res = await fetch(`${API}/squadra/rinomina?nome=${encodeURIComponent(nuovoNome)}&league_id=${lega.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMessaggio(data.message);
    setRinominaAperto(false);
    caricaSquadra();
  };

  const vendi = async (id) => {
    const res = await fetch(`${API}/squadra/vendi/${id}?league_id=${lega.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Idempotency-Key": chiaveOperazione() } });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    caricaSquadra();
  };

  useState(() => { caricaSquadra(); }, [lega]);

  if (!lega) return null;
  if (errore === "crea") return <CreaSquadraCard token={token} lega={lega} onCreata={caricaSquadra} />;
  if (!squadra) return <div className="card" style={{ color: theme.textMuted }}>Caricamento...</div>;

  const atletiPerCat = lega.atleti_per_categoria || 2;
  const totaleAtleti = atletiPerCat * 8;
  const categorie = ["Ragazzi Maschi", "Ragazze Femminile", "Allievi Maschi", "Allieve Femminile", "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"];
  const atletiPerCategoria = (cat) => squadra.atleti.filter(a => a.categoria === cat).length;
  const squadraCompleta = squadra.atleti.length === totaleAtleti;

  return (
    <div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div className="card-title" style={{ marginBottom: 0 }}><Icon name="trophy" className="inline-icon" /> {squadra.nome}</div>
              <button className="btn btn-blue" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setRinominaAperto(!rinominaAperto)}><Icon name="edit" className="inline-icon" /> Rinomina</button>
            </div>
            {rinominaAperto && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input className="input" style={{ marginBottom: 0, flex: 1 }} placeholder="Nuovo nome squadra" value={nuovoNome} onChange={e => setNuovoNome(e.target.value)} />
                <button className="btn btn-primary" onClick={rinomina}>Salva</button>
                <button className="btn btn-danger" onClick={() => setRinominaAperto(false)} aria-label="Annulla rinomina"><Icon name="close" size={16} /></button>
              </div>
            )}
            {squadraCompleta ? <div className="badge badge-green"><Icon name="check" size={13} /> Squadra completa</div> : <div className="badge badge-orange"><Icon name="warning" size={13} /> Squadra incompleta</div>}
          </div>
          <div className="stat-box">
            <span className="stat-label">Budget</span>
            <span className="stat-value">{squadra.budget}</span>
            <span style={{ fontSize: 11, color: theme.textMuted }}>crediti</span>
          </div>
        </div>

        {messaggio && <div className="msg-box" style={{ marginTop: 12 }}>{messaggio}</div>}

        {!squadraCompleta && (
          <div className="warning-box" style={{ marginTop: 16 }}>
            <div className="warning-title"><Icon name="warning" className="inline-icon" /> Atleti mancanti:</div>
            {categorie.map(cat => {
              const mancanti = atletiPerCat - atletiPerCategoria(cat);
              return mancanti > 0 ? <div key={cat} className="warning-item">• {mancanti} in {cat}</div> : null;
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title"><Icon name="users" className="inline-icon" /> Atleti ({squadra.atleti.length}/{totaleAtleti})</div>
        {squadra.atleti.length === 0
          ? <p style={{ color: theme.textMuted, fontSize: 14 }}>Nessun atleta{lega.modalita === "listone" ? " — vai al mercato!" : ""}</p>
          : <table className="table">
              <thead><tr><th>Nome</th><th>Punti</th>{lega.modalita === "listone" ? <><th>Pagato</th><th>Valore</th></> : <th>Pagato</th>}<th></th></tr></thead>
              <tbody>
                {squadra.atleti.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: theme.textMuted }}>{a.categoria}</div>
                    </td>
                    <td style={{ color: theme.green, fontWeight: 700 }}>{a.punti || 0}</td>
                    <td style={{ color: theme.accent, fontWeight: 700 }}>{a.prezzo}cr</td>
                    {lega.modalita === "listone" && <td style={{ color: theme.textSub }}>{a.prezzo_corrente}cr</td>}
                    <td><button className="btn btn-danger" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => vendi(a.id)}>Vendi</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <button type="button" aria-expanded={transazioniAperte} onClick={() => setTransazioniAperte(!transazioniAperte)}
          style={{ width: "100%", padding: "14px 18px", border: 0, background: "transparent", color: theme.text, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", font: "inherit" }}>
          <span style={{ fontWeight: 700 }}>Storico acquisti e vendite</span>
          <Icon name={transazioniAperte ? "chevronUp" : "chevronDown"} size={16} />
        </button>
        {transazioniAperte && <div style={{ padding: "0 18px 16px" }}>
          {lega.modalita === "listone" && <p style={{ color: theme.textSub, fontSize: 13 }}>Plusvalenza/minusvalenza realizzata: <strong style={{ color: (squadra.plusvalenza_realizzata || 0) >= 0 ? theme.green : theme.red }}>{squadra.plusvalenza_realizzata || 0} crediti</strong></p>}
          {!squadra.transazioni?.length ? <p style={{ color: theme.textMuted, fontSize: 13 }}>Nessuna operazione registrata in questa lega.</p> : (
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {squadra.transazioni.map((tx, index) => <div key={`${tx.data}-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 0", borderBottom: `1px solid ${theme.border}`, fontSize: 13 }}>
                <span>{tx.tipo.startsWith("acquisto") ? "Acquisto" : "Vendita"} · {tx.atleta}<span style={{ display: "block", color: theme.textMuted, fontSize: 11 }}>{new Date(tx.data).toLocaleString()}</span></span>
                <span style={{ color: tx.tipo === "vendita" && tx.plusvalenza != null ? (tx.plusvalenza >= 0 ? theme.green : theme.red) : theme.textSub, whiteSpace: "nowrap" }}>{tx.prezzo}cr{lega.modalita === "listone" && tx.plusvalenza != null && tx.tipo === "vendita" ? ` (${tx.plusvalenza > 0 ? "+" : ""}${tx.plusvalenza})` : ""}</span>
              </div>)}
            </div>
          )}
        </div>}
      </div>

      {lega.modalita === "asta" && (
        <AggiungiAtletaManuale token={token} lega={lega} onAggiunto={caricaSquadra} />
      )}
    </div>
  );
}

function AggiungiAtletaManuale({ token, lega, onAggiunto }) {
  const [atleti, setAtleti] = useState([]);
  const [atletaId, setAtletaId] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [aperto, setAperto] = useState(false);
  const [ricercaAtleta, setRicercaAtleta] = useState("");

  useState(() => {
    fetch(`${API}/athletes/`).then(r => r.json()).then(setAtleti);
  }, []);

  const aggiungi = async () => {
    if (!atletaId || !prezzo) { setMessaggio("Seleziona atleta e prezzo"); return; }
    const res = await fetch(`${API}/squadra/aggiungi-manuale`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "Idempotency-Key": chiaveOperazione() },
      body: JSON.stringify({ league_id: lega.id, atleta_id: parseInt(atletaId), prezzo: parseInt(prezzo) }),
    });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    if (res.ok) { setAtletaId(""); setPrezzo(""); onAggiunto(); }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setAperto(!aperto)}>
        <span style={{ fontWeight: 600, fontSize: 15 }}><Icon name="plus" className="inline-icon" /> Aggiungi atleta (asta)</span>
        <Icon name={aperto ? "chevronUp" : "chevronDown"} size={16} />
      </div>
      {aperto && (
        <div style={{ padding: "0 20px 20px" }}>
          {messaggio && <div className="msg-box">{messaggio}</div>}
          <input
            className="input"
            placeholder="Cerca atleta..."
            value={ricercaAtleta}
            onChange={e => { setRicercaAtleta(e.target.value); setAtletaId(""); }}
          />
          {ricercaAtleta.length >= 2 && (
            <div style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 8, marginBottom: 10, maxHeight: 200, overflowY: "auto" }}>
              {atleti
                .filter(a => a.name.toLowerCase().includes(ricercaAtleta.toLowerCase()))
                .map(a => (
                  <div
                    key={a.id}
                    style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${theme.border}22`, background: atletaId === String(a.id) ? "#f9731615" : "" }}
                    onClick={() => { setAtletaId(String(a.id)); setRicercaAtleta(a.name + " — " + a.categoria); }}
                  >
                    <span style={{ fontWeight: 600 }}>{a.name}</span>
                    <span style={{ color: theme.textMuted, fontSize: 12, marginLeft: 8 }}>{a.categoria}</span>
                  </div>
                ))
              }
            </div>
          )}
          <input className="input" placeholder="Prezzo pagato in asta" type="number" value={prezzo} onChange={e => setPrezzo(e.target.value)} />
          <button className="btn btn-primary" onClick={aggiungi}>Aggiungi alla squadra</button>
        </div>
      )}
    </div>
  );
}

function Mercato({ token, lega }) {
  const [atleti, setAtleti] = useState([]);
  const [messaggio, setMessaggio] = useState("");
  const [filtro, setFiltro] = useState("");
  const [ricerca, setRicerca] = useState("");
  const [squadra, setSquadra] = useState([]);
  const [ordinePrezzo, setOrdinePrezzo] = useState("");
  const [atletaDettagli, setAtletaDettagli] = useState(null);
  const [atletaAperto, setAtletaAperto] = useState(null);
  const [caricamentoDettagli, setCaricamentoDettagli] = useState(false);
  const [erroreDettagli, setErroreDettagli] = useState("");
  const [atletaConfrontoTessera, setAtletaConfrontoTessera] = useState("");
  const [storicoAtletaConfronto, setStoricoAtletaConfronto] = useState(null);
  const [avversariCasuali, setAvversariCasuali] = useState([]);
  const [categoriaAperta, setCategoriaAperta] = useState(null);
  const [budget, setBudget] = useState(999);
  const [atletiPerCategoria, setAtletiPerCategoria] = useState({});
  const [piuAcquistati, setPiuAcquistati] = useState([]);
  const [piuAcquistatiAperto, setPiuAcquistatiAperto] = useState(false);
  const [plusvalenze, setPlusvalenze] = useState([]);
  const [plusvalenzeAperto, setPlusvalenzeAperto] = useState(false);

  const limitePerCategoria = lega ? (lega.atleti_per_categoria || 2) : 2;

  const apriDettagli = async (id) => {
    if (atletaAperto === id) return;
    setAtletaAperto(id);
    setAtletaDettagli(null);
    setErroreDettagli("");
    setAtletaConfrontoTessera("");
    setStoricoAtletaConfronto(null);
    setAvversariCasuali([]);
    setCaricamentoDettagli(true);
    try {
      const res = await fetch(`${API}/atleta/${id}/statistiche`);
      if (!res.ok) throw new Error("Non riesco a caricare le statistiche dell'atleta.");
      const datiAtleta = await res.json();
      const storico = await caricaStoricoAtleta(datiAtleta.tessera);
      setAtletaDettagli({ ...datiAtleta, storico });
    } catch (error) {
      setErroreDettagli(error.message || "Errore durante il caricamento delle statistiche.");
    } finally {
      setCaricamentoDettagli(false);
    }
  };

  const chiudiDettagli = () => {
    setAtletaAperto(null);
    setAtletaDettagli(null);
    setErroreDettagli("");
    setAtletaConfrontoTessera("");
    setStoricoAtletaConfronto(null);
    setAvversariCasuali([]);
  };

  useEffect(() => {
    if (atletaAperto === null) return undefined;
    const chiudiConEsc = (event) => {
      if (event.key === "Escape") chiudiDettagli();
    };
    window.addEventListener("keydown", chiudiConEsc);
    return () => window.removeEventListener("keydown", chiudiConEsc);
  }, [atletaAperto]);

  useState(() => {
    if (!lega) return;
    fetch(`${API}/athletes/`).then(r => r.json()).then(setAtleti);
    fetch(`${API}/atleti/piu-acquistati`).then(r => r.json()).then(setPiuAcquistati);
    fetch(`${API}/atleti/plusvalenze`).then(r => r.json()).then(setPlusvalenze);
    fetch(`${API}/squadra/?league_id=${lega.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => {
        if (data.atleti) {
          setSquadra(data.atleti.map(a => a.id));
          setBudget(data.budget);
          const perCat = {};
          data.atleti.forEach(a => { perCat[a.categoria] = (perCat[a.categoria] || 0) + 1; });
          setAtletiPerCategoria(perCat);
        }
      });
  }, [lega]);

  useEffect(() => {
    let attivo = true;
    setAvversariCasuali([]);
    const tesseraCorrente = atletaDettagli?.tessera;
    if (!tesseraCorrente || !atletaDettagli?.storico || !atleti.length) return () => { attivo = false; };

    const atletaCorrente = atleti.find(a => String(a.tessera) === String(tesseraCorrente));
    const categoria = atletaCorrente?.categoria || atletaDettagli.categoria;
    const sesso = atletaCorrente?.sesso || atletaDettagli.sesso;
    const candidati = atleti.filter(a =>
      a.tessera && String(a.tessera) !== String(tesseraCorrente) && a.categoria === categoria && a.sesso === sesso
    );
    const casuali = [...candidati];
    for (let i = casuali.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [casuali[i], casuali[j]] = [casuali[j], casuali[i]];
    }
    Promise.all(casuali.slice(0, 4).map(async atleta => ({
      atleta,
      storico: await caricaStoricoAtleta(atleta.tessera),
    }))).then(risultati => {
      if (attivo) setAvversariCasuali(risultati.filter(risultato => risultato.storico));
    });
    return () => { attivo = false; };
  }, [atletaDettagli?.tessera, atletaDettagli?.categoria, atletaDettagli?.sesso, atletaDettagli?.storico, atleti]);

  useEffect(() => {
    let attivo = true;
    setStoricoAtletaConfronto(null);
    if (!atletaConfrontoTessera) return () => { attivo = false; };
    caricaStoricoAtleta(atletaConfrontoTessera).then(storico => {
      if (attivo) setStoricoAtletaConfronto(storico);
    });
    return () => { attivo = false; };
  }, [atletaConfrontoTessera]);

  const acquista = async (id) => {
    const res = await fetch(`${API}/squadra/acquista/${id}?league_id=${lega.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Idempotency-Key": chiaveOperazione() } });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    if (res.ok) {
      setSquadra([...squadra, id]);
      const atleta = atleti.find(a => a.id === id);
      if (atleta) {
        setBudget(b => b - atleta.prezzo);
        setAtletiPerCategoria(prev => ({ ...prev, [atleta.categoria]: (prev[atleta.categoria] || 0) + 1 }));
      }
    }
  };

  if (!lega) return null;

  if (lega.modalita !== "listone") {
    return (
      <div className="card" style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12, color: theme.blue }}><Icon name="tool" size={38} /></div>
        <div className="card-title">Lega ad Asta</div>
        <p style={{ color: theme.textSub, fontSize: 14 }}>Questa lega non usa il mercato online. Gli atleti si assegnano manualmente dalla pagina "La mia Squadra" dopo l'asta.</p>
      </div>
    );
  }

  const ordineCategorie = ["Ragazzi Maschi", "Ragazze Femminile", "Allievi Maschi", "Allieve Femminile", "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"];
  const categorie = ordineCategorie
    .filter(c => atleti.some(a => a.categoria === c))
    .sort((a, b) => {
      const pienaA = (atletiPerCategoria[a] || 0) >= limitePerCategoria ? 1 : 0;
      const pienaB = (atletiPerCategoria[b] || 0) >= limitePerCategoria ? 1 : 0;
      return pienaA - pienaB;
    });

  const isDisponibile = (a) => {
    const categoriapiena = (atletiPerCategoria[a.categoria] || 0) >= limitePerCategoria;
    const troppoCostate = a.prezzo > budget;
    return squadra.includes(a.id) || (!categoriapiena && !troppoCostate);
  };

  const atletiFiltrati = atleti
    .filter(a => filtro ? a.categoria === filtro : true)
    .filter(a => ricerca ? a.name.toLowerCase().includes(ricerca.toLowerCase()) : true)
    .sort((a, b) => {
      const dispA = isDisponibile(a) ? 0 : 1;
      const dispB = isDisponibile(b) ? 0 : 1;
      if (dispA !== dispB) return dispA - dispB;
      if (ordinePrezzo === "alto") return b.prezzo - a.prezzo;
      if (ordinePrezzo === "basso") return a.prezzo - b.prezzo;
      return 0;
    });

  const storicoSportivo = atletaDettagli?.storico;
  const gareStoricheOrdinate = [...(storicoSportivo?.gare || [])]
    .sort((a, b) => b.anno - a.anno || String(a.manifestazione).localeCompare(String(b.manifestazione)) || a.posizione - b.posizione);
  const specialitaAffidabili = (storicoSportivo?.specialita || []).filter(specialita => specialita.partenze >= 3).slice(0, 3);
  const atletaCorrenteMercato = atleti.find(a => String(a.tessera) === String(atletaDettagli?.tessera));
  const categoriaConfronto = atletaCorrenteMercato?.categoria || atletaDettagli?.categoria;
  const sessoConfronto = atletaCorrenteMercato?.sesso || atletaDettagli?.sesso;
  const atletiConfrontabili = atleti.filter(a =>
    a.tessera && String(a.tessera) !== String(atletaDettagli?.tessera) && a.categoria === categoriaConfronto && a.sesso === sessoConfronto
  );
  const atletaConfrontoSelezionato = atletiConfrontabili.find(a => String(a.tessera) === String(atletaConfrontoTessera));
  const statisticheConfrontoSelezionato = confrontaRisultatiStorici(storicoSportivo, storicoAtletaConfronto);

  return (
    <div>
      {messaggio && <div className="msg-box">{messaggio}</div>}

      {piuAcquistati.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setPiuAcquistatiAperto(!piuAcquistatiAperto)}>
            <span style={{ fontWeight: 600, fontSize: 15 }}><Icon name="flame" className="inline-icon" /> Atleti più acquistati</span>
            <Icon name={piuAcquistatiAperto ? "chevronUp" : "chevronDown"} size={16} />
          </div>
          {piuAcquistatiAperto && (
            <table className="table">
              <thead><tr><th style={{ paddingLeft: 20 }}>#</th><th>Nome</th><th>Squadre</th></tr></thead>
              <tbody>
                {piuAcquistati.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ paddingLeft: 20, fontFamily: "'Bebas Neue', cursive" }}>{i + 1}</td>
                    <td><div style={{ fontWeight: 600 }}>{a.name}</div><div style={{ fontSize: 11, color: theme.textMuted }}>{a.categoria}</div></td>
                    <td style={{ color: theme.accent, fontWeight: 700 }}>{a.in_squadre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {lega.modalita === "listone" && plusvalenze.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setPlusvalenzeAperto(!plusvalenzeAperto)}>
            <span style={{ fontWeight: 600, fontSize: 15 }}><Icon name="trend" className="inline-icon" /> Migliori Plusvalenze</span>
            <Icon name={plusvalenzeAperto ? "chevronUp" : "chevronDown"} size={16} />
          </div>
          {plusvalenzeAperto && (
            <table className="table">
              <thead><tr><th style={{ paddingLeft: 20 }}>#</th><th>Nome</th><th>Valore</th></tr></thead>
              <tbody>
                {plusvalenze.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ paddingLeft: 20, fontFamily: "'Bebas Neue', cursive", color: theme.accent }}>{i + 1}</td>
                    <td><div style={{ fontWeight: 600 }}>{a.name}</div><div style={{ fontSize: 11, color: theme.textMuted }}>{a.categoria}</div></td>
                    <td>
                      <span style={{ color: theme.textMuted, fontSize: 12 }}>{a.prezzo_precedente}cr</span>
                      <span style={{ color: theme.textMuted, fontSize: 12 }}> → </span>
                      <span style={{ color: theme.green, fontWeight: 700 }}>{a.prezzo}cr</span>
                      <span style={{ color: theme.green, fontSize: 11, marginLeft: 4 }}>+{a.diff}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="card">
        <div className="market-summary" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 0 }}><Icon name="cart" className="inline-icon" /> Mercato Atleti</div>
          <div className="stat-box">
            <span className="stat-label">Budget rimasto</span>
            <span className="stat-value">{budget}</span>
            <span style={{ fontSize: 11, color: theme.textMuted }}>crediti</span>
          </div>
        </div>
        <div className="market-controls" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input className="input market-filter-search" style={{ marginBottom: 0 }} placeholder="Cerca atleta..." value={ricerca} onChange={e => setRicerca(e.target.value)} />
          <select className="select" value={filtro} onChange={e => setFiltro(e.target.value)}>
            <option value="">Tutte le categorie</option>
            {categorie.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="select" value={ordinePrezzo} onChange={e => setOrdinePrezzo(e.target.value)}>
            <option value="">Prezzo</option>
            <option value="alto">Più costosi</option>
            <option value="basso">Meno costosi</option>
          </select>
        </div>
      </div>

      {categorie.map(cat => {
        const atletiCategoria = atletiFiltrati.filter(a => a.categoria === cat);
        if (atletiCategoria.length === 0) return null;
        const categoriaDisponibile = (atletiPerCategoria[cat] || 0) < limitePerCategoria;
        return (
          <div key={cat} className="card" style={{ padding: 0, overflow: "hidden", opacity: categoriaDisponibile ? 1 : 0.4 }}>
            <div style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: categoriaAperta === cat ? "#1a2235" : theme.bgCard }} onClick={() => setCategoriaAperta(categoriaAperta === cat ? null : cat)}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{cat}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="badge badge-blue">{atletiCategoria.length} atleti</span>
                <Icon name={categoriaAperta === cat ? "chevronUp" : "chevronDown"} size={16} />
              </div>
            </div>
            {categoriaAperta === cat && (
              <>
                <div className="market-mobile-list">
                  {atletiCategoria.map(a => {
                    const inSquadra = squadra.includes(a.id);
                    const categoriaPiena = (atletiPerCategoria[a.categoria] || 0) >= limitePerCategoria;
                    const budgetInsufficiente = a.prezzo > budget;
                    const motivoNonDisponibile = categoriaPiena
                      ? `Limite di ${limitePerCategoria} atleti raggiunto in questa categoria`
                      : budgetInsufficiente ? "Budget insufficiente" : "";
                    const nonDisponibile = !isDisponibile(a);
                    return (
                      <article className="market-mobile-athlete" key={a.id} style={{ opacity: nonDisponibile ? 0.72 : 1 }}>
                        <div>
                          <div className="market-mobile-name">{a.name}</div>
                          <div className="market-mobile-category">
                            {a.categoria}{a.categoria_2027 ? ` · ${a.categoria_2027}` : ""}
                          </div>
                        </div>
                        <button
                          className="btn btn-blue market-mobile-stats"
                          onClick={() => apriDettagli(a.id)}
                          aria-label={`Apri statistiche di ${a.name}`}
                          title="Apri statistiche"
                        ><Icon name="chart" size={17} /></button>
                        <div className="market-mobile-facts">
                          <div className="market-mobile-fact">
                            <span className="market-mobile-fact-label">Valutazione</span>
                            <span className="market-mobile-fact-value" style={{ color: theme.blue }}>
                              {Number.isFinite(a.valutazione) ? `${a.valutazione.toFixed(1)}/100` : "—"}
                            </span>
                          </div>
                          <div className="market-mobile-fact">
                            <span className="market-mobile-fact-label">Prezzo</span>
                            <span className="market-mobile-fact-value" style={{ color: theme.accent }}>{a.prezzo} crediti</span>
                          </div>
                        </div>
                        <div className="market-mobile-buy-row">
                          {inSquadra ? (
                            <button className="btn btn-success market-mobile-buy" type="button" disabled>
                              <Icon name="check" className="inline-icon" /> Già in squadra
                            </button>
                          ) : (
                            <>
                              <button
                                className="btn btn-success market-mobile-buy"
                                type="button"
                                disabled={Boolean(motivoNonDisponibile)}
                                onClick={() => acquista(a.id)}
                              >Acquista</button>
                              {motivoNonDisponibile && <span className="market-mobile-unavailable">{motivoNonDisponibile}</span>}
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
                <div className="market-table-scroll">
                  <table className="table market-table">
                    <thead><tr><th style={{ paddingLeft: 20 }}>Nome</th><th className="market-valuation">Valutazione</th><th>Prezzo</th><th></th></tr></thead>
                    <tbody>
                      {atletiCategoria.map(a => {
                        const sbiadito = !isDisponibile(a);
                        return (
                          <tr key={a.id} style={{ opacity: sbiadito ? 0.4 : 1 }}>
                            <td style={{ paddingLeft: 20 }}>
                              <div style={{ fontWeight: 600 }}>{a.name}</div>
                              <div style={{ fontSize: 11, color: theme.textMuted }}>
                                {a.categoria}{a.categoria_2027 ? ` · ${a.categoria_2027}` : ""}
                              </div>
                            </td>
                            <td className="market-valuation" style={{ color: theme.blue, fontWeight: 600 }}>
                              {Number.isFinite(a.valutazione) ? `${a.valutazione.toFixed(1)}/100` : "—"}
                            </td>
                            <td style={{ color: theme.accent, fontWeight: 700 }}>{a.prezzo}cr</td>
                            <td style={{ paddingRight: 16 }}>
                              <div className="market-actions" style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                                <button className="btn btn-blue market-stat-btn" style={{ padding: "5px 8px", fontSize: 11 }} onClick={() => apriDettagli(a.id)} aria-label={`Apri statistiche di ${a.name}`} title="Apri statistiche"><Icon name="chart" size={16} /></button>
                                {squadra.includes(a.id)
                                  ? <span style={{ color: theme.green }}><Icon name="check" size={17} /></span>
                                  : <button className="btn btn-success market-buy-btn" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => acquista(a.id)}>Acquista</button>
                                }
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        );
      })}

      {atletaAperto !== null && (
        <div
          role="presentation"
          onClick={chiudiDettagli}
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(2, 6, 15, 0.76)" }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`Statistiche di ${atletaDettagli?.name || "atleta"}`}
            onClick={event => event.stopPropagation()}
            style={{
              position: "absolute", top: 0, right: 0, width: "min(560px, 100%)", height: "100%",
              overflowY: "auto", background: theme.bgCard, borderLeft: `1px solid ${theme.border}`,
              boxShadow: "-18px 0 60px rgba(0, 0, 0, 0.35)", padding: "calc(24px + env(safe-area-inset-top, 0px)) 22px calc(32px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
              <div>
                <div style={{ color: theme.blue, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 7 }}>Scheda atleta</div>
                <h2 style={{ fontSize: 25, lineHeight: 1.15, margin: 0 }}>{atletaDettagli?.name || "Statistiche personali"}</h2>
                {atletaDettagli && <div style={{ color: theme.textMuted, fontSize: 13, marginTop: 7 }}>{atletaDettagli.categoria}{atletaDettagli.categoria_2027 ? ` · ${atletaDettagli.categoria_2027}` : ""}{atletaDettagli.sesso ? ` · ${atletaDettagli.sesso === "M" ? "Maschio" : "Femmina"}` : ""}</div>}
              </div>
              <button className="btn btn-blue" onClick={chiudiDettagli} aria-label="Chiudi statistiche" title="Chiudi" style={{ padding: "6px 10px", fontSize: 18, flexShrink: 0 }}><Icon name="close" size={18} /></button>
            </div>

            {caricamentoDettagli && <div style={{ color: theme.textSub, padding: "30px 4px" }}>Carico le statistiche…</div>}
            {erroreDettagli && <div className="msg-box">{erroreDettagli}</div>}
            {atletaDettagli && (
              <>
                {storicoSportivo ? (
                  <>
                    <div style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 12, padding: 17, marginBottom: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 5 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}><Icon name="trend" className="inline-icon" /> Storico agonistico</div>
                        <div style={{ color: theme.textMuted, fontSize: 11 }}>{storicoSportivo.riepilogo.partenze} prove · {storicoSportivo.riepilogo.manifestazioni} manifestazioni</div>
                      </div>
                      <div style={{ color: theme.textMuted, fontSize: 11, marginBottom: 14 }}>Classifiche storiche {storicoSportivo.anni[0]}–{storicoSportivo.anni[1]}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))", gap: 9 }}>
                        {[
                          { label: "Vittorie", value: storicoSportivo.riepilogo.vittorie, color: theme.yellow },
                          { label: "Podi", value: storicoSportivo.riepilogo.podi, color: theme.accent },
                          { label: "Top 10", value: storicoSportivo.riepilogo.top10, color: theme.green },
                          { label: "Rendimento medio", value: `${storicoSportivo.riepilogo.rendimento_medio}`, suffix: "/100", color: theme.blue },
                        ].map(stat => (
                          <div key={stat.label} style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "11px 12px" }}>
                            <div style={{ color: theme.textMuted, fontSize: 10, marginBottom: 5 }}>{stat.label}</div>
                            <div style={{ color: stat.color, fontSize: 21, fontWeight: 700 }}>{stat.value}<span style={{ color: theme.textMuted, fontSize: 10, marginLeft: 4 }}>{stat.suffix || ""}</span></div>
                          </div>
                        ))}
                      </div>
                      <div style={{ color: theme.textMuted, fontSize: 10, lineHeight: 1.5, marginTop: 12 }}>Il rendimento medio confronta il piazzamento con il numero di partecipanti di ogni prova: 100 significa primo, 0 ultimo. Non è il punteggio fantasy.</div>
                    </div>

                    <div style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 12, padding: 17, marginBottom: 18 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 13 }}><Icon name="bolt" className="inline-icon" /> Specialità migliori</div>
                      {!specialitaAffidabili.length
                        ? <div style={{ color: theme.textMuted, fontSize: 13 }}>Servono almeno tre risultati nella stessa specialità per confrontare il rendimento.</div>
                        : <div style={{ display: "grid", gap: 13 }}>
                          {specialitaAffidabili.map(specialita => (
                            <div key={specialita.nome}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 5 }}>
                                <span style={{ color: theme.textSub, fontSize: 12 }}>{specialita.nome} <span style={{ color: theme.textMuted }}>· {specialita.partenze} prove</span></span>
                                <span style={{ color: theme.blue, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{specialita.rendimento_medio}/100</span>
                              </div>
                              <div style={{ height: 5, background: theme.border, borderRadius: 6, overflow: "hidden" }}><div style={{ width: `${specialita.rendimento_medio}%`, height: "100%", background: `linear-gradient(90deg, ${theme.blue}, ${theme.green})` }} /></div>
                            </div>
                          ))}
                        </div>
                      }
                    </div>

                    <div style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 12, padding: 17, marginBottom: 18 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 13 }}><Icon name="calendar" className="inline-icon" /> Andamento per anno</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(66px, 1fr))", gap: 8 }}>
                        {storicoSportivo.andamento_annuale.map(anno => (
                          <div key={anno.anno} style={{ textAlign: "center", background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "10px 6px" }}>
                            <div style={{ color: theme.textSub, fontSize: 12, fontWeight: 700 }}>{anno.anno}</div>
                            <div style={{ color: theme.blue, fontSize: 17, fontWeight: 700, marginTop: 5 }}>{anno.rendimento_medio}</div>
                            <div style={{ color: theme.textMuted, fontSize: 9 }}>su 100</div>
                            <div style={{ color: theme.textMuted, fontSize: 10, marginTop: 5 }}>{anno.partenze} prove · {anno.podi} podi</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 12, padding: 17, marginBottom: 18 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 13 }}><Icon name="medal" className="inline-icon" /> Migliori piazzamenti</div>
                      <div style={{ display: "grid", gap: 0 }}>
                        {storicoSportivo.migliori_gare.map((gara, index) => (
                          <div key={`${gara.anno}-${gara.manifestazione}-${gara.disciplina}`} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: index < storicoSportivo.migliori_gare.length - 1 ? `1px solid ${theme.border}` : "none" }}>
                            <span style={{ color: theme.yellow, fontSize: 13, fontWeight: 700, minWidth: 25 }}>#{gara.posizione}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ color: theme.textSub, fontSize: 12 }}>{gara.disciplina}</div>
                              <div style={{ color: theme.textMuted, fontSize: 10, lineHeight: 1.4, marginTop: 3 }}>{gara.manifestazione} · {gara.anno}</div>
                            </div>
                            <span style={{ color: theme.textMuted, fontSize: 10, whiteSpace: "nowrap" }}>{gara.posizione}/{gara.partecipanti}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 12, padding: 17, marginBottom: 18 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}><Icon name="handshake" className="inline-icon" /> Confronti nella categoria</div>
                      <div style={{ color: theme.textMuted, fontSize: 10, marginBottom: 10 }}>Confronto dei piazzamenti negli stessi eventi storici; i piazzamenti uguali non contano come vittoria o sconfitta.</div>
                      {!avversariCasuali.length
                        ? <div style={{ color: theme.textMuted, fontSize: 13, marginBottom: 12 }}>Nessun altro atleta della categoria con uno storico disponibile.</div>
                        : avversariCasuali.map(({ atleta, storico }) => {
                          const confronto = confrontaRisultatiStorici(storicoSportivo, storico);
                          return (
                            <div key={atleta.tessera} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${theme.border}` }}>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ color: theme.textSub, fontSize: 12 }}>{atleta.name}</div>
                                <div style={{ color: theme.textMuted, fontSize: 10, marginTop: 3 }}>{confronto?.gareCondivise || 0} gare in comune</div>
                              </div>
                              <div style={{ color: theme.textSub, fontSize: 11, whiteSpace: "nowrap" }}>
                                {confronto?.confrontiDecisi
                                  ? <><span style={{ color: theme.green }}>{confronto.vittorieA} V</span> · <span style={{ color: theme.red }}>{confronto.vittorieB} S</span></>
                                  : <span style={{ color: theme.textMuted }}>Nessun confronto deciso</span>}
                              </div>
                            </div>
                          );
                        })
                      }
                      <div style={{ marginTop: 14 }}>
                        <label htmlFor="atleta-confronto" style={{ display: "block", color: theme.textSub, fontSize: 11, marginBottom: 6 }}>Scegli un atleta della categoria</label>
                        <select id="atleta-confronto" className="select" style={{ width: "100%" }} value={atletaConfrontoTessera} onChange={event => setAtletaConfrontoTessera(event.target.value)} disabled={!atletiConfrontabili.length}>
                          <option value="">Seleziona atleta...</option>
                          {[...atletiConfrontabili].sort((a, b) => a.name.localeCompare(b.name)).map(atleta => (
                            <option key={atleta.tessera} value={atleta.tessera}>{atleta.name}</option>
                          ))}
                        </select>
                        {atletaConfrontoTessera && (
                          <div style={{ marginTop: 9, color: theme.textSub, fontSize: 11 }}>
                            {!storicoAtletaConfronto
                              ? "Caricamento dello storico..."
                              : <>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                  <span>{atletaConfrontoSelezionato?.name || "Atleta selezionato"} · {statisticheConfrontoSelezionato?.gareCondivise || 0} gare in comune</span>
                                  {statisticheConfrontoSelezionato?.confrontiDecisi
                                    ? <span style={{ whiteSpace: "nowrap" }}><span style={{ color: theme.green }}>{statisticheConfrontoSelezionato.vittorieA} V</span> · <span style={{ color: theme.red }}>{statisticheConfrontoSelezionato.vittorieB} S</span></span>
                                    : null}
                                </div>
                                {!statisticheConfrontoSelezionato?.confrontiDecisi && <div style={{ color: theme.textMuted, marginTop: 4 }}>Nessuna gara comune con piazzamenti diversi.</div>}
                              </>}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 12, padding: 17, marginBottom: 18 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}><Icon name="list" className="inline-icon" /> Storico completo delle gare</div>
                      <div style={{ color: theme.textMuted, fontSize: 10, marginBottom: 10 }}>Classifica reale e partecipanti per ogni prova</div>
                      <div style={{ display: "grid", gap: 0 }}>
                        {gareStoricheOrdinate.map((gara, index) => (
                          <div key={`${gara.anno}-${gara.manifestazione}-${gara.disciplina}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: index < gareStoricheOrdinate.length - 1 ? `1px solid ${theme.border}` : "none" }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ color: theme.textSub, fontSize: 12 }}>{gara.disciplina}</div>
                              <div style={{ color: theme.textMuted, fontSize: 10, lineHeight: 1.4, marginTop: 3 }}>{gara.manifestazione} · {gara.anno} · {gara.categoria}</div>
                            </div>
                            <span style={{ color: gara.posizione <= 3 ? theme.yellow : theme.blue, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{gara.posizione}°/{gara.partecipanti}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : <div style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 12, padding: 17, marginBottom: 18, color: theme.textMuted, fontSize: 13 }}>Storico agonistico non disponibile per questa tessera.</div>}

                <div style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 12, padding: 17, marginBottom: 18 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}><Icon name="chart" className="inline-icon" /> Profilo listone 2027</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))", gap: 9 }}>
                    <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "11px 12px" }}><div style={{ color: theme.textMuted, fontSize: 10 }}>Valutazione listone</div><div style={{ color: theme.blue, fontSize: 20, fontWeight: 700, marginTop: 5 }}>{Number.isFinite(atletaDettagli.valutazione) ? `${atletaDettagli.valutazione.toFixed(1)}/100` : "—"}</div></div>
                    <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "11px 12px" }}><div style={{ color: theme.textMuted, fontSize: 10 }}>Prezzo</div><div style={{ color: theme.accent, fontSize: 20, fontWeight: 700, marginTop: 5 }}>{atletaDettagli.prezzo ?? "—"} crediti</div></div>
                  </div>
                  {atletaDettagli.tessera && <div style={{ color: theme.textMuted, fontSize: 10, marginTop: 10 }}>Tessera {atletaDettagli.tessera}</div>}
                </div>

                <div style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 12, padding: 17 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}><Icon name="target" className="inline-icon" /> Punti FantaRoller per evento</div>
                  <div style={{ color: theme.textMuted, fontSize: 10, marginBottom: 10 }}>Punteggio del gioco, distinto dalle classifiche agonistiche</div>
                  {!atletaDettagli.eventi?.length
                    ? <div style={{ color: theme.textMuted, fontSize: 13 }}>Non ci sono ancora punti fantasy registrati.</div>
                    : atletaDettagli.eventi.map((evento, index) => (
                      <div key={`${evento.evento}-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "9px 0", borderBottom: index < atletaDettagli.eventi.length - 1 ? `1px solid ${theme.border}` : "none" }}>
                        <span style={{ color: theme.textSub, fontSize: 12 }}>{evento.evento}</span>
                        <span style={{ color: theme.blue, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{evento.punti} pt</span>
                      </div>
                    ))
                  }
                  <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 10 }}>In {atletaDettagli.in_squadre ?? 0} squadre FantaRoller</div>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function Classifica({ username, token, lega }) {
  const [classifica, setClassifica] = useState([]);
  const [eventi, setEventi] = useState([]);
  const [competizioni, setCompetizioni] = useState([]);
  const [vistaSelezionata, setVistaSelezionata] = useState("");
  const [loading, setLoading] = useState(true);
  const [squadraAperta, setSquadraAperta] = useState(null);
  const [ricerca, setRicerca] = useState("");

  const caricaEventi = useCallback(async () => {
    const res = await fetch(`${API}/classifica/eventi`);
    if (res.ok) setEventi(await res.json());
  }, []);

  const caricaClassifica = useCallback(async (vista) => {
    if (!lega) return;
    setLoading(true);
    let url = `${API}/league/classifica?league_id=${lega.id}`;
    if (vista === "g") url += "&generale=true";
    else if (vista?.startsWith("c:")) url += `&competizione_id=${encodeURIComponent(vista.slice(2))}`;
    else if (vista?.startsWith("e:")) url += `&evento=${encodeURIComponent(vista.slice(2))}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setClassifica(await res.json());
    setLoading(false);
  }, [lega, token]);

  const caricaCompetizioni = useCallback(async () => {
    if (!lega) return;
    const res = await fetch(`${API}/league/competizioni?league_id=${lega.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setCompetizioni(data);
      const defaultView = lega.modalita_economica === "continuita" ? "g" : data.length ? `c:${data[0].id}` : "";
      setVistaSelezionata(defaultView);
      caricaClassifica(defaultView);
    }
  }, [lega, token, caricaClassifica]);

  useEffect(() => { caricaEventi(); caricaCompetizioni(); }, [caricaEventi, caricaCompetizioni]);

  const rankColor = (i) => i === 0 ? theme.yellow : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : theme.textSub;

  if (!lega) return null;

  return (
    <div>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <div className="card-title" style={{ marginBottom: 0 }}><Icon name="trophy" className="inline-icon" /> Classifica {lega.nome}</div>
          <select className="select" value={vistaSelezionata} onChange={e => { setVistaSelezionata(e.target.value); caricaClassifica(e.target.value); }}>
            {lega.modalita_economica === "continuita"
              ? <option value="g">Classifica generale</option>
              : <option value="">Evento corrente</option>}
            {competizioni.length ? competizioni.map(c => <option key={c.id} value={`c:${c.id}`}>Evento {c.numero}: {c.evento} · {c.fase.replaceAll("_", " ")}</option>) : eventi.map(e => <option key={e} value={`e:${e}`}>{e}</option>)}
          </select>
        </div>
        <input className="input" style={{ marginBottom: 0 }} placeholder="Cerca squadra o utente..." value={ricerca} onChange={e => setRicerca(e.target.value)} />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading
          ? <p style={{ textAlign: "center", color: theme.textMuted, padding: 24 }}><Icon name="clock" className="inline-icon" /> Caricamento...</p>
          : classifica.length === 0
            ? <p style={{ textAlign: "center", color: theme.textMuted, padding: 24 }}>Nessuna squadra completa in classifica</p>
            : classifica
              .filter(u => ricerca ? u.squadra.toLowerCase().includes(ricerca.toLowerCase()) || u.username.toLowerCase().includes(ricerca.toLowerCase()) : true)
              .map((u, i) => (
                <div key={u.username}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: squadraAperta === u.username ? "none" : `1px solid ${theme.border}22`, background: u.username === username ? "#f9731610" : "", borderLeft: u.username === username ? `3px solid ${theme.accent}` : "3px solid transparent", cursor: "pointer" }}
                    onClick={() => setSquadraAperta(squadraAperta === u.username ? null : u.username)}
                  >
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: rankColor(i), minWidth: 28 }}>{i < 3 ? <Icon name="medal" size={21} /> : i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {u.squadra}
                        {u.username === username && <span className="badge badge-orange" style={{ marginLeft: 8 }}>Tu</span>}
                      </div>
                      <div style={{ fontSize: 11, color: theme.textMuted }}>@{u.username} <Icon name={squadraAperta === u.username ? "chevronUp" : "chevronDown"} size={13} /></div>
                    </div>
                    <span style={{ color: theme.accent, fontWeight: 700, fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem" }}>{u.punti}</span>
                  </div>
                  {squadraAperta === u.username && (
                    <div style={{ padding: "12px 16px", background: "#0d1526", borderBottom: `1px solid ${theme.border}22` }}>
                      <AtletiSquadra token={token} username={u.username} evento={vistaSelezionata.startsWith("e:") ? vistaSelezionata.slice(2) : ""} competizioneId={vistaSelezionata.startsWith("c:") ? vistaSelezionata.slice(2) : ""} generale={vistaSelezionata === "g"} lega={lega} />
                    </div>
                  )}
                </div>
              ))
        }
      </div>
    </div>
  );
}

function AtletiSquadra({ token, username, evento, competizioneId, generale = false, lega }) {
  const [atleti, setAtleti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState(false);

  useEffect(() => {
    let attivo = true;
    setLoading(true);
    setErrore(false);
    const url = generale
      ? `${API}/league/storico-squadra?username=${encodeURIComponent(username)}&league_id=${lega.id}`
      : competizioneId
      ? `${API}/league/atleti-squadra?username=${encodeURIComponent(username)}&league_id=${lega.id}&competizione_id=${encodeURIComponent(competizioneId)}`
      : evento
      ? `${API}/league/atleti-squadra?username=${encodeURIComponent(username)}&league_id=${lega.id}&evento=${encodeURIComponent(evento)}`
      : `${API}/league/atleti-squadra?username=${encodeURIComponent(username)}&league_id=${lega.id}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error("Errore caricamento rosa"); return r.json(); })
      .then(data => { if (attivo) { setAtleti(data); setLoading(false); } })
      .catch(() => { if (attivo) { setErrore(true); setLoading(false); } });
    return () => { attivo = false; };
  }, [token, username, evento, competizioneId, generale, lega.id]);

  if (loading) return <p style={{ color: theme.textMuted, fontSize: 12 }}><Icon name="clock" className="inline-icon" /> Caricamento...</p>;
  if (errore) return <p style={{ color: theme.textMuted, fontSize: 13 }}><Icon name="warning" className="inline-icon" /> Sessione scaduta — esci e rifai il login.</p>;

  if (generale) return atleti.length === 0
    ? <p style={{ color: theme.textMuted, fontSize: 12 }}>Nessun risultato storico finalizzato.</p>
    : <div style={{ display: "grid", gap: 12 }}>
      {atleti.map(event => <section key={event.competizione_id} style={{ borderBottom: `1px solid ${theme.border}44`, paddingBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 6 }}><span>Evento {event.numero}: {event.evento}</span><span style={{ color: theme.accent }}>{event.punti} pt</span></div>
        {event.atleti.map(athlete => <div key={athlete.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, color: theme.textMuted, fontSize: 11, padding: "3px 0" }}><span>{athlete.name}</span><span>{athlete.punti} pt</span></div>)}
      </section>)}
    </div>;

  return (
    <table className="table" style={{ marginBottom: 0 }}>
      <thead><tr><th>Nome</th><th>Categoria</th><th>Punti</th></tr></thead>
      <tbody>
        {atleti.map(a => (
          <tr key={a.id}>
            <td style={{ fontWeight: 600 }}>{a.name}</td>
            <td><span className="badge badge-blue">{a.categoria}</span></td>
            <td style={{ color: theme.green, fontWeight: 700 }}>{a.punti}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SquadreLega({ token, lega }) {
  const [squadre, setSquadre] = useState([]);
  const [errore, setErrore] = useState("");
  const [aperta, setAperta] = useState(null);

  useState(() => {
    if (!lega) return;
    fetch(`${API}/league/squadre?league_id=${lega.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error("mercato aperto"); return r.json(); })
      .then(setSquadre)
      .catch(() => setErrore("Le squadre saranno visibili quando il mercato chiuderà"));
  }, [lega]);

  if (!lega) return null;
  if (errore) return <div className="card"><div className="card-title"><Icon name="users" className="inline-icon" /> Squadre della Lega</div><p style={{ color: theme.textMuted }}>{errore}</p></div>;
  if (squadre.length === 0) return <div className="card"><p style={{ color: theme.textMuted }}>Nessuna squadra completa ancora.</p></div>;

  return (
    <div>
      <div className="card"><div className="card-title"><Icon name="users" className="inline-icon" /> Squadre della Lega</div><p style={{ color: theme.textSub, fontSize: 13 }}>Il mercato è chiuso — puoi vedere le squadre di tutti!</p></div>
      {squadre.map(s => (
        <div key={s.username} className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setAperta(aperta === s.username ? null : s.username)}>
            <div><span style={{ fontWeight: 600, fontSize: 15 }}>{s.squadra}</span><span style={{ color: theme.textMuted, fontSize: 12, marginLeft: 10 }}>di {s.username}</span></div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="badge badge-blue">{s.atleti.length} atleti</span>
              <Icon name={aperta === s.username ? "chevronUp" : "chevronDown"} size={16} />
            </div>
          </div>
          {aperta === s.username && (
            <table className="table">
              <thead><tr><th style={{ paddingLeft: 20 }}>Nome</th><th>Categoria</th><th>Prezzo</th></tr></thead>
              <tbody>
                {s.atleti.map(a => (
                  <tr key={a.name + a.categoria}>
                    <td style={{ paddingLeft: 20, fontWeight: 600 }}>{a.name}</td>
                    <td><span className="badge badge-blue">{a.categoria}</span></td>
                    <td style={{ color: theme.accent, fontWeight: 700 }}>{a.prezzo}cr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

function Partecipanti({ token, lega }) {
  const [dettagli, setDettagli] = useState(null);
  const [copiato, setCopiato] = useState(false);

  useState(() => {
    if (!lega) return;
    fetch(`${API}/league/dettagli?league_id=${lega.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setDettagli);
  }, [lega]);

  if (!lega || !dettagli) return <div className="card" style={{ color: theme.textMuted }}>Caricamento...</div>;

  const copiaCodice = () => {
    navigator.clipboard.writeText(dettagli.codice);
    setCopiato(true);
    setTimeout(() => setCopiato(false), 2000);
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="card-title" style={{ marginBottom: 4 }}><Icon name="users" className="inline-icon" /> {dettagli.nome}</div>
            <span style={{ color: theme.textMuted, fontSize: 13 }}>Creata da <strong style={{ color: theme.textSub }}>{dettagli.owner}</strong> · {dettagli.partecipanti.length} partecipanti</span>
          </div>
          {dettagli.codice && (
            <button className="btn btn-blue" onClick={copiaCodice}>{copiato ? <><Icon name="check" className="inline-icon" /> Copiato!</> : <><Icon name="key" className="inline-icon" /> Copia Codice</>}</button>
          )}
        </div>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Utente</th><th>Squadra</th><th>Atleti</th></tr></thead>
          <tbody>
            {dettagli.partecipanti.map(p => (
              <tr key={p.username}>
                <td style={{ fontWeight: 600 }}>{p.username}{p.is_owner && <span className="badge badge-orange" style={{ marginLeft: 8 }}>Admin</span>}</td>
                <td style={{ color: theme.textSub }}>{p.squadra || "—"}</td>
                <td><span className="badge badge-blue">{p.n_atleti}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Chat({ token, lega }) {
  const [messaggi, setMessaggi] = useState([]);
  const [nuovoMessaggio, setNuovoMessaggio] = useState("");

  const caricaMessaggi = async () => {
    if (!lega) return;
    const res = await fetch(`${API}/league/messaggi?league_id=${lega.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setMessaggi(await res.json());
  };

  useState(() => { caricaMessaggi(); }, [lega]);

  const inviaMessaggio = async () => {
    if (!nuovoMessaggio.trim()) return;
    const res = await fetch(`${API}/league/messaggio?testo=${encodeURIComponent(nuovoMessaggio)}&league_id=${lega.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { setNuovoMessaggio(""); caricaMessaggi(); }
  };

  if (!lega) return null;

  return (
    <div className="card">
      <div className="card-title"><Icon name="chat" className="inline-icon" /> Chat {lega.nome}</div>
      <div style={{ maxHeight: 400, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {messaggi.length === 0
          ? <p style={{ color: theme.textMuted, fontSize: 13 }}>Nessun messaggio ancora</p>
          : messaggi.map(m => (
            <div key={m.id} style={{ background: "#0d1526", borderRadius: 8, padding: "8px 12px" }}>
              <span style={{ color: theme.accent, fontWeight: 700, fontSize: 12 }}>{m.username}</span>
              <span style={{ color: theme.textSub, fontSize: 13, marginLeft: 8 }}>{m.testo}</span>
            </div>
          ))
        }
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="input" style={{ marginBottom: 0, flex: 1 }} placeholder="Scrivi un messaggio..." value={nuovoMessaggio} onChange={e => setNuovoMessaggio(e.target.value)} onKeyDown={e => e.key === "Enter" && inviaMessaggio()} />
        <button className="btn btn-primary" onClick={inviaMessaggio}>Invia</button>
      </div>
    </div>
  );
}

function Leghe({ token, onCambioLeghe, mieLeghe, sceltaLega }) {
  const [vista, setVista] = useState("home");
  const [nomeLega, setNomeLega] = useState("");
  const [tipo, setTipo] = useState("privata");
  const [modalita, setModalita] = useState("listone");
  const [modalitaEconomica, setModalitaEconomica] = useState("continuita");
  const [codice, setCodice] = useState("");
  const [creditiIniziali, setCreditiIniziali] = useState(500);
  const [atletiPerCategoria, setAtletiPerCategoria] = useState(2);
  const [messaggio, setMessaggio] = useState("");
  const [tutteLeghe, setTutteLeghe] = useState([]);
  const [ricerca, setRicerca] = useState("");
  const [codiceInserito, setCodiceInserito] = useState("");

  const caricaTutteLeghe = async () => {
    const res = await fetch(`${API}/league/tutte`);
    if (res.ok) setTutteLeghe(await res.json());
  };

  useState(() => { caricaTutteLeghe(); }, []);

  const creaLega = async () => {
    if (nomeLega.length < 3) { setMessaggio("Nome lega troppo corto"); return; }
    if (tipo === "privata" && codice.length < 3) { setMessaggio("Imposta un codice di almeno 3 caratteri"); return; }
    const res = await fetch(`${API}/league/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nome: nomeLega, tipo, modalita, modalita_economica: modalitaEconomica,
        codice: tipo === "privata" ? codice : null,
        crediti_iniziali: parseInt(creditiIniziali),
        atleti_per_categoria: parseInt(atletiPerCategoria),
      }),
    });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    if (res.ok) {
      setNomeLega(""); setCodice("");
      onCambioLeghe();
      caricaTutteLeghe();
      setVista("home");
    }
  };

  const entraLegaAperta = async (leagueId) => {
    const res = await fetch(`${API}/league/join?league_id=${leagueId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    if (res.ok) { onCambioLeghe(); caricaTutteLeghe(); }
  };

  const entraLegaCodice = async (codiceLega) => {
    const res = await fetch(`${API}/league/join?codice=${encodeURIComponent(String(codiceLega))}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    if (res.ok) { setCodiceInserito(""); onCambioLeghe(); caricaTutteLeghe(); }
  };

  const sonoMembro = (id) => mieLeghe.some(l => l.id === id);
  const legheFiltrate = tutteLeghe.filter(l => l.nome.toLowerCase().includes(ricerca.toLowerCase()));

  return (
    <div>
      {messaggio && <div className="msg-box">{messaggio}</div>}

      {vista === "home" && (
        <>
          <div className="card">
            <div className="card-title"><Icon name="medal" className="inline-icon" /> Le tue Leghe</div>
            {mieLeghe.length === 0
              ? <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 16 }}>Non fai ancora parte di nessuna lega.</p>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  {mieLeghe.map(l => (
                    <div key={l.id} style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 15 }}><Icon name="medal" className="inline-icon" /> {l.nome}</span>
                        <span className="badge badge-blue" style={{ marginLeft: 8 }}>{l.modalita}</span>
                        {l.is_owner && <span className="badge badge-orange" style={{ marginLeft: 6 }}>Admin</span>}
                      </div>
                      <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => sceltaLega(l)}>Apri <Icon name="arrowRight" className="inline-icon" /></button>
                    </div>
                  ))}
                </div>
              )
            }
            <div className="option-group">
              <button className="btn btn-primary" onClick={() => setVista("crea")}><Icon name="plus" className="inline-icon" /> Crea Lega</button>
              <button className="btn btn-blue" onClick={() => setVista("unisciti")}><Icon name="key" className="inline-icon" /> Unisciti a una Lega</button>
            </div>
          </div>
        </>
      )}

      {vista === "crea" && (
        <div className="card">
          <div className="card-title"><Icon name="plus" className="inline-icon" /> Crea una nuova Lega</div>
          <button className="btn btn-danger" style={{ marginBottom: 16 }} onClick={() => setVista("home")}><Icon name="arrowLeft" className="inline-icon" /> Indietro</button>

          <input className="input" placeholder="Nome lega" value={nomeLega} onChange={e => setNomeLega(e.target.value)} />

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 6, textTransform: "uppercase" }}>Tipo</div>
            <div className="option-group">
              <div className={`option-card ${tipo === "privata" ? "selected" : ""}`} onClick={() => setTipo("privata")}>
                <div className="option-card-title"><Icon name="lock" className="inline-icon" /> Privata</div>
                <div className="option-card-sub">Serve un codice per entrare</div>
              </div>
              <div className={`option-card ${tipo === "aperta" ? "selected" : ""}`} onClick={() => setTipo("aperta")}>
                <div className="option-card-title"><Icon name="globe" className="inline-icon" /> Aperta</div>
                <div className="option-card-sub">Chiunque può unirsi</div>
              </div>
            </div>
          </div>

          {tipo === "privata" && (
            <input className="input" placeholder="Codice di accesso" value={codice} onChange={e => setCodice(e.target.value)} />
          )}

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 6, textTransform: "uppercase" }}>Modalità</div>
            <div className="option-group">
              <div className={`option-card ${modalita === "listone" ? "selected" : ""}`} onClick={() => setModalita("listone")}>
                <div className="option-card-title"><Icon name="list" className="inline-icon" /> Listone</div>
                <div className="option-card-sub">Mercato online a prezzi fissi</div>
              </div>
              <div className={`option-card ${modalita === "asta" ? "selected" : ""}`} onClick={() => setModalita("asta")}>
                <div className="option-card-title"><Icon name="hammer" className="inline-icon" /> Asta</div>
                <div className="option-card-sub">Asta fisica, atleti inseriti a mano</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 6, textTransform: "uppercase" }}>Gestione tra gli eventi</div>
            <div className="option-group">
              <div className={`option-card ${modalitaEconomica === "reset" ? "selected" : ""}`} onClick={() => setModalitaEconomica("reset")}>
                <div className="option-card-title">Reset tra eventi</div>
                <div className="option-card-sub">Nuova rosa e budget iniziale a ogni competizione</div>
              </div>
              <div className={`option-card ${modalitaEconomica === "continuita" ? "selected" : ""}`} onClick={() => setModalitaEconomica("continuita")}>
                <div className="option-card-title">Continuità</div>
                <div className="option-card-sub">Mantieni rosa e saldo; plusvalenze solo nel listone</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 6, textTransform: "uppercase" }}>Crediti iniziali per squadra</div>
          <input className="input" type="number" value={creditiIniziali} onChange={e => setCreditiIniziali(e.target.value)} />

          <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 6, textTransform: "uppercase" }}>Atleti per categoria</div>
          <input className="input" type="number" min="1" value={atletiPerCategoria} onChange={e => setAtletiPerCategoria(e.target.value)} />

          <button className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={creaLega}>Crea Lega</button>
        </div>
      )}

      {vista === "unisciti" && (
        <div className="card">
          <div className="card-title"><Icon name="key" className="inline-icon" /> Unisciti a una Lega</div>
          <button className="btn btn-danger" style={{ marginBottom: 16 }} onClick={() => setVista("home")}><Icon name="arrowLeft" className="inline-icon" /> Indietro</button>

          <input className="input" placeholder="Cerca lega aperta..." value={ricerca} onChange={e => setRicerca(e.target.value)} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {legheFiltrate.length === 0
              ? <p style={{ color: theme.textMuted, fontSize: 13 }}>Nessuna lega aperta trovata</p>
              : legheFiltrate.map(l => (
                <div key={l.id} style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}><Icon name="globe" className="inline-icon" /> {l.nome}</span>
                    <span className="badge badge-blue" style={{ marginLeft: 8 }}>{l.modalita}</span>
                    <span style={{ color: theme.textMuted, fontSize: 12, marginLeft: 10 }}>{l.membri} membri</span>
                  </div>
                  {sonoMembro(l.id)
                    ? <span className="badge badge-green">Già dentro</span>
                    : <button className="btn btn-success" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => entraLegaAperta(l.id)}>Entra</button>
                  }
                </div>
              ))
            }
          </div>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${theme.border}` }}>
            <div className="card-title" style={{ fontSize: "1.1rem" }}><Icon name="lock" className="inline-icon" /> Ho un codice per una lega privata</div>
            <input className="input" placeholder="Inserisci il codice della lega" value={codiceInserito} onChange={e => setCodiceInserito(e.target.value)} />
            <button className="btn btn-primary" onClick={() => entraLegaCodice(codiceInserito)}>Entra nella lega</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLega({ token, lega }) {
  const [dettagli, setDettagli] = useState(null);
  const [messaggio, setMessaggio] = useState("");
  const [codiceCopiato, setCodiceCopiato] = useState(false);
  const [catalogo, setCatalogo] = useState([]);
  const [eventoScelto, setEventoScelto] = useState("");
  const [competizione, setCompetizione] = useState(null);

  const carica = useCallback(async () => {
    if (!lega) return;
    const res = await fetch(`${API}/league/dettagli?league_id=${lega.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setDettagli(await res.json());
    const [eventiRes, compRes] = await Promise.all([
      fetch(`${API}/eventi/catalogo`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API}/league/competizione?league_id=${lega.id}`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (eventiRes.ok) setCatalogo(await eventiRes.json());
    if (compRes.ok) setCompetizione(await compRes.json());
  }, [lega, token]);

  useEffect(() => { carica(); }, [carica]);

  const selezionaEvento = async () => {
    if (!eventoScelto) return;
    const res = await fetch(`${API}/league/competizione/seleziona`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ league_id: lega.id, evento_id: Number(eventoScelto) }),
    });
    const data = await res.json();
    setMessaggio(data.message || data.detail || "Evento selezionato");
    if (res.ok) { setEventoScelto(""); carica(); }
  };

  const avanzaFase = async () => {
    const res = await fetch(`${API}/league/competizione/avanza?league_id=${lega.id}`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessaggio(data.message || data.detail || `Fase aggiornata: ${data.fase}`);
    if (res.ok) carica();
  };

  const apriMercato = async () => {
    const res = await fetch(`${API}/league/apri-mercato?league_id=${lega.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    carica();
  };

  const chiudiMercato = async () => {
    const res = await fetch(`${API}/league/chiudi-mercato?league_id=${lega.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    carica();
  };

  const copiaCodice = async () => {
    try {
      await navigator.clipboard.writeText(dettagli.codice);
      setCodiceCopiato(true);
      setTimeout(() => setCodiceCopiato(false), 2000);
    } catch {
      setMessaggio("Impossibile copiare il codice. Puoi selezionarlo e copiarlo manualmente.");
    }
  };

  if (!lega || !dettagli) return <div className="card" style={{ color: theme.textMuted }}>Caricamento...</div>;

  return (
    <div className="card">
      <div className="card-title"><Icon name="settings" className="inline-icon" /> Gestisci {lega.nome}</div>
      {messaggio && <div className="msg-box">{messaggio}</div>}
      <div style={{ padding: 14, borderRadius: 10, background: "#0d1526", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Competizione ed evento</div>
        <div style={{ color: theme.textSub, fontSize: 13, marginBottom: 10 }}>
          Gestione economica: <strong style={{ color: theme.accent }}>{dettagli.modalita_economica === "reset" ? "Reset tra eventi" : "Continuità"}</strong>
          {dettagli.modalita === "asta" && " · Le plusvalenze non si applicano alle leghe asta"}
        </div>
        {competizione && competizione.fase !== "finalizzato" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span>{competizione.evento}</span><span className="badge badge-blue">{competizione.fase.replaceAll("_", " ")}</span>
            {competizione.data_evento && <span style={{ color: theme.textMuted, fontSize: 12 }}>{competizione.data_evento}</span>}
            {competizione.url_risultati && <a href={competizione.url_risultati} target="_blank" rel="noreferrer" style={{ color: theme.blue, fontSize: 12 }}>Pagina risultati</a>}
            {dettagli.gestore && ["mercato_chiuso", "in_corso"].includes(competizione.fase) && (
              <button className="btn btn-blue" onClick={avanzaFase}>
                {({ mercato_chiuso: "Avvia evento", in_corso: "Segna risultati inseriti" })[competizione.fase]}
              </button>
            )}
            {competizione.fase === "transizione_in_attesa" && <span style={{ color: theme.yellow, fontSize: 12 }}>In attesa dell'autorizzazione dell'admin generale. Rosa e budget non sono stati modificati.</span>}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select className="select" value={eventoScelto} onChange={e => setEventoScelto(e.target.value)} disabled={!dettagli.gestore}>
              <option value="">Scegli un evento</option>
              {catalogo.map(evento => <option key={evento.id} value={evento.id}>{evento.nome}{evento.data_evento ? ` · ${evento.data_evento}` : ""}</option>)}
            </select>
            {dettagli.gestore && <button className="btn btn-primary" disabled={!eventoScelto} onClick={selezionaEvento}>Seleziona evento</button>}
            {catalogo.length === 0 && <span style={{ color: theme.textMuted, fontSize: 12 }}>Nessun evento disponibile nel catalogo.</span>}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: theme.textSub }}>Mercato:</span>
        <span className={`badge ${dettagli.mercato_aperto ? "badge-green" : "badge-red"}`}><span style={{ display: "inline-block", width: 8, height: 8, marginRight: 5, borderRadius: "50%", background: dettagli.mercato_aperto ? theme.green : theme.red }} />{dettagli.mercato_aperto ? "Aperto" : "Chiuso"}</span>
        {dettagli.gestore && <button className="btn btn-success" onClick={apriMercato} disabled={!!competizione && competizione.fase !== "configurata"}>Apri Mercato</button>}
        {dettagli.gestore && <button className="btn btn-danger" onClick={chiudiMercato} disabled={!!competizione && competizione.fase !== "mercato_aperto"}>Chiudi Mercato</button>}
      </div>
      {dettagli.codice && (
        <div className="stat-box">
          <span className="stat-label">Codice di accesso</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span className="stat-value" style={{ fontFamily: "monospace", fontSize: "1.2rem", letterSpacing: "0.04em", textTransform: "none" }}>{dettagli.codice}</span>
            <button className="btn btn-blue" onClick={copiaCodice}>
              {codiceCopiato ? <><Icon name="check" className="inline-icon" /> Copiato!</> : <><Icon name="key" className="inline-icon" /> Copia codice</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Regolamento({ lega }) {
  const atletiPerCat = lega ? (lega.atleti_per_categoria || 2) : 2;
  return (
    <div>
      <div className="card">
        <div className="card-title"><Icon name="list" className="inline-icon" /> Regolamento {lega ? lega.nome : "FantaRoller"}</div>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.6 }}>Scegli i tuoi atleti, costruisci la squadra perfetta e sfida gli altri appassionati di pattinaggio corsa!</p>
      </div>
      <div className="card">
        <div className="card-title"><Icon name="building" className="inline-icon" /> Formazione</div>
        <p style={{ color: theme.textSub, fontSize: 13, marginBottom: 14 }}>Ogni squadra è composta da <strong style={{ color: theme.accent }}>{atletiPerCat} atleti per categoria</strong>:</p>
        <div className="responsive-grid">
          {["Ragazzi Maschi", "Ragazze Femminile", "Allievi Maschi", "Allieve Femminile", "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"].map(c => (
            <div key={c} style={{ background: "#0d1526", border: "1px solid #1E2D45", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: theme.textSub }}>
              <span style={{ color: theme.blue }}>×{atletiPerCat}</span> {c}
            </div>
          ))}
        </div>
      </div>
      {lega && (
        <div className="card">
          <div className="card-title"><Icon name="money" className="inline-icon" /> Budget e Modalità</div>
          <p style={{ color: theme.textSub, fontSize: 14 }}>Ogni squadra parte con <strong style={{ color: theme.accent }}>{lega.crediti_iniziali} crediti</strong>. Modalità: <strong style={{ color: theme.accent }}>{lega.modalita}</strong>.</p>
        </div>
      )}
      <div className="card">
        <div className="card-title"><Icon name="trophy" className="inline-icon" /> Punteggi per Posizione</div>
        <div className="responsive-grid">
          {[["1°", 100], ["2°", 85], ["3°", 75], ["4°", 65], ["5°", 55], ["6°", 50], ["7°", 45], ["8°", 40], ["9°", 35], ["10°", 30], ["11°-20°", 20], ["21°+", 5]].map(([pos, pts]) => (
            <div key={pos} style={{ background: "#0d1526", border: "1px solid #1E2D45", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: theme.textSub, fontSize: 13, fontWeight: 600 }}>{pos}</span>
              <span style={{ color: theme.accent, fontWeight: 700, fontSize: 15 }}>{pts}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-title"><Icon name="warning" className="inline-icon" /> Malus Sanzioni</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: "#0d1526", border: "1px solid #1E2D45", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: theme.textSub, fontSize: 13 }}>Ammonizione</span><span style={{ color: theme.yellow, fontWeight: 700, fontSize: 15 }}>-10</span></div>
          <div style={{ background: "#0d1526", border: "1px solid #1E2D45", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: theme.textSub, fontSize: 13 }}>Diffida</span><span style={{ color: theme.accent, fontWeight: 700, fontSize: 15 }}>-20</span></div>
          <div style={{ background: "#0d1526", border: "1px solid #1E2D45", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: theme.textSub, fontSize: 13 }}>Espulsione</span><span style={{ color: theme.red, fontWeight: 700, fontSize: 15 }}>-50</span></div>
        </div>
      </div>
    </div>
  );
}

function Admin({ token }) {
  const [messaggio, setMessaggio] = useState("");
  const [utentiRegistrati, setUtentiRegistrati] = useState(null);
  const [erroreUtenti, setErroreUtenti] = useState("");
  const [utenti, setUtenti] = useState([]);
  const [utentiCaricati, setUtentiCaricati] = useState(false);
  const [caricamentoUtenti, setCaricamentoUtenti] = useState(false);
  const [erroreElencoUtenti, setErroreElencoUtenti] = useState("");
  const [utentiAperti, setUtentiAperti] = useState(false);
  const [ricercaUtenti, setRicercaUtenti] = useState("");
  const [gare, setGare] = useState([]);
  const [gareSelezionate, setGareSelezionate] = useState([]);
  const [nuovaUrl, setNuovaUrl] = useState("");
  const [nuovaCategoria, setNuovaCategoria] = useState("Junior Maschi");
  const [nuovoMoltiplicatore, setNuovoMoltiplicatore] = useState("1.2");
  const [nuovoEvento, setNuovoEvento] = useState("");
  const [urlIndex, setUrlIndex] = useState("");
  const [nomeEventoIndex, setNomeEventoIndex] = useState("");
  const [eventoCalcolo, setEventoCalcolo] = useState("");
  const [eventiAperti, setEventiAperti] = useState({});
  const [nomeCatalogo, setNomeCatalogo] = useState("");
  const [descrizioneCatalogo, setDescrizioneCatalogo] = useState("");
  const [dataCatalogo, setDataCatalogo] = useState("");
  const [urlCatalogo, setUrlCatalogo] = useState("");
  const [eventiCatalogo, setEventiCatalogo] = useState([]);
  const [eventoEditId, setEventoEditId] = useState(null);
  const [legheAdmin, setLegheAdmin] = useState([]);
  const [legheSelezionateEvento, setLegheSelezionateEvento] = useState({});
  const [anteprimeCompetizioni, setAnteprimeCompetizioni] = useState({});

  const categorie = ["Ragazzi Maschi", "Ragazze Femminile", "Allievi Maschi", "Allieve Femminile", "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"];

  const caricaGare = async () => {
    const res = await fetch(`${API}/admin/gare`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setGare(await res.json());
  };

  useEffect(() => {
    let attivo = true;
    fetch(`${API}/admin/statistiche`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error("Non riesco a caricare il numero di utenti.");
        return res.json();
      })
      .then(data => {
        if (attivo) setUtentiRegistrati(data.utenti_registrati);
      })
      .catch(error => {
        if (attivo) setErroreUtenti(error.message);
      });
    return () => { attivo = false; };
  }, [token]);

  const caricaEventiCatalogo = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const [eventsResponse, leaguesResponse] = await Promise.all([
      fetch(`${API}/admin/eventi`, { headers }),
      fetch(`${API}/admin/leghe`, { headers }),
    ]);
    if (eventsResponse.ok) setEventiCatalogo(await eventsResponse.json());
    if (leaguesResponse.ok) setLegheAdmin(await leaguesResponse.json());
  }, [token]);
  useEffect(() => { caricaEventiCatalogo(); }, [caricaEventiCatalogo]);

  const associaEventoAlleLeghe = async (eventoId, ids) => {
    const res = await fetch(`${API}/admin/eventi/${eventoId}/associa-leghe`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ league_ids: ids }),
    });
    const data = await res.json();
    setMessaggio(res.ok
      ? `Evento associato a ${data.leghe_aggiunte} leghe; ${data.leghe_gia_associate} erano già associate.`
      : data.detail || "Errore durante l'associazione dell'evento");
    if (res.ok) caricaEventiCatalogo();
  };

  const aggiornaFaseAdmin = async (url, confermaFinalizzazione = false) => {
    if (confermaFinalizzazione && !window.confirm("Confermi di avere verificato l'anteprima e di voler rendere ufficiali questi risultati?")) return;
    const res = await fetch(`${API}${url}`, {
      method: "POST",
      ...(confermaFinalizzazione ? { headers: { Authorization: `Bearer ${token}` } } : { headers: { Authorization: `Bearer ${token}` } }),
    });
    const data = await res.json();
    setMessaggio(data.message || data.detail || `Operazione completata: ${data.fase || ""}`);
    if (res.ok) caricaEventiCatalogo();
  };

  const caricaAnteprimaCompetizione = async (competizioneId) => {
    const res = await fetch(`${API}/admin/competizioni/${competizioneId}/anteprima`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setAnteprimeCompetizioni(previous => ({ ...previous, [competizioneId]: data }));
    else setMessaggio(data.detail || "Errore caricamento anteprima");
  };

  const correggiRisultato = async (competizioneId, atleta) => {
    const motivazione = window.prompt(`Motivazione della correzione per ${atleta.atleta}:`);
    if (!motivazione?.trim()) return;
    const punti = window.prompt(`Nuovi punti ufficiali per ${atleta.atleta}:`, String(atleta.punti));
    if (punti === null || punti.trim() === "" || !Number.isInteger(Number(punti))) return;
    const res = await fetch(`${API}/admin/competizioni/${competizioneId}/correggi-risultati`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ motivazione, risultati: [{ atleta_id: atleta.atleta_id, punti: Number(punti) }] }),
    });
    const data = await res.json();
    setMessaggio(res.ok ? "Correzione registrata nello storico." : data.detail || "Errore nella correzione");
    if (res.ok) caricaAnteprimaCompetizione(competizioneId);
  };

  const apriElencoUtenti = async () => {
    const apri = !utentiAperti;
    setUtentiAperti(apri);
    if (!apri || utentiCaricati || caricamentoUtenti) return;
    setCaricamentoUtenti(true);
    setErroreElencoUtenti("");
    try {
      const res = await fetch(`${API}/admin/utenti`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Non riesco a caricare l’elenco degli utenti.");
      setUtenti(await res.json());
      setUtentiCaricati(true);
    } catch (error) {
      setErroreElencoUtenti(error.message);
    } finally {
      setCaricamentoUtenti(false);
    }
  };

  const utentiFiltrati = utenti.filter(account =>
    `${account.username || ""} ${account.email || ""}`.toLowerCase().includes(ricercaUtenti.trim().toLowerCase())
  );

  useState(() => { caricaGare(); }, []);

  const creaEventoCatalogo = async () => {
    const res = await fetch(eventoEditId ? `${API}/admin/eventi/${eventoEditId}` : `${API}/admin/eventi`, {
      method: eventoEditId ? "PUT" : "POST",
      ...(eventoEditId ? { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ nome: nomeCatalogo, descrizione: descrizioneCatalogo || null, data_evento: dataCatalogo || null, url_risultati: urlCatalogo || null }) } : {}),
      ...(eventoEditId ? {} : {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nome: nomeCatalogo, descrizione: descrizioneCatalogo || null,
        data_evento: dataCatalogo || null, url_risultati: urlCatalogo || null }),
      }),
    });
    const data = await res.json();
    setMessaggio(res.ok ? (eventoEditId ? "Evento aggiornato." : `Evento "${data.nome}" creato nel catalogo.`) : data.detail || "Errore salvataggio evento");
    if (res.ok) { setNomeCatalogo(""); setDescrizioneCatalogo(""); setDataCatalogo(""); setUrlCatalogo(""); setEventoEditId(null); caricaEventiCatalogo(); }
  };

  const archiviaEventoCatalogo = async (id) => {
    const res = await fetch(`${API}/admin/eventi/${id}/archivia`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    if (res.ok) caricaEventiCatalogo();
  };

  const aggiungiGara = async () => {
    const res = await fetch(`${API}/admin/aggiungi-gara?url=${encodeURIComponent(nuovaUrl)}&categoria=${encodeURIComponent(nuovaCategoria)}&moltiplicatore=${nuovoMoltiplicatore}&evento=${encodeURIComponent(nuovoEvento)}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); setMessaggio(data.message); setNuovaUrl(""); setNuovoEvento(""); caricaGare();
  };

  const eliminaGara = async (id) => {
    await fetch(`${API}/admin/gara/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    caricaGare();
  };

  const eliminaSelezionate = async () => {
    for (const id of gareSelezionate) {
      await fetch(`${API}/admin/gara/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    }
    setMessaggio(`${gareSelezionate.length} gare eliminate`);
    setGareSelezionate([]);
    caricaGare();
  };

  const importaEvento = async () => {
    setMessaggio("Importazione in corso...");
    const res = await fetch(`${API}/admin/importa-evento?url_index=${encodeURIComponent(urlIndex)}&evento=${encodeURIComponent(nomeEventoIndex)}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); setMessaggio(data.message); setUrlIndex(""); setNomeEventoIndex(""); caricaGare();
  };

  const calcolaPunti = async () => {
    setMessaggio("Calcolo punti in corso...");
    const url = eventoCalcolo ? `${API}/admin/calcola-punti?evento=${encodeURIComponent(eventoCalcolo)}` : `${API}/admin/calcola-punti`;
    const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); setMessaggio(data.message);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title"><Icon name="tool" className="inline-icon" /> Pannello Admin Globale</div>
        {messaggio && <div className="msg-box">{messaggio}</div>}
        <p style={{ color: theme.textSub, fontSize: 13 }}>Il mercato ora si gestisce per singola lega, dalla sezione "Gestisci Lega" quando hai una lega attiva di cui sei owner.</p>
      </div>

      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div className="card-title" style={{ marginBottom: 5 }}><Icon name="users" className="inline-icon" /> Utenti registrati</div>
          <div style={{ color: theme.textMuted, fontSize: 12 }}>Account creati sul sito, inclusi quelli in attesa di verifica email</div>
        </div>
        <div style={{ color: erroreUtenti ? theme.red : theme.accent, fontSize: 32, fontWeight: 700, minWidth: 52, textAlign: "right" }}>
          {erroreUtenti ? "—" : utentiRegistrati ?? "…"}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <button
          type="button"
          aria-expanded={utentiAperti}
          aria-controls="admin-elenco-utenti"
          onClick={apriElencoUtenti}
          style={{ width: "100%", padding: "16px 20px", border: 0, background: "transparent", color: theme.text, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", font: "inherit" }}
        >
          <span style={{ fontWeight: 700 }}><Icon name="list" className="inline-icon" /> Elenco username ed email</span>
                <Icon name={utentiAperti ? "chevronUp" : "chevronDown"} size={16} />
        </button>
        {utentiAperti && (
          <div id="admin-elenco-utenti" style={{ padding: "0 20px 18px" }}>
            <input
              className="input"
              placeholder="Cerca username o email..."
              aria-label="Cerca username o email"
              value={ricercaUtenti}
              onChange={event => setRicercaUtenti(event.target.value)}
            />
            {caricamentoUtenti && <p style={{ color: theme.textMuted, fontSize: 13 }}>Caricamento utenti…</p>}
            {erroreElencoUtenti && <p style={{ color: theme.red, fontSize: 13 }}>{erroreElencoUtenti}</p>}
            {utentiCaricati && !utentiFiltrati.length && <p style={{ color: theme.textMuted, fontSize: 13 }}>Nessun utente corrisponde alla ricerca.</p>}
            {utentiFiltrati.length > 0 && (
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                <table className="table">
                  <thead><tr><th>Username</th><th>Email</th></tr></thead>
                  <tbody>
                    {utentiFiltrati.map(account => (
                      <tr key={account.username}>
                        <td style={{ fontWeight: 600 }}>{account.username}</td>
                        <td style={{ color: theme.textSub, overflowWrap: "anywhere" }}>{account.email || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title"><Icon name="calendar" className="inline-icon" /> {eventoEditId ? "Modifica evento globale" : "Catalogo eventi globali"}</div>
        <p style={{ color: theme.textSub, fontSize: 13 }}>Gli eventi aggiunti qui diventano selezionabili nelle singole leghe. La creazione non calcola né assegna punteggi.</p>
        <input className="input" placeholder="Nome manifestazione" value={nomeCatalogo} onChange={e => setNomeCatalogo(e.target.value)} />
        <input className="input" placeholder="Descrizione (facoltativa)" value={descrizioneCatalogo} onChange={e => setDescrizioneCatalogo(e.target.value)} />
        <input className="input" type="date" aria-label="Data evento" value={dataCatalogo} onChange={e => setDataCatalogo(e.target.value)} />
        <input className="input" placeholder="Link ai risultati (facoltativo)" value={urlCatalogo} onChange={e => setUrlCatalogo(e.target.value)} />
        <button className="btn btn-primary" disabled={!nomeCatalogo.trim()} onClick={creaEventoCatalogo}>{eventoEditId ? "Salva modifiche" : "Aggiungi al catalogo"}</button>
        {eventoEditId && <button className="btn btn-danger" style={{ marginLeft: 8 }} onClick={() => { setEventoEditId(null); setNomeCatalogo(""); setDescrizioneCatalogo(""); setDataCatalogo(""); setUrlCatalogo(""); }}>Annulla</button>}
        {eventiCatalogo.map(evento => (
          <div key={evento.id} style={{ padding: "12px 0", borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div><strong>{evento.nome}</strong><span style={{ color: theme.textMuted, fontSize: 12, marginLeft: 8 }}>{evento.data_evento || "Data non impostata"} · {evento.stato}</span></div>
              <div style={{ display: "flex", gap: 6 }}>
                {evento.modificabile && evento.stato === "disponibile" && <button className="btn btn-blue" onClick={() => { setEventoEditId(evento.id); setNomeCatalogo(evento.nome); setDescrizioneCatalogo(evento.descrizione || ""); setDataCatalogo(evento.data_evento || ""); setUrlCatalogo(evento.url_risultati || ""); }}>Modifica</button>}
                {evento.archiviabile && evento.stato === "disponibile" && <button className="btn btn-danger" onClick={() => archiviaEventoCatalogo(evento.id)}>Archivia</button>}
              </div>
            </div>
            {evento.stato === "disponibile" && (
              <div style={{ marginTop: 12, padding: 12, background: "#0d1526", borderRadius: 9 }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>Rendi l'evento disponibile alle leghe</div>
                {legheAdmin.length === 0 ? <div style={{ color: theme.textMuted, fontSize: 12 }}>Non ci sono leghe.</div> : (
                  <>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px 14px", marginBottom: 10 }}>
                      {legheAdmin.map(league => {
                        const linked = evento.leghe_associate?.some(item => item.league_id === league.id);
                        const selected = (legheSelezionateEvento[evento.id] || []).includes(league.id);
                        return <label key={league.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, color: linked ? theme.textMuted : theme.textSub, fontSize: 12 }}>
                          <input type="checkbox" checked={linked || selected} disabled={linked} onChange={event => setLegheSelezionateEvento(previous => {
                            const ids = new Set(previous[evento.id] || []);
                            if (event.target.checked) ids.add(league.id); else ids.delete(league.id);
                            return { ...previous, [evento.id]: [...ids] };
                          })} /> {league.nome}{linked ? " · associata" : ""}
                        </label>;
                      })}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <button className="btn btn-blue" onClick={() => associaEventoAlleLeghe(evento.id, legheAdmin.map(league => league.id))}>Aggiungi a tutte le leghe</button>
                      <button className="btn btn-primary" disabled={!(legheSelezionateEvento[evento.id] || []).length} onClick={() => associaEventoAlleLeghe(evento.id, legheSelezionateEvento[evento.id] || [])}>Aggiungi alle selezionate</button>
                    </div>
                  </>
                )}
              </div>
            )}
            {!!evento.leghe_associate?.length && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6 }}>Leghe e stato</div>
                {evento.leghe_associate.map(association => (
                  <div key={association.league_id} style={{ padding: "9px 0", borderTop: `1px solid ${theme.border}33` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontSize: 12 }}>{association.lega} · {association.fase ? association.fase.replaceAll("_", " ") : association.stato.replaceAll("_", " ")}</span>
                      {association.competizione_id && association.fase === "transizione_in_attesa" && <button className="btn btn-primary" onClick={() => aggiornaFaseAdmin(`/admin/competizioni/${association.competizione_id}/autorizza-transizione`)}>Autorizza nuova competizione</button>}
                      {association.competizione_id && association.fase === "risultati_inseriti" && <button className="btn btn-blue" onClick={() => aggiornaFaseAdmin(`/admin/competizioni/${association.competizione_id}/calcola-punti`)}>Registra punti calcolati</button>}
                      {association.competizione_id && ["punteggi_calcolati", "finalizzato"].includes(association.fase) && <button className="btn btn-blue" onClick={() => caricaAnteprimaCompetizione(association.competizione_id)}>Anteprima risultati</button>}
                      {association.competizione_id && association.fase === "punteggi_calcolati" && <button className="btn btn-success" onClick={() => aggiornaFaseAdmin(`/admin/competizioni/${association.competizione_id}/finalizza?conferma=true`, true)}>Finalizza risultati</button>}
                    </div>
                    {association.competizione_id && anteprimeCompetizioni[association.competizione_id] && (
                      <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: theme.bgCard }}>
                        {anteprimeCompetizioni[association.competizione_id].partecipanti.map(participant => (
                          <div key={participant.squadra_id} style={{ marginBottom: 9 }}>
                            <div style={{ fontSize: 12, fontWeight: 700 }}>{participant.squadra} · @{participant.username} · {participant.punti} pt</div>
                            {participant.atleti.map(athlete => <div key={athlete.atleta_id} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "4px 0", color: theme.textMuted, fontSize: 11 }}>
                              <span>{athlete.atleta} · {athlete.categoria}</span>
                              <span>{athlete.punti} pt {association.fase === "finalizzato" && <button className="btn btn-blue" style={{ padding: "2px 6px", marginLeft: 6, fontSize: 10 }} onClick={() => correggiRisultato(association.competizione_id, athlete)}>Correggi</button>}</span>
                            </div>)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title"><Icon name="link" className="inline-icon" /> Importa Evento da Index</div>
        <input className="input" placeholder="URL index evento (es. .../index.htm)" value={urlIndex} onChange={e => setUrlIndex(e.target.value)} />
        <input className="input" placeholder="Nome evento (es. Campionati Italiani 2026)" value={nomeEventoIndex} onChange={e => setNomeEventoIndex(e.target.value)} />
        <button className="btn btn-purple" onClick={importaEvento}><Icon name="link" className="inline-icon" /> Importa tutte le gare</button>
      </div>

      <div className="card">
        <div className="card-title"><Icon name="plus" className="inline-icon" /> Aggiungi Gara Singola</div>
        <input className="input" placeholder="Nome evento" value={nuovoEvento} onChange={e => setNuovoEvento(e.target.value)} />
        <input className="input" placeholder="URL classifica FISR" value={nuovaUrl} onChange={e => setNuovaUrl(e.target.value)} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <select className="select" value={nuovaCategoria} onChange={e => setNuovaCategoria(e.target.value)}>
            {categorie.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="select" value={nuovoMoltiplicatore} onChange={e => setNuovoMoltiplicatore(e.target.value)}>
            <option value="1.2">×1.2 (veloce/lunga)</option>
            <option value="1.5">×1.5 (media)</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={aggiungiGara}>Aggiungi Gara</button>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0 }}><Icon name="list" className="inline-icon" /> Gare inserite ({gare.length})</div>
          {gareSelezionate.length > 0 && <button className="btn btn-danger" onClick={eliminaSelezionate}><Icon name="trash" className="inline-icon" /> Elimina ({gareSelezionate.length})</button>}
        </div>
        {gare.length === 0 ? <p style={{ color: theme.textMuted, fontSize: 14 }}>Nessuna gara inserita</p> : (
          [...new Set(gare.map(g => g.evento))].map(evento => (
            <div key={evento} style={{ marginBottom: 12 }}>
              <div style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0d1526", borderRadius: 8, marginBottom: 6 }} onClick={() => setEventiAperti(prev => ({ ...prev, [evento]: !prev[evento] }))}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{evento}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="badge badge-blue">{gare.filter(g => g.evento === evento).length} gare</span>
                  <Icon name={eventiAperti[evento] ? "chevronUp" : "chevronDown"} size={16} />
                </div>
              </div>
              {eventiAperti[evento] && (
                <table className="table">
                  <thead><tr><th style={{ width: 40 }}><Icon name="check" size={14} /></th><th>Categoria</th><th>Molt.</th><th></th></tr></thead>
                  <tbody>
                    {gare.filter(g => g.evento === evento).map(g => (
                      <tr key={g.id} style={{ background: gareSelezionate.includes(g.id) ? "#f9731610" : "" }}>
                        <td><input type="checkbox" checked={gareSelezionate.includes(g.id)} onChange={e => {
                          if (e.target.checked) setGareSelezionate([...gareSelezionate, g.id]);
                          else setGareSelezionate(gareSelezionate.filter(id => id !== g.id));
                        }} /></td>
                        <td><span className="badge badge-blue">{g.categoria}</span></td>
                        <td><span className="badge badge-orange">×{g.moltiplicatore}</span></td>
                        <td><button className="btn btn-danger" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => eliminaGara(g.id)}>Elimina</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )}
      </div>

      <div className="card">
        <div className="card-title"><Icon name="refresh" className="inline-icon" /> Aggiorna Punti</div>
        <p style={{ color: theme.textSub, fontSize: 13, marginBottom: 14 }}>Seleziona un campionato specifico o calcola tutto.</p>
        <select className="select" style={{ marginBottom: 12, width: "100%" }} value={eventoCalcolo} onChange={e => setEventoCalcolo(e.target.value)}>
          <option value="">Tutti i campionati</option>
          {[...new Set(gare.map(g => g.evento))].map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <button className="btn" style={{ background: "linear-gradient(135deg, #f97316, #ef4444)", color: "white", padding: "12px 24px", fontSize: 14 }} onClick={calcolaPunti}>
          <Icon name="refresh" className="inline-icon" /> {eventoCalcolo ? `Calcola ${eventoCalcolo}` : "Calcola Tutti"}
        </button>
      </div>
    </div>
  );
}

function Gare({ token, lega }) {
  const [eventi, setEventi] = useState([]);
  const [eventoSelezionato, setEventoSelezionato] = useState("");
  const [risultati, setRisultati] = useState({});
  const [categoriaAperta, setCategoriaAperta] = useState(null);
  const [loading, setLoading] = useState(false);

  useState(() => {
    fetch(`${API}/gare/eventi`).then(r => r.json()).then(setEventi);
  }, []);

  const caricaRisultati = async (evento) => {
    setEventoSelezionato(evento);
    setCategoriaAperta(null);
    setLoading(true);
    if (!evento || !lega) { setRisultati({}); setLoading(false); return; }
    const res = await fetch(`${API}/gare/risultati?evento=${encodeURIComponent(evento)}&league_id=${lega.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setRisultati(await res.json());
    setLoading(false);
  };

  const ordineCategorie = ["Ragazzi Maschi", "Ragazze Femminile", "Allievi Maschi", "Allieve Femminile", "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"];
  const categorieOrdinati = ordineCategorie.filter(c => risultati[c]);

  return (
    <div>
      <div className="card">
        <div className="card-title"><Icon name="calendar" className="inline-icon" /> Gare</div>
        <select className="select" value={eventoSelezionato} onChange={e => caricaRisultati(e.target.value)}>
          <option value="">Seleziona un campionato...</option>
          {eventi.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {eventoSelezionato && loading && <div className="card"><p style={{ color: theme.textMuted }}><Icon name="clock" className="inline-icon" /> Caricamento...</p></div>}

      {categorieOrdinati.map(cat => (
        <div key={cat} className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: categoriaAperta === cat ? "#1a2235" : theme.bgCard }} onClick={() => setCategoriaAperta(categoriaAperta === cat ? null : cat)}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{cat}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="badge badge-blue">{risultati[cat].length} atleti</span>
              <Icon name={categoriaAperta === cat ? "chevronUp" : "chevronDown"} size={16} />
            </div>
          </div>
          {categoriaAperta === cat && (
            <div style={{ padding: "8px 12px" }}>
              {risultati[cat].map((a, i) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", marginBottom: 4, borderRadius: 8, background: a.in_squadra ? "#f9731615" : "#0d1526", borderLeft: a.in_squadra ? `3px solid ${theme.accent}` : "3px solid transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <span style={{ color: theme.textMuted, fontSize: 12, minWidth: 24 }}>{i + 1}</span>
                    <span style={{ fontWeight: a.in_squadra ? 700 : 400, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
                    {a.in_squadra && <span className="badge badge-orange" style={{ flexShrink: 0 }} title="Atleta nella tua squadra"><Icon name="star" size={13} /></span>}
                  </div>
                  <span style={{ color: theme.accent, fontWeight: 700, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", flexShrink: 0, marginLeft: 8 }}>{a.punti}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Privacy() {
  return (
    <div>
      <div className="card">
        <div className="card-title"><Icon name="shield" className="inline-icon" /> Privacy & Dati</div>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.8 }}>FantaRoller utilizza esclusivamente dati pubblicamente disponibili sul sito ufficiale della Federazione Italiana Sport Rotellistici (FISR) all'indirizzo <span style={{ color: theme.blue }}>attivita.rollergames.it</span>.</p>
      </div>
      <div className="card">
        <div className="card-title"><Icon name="list" className="inline-icon" /> Informazioni sugli Atleti</div>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>I nomi, i risultati e le classifiche degli atleti presenti su FantaRoller sono già pubblicamente accessibili online attraverso i comunicati ufficiali FISR. Nessun dato privato viene raccolto o pubblicato.</p>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.8 }}>Per richiedere la rimozione dei propri dati contattare l'amministratore del sito.</p>
      </div>
      <div className="card">
        <div className="card-title"><Icon name="user" className="inline-icon" /> Dati degli Utenti</div>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.8 }}>FantaRoller raccoglie username, email (per la verifica dell'account) e password (cifrata). Nessuna informazione personale aggiuntiva viene richiesta o memorizzata.</p>
      </div>
    </div>
  );
}

export default App;
