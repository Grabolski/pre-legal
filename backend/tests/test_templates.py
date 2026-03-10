import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

import app.database as db_module
from app.main import app


@pytest_asyncio.fixture
async def client(tmp_path):
    db_module.DB_PATH = str(tmp_path / "test.db")
    await db_module.init_db()
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


ALL_TEMPLATE_IDS = [
    "mutual-non-disclosure-agreement",
    "non-disclosure-agreement",
    "employment-contract",
    "service-agreement",
    "residential-tenancy-agreement",
    "terms-of-service",
]


@pytest.mark.asyncio
async def test_list_templates(client: AsyncClient):
    res = await client.get("/templates/")
    assert res.status_code == 200
    templates = res.json()
    assert isinstance(templates, list)
    assert len(templates) > 0
    assert any(t["id"] == "mutual-non-disclosure-agreement" for t in templates)


@pytest.mark.asyncio
async def test_list_templates_returns_all_six(client: AsyncClient):
    res = await client.get("/templates/")
    assert res.status_code == 200
    ids = {t["id"] for t in res.json()}
    for expected_id in ALL_TEMPLATE_IDS:
        assert expected_id in ids, f"Template '{expected_id}' missing from index"


@pytest.mark.asyncio
async def test_get_template(client: AsyncClient):
    res = await client.get("/templates/mutual-non-disclosure-agreement")
    assert res.status_code == 200
    tmpl = res.json()
    assert tmpl["id"] == "mutual-non-disclosure-agreement"
    assert "variables" in tmpl
    assert "content" in tmpl


@pytest.mark.parametrize("template_id", ALL_TEMPLATE_IDS)
@pytest.mark.asyncio
async def test_get_each_template(client: AsyncClient, template_id: str):
    res = await client.get(f"/templates/{template_id}")
    assert res.status_code == 200
    tmpl = res.json()
    assert tmpl["id"] == template_id
    assert len(tmpl["variables"]) > 0
    assert tmpl["content"]


@pytest.mark.asyncio
async def test_get_template_not_found(client: AsyncClient):
    res = await client.get("/templates/does-not-exist")
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_chat_works_with_each_template(client: AsyncClient):
    """Each template should accept a chat request without errors (mocked LLM)."""
    from unittest.mock import patch
    from app.models.chat import ChatResponse

    mock_response = ChatResponse(reply="Tell me more.", extracted_fields={})

    for template_id in ALL_TEMPLATE_IDS:
        with patch(
            "app.routers.chat.run_chat",
            return_value=mock_response,
        ):
            res = await client.post(
                "/chat/",
                json={
                    "template_id": template_id,
                    "messages": [{"role": "user", "content": "Hello"}],
                },
            )
        assert res.status_code == 200, f"chat failed for template '{template_id}'"
