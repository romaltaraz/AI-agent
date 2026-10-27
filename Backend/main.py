import logging
import os

import mysql.connector
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import get_connection
from routes import router

load_dotenv()

app = FastAPI(title="Hebrew AI Chat API")
app.include_router(router)


@app.exception_handler(mysql.connector.Error)
def database_error_handler(request: Request, error: mysql.connector.Error):
    """Any database error becomes a clean 500. Details go to the server log only."""
    logging.error("Database error: %s", error)
    return JSONResponse(status_code=500, content={"detail": "Database error"})

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
