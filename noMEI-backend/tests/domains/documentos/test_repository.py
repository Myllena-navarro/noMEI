import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from bson import ObjectId
from app.domain.documentos.repository import DocumentoRepository
from app.domain.documentos.schemas import DocumentoStatus

@pytest.mark.asyncio
@patch("app.domain.documentos.repository.AsyncIOMotorGridFSBucket")
@patch("app.domain.documentos.repository.get_database")
async def test_salvar_documento_chama_gridfs(mock_get_database, mock_bucket_class):

    mock_get_database.return_value = MagicMock()
    
    mock_bucket_instance = MagicMock()

    fake_id = ObjectId()
    mock_bucket_instance.upload_from_stream = AsyncMock(return_value=fake_id)

    mock_bucket_class.return_value = mock_bucket_instance
    
    repo = DocumentoRepository()
    resultado_esperado = {"id": str(fake_id), "nome": "alvara.pdf", "status": DocumentoStatus.PENDENTE}

    with patch.object(repo, 'get_by_id', new_callable=AsyncMock) as mock_get_by_id:
        mock_get_by_id.return_value = resultado_esperado

        conteudo_binario = b"01010101" # Simulação de bytes
        resultado = await repo.salvar("12345", "alvara.pdf", "application/pdf", conteudo_binario)

        mock_bucket_instance.upload_from_stream.assert_called_once()

        argumentos, kwargs = mock_bucket_instance.upload_from_stream.call_args
        
        assert argumentos[0] == "alvara.pdf"
        assert argumentos[1] == conteudo_binario
        assert kwargs["metadata"]["cnpj"] == "12345"
        assert kwargs["metadata"]["tipo"] == "application/pdf"
        assert kwargs["metadata"]["status"] == DocumentoStatus.PENDENTE
        assert resultado == resultado_esperado

@pytest.mark.asyncio
@patch("app.domain.documentos.repository.AsyncIOMotorGridFSBucket")
@patch("app.domain.documentos.repository.get_database")
async def test_listar_por_cnpj_iterador_assincrono(mock_get_database, mock_bucket_class):

    mock_get_database.return_value = MagicMock()
    mock_bucket_instance = MagicMock()
    mock_bucket_class.return_value = mock_bucket_instance

    mock_grid_out = MagicMock()
    mock_grid_out._id = ObjectId()
    mock_grid_out.filename = "contrato.pdf"
    mock_grid_out.length = 2048
    mock_grid_out.metadata = {
        "cnpj": "999888", 
        "tipo": "application/pdf", 
        "status": DocumentoStatus.PENDENTE,
        "data_upload": "2026-06-05"
    }

    async def iterador_assincrono_falso():
        yield mock_grid_out

    mock_bucket_instance.find.return_value = iterador_assincrono_falso()

    repo = DocumentoRepository()
    resultado = await repo.listar_por_cnpj("999888")
    mock_bucket_instance.find.assert_called_once_with({"metadata.cnpj": "999888"})
    
    assert len(resultado) == 1
    assert resultado[0]["nome"] == "contrato.pdf"
    assert resultado[0]["tamanho"] == 2048
    assert resultado[0]["cnpj"] == "999888"
