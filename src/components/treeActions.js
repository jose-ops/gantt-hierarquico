/* Componente: expandir/colapsar + filtros */
function initTreeActions(rerender) {
  els.sidebarBody.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) { openEditor(null, addBtn.dataset.add); return; }
    const editBtn = e.target.closest("[data-edit]");
    if (editBtn) {
      const t = tasks.find(x => x.id === editBtn.dataset.edit);
      if (t && !(childrenMap[t.id] || []).length) openEditor(t);
      return;
    }
    const btn = e.target.closest("[data-toggle]");
    if (!btn) return;
    const id = btn.dataset.toggle;
    if (collapsed.has(id)) collapsed.delete(id); else collapsed.add(id);
    rerender();
  });
  const addClientBtn = document.getElementById("add-client");
  if (addClientBtn) addClientBtn.addEventListener("click", () => openEditor(null, null));
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
