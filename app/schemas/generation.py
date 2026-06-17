from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# ── Blog generation request ────────────────────────────────────────────────────

class BlogGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=300, description="What the blog is about")
    audience: str = Field(..., min_length=3, max_length=200, description="Who will read this blog")
    tone: str = Field(..., min_length=2, max_length=50, description="e.g. professional, casual, humorous")
    word_count: int = Field(default=800, ge=200, le=3000, description="Target word count")


# ── Structured blog output (Pydantic validates AI response) ───────────────────

class BlogSection(BaseModel):
    heading: str
    content: str


class BlogOutput(BaseModel):
    title: str
    introduction: str
    sections: list[BlogSection]
    conclusion: str
    seo_keywords: list[str]


# ── API response shape returned to the frontend ───────────────────────────────

class GeneratedContentResponse(BaseModel):
    id: int
    content_type: str
    input_data: dict
    generated_output: dict
    created_at: datetime

    model_config = {"from_attributes": True}
