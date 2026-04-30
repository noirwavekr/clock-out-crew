// popup.js — Clock Out Crew v5

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

// Color filter options: [label, cssFilter, swatchBg]
const COLOR_FILTERS = [
  { id:'none',         label:'기본',     filter:'none',                                  bg:'linear-gradient(135deg,#ddd,#999)' },
  { id:'sepia',        label:'태닝',     filter:'sepia(100%)',                           bg:'#c8966e' },
  { id:'blue',         label:'블루',     filter:'hue-rotate(200deg)',                    bg:'#6ea8c8' },
  { id:'green',        label:'그린',     filter:'hue-rotate(120deg) saturate(1.5)',      bg:'#6ec87a' },
  { id:'purple',       label:'퍼플',     filter:'hue-rotate(280deg)',                    bg:'#c86ec8' },
  { id:'pink',         label:'핑크',     filter:'hue-rotate(320deg) saturate(1.4)',      bg:'#e87ca0' },
  { id:'gold',         label:'골드',     filter:'sepia(60%) saturate(2) hue-rotate(10deg)', bg:'#e8c44a' },
  { id:'red',          label:'레드',     filter:'hue-rotate(330deg) saturate(2)',        bg:'#e85050' },
  { id:'invert',       label:'반전',     filter:'invert(100%)',                          bg:'linear-gradient(135deg,#333,#111)' },
  { id:'dark',         label:'다크',     filter:'brightness(0.5) saturate(0.8)',         bg:'#555' },
  { id:'neon',         label:'네온',     filter:'saturate(3) brightness(1.1)',           bg:'linear-gradient(135deg,#ff4fff,#4fffff)' },
  { id:'retro',        label:'레트로',   filter:'sepia(40%) contrast(1.2) brightness(0.95)', bg:'#b8934a' },
];

const DEFAULTS = {
  offTime:'18:00', countdownEnabled:false,
  size:'medium', speedMult:1.0,
  activePets:['kirby','kitten'],
  petNames:{}, petColors:{}, lang:'en',
  crewVisible:true, customGifs:[]
};

const UI = {
  en:{
    pick:'🐾 Pick your crew (multi-select)',
    petnames:'✏️ Pet nicknames',
    petnameColor:'🎨 Color',
    petname_ph:lbl=>`${lbl}'s nickname`,
    custom:'🖼️ Custom GIF',
    uploadMain:'Click or drag a GIF to add', uploadSub:'Max 5 · GIF only',
    noGif:'No custom GIFs yet 🐾',
    countdown:'⏰ Clock-out Countdown',
    enable:'Enable countdown', time:'Clock-out time',
    size:'📐 Size', speedTitle:'🏃 Speed',
    slow:'Slow', normal:'Normal', fast:'Fast',
    show:'Show crew on page',
    save:'Save & deploy the crew 🚀', saved:'✅ Crew deployed!',
    tip:'💡 Drag anywhere · Right-click → 얼음 / 땡 / ☕',
  },
  ko:{
    pick:'🐾 크루 선택 (여러 개 가능)',
    petnames:'✏️ 펫 닉네임',
    petnameColor:'🎨 컬러',
    petname_ph:lbl=>`${lbl} 닉네임`,
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
  }
};

const BASE = chrome.runtime.getURL('images/');
let settings   = { ...DEFAULTS };
let customGifs = [];
let currentLang = 'en';
let petNamesLocal  = {};
let petColorsLocal = {};

// ── i18n apply ───────────────────────────────────────────────
function applyUILang(lang) {
  currentLang = lang;
  const u = UI[lang]||UI.en;
  const set = (id,txt) => { const el=document.getElementById(id); if(el) el.textContent=txt; };
  set('lbl-pick',u.pick); set('lbl-petnames',u.petnames);
  set('lbl-custom',u.custom); set('lbl-upload-main',u.uploadMain);
  set('lbl-upload-sub',u.uploadSub); set('gifEmpty',u.noGif);
  set('lbl-countdown',u.countdown); set('lbl-enable',u.enable);
  set('lbl-time',u.time); set('lbl-size',u.size);
  set('lbl-speed-title',u.speedTitle); set('lbl-slow',u.slow);
  set('lbl-normal',u.normal); set('lbl-fast',u.fast);
  set('lbl-show',u.show); set('saveBtn',u.save);
  set('tip-drag',u.tip);
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('on',b.dataset.lang===lang));
  renderPetNameList();
}

// ── Load ─────────────────────────────────────────────────────
chrome.storage.sync.get(DEFAULTS, saved=>{
  settings = {...DEFAULTS,...saved};
  customGifs     = settings.customGifs||[];
  currentLang    = settings.lang||'en';
  petNamesLocal  = {...(settings.petNames||{})};
  petColorsLocal = {...(settings.petColors||{})};
  applyToUI();
  applyUILang(currentLang);
  renderPetGrid();
  renderGifGrid();
});

function applyToUI() {
  document.getElementById('offTime').value       = settings.offTime||'18:00';
  document.getElementById('cdEnabled').checked   = !!settings.countdownEnabled;
  document.getElementById('crewVisible').checked = settings.crewVisible!==false;
  document.querySelectorAll('.sz-btn').forEach(b=>b.classList.toggle('on',b.dataset.size===(settings.size||'medium')));
  const spd=parseFloat(settings.speedMult)||1.0;
  const slider=document.getElementById('speedSlider');
  slider.value=spd; updateSpeedUI(spd);
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

// ── Lang buttons ──────────────────────────────────────────────
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
    // Apply color filter preview
    const cf=petColorsLocal[p.id]||'none';
    if(cf!=='none') img.style.filter=cf;
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

// ── Per-pet nickname + color list ─────────────────────────────
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
    // Container
    const wrap=document.createElement('div');
    wrap.style.cssText='display:flex;flex-direction:column;gap:5px;padding:8px 10px;background:#fffaf5;border:1.5px solid #ffd4a8;border-radius:10px;';

    // Top row: thumb + name input
    const topRow=document.createElement('div');
    topRow.className='pet-name-item';

    const thumb=document.createElement('img'); thumb.className='thumb';
    thumb.src=p.dataUrl||(BASE+p.file);
    if(p.px) thumb.style.imageRendering='pixelated';
    const cf=petColorsLocal[p.id]||'none';
    if(cf!=='none') thumb.style.filter=cf;

    const inp=document.createElement('input');
    inp.type='text'; inp.maxLength=14;
    inp.placeholder=u.petname_ph(p.label);
    inp.value=petNamesLocal[p.id]||'';
    inp.addEventListener('input',()=>{ petNamesLocal[p.id]=inp.value.trim(); });

    topRow.appendChild(thumb); topRow.appendChild(inp);

    // Bottom row: color label + swatches
    const colorRow=document.createElement('div');
    colorRow.style.cssText='display:flex;flex-direction:column;gap:5px;';

    const colorLabel=document.createElement('div');
    colorLabel.style.cssText='font-size:9px;font-weight:800;color:#b07060;text-transform:uppercase;letter-spacing:.8px;';
    colorLabel.textContent=u.petnameColor;

    const swatches=document.createElement('div');
    swatches.className='color-swatches';

    COLOR_FILTERS.forEach(cf=>{
      const sw=document.createElement('div');
      sw.className='color-swatch'+(( petColorsLocal[p.id]||'none')===cf.filter?' on':'');
      sw.style.background=cf.bg;
      sw.title=cf.label;
      sw.addEventListener('click',()=>{
        petColorsLocal[p.id]=cf.filter;
        // Update all swatches for this pet
        swatches.querySelectorAll('.color-swatch').forEach((s,i)=>
          s.classList.toggle('on',COLOR_FILTERS[i].filter===cf.filter));
        // Update thumb preview
        thumb.style.filter=cf.filter==='none'?'':cf.filter;
        // Update pet card preview
        const card=document.querySelector(`.pet-card[data-id="${p.id}"] img`);
        if(card) card.style.filter=cf.filter==='none'?'':cf.filter;
      });
      swatches.appendChild(sw);
    });

    colorRow.appendChild(colorLabel); colorRow.appendChild(swatches);
    wrap.appendChild(topRow); wrap.appendChild(colorRow);
    list.appendChild(wrap);
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
  delete petNamesLocal[id]; delete petColorsLocal[id];
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

// ── Size buttons ──────────────────────────────────────────────
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
    offTime:          document.getElementById('offTime').value,
    countdownEnabled: document.getElementById('cdEnabled').checked,
    crewVisible:      document.getElementById('crewVisible').checked,
    speedMult:        parseFloat(document.getElementById('speedSlider').value)||1.0,
    lang:             currentLang,
    petNames:         {...petNamesLocal},
    petColors:        {...petColorsLocal},
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
