/* Estado, dados (seed), storage e construção da árvore */
const STORAGE_KEY = "gantt_hier_v2";
let tasks = [];

/* Status é 100% automático, derivado de progresso + prazo de entrega:
   - progresso 100%                         => "concluido"
   - fim anterior a hoje (e não concluído)  => "atrasado"
   - dentro do prazo e progresso 1% a 99%   => "em_andamento"
   - dentro do prazo e progresso 0%         => "pendente"
   - progresso sempre entre 0 e 100 */
function syncTask(t) {
  t.progress = Math.max(0, Math.min(100, Number(t.progress) || 0));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end = t.endDate ? parseDate(t.endDate) : null;
  const overdue = end && end < today;
  if (t.progress >= 100) t.status = "concluido";
  else if (overdue) t.status = "atrasado";
  else if (t.progress >= 1) t.status = "em_andamento";
  else t.status = "pendente";
}

function loadTasks() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const arr = JSON.parse(s);
      arr.forEach(t => { if (t.status) syncTask(t); });
      return arr;
    }
  } catch (e) { }
  return seedTasks.map(t => ({ ...t }));
}
function saveTasks() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (e) { } }

const _hoje = new Date(); _hoje.setHours(0, 0, 0, 0);
const rel = (offset) => toISO(addDays(_hoje, offset));

const seedTasks = [
  { id: "cA", name: "CASAS BAHIA", parent: null, category: "group" },
  { id: "cA-1", name: "Enviar proposta", parent: "cA", owner: "Ana Silva", category: "comercial", startDate: rel(-20), endDate: rel(-16), status: "concluido", progress: 100, notes: "Proposta após reunião de descoberta" },
  { id: "cA-2", name: "Kickoff de projeto", parent: "cA", owner: "Bruno Costa", category: "onboarding", startDate: rel(-15), endDate: rel(-11), status: "concluido", progress: 100, notes: "Alinhamento de escopo" },
  { id: "cA-3", name: "Suporte pós-venda", parent: "cA", owner: "Diego Lima", category: "suporte", startDate: rel(-5), endDate: rel(6), status: "em_andamento", progress: 45, assignees: ["Diego Lima", "Ana Silva"], notes: "Acompanhamento contínuo" },

  { id: "cB", name: "VARIG", parent: null, category: "group" },
  { id: "cB-1", name: "Configurar ambiente", parent: "cB", owner: "Carla Dias", category: "onboarding", startDate: rel(-10), endDate: rel(2), status: "em_andamento", progress: 60, assignees: ["Carla Dias", "Bruno Costa"], notes: "Provisionamento em andamento" },
  { id: "cB-2", name: "Treinamento equipe", parent: "cB", owner: "Bruno Costa", category: "onboarding", startDate: rel(3), endDate: rel(14), status: "pendente", progress: 0, notes: "Agendar com gestores" },
  { id: "cB-3", name: "Abertura de chamados", parent: "cB", owner: "Diego Lima", category: "suporte", startDate: rel(-1), endDate: rel(5), status: "atrasado", progress: 30, assignees: ["Diego Lima", "Ana Silva", "Bruno Costa", "Carla Dias"], notes: "Dependência de API externa" },

  { id: "cC", name: "ITAUTEC S/A", parent: null, category: "group" },
  { id: "cC-1", name: "Renovação de contrato", parent: "cC", owner: "Ana Silva", category: "comercial", startDate: rel(6), endDate: rel(16), status: "pendente", progress: 10, notes: "Enviar minuta jurídica" },
  { id: "cC-2", name: "Expansão de licenças", parent: "cC", owner: "Carla Dias", category: "comercial", startDate: rel(20), endDate: rel(31), status: "pendente", progress: 40, notes: "Cotação de novas seats" },

  { id: "cD", name: "CVC", parent: null, category: "group" },
  { id: "cD-1", name: "Desenvolvimento de feature", parent: "cD", owner: "Ana Silva", category: "comercial", startDate: rel(6), endDate: rel(16), status: "pendente", progress: 65, notes: "Enviar minuta jurídica" },
  { id: "cD-2", name: "Testes de regressão", parent: "cD", owner: "Carla Dias", category: "comercial", startDate: rel(20), endDate: rel(31), status: "pendente", progress: 50, notes: "Cotação de novas seats" },

  { id: "cE", name: "Forever 21", parent: null, category: "group" },
  { id: "cE-1", name: "Renovação de contrato", parent: "cE", owner: "Ana Silva", category: "comercial", startDate: rel(6), endDate: rel(16), status: "pendente", progress: 30, notes: "Enviar minuta jurídica" },
  { id: "cE-2", name: "Expansão de licenças", parent: "cE", owner: "Carla Dias", category: "comercial", startDate: rel(20), endDate: rel(31), status: "pendente", progress: 90, notes: "Cotação de novas seats" }
];

tasks = loadTasks();

let scale = "week";
let zoom = 1;
let clientSearch = "";
const PX_PER_DAY = { day: 36, data: 72, week: 90 / 7, month: 120 / 30 };
const collapsed = new Set();
let currentCols = null;

const els = {
  wrapper: document.getElementById("scroll-wrapper"),
  sidebarBody: document.getElementById("sidebar-body"),
  header: document.getElementById("timeline-header"),
  body: document.getElementById("timeline-body"),
  today: document.getElementById("today-line"),
  tooltip: document.getElementById("tooltip"),
  legend: document.getElementById("legend"),
  filterCategory: document.getElementById("filter-category"),
  filterStatus: document.getElementById("filter-status"),
  searchClientEl: document.getElementById("search-client"),
  editor: document.getElementById("editor"),
  editorForm: document.getElementById("editor-form"),
  editorCancel: document.getElementById("editor-cancel"),
  themeToggle: document.getElementById("theme-toggle"),
  diaAtual: document.getElementById("diaAtual")
};

let nodeMap = {}, childrenMap = {};
function buildTree() {
  nodeMap = {}; childrenMap = {};
  tasks.forEach(t => { nodeMap[t.id] = t; childrenMap[t.id] = []; });
  const roots = [];
  tasks.forEach(t => { if (t.parent && nodeMap[t.parent]) childrenMap[t.parent].push(t); else roots.push(t); });
  return roots;
}
function descendants(id) {
  const out = [];
  (childrenMap[id] || []).forEach(c => { out.push(c); out.push(...descendants(c.id)); });
  return out;
}

let effective = {};
let progressMap = {};
function computeProgress(node) {
  if (progressMap[node.id] != null) return progressMap[node.id];
  const kids = childrenMap[node.id] || [];
  if (!kids.length) { const p = Math.max(0, Math.min(100, Number(node.progress) || 0)); progressMap[node.id] = p; return p; }
  const vals = kids.map(k => computeProgress(k));
  const p = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  progressMap[node.id] = p; return p;
}
function computeEffective(node) {
  if (effective[node.id]) return effective[node.id];
  const kids = childrenMap[node.id];
  if (!kids || kids.length === 0) { const e = { start: parseDate(node.startDate), end: parseDate(node.endDate), isGroup: false }; effective[node.id] = e; return e; }
  let min = null, max = null;
  kids.forEach(k => { const ke = computeEffective(k); if (!min || ke.start < min) min = ke.start; if (!max || ke.end > max) max = ke.end; });
  const e = { start: min, end: max, isGroup: true }; effective[node.id] = e; return e;
}
function getRange() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  // Janela fixa: 3 meses antes e 3 meses depois de hoje
  let min = addMonths(today, -3);
  let max = addMonths(today, 3);
  // Não corta tarefas que fujam desse intervalo
  tasks.forEach(t => {
    if (t.startDate && t.endDate) {
      const s = parseDate(t.startDate), e = parseDate(t.endDate);
      if (s < min) min = s;
      if (e > max) max = e;
    }
  });
  return { min, max };
}
