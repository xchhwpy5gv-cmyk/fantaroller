import { useState } from "react";

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

    .table th:nth-child(2),
    .table td:nth-child(2) {
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
  const [token, setToken] = useState(null);
  const [pagina, setPagina] = useState("squadra");
  const [isAdmin, setIsAdmin] = useState(false);

  const dopoLogin = async (t) => {
    setToken(t);
    const res = await fetch(`${API}/me/`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await res.json();
    setIsAdmin(data.is_admin === 1);
    setPagina("squadra");
  };

  if (!token) return <Login setToken={dopoLogin} />;

  return (
    <>
      <style>{styles}</style>
      <div className="app-wrapper">
        <div className="header">
          <div className="logo">⚡ Fanta<span>Roller</span></div>
          <nav className="nav">
            <button className={`nav-btn ${pagina === "squadra" ? "active" : ""}`} onClick={() => setPagina("squadra")}>Squadra</button>
            <button className={`nav-btn ${pagina === "mercato" ? "active" : ""}`} onClick={() => setPagina("mercato")}>Mercato</button>
            <button className={`nav-btn ${pagina === "classifica" ? "active" : ""}`} onClick={() => setPagina("classifica")}>Classifica</button>
            <button className={`nav-btn ${pagina === "regolamento" ? "active" : ""}`} onClick={() => setPagina("regolamento")}>Regolamento</button>
            <button className={`nav-btn ${pagina === "lega" ? "active" : ""}`} onClick={() => setPagina("lega")}>Lega</button>
            <button className={`nav-btn ${pagina === "gare" ? "active" : ""}`} onClick={() => setPagina("gare")}>Gare</button>
            {isAdmin && <button className="nav-btn admin-btn" onClick={() => setPagina("admin")}>Admin</button>}
            <button className="nav-btn logout" onClick={() => { setToken(null); setPagina("squadra"); }}>Esci</button>
          </nav>
        </div>
        {pagina === "squadra" && <Squadra token={token} />}
        {pagina === "mercato" && <Mercato token={token} />}
        {pagina === "classifica" && <Classifica />}
        {pagina === "regolamento" && <Regolamento />}
        {pagina === "lega" && <Lega token={token} />}
        {pagina === "gare" && <Gare token={token} />}
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
    setLoading(true);
    setErrore("⏳ Caricamento...");
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
        setSuccesso("✅ Registrato! Ora fai login.");
        setErrore("");
        setRegistrati(false);
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

  const caricaSquadra = async () => {
    const res = await fetch(`${API}/squadra/`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { setSquadra(await res.json()); setErrore(""); }
    else setErrore("crea");
  };

  const creaSquadra = async () => {
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

  const categorie = ["Ragazzi Maschi", "Ragazze Femminile", "Allievi Maschi", "Allieve Femminile", "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"];
  const atletiPerCategoria = (cat) => squadra ? squadra.atleti.filter(a => a.categoria === cat).length : 0;
  const squadraCompleta = squadra ? squadra.atleti.length === 16 : false;

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
            <div className="card-title">🏆 {squadra.nome}</div>
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
                  <th>Categoria</th>
                  <th>Prezzo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {squadra.atleti.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.name}</div>
                      <div className="mobile-category">{a.categoria}</div>
                    </td>
                    <td><span className="badge badge-blue">{a.categoria}</span></td>
                    <td style={{ color: theme.accent, fontWeight: 700 }}>{a.prezzo}cr</td>
                    <td><button className="btn btn-danger" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => vendi(a.id)}>Vendi</button></td>
                  </tr>
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
  
  useState(() => {
    fetch(`${API}/athletes/`).then(r => r.json()).then(setAtleti);
    fetch(`${API}/squadra/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (data.atleti) setSquadra(data.atleti.map(a => a.id)); });
  }, []);

  const acquista = async (id) => {
    const res = await fetch(`${API}/squadra/acquista/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    if (res.ok) setSquadra([...squadra, id]);
  };

  const categorie = [...new Set(atleti.map(a => a.categoria))].sort();
  const atletiFiltrati = atleti
    .filter(a => filtro ? a.categoria === filtro : true)
    .filter(a => ricerca ? a.name.toLowerCase().includes(ricerca.toLowerCase()) : true)
    .sort((a, b) => {
      if (ordinePrezzo === "alto") return b.prezzo - a.prezzo;
      if (ordinePrezzo === "basso") return a.prezzo - b.prezzo;
      return 0;
    });
  return (
   <div>
    {messaggio && <div className="msg-box">{messaggio}</div>}
    
    <div className="card">
      <div className="card-title">🛒 Mercato Atleti</div>

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

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20 }}>Nome</th>
              <th>Categoria</th>
              <th>Punti</th>
              <th>Prezzo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {atletiFiltrati.map(a => (
              <tr key={a.id}>
                <td style={{ paddingLeft: 20 }}>
                  <div style={{ fontWeight: 600 }}>{a.name}</div>
                  <div className="mobile-category">{a.categoria}</div>
                </td>
                <td><span className="badge badge-blue">{a.categoria}</span></td>
                <td style={{ color: theme.accent, fontWeight: 700 }}>{a.prezzo}cr</td>
                <td style={{ paddingRight: 16 }}>
                  {squadra.includes(a.id)
                    ? <span style={{ color: theme.green, fontSize: 12, fontWeight: 600 }}>✓ In squadra</span>
                    : <button className="btn btn-success" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => acquista(a.id)}>Acquista</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Classifica() {
  const [classifica, setClassifica] = useState([]);
  const [eventi, setEventi] = useState([]);
  const [eventoSelezionato, setEventoSelezionato] = useState("");

  const caricaEventi = async () => {
    const res = await fetch(`${API}/classifica/eventi`);
    if (res.ok) setEventi(await res.json());
  };

  const caricaClassifica = async (evento) => {
    const url = evento ? `${API}/classifica/?evento=${encodeURIComponent(evento)}` : `${API}/classifica/`;
    const res = await fetch(url);
    if (res.ok) setClassifica(await res.json());
  };

  useState(() => { caricaEventi(); caricaClassifica(""); }, []);

  const handleEvento = (e) => { setEventoSelezionato(e.target.value); caricaClassifica(e.target.value); };

  const rankColor = (i) => i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
  const rankEmoji = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";

  return (
    <div>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>🏅 Classifica</div>
          <select className="select" value={eventoSelezionato} onChange={handleEvento}>
            <option value="">🌍 Generale</option>
            {eventi.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20, width: 60 }}>#</th>
              <th>Utente</th>
              <th>Squadra</th>
              <th>Punti</th>
            </tr>
          </thead>
          <tbody>
            {classifica.length === 0
              ? <tr><td colSpan={4} style={{ textAlign: "center", color: theme.textMuted, padding: 24 }}>Nessuna squadra completa in classifica</td></tr>
              : classifica.map((u, i) => (
                <tr key={u.username}>
                  <td style={{ paddingLeft: 20 }}>
                    <span className={`rank-number ${rankColor(i)}`}>{rankEmoji(i) || i + 1}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td style={{ color: theme.textSub }}>{u.squadra}</td>
                  <td style={{ color: theme.accent, fontWeight: 700, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem" }}>{u.punti}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
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
            <div key={c} style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: theme.textSub }}>
              <span style={{ color: theme.blue }}>×2</span> {c}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">💰 Budget</div>
        <p style={{ color: theme.textSub, fontSize: 14 }}>Ogni utente ha <strong style={{ color: theme.accent }}>150 crediti</strong> per costruire la propria squadra.</p>
      </div>

      <div className="card">
        <div className="card-title">🏆 Punteggi per Posizione</div>
        <table className="table">
          <thead><tr><th>Posizione</th><th>Punti base</th></tr></thead>
          <tbody>
            {[["1°", 100], ["2°", 85], ["3°", 75], ["4°", 65], ["5°", 55], ["6°", 50], ["7°", 45], ["8°", 40], ["9°", 35], ["10°", 30], ["11° - 20°", 20], ["21° e oltre", 5]].map(([pos, pts]) => (
              <tr key={pos}>
                <td style={{ fontWeight: 600 }}>{pos}</td>
                <td style={{ color: theme.accent, fontWeight: 700 }}>{pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-title">✖️ Moltiplicatori Gara</div>
        <table className="table">
          <thead><tr><th>Tipo</th><th>Moltiplicatore</th></tr></thead>
          <tbody>
            <tr><td>Gara sprint</td><td><span className="badge badge-blue">×1.2</span></td></tr>
            <tr><td>Gara di fondo</td><td><span className="badge badge-blue">×1.2</span></td></tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-title">⚠️ Malus Sanzioni</div>
        <table className="table">
          <thead><tr><th>Sanzione</th><th>Punti</th></tr></thead>
          <tbody>
            <tr><td>Ammonizione</td><td style={{ color: theme.yellow, fontWeight: 700 }}>-10</td></tr>
            <tr><td>Diffida</td><td style={{ color: theme.accent, fontWeight: 700 }}>-20</td></tr>
            <tr><td>Espulsione</td><td style={{ color: theme.red, fontWeight: 700 }}>-50</td></tr>
          </tbody>
        </table>
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

  const calcolaPunti = async () => {
    setMessaggio("⏳ Calcolo punti in corso...");
    const res = await fetch(`${API}/admin/calcola-punti`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); setMessaggio(data.message);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">🔧 Pannello Admin</div>
        {messaggio && <div className="msg-box">{messaggio}</div>}
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
          <table className="table">
            <thead><tr><th style={{ width: 40 }}>✓</th><th>Evento</th><th>Categoria</th><th>Molt.</th><th></th></tr></thead>
            <tbody>
              {gare.map(g => (
                <tr key={g.id} style={{ background: gareSelezionate.includes(g.id) ? "#f9731610" : "" }}>
                  <td>
                    <input type="checkbox" checked={gareSelezionate.includes(g.id)} onChange={e => {
                      if (e.target.checked) setGareSelezionate([...gareSelezionate, g.id]);
                      else setGareSelezionate(gareSelezionate.filter(id => id !== g.id));
                    }} />
                  </td>
                  <td style={{ fontWeight: 600 }}>{g.evento}</td>
                  <td><span className="badge badge-blue">{g.categoria}</span></td>
                  <td><span className="badge badge-orange">×{g.moltiplicatore}</span></td>
                  <td><button className="btn btn-danger" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => eliminaGara(g.id)}>Elimina</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="card-title">🔄 Aggiorna Punti</div>
        <p style={{ color: theme.textSub, fontSize: 13, marginBottom: 14 }}>Ricalcola i punti di tutti gli atleti in base alle gare inserite. Le sanzioni vengono applicate automaticamente.</p>
        <button className="btn" style={{ background: "linear-gradient(135deg, #f97316, #ef4444)", color: "white", padding: "12px 24px", fontSize: 14 }} onClick={calcolaPunti}>
          🔄 Calcola Punti
        </button>
      </div>
    </div>
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
  const [copiato, setCopiato] = useState(false);

  const caricaMieLeghe = async () => {
    const res = await fetch(`${API}/league/mie-leghe`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setMieLeghe(await res.json());
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
      caricaClassificaLega("", id);
      caricaEventi();
    }
  };

  const caricaEventi = async () => {
    const res = await fetch(`${API}/classifica/eventi`);
    if (res.ok) setEventi(await res.json());
  };

  const caricaClassificaLega = async (evento) => {
    const url = evento
      ? `${API}/league/classifica?evento=${encodeURIComponent(evento)}`
      : `${API}/league/classifica`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setClassifica(await res.json());
  };

  useState(() => { caricaMieLeghe(); }, []);

  const creaLega = async () => {
    const res = await fetch(`${API}/league/create?nome=${encodeURIComponent(nomeLega)}&password=${encodeURIComponent(password)}`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    if (res.ok) { setNomeLega(""); setPassword(""); caricaMieLeghe(); setVista("home"); }
  };

  const entraLega = async () => {
    const res = await fetch(`${API}/league/join?nome=${encodeURIComponent(nomeLega)}&password=${encodeURIComponent(password)}`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    if (res.ok) { setNomeLega(""); setPassword(""); caricaMieLeghe(); setVista("home"); }
  };

  const copiaPassword = () => {
    navigator.clipboard.writeText(dettagli.codice);
    setCopiato(true);
    setTimeout(() => setCopiato(false), 2000);
  };

  const rankEmoji = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1;
  const rankColor = (i) => i === 0 ? theme.yellow : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : theme.textSub;

  // PAGINA LEGA APERTA
  if (vista === "lega" && dettagli) return (
    <div>
      <div className="card">
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
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>🏆 Classifica</div>
          <select className="select" value={eventoSelezionato} onChange={e => { setEventoSelezionato(e.target.value); caricaClassificaLega(e.target.value); }}>
            <option value="">🌍 Generale</option>
            {eventi.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <table className="table">
          <thead><tr><th style={{ width: 60 }}>#</th><th>Utente</th><th>Squadra</th><th>Punti</th></tr></thead>
          <tbody>
            {classifica.length === 0
              ? <tr><td colSpan={4} style={{ textAlign: "center", color: theme.textMuted, padding: 24 }}>Nessuna squadra completa</td></tr>
              : classifica.map((u, i) => (
                <tr key={u.username}>
                  <td style={{ paddingLeft: 12 }}><span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: rankColor(i) }}>{rankEmoji(i)}</span></td>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td style={{ color: theme.textSub }}>{u.squadra}</td>
                  <td style={{ color: theme.accent, fontWeight: 700, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem" }}>{u.punti}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

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
    </div>
  );

  // PAGINA HOME LEGHE
  return (
    <div>
      {messaggio && <div className="msg-box">{messaggio}</div>}

      <div className="card">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => setVista("crea")}>➕ Crea Lega</button>
          <button className="btn btn-blue" onClick={() => setVista("entra")}>🔑 Unisciti a una Lega</button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🏅 Le tue Leghe</div>
        {mieLeghe.length === 0
          ? <p style={{ color: theme.textMuted, fontSize: 14 }}>Non sei ancora in nessuna lega — creane una o unisciti!</p>
          : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mieLeghe.map(l => (
                <div key={l.id} style={{ background: "#0d1526", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>🏅 {l.nome}</span>
                  <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => apriLega(l.id)}>Apri →</button>
                </div>
              ))}
            </div>
        }
      </div>

      {(vista === "crea" || vista === "entra") && (
        <div className="card">
          <div className="card-title">{vista === "crea" ? "➕ Crea Lega" : "🔑 Unisciti a una Lega"}</div>
          <input className="input" placeholder="Nome lega" value={nomeLega} onChange={e => setNomeLega(e.target.value)} />
          <input className="input" placeholder="Password lega" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-blue"
                onClick={() => setVista("crea")}
              >
                ➕ Crea lega
              </button>

              <button
                className="btn btn-primary"
                onClick={() => setVista("entra")}
              >
                ➕ Unisciti ad altra lega
              </button>
            </div>
            <button className="btn btn-primary" onClick={vista === "crea" ? creaLega : entraLega}>{vista === "crea" ? "Crea" : "Entra"}</button>
            <button className="btn btn-danger" onClick={() => { setVista("home"); setMessaggio(""); }}>Annulla</button>
          </div>
        </div>
      )}
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
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20, width: 50 }}>#</th>
                  <th>Atleta</th>
                </tr>
              </thead>
              <tbody>
                {risultati[cat].map((a, i) => (
                  <tr key={a.id} style={{
                    background: a.in_squadra ? "#f9731615" : "",
                    borderLeft: a.in_squadra ? `3px solid ${theme.accent}` : "3px solid transparent"
                  }}>
                    <td style={{ paddingLeft: 20, color: theme.textMuted }}>{i + 1}</td>
                    <td style={{ fontWeight: a.in_squadra ? 700 : 400 }}>
                      {a.name}
                      {a.in_squadra && <span className="badge badge-orange" style={{ marginLeft: 8 }}>⭐ Tuo</span>}
                    </td>
                    <td style={{ color: theme.accent, fontWeight: 700, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem" }}>{a.punti}</td>
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