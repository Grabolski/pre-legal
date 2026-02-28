from typing import Literal, Optional
from pydantic import BaseModel


class Variable(BaseModel):
    key: str
    label: str
    type: Literal["text", "date", "number", "currency", "select"]
    required: bool = True
    options: Optional[list[str]] = None
    description: Optional[str] = None


class Template(BaseModel):
    id: str
    name: str
    category: str
    description: str
    jurisdiction: Optional[str] = None
    variables: list[Variable]
    content: str


class TemplateIndexEntry(BaseModel):
    id: str
    name: str
    category: str
    description: str
    file: str
