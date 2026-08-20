/* Sincroniza as tasks do gantt com o Jira Cloud (cria issues via REST API v3).
   Uso:
     node scripts/jira-sync.mjs --list-projects
     node scripts/jira-sync.mjs --project DFA --epic DFA-69 --dry-run
     node scripts/jira-sync.mjs --project DFA --epic DFA-69

   Config via variáveis de ambiente (ou arquivo .env na raiz, já ignorado pelo git):
     JIRA_BASE_URL   ex: https://suaempresa.atlassian.net
     JIRA_EMAIL      email usado no login do Jira
     JIRA_API_TOKEN  API token (id.atlassian.com/manage-profile/security/api-tokens)
     JIRA_PROJECT_KEY (ou --project KEY)
     JIRA_EPIC_KEY   chave da epic que vai agrupar as tasks (ou --epic KEY)
*/
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const has = (n) => args.includes(n);
const flag = (n, d = '') => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const DRY_RUN = has('--dry-run');
const LIST_PROJECTS = has('--list-projects');
const PROJECT_KEY = flag('--project', process.env.JIRA_PROJECT_KEY || '');
const EPIC_KEY = flag('--epic', process.env.JIRA_EPIC_KEY || '');
const DATA_FILE = resolve(flag('--data', 'data/tasks.json'));

function loadEnv() {
  const file = resolve('.env');
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = loadEnv();
const BASE = (process.env.JIRA_BASE_URL || env.JIRA_BASE_URL || '').replace(/\/+$/, '');
const EMAIL = process.env.JIRA_EMAIL || env.JIRA_EMAIL || '';
const TOKEN = process.env.JIRA_API_TOKEN || env.JIRA_API_TOKEN || '';

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}/rest/api/3${path}`, {
    ...opts,
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64'),
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jira ${res.status} ${path}: ${text.slice(0, 400)}`);
  }
  return res.json();
}

const slug = (s) => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 200);

function jqlEscape(s) { return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"'); }

function adf(lines) {
  return {
    type: 'doc', version: 1,
    content: lines.filter(Boolean).map((text) => ({
      type: 'paragraph',
      content: [{ type: 'text', text }],
    })),
  };
}

function statusOf(t) {
  if (t.progress >= 100) return 'Concluído';
  if (t.endDate && t.endDate < new Date().toISOString().slice(0, 10)) return 'Atrasado';
  if (t.progress > 0) return 'Em andamento';
  return 'Pendente';
}

async function findExisting(typeName, summary, label, parentKey) {
  const parentClause = parentKey ? ` AND parent = "${jqlEscape(parentKey)}"` : '';
  const jql = `project = "${jqlEscape(PROJECT_KEY)}" AND type = ${typeName} AND summary = "${jqlEscape(summary)}" AND labels = "${jqlEscape(label)}"${parentClause}`;
  const r = await api('/search/jql?jql=' + encodeURIComponent(jql) + '&maxResults=5&fields=summary');
  return (r.issues || []).map((i) => i.key);
}

async function createIssue(typeObj, summary, extra = {}, parentKey = null) {
  const payload = {
    fields: {
      project: { key: PROJECT_KEY },
      issuetype: { id: typeObj.id },
      summary,
      ...extra,
    },
  };
  if (parentKey) payload.fields.parent = { key: parentKey };
  const r = await api('/issue', { method: 'POST', body: JSON.stringify(payload) });
  return r.key;
}

async function main() {
  if (!BASE || !EMAIL || !TOKEN) {
    console.error('Faltam credenciais. Defina no .env (raiz) ou nas variáveis de ambiente:');
    console.error('  JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN');
    process.exit(1);
  }
  if (LIST_PROJECTS) {
    const r = await api('/project');
    console.log('Projetos disponíveis:');
    for (const p of r) console.log(`  ${p.key.padEnd(12)} ${p.name}`);
    return;
  }
  if (!PROJECT_KEY) {
    console.error('Informe a key do projeto com --project KEY (ou rode --list-projects para ver).');
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  if (!Array.isArray(raw) || !raw.length) {
    console.error(`Nenhuma task em ${DATA_FILE} — exporte as tasks primeiro.`);
    process.exit(1);
  }
  const byId = new Map(raw.map((t) => [t.id, t]));
  const childrenOf = new Map();
  for (const t of raw) {
    if (!t.parent) continue;
    if (!childrenOf.has(t.parent)) childrenOf.set(t.parent, []);
    childrenOf.get(t.parent).push(t);
  }
  const clients = raw.filter((t) => !t.parent);
  const groups = raw.filter((t) => t.parent && childrenOf.has(t.id));
  const leaves = raw.filter((t) => !childrenOf.has(t.id));

  const proj = await api(`/project/${PROJECT_KEY}`);
  const epicType = proj.issueTypes.find((t) => t.name === 'Epic');
  const subType = proj.issueTypes.find((t) => t.name === 'Subtarefa' || t.name === 'Sub-task');
  const taskType = proj.issueTypes.find((t) => t.name === 'Tarefa' || t.name === 'Task')
    || proj.issueTypes.find((t) => !t.subtask && t.name !== 'Epic');

  console.log(`Projeto: ${proj.name} (${proj.key})`);
  console.log(`  Clientes: ${clients.length} | Grupos: ${groups.length} | Folhas: ${leaves.length}`);
  console.log(`  Tipos: Tarefa=${taskType ? taskType.name + ' (#' + taskType.id + ')' : 'n/a'} | Subtarefa=${subType ? subType.name + ' (#' + subType.id + ')' : 'n/a'} | Epic=${epicType ? epicType.name + ' (#' + epicType.id + ')' : 'n/a'}`);
  if (EPIC_KEY) {
    const epic = await api(`/issue/${EPIC_KEY}`).catch(() => null);
    if (!epic) { console.error(`Epic ${EPIC_KEY} não encontrada no projeto.`); process.exit(1); }
    const epicFields = epic.fields || {};
    if (epicFields.issuetype && epicFields.issuetype.name !== 'Epic') {
      console.error(`${EPIC_KEY} não é uma Epic (é ${epicFields.issuetype.name}).`); process.exit(1);
    }
    console.log(`  Epic alvo: ${EPIC_KEY} — ${epicFields.summary || ''} (${epicFields.status ? epicFields.status.name : ''})`);
  }
  if (DRY_RUN) console.log('  [DRY-RUN] nenhuma issue será criada.\n');

  let created = 0, skipped = 0;

  for (const c of clients) {
    const descs = descendantsOf(c.id);
    for (const t of descs) {
      const parentTask = t.parent ? byId.get(t.parent) : null;
      const isSub = parentTask && groups.includes(parentTask);
      const typeObj = isSub ? subType : taskType;
      const labels = [slug(c.name), slug(t.category)];
      const extra = {
        labels,
        description: adf([
          `Cliente: ${c.name}`,
          `Período: ${t.startDate || '—'} a ${t.endDate || '—'}`,
          `Progresso: ${t.progress ?? 0}%`,
          `Status: ${statusOf(t)}`,
          t.owner ? `Responsável: ${t.owner}` : '',
          t.notes ? `Notas: ${t.notes}` : '',
        ]),
      };
      let parentKey = null;
      if (EPIC_KEY) parentKey = EPIC_KEY;
      else if (isSub) parentKey = parentTask.jiraKey || null;
      else if (epicType) parentKey = null;

      const existing = await findExisting(typeObj.name, t.name, slug(c.name), parentKey);
      if (existing.length) { skipped++; if (!DRY_RUN) console.log(`  [skip] ${t.name} (já existe: ${existing[0]})`); continue; }
      if (DRY_RUN) { console.log(`  [criar] ${typeObj.name} "${t.name}" [${labels.join(', ')}]${parentKey ? ' -> epic ' + parentKey : ''}`); created++; continue; }
      const key = await createIssue(typeObj, t.name, extra, parentKey);
      t.jiraKey = key;
      created++;
      console.log(`  [ok] ${key} ${typeObj.name} "${t.name}"`);
    }
  }

  console.log(`\nConcluído: ${created} criada(s), ${skipped} já existente(s).`);
  if (created && DRY_RUN) console.log('Rode sem --dry-run para criar de verdade.');

  function descendantsOf(id) {
    const kids = childrenOf.get(id) || [];
    return kids.flatMap((k) => [k].concat(descendantsOf(k.id)));
  }
}

main().catch((e) => { console.error('Erro:', e.message); process.exit(1); });