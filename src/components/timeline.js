/* Componente: timeline (cabeçalho de colunas + barras) */
function renderTimeline(visible, cols) {
  els.header.style.gridTemplateColumns = cols.columns.map(c => (c.days * cols.pxPerDay) + "px").join(" ");
  els.header.innerHTML = cols.columns.map(c => `<div class="tl-col">${c.label}</div>`).join("");

  els.body.style.width = cols.width + "px";
  els.body.querySelectorAll(".tl-row").forEach(n => n.remove());
  const frag = document.createDocumentFragment();
  visible.forEach(({ node, isGroup }) => {
    const eff = effective[node.id];
    const row = document.createElement("div");
    row.className = "tl-row"; row.dataset.id = node.id;

    const left = dayDiff(eff.start, cols.min) * cols.pxPerDay;
    const w = (dayDiff(eff.end, eff.start) + 1) * cols.pxPerDay;

    const bar = document.createElement("div");
    bar.className = "bar" + (isGroup ? " summary" : "");
    bar.style.left = left + "px";
    bar.style.width = Math.max(w, 12) + "px";
    if (!isGroup) bar.style.background = categoryColors[node.category];
    bar.dataset.status = node.status || "pendente";
    bar.dataset.id = node.id;
    bar.tabIndex = 0;
    bar.setAttribute("role", "button");
    const stLabel = statusIndicators[node.status || "pendente"].label;
    bar.setAttribute("aria-label",
      isGroup
        ? `${node.name}, grupo com ${childrenMap[node.id].length} ações, de ${fmtPT(eff.start)} a ${fmtPT(eff.end)}. Arraste para mover.`
        : `${node.name}, responsável ${node.owner || "—"}, de ${fmtPT(eff.start)} a ${fmtPT(eff.end)}, status: ${stLabel}. Arraste para mover ou redimensione pelas bordas.`);
    const handles = isGroup ? "" :
      `<span class="bar-handle left" data-side="left" aria-hidden="true"></span><span class="bar-handle right" data-side="right" aria-hidden="true"></span>`;
    const pct = computeProgress(node);
    const assigns = nodeAssignees(node, isGroup);
    const primary = assigns[0];
    const av = primary ? (primary.avatar
        ? `<span class="bar-avatar" title="${escapeHtml(primary.name)}" style="background-image:url('${escapeHtml(primary.avatar)}')"></span>`
        : `<span class="bar-avatar" title="${escapeHtml(primary.name)}" style="background-color:${avatarColor(primary.name)}">${initials(primary.name)}</span>`)
      : "";
    bar.innerHTML = `<span class="bar-fill" style="width:${pct}%"></span>` +
                    (isGroup ? "" : `<span class="bar-status-ico">${statusIndicators[node.status].icon}</span>`) +
                    `<span class="bar-label">${escapeHtml(node.name)}</span>` +
                    `<span class="bar-pct">${pct}%</span>${av}` + handles;

    bar.addEventListener("mouseenter", () => showTooltip(node, eff, isGroup, bar));
    bar.addEventListener("mouseleave", hideTooltip);
    bar.addEventListener("focus", () => showTooltip(node, eff, isGroup, bar));
    bar.addEventListener("blur", hideTooltip);
    bar.addEventListener("click", (e) => { e.stopPropagation(); if (!dragMoved) showTooltip(node, eff, isGroup, bar); });
    bar.addEventListener("touchstart", (e) => { e.stopPropagation(); showTooltip(node, eff, isGroup, bar); }, { passive: true });
    bar.addEventListener("pointerdown", (e) => onBarPointerDown(e, bar, node, isGroup, eff));
    bar.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && !isGroup) { e.preventDefault(); openEditor(node); } });

    row.appendChild(bar);
    frag.appendChild(row);
  });
  els.body.appendChild(frag);
}

function positionToday(cols) {
  const { min, pxPerDay, totalDays } = cols;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const offset = dayDiff(today, min);
  if (offset >= 0 && offset <= totalDays) {
    els.today.style.left = (offset * pxPerDay) + "px";
    els.today.style.height = els.body.scrollHeight + "px";
    els.today.hidden = false;
  } else els.today.hidden = true;
}
