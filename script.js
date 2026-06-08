/* Multiplication Quest: Boss Realms - static GitHub Pages game. Local storage only. No personal data collection. */
const SAVE_KEY = 'mqbr_save_v4_local_only';
const LB_KEY = 'mqbr_local_leaderboard_v4';
const app = document.getElementById('app');
const modalLayer = document.getElementById('modalLayer');
const modalBox = document.getElementById('modalBox');
const toastEl = document.getElementById('toast');

const AREAS = [
  {id:1, name:'Meadow of Ones, Twos, and Threes', facts:[1,2,3], questions:8, boss:'The Skip-Counting Sprite', lore:'The meadow has lost its rhythm. Restore the beat of 1s, 2s, and 3s.'},
  {id:2, name:'Caves of Fours and Fives', facts:[4,5], questions:10, boss:'The Echo Goblin', lore:'Echoes bounce through the cave. Master 4s and 5s to pass.'},
  {id:3, name:'Forest of Sixes and Sevens', facts:[6,7], questions:12, boss:'The Thorn Troll', lore:'Vines block the learning path. Fluency with 6s and 7s cuts them away.'},
  {id:4, name:'Mountain of Eights and Nines', facts:[8,9], questions:14, boss:'The Storm Giant', lore:'Lightning strikes fast. Use 8s and 9s with accuracy and confidence.'},
  {id:5, name:'Castle of Tens', facts:[10], questions:10, boss:'The Multiplication Dragon', lore:'The dragon guards the final gate. Show mastery of all facts 1–10.'}
];
const SHOP = [
  {key:'double', name:'Double Points', cost:40, desc:'Next correct answer gives double points.'},
  {key:'shield', name:'Shield', cost:50, desc:'Blocks one wrong answer from losing a heart.'},
  {key:'focus', name:'Focus Spark', cost:30, desc:'Shows an array hint for the next problem.'},
  {key:'heal', name:'Heart Refill', cost:60, desc:'Restores one heart now.'}
];
function newState(nickname='Hero'){
  return {nickname, score:0, coins:0, xp:0, hearts:3, streak:0, bestStreak:0, unlockedArea:1, completedAreas:[], badges:[], powers:{double:0,shield:0,focus:0}, currentRun:null, settings:{sound:false}, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()};
}
let state = loadSave() || null;
let currentProblem = null;
let pendingResult = null;
let returnModal = null;

function save(){ if(!state) return; state.updatedAt = new Date().toISOString(); localStorage.setItem(SAVE_KEY, JSON.stringify(state)); updateLocalLeaderboard(); }
function loadSave(){ try{return JSON.parse(localStorage.getItem(SAVE_KEY));}catch{return null;} }
function resetAll(){ localStorage.removeItem(SAVE_KEY); state=null; renderStart(); }
function updateLocalLeaderboard(){
  const entry = {nickname: safeNick(state.nickname), score: state.score, bestStreak: state.bestStreak, highestArea: state.unlockedArea, bossesDefeated: state.completedAreas.length, date: new Date().toLocaleDateString()};
  let lb=[]; try{lb=JSON.parse(localStorage.getItem(LB_KEY)||'[]')}catch{}
  const idx=lb.findIndex(x=>x.nickname===entry.nickname);
  if(idx>=0) lb[idx]= entry.score>=lb[idx].score ? entry : lb[idx]; else lb.push(entry);
  lb.sort((a,b)=>b.score-a.score); lb=lb.slice(0,10);
  localStorage.setItem(LB_KEY, JSON.stringify(lb));
}
function safeNick(n){ return String(n||'Hero').replace(/[<>]/g,'').slice(0,16) || 'Hero'; }
function toast(msg){ toastEl.textContent=msg; toastEl.classList.remove('hidden'); setTimeout(()=>toastEl.classList.add('hidden'),1800); }
function showModal(html){ modalBox.innerHTML=html; modalLayer.classList.remove('hidden'); }
function closeModal(){ modalLayer.classList.add('hidden'); modalBox.innerHTML=''; }
function areaById(id){ return AREAS.find(a=>a.id===id) || AREAS[0]; }
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}

function renderStart(){
  app.innerHTML = `<div class="screen"><h1 class="title">Multiplication Quest:<br>Boss Realms</h1>
  <p class="subtitle">A multiplication fluency adventure for facts 1–10.</p>
  <div class="lore"><b>Story:</b> The Number Kingdom has been shattered into five realms. Each area is guarded by a boss who can only be defeated with multiplication fluency. Earn coins, unlock powers, and restore the kingdom one fact at a time.</div>
  <div class="warning">⚠️ Student Safety: Use a nickname only. Do not use your real name, school, address, phone number, email, or any personal information.</div>
  ${state?`<div class="row"><button class="btn primary" onclick="continueAdventure()">Continue Adventure</button><button class="btn" onclick="renderMainMenu()">Main Menu</button></div>`:''}
  <div class="card" style="margin-top:14px;text-align:center"><h2>Start New Adventure</h2><input id="nick" class="input" maxlength="16" placeholder="Nickname only" autocomplete="off"/><div class="row" style="margin-top:12px"><button class="btn gold" onclick="startNew()">Begin Quest</button></div></div></div>`;
  setTimeout(()=>document.getElementById('nick')?.focus(),50);
}
function startNew(){
  const nick=safeNick(document.getElementById('nick').value || 'Hero');
  state=newState(nick); save(); renderMainMenu();
}
function continueAdventure(){
  if(!state) return renderStart();
  if(state.currentRun) renderGame(); else renderMainMenu();
}
function renderMainMenu(){
  save();
  app.innerHTML = `<div class="screen"><h1 class="title">Main Menu</h1>${hudHtml()}
  <div class="row"><button class="btn primary" onclick="continueAdventure()" ${state.currentRun?'':'disabled'}>Continue Current Run</button><button class="btn purple" onclick="showLeaderboard()">Local Leaderboard</button><button class="btn" onclick="showInstructions()">How to Play</button><button class="btn danger" onclick="confirmReset()">Reset Save</button></div>
  <h2>Choose an Area</h2><div class="grid">${AREAS.map(areaCard).join('')}</div>
  <p class="small">All progress and leaderboard data are saved only in this browser on this device. Nothing is uploaded or exported.</p></div>`;
}
function hudHtml(){return `<div class="hud"><div class="stat">Hero<b>${safeNick(state.nickname)}</b></div><div class="stat">Score<b>${state.score}</b></div><div class="stat">Coins<b>${state.coins}</b></div><div class="stat">Best Streak<b>${state.bestStreak}</b></div><div class="stat">Hearts<b>${'❤'.repeat(state.hearts)}</b></div></div>`}
function areaCard(a){
  const unlocked=a.id<=state.unlockedArea, done=state.completedAreas.includes(a.id);
  const pct = done?100:(state.currentRun&&state.currentRun.areaId===a.id?Math.round(state.currentRun.qIndex/a.questions*100):0);
  return `<div class="area-card"><h3>Area ${a.id}: ${a.name}</h3><p>${a.lore}</p><p><b>Boss:</b> ${a.boss}</p><div class="progressbar"><div class="progressfill" style="width:${pct}%"></div></div><p class="small">${done?'Completed':unlocked?'Unlocked':'Locked'}</p><button class="btn ${unlocked?'primary':''}" ${unlocked?'':'disabled'} onclick="enterArea(${a.id})">${state.currentRun&&state.currentRun.areaId===a.id?'Resume Area':'Enter Area'}</button></div>`;
}
function enterArea(id){
  if(id>state.unlockedArea) return;
  if(!state.currentRun || state.currentRun.areaId!==id){
    const a=areaById(id);
    state.currentRun={areaId:id, qIndex:0, phase:'questions', bossHp:0, bossMaxHp:0, answeredInArea:0};
  }
  save(); renderGame();
}
function renderGame(){
  const run=state.currentRun; if(!run) return renderMainMenu();
  const area=areaById(run.areaId);
  const isBoss=run.phase==='boss';
  app.innerHTML = `<div class="screen"><div class="row"><button class="btn" onclick="confirmMainMenu()">Main Menu</button><button class="btn purple" onclick="openShop('game')">Shop</button></div>${hudHtml()}
  <h2>${isBoss?'Boss Battle':'Quest'}: ${area.name}</h2><p>${isBoss?`Defeat ${area.boss}!`:`Question ${run.qIndex+1} of ${area.questions}. Boss battle unlocks after this area.`}</p>
  ${isBoss?`<div class="progressbar bossbar"><div class="progressfill" style="width:${Math.max(0,run.bossHp/run.bossMaxHp*100)}%"></div></div><p>Boss HP: ${run.bossHp}/${run.bossMaxHp}</p>`:`<div class="progressbar"><div class="progressfill" style="width:${Math.round(run.qIndex/area.questions*100)}%"></div></div>`}
  <div id="hintBox"></div><div class="problem" id="problemText">...</div><div class="answer-wrap"><input id="answer" class="input answer-input" type="number" inputmode="numeric" autocomplete="off" /><div class="row" style="margin-top:12px"><button class="btn primary" onclick="submitAnswer()">Submit</button></div></div></div>`;
  makeProblem();
  document.getElementById('answer').addEventListener('keydown',e=>{ if(e.key==='Enter') submitAnswer(); });
  focusAnswer();
}
function focusAnswer(){ setTimeout(()=>{const el=document.getElementById('answer'); if(el){el.focus(); el.select?.();}},80); }
function makeProblem(){
  const run=state.currentRun, area=areaById(run.areaId);
  let a;
  if(run.phase==='boss') a = Math.floor(Math.random()*10)+1;
  else a = area.facts[Math.floor(Math.random()*area.facts.length)];
  const b = Math.floor(Math.random()*10)+1;
  currentProblem={a,b,answer:a*b};
  document.getElementById('problemText').textContent=`${a} × ${b}`;
  const hintBox=document.getElementById('hintBox');
  if(state.powers.focus>0){ hintBox.innerHTML=`<div class="card"><b>Focus Spark Hint:</b> Think of ${a} groups of ${b}. ${arrayHint(a,b)}</div>`; state.powers.focus--; save(); }
  else hintBox.innerHTML='';
}
function arrayHint(a,b){ return `${a} rows × ${b} columns = ${a*b} spaces.`; }
function submitAnswer(){
  const input=document.getElementById('answer'); if(!input) return;
  const val=Number(input.value); if(!Number.isFinite(val)) {toast('Type an answer first.'); focusAnswer(); return;}
  const correct=val===currentProblem.answer;
  const run=state.currentRun; const isBoss=run.phase==='boss';
  let points=correct?10+state.streak*2:0, coins=correct?5:0;
  let messages=[];
  if(correct){
    if(state.powers.double>0){points*=2; state.powers.double--; messages.push('Double Points used!');}
    state.streak++; state.bestStreak=Math.max(state.bestStreak,state.streak); state.score+=points; state.coins+=coins; state.xp+=points;
    if(isBoss){ run.bossHp=Math.max(0,run.bossHp-1); messages.push(`Boss took 1 hit!`); }
  } else {
    if(state.powers.shield>0){ state.powers.shield--; messages.push('Shield blocked the mistake.'); }
    else { state.hearts--; state.streak=0; messages.push(`Correct answer: ${currentProblem.answer}`); }
  }
  if(!isBoss && correct){ run.qIndex++; run.answeredInArea++; }
  save();
  pendingResult={correct, points, coins, messages, problem:`${currentProblem.a} × ${currentProblem.b}`, answer:currentProblem.answer};
  showResultModal();
}
function showResultModal(){
  const r=pendingResult; const run=state.currentRun;
  let status = r.correct ? 'Correct!' : 'Try Again Next Time';
  let body = `<h2>${r.correct?'✨':'💭'} ${status}</h2><p><b>${r.problem} = ${r.answer}</b></p><p>${r.correct?`+${r.points} points · +${r.coins} coins`:'Mistakes help your brain grow.'}</p>${r.messages.map(m=>`<p class="small">${m}</p>`).join('')}`;
  if(state.hearts<=0){
    body += `<div class="modal-actions"><button class="btn primary" onclick="endRunToMenu()">Return to Main Menu</button></div>`;
  } else if(run.phase==='boss' && run.bossHp<=0){
    body += `<div class="modal-actions"><button class="btn gold" onclick="bossVictory()">Claim Boss Victory</button><button class="btn purple" onclick="openShop('result')">Open Shop</button><button class="btn" onclick="confirmMainMenuFromResult()">Main Menu</button></div>`;
  } else if(run.phase==='questions' && run.qIndex>=areaById(run.areaId).questions){
    body += `<div class="modal-actions"><button class="btn gold" onclick="startBossIntro()">Start Boss Battle</button><button class="btn purple" onclick="openShop('result')">Open Shop</button><button class="btn" onclick="confirmMainMenuFromResult()">Main Menu</button></div>`;
  } else {
    body += `<div class="modal-actions"><button class="btn primary" onclick="nextQuestion()">Next Question</button><button class="btn purple" onclick="openShop('result')">Open Shop</button><button class="btn" onclick="confirmMainMenuFromResult()">Main Menu</button></div>`;
  }
  showModal(body);
}
function nextQuestion(){ closeModal(); save(); renderGame(); }
function startBossIntro(){
  const area=areaById(state.currentRun.areaId);
  state.currentRun.phase='boss'; state.currentRun.bossMaxHp=5+area.id; state.currentRun.bossHp=5+area.id; save();
  showModal(`<h2>⚔️ Boss Battle!</h2><p>${area.boss} appears!</p><p>Answer facts correctly to reduce boss HP. Every correct answer deals 1 damage.</p><div class="modal-actions"><button class="btn gold" onclick="nextQuestion()">Fight Boss</button><button class="btn purple" onclick="openShop('result')">Prepare in Shop</button></div>`);
}
function bossVictory(){
  const id=state.currentRun.areaId, area=areaById(id);
  if(!state.completedAreas.includes(id)) state.completedAreas.push(id);
  state.unlockedArea=clamp(Math.max(state.unlockedArea,id+1),1,AREAS.length);
  state.coins+=50; state.score+=100;
  const badge=`Defeated ${area.boss}`; if(!state.badges.includes(badge)) state.badges.push(badge);
  state.currentRun=null; state.hearts=3; save();
  showModal(`<h2>🏆 Victory!</h2><p>You defeated <b>${area.boss}</b>.</p><p>Reward: +100 points, +50 coins, and a badge.</p><div class="modal-actions"><button class="btn primary" onclick="closeModal();renderMainMenu()">Back to Main Menu</button></div>`);
}
function endRunToMenu(){ state.currentRun=null; state.hearts=3; save(); closeModal(); renderMainMenu(); }
function confirmMainMenu(){ showModal(`<h2>Leave Area?</h2><p>Your exact place in this area will be saved. You can continue later.</p><div class="modal-actions"><button class="btn primary" onclick="closeModal();renderMainMenu()">Save and Leave</button><button class="btn" onclick="closeModal();focusAnswer()">Stay</button></div>`); }
function confirmMainMenuFromResult(){ showModal(`<h2>Save and Leave?</h2><p>Your current area, question number, boss HP, coins, powers, and score will be saved.</p><div class="modal-actions"><button class="btn primary" onclick="closeModal();renderMainMenu()">Save and Leave</button><button class="btn" onclick="showResultModal()">Back to Result</button></div>`); }
function openShop(origin='game'){
  returnModal = origin;
  const items=SHOP.map(item=>{
    const disabled = item.key==='heal' ? state.hearts>=3 || state.coins<item.cost : state.coins<item.cost;
    return `<div class="shop-item"><strong>${item.name}</strong><br><span>${item.desc}</span><br><b>${item.cost} coins</b><div><button class="btn gold" ${disabled?'disabled':''} onclick="buyItem('${item.key}')">Buy</button></div></div>`;
  }).join('');
  showModal(`<h2>🛒 Power Shop</h2><p>Coins: <b>${state.coins}</b></p>${items}<div class="modal-actions"><button class="btn primary" onclick="closeShop()">${origin==='result'?'Back to Result':'Close Shop'}</button></div>`);
}
function closeShop(){ if(returnModal==='result') showResultModal(); else { closeModal(); focusAnswer(); } }
function buyItem(key){
  const item=SHOP.find(x=>x.key===key); if(!item || state.coins<item.cost) return;
  if(key==='heal' && state.hearts>=3) return toast('Hearts are already full.');
  state.coins-=item.cost;
  if(key==='heal') state.hearts=clamp(state.hearts+1,0,3); else state.powers[key]=(state.powers[key]||0)+1;
  save(); toast(`${item.name} purchased!`); openShop(returnModal||'game');
}
function showLeaderboard(){
  let lb=[]; try{lb=JSON.parse(localStorage.getItem(LB_KEY)||'[]')}catch{}
  const rows = lb.length ? lb.map((e,i)=>`<tr><td>${i+1}</td><td>${safeNick(e.nickname)}</td><td>${e.score}</td><td>${e.bestStreak}</td><td>${e.highestArea}</td><td>${e.bossesDefeated}</td></tr>`).join('') : `<tr><td colspan="6">No scores yet.</td></tr>`;
  showModal(`<h2>Local Leaderboard</h2><p class="small">This leaderboard exists only on this device/browser. Students cannot export it.</p><table class="table"><thead><tr><th>#</th><th>Nick</th><th>Score</th><th>Streak</th><th>Area</th><th>Bosses</th></tr></thead><tbody>${rows}</tbody></table><div class="modal-actions"><button class="btn primary" onclick="closeModal()">Close</button></div>`);
}
function showInstructions(){
  showModal(`<h2>How to Play</h2><p>Answer multiplication facts to complete each area. At the end of every area, a boss battle begins.</p><p>After each answer, choose: Next Question, Shop, or Main Menu.</p><p>Progress saves automatically after each question, purchase, boss hit, and area completion.</p><p>Use only a nickname. Never type personal information.</p><div class="modal-actions"><button class="btn primary" onclick="closeModal()">Got It</button></div>`);
}
function confirmReset(){ showModal(`<h2>Reset Save?</h2><p>This clears this browser's game progress. It cannot be undone.</p><div class="modal-actions"><button class="btn danger" onclick="closeModal();resetAll()">Reset</button><button class="btn" onclick="closeModal()">Cancel</button></div>`); }
window.addEventListener('beforeunload', save);
window.startNew=startNew; window.renderMainMenu=renderMainMenu; window.continueAdventure=continueAdventure; window.enterArea=enterArea; window.submitAnswer=submitAnswer; window.nextQuestion=nextQuestion; window.startBossIntro=startBossIntro; window.bossVictory=bossVictory; window.openShop=openShop; window.closeShop=closeShop; window.buyItem=buyItem; window.confirmMainMenu=confirmMainMenu; window.confirmMainMenuFromResult=confirmMainMenuFromResult; window.showLeaderboard=showLeaderboard; window.showInstructions=showInstructions; window.confirmReset=confirmReset; window.endRunToMenu=endRunToMenu; window.closeModal=closeModal; window.resetAll=resetAll;
if(state) renderMainMenu(); else renderStart();
