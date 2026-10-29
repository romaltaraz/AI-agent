// The application name lives here only - change it in one place.
export const APP_NAME = "צ'אט-לי";

// Address of the FastAPI backend. Normally this default is used; the optional
// VITE_API_URL setting only exists so a second copy can be run on another port.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Must match the backend limit (MAX_MESSAGE_LENGTH in schemas.py).
export const MAX_MESSAGE_LENGTH = 4000;

// Small note shown under the chat input and at the bottom of the About page.
export const DISCLAIMER_TEXT =
  "אני עלול לטעות, במיוחד בפרטים עדכניים או בנושאים חשובים, ולכן כדאי לבדוק מידע קריטי מול מקור מוסמך.";
