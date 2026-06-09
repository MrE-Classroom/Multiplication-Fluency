window.Mastery = (() => {
  function key(a, b) { return `${a}x${b}`; }

  function updateFact(state, a, b, correct) {
    const f = state.facts[key(a,b)];
    if (!f) return { before: 0, after: 0 };
    const before = f.level;
    f.recent.push(correct ? 1 : 0);
    if (f.recent.length > 5) f.recent.shift();
    if (correct) {
      f.correct += 1;
      const recentCorrect = f.recent.filter(Boolean).length;
      if (recentCorrect >= 3 && f.level < 4) f.level += 1;
      if (f.correct >= 6 && f.wrong <= 1) f.level = Math.max(f.level, 3);
      if (f.correct >= 10 && f.wrong <= 2) f.level = 4;
    } else {
      f.wrong += 1;
      if (f.level > 1) f.level -= 1;
      else f.level = 1;
    }
    return { before, after: f.level };
  }

  function masteredCount(state) {
    return Object.values(state.facts).filter(f => f.level >= 4).length;
  }

  function label(level) {
    return ["New", "Needs Practice", "Getting Better", "Strong", "Mastered"][level] || "New";
  }

  function weakFacts(state, limit = 8) {
    return Object.entries(state.facts)
      .map(([k, f]) => ({ key: k, ...f, score: f.level * 3 + f.correct - f.wrong * 2 }))
      .sort((a,b) => a.score - b.score)
      .slice(0, limit);
  }

  function pickFact(state, focus = null, mode = "area", recentKeys = []) {
    const pool = [];
    for (let a = 0; a <= 12; a++) {
      for (let b = 0; b <= 12; b++) {
        if (focus && !focus.includes(a) && !focus.includes(b)) continue;
        const f = state.facts[key(a,b)];
        let weight = 1;
        if (mode === "training") {
          weight = f.level <= 1 ? 8 : f.level === 2 ? 4 : f.level === 3 ? 2 : 1;
        } else {
          weight = f.level <= 1 ? 4 : f.level === 2 ? 3 : 2;
        }
        if (recentKeys.includes(key(a,b))) weight = 0;
        for (let i = 0; i < weight; i++) pool.push({ a, b });
      }
    }
    if (!pool.length) return { a: rand(0, 12), b: rand(0, 12) };
    return pool[rand(0, pool.length - 1)];
  }

  function choices(answer) {
    const set = new Set([answer]);
    const offsets = [-12, -10, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 10, 12];
    while (set.size < 4) {
      const guess = Math.max(0, answer + offsets[rand(0, offsets.length - 1)] + rand(-1, 1));
      set.add(guess);
    }
    return Array.from(set).sort(() => Math.random() - 0.5);
  }

  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  return { key, updateFact, masteredCount, label, weakFacts, pickFact, choices };
})();
