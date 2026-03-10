"""Unit tests for chat_service using mocked LiteLLM."""
from unittest.mock import MagicMock, patch

import pytest

from app.models.chat import ChatMessage, ChatResponse
from app.models.template import Variable
from app.services.chat_service import _build_system_prompt, run_chat


VARIABLES = [
    Variable(key="party_a_name", label="Party A Name", type="text", required=True),
    Variable(key="party_b_name", label="Party B Name", type="text", required=True),
    Variable(key="governing_law", label="Governing Law", type="text", required=True),
]
TEMPLATE_NAME = "Mutual Non-Disclosure Agreement"


def test_build_system_prompt_includes_all_fields():
    prompt = _build_system_prompt(TEMPLATE_NAME, VARIABLES)
    assert "party_a_name" in prompt
    assert "party_b_name" in prompt
    assert "governing_law" in prompt
    assert TEMPLATE_NAME in prompt


def test_build_system_prompt_uses_template_name():
    prompt = _build_system_prompt("Employment Contract", VARIABLES)
    assert "Employment Contract" in prompt
    assert "Mutual Non-Disclosure Agreement" not in prompt


def test_build_system_prompt_includes_descriptions():
    variables = [
        Variable(
            key="purpose",
            label="Purpose",
            type="text",
            required=True,
            description="The business purpose",
        )
    ]
    prompt = _build_system_prompt(TEMPLATE_NAME, variables)
    assert "The business purpose" in prompt


@patch("app.services.chat_service.completion")
@patch.dict("os.environ", {"OPENROUTER_API_KEY": "test-key"})
def test_run_chat_returns_response(mock_completion):
    expected = ChatResponse(reply="What is Party A's name?", extracted_fields={})
    mock_message = MagicMock()
    mock_message.content = expected.model_dump_json()
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_completion.return_value = MagicMock(choices=[mock_choice])

    messages = [ChatMessage(role="user", content="Hello, I want to create an NDA.")]
    result = run_chat(TEMPLATE_NAME, VARIABLES, messages)

    assert result.reply == "What is Party A's name?"
    assert result.extracted_fields == {}
    mock_completion.assert_called_once()


@patch("app.services.chat_service.completion")
@patch.dict("os.environ", {"OPENROUTER_API_KEY": "test-key"})
def test_run_chat_extracts_fields(mock_completion):
    expected = ChatResponse(
        reply="Got it! What is Party B's name?",
        extracted_fields={"party_a_name": "Acme Corp"},
    )
    mock_message = MagicMock()
    mock_message.content = expected.model_dump_json()
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_completion.return_value = MagicMock(choices=[mock_choice])

    messages = [ChatMessage(role="user", content="Party A is Acme Corp.")]
    result = run_chat(TEMPLATE_NAME, VARIABLES, messages)

    assert result.extracted_fields == {"party_a_name": "Acme Corp"}


@patch.dict("os.environ", {}, clear=True)
def test_run_chat_raises_without_api_key():
    with pytest.raises(RuntimeError, match="OPENROUTER_API_KEY"):
        run_chat(TEMPLATE_NAME, VARIABLES, [ChatMessage(role="user", content="Hi")])


@patch("app.services.chat_service.completion")
@patch.dict("os.environ", {"OPENROUTER_API_KEY": "test-key"})
def test_run_chat_raises_on_empty_response(mock_completion):
    mock_message = MagicMock()
    mock_message.content = None
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_completion.return_value = MagicMock(choices=[mock_choice])

    with pytest.raises(RuntimeError, match="empty response"):
        run_chat(TEMPLATE_NAME, VARIABLES, [ChatMessage(role="user", content="Hi")])


@patch("app.services.chat_service.completion")
@patch.dict("os.environ", {"OPENROUTER_API_KEY": "test-key"})
def test_run_chat_raises_on_invalid_json(mock_completion):
    mock_message = MagicMock()
    mock_message.content = "not valid json"
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_completion.return_value = MagicMock(choices=[mock_choice])

    with pytest.raises(RuntimeError, match="could not be parsed"):
        run_chat(TEMPLATE_NAME, VARIABLES, [ChatMessage(role="user", content="Hi")])
