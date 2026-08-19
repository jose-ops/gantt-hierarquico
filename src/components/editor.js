/* Componente: criação/edição inline (modal) */
let editingId = null;
let creatingId = null;
let creatingParent = null;

function setEditorRequired(on) {
  els.editorForm.startDate.required = on;
  els.editorForm.endDate.required = on;
}

/* t = tarefa existente (editar); parent = id do pai (criar filho). */
function openEditor(t, parent) {
  const f = els.editorForm;
  if (t) {
    editingId = t.id; creatingId = null; creatingParent = null;
    f.name.value = t.name; f.owner.value = t.owner || "";
    f.startDate.value = t.startDate || ""; f.endDate.value = t.endDate || "";
    f.category.value = t.category || "comercial";
    f.progress.value = (t.progress != null ? t.progress : 0);
    f.notes.value = t.notes || "";
    setEditorRequired(true);
  } else {
    editingId = null; creatingParent = parent; creatingId = genId();
    const isClient = parent === null;
    let defStart = rel(0), defEnd = rel(7);
    if (parent && effective[parent] && effective[parent].start && !isNaN(effective[parent].start)) {
      defStart = toISO(effective[parent].start);
      defEnd = toISO(effective[parent].end);
    }
    f.name.value = ""; f.owner.value = "";
    f.startDate.value = isClient ? "" : defStart;
    f.endDate.value = isClient ? "" : defEnd;
    f.category.value = isClient ? "group" : "comercial";
    f.progress.value = 0; f.notes.value = "";
    setEditorRequired(!isClient);
  }
  if (typeof els.editor.showModal === "function") els.editor.showModal();
  else els.editor.setAttribute("open", "");
}

function initEditor(rerender) {
  els.editorForm.addEventListener("submit", (e) => {
    if (e.submitter && e.submitter.id === "editor-save") {
      const f = els.editorForm;
      if (editingId) {
        const t = tasks.find(x => x.id === editingId);
        if (t && !(childrenMap[t.id] || []).length) {
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
      } else if (creatingId) {
        const isClient = creatingParent === null;
        const t = {
          id: creatingId, name: f.name.value, parent: creatingParent,
          owner: f.owner.value, category: f.category.value, notes: f.notes.value
        };
        if (isClient) { t.startDate = rel(0); t.endDate = rel(7); t.progress = 0; }
        else {
          t.startDate = f.startDate.value; t.endDate = f.endDate.value;
          t.progress = Math.max(0, Math.min(100, Number(f.progress.value) || 0));
        }
        if (creatingParent) collapsed.delete(creatingParent);
        tasks.push(t);
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
