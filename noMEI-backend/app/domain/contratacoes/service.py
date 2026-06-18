import math
from typing import Any

from app.domain.contratacoes.repository import ContratacaoRepository


class ContratacaoService:
    def __init__(self):
        self.repository = ContratacaoRepository()

    async def listar_contratacoes(
        self,
        page: int = 1,
        limit: int = 10,
        uf: str | None = None,
        modalidade_id: int | None = None,
        valor_max: float | None = None,
        mei_compativel: bool | None = None,
        busca: str | None = None,
        cnae: str | None = None,
    ) -> dict[str, Any]:

        skip = (page - 1) * limit
        items, total = await self.repository.find_all(
            skip=skip,
            limit=limit,
            uf=uf,
            modalidade_id=modalidade_id,
            valor_max=valor_max,
            mei_compativel=mei_compativel,
            busca=busca,
            cnae=cnae,
        )

        pages = max(1, math.ceil(total / limit)) if limit > 0 else 1

        return {
            "total": total,
            "page": page,
            "pages": pages,
            "items": items
        }

    async def obter_contratacao(self, numero_controle_pncp: str) -> dict[str, Any] | None:
        return await self.repository.find_by_id(numero_controle_pncp)

    async def obter_estatisticas(self) -> dict[str, Any]:
        return await self.repository.get_estatisticas()
