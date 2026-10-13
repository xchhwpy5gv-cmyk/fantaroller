from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr

class AggiungiEmailRequest(BaseModel):
    username: str
    password: str
    email: EmailStr

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AggiornaPrezzoRequest(BaseModel):
    atleta_id: int
    nuovo_prezzo: int

class LeagueCreate(BaseModel):
    nome: str
    tipo: str
    modalita: str
    modalita_economica: str = "continuita"
    codice: str | None = None
    crediti_iniziali: int = 500
    atleti_per_categoria: int = 2

class EventoCatalogoCreate(BaseModel):
    nome: str
    descrizione: str | None = None
    data_evento: str | None = None
    url_risultati: str | None = None

class SelezionaEventoRequest(BaseModel):
    league_id: int
    evento_id: int
    conferma_reset: bool = False

class AssociaEventoLegheRequest(BaseModel):
    league_ids: list[int]

class CorrezionePunteggioAtleta(BaseModel):
    atleta_id: int
    punti: int

class CorrezioneRisultatoRequest(BaseModel):
    motivazione: str
    risultati: list[CorrezionePunteggioAtleta]

class AggiungiAtletaManualeRequest(BaseModel):
    league_id: int
    atleta_id: int
    prezzo: int
