# Cronograma Hierárquico de Ações por Cliente

## O que é este projeto

É um **componente web de cronograma (Gantt) hierárquico**, feito em HTML/CSS/JavaScript puro (sem dependências externas), que organiza as ações da equipe **por cliente e por fase** em uma única linha do tempo visual.

Na prática, ele funciona como um **DHTMLX Gantt** ou o **componente de Timeline do Jira (Advanced Roadmaps)**, porém leve, aberto e 100% personalizável — feito sob medida para o nosso fluxo de atendimento a clientes.

## Propósito

O objetivo é **centralizar a visão do trabalho em um só lugar**: em vez de planilhas soltas ou listas de tarefas sem contexto, o time e a gestão enxergam, em um único painel:

- **O que está planejado** — início e fim de cada ação (datas na timeline).
- **Quem é o responsável** — dono da ação + colaboradores (avatares visíveis na barra).
- **O andamento real** — percentual de progresso de cada item e das fases.
- **A saúde do cronograma** — status automático por regra: `atrasado`, `em andamento`, `pendente` ou `concluído`.
- **A estrutura hierárquica** — Cliente → Tarefa → Subtarefa, com agrupamento visual e resumo por fase.

O componente também **sincroniza com o Jira Cloud**: as ações podem ser documentadas como issues no Jira, agrupadas em uma epic (ex.: DFA-69 — Atas de Reunião e Prontuários - Fase 1), garantindo rastreabilidade e documentação exigida pela gestão.

## Funcionalidades principais

- **Timeline em Gantt** com barras por tarefa, preenchimento de progresso e barra-resumo das fases.
- **Hierarquia expansível** — clientes com suas fases e subfases, com colapsar/expandir tudo.
- **Arrastar para mover** a barra no tempo e **redimensionar pelas bordas** para ajustar início/fim.
- **Zoom e navegação** — escalas de Dia, Data, Semana e Mês, centralização no dia atual e navegação arrastando o fundo (como o Jira Timeline).
- **Roll-up automático** (herança para cima):
  - **Datas** → o grupo abraça o período dos filhos (menor início → maior fim).
  - **Progresso (%)** → média dos filhos.
  - **Status** → o pior caso dos filhos (qualquer atrasado vira atrasado; todos concluídos vira concluído; senão em andamento).
- **Status por regra** — calculado a partir do progresso e do prazo (sem depender de preenchimento manual).
- **Criação e edição** — adicionar cliente, tarefa ou subtarefa direto pela interface (modal com validação de datas).
- **Busca por cliente** — filtra a árvore e a timeline em tempo real.
- **Filtros** por categoria e status, **tema claro/escuro** e **reset** dos dados de exemplo.
- **Barras adaptativas** — quando a barra fica estreita, o percentual e o avatar "saem" para fora da barra e continuam visíveis ao lado.
- **Integração com Jira Cloud** — script que exporta as tasks e cria issues vinculadas a uma epic via REST API.

## Comparativo com ferramentas prontas

| Recurso | DHTMLX Gantt | Jira Timeline | Este componente |
|---|---|---|---|
| Timeline hierárquica | Sim | Sim | Sim |
| Arrastar / redimensionar | Sim | Sim | Sim |
| Zoom / escalas | Sim | Sim | Sim |
| Roll-up de datas/progresso | Sim | Parcial | Sim |
| Status automático por regra | Parcial | Parcial | Sim |
| Avatares / responsáveis na barra | Sim | Sim | Sim |
| Código aberto e 100% customizável | Licença comercial | Fechado | Sim |
| Custo | Alto | Incluído no plano | Zero |
| Integração com Jira | Sim | Nativo | Sim (via API) |

## Tecnologias

- **Front-end:** HTML5, CSS (variáveis customizadas para temas), JavaScript clássico (funciona até aberto direto do disco, sem build).
- **Persistência:** `localStorage` (dados locais do navegador).
- **Automação e testes:** Playwright (testes de interface e automação do browser).
- **Integração:** Jira Cloud REST API v3 (`/rest/api/3`) via script Node.js.

## Como executar

Abra o `index.html` no navegador — ou suba um servidor estático:

```bash
npx http-server .
# ou
python -m http.server 8080
```

Rodar os testes:

```bash
npm install
npx playwright install chromium
npm test
```

## Documentar tasks no Jira

1. Crie um API token em https://id.atlassian.com/manage-profile/security/api-tokens.
2. Preencha o `.env` (na raiz, fora do git) com `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`.
3. Exporte as tasks do browser para `data/tasks.json`.
4. Simule e depois crie as issues:

```bash
node scripts/jira-sync.mjs --project DFA --epic DFA-69 --dry-run
node scripts/jira-sync.mjs --project DFA --epic DFA-69
```

As issues são criadas como **Tarefa** (ou Subtarefa, quando aplicável), vinculadas à epic escolhida, com labels do cliente e da categoria e descrição com período, progresso, status e notas.

---

*Componente desenvolvido para apoiar a documentação e o acompanhamento das ações de clientes, com visualização em Gantt hierárquico no padrão DHTMLX/Jira Timeline.*