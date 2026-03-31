from sqlalchemy import String, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String(2000), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")  # active|completed|on-hold

    client_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    client = relationship("User")

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
