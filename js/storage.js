window.Store = (() => {
  const KEY = "multiplicationAdventureClassQuestV6";
  let memory = null;

  function safeGet() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function safeSet(value) {
    try { localStorage.setItem(KEY, value); return true; } catch (e) { memory = value; return false; }
  }

  function defaultState() {
    const facts = {};
    for (let a = 0; a <= 12; a++) {
      for (let b = 0; b <= 12; b++) {
        facts[`${a}x${b}`] = { level: 0, correct: 0, wrong: 0, recent: [] };
      }
    }
    return {
      version: 6,
      heroName: "Hero",
      classId: null,
      freeClassChange: true,
      coins: 60,
      level: 1,
      xp: 0,
      currentArea: "meadow",
      ownedItems: [],
      equipped: { weapon: null, hat: null, body: null, legs: null, aura: null, pet: null, frame: null, trail: null, cosmetic: null },
      badges: [],
      facts,
      records: { bestAccuracy: 0, longestStreak: 0, mostCoinsRound: 0, fastestBossWin: null, factsMastered: 0, mostImprovedFacts: 0, bossesDefeated: 0, trainingSets: 0 },
      bossKeys: {},
      areaRounds: {},
      questProgress: {},
      completedQuests: {},
      bossLock: false,
      lastSummary: null
    };
  }

  function load() {
    const raw = safeGet() || memory;
    if (!raw) return defaultState();
    try {
      const parsed = JSON.parse(raw);
      return merge(defaultState(), parsed);
    } catch (e) {
      return defaultState();
    }
  }

  function merge(base, saved) {
    for (const key of Object.keys(saved || {})) {
      if (saved[key] && typeof saved[key] === "object" && !Array.isArray(saved[key]) && base[key] && typeof base[key] === "object" && !Array.isArray(base[key])) {
        base[key] = merge(base[key], saved[key]);
      } else {
        base[key] = saved[key];
      }
    }
    return base;
  }

  function save(state) {
    safeSet(JSON.stringify(state));
  }

  function reset() {
    const state = defaultState();
    save(state);
    return state;
  }

  return { load, save, reset, defaultState };
})();
