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
    password = Column(String)
    budget = Column(Integer, default=150)
    is_admin = Column(Integer, default=0)
    league_id = Column(Integer, nullable=True)
    squadra = relationship("Squadra", back_populates="utente", uselist=False)
    leghe = relationship("League", secondary=utente_leghe)

class League(Base):
    __tablename__ = "leagues"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True)
    codice = Column(String, unique=True)
    owner_id = Column(Integer)
    membri = relationship("User", secondary=utente_leghe)

class Squadra(Base):
    __tablename__ = "squadre"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    utente = relationship("User", back_populates="squadra")
    atleti = relationship("Athlete", secondary=squadra_atleti)

class Athlete(Base):
    __tablename__ = "athletes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    categoria = Column(String)
    punti = Column(Integer)
    prezzo = Column(Integer)
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

class PuntiEvento(Base):
    __tablename__ = "punti_evento"
    id = Column(Integer, primary_key=True, index=True)
    atleta_id = Column(Integer, ForeignKey("athletes.id"))
    evento = Column(String)
    categoria = Column(String)
    punti = Column(Integer, default=0)
    atleta = relationship("Athlete")