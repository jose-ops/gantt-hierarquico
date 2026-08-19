/* Componente: navegação (botão Hoje) e tema claro/escuro */
function scrollToToday() {
  if (els.today.hidden) return;
  const lineLeft = parseFloat(els.today.style.left) || 0;
  const target = lineLeft - els.wrapper.clientWidth / 2;
  els.wrapper.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
}
function initNavigation() {
  els.diaAtual.addEventListener("click", scrollToToday);
  els.themeToggle.addEventListener("click", () => {
    const root = document.documentElement;
    if (root.dataset.theme === "dark" || root.classList.contains("theme-dark")) {
      root.classList.remove("theme-dark"); root.dataset.theme = "auto";
    } else { root.dataset.theme = "dark"; root.classList.add("theme-dark"); }
  });
}
