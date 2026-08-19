/* Componente: legenda */
function renderLegend() {
  let html = "<strong>Categorias:</strong> ";
  for (const k in categoryColors) if (k !== "group")
    html += `<span class="legend-item"><span class="legend-swatch" style="background:${categoryColors[k]}"></span>${categoryLabels[k]}</span>`;
  html += " &nbsp; <strong>Status:</strong> ";
  for (const k in statusIndicators)
    html += `<span class="legend-item legend-status"><span class="status-icon">${statusIndicators[k].icon}</span>${statusIndicators[k].label}</span>`;
  html += ` &nbsp; <strong>Grupo:</strong> <span class="legend-item"><span class="legend-swatch" style="background:var(--summary-bg)"></span>barra-resumo</span>`;
  els.legend.innerHTML = html;
}
