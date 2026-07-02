import React, { useState } from "react";

const API = "https://fantaroller-api.onrender.com";

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

  body {
    background: ${theme.bg};
    color: ${theme.text};
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
  }

  .app-wrapper {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 16px 40px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0 16px;
    border-bottom: 1px solid ${theme.border};
    margin-bottom: 24px;
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
    font-family: 'Inter', sans-serif;
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

  .nav-btn.admin-btn {
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    border-color: transparent;
    color: white;
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

  .btn {
    padding: 9px 18px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
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
    font-family: 'Inter', sans-serif;
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
    font-family: 'Inter', sans-serif;
    cursor: pointer;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

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

  .rank-number.gold { color: #f59e0b; }
  .rank-number.silver { color: #94a3b8; }
  .rank-number.bronze { color: #b45309; }

  .login-page {
    min-height: 100vh;
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

  .divider {
    height: 1px;
    background: ${theme.border};
    margin: 20px 0;
  }

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

  @media (max-width: 768px) {

    .hide-mobile {
      display: none;
    }

    .table {
      white-space: normal;
    }

    .table th,
    .table td {
      font-size: 11px;
      padding: 6px;
    }

    .app-wrapper {
      padding: 0 10px 30px;
    }

    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .nav {
      width: 100%;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .nav-btn {
      white-space: nowrap;
      font-size: 12px;
      padding: 6px 10px;
    }

    .card {
      padding: 14px;
    }

    .card-title {
      font-size: 1.1rem;
    }

    .table th,
    .table td {
      padding: 8px;
      font-size: 12px;
    }

    .table td:last-child,
    .table th:last-child {
      position: sticky;
      right: 0;
      background: #111827;
    }

    .login-card {
      margin: 16px;
      padding: 24px;
    }

    .stat-box {
      width: 100%;
    }

    .btn {
      font-size: 12px;
      padding: 8px 12px;
    }

  }
  `;

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [pagina, setPagina] = useState("squadra");
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [menuAperto, setMenuAperto] = useState(false);
  const [countdown, setCountdown] = useState("");

  useState(() => {
    const t = localStorage.getItem("token");
    if (t) {
      fetch(`${API}/me/`, { headers: { Authorization: `Bearer ${t}` } })
        .then(r => r.json())
        .then(data => {
          setIsAdmin(data.is_admin === 1);
          setUsername(data.username);
        })
        .catch(() => {
          setToken(null);
          localStorage.removeItem("token");
        });
    }
  }, []);

  useState(() => {
    const target = new Date("2026-06-05T09:00:00");
    const aggiorna = () => {
      const ora = new Date();
      const diff = target - ora;
      if (diff <= 0) { setCountdown("🔴 Gare iniziate!"); return; }
      const giorni = Math.floor(diff / (1000 * 60 * 60 * 24));
      const ore = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minuti = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secondi = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`⏱️ Mercato chiude tra: ${giorni}g ${ore}h ${minuti}m ${secondi}s`);
    };
    aggiorna();
    const interval = setInterval(aggiorna, 1000);
    return () => clearInterval(interval);
  }, []);


  const dopoLogin = async (t) => {
    setToken(t);
    localStorage.setItem("token", t);
    const res = await fetch(`${API}/me/`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await res.json();
    setIsAdmin(data.is_admin === 1);
    setUsername(data.username);
    setPagina("squadra");
  };

  if (!token) return <Login setToken={dopoLogin} />;

  const vaiA = (p) => { setPagina(p); setMenuAperto(false); };

  return (
    <>
      <style>{styles}</style>
      <style>{`
        .drawer-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          z-index: 99; cursor: pointer;
        }
        .drawer {
          position: fixed; top: 0; left: 0; height: 100vh; width: 260px;
          background: ${theme.bgCard}; border-right: 1px solid ${theme.border};
          z-index: 100; padding: 24px 0; display: flex; flex-direction: column;
          transform: translateX(-100%); transition: transform 0.25s ease;
        }
        .drawer.open { transform: translateX(0); }
        .drawer-item {
          padding: 12px 24px; color: ${theme.textSub}; cursor: pointer;
          font-size: 14px; font-weight: 500; transition: all 0.15s;
          display: flex; align-items: center; gap: 10px;
        }
        .drawer-item:hover { background: ${theme.bgCardHover}; color: ${theme.white}; }
        .drawer-item.active { color: ${theme.accent}; background: ${theme.bgCardHover}; }
        .drawer-title {
          padding: 8px 24px 16px; font-family: 'Bebas Neue', cursive;
          font-size: 1.4rem; letter-spacing: 2px; color: ${theme.white};
          border-bottom: 1px solid ${theme.border}; margin-bottom: 8px;
        }
        .drawer-section {
          padding: 6px 24px 4px; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1px; color: ${theme.muted};
          margin-top: 8px;
        }
      `}</style>

      {/* DRAWER */}
      {menuAperto && <div className="drawer-overlay" onClick={() => setMenuAperto(false)} />}
      <div className={`drawer ${menuAperto ? "open" : ""}`}>
        <div className="drawer-title">⚡ Fanta<span style={{ color: theme.accent }}>Roller</span></div>
        
        <div className="drawer-section">Gioco</div>
        <div className={`drawer-item ${pagina === "lega" ? "active" : ""}`} onClick={() => vaiA("lega")}>🏅 Le mie Leghe</div>
        <div className={`drawer-item ${pagina === "gare" ? "active" : ""}`} onClick={() => vaiA("gare")}>📅 Gare</div>
        <div className={`drawer-item ${pagina === "squadre" ? "active" : ""}`} onClick={() => vaiA("squadre")}>👥 Squadre</div>
        
        <div className="drawer-section">Info</div>
        <div className={`drawer-item ${pagina === "regolamento" ? "active" : ""}`} onClick={() => vaiA("regolamento")}>📋 Regolamento</div>
        <div className={`drawer-item ${pagina === "privacy" ? "active" : ""}`} onClick={() => vaiA("privacy")}>🔒 Privacy</div>
        
        {isAdmin && <>
          <div className="drawer-section">Admin</div>
          <div className={`drawer-item ${pagina === "admin" ? "active" : ""}`} onClick={() => vaiA("admin")}>🔧 Pannello Admin</div>
        </>}

        <button className="btn btn-danger" style={{ width: "100%", fontSize: 13, margin: "8px 0" }} onClick={() => { setToken(null); localStorage.removeItem("token"); setPagina("squadra"); setMenuAperto(false); }}>
            Esci
        </button>
      </div>

      {/* MAIN */}
      <div className="app-wrapper">
        <div className="header">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setMenuAperto(!menuAperto)}
              style={{ background: "none", border: `1px solid ${theme.border}`, color: theme.textSub, cursor: "pointer", padding: "6px 10px", borderRadius: 8, fontSize: 18 }}
            >
              ☰
            </button>
            <div className="logo" style={{ whiteSpace: "nowrap" }}>⚡ Fanta<span>Roller</span></div>

          </div>
          {countdown && (
            <div style={{ textAlign: "center", fontSize: 12, color: theme.accent, fontWeight: 600, background: "#f9731615", border: "1px solid #f9731630", borderRadius: 8, padding: "6px 10px", marginBottom: 16 }}>
              {countdown}
            </div>
          )}
          <nav className="nav">
            <button className={`nav-btn ${pagina === "squadra" ? "active" : ""}`} onClick={() => setPagina("squadra")}>La mia Squadra</button>
            <button className={`nav-btn ${pagina === "mercato" ? "active" : ""}`} onClick={() => setPagina("mercato")}>Mercato</button>
            <button className={`nav-btn ${pagina === "classifica" ? "active" : ""}`} onClick={() => setPagina("classifica")}>Classifica</button>
          </nav>
        </div>

        {pagina === "squadra" && <Squadra token={token} />}
        {pagina === "mercato" && <Mercato token={token} />}
        {pagina === "classifica" && <Classifica username={username} token={token} />}
        {pagina === "lega" && <Lega token={token} />}
        {pagina === "gare" && <Gare token={token} />}
        {pagina === "squadre" && <SquadrePubbliche />}
        {pagina === "regolamento" && <Regolamento />}
        {pagina === "privacy" && <Privacy />}
        {pagina === "admin" && <Admin token={token} />}
      </div>
    </>
  );
}

function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");
  const [successo, setSuccesso] = useState("");
  const [registrati, setRegistrati] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (username.length < 3) { setErrore("❌ Username troppo corto (min 3 caratteri)"); return; }
    if (username.length > 40) { setErrore("❌ Username troppo lungo (max 20 caratteri)"); return; }
    if (password.length < 4) { setErrore("❌ Password troppo corta (min 4 caratteri)"); return; }
    if (password.length > 40) { setErrore("❌ Password troppo lunga (max 30 caratteri)"); return; }
    setLoading(true);
    setErrore("");
    const url = registrati ? `${API}/register/` : `${API}/login/`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (registrati) {
        if (res.ok) {
          setSuccesso("✅ Registrato! Ora fai login.");
          setErrore("");
          setRegistrati(false);
        } else {
          setErrore(`❌ ${data.detail}`);
        }
      } else if (data.access_token) {
        setToken(data.access_token);
      } else {
        setErrore("❌ Credenziali errate");
      }
    } catch {
      setErrore("❌ Errore di connessione");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">⚡ Fanta<span style={{ color: theme.accent }}>Roller</span></div>
          <div className="login-sub">Fantasy Pattinaggio Corsa</div>
          <div style={{ background: "#38bdf815", border: "1px solid #38bdf830", borderRadius: 8, padding: "10px 14px", color: theme.blue, fontSize: 13, marginBottom: 16, textAlign: "center" }}>
            Prima volta? Clicca su <strong>"Registrati"</strong> in fondo per creare il tuo account!
          </div>
          {successo && <div className="success-box">{successo}</div>}
          {loading && (
            <div className="success-box">
              ⏳ Caricamento...
            </div>
          )}
          {errore && <div style={{ background: "#ef444415", border: "1px solid #ef444430", borderRadius: 8, padding: "10px 14px", color: theme.red, fontSize: 13, marginBottom: 12 }}>{errore}</div>}
          <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          <button className="btn btn-primary" style={{ width: "100%", padding: "12px", fontSize: 15 }} onClick={handleSubmit} disabled={loading}>
            {registrati ? "Registrati" : "Entra"}
          </button>
          <div className="login-toggle" onClick={() => { setRegistrati(!registrati); setErrore(""); setSuccesso(""); }}>
            {registrati ? <>Hai già un account? <span>Login</span></> : <>Non hai un account? <span>Registrati</span></>}
          </div>
        </div>
      </div>
    </>
  );
}

function Squadra({ token }) {
  const [messaggio, setMessaggio] = useState("");
  const [squadra, setSquadra] = useState(null);
  const [errore, setErrore] = useState("");
  const [nomeSquadra, setNomeSquadra] = useState("");
  const [nuovoNome, setNuovoNome] = useState("");
  const [rinominaAperto, setRinominaAperto] = useState(false);
  const [atletaAperto, setAtletaAperto] = useState(null);
  const [atletaDettagli, setAtletaDettagli] = useState({});

  const caricaDettagliAtleta = async (id) => {
    if (atletaAperto === id) { setAtletaAperto(null); return; }
    setAtletaAperto(id);
    if (!atletaDettagli[id]) {
      const res = await fetch(`${API}/atleta/${id}/statistiche`);
      if (res.ok) {
        const data = await res.json();
        setAtletaDettagli(prev => ({ ...prev, [id]: data }));
      }
    }
  };

  const rinomina = async () => {
      if (nuovoNome.length > 25) {
  setMessaggio("❌ Nome squadra troppo lungo (max 25 caratteri)");
  return;
      }
  if (nuovoNome.length < 3) {
  setMessaggio("❌ Nome squadra troppo corto (min 3 caratteri)");
  return;
      }

    const res = await fetch(`${API}/squadra/rinomina?nome=${encodeURIComponent(nuovoNome)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  setMessaggio(data.message);
  setRinominaAperto(false);
  caricaSquadra();
};



  const caricaSquadra = async () => {
    const res = await fetch(`${API}/squadra/`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { setSquadra(await res.json()); setErrore(""); }
    else if (res.status === 404) setErrore("crea");
    // altri errori (401, 500) non mostrano "crea squadra"
  };

  const creaSquadra = async () => {
    if (nomeSquadra.length > 25) {
      setMessaggio("❌ Nome squadra troppo lungo (max 25 caratteri)");
      return;
    }
    if (nomeSquadra.length < 3) {
      setMessaggio("❌ Nome squadra troppo corto (min 3 caratteri)");
      return;
    }

    const res = await fetch(`${API}/squadra/crea?nome=${nomeSquadra}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) caricaSquadra();
  };

  const vendi = async (id) => {
    const res = await fetch(`${API}/squadra/vendi/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    caricaSquadra();
  };

  useState(() => { caricaSquadra(); }, []);

  const isNew = squadra && squadra.is_new === 1;
  const categorie = isNew
    ? ["Allievi Maschi", "Allieve Femminile", "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"]
    : ["Ragazzi Maschi", "Ragazze Femminile", "Allievi Maschi", "Allieve Femminile", "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"];
  const atletiPerCategoria = (cat) => squadra ? squadra.atleti.filter(a => a.categoria === cat).length : 0;
  const squadraCompleta = squadra ? (isNew ? squadra.atleti.length === 12 : squadra.atleti.length === 16) : false;

  if (errore === "crea") return (
    <div className="card">
      <div className="card-title">🏗️ Crea la tua squadra</div>
      <input className="input" placeholder="Nome squadra" value={nomeSquadra} onChange={e => setNomeSquadra(e.target.value)} />
      <button className="btn btn-primary" onClick={creaSquadra}>Crea Squadra</button>
    </div>
  );

  if (!squadra) return <div className="card" style={{ color: theme.textMuted }}>Caricamento...</div>;

  return (
    <div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>🏆 {squadra.nome}</div>
              <button className="btn btn-blue" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setRinominaAperto(!rinominaAperto)}>✏️ Rinomina</button>
            </div>
            {rinominaAperto && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input className="input" style={{ marginBottom: 0, flex: 1 }} placeholder="Nuovo nome squadra" value={nuovoNome} onChange={e => setNuovoNome(e.target.value)} />
                <button className="btn btn-primary" onClick={rinomina}>Salva</button>
                <button className="btn btn-danger" onClick={() => setRinominaAperto(false)}>✕</button>
              </div>
            )}

            {squadraCompleta
              ? <div className="badge badge-green">✅ Squadra completa</div>
              : <div className="badge badge-orange">⚠️ Squadra incompleta</div>}
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
            <div className="warning-title">⚠️ Atleti mancanti:</div>
            {categorie.map(cat => {
              const mancanti = 2 - atletiPerCategoria(cat);
              return mancanti > 0 ? <div key={cat} className="warning-item">• {mancanti} in {cat}</div> : null;
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">👥 Atleti ({squadra.atleti.length}/16)</div>
        {squadra.atleti.length === 0
          ? <p style={{ color: theme.textMuted, fontSize: 14 }}>Nessun atleta — vai al mercato!</p>
          : <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Punti</th>
                  <th>Prezzo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {squadra.atleti.map(a => (
                  <>
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: theme.textMuted }}>{a.categoria}</div>
                      </td>
                      <td style={{ color: theme.green, fontWeight: 700 }}>{a.punti || 0}</td>
                      <td style={{ color: theme.accent, fontWeight: 700 }}>{a.prezzo}cr</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-blue" style={{ padding: "3px 8px", fontSize: 11 }} onClick={() => caricaDettagliAtleta(a.id)}>
                            {atletaAperto === a.id ? "▲" : "📊"}
                          </button>
                          <button className="btn btn-danger" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => vendi(a.id)}>Vendi</button>
                        </div>
                      </td>
                    </tr>
                    {atletaAperto === a.id && atletaDettagli[a.id] && (
                      <tr key={`det-${a.id}`}>
                        <td colSpan={4} style={{ padding: "8px 16px", background: "#070c18" }}>
                          {atletaDettagli[a.id].eventi.map(e => (
                            <div key={e.evento} style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 11, color: theme.accent, fontWeight: 700, marginBottom: 4 }}>{e.evento} — {e.punti} pt totali</div>
                              {e.gare.map(g => (
                                <div key={g.tipo} style={{ fontSize: 11, color: theme.textSub, paddingLeft: 12, marginBottom: 2 }}>
                                  <span style={{ color: theme.blue, fontWeight: 600 }}>{g.punti} pt</span> — {g.tipo}
                                </div>
                              ))}
                            </div>
                          ))}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}

function Mercato({ token }) {
  const [atleti, setAtleti] = useState([]);
  const [messaggio, setMessaggio] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [ricerca, setRicerca] = useState("");
  const [squadra, setSquadra] = useState([]);
  const [ordinePrezzo, setOrdinePrezzo] = useState("");
  const [atletaDettagli, setAtletaDettagli] = useState(null);
  const [atletaAperto, setAtletaAperto] = useState(null);
  const [categoriaAperta, setCategoriaAperta] = useState(null);
  const [budget, setBudget] = useState(999);
  const [atletiPerCategoria, setAtletiPerCategoria] = useState({});
  const [piuAcquistati, setPiuAcquistati] = useState([]);
  const [piuAcquistatiAperto, setPiuAcquistatiAperto] = useState(false);
  const [plusvalenze, setPlusvalenze] = useState([]);
  const [plusvalenzeAperto, setPlusvalenzeAperto] = useState(false);
  const apriDettagli = async (id) => {
    if (atletaAperto === id) { setAtletaAperto(null); return; }
    setAtletaAperto(id);
    const res = await fetch(`${API}/atleta/${id}/statistiche`);
    if (res.ok) setAtletaDettagli(await res.json());
  };

  
  useState(() => {
    fetch(`${API}/athletes/`).then(r => r.json()).then(setAtleti);
    fetch(`${API}/atleti/piu-acquistati`).then(r => r.json()).then(setPiuAcquistati);
    fetch(`${API}/atleti/plusvalenze`).then(r => r.json()).then(data => {
    const giuliaIdx = data.findIndex(a => a.name.toLowerCase().includes('giulia'));
    const murruIdx = data.findIndex(a => a.name.toLowerCase().includes('murru'));
    if (giuliaIdx !== -1 && murruIdx !== -1 && murruIdx < giuliaIdx) {
        const murru = data.splice(murruIdx, 1)[0];
        data.splice(giuliaIdx + 1, 0, murru);
    }
    setPlusvalenze(data);
});
    fetch(`${API}/squadra/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => {
        if (data.atleti) {
          setSquadra(data.atleti.map(a => a.id));
          setBudget(data.budget);
          const perCat = {};
          data.atleti.forEach(a => {
            perCat[a.categoria] = (perCat[a.categoria] || 0) + 1;
          });
          setAtletiPerCategoria(perCat);
        }
      });
  }, []);

  const acquista = async (id) => {
    const res = await fetch(`${API}/squadra/acquista/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
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

  const ordineCategorie = ["Ragazzi Maschi", "Ragazze Femminile", "Allievi Maschi", "Allieve Femminile", "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"];
  const categorie = ordineCategorie
    .filter(c => atleti.some(a => a.categoria === c))
    .sort((a, b) => {
      const pienaA = (atletiPerCategoria[a] || 0) >= 2 ? 1 : 0;
      const pienaB = (atletiPerCategoria[b] || 0) >= 2 ? 1 : 0;
      return pienaA - pienaB;
    });
  
  const isDisponibile = (a) => {
    const categoriapiena = (atletiPerCategoria[a.categoria] || 0) >= 2;
    const troppoCostate = a.prezzo > budget;
    return squadra.includes(a.id) || (!categoriapiena && !troppoCostate);
  };

  const atletiFiltrati = atleti
    .filter(a => filtro ? a.categoria === filtro : true)
    .filter(a => ricerca ? a.name.toLowerCase().includes(ricerca.toLowerCase()) : true)
    .sort((a, b) => {
      // Prima gli disponibili, poi gli sbiaditi
      const dispA = isDisponibile(a) ? 0 : 1;
      const dispB = isDisponibile(b) ? 0 : 1;
      if (dispA !== dispB) return dispA - dispB;
      if (ordinePrezzo === "alto") return b.prezzo - a.prezzo;
      if (ordinePrezzo === "basso") return a.prezzo - b.prezzo;
      return 0;
    });
  return (
   <div>
    {messaggio && <div className="msg-box">{messaggio}</div>}
    
    {piuAcquistati.length > 0 && (
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: piuAcquistatiAperto ? "#1a2235" : theme.bgCard }}
          onClick={() => setPiuAcquistatiAperto(!piuAcquistatiAperto)}
        >
          <span style={{ fontWeight: 600, fontSize: 15 }}>🔥 Atleti più acquistati</span>
          <span style={{ color: theme.textMuted }}>{piuAcquistatiAperto ? "▲" : "▼"}</span>
        </div>
        {piuAcquistatiAperto && (
        <table className="table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20 }}>#</th>
              <th>Nome</th>
              <th>Squadre</th>
            </tr>
          </thead>
          <tbody>
            {piuAcquistati.map((a, i) => (
              <tr key={a.id}>
                <td style={{ paddingLeft: 20, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: i === 0 ? theme.yellow : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : theme.textMuted }}>{i + 1}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>{a.categoria}</div>
                </td>
                <td style={{ color: theme.accent, fontWeight: 700 }}>{a.in_squadre}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    )}
    {plusvalenze.length > 0 && (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div
                      style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      onClick={() => setPlusvalenzeAperto(!plusvalenzeAperto)}
                  >
                      <span style={{ fontWeight: 600, fontSize: 15 }}>🚀 Migliori Plusvalenze</span>
                      <span style={{ color: theme.textMuted }}>{plusvalenzeAperto ? "▲" : "▼"}</span>
                  </div>
                  {plusvalenzeAperto && (
                      <table className="table">
                          <thead>
                              <tr>
                                  <th style={{ paddingLeft: 20 }}>#</th>
                                  <th>Nome</th>
                                  <th>Valore</th>
                              </tr>
                          </thead>
                          <tbody>
                              {plusvalenze.map((a, i) => (
                                  <tr key={a.id}>
                                      <td style={{ paddingLeft: 20, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: theme.accent }}>{i + 1}</td>
                                      <td>
                                          <div style={{ fontWeight: 600 }}>{a.name}</div>
                                          <div style={{ fontSize: 11, color: theme.textMuted }}>{a.categoria}</div>
                                      </td>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="card-title" style={{ marginBottom: 0 }}>🛒 Mercato Atleti</div>
        <div className="stat-box">
          <span className="stat-label">Budget rimasto</span>
          <span className="stat-value">{budget}</span>
          <span style={{ fontSize: 11, color: theme.textMuted }}>crediti</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>

        <input
          className="input"
          style={{ marginBottom: 0, flex: 1, minWidth: 200 }}
          placeholder="🔍 Cerca atleta..."
          value={ricerca}
          onChange={e => setRicerca(e.target.value)}
        />

        <select
          className="select"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        >
          <option value="">Tutte le categorie</option>
          {categorie.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          className="select"
          value={ordinePrezzo}
          onChange={e => setOrdinePrezzo(e.target.value)}
        >
          <option value="">Prezzo</option>
          <option value="alto">💰 Più costosi</option>
          <option value="basso">💸 Meno costosi</option>
        </select>

      </div>
    </div>

      {categorie.map(cat => {
        const atletiCategoria = atletiFiltrati.filter(a => a.categoria === cat);
        if (atletiCategoria.length === 0) return null;
        const categoriaDisponibile = (atletiPerCategoria[cat] || 0) < 2;
        return (
          <div key={cat} className="card" style={{ padding: 0, overflow: "hidden", opacity: categoriaDisponibile ? 1 : 0.4 }}>
            <div
              style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: categoriaAperta === cat ? "#1a2235" : theme.bgCard }}
              onClick={() => setCategoriaAperta(categoriaAperta === cat ? null : cat)}
            >
              <span style={{ fontWeight: 600, fontSize: 15 }}>{cat}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="badge badge-blue">{atletiCategoria.length} atleti</span>
                <span style={{ color: theme.textMuted }}>{categoriaAperta === cat ? "▲" : "▼"}</span>
              </div>
            </div>
            {categoriaAperta === cat && (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 20 }}>Nome</th>
                    <th>Prezzo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {atletiCategoria.map(a => {
                    const bloccato = ["Ragazzi Maschi", "Ragazze Femminile"].includes(a.categoria) && !squadra.includes(a.id);
                    const sbiadito = !isDisponibile(a) || bloccato;
                    return (
              <>
                <tr key={a.id} style={{ opacity: sbiadito ? 0.4 : 1 }}>
                  <td style={{ paddingLeft: 20 }}>
                    <div style={{ fontWeight: 600 }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: theme.textMuted }}>{a.categoria}</div>
                  </td>
                  <td style={{ color: theme.accent, fontWeight: 700 }}>{a.prezzo}cr</td>
                  <td style={{ paddingRight: 16 }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                      <button className="btn btn-blue" style={{ padding: "5px 8px", fontSize: 11 }} onClick={() => apriDettagli(a.id)}>
                        {atletaAperto === a.id ? "▲" : "📊"}
                      </button>
                      {squadra.includes(a.id)
                          ? <span style={{ color: theme.green, fontSize: 12, fontWeight: 600 }}>✓</span>
                          : bloccato
                          ? <span style={{ fontSize: 16 }}>🔒</span>
                          : <button className="btn btn-success" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => acquista(a.id)}>Acquista</button>
                      }
                    </div>
                  </td>
                </tr>
                {atletaAperto === a.id && atletaDettagli && (
                  <tr key={`det-${a.id}`}>
                    <td colSpan={5} style={{ padding: "12px 20px", background: "#0d1526" }}>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Punti per evento</div>
                          {atletaDettagli.eventi.length === 0
                            ? <span style={{ color: theme.textMuted, fontSize: 12 }}>Nessun evento</span>
                            : atletaDettagli.eventi.map(e => (
                              <div key={e.evento} style={{ fontSize: 12, color: theme.textSub, marginBottom: 3 }}>
                                <span style={{ color: theme.blue, fontWeight: 600 }}>{e.punti} pt</span> — {e.evento}
                              </div>
                            ))
                          }
                        </div>
                        <div className="stat-box">
                          <span className="stat-label">Acquistato da</span>
                          <span className="stat-value" style={{ fontSize: "1.2rem" }}>{atletaDettagli.in_squadre} squadre</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-label">Gare disputate</span>
                          <span className="stat-value" style={{ fontSize: "1.2rem" }}>{atletaDettagli.gare}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Classifica({ username, token }) {
  const [classifica, setClassifica] = useState([]);
  const [eventi, setEventi] = useState([]);
  const [eventoSelezionato, setEventoSelezionato] = useState("");
  const [loading, setLoading] = useState(true);
  const [archivioAperto, setArchivioAperto] = useState(false);
  const [squadraAperta, setSquadraAperta] = useState(null);
  const [ricerca, setRicerca] = useState("");
  const EVENTO_PRINCIPALE = "Campionati Italiani Pista 2026";

  const caricaEventi = async () => {
    const res = await fetch(`${API}/classifica/eventi`);
    if (res.ok) setEventi(await res.json());
  };

  const caricaClassifica = async (evento) => {
    setLoading(true);
    const url = evento ? `${API}/classifica/?evento=${encodeURIComponent(evento)}` : `${API}/classifica/`;
    const res = await fetch(url);
    if (res.ok) setClassifica(await res.json());
    setLoading(false);
  };

  useState(() => {
    caricaEventi();
    caricaClassifica(EVENTO_PRINCIPALE);
    setEventoSelezionato(EVENTO_PRINCIPALE);
  }, []);

  const rankEmoji = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
  const rankColor = (i) => i === 0 ? theme.yellow : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : theme.textSub;
  const eventiArchivio = eventi.filter(e => e !== EVENTO_PRINCIPALE);

  return (
    <div>
      {/* HEADER EVENTO PRINCIPALE */}
      <div className="card" style={{ background: "linear-gradient(135deg, #1a1f35, #111827)", border: `1px solid ${theme.accent}30` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: theme.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Evento in corso</div>
            <div className="card-title" style={{ marginBottom: 0 }}>🏆 {EVENTO_PRINCIPALE}</div>
          </div>
          {eventiArchivio.length > 0 && (
            <button
              className="btn btn-blue"
              style={{ fontSize: 12, padding: "6px 12px" }}
              onClick={() => setArchivioAperto(!archivioAperto)}
            >
              📂 {archivioAperto ? "Chiudi archivio" : "Archivio gare"}
            </button>
          )}
        </div>

        {/* ARCHIVIO */}
        {archivioAperto && (
          <div style={{ marginTop: 16, borderTop: `1px solid ${theme.border}`, paddingTop: 16 }}>
            <div style={{ fontSize: 11, color: theme.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Gare precedenti</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className={`btn ${eventoSelezionato === EVENTO_PRINCIPALE ? "btn-primary" : "btn-blue"}`}
                style={{ fontSize: 12, padding: "5px 12px" }}
                onClick={() => { setEventoSelezionato(EVENTO_PRINCIPALE); caricaClassifica(EVENTO_PRINCIPALE); setArchivioAperto(false); }}
              >
                🏆 {EVENTO_PRINCIPALE}
              </button>
              {eventiArchivio.map(e => (
                <button
                  key={e}
                  className={`btn ${eventoSelezionato === e ? "btn-primary" : "btn-blue"}`}
                  style={{ fontSize: 12, padding: "5px 12px" }}
                  onClick={() => { setEventoSelezionato(e); caricaClassifica(e); setArchivioAperto(false); }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TITOLO CLASSIFICA ATTIVA */}
      {eventoSelezionato !== EVENTO_PRINCIPALE && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 4px", marginBottom: 4 }}>
          <span style={{ color: theme.textMuted, fontSize: 13 }}>📂 {eventoSelezionato || "Generale"}</span>
          <button className="btn btn-blue" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => { setEventoSelezionato(EVENTO_PRINCIPALE); caricaClassifica(EVENTO_PRINCIPALE); }}>
            ← Torna ai Campionati
          </button>
        </div>
      )}

      {/* RICERCA */}
      <div className="card">
        <input
          className="input"
          style={{ marginBottom: 0 }}
          placeholder="🔍 Cerca squadra o utente..."
          value={ricerca}
          onChange={e => setRicerca(e.target.value)}
        />
      </div>

      {/* CLASSIFICA */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading
          ? <p style={{ textAlign: "center", color: theme.textMuted, padding: 24 }}>⏳ Caricamento...</p>
          : classifica.length === 0
            ? <p style={{ textAlign: "center", color: theme.textMuted, padding: 24 }}>Nessuna squadra completa in classifica</p>
            : classifica
              .filter(u => ricerca ? u.squadra.toLowerCase().includes(ricerca.toLowerCase()) || u.username.toLowerCase().includes(ricerca.toLowerCase()) : true)
              .map((u, i) => (
              <div key={u.username}>
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                    borderBottom: squadraAperta === u.username ? "none" : `1px solid ${theme.border}22`,
                    background: u.username === username ? "#f9731610" : "",
                    borderLeft: u.username === username ? `3px solid ${theme.accent}` : "3px solid transparent",
                    cursor: "pointer"
                  }}
                  onClick={() => setSquadraAperta(squadraAperta === u.username ? null : u.username)}
                >
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: rankColor(i), minWidth: 28 }}>
                    {rankEmoji(i) || i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>
                      {u.squadra}
                      {u.username === username && <span className="badge badge-orange" style={{ marginLeft: 8 }}>Tu</span>}
                      {u.is_new === 1 && <span className="badge badge-blue" style={{ marginLeft: 6, fontSize: 10 }}>NEW</span>}
                    </div>
                    <div style={{ fontSize: 11, color: theme.textMuted }}>@{u.username} {squadraAperta === u.username ? "▲" : "▼"}</div>
                  </div>
                  <span style={{ color: theme.accent, fontWeight: 700, fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem" }}>{u.punti}</span>
                </div>
                {squadraAperta === u.username && (
                  <div style={{ padding: "12px 16px", background: "#0d1526", borderBottom: `1px solid ${theme.border}22` }}>
                    <AtletiSquadra token={token} username={u.username} evento={eventoSelezionato} />
                  </div>
                )}
              </div>
            ))
        }
      </div>
    </div>
  );
}


function Regolamento() {
  return (
    <div>
      <div className="card">
        <div className="card-title">📋 Regolamento FantaRoller</div>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.6 }}>
          Scegli i tuoi atleti, costruisci la squadra perfetta e sfida gli altri appassionati di pattinaggio corsa!
        </p>
      </div>

      <div className="card">
        <div className="card-title">🏗️ Formazione</div>
        <p style={{ color: theme.textSub, fontSize: 13, marginBottom: 14 }}>Ogni squadra è composta da <strong style={{ color: theme.accent }}>16 atleti</strong>, 2 per categoria:</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {["Ragazzi Maschi", "Ragazze Femminile", "Allievi Maschi", "Allieve Femminile", "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"].map(c => (
            <div key={c} style={{ background: "#0d1526", border: "1px solid #1E2D45", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: theme.textSub }}>
              <span style={{ color: theme.blue }}>×2</span> {c}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">💰 Budget</div>
        <p style={{ color: theme.textSub, fontSize: 14 }}>Ogni utente ha <strong style={{ color: theme.accent }}>200 crediti</strong> per costruire la propria squadra.</p>
      </div>

      <div className="card">
        <div className="card-title">🏆 Punteggi per Posizione</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["1°", 100], ["2°", 85], ["3°", 75], ["4°", 65], ["5°", 55], ["6°", 50], ["7°", 45], ["8°", 40], ["9°", 35], ["10°", 30], ["11°-20°", 20], ["21°+", 5]].map(([pos, pts]) => (
            <div key={pos} style={{ background: "#0d1526", border: "1px solid #1E2D45", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: theme.textSub, fontSize: 13, fontWeight: 600 }}>{pos}</span>
              <span style={{ color: theme.accent, fontWeight: 700, fontSize: 15 }}>{pts}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">✖️ Moltiplicatori Gara</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[["Gara sprint", "×1.2"], ["Gara di fondo", "×1.2"]].map(([tipo, molt]) => (
            <div key={tipo} style={{ background: "#0d1526", border: "1px solid #1E2D45", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: theme.textSub, fontSize: 13 }}>{tipo}</span>
              <span style={{ color: theme.blue, fontWeight: 700 }}>{molt}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">⚠️ Malus Sanzioni</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: "#0d1526", border: "1px solid #1E2D45", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: theme.textSub, fontSize: 13 }}>Ammonizione</span>
            <span style={{ color: theme.yellow, fontWeight: 700, fontSize: 15 }}>-10</span>
          </div>
          <div style={{ background: "#0d1526", border: "1px solid #1E2D45", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: theme.textSub, fontSize: 13 }}>Diffida</span>
            <span style={{ color: theme.accent, fontWeight: 700, fontSize: 15 }}>-20</span>
          </div>
          <div style={{ background: "#0d1526", border: "1px solid #1E2D45", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: theme.textSub, fontSize: 13 }}>Espulsione</span>
            <span style={{ color: theme.red, fontWeight: 700, fontSize: 15 }}>-50</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Admin({ token }) {
  const [messaggio, setMessaggio] = useState("");
  const [mercatoAperto, setMercatoAperto] = useState(null);
  const [gare, setGare] = useState([]);
  const [gareSelezionate, setGareSelezionate] = useState([]);
  const [nuovaUrl, setNuovaUrl] = useState("");
  const [nuovaCategoria, setNuovaCategoria] = useState("Junior Maschi");
  const [nuovoMoltiplicatore, setNuovoMoltiplicatore] = useState("1.2");
  const [nuovoEvento, setNuovoEvento] = useState("");
  const [urlIndex, setUrlIndex] = useState("");
  const [nomeEventoIndex, setNomeEventoIndex] = useState("");
  const [stats, setStats] = useState(null);
  const [listaAperta, setListaAperta] = useState(false);
  const [eventoCalcolo, setEventoCalcolo] = useState("");
  const [eventiAperti, setEventiAperti] = useState({});
  const [usernameBonus, setUsernameBonus] = useState("");

useState(() => {
  fetch(`${API}/admin/statistiche`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.json()).then(setStats);
}, []);


  const categorie = ["Ragazzi Maschi", "Ragazze Femminile", "Allievi Maschi", "Allieve Femminile", "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"];

  const caricaGare = async () => {
    const res = await fetch(`${API}/admin/gare`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setGare(await res.json());
  };

  useState(() => {
    fetch(`${API}/admin/stato-mercato`).then(r => r.json()).then(data => setMercatoAperto(data.mercato_aperto));
    caricaGare();
  }, []);

  const apriMercato = async () => {
    const res = await fetch(`${API}/admin/apri-mercato`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); setMessaggio(data.message); setMercatoAperto(true);
  };

  const chiudiMercato = async () => {
    const res = await fetch(`${API}/admin/chiudi-mercato`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); setMessaggio(data.message); setMercatoAperto(false);
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
    setMessaggio("⏳ Importazione in corso...");
    const res = await fetch(`${API}/admin/importa-evento?url_index=${encodeURIComponent(urlIndex)}&evento=${encodeURIComponent(nomeEventoIndex)}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); setMessaggio(data.message); setUrlIndex(""); setNomeEventoIndex(""); caricaGare();
  };

  const assegnaBonus = async () => {
    if (!usernameBonus.trim()) return;
    const res = await fetch(`${API}/admin/assegna-bonus-new?username=${encodeURIComponent(usernameBonus)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    setUsernameBonus("");
  };

  const calcolaPunti = async () => {
    setMessaggio("⏳ Calcolo punti in corso...");
    const url = eventoCalcolo ? `${API}/admin/calcola-punti?evento=${encodeURIComponent(eventoCalcolo)}` : `${API}/admin/calcola-punti`;
    const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); setMessaggio(data.message);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">🔧 Pannello Admin</div>
        {messaggio && <div className="msg-box">{messaggio}</div>}
        <div className="card">
          <div className="card-title">🆕 Assegna Bonus Nuovo Utente</div>
          <p style={{ color: theme.textSub, fontSize: 13, marginBottom: 12 }}>
            Assegna 358 punti bonus e budget corretto a chi entra in corsa d'opera.
          </p>
          <input
            className="input"
            placeholder="Username utente"
            value={usernameBonus}
            onChange={e => setUsernameBonus(e.target.value)}
          />
          <button className="btn btn-primary" onClick={assegnaBonus}>
            🆕 Assegna Bonus
          </button>
        </div>
        {stats && (
          <div className="card">
            <div className="card-title">📊 Statistiche</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div className="stat-box">
                <span className="stat-label">Utenti registrati</span>
                <span className="stat-value">{stats.utenti_registrati}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Con squadra</span>
                <span className="stat-value">{stats.utenti_con_squadra}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Squadre complete</span>
                <span className="stat-value">{stats.squadre_complete}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Senza squadra</span>
                <span className="stat-value">{stats.utenti_senza_squadra}</span>
              </div>
            </div>
<div
              style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", marginTop: 8 }}
              onClick={() => setListaAperta(!listaAperta)}
            >
              <span style={{ color: theme.textSub, fontSize: 13, fontWeight: 600 }}>👥 Vedi iscritti</span>
              <span style={{ color: theme.textMuted }}>{listaAperta ? "▲" : "▼"}</span>
            </div>
            {listaAperta && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Squadra</th>
                    <th>Atleti</th>
                    <th>Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lista.map(u => (
                    <tr key={u.username}>
                      <td style={{ fontWeight: 600 }}>{u.username}</td>
                      <td style={{ color: theme.textSub }}>{u.nome_squadra || "—"}</td>
                      <td style={{ textAlign: "center" }}>{u.n_atleti}/16</td>
                      <td>
                        <span className={`badge ${u.completa ? "badge-green" : u.ha_squadra ? "badge-orange" : "badge-red"}`}>
                          {u.completa ? "Completa" : u.ha_squadra ? "In corso" : "Nessuna"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}


        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: theme.textSub }}>Mercato:</span>
            <span className={`badge ${mercatoAperto ? "badge-green" : "badge-red"}`}>{mercatoAperto ? "🟢 Aperto" : "🔴 Chiuso"}</span>
          </div>
          <button className="btn btn-success" onClick={apriMercato}>Apri Mercato</button>
          <button className="btn btn-danger" onClick={chiudiMercato}>Chiudi Mercato</button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🔗 Importa Evento da Index</div>
        <input className="input" placeholder="URL index evento (es. .../index.htm)" value={urlIndex} onChange={e => setUrlIndex(e.target.value)} />
        <input className="input" placeholder="Nome evento (es. Campionati Italiani 2026)" value={nomeEventoIndex} onChange={e => setNomeEventoIndex(e.target.value)} />
        <button className="btn btn-purple" onClick={importaEvento}>🔗 Importa tutte le gare</button>
      </div>

      <div className="card">
        <div className="card-title">➕ Aggiungi Gara Singola</div>
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
          <div className="card-title" style={{ marginBottom: 0 }}>📋 Gare inserite ({gare.length})</div>
          {gareSelezionate.length > 0 && (
            <button className="btn btn-danger" onClick={eliminaSelezionate}>🗑️ Elimina ({gareSelezionate.length})</button>
          )}
        </div>
        {gare.length === 0 ? <p style={{ color: theme.textMuted, fontSize: 14 }}>Nessuna gara inserita</p> : (
          <>
            {[...new Set(gare.map(g => g.evento))].map(evento => (
              <div key={evento} style={{ marginBottom: 12 }}>
                <div
                  style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0d1526", borderRadius: 8, marginBottom: 6 }}
                  onClick={() => setEventiAperti(prev => ({ ...prev, [evento]: !prev[evento] }))}
                >
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{evento}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="badge badge-blue">{gare.filter(g => g.evento === evento).length} gare</span>
                    <span style={{ color: theme.textMuted }}>{eventiAperti[evento] ? "▲" : "▼"}</span>
                  </div>
                </div>
                {eventiAperti[evento] && (
                  <table className="table">
                    <thead><tr><th style={{ width: 40 }}>✓</th><th>Categoria</th><th>Molt.</th><th></th></tr></thead>
                    <tbody>
                      {gare.filter(g => g.evento === evento).map(g => (
                        <tr key={g.id} style={{ background: gareSelezionate.includes(g.id) ? "#f9731610" : "" }}>
                          <td>
                            <input type="checkbox" checked={gareSelezionate.includes(g.id)} onChange={e => {
                              if (e.target.checked) setGareSelezionate([...gareSelezionate, g.id]);
                              else setGareSelezionate(gareSelezionate.filter(id => id !== g.id));
                            }} />
                          </td>
                          <td><span className="badge badge-blue">{g.categoria}</span></td>
                          <td><span className="badge badge-orange">×{g.moltiplicatore}</span></td>
                          <td><button className="btn btn-danger" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => eliminaGara(g.id)}>Elimina</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      <div className="card">
        <div className="card-title">🔄 Aggiorna Punti</div>
        <p style={{ color: theme.textSub, fontSize: 13, marginBottom: 14 }}>Seleziona un campionato specifico o calcola tutto.</p>
        <select className="select" style={{ marginBottom: 12, width: "100%" }} value={eventoCalcolo} onChange={e => setEventoCalcolo(e.target.value)}>
          <option value="">🌍 Tutti i campionati</option>
          {[...new Set(gare.map(g => g.evento))].map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <button className="btn" style={{ background: "linear-gradient(135deg, #f97316, #ef4444)", color: "white", padding: "12px 24px", fontSize: 14 }} onClick={calcolaPunti}>
          🔄 {eventoCalcolo ? `Calcola ${eventoCalcolo}` : "Calcola Tutti"}
        </button>
      </div>
    </div>
  );
}

function SquadreLega({ token }) {
  const [squadre, setSquadre] = useState([]);
  const [errore, setErrore] = useState("");
  const [aperta, setAperta] = useState(null);

  useState(() => {
    fetch(`${API}/league/squadre`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error("mercato aperto");
        return r.json();
      })
      .then(setSquadre)
      .catch(() => setErrore("Le squadre saranno visibili quando il mercato chiuderà"));
  }, []);

  if (errore) return (
    <div className="card">
      <div className="card-title">👥 Squadre della Lega</div>
      <p style={{ color: theme.textMuted }}>{errore}</p>
    </div>
  );

  if (squadre.length === 0) return null;

  return (
    <div>
      <div className="card">
        <div className="card-title">👥 Squadre della Lega</div>
        <p style={{ color: theme.textSub, fontSize: 13 }}>Il mercato è chiuso — puoi vedere le squadre di tutti!</p>
      </div>
      {squadre.map(s => (
        <div key={s.username} className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            onClick={() => setAperta(aperta === s.username ? null : s.username)}
          >
            <div>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{s.squadra}</span>
              <span style={{ color: theme.textMuted, fontSize: 12, marginLeft: 10 }}>di {s.username}</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="badge badge-blue">{s.atleti.length} atleti</span>
              <span style={{ color: theme.textMuted }}>{aperta === s.username ? "▲" : "▼"}</span>
            </div>
          </div>
          {aperta === s.username && (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Nome</th>
                  <th>Categoria</th>
                  <th>Prezzo</th>
                </tr>
              </thead>
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

function AtletiSquadra({ token, username, evento }) {
  const [atleti, setAtleti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aperto, setAperto] = useState(null);

  useState(() => {
    const url = evento
      ? `${API}/league/atleti-squadra?username=${encodeURIComponent(username)}&evento=${encodeURIComponent(evento)}`
      : `${API}/league/atleti-squadra?username=${encodeURIComponent(username)}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setAtleti(data); setLoading(false); });
  }, []);

  if (loading) return <p style={{ color: theme.textMuted, fontSize: 12 }}>⏳ Caricamento...</p>;

  return (
    <table className="table" style={{ marginBottom: 0 }}>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Categoria</th>
          <th>Punti</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {atleti.map(a => (
          <>
            <tr key={a.id}>
              <td style={{ fontWeight: 600 }}>{a.name}</td>
              <td><span className="badge badge-blue">{a.categoria}</span></td>
              <td style={{ color: theme.green, fontWeight: 700 }}>{a.punti}</td>
              <td>
                {a.gare_dettaglio && a.gare_dettaglio.length > 0 && (
                  <button className="btn btn-blue" style={{ padding: "3px 8px", fontSize: 11 }} onClick={() => setAperto(aperto === a.id ? null : a.id)}>
                    {aperto === a.id ? "▲" : "📊"}
                  </button>
                )}
              </td>
            </tr>
            {aperto === a.id && (
              <tr key={`det-${a.id}`}>
                <td colSpan={4} style={{ padding: "8px 16px", background: "#070c18" }}>
                  {a.gare_dettaglio.map(g => (
                    <div key={g.tipo} style={{ fontSize: 12, color: theme.textSub, marginBottom: 3 }}>
                      <span style={{ color: theme.blue, fontWeight: 700 }}>{g.punti} pt</span> — {g.tipo}
                    </div>
                  ))}
                </td>
              </tr>
            )}
          </>
        ))}
      </tbody>
    </table>
  );
}

function Lega({ token }) {
  const [vista, setVista] = useState("home");
  const [nomeLega, setNomeLega] = useState("");
  const [password, setPassword] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [classifica, setClassifica] = useState([]);
  const [dettagli, setDettagli] = useState(null);
  const [eventi, setEventi] = useState([]);
  const [eventoSelezionato, setEventoSelezionato] = useState("");
  const [mieLeghe, setMieLeghe] = useState([]);
  const [tutteLeghe, setTutteLeghe] = useState([]);
  const [ricerca, setRicerca] = useState("");
  const [copiato, setCopiato] = useState(false);
  const [legaEntrata, setLegaEntrata] = useState(null);
  const [messaggi, setMessaggi] = useState([]);
  const [nuovoMessaggio, setNuovoMessaggio] = useState("");
  const [squadraAperta, setSquadraAperta] = useState(null);
  const [sezioneAperta, setSezioneAperta] = useState("classifica");
  

  const caricaMieLeghe = async () => {
    const res = await fetch(`${API}/league/mie-leghe`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setMieLeghe(await res.json());
  };

  const caricaTutteLeghe = async () => {
    const res = await fetch(`${API}/league/tutte`);
    if (res.ok) setTutteLeghe(await res.json());
  };

  const apriLega = async (id) => {
    const res1 = await fetch(`${API}/league/cambia/${id}`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    if (!res1.ok) return;
    const res2 = await fetch(`${API}/league/dettagli`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res2.ok) {
      setDettagli(await res2.json());
      setVista("lega");
      caricaClassificaLega("Campionati Italiani Pista 2026");
      setEventoSelezionato("Campionati Italiani Pista 2026");
      caricaEventi();
      caricaMessaggi();
    }
  };

  const caricaEventi = async () => {
    const res = await fetch(`${API}/classifica/eventi`);
    if (res.ok) setEventi(await res.json());
  };

  const caricaClassificaLega = async (evento) => {
    const url = evento ? `${API}/league/classifica?evento=${encodeURIComponent(evento)}` : `${API}/league/classifica`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setClassifica(await res.json());
  };

  useState(() => { caricaMieLeghe(); caricaTutteLeghe(); }, []);

  const creaLega = async () => {
    const res = await fetch(`${API}/league/create?nome=${encodeURIComponent(nomeLega)}&password=${encodeURIComponent(password)}`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    if (res.ok) { setNomeLega(""); setPassword(""); caricaMieLeghe(); caricaTutteLeghe(); setVista("home"); }
  };

  const entraLega = async (nomeL) => {
    const res = await fetch(`${API}/league/join?nome=${encodeURIComponent(nomeL)}&password=${encodeURIComponent(password)}`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    if (res.ok) { setPassword(""); setLegaEntrata(null); caricaMieLeghe(); caricaTutteLeghe(); }
    else setMessaggio("❌ Password errata");
  };

  const caricaMessaggi = async () => {
    const res = await fetch(`${API}/league/messaggi`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setMessaggi(await res.json());
  };

  const inviaMessaggio = async () => {
    if (!nuovoMessaggio.trim()) return;
    const res = await fetch(`${API}/league/messaggio?testo=${encodeURIComponent(nuovoMessaggio)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setNuovoMessaggio("");
      caricaMessaggi();
    }
  };

  const copiaPassword = () => {
    navigator.clipboard.writeText(dettagli.codice);
    setCopiato(true);
    setTimeout(() => setCopiato(false), 2000);
  };

  const rankEmoji = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1;
  const rankColor = (i) => i === 0 ? theme.yellow : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : theme.textSub;

  const sonoMembro = (id) => mieLeghe.some(l => l.id === id);
  const legheFiltrate = tutteLeghe.filter(l => l.nome.toLowerCase().includes(ricerca.toLowerCase()));

  // PAGINA LEGA APERTA
  if (vista === "lega" && dettagli) return (
    <div>
      <div className="card" style={{ background: "linear-gradient(135deg, #1a1f35, #111827)", border: `1px solid ${theme.accent}30` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <button className="btn btn-danger" style={{ fontSize: 12, padding: "4px 10px", marginBottom: 8 }} onClick={() => setVista("home")}>← Torna alle leghe</button>
            <div className="card-title" style={{ marginBottom: 4 }}>🏅 {dettagli.nome}</div>
            <span style={{ color: theme.textMuted, fontSize: 13 }}>Creata da <strong style={{ color: theme.textSub }}>{dettagli.owner}</strong> · {dettagli.partecipanti.length} partecipanti</span>
          </div>
          {dettagli.codice && (
            <button className="btn btn-blue" onClick={copiaPassword}>
              {copiato ? "✅ Copiato!" : "🔑 Copia Password"}
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { id: "classifica", label: "🏆 Classifica" },
            { id: "chat", label: "💬 Chat" },
            { id: "utenti", label: "👥 Utenti" },
            { id: "squadre", label: "👕 Squadre" },
          ].map(s => (
            <button
              key={s.id}
              className={`nav-btn ${sezioneAperta === s.id ? "active" : ""}`}
              onClick={() => setSezioneAperta(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {sezioneAperta === "classifica" && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>🏆 Classifica</div>
            <select className="select" value={eventoSelezionato} onChange={e => { setEventoSelezionato(e.target.value); caricaClassificaLega(e.target.value); }}>
              <option value="">🌍 Generale</option>
              <option value="Campionati Italiani Pista 2026" style={{ fontWeight: 700 }}>🏆 Campionati Italiani Pista 2026</option>
              {eventi.filter(e => e !== "Campionati Italiani Pista 2026").map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <table className="table">
            <thead><tr><th style={{ width: 60 }}>#</th><th>Utente</th><th>Squadra</th><th>Punti</th></tr></thead>
            <tbody>
              {classifica.length === 0
                ? <tr><td colSpan={4} style={{ textAlign: "center", color: theme.textMuted, padding: 24 }}>Nessuna squadra completa</td></tr>
                : classifica.map((u, i) => (
                  <React.Fragment key={u.username}>
                    <tr style={{ cursor: "pointer" }} onClick={() => setSquadraAperta(squadraAperta === u.username ? null : u.username)}>
                      <td style={{ paddingLeft: 12 }}><span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: rankColor(i) }}>{rankEmoji(i)}</span></td>
                      <td style={{ fontWeight: 600 }}>{u.username}</td>
                      <td style={{ color: theme.textSub }}>{u.squadra} {squadraAperta === u.username ? "▲" : "▼"}</td>
                      <td style={{ color: theme.accent, fontWeight: 700, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem" }}>{u.punti}</td>
                    </tr>
                    {squadraAperta === u.username && (
                      <tr>
                        <td colSpan={4} style={{ padding: "12px 20px", background: "#0d1526" }}>
                          <AtletiSquadra token={token} username={u.username} evento={eventoSelezionato} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {sezioneAperta === "chat" && (
        <div className="card">
          <div className="card-title">💬 Chat Lega</div>
          <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
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
            <input
              className="input"
              style={{ marginBottom: 0, flex: 1 }}
              placeholder="Scrivi un messaggio..."
              value={nuovoMessaggio}
              onChange={e => setNuovoMessaggio(e.target.value)}
              onKeyDown={e => e.key === "Enter" && inviaMessaggio()}
            />
            <button className="btn btn-primary" onClick={inviaMessaggio}>Invia</button>
          </div>
        </div>
      )}

      {sezioneAperta === "utenti" && (
        <div className="card">
          <div className="card-title">👥 Partecipanti</div>
          <table className="table">
            <thead><tr><th>Utente</th><th>Squadra</th><th>Atleti</th></tr></thead>
            <tbody>
              {dettagli.partecipanti.map(p => (
                <tr key={p.username}>
                  <td style={{ fontWeight: 600 }}>
                    {p.username}
                    {p.is_owner && <span className="badge badge-orange" style={{ marginLeft: 8 }}>Admin</span>}
                  </td>
                  <td style={{ color: theme.textSub }}>{p.squadra || "—"}</td>
                  <td><span className={`badge ${p.n_atleti === 16 ? "badge-green" : "badge-orange"}`}>{p.n_atleti}/16</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sezioneAperta === "squadre" && (
        <SquadreLega token={token} />
      )}
    </div>
  );

  // HOME LEGHE
  return (
    <div>
      {messaggio && <div className="msg-box">{messaggio}</div>}

      <div className="card">
        <div className="card-title">🏅 Le Leghe</div>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
          Le leghe ti permettono di sfidare i tuoi amici in una classifica privata! 
          Crea una lega, condividi la password con chi vuoi e segui la classifica solo tra di voi. 
          Puoi partecipare a più leghe contemporaneamente.
        </p>
        <button className="btn btn-primary" onClick={() => setVista(vista === "crea" ? "home" : "crea")}>➕ Crea Lega</button>
        {vista === "crea" && (
          <div style={{ marginTop: 16 }}>
            <input className="input" placeholder="Nome lega" value={nomeLega} onChange={e => setNomeLega(e.target.value)} />
            <input className="input" placeholder="Password lega" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            {messaggio && <div className="msg-box">{messaggio}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={creaLega}>Crea</button>
              <button className="btn btn-danger" onClick={() => { setVista("home"); setMessaggio(""); }}>Annulla</button>
            </div>
          </div>
        )}
      </div>

      {mieLeghe.length > 0 && (
        <div className="card">
          <div className="card-title">🏅 Le tue Leghe</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mieLeghe.map(l => (
              <div key={l.id} style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>🏅 {l.nome}</span>
                <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => apriLega(l.id)}>Apri →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">🔍 Tutte le Leghe</div>
        <input
          className="input"
          placeholder="Cerca lega..."
          value={ricerca}
          onChange={e => setRicerca(e.target.value)}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {legheFiltrate.length === 0
            ? <p style={{ color: theme.textMuted, fontSize: 13 }}>Nessuna lega trovata</p>
            : legheFiltrate.map(l => (
              <div key={l.id} style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14, color: theme.white }}>🔒 {l.nome}</span>
                    <span style={{ color: theme.textMuted, fontSize: 12, marginLeft: 10 }}>{l.membri} membri</span>
                  </div>
                  {sonoMembro(l.id)
                    ? <button className="btn btn-success" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => apriLega(l.id)}>Apri →</button>
                    : <button className="btn btn-blue" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setLegaEntrata(legaEntrata === l.id ? null : l.id)}>
                        {legaEntrata === l.id ? "Annulla" : "🔑 Entra"}
                      </button>
                  }
                </div>
                {legaEntrata === l.id && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <input
                      className="input"
                      style={{ marginBottom: 0, flex: 1 }}
                      placeholder="Password lega"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={() => entraLega(l.nome)}>Entra</button>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}


function Gare({ token }) {
  const [eventi, setEventi] = useState([]);
  const [eventoSelezionato, setEventoSelezionato] = useState("");
  const [risultati, setRisultati] = useState({});
  const [categoriaAperta, setCategoriaAperta] = useState(null);
  const [loading, setLoading] = useState(false);


  useState(() => {
    fetch(`${API}/gare/eventi`)
      .then(r => r.json())
      .then(setEventi);
  }, []);

const caricaRisultati = async (evento) => {
  setEventoSelezionato(evento);
  setCategoriaAperta(null);
  setLoading(true);
  if (!evento) { setRisultati({}); setLoading(false); return; }
  const res = await fetch(`${API}/gare/risultati?evento=${encodeURIComponent(evento)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) setRisultati(await res.json());
  setLoading(false);
};


  const ordineCategorie = [
    "Ragazzi Maschi", "Ragazze Femminile",
    "Allievi Maschi", "Allieve Femminile",
    "Junior Maschi", "Junior Femminile",
    "Senior Maschi", "Senior Femminile"
  ];

  const categorieOrdinati = ordineCategorie.filter(c => risultati[c]);

  return (
    <div>
      <div className="card">
        <div className="card-title">📅 Gare</div>
        <select className="select" value={eventoSelezionato} onChange={e => caricaRisultati(e.target.value)}>
          <option value="">Seleziona un campionato...</option>
          {eventi.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {eventoSelezionato && loading && (
        <div className="card">
          <p style={{ color: theme.textMuted }}>⏳ Caricamento...</p>
        </div>
      )}


      {categorieOrdinati.map(cat => (
        <div key={cat} className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: categoriaAperta === cat ? "#1a2235" : theme.bgCard }}
            onClick={() => setCategoriaAperta(categoriaAperta === cat ? null : cat)}
          >
            <span style={{ fontWeight: 600, fontSize: 15 }}>{cat}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="badge badge-blue">{risultati[cat].length} atleti</span>
              <span style={{ color: theme.textMuted }}>{categoriaAperta === cat ? "▲" : "▼"}</span>
            </div>
          </div>

          {categoriaAperta === cat && (
            <div style={{ padding: "8px 12px" }}>
              {risultati[cat].map((a, i) => (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", marginBottom: 4, borderRadius: 8,
                  background: a.in_squadra ? "#f9731615" : "#0d1526",
                  borderLeft: a.in_squadra ? `3px solid ${theme.accent}` : `3px solid transparent`
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <span style={{ color: theme.textMuted, fontSize: 12, minWidth: 24 }}>{i + 1}</span>
                    <span style={{ fontWeight: a.in_squadra ? 700 : 400, fontSize: 13, color: theme.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.name}
                    </span>
                    {a.in_squadra && <span className="badge badge-orange" style={{ flexShrink: 0 }}>⭐</span>}
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
        <div className="card-title">🔒 Privacy & Dati</div>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.8 }}>
          FantaRoller utilizza esclusivamente dati pubblicamente disponibili sul sito ufficiale della 
          Federazione Italiana Sport Rotellistici (FISR) all'indirizzo <span style={{ color: theme.blue }}>attivita.rollergames.it</span>.
        </p>
      </div>
      <div className="card">
        <div className="card-title">📋 Informazioni sugli Atleti</div>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>
          I nomi, i risultati e le classifiche degli atleti presenti su FantaRoller sono 
          già pubblicamente accessibili online attraverso i comunicati ufficiali FISR. 
          Nessun dato privato viene raccolto o pubblicato.
        </p>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.8 }}>
          Per richiedere la rimozione dei propri dati contattare l'amministratore del sito.
        </p>
      </div>
      <div className="card">
        <div className="card-title">👤 Dati degli Utenti</div>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.8 }}>
          FantaRoller raccoglie solo username e password (cifrata) per il login. 
          Nessuna informazione personale aggiuntiva viene richiesta o memorizzata.
        </p>
      </div>
    </div>
  );
}

function SquadrePubbliche() {
  const [squadre, setSquadre] = useState([]);
  const [errore, setErrore] = useState("");
  const [aperta, setAperta] = useState(null);

  useState(() => {
    fetch(`${API}/squadre/pubbliche`)
      .then(r => {
        if (!r.ok) throw new Error("mercato aperto");
        return r.json();
      })
      .then(setSquadre)
      .catch(() => setErrore("Le squadre saranno visibili quando il mercato chiuderà"));
  }, []);

  if (errore) return (
    <div className="card">
      <div className="card-title">👥 Squadre</div>
      <p style={{ color: theme.textMuted }}>{errore}</p>
    </div>
  );

  return (
    <div>
      <div className="card">
        <div className="card-title">👥 Squadre dei Partecipanti</div>
        <p style={{ color: theme.textSub, fontSize: 13 }}>Il mercato è chiuso — puoi vedere le squadre di tutti!</p>
      </div>
      {squadre.map(s => (
        <div key={s.username} className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            onClick={() => setAperta(aperta === s.username ? null : s.username)}
          >
            <div>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{s.squadra}</span>
              <span style={{ color: theme.textMuted, fontSize: 12, marginLeft: 10 }}>di {s.username}</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="badge badge-blue">{s.atleti.length} atleti</span>
              <span style={{ color: theme.textMuted }}>{aperta === s.username ? "▲" : "▼"}</span>
            </div>
          </div>
          {aperta === s.username && (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Nome</th>
                  <th>Categoria</th>
                  <th>Prezzo</th>
                </tr>
              </thead>
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
export default App;

