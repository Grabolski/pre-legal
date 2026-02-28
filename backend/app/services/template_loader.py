import json
from pathlib import Path

from app.models.template import Template, TemplateIndexEntry

DATA_DIR = Path(__file__).parents[3] / "data" / "templates"


def load_index() -> list[TemplateIndexEntry]:
    raw = json.loads((DATA_DIR / "index.json").read_text(encoding="utf-8"))
    return [TemplateIndexEntry(**t) for t in raw["templates"]]


def load_template(template_id: str) -> Template:
    index = load_index()
    entry = next((e for e in index if e.id == template_id), None)
    if entry is None:
        raise FileNotFoundError(f"Template not found: {template_id}")
    target = (DATA_DIR / entry.file).resolve()
    if not target.is_relative_to(DATA_DIR.resolve()):
        raise FileNotFoundError(f"Invalid template file path: {entry.file}")
    raw = json.loads(target.read_text(encoding="utf-8"))
    return Template(**raw)
