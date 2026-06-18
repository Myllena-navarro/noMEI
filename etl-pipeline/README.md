# noMEI ETL Pipeline

Plataforma de Engenharia de Dados para coletar, tratar, armazenar, analisar e disponibilizar dados públicos de contratações do Portal Nacional de Contratações Públicas (PNCP).

O projeto é o núcleo de dados da aplicação **noMEI**. Ele transforma dados brutos de editais e contratações em uma base curada no MongoDB Atlas, gera datasets analíticos em CSV, Parquet e DuckDB, oferece uma interface visual com Streamlit e expõe consultas para clientes de IA por meio de um servidor MCP.

## Sumário

- [Objetivo](#objetivo)
- [Colaboradores](#colaboradores)
- [Arquitetura](#arquitetura)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Camadas de dados](#camadas-de-dados)
- [Fluxos disponíveis](#fluxos-disponíveis)
- [Componentes principais](#componentes-principais)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Como executar](#como-executar)
- [Camada Gold e análises](#camada-gold-e-análises)
- [Interface Streamlit](#interface-streamlit)
- [Servidor MCP](#servidor-mcp)
- [Kafka e streaming](#kafka-e-streaming)
- [Segurança, LGPD e auditoria](#segurança-lgpd-e-auditoria)
- [Validação e testes](#validação-e-testes)
- [Saídas geradas](#saídas-geradas)

## Objetivo

O noMEI ETL Pipeline busca dados oficiais do PNCP e prepara essas informações para uso operacional, analítico e por agentes de IA. A aplicação evita que consumidores finais dependam diretamente da API externa, reduzindo acoplamento, melhorando a disponibilidade dos dados e permitindo reprocessamento controlado.

Principais capacidades:

- Extração paginada da API pública do PNCP.
- Execução incremental por intervalo de datas.
- Filtros por UF, modalidade, CNPJ, município IBGE e unidade administrativa.
- Transformação de documentos JSON em registros curados.
- Normalização de datas, valores monetários e campos textuais.
- Geração de chave idempotente por `numeroControlePNCP`.
- Persistência no MongoDB Atlas com `bulk_write` e `upsert`.
- Criação de coleção auxiliar de órgãos.
- Geração de camada Gold com PySpark.
- Exportação analítica em CSV, Parquet e DuckDB.
- Orquestração com Prefect.
- Processamento alternativo via Kafka.
- Interface visual em Streamlit.
- Servidor MCP para consultas por clientes de IA.
- Auditoria de execução e tratamento básico de LGPD.

## Colaboradores

- Débora Buriti
- Giulliano Lucas
- Gustavo Lino
- Italo Artur
- Myllena Lins
- Mirella Santana
- Pedro Fernandes

## Arquitetura

Fluxo principal:

```text
PNCP API
  -> Extract
  -> Transform
  -> Load
  -> MongoDB Atlas (Silver)
  -> PySpark Analytics
  -> Gold (CSV, Parquet, DuckDB)
  -> Streamlit / MCP / Dashboards
```

Fluxo alternativo orientado a eventos:

```text
PNCP API
  -> Kafka Producer
  -> Tópico pncp_contratacoes
  -> Kafka Consumer
  -> Transform
  -> MongoDB Atlas
```

Arquitetura lógica:

```text
Usuário / Dashboard / Cliente IA
              ^
              |
       Camadas de consulta
       - Streamlit
       - MCP Server
       - Gold CSV/Parquet/DuckDB
              ^
              |
      Dados curados e analíticos
      - MongoDB Atlas
      - analytics_output/gold
              ^
              |
          ETL Pipeline
      Extract -> Transform -> Load
              ^
              |
            PNCP API
```

## Estrutura do projeto

```text
etl-pipeline/
├── analytics_output/
│   └── gold/
├── config/
│   ├── __init__.py
│   └── settings.py
├── docker/
│   └── docker-compose.yml
├── docs/
│   ├── arquitetura_etl_pipeline.md
│   ├── seguranca.md
├── logs/
│   └── audit_log.jsonl
├── mcp_service/
│   ├── __init__.py
│   ├── app.py
│   └── mcp_server.py
├── src/
│   ├── analytics/
│   │   ├── gold_generator.py
│   │   └── metrics.py
│   ├── ingestion/
│   │   ├── extractor.py
│   │   └── producer.py
│   ├── orchestration/
│   │   ├── deployment.py
│   │   └── orchestrate_prefect.py
│   ├── processing/
│   │   ├── pipeline.py
│   │   ├── spark_transform.py
│   │   └── transformer.py
│   ├── security/
│   │   ├── anonymizer.py
│   │   ├── audit.py
│   │   └── lgpd.py
│   ├── storage/
│   │   └── loader.py
│   ├── streaming/
│   │   ├── consumer_service.py
│   │   ├── kafka_consumer.py
│   │   ├── kafka_topics.py
│   │   └── stream_pipeline.py
│   └── contracts.py
├── main.py
├── requirements.txt
└── README.md
```

## Camadas de dados

O projeto segue o modelo medalhão de Engenharia de Dados.

| Camada | Descrição | Implementação |
| --- | --- | --- |
| Bronze | Dados brutos extraídos da API do PNCP | Respostas JSON da API durante a extração |
| Silver | Dados tratados, normalizados e persistidos | MongoDB Atlas |
| Gold | Agregações e datasets prontos para análise | CSV, Parquet e DuckDB em `analytics_output/gold` |

## Fluxos disponíveis

### 1. ETL principal

Executa extração, transformação e carga de dados no MongoDB Atlas.

```text
main.py
  -> src/processing/pipeline.py
  -> src/ingestion/extractor.py
  -> src/processing/transformer.py
  -> src/storage/loader.py
```

### 2. Orquestração com Prefect

Executa o ETL com tasks monitoráveis, retries e logs do orquestrador.

```text
src/orchestration/orchestrate_prefect.py
```

### 3. Analytics com PySpark

Lê a camada Silver no MongoDB e gera datasets Gold.

```text
src/processing/spark_transform.py
  -> src/analytics/gold_generator.py
```

### 4. Visualização com Streamlit

Lê os CSVs da camada Gold e apresenta tabelas analíticas.

```text
mcp_service/app.py
```

### 5. Consultas por MCP

Expõe tools e resources para clientes de IA consultarem a base curada.

```text
mcp_service/mcp_server.py
```

### 6. Streaming com Kafka

Permite ingestão e processamento orientado a eventos.

```text
src/ingestion/producer.py
src/streaming/stream_pipeline.py
src/streaming/consumer_service.py
```

## Componentes principais

| Componente | Arquivo | Responsabilidade |
| --- | --- | --- |
| `Settings` | `config/settings.py` | Centraliza variáveis de ambiente e valida parâmetros obrigatórios |
| `PNCPExtractor` | `src/ingestion/extractor.py` | Consulta a API do PNCP com paginação, filtros e retries |
| `PNCPTransformer` | `src/processing/transformer.py` | Normaliza registros, converte tipos, enriquece metadados e aplica regras básicas de LGPD |
| `MongoDBLoader` | `src/storage/loader.py` | Persiste documentos no MongoDB com upsert e índices |
| `ETLPipeline` | `src/processing/pipeline.py` | Coordena Extract, Transform e Load em micro-lotes |
| `spark_transform.py` | `src/processing/spark_transform.py` | Gera agregações analíticas da camada Gold |
| `gold_generator.py` | `src/analytics/gold_generator.py` | Salva datasets Gold em CSV, Parquet e DuckDB |
| `orchestrate_prefect.py` | `src/orchestration/orchestrate_prefect.py` | Define tasks e flow do Prefect |
| `mcp_server.py` | `mcp_service/mcp_server.py` | Expõe tools MCP para consulta ao MongoDB |
| `app.py` | `mcp_service/app.py` | Interface Streamlit para visualizar a camada Gold |
| `stream_pipeline.py` | `src/streaming/stream_pipeline.py` | Consome mensagens Kafka, transforma e carrega no MongoDB |

## Configuração do ambiente

### Pré-requisitos

- Python 3.10 ou superior.
- Acesso à internet para consultar a API pública do PNCP.
- MongoDB Atlas ou outro MongoDB compatível.
- Java instalado para execução do PySpark.
- Docker, caso deseje executar Kafka localmente.

### Instalação

Crie e ative um ambiente virtual:

```bash
python -m venv .venv
source .venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=pncp
MONGODB_COLLECTION=contratacoes_proposta
MONGODB_ORGAOS_COLLECTION=orgaos

PNCP_BASE_URL=https://pncp.gov.br/api/consulta
REQUEST_TIMEOUT=30
MAX_RETRIES=3
RETRY_BACKOFF=2.0
PAGE_SIZE=50
MAX_PAGES=50
BATCH_SIZE=100

KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_GROUP_ID=pncp-consumer-group
KAFKA_TOPIC_PNCP=pncp_contratacoes

GOLD_OUTPUT_PATH=analytics_output/gold
GOLD_DUCKDB_PATH=analytics_output/gold/noMEI_gold.duckdb
```

Observações:

- `MONGODB_URI` é obrigatório para executar cargas, consultas MCP e geração Gold.
- `PAGE_SIZE` deve ficar entre 10 e 500.
- `MAX_PAGES`, `MAX_RETRIES` e `BATCH_SIZE` devem ser maiores que zero.
- Credenciais não devem ser colocadas diretamente no código-fonte.

## Como executar

### ETL principal via CLI

Execução limitada para teste:

```bash
python main.py --data-inicial 20260601 --data-final 20260613 --uf PE --max-paginas 1
```

Execução por período:

```bash
python main.py --data-inicial 20260601 --data-final 20260613
```

Execução com filtros:

```bash
python main.py \
  --data-inicial 20260601 \
  --data-final 20260613 \
  --uf PE \
  --modalidade 6 \
  --max-paginas 5
```

Argumentos disponíveis:

| Argumento | Descrição | Exemplo |
| --- | --- | --- |
| `--data-inicial` | Data inicial no formato `YYYYMMDD` | `20260601` |
| `--data-final` | Data final no formato `YYYYMMDD`; padrão é a data atual | `20260613` |
| `--uf` | Unidade federativa | `PE` |
| `--modalidade` | Código da modalidade de contratação | `6` |
| `--cnpj` | CNPJ do órgão | `12345678000100` |
| `--municipio-ibge` | Código IBGE do município | `2611606` |
| `--max-paginas` | Limite de páginas para testes ou cargas controladas | `1` |

O comando valida o formato das datas, impede `data_final` no futuro e impede que `data_inicial` seja maior que `data_final`.

### Orquestração com Prefect

Execute o flow padrão:

```bash
python -m src.orchestration.orchestrate_prefect
```

O flow calcula automaticamente uma janela incremental:

```text
data_final = data atual
data_inicial = data atual - dias_retroativos
```

No arquivo `src/orchestration/orchestrate_prefect.py`, o ponto de entrada padrão executa:

```python
etl_flow(
    dias_retroativos=1,
    max_paginas=1,
)
```

## Camada Gold e análises

Após popular o MongoDB, gere a camada Gold com Spark:

```bash
python -m src.processing.spark_transform
```

O processo:

1. Conecta ao MongoDB Atlas.
2. Lê os documentos da coleção Silver.
3. Cria um DataFrame Spark.
4. Calcula agregações analíticas.
5. Exibe amostras no terminal.
6. Salva CSV, Parquet e DuckDB.

Datasets gerados:

| Dataset | Descrição |
| --- | --- |
| `oportunidades_por_uf` | Quantidade de oportunidades por UF |
| `media_por_modalidade` | Valor médio estimado por modalidade |
| `oportunidades_mei` | Oportunidades marcadas como compatíveis com MEI por UF |
| `top_orgaos` | Órgãos com mais editais |
| `maiores_editais` | Dez editais com maior valor estimado |
| `maior_valor_por_uf` | Maior valor estimado encontrado por UF |

As saídas são gravadas em:

```text
analytics_output/gold/<dataset>/csv/
analytics_output/gold/<dataset>/parquet/
analytics_output/gold/noMEI_gold.duckdb
```

## Interface Streamlit

Depois de gerar a camada Gold, execute:

```bash
streamlit run mcp_service/app.py
```

A interface permite visualizar:

- Oportunidades por UF.
- Oportunidades MEI.
- Média por modalidade.
- Top órgãos.
- Maiores editais.
- Maior valor por UF.

A aplicação lê os arquivos CSV presentes em `analytics_output/gold`.

## Servidor MCP

O servidor MCP permite que clientes de IA consultem a base curada no MongoDB.

Execute:

```bash
python -m mcp_service.mcp_server
```

Tools disponíveis:

| Tool | Finalidade |
| --- | --- |
| `consultar_por_uf` | Retorna oportunidades de uma UF |
| `consultar_por_modalidade` | Retorna oportunidades por modalidade |
| `consultar_por_orgao` | Retorna oportunidades por órgão |
| `consultar_mei` | Retorna oportunidades compatíveis com MEI |
| `consultar_por_periodo` | Consulta oportunidades por intervalo de publicação |
| `consultar_contratacoes` | Consulta parametrizada combinando UF, órgão, modalidade, período, termo e MEI |
| `valor_total_contratacoes` | Agrega quantidade, valor total e valor médio para filtros combinados |
| `valor_total_por_uf` | Calcula valor total estimado para uma UF |
| `valor_total_mei` | Calcula valor total de oportunidades compatíveis com MEI |
| `resumo_geral` | Retorna estatísticas gerais da base |

Resource disponível:

```text
pncp://resumo
```

Exemplo de pergunta que pode ser atendida por um cliente conectado ao MCP:

```text
Qual o valor total das licitações de TI publicadas em Pernambuco no último trimestre?
```

Essa pergunta pode ser traduzida para:

```python
valor_total_contratacoes(
    uf="PE",
    termo_objeto="TI",
    data_inicio="2026-04-01",
    data_fim="2026-06-30",
)
```

## Kafka e streaming

O projeto possui suporte a fluxo alternativo com Apache Kafka para processamento orientado a eventos.

Suba o Kafka local:

```bash
docker compose -f docker/docker-compose.yml up -d
```

Configuração padrão:

```env
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_GROUP_ID=pncp-consumer-group
KAFKA_TOPIC_PNCP=pncp_contratacoes
```

Componentes:

- `PNCPProducer`, em `src/ingestion/producer.py`, publica mensagens JSON.
- `PNCPConsumer`, em `src/streaming/kafka_consumer.py`, consome mensagens do tópico.
- `run_stream_pipeline`, em `src/streaming/stream_pipeline.py`, transforma cada mensagem e persiste no MongoDB.

O fluxo de streaming usa o mesmo `PNCPTransformer` e o mesmo `MongoDBLoader` do ETL principal, mantendo consistência entre cargas em lote e processamento por eventos.

## Segurança, LGPD e auditoria

Medidas implementadas:

- Uso de `.env` para credenciais e configurações sensíveis.
- Validação centralizada de configurações em `Settings`.
- Ausência de credenciais hardcoded nos módulos principais.
- Auditoria estruturada em `logs/audit_log.jsonl`.
- Registro de início, fim, falhas críticas e erros de transformação.
- Reprocessamento idempotente por `_id = numeroControlePNCP`.
- Transformações de segurança e regras básicas de LGPD em `src/security`.
- Retries e backoff em operações de extração.
- Orquestração com Prefect para observabilidade e reexecução controlada.

Eventos auditados incluem:

- `etl_started`
- `etl_finished`
- `etl_error`
- `transform_error`
- `stream_pipeline_started`
- `stream_record_processed`
- `stream_processing_error`
- `stream_pipeline_finished`

## Validação e testes

Compile os módulos para validar sintaxe:

```bash
python -m compileall config src mcp_service main.py
```

Teste carregamento de configurações:

```bash
python - <<'PY'
from config.settings import Settings

settings = Settings()
print(settings.BASE_URL)
print(settings.PAGE_SIZE)
print(settings.MONGODB_DATABASE)
print(settings.KAFKA_TOPIC_PNCP)
print(settings.GOLD_OUTPUT_PATH)
PY
```

Teste uma execução pequena do ETL:

```bash
python main.py --data-inicial 20260601 --data-final 20260613 --uf PE --max-paginas 1
```

Teste a geração Gold após carregar dados no MongoDB:

```bash
python -m src.processing.spark_transform
```

Mais cenários de validação estão documentados em:

```text
docs/testes_funcionalidade_aplicacao.md
```

## Saídas geradas

### MongoDB Atlas

Banco padrão:

```text
pncp
```

Coleções padrão:

```text
contratacoes_proposta
orgaos
```

A coleção principal armazena documentos curados com:

- `_id`
- `numeroControlePNCP`
- `orgaoEntidade`
- `unidadeOrgao`
- `modalidadeNome`
- `situacaoCompraNome`
- `objetoCompra`
- `valorTotalEstimado`
- `valorTotalHomologado`
- `dataPublicacaoPncp`
- `_mei_compativel`
- `_etl_ingestao_em`
- `_etl_fonte`
- `_etl_camada`
- `_consulta`

### Arquivos analíticos

```text
analytics_output/gold/
├── maior_valor_por_uf/
├── maiores_editais/
├── media_por_modalidade/
├── oportunidades_mei/
├── oportunidades_por_uf/
├── top_orgaos/
└── noMEI_gold.duckdb
```

Cada dataset é salvo em formatos:

- CSV, para leitura simples e uso em dashboards.
- Parquet, para armazenamento colunar eficiente.
- DuckDB, para consultas SQL locais.

### Logs

```text
logs/audit_log.jsonl
```

Esse arquivo registra eventos estruturados relevantes para rastreabilidade operacional.

## Documentação complementar

- `docs/arquitetura_etl_pipeline.md`: detalhamento técnico da arquitetura.
- `docs/explicacao_aplicacao_noMEI.md`: relação entre a aplicação noMEI e o pipeline.
- `docs/seguranca.md`: justificativas de disponibilidade, proteção e auditoria.
- `docs/testes_funcionalidade_aplicacao.md`: roteiro de testes funcionais.
