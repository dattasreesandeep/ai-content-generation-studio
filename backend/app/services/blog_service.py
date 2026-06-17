"""
Blog Generation Service

Flow (matches TDD AI Workflow):
  1. Receive validated input
  2. Build prompt from template
  3. Call AI service (Gemini)
  4. Validate structured output with Pydantic
  5. Save to MySQL
  6. Return response to router
"""
from fastapi import HTTPException, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.models.generated_content import GeneratedContent
from app.prompts.blog import build_blog_prompt
from app.schemas.generation import BlogGenerateRequest, BlogOutput, GeneratedContentResponse
from app.services.ai_service import generate_and_parse


class BlogService:
    def generate(
        self,
        db: Session,
        user_id: int,
        payload: BlogGenerateRequest,
    ) -> GeneratedContentResponse:
        """
        Full blog generation pipeline.
        Raises 422 if AI output fails Pydantic validation.
        Raises 503 if Gemini API is unavailable.
        """
        # Step 1 — Build the prompt
        prompt = build_blog_prompt(
            topic=payload.topic,
            audience=payload.audience,
            tone=payload.tone,
            word_count=payload.word_count,
        )

        # Step 2 — Call Gemini (with automatic retry on bad JSON)
        try:
            raw_output = generate_and_parse(prompt)
        except RuntimeError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"AI provider unavailable: {exc}",
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"AI returned malformed output: {exc}",
            )

        # Step 3 — Validate AI output against BlogOutput schema
        try:
            validated = BlogOutput(**raw_output)
        except ValidationError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"AI output did not match expected structure: {exc.errors()}",
            )

        # Step 4 — Persist to MySQL
        record = GeneratedContent(
            user_id=user_id,
            content_type="blog",
            input_data=payload.model_dump(),
            generated_output=validated.model_dump(),
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        return GeneratedContentResponse.model_validate(record)


blog_service = BlogService()
