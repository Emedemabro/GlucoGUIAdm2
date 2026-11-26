let medications = [];
let selectedFamily = "Todas";

const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[character]));

function renderMedications() {
  const query = $("#search").value.trim().toLocaleLowerCase("es");
  const matches = medications.filter((medication) => {
    const matchesFamily = selectedFamily === "Todas" || medication.familia === selectedFamily;
    const searchable = [medication.nombre, medication.familia, medication.descripcion]
      .join(" ")
      .toLocaleLowerCase("es");
    return matchesFamily && searchable.includes(query);
  });

  $("#count").textContent = `${matches.length} ${matches.length === 1 ? "ficha" : "fichas"}`;
  $("#list").innerHTML = matches.length
    ? matches.map((medication) => `
      <button class="card clickable" type="button" data-id="${escapeHTML(medication.id)}" aria-label="Abrir ficha de ${escapeHTML(medication.nombre)}">
        <span class="card-top">
          <span class="tag">${escapeHTML(medication.familia)}</span>
          <span class="card-state">${escapeHTML(medication.estado)}</span>
        </span>
        <span class="card-title">${escapeHTML(medication.nombre)}</span>
        <span class="meta">${escapeHTML(medication.via)}</span>
        <span class="card-description">${escapeHTML(medication.descripcion)}</span>
        <span class="more">Consultar ficha <span aria-hidden="true">→</span></span>
      </button>
    `).join("")
    : '<p class="empty-message">No hay resultados con esos filtros.</p>';
}

function renderFilters() {
  const families = ["Todas", ...new Set(medications.map((medication) => medication.familia))];
  $("#filters").innerHTML = families.map((family) => `
    <button class="${family === selectedFamily ? "selected" : ""}" type="button" data-filter="${escapeHTML(family)}" aria-pressed="${family === selectedFamily}">
      ${escapeHTML(family)}
    </button>
  `).join("");
}

function showMedication(id) {
  const medication = medications.find((item) => item.id === id);
  if (!medication) return;

  $("#detailbody").innerHTML = `
    <h2 id="detail-title">${escapeHTML(medication.nombre)}</h2>
    <p class="detailmeta">${escapeHTML(medication.familia)} · ${escapeHTML(medication.via)}</p>
    <p class="detail-status">${escapeHTML(medication.estado)}</p>
    <section class="detailsection">
      <h4>Mecanismo resumido</h4>
      <p>${escapeHTML(medication.descripcion)}</p>
    </section>
    <section class="detailsection">
      <h4>Aspectos de seguridad por validar</h4>
      <ul>${medication.seguridad.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
    </section>
    <section class="detailsection">
      <h4>Enfoque de dispensación</h4>
      <p>${escapeHTML(medication.dispensacion)}</p>
    </section>
    <p class="notice">Contenido preliminar, sin validación farmacoterapéutica final. No utilizar para decisiones clínicas.</p>
  `;
  $("#detail").showModal();
  $("#close").focus();
}

function activateTab(tab) {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    const active = button === tab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });

  document.querySelectorAll(".panel").forEach((panel) => {
    const active = panel.id === tab.dataset.tab;
    panel.hidden = !active;
    panel.classList.toggle("hidden", !active);
  });
}

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => activateTab(button));
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const tabs = [...document.querySelectorAll("[data-tab]")];
    const currentIndex = tabs.indexOf(button);
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
      : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    activateTab(tabs[nextIndex]);
    tabs[nextIndex].focus();
  });
});

$("#filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  selectedFamily = button.dataset.filter;
  renderFilters();
  renderMedications();
});

$("#list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-id]");
  if (button) showMedication(button.dataset.id);
});

$("#search").addEventListener("input", () => {
  if ($("#meds").hidden) activateTab($("#tab-meds"));
  renderMedications();
});

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    $("#search").focus();
  }
});

$("#close").addEventListener("click", () => $("#detail").close());

async function loadMedications() {
  try {
    const response = await fetch("./medicamentos.json");
    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("El catálogo no tiene el formato esperado.");
    medications = data;
    renderFilters();
    renderMedications();
  } catch (error) {
    console.error("No se pudo cargar medicamentos.json:", error);
    $("#count").textContent = "Catálogo no disponible";
    $("#filters").replaceChildren();
    $("#list").innerHTML = '<p class="load-error">No fue posible cargar el catálogo. Comprueba la conexión o abre la aplicación desde un servidor web.</p>';
  }
}

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("No se pudo registrar el service worker:", error);
    });
  });
}

loadMedications();
