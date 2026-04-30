/* Clock Out Crew — content.js v5 */
(() => {
  // Guard: prevent double-init on same page
  if (window.__cocLoaded) return;
  window.__cocLoaded = true;

  const BUILTIN_PETS = [
    { id:'kirby',      label:'Kirby',       file:'kirby.gif',      speed:1.4, px:true  },
    { id:'squidward',  label:'Squidward',   file:'squidward.gif',  speed:1.1, px:true  },
    { id:'blackcat',   label:'Black Cat',   file:'blackcat.gif',   speed:1.5, px:false },
    { id:'pikachu',    label:'Pikachu',     file:'pikachu.webp',   speed:2.0, px:true  },
    { id:'jumpcat',    label:'Jump Cat',    file:'jumpcat.webp',   speed:1.3, px:false },
    { id:'pingu',      label:'Pingu',       file:'pingu.gif',      speed:1.0, px:false },
    { id:'hellokitty', label:'Hello Kitty', file:'hellokitty.gif', speed:1.2, px:true  },
    { id:'kitten',     label:'Kitten',      file:'kitten.gif',     speed:1.2, px:false },
  ];

  const DEFAULTS = {
    offTime:'18:00', countdownEnabled:false,
    size:'medium', speedMult:1.0,
    activePets:['kirby','kitten'],
    petNames:{}, lang:'en',
    petColors:{},   // { petId: 'hue-rotate(120deg)' }
    customGifs:[],
    // Persisted positions: { petId: {x, y} }
    petPositions:{}
  };

  const I18N = {
    en:{
      idle:  ['...','zzz','(˘ω˘)','hey.','*yawn*','bored...'],
      click: ['hey!','ow!','pets~','snack pls','purr~','🐾','hands off!'],
      many:  ['clock out!!','done with work','going home','need coffee','5 more mins...'],
      soon:  ['almost there!','hang in!','u got this!','sooo close!'],
      greet: n=>[`hey! i'm ${n}!`,`${n} is here~`,`let's clock out!`,`working hard~`],
      freeze: n=>`${n} freeze!`,
      thaw:   n=>`${n} is moving!`,
      coffee: n=>[`☕ thanks ${n}!`,`mmm coffee ☕`,`exactly what i needed!`,`☕ best human ever!`],
      ctxFreeze:'🧊 얼음!', ctxThaw:'🔥 땡!', ctxBye:'👋 See ya later!', ctxCoffee:'☕ Coffee!',
      cdDone:'🎉 Clock out!',
      cdH:(h,m,s)=>`⏰ ${h}h ${m}m ${s}s`,
      cdM:(m,s)=>`⏰ ${m}m ${s}s`,
      cdS:s=>`🚀 ${s}s!!!`,
    },
    ko:{
      idle:  ['...','zzz','(˘ω˘)','뭐봐요?','하품~','심심해...'],
      click: ['야옹~','아야!','쓰담쓰담~','간식 줘요!','냥~','🐾','배 만지지 마요!'],
      many:  ['퇴근하자!!','일 하기 싫다','집 가고 싶다','커피 주세요','5분만 더...'],
      soon:  ['다 왔어요!','조금만 더!','화이팅!','거의 퇴근!'],
      greet: n=>[`안녕! 나는 ${n}이야~`,`${n} 등장!`,`퇴근하자!`,`열심히 일하는 중~`],
      freeze: n=>`${n} 얼음!`,
      thaw:   n=>`${n} 땡!`,
      coffee: n=>[`☕ 고마워 ${n}~!`,`커피 최고야 ☕`,`딱 필요했어!`,`☕ 역대급 인간!`],
      ctxFreeze:'🧊 얼음!', ctxThaw:'🔥 땡!', ctxBye:'👋 나중에 만나기', ctxCoffee:'☕ 커피 한잔',
      cdDone:'🎉 퇴근시간!',
      cdH:(h,m,s)=>`⏰ 퇴근까지 ${h}시간 ${m}분 ${s}초`,
      cdM:(m,s)=>`⏰ ${m}분 ${s}초`,
      cdS:s=>`🚀 ${s}초!!!`,
    }
  };

  const t = () => I18N[settings.lang] || I18N.en;
  let settings = { ...DEFAULTS };
  const BASE = chrome.runtime.getURL('images/');

  // ── Ensure layer exists (Google has strict DOM, use document.documentElement fallback) ──
  function ensureLayer() {
    let layer = document.getElementById('coc-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'coc-layer';
      layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;overflow:visible;';
      // Try body first, fall back to documentElement (Google sometimes has no body at load)
      (document.body || document.documentElement).appendChild(layer);
    }
    return layer;
  }

  let layer = ensureLayer();

  // Re-attach if Google's SPA navigation removed our layer
  const layerObserver = new MutationObserver(() => {
    if (!document.getElementById('coc-layer')) {
      layer = ensureLayer();
      // Re-render all pets into new layer
      for (const [,state] of pets) {
        layer.appendChild(state.wrapper);
      }
    }
  });
  layerObserver.observe(document.documentElement, { childList:true, subtree:false });

  const pets = new Map();
  const getPetName = def => (settings.petNames&&settings.petNames[def.id]) || def.label;
  const getPetColor = def => (settings.petColors&&settings.petColors[def.id]) || 'none';

  // ── Save positions to chrome.storage so they survive tab switches ──
  function savePositions() {
    const pos = {};
    for (const [id, state] of pets) {
      pos[id] = { x: Math.round(state.x), y: Math.round(state.y) };
    }
    chrome.storage.local.set({ petPositions: pos });
  }
  // Throttle saves to avoid hammering storage
  let posSaveTimer = null;
  const scheduleSavePositions = () => {
    clearTimeout(posSaveTimer);
    posSaveTimer = setTimeout(savePositions, 800);
  };

  // ── Fun effects ───────────────────────────────────────────────
  function spawnParticles(cx, cy, type) {
    const sets = {
      snow:   ['❄️','❄️','❄️','🧊','⛄'],
      heart:  ['🤍','💛','🧡','💗','✨'],
      coffee: ['☕','💨','✨','☕','💫'],
    };
    (sets[type]||sets.heart).forEach((emoji,i) => {
      const el = document.createElement('div');
      el.className = type==='snow' ? 'coc-snowflake' : 'coc-heart';
      el.textContent = emoji;
      el.style.left = (cx+(Math.random()-.5)*60)+'px';
      el.style.top  = (cy-10+(Math.random()-.5)*24)+'px';
      el.style.setProperty('--dur',(0.8+Math.random()*0.6)+'s');
      el.style.animationDelay=(i*70)+'ms';
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),1700);
    });
  }

  function triggerAnim(wrapper, cls, duration) {
    wrapper.classList.remove(cls); void wrapper.offsetWidth;
    wrapper.classList.add(cls);
    setTimeout(()=>wrapper.classList.remove(cls), duration);
  }

  function spawnSpeedlines(state) {
    if (Math.abs(state.velX) < 2) return;
    const rect = state.wrapper.getBoundingClientRect();
    const cx = rect.left+rect.width/2, cy = rect.top+rect.height*0.6;
    for (let i=0;i<3;i++) {
      const el = document.createElement('div');
      el.className = 'coc-speedline';
      el.style.left = (cx-(state.dir>0?30:-10)+(Math.random()-.5)*20)+'px';
      el.style.top  = (cy+(Math.random()-.5)*20)+'px';
      el.style.transform = state.dir<0?'scaleX(-1)':'';
      el.style.animationDelay=(i*80)+'ms';
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),500);
    }
  }

  // ── Context menu ─────────────────────────────────────────────
  let ctxMenu = null;
  const closeCtxMenu = () => { if (ctxMenu){ctxMenu.remove();ctxMenu=null;} };
  document.addEventListener('click', closeCtxMenu, true);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeCtxMenu(); });

  function showCtxMenu(e, state) {
    e.preventDefault(); e.stopPropagation();
    closeCtxMenu();
    const lang = t();
    const isFrozen = state.frozen;

    const menu = document.createElement('div');
    menu.className = 'coc-ctx-menu';

    const items = [
      {
        label: isFrozen ? lang.ctxThaw : lang.ctxFreeze,
        action: ()=>toggleFreeze(state)
      },
      {
        label: lang.ctxCoffee,
        action: ()=>giveCoffee(state, e.clientX, e.clientY)
      },
      {
        label: lang.ctxBye, cls:'bye',
        action: ()=>{ closeCtxMenu(); exitPet(state); }
      }
    ];

    items.forEach(item => {
      const el = document.createElement('div');
      el.className='coc-ctx-item'+(item.cls?` ${item.cls}`:'');
      el.textContent=item.label;
      el.addEventListener('click', ev=>{ ev.stopPropagation(); closeCtxMenu(); item.action(); });
      menu.appendChild(el);
    });

    document.body.appendChild(menu);
    const vw=window.innerWidth,vh=window.innerHeight;
    let cx=e.clientX,cy=e.clientY;
    const mw=menu.offsetWidth,mh=menu.offsetHeight;
    if(cx+mw>vw-8) cx=vw-mw-8;
    if(cy+mh>vh-8) cy=vh-mh-8;
    menu.style.left=cx+'px'; menu.style.top=cy+'px';
    ctxMenu=menu;
  }

  // ── Freeze / thaw ─────────────────────────────────────────────
  function toggleFreeze(state) {
    state.frozen = !state.frozen;
    const name = getPetName(state.petDef);
    if (state.frozen) {
      state.velX=0;
      state.wrapper.classList.add('frozen');
      clearTimeout(state.walkTimer); clearTimeout(state.idleTimer);
      showBubble(state, t().freeze(name));
      const burst=document.createElement('div');
      burst.className='coc-freeze-burst';
      state.wrapper.appendChild(burst);
      setTimeout(()=>burst.remove(),600);
      const rect=state.wrapper.getBoundingClientRect();
      spawnParticles(rect.left+rect.width/2, rect.top+rect.height/2,'snow');
    } else {
      state.wrapper.classList.remove('frozen');
      startWalk(state);
      showBubble(state, t().thaw(name));
      triggerAnim(state.wrapper,'bouncing',500);
    }
  }

  // ── Coffee ────────────────────────────────────────────────────
  function giveCoffee(state, cx, cy) {
    const name = getPetName(state.petDef);
    showBubble(state, rnd(t().coffee(name)));
    spawnParticles(cx, cy, 'coffee');
    triggerAnim(state.wrapper,'bouncing',500);
  }

  // ── Exit ──────────────────────────────────────────────────────
  function exitPet(state) {
    const id=state.petDef.id;
    state.wrapper.classList.add('exiting');
    setTimeout(()=>{
      removePet(id);
      chrome.storage.sync.get(DEFAULTS, s=>{
        const updated={...DEFAULTS,...s,activePets:(s.activePets||[]).filter(x=>x!==id)};
        chrome.storage.sync.set(updated);
        chrome.runtime.sendMessage({type:'UPDATE_SETTINGS',settings:updated}).catch(()=>{});
      });
    },500);
  }

  // ── Create pet ────────────────────────────────────────────────
  function createPet(petDef, savedPos) {
    if (pets.has(petDef.id)) return;

    const vw=window.innerWidth;
    const startX = savedPos ? savedPos.x : 60+Math.random()*(vw*0.65);
    const startY = savedPos ? savedPos.y : 0;

    const wrapper=document.createElement('div');
    wrapper.className='coc-pet spawning';
    setTimeout(()=>wrapper.classList.remove('spawning'),600);

    const closeBtn=document.createElement('button');
    closeBtn.className='coc-close'; closeBtn.textContent='✕';

    const above=document.createElement('div'); above.className='coc-above';
    const cd=document.createElement('div');    cd.className='coc-countdown';
    const bubble=document.createElement('div');bubble.className='coc-bubble';
    const nameEl=document.createElement('div');nameEl.className='coc-name';

    const img=document.createElement('img');
    img.className=`coc-img sz-${settings.size}${petDef.px?' px':''}`;
    img.draggable=false;
    img.src=petDef.dataUrl||(BASE+petDef.file);

    above.appendChild(cd); above.appendChild(bubble);
    wrapper.appendChild(closeBtn);
    wrapper.appendChild(above);
    wrapper.appendChild(nameEl);
    wrapper.appendChild(img);
    layer.appendChild(wrapper);

    wrapper.style.left  =startX+'px';
    wrapper.style.bottom=startY+'px';

    const state = {
      petDef, wrapper, img, bubble, cd, nameEl, closeBtn,
      x:startX, y:startY, velX:0, dir:Math.random()<.5?1:-1,
      isIdle:false, frozen:false,
      isDragging:false, dragStartX:0, dragStartY:0, dragPetX:0, dragPetY:0,
      idleTimer:null, walkTimer:null, bubbleTimer:null, cdInterval:null, speedLineTimer:null,
      clickCount:0, lastClick:0, lastTime:performance.now()
    };

    pets.set(petDef.id, state);
    applyPetSettings(state);
    if (!savedPos) startWalk(state); else {
      // Resume walking from saved position
      setTimeout(()=>startWalk(state), 500+Math.random()*500);
    }

    const name=getPetName(petDef);
    setTimeout(()=>showBubble(state,rnd(t().greet(name))),700+Math.random()*800);

    closeBtn.addEventListener('click',ev=>{ev.stopPropagation();exitPet(state);});
    wrapper.addEventListener('contextmenu',ev=>showCtxMenu(ev,state));

    wrapper.addEventListener('mousedown',ev=>{
      if(ev.target===closeBtn||ev.button!==0) return;
      state.isDragging=true;
      state.dragStartX=ev.clientX; state.dragStartY=ev.clientY;
      state.dragPetX=state.x;      state.dragPetY=state.y;
      ev.preventDefault();
    });

    wrapper.addEventListener('mouseup',ev=>{
      if(!state.isDragging||ev.button!==0) return;
      state.isDragging=false;
      const dx=Math.abs(ev.clientX-state.dragStartX);
      const dy=Math.abs(ev.clientY-state.dragStartY);
      if(dx<6&&dy<6) {
        const now=Date.now();
        state.clickCount=now-state.lastClick<400?state.clickCount+1:1;
        state.lastClick=now;
        const r=document.createElement('div'); r.className='coc-ripple';
        const rect=wrapper.getBoundingClientRect();
        r.style.left=(ev.clientX-rect.left)+'px'; r.style.top=(ev.clientY-rect.top)+'px';
        wrapper.appendChild(r); setTimeout(()=>r.remove(),520);
        spawnParticles(ev.clientX,ev.clientY,'heart');
        if(state.clickCount>=5){
          state.clickCount=0;
          triggerAnim(wrapper,'spinning',560);
          showBubble(state,rnd(t().many));
        } else {
          triggerAnim(wrapper,'bouncing',500);
          showBubble(state,rnd(t().click));
        }
      } else {
        // Finished drag — save new position
        scheduleSavePositions();
      }
    });
  }

  // ── Global drag ───────────────────────────────────────────────
  document.addEventListener('mousemove',ev=>{
    for(const[,state]of pets){
      if(!state.isDragging) continue;
      const vw=window.innerWidth,vh=window.innerHeight;
      const w=getPetW(),h=getSizeH();
      const nx=Math.max(-w*.3,Math.min(state.dragPetX+(ev.clientX-state.dragStartX),vw-w*.7));
      const dy=state.dragStartY-ev.clientY;
      const ny=Math.max(0,Math.min(state.dragPetY+dy,vh-h-4));
      state.x=nx; state.y=ny;
      state.wrapper.style.left  =nx+'px';
      state.wrapper.style.bottom=ny+'px';
    }
  });
  document.addEventListener('mouseup',ev=>{
    if(ev.button!==0) return;
    for(const[,state]of pets) state.isDragging=false;
  });

  // ── Remove pet ────────────────────────────────────────────────
  function removePet(id){
    const s=pets.get(id); if(!s) return;
    clearTimeout(s.idleTimer); clearTimeout(s.walkTimer);
    clearTimeout(s.bubbleTimer); clearInterval(s.cdInterval); clearInterval(s.speedLineTimer);
    s.wrapper.remove(); pets.delete(id);
  }

  // ── Apply settings ────────────────────────────────────────────
  function applyPetSettings(state){
    state.img.className=`coc-img sz-${settings.size}${state.petDef.px?' px':''}`;
    state.nameEl.textContent=getPetName(state.petDef);
    // Color filter — combine with frozen state
    const colorFilter=getPetColor(state.petDef);
    state.img.dataset.colorFilter=colorFilter;
    applyImgFilter(state);
    startCountdown(state);
  }

  function applyImgFilter(state){
    const col=state.img.dataset.colorFilter||'none';
    state.img.style.filter = col==='none'?'':col;
  }

  function syncPets(){
    const active=new Set(settings.activePets||[]);
    const allDefs=[
      ...BUILTIN_PETS,
      ...(settings.customGifs||[]).map(g=>({
        id:g.id,label:g.name.replace(/\.gif$/i,''),file:null,
        speed:1.4,px:false,dataUrl:g.dataUrl
      }))
    ];
    for(const[id]of pets)  if(!active.has(id)) removePet(id);
    // Load saved positions from local storage, then create
    chrome.storage.local.get({petPositions:{}},local=>{
      const savedPos=local.petPositions||{};
      for(const def of allDefs)
        if(active.has(def.id)&&!pets.has(def.id))
          createPet(def, savedPos[def.id]||null);
      for(const[,state]of pets) applyPetSettings(state);
    });
  }

  // ── Countdown ─────────────────────────────────────────────────
  function startCountdown(state){
    clearInterval(state.cdInterval);
    if(!settings.countdownEnabled){state.cd.style.display='none';return;}
    const tick=()=>{
      const now=new Date();
      const[hh,mm]=(settings.offTime||'18:00').split(':').map(Number);
      const off=new Date(now); off.setHours(hh,mm,0,0);
      if(off<=now){state.cd.textContent=t().cdDone;state.cd.style.display='block';return;}
      const diff=off-now;
      const h=Math.floor(diff/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);
      const ss=String(s).padStart(2,'0'),mm2=String(m).padStart(2,'0');
      state.cd.textContent=h>0?t().cdH(h,mm2,ss):m>0?t().cdM(mm2,ss):t().cdS(ss);
      state.cd.style.display='block';
    };
    tick(); state.cdInterval=setInterval(tick,1000);
  }

  // ── Bubble ────────────────────────────────────────────────────
  function showBubble(state,msg){
    clearTimeout(state.bubbleTimer);
    const b=state.bubble;
    b.textContent=msg; b.style.display='block'; b.style.opacity='1';
    b.style.animation='none'; void b.offsetWidth; b.style.animation='';
    state.bubbleTimer=setTimeout(()=>{
      b.style.transition='opacity .3s'; b.style.opacity='0';
      setTimeout(()=>{b.style.display='none';b.style.opacity='1';b.style.transition='';},300);
    },3000);
  }

  function rnd(arr){return arr[Math.floor(Math.random()*arr.length)];}
  const getSizeH=()=>settings.size==='small'?55:settings.size==='large'?105:75;
  const getPetW =()=>settings.size==='small'?55:settings.size==='large'?105:75;

  // ── Movement ──────────────────────────────────────────────────
  function getSpeed(state){
    return(state.petDef.speed||1.4)
      *(settings.size==='large'?.85:settings.size==='small'?1.15:1)
      *(parseFloat(settings.speedMult)||1.0);
  }
  const flip=state=>{state.img.style.transform=state.dir<0?'scaleX(-1)':'scaleX(1)';};

  function startWalk(state){
    if(state.frozen) return;
    state.isIdle=false; clearTimeout(state.idleTimer);
    state.velX=getSpeed(state)*state.dir;
    clearTimeout(state.walkTimer);
    state.walkTimer=setTimeout(()=>goIdle(state),3000+Math.random()*7000);
    flip(state);
    clearInterval(state.speedLineTimer);
    state.speedLineTimer=setInterval(()=>{
      if(!state.frozen&&!state.isIdle&&Math.abs(state.velX)>2) spawnSpeedlines(state);
    },200);
  }

  function goIdle(state){
    if(state.frozen) return;
    state.isIdle=true; state.velX=0;
    clearInterval(state.speedLineTimer);
    clearTimeout(state.idleTimer);
    state.idleTimer=setTimeout(()=>{
      if(state.frozen) return;
      if(Math.random()<.5) state.dir*=-1;
      startWalk(state);
      if(Math.random()<.25) showBubble(state,rnd(t().idle));
    },1500+Math.random()*3500);
  }

  // ── Animation loop ────────────────────────────────────────────
  function loop(time){
    for(const[,state]of pets){
      if(state.isIdle||state.isDragging||state.frozen){state.lastTime=time;continue;}
      const dt=Math.min((time-state.lastTime)/16.67,3);
      state.lastTime=time;
      state.x+=state.velX*dt;
      const vw=window.innerWidth,w=getPetW();
      if(state.x>vw-w+10){state.x=vw-w+10;state.dir=-1;goIdle(state);}
      else if(state.x<-10){state.x=-10;state.dir=1;goIdle(state);}
      state.wrapper.style.left=state.x+'px';
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ── Periodic messages ─────────────────────────────────────────
  setInterval(()=>{
    for(const[,state]of pets){
      if(state.frozen) continue;
      if(Math.random()<.18){
        const pool=[...t().idle];
        if(settings.countdownEnabled) pool.push(...t().soon);
        showBubble(state,rnd(pool));
      }
    }
  },14000);

  // ── Settings listener ─────────────────────────────────────────
  chrome.runtime.onMessage.addListener(msg=>{
    if(msg.type==='UPDATE_SETTINGS'){
      settings={...DEFAULTS,...msg.settings};
      syncPets();
    }
  });

  // ── Boot ──────────────────────────────────────────────────────
  chrome.storage.sync.get(DEFAULTS,saved=>{
    settings={...DEFAULTS,...saved};
    syncPets();
  });
})();
