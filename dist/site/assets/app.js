/* ============================================================
   Motor del sitio: dibuja páginas, quizzes y mini-juegos.
   Funciona igual como sitio completo (mode:'site') o como
   fragmento para incrustar en Google Sites (mode:'embed').
   ============================================================ */
(function(){
'use strict';
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
const shuffle = a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const store = {
  get(k){try{return localStorage.getItem('rst:'+k)}catch(e){return null}},
  set(k,v){try{localStorage.setItem('rst:'+k,v)}catch(e){}}
};
const NOTE = {tip:['','💡 Dato útil'],warn:['warn','⚠️ Cuidado'],safe:['safe','🛡️ Seguridad'],bad:['bad','❌ Error común']};

/* ---------------- QUIZ ---------------- */
function quiz(el, items, opt={}){
  let i=0, score=0;
  const order = shuffle(items.map((_,k)=>k));
  function show(){
    if(i>=items.length) return end();
    const it = items[order[i]];
    const opts = shuffle(it.o.map((t,k)=>({t,k})));
    el.innerHTML = `<div class="quiz-box">
      <div class="q-top"><span>${opt.label||'Pregunta'} ${i+1} de ${items.length}</span><span>⭐ ${score} acierto${score===1?'':'s'}</span></div>
      <div class="progress"><i style="width:${i/items.length*100}%"></i></div>
      ${it.ctx?`<div class="q-ctx">${it.ctx}</div>`:''}
      <div class="q-text">${it.q}</div>
      <div class="opts">${opts.map(o=>`<button class="opt" data-k="${o.k}">${o.t}</button>`).join('')}</div>
      <div class="why"></div>
      <div style="margin-top:12px;text-align:right"><button class="btn dark sm next" style="display:none">${i+1<items.length?'Siguiente →':'Ver resultado'}</button></div>
    </div>`;
    $$('.opt',el).forEach(b=>b.addEventListener('click',()=>{
      const k = +b.dataset.k, good = k===it.a;
      $$('.opt',el).forEach(x=>{x.disabled=true; if(+x.dataset.k===it.a) x.classList.add('right')});
      if(good) score++; else b.classList.add('wrong');
      const w = $('.why',el);
      w.innerHTML = (good?'✅ <b>¡Correcto!</b> ':'❌ <b>No exactamente.</b> ')+(it.why||'');
      w.classList.add('on');
      $('.next',el).style.display='inline-flex';
    }));
    $('.next',el).addEventListener('click',()=>{i++;show()});
  }
  function end(){
    const pct = Math.round(score/items.length*100);
    const [medal,msg] = pct===100?['🏆','¡Perfecto! Dominas el tema.']:pct>=70?['🥇','¡Muy bien! Estás listo para la práctica.']:pct>=50?['🥈','Vas bien, repasa los puntos que fallaste.']:['📘','Repasa el contenido y vuelve a intentarlo.'];
    if(opt.key){const prev=+store.get('q:'+opt.key)||0; if(pct>prev) store.set('q:'+opt.key,pct)}
    el.innerHTML = `<div class="quiz-box result"><div class="medal">${medal}</div><div class="score">${score}/${items.length}</div><p><b>${pct}%</b> · ${msg}</p><button class="btn dark">🔄 Intentar de nuevo</button></div>`;
    $('.btn',el).addEventListener('click',()=>{i=0;score=0;show()});
  }
  show();
}

/* ---------------- EMPAREJAR ---------------- */
function match(el,g){
  const L = g.pairs.map((p,i)=>({t:p[0],i}));
  const R = shuffle(g.pairs.map((p,i)=>({t:p[1],i})));
  let sel=null, ok=0, tries=0;
  el.innerHTML = `<div class="match"><div class="col" data-s="l">${L.map(x=>`<button class="mchip" data-i="${x.i}">${x.t}</button>`).join('')}</div><div class="col" data-s="r">${R.map(x=>`<button class="mchip" data-i="${x.i}">${x.t}</button>`).join('')}</div></div>
  <div class="stat-row"><span>Parejas: <b class="ok">0</b>/${g.pairs.length}</span><span>Intentos: <b class="tr">0</b></span><span class="fin"></span></div>`;
  $$('.mchip',el).forEach(b=>b.addEventListener('click',()=>{
    if(b.classList.contains('ok')) return;
    const side = b.parentElement.dataset.s;
    if(!sel || sel.side===side){
      $$('.mchip.sel',el).forEach(x=>x.classList.remove('sel'));
      b.classList.add('sel'); sel={side,i:+b.dataset.i,b}; return;
    }
    tries++; $('.tr',el).textContent=tries;
    if(sel.i===+b.dataset.i){
      sel.b.classList.remove('sel'); sel.b.classList.add('ok'); b.classList.add('ok'); ok++;
      $('.ok',el).textContent=ok;
      if(ok===g.pairs.length) $('.fin',el).innerHTML='🎉 <b>¡Completado!</b> '+(tries===ok?'Sin errores 🏆':'Con '+(tries-ok)+' error(es).');
    }else{
      [sel.b,b].forEach(x=>{x.classList.add('shake');setTimeout(()=>x.classList.remove('shake'),400)});
      sel.b.classList.remove('sel');
    }
    sel=null;
  }));
}

/* ---------------- ORDENAR ---------------- */
function order(el,g){
  let arr;
  const mix = ()=>{do{arr=shuffle(g.items.map((t,i)=>({t,i})))}while(arr.every((x,k)=>x.i===k)&&arr.length>1)};
  mix();
  function draw(res){
    el.innerHTML = `<ol class="order">${arr.map((x,k)=>`<li class="${res?(x.i===k?'ok':'bad'):''}"><span class="num">${k+1}</span><span class="tx">${x.t}</span><span class="mv"><button data-k="${k}" data-d="-1" aria-label="Subir">▲</button><button data-k="${k}" data-d="1" aria-label="Bajar">▼</button></span></li>`).join('')}</ol>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px"><button class="btn dark sm chk">✔ Comprobar orden</button><button class="btn line sm mx">🔀 Mezclar</button></div><div class="stat-row"><span class="fin"></span></div>`;
    $$('.mv button',el).forEach(b=>b.addEventListener('click',()=>{
      const k=+b.dataset.k, d=+b.dataset.d, j=k+d; if(j<0||j>=arr.length) return;
      [arr[k],arr[j]]=[arr[j],arr[k]]; draw();
    }));
    $('.chk',el).addEventListener('click',()=>{
      draw(true);
      const good = arr.filter((x,k)=>x.i===k).length;
      $('.fin',el).innerHTML = good===arr.length?'🎉 <b>¡Orden correcto!</b>':`Vas ${good} de ${arr.length} en su lugar. Los rojos están mal ubicados.`;
    });
    $('.mx',el).addEventListener('click',()=>{mix();draw()});
  }
  draw();
}

/* ---------------- CLASIFICAR ---------------- */
function classify(el,g){
  let q, i, score, busy;
  function start(){q=shuffle(g.items);i=0;score=0;busy=false;show()}
  function show(){
    if(i>=q.length){
      el.innerHTML=`<div class="result"><div class="medal">${score===q.length?'🏆':score>=q.length*.7?'🥇':'📘'}</div><div class="score">${score}/${q.length}</div><p>${score===q.length?'¡Clasificación perfecta!':'Repasa las categorías y vuelve a intentarlo.'}</p><button class="btn dark">🔄 Jugar otra vez</button></div>`;
      $('.btn',el).addEventListener('click',start); return;
    }
    el.innerHTML=`<div class="stat-row" style="margin:0 0 6px"><span>Elemento <b>${i+1}</b>/${q.length}</span><span>Aciertos: <b>${score}</b></span></div>
      <div class="cls-card">${q[i][0]}</div><div class="cls-opts">${g.cats.map((c,k)=>`<button class="btn dark" data-k="${k}">${c}</button>`).join('')}</div><div class="stat-row"><span class="fb"></span></div>`;
    $$('.cls-opts button',el).forEach(b=>b.addEventListener('click',()=>{
      if(busy) return; busy=true;
      const good=+b.dataset.k===q[i][1], card=$('.cls-card',el);
      card.classList.add(good?'flash-ok':'flash-bad');
      if(good) score++;
      $('.fb',el).innerHTML = good?'✅ ¡Correcto!':`❌ Era: <b>${g.cats[q[i][1]]}</b>${q[i][2]?' — '+q[i][2]:''}`;
      setTimeout(()=>{i++;busy=false;show()}, good?650:1900);
    }));
  }
  start();
}

/* ---------------- MEMORIA ---------------- */
function flip(el,g){
  const cards = shuffle(g.pairs.flatMap((p,i)=>[{t:p[0],i,id:i+'a'},{t:p[1],i,id:i+'b'}]));
  let open=[], done=0, moves=0, lock=false;
  el.innerHTML = `<div class="memory">${cards.map((c,k)=>`<button class="mem" data-k="${k}"><div class="in"><div class="f">🔧</div><div class="b">${c.t}</div></div></button>`).join('')}</div><div class="stat-row"><span>Parejas: <b class="dn">0</b>/${g.pairs.length}</span><span>Movimientos: <b class="mv">0</b></span><span class="fin"></span></div>`;
  $$('.mem',el).forEach(b=>b.addEventListener('click',()=>{
    if(lock||b.classList.contains('flip')||b.classList.contains('done')) return;
    b.classList.add('flip'); open.push(b);
    if(open.length===2){
      moves++; $('.mv',el).textContent=moves; lock=true;
      const [a,c]=open.map(x=>cards[+x.dataset.k]);
      setTimeout(()=>{
        if(a.i===c.i){open.forEach(x=>{x.classList.remove('flip');x.classList.add('done')});done++;$('.dn',el).textContent=done;
          if(done===g.pairs.length) $('.fin',el).innerHTML='🎉 <b>¡Lo lograste!</b> en '+moves+' movimientos.'}
        else open.forEach(x=>x.classList.remove('flip'));
        open=[];lock=false;
      },a.i===c.i?350:900);
    }
  }));
}

/* ---------------- TERMINAL SIMULADA ---------------- */
function terminal(el,g){
  const keys = Object.keys(g.cmds);
  el.innerHTML = `${g.task?`<div class="note"><b class="t">🎯 Reto</b>${g.task}</div>`:''}
    <div class="cmd"><div class="bar"><i></i><i></i><i></i>&nbsp; ${g.shell||'Símbolo del sistema (simulado)'}</div><div class="out"></div><div class="in-row"><span>${g.prompt||'C:\\&gt;'}</span><input type="text" autocomplete="off" spellcheck="false" aria-label="Comando" placeholder="escribe un comando y presiona Enter"></div></div>
    <div class="chips">${keys.map(k=>`<button data-c="${k}">${k}</button>`).join('')}<button data-c="help">help</button></div>`;
  const out=$('.out',el), inp=$('input',el);
  const print = t=>{out.textContent += t+'\n'; out.scrollTop=out.scrollHeight};
  print(g.intro||'Simulador educativo. Escribe "help" para ver los comandos disponibles.');
  function run(line){
    const t=line.trim(); if(!t) return;
    print((g.prompt||'C:\\>').replace('&gt;','>')+' '+t);
    const low=t.toLowerCase(), first=low.split(/\s+/)[0];
    if(first==='help'||first==='ayuda') print('Comandos disponibles:\n  '+keys.join('\n  ')+'\n  cls  (limpia la pantalla)');
    else if(first==='cls'||first==='clear') out.textContent='';
    else if(g.cmds[low]) print(g.cmds[low]);
    else if(g.cmds[first]) print(g.cmds[first]);
    else print(`'${first}' no se reconoce o no está en este simulador. Escribe help.`);
    print('');
  }
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){run(inp.value);inp.value=''}});
  $$('.chips button',el).forEach(b=>b.addEventListener('click',()=>{run(b.dataset.c);inp.focus()}));
}

/* ---------------- HOTSPOTS ---------------- */
function hotspot(el,g){
  const spots = ART.spots[g.art], svg = ART.map[g.art]();
  el.innerHTML = `<div class="hot"><div>${svg}</div><div class="info"><h4>👆 Toca una pieza</h4><p>Selecciona cualquier componente del diagrama para ver qué hace y cómo reconocerlo.</p></div></div>
  <div class="stat-row"><span>Explorados: <b class="n">0</b>/${Object.keys(spots).length}</span></div>`;
  const seen=new Set();
  $$('[data-id]',el).forEach(n=>n.addEventListener('click',()=>{
    $$('[data-id]',el).forEach(x=>x.classList.remove('sel')); n.classList.add('sel');
    const s=spots[n.dataset.id]; if(!s) return;
    $('.info',el).innerHTML=`<h4>${s[0]}</h4><p>${s[1]}</p>`;
    seen.add(n.dataset.id); $('.n',el).textContent=seen.size;
  }));
}

/* ---------------- Juego genérico ---------------- */
const GAMES = {match,order,classify,flip,terminal,hotspot,quiz:(el,g)=>quiz(el,g.items,{label:g.label||'Caso'})};
function gameBlock(g){
  return `<div class="game"><div class="game-head"><span class="gi">${g.icon||'🎮'}</span><h3>${g.title}</h3></div>${g.hint?`<div class="hint">${g.hint}</div>`:''}<div class="gbody" data-type="${g.type}"></div></div>`;
}
function mountGames(root,list){
  $$('.gbody',root).forEach((el,k)=>{ const g=list[k]; if(g&&GAMES[g.type]) GAMES[g.type](el,g); });
}

/* ---------------- Bloques de contenido ---------------- */
function sectionHTML(s){
  let h = `<div class="sec">${s.h?`<h3><span class="dot"></span>${s.h}</h3>`:''}`;
  (Array.isArray(s.p)?s.p:s.p?[s.p]:[]).forEach(p=>h+=`<p>${p}</p>`);
  if(s.list) h+=`<ul>${s.list.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  if(s.ol) h+=`<ol>${s.ol.map(x=>`<li>${x}</li>`).join('')}</ol>`;
  if(s.kv) h+=`<div class="kv">${s.kv.map(k=>`<div><b>${k[0]}</b><span>${k[1]}</span></div>`).join('')}</div>`;
  if(s.table) h+=`<div class="tblwrap"><table><thead><tr>${s.table.head.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  if(s.art) h+=`<figure class="art">${ART.map[s.art]()}${s.cap?`<figcaption>${s.cap}</figcaption>`:''}</figure>`;
  if(s.term) h+=`<pre class="term">${s.term}</pre>`;
  (Array.isArray(s.note)?s.note:s.note?[s.note]:[]).forEach(n=>{const d=NOTE[n.k||'tip'];h+=`<div class="note ${d[0]}"><b class="t">${n.t||d[1]}</b>${n.x}</div>`});
  return h+'</div>';
}
function videoHTML(v){
  if(!v) return '';
  const q = v.q?`https://www.youtube.com/results?search_query=${encodeURIComponent(v.q)}`:null;
  if(v.id) return `<h3 class="section-title" style="margin-top:8px">🎬 Video recomendado</h3><div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${v.id}" title="${v.title||'Video'}" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div><p style="font-size:.88rem;color:var(--muted)">${v.title||''} · <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">Abrir en YouTube ↗</a></p>`;
  return `<h3 class="section-title" style="margin-top:8px">🎬 Video sugerido</h3><div class="videoalt"><div class="pl">▶️</div><div><b>${v.title||'Busca un video de apoyo'}</b><br><span style="color:var(--muted);font-size:.9rem">Reemplaza este recuadro por el video que elijas (ver README) o <a href="${q}" target="_blank" rel="noopener">búscalo en YouTube ↗</a></span></div></div>`;
}
function checklistHTML(items,key){
  return `<div class="progress"><i></i></div><ul class="check" data-key="${key}">${items.map((t,k)=>`<li data-k="${k}"><input type="checkbox"><span>${t}</span></li>`).join('')}</ul><div class="stat-row"><span class="cnt"></span></div>`;
}
function mountChecklists(root){
  $$('ul.check',root).forEach(ul=>{
    const key='c:'+ul.dataset.key; let saved=[]; try{saved=JSON.parse(store.get(key)||'[]')}catch(e){}
    const lis=$$('li',ul), bar=ul.previousElementSibling.firstElementChild, cnt=ul.nextElementSibling.firstElementChild;
    const upd=()=>{const n=lis.filter(l=>l.classList.contains('done')).length;bar.style.width=(n/lis.length*100)+'%';cnt.innerHTML=`Completado: <b>${n}</b> de ${lis.length}`+(n===lis.length?' 🎉':'');store.set(key,JSON.stringify(lis.map((l,k)=>l.classList.contains('done')?k:-1).filter(k=>k>=0)))};
    lis.forEach((li,k)=>{
      const cb=$('input',li); if(saved.includes(k)){li.classList.add('done');cb.checked=true}
      li.addEventListener('click',e=>{ if(e.target!==cb) cb.checked=!cb.checked; li.classList.toggle('done',cb.checked); upd(); });
    });
    upd();
  });
}

/* ---------------- Tipos de página ---------------- */
function weekPage(P,ctx){
  const col = P.color;
  const tabs = [['contenido','📖 Contenido']];
  tabs.push(['practica','🛠️ Práctica']);
  if(P.games&&P.games.length) tabs.push(['juego','🎮 Mini-juego'+(P.games.length>1?'s':'')]);
  if(P.quiz&&P.quiz.length) tabs.push(['quiz','📝 Quiz']);
  const pr = P.practice;
  let h = `<div style="--c:${col}">`;
  if(ctx.mode==='embed') h+=`<div class="week-head"><div><span class="badge">${P.unitLabel} · Semana ${P.n}</span><h2>${P.title}</h2><p>${P.summary}</p></div><div class="big">${P.icon}</div></div>`;
  h+=`<div class="tabs" role="tablist">${tabs.map((t,k)=>`<button data-t="${t[0]}" class="${k?'':'on'}">${t[1]}</button>`).join('')}</div>`;
  h+=`<div class="pane on" data-p="contenido"><div class="objectives"><h4>🎯 Al terminar esta semana podrás…</h4><ul>${P.objectives.map(o=>`<li>${o}</li>`).join('')}</ul></div>${P.sections.map(sectionHTML).join('')}${videoHTML(P.video)}</div>`;
  h+=`<div class="pane" data-p="practica"><div class="sec"><h3><span class="dot"></span>${pr.title}</h3><div class="meta"><span>⏱️ ${pr.time}</span>${pr.materials?`<span>🧰 ${pr.materials}</span>`:''}${pr.mode?`<span>👥 ${pr.mode}</span>`:''}</div>${pr.intro?`<p>${pr.intro}</p>`:''}${checklistHTML(pr.steps,P.id)}${pr.deliver?`<div class="note safe"><b class="t">📤 Entregable</b>${pr.deliver}</div>`:''}</div></div>`;
  if(P.games&&P.games.length) h+=`<div class="pane" data-p="juego">${P.games.map(gameBlock).join('')}</div>`;
  if(P.quiz&&P.quiz.length) h+=`<div class="pane" data-p="quiz"><div class="hint" style="color:var(--muted);margin-bottom:10px">Comprueba lo aprendido. No afecta tu nota: es para practicar. Las respuestas cambian de lugar cada intento.</div><div id="quizmount"></div></div>`;
  h+=`</div>`;
  return {html:h, mount(root){
    const open=id=>{ $$('.tabs button',root).forEach(b=>b.classList.toggle('on',b.dataset.t===id)); $$('.pane',root).forEach(p=>p.classList.toggle('on',p.dataset.p===id)); };
    $$('.tabs button',root).forEach(b=>b.addEventListener('click',()=>open(b.dataset.t)));
    const hs=location.hash.replace('#',''); if(tabs.some(t=>t[0]===hs)) open(hs);
    if(P.games) mountGames(root,P.games);
    if(P.quiz&&P.quiz.length) quiz($('#quizmount',root),P.quiz,{key:P.id});
    mountChecklists(root);
  }};
}

function projectPage(P,ctx){
  const h = `<div style="--c:${P.color}">
  ${ctx.mode==='embed'?`<div class="week-head"><div><span class="badge">Proyecto ${P.n} · ${P.unitLabel}</span><h2>${P.title}</h2><p>${P.summary}</p></div><div class="big">${P.icon}</div></div>`:''}
  <div class="sec"><h3><span class="dot"></span>🎯 El reto</h3>${P.intro.map(p=>`<p>${p}</p>`).join('')}<div class="kv">${P.facts.map(f=>`<div><b>${f[0]}</b><span>${f[1]}</span></div>`).join('')}</div></div>
  <div class="sec"><h3><span class="dot"></span>📦 Entregables</h3><ul>${P.deliverables.map(d=>`<li>${d}</li>`).join('')}</ul></div>
  <div class="sec"><h3><span class="dot"></span>🗓️ Cronograma</h3>${P.phases.map(p=>`<div class="phase"><b>${p[0]}</b><div><b style="all:unset;font-weight:600;color:var(--brand)">${p[1]}</b><br><span style="color:var(--muted);font-size:.93rem">${p[2]}</span></div></div>`).join('')}</div>
  <div class="sec"><h3><span class="dot"></span>✅ Lista de avance</h3><p style="color:var(--muted);font-size:.92rem">Marca lo que ya hiciste (se guarda en este navegador).</p>${checklistHTML(P.checklist,P.id)}</div>
  <div class="sec"><h3><span class="dot"></span>📊 Rúbrica (100 pts)</h3><div class="tblwrap"><table class="rubric"><thead><tr>${['Criterio','Excelente','Bien','Por mejorar','Pts'].map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${P.rubric.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${P.note?`<div class="note"><b class="t">💡 Consejo</b>${P.note}</div>`:''}</div></div>`;
  return {html:h,mount(root){mountChecklists(root)}};
}

const ORD = ['1ra','2da','3ra'];

function unitPage(P,ctx){
  const wk = P.weeks.map(w=>{const b=+store.get('q:'+w.id)||0;return `<a class="ci" href="${ctx.href(w.id)}"><span class="c">${w.n}${b>=70?'<span class="star" title="Quiz aprobado">⭐</span>':''}</span><span class="lb">Semana ${w.n}</span><span class="sb">${w.title}</span></a>`}).join('');
  return {html:`<div class="crumbs"><a href="${ctx.href('index')}">Inicio</a> › <a href="${ctx.href('contenidos')}">Contenidos</a> › ${P.label}</div>
  <div class="grid g2" style="margin-bottom:6px"><div class="card"><h3 style="color:var(--accent)">🎯 Competencias de la unidad</h3><ul style="margin:0;padding-left:20px;color:var(--muted)">${P.goals.map(g=>`<li>${g}</li>`).join('')}</ul></div><div class="card"><h3 style="color:var(--accent)">🧩 Proyecto de la unidad</h3><p><b>${P.project.title}:</b> ${P.project.text}</p><br><a class="btn sm" href="${ctx.href(P.project.id)}">Ver proyecto →</a></div></div>
  <h2 class="section-title">📅 Semanas de trabajo</h2><div class="circles">${wk}</div>`,mount(){}};
}

function contentsPage(P,ctx){
  const S=ctx.site;
  return {html:`<div class="circles big">${S.units.map((u,i)=>`<a class="ci" href="${ctx.href(u.id)}"><span class="c">${i+1}</span><span class="lb">${ORD[i]} unidad</span><span class="sb">${u.name}</span></a>`).join('')}</div>
  <div class="grid g3" style="margin-top:36px">${S.units.map(u=>`<div class="card"><h3 style="color:var(--accent)">${u.label}</h3><p style="margin-bottom:8px;color:var(--ink)"><b>${u.name}</b></p><p>${u.desc}</p></div>`).join('')}</div>`,mount(){}};
}

function homePage(P,ctx){
  const S=ctx.site; const nWeeks=S.units.reduce((a,u)=>a+u.weeks.length,0);
  const uc=S.units.map((u,i)=>`<a class="ci" href="${ctx.href(u.id)}"><span class="c">${i+1}</span><span class="lb">${ORD[i]} unidad</span><span class="sb">${u.name}</span></a>`).join('');
  const pc=S.projects.map(p=>`<a class="ci" href="${ctx.href(p.id)}"><span class="c emo">${p.icon}</span><span class="lb">Proyecto ${p.n}</span><span class="sb">${p.short}</span></a>`).join('');
  return {html:`<div class="welcome"><h2>¡Bienvenidos a nuestro espacio digital de Reparación y Soporte Técnico!</h2><p>Aquí encontrarás las clases de cada semana, prácticas de taller, mini-juegos y quizzes para aprender a mantener, diagnosticar y dar soporte a computadoras y equipos de laboratorio.</p><hr></div>
  <div class="infos">
   <div class="info-c"><div class="c">🎯</div><h3>Propósito</h3><p>Formar técnicos responsables que cuiden los equipos, resuelvan fallas con método y atiendan a las personas con respeto.</p></div>
   <div class="info-c"><div class="c">🔧</div><h3>Competencias</h3><p>Hardware, BIOS, sistemas operativos, redes básicas, fallas de software, soporte remoto con AnyDesk y documentación técnica.</p></div>
   <div class="info-c"><div class="c">🤖</div><h3>Perfil del estudiante</h3><p>Curioso, ordenado y seguro en el taller; capaz de apoyar al laboratorio de robótica y a su comunidad educativa.</p></div>
  </div>
  <div class="stats"><div class="stat"><b>3</b><span>Unidades</span></div><div class="stat"><b>${nWeeks}</b><span>Semanas</span></div><div class="stat"><b>3</b><span>Proyectos</span></div><div class="stat"><b>${S.gamesCount}</b><span>Mini-juegos</span></div><div class="stat"><b>${nWeeks}</b><span>Quizzes</span></div></div>
  <h2 class="section-title">📚 Unidades de trabajo</h2><div class="circles big">${uc}</div>
  <h2 class="section-title">🧩 Proyectos</h2><div class="circles">${pc}</div>
  <h2 class="section-title">🧭 ¿Cómo usar este sitio?</h2>
  <div class="grid g4"><div class="card"><span class="ico">📖</span><h3>1. Lee</h3><p>Cada semana tiene su pestaña de contenido con objetivos, tablas, esquemas y video.</p></div><div class="card"><span class="ico">🛠️</span><h3>2. Practica</h3><p>Sigue la lista de pasos del taller y marca lo que ya hiciste.</p></div><div class="card"><span class="ico">🎮</span><h3>3. Juega</h3><p>Mini-juegos para reforzar: emparejar, ordenar, clasificar y más.</p></div><div class="card"><span class="ico">📝</span><h3>4. Evalúate</h3><p>Un quiz corto con retroalimentación inmediata. ¡Consigue la estrella ⭐!</p></div></div>
  <h2 class="section-title">🔧 Reglas de oro del taller</h2>
  <div class="grid g3"><div class="card"><span class="ico">🛡️</span><h3>Seguridad primero</h3><p>Equipo apagado y desconectado, pulsera antiestática y manos secas.</p></div><div class="card"><span class="ico">🧹</span><h3>Orden y limpieza</h3><p>Tornillos clasificados, mesa despejada y herramientas en su lugar al terminar.</p></div><div class="card"><span class="ico">📝</span><h3>Documenta todo</h3><p>Anota síntomas, pasos y resultados. Si no está escrito, no ocurrió.</p></div></div>`,mount(){}};
}

function gamesPage(P,ctx){
  const S=ctx.site;
  const list = S.units.map(u=>`<h3 style="margin-top:18px;color:${u.color}">${u.label} · ${u.name}</h3><div class="chips" style="margin-top:6px">${u.weeks.filter(w=>w.games.length).map(w=>ctx.mode==='site'?`<a class="btn line sm" href="${ctx.href(w.id)}#juego" style="font-family:inherit">S${w.n} · ${w.games.join(' · ')}</a>`:`<span class="btn line sm" style="font-family:inherit">S${w.n} · ${w.games.join(' · ')}</span>`).join('')}</div>`).join('');
  return {html:`<div class="note"><b class="t">🕹️ Retos extra</b>Estos juegos no pertenecen a una semana específica: úsalos como calentamiento o repaso antes de un examen.</div>${P.games.map(gameBlock).join('')}${ctx.mode==='site'?`<h2 class="section-title">🎯 Juegos por semana</h2>${list}`:''}`,mount(root){mountGames(root,P.games)}};
}

function glossaryPage(P,ctx){
  return {html:`<input class="search" id="gq" type="search" placeholder="🔎 Buscar término (ej. BIOS, RAM, ping…)" aria-label="Buscar"><div class="gl" id="gl">${P.terms.map(t=>`<div data-k="${(t[0]+' '+t[1]).toLowerCase()}"><b>${t[0]}</b><small>${t[2]}</small>${t[1]}</div>`).join('')}</div><p id="gn" style="display:none;color:var(--muted);text-align:center">No se encontró ese término.</p>`,mount(root){
    const q=$('#gq',root);q.addEventListener('input',()=>{const v=q.value.toLowerCase().trim();let n=0;$$('#gl div',root).forEach(d=>{const s=!v||d.dataset.k.includes(v);d.style.display=s?'':'none';if(s)n++});$('#gn',root).style.display=n?'none':'block'});
  }};
}

function projectsPage(P,ctx){
  return {html:`<div class="circles big">${P.projects.map(p=>`<a class="ci" href="${ctx.href(p.id)}"><span class="c emo">${p.icon}</span><span class="lb">Proyecto ${p.n}</span><span class="sb">${p.title}</span></a>`).join('')}</div>
  <div class="grid g3" style="margin-top:36px">${P.projects.map(p=>`<div class="card"><span class="tag">${p.unitLabel}</span><h3>${p.title}</h3><p>${p.summary}</p></div>`).join('')}</div>`,mount(){}};
}

const TYPES={contents:contentsPage,week:weekPage,project:projectPage,projects:projectsPage,unit:unitPage,home:homePage,games:gamesPage,glossary:glossaryPage};

/* ---------------- Marco del sitio ---------------- */
function navHTML(S,ctx,P){
  const on = (id,types)=>(P.id===id||P.parent===id||(types&&types.includes(P.type)))?' on':'';
  const items = [`<div class="item"><a class="top${on('index')}" href="${ctx.href('index')}">Inicio</a></div>`];
  items.push(`<div class="item"><a class="top${on('contenidos',['contents','unit','week'])}" href="${ctx.href('contenidos')}">Contenidos</a><div class="drop">${S.units.map((u,i)=>`<a class="${P.unitId===u.id||P.id===u.id?'on':''}" href="${ctx.href(u.id)}">${u.label} · ${u.name}</a>`).join('')}</div></div>`);
  items.push(`<div class="item"><a class="top${on('proyectos',['projects','project'])}" href="${ctx.href('proyectos')}">Proyectos</a><div class="drop">${S.projects.map(p=>`<a class="${P.id===p.id?'on':''}" href="${ctx.href(p.id)}">${p.icon} Proyecto ${p.n}: ${p.short}</a>`).join('')}</div></div>`);
  items.push(`<div class="item"><a class="top${on('juegos')}" href="${ctx.href('juegos')}">Juegos</a></div>`);
  items.push(`<div class="item"><a class="top${on('glosario')}" href="${ctx.href('glosario')}">Glosario</a></div>`);
  return items.join('');
}

function pagerHTML(P,ctx){
  if(P.type!=='week') return '';
  const u=ctx.site.units.find(x=>x.id===P.unitId), k=u.weeks.findIndex(w=>w.id===P.id);
  const prev=u.weeks[k-1], next=u.weeks[k+1];
  return `<div class="pager">${prev?`<a class="btn line" href="${ctx.href(prev.id)}">← Semana ${prev.n}</a>`:`<a class="btn line" href="${ctx.href(u.id)}">← ${u.label}</a>`}${next?`<a class="btn dark" href="${ctx.href(next.id)}">Semana ${next.n}: ${next.title} →</a>`:`<a class="btn dark" href="${ctx.href(u.id==='unidad-3'?'proyectos':ctx.site.units[ctx.site.units.indexOf(u)+1].id)}">Continuar →</a>`}</div>`;
}

function heroText(P){
  switch(P.type){
    case 'home': return {h:'Reparación y Soporte Técnico',it:true,tag:'5to Bachillerato · Computación · Robótica'};
    case 'week': return {h:'Semana '+P.n};
    case 'unit': return {h:ORD[P.unit-1]+' Unidad'};
    case 'contents': return {h:'Unidades'};
    case 'projects': return {h:'Proyectos'};
    case 'project': return {h:'Proyecto '+P.n};
    case 'games': return {h:'Zona de juegos'};
    default: return {h:P.title};
  }
}
function bandHTML(P,ctx){
  const sub = t=>`<p class="it" style="font-size:1rem;font-weight:400;margin-top:10px;opacity:.95">${t}</p>`;
  switch(P.type){
    case 'home': return `<section class="band"><div class="emblem">🛠️</div><div class="cta"><a class="btn white" href="${ctx.href('unidad-1')}">Comenzar Unidad 1 →</a><a class="btn ghost" href="${ctx.href('juegos')}">🎮 Zona de juegos</a></div></section>`;
    case 'week': return `<section class="band"><h2>${P.icon} ${P.title}</h2>${sub(P.summary)}</section>`;
    case 'project': return `<section class="band"><h2>${P.icon} ${P.title}</h2>${sub(P.summary)}</section>`;
    case 'unit': return `<section class="band"><p class="it">${P.heroTitle}</p>${sub(P.sub)}</section>`;
    case 'contents': return `<section class="band"><p class="it">¡Haz click en los íconos para ingresar a la unidad correspondiente!</p></section>`;
    default: return `<section class="band"><p class="it">${P.sub||''}</p></section>`;
  }
}

function render(P,site,mode){
  const ctx={site,mode,href:id=>id==='index'?'index.html':id+'.html'};
  const comp=TYPES[P.type](P,ctx);
  const app=document.getElementById('app');
  if(mode==='embed'){
    document.body.classList.add('embed');
    app.innerHTML=`<div class="wrap">${comp.html}</div>`;
    comp.mount(app); return;
  }
  const crumbs = P.type==='week'?`<div class="crumbs"><a href="${ctx.href('index')}">Inicio</a> › <a href="${ctx.href(P.unitId)}">${P.unitLabel}</a> › Semana ${P.n}</div>`:P.type==='project'?`<div class="crumbs"><a href="${ctx.href('index')}">Inicio</a> › <a href="${ctx.href('proyectos')}">Proyectos</a> › Proyecto ${P.n}</div>`:'';
  const ht=heroText(P);
  document.title = (P.type==='home'?'':P.title+' · ')+site.title;
  app.innerHTML=`<header class="site-header" id="hdr"><div class="in"><button class="burger" aria-label="Menú">☰</button><a class="brand" href="${ctx.href('index')}"><span class="logo">🛠️</span>${site.shortTitle}</a><nav class="nav">${navHTML(site,ctx,P)}</nav></div></header>
  <section class="hero${P.type==='home'?' tall':''}"><div class="in"><h1${ht.it?' class="it"':''}>${ht.h}</h1><span class="bar"></span>${ht.tag?`<p class="tag">${ht.tag}</p>`:''}</div></section>${bandHTML(P,ctx)}
  <main class="wrap">${crumbs}${comp.html}${pagerHTML(P,ctx)}</main>
  <footer class="site-footer"><a class="fb" href="${ctx.href('index')}">Página Principal</a><a class="fb" href="${ctx.href('contenidos')}">Unidades de Trabajo</a><small>${site.footer}</small></footer>`;
  const hdr=$('#hdr',app), nav=$('.nav',app);
  const sync=()=>hdr.classList.toggle('solid',window.scrollY>40||nav.classList.contains('open'));
  window.addEventListener('scroll',sync,{passive:true});
  $('.burger',app).addEventListener('click',()=>{nav.classList.toggle('open');sync()});
  sync();
  comp.mount(app);
}

window.RST={render};
})();
