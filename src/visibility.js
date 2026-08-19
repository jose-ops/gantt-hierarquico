/* Visibilidade (filtros de categoria, status, cliente + colapso) */
function rootClientId(node) {
  let cur = node;
  while (cur && cur.parent && nodeMap[cur.parent]) cur = nodeMap[cur.parent];
  return cur ? cur.id : null;
}
function matchesFilter(t) {
  const cat = els.filterCategory.value, st = els.filterStatus.value;
  return (cat === "all" || t.category === cat) && (st === "all" || t.status === st);
}
function nodeVisibleByClient(node) {
  if (!clientSearch) return true;
  const root = nodeMap[rootClientId(node)];
  return !!root && root.name.toLowerCase().includes(clientSearch);
}
function computeVisible(roots) {
  const result = [];
  function walk(node, depth) {
    const kids = childrenMap[node.id] || [];
    const isGroup = kids.length > 0;
    if (!nodeVisibleByClient(node)) return false;
    const selfOk = isGroup ? true : matchesFilter(node);
    if (!selfOk) return false;
    result.push({ node, depth, isGroup });
    if (isGroup && !collapsed.has(node.id)) kids.forEach(k => walk(k, depth + 1));
    return true;
  }
  roots.forEach(r => walk(r, 0));
  return result;
}
