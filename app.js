const state={stars:0,xp:0,level:1,attempts:0,correct:0,hints:0,round:0,current:null};
const $=id=>document.getElementById(id);
const speeches={start:["좋아! 이번엔 내가 문제 낼게!","별을 같이 모아보자!","이번 문제를 해결하면 별을 얻어!"],correct:["찾았다! 너 빠른데?","오! 그 방법 좋다!","우리 별을 얻었어!"],retry:["어? 우리 답이 다른 것 같은데? 같이 확인해보자!","거의 다 왔어. 한 번만 더 생각해볼까?"],hint:["두 무리를 하나로 합쳐서 세어보자!","작은 수부터 손가락으로 더해봐도 좋아!"]};
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function save(){localStorage.setItem('mathPlayState',JSON.stringify(state))}
function restore(){try{Object.assign(state,JSON.parse(localStorage.getItem('mathPlayState'))||{})}catch{}}
function updateHud(){
 $('stars').textContent=state.stars;$('level').textContent=`Lv.${state.level}`;
 $('xpBar').style.width=`${state.xp%100}%`;
 $('attempts').textContent=state.attempts;$('correct').textContent=state.correct;$('hints').textContent=state.hints;
 const rate=state.attempts?Math.round(state.correct/state.attempts*100):0;
 $('parentSummary').textContent=state.attempts?`오늘 ${state.attempts}번 도전했고 ${state.correct}번 스스로 해결했어요. 현재 성공률은 ${rate}%입니다. 점수보다 다시 시도하고 스스로 발견하는 경험을 우선합니다.`:'아직 오늘의 놀이를 시작하지 않았어요.';
 save();
}
function makeProblem(){
 let a=1+Math.floor(Math.random()*6),b=1+Math.floor(Math.random()*(10-a));
 const answer=a+b;let choices=new Set([answer]);
 while(choices.size<4){choices.add(Math.max(1,Math.min(10,answer-2+Math.floor(Math.random()*5))))}
 state.current={a,b,answer};state.round++;
 $('mode').textContent=state.round%4===0?'수키의 실수 찾기':'수키가 문제내기';
 $('speech').textContent=pick(speeches.start);
 $('visual').textContent='⭐'.repeat(a)+'  +  '+'⭐'.repeat(b);
 $('question').textContent=`${a} + ${b} = ?`;
 $('answers').innerHTML='';
 [...choices].sort(()=>Math.random()-.5).forEach(n=>{const btn=document.createElement('button');btn.className='answer';btn.textContent=n;btn.onclick=()=>answer(n);$('answers').appendChild(btn)});
 $('startBtn').classList.add('hidden');$('hintBtn').classList.remove('hidden');
}
function answer(n){
 state.attempts++;
 if(n===state.current.answer){
   state.correct++;const bonus=state.hints===0?3:2;state.stars+=bonus;state.xp+=15;
   while(state.xp>=100){state.xp-=100;state.level++;}
   $('speech').textContent=`${pick(speeches.correct)} ⭐ +${bonus}`;
   $('visual').textContent='🎉 ⭐ 🎉';$('answers').innerHTML='';$('question').textContent=`${state.current.a} + ${state.current.b} = ${n}`;
   $('hintBtn').classList.add('hidden');$('startBtn').textContent='다음 놀이!';$('startBtn').classList.remove('hidden');
 }else{
   $('speech').textContent=pick(speeches.retry);$('hintBtn').classList.remove('hidden');
 }
 updateHud();
}
$('hintBtn').onclick=()=>{state.hints++;$('speech').textContent=pick(speeches.hint);$('visual').textContent=`${'🔵'.repeat(state.current.a)}  ${'🟡'.repeat(state.current.b)}`;updateHud()};
$('startBtn').onclick=makeProblem;
$('parentBtn').onclick=()=>{$('game').classList.add('hidden');$('parentPanel').classList.remove('hidden');updateHud()};
$('backBtn').onclick=()=>{$('parentPanel').classList.add('hidden');$('game').classList.remove('hidden')};
restore();updateHud();
