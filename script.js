const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const resultsScreen = document.getElementById('resultsScreen');
const playerName = document.getElementById('playerName');
const levelSelect = document.getElementById('levelSelect');
const startBtn = document.getElementById('startBtn');
const practiceBtn = document.getElementById('practiceBtn');
const activePlayer = document.getElementById('activePlayer');
const activeLevel = document.getElementById('activeLevel');
const timer = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const streakEl = document.getElementById('streak');
const accuracyEl = document.getElementById('accuracy');
const progressBar = document.getElementById('progressBar');
const encouragement = document.getElementById('encouragement');
const problem = document.getElementById('problem');
const answerInput = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitBtn');
const skipBtn = document.getElementById('skipBtn');
const feedback = document.getElementById('feedback');
const badges = document.getElementById('badges');
const finalMessage = document.getElementById('finalMessage');
const finalScore = document.getElementById('finalScore');
const finalCoins = document.getElementById('finalCoins');
const finalStreak = document.getElementById('finalStreak');
const finalAccuracy = document.getElementById('finalAccuracy');
const playAgainBtn = document.getElementById('playAgainBtn');
const clearScoresBtn = document.getElementById('clearScoresBtn');
const leaderboard = document.getElementById('leaderboard');

const levelSettings = {
  easy: { label: 'Easy', max: 5, seconds: 90, multiplier: 1, skipPenalty: 0 },
  medium: { label: 'Medium', max: 10, seconds: 75, multiplier: 2, skipPenalty: 2 },
  hard: { label: 'Hard', max: 10, seconds: 60, multiplier: 3, skipPenalty: 4 },
  boss: { label: 'Boss', max: 10, seconds: 45, multiplier: 5, skipPenalty: 6 }
};

let state = {};
let intervalId = null;

function newState(practice = false) {
  const level = levelSelect.value;
  const settings = levelSettings[level];
  return {
    player: playerName.value.trim() || 'Math Hero',
    level,
    settings,
    practice,
    timeLeft: practice ? 999 : settings.seconds,
    startTime: settings.seconds,
    score: 0,
    coins: 0,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    attempted: 0,
    a: 1,
    b: 1,
    earnedBadges: new Set()
  };
}

function randomFact() {
  const max = state.settings.max;
  state.a = Math.floor(Math.random() * max) + 1;
  state.b = Math.floor(Math.random() * max) + 1;
  problem.textContent = `${state.a} × ${state.b} = ?`;
  answerInput.value = '';
  answerInput.focus();
}

function startGame(practice = false) {
  state = newState(practice);
  startScreen.classList.add('hidden');
  resultsScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  activePlayer.textContent = state.player;
  activeLevel.textContent = practice ? 'Practice' : state.settings.label;
  feedback.textContent = '';
  badges.innerHTML = '';
  updateStats();
  randomFact();
  clearInterval(intervalId);
  if (!practice) {
    intervalId = setInterval(tick, 1000);
  } else {
    timer.textContent = '∞';
    progressBar.style.width = '100%';
  }
}

function tick() {
  state.timeLeft -= 1;
  updateStats();
  if (state.timeLeft <= 0) endGame();
}

function updateStats() {
  scoreEl.textContent = state.score;
  coinsEl.textContent = state.coins;
  streakEl.textContent = state.streak;
  const accuracy = state.attempted === 0 ? 100 : Math.round((state.correct / state.attempted) * 100);
  accuracyEl.textContent = `${accuracy}%`;
  timer.textContent = state.practice ? '∞' : state.timeLeft;
  if (!state.practice) {
    const percent = Math.max(0, (state.timeLeft / state.startTime) * 100);
    progressBar.style.width = `${percent}%`;
  }
}

function submitAnswer() {
  const value = Number(answerInput.value.trim());
  if (!Number.isInteger(value)) {
    feedback.textContent = 'Type a number first.';
    feedback.className = 'feedback incorrect';
    return;
  }

  state.attempted += 1;
  const correctAnswer = state.a * state.b;

  if (value === correctAnswer) {
    state.correct += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    const streakBonus = state.streak >= 5 ? 5 : 0;
    const earned = (10 * state.settings.multiplier) + streakBonus;
    state.score += earned;
    state.coins += 1 + (state.streak >= 10 ? 2 : state.streak >= 5 ? 1 : 0);
    feedback.textContent = `Correct! +${earned} points`;
    feedback.className = 'feedback correct';
    encouragement.textContent = chooseEncouragement();
    checkBadges();
  } else {
    state.streak = 0;
    feedback.textContent = `Not yet. ${state.a} × ${state.b} = ${correctAnswer}`;
    feedback.className = 'feedback incorrect';
    encouragement.textContent = 'Keep going. Mistakes help your brain grow.';
  }

  updateStats();
  setTimeout(randomFact, 750);
}

function skipProblem() {
  state.attempted += 1;
  state.streak = 0;
  state.score = Math.max(0, state.score - state.settings.skipPenalty);
  feedback.textContent = `Skipped. ${state.a} × ${state.b} = ${state.a * state.b}`;
  feedback.className = 'feedback incorrect';
  updateStats();
  setTimeout(randomFact, 650);
}

function chooseEncouragement() {
  const lines = [
    'Nice fluency!',
    'Your streak is growing!',
    'Fast brain, careful brain!',
    'Math power unlocked!',
    'Keep collecting coins!'
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

function addBadge(id, label) {
  if (state.earnedBadges.has(id)) return;
  state.earnedBadges.add(id);
  const badge = document.createElement('span');
  badge.className = 'badge-earned';
  badge.textContent = label;
  badges.appendChild(badge);
}

function checkBadges() {
  if (state.correct >= 5) addBadge('five', '⭐ 5 Correct');
  if (state.streak >= 5) addBadge('streak5', '🔥 5 Streak');
  if (state.streak >= 10) addBadge('streak10', '🏆 10 Streak');
  if (state.coins >= 20) addBadge('coins20', '💰 Coin Collector');
  if (state.score >= 300) addBadge('score300', '🚀 Math Master');
}

function endGame() {
  clearInterval(intervalId);
  gameScreen.classList.add('hidden');
  resultsScreen.classList.remove('hidden');
  const accuracy = state.attempted === 0 ? 0 : Math.round((state.correct / state.attempted) * 100);
  finalScore.textContent = state.score;
  finalCoins.textContent = state.coins;
  finalStreak.textContent = state.bestStreak;
  finalAccuracy.textContent = `${accuracy}%`;
  finalMessage.textContent = `${state.player}, you answered ${state.correct} facts correctly. Great work building multiplication fluency!`;
  saveScore({ name: state.player, score: state.score, level: state.settings.label, accuracy, date: new Date().toLocaleDateString() });
  renderLeaderboard();
}

function saveScore(entry) {
  const scores = JSON.parse(localStorage.getItem('multiplicationQuestScores') || '[]');
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem('multiplicationQuestScores', JSON.stringify(scores.slice(0, 10)));
}

function renderLeaderboard() {
  const scores = JSON.parse(localStorage.getItem('multiplicationQuestScores') || '[]');
  leaderboard.innerHTML = '';
  if (scores.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'No scores yet. Start a quest!';
    leaderboard.appendChild(empty);
    return;
  }
  scores.forEach(score => {
    const li = document.createElement('li');
    li.textContent = `${score.name}: ${score.score} pts · ${score.level} · ${score.accuracy}%`;
    leaderboard.appendChild(li);
  });
}

startBtn.addEventListener('click', () => startGame(false));
practiceBtn.addEventListener('click', () => startGame(true));
submitBtn.addEventListener('click', submitAnswer);
skipBtn.addEventListener('click', skipProblem);
playAgainBtn.addEventListener('click', () => {
  resultsScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
});
clearScoresBtn.addEventListener('click', () => {
  localStorage.removeItem('multiplicationQuestScores');
  renderLeaderboard();
});
answerInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') submitAnswer();
});

renderLeaderboard();
