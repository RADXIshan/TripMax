import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import backend_dir, root_dir
from dotenv import load_dotenv

# Ensure environment variables are loaded
for env_candidate in [backend_dir / ".env", root_dir / ".env"]:
    if env_candidate.exists():
        load_dotenv(dotenv_path=env_candidate, override=False)
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is missing!")

# Neon connection string might have sslmode or pooler settings
# Ensure psycopg driver compatibility if dialect is plain postgresql://
connect_args = {}
if "sslmode=require" in DATABASE_URL:
    # psycopg 3 handles sslmode query parameter natively
    pass

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
