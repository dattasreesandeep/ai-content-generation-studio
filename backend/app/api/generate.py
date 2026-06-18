from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.generated_content import GeneratedContent
from app.models.user import User
from app.schemas.generation import (
    BlogGenerateRequest,
    CampaignGenerateRequest,
    GeneratedContentResponse,
    ProductGenerateRequest,
    SocialGenerateRequest,
)
from app.services.blog_service import blog_service
from app.services.campaign_service import campaign_service
from app.services.product_service import product_service
from app.services.social_service import social_service

router = APIRouter(tags=["Generation & History"])


# ── Blog ───────────────────────────────────────────────────────────────────────

@router.post("/generate/blog", response_model=GeneratedContentResponse, status_code=201)
def generate_blog(
    payload: BlogGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a blog post using Gemini AI. Output is automatically saved to history."""
    return blog_service.generate(db=db, user_id=current_user.id, payload=payload)


# ── Product Description ────────────────────────────────────────────────────────

@router.post("/generate/product", response_model=GeneratedContentResponse, status_code=201)
def generate_product(
    payload: ProductGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a product description using Gemini AI."""
    return product_service.generate(db=db, user_id=current_user.id, payload=payload)


# ── Social Media ───────────────────────────────────────────────────────────────

@router.post("/generate/social", response_model=GeneratedContentResponse, status_code=201)
def generate_social(
    payload: SocialGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a platform-specific social media post using Gemini AI."""
    return social_service.generate(db=db, user_id=current_user.id, payload=payload)


# ── Marketing Campaign ─────────────────────────────────────────────────────────

@router.post("/generate/campaign", response_model=GeneratedContentResponse, status_code=201)
def generate_campaign(
    payload: CampaignGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a full marketing campaign (emails, ads, CTA) using Gemini AI."""
    return campaign_service.generate(db=db, user_id=current_user.id, payload=payload)


# ── History ────────────────────────────────────────────────────────────────────

@router.get("/history", response_model=list[GeneratedContentResponse])
def get_history(
    content_type: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all generated content for the current user.
    Filter by type with ?content_type=blog|product|social|campaign
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
    """Retrieve a single history record. Returns 404 if not found or not owned by the current user."""
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
    """Delete a history record. Returns 204 on success."""
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
