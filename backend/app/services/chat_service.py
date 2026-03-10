import os
from litellm import completion

from app.models.chat import ChatMessage, ChatResponse
from app.models.template import Variable

MODEL = "openrouter/openai/gpt-oss-120b"
# Route requests through Cerebras as the inference provider via OpenRouter
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}


def _build_system_prompt(template_name: str, variables: list[Variable]) -> str:
    field_descriptions = "\n".join(
        f"- {v.key} ({v.label}): {v.description or v.label}"
        for v in variables
    )
    return f"""You are a helpful legal assistant helping a user fill out a {template_name}.

The document requires the following fields:
{field_descriptions}

Your job is to have a natural, friendly conversation to collect all the required information. Ask about one or two fields at a time. Be conversational and brief.

After each user message, you must:
1. Respond conversationally in the "reply" field — acknowledge what they said and ask the next question(s).
2. Extract any field values that were clearly stated by the user into "extracted_fields" as a JSON object mapping field keys to string values.

CRITICAL: You must always ask a follow-up question in "reply" until EVERY field listed above has been provided by the user. Never end the conversation or stop asking questions while any field remains empty. Only once all fields are filled should you confirm the document is ready to download.

Rules for extracted_fields:
- Only include fields that the user has clearly provided in this message or earlier messages.
- For date fields, use ISO format YYYY-MM-DD if possible, otherwise use the value as stated.
- For number fields, extract just the number as a string (e.g. "3").
- Do not include fields the user has not yet mentioned.
- If the user asks for a document type you cannot generate, explain that and suggest the closest available document you can help with.

Respond ONLY with valid JSON matching this schema:
{{
  "reply": "<your conversational message>",
  "extracted_fields": {{}}
}}"""


def run_chat(
    template_name: str, variables: list[Variable], messages: list[ChatMessage]
) -> ChatResponse:
    """Call the LLM to get a conversational reply and extracted field values."""
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY environment variable is not set")

    system_prompt = _build_system_prompt(template_name, variables)
    llm_messages = [{"role": "system", "content": system_prompt}] + [
        {"role": m.role, "content": m.content} for m in messages
    ]

    try:
        response = completion(
            model=MODEL,
            messages=llm_messages,
            response_format=ChatResponse,
            reasoning_effort="low",
            extra_body=EXTRA_BODY,
            api_key=api_key,
        )
    except Exception as exc:
        raise RuntimeError(f"LLM call failed: {exc}") from exc

    raw = response.choices[0].message.content
    if not raw:
        raise RuntimeError("LLM returned an empty response")

    try:
        return ChatResponse.model_validate_json(raw)
    except Exception as exc:
        raise RuntimeError(f"LLM response could not be parsed: {exc}") from exc
