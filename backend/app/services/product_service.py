from fastapi import HTTPException, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.models.generated_content import GeneratedContent
from app.prompts.product import build_product_prompt
from app.schemas.generation import ProductGenerateRequest, ProductOutput, GeneratedContentResponse
from app.services.ai_service import generate_and_parse


class ProductService:
    def generate(
        self,
        db: Session,
        user_id: int,
        payload: ProductGenerateRequest,
    ) -> GeneratedContentResponse:
        prompt = build_product_prompt(
            product_name=payload.product_name,
            features=payload.features,
            target_audience=payload.target_audience,
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
            validated = ProductOutput(**raw_output)
        except ValidationError as exc:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                detail=f"AI output did not match expected structure: {exc.errors()}")

        record = GeneratedContent(
            user_id=user_id,
            content_type="product",
            input_data=payload.model_dump(),
            generated_output=validated.model_dump(),
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        return GeneratedContentResponse.model_validate(record)


product_service = ProductService()
