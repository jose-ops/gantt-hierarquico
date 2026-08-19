/* Componente: edição inline (modal) */
let editingId = null;
function openEditor(t) {
  editingId = t.id;
  const f = els.editorForm;
  f.name.value = t.name; f.owner.value = t.owner || "";
  f.startDate.value = t.startDate || ""; f.endDate.value = t.endDate || "";
  f.category.value = t.category || "comercial";
  f.progress.value = (t.progress != null ? t.progress : 0);
  f.notes.value = t.notes || "";
  if (typeof els.editor.showModal === "function") els.editor.showModal();
  else els.editor.setAttribute("open", "");
}
function initEditor(rerender) {
  els.editorForm.addEventListener("submit", (e) => {
    if (e.submitter && e.submitter.id === "editor-save") {
      const t = tasks.find(x => x.id === editingId);
      if (t && !(childrenMap[t.id] || []).length) {
        const f = els.editorForm;
        Object.assign(t, {
          name: f.name.value, owner: f.owner.value,
          startDate: f.startDate.value, endDate: f.endDate.value,
          category: f.category.value,
          progress: Math.max(0, Math.min(100, Number(f.progress.value) || 0)),
          notes: f.notes.value
        });
        syncTask(t);
        saveTasks(); rerender();
      }
    }
  });
  els.editorCancel.addEventListener("click", () => {
    if (typeof els.editor.close === "function") els.editor.close();
    else els.editor.removeAttribute("open");
  });
  els.body.addEventListener("dblclick", (e) => {
    const bar = e.target.closest(".bar");
    if (bar) { const t = tasks.find(x => x.id === bar.dataset.id); if (t && !(childrenMap[t.id] || []).length) openEditor(t); }
  });
}
