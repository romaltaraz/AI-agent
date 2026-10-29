# AGENTS.md

Guide for AI coding agents working on this repo. `CLAUDE.md` holds the full project brief and the phase rules; this file is the short version.

## Project
"צ'אט-לי": a ChatGPT-style chat website with a complete Hebrew, right-to-left UI. Single user, local use, no login. Final project of the John Bryce Full Stack & Gen AI course. The owner is a beginner who must be able to explain every line, so keep code simple.

## Structure
```
Backend/    FastAPI. main.py (app, CORS), routes.py (conversations), message_routes.py (send/regenerate/edit),
            queries.py (ALL SQL), ai.py (OpenAI calls), schemas.py (Pydantic), database.py, postman_collection.json
Frontend/   React + Vite. src/pages, src/components (each with its own .css), src/hooks (useChat, useConversationList), src/config.js
Database/   schema.sql (structure only), ai_chat_export.sql (structure + sample data)
docs/       README screenshots, SUBMISSION.md (final checklist)
docker-compose.yml   mysql + backend + frontend + phpMyAdmin (port 8080, root / change_me)
```

## Run and test
Manual (needs the Compose MySQL on localhost:3307; see README). From the project root, in PowerShell:
```
docker compose up -d mysql
cd Backend
venv\Scripts\activate
uvicorn main:app --reload
```
Backend health check: http://localhost:8000/api/health. Frontend, in a second terminal from the project root (http://localhost:5173):
```
cd Frontend
npm run dev
```
Lint and build:
```
cd Frontend
npm run lint
npm run build
```
Docker (reads `Backend/.env`; overrides the DB settings itself). App on http://localhost:5173, MySQL on host port 3307, phpMyAdmin on http://localhost:8080:
```
docker compose up --build
```
Stop and keep the data:
```
docker compose down
```
Stop and reset the database:
```
docker compose down -v
```
API check: import `Backend/postman_collection.json` into Postman and run it in order (it cleans up after itself).
There is no automated test suite. Verify changes by running the app. Never claim something was tested if it was not.

## Conventions
- Backend: plain parameterized SQL with `mysql-connector-python`. No ORM. All SQL lives in `queries.py`.
- Frontend: plain CSS next to each component, native `fetch`, `react-markdown`, `lucide-react`. No new libraries without asking the owner.
- Files stay around 150 lines or less where practical. No speculative abstractions.
- The app name is the constant `APP_NAME` and the disclaimer text is `DISCLAIMER_TEXT`, both in `Frontend/src/config.js`.
- Talk to the owner in simple, clear English. The app UI stays Hebrew.
- Do not run Git commands unless the owner asks. Do not delete or modify the owner's conversations in the database.

## Key rules
- **SQL:** always parameterized (`%s` placeholders), never string-built from user text.
- **Secrets:** only in `Backend/.env` (gitignored). The OpenAI key is used only by the backend. Never print it, commit it, or put it in the frontend. `.env`, `node_modules`, `venv` and `_review` must never be in a submission.
- **UI:** Hebrew, `dir="rtl"`, `dir="auto"` on message text, code blocks left-to-right, turquoise accent, responsive (the sidebar is a drawer on phones).
- **AI context:** system instruction + response-style instruction + the latest 30 messages of the same conversation only.
- **Chat behavior (CLAUDE.md section 9):**
  - *Send:* save the user message first, then call the AI, then save the reply. If the AI fails, the user message stays and the conversation ends without an answer.
  - *Regenerate:* generate the new answer from the context without the old answer. Delete the old one only after the new one succeeded, in one transaction.
  - *Retry:* when the last message is a user message with no answer, the same `/regenerate` endpoint generates the missing answer. Never insert the user message again.
  - *Edit:* only the latest user message. Delete it and the answer after it, save the edit, then generate a new answer. If that fails, the edited message stays and retry works.
  - Guard against duplicates: the backend returns 409 if the conversation changed meanwhile, and the frontend disables the buttons during a request.
  - Whenever a message is added, edited or regenerated, update the conversation's `updated_at` (changing the response style does not).
- **Titles:** one short extra AI call after the first reply; fall back to the start of the first message. A title failure never fails the chat.
- **Database:** `messages.conversation_id` uses `ON DELETE CASCADE`. The conversation list shows only conversations that have at least one message.
