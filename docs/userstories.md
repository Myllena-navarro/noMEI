# 📚 Histórias de Usuário (User Stories) - noMEI

Este documento consolida as Histórias de Usuário, os critérios de jornada e o mapeamento de entregas para a plataforma **noMEI**. A estrutura foi desenhada para garantir a coesão entre as necessidades de negócio do Microempreendedor Individual (MEI) e o cronograma de desenvolvimento da disciplina.

---

## 🛠️ Mapeamento de Epics & User Stories

### 1. Descoberta de Oportunidades (Epic)
**Objetivo:** Garantir que o MEI localize editais viáveis de forma ágil e centralizada.

#### **US01 - Visualização de Licitações Relevantes**
* **Como** MEI
* **Quero** ver licitações relevantes para o meu tipo de serviço
* **Para** não perder tempo com editais que não fazem sentido.
* **Funcionalidade:** Sistema de recomendação / Busca e Filtros de licitações.
* **Alinhamento do Cronograma:** Planejado no Módulo de Editais da **Semana 10** (Foco em listagem, busca e filtros).
* **Marco:** Entrega do **Capstone 1** (Fluxo de consulta de editais funcionando ponta a ponta).

#### **US02 - Alertas de Novas Licitações**
* **Como** MEI
* **Quero** receber alertas de novas licitações
* **Para** não perder prazos importantes.
* **Funcionalidade:** Sistema de notificações.
* **Alinhamento do Cronograma:** Desenvolvido no módulo de alertas e notificações da **Semana 12**.
* **Marco:** Entrega do **Capstone 2** (MVP funcional integrado).

---

### 2. Entendimento de Editais (Epic)
**Objetivo:** Traduzir a complexidade dos documentos públicos para a realidade do microempreendedor.

#### **US03 - Tradução de Linguagem Jurídica**
* **Como** MEI
* **Quero** ver explicações simples dos editais
* **Para** entender o que está sendo pedido.
* **Funcionalidade:** Tradução de linguagem jurídica → linguagem simples (Integração com Chatbot).
* **Alinhamento do Cronograma:** Refinamento e validação de experiência na **Semana 14 e 15**.
* **Marco:** **Capstone 3 / Milestone 3** (Ajustes finos de UX baseados em feedback e chatbot funcional).

#### **US04 - Resumo de Requisitos**
* **Como** MEI
* **Quero** um resumo dos requisitos
* **Para** saber rapidamente se posso participar.
* **Funcionalidade:** Resumo automático de editais / Módulo de Requisitos.
* **Alinhamento do Cronograma:** Mapeado no Módulo de requisitos e documentos da **Semana 11**.
* **Marco:** Entrega do **Milestone 1** (Fluxo de acompanhamento operacional).

---

### 3. Participação Guiada (Epic)
**Objetivo:** Reduzir erros operacionais e burocráticos no envio das propostas.

#### **US05 - Passo a Passo Guiado**
* **Como** MEI
* **Quero** um passo a passo guiado
* **Para** conseguir me inscrever sem erros.
* **Funcionalidade:** Checklist de documentos e fluxo de telas.
* **Alinhamento do Cronograma:** Desenvolvido na **Semana 11** focando em checklist de habilitação e persistência de dados.
* **Marco:** Entrega do **Milestone 1**.

#### **US06 - Ajuda no Preenchimento de Documentos**
* **Como** MEI
* **Quero** ajuda no preenchimento de documentos
* **Para** evitar rejeição por erro formal.
* **Funcionalidade:** Assistente de preenchimento / Upload de documentos.
* **Alinhamento do Cronograma:** Implementado na **Semana 11** com revisões e tratamentos de erro que se estendem até a **Semana 15** (conforme apontado no Kanban de Bugs/Ajustes).

---

### 4. Acompanhamento e Gestão (Epic)
**Objetivo:** Trazer transparência ao andamento das etapas após a submissão.

#### **US07 - Acompanhamento de Status**
* **Como** MEI
* **Quero** acompanhar o status da minha participação
* **Para** saber o andamento.
* **Funcionalidade:** Dashboard de acompanhamento.
* **Alinhamento do Cronograma:** Construído no escopo de Dashboard Resumido da **Semana 12**.
* **Marco:** Entrega do **Capstone 2**.

#### **US08 - Alertas de Prazos e Etapas**
* **Como** MEI
* **Quero** alertas de prazos e etapas
* **Para** não ser desclassificado.
* **Funcionalidade:** Sistema de notificações de prazos.
* **Alinhamento do Cronograma:** Finalizado junto ao ecossistema de segurança e alertas na **Semana 12**.
* **Marco:** Entrega do **Capstone 2** (MVP funcional integrado).

---

### 5. Suporte (Epic)
**Objetivo:** Canal direto para sanar impedimentos durante o uso do sistema.

#### **US09 - Atendimento de Dúvidas**
* **Como** MEI
* **Quero** tirar dúvidas rapidamente
* **Para** não travar no processo.
* **Funcionalidade:** FAQ ou chatbot básico.
* **Alinhamento do Cronograma:** Acoplado à arquitetura de dados e interface (Streamlit/Chatbot) com refinamento de usabilidade focado nas semanas finais (**Semanas 13 a 15**).

---

## 📊 Matriz de Rastreabilidade (Negócio vs. Cronograma da Disciplina)

Esta tabela consolida como as histórias de usuário exigidas pelo negócio se encaixaram nas semanas de desenvolvimento cobradas pelo professor:

| ID | User Story Original | Funcionalidade Correlata | Semana de Desenvolvimento | Entrega / Milestone Associated |
| :---: | :--- | :--- | :---: | :--- |
| **US01** | Visualização de Licitações | Sistema de busca/filtros | Semana 10 | **Capstone 1:** Consulta ponta a ponta |
| **US04** | Resumo de Requisitos | Resumo de editais | Semana 11 | **Milestone 1:** Acompanhamento operacional |
| **US05** | Passo a Passo Guiado | Checklist de documentos | Semana 11 | **Milestone 1:** Acompanhamento operacional |
| **US06** | Ajuda em Documentos | Assistente/Upload | Semana 11 | **Milestone 1:** Acompanhamento operacional |
| **US02** | Alertas de Licitações | Notificações | Semana 12 | **Capstone 2:** MVP funcional integrado |
| **US07** | Acompanhamento de Status | Dashboard resumido | Semana 12 | **Capstone 2:** MVP funcional integrado |
| **US08** | Alertas de Prazos | Notificações de prazos | Semana 12 | **Capstone 2:** MVP funcional integrado |
| **US03** | Tradução Jurídica | Chatbot / IA | Semana 15 | **Milestone 3:** Pacote final pronto (Fechamento) |
| **US09** | Suporte Rápido | Chatbot / FAQ | Semana 15 | **Milestone 3:** Pacote final pronto (Fechamento) |

---

## 📌 Status Atual do Backlog (Semana 15 - 02/06/2026)

Atualmente o projeto encontra-se na **Semana 15 (Fechamento e Apresentação)**. 
* O núcleo de desenvolvimento das histórias de descoberta, requisitos e dashboard (**US01, US02, US04, US05, US07 e US08**) já foi concluído nos marcos anteriores.
* Os esforços atuais estão concentrados em ações de qualidade (resolução de bugs de integração e ajustes finais de preenchimento de documentos — **US06**) e na consolidação documental (incluindo este mapeamento de histórias requisitado) para geração do pacote final de avaliação (**Milestone 3**).