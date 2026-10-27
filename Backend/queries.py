"""All SQL lives here. Every query is parameterized (values are passed separately
from the SQL text), so user input can never be run as SQL."""
from contextlib import contextmanager

from database import get_connection

CONTEXT_LIMIT = 30  # how many recent messages are sent to the AI
DEFAULT_TITLE = "שיחה חדשה"  # must match the default in Database/schema.sql


@contextmanager
def _cursor():
    """Open a connection, give a cursor that returns dicts, commit and close at the end."""
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        yield cursor
        connection.commit()
    finally:
        connection.close()


def list_conversations(search=""):
    """Conversations that have at least one message, newest activity first."""
    # In LIKE, % and _ are wildcards. Escape them so a search for "%" means a real "%".
    escaped = search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    with _cursor() as cursor:
        cursor.execute(
            "SELECT id, title, updated_at FROM conversations "
            "WHERE title LIKE %s "
            "AND EXISTS (SELECT 1 FROM messages WHERE messages.conversation_id = conversations.id) "
            "ORDER BY updated_at DESC, id DESC",
            (f"%{escaped}%",),
        )
        return cursor.fetchall()


def create_conversation(response_style="detailed"):
    with _cursor() as cursor:
        cursor.execute("INSERT INTO conversations (response_style) VALUES (%s)", (response_style,))
        cursor.execute("SELECT * FROM conversations WHERE id = %s", (cursor.lastrowid,))
        return cursor.fetchone()


def get_conversation(conversation_id):
    with _cursor() as cursor:
        cursor.execute("SELECT * FROM conversations WHERE id = %s", (conversation_id,))
        return cursor.fetchone()  # None if it does not exist


def delete_conversation(conversation_id):
    with _cursor() as cursor:  # messages are deleted by ON DELETE CASCADE
        cursor.execute("DELETE FROM conversations WHERE id = %s", (conversation_id,))


def get_messages(conversation_id):
    with _cursor() as cursor:
        cursor.execute(
            "SELECT id, role, content, created_at FROM messages "
            "WHERE conversation_id = %s ORDER BY id",
            (conversation_id,),
        )
        return cursor.fetchall()


def get_last_message(conversation_id):
    with _cursor() as cursor:
        cursor.execute(
            "SELECT id, role, content, created_at FROM messages "
            "WHERE conversation_id = %s ORDER BY id DESC LIMIT 1",
            (conversation_id,),
        )
        return cursor.fetchone()


def get_last_user_message(conversation_id):
    with _cursor() as cursor:
        cursor.execute(
            "SELECT id, role, content, created_at FROM messages "
            "WHERE conversation_id = %s AND role = 'user' ORDER BY id DESC LIMIT 1",
            (conversation_id,),
        )
        return cursor.fetchone()


def get_first_user_message(conversation_id):
    with _cursor() as cursor:
        cursor.execute(
            "SELECT id, role, content, created_at FROM messages "
            "WHERE conversation_id = %s AND role = 'user' ORDER BY id LIMIT 1",
            (conversation_id,),
        )
        return cursor.fetchone()


def count_assistant_messages(conversation_id):
    with _cursor() as cursor:
        cursor.execute(
            "SELECT COUNT(*) AS total FROM messages WHERE conversation_id = %s AND role = 'assistant'",
            (conversation_id,),
        )
        return cursor.fetchone()["total"]


def get_recent_messages(conversation_id, before_id=None):
    """The latest 30 messages of this conversation only, oldest first.
    With before_id, only messages older than that id are used (this is how
    "regenerate" leaves the old answer out of the context)."""
    newest_allowed = before_id if before_id is not None else 2**31 - 1
    with _cursor() as cursor:
        cursor.execute(
            "SELECT role, content FROM ("
            "  SELECT id, role, content FROM messages "
            "  WHERE conversation_id = %s AND id < %s ORDER BY id DESC LIMIT %s"
            ") AS recent ORDER BY id",
            (conversation_id, newest_allowed, CONTEXT_LIMIT),
        )
        return cursor.fetchall()


def _insert_message(cursor, conversation_id, role, content):
    """Insert a message and bump updated_at (sidebar order), inside the caller's transaction."""
    cursor.execute(
        "INSERT INTO messages (conversation_id, role, content) VALUES (%s, %s, %s)",
        (conversation_id, role, content),
    )
    message_id = cursor.lastrowid
    cursor.execute(
        "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = %s",
        (conversation_id,),
    )
    cursor.execute(
        "SELECT id, role, content, created_at FROM messages WHERE id = %s",
        (message_id,),
    )
    return cursor.fetchone()


def add_message(conversation_id, role, content):
    with _cursor() as cursor:
        return _insert_message(cursor, conversation_id, role, content)


def replace_assistant_message(conversation_id, old_id, content):
    """Regenerate: delete the old answer and save the new one in ONE transaction.
    Returns None if the old answer no longer exists (someone else already replaced it)."""
    with _cursor() as cursor:
        cursor.execute(
            "DELETE FROM messages WHERE id = %s AND conversation_id = %s AND role = 'assistant'",
            (old_id, conversation_id),
        )
        if cursor.rowcount == 0:
            return None
        return _insert_message(cursor, conversation_id, "assistant", content)


def replace_last_user_message(conversation_id, target_id, content):
    """Edit: delete the user message and everything after it (its answer), then save
    the edited text as a new message. One transaction, so nothing is left half-done."""
    with _cursor() as cursor:
        cursor.execute(
            "DELETE FROM messages WHERE conversation_id = %s AND id >= %s",
            (conversation_id, target_id),
        )
        return _insert_message(cursor, conversation_id, "user", content)


def set_title(conversation_id, title):
    with _cursor() as cursor:
        cursor.execute("UPDATE conversations SET title = %s WHERE id = %s", (title, conversation_id))


def set_style(conversation_id, response_style):
    """Change the style WITHOUT changing updated_at: picking a style is not new activity,
    so the conversation should not jump to the top of the sidebar."""
    with _cursor() as cursor:
        cursor.execute(
            "UPDATE conversations SET response_style = %s, updated_at = updated_at WHERE id = %s",
            (response_style, conversation_id),
        )
