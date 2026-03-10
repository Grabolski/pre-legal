import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

import app.database as db_module
from app.main import app


@pytest_asyncio.fixture
async def client(tmp_path):
    # Each test gets its own fresh database file
    db_module.DB_PATH = str(tmp_path / "test.db")
    await db_module.init_db()
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest.mark.asyncio
async def test_signup_success(client: AsyncClient):
    res = await client.post("/auth/signup", json={"email": "a@example.com", "password": "password123"})
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_signup_duplicate_email(client: AsyncClient):
    payload = {"email": "dup@example.com", "password": "password123"}
    await client.post("/auth/signup", json=payload)
    res = await client.post("/auth/signup", json=payload)
    assert res.status_code == 409
    assert "already registered" in res.json()["detail"]


@pytest.mark.asyncio
async def test_signup_invalid_email(client: AsyncClient):
    res = await client.post("/auth/signup", json={"email": "notanemail", "password": "password123"})
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_signup_short_password(client: AsyncClient):
    res = await client.post("/auth/signup", json={"email": "b@example.com", "password": "short"})
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_signin_success(client: AsyncClient):
    await client.post("/auth/signup", json={"email": "c@example.com", "password": "password123"})
    res = await client.post("/auth/signin", json={"email": "c@example.com", "password": "password123"})
    assert res.status_code == 200
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_signin_wrong_password(client: AsyncClient):
    await client.post("/auth/signup", json={"email": "d@example.com", "password": "password123"})
    res = await client.post("/auth/signin", json={"email": "d@example.com", "password": "wrongpass"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_signin_unknown_email(client: AsyncClient):
    res = await client.post("/auth/signin", json={"email": "nobody@example.com", "password": "password123"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
