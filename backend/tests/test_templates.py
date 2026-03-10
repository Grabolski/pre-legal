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


@pytest.mark.asyncio
async def test_list_templates(client: AsyncClient):
    res = await client.get("/templates/")
    assert res.status_code == 200
    templates = res.json()
    assert isinstance(templates, list)
    assert len(templates) > 0
    assert any(t["id"] == "mutual-non-disclosure-agreement" for t in templates)


@pytest.mark.asyncio
async def test_get_template(client: AsyncClient):
    res = await client.get("/templates/mutual-non-disclosure-agreement")
    assert res.status_code == 200
    tmpl = res.json()
    assert tmpl["id"] == "mutual-non-disclosure-agreement"
    assert "variables" in tmpl
    assert "content" in tmpl


@pytest.mark.asyncio
async def test_get_template_not_found(client: AsyncClient):
    res = await client.get("/templates/does-not-exist")
    assert res.status_code == 404
