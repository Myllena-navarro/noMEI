import hashlib
from datetime import UTC, datetime, timedelta

from jose import JWTError

from app.core.email_service import EmailService
from app.core.security import (
    create_password_reset_token,
    create_tokens,
    decode_token,
    hash_password,
    verify_password,
)
from app.domain.auth.repository import UserRepository


class AuthService:
    def __init__(self):
        self.repository = UserRepository()
        self.email_service = EmailService()

    async def registrar(self, email: str, password: str, nome: str | None = None, lgpd_accepted: bool = False) -> dict:
        if await self.repository.get_by_email(email):
            raise ValueError("Email já cadastrado")

        user_data = {
            "email": email,
            "password_hash": hash_password(password),
            "nome": nome,
            "created_at": datetime.now(UTC),
            "is_active": True,
            "lgpd_accepted_at": datetime.now(UTC) if lgpd_accepted else None,
            "reset_password_token_hash": None,
            "reset_password_expires_at": None,
        }
        user = await self.repository.create(user_data)
        return create_tokens(user["_id"])

    async def autenticar(self, email: str, password: str) -> dict:
        user = await self.repository.get_by_email(email)
        if not user or not verify_password(password, user["password_hash"]):
            raise ValueError("Credenciais inválidas")
        if not user.get("is_active", True):
            raise ValueError("Conta desativada")

        return create_tokens(user["_id"])

    async def renovar_token(self, refresh_token: str) -> dict:
        try:
            payload = decode_token(refresh_token)
        except JWTError:
            raise ValueError("Token inválido ou expirado")

        if payload.get("type") != "refresh":
            raise ValueError("Token inválido ou expirado")

        user_id = payload.get("sub")
        user = await self.repository.get_by_id(user_id) if user_id else None
        if not user:
            raise ValueError("Token inválido ou expirado")
        if not user.get("is_active", True):
            raise ValueError("Token inválido ou expirado")

        return create_tokens(user_id)

    async def forgot_password(self, email: str) -> dict:
        user = await self.repository.get_by_email(email)

        if user:
            reset_token = create_password_reset_token(user["_id"])
            reset_token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
            expires_at = datetime.now(UTC) + timedelta(minutes=15)

            await self.repository.save_reset_token(
                user_id=user["_id"],
                token_hash=reset_token_hash,
                expires_at=expires_at,
            )

            self.email_service.send_password_reset_email(
                to_email=email,
                reset_token=reset_token,
            )

        return {
            "message": "Se o email existir, um código de recuperação foi enviado."
        }

    async def reset_password(self, token: str, new_password: str) -> dict:
        try:
            payload = decode_token(token)
        except JWTError:
            raise ValueError("Token inválido ou expirado")

        if payload.get("type") != "password_reset":
            raise ValueError("Token inválido ou expirado")

        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Token inválido ou expirado")

        user = await self.repository.get_by_id(user_id)
        if not user:
            raise ValueError("Token inválido ou expirado")

        token_hash = hashlib.sha256(token.encode()).hexdigest()
        saved_hash = user.get("reset_password_token_hash")
        expires_at = user.get("reset_password_expires_at")

        if not saved_hash or saved_hash != token_hash:
            raise ValueError("Token inválido ou expirado")

        if not expires_at:
            raise ValueError("Token inválido ou expirado")

        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)

        if expires_at < datetime.now(UTC):
            raise ValueError("Token inválido ou expirado")

        new_password_hash = hash_password(new_password)
        await self.repository.update_password(user_id, new_password_hash)

        return {"message": "Senha redefinida com sucesso"}