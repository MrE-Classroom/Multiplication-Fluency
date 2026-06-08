const $ = (id) => document.getElementById(id);

const lands = [
  { id: 1, name: 'Meadow of Ones', facts:[1,2], timer: 0, target: 8, boss:false, lore:'Small sparks of multiplication glow in the meadow.' },
  { id: 2, name: 'Twin River', facts:[2,3], timer: 20, target: 10, boss:false, lore:'The river splits numbers into equal groups.' },
  { id: 3, name: 'Cave of Fours', facts:[3,4], timer: 18, target: 12, boss:false, lore:'Echoes repeat facts in the cave walls.' },
  { id: 4, name: 'Five-Fold Forest', facts:[4,5], timer: 16, target: 12, boss:false, lore:'Every tree grows in groups of five.' },
  { id: 5, name: 'Boss: The Factor Troll', facts:[1,2,3,4,5], timer: 15, target: 15, boss:true, bossName:'Factor Troll', bossHp: 15, lore:'The Factor Troll guards the first Number Crystal.' },
  { id: 6, name: 'Six Stone Pass', facts:[6], timer: 14, target: 12, boss:false, lore:'Six stones mark the path to fluency.' },
  { id: 7, name: 'Seven Star Ridge', facts:[7], timer: 13, target: 12, boss:false, lore:'Seven stars shine only for quick thinkers.' },
  { id: 8, name: 'Eight Ember Mines', facts:[8], timer: 12, target: 14, boss:false, lore:'The mines burn with harder facts.' },
  { id: 9, name: 'Nine Cloud Tower', facts:[9], timer: 11, target: 14, boss:false, lore:'Cloud stairs rise in groups of nine.' },
  { id: 10, name: 'Boss: The Product Dragon', facts:[6,7,8,9,10], timer: 10, target: 20, boss:true, bossName:'Product Dragon', bossHp: 20, lore:'The final boss holds the Master Crystal of Products.' },
  { id: 11, name: 'Ten Crystal Gate', facts:[1,2,3,4,5,6,7,8,9,10], timer: 9, target: 25, boss:true, bossName:'Crystal Guardian', bossHp: 25, lore:'A final mixed-fact challenge for true heroes.' }
];

const state = {
  player: '', mode: 'quest', currentLand: null, a: 0, b: 0, answer: 0,
  score: 0, coins: 0, streak: 0, lives: 3, correct: 0, total: 0,
  timer: 0, timerId: null, frozen: false, doubleTurns: 0, shield: false,
  powers: { double: 0, freeze: 0, shield: 0, hint: 0 }, bossHp: 0, bossMaxHp: 0,
  sound: true, badges: []
};

const defaultProgress = { unlocked: 1, completed: [], totalCoins: 0, badges: [] };
function getProgress(){ return JSON.parse(localStorage.getItem('mq_progress') || JSON.stringify(defaultProgress)); }
function saveProgress(p){ localStorage.setItem('mq_progress', JSON.stringify(p)); }
function getScores(){ return JSON.parse(localStorage.getItem('mq_scores') || '[]'); }
function saveScores(scores){ localStorage.setItem('mq_scores', JSON.stringify(scores)); }

function show(screen){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); $(screen).classList.add('active'); }
function beep(freq=520, dur=80){
  if(!state.sound) return;
  try { const ctx = new (window.AudioContext||window.webkitAudioContext)(); const osc=ctx.createOscillator(); const gain=ctx.createGain(); osc.frequency.value=freq; osc.connect(gain); gain.connect(ctx.destination); osc.start(); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur/1000); osc.stop(ctx.currentTime + dur/1000); } catch(e) {}
}

function startQuest(mode='quest'){
  const name = $('playerName').value.trim() || 'Hero';
  state.player = name; state.mode = mode;
  renderMap(); show('mapScreen');
}

function renderStats(){
  const p = getProgress();
  $('playerStats').innerHTML = `<span>Hero: <b>${escapeHtml(state.player || 'Hero')}</b></span><span>Total Coins: <b>${p.totalCoins}</b></span><span>Unlocked Land: <b>${p.unlocked}</b></span><span>Badges: <b>${p.badges.length}</b></span>`;
}

function renderMap(){
  renderStats(); const p = getProgress(); const map = $('questMap'); map.innerHTML='';
  lands.forEach(land=>{
    const locked = state.mode === 'quest' && land.id > p.unlocked;
    const complete = p.completed.includes(land.id);
    const div=document.createElement('div'); div.className='land'+(locked?' locked':'');
    div.innerHTML = `<div><h3>${land.boss?'👹 ':'🗺️ '}${land.name}</h3><p>${land.lore}</p><p class="tag">Facts: ${land.facts.join(', ')} ${land.timer?`• ${land.timer}s/question`:'• no timer'}</p></div><button class="${locked?'ghost':'primary'}" ${locked?'disabled':''}>${complete?'Replay':'Play'}</button>`;
    div.querySelector('button').addEventListener('click',()=> startLand(land)); map.appendChild(div);
  });
}

function startLand(land){
  Object.assign(state, { currentLand:land, score:0, coins:0, streak:0, lives:3, correct:0, total:0, timer:land.timer, doubleTurns:0, shield:false, badges:[] });
  state.powers = { double:0, freeze:0, shield:0, hint:1 };
  state.bossHp = land.boss ? land.bossHp : 0; state.bossMaxHp = state.bossHp;
  $('levelTitle').textContent = land.name; $('levelLore').textContent = land.lore;
  $('bossBarWrap').classList.toggle('hidden', !land.boss); if(land.boss) $('bossName').textContent = land.bossName;
  updateHud(); nextProblem(); show('gameScreen'); $('answer').focus();
}

function nextProblem(){
  clearInterval(state.timerId); $('hintBox').classList.add('hidden'); $('answer').value='';
  const facts = state.currentLand.facts; state.a = facts[Math.floor(Math.random()*facts.length)]; state.b = 1+Math.floor(Math.random()*10);
  if(Math.random()>.5) [state.a,state.b]=[state.b,state.a]; state.answer = state.a*state.b;
  $('problem').textContent = `${state.a} × ${state.b}`; $('feedback').textContent='Solve the fact!';
  if(state.currentLand.timer && !state.frozen){
    state.timer = state.currentLand.timer; $('timer').textContent = state.timer;
    state.timerId = setInterval(()=>{ state.timer--; $('timer').textContent=state.timer; if(state.timer<=0) handleWrong(true); },1000);
  } else { $('timer').textContent = state.currentLand.timer ? 'Frozen' : '--'; state.frozen=false; }
  updateHud();
}

function submitAnswer(){
  const val = parseInt($('answer').value,10); if(Number.isNaN(val)) return;
  clearInterval(state.timerId); state.total++;
  if(val === state.answer) handleCorrect(); else handleWrong(false);
}

function handleCorrect(){
  state.correct++; state.streak++;
  let pts = 10 + Math.min(state.streak,10); if(state.doubleTurns>0){ pts*=2; state.doubleTurns--; }
  state.score += pts; state.coins += 2 + Math.floor(state.streak/5);
  if(state.currentLand.boss){ state.bossHp = Math.max(0, state.bossHp-1); }
  awardPowers(); $('feedback').textContent = `Correct! +${pts} points`; beep(760,80);
  if(checkWin()) return; setTimeout(nextProblem, 650);
}

function handleWrong(timeout){
  clearInterval(state.timerId);
  if(state.shield){ state.shield=false; $('feedback').textContent='Shield blocked the mistake!'; beep(420,80); setTimeout(nextProblem,800); updateHud(); return; }
  state.lives--; state.streak=0; $('feedback').textContent = timeout ? `Time! ${state.a} × ${state.b} = ${state.answer}` : `Try again next time. ${state.a} × ${state.b} = ${state.answer}`; beep(180,120);
  if(state.lives<=0){ finish(false); return; } setTimeout(nextProblem,1000); updateHud();
}

function awardPowers(){
  if(state.streak === 3) state.powers.hint++;
  if(state.streak === 5) { state.powers.double++; addBadge('Streak Spark'); }
  if(state.streak === 8) state.powers.freeze++;
  if(state.streak === 10) { state.powers.shield++; addBadge('Ten-in-a-Row Hero'); }
}
function addBadge(name){ if(!state.badges.includes(name)) state.badges.push(name); }
function checkWin(){
  const land = state.currentLand;
  const won = land.boss ? state.bossHp <= 0 : state.correct >= land.target;
  if(won){ finish(true); return true; } return false;
}

function finish(won){
  clearInterval(state.timerId);
  const land = state.currentLand; const accuracy = state.total ? Math.round((state.correct/state.total)*100) : 0;
  if(won){ addBadge(land.boss ? `Boss Breaker: ${land.bossName}` : `Crystal Restored: ${land.name}`); if(accuracy>=90) addBadge('Accuracy Champion'); }
  const p = getProgress(); p.totalCoins += state.coins;
  state.badges.forEach(b=>{ if(!p.badges.includes(b)) p.badges.push(b); });
  if(won && !p.completed.includes(land.id)) p.completed.push(land.id);
  if(won && state.mode==='quest') p.unlocked = Math.max(p.unlocked, Math.min(lands.length, land.id+1));
  saveProgress(p);
  const scores = getScores(); scores.push({ date:new Date().toLocaleString(), player:state.player, land:land.name, score:state.score, coins:state.coins, correct:state.correct, total:state.total, accuracy, won }); saveScores(scores.slice(-200));
  $('resultsTitle').textContent = won ? 'Crystal Restored!' : 'Quest Failed — Try Again!';
  $('resultsText').textContent = `${state.player}, you scored ${state.score}, earned ${state.coins} coins, and answered ${state.correct}/${state.total} correctly (${accuracy}%).`;
  $('badgeArea').innerHTML = state.badges.map(b=>`<span class="badge">🏅 ${b}</span>`).join('') || '<span class="badge">Keep practicing!</span>';
  beep(won?900:220,180); show('resultsScreen');
}

function updateHud(){
  $('score').textContent=state.score; $('coins').textContent=state.coins; $('streak').textContent=state.streak; $('lives').textContent=state.lives;
  $('powerDouble').querySelector('span').textContent = `(${state.powers.double})`; $('powerFreeze').querySelector('span').textContent = `(${state.powers.freeze})`;
  $('powerShield').querySelector('span').textContent = `(${state.powers.shield})`; $('powerHint').querySelector('span').textContent = `(${state.powers.hint})`;
  $('powerDouble').disabled = state.powers.double<=0; $('powerFreeze').disabled = state.powers.freeze<=0 || !state.currentLand?.timer; $('powerShield').disabled = state.powers.shield<=0; $('powerHint').disabled = state.powers.hint<=0;
  if(state.currentLand?.boss){ const pct = Math.max(0, (state.bossHp/state.bossMaxHp)*100); $('bossHp').style.width = pct+'%'; $('bossHpText').textContent = `${state.bossHp}/${state.bossMaxHp}`; }
}

function usePower(type){
  if(state.powers[type]<=0) return; state.powers[type]--;
  if(type==='double'){ state.doubleTurns=3; $('feedback').textContent='Double Points activated for 3 correct answers!'; }
  if(type==='freeze'){ state.frozen=true; clearInterval(state.timerId); $('timer').textContent='Frozen'; $('feedback').textContent='Timer frozen for this question!'; }
  if(type==='shield'){ state.shield=true; $('feedback').textContent='Shield ready! One mistake will be blocked.'; }
  if(type==='hint'){ $('hintBox').textContent = `${state.a} × ${state.b} means ${state.b} groups of ${state.a}. Repeated addition: ${Array(state.b).fill(state.a).join(' + ')} = ?`; $('hintBox').classList.remove('hidden'); }
  beep(620,100); updateHud(); $('answer').focus();
}

function renderTeacher(){
  const scores = getScores().slice().reverse();
  $('leaderboard').innerHTML = scores.length ? `<table><thead><tr><th>Player</th><th>Land</th><th>Score</th><th>Accuracy</th><th>Date</th></tr></thead><tbody>${scores.map(s=>`<tr><td>${escapeHtml(s.player)}</td><td>${escapeHtml(s.land)}</td><td>${s.score}</td><td>${s.accuracy}%</td><td>${escapeHtml(s.date)}</td></tr>`).join('')}</tbody></table>` : 'No scores yet.';
  const p=getProgress(); $('progressList').innerHTML = `<p><b>Unlocked:</b> Land ${p.unlocked}</p><p><b>Total Coins:</b> ${p.totalCoins}</p><p><b>Completed:</b> ${p.completed.join(', ') || 'None'}</p><p><b>Badges:</b> ${p.badges.join(', ') || 'None'}</p>`;
  show('teacherScreen');
}
function exportCsv(){
  const rows=[['Date','Player','Land','Score','Coins','Correct','Total','Accuracy','Won'], ...getScores().map(s=>[s.date,s.player,s.land,s.score,s.coins,s.correct,s.total,s.accuracy,s.won])];
  const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='multiplication-quest-scores.csv'; a.click();
}
function escapeHtml(str){ return String(str).replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

$('startBtn').onclick=()=>startQuest('quest'); $('practiceBtn').onclick=()=>startQuest('practice'); $('teacherBtn').onclick=renderTeacher;
$('backToStart').onclick=()=>show('startScreen'); $('teacherHome').onclick=()=>show('startScreen'); $('quitBtn').onclick=()=>{ clearInterval(state.timerId); renderMap(); show('mapScreen'); };
$('submitBtn').onclick=submitAnswer; $('answer').addEventListener('keydown', e=>{ if(e.key==='Enter') submitAnswer(); });
$('continueBtn').onclick=()=>{ renderMap(); show('mapScreen'); }; $('retryBtn').onclick=()=>startLand(state.currentLand);
$('powerDouble').onclick=()=>usePower('double'); $('powerFreeze').onclick=()=>usePower('freeze'); $('powerShield').onclick=()=>usePower('shield'); $('powerHint').onclick=()=>usePower('hint');
$('exportBtn').onclick=exportCsv; $('clearScoresBtn').onclick=()=>{ if(confirm('Clear all scores and progress on this device?')){ localStorage.clear(); renderTeacher(); } };
$('soundToggle').onclick=()=>{ state.sound=!state.sound; $('soundToggle').textContent=`Sound: ${state.sound?'On':'Off'}`; };

saveProgress(getProgress());
