from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse


class AuthService:
    """Handles all authentication-related business logic."""

    def register(self, db: Session, payload: RegisterRequest) -> TokenResponse:
        """
        Create a new user account.
        Raises 409 if the email is already registered.
        """
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        user = User(
            name=payload.name,
            email=payload.email,
            password_hash=hash_password(payload.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token({"sub": str(user.id), "role": user.role})
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )

    def login(self, db: Session, payload: LoginRequest) -> TokenResponse:
        """
        Authenticate a user by email and password.
        Raises 401 for invalid credentials (deliberately vague for security).
        """
        user = db.query(User).filter(User.email == payload.email).first()
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = create_access_token({"sub": str(user.id), "role": user.role})
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )

    def get_current_user(self, db: Session, user_id: int) -> UserResponse:
        """
        Fetch the authenticated user's profile.
        Raises 404 if the user no longer exists.
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )
        return UserResponse.model_validate(user)


auth_service = AuthService()
