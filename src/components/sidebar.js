/* Componente: árvore lateral (sidebar) */
function renderSidebar(visible) {
  els.sidebarBody.innerHTML = visible.map(({ node, depth, isGroup }) => {
    const expanded = !collapsed.has(node.id);
    const owner = (!isGroup && node.owner) ? `<span class="tw-owner">${escapeHtml(node.owner)}</span>` : "";
    const assigns = nodeAssignees(node, isGroup);
    const badge = statusBadge("", statusMap[node.id]);
    const meta = `<span class="tw-meta">${badge}${avatarHTML(assigns)}</span>`;
    return `
      <div class="tree-row ${isGroup ? "is-group" : ""}" data-id="${node.id}" style="padding-left:${depth * 16 + 8}px">
        <button class="tw-toggle ${isGroup ? "" : "leaf"}" aria-expanded="${isGroup ? expanded : "false"}"
          aria-label="${isGroup ? (expanded ? "Colapsar" : "Expandir") + " " + escapeHtml(node.name) : ""}"
          data-toggle="${node.id}">${isGroup ? (expanded ? "▾" : "▸") : ""}</button>
        <button class="tw-add" data-add="${node.id}" title="Adicionar em ${escapeHtml(node.name)}" aria-label="Adicionar em ${escapeHtml(node.name)}">+</button>
        <span class="tw-label"><span class="tw-name">${escapeHtml(node.name)}</span>${owner}</span>
        ${isGroup ? "" : `<button class="tw-edit" data-edit="${node.id}" title="Editar ${escapeHtml(node.name)}" aria-label="Editar ${escapeHtml(node.name)}">✎</button>`}
        ${meta}
      </div>`;
  }).join("");
}
