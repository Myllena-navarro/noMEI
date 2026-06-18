import pytest

from unittest.mock import patch, MagicMock, AsyncMock
from app.domain.contratacoes.repository import ContratacaoRepository


@pytest.mark.asyncio
@patch("app.domain.contratacoes.repository.get_database")
async def test_find_by_id_monta_query_correta(mock_get_database):

    mock_collection = MagicMock()
    mock_collection.find_one = AsyncMock(return_value={"id": "999", "objetoCompra": "Lápis"})

    mock_get_database.return_value = {"contratacoes_proposta": mock_collection}
    
    repo = ContratacaoRepository()
    resultado = await repo.find_by_id("12345-PE")

    mock_collection.find_one.assert_called_once_with({"numeroControlePNCP": "12345-PE"})

    assert resultado["objetoCompra"] == "Lápis"


@pytest.mark.asyncio
@patch("app.domain.contratacoes.repository.get_database")
async def test_find_all_constroi_query_dinamica(mock_get_database):

    mock_collection = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.sort.return_value = mock_cursor
    mock_cursor.skip.return_value = mock_cursor
    mock_cursor.limit.return_value = mock_cursor
    mock_cursor.to_list = AsyncMock(return_value=[{"id": "1", "uf": "SP"}])

    mock_collection.find.return_value = mock_cursor
    mock_collection.count_documents = AsyncMock(return_value=1)

    mock_get_database.return_value = {"contratacoes_proposta": mock_collection}
    
    repo = ContratacaoRepository()
    items, total = await repo.find_all(
        skip=0, 
        limit=10, 
        uf="SP", 
        busca="computador"
    )

    query_esperada = {
        "unidadeOrgao.ufSigla": "SP",
        "objetoCompra": {"$regex": "computador", "$options": "i"}
    }
    
    mock_collection.find.assert_called_once_with(query_esperada)
    mock_collection.count_documents.assert_called_once_with(query_esperada)
    
    assert len(items) == 1
    assert total == 1


@pytest.mark.asyncio
@patch("app.domain.contratacoes.repository.get_database")
async def test_get_estatisticas_pipelines(mock_get_database):

    mock_collection = MagicMock()
    mock_collection.count_documents = AsyncMock(side_effect=[100, 40])

    mock_cursor_uf = MagicMock()
    mock_cursor_uf.to_list = AsyncMock(return_value=[{"_id": "PE", "total": 10}])

    mock_cursor_mod = MagicMock()
    mock_cursor_mod.to_list = AsyncMock(return_value=[{"_id": {"id": 1, "nome": "Pregão"}, "total": 5}])

    mock_collection.aggregate.side_effect = [mock_cursor_uf, mock_cursor_mod]
    
    mock_get_database.return_value = {"contratacoes_proposta": mock_collection}
    
    repo = ContratacaoRepository()
    resultado = await repo.get_estatisticas()

    assert resultado["totalContratacoesAbertas"] == 100
    assert resultado["totalCompativeisMEI"] == 40
    assert resultado["distribuicaoPorUF"][0]["uf"] == "PE"
    assert resultado["distribuicaoPorUF"][0]["total"] == 10

    pipeline_uf_esperada = [{"$group": {"_id": "$unidadeOrgao.ufSigla", "total": {"$sum": 1}}}]
    mock_collection.aggregate.assert_any_call(pipeline_uf_esperada)