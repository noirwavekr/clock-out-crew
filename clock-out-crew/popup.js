// popup.js — Clock Out Crew v6

const BUILTIN_PETS = [
  { id:'kirby',      label:'Kirby',       file:'kirby.gif',      px:true  },
  { id:'squidward',  label:'Squidward',   file:'squidward.gif',  px:true  },
  { id:'blackcat',   label:'Black Cat',   file:'blackcat.gif',   px:false },
  { id:'pikachu',    label:'Pikachu',     file:'pikachu.webp',   px:true  },
  { id:'jumpcat',    label:'Jump Cat',    file:'jumpcat.webp',   px:false },
  { id:'pingu',      label:'Pingu',       file:'pingu.gif',      px:false },
  { id:'hellokitty', label:'Hello Kitty', file:'hellokitty.gif', px:true  },
  { id:'kitten',     label:'Kitten',      file:'kitten.gif',     px:false },
];

// ── Theme color presets ──────────────────────────────────────
// Each theme defines: accent (buttons/badges), bg (popup bg), header gradient
const THEMES = [
  { id:'orange', labelKo:'🍊 오렌지', labelEn:'🍊 Orange', accent:'#ff7b35', accentL:'#ff9a56', bg:'#fef9f0', bd:'#ffe4c4', hdr:'135deg,#ff9a56,#ffb347,#ffd700', tx:'#3d2b1f', sub:'#5a3e35' },
  { id:'rose',   labelKo:'🌸 로즈',   labelEn:'🌸 Rose',   accent:'#e0406a', accentL:'#f0607a', bg:'#fff5f7', bd:'#ffd0da', hdr:'135deg,#f0607a,#e07090,#f5a0b0', tx:'#3a1520', sub:'#6a2535' },
  { id:'sky',    labelKo:'🩵 스카이', labelEn:'🩵 Sky',    accent:'#2b8fff', accentL:'#56aaff', bg:'#f0f7ff', bd:'#c4ddff', hdr:'135deg,#4499ff,#56aaff,#88ccff', tx:'#0d2b50', sub:'#1a4070' },
  { id:'mint',   labelKo:'🌿 민트',   labelEn:'🌿 Mint',   accent:'#1daa80', accentL:'#2ecf99', bg:'#f0fdf8', bd:'#b8edd8', hdr:'135deg,#2ecf99,#30b890,#5ddcb0', tx:'#0d3020', sub:'#155040' },
  { id:'purple', labelKo:'💜 퍼플',   labelEn:'💜 Purple', accent:'#7c3aed', accentL:'#9d5ff5', bg:'#f8f4ff', bd:'#ddd0ff', hdr:'135deg,#9d5ff5,#7c3aed,#b890ff', tx:'#20103a', sub:'#3a1870' },
  { id:'dark',   labelKo:'🖤 다크',   labelEn:'🖤 Dark',   accent:'#e0a030', accentL:'#f0b840', bg:'#1a1a1a',  bd:'#333',    hdr:'135deg,#2a2a2a,#1a1a1a,#333',    tx:'#f0e8d0', sub:'#b0a080' },
  { id:'pink',   labelKo:'🩷 핑크',   labelEn:'🩷 Pink',   accent:'#d946a8', accentL:'#f060c0', bg:'#fff0fa', bd:'#ffd0f0', hdr:'135deg,#f060c0,#d946a8,#ff88d0', tx:'#3a0a28', sub:'#7a2060' },
  { id:'lemon',  labelKo:'🍋 레몬',   labelEn:'🍋 Lemon',  accent:'#c4900a', accentL:'#e8b020', bg:'#fffdf0', bd:'#ffedb0', hdr:'135deg,#e8cc30,#e8b020,#ffe060', tx:'#2a1e00', sub:'#5a3e00' },
];

const DEFAULTS = {
  offTime:'18:00', countdownEnabled:true,
  size:'medium', speedMult:1.0,
  activePets:['kirby','kitten'],
  petNames:{}, lang:'en',
  themeId:'orange',
  crewVisible:true, customGifs:[]
};

const UI = {
  en:{
    pick:'🐾 Pick your crew (multi-select)',
    petnames:'✏️ Pet nicknames',
    petname_ph:lbl=>`${lbl}'s nickname`,
    themeTitle:'🎨 Theme Color',
    custom:'🖼️ Custom GIF',
    uploadMain:'Click or drag a GIF to add', uploadSub:'Max 5 · GIF only',
    noGif:'No custom GIFs yet 🐾',
    countdown:'⏰ Clock-out Countdown',
    enable:'Enable countdown', time:'Clock-out time',
    size:'📐 Size', speedTitle:'🏃 Speed',
    slow:'Slow', normal:'Normal', fast:'Fast',
    show:'Show crew on page',
    save:'Save & deploy the crew 🚀', saved:'✅ Crew deployed!',
    tip:'💡 Drag pets · Right-click → Freeze / Unfreeze / ☕',
    googleNote:'⚠️ Google homepage (google.com) is a special Chrome page — pets appear on all other sites!',
  },
  ko:{
    pick:'🐾 크루 선택 (여러 개 가능)',
    petnames:'✏️ 펫 닉네임',
    petname_ph:lbl=>`${lbl} 닉네임`,
    themeTitle:'🎨 테마 컬러',
    custom:'🖼️ 커스텀 GIF',
    uploadMain:'GIF 클릭하거나 드래그해서 추가', uploadSub:'최대 5개 · GIF만 가능',
    noGif:'아직 추가된 GIF가 없어요 🐾',
    countdown:'⏰ 퇴근 카운트다운',
    enable:'카운트다운 활성화', time:'퇴근 시간',
    size:'📐 크기', speedTitle:'🏃 이동 속도',
    slow:'느리게', normal:'보통', fast:'빠르게',
    show:'화면에 크루 표시',
    save:'저장하고 크루 배치 🚀', saved:'✅ 크루 배치 완료!',
    tip:'💡 드래그로 이동 · 우클릭 → 얼음 / 땡 / ☕',
    googleNote:'⚠️ 구글 홈페이지(google.com)는 크롬 특수 페이지라 펫이 안 뜹니다. 다른 모든 사이트에서는 정상 작동해요!',
  }
};

const BASE = chrome.runtime.getURL('images/');
let settings   = { ...DEFAULTS };
let customGifs = [];
let currentLang  = 'en';
let currentTheme = THEMES[0];
let petNamesLocal = {};

// ── Apply CSS variables for theme ─────────────────────────────
function applyTheme(theme) {
  currentTheme = theme;
  const r = document.documentElement.style;
  r.setProperty('--or',    theme.accent);
  r.setProperty('--orl',   theme.accentL);
  r.setProperty('--bg',    theme.bg);
  r.setProperty('--bd',    theme.bd);
  r.setProperty('--tx',    theme.tx);
  r.setProperty('--sub',   theme.sub);
  // Header gradient
  document.querySelector('.hdr').style.background = `linear-gradient(${theme.hdr})`;
  // Mark active swatch
  document.querySelectorAll('.theme-swatch').forEach(sw =>
    sw.classList.toggle('on', sw.dataset.id === theme.id));
  settings.themeId = theme.id;
}

// Call after lang switch to refresh theme labels
function refreshThemeLabels() {
  document.querySelectorAll('.theme-lbl').forEach(lbl => {
    const theme = THEMES.find(t => t.id === lbl.dataset.themeId);
    if (!theme) return;
    const raw = currentLang === 'ko' ? theme.labelKo : theme.labelEn;
    lbl.textContent = raw.split(' ').slice(1).join(' ') || raw;
  });
}

// ── i18n ─────────────────────────────────────────────────────
function applyUILang(lang) {
  currentLang = lang;
  const u = UI[lang]||UI.en;
  const set = (id,txt) => { const el=document.getElementById(id); if(el) el.textContent=txt; };
  set('lbl-pick',u.pick); set('lbl-petnames',u.petnames);
  set('lbl-theme',u.themeTitle);
  set('lbl-custom',u.custom); set('lbl-upload-main',u.uploadMain);
  set('lbl-upload-sub',u.uploadSub); set('gifEmpty',u.noGif);
  set('lbl-countdown',u.countdown); set('lbl-enable',u.enable);
  set('lbl-time',u.time); set('lbl-size',u.size);
  set('lbl-speed-title',u.speedTitle); set('lbl-slow',u.slow);
  set('lbl-normal',u.normal); set('lbl-fast',u.fast);
  set('lbl-show',u.show); set('saveBtn',u.save);
  set('tip-drag',u.tip);
  set('google-note',u.googleNote);
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('on',b.dataset.lang===lang));
  renderPetNameList();
  refreshThemeLabels();
  renderTimePicker();
}


// ── Custom time picker ────────────────────────────────────────
let _tpHour = 18;  // 0-23
let _tpMin  = 0;

function setTimePicker(timeStr) {
  // timeStr = "HH:MM" 24h format
  const [h, m] = (timeStr || '18:00').split(':').map(Number);
  _tpHour = isNaN(h) ? 18 : h;
  _tpMin  = isNaN(m) ? 0  : m;
  renderTimePicker();
}

function getTimePicker() {
  return `${String(_tpHour).padStart(2,'0')}:${String(_tpMin).padStart(2,'0')}`;
}

function renderTimePicker() {
  const isPM = _tpHour >= 12;
  const h12  = _tpHour % 12 || 12;
  const isKo = currentLang === 'ko';

  const periodEl = document.getElementById('tpPeriod');
  const hourEl   = document.getElementById('tpHour');
  const minEl    = document.getElementById('tpMin');
  if (!periodEl || !hourEl || !minEl) return;

  periodEl.textContent = isKo ? (isPM ? '오후' : '오전') : (isPM ? 'PM' : 'AM');
  hourEl.textContent   = String(h12).padStart(2, '0');
  minEl.textContent    = String(_tpMin).padStart(2, '0');
}

// Period toggle
document.addEventListener('click', e => {
  if (e.target.id === 'tpPeriod') {
    _tpHour = (_tpHour + 12) % 24;
    renderTimePicker();
  }
  // Arrow buttons
  if (e.target.classList.contains('tp-arrow')) {
    const dir  = e.target.dataset.dir;
    const part = e.target.dataset.part;
    if (part === 'h') {
      const h12 = _tpHour % 12 || 12;
      if (dir === 'up') {
        const newH12 = (h12 % 12) + 1;
        _tpHour = (_tpHour >= 12 ? 12 : 0) + newH12;
      } else {
        const newH12 = h12 === 1 ? 12 : h12 - 1;
        _tpHour = (_tpHour >= 12 ? 12 : 0) + (newH12 === 12 ? 0 : newH12);
        // Keep PM/AM: if was PM and now 12→12 (noon)
        if (_tpHour >= 12 && newH12 === 12) _tpHour = 12;
        else if (_tpHour < 12 && newH12 === 12) _tpHour = 0;
      }
    } else {
      _tpMin = dir === 'up' ? (_tpMin + 5) % 60 : (_tpMin + 55) % 60;
    }
    renderTimePicker();
  }
});

// Scroll on hour/min values
['tpHour','tpMin'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('wheel', e => {
    e.preventDefault();
    const dir = e.deltaY < 0 ? 'up' : 'dn';
    const part = id === 'tpHour' ? 'h' : 'm';
    el.dispatchEvent(Object.assign(new Event('click'), {}));
    // Simulate arrow click
    const btn = document.querySelector(`.tp-arrow[data-dir="${dir}"][data-part="${part}"]`);
    if (btn) btn.click();
  }, { passive: false });
});

// ── Load ─────────────────────────────────────────────────────
chrome.storage.sync.get(DEFAULTS, saved=>{
  settings     = {...DEFAULTS,...saved};
  customGifs   = settings.customGifs||[];
  currentLang  = settings.lang||'en';
  petNamesLocal= {...(settings.petNames||{})};
  const theme  = THEMES.find(t=>t.id===settings.themeId)||THEMES[0];
  applyToUI();
  applyUILang(currentLang);
  applyTheme(theme);
  renderTimePicker();
  renderPetGrid();
  renderGifGrid();
});

function applyToUI() {
  setTimePicker(settings.offTime||'18:00');
  document.getElementById('cdEnabled').checked   = !!settings.countdownEnabled;
  document.getElementById('crewVisible').checked = settings.crewVisible!==false;
  document.querySelectorAll('.sz-btn').forEach(b=>b.classList.toggle('on',b.dataset.size===(settings.size||'medium')));
  const spd=parseFloat(settings.speedMult)||1.0;
  const slider=document.getElementById('speedSlider');
  slider.value=spd; updateSpeedUI(spd);
}

// ── Theme swatches (rendered from JS) ────────────────────────
function renderThemeSwatches() {
  const grid = document.getElementById('themeGrid');
  grid.innerHTML = '';
  THEMES.forEach(theme => {
    // Wrapper: flex column for swatch + label, with bottom margin for label space
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;';

    const sw = document.createElement('div');
    sw.className = 'theme-swatch' + (theme.id === (settings.themeId||'orange') ? ' on' : '');
    sw.dataset.id = theme.id;
    sw.style.cssText = [
      `background:linear-gradient(135deg,${theme.accent} 50%,${theme.bg} 50%)`,
      'border:2.5px solid transparent',
      'width:36px','height:36px','border-radius:10px',
      'transition:transform .15s,border-color .15s',
      'flex-shrink:0',
    ].join(';');

    // Label BELOW the swatch (in flow, not absolute — no overlap)
    const lbl = document.createElement('div');
    lbl.className = 'theme-lbl';
    lbl.dataset.themeId = theme.id;
    const rawLabel = currentLang === 'ko' ? theme.labelKo : theme.labelEn;
    lbl.textContent = rawLabel.split(' ').slice(1).join(' ') || rawLabel;

    wrap.appendChild(sw);
    wrap.appendChild(lbl);

    wrap.addEventListener('mouseenter', ()=>{ sw.style.transform='scale(1.15)'; });
    wrap.addEventListener('mouseleave', ()=>{ sw.style.transform=sw.classList.contains('on')?'scale(1.1)':'scale(1)'; });
    wrap.addEventListener('click', ()=>{ applyTheme(theme); });
    grid.appendChild(wrap);
  });
}

// ── Speed ─────────────────────────────────────────────────────
function updateSpeedUI(val){
  const pct=((val-0.3)/(3.0-0.3))*100;
  document.getElementById('speedSlider').style.setProperty('--pct',pct+'%');
  document.getElementById('speedVal').textContent='×'+parseFloat(val).toFixed(1);
}
document.getElementById('speedSlider').addEventListener('input',function(){
  updateSpeedUI(this.value); settings.speedMult=parseFloat(this.value);
});

// ── Lang ──────────────────────────────────────────────────────
document.querySelectorAll('.lang-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{ settings.lang=btn.dataset.lang; applyUILang(btn.dataset.lang); });
});

// ── Pet grid ─────────────────────────────────────────────────
function renderPetGrid(){
  const grid=document.getElementById('petGrid'); grid.innerHTML='';
  const active=new Set(settings.activePets||[]);
  BUILTIN_PETS.forEach(p=>{
    const card=document.createElement('div');
    card.className='pet-card'+(active.has(p.id)?' on':''); card.dataset.id=p.id;
    const chk=document.createElement('div'); chk.className='chk'; chk.textContent='✓';
    const img=document.createElement('img');
    img.src=BASE+p.file; if(p.px) img.style.imageRendering='pixelated'; img.style.height='38px';
    const lbl=document.createElement('div'); lbl.className='lbl'; lbl.textContent=p.label;
    card.appendChild(chk); card.appendChild(img); card.appendChild(lbl);
    card.addEventListener('click',()=>{
      const s=new Set(settings.activePets||[]);
      if(s.has(p.id)) s.delete(p.id); else s.add(p.id);
      settings.activePets=[...s];
      card.classList.toggle('on',s.has(p.id));
      renderPetNameList();
    });
    grid.appendChild(card);
  });
  renderPetNameList();
}

// ── Per-pet nickname list ─────────────────────────────────────
function renderPetNameList(){
  const row=document.getElementById('petNameRow');
  const list=document.getElementById('petNameList');
  const u=UI[currentLang]||UI.en;
  const active=new Set(settings.activePets||[]);
  const allPets=[
    ...BUILTIN_PETS,
    ...customGifs.map(g=>({id:g.id,label:g.name.replace(/\.gif$/i,''),file:null,px:false,dataUrl:g.dataUrl}))
  ].filter(p=>active.has(p.id));

  if(allPets.length===0){row.style.display='none';return;}
  row.style.display='block'; list.innerHTML='';

  allPets.forEach(p=>{
    const item=document.createElement('div'); item.className='pet-name-item';
    const thumb=document.createElement('img'); thumb.className='thumb';
    thumb.src=p.dataUrl||(BASE+p.file);
    if(p.px) thumb.style.imageRendering='pixelated';
    const inp=document.createElement('input');
    inp.type='text'; inp.maxLength=14;
    inp.placeholder=u.petname_ph(p.label);
    inp.value=petNamesLocal[p.id]||'';
    inp.addEventListener('input',()=>{ petNamesLocal[p.id]=inp.value.trim(); });
    item.appendChild(thumb); item.appendChild(inp);
    list.appendChild(item);
  });
}

// ── Custom GIF grid ───────────────────────────────────────────
function renderGifGrid(){
  const grid=document.getElementById('gifGrid'),empty=document.getElementById('gifEmpty');
  Array.from(grid.querySelectorAll('.gif-item')).forEach(el=>el.remove());
  empty.style.display=customGifs.length===0?'block':'none';
  customGifs.forEach(gif=>{
    const item=document.createElement('div');
    item.className='gif-item'+((settings.activePets||[]).includes(gif.id)?' on':'');
    const img=document.createElement('img'); img.src=gif.dataUrl;
    const gl=document.createElement('div'); gl.className='gl'; gl.textContent=gif.name.replace(/\.gif$/i,'');
    const dl=document.createElement('button'); dl.className='dl'; dl.textContent='✕';
    dl.addEventListener('click',e=>{e.stopPropagation();deleteGif(gif.id);});
    item.addEventListener('click',()=>{
      const s=new Set(settings.activePets||[]);
      if(s.has(gif.id)) s.delete(gif.id); else s.add(gif.id);
      settings.activePets=[...s];
      item.classList.toggle('on',s.has(gif.id));
      renderPetNameList();
    });
    item.appendChild(img); item.appendChild(gl); item.appendChild(dl);
    grid.appendChild(item);
  });
}
function deleteGif(id){
  customGifs=customGifs.filter(g=>g.id!==id);
  settings.activePets=(settings.activePets||[]).filter(pid=>pid!==id);
  delete petNamesLocal[id];
  renderGifGrid(); renderPetNameList();
}

// ── Upload ────────────────────────────────────────────────────
const MAX=5;
function handleFiles(files){
  const gifs=Array.from(files).filter(f=>f.type==='image/gif');
  const rem=MAX-customGifs.length;
  if(rem<=0){alert(currentLang==='ko'?`최대 ${MAX}개까지 가능해요.`:`Max ${MAX} GIFs.`);return;}
  gifs.slice(0,rem).forEach(file=>{
    const reader=new FileReader();
    reader.onload=e=>{
      let n=0; while(customGifs.find(g=>g.id===`custom-${n}`)) n++;
      customGifs.push({id:`custom-${n}`,name:file.name,dataUrl:e.target.result});
      renderGifGrid();
    };
    reader.readAsDataURL(file);
  });
}
const ua=document.getElementById('uploadArea'),gi=document.getElementById('gifInput');
ua.addEventListener('click',()=>gi.click());
gi.addEventListener('change',e=>{handleFiles(e.target.files);gi.value='';});
ua.addEventListener('dragover',e=>{e.preventDefault();ua.classList.add('dov');});
ua.addEventListener('dragleave',()=>ua.classList.remove('dov'));
ua.addEventListener('drop',e=>{e.preventDefault();ua.classList.remove('dov');handleFiles(e.dataTransfer.files);});

// ── Size ──────────────────────────────────────────────────────
document.querySelectorAll('.sz-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.sz-btn').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on'); settings.size=btn.dataset.size;
  });
});

// ── Save ──────────────────────────────────────────────────────
document.getElementById('saveBtn').addEventListener('click',()=>{
  const toSave={
    ...settings,
    offTime:          getTimePicker(),
    countdownEnabled: document.getElementById('cdEnabled').checked,
    crewVisible:      document.getElementById('crewVisible').checked,
    speedMult:        parseFloat(document.getElementById('speedSlider').value)||1.0,
    lang:             currentLang,
    themeId:          currentTheme.id,
    petNames:         {...petNamesLocal},
    customGifs
  };
  chrome.storage.sync.set(toSave,()=>{
    chrome.runtime.sendMessage({type:'UPDATE_SETTINGS',settings:toSave},()=>{void chrome.runtime.lastError;});
    const msg=document.getElementById('savedMsg');
    msg.textContent=UI[currentLang]?.saved||'✅ Saved!';
    msg.classList.add('show'); setTimeout(()=>msg.classList.remove('show'),2000);
  });
});

document.getElementById('creditLink').addEventListener('click',()=>{
  chrome.tabs.create({url:'https://www.instagram.com/noirwave.ai'});
});

// Init theme swatches after DOM ready
renderThemeSwatches();
