from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Index, Integer, String, ForeignKey, Table, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

squadra_atleti = Table(
    "squadra_atleti",
    Base.metadata,
    Column("squadra_id", Integer, ForeignKey("squadre.id")),
    Column("atleta_id", Integer, ForeignKey("athletes.id")),
    Column("prezzo_pagato", Integer, default=0)
)
utente_leghe = Table(
    "utente_leghe",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("league_id", Integer, ForeignKey("leagues.id"))
)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True, nullable=True)
    email_verificata = Column(Integer, default=0)
    token_verifica = Column(String, nullable=True)
    password = Column(String)
    is_admin = Column(Integer, default=0)
    squadre = relationship("Squadra", back_populates="utente")
    leghe = relationship("League", secondary=utente_leghe)

class League(Base):
    __tablename__ = "leagues"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True)
    codice = Column(String, unique=True, nullable=True)
    owner_id = Column(Integer)
    tipo = Column(String, default="privata")
    modalita = Column(String, default="listone")
    modalita_economica = Column(String, default="continuita")
    crediti_iniziali = Column(Integer, default=500)
    atleti_per_categoria = Column(Integer, default=2)
    mercato_aperto = Column(Integer, default=1)
    membri = relationship("User", secondary=utente_leghe)
    competizioni = relationship("CompetizioneLega", back_populates="lega")

class EventoCatalogo(Base):
    __tablename__ = "eventi_catalogo"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False, unique=True)
    descrizione = Column(String, nullable=True)
    data_evento = Column(String, nullable=True)
    url_risultati = Column(String, nullable=True)
    stato = Column(String, default="disponibile", nullable=False)

class EventoLega(Base):
    __tablename__ = "eventi_leghe"
    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(Integer, ForeignKey("eventi_catalogo.id"), nullable=False)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=False)
    stato = Column(String, nullable=False, default="in_attesa")
    creato_il = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    evento = relationship("EventoCatalogo")
    lega = relationship("League")
    __table_args__ = (UniqueConstraint("evento_id", "league_id", name="uq_evento_lega"),)

class CompetizioneLega(Base):
    __tablename__ = "competizioni_leghe"
    id = Column(Integer, primary_key=True, index=True)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=False)
    evento_id = Column(Integer, ForeignKey("eventi_catalogo.id"), nullable=False)
    numero = Column(Integer, nullable=False, default=1)
    fase = Column(String, nullable=False, default="configurata")
    finalizzato_da = Column(Integer, ForeignKey("users.id"), nullable=True)
    finalizzato_il = Column(DateTime(timezone=True), nullable=True)
    lega = relationship("League", back_populates="competizioni")
    evento = relationship("EventoCatalogo")
    rose = relationship("RosaCompetizione", back_populates="competizione")
    risultati = relationship("PuntiCompetizione", back_populates="competizione")
    __table_args__ = (UniqueConstraint("league_id", "numero", name="uq_competizione_lega_numero"),)

class RosaCompetizione(Base):
    __tablename__ = "rose_competizione"
    id = Column(Integer, primary_key=True, index=True)
    competizione_id = Column(Integer, ForeignKey("competizioni_leghe.id"), nullable=False)
    squadra_id = Column(Integer, ForeignKey("squadre.id"), nullable=False)
    squadra_nome = Column(String, nullable=False)
    atleta_id = Column(Integer, ForeignKey("athletes.id"), nullable=False)
    atleta_nome = Column(String, nullable=False)
    categoria = Column(String, nullable=False)
    prezzo_pagato = Column(Integer, nullable=False, default=0)
    competizione = relationship("CompetizioneLega", back_populates="rose")
    atleta = relationship("Athlete")
    __table_args__ = (UniqueConstraint("competizione_id", "squadra_id", "atleta_id", name="uq_rosa_competizione_atleta"),)

class PuntiCompetizione(Base):
    __tablename__ = "punti_competizione"
    id = Column(Integer, primary_key=True, index=True)
    competizione_id = Column(Integer, ForeignKey("competizioni_leghe.id"), nullable=False)
    atleta_id = Column(Integer, ForeignKey("athletes.id"), nullable=False)
    punti = Column(Integer, nullable=False, default=0)
    competizione = relationship("CompetizioneLega", back_populates="risultati")
    atleta = relationship("Athlete")
    __table_args__ = (UniqueConstraint("competizione_id", "atleta_id", name="uq_punti_competizione_atleta"),)

class RisultatoPartecipante(Base):
    __tablename__ = "risultati_partecipanti"
    id = Column(Integer, primary_key=True, index=True)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=False)
    competizione_id = Column(Integer, ForeignKey("competizioni_leghe.id"), nullable=False)
    squadra_id = Column(Integer, ForeignKey("squadre.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    atleta_id = Column(Integer, ForeignKey("athletes.id"), nullable=False)
    squadra_nome = Column(String, nullable=False)
    username = Column(String, nullable=False)
    atleta_nome = Column(String, nullable=False)
    punti = Column(Integer, nullable=False, default=0)
    creato_il = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    __table_args__ = (UniqueConstraint("competizione_id", "squadra_id", "atleta_id", name="uq_risultato_partecipante_atleta"),)

class ClassificaCompetizione(Base):
    __tablename__ = "classifiche_competizione"
    id = Column(Integer, primary_key=True, index=True)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=False)
    competizione_id = Column(Integer, ForeignKey("competizioni_leghe.id"), nullable=False)
    squadra_id = Column(Integer, ForeignKey("squadre.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    squadra_nome = Column(String, nullable=False)
    username = Column(String, nullable=False)
    numero_atleti = Column(Integer, nullable=False, default=0)
    punti_atleti = Column(Integer, nullable=False, default=0)
    punti_bonus = Column(Integer, nullable=False, default=0)
    punti_totali = Column(Integer, nullable=False, default=0)
    __table_args__ = (UniqueConstraint("competizione_id", "squadra_id", name="uq_classifica_competizione_squadra"),)

class CorrezioneRisultato(Base):
    __tablename__ = "correzioni_risultati"
    id = Column(Integer, primary_key=True, index=True)
    competizione_id = Column(Integer, ForeignKey("competizioni_leghe.id"), nullable=False)
    squadra_id = Column(Integer, ForeignKey("squadre.id"), nullable=True)
    atleta_id = Column(Integer, ForeignKey("athletes.id"), nullable=False)
    punti_precedenti = Column(Integer, nullable=False)
    punti_nuovi = Column(Integer, nullable=False)
    autore_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    motivazione = Column(String, nullable=False)
    creato_il = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class TransazioneMercato(Base):
    __tablename__ = "transazioni_mercato"
    id = Column(Integer, primary_key=True, index=True)
    chiave_idempotenza = Column(String, nullable=False, unique=True)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=False)
    squadra_id = Column(Integer, ForeignKey("squadre.id"), nullable=False)
    atleta_id = Column(Integer, ForeignKey("athletes.id"), nullable=False)
    competizione_id = Column(Integer, ForeignKey("competizioni_leghe.id"), nullable=True)
    tipo = Column(String, nullable=False)
    prezzo = Column(Integer, nullable=False)
    plusvalenza = Column(Integer, nullable=True)
    creato_il = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    atleta = relationship("Athlete")

class Squadra(Base):
    __tablename__ = "squadre"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    league_id = Column(Integer, ForeignKey("leagues.id"))
    budget = Column(Integer, default=200)
    punti_bonus = Column(Integer, default=0)
    is_new = Column(Integer, default=0)
    utente = relationship("User", back_populates="squadre")
    lega = relationship("League")
    atleti = relationship("Athlete", secondary=squadra_atleti)

class Athlete(Base):
    __tablename__ = "athletes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    categoria = Column(String)
    punti = Column(Integer)
    prezzo = Column(Integer)
    prezzo_precedente = Column(Integer, default=0)
    gare = Column(Integer)
    malus = Column(Integer, default=0)
    visibile = Column(Integer, default=1)
    tessera = Column(String, nullable=True)
    sesso = Column(String, nullable=True)
    categoria_2027 = Column(String, nullable=True)
    valutazione = Column(Float, nullable=True)
    gare_storiche = Column(Integer, nullable=True)

    __table_args__ = (
        Index("uq_athletes_tessera", "tessera", unique=True),
    )

class Impostazioni(Base):
    __tablename__ = "impostazioni"
    id = Column(Integer, primary_key=True)
    mercato_aperto = Column(Integer, default=1)

class Gara(Base):
    __tablename__ = "gare"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String)
    categoria = Column(String)
    moltiplicatore = Column(String)
    evento = Column(String)
    completata = Column(Integer, default=0)

class Messaggio(Base):
    __tablename__ = "messaggi"
    id = Column(Integer, primary_key=True, index=True)
    testo = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    league_id = Column(Integer, ForeignKey("leagues.id"))

class PuntiEvento(Base):
    __tablename__ = "punti_evento"
    id = Column(Integer, primary_key=True, index=True)
    atleta_id = Column(Integer, ForeignKey("athletes.id"))
    evento = Column(String)
    categoria = Column(String)
    punti = Column(Integer, default=0)
    atleta = relationship("Athlete")
