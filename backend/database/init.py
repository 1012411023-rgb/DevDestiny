from database.db import Base, engine
from database.models import *

def init_db():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

if __name__ == "__main__":
    init_db()