from fastapi import APIRouter, HTTPException, Response

import queries
from schemas import (
    ConversationCreate,
    ConversationDetail,
    ConversationOut,
    ConversationSummary,
    StyleIn,
)

router = APIRouter(prefix="/api/conversations")


def get_conversation_or_404(conversation_id):
    conversation = queries.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


def get_conversation_detail(conversation_id):
    """The conversation together with all its messages."""
    conversation = get_conversation_or_404(conversation_id)
    conversation["messages"] = queries.get_messages(conversation_id)
    return conversation


@router.get("", response_model=list[ConversationSummary])
def list_conversations(search: str = ""):
    return queries.list_conversations(search.strip())


@router.post("", response_model=ConversationOut, status_code=201)
def create_conversation(body: ConversationCreate | None = None):
    """The body is optional: without it the conversation gets the default style."""
    return queries.create_conversation(body.response_style if body else "detailed")


@router.get("/{conversation_id}", response_model=ConversationDetail)
def read_conversation(conversation_id: int):
    return get_conversation_detail(conversation_id)


@router.patch("/{conversation_id}", response_model=ConversationOut)
def update_style(conversation_id: int, body: StyleIn):
    """Change the response style. Old messages are not touched."""
    get_conversation_or_404(conversation_id)
    queries.set_style(conversation_id, body.response_style)
    return queries.get_conversation(conversation_id)


@router.delete("/{conversation_id}", status_code=204)
def delete_conversation(conversation_id: int):
    get_conversation_or_404(conversation_id)
    queries.delete_conversation(conversation_id)
    return Response(status_code=204)
