import pytest
from unittest.mock import AsyncMock, patch

from app.domain.contratacoes.service import ContratacaoService
from app.domain.contratacoes.schemas import ContratacaoResponse


@pytest.mark.asyncio
@patch("app.domain.contratacoes.repository.ContratacaoRepository.find_all")
async def test_listar_contratacoes_paginacao_matematica(mock_find_all):
    mock_find_all.return_value = ([], 25)

    service = ContratacaoService()

    resultado = await service.listar_contratacoes(page=2, uf="PE", limit=10)

    assert resultado["total"] == 25
    assert resultado["page"] == 2
    assert resultado["pages"] == 3
    
    mock_find_all.assert_called_once_with(
        skip=10, 
        limit=10,
        uf="PE",
        modalidade_id=None,
        valor_max=None,
        mei_compativel=None,
        busca=None,
        cnae=None
    )


@pytest.mark.asyncio
@patch("app.domain.contratacoes.service.ContratacaoRepository.find_by_id")
async def test_obter_contratacao_existente(mock_find_by_id):

    licitacao_falsa = {"numeroControlePNCP": "12345", "objeto": "Computadores"}
    mock_find_by_id.return_value = licitacao_falsa
    
    service = ContratacaoService()
    
    resultado = await service.obter_contratacao("12345")
    
    assert resultado == licitacao_falsa
    
    mock_find_by_id.assert_called_once_with("12345")


@pytest.mark.asyncio
@patch("app.domain.contratacoes.service.ContratacaoRepository.get_estatisticas")
async def test_obter_estatisticas_corretamente(mock_get_estatisticas):

    dados_estatisticos_falsos = {
        "totalContratacoesAbertas": 100,
        "totalCompativeisMEI": 50
    }
    mock_get_estatisticas.return_value = dados_estatisticos_falsos
    
    service = ContratacaoService()
    
    resultado = await service.obter_estatisticas()

    assert resultado["totalContratacoesAbertas"] == 100
    assert resultado["totalCompativeisMEI"] == 50
    
    mock_get_estatisticas.assert_called_once_with()