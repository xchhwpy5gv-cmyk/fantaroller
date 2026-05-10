import { useState } from "react";

const API = "https://fantaroller-api.onrender.com";


function App() {
  const [token, setToken] = useState(null);
  const [pagina, setPagina] = useState("login");
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

  if (!token) {
    return <Login setToken={dopoLogin} setPagina={setPagina} />;
  }

  return (
    <div style={{ fontFamily: "Arial", maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1>⚡ FantaRoller</h1>
      <nav style={{ marginBottom: 20 }}>
        <button onClick={() => setPagina("squadra")}>La mia squadra</button>
        <button onClick={() => setPagina("mercato")} style={{ marginLeft: 10 }}>Mercato</button>
        <button onClick={() => setPagina("classifica")} style={{ marginLeft: 10 }}>Classifica</button>
        {isAdmin && <button onClick={() => setPagina("admin")} style={{ marginLeft: 10, background: "#dc3545", color: "white", border: "none", padding: "5px 10px" }}>Admin</button>}
        <button onClick={() => { setToken(null); setPagina("login"); }} style={{ marginLeft: 10 }}>Logout</button>
      </nav>
      {pagina === "squadra" && <Squadra token={token} />}
      {pagina === "mercato" && <Mercato token={token} />}
      {pagina === "classifica" && <Classifica />}
      {pagina === "admin" && <Admin token={token} />}
    </div>
  );
}


function Login({ setToken, setPagina }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");
  const [registrati, setRegistrati] = useState(false);

  const handleSubmit = async () => {
    const url = registrati ? `${API}/register/` : `${API}/login/`;
    const body = JSON.stringify({ username, password });
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await res.json();
    if (registrati) {
      setErrore("Registrato! Ora fai login.");
      setRegistrati(false);
    } else if (data.access_token) {
      setToken(data.access_token);
      setPagina("squadra");
    } else {
      setErrore("Credenziali errate");
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: "100px auto", textAlign: "center" }}>
      <h1>⚡ FantaRoller</h1>
      <h2>{registrati ? "Registrati" : "Login"}</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 10, padding: 8 }} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 10, padding: 8 }} />
      <button onClick={handleSubmit} style={{ width: "100%", padding: 10, background: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
        {registrati ? "Registrati" : "Entra"}
      </button>
      <p style={{ cursor: "pointer", color: "#007bff" }} onClick={() => setRegistrati(!registrati)}>
        {registrati ? "Hai già un account? Login" : "Non hai un account? Registrati"}
      </p>
      {errore && <p style={{ color: "red" }}>{errore}</p>}
    </div>
  );
}

function Squadra({ token }) {
  const [messaggio, setMessaggio] = useState("");
  const [squadra, setSquadra] = useState(null);
  const [errore, setErrore] = useState("");
  const [nomeSquadra, setNomeSquadra] = useState("");

  const caricaSquadra = async () => {
    const res = await fetch(`${API}/squadra/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setSquadra(data);
      setErrore("");
    } else {
      setErrore("Nessuna squadra trovata");
    }
  };

  const creaSquadra = async () => {
    const res = await fetch(`${API}/squadra/crea?nome=${nomeSquadra}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) caricaSquadra();
  };

  const vendi = async (id) => {
    const res = await fetch(`${API}/squadra/vendi/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    caricaSquadra();
  };

  useState(() => { caricaSquadra(); }, []);

  if (errore) return (
    <div>
      <h2>Crea la tua squadra</h2>
      <input placeholder="Nome squadra" value={nomeSquadra} onChange={e => setNomeSquadra(e.target.value)} style={{ padding: 8, marginRight: 10 }} />
      <button onClick={creaSquadra}>Crea</button>
    </div>
  );

  if (!squadra) return <p>Caricamento...</p>;

  return (
    <div>
      <h2>🏆 {squadra.nome}</h2>
      <p>💰 Budget: <strong>{squadra.budget} crediti</strong></p>
      {messaggio && <p style={{ color: "green" }}>{messaggio}</p>}
      <h3>Atleti:</h3>
      {squadra.atleti.length === 0 ? <p>Nessun atleta — vai al mercato!</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: 8, textAlign: "left" }}>Nome</th>
              <th>Categoria</th>
              <th>Prezzo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {squadra.atleti.map(a => (
              <tr key={a.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: 8 }}>{a.name}</td>
                <td style={{ textAlign: "center" }}>{a.categoria}</td>
                <td style={{ textAlign: "center" }}>{a.prezzo}</td>
                <td style={{ textAlign: "center" }}>
                  <button onClick={() => vendi(a.id)} style={{ background: "#dc3545", color: "white", border: "none", padding: "4px 8px", cursor: "pointer" }}>
                    Vendi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Mercato({ token }) {
  const [atleti, setAtleti] = useState([]);
  const [messaggio, setMessaggio] = useState("");
  const [filtro, setFiltro] = useState("");
  const [ricerca, setRicerca] = useState("");
  const [squadra, setSquadra] = useState([]);

  useState(() => {
    fetch(`${API}/athletes/`)
      .then(r => r.json())
      .then(setAtleti);
    fetch(`${API}/squadra/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (data.atleti) setSquadra(data.atleti.map(a => a.id)); });
  }, []);

  const acquista = async (id) => {
    const res = await fetch(`${API}/squadra/acquista/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessaggio(data.message || data.detail);
    if (res.ok) setSquadra([...squadra, id]);
  };

  const categorie = [...new Set(atleti.map(a => a.categoria))];
  const atletiFiltrati = atleti
    .filter(a => filtro ? a.categoria === filtro : true)
    .filter(a => ricerca ? a.name.toLowerCase().includes(ricerca.toLowerCase()) : true);

  return (
    <div>
      <h2>🛒 Mercato</h2>
      {messaggio && <p style={{ color: "green" }}>{messaggio}</p>}
      <div style={{ marginBottom: 10, display: "flex", gap: 10 }}>
        <input
          placeholder="🔍 Cerca atleta..."
          value={ricerca}
          onChange={e => setRicerca(e.target.value)}
          style={{ padding: 8, flex: 1 }}
        />
        <select onChange={e => setFiltro(e.target.value)} style={{ padding: 8 }}>
          <option value="">Tutte le categorie</option>
          {categorie.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: 8, textAlign: "left" }}>Nome</th>
            <th>Categoria</th>
            <th>Punti</th>
            <th>Prezzo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {atletiFiltrati.map(a => (
            <tr key={a.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: 8 }}>{a.name}</td>
              <td style={{ textAlign: "center" }}>{a.categoria}</td>
              <td style={{ textAlign: "center" }}>{a.punti}</td>
              <td style={{ textAlign: "center" }}>{a.prezzo}</td>
              <td style={{ textAlign: "center" }}>
                {squadra.includes(a.id) ? (
                  <span style={{ color: "gray" }}>✓ In squadra</span>
                ) : (
                  <button onClick={() => acquista(a.id)} style={{ background: "#28a745", color: "white", border: "none", padding: "4px 8px", cursor: "pointer" }}>
                    Acquista
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function Classifica() {
  const [classifica, setClassifica] = useState([]);

  useState(() => {
    fetch(`${API}/classifica/`)
      .then(r => r.json())
      .then(setClassifica);
  }, []);

  return (
    <div>
      <h2>🏅 Classifica</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: 8 }}>#</th>
            <th style={{ textAlign: "left", padding: 8 }}>Utente</th>
            <th style={{ textAlign: "left" }}>Squadra</th>
            <th>Punti</th>
            <th>Atleti</th>
          </tr>
        </thead>
        <tbody>
          {classifica.map((u, i) => (
            <tr key={u.username} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ textAlign: "center", padding: 8 }}>{i + 1}</td>
              <td style={{ padding: 8 }}>{u.username}</td>
              <td>{u.squadra}</td>
              <td style={{ textAlign: "center" }}>{u.punti}</td>
              <td style={{ textAlign: "center" }}>{u.n_atleti}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Admin({ token }) {
  const [messaggio, setMessaggio] = useState("");
  const [mercatoAperto, setMercatoAperto] = useState(null);

  useState(() => {
    fetch(`${API}/admin/stato-mercato`)
      .then(r => r.json())
      .then(data => setMercatoAperto(data.mercato_aperto));
  }, []);

  const apriMercato = async () => {
    const res = await fetch(`${API}/admin/apri-mercato`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessaggio(data.message);
    setMercatoAperto(true);
  };

  const chiudiMercato = async () => {
    const res = await fetch(`${API}/admin/chiudi-mercato`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessaggio(data.message);
    setMercatoAperto(false);
  };

  return (
    <div>
      <h2>🔧 Pannello Admin</h2>
      {messaggio && <p style={{ color: "green" }}>{messaggio}</p>}
      <div style={{ marginBottom: 20 }}>
        <h3>Stato Mercato: {mercatoAperto ? "🟢 Aperto" : "🔴 Chiuso"}</h3>
        <button onClick={apriMercato} style={{ background: "#28a745", color: "white", border: "none", padding: "8px 16px", cursor: "pointer", marginRight: 10 }}>
          Apri Mercato
        </button>
        <button onClick={chiudiMercato} style={{ background: "#dc3545", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}>
          Chiudi Mercato
        </button>
      </div>
    </div>
  );
}

export default App;
