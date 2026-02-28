from fastapi import APIRouter, HTTPException

from app.models.template import Template, TemplateIndexEntry
from app.services.template_loader import load_index, load_template

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/", response_model=list[TemplateIndexEntry])
def list_templates():
    return load_index()


@router.get("/{template_id}", response_model=Template)
def get_template(template_id: str):
    try:
        return load_template(template_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")
