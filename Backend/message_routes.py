"""Send, regenerate/retry and edit. These three can corrupt a conversation if done
wrongly, so each step below follows section 9 of the project brief."""
from fastapi import APIRouter, HTTPException

import queries
from ai import AIError, generate_reply, make_title
from routes import get_conversation_detail, get_conversation_or_404
from schemas import ConversationDetail, MessageIn, MessageOut

router = APIRouter(prefix="/api/conversations")


def generate_or_502(conversation, history):
    try:
        return generate_reply(conversation["response_style"], history)
    except AIError:
        raise HTTPException(status_code=502, detail="The AI request failed")


def ensure_not_changed(conversation_id, expected_last_id):
    """The AI call takes a few seconds. If the conversation changed meanwhile (for example a
    double click sent the same request twice), do not save a second answer."""
    last = queries.get_last_message(conversation_id)
    if last is None or last["id"] != expected_last_id:
        raise HTTPException(status_code=409, detail="The conversation changed while generating")


def save_reply(conversation, reply, old_answer_id=None):
    """Save the assistant's reply (replacing the old answer when regenerating).
    The first reply of a new conversation also gives it a title."""
    conversation_id = conversation["id"]
    # Checked BEFORE saving: a title is made only for a conversation that has no answer yet,
    # so regenerating or editing later never makes another title request.
    needs_title = (
        conversation["title"] == queries.DEFAULT_TITLE
        and queries.count_assistant_messages(conversation_id) == 0
    )

    if old_answer_id is None:
        message = queries.add_message(conversation_id, "assistant", reply)
    else:
        message = queries.replace_assistant_message(conversation_id, old_answer_id, reply)
        if message is None:
            raise HTTPException(status_code=409, detail="The conversation changed while generating")

    if needs_title:
        first_message = queries.get_first_user_message(conversation_id)
        queries.set_title(conversation_id, make_title(first_message["content"]))
    return message


@router.post("/{conversation_id}/messages", response_model=MessageOut, status_code=201)
def send_message(conversation_id: int, body: MessageIn):
    conversation = get_conversation_or_404(conversation_id)

    # A user message without a reply means the last AI request failed.
    # Sending a new message now would leave two user messages in a row.
    last = queries.get_last_message(conversation_id)
    if last and last["role"] == "user":
        raise HTTPException(
            status_code=409,
            detail="The previous message has no reply yet. Retry it first.",
        )

    # 1. Save the user's message first, so it is never lost if the AI fails.
    saved = queries.add_message(conversation_id, "user", body.content)

    # 2. Ask the AI, using the latest 30 messages of THIS conversation only.
    reply = generate_or_502(conversation, queries.get_recent_messages(conversation_id))

    # 3. Save and return the assistant's reply.
    ensure_not_changed(conversation_id, saved["id"])
    return save_reply(conversation, reply)


@router.post("/{conversation_id}/regenerate", response_model=MessageOut)
def regenerate(conversation_id: int):
    """Two cases, decided by the latest message (no user message is ever added):
    - latest is an ANSWER   -> regenerate: ask again without the old answer, then replace it.
    - latest is a USER message -> retry: the earlier request failed, so create the missing answer."""
    conversation = get_conversation_or_404(conversation_id)
    last = queries.get_last_message(conversation_id)

    if last is None:
        raise HTTPException(status_code=409, detail="Nothing to regenerate in an empty conversation")

    if last["role"] == "assistant":
        history = queries.get_recent_messages(conversation_id, before_id=last["id"])
        if not history or history[-1]["role"] != "user":
            raise HTTPException(status_code=409, detail="The answer has no user message before it")
        old_answer_id = last["id"]
    else:
        history = queries.get_recent_messages(conversation_id)
        old_answer_id = None

    # If this fails, the old answer (if any) is still in the database: nothing is lost.
    reply = generate_or_502(conversation, history)
    ensure_not_changed(conversation_id, last["id"])
    return save_reply(conversation, reply, old_answer_id)


@router.put("/{conversation_id}/messages/last", response_model=ConversationDetail)
def edit_last_message(conversation_id: int, body: MessageIn):
    """Edit the latest user message: it and the answer after it are removed, the edited
    text is saved, and a new answer is generated."""
    conversation = get_conversation_or_404(conversation_id)
    target = queries.get_last_user_message(conversation_id)
    if target is None:
        raise HTTPException(status_code=409, detail="There is no user message to edit")

    # Delete the old message + its answer and save the edit in one step.
    edited = queries.replace_last_user_message(conversation_id, target["id"], body.content)

    # If this fails, the edited message stays saved without a reply, and "retry" can fix it.
    reply = generate_or_502(conversation, queries.get_recent_messages(conversation_id))
    ensure_not_changed(conversation_id, edited["id"])
    save_reply(conversation, reply)
    return get_conversation_detail(conversation_id)
