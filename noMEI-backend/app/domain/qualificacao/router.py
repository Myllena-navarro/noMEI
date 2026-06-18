from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.domain.qualificacao.schemas import QualificacaoRequest, QualificacaoResponse
from app.domain.qualificacao.service import QualificacaoService

router = APIRouter()
service = QualificacaoService()


@router.post("/verificar", response_model=QualificacaoResponse)
async def verificar_elegibilidade(
    request: QualificacaoRequest,
    _: str = Depends(get_current_user),
):
    return await service.verificar_elegibilidade(
        cnpj=request.cnpj,
        numero_controle_pncp=request.numero_controle_pncp,
    )
