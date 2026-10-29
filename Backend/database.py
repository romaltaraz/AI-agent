import os

import mysql.connector
from dotenv import load_dotenv

# Read the settings from Backend/.env
load_dotenv()


def get_connection():
    """Open a new MySQL connection using the settings from .env."""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3307")),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "ai_chat"),
        connection_timeout=5,
    )
