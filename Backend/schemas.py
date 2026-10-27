"""Pydantic models: they validate incoming data and define the shape of responses."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

MAX_MESSAGE_LENGTH = 4000


class MessageIn(BaseModel):
    # Spaces at the start/end are removed first, so "   " counts as empty and is rejected.
    model_config = ConfigDict(str_strip_whitespace=True)
    content: str = Field(min_length=1, max_length=MAX_MESSAGE_LENGTH)


class MessageOut(BaseModel):
    id: int
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime


class ConversationSummary(BaseModel):
    id: int
    title: str
    updated_at: datetime


class ConversationOut(BaseModel):
    id: int
    title: str
    response_style: Literal["short", "detailed", "simple"]
    created_at: datetime
    updated_at: datetime


class ConversationDetail(ConversationOut):
    messages: list[MessageOut]
