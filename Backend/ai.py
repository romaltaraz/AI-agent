"""The only file that talks to OpenAI. The key and model come from .env."""
import os

from dotenv import load_dotenv
from openai import OpenAI, OpenAIError

load_dotenv()

SYSTEM_PROMPT = (
    "You are a helpful AI assistant. Answer in the language the user writes in; "
    "use Hebrew by default. Format answers with Markdown when it helps."
)

STYLE_INSTRUCTIONS = {
    "short": "Keep answers brief and to the point.",
    "detailed": "Give thorough answers with explanations.",
    "simple": "Use plain, everyday language suitable for a beginner.",
}

TITLE_PROMPT = (
    "Write a title in Hebrew, five words at most, for a conversation that starts with "
    "the message below. Reply with the title only."
)


class AIError(Exception):
    """Raised when the OpenAI request fails. Hides the technical details."""


def _ask(messages, **options):
    """Send one chat request and return the text of the answer."""
    try:
        client = OpenAI()  # reads OPENAI_API_KEY from the environment
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL"), messages=messages, **options
        )
    except OpenAIError as error:
        raise AIError(type(error).__name__) from error
    text = (response.choices[0].message.content or "").strip()
    if not text:
        raise AIError("empty reply")
    return text


def generate_reply(response_style, history):
    """history: list of {"role", "content"} dicts, oldest first."""
    instructions = f"{SYSTEM_PROMPT} {STYLE_INSTRUCTIONS[response_style]}"
    return _ask([{"role": "system", "content": instructions}] + history)


def fallback_title(message):
    """The beginning of the user's message, cut at a word boundary."""
    text = " ".join(message.split())
    if len(text) <= 40:
        return text
    return text[:40].rsplit(" ", 1)[0] + "…"


def make_title(first_message):
    """A short title for a new conversation. Never fails: if OpenAI does not
    answer, the beginning of the first message is used instead."""
    try:
        title = _ask(
            [
                {"role": "system", "content": TITLE_PROMPT},
                {"role": "user", "content": first_message[:300]},  # the start is enough
            ],
            # The model "thinks" before it writes (reasoning tokens count toward this limit),
            # so a small limit would leave an empty title. A title itself needs only ~10 tokens.
            max_completion_tokens=300,
        )
        title = title.splitlines()[0].strip(" \"'“”.")
        if title:
            return title[:60]
    except AIError:
        pass
    return fallback_title(first_message)
