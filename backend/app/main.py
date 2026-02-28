from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import templates

app = FastAPI(title="Pre-Legal API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(templates.router)


@app.get("/health")
def health():
    return {"status": "ok"}
