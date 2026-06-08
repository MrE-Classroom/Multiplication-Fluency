(() => {
  'use strict';

  const STORAGE_KEY = 'mq_localonly_save_v2';
  const SCORE_KEY = 'mq_localonly_scores_v2';

  const AREAS = [
    { id: 1, name: 'Meadow of Ones and Twos', facts: [1, 2], questions: 8, boss: 'The Skip-Counting Sprite', time: 0 },
    { id: 2, name: 'Crystal Cave of Threes and Fours', facts: [3, 4], questions: 10, boss: 'The Array Golem', time: 18 },
    { id: 3, name: 'Forest of Fives and Sixes', facts: [5, 6], questions: 12, boss: 'The Product Wolf', time: 15 },
    { id: 4, name: 'Thunder Peaks of Sevens and Eights', facts: [7, 8], questions: 14, boss: 'The Factor Storm', time: 12 },
    { id: 5, name: 'Dragon Gate of Nines and Tens', facts: [9, 10], questions: 16, boss: 'The Ten-Times Dragon', time: 10 }
  ];

  const POWERS = {
    double: { name: 'Double Points', icon: '✨', desc: 'Next correct answer earns double score.', cost: 25 },
    freeze: { name: 'Time Freeze', icon: '❄️', desc: 'Adds 10 seconds to the current question.', cost: 20 },
    shield: { name: 'Shield', icon: '🛡️', desc: 'Blocks one wrong answer or timeout.', cost: 30 },
    hint: { name: 'Hint', icon: '💡', desc: 'Shows repeated addition for this fact.', cost: 15 },
    skip: { name: 'Skip', icon: '⏭️', desc: 'Skips a non-boss question safely.', cost: 20 }
  };

  const $ = (id) => document.getElementById(id);
  const screens = ['menu','map','game'];
  let timerInterval = null;
  let state = defaultState();

  function defaultState() {
    return {
      player: '', score: 0, coins: 0, streak: 0, bestStreak: 0, lives: 3,
      unlockedArea: 1, completedAreas: [], currentAreaId: 1,
      inBoss: false, bossHp: 0, bossMaxHp: 0,
      qIndex: 0, currentQuestion: null, waitingForNext: false,
      timeLeft: 0, timerOn: false, sound: true,
      inventory: { double: 1, freeze: 1, shield: 1, hint: 2, skip: 1 },
      active: { double: false, shield: false },
      history: []
    };
  }

  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = { ...defaultState(), ...JSON.parse(raw) };
      state.inventory = { ...defaultState().inventory, ...(state.inventory || {}) };
      state.active = { ...defaultState().active, ...(state.active || {}) };
    } catch { state = defaultState(); }
  }

  function beep(freq = 620, dur = 0.06) {
    if (!state.sound) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.value = 0.04;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => { osc.stop(); ctx.close(); }, dur * 1000);
    } catch {}
  }

  function switchScreen(name) {
    screens.forEach(s => $(`screen-${s}`).classList.toggle('active', s === name));
    $('menuBtn').classList.toggle('hidden', name === 'menu');
    if (name !== 'game') stopTimer();
  }

  function sanitizeName(name) {
    return (name || '').replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, 16) || 'MathHero';
  }

  function areaById(id) { return AREAS.find(a => a.id === id) || AREAS[0]; }

  function updateMenu() {
    $('playerName').value = state.player || '';
    $('continueBtn').disabled = !state.player;
    $('soundBtn').textContent = state.sound ? '🔊' : '🔇';
    renderLeaderboard('menuLeaderboard');
  }

  function updateMap() {
    $('mapIntro').textContent = `${state.player}, choose an unlocked area. Complete practice questions, then defeat the boss to unlock the next gate.`;
    const grid = $('areaGrid'); grid.innerHTML = '';
    AREAS.forEach(area => {
      const locked = area.id > state.unlockedArea;
      const complete = state.completedAreas.includes(area.id);
      const div = document.createElement('div');
      div.className = `area ${locked ? 'locked' : ''} ${complete ? 'complete' : ''}`;
      div.innerHTML = `<h3>${complete ? '✅' : locked ? '🔒' : '🟣'} ${area.name}</h3>
        <p>Facts: ${area.facts.join('s, ')}s</p>
        <p class="boss">Boss: ${area.boss}</p>
        <p>${area.time ? area.time + ' seconds per question' : 'No timer'}</p>`;
      const btn = document.createElement('button');
      btn.className = locked ? 'secondary' : 'primary';
      btn.disabled = locked;
      btn.textContent = complete ? 'Replay Area' : locked ? 'Locked' : 'Enter Area';
      btn.addEventListener('click', () => startArea(area.id));
      div.appendChild(btn);
      grid.appendChild(div);
    });
  }

  function startNewQuest() {
    const name = sanitizeName($('playerName').value);
    state = defaultState();
    state.player = name;
    save();
    updateMap();
    switchScreen('map');
  }

  function startArea(id) {
    const area = areaById(id);
    state.currentAreaId = area.id;
    state.lives = 3;
    state.streak = 0;
    state.qIndex = 0;
    state.inBoss = false;
    state.bossHp = 0;
    state.bossMaxHp = 0;
    state.waitingForNext = false;
    state.currentQuestion = null;
    state.active.double = false;
    save();
    switchScreen('game');
    nextQuestion();
  }

  function makeQuestion(boss = false) {
    const area = areaById(state.currentAreaId);
    let a;
    if (boss) a = area.facts[Math.floor(Math.random() * area.facts.length)];
    else a = area.facts[state.qIndex % area.facts.length];
    const b = 1 + Math.floor(Math.random() * 10);
    return Math.random() < .5 ? { a, b, answer: a * b } : { a: b, b: a, answer: a * b };
  }

  function nextQuestion() {
    state.waitingForNext = false;
    const area = areaById(state.currentAreaId);
    if (!state.inBoss && state.qIndex >= area.questions) {
      startBoss(); return;
    }
    state.currentQuestion = makeQuestion(state.inBoss);
    if (!state.inBoss) state.qIndex++;
    renderGame();
    startTimer();
    setTimeout(() => { $('answerInput').focus(); }, 80);
    save();
  }

  function startBoss() {
    const area = areaById(state.currentAreaId);
    state.inBoss = true;
    state.bossMaxHp = 3 + area.id;
    state.bossHp = state.bossMaxHp;
    modal('Boss Battle!', `<p><strong>${area.boss}</strong> blocks the gate!</p><p>Each correct answer removes 1 boss heart. Defeat the boss to complete this area.</p>`, [
      ['Start Boss Battle', 'primary', () => { closeModal(); nextQuestion(); }],
      ['Main Menu', 'secondary', goMainMenu]
    ]);
    save();
  }

  function renderGame() {
    const area = areaById(state.currentAreaId);
    $('hudName').textContent = state.player;
    $('hudArea').textContent = area.id;
    $('hudScore').textContent = state.score;
    $('hudCoins').textContent = state.coins;
    $('hudStreak').textContent = state.streak;
    $('hudLives').textContent = state.lives;
    $('questionCount').textContent = state.inBoss ? `Boss HP ${state.bossHp}/${state.bossMaxHp}` : `Question ${state.qIndex}/${area.questions}`;
    $('bossBanner').classList.toggle('hidden', !state.inBoss);
    $('bossBanner').textContent = state.inBoss ? `⚔️ Boss Battle: ${area.boss}` : '';
    $('questionText').textContent = `${state.currentQuestion.a} × ${state.currentQuestion.b} = ?`;
    $('answerInput').value = '';
    $('feedbackHint').textContent = state.active.double ? 'Double Points is active for the next correct answer.' : 'Type your answer and press Submit.';
    renderPowers();
    updateTimerBadge();
  }

  function renderPowers() {
    const bar = $('powerBar'); bar.innerHTML = '';
    Object.entries(POWERS).forEach(([key, p]) => {
      const qty = state.inventory[key] || 0;
      const div = document.createElement('div'); div.className = 'power';
      div.innerHTML = `<strong>${p.icon} ${p.name} ×${qty}</strong><small>${p.desc}</small>`;
      const btn = document.createElement('button'); btn.className = 'secondary'; btn.textContent = 'Use';
      btn.disabled = qty <= 0 || state.waitingForNext || (key === 'skip' && state.inBoss) || (key === 'freeze' && !areaById(state.currentAreaId).time);
      btn.addEventListener('click', () => usePower(key));
      div.appendChild(btn); bar.appendChild(div);
    });
  }

  function usePower(key) {
    if ((state.inventory[key] || 0) <= 0 || state.waitingForNext) return;
    if (key === 'skip' && state.inBoss) return;
    state.inventory[key]--;
    if (key === 'double') { state.active.double = true; $('feedbackHint').textContent = '✨ Double Points ready! Get this one correct.'; beep(800); }
    if (key === 'freeze') { state.timeLeft += 10; updateTimerBadge(); $('feedbackHint').textContent = '❄️ Time Freeze added 10 seconds.'; beep(720); }
    if (key === 'shield') { state.active.shield = true; $('feedbackHint').textContent = '🛡️ Shield active. It will block one mistake.'; beep(660); }
    if (key === 'hint') { showHint(); beep(600); }
    if (key === 'skip') { handleSkip(); return; }
    renderPowers(); save(); setTimeout(() => $('answerInput').focus(), 50);
  }

  function showHint() {
    const q = state.currentQuestion;
    const smaller = Math.min(q.a, q.b), larger = Math.max(q.a, q.b);
    $('feedbackHint').textContent = `Hint: ${larger} repeated ${smaller} times. Example: ${Array(smaller).fill(larger).join(' + ')}`;
  }

  function handleSkip() {
    stopTimer();
    state.waitingForNext = true;
    state.history.push(record('skip', null));
    modal('Question Skipped', '<p>You used a Skip power. No points lost.</p>', resultActions(false));
    save(); renderPowers();
  }

  function startTimer() {
    stopTimer();
    const area = areaById(state.currentAreaId);
    state.timeLeft = state.inBoss ? Math.max(8, area.time - 2) : area.time;
    state.timerOn = !!state.timeLeft;
    updateTimerBadge();
    if (!state.timerOn) return;
    timerInterval = setInterval(() => {
      if (state.waitingForNext) return;
      state.timeLeft--;
      updateTimerBadge();
      if (state.timeLeft <= 0) handleAnswer(null, true);
    }, 1000);
  }

  function stopTimer() { if (timerInterval) clearInterval(timerInterval); timerInterval = null; state.timerOn = false; }
  function updateTimerBadge() { $('timerBadge').textContent = state.timerOn ? `${state.timeLeft}s` : '∞'; }

  function submitAnswer(e) {
    e.preventDefault();
    if (state.waitingForNext) return;
    const value = $('answerInput').value.trim();
    if (!/^\d+$/.test(value)) { $('feedbackHint').textContent = 'Enter numbers only.'; $('answerInput').focus(); return; }
    handleAnswer(Number(value), false);
  }

  function handleAnswer(given, timedOut) {
    if (state.waitingForNext) return;
    stopTimer();
    state.waitingForNext = true;
    const q = state.currentQuestion;
    let correct = given === q.answer;
    let shielded = false;

    if (!correct && state.active.shield) {
      shielded = true;
      state.active.shield = false;
      state.lives = Math.max(1, state.lives);
    } else if (!correct) {
      state.lives--;
      state.streak = 0;
    }

    let points = 0, coins = 0;
    if (correct) {
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      points = 10 + areaById(state.currentAreaId).id * 2 + Math.min(state.streak, 10);
      if (state.active.double) { points *= 2; state.active.double = false; }
      coins = 5 + Math.floor(state.streak / 3);
      state.score += points; state.coins += coins;
      if (state.inBoss) state.bossHp--;
      beep(840);
    } else {
      beep(220, .12);
    }

    state.history.push(record(correct ? 'correct' : timedOut ? 'timeout' : 'wrong', given, points, coins));
    save(); renderGame();

    if (correct && state.inBoss && state.bossHp <= 0) { completeArea(points, coins); return; }
    if (state.lives <= 0) { gameOver(); return; }

    const resultClass = correct ? 'correct' : 'wrong';
    const title = shielded ? 'Shield Protected You!' : correct ? 'Correct!' : timedOut ? 'Time Ran Out' : 'Try Again Next Time';
    const body = `<p class="${resultClass}">${correct ? 'Great job!' : shielded ? 'Your shield blocked the mistake.' : `The correct answer was ${q.answer}.`}</p>
      <p><strong>Problem:</strong> ${q.a} × ${q.b} = ${q.answer}</p>
      <div class="reward">${correct ? `+${points} points and +${coins} coins` : shielded ? 'No life lost because Shield was active.' : 'You lost 1 life.'}</div>
      <p><strong>Tip:</strong> ${factTip(q)}</p>`;
    modal(title, body, resultActions(true));
  }

  function factTip(q) {
    const f = Math.min(q.a, q.b), other = Math.max(q.a, q.b);
    if (f === 1) return 'Any number times 1 stays the same.';
    if (f === 2) return 'Doubles facts are like adding the number to itself.';
    if (f === 5) return 'Facts with 5 end in 0 or 5.';
    if (f === 9) return 'For 9s, the digits in the answer often add to 9.';
    if (f === 10) return 'For 10s, add a zero to the other factor.';
    return `${q.a} × ${q.b} means ${other} repeated ${f} times.`;
  }

  function record(result, given, points = 0, coins = 0) {
    const q = state.currentQuestion || { a: '', b: '', answer: '' };
    return { date: new Date().toISOString(), player: state.player, area: state.currentAreaId, boss: state.inBoss, problem: `${q.a}x${q.b}`, correctAnswer: q.answer, givenAnswer: given, result, points, coins };
  }

  function resultActions(includeUpgrade) {
    const actions = [];
    if (includeUpgrade) actions.push(['Upgrade Powers', 'secondary', () => openShop(true)]);
    actions.push(['Next Question', 'primary', () => { closeModal(); nextQuestion(); }]);
    actions.push(['Main Menu', 'secondary', goMainMenu]);
    return actions;
  }

  function completeArea() {
    const area = areaById(state.currentAreaId);
    const bonus = 50 + area.id * 20;
    state.score += bonus; state.coins += 25;
    if (!state.completedAreas.includes(area.id)) state.completedAreas.push(area.id);
    state.unlockedArea = Math.max(state.unlockedArea, Math.min(AREAS.length, area.id + 1));
    addLeaderboard(); save();
    modal('Boss Defeated!', `<p>🏆 You defeated <strong>${area.boss}</strong> and restored this crystal gate.</p><div class="reward">Area bonus: +${bonus} points and +25 coins</div>${area.id === AREAS.length ? '<p><strong>You restored the Number Kingdom!</strong></p>' : '<p>The next area is unlocked.</p>'}`, [
      ['Power Shop', 'secondary', () => openShop(true)],
      ['Quest Map', 'primary', () => { closeModal(); updateMap(); switchScreen('map'); }],
      ['Main Menu', 'secondary', goMainMenu]
    ]);
  }

  function gameOver() {
    addLeaderboard(); save();
    modal('Quest Paused', `<p>Your lives ran out, but your progress was saved locally.</p><div class="reward">Score: ${state.score} | Best streak: ${state.bestStreak}</div>`, [
      ['Try Area Again', 'primary', () => { closeModal(); startArea(state.currentAreaId); }],
      ['Power Shop', 'secondary', () => openShop(true)],
      ['Main Menu', 'secondary', goMainMenu]
    ]);
  }

  function openShop(fromModal = false) {
    stopTimer();
    const list = Object.entries(POWERS).map(([key, p]) => `<div class="shop-item"><strong>${p.icon} ${p.name}</strong><p>${p.desc}</p><p>Cost: ${p.cost} coins</p><button data-buy="${key}" class="secondary">Buy</button></div>`).join('');
    modal('Power Shop', `<p>You have <strong>${state.coins}</strong> coins.</p><div class="shop-list">${list}</div>`, [
      ['Close Shop', 'primary', () => { closeModal(); if (!fromModal && screensActive() !== 'game') updateMap(); }],
      ['Next Question', 'secondary', () => { if (screensActive() === 'game') { closeModal(); nextQuestion(); } }],
      ['Main Menu', 'secondary', goMainMenu]
    ]);
    document.querySelectorAll('[data-buy]').forEach(btn => btn.addEventListener('click', () => buyPower(btn.dataset.buy, fromModal)));
  }

  function buyPower(key, fromModal) {
    const p = POWERS[key];
    if (state.coins < p.cost) { beep(180); return; }
    state.coins -= p.cost; state.inventory[key] = (state.inventory[key] || 0) + 1;
    save(); renderGameSafe(); openShop(fromModal); beep(760);
  }

  function renderGameSafe(){ if(screensActive()==='game') renderGame(); }
  function screensActive(){ return screens.find(s => $(`screen-${s}`).classList.contains('active')); }

  function modal(title, body, actions) {
    $('modalTitle').textContent = title;
    $('modalBody').innerHTML = body;
    const box = $('modalActions'); box.innerHTML = '';
    actions.forEach(([label, cls, fn]) => { const b = document.createElement('button'); b.textContent = label; b.className = cls; b.addEventListener('click', fn); box.appendChild(b); });
    $('modal').classList.remove('hidden');
  }
  function closeModal() { $('modal').classList.add('hidden'); }
  function goMainMenu() { closeModal(); stopTimer(); save(); updateMenu(); switchScreen('menu'); }

  function addLeaderboard() {
    const scores = getScores();
    scores.push({ player: state.player, score: state.score, bestStreak: state.bestStreak, date: new Date().toLocaleDateString(), completed: state.completedAreas.length });
    scores.sort((a,b) => b.score - a.score);
    localStorage.setItem(SCORE_KEY, JSON.stringify(scores.slice(0, 20)));
  }
  function getScores() { try { return JSON.parse(localStorage.getItem(SCORE_KEY) || '[]'); } catch { return []; } }
  function renderLeaderboard(id) {
    const el = $(id); el.innerHTML = '';
    const scores = getScores();
    if (!scores.length) { el.innerHTML = '<li>No scores yet.</li>'; return; }
    scores.slice(0, 10).forEach(s => { const li = document.createElement('li'); li.textContent = `${s.player} — ${s.score} pts | ${s.completed || 0} gates`; el.appendChild(li); });
  }

  function resetProgress() {
    const name = state.player;
    const sound = state.sound;
    state = defaultState(); state.player = name; state.sound = sound;
    save(); updateMap();
  }

  function init() {
    load(); updateMenu();
    $('startBtn').addEventListener('click', startNewQuest);
    $('continueBtn').addEventListener('click', () => { if (!state.player) return; updateMap(); switchScreen('map'); });
    $('menuBtn').addEventListener('click', goMainMenu);
    $('answerForm').addEventListener('submit', submitAnswer);
    $('openShopBtn').addEventListener('click', () => openShop(false));
    $('resetProgressBtn').addEventListener('click', resetProgress);
    $('clearScoresBtn').addEventListener('click', () => { localStorage.removeItem(SCORE_KEY); updateMenu(); });
    $('soundBtn').addEventListener('click', () => { state.sound = !state.sound; save(); updateMenu(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') goMainMenu(); });
  }

  init();
})();
