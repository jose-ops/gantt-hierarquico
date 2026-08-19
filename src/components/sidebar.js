/* Componente: árvore lateral (sidebar) */
function renderSidebar(visible) {
  els.sidebarBody.innerHTML = visible.map(({ node, depth, isGroup }) => {
    const expanded = !collapsed.has(node.id);
    const owner = (!isGroup && node.owner) ? `<span class="tw-owner">${escapeHtml(node.owner)}</span>` : "";
    const assigns = nodeAssignees(node, isGroup);
    const badge = isGroup ? "" : statusBadge(node);
    const meta = `<span class="tw-meta">${badge}${avatarHTML(assigns)}</span>`;
    return `
      <div class="tree-row ${isGroup ? "is-group" : ""}" data-id="${node.id}" style="padding-left:${depth * 16 + 8}px">
        <button class="tw-toggle ${isGroup ? "" : "leaf"}" aria-expanded="${isGroup ? expanded : "false"}"
          aria-label="${isGroup ? (expanded ? "Colapsar" : "Expandir") + " " + escapeHtml(node.name) : ""}"
          data-toggle="${node.id}">${isGroup ? (expanded ? "▾" : "▸") : ""}</button>
        <span class="tw-label"><span class="tw-name">${escapeHtml(node.name)}</span>${owner}</span>
        ${meta}
      </div>`;
  }).join("");
}
