import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection

load_dotenv()

app = FastAPI(title="Hebrew AI Chat API")

# CORS: only the local React dev server may call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    """Check that the server is running and the database is reachable."""
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        connection.close()
    except Exception:
        # Do not leak connection details or stack traces to the client.
        raise HTTPException(status_code=503, detail="Cannot connect to the database")
    return {"status": "ok", "database": "connected"}
