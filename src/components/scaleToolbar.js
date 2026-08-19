/* Componente: barra de escala flutuante (Dia/Data/Semana/Mês) */
function positionScaleToolbar() {
  // Posicionamento agora é via CSS (position: fixed na viewport),
  // então a barra fica sempre na tela, mesmo rolando a página.
}
function initScaleToolbar(rerender) {
  const st = document.querySelector(".gantt-scale");
  const toggle = st && st.querySelector(".scale-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const collapsed = st.classList.toggle("collapsed");
      toggle.textContent = collapsed ? "›" : "‹";
      toggle.setAttribute("aria-label", collapsed ? "Expandir barra de datas" : "Recolher barra de datas");
    });
  }
  document.querySelectorAll(".scale-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      scale = btn.dataset.scale; zoom = 1;
      document.querySelectorAll(".scale-btn").forEach(b => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      rerender();
    });
  });
}
