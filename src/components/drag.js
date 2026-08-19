/* Componente: arrastar (mover/redimensionar), pan e zoom */
let drag = null;
let dragMoved = false;

function onBarPointerDown(e, bar, node, isGroup, eff) {
  if (e.button !== undefined && e.button !== 0) return;
  const handleEl = e.target.closest(".bar-handle");
  const mode = handleEl ? handleEl.dataset.side : "move";
  drag = {
    mode, node, isGroup, bar,
    startX: e.clientX,
    origLeft: parseFloat(bar.style.left),
    origWidth: parseFloat(bar.style.width),
    origStart: eff.start, origEnd: eff.end,
    dayWidth: currentCols.pxPerDay,
    pointerId: e.pointerId, moved: false
  };
  dragMoved = false;
  bar.setPointerCapture(e.pointerId);
  bar.classList.add("dragging");
  e.preventDefault();
  e.stopPropagation();
  hideTooltip();
}

function onPointerMove(e) {
  if (drag) {
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 2) { drag.moved = true; dragMoved = true; }
    const deltaDays = Math.round(dx / drag.dayWidth);
    if (drag.mode === "move") {
      drag.bar.style.left = (drag.origLeft + deltaDays * drag.dayWidth) + "px";
    } else if (drag.mode === "left") {
      let newLeft = drag.origLeft + deltaDays * drag.dayWidth;
      let newWidth = drag.origWidth - deltaDays * drag.dayWidth;
      const minW = drag.dayWidth;
      if (newWidth < minW) { newWidth = minW; newLeft = drag.origLeft + drag.origWidth - minW; }
      drag.bar.style.left = newLeft + "px";
      drag.bar.style.width = newWidth + "px";
    } else if (drag.mode === "right") {
      let newWidth = drag.origWidth + deltaDays * drag.dayWidth;
      if (newWidth < drag.dayWidth) newWidth = drag.dayWidth;
      drag.bar.style.width = newWidth + "px";
    }
    return;
  }
  if (pan.active) {
    els.wrapper.scrollLeft = pan.startScroll - (e.clientX - pan.startX);
  }
}

function onPointerUp(e) {
  if (pan.active) { endPan(e); return; }
  if (!drag) return;
  const d = drag; drag = null;
  d.bar.classList.remove("dragging");
  try { d.bar.releasePointerCapture(d.pointerId); } catch (_) {}
  if (!d.moved) return;

  const dx = e.clientX - d.startX;
  const deltaDays = Math.round(dx / d.dayWidth);
  if (deltaDays === 0) { renderAll(); return; }

  if (d.isGroup) {
    descendants(d.node.id).filter(n => !(childrenMap[n.id] || []).length).forEach(leaf => {
      leaf.startDate = toISO(addDays(parseDate(leaf.startDate), deltaDays));
      leaf.endDate = toISO(addDays(parseDate(leaf.endDate), deltaDays));
      syncTask(leaf);
    });
  } else if (d.mode === "move") {
    d.node.startDate = toISO(addDays(d.origStart, deltaDays));
    d.node.endDate = toISO(addDays(d.origEnd, deltaDays));
    syncTask(d.node);
  } else if (d.mode === "left") {
    let ns = addDays(d.origStart, deltaDays);
    if (ns > d.origEnd) ns = d.origEnd;
    d.node.startDate = toISO(ns);
    syncTask(d.node);
  } else if (d.mode === "right") {
    let ne = addDays(d.origEnd, deltaDays);
    if (ne < d.origStart) ne = d.origStart;
    d.node.endDate = toISO(ne);
    syncTask(d.node);
  }
  saveTasks();
  renderAll();
}

const pan = { active: false, startX: 0, startScroll: 0 };
function initPan() {
  els.body.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".bar")) return;
    pan.active = true;
    pan.startX = e.clientX;
    pan.startScroll = els.wrapper.scrollLeft;
    els.wrapper.classList.add("panning");
    hideTooltip();
    try { els.wrapper.setPointerCapture(e.pointerId); } catch (_) { }
  });
}
function endPan(e) {
  pan.active = false;
  els.wrapper.classList.remove("panning");
  try { els.wrapper.releasePointerCapture(e.pointerId); } catch (_) {}
}

function initZoom() {
  els.wrapper.addEventListener("wheel", (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    // Ancora o zoom na "data de hoje" (mantém hoje fixo na tela durante o zoom)
    const today = new Date(); today.setHours(0, 0, 0, 0); 
    const todayOffset = dayDiff(today, currentCols.min) * currentCols.pxPerDay;
    const todayScreenX = todayOffset - els.wrapper.scrollLeft;
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15; 
    zoom = Math.min(4, Math.max(0.3, zoom * factor));
    renderAll();
    const newTodayOffset = dayDiff(today, currentCols.min) * currentCols.pxPerDay; 
    els.wrapper.scrollLeft = newTodayOffset - todayScreenX;
  }, { passive: false });
}

function initInteractions(rerender) {
  initPan();
  initZoom();
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", () => { if (drag) { drag.bar.classList.remove("dragging"); drag = null; } endPan({ pointerId: null }); });
}
