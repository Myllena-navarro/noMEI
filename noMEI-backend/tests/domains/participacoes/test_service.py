import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException

from app.domain.participacoes.service import ParticipacaoService
from app.domain.participacoes.schemas import ParticipacaoListResponse, DashboardResponse

# ---------------------------------------------------------------------------
# Fixtures e dados de teste
# ---------------------------------------------------------------------------

USER_ID = "user_abc_123"
CNPJ = "12.345.678/0001-99"

FAKE_USER = {"_id": USER_ID, "cnpj": CNPJ, "nome": "Empresa Teste LTDA"}

FAKE_PARTICIPACOES = [
    {
        "_id": "doc_id_1", "cnpj": CNPJ,
        "titulo": "Pregão Eletrônico 001/2025",
        "data_abertura": "2025-03-01", "valor_estimado": 50000.00,
        "status_proposta": "winner",
    },
    {
        "_id": "doc_id_2", "cnpj": CNPJ,
        "titulo": "Tomada de Preços 010/2025",
        "data_abertura": "2025-04-15", "valor_estimado": 12000.00,
        "status_proposta": "open",
    },
]

FAKE_DASHBOARD_RAW = {
    "resumo_status": [
        {"status": "winner", "total": 1, "processos_ids": ["doc_id_1"]},
        {"status": "open",   "total": 1, "processos_ids": ["doc_id_2"]},
    ],
    "total_participacoes": [{"total": 2}],
}


@pytest.fixture
def service():
    svc = ParticipacaoService()
    svc.user_repository = MagicMock()
    svc.repository = MagicMock()
    return svc


# ---------------------------------------------------------------------------
# _validar_e_extrair_cnpj
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_get_cnpj_raises_404_quando_usuario_nao_existe(service):
    service.user_repository.get_by_id = AsyncMock(return_value=None)
    with pytest.raises(HTTPException) as exc_info:
        await service._validar_e_extrair_cnpj(USER_ID)
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_get_cnpj_raises_404_quando_cnpj_ausente(service):
    service.user_repository.get_by_id = AsyncMock(return_value={"_id": USER_ID})
    with pytest.raises(HTTPException) as exc_info:
        await service._validar_e_extrair_cnpj(USER_ID)
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_get_cnpj_retorna_cnpj_correto(service):
    service.user_repository.get_by_id = AsyncMock(return_value=FAKE_USER)
    cnpj = await service._validar_e_extrair_cnpj(USER_ID)
    assert cnpj == CNPJ


# ---------------------------------------------------------------------------
# listar_participacoes — isolamento por CNPJ
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_listagem_usa_cnpj_do_jwt_nunca_do_cliente(service):
    """
    Garantia de isolamento: CNPJ vem do banco via JWT,
    nunca de um parâmetro controlado pelo cliente.
    """
    service.user_repository.get_by_id = AsyncMock(return_value=FAKE_USER)
    service.repository.list_by_cnpj = AsyncMock(return_value=FAKE_PARTICIPACOES)

    await service.listar_participacoes(user_id=USER_ID, status=None)

    service.repository.list_by_cnpj.assert_called_once_with(cnpj=CNPJ, status=None)


@pytest.mark.asyncio
async def test_listagem_sem_filtro_retorna_todos(service):
    service.user_repository.get_by_id = AsyncMock(return_value=FAKE_USER)
    service.repository.list_by_cnpj = AsyncMock(return_value=FAKE_PARTICIPACOES)

    result = await service.listar_participacoes(user_id=USER_ID, status=None)

    assert isinstance(result, ParticipacaoListResponse)
    assert result.total == 2
    assert len(result.items) == 2


@pytest.mark.asyncio
async def test_listagem_com_filtro_status_winner(service):
    """Com ?status=winner, o repositório deve receber o filtro correto."""
    service.user_repository.get_by_id = AsyncMock(return_value=FAKE_USER)
    service.repository.list_by_cnpj = AsyncMock(return_value=[FAKE_PARTICIPACOES[0]])

    result = await service.listar_participacoes(user_id=USER_ID, status="winner")

    service.repository.list_by_cnpj.assert_called_once_with(cnpj=CNPJ, status="winner")
    assert result.total == 1
    assert result.items[0].status_proposta == "winner"


@pytest.mark.asyncio
async def test_listagem_retorna_lista_vazia_sem_erro(service):
    service.user_repository.get_by_id = AsyncMock(return_value=FAKE_USER)
    service.repository.list_by_cnpj = AsyncMock(return_value=[])

    result = await service.listar_participacoes(user_id=USER_ID, status=None)

    assert result.total == 0
    assert result.items == []


@pytest.mark.asyncio
async def test_listagem_mapeia_campos_do_documento_corretamente(service):
    service.user_repository.get_by_id = AsyncMock(return_value=FAKE_USER)
    service.repository.list_by_cnpj = AsyncMock(return_value=[FAKE_PARTICIPACOES[0]])

    result = await service.listar_participacoes(user_id=USER_ID, status=None)
    item = result.items[0]

    assert item.id == "doc_id_1"
    assert item.titulo == "Pregão Eletrônico 001/2025"
    assert item.valor_estimado == 50000.00
    assert item.status_proposta == "winner"
    assert item.cnpj == CNPJ


@pytest.mark.asyncio
async def test_listagem_propaga_404_sem_cnpj_antes_do_repositorio(service):
    """Repositório NÃO deve ser chamado se o usuário não tem CNPJ."""
    service.user_repository.get_by_id = AsyncMock(return_value={"_id": USER_ID})
    service.repository.list_by_cnpj = AsyncMock()

    with pytest.raises(HTTPException) as exc_info:
        await service.listar_participacoes(user_id=USER_ID)

    assert exc_info.value.status_code == 404
    service.repository.list_by_cnpj.assert_not_called()


# ---------------------------------------------------------------------------
# resumo_dashboard
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_dashboard_retorna_estrutura_correta(service):
    service.user_repository.get_by_id = AsyncMock(return_value=FAKE_USER)
    service.repository.get_dashboard_resumo = AsyncMock(return_value=FAKE_DASHBOARD_RAW)

    result = await service.resumo_dashboard(user_id=USER_ID)

    assert isinstance(result, DashboardResponse)
    assert result.total_participacoes == 2
    assert result.taxa_vitoria == 1.0  # 1 winner / 1 finalizado
    assert len(result.resumo_status) == 2


@pytest.mark.asyncio
async def test_dashboard_taxa_vitoria_zero_sem_finalizados(service):
    raw_data = {
        "resumo_status": [{"status": "open", "total": 3, "processos_ids": ["a", "b", "c"]}],
        "total_participacoes": [{"total": 3}],
    }
    service.user_repository.get_by_id = AsyncMock(return_value=FAKE_USER)
    service.repository.get_dashboard_resumo = AsyncMock(return_value=raw_data)

    result = await service.resumo_dashboard(user_id=USER_ID)

    assert result.taxa_vitoria == 0.0