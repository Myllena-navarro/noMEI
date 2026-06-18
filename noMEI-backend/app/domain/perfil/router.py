from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.core.exceptions import NotFoundError
from app.domain.auth.repository import UserRepository
from app.domain.perfil.schemas import PerfilCreate, PerfilResponse
from app.domain.perfil.service import PerfilService

router = APIRouter()
service = PerfilService()
user_repository = UserRepository()


@router.post("/", response_model=PerfilResponse)
async def criar_ou_atualizar_perfil(
    perfil: PerfilCreate,
    user_id: str = Depends(get_current_user),
):
    """
    Gestão de perfil do MEI (Criar/Atualizar)
    """
    return await service.salvar_perfil(perfil.model_dump(), user_id)


@router.get("/me", response_model=PerfilResponse)
async def obter_meu_perfil(
    user_id: str = Depends(get_current_user),
):
    """
    Gestão de perfil do MEI (Ler perfil próprio)
    """
    perfil = await service.obter_perfil_por_user(user_id)
    if not perfil:
        raise NotFoundError("Perfil não encontrado")
    user = await user_repository.get_by_id(user_id)
    perfil["nome"] = user.get("nome") if user else None
    return perfil


@router.get("/{id}", response_model=PerfilResponse)
async def obter_perfil(id: str, _: str = Depends(get_current_user)):
    perfil = await service.obter_perfil(id)
    if not perfil:
        raise NotFoundError("Perfil não encontrado")
    return perfil