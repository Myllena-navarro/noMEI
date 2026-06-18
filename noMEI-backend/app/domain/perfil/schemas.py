from pydantic import BaseModel, ConfigDict, Field


class PerfilBase(BaseModel):
    cnpj: str = Field(..., description="CNPJ do MEI")
    cnae: str | None = None
    uf: str | None = None
    cidade: str | None = None
    palavras_chave: list[str] = []
    notificacoes: bool = True


class PerfilCreate(PerfilBase):
    pass

class PerfilResponse(PerfilBase):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., alias="_id")
    user_id: str | None = None
    nome: str | None = None