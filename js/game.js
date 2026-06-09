(() => {
  const D = window.GAME_DATA;
  const S = window.StorageManager;
  const M = window.Mastery;
  const U = window.UI;
  const app = document.getElementById('app');

  let state = S.load() || freshState();
  let screen = 'town';
  let currentRound = null;
  let mobileDrawer = null;
  let shopFilter = 'all';

  function freshState(){
    const facts = M.init();
    return {
      version:8,
      name:'Hero', classId:null, areaId:'town', coins:100, level:1, xp:0,
      classChangesFree:1, inBoss:false,
      hp:4, mana:2, streak:0,
      mastery:facts, timeSpent:0, sessionStart:Date.now(),
      inventory:[], equipped:{weapon:null,head:null,body:null,legs:null,pet:null,aura:null,frame:null,cosmetic:null},
      records:{bestAccuracy:0,longestStreak:0,mostCoinsRound:0,bossesDefeated:0,trainingSets:0,factsImproved:0,totalRounds:0},
      areaProgress:{}, questProgress:{daily10:0, accuracy80:0, train1:0, improve1:0}, completedQuests:{}, recentFacts:[]
    };
  }
  function save(){ S.save(state); }
  function cls(){return D.classes[state.classId]}
  function area(){return D.areas.find(a=>a.id===state.areaId) || {id:'town',name:'Town',icon:'🏘️',focus:[]}}
  function areaProg(id){ if(!state.areaProgress[id]) state.areaProgress[id]={rounds:0,bestAccuracy:0,bossKey:false,bossDefeated:false}; return state.areaProgress[id]; }
  function totalStats(){ const base=cls()?.baseStats || {hp:4,mana:2,attack:1,defense:1,speed:1,focus:1}; const out={...base}; Object.values(state.equipped).forEach(id=>{const it=D.items[id]; if(it?.stats) Object.entries(it.stats).forEach(([k,v])=>out[k]=(out[k]||0)+v)}); return out; }
  function canUseItem(it){return it.classAllowed.includes('all') || it.classAllowed.includes(state.classId)}
  function equipItem(id){ const it=D.items[id]; if(!it) return; if(!canUseItem(it)){U.toast(`${it.name} is locked for this class.`); return;} state.equipped[it.slot]=id; save(); render(); U.toast(`Equipped ${it.name}`); }
  function awardCoins(n){ state.coins += n; }
  function addXP(n){ state.xp += n; while(state.xp>=100){state.xp-=100; state.level++; U.toast(`Level up! Level ${state.level}`);} }
  function updateQuest(type, amount=1){ D.quests.filter(q=>q.type===type).forEach(q=>{ if(state.completedQuests[q.id]) return; state.questProgress[q.id]=(state.questProgress[q.id]||0)+amount; if(state.questProgress[q.id]>=q.target){state.completedQuests[q.id]=true; if(q.reward?.coins) awardCoins(q.reward.coins); U.toast(`${q.name} complete! +${q.reward?.coins||0} coins`);} }); }
  function recordAnswer(a,b,correct){ const res=M.record(state.mastery,a,b,correct); if(res.improved){ state.records.factsImproved++; updateQuest('improve',1); } const k=M.key(a,b); state.recentFacts.unshift(k); state.recentFacts=[...new Set(state.recentFacts)].slice(0,8); return res; }
  function resetHPMana(){const st=totalStats(); state.hp=st.hp; state.mana=st.mana;}

  function render(){
    if(!state.classId){ renderStart(); return; }
    const a=area(); const st=totalStats(); const sum=M.summary(state.mastery);
    app.className='app-shell game';
    app.innerHTML = `
      <header class="topbar panel">
        <div class="status-chips">
          <span class="chip">${cls().icon} ${state.name}</span>
          <span class="chip">Class: ${cls().name}</span>
          <span class="chip">Area: ${a.icon||'🏘️'} ${a.name}</span>
          <span class="chip">Coins: 🪙 ${state.coins}</span>
          <span class="chip">Boss Key: ${bossKeyText()}</span>
          <span class="chip">Saved ✓</span>
        </div>
        <div class="nav-buttons">
          <button class="small" data-screen="town" ${state.inBoss?'disabled':''}>Town</button>
          <button class="small" data-screen="map" ${state.inBoss?'disabled':''}>Map</button>
          <button class="small" data-screen="mastery">Current Mastery</button>
        </div>
      </header>
      <section class="layout">
        <aside class="left-panel panel scroll">${heroPanel()}</aside>
        <main class="main-panel panel"><div id="mainContent" class="main-content scroll"></div></main>
        <aside class="right-panel panel"><div class="right-split">${rightPanel()}</div></aside>
      </section>
      <footer class="bottombar panel">
        <div class="status-chips">
          <span class="chip">HP: ${hearts(state.hp,st.hp)}</span>
          <span class="chip">${cls().ability.resource}: ${manaDots(state.mana,st.mana)}</span>
          <span class="chip">Level ${state.level}</span>
          <span class="chip">XP ${state.xp}/100</span>
          <span class="chip">Streak ${state.streak}</span>
          <span class="chip">Accuracy ${sum.accuracy}%</span>
          <span class="chip">Mastered ${sum.mastered}/121</span>
        </div>
        <div class="mobile-tabs">
          <button data-drawer="hero">Hero</button><button data-drawer="quests">Quests</button><button data-screen="map">Map</button><button data-screen="inventory">Bag</button>
        </div>
      </footer>
    `;
    bindShell(); renderScreen(); save();
  }

  function renderStart(){
    app.className='app-shell';
    app.innerHTML = `<div class="start-screen"><section class="start-card panel">
      <h1 class="big center">Multiplication Adventure</h1><p class="center muted">Choose a class to begin. Progress saves on this device.</p>
      <label><b>Hero Name</b><input id="heroName" class="input" maxlength="18" value="${state.name||'Hero'}"></label>
      <div class="class-grid">${Object.entries(D.classes).map(([id,c])=>`<div class="class-card"><div class="hero-portrait">${c.icon}</div><h3>${c.name}</h3><div class="stars">${U.stars(c.difficulty)}</div><p>${c.description}</p><p><b>${c.ability.name}:</b> ${c.ability.description}</p><button class="wide" data-choose="${id}">Choose ${c.name}</button></div>`).join('')}</div>
    </section></div>`;
    document.querySelectorAll('[data-choose]').forEach(b=>b.onclick=()=>chooseClass(b.dataset.choose));
  }
  function chooseClass(id){ state.name=document.getElementById('heroName').value.trim()||'Hero'; state.classId=id; state.inventory=[]; const starter = D.starterItems.find(itemId => D.items[itemId].classAllowed.includes(id)); if(starter){state.inventory.push(starter); state.equipped.weapon=starter;} resetHPMana(); save(); render(); }
  function bindShell(){
    document.querySelectorAll('[data-screen]').forEach(b=>b.onclick=()=>{ if(state.inBoss && ['town','map'].includes(b.dataset.screen)) return; screen=b.dataset.screen; mobileDrawer=null; render(); });
    document.querySelectorAll('[data-drawer]').forEach(b=>b.onclick=()=>{ mobileDrawer=b.dataset.drawer; renderDrawer(); });
  }
  function renderDrawer(){
    const old=document.querySelector('.mobile-drawer'); if(old) old.remove();
    let html = mobileDrawer==='hero'? heroPanel() : rightPanel();
    const drawer=U.el('div','mobile-drawer panel scroll',`<div class="row between"><b>${mobileDrawer==='hero'?'Hero':'Quests & Coach'}</b><button class="small ghost" data-close-drawer>Close</button></div>${html}`);
    document.body.appendChild(drawer); drawer.querySelector('[data-close-drawer]').onclick=()=>drawer.remove();
  }
  function renderScreen(){
    const main=document.getElementById('mainContent'); if(!main) return;
    const screens = {town, training, map, shop, inventory, records, profile, mastery, areaSelect, battle, boss, results};
    main.innerHTML = (screens[screen]||town)();
    bindMain();
  }
  function bindMain(){
    document.querySelectorAll('[data-screen-main]').forEach(b=>b.onclick=()=>{screen=b.dataset.screenMain; render();});
    document.querySelectorAll('[data-area]').forEach(b=>b.onclick=()=>{state.areaId=b.dataset.area; screen='areaSelect'; render();});
    document.querySelectorAll('[data-start-area]').forEach(b=>startRound(false));
    document.querySelectorAll('[data-start-training]').forEach(b=>startRound(false,'training'));
    document.querySelectorAll('[data-start-boss]').forEach(b=>startRound(true));
    document.querySelectorAll('[data-buy]').forEach(b=>previewBuy(b.dataset.buy));
    document.querySelectorAll('[data-equip]').forEach(b=>equipItem(b.dataset.equip));
    document.querySelectorAll('[data-filter]').forEach(b=>{b.onclick=()=>{shopFilter=b.dataset.filter; render();}});
    document.querySelectorAll('[data-answer]').forEach(b=>answer(Number(b.dataset.answer)));
    document.querySelectorAll('[data-class-change]').forEach(b=>changeClassPreview(b.dataset.classChange));
    document.querySelectorAll('[data-reset]').forEach(b=>b.onclick=resetGameModal);
  }

  function heroPanel(){ const st=totalStats(); const c=cls(); return `
    <div class="hero-portrait">${c.icon}</div><h2 class="section-title center">${state.name}</h2><div class="center"><b>${c.name}</b> <span class="stars">${U.stars(c.difficulty)}</span></div>
    <div class="coach-box"><b>${c.ability.name}</b><br><span class="muted">${c.ability.description}</span></div>
    <h3 class="section-title">Equipped Gear</h3><div class="gear-list">${['weapon','head','body','legs','pet','aura','frame','cosmetic'].map(slot=>gearRow(slot)).join('')}</div>
    <h3 class="section-title">Stats</h3><div class="stat-grid">${Object.entries(st).map(([k,v])=>`<div class="stat"><b>${v}</b><br>${cap(k)}</div>`).join('')}</div>
    <div class="row"><button class="small" data-screen-main="inventory">Inventory</button><button class="small" data-screen-main="profile">Profile</button><button class="small" data-screen-main="profile">Change Class</button></div>`; }
  function gearRow(slot){const id=state.equipped[slot]; const it=D.items[id]; return `<div class="gear-row"><span>${cap(slot)}</span><b>${it?it.icon+' '+it.name:'—'}</b></div>`}
  function rightPanel(){ const sum=M.summary(state.mastery); return `<div class="soft panel scroll"><h3 class="section-title">Quest Log</h3>${D.quests.map(q=>questLine(q)).join('')}</div><div class="soft panel scroll"><h3 class="section-title">Coach</h3>${coachText()}<div class="mastery-mini"><b>Mastery</b><br>👑 ${sum.mastered}/121 mastered<br>⚠️ ${sum.needs} need practice<br><button class="small" data-screen-main="mastery">Current Mastery</button></div></div>`}
  function questLine(q){ const done=state.completedQuests[q.id]; const val=Math.min(state.questProgress[q.id]||0,q.target); return `<div class="quest-card"><b>${done?'✅':'⬜'} ${q.name}</b><br><span class="muted">${q.desc}</span><div class="progressbar"><span style="width:${done?100:Math.round(val/q.target*100)}%"></span></div><small>${done?'Complete':`${val}/${q.target}`} · Reward: ${q.reward?.coins||0} coins</small></div>`; }
  function coachText(){ if(screen==='battle') return `<p>Answer correctly to earn coins and mastery. Use the strategy that helps you solve accurately.</p>`; if(screen==='boss') return `<p>Boss battle: wrong answers cost HP. Class changes are locked until the attempt ends.</p>`; const weak=M.weakFacts(state.mastery,1)[0]; if(weak) return `<p><b>Recommended:</b> Train ${weak.a} × ${weak.b} before harder areas.</p>`; return `<p><b>Recommended:</b> Choose an area, train, or check your mastery table.</p>` }

  function town(){ state.areaId='town'; state.inBoss=false; return `<h1 class="title">Town</h1><p class="muted">Choose where to go next.</p><div class="town-menu">
    ${action('Training Area','Work on weak facts anytime.','training','🏋️')}
    ${action('Adventure Map','Choose an area and earn boss keys.','map','🗺️')}
    ${action('Class Shop','Buy gear filtered for your class.','shop','🛒')}
    ${action('Quest Board','View active personal quests.','profile','📜')}
    ${action('Current Mastery','See your 0–10 multiplication table.','mastery','👑')}
    ${action('Personal Records','See your best scores on this device.','records','🏆')}
    <div class="action-card danger-card"><h3>⚙️ Settings / Reset</h3><p class="muted">Start over on this device. This erases saved progress.</p><button class="danger" data-reset>Reset Game</button></div>
  </div>`; }
  function action(title,desc,target,icon){return `<div class="action-card"><h3>${icon} ${title}</h3><p class="muted">${desc}</p><button data-screen-main="${target}">Open</button></div>`}
  function training(){ const weak=M.weakFacts(state.mastery,5); return `<h1 class="title">Training Area</h1><p>Training uses your current weak facts and review facts.</p><div class="summary-grid">${weak.map(f=>U.statBar(`${f.a} × ${f.b}`,M.levels[f.level])).join('')||U.statBar('Focus','New facts')}</div><br><button class="good wide" data-start-training>Start 10-Question Training Set</button>`; }
  function map(){ return `<h1 class="title">Adventure Map</h1><div class="card-grid">${D.areas.map(a=>{const p=areaProg(a.id); return `<div class="action-card"><h3>${a.icon} ${a.name}</h3><p>Focus: ${a.focus.join(', ')} facts</p><p>Boss: ${a.boss}</p><p>Boss Key: ${p.bossKey?'Ready':'Not ready'} · Boss: ${p.bossDefeated?'Defeated':'Waiting'}</p><button data-area="${a.id}">Go to ${a.name}</button></div>`}).join('')}</div>`; }
  function areaSelect(){ const a=area(); const p=areaProg(a.id); return `<h1 class="title">${a.icon} ${a.name}</h1><p>Practice focus: ${a.focus.join(', ')} facts</p><div class="summary-grid">${U.statBar('Rounds',p.rounds+'/'+a.roundsNeeded)}${U.statBar('Best Accuracy',p.bestAccuracy+'%')}${U.statBar('Boss Key',p.bossKey?'Ready':'Locked')}${U.statBar('Boss',p.bossDefeated?'Defeated':'Not yet')}</div><br><button class="good" data-start-area>Start Area Round</button> <button class="gold" data-start-boss ${p.bossKey&&!p.bossDefeated?'':'disabled'}>Enter Boss</button>`; }
  function shop(){ const types=['all','weapon','helmet','armor','legs','pet','aura','frame','cosmetic']; const items=Object.entries(D.items).filter(([id,it])=>canUseItem(it) && !state.inventory.includes(id) && (shopFilter==='all'||it.type===shopFilter||it.slot===shopFilter)); return `<h1 class="title">Class Shop</h1><p class="muted">Only ${cls().name} items and universal cosmetics are shown.</p><div class="tabs">${types.map(t=>`<button class="small ${shopFilter===t?'active':''}" data-filter="${t}">${cap(t)}</button>`).join('')}</div><div class="shop-grid">${items.map(([id,it])=>itemCard(id,it,true)).join('')||'<p>No items in this category.</p>'}</div>`; }
  function inventory(){ const ids=state.inventory; return `<h1 class="title">Inventory</h1><div class="inventory-grid">${ids.map(id=>itemCard(id,D.items[id],false)).join('')||'<p>No items yet.</p>'}</div>`; }
  function itemCard(id,it,forShop){ const locked=!canUseItem(it); const owned=state.inventory.includes(id); return `<div class="item-card ${locked?'locked':''}"><div class="item-icon">${it.icon}</div><h4>${it.name}</h4><span class="badge">${it.rarity}</span><span class="badge">${it.classAllowed.includes('all')?'All Classes':it.classAllowed.map(cap).join(', ')}</span><p>${it.description}</p><p><b>Stats:</b> ${Object.keys(it.stats||{}).length?Object.entries(it.stats).map(([k,v])=>`+${v} ${cap(k)}`).join(', '):'Cosmetic'}</p>${forShop?`<button data-buy="${id}" ${state.coins<it.cost?'disabled':''}>Preview ${it.cost} 🪙</button>`:`<button data-equip="${id}" ${locked?'disabled':''}>${locked?'Locked':'Equip'}</button>`}</div>`; }
  function previewBuy(id){ const it=D.items[id]; U.modal(`Buy ${it.name}?`, `<div class="item-icon">${it.icon}</div><p>${it.description}</p><p><b>Cost:</b> ${it.cost} coins</p><p><b>Class:</b> ${it.classAllowed.includes('all')?'All':it.classAllowed.map(cap).join(', ')}</p><p><b>Stats:</b> ${Object.keys(it.stats||{}).length?Object.entries(it.stats).map(([k,v])=>`+${v} ${cap(k)}`).join(', '):'Cosmetic only'}</p>`, [{label:'Buy',class:'good',onClick:()=>{ if(state.coins>=it.cost){state.coins-=it.cost; state.inventory.push(id); U.closeModal(); equipItem(id); }}}]); }
  function profile(){ const sum=M.summary(state.mastery); return `<h1 class="title">Hero Profile</h1><div class="summary-grid">${U.statBar('Class',cls().name)}${U.statBar('Level',state.level)}${U.statBar('Coins',state.coins)}${U.statBar('Facts Mastered',sum.mastered)}${U.statBar('Accuracy',sum.accuracy+'%')}${U.statBar('Bosses Defeated',state.records.bossesDefeated)}</div><h3>Class Change</h3><p>One free class change, then 25 coins. Class changes only happen in Town.</p><div class="class-grid">${Object.entries(D.classes).map(([id,c])=>`<div class="class-card"><h3>${c.icon} ${c.name}</h3><div class="stars">${U.stars(c.difficulty)}</div><p>${c.description}</p><button data-class-change="${id}" ${id===state.classId?'disabled':''}>Change to ${c.name}</button></div>`).join('')}</div><br><button class="danger" data-reset>Reset Saved Progress</button>`; }
  function records(){ const r=state.records; return `<h1 class="title">Personal Records</h1><div class="summary-grid">${U.statBar('Best Accuracy',r.bestAccuracy+'%')}${U.statBar('Longest Streak',r.longestStreak)}${U.statBar('Most Coins / Round',r.mostCoinsRound)}${U.statBar('Bosses Defeated',r.bossesDefeated)}${U.statBar('Training Sets',r.trainingSets)}${U.statBar('Facts Improved',r.factsImproved)}</div>`; }
  function mastery(){ const sum=M.summary(state.mastery); let table='<table class="mastery-table"><thead><tr><th>×</th>'; for(let c=0;c<=10;c++) table+=`<th>${c}</th>`; table+='</tr></thead><tbody>'; for(let r=0;r<=10;r++){ table+=`<tr><td class="rowhead">${r}</td>`; for(let c=0;c<=10;c++){ const f=state.mastery[M.key(r,c)]; const clsName=['m-new','m-need','m-better','m-strong','m-mastered'][f.level]; const icon=f.level===4?'👑':f.level===2?'⌛':f.level===1?'!':''; table+=`<td class="m-cell ${clsName}" title="${r} × ${c}: ${M.levels[f.level]}"><small>${icon}</small>${r*c}</td>`; } table+='</tr>'; } table+='</tbody></table>'; return `<div class="mastery-screen"><div><h1 class="title">Current Mastery: 0–10</h1><div class="legend"><span><i class="swatch m-mastered"></i>Mastered</span><span><i class="swatch m-strong"></i>Strong</span><span><i class="swatch m-better"></i>Getting Better</span><span><i class="swatch m-need"></i>Needs Practice</span><span><i class="swatch m-new"></i>New</span></div></div><div class="mastery-stats">${U.statBar('Total Problems',sum.attempts)}${U.statBar('Problems Correct',sum.correct)}${U.statBar('Accuracy',sum.accuracy+'%')}${U.statBar('Facts Mastered',sum.mastered)}${U.statBar('Facts Strong',sum.strong)}${U.statBar('% Complete',sum.complete+'%')}</div><div class="mastery-table-wrap">${table}</div><div class="row"><button data-screen-main="training" class="good">Train Weak Facts</button><button data-screen-main="town">Back to Town</button></div></div>`; }

  function startRound(isBoss=false, mode='area'){
    if(mode==='training'){ state.areaId='town'; }
    const a=area(); state.inBoss=!!isBoss; resetHPMana(); state.streak=0;
    currentRound={mode,isBoss,areaId:a.id,questions:[],index:0,correct:0,coins:0,improved:0,answers:[],bossHp:isBoss?5:0,abilityUsed:false,start:Date.now()};
    for(let i=0;i<10;i++){ const fact=M.chooseFact(state.mastery, mode==='training'?[]:a.focus, mode==='training'?'training':'area', state.recentFacts); currentRound.questions.push(makeQuestion(fact.a,fact.b)); }
    if(isBoss){currentRound.questions=currentRound.questions.slice(0,8); screen='boss';} else screen='battle'; render();
  }
  function makeQuestion(a,b){ const p=a*b; const choices=new Set([p]); while(choices.size<4){ let delta=[-10,-5,-4,-3,-2,-1,1,2,3,4,5,10][Math.floor(Math.random()*12)]; let v=p+delta; if(v<0 || Math.random()<.35) v=a*(Math.max(0,Math.min(10,b+[-2,-1,1,2][Math.floor(Math.random()*4)]))); choices.add(v); } return {a,b,p,choices:[...choices].sort(()=>Math.random()-.5)}; }
  function battle(){ return roundHTML(false); }
  function boss(){ return roundHTML(true); }
  function roundHTML(isBoss){ const q=currentRound?.questions[currentRound.index]; if(!q) return '<p>No round active.</p>'; const pct=Math.round((currentRound.index/currentRound.questions.length)*100); return `<div class="battle-card"><h1 class="title">${isBoss?`${area().boss} Boss Battle`:(currentRound.mode==='training'?'Training Area':`${area().name} Challenge`)}</h1>${isBoss?`<div class="chip">Boss HP: ${'💥'.repeat(currentRound.bossHp)}</div>`:''}<div class="progressbar"><span style="width:${pct}%"></span></div><div class="muted">Question ${currentRound.index+1}/${currentRound.questions.length}</div><div class="question">${q.a} × ${q.b} = ?</div><div class="answers">${q.choices.map(c=>`<button data-answer="${c}">${c}</button>`).join('')}</div>${isBoss&&state.classId==='mage'&&!currentRound.abilityUsed?'<button class="gold" onclick="window.useClassAbility()">Use Focus Spell</button>':''}</div>`; }
  function answer(val){ const q=currentRound.questions[currentRound.index]; const correct=val===q.p; const res=recordAnswer(q.a,q.b,correct); currentRound.answers.push({q,chosen:val,correct}); updateQuest('answers',1); if(correct){ currentRound.correct++; state.streak++; const base=state.classId==='archer'&&state.streak>0&&state.streak%3===0?4:2; currentRound.coins+=base; awardCoins(base); addXP(5); if(currentRound.isBoss) currentRound.bossHp--; if(res.improved) currentRound.improved++; } else { state.streak=0; if(currentRound.isBoss){ if(state.classId==='knight'&&!currentRound.abilityUsed){currentRound.abilityUsed=true; U.toast('Shield Block protected you!');} else state.hp--; } } state.records.longestStreak=Math.max(state.records.longestStreak,state.streak); if(currentRound.isBoss && currentRound.bossHp<=0) return finishRound(true); if(state.hp<=0 && currentRound.isBoss) return finishRound(false); currentRound.index++; if(currentRound.index>=currentRound.questions.length) finishRound(currentRound.correct/currentRound.questions.length>=.7); else render(); }
  function finishRound(won=true){ const total=currentRound.questions.length; const acc=Math.round(currentRound.correct/total*100); state.records.bestAccuracy=Math.max(state.records.bestAccuracy,acc); state.records.mostCoinsRound=Math.max(state.records.mostCoinsRound,currentRound.coins); state.records.totalRounds++; if(acc>=80) updateQuest('accuracy80',1); if(currentRound.mode==='training'){state.records.trainingSets++; updateQuest('training',1);} if(currentRound.areaId && currentRound.mode!=='training'){ const a=D.areas.find(x=>x.id===currentRound.areaId); const p=areaProg(currentRound.areaId); p.rounds++; p.bestAccuracy=Math.max(p.bestAccuracy,acc); if(p.rounds>=a.roundsNeeded && p.bestAccuracy>=a.accuracyNeeded) p.bossKey=true; }
    if(currentRound.isBoss){ const p=areaProg(currentRound.areaId); state.inBoss=false; if(won){p.bossDefeated=true; state.records.bossesDefeated++; awardCoins(30); addXP(30);} }
    screen='results'; render(); }
  function results(){ if(!currentRound) return '<p>No results yet.</p>'; const total=currentRound.questions.length; const acc=Math.round(currentRound.correct/total*100); const weak=currentRound.answers.filter(a=>!a.correct).slice(0,3).map(x=>`${x.q.a}×${x.q.b}`).join(', ')||'None'; return `<h1 class="title">Round Complete</h1><div class="summary-grid">${U.statBar('Correct',`${currentRound.correct}/${total}`)}${U.statBar('Accuracy',acc+'%')}${U.statBar('Coins Earned',currentRound.coins)}${U.statBar('Facts Improved',currentRound.improved)}${U.statBar('Practice Facts',weak)}${U.statBar('Result',currentRound.isBoss?(areaProg(currentRound.areaId).bossDefeated?'Boss Defeated':'Try Again'):'Complete')}</div><br><div class="row"><button class="good" data-screen-main="training">Train Weak Facts</button><button data-screen-main="map">Map</button><button data-screen-main="town">Back to Town</button></div>`; }

  function resetGameModal(){
    if(state.inBoss || screen==='battle' || screen==='boss'){
      U.toast('Reset is only available from Town.');
      return;
    }
    U.modal('Reset Game?', `<p>This will erase saved progress on this device.</p><ul><li>Class selection</li><li>Coins, level, gear, and cosmetics</li><li>Quest progress and boss keys</li><li>Personal records</li><li>Current Mastery progress</li></ul><p><b>This cannot be undone.</b></p>`, [
      {label:'Cancel',class:'ghost',onClick:()=>U.closeModal()},
      {label:'Reset Everything',class:'danger',onClick:()=>{S.reset(); state=freshState(); currentRound=null; screen='town'; U.closeModal(); render(); U.toast('Game reset. Choose a class to start again.');}}
    ]);
  }

  function changeClassPreview(id){ if(screen!=='profile' && state.areaId!=='town'){U.toast('Class changes only happen in Town.'); return;} if(state.inBoss){U.toast('Class changes are locked during boss battles.'); return;} const fee=state.classChangesFree>0?0:25; const c=D.classes[id]; U.modal(`Change to ${c.name}?`, `<p>${c.description}</p><p><b>Cost:</b> ${fee===0?'Free class change':fee+' coins'}</p><p>Wrong-class gear will be unequipped but kept in inventory.</p>`, [{label:'Change Class',class:'good',onClick:()=>{ if(state.coins<fee){U.toast('Not enough coins.');return;} state.coins-=fee; if(state.classChangesFree>0) state.classChangesFree--; state.classId=id; Object.entries(state.equipped).forEach(([slot,itemId])=>{if(itemId && !canUseItem(D.items[itemId])) state.equipped[slot]=null;}); resetHPMana(); U.closeModal(); render(); }}]); }
  window.useClassAbility = function(){ if(!currentRound||!currentRound.isBoss||currentRound.abilityUsed) return; currentRound.abilityUsed=true; const q=currentRound.questions[currentRound.index]; q.choices=[q.p,...q.choices.filter(x=>x!==q.p).slice(0,1)].sort(()=>Math.random()-.5); U.toast('Focus Spell narrowed the choices!'); render(); }
  window.gameSetScreen = function(s){screen=s; render();}

  function bossKeyText(){ const a=area(); if(a.id==='town') return 'Town'; const p=areaProg(a.id); return p.bossDefeated?'Done':p.bossKey?'Ready':`${p.rounds}/${a.roundsNeeded}`; }
  function hearts(n,max){return '♥'.repeat(Math.max(0,n))+'♡'.repeat(Math.max(0,max-n))}
  function manaDots(n,max){return '✦'.repeat(Math.max(0,n))+'·'.repeat(Math.max(0,max-n))}
  function cap(s){return String(s).charAt(0).toUpperCase()+String(s).slice(1)}

  render();
})();
