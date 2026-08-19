/* Ponto de entrada: inicializa e conecta todos os componentes */
renderLegend();
renderAll();
positionScaleToolbar();
initScaleToolbar(renderAll);
initTreeActions(renderAll);
initEditor(renderAll);
initInteractions(renderAll);
initNavigation();

document.getElementById("reset-data").addEventListener("click", () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
  location.reload();
});
window.addEventListener("resize", debounce(() => { renderAll(); positionScaleToolbar(); }, 150));
