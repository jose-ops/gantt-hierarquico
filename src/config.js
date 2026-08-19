/* Cores, rótulos e helpers de status/avatar */
const categoryColors = {
  comercial: "#378ADD", onboarding: "#1D9E75", suporte: "#D85A30", group: "#6B7280"
};
const statusIndicators = {
  concluido: { icon: "✓", label: "Concluído", color: "#10c419" },
  em_andamento: { icon: "▶", label: "Em andamento", color: "#3486d3" },
  atrasado: { icon: "!", label: "Atrasado", color: "#d30e0e" },
  pendente: { icon: "•", label: "Pendente", color: "#d8701b" }
};
const categoryLabels = {
  comercial: "Comercial", onboarding: "Onboarding", suporte: "Suporte", group: "Grupo"
};
const avatarPalette = ["#0052cc", "#1d9e75", "#d85a30", "#6554c0", "#ff8b00", "#de350b", "#00857a", "#8777d9", "#42526e"];

function avatarColor(name) { let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return avatarPalette[h % avatarPalette.length]; }
function initials(name) { const p = String(name).trim().split(/\s+/); return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase(); }
function getAssignees(node) {
  if (node.assignees && node.assignees.length) return node.assignees.map(a => typeof a === "string" ? { name: a } : a);
  if (node.owner) return [{ name: node.owner, avatar: node.avatar }];
  return [];
}

function avatarHTML(list) {
  if (!list.length) return "";
  const shown = list.slice(0, 3);
  const extra = list.length - shown.length;
  let html = shown.map(a => a.avatar
    ? `<span class="avatar" title="${escapeHtml(a.name)}" style="background-image:url('${escapeHtml(a.avatar)}')"></span>`
    : `<span class="avatar" title="${escapeHtml(a.name)}" style="background-color:${avatarColor(a.name)}">${initials(a.name)}</span>`).join("");
  if (extra > 0) html += `<span class="avatar more" title="${extra} mais colaboradores">+${extra}</span>`;
  return `<span class="avatar-stack">${html}</span>`;
}

function statusBadge(node) {
  const s = statusIndicators[node.status || "pendente"];
  return `<span class="status-badge" style="color:${s.color};background:color-mix(in srgb, ${s.color} 16%, transparent)"><span class="dot"></span>${s.label}</span>`;
}

function nodeAssignees(node, isGroup) {
  let assigns = getAssignees(node);
  if (isGroup) {
    const map = new Map();
    descendants(node.id).forEach(d => getAssignees(d).forEach(a => map.set(a.name, a)));
    assigns = [...map.values()];
  }
  return assigns;
}
