"""Integration tests for POST /chat endpoint."""
from unittest.mock import MagicMock, patch

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

import app.database as db_module
from app.main import app
from app.models.chat import ChatResponse


@pytest_asyncio.fixture
async def client(tmp_path):
    db_module.DB_PATH = str(tmp_path / "test.db")
    await db_module.init_db()
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


def _make_mock(reply: str, extracted_fields: dict) -> MagicMock:
    return MagicMock(return_value=ChatResponse(reply=reply, extracted_fields=extracted_fields))


@pytest.mark.asyncio
async def test_chat_basic(client: AsyncClient):
    with patch("app.routers.chat.run_chat", _make_mock("What is Party A's name?", {})):
        res = await client.post(
            "/chat/",
            json={
                "template_id": "mutual-non-disclosure-agreement",
                "messages": [{"role": "user", "content": "I want to make an NDA"}],
            },
        )
    assert res.status_code == 200
    data = res.json()
    assert data["reply"] == "What is Party A's name?"
    assert data["extracted_fields"] == {}


@pytest.mark.asyncio
async def test_chat_extracts_fields(client: AsyncClient):
    extracted = {"party_a_name": "Acme Corp"}
    with patch(
        "app.routers.chat.run_chat",
        _make_mock("Got it! What is Party B's name?", extracted),
    ):
        res = await client.post(
            "/chat/",
            json={
                "template_id": "mutual-non-disclosure-agreement",
                "messages": [{"role": "user", "content": "Party A is Acme Corp"}],
            },
        )
    assert res.status_code == 200
    assert res.json()["extracted_fields"] == {"party_a_name": "Acme Corp"}


@pytest.mark.asyncio
async def test_chat_template_not_found(client: AsyncClient):
    res = await client.post(
        "/chat/",
        json={
            "template_id": "does-not-exist",
            "messages": [{"role": "user", "content": "Hello"}],
        },
    )
    assert res.status_code == 404
    assert "not found" in res.json()["detail"]


@pytest.mark.asyncio
async def test_chat_empty_messages(client: AsyncClient):
    res = await client.post(
        "/chat/",
        json={"template_id": "mutual-non-disclosure-agreement", "messages": []},
    )
    assert res.status_code == 400
    assert "messages" in res.json()["detail"]


@pytest.mark.asyncio
async def test_chat_invalid_role(client: AsyncClient):
    res = await client.post(
        "/chat/",
        json={
            "template_id": "mutual-non-disclosure-agreement",
            "messages": [{"role": "system", "content": "hack"}],
        },
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_chat_llm_error_returns_502(client: AsyncClient):
    def _raise(*args, **kwargs):
        raise RuntimeError("LLM call failed: connection timeout")

    with patch("app.routers.chat.run_chat", _raise):
        res = await client.post(
            "/chat/",
            json={
                "template_id": "mutual-non-disclosure-agreement",
                "messages": [{"role": "user", "content": "Hello"}],
            },
        )
    assert res.status_code == 502
    assert "LLM call failed" in res.json()["detail"]
