/* Componente: tooltip */
function showTooltip(t, eff, isGroup, barEl) {
  let body;
  if (isGroup) {
    body = `
      <div class="tt-row"><span class="tt-key">Tipo</span><span>Grupo (resumo)</span></div>
      <div class="tt-row"><span class="tt-key">Período</span><span>${fmtPT(eff.start)} → ${fmtPT(eff.end)}</span></div>
      <div class="tt-row"><span class="tt-key">Ações</span><span>${childrenMap[t.id].length}</span></div>`;
  } else {
    body = `
      <div class="tt-row"><span class="tt-key">Responsável</span><span>${escapeHtml(t.owner || "—")}</span></div>
      <div class="tt-row"><span class="tt-key">Período</span><span>${fmtPT(eff.start)} → ${fmtPT(eff.end)}</span></div>
       <div class="tt-row"><span class="tt-key">Categoria</span><span>${categoryLabels[t.category]}</span></div>
       <div class="tt-row"><span class="tt-key">Status</span><span>${statusIndicators[t.status].icon} ${statusIndicators[t.status].label}</span></div>
       <div class="tt-row"><span class="tt-key">Progresso</span><span>${computeProgress(t)}%</span></div>
       <div class="tt-row"><span class="tt-key">Notas</span><span>${escapeHtml(t.notes || "—")}</span></div>`;
  }
  els.tooltip.innerHTML = `<h4>${escapeHtml(t.name)}</h4>` + body;
  els.tooltip.hidden = false;
  const r = barEl.getBoundingClientRect();
  const tw = els.tooltip.offsetWidth, th = els.tooltip.offsetHeight;
  let x = r.left + window.scrollX, y = r.bottom + window.scrollY + 6;
  if (x + tw > window.scrollX + window.innerWidth - 8) x = window.scrollX + window.innerWidth - tw - 8;
  if (y + th > window.scrollY + window.innerHeight - 8) y = r.top + window.scrollY - th - 6;
  els.tooltip.style.left = x + "px"; els.tooltip.style.top = y + "px";
}
function hideTooltip() { els.tooltip.hidden = true; }
document.addEventListener("touchstart", (e) => { if (!e.target.closest(".bar") && !e.target.closest(".gantt-tooltip")) hideTooltip(); });
document.addEventListener("click", (e) => { if (!e.target.closest(".bar") && !e.target.closest(".gantt-tooltip")) hideTooltip(); });
