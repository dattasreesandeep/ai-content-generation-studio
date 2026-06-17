
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.generated_content import GeneratedContent
from app.models.user import User
from app.schemas.generation import BlogGenerateRequest, GeneratedContentResponse
from app.services.blog_service import blog_service

from fastapi import HTTPException

router = APIRouter(tags=["Generation & History"])

logger = logging.getLogger(__name__)

# ── Blog generation ────────────────────────────────────────────────────────────

@router.post("/generate/blog", response_model=GeneratedContentResponse, status_code=201)
def generate_blog(
    payload: BlogGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a blog post using Gemini AI.
    Requires authentication. Output is automatically saved to history.
    """
    try:
        return blog_service.generate(
            db=db,
            user_id=current_user.id,
            payload=payload
        )

    except Exception as exc:
        logger.exception("AI provider error")

        raise HTTPException(
            status_code=503,
            detail="AI service is temporarily unavailable. Please try again later."
        )


# ── History endpoints ──────────────────────────────────────────────────────────

@router.get("/history", response_model=list[GeneratedContentResponse])
def get_history(
    content_type: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all generated content for the current user.
    Optionally filter by content_type e.g. ?content_type=blog
    """
    query = db.query(GeneratedContent).filter(
        GeneratedContent.user_id == current_user.id
    )
    if content_type:
        query = query.filter(GeneratedContent.content_type == content_type)

    return query.order_by(GeneratedContent.created_at.desc()).all()


@router.get("/history/{record_id}", response_model=GeneratedContentResponse)
def get_history_item(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single history record. Returns 404 if not found or not owned by the user."""
    record = (
        db.query(GeneratedContent)
        .filter(
            GeneratedContent.id == record_id,
            GeneratedContent.user_id == current_user.id,
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found.")
    return record


@router.delete("/history/{record_id}", status_code=204)
def delete_history_item(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a history record. Returns 204 on success, 404 if not found."""
    record = (
        db.query(GeneratedContent)
        .filter(
            GeneratedContent.id == record_id,
            GeneratedContent.user_id == current_user.id,
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found.")
    db.delete(record)
    db.commit()
