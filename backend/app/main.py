from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import init_db
from app.routers import templates
from app.routers import auth as auth_router

# parents[2] from backend/app/main.py = project root (local) or /app (Docker)
FRONTEND_OUT = Path(__file__).parents[2] / "frontend" / "out"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Pre-Legal API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routers must be registered before static files mount
app.include_router(templates.router)
app.include_router(auth_router.router)


@app.get("/health")
def health():
    return {"status": "ok"}


# Serve static frontend — only when the build output exists
if FRONTEND_OUT.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_OUT), html=True), name="frontend")
