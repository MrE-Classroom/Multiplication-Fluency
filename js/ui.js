window.UI = (() => {
  const screen = () => document.getElementById("screen");
  const modal = () => document.getElementById("modal");

  function clear() { screen().innerHTML = ""; }

  function updateStatus(state) {
    const cls = state.classId ? GAME_DATA.classes[state.classId].name : "None";
    document.getElementById("classLabel").textContent = cls;
    document.getElementById("coinLabel").textContent = state.coins;
    document.getElementById("levelLabel").textContent = state.level;
  }

  function panel(title, subtitle = "") {
    const section = document.createElement("section");
    section.className = "panel";
    section.innerHTML = `<div class="panel-title"><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ""}</div><div class="panel-scroll"></div>`;
    return section;
  }

  function button(text, onClick, className = "primary-button") {
    const b = document.createElement("button");
    b.type = "button";
    b.className = className;
    b.textContent = text;
    b.addEventListener("click", onClick);
    return b;
  }

  function card(title, body, actionLabel, action, extraClass = "") {
    const c = document.createElement("article");
    c.className = `card ${extraClass}`.trim();
    c.innerHTML = `<h3>${title}</h3><p>${body}</p>`;
    if (actionLabel) c.appendChild(button(actionLabel, action, "small-button"));
    return c;
  }

  function openModal(title, bodyNodeOrHtml, actions = []) {
    document.getElementById("modalTitle").textContent = title;
    const body = document.getElementById("modalBody");
    body.innerHTML = "";
    if (typeof bodyNodeOrHtml === "string") body.innerHTML = bodyNodeOrHtml;
    else body.appendChild(bodyNodeOrHtml);
    const actionBox = document.getElementById("modalActions");
    actionBox.innerHTML = "";
    actions.forEach(a => actionBox.appendChild(button(a.label, () => { if (a.close !== false) closeModal(); a.action && a.action(); }, a.className || "primary-button")));
    modal().classList.remove("hidden");
  }

  function closeModal() { modal().classList.add("hidden"); }

  document.addEventListener("click", e => {
    if (e.target && e.target.id === "modalClose") closeModal();
    if (e.target && e.target.id === "modal") closeModal();
  });

  function statsTable(stats) {
    const keys = ["attack", "defense", "speed", "focus"];
    return `<div class="stats-row">${keys.map(k => `<span>${k}: <strong>${stats[k] || 0}</strong></span>`).join("")}</div>`;
  }

  return { clear, updateStatus, panel, button, card, openModal, closeModal, statsTable };
})();
