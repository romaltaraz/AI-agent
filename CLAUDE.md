# Project Brief — Hebrew AI Chat (John Bryce Final Project)

## 1. Context and Working Rules

I am a student in John Bryce's Full Stack & Gen AI course. This is my final project.

I am a beginner developer, and I need to understand and explain the code during my final project presentation. I also have limited time, so the project must be polished and reliable without unnecessary complexity.

Follow these rules throughout the project:

* Work on ONE phase at a time.
* Before starting, briefly explain the goal of the phase.
* At the end of each phase, summarize what you implemented, explain important decisions in simple English, and provide exact testing instructions.
* STOP after each phase. Do not begin the next phase until I explicitly approve it.
* Keep the code simple, readable, and well organized.
* Aim for files under approximately 150 lines when practical. Do not split code artificially just to meet a line limit.
* Do not introduce libraries, features, design patterns, or abstractions that are not needed.
* If you believe an additional dependency or a significant architectural change is necessary, explain why in simple English and ask me before adding it.
* Do not silently change agreed requirements.
* Do not overwrite existing files or remove existing work without first inspecting it and explaining the need.
* Communicate with me in simple, clear English: all messages, explanations, summaries, and questions. Hebrew text displays reversed in the VS Code terminal. This applies only to how you talk to me. All user-facing text in the application itself stays in Hebrew.
* Explain technical concepts in simple English, without assuming I already know them.
* Prioritize correctness, understandable code, security, and a polished user experience over unnecessary features.

## 2. Project Goal

Build a ChatGPT-style website with a complete Hebrew, right-to-left interface.

The user should be able to:

* Start conversations with an AI assistant.
* Continue existing conversations with their previous context.
* View saved conversations in a sidebar.
* Search conversations by title.
* Edit the most recent user message and receive a new answer.
* Regenerate the latest AI answer.
* Choose a response style.
* Delete conversations.
* Read AI responses with correctly formatted Markdown and code blocks.

The application should look and feel like a small, polished product rather than a basic classroom exercise.

This is a single-user application intended for local development, testing, and final-project presentation on my own computer. It does not need authentication, registration, or a multi-user system.

All conversations may appear in one shared list. Do not implement login, user accounts, browser ownership identifiers, or multi-user permissions.

## 3. Mandatory Course Requirements

The project must include:

* Frontend: React single-page application.
* Backend: Python with FastAPI REST API.
* Database: MySQL.
* OpenAI API calls exclusively on the backend.
* The OpenAI API key stored in the backend `.env` file.
* `.env` included in `.gitignore`; never expose or commit the real API key.
* `requirements.txt` for Python dependencies.
* Conversations and messages saved in MySQL.
* Every message must identify its sender as either `user` or `assistant`.
* Every conversation must have a unique ID.
* The complete conversation must be displayed in the interface.
* The AI must receive relevant conversation history when responding.
* A New Chat button.
* An About page and a navigation menu between Home and About.
* A GitHub repository and a README containing the repository link.
* A final submission structure containing:
  * A root folder named with my full name in English.
  * `Database` with a MySQL export.
  * `Backend`.
  * `Frontend`.
  * An exported Postman collection inside `Backend`.
* Do not include `.env`, `node_modules`, or a Python virtual environment in the final submission.

### Folder structure from the start

Use the final submission folder names from the very beginning, so nothing needs to be reorganized before submission:

* `Backend/` — the FastAPI project.
* `Frontend/` — the React project.
* `Database/` — `schema.sql` and, later, the MySQL export.

## 4. Agreed Technology Stack

### Frontend

* React with Vite.
* `react-router-dom` for navigation.
* Plain CSS, organized by page or component.
* Native `fetch` for API requests.
* `react-markdown` for AI responses.
* `lucide-react` for icons.

### Backend

* Python.
* FastAPI.
* Pydantic for request validation.
* The official `openai` Python package.
* `mysql-connector-python` with readable, parameterized SQL queries.
* `python-dotenv` for environment variables.
* `requirements.txt`.

Do not add an ORM or another database abstraction unless there is a clear reason and I approve it first.

The OpenAI model name must be configurable through `OPENAI_MODEL` in the backend `.env`.

Before implementing OpenAI calls, recommend a currently available, inexpensive model suitable for a simple chat application. Explain the expected cost considerations and ask me to confirm the model name before using it. Do not guess that a model is currently available.

## 5. Database Design

Use MySQL with two main tables.

### `conversations`

* `id`: integer, primary key, auto-increment.
* `title`: short text, default value `שיחה חדשה`.
* `response_style`: one of `short`, `detailed`, or `simple`; default `detailed`.
* `created_at`: creation timestamp.
* `updated_at`: last-update timestamp.

### `messages`

* `id`: integer, primary key, auto-increment.
* `conversation_id`: foreign key referencing `conversations.id`.
* `role`: either `user` or `assistant`.
* `content`: message text.
* `created_at`: creation timestamp.

Deleting a conversation must also delete its messages through a foreign key with `ON DELETE CASCADE`.

Whenever a message is added, edited, or regenerated, explicitly update the conversation's `updated_at`, so the sidebar is sorted by latest activity. (Adding a row to `messages` does not update `conversations` automatically.)

Create a readable `schema.sql` file in `Database/` that creates the database and tables.

Use parameterized SQL queries rather than building SQL queries by concatenating user-provided text.

Keep the database design simple. Do not add tables or fields unless needed for the agreed functionality.

## 6. API Design

The intended REST endpoints are:

### Conversations

* `GET /api/conversations?search=`
  * Return conversation IDs, titles, and update timestamps.
  * Sort by most recently updated.
  * Support optional title search.

* `POST /api/conversations`
  * Create a new conversation.

* `GET /api/conversations/{id}`
  * Return conversation details and its messages in chronological order.

* `PATCH /api/conversations/{id}`
  * Update the response style.

* `DELETE /api/conversations/{id}`
  * Delete the conversation and its messages.

### Messages

* `POST /api/conversations/{id}/messages`
  * Validate and save the user message.
  * Generate an AI reply.
  * Save and return the assistant reply.

* `POST /api/conversations/{id}/regenerate`
  * Regenerate the latest assistant reply, or generate a missing reply after a failed request (retry).
  * Never create a duplicate user message.

* `PUT /api/conversations/{id}/messages/last`
  * Edit the most recent user message and generate a replacement answer.

Return appropriate HTTP status codes and clear error messages.

Before implementing these endpoints, verify that their behavior covers the requirements below. You may recommend a small change to the endpoint design if it prevents a real bug, but explain the reason before making a significant change.

## 7. Conversation Context and OpenAI Costs

Each AI response should use:

1. A system instruction.
2. The selected response-style instruction.
3. The latest 30 messages from the current conversation only, in chronological order.

Do not send messages from other conversations.

The model should answer in the language used by the user, with Hebrew as the default.

Response styles:

* `short`: brief and to the point.
* `detailed`: thorough answers with explanations.
* `simple`: plain, everyday language suitable for a beginner.

The selected style is stored in the conversation and applies to future answers. Changing the style must not rewrite old messages.

### Cost control

* Keep prompts concise.
* Do not make unnecessary OpenAI calls.
* Do not use a more expensive model when a cheaper suitable model is sufficient.
* Do not add embeddings, vector databases, automatic conversation summaries, or other advanced context mechanisms.
* Use the latest 30 messages as the initial context limit.
* Make the model configurable through `.env`.
* Never expose the API key or other secrets to the frontend.

## 8. Automatic Conversation Titles

After the first assistant reply, generate a short Hebrew title describing the conversation.

Requirements:

* Aim for approximately five words or fewer.
* Use a short, inexpensive additional OpenAI request.
* Keep the title-generation prompt minimal.
* Avoid generating a title repeatedly for an existing conversation.
* If title generation fails, use a short, sensible portion of the first user message as a fallback.
* Failure to generate a title must not cause the main chat response to fail.
* Do not make any additional title-generation calls when they are unnecessary.

The main purpose is to make the conversation history easy to browse without adding significant cost.

## 9. Correct Behavior for Sending, Editing, Regenerating, and Retrying

These features require special attention because incorrect handling can corrupt the conversation history.

### General failure rule (applies to all three operations)

* The user's message is saved before the AI request is made, so it is never lost.
* If the AI request fails, the conversation ends with a user message that has no assistant reply after it. This is a valid, consistent state.
* The user recovers from this state with the "retry" action, which calls the regenerate endpoint (see below).

### Send a message

1. Verify that the conversation exists and the message is valid.
2. Save the user message.
3. Generate the AI reply using the context rules in section 7.
4. Save the assistant reply and return it.

If step 3 fails, return a clear error. The saved user message stays, and the user can retry.

### Regenerate the latest answer / Retry after a failure

When the user clicks regenerate or retry:

1. Verify that the conversation exists.
2. Check the latest message in the conversation:
   * **Regenerate case:** the latest message is an assistant message preceded by a user message. Generate a new answer using the context *without* the old assistant answer. Only after the new answer is generated successfully, delete the old assistant answer and save the new one. If generation fails, the old answer remains, and nothing is lost.
   * **Retry case:** the latest message is a user message with no assistant reply after it (because a previous AI request failed). Generate the missing reply and save it.
   * Any other state (for example, an empty conversation): return a clear error.
3. Return the new answer to the frontend.

Never insert another copy of the user message.

### Edit the latest user message

When the user edits the most recent user message:

1. Verify that the conversation exists and the edited text is valid.
2. Verify that the operation targets the latest user message.
3. Delete that user message and the assistant answer after it, if present.
4. Save the edited user message.
5. Generate and save a new answer using the correct preceding context.
6. Return the updated conversation state.

The previous version of the edited message and its outdated answer must not remain in the active context sent to OpenAI.

If step 5 fails, the edited user message stays saved with no reply after it, and the user can use retry.

Do not add message versioning, branching, or an undo system.

### Avoid duplicate requests

Prevent accidental duplicate message submissions caused by repeated clicks or frontend retries wherever practical.

The frontend should disable the relevant action while a request is in progress.

Do not add a complex queue or job system for these operations.

## 10. Validation and Basic Security

Even though this is a local, single-user project, implement sensible basic protections.

* Validate request data using Pydantic.
* Reject empty messages and messages exceeding a reasonable length.
* Use parameterized SQL queries.
* Verify that referenced conversations and messages exist.
* Return clear errors for missing conversations, invalid response styles, and failed AI requests.
* Do not expose API keys, environment variables, stack traces, or sensitive server details in API responses.
* Keep the OpenAI key on the backend only.
* Handle database and OpenAI errors without silently corrupting conversation history.
* Avoid duplicate submissions when the user clicks a button multiple times.
* Configure CORS for the local frontend development origin rather than allowing every origin without a reason.
* Do not build an authentication system, role system, or unnecessary security framework.

Explain any security-related choice in simple English.

## 11. User Interface and Design

### Overall design

* Full Hebrew interface.
* Right-to-left layout using `dir="rtl"`.
* Use `dir="auto"` on message text so mixed Hebrew and English displays correctly.
* Light, modern, clean, polished appearance.
* Turquoise as the main accent color, with soft complementary tones.
* Rounded corners, subtle shadows, and restrained transitions.
* No loud saturated colors and no orange primary buttons.
* Use a Hebrew-friendly font such as Heebo or Rubik.
* Responsive layout for desktop and mobile.
* Keep the design consistent across pages.
* Store the application name in one clearly identifiable constant so it can be changed easily.

Do not use copyrighted characters or copy another product's interface exactly.

### Chat page

Include:

* Sidebar with a New Chat button.
* Search field filtering conversations by title.
* Conversation list sorted by most recent activity.
* Delete button for each conversation.
* A custom confirmation modal instead of `window.confirm`.
* A mobile sidebar drawer with a menu button.
* A welcome screen when no conversation is open.
* Three or four clickable example prompts on the welcome screen.
* Clearly differentiated user and assistant messages.
* Markdown rendering for assistant replies.
* Code blocks displayed left-to-right, with a copy button.
* An edit button on the latest user message only.
* A regenerate button under the latest assistant message only.
* A retry button when the latest user message has no reply because of an error.
* Response-style selector near the message input.
* Loading indicators while waiting for the AI.
* Clear Hebrew error messages with a retry action.

Never silently discard a user's message after an error.

When the page is refreshed, show the welcome screen rather than automatically opening the last conversation. Previous conversations must remain available in the sidebar.

### About page

Create a designed About page containing:

* An About Me card with a photo placeholder.
* A short biography placeholder.
* GitHub and LinkedIn link placeholders.
* Feature cards with icons.
* A technology section showing React, FastAPI, MySQL, and OpenAI.
* A simple diagram showing React → FastAPI → OpenAI and FastAPI ↔ MySQL.
* Friendly illustrations in one consistent free style, recolored to match the turquoise palette.

Do not invent my personal details, biography, photograph, or profile links. Use clearly marked placeholders that I can replace.

Use a consistent visual style throughout the application.

## 12. Error Handling

The frontend must display clear Hebrew messages for common failures, including:

* Network errors.
* Failed OpenAI requests.
* Invalid or missing conversations.
* Empty messages.
* Database or server errors.

Do not show raw stack traces to the user.

The user's message must remain visible if a request fails.

Provide a retry option when appropriate, using the retry behavior defined in section 9. Ensure retries do not duplicate messages or leave outdated answers in the conversation.

## 13. Development Phases

Work through these phases in order.

### Phase 1 — Setup and Database

* Inspect the existing workspace before making changes.
* Check whether Python, Node.js, and Docker are available. MySQL runs in a Docker container (I set it up myself); connect to it through the settings in `.env`.
* Create the `Backend/`, `Frontend/`, and `Database/` folders (see section 3). Leave `Frontend/` empty for now.
* Create the minimal FastAPI backend structure inside `Backend/`.
* Create `Database/schema.sql`.
* Configure the database connection through environment variables.
* Add a basic health-check endpoint that also checks the database connection.
* Create `requirements.txt`.
* Configure `.gitignore` to exclude `.env`, Python virtual environments, `node_modules`, and other generated files.
* Provide a safe `.env.example` containing placeholder values only.

Do not require an OpenAI API key for this phase. The AI integration belongs to a later phase.

At the end, explain how to start the backend, create the database, configure the local environment, and test the health endpoint and database connection.

STOP after Phase 1.

### Phase 2 — Core API

* Recommend an OpenAI model and wait for my confirmation (see section 4).
* Implement conversation creation, retrieval, listing, and deletion.
* Implement sending a message and receiving an OpenAI reply.
* Save messages and conversation data in MySQL.
* Implement conversation context.
* Add Postman requests for the implemented endpoints.
* Test the complete message flow.

Stop and wait for my approval.

### Phase 3 — Basic Frontend

* Set up the React application inside `Frontend/`.
* Implement the RTL layout and navigation.
* Create the Home and About page foundations.
* Connect the frontend to the core API.
* Make the basic chat flow work end to end.

Stop and wait for my approval.

### Phase 4 — Conversation Sidebar

* Add New Chat.
* Display saved conversations.
* Implement title search.
* Implement deletion with a custom confirmation modal.
* Ensure the UI refreshes correctly after changes.

Stop and wait for my approval.

### Phase 5 — Advanced Chat Features

* Automatic conversation titles.
* Regenerate the latest assistant answer, including the retry case.
* Edit the latest user message and regenerate the answer.
* Response-style selection.
* Correct handling of failed requests and duplicate submissions.

Stop and wait for my approval.

### Phase 6 — UI Polish

* Markdown and code-block formatting.
* Copy buttons for code.
* Welcome screen and example prompts.
* Loading indicators and error states.
* Mobile layout and sidebar drawer.
* Final About page.
* Visual consistency and responsive testing.

Stop and wait for my approval.

### Phase 7 — Final Submission

* Complete README with setup instructions and GitHub repository link.
* Verify `.gitignore` and `.env.example`.
* Export the Postman collection into `Backend/`.
* Export the MySQL database into `Database/`.
* Verify the required submission folder structure.
* Provide a manual testing checklist.
* Ensure `.env`, `node_modules`, and the Python virtual environment are not included in the final submission.

Stop when the final checklist is complete.

## 14. Testing Expectations

At the end of every phase:

* Provide a concise summary of changes.
* Explain important decisions in simple English.
* List the exact commands needed to run or test the work.
* Provide a short manual test checklist.
* Report any tests that failed or could not be run.
* Do not claim something was tested unless you actually tested it.
* Identify known limitations honestly.

Every implemented API endpoint should eventually have a corresponding Postman request with example data. 