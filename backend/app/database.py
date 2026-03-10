import aiosqlite
from pathlib import Path

_default_db = Path(__file__).parents[2] / "data" / "prelegal.db"
DB_PATH = str(_default_db)

_CREATE_USERS = """
CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT    NOT NULL UNIQUE,
    password   TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
"""


async def init_db() -> None:
    """Create database schema from scratch. Called on app startup."""
    db_path = Path(DB_PATH)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    db_path.unlink(missing_ok=True)  # fresh DB on every start, per spec
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(_CREATE_USERS)
        await db.commit()


async def get_db():
    """FastAPI dependency: yields an open DB connection."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db
