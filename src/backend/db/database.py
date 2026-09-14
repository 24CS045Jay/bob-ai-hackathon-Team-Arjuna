"""
PortFlow AI — Database Connection & Session Management
Uses SQLite with SQLAlchemy ORM. Configurable via DB_PATH environment variable.
"""

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "portflow.db"
DB_PATH = os.getenv("DB_PATH", str(DEFAULT_DB_PATH))

DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
