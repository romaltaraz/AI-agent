from fastapi import APIRouter, HTTPException, Response

import queries
from ai import AIError, generate_reply
from schemas import (
    ConversationDetail,
    ConversationOut,
    ConversationSummary,
    MessageIn,
    MessageOut,
)

router = APIRouter(prefix="/api/conversations")


def get_conversation_or_404(conversation_id):
    conversation = queries.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.get("", response_model=list[ConversationSummary])
def list_conversations(search: str = ""):
    return queries.list_conversations(search.strip())


@router.post("", response_model=ConversationOut, status_code=201)
def create_conversation():
    return queries.create_conversation()


@router.get("/{conversation_id}", response_model=ConversationDetail)
def read_conversation(conversation_id: int):
    conversation = get_conversation_or_404(conversation_id)
    conversation["messages"] = queries.get_messages(conversation_id)
    return conversation


@router.delete("/{conversation_id}", status_code=204)
def delete_conversation(conversation_id: int):
    get_conversation_or_404(conversation_id)
    queries.delete_conversation(conversation_id)
    return Response(status_code=204)


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
    queries.add_message(conversation_id, "user", body.content)

    # 2. Ask the AI, using the latest 30 messages of THIS conversation only.
    history = queries.get_recent_messages(conversation_id)
    try:
        reply = generate_reply(conversation["response_style"], history)
    except AIError:
        raise HTTPException(status_code=502, detail="The AI request failed")

    # 3. Save and return the assistant's reply.
    return queries.add_message(conversation_id, "assistant", reply)
