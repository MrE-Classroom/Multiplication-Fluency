window.UI = (() => {
  const $ = sel => document.querySelector(sel);
  const el = (tag, cls='', html='') => { const n=document.createElement(tag); if(cls) n.className=cls; if(html!==undefined) n.innerHTML=html; return n; };
  function stars(n){return '★★★★★'.slice(0,n)+'☆☆☆☆☆'.slice(0,5-n)}
  function toast(msg){const old=$('.toast'); if(old) old.remove(); const t=el('div','toast',msg); document.body.appendChild(t); setTimeout(()=>t.remove(),2200)}
  function modal(title, body, actions=[]){closeModal(); const o=el('div','overlay'); const m=el('div','modal panel'); m.innerHTML=`<div class="row between"><h2 class="title">${title}</h2><button class="small ghost" data-close>Close</button></div><div class="scroll" style="max-height:65dvh">${body}</div><div class="row"></div>`; const row=m.querySelector('.row:last-child'); actions.forEach(a=>{const b=el('button',a.class||'',a.label); b.onclick=a.onClick; row.appendChild(b)}); o.appendChild(m); document.body.appendChild(o); o.querySelector('[data-close]').onclick=closeModal; o.addEventListener('click',e=>{if(e.target===o) closeModal()}); return o}
  function closeModal(){const o=$('.overlay'); if(o) o.remove()}
  function statBar(label,value){return `<div class="summary-stat"><span class="muted">${label}</span><b>${value}</b></div>`}
  window.addEventListener('keydown',e=>{if(e.key==='Escape') closeModal()});
  return {$,el,stars,toast,modal,closeModal,statBar};
})();
