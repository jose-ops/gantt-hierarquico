/* Componente: expandir/colapsar + filtros */
function initTreeActions(rerender) {
  els.sidebarBody.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-toggle]");
    if (!btn) return;
    const id = btn.dataset.toggle;
    if (collapsed.has(id)) collapsed.delete(id); else collapsed.add(id);
    rerender();
  });
  document.getElementById("collapse-all").addEventListener("click", () => {
    buildTree();
    tasks.forEach(t => { if ((childrenMap[t.id] || []).length) collapsed.add(t.id); });
    rerender();
  });
  document.getElementById("expand-all").addEventListener("click", () => { collapsed.clear(); rerender(); });
  els.filterCategory.addEventListener("change", rerender);
  els.filterStatus.addEventListener("change", rerender);
  els.searchClientEl.addEventListener("input", (e) => { clientSearch = e.target.value.trim().toLowerCase(); rerender(); });
}
