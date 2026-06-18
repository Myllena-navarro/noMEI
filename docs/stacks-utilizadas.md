# Documentação Técnica do Projeto - noMEI

Este documento centraliza e organiza o ecossistema tecnológico do projeto **noMEI**, dividido pelas disciplinas do ciclo de desenvolvimento. O objetivo é mapear a stack utilizada, padrões arquiteturais e decisões técnicas de cada área.

---

## 🏛️ 1. Fundamentos de Data Ops
*Esta seção documenta a infraestrutura de dados, automação, monitoramento e garantia de qualidade do fluxo de informações.*

### 🛠️ Stack Utilizada
* **Ingestão de Dados:** Apache Kafka
* **Padrão de Camadas:** Medalhão (Bronze, Silver, Gold)
* **Armazenamento / Data Lake / Lakehouse:** Apache Iceberg

---

## 🗄️ 2. Engenharia de Dados e Big Data
*Mapeamento da arquitetura de armazenamento, ingestão, processamento e transformação de dados em larga escala.*

### 🛠️ Stack Utilizada

* **Processamento (Batch/Streaming):** Apache Spark
* **Transformação de Dados:** ETL desenvolvido na disciplina
* **Armazenamento / Data Lake / Lakehouse:** Atlas Mongo DB
* **Orquestração:** Prefect
* **Gateway de Contexto e Ferramentas:** FastMCP
* **Interface do Usuário e Apresentação Reativa:** Streamlit

---

## 🚀 3. Projetos 5
*Focado na gestão do projeto, arquitetura do ecossistema principal (Backend/Frontend), integrações e metodologias de entrega.*

### 🛠️ Stack Utilizada
* **Backend Core:** Python (FastAPI)
* **Banco de Dados Principal:** MongoDB
* **Gerenciamento de Dependências / Containers:** Docker, Docker Compose
* **Gestão e Metodologia:** Trello, Scrum

---

## 📱 4. Desenvolvimento Mobile
*Especificações da aplicação cliente voltada para dispositivos móveis, focando na experiência do usuário MEI.*

### 🛠️ Stack Utilizada
* **Framework principal:** Expo Go
* **Consumo de API:** Axios

---

## 💼 5. Negócios para Internet
*Estrutura estratégica, validação de mercado, mapeamento de experiência e consolidação do negócio digital.*

### 🛠️ Artefatos e Ferramentas Utilizadas
* **Contexto, Problema e Recorte (Entrega 1):** Google Docs 
* **Stakeholders e Personas Prioritárias (Entrega 2):** Miro Whiteboard 
* **Jornada Atual e Jornada Futura (Entrega 3):** Tabela
* **Proposta de Valor e Desenho Inicial do Negócio (Entrega 4):** [pendente]
* **Consolidação do MVP e Apresentação (Entrega 5):** [pendente]

---

## 🔒 6. Segurança da Informação
*Políticas, ferramentas e conformidades aplicadas para proteger os dados dos usuários e a infraestrutura do sistema.*

### 🛠️ Stack Utilizada
* **Criptografia e Hashing de Senhas:** `bcrypt` (Rounds=12)
* **Autenticação e Autorização:** `JWT` (JSON Web Tokens - RFC 7519)
* **Biblioteca de Autenticação:** `python-jose`
* **Validação e Tipagem de Dados:** `Pydantic` (`pydantic-settings`)
* **Contexto de Requisição:** `ContextVar` (Python nativo)
* **Gerenciamento de Segredos:** Variáveis de ambiente via arquivo `.env`
* **Banco de Dados Seguro:** `MongoDB Atlas` (Armazenamento via `GridFS` para arquivos)
* **Processamento e Anonimização:** `PySpark` (Camada Gold)