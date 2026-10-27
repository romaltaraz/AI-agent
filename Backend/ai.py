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


class AIError(Exception):
    """Raised when the OpenAI request fails. Hides the technical details."""


def generate_reply(response_style, history):
    """history: list of {"role", "content"} dicts, oldest first."""
    instructions = f"{SYSTEM_PROMPT} {STYLE_INSTRUCTIONS[response_style]}"
    messages = [{"role": "system", "content": instructions}] + history
    try:
        client = OpenAI()  # reads OPENAI_API_KEY from the environment
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL"),
            messages=messages,
        )
    except OpenAIError as error:
        raise AIError(type(error).__name__) from error

    reply = (response.choices[0].message.content or "").strip()
    if not reply:
        raise AIError("empty reply")
    return reply
