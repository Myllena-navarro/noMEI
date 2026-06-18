from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    nome: str | None = None
    lgpd_accepted: bool

    @field_validator("lgpd_accepted")
    @classmethod
    def lgpd_must_be_accepted(cls, v: bool) -> bool:
        if not v:
            raise ValueError("É necessário aceitar os termos da LGPD para criar uma conta")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class MessageResponse(BaseModel):
    message: str


class UserResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., alias="_id")
    email: EmailStr
    is_active: bool
    nome: str | None = None