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
        <button onClick={() => setPagina("regolamento")} style={{ marginLeft: 10 }}>Regolamento</button>
        {isAdmin && <button onClick={() => setPagina("admin")} style={{ marginLeft: 10, background: "#dc3545", color: "white", border: "none", padding: "5px 10px" }}>Admin</button>}
        <button onClick={() => { setToken(null); setPagina("login"); }} style={{ marginLeft: 10 }}>Logout</button>
      </nav>
      {pagina === "squadra" && <Squadra token={token} />}
      {pagina === "mercato" && <Mercato token={token} />}
      {pagina === "classifica" && <Classifica />}
      {pagina === "regolamento" && <Regolamento />}
      {pagina === "admin" && <Admin token={token} />}
    </div>
  );
}


function Login({ setToken, setPagina }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");
  const [successo, setSuccesso] = useState("");
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
      setSuccesso("Registrato! Ora fai login.");
      setErrore("");
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
      {successo && <p style={{ color: "green" }}>{successo}</p>}
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

  const categorie = [
  "Ragazzi Maschi", "Ragazze Femminile",
  "Allievi Maschi", "Allieve Femminile",
  "Junior Maschi", "Junior Femminile",
  "Senior Maschi", "Senior Femminile"
];


  const atletiPerCategoria = (cat) => squadra ? squadra.atleti.filter(a => a.categoria === cat).length : 0;
  const squadraCompleta = squadra ? squadra.atleti.length === 16 : false;

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
      
      {!squadraCompleta && (
        <div style={{ background: "#fff3cd", padding: 10, marginBottom: 10, borderRadius: 4 }}>
          <strong>⚠️ Squadra incompleta! Mancano:</strong>
          {categorie.map(cat => {
            const mancanti = 2 - atletiPerCategoria(cat);
            return mancanti > 0 ? (
              <p key={cat} style={{ margin: 2 }}>• {mancanti} atleti in {cat}</p>
            ) : null;
          })}
        </div>
      )}
      {squadraCompleta && <p style={{ color: "green" }}>✅ Squadra completa!</p>}

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

  useState(() => {
    caricaEventi();
    caricaClassifica("");
  }, []);

  const handleEvento = (e) => {
    setEventoSelezionato(e.target.value);
    caricaClassifica(e.target.value);
  };

  return (
    <div>
      <h2>🏅 Classifica</h2>
      <select onChange={handleEvento} value={eventoSelezionato} style={{ padding: 8, marginBottom: 16 }}>
        <option value="">🌍 Classifica Generale</option>
        {eventi.map(e => <option key={e} value={e}>{e}</option>)}
      </select>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: 8 }}>#</th>
            <th style={{ textAlign: "left", padding: 8 }}>Utente</th>
            <th style={{ textAlign: "left" }}>Squadra</th>
            <th>Punti</th>
          </tr>
        </thead>
        <tbody>
          {classifica.map((u, i) => (
            <tr key={u.username} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ textAlign: "center", padding: 8 }}>{i + 1}</td>
              <td style={{ padding: 8 }}>{u.username}</td>
              <td>{u.squadra}</td>
              <td style={{ textAlign: "center" }}>{u.punti}</td>
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
  const [gare, setGare] = useState([]);
  const [nuovaUrl, setNuovaUrl] = useState("");
  const [nuovaCategoria, setNuovaCategoria] = useState("Junior Maschi");
  const [nuovoMoltiplicatore, setNuovoMoltiplicatore] = useState("1.2");
  const [nuovoEvento, setNuovoEvento] = useState("");
  const [gareSelezionate, setGareSelezionate] = useState([]);

  const categorie = [
    "Ragazzi Maschi", "Ragazze Femminile",
    "Allievi Maschi", "Allieve Femminile",
    "Junior Maschi", "Junior Femminile",
    "Senior Maschi", "Senior Femminile"
  ];

  const caricaGare = async () => {
    const res = await fetch(`${API}/admin/gare`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setGare(await res.json());
  };

  useState(() => {
    fetch(`${API}/admin/stato-mercato`)
      .then(r => r.json())
      .then(data => setMercatoAperto(data.mercato_aperto));
    caricaGare();
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

  const aggiungiGara = async () => {
    const res = await fetch(`${API}/admin/aggiungi-gara?url=${encodeURIComponent(nuovaUrl)}&categoria=${encodeURIComponent(nuovaCategoria)}&moltiplicatore=${nuovoMoltiplicatore}&evento=${encodeURIComponent(nuovoEvento)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessaggio(data.message);
    setNuovaUrl("");
    setNuovoEvento("");
    caricaGare();
  };

  const eliminaGara = async (id) => {
    const res = await fetch(`${API}/admin/gara/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessaggio(data.message);
    caricaGare();
  };

  const calcolaPunti = async () => {
    setMessaggio("⏳ Calcolo punti in corso...");
    const res = await fetch(`${API}/admin/calcola-punti`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessaggio(data.message);
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

      <div style={{ marginBottom: 20 }}>
        <h3>➕ Aggiungi Gara</h3>
        <div style={{ marginBottom: 20 }}>
          <h3>🔗 Importa evento da URL index</h3>
          <input 
            placeholder="URL index evento (es. .../index.htm)" 
            id="urlIndex"
            style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }} 
          />
          <input 
            placeholder="Nome evento (es. Campionati Italiani 2026)" 
            id="nomeEvento"
            style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }} 
          />
          <button onClick={async () => {
            const url = document.getElementById("urlIndex").value;
            const nome = document.getElementById("nomeEvento").value;
            const res = await fetch(`${API}/admin/importa-evento?url_index=${encodeURIComponent(url)}&evento=${encodeURIComponent(nome)}`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setMessaggio(data.message);
            caricaGare();
          }} style={{ background: "#6f42c1", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}>
            Importa tutte le gare
          </button>
        </div>

        <input placeholder="Nome evento (es. Campionati Italiani 2026)" value={nuovoEvento} onChange={e => setNuovoEvento(e.target.value)} style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }} />
        <input placeholder="URL classifica FISR" value={nuovaUrl} onChange={e => setNuovaUrl(e.target.value)} style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }} />
        <select value={nuovaCategoria} onChange={e => setNuovaCategoria(e.target.value)} style={{ padding: 8, marginRight: 10 }}>
          {categorie.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={nuovoMoltiplicatore} onChange={e => setNuovoMoltiplicatore(e.target.value)} style={{ padding: 8, marginRight: 10 }}>
          <option value="1.2">×1.2 (veloce/lunga)</option>
          <option value="1.5">×1.5 (media)</option>
        </select>
        <button onClick={aggiungiGara} style={{ background: "#007bff", color: "white", border: "none", padding: "8px 16px", cursor: "pointer" }}>
          Aggiungi
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>📋 Gare inserite</h3>
        {gare.length === 0 ? <p>Nessuna gara inserita</p> : (
          <>
            <button onClick={async () => {
              for (const id of gareSelezionate) {
                await fetch(`${API}/admin/gara/${id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                });
              }
              setMessaggio(`${gareSelezionate.length} gare eliminate`);
              setGareSelezionate([]);
              caricaGare();
            }} style={{ background: "#dc3545", color: "white", border: "none", padding: "6px 12px", cursor: "pointer", marginBottom: 8 }}>
              🗑️ Elimina selezionate ({gareSelezionate.length})
            </button>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={{ padding: 8 }}>✓</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Evento</th>
                  <th>Categoria</th>
                  <th>Molt.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {gare.map(g => (
                  <tr key={g.id} style={{ borderBottom: "1px solid #ddd", background: gareSelezionate.includes(g.id) ? "#fff3cd" : "white" }}>
                    <td style={{ textAlign: "center", padding: 8 }}>
                      <input type="checkbox" checked={gareSelezionate.includes(g.id)} onChange={e => {
                        if (e.target.checked) setGareSelezionate([...gareSelezionate, g.id]);
                        else setGareSelezionate(gareSelezionate.filter(id => id !== g.id));
                      }} />
                    </td>
                    <td style={{ padding: 8 }}>{g.evento}</td>
                    <td style={{ textAlign: "center" }}>{g.categoria}</td>
                    <td style={{ textAlign: "center" }}>×{g.moltiplicatore}</td>
                    <td style={{ textAlign: "center" }}>
                      <button onClick={() => eliminaGara(g.id)} style={{ background: "#dc3545", color: "white", border: "none", padding: "4px 8px", cursor: "pointer" }}>
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>


      <div>
        <h3>🔄 Aggiorna Punti</h3>
        <p>Clicca per ricalcolare i punti di tutti gli atleti in base alle gare inserite.</p>
        <button onClick={calcolaPunti} style={{ background: "#fd7e14", color: "white", border: "none", padding: "10px 20px", cursor: "pointer", fontSize: 16 }}>
          🔄 Calcola Punti
        </button>
      </div>
    </div>
  );
}


function Regolamento() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2>📋 Regolamento FantaRoller</h2>
      
      <h3>🏗️ Formazione</h3>
      <p>Ogni squadra è composta da <strong>16 atleti</strong>:</p>
      <ul>
        <li>2 Ragazzi Maschi</li>
        <li>2 Ragazze Femminile</li>
        <li>2 Allievi Maschi</li>
        <li>2 Allieve Femminile</li>
        <li>2 Junior Maschi</li>
        <li>2 Junior Femminile</li>
        <li>2 Senior Maschi</li>
        <li>2 Senior Femminile</li>
      </ul>

      <h3>💰 Budget</h3>
      <p>Ogni utente ha a disposizione <strong>150 crediti</strong> per acquistare gli atleti.</p>

      <h3>🏆 Punteggi</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: 8, textAlign: "left" }}>Posizione</th>
            <th style={{ padding: 8 }}>Punti base</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["1°", 100], ["2°", 85], ["3°", 75], ["4°", 65], ["5°", 55],
            ["6°", 50], ["7°", 45], ["8°", 40], ["9°", 35], ["10°", 30],
            ["11° - 20°", 20], ["21° e oltre", 5]
          ].map(([pos, pts]) => (
            <tr key={pos} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: 8 }}>{pos}</td>
              <td style={{ padding: 8, textAlign: "center" }}>{pts}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>✖️ Moltiplicatori</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: 8, textAlign: "left" }}>Tipo gara</th>
            <th style={{ padding: 8 }}>Moltiplicatore</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid #ddd" }}>
            <td style={{ padding: 8 }}>Gara veloce</td>
            <td style={{ padding: 8, textAlign: "center" }}>×1.2</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #ddd" }}>
            <td style={{ padding: 8 }}>Gara media</td>
            <td style={{ padding: 8, textAlign: "center" }}>×1.5</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #ddd" }}>
            <td style={{ padding: 8 }}>Gara lunga</td>
            <td style={{ padding: 8, textAlign: "center" }}>×1.2</td>
          </tr>
        </tbody>
      </table>

      <h3>⚠️ Malus</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: 8, textAlign: "left" }}>Sanzione</th>
            <th style={{ padding: 8 }}>Punti</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid #ddd" }}>
            <td style={{ padding: 8 }}>Ammonizione</td>
            <td style={{ padding: 8, textAlign: "center", color: "orange" }}>-10</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #ddd" }}>
            <td style={{ padding: 8 }}>Diffida</td>
            <td style={{ padding: 8, textAlign: "center", color: "orange" }}>-20</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #ddd" }}>
            <td style={{ padding: 8 }}>Espulsione</td>
            <td style={{ padding: 8, textAlign: "center", color: "red" }}>-50</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}


export default App;
