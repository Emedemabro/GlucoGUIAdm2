const sections = {
  medicamentos: {
    title: "NO INSULÍNICOS",
    items: [{
      title: "Metformina",
      label: "FICHA AMPLIADA",
      route: "VÍA ORAL",
      icon: "capsule",
      layout: "metformina"
    }]
  },
  insulinas: { title: "INSULINAS", items: [] },
  seguridad: { title: "Seguridad", items: [] },
  fundamentos: { title: "Fundamentos de la DM2", items: [] },
  proyecto: { title: "Proyecto", items: [] }
};

const sectionNav = document.querySelector("#section-nav");
const searchInput = document.querySelector("#search-input");
const cardGrid = document.querySelector("#card-grid");
const titleNode = document.querySelector("#section-title");
const countNode = document.querySelector("#item-count");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyDescription = document.querySelector("#empty-description");
const resultsMessage = document.querySelector("#results-message");
const detailBackdrop = document.querySelector("#detail-backdrop");
const detailContent = document.querySelector("#detail-content");
let activeSection = "medicamentos";
let installPrompt;

const allItems = Object.entries(sections).flatMap(([section, data]) =>
  data.items.map((item) => ({ ...item, section, sectionTitle: data.title }))
);

function render() {
  const query = searchInput.value.trim().toLocaleLowerCase("es");
  const selected = sections[activeSection];
  const items = (query
    ? allItems
    : selected.items.map((item) => ({ ...item, section: activeSection, sectionTitle: selected.title })))
    .filter((item) => {
      if (!query) return true;
      return [
        item.title, item.subtitle, item.description, item.label, item.route, item.overview,
        ...(item.points || [])
      ]
        .join(" ").toLocaleLowerCase("es").includes(query);
    });

  titleNode.firstChild.textContent = query ? "Resultados" : selected.title;
  countNode.textContent = items.length;
  resultsMessage.textContent = query && items.length
    ? `${items.length} ${items.length === 1 ? "ficha encontrada" : "fichas encontradas"}`
    : "";
  emptyTitle.textContent = query ? "No hay coincidencias" : "Aún no hay fichas";
  emptyDescription.textContent = query
    ? "Prueba con otro término o explora una sección distinta."
    : "Las fichas aparecerán aquí cuando se incorpore su contenido.";
  cardGrid.replaceChildren(...items.map(createCard));
  emptyState.hidden = items.length > 0;
  cardGrid.hidden = items.length === 0;
}

function createCard(item) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "info-card";
  card.setAttribute("aria-label", `Abrir ficha: ${item.title}`);

  const top = document.createElement("span");
  top.className = "card-top";
  const icon = document.createElement("span");
  icon.className = `card-icon ${item.icon === "capsule" ? "card-capsule-icon" : item.tone || ""}`;
  icon.setAttribute("aria-hidden", "true");
  if (item.icon === "capsule") {
    const capsule = document.createElement("span");
    capsule.className = "capsule-icon";
    icon.append(capsule);
  } else {
    icon.textContent = item.icon || "";
  }
  const label = document.createElement("span");
  label.className = `card-label${item.section === "medicamentos" ? " label-med" : ""}`;
  label.textContent = item.label || item.sectionTitle;
  top.append(icon, label);

  const title = document.createElement("span");
  title.className = "card-title";
  title.textContent = item.title;
  if (item.route) {
    const route = document.createElement("span");
    route.className = "card-route";
    route.textContent = item.route;
    card.append(top, title, route);
  } else {
    card.append(top, title);
  }
  const description = document.createElement("span");
  description.className = "card-description";
  description.textContent = item.description || item.subtitle || "";
  const bottom = document.createElement("span");
  bottom.className = "card-bottom";
  const category = document.createElement("span");
  category.textContent = item.subtitle || item.sectionTitle;
  const arrow = document.createElement("span");
  arrow.className = "card-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "→";
  bottom.append(category, arrow);
  card.append(description, bottom);
  card.addEventListener("click", () => openDetail(item));
  return card;
}

function openDetail(item) {
  if (item.layout === "metformina") {
    openMetforminDetail(item);
    return;
  }

  detailContent.replaceChildren();
  const icon = document.createElement("div");
  icon.className = `card-icon detail-icon ${item.tone || ""}`;
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = item.icon || "";
  const label = document.createElement("span");
  label.className = "card-label";
  label.textContent = item.label || item.sectionTitle;
  const title = document.createElement("h2");
  title.id = "detail-title";
  title.textContent = item.title;
  const subtitle = document.createElement("p");
  subtitle.className = "detail-subtitle";
  subtitle.textContent = item.subtitle || "";
  detailContent.append(icon, label, title, subtitle);

  const body = document.createElement("div");
  body.className = "detail-body";
  if (item.sections?.length) {
    item.sections.forEach((section) => {
      const sectionNode = document.createElement("section");
      sectionNode.className = "detail-section";
      const category = document.createElement("p");
      category.className = "detail-section-category";
      category.textContent = section.category;
      const heading = document.createElement("h3");
      heading.textContent = section.title;
      sectionNode.append(category, heading);
      if (section.fields?.length) {
        const fields = document.createElement("ul");
        section.fields.forEach((field) => {
          const entry = document.createElement("li");
          entry.textContent = field;
          fields.append(entry);
        });
        sectionNode.append(fields);
      }
      body.append(sectionNode);
    });
  }
  if (item.overview) appendDetailText(body, "En pocas palabras", item.overview);
  if (item.points?.length) {
    const heading = document.createElement("h3");
    heading.textContent = "Puntos clave";
    const list = document.createElement("ul");
    item.points.forEach((point) => {
      const li = document.createElement("li");
      li.textContent = point;
      list.append(li);
    });
    body.append(heading, list);
  }
  if (item.safety) appendDetailText(body, "Seguridad y seguimiento", item.safety);
  if (item.source) {
    const source = document.createElement("p");
    source.className = "detail-source";
    source.textContent = item.source;
    body.append(source);
  }
  if (body.childElementCount) detailContent.append(body);
  detailBackdrop.hidden = false;
  document.querySelector("#detail-close").focus();
}

function openMetforminDetail(item) {
  detailContent.replaceChildren();
  const label = document.createElement("span");
  label.className = "card-label";
  label.textContent = item.label;
  if (item.icon === "capsule") {
    const capsule = document.createElement("span");
    capsule.className = "capsule-icon modal-capsule";
    capsule.setAttribute("aria-hidden", "true");
    detailContent.append(capsule);
  }
  const title = document.createElement("h2");
  title.id = "detail-title";
  title.textContent = item.title;
  detailContent.append(label, title);
  if (item.route) {
    const route = document.createElement("p");
    route.className = "detail-route";
    route.textContent = item.route;
    detailContent.append(route);
  }

  const navigation = document.createElement("div");
  navigation.className = "metformin-navigation";
  navigation.setAttribute("role", "tablist");
  navigation.setAttribute("aria-label", "Apartados de la ficha");
  const quickTab = createTab("DISPENSACIÓN RÁPIDA", "quick");
  const clinicalTab = createTab("INFORMACIÓN CLÍNICA", "clinical");
  navigation.append(quickTab, clinicalTab);
  detailContent.append(navigation);

  const quickPanel = document.createElement("section");
  quickPanel.id = "metformin-quick-panel";
  quickPanel.className = "metformin-panel";
  quickPanel.setAttribute("aria-label", "Dispensación rápida");
  const quickHeading = document.createElement("h3");
  quickHeading.className = "panel-title";
  quickHeading.textContent = "Dispensación rápida";
  quickPanel.append(quickHeading);

  const quickViews = document.createElement("div");
  quickViews.className = "quick-view-tabs";
  quickViews.setAttribute("role", "tablist");
  quickViews.setAttribute("aria-label", "Vistas de dispensación rápida");
  const firstView = createTab("Primera dispensación", "first");
  const usualView = createTab("Uso habitual", "usual");
  quickViews.append(firstView, usualView);
  setActiveTab(navigation, quickTab, "data-main-tab");
  setActiveTab(quickViews, firstView, "data-main-tab");
  quickPanel.append(quickViews);
  const quickViewTitle = document.createElement("h4");
  quickViewTitle.className = "quick-view-title";
  quickViewTitle.textContent = "Primera dispensación";
  const quickViewPlaceholder = document.createElement("p");
  quickViewPlaceholder.className = "content-placeholder";
  quickViewPlaceholder.textContent = "Contenido pendiente.";
  quickPanel.append(quickViewTitle, quickViewPlaceholder);

  const clinicalPanel = document.createElement("section");
  clinicalPanel.id = "metformin-clinical-panel";
  clinicalPanel.className = "metformin-panel";
  clinicalPanel.setAttribute("aria-label", "Información clínica");
  clinicalPanel.hidden = true;
  const clinicalHeading = document.createElement("h3");
  clinicalHeading.className = "panel-title";
  clinicalHeading.textContent = "Información clínica";
  clinicalPanel.append(clinicalHeading);
  const clinicalTopics = [
    "Posicionamiento terapéutico",
    "Mecanismo de acción",
    "Reacciones adversas",
    "Función renal y precauciones",
    "Interacciones y situaciones de riesgo",
    "Alertas para la dispensación"
  ];
  clinicalTopics.forEach((topic) => {
    const details = document.createElement("details");
    details.className = "clinical-topic";
    const summary = document.createElement("summary");
    summary.textContent = topic;
    const placeholder = document.createElement("p");
    placeholder.className = "content-placeholder";
    placeholder.textContent = "Contenido pendiente.";
    details.append(summary, placeholder);
    clinicalPanel.append(details);
  });
  detailContent.append(quickPanel, clinicalPanel);

  const shortcutsTitle = document.createElement("h3");
  shortcutsTitle.className = "shortcut-heading";
  shortcutsTitle.textContent = "Accesos directos";
  const shortcuts = document.createElement("nav");
  shortcuts.className = "metformin-shortcuts";
  shortcuts.setAttribute("aria-label", "Accesos directos de la ficha");
  [
    ["QUÉ PREGUNTAR", "questions"],
    ["QUÉ EXPLICAR", "explain"],
    ["ALERTAS", "alerts"],
    ["APRENDER MÁS", "learn"]
  ].forEach(([text, target]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "shortcut-card";
    button.dataset.shortcut = target;
    button.textContent = text;
    shortcuts.append(button);
  });
  detailContent.append(shortcutsTitle, shortcuts);

  const questions = document.createElement("section");
  questions.id = "metformin-questions";
  questions.className = "metformin-content-section";
  const questionsTitle = document.createElement("h3");
  questionsTitle.textContent = "PREGUNTAS ESENCIALES PARA UNA ATENCIÓN SEGURA";
  const guide = document.createElement("p");
  guide.className = "guidance-note";
  guide.textContent = "Guía orientativa: seleccionar según el contexto; no es necesario formularlas todas ni registrar respuestas personales.";
  const question = document.createElement("p");
  question.textContent = "¿Es la primera vez que utilizará metformina? ¿Recibió indicaciones sobre su administración?";
  questions.append(questionsTitle, guide, question);

  const explain = document.createElement("section");
  explain.id = "metformin-explain";
  explain.className = "metformin-content-section";
  const explainTitle = document.createElement("h3");
  explainTitle.textContent = "¿Cómo explicárselo al paciente?";
  const purposeTitle = document.createElement("h4");
  purposeTitle.textContent = "¿Para qué sirve?";
  const purpose = document.createElement("p");
  purpose.textContent = "La metformina ayuda a controlar la glucosa en sangre, principalmente disminuyendo la glucosa que produce el hígado.";
  const symptomsTitle = document.createElement("h4");
  symptomsTitle.textContent = "¿Qué molestias pueden aparecer?";
  const symptoms = document.createElement("ul");
  ["Náuseas", "Vómitos", "Diarrea", "Dolor abdominal"].forEach((symptom) => {
    const entry = document.createElement("li");
    entry.textContent = symptom;
    symptoms.append(entry);
  });
  explain.append(explainTitle, purposeTitle, purpose, symptomsTitle, symptoms);

  const alerts = document.createElement("section");
  alerts.id = "metformin-alerts";
  alerts.className = "metformin-content-section alert-content";
  const alertsTitle = document.createElement("h3");
  alertsTitle.textContent = "EFECTOS ADVERSOS QUE CONVIENE MENCIONAR";
  const alertsText = document.createElement("p");
  alertsText.textContent = "Al inicio pueden aparecer náuseas, diarrea y molestias abdominales. Si persisten, empeoran o dificultan la hidratación, solicitar orientación al químico farmacéutico y evaluación médica según la gravedad.";
  alerts.append(alertsTitle, alertsText);

  const learn = document.createElement("section");
  learn.id = "metformin-learn";
  learn.className = "metformin-content-section";
  const learnTitle = document.createElement("h3");
  learnTitle.textContent = "APRENDER MÁS";
  const learnPlaceholder = document.createElement("p");
  learnPlaceholder.className = "content-placeholder";
  learnPlaceholder.textContent = "Contenido pendiente.";
  learn.append(learnTitle, learnPlaceholder);
  detailContent.append(questions, explain, alerts, learn);

  navigation.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-main-tab]");
    if (!tab) return;
    setActiveTab(navigation, tab, "data-main-tab");
    const showQuick = tab.dataset.mainTab === "quick";
    quickPanel.hidden = !showQuick;
    clinicalPanel.hidden = showQuick;
  });

  quickViews.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-main-tab]");
    if (!tab) return;
    setActiveTab(quickViews, tab, "data-main-tab");
    quickViewTitle.textContent = tab.dataset.mainTab === "first" ? "Primera dispensación" : "Uso habitual";
    quickViewPlaceholder.textContent = "Contenido pendiente.";
  });

  shortcuts.addEventListener("click", (event) => {
    const button = event.target.closest("[data-shortcut]");
    if (!button) return;
    setActiveTab(navigation, quickTab, "data-main-tab");
    quickPanel.hidden = false;
    clinicalPanel.hidden = true;
    const targets = {
      questions,
      explain,
      alerts,
      learn
    };
    targets[button.dataset.shortcut].scrollIntoView({ behavior: "smooth", block: "start" });
  });

  detailBackdrop.hidden = false;
  document.querySelector(".detail-dialog").scrollTop = 0;
  document.querySelector("#detail-close").focus();
}

function createTab(text, value) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "detail-tab";
  button.dataset.mainTab = value;
  button.setAttribute("role", "tab");
  button.setAttribute("aria-selected", "false");
  button.textContent = text;
  return button;
}

function setActiveTab(container, activeTab, attribute) {
  container.querySelectorAll(`[${attribute}]`).forEach((tab) => {
    const selected = tab === activeTab;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
}

function appendDetailText(container, headingText, value) {
  const heading = document.createElement("h3");
  heading.textContent = headingText;
  const text = document.createElement("p");
  text.textContent = value;
  container.append(heading, text);
}

sectionNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-section]");
  if (!button) return;
  activeSection = button.dataset.section;
  sectionNav.querySelectorAll(".nav-item").forEach((item) => {
    const isActive = item === button;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-current", isActive ? "page" : "false");
  });
  searchInput.value = "";
  render();
});

searchInput.addEventListener("input", render);
document.querySelector("#clear-search").addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  render();
});
document.querySelector("#view-toggle").addEventListener("click", (event) => {
  const listMode = cardGrid.classList.toggle("is-list");
  event.currentTarget.setAttribute("aria-label", listMode ? "Mostrar fichas en cuadrícula" : "Mostrar fichas en lista");
});
document.querySelector("#detail-close").addEventListener("click", () => { detailBackdrop.hidden = true; });
detailBackdrop.addEventListener("click", (event) => {
  if (event.target === detailBackdrop) detailBackdrop.hidden = true;
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape" && !detailBackdrop.hidden) detailBackdrop.hidden = true;
});
window.addEventListener("online", updateConnection);
window.addEventListener("offline", updateConnection);

function updateConnection() {
  document.querySelector("#connection-label").textContent = navigator.onLine
    ? "Lista para consultar"
    : "Modo sin conexión";
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  document.querySelector("#install-button").hidden = false;
});
document.querySelector("#install-button").addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  document.querySelector("#install-button").hidden = true;
});

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("No se pudo registrar el service worker:", error);
    });
  });
}

updateConnection();
render();
