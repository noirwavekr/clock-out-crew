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
    offTime:'18:00', countdownEnabled:true,
    size:'medium', speedMult:1.0,
    activePets:['kirby','kitten'],
    petNames:{}, lang:'ko',
    customGifs:[],
    // Persisted positions: { petId: {x, y} }
    petPositions:{}
  };

  // ── Per-pet dialog banks ────────────────────────────────────
  // Each pet has its own voice. Fallback = generic if id not found.
  const PET_LINES = {
    kirby: {
      en: {
        idle:  ['*inhales*','poyo!','hungry...','poyo poyo~','...poyooo','🌸'],
        click: ['POYO!','hii!!','poyo poyo!','feed me~','*wiggles*','more pls!','poyo♥'],
        many:  ['POYO!! clock out!','time to eat!!','inhale everything','done working~','hungry & tired'],
        soon:  ['almost food time!','poyo! so close!','hang on poyo!','almost there~'],
        greet: n => [`POYO! i'm ${n}!`, `${n} is here! poyo~`, `poyo poyo let's go!`, `*inhales deeply*`],
        freeze: n => `${n} freeze! poyo...`,
        thaw:   n => `poyo! ${n} is free!`,
        coffee: n => [`☕ poyooo~!`, `mmm inhale coffee ☕`, `POYO!! best ever!`, `☕ poyo poyo!`],
      },
      ko: {
        idle:  ['*들이쉬기*','포요!','배고파...','포요포요~','...포요오','🌸'],
        click: ['포요!!','안뇽!','포요포요!','밥 줘~','*꼼지락*','더 줘!','포요♥'],
        many:  ['포요!! 퇴근!','밥 먹을 시간!!','다 흡입해버려','일 끝~','배고프고 피곤해'],
        soon:  ['밥 시간 다 왔다!','포요! 거의다야!','조금만 더 포요!','다 왔어~'],
        greet: n => [`포요! 나는 ${n}이야!`, `${n} 등장! 포요~`, `포요포요 가자!`, `*크게 들이쉬기*`],
        freeze: n => `${n} 얼음! 포요...`,
        thaw:   n => `포요! ${n} 자유다!`,
        coffee: n => [`☕ 포요오~!`, `음 커피 흡입 ☕`, `포요!! 최고야!`, `☕ 포요포요!`],
      }
    },
    squidward: {
      en: {
        idle:  ['ugh.','...','whatever.','I hate this.','*sighs*','mediocre.'],
        click: ['DON\'T.','ow, rude.','I\'m an ARTIST.','go away.','*groans*','stop it.','ugh.'],
        many:  ['FINALLY leaving.','this job is beneath me.','off to practice clarinet','I deserve better','finally, freedom'],
        soon:  ['almost done suffering','barely surviving','one more minute...','so close to escape'],
        greet: n => [`I'm ${n}. Don't bother.`, `${n} is HERE. Applause.`, `ugh, hello.`, `...whatever.`],
        freeze: n => `${n} is frozen. Perfect.`,
        thaw:   n => `ugh, ${n} moves again.`,
        coffee: n => [`I SUPPOSE I'll take it.`, `finally something decent ☕`, `*sips dramatically*`, `this is mediocre ☕`],
      },
      ko: {
        idle:  ['으...','...','됐어.','진짜 싫다.','*한숨*','평범하네.'],
        click: ['건드리지 마.','아 아파.','나는 예술가야.','꺼져줘.','*신음*','그만해.','으...'],
        many:  ['드디어 퇴근.','이 직장은 내 수준 이하야.','클라리넷 연습하러 가야지','난 더 나은 대우를 받아야 해','드디어 자유'],
        soon:  ['고통이 거의 끝나가.','겨우 버티는 중','1분만 더...','탈출이 가까워졌어'],
        greet: n => [`나는 ${n}. 건드리지 마.`, `${n} 등장. 박수쳐.`, `...으, 안녕.`, `...됐어.`],
        freeze: n => `${n} 얼음. 잘됐네.`,
        thaw:   n => `으, ${n} 또 움직여.`,
        coffee: n => [`뭐, 받아주지.`, `드디어 괜찮은 게 생겼네 ☕`, `*극적으로 홀짝*`, `평범한 맛 ☕`],
      }
    },
    blackcat: {
      en: {
        idle:  ['...','*stares*','hmm.','...','*slow blink*','whatever.'],
        click: ['...!','hey!','*purr*','ok fine.','*blink*','mmm.','stop.'],
        many:  ['time to leave.','done here.','*stretches and goes*','finally.','*yawns and exits*'],
        soon:  ['almost time...','*tail flick*','getting ready to go','so close...'],
        greet: n => [`...i'm ${n}.`, `${n} arrived.`, `*sits and stares*`, `...hi.`],
        freeze: n => `${n}... frozen.`,
        thaw:   n => `${n} moves again.`,
        coffee: n => [`*sniffs ☕*`, `...acceptable.`, `*slow blink* ☕`, `fine, i'll take it.`],
      },
      ko: {
        idle:  ['...','*응시*','흠.','...','*눈 천천히 깜빡*','됐어.'],
        click: ['...!','야!','*그르릉*','뭐, 됐어.','*깜빡*','음.','그만해.'],
        many:  ['이제 갈 시간.','여기서 끝.','*기지개 켜고 퇴장*','드디어.','*하품하고 퇴근*'],
        soon:  ['거의 다 됐어...','*꼬리 흔들*','갈 준비 중','거의 다야...'],
        greet: n => [`...나는 ${n}.`, `${n} 도착.`, `*앉아서 응시*`, `...안녕.`],
        freeze: n => `${n}... 얼음.`,
        thaw:   n => `${n} 다시 움직여.`,
        coffee: n => [`*커피 냄새 맡기 ☕*`, `...괜찮네.`, `*천천히 깜빡* ☕`, `뭐, 받아줄게.`],
      }
    },
    pikachu: {
      en: {
        idle:  ['pika~','pikachu!','pika pika','⚡','...pika?','chu~'],
        click: ['PIKA!!','pika pika!','⚡⚡','chu chu!','pikachuuu!','electric!','pika♥'],
        many:  ['PIKACHU!! clock out!','⚡ time to go!','pika pika freedom!','CHUUU!!','charging up to leave!'],
        soon:  ['pika! almost!','⚡ so close!','chu chu hang on!','almost charged!'],
        greet: n => [`PIKA! i'm ${n}!`, `${n} used ARRIVE!`, `pika pika~!`, `⚡ let's go!`],
        freeze: n => `${n} is frozen! pika...`,
        thaw:   n => `⚡ ${n} is free!`,
        coffee: n => [`PIKA!! ☕⚡`, `*charges up* ☕`, `pikachu is fully charged!`, `☕ CHUUUU!`],
      },
      ko: {
        idle:  ['피카~','피카츄!','피카 피카','⚡','...피카?','츄~'],
        click: ['피카!!','피카피카!','⚡⚡','츄 츄!','피카츄우!','전기!','피카♥'],
        many:  ['피카츄!! 퇴근!','⚡ 갈 시간!','피카피카 자유!','츄우!!','충전 완료 퇴근!'],
        soon:  ['피카! 거의다!','⚡ 다 왔어!','츄 츄 조금만!','충전 거의 완료!'],
        greet: n => [`피카! 나는 ${n}!`, `${n} 사용했다 등장!`, `피카피카~!`, `⚡ 가자!`],
        freeze: n => `${n} 얼음! 피카...`,
        thaw:   n => `⚡ ${n} 자유다!`,
        coffee: n => [`피카!! ☕⚡`, `*충전 중* ☕`, `피카츄 완충!`, `☕ 츄우우!`],
      }
    },
    jumpcat: {
      en: {
        idle:  ['...mrrrow','*twitches ear*','brrp','mrow?','*zooms internally*','...'],
        click: ['MRRROW!','brrp brrp!','*wiggles butt*','mrow!','hiii!','*trills*','mrow♥'],
        many:  ['MROW clock out!!','zoomies time!!','*parkour out the door*','mrrrow freedom!','sprint to freedom!'],
        soon:  ['almost zoomies time!','mrow! nearly there!','prepare for zoomies!','sooo close!!'],
        greet: n => [`MROW! i'm ${n}!`, `*${n} has entered*`, `brrp brrp hello!`, `mrow mrow~!`],
        freeze: n => `${n} freeze! mrow...`,
        thaw:   n => `MROW! ${n} free!`,
        coffee: n => [`*knocks ☕ off table*`, `mrow! thanks ☕`, `brrp brrp! ☕`, `*zoomies after coffee*`],
      },
      ko: {
        idle:  ['...므르르','*귀 씰룩*','브릅','므로우?','*내면의 질주*','...'],
        click: ['므르르!','브릅브릅!','*엉덩이 씰룩*','므로우!','안뇽!','*트릴*','므로우♥'],
        many:  ['므로우 퇴근!!','질주 시간!!','*파쿠르로 퇴근*','므르르 자유!','자유를 향해 질주!'],
        soon:  ['질주 시간 거의다!','므로우! 다 왔어!','질주 준비!','너무 가깝다!!'],
        greet: n => [`므로우! 나는 ${n}!`, `*${n} 입장함*`, `브릅브릅 안녕!`, `므로우므로우~!`],
        freeze: n => `${n} 얼음! 므로우...`,
        thaw:   n => `므로우! ${n} 자유!`,
        coffee: n => [`*☕ 테이블에서 밀어버림*`, `므로우! 고마워 ☕`, `브릅브릅! ☕`, `*커피 먹고 질주*`],
      }
    },
    pingu: {
      en: {
        idle:  ['noot.','noot noot','...','noot?','*waddles*','noot~'],
        click: ['NOOT NOOT!!','noot noot!','*flaps flippers*','noot!!','hiii noot!','noot♥','nooot!'],
        many:  ['NOOT! clock out!','noot noot freedom!!','*waddles away*','NOOOOT!!','noot noot bye bye!'],
        soon:  ['noot! almost!','noot noot close!','hang on noot!','almost noot time!'],
        greet: n => [`NOOT! i'm ${n}!`, `${n} noot noot!`, `noot noot hello!`, `*noot intensifies*`],
        freeze: n => `${n} noot... frozen`,
        thaw:   n => `NOOT! ${n} is free!`,
        coffee: n => [`NOOT NOOT ☕!!`, `*flaps excitedly* ☕`, `noot noot yum!`, `☕ NOOOOOT!`],
      },
      ko: {
        idle:  ['눗.','눗 눗','...','눗?','*뒤뚱*','눗~'],
        click: ['눗 눗!!','눗눗!','*지느러미 퍼덕*','눗!!','안녕 눗!','눗♥','노웃!'],
        many:  ['눗! 퇴근!','눗눗 자유!!','*뒤뚱뒤뚱 퇴장*','노웃!!','눗눗 잘 가!'],
        soon:  ['눗! 거의다!','눗눗 가깝다!','조금만 눗!','거의 눗 시간!'],
        greet: n => [`눗! 나는 ${n}!`, `${n} 눗 눗!`, `눗눗 안녕!`, `*눗 강화*`],
        freeze: n => `${n} 눗... 얼음`,
        thaw:   n => `눗! ${n} 자유다!`,
        coffee: n => [`눗눗 ☕!!`, `*신나서 퍼덕* ☕`, `눗눗 맛있다!`, `☕ 노웃!!`],
      }
    },
    hellokitty: {
      en: {
        idle:  ['♡','...','*bakes cookies*','la la~','♡♡','you matter~'],
        click: ['♡♡!!','hehe~','you\'re so sweet!','♡ hi!','heehee!','love you~','♡ mwah!'],
        many:  ['♡ clock out time!','let\'s go home~','*packs cute bag*','bye bye work ♡','friendship first!'],
        soon:  ['almost home ♡','so close~!','you\'re doing great!','almost rest time ♡'],
        greet: n => [`♡ hi! i'm ${n}~`, `${n} says hello ♡`, `let's be friends~!`, `♡ heeheehee!`],
        freeze: n => `${n} is frozen ♡`,
        thaw:   n => `♡ ${n} is free~!`,
        coffee: n => [`♡ thank you ☕!`, `so thoughtful~ ☕`, `*happy dance* ♡`, `☕ you're the best ♡`],
      },
      ko: {
        idle:  ['♡','...','*쿠키 굽는 중*','라라~','♡♡','오늘도 파이팅~'],
        click: ['♡♡!!','히히~','넌 정말 착해!','♡ 안녕!','헤헤!','사랑해~','♡ 뽀뽀!'],
        many:  ['♡ 퇴근 시간!','집에 가자~','*귀여운 가방 챙기기*','안녕 회사 ♡','우정이 먼저!'],
        soon:  ['거의 집이야 ♡','다 왔어~!','잘 하고 있어!','거의 쉬는 시간 ♡'],
        greet: n => [`♡ 안녕! 나는 ${n}~`, `${n}가 인사해요 ♡`, `친구 하자~!`, `♡ 헤헤헤!`],
        freeze: n => `${n} 얼음 ♡`,
        thaw:   n => `♡ ${n} 자유~!`,
        coffee: n => [`♡ 고마워 ☕!`, `마음 씀씀이가 좋아~ ☕`, `*행복 댄스* ♡`, `☕ 최고야 ♡`],
      }
    },
    kitten: {
      en: {
        idle:  ['mew...','*tiny yawn*','mew?','...mew','*kneads paw*','mrrp'],
        click: ['mew!!','eek!','mrrp mrrp!','gentle pls~','*tiny purr*','meww~','mew♥'],
        many:  ['mew!! going home!','*tiny trot out*','mew mew freedom!','carry me home?','mew... so tired'],
        soon:  ['mew! almost!','tiny bit more~','mew mew hang on!','nearly nap time!'],
        greet: n => [`mew! i'm ${n}!`, `*tiny ${n} appears*`, `mew mew hello~!`, `mrrp! hi!`],
        freeze: n => `${n} frozen... mew`,
        thaw:   n => `mew! ${n} is free~`,
        coffee: n => [`mew!! ☕`, `*sniff sniff* ☕`, `mrrp! yum~`, `☕ mew mew!!`],
      },
      ko: {
        idle:  ['미야...','*아기 하품*','미야?','...미야','*발 꾹꾹*','므릅'],
        click: ['미야!!','앗!','므릅 므릅!','살살 해줘~','*작은 그르릉*','미야~','미야♥'],
        many:  ['미야!! 집에 가!','*아장아장 퇴근*','미야 미야 자유!','나 안아서 데려가줘?','미야... 너무 피곤해'],
        soon:  ['미야! 거의다!','조금만 더~','미야미야 조금만!','낮잠 시간 가깝다!'],
        greet: n => [`미야! 나는 ${n}!`, `*아기 ${n} 등장*`, `미야 미야 안녕~!`, `므릅! 안녕!`],
        freeze: n => `${n} 얼음... 미야`,
        thaw:   n => `미야! ${n} 자유~`,
        coffee: n => [`미야!! ☕`, `*킁킁* ☕`, `므릅! 맛있다~`, `☕ 미야미야!!`],
      }
    },
    // fallback for custom GIFs
    _default: {
      en: {
        idle:  ['...','*idle*','hmm','hey.','*yawn*','bored'],
        click: ['hey!','ow!','hi~','stop~','*blink*','ok!','!'],
        many:  ['clock out!!','going home!','done!','finally!','bye work!'],
        soon:  ['almost!','hang in!','so close!','nearly there!'],
        greet: n => [`hi! i'm ${n}!`, `${n} is here!`, `let's go!`, `hello~!`],
        freeze: n => `${n} freeze!`,
        thaw:   n => `${n} go!`,
        coffee: n => [`☕ thanks!`, `mmm ☕`, `nice!`, `☕ yay!`],
      },
      ko: {
        idle:  ['...','*대기 중*','흠','야.','*하품*','심심해'],
        click: ['야!','아야!','안녕~','그만해~','*깜빡*','응!','!'],
        many:  ['퇴근!!','집에 가!','끝!','드디어!','안녕 회사!'],
        soon:  ['거의다!','조금만!','다 왔어!','거의 도착!'],
        greet: n => [`안녕! 나는 ${n}!`, `${n} 등장!`, `가자!`, `안녕~!`],
        freeze: n => `${n} 얼음!`,
        thaw:   n => `${n} 출발!`,
        coffee: n => [`☕ 고마워!`, `음 ☕`, `좋아!`, `☕ 야호!`],
      }
    }
  };

  // ── i18n — uses per-pet lines when available ─────────────────
  const I18N = {
    en: {
      ctxFreeze:'🧊 얼음!', ctxThaw:'🔥 땡!', ctxBye:'👋 See ya later!', ctxCoffee:'☕ Coffee!',
      cdDone:'🎉 Clock out!',
      cdH:(h,m,s)=>`⏰ ${h}h ${m}m ${s}s`,
      cdM:(m,s)=>`⏰ ${m}m ${s}s`,
      cdS:s=>`🚀 ${s}s!!!`,
    },
    ko: {
      ctxFreeze:'🧊 얼음!', ctxThaw:'🔥 땡!', ctxBye:'👋 나중에 만나기', ctxCoffee:'☕ 커피 한잔',
      cdDone:'🎉 퇴근시간!',
      cdH:(h,m,s)=>`⏰ 퇴근까지 ${h}시간 ${m}분 ${s}초`,
      cdM:(m,s)=>`⏰ ${m}분 ${s}초`,
      cdS:s=>`🚀 ${s}초!!!`,
    }
  };

  const t = () => I18N[settings.lang] || I18N.en;

  // Get pet-specific lines in current language
  function petLines(petDef) {
    const bank = PET_LINES[petDef.id] || PET_LINES._default;
    return bank[settings.lang] || bank.en;
  }


  let settings = { ...DEFAULTS };
  const BASE = chrome.runtime.getURL('images/');

  // ── Layer management ─────────────────────────────────────────
  // Robust layer creation: works on Google, Naver, SPAs, iframes, etc.
  function ensureLayer() {
    let el = document.getElementById('coc-layer');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'coc-layer';
    el.style.cssText = [
      'position:fixed','top:0','left:0','width:100vw','height:100vh',
      'pointer-events:none','z-index:2147483647','overflow:visible',
      'contain:layout'
    ].join(';');
    const root = document.body || document.documentElement;
    root.appendChild(el);
    return el;
  }

  let layer = ensureLayer();

  // When the layer gets ripped out (SPA navigation, body swap),
  // destroy all pet wrappers and re-sync from scratch so nothing is orphaned.
  function onLayerLost() {
    // Tear down all current pets cleanly (no DOM ops — wrapper is already gone)
    for (const [id, state] of pets) {
      clearTimeout(state.idleTimer); clearTimeout(state.walkTimer);
      clearTimeout(state.bubbleTimer); clearInterval(state.cdInterval);
      clearInterval(state.speedLineTimer);
    }
    pets.clear();
    layer = ensureLayer();
    applyThemeToLayer();
    // Re-create pets after short delay to let the new DOM settle
    setTimeout(() => {
      chrome.storage.local.get({petPositions:{}}, local => {
        const active = new Set(settings.activePets || []);
        const allDefs = [
          ...BUILTIN_PETS,
          ...(settings.customGifs||[]).map(g=>({
            id:g.id, label:g.name.replace(/\.gif$/i,''), file:null,
            speed:1.4, px:false, dataUrl:g.dataUrl
          }))
        ];
        const savedPos = local.petPositions || {};
        for (const def of allDefs) {
          if (active.has(def.id)) createPet(def, savedPos[def.id] || null);
        }
      });
    }, 200);
  }

  // Watch for layer removal using a single observer on document
  const layerObserver = new MutationObserver(mutations => {
    // Quick check: is our layer still in the document?
    if (!document.getElementById('coc-layer')) {
      onLayerLost();
    }
  });
  // Watch body's children AND document-level changes
  const startObserver = () => {
    layerObserver.disconnect();
    layerObserver.observe(document.documentElement, { childList:true, subtree:true });
  };
  startObserver();
  // Also re-check on visibility change (tab switch returns)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (!document.getElementById('coc-layer')) onLayerLost();
      else applyThemeToLayer();
    }
  });


  // ── Inject theme CSS variables into page ─────────────────────
  // Reads themeId from settings and sets CSS vars on #coc-layer
  // so countdown badges, bubbles etc use the chosen theme color
  const THEME_COLORS = {
    orange: { main:'#ff7b35', light:'#ff9a56', bubble_border:'#ff9a56' },
    rose:   { main:'#e0406a', light:'#f0607a', bubble_border:'#f0607a' },
    sky:    { main:'#2b8fff', light:'#56aaff', bubble_border:'#56aaff' },
    mint:   { main:'#1daa80', light:'#2ecf99', bubble_border:'#2ecf99' },
    purple: { main:'#7c3aed', light:'#9d5ff5', bubble_border:'#9d5ff5' },
    dark:   { main:'#e0a030', light:'#f0b840', bubble_border:'#f0b840' },
    pink:   { main:'#d946a8', light:'#f060c0', bubble_border:'#f060c0' },
    lemon:  { main:'#c4900a', light:'#e8b020', bubble_border:'#e8b020' },
  };

  function applyThemeToLayer() {
    const tc = THEME_COLORS[settings.themeId] || THEME_COLORS.orange;
    layer.style.setProperty('--coc-main',  tc.main);
    layer.style.setProperty('--coc-light', tc.light);
    layer.style.setProperty('--coc-border',tc.bubble_border);
  }

  const pets = new Map();
  const getPetName = def => (settings.petNames&&settings.petNames[def.id]) || def.label;

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
      showBubble(state, petLines(state.petDef).freeze(name));
      const burst=document.createElement('div');
      burst.className='coc-freeze-burst';
      state.wrapper.appendChild(burst);
      setTimeout(()=>burst.remove(),600);
      const rect=state.wrapper.getBoundingClientRect();
      spawnParticles(rect.left+rect.width/2, rect.top+rect.height/2,'snow');
    } else {
      state.wrapper.classList.remove('frozen');
      startWalk(state);
      showBubble(state, petLines(state.petDef).thaw(name));
      triggerAnim(state.wrapper,'bouncing',500);
    }
  }

  // ── Coffee ────────────────────────────────────────────────────
  function giveCoffee(state, cx, cy) {
    const name = getPetName(state.petDef);
    showBubble(state, rnd(petLines(state.petDef).coffee(name)));
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
    setTimeout(()=>showBubble(state,rnd(petLines(state.petDef).greet(name))),700+Math.random()*800);

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
        const _pl = petLines(state.petDef);
        if(state.clickCount>=5){
          state.clickCount=0;
          triggerAnim(wrapper,'spinning',560);
          showBubble(state,rnd(_pl.many));
        } else {
          triggerAnim(wrapper,'bouncing',500);
          showBubble(state,rnd(_pl.click));
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

    startCountdown(state);
  }


  function syncPets(){
    // Always ensure layer exists before doing anything
    if (!document.getElementById('coc-layer')) {
      layer = ensureLayer();
    }
    applyThemeToLayer();

    const active  = new Set(settings.activePets || []);
    const allDefs = [
      ...BUILTIN_PETS,
      ...(settings.customGifs||[]).map(g=>({
        id:g.id, label:g.name.replace(/\.gif$/i,''), file:null,
        speed:1.4, px:false, dataUrl:g.dataUrl
      }))
    ];

    // Remove pets that are no longer active
    for (const [id] of pets) {
      if (!active.has(id)) removePet(id);
    }

    // Also remove pets whose wrapper has been detached from DOM
    for (const [id, state] of pets) {
      if (!document.body.contains(state.wrapper)) {
        clearTimeout(state.idleTimer); clearTimeout(state.walkTimer);
        clearTimeout(state.bubbleTimer); clearInterval(state.cdInterval);
        clearInterval(state.speedLineTimer);
        pets.delete(id);
      }
    }

    // Load saved positions then create missing pets
    chrome.storage.local.get({petPositions:{}}, local => {
      const savedPos = local.petPositions || {};
      for (const def of allDefs) {
        if (active.has(def.id) && !pets.has(def.id)) {
          createPet(def, savedPos[def.id] || null);
        }
      }
      for (const [, state] of pets) applyPetSettings(state);
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
      if(Math.random()<.25) showBubble(state,rnd(petLines(state.petDef).idle));
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
        const pl=petLines(state.petDef);
        const pool=[...pl.idle];
        if(settings.countdownEnabled) pool.push(...pl.soon);
        showBubble(state,rnd(pool));
      }
    }
  },14000);

  // ── Settings listener ─────────────────────────────────────────
  chrome.runtime.onMessage.addListener(msg=>{
    if(msg.type==='UPDATE_SETTINGS'){
      settings={...DEFAULTS,...msg.settings};
      applyThemeToLayer();
      syncPets();
    }
  });

  // ── Boot ──────────────────────────────────────────────────────
  // Wait for document.body to be ready (some pages are slow)
  function boot() {
    chrome.storage.sync.get(DEFAULTS, saved => {
      settings = { ...DEFAULTS, ...saved };
      syncPets();
      // Re-check after 1s for slow-loading pages
      setTimeout(() => {
        if (!document.getElementById('coc-layer')) onLayerLost();
        else syncPets();
      }, 1000);
    });
  }

  if (document.body) {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }
})();
