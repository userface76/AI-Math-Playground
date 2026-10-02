const SUPABASE_URL='https://jijroogiunjikexnbioo.supabase.co';
const SUPABASE_KEY='sb_publishable_Iju0DLHC31k-b3REGA_Kww__E-6jtsV';
const supabaseClient=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY);
let authUser=null,currentChild=null,selectedAvatar='suki',teachTruthHistory=[];
const defaultState={stars:0,xp:0,level:1,attempts:0,correct:0,hints:0,current:null,missionStars:0,treasures:0,gameType:'duel',gameRound:0,currentWorld:'g1-number',currentConcept:null,currentStageIndex:0,selectedGrade:1,dailyMission:null,mastery:{},adaptive:{},roundHinted:false,lastHelp:null};
const state={...defaultState},$=id=>document.getElementById(id),MISSION_TARGET=20,SUKI_BASE='public/assets/suki/';let content={worlds:[],modes:[],mastery:null};
const sukiImages={greet:'suki_01_greet.png',happy:'suki_02_happy.png',correct:'suki_03_correct.png',cheer:'suki_04_cheer.png',think:'suki_05_think.png',curious:'suki_06_curious.png',surprise:'suki_07_surprise.png',jump:'avatar_08_jump.png',hint:'suki_09_hint.png',explore:'suki_10_explore.png',rest:'suki_11_rest.png',complete:'suki_12_complete.png'},fallbackModes=['duel','star-catch','missing','teach-suki'];
async function loadContent(){try{const[w,g,m]=await Promise.all([fetch('src/data/worlds.json').then(r=>r.json()),fetch('src/data/game-modes.json').then(r=>r.json()),fetch('src/data/mastery.json').then(r=>r.json())]);content.worlds=w.worlds;content.modes=g.modes;content.mastery=m}catch(e){content.worlds=[{id:'g1-add',order:1,name:'덧셈숲',icon:'🌳',concepts:['add-10'],stages:['수키와 대결','별잡기','빈칸 찾기','수키 가르치기','최종미션']}];content.modes=fallbackModes.map((id,i)=>({id,name:['수키와 대결','별잡기','빈칸 찾기','수키 가르치기'][i]}))}}
function storageKey(user=authUser){return user?.id?`mathPlayStateV3:${user.id}`:'mathPlayStateV3:guest'}
function resetState(){for(const k of Object.keys(state))delete state[k];Object.assign(state,JSON.parse(JSON.stringify(defaultState)))}
function saveFor(user=authUser){localStorage.setItem(storageKey(user),JSON.stringify(state))}
function save(){saveFor(authUser)}
function restoreFor(user=authUser){resetState();try{const saved=JSON.parse(localStorage.getItem(storageKey(user))||'null');if(saved)Object.assign(state,saved);state.adaptive=state.adaptive||{};state.mastery=state.mastery||{}}catch{resetState()}}
function authNotice(message,tone='ok'){const n=$('authNotice');if(!n)return;n.textContent=message;n.className='auth-notice '+tone;setTimeout(()=>n.classList.add('hidden'),3200)}
function renderAuth(){if(!$('authBtn'))return;if(authUser){$('authText').textContent=authUser.user_metadata?.full_name?.split(' ')[0]||'로그인됨';$('authIcon').textContent='✓';$('authBtn').classList.add('signed-in');$('authBtn').title='로그아웃'}else{$('authText').textContent='로그인';$('authIcon').textContent='G';$('authBtn').classList.remove('signed-in');$('authBtn').title='Google로 로그인'}}
async function ensureParentProfile(user){if(!supabaseClient||!user)return;const display=user.user_metadata?.full_name||user.email?.split('@')[0]||'보호자';const {error}=await supabaseClient.from('parent_profiles').upsert({id:user.id,display_name:display},{onConflict:'id'});if(error)console.warn('parent profile sync failed',error.message)}
async function loadChildProfile(){currentChild=null;if(!supabaseClient||!authUser){$('onboarding')?.classList.add('hidden');return}const {data,error}=await supabaseClient.from('child_profiles').select('id,nickname,grade,current_quarter,avatar_key,stars,xp,level').eq('parent_id',authUser.id).order('created_at',{ascending:true}).limit(1);if(error){console.warn('child profile load failed',error.message);return}currentChild=data?.[0]||null;if(currentChild){$('onboarding')?.classList.add('hidden');if(!state.selectedGrade)state.selectedGrade=Number(currentChild.grade)||1;const first=content.worlds.find(w=>Number(w.grade||1)===activeGrade());if(first&&!content.worlds.some(w=>w.id===state.currentWorld&&Number(w.grade||1)===activeGrade()))state.currentWorld=first.id;state.stars=currentChild.stars??state.stars;state.xp=currentChild.xp??state.xp;state.level=currentChild.level??state.level;authNotice(`${currentChild.nickname} 프로필로 시작해요!`,'info')}else{$('onboarding')?.classList.remove('hidden')}}
async function createChildProfile(){if(!supabaseClient||!authUser)return;const nickname=$('childNickname')?.value.trim();const grade=Number($('childGrade')?.value||1),quarter=Number($('childQuarter')?.value||1);if(!nickname){$('onboardingError').textContent='닉네임을 입력해주세요.';return}$('onboardingError').textContent='';$('createChildBtn').disabled=true;$('createChildBtn').textContent='만드는 중...';const {data,error}=await supabaseClient.from('child_profiles').insert({parent_id:authUser.id,nickname,grade,current_quarter:quarter,avatar_key:selectedAvatar}).select().single();$('createChildBtn').disabled=false;$('createChildBtn').textContent='프로필 만들고 시작!';if(error){$('onboardingError').textContent='프로필을 만들지 못했어요. 잠시 후 다시 시도해주세요.';console.warn(error.message);return}currentChild=data;resetState();state.selectedGrade=grade;const first=content.worlds.find(w=>Number(w.grade||1)===grade);if(first)state.currentWorld=first.id;save();$('onboarding').classList.add('hidden');authNotice(`${nickname}의 수학 모험을 시작해요! 🎉`);showMap()}
async function initAuth(){if(!supabaseClient){restoreFor(null);return}const {data}=await supabaseClient.auth.getSession();authUser=data.session?.user||null;restoreFor(authUser);if(authUser)await ensureParentProfile(authUser);renderAuth();await loadChildProfile();supabaseClient.auth.onAuthStateChange(async(event,session)=>{if(event==='INITIAL_SESSION')return;const previousUser=authUser;saveFor(previousUser);authUser=session?.user||null;restoreFor(authUser);if(authUser)await ensureParentProfile(authUser);renderAuth();await loadChildProfile();if(content.worlds.length){if(!content.worlds.some(w=>w.id===state.currentWorld))state.currentWorld=content.worlds[0]?.id;showMap()}if(event==='SIGNED_IN')authNotice('이 Google 계정의 학습 기록으로 시작해요!');if(event==='SIGNED_OUT')authNotice('로그아웃했어요. 계정별 학습 기록은 따로 보관돼요.','info')})}
async function toggleAuth(){if(!supabaseClient)return authNotice('로그인 모듈을 불러오지 못했어요.','warn');if(authUser){await supabaseClient.auth.signOut();return}const {error}=await supabaseClient.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});if(error)authNotice('Google 로그인을 시작하지 못했어요.','warn')}

function setSuki(x='greet'){const i=$('sukiImage'),f=$('sukiFallback');i.onload=()=>{i.hidden=false;f.hidden=true};i.onerror=()=>{i.hidden=true;f.hidden=false};i.src=SUKI_BASE+(sukiImages[x]||sukiImages.greet)}function mood(m='idle',x='greet'){const a=$('mascot');a.classList.remove('is-happy','is-thinking','is-hint');if(m==='happy')a.classList.add('is-happy');if(m==='thinking')a.classList.add('is-thinking');if(m==='hint')a.classList.add('is-hint');setSuki(x)}
function activeGrade(){return Number(state.selectedGrade||currentChild?.grade||1)}function gradeWorlds(){return content.worlds.filter(w=>Number(w.grade||1)===activeGrade())}function world(){const list=gradeWorlds();return list.find(w=>w.id===state.currentWorld)||list[0]||content.worlds[0]}function masteryKey(){return`${state.currentWorld}:${state.gameType}`}function mastery(){return state.mastery[masteryKey()]??50}function updateMastery(ok,hinted=false){const k=masteryKey(),v=state.mastery[k]??50;state.mastery[k]=Math.max(0,Math.min(100,v+(ok?(hinted?3:5):-2)))}
function difficulty(){return window.AdaptiveEngine?.difficulty(state.adaptive,masteryKey())||1}function adaptiveRecord(ok){return window.AdaptiveEngine?.record(state.adaptive,masteryKey(),{correct:ok,hinted:state.roundHinted,helpType:state.lastHelp})||{action:'stay'}}
function todayKey(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function ensureDailyMission(){const key=todayKey();if(!state.dailyMission||state.dailyMission.date!==key||state.dailyMission.grade!==activeGrade()){state.dailyMission={date:key,grade:activeGrade(),solved:0,completed:false,claimed:false,active:false}}return state.dailyMission}
function missionProblem(){const worlds=gradeWorlds();const w=worlds[Math.floor(Math.random()*worlds.length)]||world();const concept=w.concepts?.[Math.floor(Math.random()*Math.max(1,w.concepts.length))]||null;const p=window.ProblemEngine?.make(w.id,difficulty(),concept)||problem();return {...p,missionWorld:w.name,missionWorldId:w.id,missionConcept:concept}}
function startDailyMission(){const m=ensureDailyMission();if(m.completed){authNotice(m.claimed?'오늘의 미션을 이미 완료했어요!':'오늘의 미션 보상을 받아보세요!','info');showHome();return}m.active=true;state.gameType='daily-mission';state.gameRound=m.solved;hideMainScreens();$('game').classList.remove('hidden');$('startBtn').dataset.action='';$('startBtn').textContent=m.solved?'계속하기':'미션 시작';$('startBtn').classList.remove('hidden');$('quitBtn')?.classList.remove('hidden');$('hintBtn').classList.add('hidden');$('mode').textContent='오늘의 미션 · 복합문제';$('speech').textContent='오늘은 여러 단원의 문제 5개에 도전해보자!';$('visual').textContent='🎯✨';$('question').textContent='';$('answers').innerHTML='';mood('idle','explore');updateHud()}
function completeDailyMission(){const m=ensureDailyMission();m.completed=true;m.active=false;if(!m.claimed){m.claimed=true;state.stars+=10;state.xp+=30;while(state.xp>=100){state.xp-=100;state.level++}}$('speech').textContent='오늘의 미션 완료! 🎉';$('visual').textContent='🎁 ⭐ +10  ·  XP +30';$('question').textContent='5개의 복합문제를 모두 해결했어요!';$('answers').innerHTML='';$('hintBtn').classList.add('hidden');$('startBtn').textContent='메인으로';$('startBtn').dataset.action='home';$('startBtn').classList.remove('hidden');$('quitBtn')?.classList.add('hidden');mood('happy','complete');updateHud()}
function updateHud(){const dm=ensureDailyMission();$('stars').textContent=state.stars;$('level').textContent=`Lv.${state.level}`;$('xpBar').style.width=`${state.xp%100}%`;$('missionStars').textContent=Math.min(state.missionStars,MISSION_TARGET);$('missionBar').style.width=`${Math.min(100,state.missionStars/MISSION_TARGET*100)}%`;$('treasureBtn').classList.toggle('hidden',state.missionStars<MISSION_TARGET);$('attempts').textContent=state.attempts;$('correct').textContent=state.correct;$('hints').textContent=state.hints;const r=state.attempts?Math.round(state.correct/state.attempts*100):0;$('parentSummary').textContent=`오늘 ${state.attempts}번 도전, ${state.correct}번 해결했어요. 성공률 ${r}%. 현재 활동 숙련도 ${mastery()}%, 맞춤 난이도 ${difficulty()}단계입니다.`;save()}
function isWorldUnlocked(w){if(w.order===1)return true;const prev=gradeWorlds().find(x=>x.order===w.order-1);if(!prev)return false;const vals=Object.entries(state.mastery).filter(([k])=>k.startsWith(prev.id+':')).map(([,v])=>v);return vals.length>0&&vals.reduce((a,b)=>a+b,0)/vals.length>=70}
function stageConcept(w,i){if(w.id==='g1-number'){return ['count-9','read-write-9','order-9','read-write-9','grade1-number-review'][i]||'count-9'}return w.concepts[Math.min(i,w.concepts.length-1)]||w.concepts[0]}function renderWorld(){const w=world();$('worldNumber').textContent=`WORLD ${w.order}`;$('worldTitle').textContent=`${w.icon} ${w.name}`;$('worldCopy').textContent='수키가 네 플레이를 보면서 딱 맞는 난이도를 찾아줄게!';$('worldTabs').innerHTML='';gradeWorlds().forEach(x=>{const b=document.createElement('button');b.className='world-tab'+(x.id===w.id?' active':'');b.textContent=isWorldUnlocked(x)?`${x.icon}${x.order}`:`🔒${x.order}`;b.disabled=!isWorldUnlocked(x);b.onclick=()=>{state.currentWorld=x.id;renderWorld();save()};$('worldTabs').appendChild(b)});$('stageMap').innerHTML='';w.stages.forEach((name,i)=>{const b=document.createElement('button'),mode=content.modes[i%Math.max(1,content.modes.length)]?.id||fallbackModes[i%4],d=window.AdaptiveEngine?.difficulty(state.adaptive,`${w.id}:${mode}`)||1;b.className='stage unlocked';b.innerHTML=`<b>${i+1}</b><span>${name}</span><small>${i===w.stages.length-1?'월드 최종미션':`숙련도 ${state.mastery[`${w.id}:${mode}`]??50}% · 난이도 ${d}`}</small>`;const concept=stageConcept(w,i);b.onclick=()=>openGame(mode,concept,i);$('stageMap').appendChild(b)})}
function problem(){if(state.gameType==='daily-mission')return missionProblem();return window.ProblemEngine?.make(world().id,difficulty(),state.currentConcept)||{prompt:'1 + 1 = ?',answer:'2',options:['1','2','3','4'],difficulty:1}}
function choices(ans){const s=new Set([ans]);while(s.size<4)s.add(Math.max(0,Math.min(30,ans-3+Math.floor(Math.random()*7))));return[...s].sort(()=>Math.random()-.5)}function buttons(items,fn){$('answers').innerHTML='';items.forEach(v=>{const b=document.createElement('button');b.className='answer';b.textContent=v;b.onclick=()=>fn(v);$('answers').appendChild(b)})}function modeName(id){return content.modes.find(x=>x.id===id)?.name||id}
function hideMainScreens(){stopNumberCatch(false);stopHexaGame(false);stopTowerGame(false);['home','world','game','playPanel','leaguePanel','parentPanel'].forEach(id=>$(id)?.classList.add('hidden'))}
const leagueNameA=['별','달','구름','숫자','수학','반짝','초코','젤리','토리','루미','모모'];
const leagueNameB=['콩','별','냥','봇','링','팡','꿈','곰','핀'];
const leagueAvatars=['🌟','🌙','🐱','🧁','🐻','🚀','🦊','🐧','🍬','💫','🦄','🐳','🌈','🎈','🧩'];
function leagueBots100(){
  const names=[],bots=[];
  for(const a of leagueNameA)for(const b of leagueNameB)names.push(a+b);
  for(let i=0;i<99;i++){
    const tier=99-i;
    bots.push({
      name:names[i%names.length]+(i>=names.length?String(Math.floor(i/names.length)+1):''),
      avatar:leagueAvatars[i%leagueAvatars.length],
      base:140+tier*18
    });
  }
  return bots;
}
function leagueSeed(){const d=new Date();const key=[d.getFullYear(),d.getMonth()+1,d.getDate(),activeGrade(),currentChild?.current_quarter||1].join('-');let h=0;for(const ch of key)h=(h*31+ch.charCodeAt(0))>>>0;return h}
function seeded(seed){return function(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function leaguePlayerScore(){return Math.max(0,Math.round(state.stars*7+state.correct*18+state.level*42+Object.values(state.mastery||{}).reduce((a,b)=>a+Math.max(0,b-50),0)*0.7))}
function buildLeagueRows(tab){const rand=seeded(leagueSeed());const bots=leagueBots100().map(function(b){const wobble=Math.round((rand()-.5)*90);const growth=Math.max(8,Math.round(25+rand()*125));return {...b,bot:true,score:Math.max(100,b.base+wobble),growth:growth}});const me={name:currentChild?.nickname||'나',avatar:currentChild?.avatar_key==='star'?'⭐':currentChild?.avatar_key==='cloud'?'☁️':'🤖',bot:false,score:leaguePlayerScore(),growth:Math.max(0,Math.round((mastery()-50)*2+state.correct*4))};const rows=bots.concat([me]).sort(function(a,b){return tab==='growth'?b.growth-a.growth:b.score-a.score});return rows.map(function(x,i){return {...x,rank:i+1}})}
function renderLeague(tab){tab=tab||'rank';const rows=buildLeagueRows(tab);const list=$('leagueList');if(!list)return;const q=currentChild?.current_quarter||1;$('leagueScope').textContent=activeGrade()+'학년 · '+q+'분기 · 주간 TOP 100';list.innerHTML='';rows.forEach(function(x){const medal=x.rank===1?'🥇':x.rank===2?'🥈':x.rank===3?'🥉':x.rank;const el=document.createElement('div');el.className='league-row'+(x.rank<=3?' top3':'')+(x.bot?'':' me');const scoreText=tab==='growth'?('+'+x.growth):(x.score.toLocaleString()+'점');const scoreSub=tab==='growth'?'이번 주 성장':'리그 포인트';el.innerHTML='<div class="league-rank">'+medal+'</div><div class="league-avatar">'+x.avatar+'</div><div class="league-person"><b>'+x.name+''+'</b><small>'+activeGrade()+'학년 · '+q+'분기</small></div><div class="league-score"><b>'+scoreText+'</b><small>'+scoreSub+'</small></div>';list.appendChild(el)});const me=rows.find(function(x){return !x.bot});$('myLeagueCard').innerHTML='<div><b>내 순위 · '+me.rank+'위</b><span>이번 주 '+(tab==='growth'?('성장 +'+me.growth):('리그 '+me.score.toLocaleString()+'점'))+'</span></div><strong>'+(me.rank<=3?'🔥':'🚀')+'</strong>'}
let catchState={running:false,lives:5,score:0,combo:0,level:1,correctCount:0,pace:'slow',answer:0,timer:null,spawnTimer:null};
const catchRobotPoses={idle:'suki_minigame_idle.webp',correct:'suki_minigame_correct.webp',cheer:'suki_04_cheer.png',think:'suki_05_think.png',surprise:'suki_07_surprise.png',jump:'avatar_08_jump.png',hint:'suki_09_hint.png',complete:'suki_12_complete.png'};
function catchRobotReact(type='idle',message='정답 숫자를 잡아봐!'){
  const wrap=$('catchRobot'),img=$('catchRobotImage'),bubble=$('catchRobotBubble');
  if(!wrap||!img||!bubble)return;
  img.src=SUKI_BASE+(catchRobotPoses[type]||catchRobotPoses.idle);
  const embeddedFeedback=type==='correct';
  bubble.hidden=embeddedFeedback;
  if(!embeddedFeedback)bubble.textContent=message;
  wrap.classList.remove('react-correct','react-wrong','react-combo','react-start','react-end');
  void wrap.offsetWidth;
  if(type==='correct')wrap.classList.add('react-correct');
  else if(type==='surprise'||type==='think')wrap.classList.add('react-wrong');
  else if(type==='cheer'||type==='jump')wrap.classList.add('react-combo');
  else if(type==='complete')wrap.classList.add('react-end');
  else wrap.classList.add('react-start');
}
function ensureCatchRobot(){
  const arena=$('catchArena');if(!arena)return;
  if(!$('catchRobot')){
    const wrap=document.createElement('div');wrap.id='catchRobot';wrap.className='catch-robot';wrap.innerHTML='<img id="catchRobotImage" src="'+SUKI_BASE+catchRobotPoses.idle+'" alt="수키 로봇"/><div id="catchRobotBubble" class="catch-robot-bubble">정답 숫자를 잡아봐!</div>';
    arena.appendChild(wrap);
  }
}

function showPlay(){hideMainScreens();$('playPanel')?.classList.remove('hidden');$('playMenu')?.classList.remove('hidden');$('numberCatch')?.classList.add('hidden');$('numberHexa')?.classList.add('hidden');$('numberTower')?.classList.add('hidden');$('mathCross')?.classList.add('hidden');document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.nav==='play'))}
function catchQuestion(){
 const grade=activeGrade();let a,b,op='+',answer;
 if(grade<=1){a=1+Math.floor(Math.random()*9);b=1+Math.floor(Math.random()*Math.max(1,10-a));answer=a+b}
 else if(grade===2){if(Math.random()<.55){a=2+Math.floor(Math.random()*8);b=2+Math.floor(Math.random()*8);op='×';answer=a*b}else{a=10+Math.floor(Math.random()*40);b=1+Math.floor(Math.random()*20);answer=a+b}}
 else if(grade===3){if(Math.random()<.5){b=2+Math.floor(Math.random()*8);answer=2+Math.floor(Math.random()*10);a=b*answer;op='÷'}else{a=10+Math.floor(Math.random()*40);b=2+Math.floor(Math.random()*8);op='×';answer=a*b}}
 else {a=10+Math.floor(Math.random()*80);b=2+Math.floor(Math.random()*18);if(Math.random()<.5){op='+';answer=a+b}else{op='-';if(b>a)[a,b]=[b,a];answer=a-b}}
 catchState.answer=answer;$('catchQuestion').textContent=a+' '+op+' '+b+' = ?';
}
function catchStageLabel(){const names=['','천천히','익숙하게','조금 빠르게','집중','도전','스피드'];return (catchState.level||1)+'단계 · '+(names[catchState.level]||'도전')}
function updateCatchHud(){
 $('catchLives').textContent='❤️'.repeat(catchState.lives)+'♡'.repeat(Math.max(0,5-catchState.lives));
 $('catchScore').textContent=catchState.score+'점';
 $('catchCombo').textContent='콤보 '+catchState.combo;
 if($('catchStage'))$('catchStage').textContent=catchStageLabel();
 document.querySelectorAll('.catch-speed').forEach(btn=>btn.classList.toggle('active',btn.dataset.catchSpeed===catchState.pace));
}
function catchChoices(){const s=new Set([catchState.answer]);while(s.size<4){const delta=[-3,-2,-1,1,2,3,4][Math.floor(Math.random()*7)];s.add(Math.max(0,catchState.answer+delta))}return [...s].sort(()=>Math.random()-.5)}
function spawnCatchWave(){
 if(!catchState.running)return;
 const arena=$('catchArena');if(!arena)return;
 ensureCatchRobot();arena.querySelectorAll('.fall-number,.catch-end-card').forEach(x=>x.remove());
 const vals=catchChoices(),correctIndex=vals.indexOf(catchState.answer);
 vals.forEach((v,i)=>{
   const btn=document.createElement('button');btn.className='fall-number';btn.textContent=v;btn.style.left=(8+i*23+Math.floor(Math.random()*6))+'%';
   const stageDurations=[0,11.5,10.5,9.6,8.8,8.0,7.3];
   const paceMultiplier={slow:1.28,normal:1.1,fast:.92}[catchState.pace]||1.28;
   const duration=(stageDurations[Math.min(catchState.level,6)]||5)*paceMultiplier;
   btn.style.animationDuration=duration+'s';
   btn.dataset.correct=String(i===correctIndex);
   btn.onclick=()=>{if(!catchState.running)return;if(btn.dataset.correct==='true'){
     btn.classList.add('catch-hit');
     catchState.score+=10+catchState.combo*2;
     catchState.combo++;
     catchState.correctCount++;
     const nextLevel=Math.min(6,1+Math.floor(catchState.correctCount/5));
     const leveled=nextLevel>catchState.level;
     catchState.level=nextLevel;
     if(leveled)catchRobotReact('jump','🎉 '+catchState.level+'단계! 조금씩 속도가 올라가!');
     else if(catchState.combo>0&&catchState.combo%5===0)catchRobotReact('cheer','🔥 '+catchState.combo+'콤보! 최고야!');
     else catchRobotReact('correct',pickCatchPraise());
     updateCatchHud();clearTimeout(catchState.timer);
     const feedbackMs={slow:950,normal:800,fast:650}[catchState.pace]||950;setTimeout(()=>{catchRobotReact('idle','다음 문제! 정답 숫자를 잡아봐!');catchQuestion();spawnCatchWave()},leveled?1100:feedbackMs)
   }else{btn.classList.add('catch-wrong');catchRobotReact('surprise','앗! 다시 잘 보고 잡아보자!');loseCatchLife()}};
   arena.appendChild(btn);
 });
 clearTimeout(catchState.timer);
 const currentBtn=arena.querySelector('.fall-number');
 const fallSeconds=Number.parseFloat(currentBtn?.style.animationDuration)||9;
 const missMs=Math.round(fallSeconds*1000+250);
 catchState.timer=setTimeout(()=>{if(!catchState.running)return;catchRobotReact('surprise','정답 숫자가 지나갔어!');loseCatchLife();if(catchState.running){catchQuestion();spawnCatchWave()}},missMs);
}
function pickCatchPraise(){const a=['정답! 잘했어!','좋아! 바로 그거야!','멋져! 계속 가자!','정확해!'];return a[Math.floor(Math.random()*a.length)]}
function loseCatchLife(){catchState.lives--;catchState.combo=0;updateCatchHud();$('catchArena')?.classList.add('catch-flash');setTimeout(()=>$('catchArena')?.classList.remove('catch-flash'),260);if(catchState.lives<=0)endNumberCatch();else setTimeout(()=>catchRobotReact('think','괜찮아! 다음 숫자를 잘 보자.'),260)}
function startNumberCatch(){catchState={running:true,lives:5,score:0,combo:0,level:1,correctCount:0,pace:catchState.pace||'slow',answer:0,timer:null,spawnTimer:null};ensureCatchRobot();$('catchStartBtn').classList.add('hidden');$('catchQuitBtn').classList.remove('hidden');catchQuestion();updateCatchHud();catchRobotReact('idle','시작! 정답 숫자를 잡아봐!');spawnCatchWave()}
function endNumberCatch(){catchState.running=false;clearTimeout(catchState.timer);ensureCatchRobot();$('catchArena')?.querySelectorAll('.fall-number').forEach(x=>x.remove());const end=document.createElement('div');end.className='catch-end-card';end.innerHTML='<b>게임 종료!</b><span>점수 '+catchState.score+'점</span>';$('catchArena')?.appendChild(end);catchRobotReact('complete',catchState.score>=100?'대단해! 기록이 정말 좋아!':'잘했어! 다음엔 더 높이 가보자!');$('catchStartBtn').textContent='다시 하기';$('catchStartBtn').classList.remove('hidden');$('catchQuitBtn').classList.remove('hidden');state.stars+=Math.floor(catchState.score/50);state.xp+=Math.min(40,Math.floor(catchState.score/10));while(state.xp>=100){state.xp-=100;state.level++}updateHud()}
function stopNumberCatch(resetView=true){if(catchState?.timer)clearTimeout(catchState.timer);if(catchState)catchState.running=false;if(resetView&&$('catchArena'))$('catchArena').innerHTML=''}
function openNumberCatch(){hideMainScreens();$('playPanel')?.classList.remove('hidden');$('playMenu')?.classList.add('hidden');$('numberCatch')?.classList.remove('hidden');$('catchArena').innerHTML='';ensureCatchRobot();catchRobotReact('idle','정답 숫자를 잡아봐!');$('catchStartBtn').textContent='게임 시작';$('catchStartBtn').classList.remove('hidden');$('catchQuitBtn').classList.add('hidden');catchState={running:false,lives:5,score:0,combo:0,level:1,correctCount:0,pace:'slow',answer:0,timer:null,spawnTimer:null};catchQuestion();updateCatchHud()}

const hexaRoundPlan=[
  {count:10,time:40},{count:10,time:35},{count:12,time:35},{count:15,time:35},{count:15,time:32},
  {count:20,time:30},{count:20,time:28},{count:20,time:26},{count:20,time:24},{count:20,time:22}
];
let hexaState={round:1,running:false,next:1,timeLeft:40000,endAt:0,timer:null,mistakes:0,totalMs:0,roundCleared:false,finished:false};

function miniShuffle(items){
  const a=[...items];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a;
}
function hexaConfig(){return hexaRoundPlan[Math.max(0,Math.min(hexaRoundPlan.length-1,hexaState.round-1))]}
function setHexaCoach(kind='idle',message='1부터 차례대로 눌러보자!'){
  const img=$('hexaCoachImage'),status=$('hexaStatus');
  if(img)img.src=SUKI_BASE+(kind==='correct'?'suki_minigame_correct.webp':kind==='surprise'?'suki_07_surprise.png':'suki_minigame_idle.webp');
  if(status)status.textContent=message;
}
function updateHexaHud(){
  const cfg=hexaConfig();
  if($('hexaRound'))$('hexaRound').textContent='ROUND '+hexaState.round+'/10';
  if($('hexaTimer'))$('hexaTimer').textContent=Math.max(0,Math.ceil(hexaState.timeLeft/1000))+'초';
  if($('hexaNext'))$('hexaNext').textContent=hexaState.next<=cfg.count?hexaState.next:'✓';
  const within=Math.min(1,Math.max(0,(hexaState.next-1)/cfg.count));
  if($('hexaProgressBar'))$('hexaProgressBar').style.width=(((hexaState.round-1)+within)/10*100)+'%';
}
function hexaRowsForCount(count){
  if(count<=10)return [3,4,3];
  if(count<=12)return [3,4,3,2];
  if(count<=15)return [3,4,5,3];
  return [4,5,6,5];
}
function renderHexaBoard(){
  const board=$('hexaBoard');if(!board)return;
  const cfg=hexaConfig(),values=miniShuffle(Array.from({length:cfg.count},(_,i)=>i+1));
  const rows=hexaRowsForCount(cfg.count);
  board.innerHTML='';
  board.dataset.count=String(cfg.count);
  board.classList.toggle('hexa-dense',cfg.count>=20);
  let cursor=0;
  rows.forEach((rowCount,rowIndex)=>{
    const row=document.createElement('div');
    row.className='hexa-row'+(rowIndex%2?' hexa-row-offset':'');
    for(let i=0;i<rowCount&&cursor<values.length;i++){
      const v=values[cursor++];
      const b=document.createElement('button');
      b.type='button';b.className='hex-number';b.textContent=v;b.setAttribute('aria-label',v+'번');
      b.addEventListener('click',()=>checkHexaNumber(v,b));
      row.appendChild(b);
    }
    board.appendChild(row);
  });
}
function prepareHexaRound(){
  clearInterval(hexaState.timer);hexaState.timer=null;hexaState.running=false;hexaState.next=1;hexaState.roundCleared=false;
  const cfg=hexaConfig();hexaState.timeLeft=cfg.time*1000;
  renderHexaBoard();updateHexaHud();setHexaCoach('idle',hexaState.round+'라운드! 1부터 '+cfg.count+'까지 차례대로 눌러보자!');
  if($('hexaStartBtn')){$('hexaStartBtn').textContent=hexaState.round+'라운드 시작';$('hexaStartBtn').classList.remove('hidden')}
  if($('hexaQuitBtn'))$('hexaQuitBtn').textContent='그만하기';
}
function startHexaRound(){
  if(hexaState.running)return;
  hexaState.running=true;hexaState.endAt=Date.now()+hexaState.timeLeft;
  $('hexaStartBtn')?.classList.add('hidden');setHexaCoach('idle','시작! '+hexaState.next+'을 찾아봐!');
  hexaState.timer=setInterval(()=>{
    hexaState.timeLeft=Math.max(0,hexaState.endAt-Date.now());updateHexaHud();
    if(hexaState.timeLeft<=0)finishHexaRound(false);
  },100);
}
function checkHexaNumber(value,btn){
  if(!hexaState.running)return;
  const cfg=hexaConfig();
  if(value===hexaState.next){
    btn.disabled=true;btn.classList.add('hex-done');hexaState.next++;updateHexaHud();
    if(hexaState.next>cfg.count){finishHexaRound(true);return}
    setHexaCoach('idle','좋아! 다음은 '+hexaState.next+'!');
  }else{
    hexaState.mistakes++;btn.classList.remove('hex-wrong');void btn.offsetWidth;btn.classList.add('hex-wrong');
    setHexaCoach('surprise',hexaState.next+'을 먼저 찾아보자!');
  }
}
function finishHexaRound(success){
  if(!hexaState.running)return;
  hexaState.running=false;clearInterval(hexaState.timer);hexaState.timer=null;
  const cfg=hexaConfig();
  if(success){
    hexaState.totalMs+=Math.max(0,cfg.time*1000-hexaState.timeLeft);hexaState.roundCleared=true;
    if(hexaState.round>=10){
      hexaState.finished=true;state.stars+=12;state.xp+=60;while(state.xp>=100){state.xp-=100;state.level++}
      setHexaCoach('correct','10라운드 완주! 여기서 게임이 종료됐어. 정말 잘했어! ⭐ +12');
      $('hexaStartBtn').textContent='처음부터 다시';$('hexaStartBtn').classList.remove('hidden');
      if($('hexaQuitBtn'))$('hexaQuitBtn').textContent='놀이로 돌아가기';
      updateHud();
    }else{
      setHexaCoach('correct',hexaState.round+'라운드 성공! 다음 라운드로 가자!');
      $('hexaStartBtn').textContent='다음 라운드';$('hexaStartBtn').classList.remove('hidden');
    }
  }else{
    setHexaCoach('surprise','시간이 끝났어! 같은 라운드를 천천히 다시 해보자.');
    $('hexaStartBtn').textContent='다시 도전';$('hexaStartBtn').classList.remove('hidden');
  }
}
function handleHexaStart(){
  if(hexaState.finished){
    hexaState={round:1,running:false,next:1,timeLeft:40000,endAt:0,timer:null,mistakes:0,totalMs:0,roundCleared:false,finished:false};
    prepareHexaRound();startHexaRound();return;
  }
  if(hexaState.roundCleared){hexaState.round++;prepareHexaRound();startHexaRound();return}
  if(!hexaState.running&&hexaState.timeLeft<=0)prepareHexaRound();
  startHexaRound();
}
function openHexaGame(){
  hideMainScreens();$('playPanel')?.classList.remove('hidden');$('playMenu')?.classList.add('hidden');$('numberCatch')?.classList.add('hidden');$('numberTower')?.classList.add('hidden');$('mathCross')?.classList.add('hidden');$('numberHexa')?.classList.remove('hidden');
  hexaState={round:1,running:false,next:1,timeLeft:40000,endAt:0,timer:null,mistakes:0,totalMs:0,roundCleared:false,finished:false};prepareHexaRound();
}
function stopHexaGame(resetView=true){
  if(hexaState?.timer)clearInterval(hexaState.timer);
  if(hexaState){hexaState.timer=null;hexaState.running=false}
  if(resetView&&$('hexaBoard'))$('hexaBoard').innerHTML='';
}

let towerState={running:false,locked:false,tiles:[],tray:[],score:0,combo:0,gameOver:false,burstTimer:null};

function towerLayout(){
  const layout=[];
  [18,50,82].forEach(y=>[7,24,41,58,75,92].forEach(x=>layout.push({x,y,z:0})));
  [22,50,78].forEach(y=>[24,50,76].forEach(x=>layout.push({x,y,z:1})));
  [33,50,67].forEach(x=>layout.push({x,y:50,z:2}));
  return layout;
}
function buildTowerTiles(){
  const values=[];for(let n=1;n<=5;n++)for(let i=0;i<6;i++)values.push(n);
  const shuffled=miniShuffle(values),layout=towerLayout();
  return layout.map((pos,index)=>({id:index,value:shuffled[index],active:true,...pos,tilt:(index%3-1)*1.6}));
}
function towerTileIsFree(tile){
  if(!tile?.active)return false;
  return !towerState.tiles.some(other=>{
    if(!other.active||other.z<=tile.z)return false;
    const dx=Math.abs(other.x-tile.x),dy=Math.abs(other.y-tile.y);
    return dx<18&&dy<20;
  });
}
function setTowerCoach(kind='idle',message='같은 숫자 3개를 아래 칸에 모아봐!'){
  const img=$('towerCoachImage'),status=$('towerStatus');
  if(img)img.src=SUKI_BASE+(kind==='correct'?'suki_minigame_correct.webp':kind==='surprise'?'suki_07_surprise.png':'suki_minigame_idle.webp');
  if(status)status.textContent=message;
}
function updateTowerHud(){
  if($('towerScore'))$('towerScore').textContent=towerState.score+'점';
  if($('towerCombo'))$('towerCombo').textContent='콤보 '+towerState.combo;
  if($('towerTrayCount'))$('towerTrayCount').textContent=Math.min(towerState.tray.length,7)+'/7';
  const remain=towerState.tiles.filter(t=>t.active).length;
  if($('towerRemaining'))$('towerRemaining').textContent=remain+'개 남음';
}
function renderTowerBoard(){
  const board=$('towerBoard');if(!board)return;
  board.innerHTML='';
  [...towerState.tiles].sort((p,q)=>p.z-q.z||p.y-q.y||p.x-q.x).forEach(tile=>{
    if(!tile.active)return;
    const free=towerState.running&&!towerState.locked&&towerTileIsFree(tile);
    const b=document.createElement('button');
    b.type='button';
    b.className='tower-tile num-'+tile.value+' layer-'+tile.z+(free?' tower-free':' tower-covered');
    b.style.setProperty('--x',tile.x+'%');b.style.setProperty('--y',tile.y+'%');b.style.setProperty('--z',tile.z);b.style.setProperty('--tilt',tile.tilt+'deg');
    b.innerHTML='<span>'+tile.value+'</span><small>● ● ●</small>';
    b.setAttribute('aria-label',tile.value+' 숫자 타일'+(free?' 선택 가능':' 가려져 있음'));
    b.disabled=!free;
    if(free)b.addEventListener('click',()=>pickTowerTile(tile.id));
    board.appendChild(b);
  });
  board.classList.toggle('locked',towerState.locked||!towerState.running);
  updateTowerHud();
}
function renderTowerTray(){
  const tray=$('towerTray');if(!tray)return;tray.innerHTML='';
  for(let i=0;i<7;i++){
    const slot=document.createElement('div');slot.className='tower-slot';
    if(i<towerState.tray.length){const v=towerState.tray[i];slot.textContent=v;slot.classList.add('filled','num-'+v)}
    else slot.textContent='·';
    tray.appendChild(slot);
  }
  $('towerOverflow')?.classList.toggle('hidden',towerState.tray.length<8);
  updateTowerHud();
}
function pickTowerTile(id){
  if(!towerState.running||towerState.locked||towerState.gameOver)return;
  const tile=towerState.tiles.find(t=>t.id===id);
  if(!tile||!towerTileIsFree(tile))return;
  tile.active=false;towerState.tray.push(tile.value);renderTowerBoard();renderTowerTray();
  if(towerState.tray.length>=8){endTowerGame(false);return}
  const same=towerState.tray.filter(v=>v===tile.value).length;
  if(same>=3){
    towerState.locked=true;renderTowerBoard();setTowerCoach('correct',tile.value+' 세 개! 펑! 🎉');
    clearTimeout(towerState.burstTimer);
    towerState.burstTimer=setTimeout(()=>burstTowerTriple(tile.value),420);
    return;
  }
  towerState.combo=0;updateTowerHud();
  const freeCount=towerState.tiles.filter(t=>towerTileIsFree(t)).length;
  setTowerCoach('idle','위에 가리지 않은 타일만 고를 수 있어! 선택 가능 '+freeCount+'개');
}
function burstTowerTriple(value){
  if(!towerState.running)return;
  let removed=0;
  towerState.tray=towerState.tray.filter(v=>{if(v===value&&removed<3){removed++;return false}return true});
  towerState.score+=30+towerState.combo*10;towerState.combo++;towerState.locked=false;towerState.burstTimer=null;
  renderTowerTray();renderTowerBoard();
  if(towerState.tiles.every(t=>!t.active)&&towerState.tray.length===0){endTowerGame(true);return}
  const freeCount=towerState.tiles.filter(t=>towerTileIsFree(t)).length;
  setTowerCoach('correct',towerState.combo>1?towerState.combo+'콤보! 아래 타일이 열렸어!':'펑! 아래에 있던 숫자가 열렸어. 선택 가능 '+freeCount+'개');
}
function startTowerGame(){
  clearTimeout(towerState.burstTimer);
  towerState={running:true,locked:false,tiles:buildTowerTiles(),tray:[],score:0,combo:0,gameOver:false,burstTimer:null};
  $('towerOverflow')?.classList.add('hidden');$('towerStartBtn')?.classList.add('hidden');
  if($('towerQuitBtn'))$('towerQuitBtn').textContent='그만하기';
  renderTowerBoard();renderTowerTray();setTowerCoach('idle','마작처럼 위에 드러난 숫자부터 골라서 같은 숫자 3개를 모아봐!');
}
function endTowerGame(won){
  towerState.running=false;towerState.gameOver=true;towerState.locked=true;clearTimeout(towerState.burstTimer);towerState.burstTimer=null;
  renderTowerBoard();renderTowerTray();
  if(won){
    state.stars+=6;state.xp+=30;while(state.xp>=100){state.xp-=100;state.level++}
    setTowerCoach('correct','숫자 타워 클리어! 모든 층을 없앴어! ⭐ +6');updateHud();
    $('towerStartBtn').textContent='다시 하기';
  }else{
    setTowerCoach('surprise','보관칸이 8개가 됐어! OUT! 위쪽 숫자 조합부터 다시 노려보자.');
    $('towerStartBtn').textContent='다시 도전';
  }
  if($('towerQuitBtn'))$('towerQuitBtn').textContent='놀이로 돌아가기';
  $('towerStartBtn')?.classList.remove('hidden');
}
function openTowerGame(){
  hideMainScreens();$('playPanel')?.classList.remove('hidden');$('playMenu')?.classList.add('hidden');$('numberCatch')?.classList.add('hidden');$('numberHexa')?.classList.add('hidden');$('mathCross')?.classList.add('hidden');$('numberTower')?.classList.remove('hidden');
  clearTimeout(towerState.burstTimer);
  towerState={running:false,locked:false,tiles:buildTowerTiles(),tray:[],score:0,combo:0,gameOver:false,burstTimer:null};
  renderTowerBoard();renderTowerTray();setTowerCoach('idle','숫자 블록이 층층이 쌓여 있어. 위에 드러난 타일부터 선택할 수 있어!');
  $('towerStartBtn').textContent='게임 시작';$('towerStartBtn')?.classList.remove('hidden');
  if($('towerQuitBtn'))$('towerQuitBtn').textContent='그만하기';
}
function stopTowerGame(resetView=true){
  clearTimeout(towerState?.burstTimer);
  if(towerState){towerState.running=false;towerState.locked=false;towerState.burstTimer=null}
  if(resetView){if($('towerBoard'))$('towerBoard').innerHTML='';if($('towerTray'))$('towerTray').innerHTML=''}
}


let crossState={round:1,maxRounds:5,difficulty:'easy',selectedSlot:null,slots:[],bank:[],solved:false};

function crossCoach(kind='idle',message='빈칸을 누르고 아래 숫자 타일을 골라봐!'){
  const img=$('crossCoachImage'),status=$('crossStatus');
  if(img)img.src=SUKI_BASE+(kind==='correct'?'suki_minigame_correct.webp':kind==='surprise'?'suki_07_surprise.png':'suki_minigame_idle.webp');
  if(status)status.textContent=message;
}
function crossDifficultyLabel(diff=crossState.difficulty){return diff==='hard'?'도전':diff==='normal'?'보통':'쉬움'}
function makeCrossPuzzle(round=1,diff=crossState.difficulty){
  const cap=diff==='easy'?(round<=2?10:15):diff==='normal'?(round<=2?15:24):(round<=2?20:35);
  const b=2+Math.floor(Math.random()*Math.max(2,Math.min(cap-3,9)));
  const a=1+Math.floor(Math.random()*Math.max(2,Math.min(cap-b,9)));
  const c=a+b;
  const e=1+Math.floor(Math.random()*Math.max(2,Math.min(8,b)));
  const d=b+e;
  const base=[
    {r:2,c:0,t:'num',v:a,blank:true},{r:2,c:1,t:'op',v:'+'},{r:2,c:2,t:'num',v:b,blank:true},{r:2,c:3,t:'op',v:'='},{r:2,c:4,t:'num',v:c,blank:false},
    {r:0,c:2,t:'num',v:d,blank:true},{r:1,c:2,t:'op',v:'-'},{r:3,c:2,t:'op',v:'='},{r:4,c:2,t:'num',v:e,blank:true}
  ];
  if(diff==='easy')return {rows:5,cols:5,cells:base};

  const f=2+Math.floor(Math.random()*Math.max(2,diff==='hard'?6:4));
  const g=f*e;
  const medium=[
    ...base,
    {r:4,c:0,t:'num',v:f,blank:true},{r:4,c:1,t:'op',v:'×'},{r:4,c:3,t:'op',v:'='},{r:4,c:4,t:'num',v:g,blank:true}
  ];
  if(diff==='normal')return {rows:5,cols:5,cells:medium};

  const h=1+Math.floor(Math.random()*Math.max(2,Math.min(9,g)));
  const i=g-h;
  return {
    rows:9,cols:5,
    cells:[
      ...medium,
      {r:5,c:4,t:'op',v:'-'},{r:6,c:4,t:'num',v:h,blank:true},{r:7,c:4,t:'op',v:'='},{r:8,c:4,t:'num',v:i,blank:true}
    ]
  };
}
function launchCrossCelebration(big=false){
  const host=$('crossCelebrate');if(!host)return;
  host.innerHTML='';host.classList.remove('show','big');void host.offsetWidth;
  const symbols=['✦','★','✨','●'],count=big?54:28;
  for(let i=0;i<count;i++){
    const p=document.createElement('i');
    p.textContent=symbols[Math.floor(Math.random()*symbols.length)];
    p.style.left=(44+Math.random()*12)+'%';
    p.style.top=(34+Math.random()*18)+'%';
    p.style.setProperty('--dx',Math.round((Math.random()-.5)*(big?420:290))+'px');
    p.style.setProperty('--dy',Math.round((Math.random()-.58)*(big?390:260))+'px');
    p.style.setProperty('--delay',(Math.random()*.22)+'s');
    p.style.setProperty('--spin',Math.round((Math.random()-.5)*720)+'deg');
    p.style.setProperty('--size',(big?18+Math.random()*18:13+Math.random()*13)+'px');
    host.appendChild(p);
  }
  host.classList.add('show');if(big)host.classList.add('big');
  setTimeout(()=>{host.classList.remove('show','big');host.innerHTML=''},big?1800:1250);
}
function prepareCrossRound(){
  crossState.selectedSlot=null;crossState.solved=false;
  const p=makeCrossPuzzle(crossState.round,crossState.difficulty);
  const uniq=new Map();
  p.cells.forEach((cell,idx)=>uniq.set(cell.r+':'+cell.c,{...cell,id:'c'+idx}));
  crossState.rows=p.rows||9;crossState.cols=p.cols||5;
  crossState.slots=[...uniq.values()].filter(x=>x.t==='num'&&x.blank).map((x,i)=>({...x,slotId:'s'+i,placed:null,tileId:null}));
  crossState.cells=[...uniq.values()];
  crossState.bank=miniShuffle(crossState.slots.map((s,i)=>({id:'b'+i,value:s.v,used:false})));
  renderCross();
  $('crossRound').textContent='ROUND '+crossState.round+'/'+crossState.maxRounds+' · '+crossDifficultyLabel();
  document.querySelectorAll('.cross-diff').forEach(btn=>btn.classList.toggle('active',btn.dataset.crossDiff===crossState.difficulty));
  $('crossNextBtn')?.classList.add('hidden');
  const guide=crossState.difficulty==='easy'?'덧셈·뺄셈 두 식부터 천천히 맞춰보자!':crossState.difficulty==='normal'?'세 개의 식이 연결돼 있어. 교차 숫자를 잘 봐!':'네 개의 식이 이어져 있어! 하나씩 풀면 돼.';
  crossCoach('idle',guide);
}
function renderCross(){
  const board=$('crossBoard'),bank=$('crossBank');if(!board||!bank)return;
  board.innerHTML='';bank.innerHTML='';
  const slotMap=new Map(crossState.slots.map(s=>[s.r+':'+s.c,s]));
  board.style.setProperty('--cross-rows',crossState.rows||9);board.style.setProperty('--cross-cols',crossState.cols||5);
  for(let r=0;r<(crossState.rows||9);r++)for(let col=0;col<(crossState.cols||5);col++){
    const key=r+':'+col,cell=crossState.cells.find(x=>x.r===r&&x.c===col);
    const el=document.createElement(cell&&cell.t==='num'&&cell.blank?'button':'div');
    el.className='cross-cell';
    el.style.gridRow=String(r+1);el.style.gridColumn=String(col+1);
    if(!cell){el.classList.add('cross-empty');board.appendChild(el);continue}
    if(cell.t==='op'){el.classList.add('cross-op');el.textContent=cell.v}
    else if(cell.blank){
      const slot=slotMap.get(key);el.classList.add('cross-slot');el.dataset.slot=slot.slotId;
      if(slot.placed!=null){el.textContent=slot.placed;el.classList.add('filled')}
      else el.textContent='?';
      if(crossState.selectedSlot===slot.slotId)el.classList.add('selected');
      el.addEventListener('click',()=>{if(crossState.solved)return;crossState.selectedSlot=slot.slotId;renderCross()});
    }else{el.classList.add('cross-fixed');el.textContent=cell.v}
    board.appendChild(el);
  }
  crossState.bank.forEach(tile=>{
    const b=document.createElement('button');b.type='button';b.className='cross-bank-tile';b.textContent=tile.value;b.disabled=tile.used;
    b.addEventListener('click',()=>placeCrossTile(tile.id));bank.appendChild(b);
  });
  const filled=crossState.slots.filter(s=>s.placed!=null).length;
  $('crossFilled').textContent=filled+'/'+crossState.slots.length;
}
function placeCrossTile(tileId){
  if(crossState.solved)return;
  const tile=crossState.bank.find(x=>x.id===tileId);if(!tile||tile.used)return;
  if(!crossState.selectedSlot){crossCoach('surprise','먼저 퍼즐의 빈칸 하나를 눌러줘!');return}
  const slot=crossState.slots.find(x=>x.slotId===crossState.selectedSlot);if(!slot)return;
  if(slot.placed!=null&&slot.tileId){const old=crossState.bank.find(x=>x.id===slot.tileId);if(old)old.used=false}
  slot.placed=tile.value;slot.tileId=tile.id;tile.used=true;crossState.selectedSlot=null;renderCross();checkCrossSolved();
}
function checkCrossSolved(){
  if(crossState.slots.some(s=>s.placed==null))return;
  const ok=crossState.slots.every(s=>String(s.placed)===String(s.v));
  if(ok){
    crossState.solved=true;
    const finalRound=crossState.round>=crossState.maxRounds;
    const reward=crossState.difficulty==='hard'?4:crossState.difficulty==='normal'?3:2;
    state.stars+=reward;state.xp+=10+reward*2;
    if(finalRound)state.stars+=5;
    while(state.xp>=100){state.xp-=100;state.level++}
    launchCrossCelebration(finalRound);
    crossCoach('correct',finalRound?'🎉 5라운드 모두 완료! 연산크로스 클리어!':'정답! 가로와 세로 계산이 모두 맞았어! ⭐ +'+reward);
    $('crossNextBtn').textContent=finalRound?'놀이로 돌아가기':'다음 라운드';
    $('crossNextBtn').classList.remove('hidden');updateHud();
  }else crossCoach('surprise','거의 다 왔어! 계산식을 다시 한번 확인해봐.');
}
function resetCross(){
  crossState.slots.forEach(s=>{s.placed=null;s.tileId=null});crossState.bank.forEach(b=>b.used=false);crossState.selectedSlot=null;renderCross();crossCoach('idle','다시 시작! 가로·세로 식을 함께 봐보자.');
}
function hintCross(){
  const target=crossState.slots.find(s=>s.placed==null||String(s.placed)!==String(s.v));if(!target)return;
  crossState.selectedSlot=target.slotId;renderCross();crossCoach('idle','힌트: 선택된 빈칸에는 '+target.v+'가 들어가야 해!');
}
function openCrossGame(){
  hideMainScreens();$('playPanel')?.classList.remove('hidden');$('playMenu')?.classList.add('hidden');
  $('numberCatch')?.classList.add('hidden');$('numberHexa')?.classList.add('hidden');$('numberTower')?.classList.add('hidden');$('mathCross')?.classList.remove('hidden');
  crossState={round:1,maxRounds:5,difficulty:'easy',selectedSlot:null,slots:[],bank:[],solved:false};prepareCrossRound();
}
function nextCrossRound(){
  if(!crossState.solved)return;
  if(crossState.round>=crossState.maxRounds){showPlay();return}
  crossState.round++;prepareCrossRound();
}
function showLeague(){hideMainScreens();$('leaguePanel').classList.remove('hidden');document.querySelectorAll('.nav-item').forEach(function(x){x.classList.toggle('active',x.dataset.nav==='league')});renderLeague(document.querySelector('.league-tab.active')?.dataset.leagueTab||'rank')}
function gradeTitle(g){return g+'학년'}
function updateGradePickers(){document.querySelectorAll('.grade-picker button').forEach(function(btn){btn.classList.toggle('active',Number(btn.dataset.grade)===activeGrade())});const hint=$('gradePickerHint');if(hint)hint.textContent=activeGrade()+'학년 수학으로 보고 있어요'}
function updateHomeWorldCard(){const first=gradeWorlds()[0];if(!first)return;const ribbon=document.querySelector('.home-world-card .world-ribbon');const title=document.querySelector('.home-world-card h2');const copy=document.querySelector('.home-world-card p');if(ribbon)ribbon.textContent='GRADE '+activeGrade()+' · WORLD 1';if(title)title.textContent=first.name;if(copy)copy.innerHTML=activeGrade()+'학년 첫 번째<br/>수학 모험!'}
function selectGrade(g){g=Number(g);if(g<1||g>6)return;state.selectedGrade=g;const first=content.worlds.find(function(w){return Number(w.grade||1)===g&&Number(w.order)===1})||content.worlds.find(function(w){return Number(w.grade||1)===g});if(first)state.currentWorld=first.id;save();updateGradePickers();updateHomeWorldCard();if(!$('world')?.classList.contains('hidden'))renderWorld();if(!$('leaguePanel')?.classList.contains('hidden'))renderLeague(document.querySelector('.league-tab.active')?.dataset.leagueTab||'rank')}
function showHome(){hideMainScreens();$('home')?.classList.remove('hidden');document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.nav==='world'));const m=ensureDailyMission();if($('homeMissionCount'))$('homeMissionCount').textContent=`${m.solved}/5`;if($('homeMissionStars'))$('homeMissionStars').textContent='★ '.repeat(m.solved)+'☆ '.repeat(Math.max(0,5-m.solved));if($('missionRewardBtn')){$('missionRewardBtn').innerHTML=m.completed?'✅<small>완료</small>':'▶️<small>'+(m.solved?'계속하기':'미션 시작')+'</small>';}$('missionRewardBtn')?.setAttribute('aria-label',m.completed?'오늘의 미션 완료':'오늘의 미션 시작');updateGradePickers();updateHomeWorldCard();updateHud()}
function openGame(type,concept=null,stageIndex=0){state.gameType=type;state.currentConcept=concept;state.currentStageIndex=stageIndex;state.gameRound=0;if(type==='teach-suki')teachTruthHistory=[];hideMainScreens();$('game').classList.remove('hidden');$('mode').textContent=`${modeName(type)} · 난이도 ${difficulty()}`;$('speech').textContent='내가 너한테 맞춰서 문제를 골라볼게!';$('visual').textContent='✨';$('question').textContent='';$('answers').innerHTML='';$('startBtn').dataset.action='';$('startBtn').textContent='게임 시작!';$('startBtn').classList.remove('hidden');$('quitBtn')?.classList.add('hidden');$('hintBtn').classList.add('hidden');mood('idle','explore');updateHud()}
function next(){state.roundHinted=false;state.lastHelp=null;state.current=problem();state.gameRound++;const p=state.current,m=state.gameType;$('startBtn').classList.add('hidden');$('hintBtn').classList.remove('hidden');$('mode').textContent=m==='daily-mission'?`오늘의 미션 · ${activeGrade()}학년 · ${ensureDailyMission().solved+1}/5 · ${p.missionWorld||''}`:`${modeName(m)} · ${activeGrade()}학년 · 난이도 ${p.difficulty}`;if(m==='teach-suki'){
  $('speech').textContent='수키의 답을 검사해줘!';
  $('visual').textContent=p.visual||'🤔';
  let isCorrect=Math.random()<0.5;
  if(teachTruthHistory.length>=2&&teachTruthHistory.at(-1)===teachTruthHistory.at(-2))isCorrect=!teachTruthHistory.at(-1);
  teachTruthHistory.push(isCorrect);if(teachTruthHistory.length>4)teachTruthHistory.shift();
  const sukiAnswer=isCorrect?p.answer:p.wrongAnswer;
  $('question').textContent=`${p.prompt.replace(/\?$/,'')} → 수키의 답: ${sukiAnswer}`;
  buttons(['맞아','아니야!'],v=>check((v==='맞아')===isCorrect));
  mood('thinking','curious')
}else if(m==='missing'&&p.missingPrompt){$('speech').textContent='사라진 값을 찾아줘!';$('visual').textContent=p.visual||'🔎✨';$('question').textContent=p.missingPrompt;buttons(choices(Number(p.missingAnswer)),v=>check(String(v)===String(p.missingAnswer)));mood('idle','curious')}else{$('speech').textContent=m==='star-catch'?`별잡기 ${state.gameRound}/5`:'수키보다 먼저 정답을 찾아!';$('visual').textContent=p.visual||(m==='star-catch'?'⭐💨':'⚡ VS ⚡');$('question').textContent=p.prompt;buttons(p.options||choices(p.answer),v=>check(String(v)===String(p.answer)));mood('idle',m==='star-catch'?'explore':'greet')}}
function gain(extra=0){const bonus=(state.roundHinted?2:3)+extra;state.stars+=bonus;state.missionStars+=bonus;state.xp+=15+extra*5;let up=false;while(state.xp>=100){state.xp-=100;state.level++;up=true}return{bonus,up}}
function check(ok){state.attempts++;updateMastery(ok,state.roundHinted);const adapt=adaptiveRecord(ok);if(!ok){$('speech').textContent=adapt.message||'괜찮아, 다른 방법으로 한번 볼까?';mood('thinking',adapt.action==='visualize'?'hint':'think');if(adapt.action==='visualize')showHelp('visual');updateHud();return}state.correct++;if(state.gameType==='daily-mission'){const dm=ensureDailyMission();dm.solved=Math.min(5,dm.solved+1);if(dm.solved>=5){completeDailyMission();return}}const r=gain(state.gameType==='teach-suki'?1:0);mood('happy',r.up?'jump':state.gameType==='teach-suki'?'cheer':'correct');$('speech').textContent=adapt.action==='raise'?adapt.message:(r.up?`레벨 업! Lv.${state.level}! 🎉`:`성공! ⭐ +${r.bonus}`);$('visual').textContent=adapt.action==='raise'?'🚀 다음 문제는 조금 더 도전!':'🎉 ⭐ 🎉';$('answers').innerHTML='';$('hintBtn').classList.add('hidden');if(state.gameType==='star-catch'&&state.gameRound<5){
  $('startBtn').textContent='다음 별 잡기!';
}else if(state.gameType==='star-catch'){
  $('speech').textContent='별잡기 5문제 완료! 잠깐 쉬어가자 😊';
  mood('happy','complete');
  $('startBtn').textContent='메인으로';
  $('startBtn').dataset.action='home';
  $('quitBtn')?.classList.add('hidden');
}else if(state.gameType!=='daily-mission'&&state.gameRound>=5){
  $('speech').textContent='5문제 완료! 잘했어 😊 잠깐 쉬어가자!';
  $('visual').textContent='🎉 ⭐ 🎉';
  mood('happy','complete');
  $('startBtn').textContent='메인으로';
  $('startBtn').dataset.action='home';
  $('quitBtn')?.classList.add('hidden');
}else{
  $('startBtn').textContent='계속하기';
}
$('startBtn').classList.remove('hidden');
if(state.gameType!=='star-catch'&&state.gameType!=='daily-mission'&&state.gameRound<5)$('quitBtn')?.classList.remove('hidden');
updateHud()}
function showHelp(type){const p=state.current;state.roundHinted=true;state.lastHelp=type;state.hints++;mood('hint','hint');if(type==='counting'){$('speech').textContent='문제 속 수와 단위를 하나씩 확인해보자!';$('visual').textContent=p.visual||`🔎 ${p.prompt}`}else if(type==='step'){$('speech').textContent='무엇을 구하는지 먼저 찾고, 계산 순서를 한 단계씩 따라가자!';$('visual').textContent=`1️⃣ 조건 확인  2️⃣ 계산  3️⃣ 답 확인`}else{$('speech').textContent='그림이나 핵심 표현으로 문제를 다시 살펴보자!';$('visual').textContent=p.visual||`💡 ${p.prompt}`}}
$('startBtn').onclick=()=>{if($('startBtn').dataset.action==='map'){showMap();return}if($('startBtn').dataset.action==='home'){showHome();return}next()};$('quitBtn')?.addEventListener('click',()=>{showHome();authNotice('오늘도 잘했어! 다음에 또 수키랑 놀자 😊','info')});$('hintBtn').onclick=()=>{const type=window.AdaptiveEngine?.help(state.adaptive,masteryKey())||'visual';showHelp(type);updateHud()};$('treasureBtn').onclick=()=>{if(state.missionStars<MISSION_TARGET)return;state.missionStars-=MISSION_TARGET;state.treasures++;state.stars+=5;state.xp+=20;mood('happy','complete');$('speech').textContent='보물상자 오픈! 보너스 별 5개!';updateHud()};function showMap(){hideMainScreens();$('world').classList.remove('hidden');$('worldSuki').src=SUKI_BASE+sukiImages.explore;renderWorld();updateHud()}$('mapBtn').onclick=showMap;$('parentBtn').onclick=()=>{hideMainScreens();$('parentPanel').classList.remove('hidden');updateHud()};$('backBtn').onclick=showHome;$('authBtn')?.addEventListener('click',toggleAuth);(async()=>{await Promise.all([loadContent(),initAuth()]);if(!gradeWorlds().some(w=>w.id===state.currentWorld))state.currentWorld=gradeWorlds()[0]?.id||content.worlds[0]?.id;showHome()})();
document.querySelectorAll('.avatar-pick').forEach(btn=>btn.addEventListener('click',()=>{selectedAvatar=btn.dataset.avatar;document.querySelectorAll('.avatar-pick').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected')}));$('createChildBtn')?.addEventListener('click',createChildProfile);

$('homeLogo')?.addEventListener('click',showHome);
$('homeStartBtn')?.addEventListener('click',showMap);
$('worldOpenBtn')?.addEventListener('click',showMap);
$('missionRewardBtn')?.addEventListener('click',startDailyMission);
document.querySelectorAll('[data-home-nav]').forEach(btn=>btn.addEventListener('click',()=>{const target=btn.dataset.homeNav;const nav=document.querySelector(`.nav-item[data-nav="${target}"]`);nav?.click()}));
document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const target=btn.dataset.nav;if(target==='world'){showHome();return}if(target==='play'){showPlay();return}if(target==='league'){showLeague();return}authNotice('보물 도감을 준비 중이에요!','info')}));

document.querySelectorAll('.league-tab').forEach(function(btn){btn.addEventListener('click',function(){document.querySelectorAll('.league-tab').forEach(function(x){x.classList.remove('active')});btn.classList.add('active');renderLeague(btn.dataset.leagueTab)})});

document.querySelectorAll('.grade-picker button').forEach(function(btn){btn.addEventListener('click',function(){selectGrade(btn.dataset.grade)})});

$('numberCatchCard')?.addEventListener('click',openNumberCatch);
$('numberHexaCard')?.addEventListener('click',openHexaGame);
$('numberTowerCard')?.addEventListener('click',openTowerGame);
$('mathCrossCard')?.addEventListener('click',openCrossGame);
$('run1000Card')?.addEventListener('click',()=>{window.location.href='miniapps/runner1000/'});
$('hexaStartBtn')?.addEventListener('click',handleHexaStart);
$('hexaBackBtn')?.addEventListener('click',showPlay);
$('hexaQuitBtn')?.addEventListener('click',()=>{stopHexaGame(false);showPlay()});
$('towerStartBtn')?.addEventListener('click',startTowerGame);
$('towerBackBtn')?.addEventListener('click',showPlay);
$('towerQuitBtn')?.addEventListener('click',()=>{stopTowerGame(false);showPlay()});
$('crossBackBtn')?.addEventListener('click',showPlay);
$('crossQuitBtn')?.addEventListener('click',showPlay);
$('crossResetBtn')?.addEventListener('click',resetCross);
$('crossHintBtn')?.addEventListener('click',hintCross);
$('crossNextBtn')?.addEventListener('click',nextCrossRound);
$('catchStartBtn')?.addEventListener('click',startNumberCatch);
$('catchQuitBtn')?.addEventListener('click',showPlay);
$('catchBackBtn')?.addEventListener('click',showPlay);

document.querySelectorAll('.catch-speed').forEach(btn=>btn.addEventListener('click',()=>{
  catchState.pace=btn.dataset.catchSpeed||'slow';
  updateCatchHud();
  if(catchState.running){
    clearTimeout(catchState.timer);
    spawnCatchWave();
    catchRobotReact('idle',catchState.pace==='slow'?'천천히 해보자!':catchState.pace==='fast'?'좋아! 빠르게 도전!':'보통 속도로 가자!');
  }
}));

document.querySelectorAll('.cross-diff').forEach(btn=>btn.addEventListener('click',()=>{
  const diff=btn.dataset.crossDiff||'easy';
  if(crossState.difficulty===diff&&!crossState.solved)return;
  crossState.difficulty=diff;crossState.round=1;crossState.selectedSlot=null;crossState.solved=false;
  prepareCrossRound();
  crossCoach('idle',crossDifficultyLabel(diff)+' 난이도로 새로 시작해볼게!');
}));
