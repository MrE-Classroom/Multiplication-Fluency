(() => {
  let state = Store.load();
  let round = null;

  function saveRender(renderFn) {
    Store.save(state);
    UI.updateStatus(state);
    if (renderFn) renderFn();
  }

  function init() {
    UI.updateStatus(state);
    if (!state.classId) renderClassSelect();
    else renderTown();
  }

  function renderClassSelect() {
    UI.clear();
    const p = UI.panel("Choose Your Class", "Pick carefully. Your class will be locked, but you get one free class change later.");
    const body = p.querySelector(".panel-scroll");
    const grid = document.createElement("div");
    grid.className = "class-grid";
    Object.entries(GAME_DATA.classes).forEach(([id, cls]) => {
      const item = document.createElement("article");
      item.className = "class-card";
      item.innerHTML = `<h3>${cls.name}</h3><div class="stars">${cls.stars}</div><p>${cls.description}</p><p><strong>${cls.abilityName}:</strong> ${cls.ability}</p>${UI.statsTable(cls.baseStats)}`;
      item.appendChild(UI.button(`Choose ${cls.name}`, () => {
        UI.openModal(`Choose ${cls.name}?`, `<p>Your class will be locked. You can change classes in Town later.</p>`, [
          { label: "Cancel", className: "secondary-button" },
          { label: `Choose ${cls.name}`, action: () => { state.classId = id; saveRender(renderTown); } }
        ]);
      }, "primary-button"));
      grid.appendChild(item);
    });
    body.appendChild(grid);
    UI.screen?.appendChild;
    document.getElementById("screen").appendChild(p);
  }

  function renderTown() {
    UI.clear();
    state.bossLock = false;
    const cls = GAME_DATA.classes[state.classId];
    const p = UI.panel("Town", `${cls.name} • ${cls.abilityName}`);
    const body = p.querySelector(".panel-scroll");
    const menu = document.createElement("div");
    menu.className = "town-menu";
    const actions = [
      ["Training Area", "Always available. Practice facts that need attention.", renderTrainingStart],
      ["Adventure Gate", "Complete area rounds and earn boss keys.", renderAdventure],
      ["Class Shop", "Only shows items for your current class.", renderShop],
      ["Inventory", "Equip gear, cosmetics, pets, and auras.", renderInventory],
      ["Quest Board", "Complete personal quests for rewards.", renderQuests],
      ["Hero Profile", "View class, stats, badges, and facts to practice.", renderProfile],
      ["Personal Records", "See your single-device records.", renderRecords],
      ["Change Class", state.freeClassChange ? "One free class change available." : "Class change costs 25 coins.", renderClassChange]
    ];
    actions.forEach(([t, d, fn]) => menu.appendChild(UI.card(t, d, "Open", fn)));
    body.appendChild(menu);
    document.getElementById("screen").appendChild(p);
    saveRender();
  }

  function renderClassChange() {
    UI.clear();
    const fee = state.freeClassChange ? 0 : 25;
    const p = UI.panel("Change Class", `Current class: ${GAME_DATA.classes[state.classId].name}. ${fee ? `Fee: ${fee} coins.` : "Your first class change is free."}`);
    const body = p.querySelector(".panel-scroll");
    const grid = document.createElement("div");
    grid.className = "class-grid";
    Object.entries(GAME_DATA.classes).forEach(([id, cls]) => {
      const item = document.createElement("article");
      item.className = "class-card";
      const isCurrent = id === state.classId;
      item.innerHTML = `<h3>${cls.name}${isCurrent ? " ✓" : ""}</h3><div class="stars">${cls.stars}</div><p>${cls.description}</p><p><strong>${cls.abilityName}:</strong> ${cls.ability}</p>${UI.statsTable(cls.baseStats)}`;
      item.appendChild(UI.button(isCurrent ? "Current Class" : `Change to ${cls.name}`, () => {
        if (isCurrent) return;
        if (fee && state.coins < fee) return UI.openModal("Not Enough Coins", `<p>You need ${fee} coins to change class.</p>`, [{ label: "OK" }]);
        UI.openModal(`Change to ${cls.name}?`, `<p>Your wrong-class gear will be unequipped but kept in inventory.</p>`, [
          { label: "Cancel", className: "secondary-button" },
          { label: fee ? `Pay ${fee} Coins` : "Use Free Change", action: () => changeClass(id, fee) }
        ]);
      }, isCurrent ? "secondary-button" : "primary-button"));
      grid.appendChild(item);
    });
    body.appendChild(grid);
    body.appendChild(UI.button("Back to Town", renderTown, "secondary-button"));
    document.getElementById("screen").appendChild(p);
  }

  function changeClass(id, fee) {
    state.classId = id;
    if (fee) state.coins -= fee;
    state.freeClassChange = false;
    for (const [slot, itemId] of Object.entries(state.equipped)) {
      if (itemId && !canUse(GAME_DATA.items[itemId])) state.equipped[slot] = null;
    }
    saveRender(renderTown);
  }

  function canUse(item) {
    return item.classAllowed.includes("all") || item.classAllowed.includes(state.classId);
  }

  function calcStats() {
    const base = { ...GAME_DATA.classes[state.classId].baseStats };
    Object.values(state.equipped).forEach(id => {
      const item = GAME_DATA.items[id];
      if (!item || !canUse(item)) return;
      Object.entries(item.stats || {}).forEach(([k, v]) => base[k] = (base[k] || 0) + v);
    });
    return base;
  }

  function renderShop() {
    UI.clear();
    const p = UI.panel("Class Shop", `Showing ${GAME_DATA.classes[state.classId].name} items and universal cosmetics only.`);
    const body = p.querySelector(".panel-scroll");
    const itemGrid = document.createElement("div");
    itemGrid.className = "item-grid";
    Object.entries(GAME_DATA.items).filter(([id, item]) => canUse(item)).forEach(([id, item]) => {
      const owned = state.ownedItems.includes(id);
      const c = document.createElement("article");
      c.className = `item-card rarity-${item.rarity.toLowerCase()}`;
      c.innerHTML = `<h3>${item.name}</h3><p>${item.description}</p><p><strong>${item.rarity}</strong> • ${item.cosmeticOnly ? "Cosmetic" : "Gear"}</p><p>Cost: ${item.cost} coins</p>`;
      c.appendChild(UI.button(owned ? "Owned" : "Preview", () => previewItem(id), owned ? "secondary-button" : "small-button"));
      itemGrid.appendChild(c);
    });
    body.appendChild(itemGrid);
    body.appendChild(UI.button("Back to Town", renderTown, "secondary-button"));
    document.getElementById("screen").appendChild(p);
  }

  function previewItem(id) {
    const item = GAME_DATA.items[id];
    const stats = calcStats();
    const after = { ...stats };
    Object.entries(item.stats || {}).forEach(([k, v]) => after[k] = (after[k] || 0) + v);
    const html = `<p>${item.description}</p><p><strong>Class:</strong> ${item.classAllowed.includes("all") ? "All" : item.classAllowed.map(x => GAME_DATA.classes[x].name).join(", ")}</p><p><strong>Cost:</strong> ${item.cost}</p><h3>Current</h3>${UI.statsTable(stats)}<h3>After Equip</h3>${UI.statsTable(after)}`;
    const actions = [{ label: "Cancel", className: "secondary-button" }];
    if (!state.ownedItems.includes(id)) actions.push({ label: "Buy", action: () => buyItem(id) });
    UI.openModal(item.name, html, actions);
  }

  function buyItem(id) {
    const item = GAME_DATA.items[id];
    if (state.coins < item.cost) return UI.openModal("Not Enough Coins", `<p>Keep practicing to earn more coins.</p>`, [{ label: "OK" }]);
    state.coins -= item.cost;
    state.ownedItems.push(id);
    equipItem(id);
    saveRender(renderShop);
  }

  function equipItem(id) {
    const item = GAME_DATA.items[id];
    if (!canUse(item)) return;
    state.equipped[item.slot] = id;
  }

  function renderInventory() {
    UI.clear();
    const p = UI.panel("Inventory", "Owned items stay yours. Wrong-class gear is locked until you change class.");
    const body = p.querySelector(".panel-scroll");
    const itemGrid = document.createElement("div");
    itemGrid.className = "item-grid";
    if (!state.ownedItems.length) itemGrid.appendChild(UI.card("No Items Yet", "Visit the Class Shop to buy gear and cosmetics.", "Shop", renderShop));
    state.ownedItems.forEach(id => {
      const item = GAME_DATA.items[id];
      const locked = !canUse(item);
      const equipped = Object.values(state.equipped).includes(id);
      const c = document.createElement("article");
      c.className = "item-card";
      c.innerHTML = `<h3>${item.name}${equipped ? " ✓" : ""}</h3><p>${item.description}</p><p>${locked ? "Locked for another class" : item.slot}</p>`;
      c.appendChild(UI.button(locked ? "Locked" : equipped ? "Equipped" : "Equip", () => { if (!locked) { equipItem(id); saveRender(renderInventory); } }, locked || equipped ? "secondary-button" : "small-button"));
      itemGrid.appendChild(c);
    });
    body.appendChild(itemGrid);
    body.appendChild(UI.button("Back to Town", renderTown, "secondary-button"));
    document.getElementById("screen").appendChild(p);
  }

  function renderTrainingStart() {
    startRound("training", null, 10);
  }

  function renderAdventure() {
    UI.clear();
    const p = UI.panel("Adventure Gate", "Complete rounds, earn boss keys, and defeat bosses.");
    const body = p.querySelector(".panel-scroll");
    const list = document.createElement("div");
    list.className = "town-menu";
    GAME_DATA.areas.forEach(area => {
      const locked = state.level < area.unlockLevel;
      const key = !!state.bossKeys[area.id];
      const c = UI.card(`${area.name}${locked ? " 🔒" : ""}`, `Focus: ${area.focus.join(", ")} facts. Boss: ${area.boss}. Boss Key: ${key ? "Earned" : "Needed"}.`, locked ? "Locked" : "Start Area Round", () => !locked && startRound("area", area, 10), locked ? "locked" : "");
      if (!locked) c.appendChild(UI.button(key ? "Enter Boss" : "Earn Boss Key", () => key ? startBoss(area) : showBossKeyInfo(area), key ? "danger-button" : "secondary-button"));
      list.appendChild(c);
    });
    body.appendChild(list);
    body.appendChild(UI.button("Back to Town", renderTown, "secondary-button"));
    document.getElementById("screen").appendChild(p);
  }

  function showBossKeyInfo(area) {
    UI.openModal("Boss Key Needed", `<p>Earn a key by completing area rounds and scoring 80% or higher.</p>`, [{ label: "OK" }]);
  }

  function startBoss(area) {
    state.bossLock = true;
    startRound("boss", area, 8);
  }

  function startRound(mode, area, total) {
    const stats = calcStats();
    round = { mode, area, total, index: 0, correct: 0, coins: 0, streak: 0, bestStreak: 0, recent: [], improved: 0, start: Date.now(), shieldUsed: false, hintUsed: false, current: null, stats };
    renderQuestion();
  }

  function renderQuestion() {
    UI.clear();
    const p = UI.panel(round.mode === "training" ? "Training Area" : round.mode === "boss" ? `${round.area.boss} Battle` : `${round.area.name} Adventure`, `Question ${round.index + 1} of ${round.total}`);
    const body = p.querySelector(".panel-scroll");
    const fact = Mastery.pickFact(state, round.area ? round.area.focus : null, round.mode === "training" ? "training" : "area", round.recent);
    round.current = fact;
    round.recent.push(Mastery.key(fact.a, fact.b));
    if (round.recent.length > 4) round.recent.shift();
    const answer = fact.a * fact.b;
    const choices = Mastery.choices(answer);
    const box = document.createElement("div");
    box.className = "question-box";
    box.innerHTML = `<div class="fact">${fact.a} × ${fact.b} = ?</div><div class="answer-grid"></div><div class="feedback" id="feedback"></div>`;
    const answers = box.querySelector(".answer-grid");
    choices.forEach(choice => answers.appendChild(UI.button(String(choice), () => answerQuestion(choice === answer, answer), "answer-button")));
    if (round.mode === "boss" && state.classId === "mage" && !round.hintUsed) {
      box.appendChild(UI.button("Focus Spell: Remove one wrong answer", () => useMageHint(answer), "secondary-button"));
    }
    body.appendChild(box);
    body.appendChild(UI.button("Leave Round", () => { round = null; renderTown(); }, "secondary-button"));
    document.getElementById("screen").appendChild(p);
  }

  function useMageHint(answer) {
    round.hintUsed = true;
    const buttons = Array.from(document.querySelectorAll(".answer-button"));
    const wrong = buttons.filter(b => Number(b.textContent) !== answer);
    if (wrong.length) wrong[0].disabled = true;
  }

  function answerQuestion(isCorrect, answer) {
    const { a, b } = round.current;
    const result = Mastery.updateFact(state, a, b, isCorrect);
    if (result.after > result.before) round.improved += 1;
    if (isCorrect) {
      round.correct += 1;
      round.streak += 1;
      round.bestStreak = Math.max(round.bestStreak, round.streak);
      let earned = round.mode === "training" ? 1 : 2;
      if (state.classId === "archer" && round.streak % 3 === 0) earned += 3;
      round.coins += earned;
    } else {
      if (state.classId === "knight" && !round.shieldUsed) {
        round.shieldUsed = true;
      } else {
        round.streak = 0;
      }
    }
    round.index += 1;
    if (round.index >= round.total) finishRound();
    else renderQuestion();
  }

  function finishRound() {
    const accuracy = Math.round((round.correct / round.total) * 100);
    state.coins += round.coins;
    state.xp += round.correct;
    while (state.xp >= state.level * 20) { state.xp -= state.level * 20; state.level += 1; }
    state.records.bestAccuracy = Math.max(state.records.bestAccuracy, accuracy);
    state.records.longestStreak = Math.max(state.records.longestStreak, round.bestStreak);
    state.records.mostCoinsRound = Math.max(state.records.mostCoinsRound, round.coins);
    state.records.factsMastered = Mastery.masteredCount(state);
    state.records.mostImprovedFacts = Math.max(state.records.mostImprovedFacts, round.improved);
    if (round.mode === "training") state.records.trainingSets += 1;
    if (round.mode === "boss") {
      state.records.bossesDefeated += accuracy >= 75 ? 1 : 0;
      const secs = Math.round((Date.now() - round.start) / 1000);
      if (accuracy >= 75 && (!state.records.fastestBossWin || secs < state.records.fastestBossWin)) state.records.fastestBossWin = secs;
      state.bossLock = false;
    }
    if (round.mode === "area") {
      state.areaRounds[round.area.id] = (state.areaRounds[round.area.id] || 0) + 1;
      if (accuracy >= 80) state.bossKeys[round.area.id] = true;
    }
    updateQuests(accuracy);
    state.lastSummary = { accuracy, correct: round.correct, total: round.total, coins: round.coins, improved: round.improved, mode: round.mode };
    const summary = state.lastSummary;
    round = null;
    Store.save(state);
    UI.openModal("Round Complete", `<p><strong>Correct:</strong> ${summary.correct}/${summary.total}</p><p><strong>Accuracy:</strong> ${summary.accuracy}%</p><p><strong>Coins Earned:</strong> ${summary.coins}</p><p><strong>Facts Improved:</strong> ${summary.improved}</p>`, [
      { label: "Back to Town", action: renderTown }
    ]);
    renderTown();
  }

  function updateQuests(accuracy) {
    state.questProgress.q_answer10 = (state.questProgress.q_answer10 || 0) + 10;
    if (accuracy >= 80) state.questProgress.q_accuracy = 1;
    if (round?.mode === "training") state.questProgress.q_training = 1;
    if (round?.improved > 0) state.questProgress.q_mastery = 1;
    if (round?.mode === "area" && accuracy >= 80) state.questProgress.q_bosskey = 1;
  }

  function renderQuests() {
    UI.clear();
    const p = UI.panel("Quest Board", "Personal quests for this device.");
    const body = p.querySelector(".panel-scroll");
    const list = document.createElement("div");
    list.className = "town-menu";
    GAME_DATA.quests.forEach(q => {
      const done = state.completedQuests[q.id];
      const progress = state.questProgress[q.id] || 0;
      const target = q.id === "q_answer10" ? 10 : 1;
      const ready = progress >= target && !done;
      const c = UI.card(q.title, `${q.text} Progress: ${Math.min(progress, target)}/${target}. Reward: ${q.reward.coins} coins.`, ready ? "Claim" : done ? "Claimed" : "In Progress", () => ready && claimQuest(q), done ? "locked" : "");
      list.appendChild(c);
    });
    body.appendChild(list);
    body.appendChild(UI.button("Back to Town", renderTown, "secondary-button"));
    document.getElementById("screen").appendChild(p);
  }

  function claimQuest(q) {
    state.coins += q.reward.coins;
    state.completedQuests[q.id] = true;
    saveRender(renderQuests);
  }

  function renderProfile() {
    UI.clear();
    const cls = GAME_DATA.classes[state.classId];
    const p = UI.panel("Hero Profile", `${state.heroName} • ${cls.name}`);
    const body = p.querySelector(".panel-scroll");
    const stats = calcStats();
    const weak = Mastery.weakFacts(state, 6).map(f => `${f.key.replace("x", " × ")} (${Mastery.label(f.level)})`).join("<br>");
    body.innerHTML = `<div class="profile-block"><h3>${cls.name} ${cls.stars}</h3><p>${cls.description}</p><p><strong>${cls.abilityName}:</strong> ${cls.ability}</p>${UI.statsTable(stats)}</div><div class="profile-block"><h3>Equipped</h3>${Object.entries(state.equipped).map(([slot,id]) => `<p>${slot}: ${id ? GAME_DATA.items[id].name : "None"}</p>`).join("")}</div><div class="profile-block"><h3>Facts to Practice</h3><p>${weak || "No data yet."}</p></div><div class="profile-block"><h3>Badges</h3><p>${state.badges.length ? state.badges.join(", ") : "No badges yet."}</p></div>`;
    body.appendChild(UI.button("Back to Town", renderTown, "secondary-button"));
    document.getElementById("screen").appendChild(p);
  }

  function renderRecords() {
    UI.clear();
    const r = state.records;
    const p = UI.panel("Personal Records", "Saved on this device only.");
    const body = p.querySelector(".panel-scroll");
    body.innerHTML = `<div class="record-grid"><div>Best Accuracy <strong>${r.bestAccuracy}%</strong></div><div>Longest Streak <strong>${r.longestStreak}</strong></div><div>Most Coins in One Round <strong>${r.mostCoinsRound}</strong></div><div>Fastest Boss Win <strong>${r.fastestBossWin ? `${r.fastestBossWin}s` : "None"}</strong></div><div>Facts Mastered <strong>${r.factsMastered}</strong></div><div>Most Improved Facts <strong>${r.mostImprovedFacts}</strong></div><div>Bosses Defeated <strong>${r.bossesDefeated}</strong></div><div>Training Sets Completed <strong>${r.trainingSets}</strong></div></div>`;
    body.appendChild(UI.button("Back to Town", renderTown, "secondary-button"));
    document.getElementById("screen").appendChild(p);
  }

  window.addEventListener("DOMContentLoaded", init);
})();
