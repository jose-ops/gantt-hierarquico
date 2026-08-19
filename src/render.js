/* Orquestrador de renderização */
function renderAll() {
  const roots = buildTree();
  const activeRoots = clientSearch
    ? roots.filter(r => r.name.toLowerCase().includes(clientSearch))
    : roots;
  effective = {};
  progressMap = {};
  statusMap = {};
  tasks.forEach(t => computeEffective(t));
  tasks.forEach(t => computeStatus(t));
  const cols = buildColumns();
  const visible = computeVisible(activeRoots);

  renderSidebar(visible);
  renderTimeline(visible, cols);
  positionToday(cols);
}
