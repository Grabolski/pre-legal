import asyncio

from fastapi import APIRouter, HTTPException

from app.models.chat import ChatRequest, ChatResponse
from app.services.chat_service import run_chat
from app.services.template_loader import load_template

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        template = load_template(request.template_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Template '{request.template_id}' not found")

    if not request.messages:
        raise HTTPException(status_code=400, detail="messages must not be empty")

    try:
        return await asyncio.to_thread(
            run_chat, template.name, template.variables, request.messages
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
