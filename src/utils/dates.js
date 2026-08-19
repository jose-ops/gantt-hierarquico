/* Utilitários de data */
const MS_PER_DAY = 86400000;
const parseDate = (iso) => new Date(iso + "T00:00:00");
const dayDiff = (a, b) => Math.round((a - b) / MS_PER_DAY);
const addDays = (d, n) => new Date(d.getTime() + n * MS_PER_DAY);
const toISO = (d) => { const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), da = String(d.getDate()).padStart(2, "0"); return `${y}-${m}-${da}`; };
const fmtPT = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const fmtLabel = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
const fmtFull = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const monthLabel = (d) => d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
const weekLabel = (d) => "Sem " + getWeekNumber(d);
function getWeekNumber(d) { const f = new Date(d.getFullYear(), 0, 1); return Math.ceil((((d - f) / MS_PER_DAY) + f.getDay() + 1) / 7); }
function addMonths(d, n) { const dt = new Date(d.getTime()); dt.setMonth(dt.getMonth() + n); return dt; }
