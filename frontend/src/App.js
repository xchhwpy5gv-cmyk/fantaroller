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
    .app-wrapper { padding: 0 10px 30px; }
    .header { flex-direction: column; align-items: flex-start; gap: 12px; }
    .nav { width: 100%; overflow-x: auto; padding-bottom: 4px; }
    .nav-btn { white-space: nowrap; font-size: 12px; padding: 6px 10px; }
    .card { padding: 14px; }
    .card-title { font-size: 1.1rem; }
    .table th, .table td { padding: 8px; font-size: 12px; }
    .login-card { margin: 16px; padding: 24px; }
    .stat-box { width: 100%; }
    .btn { font-size: 12px; padding: 8px 12px; }
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
          position: fixed; top: 0; left: 0; height: 100vh; width: 270px;
          background: ${theme.bgCard}; border-right: 1px solid ${theme.border};
          z-index: 100; padding: 24px 0; display: flex; flex-direction: column;
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
          gap: 8px; cursor: pointer; font-weight: 600; font-size: 14px;
        }
        .league-dropdown {
          position: absolute; top: 100%; left: 0; margin-top: 6px;
          background: ${theme.bgCard}; border: 1px solid ${theme.border};
          border-radius: 10px; min-width: 240px; z-index: 50;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4); overflow: hidden;
        }
        .league-dropdown-item {
          padding: 10px 14px; cursor: pointer; font-size: 13px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .league-dropdown-item:hover { background: ${theme.bgCardHover}; }
      `}</style>

      {menuAperto && <div className="drawer-overlay" onClick={() => setMenuAperto(false)} />}
      <div className={`drawer ${menuAperto ? "open" : ""}`}>
        <div className="drawer-title">⚡ Fanta<span style={{ color: theme.accent }}>Roller</span></div>

        <div className="drawer-section">Gioco</div>
        <div className={`drawer-item ${pagina === "dashboard" ? "active" : ""}`} onClick={() => vaiA("dashboard")}>🏠 Dashboard</div>
        <div className={`drawer-item ${pagina === "squadra" ? "active" : ""}`} onClick={() => vaiA("squadra")}>🏆 La mia Squadra</div>
        <div className={`drawer-item ${pagina === "mercato" ? "active" : ""}`} onClick={() => vaiA("mercato")}>🛒 Mercato</div>
        <div className={`drawer-item ${pagina === "classifica" ? "active" : ""}`} onClick={() => vaiA("classifica")}>🏅 Classifica di Lega</div>
        <div className={`drawer-item ${pagina === "squadre" ? "active" : ""}`} onClick={() => vaiA("squadre")}>👥 Squadre</div>
        <div className={`drawer-item ${pagina === "partecipanti" ? "active" : ""}`} onClick={() => vaiA("partecipanti")}>👤 Partecipanti</div>
        <div className={`drawer-item ${pagina === "chat" ? "active" : ""}`} onClick={() => vaiA("chat")}>💬 Chat Lega</div>
        <div className={`drawer-item ${pagina === "gare" ? "active" : ""}`} onClick={() => vaiA("gare")}>📅 Gare</div>

        <div className="drawer-section">Le mie Leghe</div>
        <div className={`drawer-item ${pagina === "leghe" ? "active" : ""}`} onClick={() => vaiA("leghe")}>🏟️ Gestisci Leghe</div>

        <div className="drawer-section">Info</div>
        <div className={`drawer-item ${pagina === "regolamento" ? "active" : ""}`} onClick={() => vaiA("regolamento")}>📋 Regolamento</div>
        <div className={`drawer-item ${pagina === "privacy" ? "active" : ""}`} onClick={() => vaiA("privacy")}>🔒 Privacy</div>

        {isAdmin && <>
          <div className="drawer-section">Admin</div>
          <div className={`drawer-item ${pagina === "admin" ? "active" : ""}`} onClick={() => vaiA("admin")}>🔧 Pannello Admin</div>
        </>}
        {legaAttiva && legaAttiva.is_owner && <>
          <div className="drawer-section">Admin Lega</div>
          <div className={`drawer-item ${pagina === "admin-lega" ? "active" : ""}`} onClick={() => vaiA("admin-lega")}>⚙️ Gestisci Lega</div>
        </>}

        <button className="btn btn-danger" style={{ width: "100%", fontSize: 13, margin: "12px 0", marginLeft: "auto", marginRight: "auto", maxWidth: "calc(100% - 48px)" }} onClick={() => { setToken(null); localStorage.removeItem("token"); setPagina("dashboard"); setMenuAperto(false); }}>
          Esci
        </button>
      </div>

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

          <div style={{ position: "relative" }}>
            <div className="league-selector" onClick={() => setSelettoreLegaAperto(!selettoreLegaAperto)}>
              🏅 {legaAttiva ? legaAttiva.nome : "Nessuna lega"} <span style={{ fontSize: 11 }}>▼</span>
            </div>
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
                  ➕ Crea o unisciti
                </div>
              </div>
            )}
          </div>
        </div>

        {!legaAttiva && pagina !== "leghe" && pagina !== "regolamento" && pagina !== "privacy" && pagina !== "admin" ? (
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏟️</div>
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
    setMessaggioEmail("⏳ Invio in corso...");
    try {
      const res = await fetch(`${API}/reinvia-verifica`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      setMessaggioEmail(res.ok ? "✅ Email reinviata! Controlla anche lo spam." : `❌ ${data.detail}`);
    } catch {
      setMessaggioEmail("❌ Errore di connessione");
    }
  };

  const cambiaEmail = async () => {
    if (!emailValida(nuovaEmail)) { setMessaggioEmail("❌ Inserisci un'email valida"); return; }
    setMessaggioEmail("⏳ Aggiornamento in corso...");
    try {
      const res = await fetch(`${API}/cambia-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email: nuovaEmail }),
      });
      const data = await res.json();
      setMessaggioEmail(res.ok ? "✅ Email aggiornata! Controlla la posta per confermare." : `❌ ${data.detail}`);
      if (res.ok) setNuovaEmail("");
    } catch {
      setMessaggioEmail("❌ Errore di connessione");
    }
  };

  const handleSubmit = async () => {
    if (username.length < 3) { setErrore("❌ Username troppo corto (min 3 caratteri)"); return; }
    if (username.length > 40) { setErrore("❌ Username troppo lungo (max 20 caratteri)"); return; }
    if (password.length < 4) { setErrore("❌ Password troppo corta (min 4 caratteri)"); return; }
    if (password.length > 40) { setErrore("❌ Password troppo lunga (max 30 caratteri)"); return; }
    if ((registrati || modalitaCompletaProfilo) && !emailValida(email)) {
      setErrore("❌ Inserisci un'email valida");
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
          setSuccesso("✅ Email inviata! Controlla la posta e conferma prima di rientrare.");
          setModalitaCompletaProfilo(false);
          setErrore("");
        } else {
          setErrore(`❌ ${data.detail}`);
        }
      } catch {
        setErrore("❌ Errore di connessione");
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
          setSuccesso("✅ Registrato! Controlla la tua email per confermare l'account, poi fai login.");
          setErrore("");
          setRegistrati(false);
        } else {
          setErrore(`❌ ${data.detail}`);
        }
      } else if (data.access_token) {
        setToken(data.access_token);
      } else if (data.detail === "email_mancante") {
        setModalitaCompletaProfilo(true);
        setErrore("");
        setSuccesso("");
      } else if (data.detail === "email_non_verificata") {
        setErrore("⚠️ Devi confermare la tua email prima di accedere. Controlla la posta.");
        setMostraOpzioniEmail(true);
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

          {modalitaCompletaProfilo ? (
            <div style={{ background: "#eab30815", border: "1px solid #eab30830", borderRadius: 8, padding: "10px 14px", color: theme.yellow, fontSize: 13, marginBottom: 16, textAlign: "center" }}>
              📧 Il tuo account non ha ancora un'email associata. Inseriscila per continuare.
            </div>
          ) : (
            <div style={{ background: "#38bdf815", border: "1px solid #38bdf830", borderRadius: 8, padding: "10px 14px", color: theme.blue, fontSize: 13, marginBottom: 16, textAlign: "center" }}>
              Prima volta? Clicca su <strong>"Registrati"</strong> in fondo per creare il tuo account!
            </div>
          )}

          {successo && <div className="success-box">{successo}</div>}
          {loading && <div className="success-box">⏳ Caricamento...</div>}
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
            <div className="login-toggle" onClick={() => { setModalitaCompletaProfilo(false); setErrore(""); setSuccesso(""); }}>← Torna al login</div>
          ) : (
            <div className="login-toggle" onClick={() => { setRegistrati(!registrati); setErrore(""); setSuccesso(""); }}>
              {registrati ? <>Hai già un account? <span>Login</span></> : <>Non hai un account? <span>Registrati</span></>}
            </div>
          )}

          {mostraOpzioniEmail && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${theme.border}` }}>
              {messaggioEmail && <div className="msg-box">{messaggioEmail}</div>}
              <button className="btn btn-blue" style={{ width: "100%", marginBottom: 10 }} onClick={reinviaVerifica}>📧 Reinvia email di conferma</button>
              <input className="input" placeholder="Nuova email (se hai sbagliato)" type="email" value={nuovaEmail} onChange={e => setNuovaEmail(e.target.value)} />
              <button className="btn btn-primary" style={{ width: "100%" }} onClick={cambiaEmail}>✏️ Cambia email e reinvia</button>
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
        <div className="card-title" style={{ marginBottom: 12 }}>🏆 {squadra.nome}</div>
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
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: "white", letterSpacing: 2 }}>CAMPIONE!</div>
          <div style={{ color: "white", fontSize: 14, marginTop: 8, fontWeight: 600 }}>Sei primo in {lega.nome}!</div>
        </div>
      )}

      <div className="card">
        <div className="card-title">🚀 Azioni rapide</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => vaiA("squadra")}>🏆 La mia Squadra</button>
          {lega.modalita === "listone" && <button className="btn btn-success" onClick={() => vaiA("mercato")}>🛒 Vai al Mercato</button>}
          <button className="btn btn-blue" onClick={() => vaiA("classifica")}>🏅 Classifica</button>
        </div>
      </div>
    </div>
  );
}

function CreaSquadraCard({ token, lega, onCreata }) {
  const [nomeSquadra, setNomeSquadra] = useState("");
  const [messaggio, setMessaggio] = useState("");

  const creaSquadra = async () => {
    if (nomeSquadra.length > 25) { setMessaggio("❌ Nome squadra troppo lungo (max 25 caratteri)"); return; }
    if (nomeSquadra.length < 3) { setMessaggio("❌ Nome squadra troppo corto (min 3 caratteri)"); return; }
    const res = await fetch(`${API}/squadra/crea?nome=${encodeURIComponent(nomeSquadra)}&league_id=${lega.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) onCreata();
    else setMessaggio(`❌ ${data.detail}`);
  };

  return (
    <div className="card">
      <div className="card-title">🏗️ Crea la tua squadra in "{lega.nome}"</div>
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

  const caricaSquadra = async () => {
    if (!lega) return;
    const res = await fetch(`${API}/squadra/?league_id=${lega.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { setSquadra(await res.json()); setErrore(""); }
    else if (res.status === 404) setErrore("crea");
  };

  const rinomina = async () => {
    if (nuovoNome.length > 25) { setMessaggio("❌ Nome squadra troppo lungo (max 25 caratteri)"); return; }
    if (nuovoNome.length < 3) { setMessaggio("❌ Nome squadra troppo corto (min 3 caratteri)"); return; }
    const res = await fetch(`${API}/squadra/rinomina?nome=${encodeURIComponent(nuovoNome)}&league_id=${lega.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMessaggio(data.message);
    setRinominaAperto(false);
    caricaSquadra();
  };

  const vendi = async (id) => {
    const res = await fetch(`${API}/squadra/vendi/${id}?league_id=${lega.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
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
            {squadraCompleta ? <div className="badge badge-green">✅ Squadra completa</div> : <div className="badge badge-orange">⚠️ Squadra incompleta</div>}
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
              const mancanti = atletiPerCat - atletiPerCategoria(cat);
              return mancanti > 0 ? <div key={cat} className="warning-item">• {mancanti} in {cat}</div> : null;
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">👥 Atleti ({squadra.atleti.length}/{totaleAtleti})</div>
        {squadra.atleti.length === 0
          ? <p style={{ color: theme.textMuted, fontSize: 14 }}>Nessun atleta{lega.modalita === "listone" ? " — vai al mercato!" : ""}</p>
          : <table className="table">
              <thead><tr><th>Nome</th><th>Punti</th><th>Prezzo</th><th></th></tr></thead>
              <tbody>
                {squadra.atleti.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: theme.textMuted }}>{a.categoria}</div>
                    </td>
                    <td style={{ color: theme.green, fontWeight: 700 }}>{a.punti || 0}</td>
                    <td style={{ color: theme.accent, fontWeight: 700 }}>{a.prezzo}cr</td>
                    <td><button className="btn btn-danger" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => vendi(a.id)}>Vendi</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
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
    if (!atletaId || !prezzo) { setMessaggio("❌ Seleziona atleta e prezzo"); return; }
    const res = await fetch(`${API}/squadra/aggiungi-manuale`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ league_id: lega.id, atleta_id: parseInt(atletaId), prezzo: parseInt(prezzo) }),
    });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    if (res.ok) { setAtletaId(""); setPrezzo(""); onAggiunto(); }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setAperto(!aperto)}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>➕ Aggiungi atleta (asta)</span>
        <span style={{ color: theme.textMuted }}>{aperto ? "▲" : "▼"}</span>
      </div>
      {aperto && (
        <div style={{ padding: "0 20px 20px" }}>
          {messaggio && <div className="msg-box">{messaggio}</div>}
          <input
            className="input"
            placeholder="🔍 Cerca atleta..."
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
  const [categoriaAperta, setCategoriaAperta] = useState(null);
  const [budget, setBudget] = useState(999);
  const [atletiPerCategoria, setAtletiPerCategoria] = useState({});
  const [piuAcquistati, setPiuAcquistati] = useState([]);
  const [piuAcquistatiAperto, setPiuAcquistatiAperto] = useState(false);
  const [plusvalenze, setPlusvalenze] = useState([]);
  const [plusvalenzeAperto, setPlusvalenzeAperto] = useState(false);

  const limitePerCategoria = lega ? (lega.atleti_per_categoria || 2) : 2;

  const apriDettagli = async (id) => {
    if (atletaAperto === id) { setAtletaAperto(null); return; }
    setAtletaAperto(id);
    const res = await fetch(`${API}/atleta/${id}/statistiche`);
    if (res.ok) setAtletaDettagli(await res.json());
  };

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

  const acquista = async (id) => {
    const res = await fetch(`${API}/squadra/acquista/${id}?league_id=${lega.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
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
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔨</div>
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

  return (
    <div>
      {messaggio && <div className="msg-box">{messaggio}</div>}

      {piuAcquistati.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setPiuAcquistatiAperto(!piuAcquistatiAperto)}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>🔥 Atleti più acquistati</span>
            <span style={{ color: theme.textMuted }}>{piuAcquistatiAperto ? "▲" : "▼"}</span>
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

      {plusvalenze.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setPlusvalenzeAperto(!plusvalenzeAperto)}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>🚀 Migliori Plusvalenze</span>
            <span style={{ color: theme.textMuted }}>{plusvalenzeAperto ? "▲" : "▼"}</span>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>🛒 Mercato Atleti</div>
          <div className="stat-box">
            <span className="stat-label">Budget rimasto</span>
            <span className="stat-value">{budget}</span>
            <span style={{ fontSize: 11, color: theme.textMuted }}>crediti</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input className="input" style={{ marginBottom: 0, flex: 1, minWidth: 200 }} placeholder="🔍 Cerca atleta..." value={ricerca} onChange={e => setRicerca(e.target.value)} />
          <select className="select" value={filtro} onChange={e => setFiltro(e.target.value)}>
            <option value="">Tutte le categorie</option>
            {categorie.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="select" value={ordinePrezzo} onChange={e => setOrdinePrezzo(e.target.value)}>
            <option value="">Prezzo</option>
            <option value="alto">💰 Più costosi</option>
            <option value="basso">💸 Meno costosi</option>
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
                <span style={{ color: theme.textMuted }}>{categoriaAperta === cat ? "▲" : "▼"}</span>
              </div>
            </div>
            {categoriaAperta === cat && (
              <table className="table">
                <thead><tr><th style={{ paddingLeft: 20 }}>Nome</th><th>Prezzo</th><th></th></tr></thead>
                <tbody>
                  {atletiCategoria.map(a => {
                    const bloccato = ["Ragazzi Maschi", "Ragazze Femminile"].includes(a.categoria) && !squadra.includes(a.id);
                    const sbiadito = !isDisponibile(a) || bloccato;
                    return (
                      <React.Fragment key={a.id}>
                        <tr style={{ opacity: sbiadito ? 0.4 : 1 }}>
                          <td style={{ paddingLeft: 20 }}>
                            <div style={{ fontWeight: 600 }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: theme.textMuted }}>{a.categoria}</div>
                          </td>
                          <td style={{ color: theme.accent, fontWeight: 700 }}>{a.prezzo}cr</td>
                          <td style={{ paddingRight: 16 }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                              <button className="btn btn-blue" style={{ padding: "5px 8px", fontSize: 11 }} onClick={() => apriDettagli(a.id)}>{atletaAperto === a.id ? "▲" : "📊"}</button>
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
                          <tr>
                            <td colSpan={3} style={{ padding: "12px 20px", background: "#0d1526" }}>
                              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                                <div>
                                  <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 6, textTransform: "uppercase" }}>Punti per evento</div>
                                  {atletaDettagli.eventi.length === 0
                                    ? <span style={{ color: theme.textMuted, fontSize: 12 }}>Nessun evento</span>
                                    : atletaDettagli.eventi.map(e => (
                                      <div key={e.evento} style={{ fontSize: 12, color: theme.textSub, marginBottom: 3 }}>
                                        <span style={{ color: theme.blue, fontWeight: 600 }}>{e.punti} pt</span> — {e.evento}
                                      </div>
                                    ))
                                  }
                                </div>
                                <div className="stat-box"><span className="stat-label">Acquistato da</span><span className="stat-value" style={{ fontSize: "1.2rem" }}>{atletaDettagli.in_squadre} squadre</span></div>
                                <div className="stat-box"><span className="stat-label">Gare disputate</span><span className="stat-value" style={{ fontSize: "1.2rem" }}>{atletaDettagli.gare}</span></div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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

function Classifica({ username, token, lega }) {
  const [classifica, setClassifica] = useState([]);
  const [eventi, setEventi] = useState([]);
  const [eventoSelezionato, setEventoSelezionato] = useState("");
  const [loading, setLoading] = useState(true);
  const [squadraAperta, setSquadraAperta] = useState(null);
  const [ricerca, setRicerca] = useState("");

  const caricaEventi = async () => {
    const res = await fetch(`${API}/classifica/eventi`);
    if (res.ok) setEventi(await res.json());
  };

  const caricaClassifica = async (evento) => {
    if (!lega) return;
    setLoading(true);
    const url = evento ? `${API}/league/classifica?league_id=${lega.id}&evento=${encodeURIComponent(evento)}` : `${API}/league/classifica?league_id=${lega.id}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setClassifica(await res.json());
    setLoading(false);
  };

  useState(() => { caricaEventi(); caricaClassifica(""); }, [lega]);

  const rankEmoji = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
  const rankColor = (i) => i === 0 ? theme.yellow : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : theme.textSub;

  if (!lega) return null;

  return (
    <div>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>🏆 Classifica {lega.nome}</div>
          <select className="select" value={eventoSelezionato} onChange={e => { setEventoSelezionato(e.target.value); caricaClassifica(e.target.value); }}>
            <option value="">🌍 Generale</option>
            {eventi.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <input className="input" style={{ marginBottom: 0 }} placeholder="🔍 Cerca squadra o utente..." value={ricerca} onChange={e => setRicerca(e.target.value)} />
      </div>

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
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: squadraAperta === u.username ? "none" : `1px solid ${theme.border}22`, background: u.username === username ? "#f9731610" : "", borderLeft: u.username === username ? `3px solid ${theme.accent}` : "3px solid transparent", cursor: "pointer" }}
                    onClick={() => setSquadraAperta(squadraAperta === u.username ? null : u.username)}
                  >
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: rankColor(i), minWidth: 28 }}>{rankEmoji(i) || i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {u.squadra}
                        {u.username === username && <span className="badge badge-orange" style={{ marginLeft: 8 }}>Tu</span>}
                      </div>
                      <div style={{ fontSize: 11, color: theme.textMuted }}>@{u.username} {squadraAperta === u.username ? "▲" : "▼"}</div>
                    </div>
                    <span style={{ color: theme.accent, fontWeight: 700, fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem" }}>{u.punti}</span>
                  </div>
                  {squadraAperta === u.username && (
                    <div style={{ padding: "12px 16px", background: "#0d1526", borderBottom: `1px solid ${theme.border}22` }}>
                      <AtletiSquadra token={token} username={u.username} evento={eventoSelezionato} lega={lega} />
                    </div>
                  )}
                </div>
              ))
        }
      </div>
    </div>
  );
}

function AtletiSquadra({ token, username, evento, lega }) {
  const [atleti, setAtleti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState(false);

  useState(() => {
    const url = evento
      ? `${API}/league/atleti-squadra?username=${encodeURIComponent(username)}&league_id=${lega.id}&evento=${encodeURIComponent(evento)}`
      : `${API}/league/atleti-squadra?username=${encodeURIComponent(username)}&league_id=${lega.id}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) { setErrore(true); setLoading(false); return null; } return r.json(); })
      .then(data => { if (data) { setAtleti(data); setLoading(false); } })
      .catch(() => { setErrore(true); setLoading(false); });
  }, []);

  if (loading) return <p style={{ color: theme.textMuted, fontSize: 12 }}>⏳ Caricamento...</p>;
  if (errore) return <p style={{ color: theme.textMuted, fontSize: 13 }}>⚠️ Sessione scaduta — esci e rifai il login.</p>;

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
  if (errore) return <div className="card"><div className="card-title">👥 Squadre della Lega</div><p style={{ color: theme.textMuted }}>{errore}</p></div>;
  if (squadre.length === 0) return <div className="card"><p style={{ color: theme.textMuted }}>Nessuna squadra completa ancora.</p></div>;

  return (
    <div>
      <div className="card"><div className="card-title">👥 Squadre della Lega</div><p style={{ color: theme.textSub, fontSize: 13 }}>Il mercato è chiuso — puoi vedere le squadre di tutti!</p></div>
      {squadre.map(s => (
        <div key={s.username} className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setAperta(aperta === s.username ? null : s.username)}>
            <div><span style={{ fontWeight: 600, fontSize: 15 }}>{s.squadra}</span><span style={{ color: theme.textMuted, fontSize: 12, marginLeft: 10 }}>di {s.username}</span></div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="badge badge-blue">{s.atleti.length} atleti</span>
              <span style={{ color: theme.textMuted }}>{aperta === s.username ? "▲" : "▼"}</span>
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
            <div className="card-title" style={{ marginBottom: 4 }}>👥 {dettagli.nome}</div>
            <span style={{ color: theme.textMuted, fontSize: 13 }}>Creata da <strong style={{ color: theme.textSub }}>{dettagli.owner}</strong> · {dettagli.partecipanti.length} partecipanti</span>
          </div>
          {dettagli.codice && (
            <button className="btn btn-blue" onClick={copiaCodice}>{copiato ? "✅ Copiato!" : "🔑 Copia Codice"}</button>
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
      <div className="card-title">💬 Chat {lega.nome}</div>
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
  const [codice, setCodice] = useState("");
  const [creditiIniziali, setCreditiIniziali] = useState(200);
  const [atletiPerCategoria, setAtletiPerCategoria] = useState(2);
  const [messaggio, setMessaggio] = useState("");
  const [tutteLeghe, setTutteLeghe] = useState([]);
  const [ricerca, setRicerca] = useState("");
  const [legaEntrata, setLegaEntrata] = useState(null);
  const [codiceInserito, setCodiceInserito] = useState("");

  const caricaTutteLeghe = async () => {
    const res = await fetch(`${API}/league/tutte`);
    if (res.ok) setTutteLeghe(await res.json());
  };

  useState(() => { caricaTutteLeghe(); }, []);

  const creaLega = async () => {
    if (nomeLega.length < 3) { setMessaggio("❌ Nome lega troppo corto"); return; }
    if (tipo === "privata" && codice.length < 3) { setMessaggio("❌ Imposta un codice di almeno 3 caratteri"); return; }
    const res = await fetch(`${API}/league/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nome: nomeLega, tipo, modalita,
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

  const entraLega = async (codiceLega) => {
    const res = await fetch(`${API}/league/join?codice=${encodeURIComponent(codiceLega)}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
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
            <div className="card-title">🏅 Le tue Leghe</div>
            {mieLeghe.length === 0
              ? <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 16 }}>Non fai ancora parte di nessuna lega.</p>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  {mieLeghe.map(l => (
                    <div key={l.id} style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>🏅 {l.nome}</span>
                        <span className="badge badge-blue" style={{ marginLeft: 8 }}>{l.modalita}</span>
                        {l.is_owner && <span className="badge badge-orange" style={{ marginLeft: 6 }}>Admin</span>}
                      </div>
                      <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => sceltaLega(l)}>Apri →</button>
                    </div>
                  ))}
                </div>
              )
            }
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={() => setVista("crea")}>➕ Crea Lega</button>
              <button className="btn btn-blue" onClick={() => setVista("unisciti")}>🔑 Unisciti a una Lega</button>
            </div>
          </div>
        </>
      )}

      {vista === "crea" && (
        <div className="card">
          <div className="card-title">➕ Crea una nuova Lega</div>
          <button className="btn btn-danger" style={{ marginBottom: 16 }} onClick={() => setVista("home")}>← Indietro</button>

          <input className="input" placeholder="Nome lega" value={nomeLega} onChange={e => setNomeLega(e.target.value)} />

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 6, textTransform: "uppercase" }}>Tipo</div>
            <div style={{ display: "flex", gap: 10 }}>
              <div className={`option-card ${tipo === "privata" ? "selected" : ""}`} onClick={() => setTipo("privata")}>
                <div className="option-card-title">🔒 Privata</div>
                <div className="option-card-sub">Serve un codice per entrare</div>
              </div>
              <div className={`option-card ${tipo === "aperta" ? "selected" : ""}`} onClick={() => setTipo("aperta")}>
                <div className="option-card-title">🌍 Aperta</div>
                <div className="option-card-sub">Chiunque può unirsi</div>
              </div>
            </div>
          </div>

          {tipo === "privata" && (
            <input className="input" placeholder="Codice di accesso" value={codice} onChange={e => setCodice(e.target.value)} />
          )}

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 6, textTransform: "uppercase" }}>Modalità</div>
            <div style={{ display: "flex", gap: 10 }}>
              <div className={`option-card ${modalita === "listone" ? "selected" : ""}`} onClick={() => setModalita("listone")}>
                <div className="option-card-title">📋 Listone</div>
                <div className="option-card-sub">Mercato online a prezzi fissi</div>
              </div>
              <div className={`option-card ${modalita === "asta" ? "selected" : ""}`} onClick={() => setModalita("asta")}>
                <div className="option-card-title">🔨 Asta</div>
                <div className="option-card-sub">Asta fisica, atleti inseriti a mano</div>
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
          <div className="card-title">🔑 Unisciti a una Lega</div>
          <button className="btn btn-danger" style={{ marginBottom: 16 }} onClick={() => setVista("home")}>← Indietro</button>

          <input className="input" placeholder="Cerca lega aperta..." value={ricerca} onChange={e => setRicerca(e.target.value)} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {legheFiltrate.length === 0
              ? <p style={{ color: theme.textMuted, fontSize: 13 }}>Nessuna lega aperta trovata</p>
              : legheFiltrate.map(l => (
                <div key={l.id} style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>🌍 {l.nome}</span>
                    <span className="badge badge-blue" style={{ marginLeft: 8 }}>{l.modalita}</span>
                    <span style={{ color: theme.textMuted, fontSize: 12, marginLeft: 10 }}>{l.membri} membri</span>
                  </div>
                  {sonoMembro(l.id)
                    ? <span className="badge badge-green">Già dentro</span>
                    : <button className="btn btn-success" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => entraLega(l.id, null)}>Entra</button>
                  }
                </div>
              ))
            }
          </div>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${theme.border}` }}>
            <div className="card-title" style={{ fontSize: "1.1rem" }}>🔒 Ho un codice per una lega privata</div>
            <input className="input" placeholder="Inserisci il codice della lega" value={codiceInserito} onChange={e => setCodiceInserito(e.target.value)} />
            <button className="btn btn-primary" onClick={() => entraLega(codiceInserito)}>Entra nella lega</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLega({ token, lega }) {
  const [dettagli, setDettagli] = useState(null);
  const [messaggio, setMessaggio] = useState("");

  const carica = async () => {
    if (!lega) return;
    const res = await fetch(`${API}/league/dettagli?league_id=${lega.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setDettagli(await res.json());
  };

  useState(() => { carica(); }, [lega]);

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

  if (!lega || !dettagli) return <div className="card" style={{ color: theme.textMuted }}>Caricamento...</div>;

  return (
    <div className="card">
      <div className="card-title">⚙️ Gestisci {lega.nome}</div>
      {messaggio && <div className="msg-box">{messaggio}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: theme.textSub }}>Mercato:</span>
        <span className={`badge ${dettagli.mercato_aperto ? "badge-green" : "badge-red"}`}>{dettagli.mercato_aperto ? "🟢 Aperto" : "🔴 Chiuso"}</span>
        <button className="btn btn-success" onClick={apriMercato}>Apri Mercato</button>
        <button className="btn btn-danger" onClick={chiudiMercato}>Chiudi Mercato</button>
      </div>
      {dettagli.codice && (
        <div className="stat-box">
          <span className="stat-label">Codice di accesso</span>
          <span className="stat-value" style={{ fontSize: "1.2rem" }}>{dettagli.codice}</span>
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
        <div className="card-title">📋 Regolamento {lega ? lega.nome : "FantaRoller"}</div>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.6 }}>Scegli i tuoi atleti, costruisci la squadra perfetta e sfida gli altri appassionati di pattinaggio corsa!</p>
      </div>
      <div className="card">
        <div className="card-title">🏗️ Formazione</div>
        <p style={{ color: theme.textSub, fontSize: 13, marginBottom: 14 }}>Ogni squadra è composta da <strong style={{ color: theme.accent }}>{atletiPerCat} atleti per categoria</strong>:</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {["Ragazzi Maschi", "Ragazze Femminile", "Allievi Maschi", "Allieve Femminile", "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"].map(c => (
            <div key={c} style={{ background: "#0d1526", border: "1px solid #1E2D45", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: theme.textSub }}>
              <span style={{ color: theme.blue }}>×{atletiPerCat}</span> {c}
            </div>
          ))}
        </div>
      </div>
      {lega && (
        <div className="card">
          <div className="card-title">💰 Budget e Modalità</div>
          <p style={{ color: theme.textSub, fontSize: 14 }}>Ogni squadra parte con <strong style={{ color: theme.accent }}>{lega.crediti_iniziali} crediti</strong>. Modalità: <strong style={{ color: theme.accent }}>{lega.modalita}</strong>.</p>
        </div>
      )}
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
        <div className="card-title">⚠️ Malus Sanzioni</div>
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

  const categorie = ["Ragazzi Maschi", "Ragazze Femminile", "Allievi Maschi", "Allieve Femminile", "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"];

  const caricaGare = async () => {
    const res = await fetch(`${API}/admin/gare`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setGare(await res.json());
  };

  useState(() => { caricaGare(); }, []);

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

  const calcolaPunti = async () => {
    setMessaggio("⏳ Calcolo punti in corso...");
    const url = eventoCalcolo ? `${API}/admin/calcola-punti?evento=${encodeURIComponent(eventoCalcolo)}` : `${API}/admin/calcola-punti`;
    const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); setMessaggio(data.message);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">🔧 Pannello Admin Globale</div>
        {messaggio && <div className="msg-box">{messaggio}</div>}
        <p style={{ color: theme.textSub, fontSize: 13 }}>Il mercato ora si gestisce per singola lega, dalla sezione "Gestisci Lega" quando hai una lega attiva di cui sei owner.</p>
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
          {gareSelezionate.length > 0 && <button className="btn btn-danger" onClick={eliminaSelezionate}>🗑️ Elimina ({gareSelezionate.length})</button>}
        </div>
        {gare.length === 0 ? <p style={{ color: theme.textMuted, fontSize: 14 }}>Nessuna gara inserita</p> : (
          [...new Set(gare.map(g => g.evento))].map(evento => (
            <div key={evento} style={{ marginBottom: 12 }}>
              <div style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0d1526", borderRadius: 8, marginBottom: 6 }} onClick={() => setEventiAperti(prev => ({ ...prev, [evento]: !prev[evento] }))}>
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
        <div className="card-title">🔄 Aggiorna Punti</div>
        <p style={{ color: theme.textSub, fontSize: 13, marginBottom: 14 }}>Seleziona un campionato specifico o calcola tutto.</p>
        <select className="select" style={{ marginBottom: 12, width: "100%" }} value={eventoCalcolo} onChange={e => setEventoCalcolo(e.target.value)}>
          <option value="">🌍 Tutti i campionati</option>
          {[...new Set(gare.map(g => g.evento))].map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <button className="btn" style={{ background: "linear-gradient(135deg, #f97316, #ef4444)", color: "white", padding: "12px 24px", fontSize: 14 }} onClick={calcolaPunti}>
          🔄 {eventoCalcolo ? `Calcola ${eventoCalcolo}` : "Calcola Tutti"}
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
        <div className="card-title">📅 Gare</div>
        <select className="select" value={eventoSelezionato} onChange={e => caricaRisultati(e.target.value)}>
          <option value="">Seleziona un campionato...</option>
          {eventi.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {eventoSelezionato && loading && <div className="card"><p style={{ color: theme.textMuted }}>⏳ Caricamento...</p></div>}

      {categorieOrdinati.map(cat => (
        <div key={cat} className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: categoriaAperta === cat ? "#1a2235" : theme.bgCard }} onClick={() => setCategoriaAperta(categoriaAperta === cat ? null : cat)}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{cat}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="badge badge-blue">{risultati[cat].length} atleti</span>
              <span style={{ color: theme.textMuted }}>{categoriaAperta === cat ? "▲" : "▼"}</span>
            </div>
          </div>
          {categoriaAperta === cat && (
            <div style={{ padding: "8px 12px" }}>
              {risultati[cat].map((a, i) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", marginBottom: 4, borderRadius: 8, background: a.in_squadra ? "#f9731615" : "#0d1526", borderLeft: a.in_squadra ? `3px solid ${theme.accent}` : "3px solid transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <span style={{ color: theme.textMuted, fontSize: 12, minWidth: 24 }}>{i + 1}</span>
                    <span style={{ fontWeight: a.in_squadra ? 700 : 400, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
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
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.8 }}>FantaRoller utilizza esclusivamente dati pubblicamente disponibili sul sito ufficiale della Federazione Italiana Sport Rotellistici (FISR) all'indirizzo <span style={{ color: theme.blue }}>attivita.rollergames.it</span>.</p>
      </div>
      <div className="card">
        <div className="card-title">📋 Informazioni sugli Atleti</div>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>I nomi, i risultati e le classifiche degli atleti presenti su FantaRoller sono già pubblicamente accessibili online attraverso i comunicati ufficiali FISR. Nessun dato privato viene raccolto o pubblicato.</p>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.8 }}>Per richiedere la rimozione dei propri dati contattare l'amministratore del sito.</p>
      </div>
      <div className="card">
        <div className="card-title">👤 Dati degli Utenti</div>
        <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.8 }}>FantaRoller raccoglie username, email (per la verifica dell'account) e password (cifrata). Nessuna informazione personale aggiuntiva viene richiesta o memorizzata.</p>
      </div>
    </div>
  );
}

export default App;