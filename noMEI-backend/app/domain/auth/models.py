from datetime import UTC, datetime
from pydantic import BaseModel, EmailStr, Field


class UserDocument(BaseModel):
    """Representa o documento salvo no MongoDB"""
    email: EmailStr
    password_hash: str
    nome: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    is_active: bool = True

    lgpd_accepted_at: datetime | None = None

    reset_password_token_hash: str | None = None
    reset_password_expires_at: datetime | None = None