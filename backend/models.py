from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

squadra_atleti = Table(
    "squadra_atleti",
    Base.metadata,
    Column("squadra_id", Integer, ForeignKey("squadre.id")),
    Column("atleta_id", Integer, ForeignKey("athletes.id"))
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
    crediti_iniziali = Column(Integer, default=200)
    atleti_per_categoria = Column(Integer, default=2)
    mercato_aperto = Column(Integer, default=1)
    membri = relationship("User", secondary=utente_leghe)

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