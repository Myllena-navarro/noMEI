import pytest
from unittest.mock import patch, AsyncMock
from app.domain.documentos.service import DocumentoService
from app.domain.documentos.schemas import DocumentoStatus
from app.core.exceptions import NotFoundError

@pytest.mark.asyncio
@patch("app.domain.documentos.service.DocumentoRepository.salvar")
async def test_upload_documento_sucesso(mock_salvar):

    conteudo_falso = b"%PDF-1.4... dados binarios falsos ..."
    
    mock_salvar.return_value = {
        "id": "123", 
        "nome": "alvara.pdf", 
        "tamanho": len(conteudo_falso)
    }
    
    service = DocumentoService()

    resultado = await service.upload("123456789", "alvara.pdf", "application/pdf", conteudo_falso)

    assert resultado["id"] == "123"
    assert resultado["tamanho"] == len(conteudo_falso)
    
    mock_salvar.assert_called_once_with("123456789", "alvara.pdf", "application/pdf", conteudo_falso)


@pytest.mark.asyncio
@patch("app.domain.documentos.service.DocumentoRepository.download")
async def test_download_documento_sucesso(mock_download):

    conteudo_esperado = b"binarios do pdf"
    mock_download.return_value = (conteudo_esperado, "doc.pdf", "application/pdf")
    
    service = DocumentoService()

    resultado = await service.download("doc_123")

    assert resultado[0] == conteudo_esperado
    assert resultado[1] == "doc.pdf"
    assert resultado[2] == "application/pdf"


@pytest.mark.asyncio
@patch("app.domain.documentos.service.DocumentoRepository.download")
async def test_download_documento_nao_encontrado_dispara_erro(mock_download):

    mock_download.return_value = None
    service = DocumentoService()

    with pytest.raises(NotFoundError) as erro_capturado:
        await service.download("id_invalido")
    assert str(erro_capturado.value) == "Documento não encontrado"