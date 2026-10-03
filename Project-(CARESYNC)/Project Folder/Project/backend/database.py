import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Enter your plain MySQL password here (even if it contains @, #, etc.)
raw_password = "Skylar@337"

# 2. Automatically encodes special characters so they don't break the URL
encoded_password = urllib.parse.quote_plus(raw_password)

# 3. Connection string with encoded password
DATABASE_URL = f"mysql+pymysql://root:{encoded_password}@127.0.0.1:3306/healthcare_dashboard"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()