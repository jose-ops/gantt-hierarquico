/* Componente: colunas da timeline por escala */
function buildColumns() { // Retorna objeto com colunas, total de dias, largura em px e px por dia
  const { min, max } = getRange();
  const pxPerDay = PX_PER_DAY[scale] * zoom;
  const totalDays = dayDiff(max, min) + 1;
  const columns = [];

  if (scale === "day" || scale === "data") { // Escala diária ou por data: uma coluna por dia
    const fmt = scale === "data" ? fmtFull : fmtLabel;
    for (let i = 0; i < totalDays; i++) columns.push({ label: fmt(addDays(min, i)), days: 1 });
  } else if (scale === "week") { // Escala semanal: uma coluna por semana, com label da semana
    let cur = new Date(min);
    while (dayDiff(cur, min) < totalDays) {
      const remaining = totalDays - dayDiff(cur, min);
      columns.push({ label: weekLabel(cur), days: Math.min(7, remaining) });
      cur = addDays(cur, 7);
    }
  } else { // Escala mensal: uma coluna por mês, com label do mês
    let y = min.getFullYear(), m = min.getMonth();
    const endY = max.getFullYear(), endM = max.getMonth();
    while (y < endY || (y === endY && m <= endM)) {
      const first = new Date(y, m, 1);
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      let days = daysInMonth;
      if (dayDiff(first, min) < 0) days = daysInMonth - dayDiff(min, first);
      const last = new Date(y, m, daysInMonth);
      if (last > max) days = dayDiff(max, first) + 1;
      if (days > 0) columns.push({ label: monthLabel(first), days });
      m++; if (m > 11) { m = 0; y++; }
    }
  }
  const cols = { columns, totalDays, pxPerDay, width: totalDays * pxPerDay, min };
  currentCols = cols;
  return cols;
}
