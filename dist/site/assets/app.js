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
const NOTE = {tip:['','Dato útil'],warn:['warn','Cuidado'],safe:['safe','Seguridad'],bad:['bad','Error común']};

/* ---------------- QUIZ ---------------- */
function quiz(el, items, opt={}){
  let i=0, score=0;
  const order = shuffle(items.map((_,k)=>k));
  function show(){
    if(i>=items.length) return end();
    const it = items[order[i]];
    const opts = shuffle(it.o.map((t,k)=>({t,k})));
    el.innerHTML = `<div class="quiz-box">
      <div class="q-top"><span>${opt.label||'Pregunta'} ${i+1} de ${items.length}</span><span>${score} acierto${score===1?'':'s'}</span></div>
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
      w.innerHTML = (good?'<b>¡Correcto!</b> ':'<b>No exactamente.</b> ')+(it.why||'');
      w.classList.add('on');
      $('.next',el).style.display='inline-flex';
    }));
    $('.next',el).addEventListener('click',()=>{i++;show()});
  }
  function end(){
    const pct = Math.round(score/items.length*100);
    const [medal,msg] = pct===100?['','¡Perfecto! Dominas el tema.']:pct>=70?['','¡Muy bien! Estás listo para la práctica.']:pct>=50?['','Vas bien, repasa los puntos que fallaste.']:['','Repasa el contenido y vuelve a intentarlo.'];
    if(opt.key){const prev=+store.get('q:'+opt.key)||0; if(pct>prev) store.set('q:'+opt.key,pct)}
    el.innerHTML = `<div class="quiz-box result"><div class="score">${score}/${items.length}</div><p><b>${pct}%</b> · ${msg}</p><button class="btn dark">Intentar de nuevo</button></div>`;
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
      if(ok===g.pairs.length) $('.fin',el).innerHTML='<b>¡Completado!</b> '+(tries===ok?'Sin errores ':'Con '+(tries-ok)+' error(es).');
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
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px"><button class="btn dark sm chk">Comprobar orden</button><button class="btn line sm mx">Mezclar</button></div><div class="stat-row"><span class="fin"></span></div>`;
    $$('.mv button',el).forEach(b=>b.addEventListener('click',()=>{
      const k=+b.dataset.k, d=+b.dataset.d, j=k+d; if(j<0||j>=arr.length) return;
      [arr[k],arr[j]]=[arr[j],arr[k]]; draw();
    }));
    $('.chk',el).addEventListener('click',()=>{
      draw(true);
      const good = arr.filter((x,k)=>x.i===k).length;
      $('.fin',el).innerHTML = good===arr.length?'<b>¡Orden correcto!</b>':`Vas ${good} de ${arr.length} en su lugar. Los rojos están mal ubicados.`;
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
      el.innerHTML=`<div class="result"><div class="score">${score}/${q.length}</div><p>${score===q.length?'¡Clasificación perfecta!':'Repasa las categorías y vuelve a intentarlo.'}</p><button class="btn dark">Jugar otra vez</button></div>`;
      $('.btn',el).addEventListener('click',start); return;
    }
    el.innerHTML=`<div class="stat-row" style="margin:0 0 6px"><span>Elemento <b>${i+1}</b>/${q.length}</span><span>Aciertos: <b>${score}</b></span></div>
      <div class="cls-card">${q[i][0]}</div><div class="cls-opts">${g.cats.map((c,k)=>`<button class="btn dark" data-k="${k}">${c}</button>`).join('')}</div><div class="stat-row"><span class="fb"></span></div>`;
    $$('.cls-opts button',el).forEach(b=>b.addEventListener('click',()=>{
      if(busy) return; busy=true;
      const good=+b.dataset.k===q[i][1], card=$('.cls-card',el);
      card.classList.add(good?'flash-ok':'flash-bad');
      if(good) score++;
      $('.fb',el).innerHTML = good?'¡Correcto!':`Era: <b>${g.cats[q[i][1]]}</b>${q[i][2]?' — '+q[i][2]:''}`;
      setTimeout(()=>{i++;busy=false;show()}, good?650:1900);
    }));
  }
  start();
}

/* ---------------- MEMORIA ---------------- */
function flip(el,g){
  const cards = shuffle(g.pairs.flatMap((p,i)=>[{t:p[0],i,id:i+'a'},{t:p[1],i,id:i+'b'}]));
  let open=[], done=0, moves=0, lock=false;
  el.innerHTML = `<div class="memory">${cards.map((c,k)=>`<button class="mem" data-k="${k}"><div class="in"><div class="f">?</div><div class="b">${c.t}</div></div></button>`).join('')}</div><div class="stat-row"><span>Parejas: <b class="dn">0</b>/${g.pairs.length}</span><span>Movimientos: <b class="mv">0</b></span><span class="fin"></span></div>`;
  $$('.mem',el).forEach(b=>b.addEventListener('click',()=>{
    if(lock||b.classList.contains('flip')||b.classList.contains('done')) return;
    b.classList.add('flip'); open.push(b);
    if(open.length===2){
      moves++; $('.mv',el).textContent=moves; lock=true;
      const [a,c]=open.map(x=>cards[+x.dataset.k]);
      setTimeout(()=>{
        if(a.i===c.i){open.forEach(x=>{x.classList.remove('flip');x.classList.add('done')});done++;$('.dn',el).textContent=done;
          if(done===g.pairs.length) $('.fin',el).innerHTML='<b>¡Lo lograste!</b> en '+moves+' movimientos.'}
        else open.forEach(x=>x.classList.remove('flip'));
        open=[];lock=false;
      },a.i===c.i?350:900);
    }
  }));
}

/* ---------------- TERMINAL SIMULADA ---------------- */
function terminal(el,g){
  const keys = Object.keys(g.cmds);
  el.innerHTML = `${g.task?`<div class="note"><b class="t">Reto</b>${g.task}</div>`:''}
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
  el.innerHTML = `<div class="hot"><div>${svg}</div><div class="info"><h4>Toca una pieza</h4><p>Selecciona cualquier componente del diagrama para ver qué hace y cómo reconocerlo.</p></div></div>
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
  return `<div class="game"><div class="game-head"><h3>${g.title}</h3></div>${g.hint?`<div class="hint">${g.hint}</div>`:''}<div class="gbody" data-type="${g.type}"></div></div>`;
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
  if(v.id) return `<h3 class="section-title" style="margin-top:8px">Video recomendado</h3><div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${v.id}" title="${v.title||'Video'}" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div><p style="font-size:.88rem;color:var(--muted)">${v.title||''} · <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">Abrir en YouTube </a></p>`;
  return `<h3 class="section-title" style="margin-top:8px">Video sugerido</h3><div class="videoalt"><div class="pl">&#9654;&#xFE0E;</div><div><b>${v.title||'Busca un video de apoyo'}</b><br><span style="color:var(--muted);font-size:.9rem">Reemplaza este recuadro por el video que elijas (ver README) o <a href="${q}" target="_blank" rel="noopener">búscalo en YouTube </a></span></div></div>`;
}
function checklistHTML(items,key){
  return `<div class="progress"><i></i></div><ul class="check" data-key="${key}">${items.map((t,k)=>`<li data-k="${k}"><input type="checkbox"><span>${t}</span></li>`).join('')}</ul><div class="stat-row"><span class="cnt"></span></div>`;
}
function mountChecklists(root){
  $$('ul.check',root).forEach(ul=>{
    const key='c:'+ul.dataset.key; let saved=[]; try{saved=JSON.parse(store.get(key)||'[]')}catch(e){}
    const lis=$$('li',ul), bar=ul.previousElementSibling.firstElementChild, cnt=ul.nextElementSibling.firstElementChild;
    const upd=()=>{const n=lis.filter(l=>l.classList.contains('done')).length;bar.style.width=(n/lis.length*100)+'%';cnt.innerHTML=`Completado: <b>${n}</b> de ${lis.length}`+(n===lis.length?' ':'');store.set(key,JSON.stringify(lis.map((l,k)=>l.classList.contains('done')?k:-1).filter(k=>k>=0)))};
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
  const tabs = [['contenido','Contenido']];
  tabs.push(['practica','Práctica']);
  if(P.games&&P.games.length) tabs.push(['juego','Mini-juego'+(P.games.length>1?'s':'')]);
  if(P.quiz&&P.quiz.length) tabs.push(['quiz','Quiz']);
  const pr = P.practice;
  let h = `<div style="--c:${col}">`;
  if(ctx.mode==='embed') h+=`<div class="week-head"><div><span class="badge">${P.unitLabel} · Semana ${P.n}</span><h2>${P.title}</h2><p>${P.summary}</p></div></div>`;
  h+=`<div class="tabs" role="tablist">${tabs.map((t,k)=>`<button data-t="${t[0]}" class="${k?'':'on'}">${t[1]}</button>`).join('')}</div>`;
  h+=`<div class="pane on" data-p="contenido"><div class="objectives"><h4>Al terminar esta semana podrás…</h4><ul>${P.objectives.map(o=>`<li>${o}</li>`).join('')}</ul></div>${P.sections.map(sectionHTML).join('')}${videoHTML(P.video)}</div>`;
  h+=`<div class="pane" data-p="practica"><div class="sec"><h3><span class="dot"></span>${pr.title}</h3><div class="meta"><span>Duración: ${pr.time}</span>${pr.materials?`<span>Materiales: ${pr.materials}</span>`:''}${pr.mode?`<span>Modalidad: ${pr.mode}</span>`:''}</div>${pr.intro?`<p>${pr.intro}</p>`:''}${checklistHTML(pr.steps,P.id)}${pr.deliver?`<div class="note safe"><b class="t">Entregable</b>${pr.deliver}</div>`:''}</div></div>`;
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
  ${ctx.mode==='embed'?`<div class="week-head"><div><span class="badge">Proyecto ${P.n} · ${P.unitLabel}</span><h2>${P.title}</h2><p>${P.summary}</p></div></div>`:''}
  <div class="sec"><h3><span class="dot"></span>El reto</h3>${P.intro.map(p=>`<p>${p}</p>`).join('')}<div class="kv">${P.facts.map(f=>`<div><b>${f[0]}</b><span>${f[1]}</span></div>`).join('')}</div></div>
  <div class="sec"><h3><span class="dot"></span>Entregables</h3><ul>${P.deliverables.map(d=>`<li>${d}</li>`).join('')}</ul></div>
  <div class="sec"><h3><span class="dot"></span>Cronograma</h3>${P.phases.map(p=>`<div class="phase"><b>${p[0]}</b><div><b style="all:unset;font-weight:600;color:var(--brand)">${p[1]}</b><br><span style="color:var(--muted);font-size:.93rem">${p[2]}</span></div></div>`).join('')}</div>
  <div class="sec"><h3><span class="dot"></span>Lista de avance</h3><p style="color:var(--muted);font-size:.92rem">Marca lo que ya hiciste (se guarda en este navegador).</p>${checklistHTML(P.checklist,P.id)}</div>
  <div class="sec"><h3><span class="dot"></span>Rúbrica (100 pts)</h3><div class="tblwrap"><table class="rubric"><thead><tr>${['Criterio','Excelente','Bien','Por mejorar','Pts'].map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${P.rubric.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${P.note?`<div class="note"><b class="t">Consejo</b>${P.note}</div>`:''}</div></div>`;
  return {html:h,mount(root){mountChecklists(root)}};
}

const ORD = ['1ra','2da','3ra'];

function unitPage(P,ctx){
  const rows = P.weeks.map(w=>`<div class="wk"><a class="c" href="${ctx.href(w.id)}" aria-label="Semana ${w.n}">${w.n}</a><div class="wk-r"><div class="wh" role="button" tabindex="0"><h2>Semana ${w.n}</h2><span class="chev"></span></div><hr><div class="wb"><p><a href="${ctx.href(w.id)}"><b>${w.title}</b></a></p><p>${w.summary}</p></div></div></div>`).join('');
  return {html:`<div class="wklist">${rows}</div>`,mount(root){
    $$('.wh',root).forEach(wh=>{const wb=wh.parentElement.querySelector('.wb');const tg=()=>{wb.classList.toggle('open');wh.classList.toggle('open')};wh.addEventListener('click',tg);wh.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tg()}})});
  }};
}

function contentsPage(P,ctx){
  const S=ctx.site;
  return {html:`<div class="circles big">${S.units.map((u,i)=>`<a class="ci" href="${ctx.href(u.id)}"><span class="c">${i+1}</span><span class="lb">${ORD[i]} unidad</span></a>`).join('')}</div>`,mount(){}};
}

const SVG_TELESCOPE = '<svg viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(-32 50 42)"><rect x="22" y="32" width="56" height="16" rx="3"/><rect x="10" y="29" width="12" height="22" rx="3"/><rect x="78" y="28" width="9" height="24" rx="3"/></g><rect x="44" y="50" width="12" height="9" rx="1"/><path d="M50 59 L40 92 M50 59 L50 92 M50 59 L60 92"/></svg>';
const SVG_STAR = '<svg viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"><polygon points="50,11 61,38 90,38 67,56 76,86 50,68 24,86 33,56 10,38 39,38"/></svg>';
const SVG_PEOPLE = '<svg viewBox="0 0 120 120" fill="none" stroke="#30343f" stroke-width="12" stroke-linejoin="round"><circle cx="78" cy="34" r="18"/><path d="M48 92 V86 a30 30 0 0 1 60 0 V92 Z"/><circle cx="40" cy="62" r="16"/><path d="M12 112 V106 a28 28 0 0 1 56 0 V112 Z"/></svg>';

function homePage(P,ctx){
  return {html:`<section class="welcome"><div class="wh" role="button" tabindex="0"><h2>¡Bienvenidos a nuestro espacio digital educativo!</h2><span class="chev"></span></div><hr><div class="wb"><p>Aquí encontrarás los contenidos de cada semana, las prácticas de taller, los proyectos de cada unidad y actividades para repasar.</p></div></section>
  <section class="vm">
    <div class="vm-i"><div class="c">${SVG_TELESCOPE}</div><h3>Visión</h3><p>Ser la red de instituciones educativas líder en el oriente del país en innovación de estrategias de enseñanza-aprendizaje, cuyos egresados se desenvuelven con pensamiento crítico, autonomía y habilidad para trabajar en equipo.</p></div>
    <div class="vm-i"><div class="c">${SVG_STAR}</div><h3>Misión</h3><p>Formar estudiantes éticos, autónomos, emprendedores y líderes a través de la tecnología, la experimentación y la investigación científica.</p><p>Nuestros profesores están acreditados para facilitar el aprendizaje por medio de metodologías no tradicionales de tendencia mundial.</p></div>
  </section>
  <section class="perfil"><h2>Perfil del Estudiante</h2><p>Liceo TEC ha desarrollado para los estudiantes egresados un perfil acorde con nuestra filosofía y con las habilidades que demanda un mundo globalizado:</p><hr>
    <div class="perfil-g"><ul class="sq">
      <li>Es autónomo, actúa con iniciativa, gestiona su propio tiempo y aprendizaje.</li>
      <li>Posee habilidades tecnológicas requeridas para desarrollarse en un contexto competitivo y cambiante.</li>
      <li>Desarrolla el pensamiento crítico, útil en la resolución de conflictos y la toma de decisiones, y posee habilidades de liderazgo y para el trabajo en equipo.</li>
      <li>Diagnostica y resuelve fallas de hardware y software aplicando un método ordenado.</li>
      <li>Trabaja con seguridad, orden y limpieza al manipular equipo de cómputo.</li>
      <li>Brinda soporte técnico, presencial y remoto, con respeto y claridad hacia el usuario.</li>
      <li>Documenta su trabajo con bitácoras, tickets e informes técnicos.</li>
    </ul><div class="pi">${SVG_PEOPLE}</div></div></section>`,
  mount(root){
    const wh=$('.wh',root), wb=$('.wb',root);
    const tg=()=>{wb.classList.toggle('open');wh.classList.toggle('open')};
    wh.addEventListener('click',tg);
    wh.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tg()}});
  }};
}

function gamesPage(P,ctx){
  const S=ctx.site;
  const list = S.units.map(u=>`<h3 style="margin-top:18px;color:${u.color}">${u.label} · ${u.name}</h3><div class="chips" style="margin-top:6px">${u.weeks.filter(w=>w.games.length).map(w=>ctx.mode==='site'?`<a class="btn line sm" href="${ctx.href(w.id)}#juego" style="font-family:inherit">S${w.n} · ${w.games.join(' · ')}</a>`:`<span class="btn line sm" style="font-family:inherit">S${w.n} · ${w.games.join(' · ')}</span>`).join('')}</div>`).join('');
  return {html:`<div class="note"><b class="t">Retos extra</b>Estos juegos no pertenecen a una semana específica: úsalos como calentamiento o repaso antes de un examen.</div>${P.games.map(gameBlock).join('')}${ctx.mode==='site'?`<h2 class="section-title">Juegos por semana</h2>${list}`:''}`,mount(root){mountGames(root,P.games)}};
}

function glossaryPage(P,ctx){
  return {html:`<input class="search" id="gq" type="search" placeholder="Buscar término (ej. BIOS, RAM, ping…)" aria-label="Buscar"><div class="gl" id="gl">${P.terms.map(t=>`<div data-k="${(t[0]+' '+t[1]).toLowerCase()}"><b>${t[0]}</b><small>${t[2]}</small>${t[1]}</div>`).join('')}</div><p id="gn" style="display:none;color:var(--muted);text-align:center">No se encontró ese término.</p>`,mount(root){
    const q=$('#gq',root);q.addEventListener('input',()=>{const v=q.value.toLowerCase().trim();let n=0;$$('#gl div',root).forEach(d=>{const s=!v||d.dataset.k.includes(v);d.style.display=s?'':'none';if(s)n++});$('#gn',root).style.display=n?'none':'block'});
  }};
}

function projectsPage(P,ctx){
  return {html:`<div class="circles big">${P.projects.map(p=>`<a class="ci" href="${ctx.href(p.id)}"><span class="c">${p.n}</span><span class="lb">Proyecto ${p.n}</span><span class="sb">${p.title}</span></a>`).join('')}</div>`,mount(){}};
}

const TYPES={contents:contentsPage,week:weekPage,project:projectPage,projects:projectsPage,unit:unitPage,home:homePage,games:gamesPage,glossary:glossaryPage};

/* ---------------- Marco del sitio ---------------- */
function navHTML(S,ctx,P){
  const on = (id,types)=>(P.id===id||P.parent===id||(types&&types.includes(P.type)))?' on':'';
  const items = [`<div class="item"><a class="top${on('index')}" href="${ctx.href('index')}">Inicio</a></div>`];
  items.push(`<div class="item has"><a class="top${on('contenidos',['contents','unit','week'])}" href="${ctx.href('contenidos')}">Contenidos</a><div class="drop">${S.units.map(u=>`<a class="${P.unitId===u.id||P.id===u.id?'on':''}" href="${ctx.href(u.id)}">${u.label}</a>`).join('')}</div></div>`);
  items.push(`<div class="item has"><a class="top${on('proyectos',['projects','project'])}" href="${ctx.href('proyectos')}">Proyectos</a><div class="drop">${S.projects.map(p=>`<a class="${P.id===p.id?'on':''}" href="${ctx.href(p.id)}">Proyecto ${p.n}</a>`).join('')}</div></div>`);
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
    case 'home': return {h:'Reparación y Soporte Técnico',it:true,tag:'EduTEC'};
    case 'week': return {h:'Semana '+P.n};
    case 'unit': return {h:'Semanas de Trabajo',it:true};
    case 'contents': return {h:'Unidades',it:true};
    case 'projects': return {h:'Proyectos',it:true};
    case 'project': return {h:'Proyecto '+P.n};
    case 'games': return {h:'Zona de juegos'};
    default: return {h:P.title};
  }
}
let LOGO_SRC=null;
function logoImg(cls,fallback){
  if(!LOGO_SRC) return fallback.includes('remove')?'':'<div class="wordmark">LICEO TEC</div>';
  return `<img class="${cls}" src="${LOGO_SRC}" alt="Liceo TEC" onerror="${fallback}">`;
}
function bandHTML(P,ctx){
  switch(P.type){
    case 'home': return `<section class="band logo-band">${logoImg('band-logo',"this.outerHTML='<div class=&quot;wordmark&quot;>LICEO TEC</div>'")}</section>`;
    case 'week': case 'project': return `<section class="band"><h2>${P.title}</h2></section>`;
    case 'unit': return `<section class="band"><p class="it">¡Haz click en los íconos para ingresar a cada sesión de clases!</p></section>`;
    case 'contents': return `<section class="band"><p class="it">¡Haz click en los íconos para ingresar a la unidad correspondiente!</p></section>`;
    case 'projects': return `<section class="band"><p class="it">¡Haz click en los íconos para ingresar al proyecto correspondiente!</p></section>`;
    default: return `<section class="band"><h2>${P.title}</h2></section>`;
  }
}

function render(P,site,mode){
  const ctx={site,mode,href:id=>id==='index'?'index.html':id+'.html'};
  LOGO_SRC=site.logo||null;
  const comp=TYPES[P.type](P,ctx);
  const app=document.getElementById('app');
  if(mode==='embed'){
    document.body.classList.add('embed');
    app.innerHTML=`<div class="wrap">${comp.html}</div>`;
    comp.mount(app); return;
  }
  const ht=heroText(P);
  document.title = (P.type==='home'?'':P.title+' · ')+site.title;
  app.innerHTML=`<header class="site-header" id="hdr"><div class="in"><button class="burger" aria-label="Menú"><span></span><span></span><span></span></button><a class="brand" href="${ctx.href('index')}">${logoImg('hd-logo',"this.remove()")}<span>${site.shortTitle}</span></a><nav class="nav">${navHTML(site,ctx,P)}</nav></div></header>
  <section class="hero"><div class="in"><h1${ht.it?' class="it"':''}>${ht.h}</h1><span class="bar"></span>${ht.tag?`<p class="tag">${ht.tag}</p>`:''}</div></section>${bandHTML(P,ctx)}
  <main class="wrap${P.type==='home'?' home':''}">${comp.html}</main>
  <footer class="site-footer"><div class="fbs"><a class="fb" href="${ctx.href('index')}">Página Principal</a><a class="fb" href="${ctx.href('contenidos')}">Unidades de Trabajo</a></div></footer>`;
  const hdr=$('#hdr',app), nav=$('.nav',app);
  const sync=()=>hdr.classList.toggle('solid',window.scrollY>40||nav.classList.contains('open'));
  window.addEventListener('scroll',sync,{passive:true});
  $('.burger',app).addEventListener('click',()=>{nav.classList.toggle('open');sync()});
  sync();
  comp.mount(app);
}

window.RST={render};
})();
