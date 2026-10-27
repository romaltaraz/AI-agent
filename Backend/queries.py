"""All SQL lives here. Every query is parameterized (values are passed separately
from the SQL text), so user input can never be run as SQL."""
from contextlib import contextmanager

from database import get_connection

CONTEXT_LIMIT = 30  # how many recent messages are sent to the AI


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


def create_conversation():
    with _cursor() as cursor:
        cursor.execute("INSERT INTO conversations () VALUES ()")  # all columns have defaults
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


def get_recent_messages(conversation_id):
    """The latest 30 messages of this conversation only, oldest first."""
    with _cursor() as cursor:
        cursor.execute(
            "SELECT role, content FROM ("
            "  SELECT id, role, content FROM messages "
            "  WHERE conversation_id = %s ORDER BY id DESC LIMIT %s"
            ") AS recent ORDER BY id",
            (conversation_id, CONTEXT_LIMIT),
        )
        return cursor.fetchall()


def add_message(conversation_id, role, content):
    """Save a message and bump the conversation's updated_at (sidebar order)."""
    with _cursor() as cursor:
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
