from fastapi import HTTPException, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.models.generated_content import GeneratedContent
from app.prompts.social import build_social_prompt
from app.schemas.generation import SocialGenerateRequest, SocialOutput, GeneratedContentResponse
from app.services.ai_service import generate_and_parse


class SocialService:
    def generate(
        self,
        db: Session,
        user_id: int,
        payload: SocialGenerateRequest,
    ) -> GeneratedContentResponse:
        prompt = build_social_prompt(
            platform=payload.platform,
            topic=payload.topic,
            tone=payload.tone,
        )

        try:
            raw_output = generate_and_parse(prompt)
        except RuntimeError as exc:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                                detail=f"AI provider unavailable: {exc}")
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                detail=f"AI returned malformed output: {exc}")

        try:
            validated = SocialOutput(**raw_output)
        except ValidationError as exc:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                detail=f"AI output did not match expected structure: {exc.errors()}")

        record = GeneratedContent(
            user_id=user_id,
            content_type="social",
            input_data=payload.model_dump(),
            generated_output=validated.model_dump(),
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        return GeneratedContentResponse.model_validate(record)


social_service = SocialService()
