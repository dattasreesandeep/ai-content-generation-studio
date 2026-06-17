from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class GeneratedContent(Base):
    __tablename__ = "generated_contents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content_type: Mapped[str] = mapped_column(String(50), nullable=False)           # "blog"
    input_data: Mapped[dict] = mapped_column(JSON, nullable=False)                  # original form inputs
    generated_output: Mapped[dict] = mapped_column(JSON, nullable=False)            # structured AI response
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    # relationship back to user (optional, used for joins)
    user = relationship("User", backref="generated_contents")

    def __repr__(self) -> str:
        return f"<GeneratedContent id={self.id} type={self.content_type} user_id={self.user_id}>"
