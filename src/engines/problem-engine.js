(()=>{
const r=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[r(0,a.length-1)];
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const frac=(n,d)=>`${n}/${d}`;
function opts(ans,extras=[]){const s=new Set([String(ans),...extras.map(String)]);let guard=0;while(s.size<4&&guard++<30){if(/^\d+(\.\d+)?$/.test(String(ans))){const n=Number(ans),delta=pick([-3,-2,-1,1,2,3]);s.add(String(Math.max(0,Math.round((n+delta)*100)/100)))}else s.add(String(ans)+'?')}return shuffle([...s]).slice(0,4)}
function make(worldId,d=1){
 let a,b,ans,prompt,visual='',wrongAnswer,options,missingPrompt,missingAnswer;
 if(worldId==='g1-number'){ans=r(1,9);prompt='별을 세어 보세요. 모두 몇 개인가요?';visual='⭐'.repeat(ans);options=opts(ans)}
 else if(worldId==='g1-add'||worldId==='g1-final'){a=r(1,d===1?5:9);b=r(1,10-a);ans=a+b;prompt=`${a} + ${b} = ?`;visual='🔵'.repeat(a)+'  '+'🟡'.repeat(b);options=opts(ans);missingPrompt=`${a} + □ = ${ans}`;missingAnswer=b}
 else if(worldId==='g1-sub'){a=r(5,10);b=r(1,a);ans=a-b;prompt=`${a} - ${b} = ?`;options=opts(ans);missingPrompt=`${a} - □ = ${ans}`;missingAnswer=b}
 else if(worldId==='g1-shape'){const q=pick([{p:'세모의 변은 몇 개인가요?',a:3},{p:'네모의 변은 몇 개인가요?',a:4},{p:'동그라미에는 꼭짓점이 몇 개인가요?',a:0}]);prompt=q.p;ans=q.a;options=opts(ans)}
 else if(worldId==='g1-compare'){a=r(1,20);b=r(1,20);while(a===b)b=r(1,20);ans=a>b?a:b;prompt=`${a}와 ${b} 중 더 큰 수는?`;options=[String(a),String(b),String(a+b),String(Math.abs(a-b))]}
 else if(worldId==='g1-time'){ans=r(1,12);const clocks=['🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛'];prompt='시계를 보고 몇 시인지 골라보세요.';visual=clocks[ans-1];options=opts(ans)}
 else if(worldId==='g1-big-number'){a=r(1,9);b=r(0,9);ans=a*10+b;prompt=`십의 자리 ${a}, 일의 자리 ${b}인 수는?`;options=opts(ans)}
 else if(worldId==='g2-number'){ans=r(100,999);prompt=`백의 자리 숫자가 ${Math.floor(ans/100)}, 십의 자리 숫자가 ${Math.floor((ans%100)/10)}, 일의 자리 숫자가 ${ans%10}인 수를 고르세요.`;options=opts(ans)}
 else if(worldId==='g2-addsub'){a=r(10,89);b=r(10,99-a);ans=a+b;prompt=`${a} + ${b} = ?`;options=opts(ans);wrongAnswer=ans+10}
 else if(worldId==='g2-multiply'){a=r(2,9);b=r(2,9);ans=a*b;prompt=`${a} × ${b} = ?`;options=opts(ans);missingPrompt=`${a} × □ = ${ans}`;missingAnswer=b}
 else if(worldId==='g2-length'){a=r(1,8);b=r(1,9);ans=a*100+b;prompt=`${a}m ${b}cm는 모두 몇 cm일까요?`;options=opts(ans)}
 else if(worldId==='g2-time'){a=r(1,11);b=pick([10,20,30,40,50]);ans=`${a}시 ${b}분`;prompt=`${a}시에서 ${b}분이 지났어요. 시간을 고르세요.`;options=[ans,`${a+1}시 ${b}분`,`${a}시 ${(b+10)%60}분`,`${a+1}시 00분`]}
 else if(worldId==='g2-shape'){const q=pick([{p:'삼각형의 변은 몇 개?',a:3},{p:'사각형의 꼭짓점은 몇 개?',a:4},{p:'정육면체의 면은 몇 개?',a:6}]);prompt=q.p;ans=q.a;options=opts(ans)}
 else if(worldId==='g2-table'){const data=[r(1,5),r(1,5),r(1,5)];ans=Math.max(...data);prompt=`사과 ${data[0]}개, 배 ${data[1]}개, 귤 ${data[2]}개가 있어요. 가장 많은 과일의 개수는 몇 개인가요?`;options=opts(ans)}
 else if(worldId==='g3-addsub'){a=r(100,799);b=r(100,999-a);ans=a+b;prompt=`${a} + ${b} = ?`;options=opts(ans)}
 else if(worldId==='g3-multiply'){a=r(12,89);b=r(2,9);ans=a*b;prompt=`${a} × ${b} = ?`;options=opts(ans)}
 else if(worldId==='g3-divide'){b=r(2,9);ans=r(2,12);a=b*ans;prompt=`${a} ÷ ${b} = ?`;options=opts(ans);missingPrompt=`□ × ${b} = ${a}`;missingAnswer=ans}
 else if(worldId==='g3-fraction'){const den=pick([2,3,4,5,6,8]);a=r(1,den-1);ans=frac(a,den);prompt=`전체를 똑같이 ${den}조각으로 나눈 뒤 그중 ${a}조각을 골랐어요. 이를 나타내는 분수를 고르세요.`;options=shuffle([ans,frac(den,a),frac(Math.max(1,a-1),den),frac(a,den+1)])}
 else if(worldId==='g3-measure'){a=r(1,9);ans=a*1000;prompt=`${a}km는 몇 m일까요?`;options=opts(ans)}
 else if(worldId==='g3-geometry'){const q=pick([{p:'직각은 몇 도인가요?',a:90},{p:'삼각형의 내각은 몇 개인가요?',a:3},{p:'사각형의 변은 몇 개인가요?',a:4}]);prompt=q.p;ans=q.a;options=opts(ans)}
 else if(worldId==='g3-data'){const vals=[r(2,9),r(2,9),r(2,9)];ans=vals.reduce((x,y)=>x+y,0);prompt=`월 ${vals[0]}, 화 ${vals[1]}, 수 ${vals[2]}권을 읽었어요. 모두 몇 권?`;options=opts(ans)}
 else if(worldId==='g4-big-number'){a=r(10,99);ans=a*10000;prompt=`${a}만은 얼마인가요?`;options=opts(ans)}
 else if(worldId==='g4-muldiv'){a=r(12,99);b=r(11,29);ans=a*b;prompt=`${a} × ${b} = ?`;options=opts(ans)}
 else if(worldId==='g4-fraction'){const den=pick([3,4,5,6,8]);a=r(1,den-1);b=r(1,den-a);ans=frac(a+b,den);prompt=`${frac(a,den)} + ${frac(b,den)} = ?`;options=shuffle([ans,frac(Math.max(1,a+b-1),den),frac(a+b,den+1),frac(a+b,den*2)])}
 else if(worldId==='g4-decimal'){a=r(10,99)/10;b=r(1,20)/10;ans=Math.round((a+b)*10)/10;prompt=`${a.toFixed(1)} + ${b.toFixed(1)} = ?`;options=opts(ans)}
 else if(worldId==='g4-angle'){a=pick([30,45,60,90,120,135]);b=pick([15,30,45]);ans=a+b;prompt=`${a}° + ${b}° = ?`;options=opts(ans)}
 else if(worldId==='g4-geometry'){const q=pick([{p:'평행한 두 직선 사이의 거리는?',a:'항상 같다',o:['항상 같다','점점 커진다','0이다','알 수 없다']},{p:'정사각형의 네 각은 모두?',a:'직각',o:['직각','예각','둔각','평각']}]);prompt=q.p;ans=q.a;options=q.o}
 else if(worldId==='g4-data'){const vals=[r(10,30),r(10,30),r(10,30)];ans=Math.max(...vals);prompt=`월요일 ${vals[0]}, 화요일 ${vals[1]}, 수요일 ${vals[2]}로 조사되었어요. 가장 큰 값은 얼마인가요?`;options=opts(ans)}
 else if(worldId==='g5-mixed'){a=r(2,9);b=r(2,9);const c=r(1,9);ans=a+b*c;prompt=`${a} + ${b} × ${c} = ?`;options=opts(ans)}
 else if(worldId==='g5-factor'){a=pick([12,18,24,30,36]);const divisors=[];for(let i=1;i<=a;i++)if(a%i===0)divisors.push(i);ans=pick(divisors);prompt=`다음 중 ${a}의 약수인 수는?`;const bad=[a-1,a+1,Math.max(2,ans+1)].filter(x=>a%x!==0);options=shuffle([String(ans),...bad.map(String)]).slice(0,4)}
 else if(worldId==='g5-fraction'){const den1=pick([2,3,4,5]);const den2=pick([2,3,4,5]);a=r(1,den1-1);b=r(1,den2-1);ans=frac(a*b,den1*den2);prompt=`${frac(a,den1)} × ${frac(b,den2)} = ?`;options=shuffle([ans,frac(a+b,den1+den2),frac(a*b,den1+den2),frac(a+b,den1*den2)])}
 else if(worldId==='g5-decimal'){a=r(11,99)/10;b=r(2,9);ans=Math.round(a*b*10)/10;prompt=`${a.toFixed(1)} × ${b} = ?`;options=opts(ans)}
 else if(worldId==='g5-shape'){const q=pick([{p:'선대칭도형을 접었을 때 대응점은?',a:'겹친다',o:['겹친다','멀어진다','사라진다','평행해진다']},{p:'합동인 두 도형의 크기와 모양은?',a:'같다',o:['같다','크기만 같다','모양만 같다','모두 다르다']}]);prompt=q.p;ans=q.a;options=q.o}
 else if(worldId==='g5-volume'){a=r(2,8);b=r(2,8);const cc=r(2,8);ans=a*b*cc;prompt=`가로 ${a}cm, 세로 ${b}cm, 높이 ${cc}cm인 직육면체의 부피는?`;options=opts(ans)}
 else if(worldId==='g5-data'){const vals=[r(1,9),r(1,9),r(1,9),r(1,9)];const total=vals.reduce((x,y)=>x+y,0);const adj=total%4;vals[3]+=adj?4-adj:0;ans=vals.reduce((x,y)=>x+y,0)/4;prompt=`${vals.join(', ')}의 평균은?`;options=opts(ans)}
 else if(worldId==='g6-fraction'){const den=pick([2,3,4,5,6]);a=r(1,den-1);b=r(2,5);ans=frac(a,den*b);prompt=`${frac(a,den)} ÷ ${b} = ?`;options=shuffle([ans,frac(a*b,den),frac(a,den+b),frac(a+b,den*b)])}
 else if(worldId==='g6-decimal'){b=pick([2,4,5]);ans=r(12,80)/10;a=Math.round(ans*b*10)/10;prompt=`${a.toFixed(1)} ÷ ${b} = ?`;options=opts(ans)}
 else if(worldId==='g6-ratio'){a=r(2,9);b=r(2,9);const k=r(2,5);ans=`${a*k}:${b*k}`;prompt=`${a}:${b}와 같은 비는?`;options=shuffle([ans,`${a+k}:${b+k}`,`${a*k}:${b}`,`${a}:${b*k}`])}
 else if(worldId==='g6-proportion'){a=r(2,8);b=r(2,8);const k=r(2,6);ans=b*k;prompt=`${a}:${b} = ${a*k}:□ 일 때 □는?`;options=opts(ans)}
 else if(worldId==='g6-geometry'){const rad=r(2,8);ans=Math.round(rad*2*3.14*100)/100;prompt=`반지름이 ${rad}cm인 원이 있어요. 원주율을 3.14로 하여 원주를 구하세요.`;options=opts(ans)}
 else if(worldId==='g6-volume'){a=r(2,9);b=r(2,9);const h=r(2,9);ans=a*b*h;prompt=`밑면 가로 ${a}cm, 세로 ${b}cm, 높이 ${h}cm인 직육면체의 부피는?`;options=opts(ans)}
 else if(worldId==='g6-data'){a=pick([10,20,25,40,50]);b=r(2,8)*10;ans=b*a/100;prompt=`${b}의 ${a}%는 얼마인가요?`;options=opts(ans)}
 else {a=r(1,20);b=r(1,20);ans=a+b;prompt=`${a} + ${b} = ?`;options=opts(ans)}
 if(!wrongAnswer){if(typeof ans==='number')wrongAnswer=ans+1;else wrongAnswer=options.find(x=>String(x)!==String(ans))}
 const answer=String(ans);options=(options||opts(ans)).map(String);if(!options.includes(answer))options=[answer,...options.slice(0,3)];options=[...new Set(options)].slice(0,4);while(options.length<4){const fallback=String(Number.isFinite(Number(ans))?Number(ans)+options.length:answer+' '+(options.length+1));if(!options.includes(fallback))options.push(fallback)}options=shuffle(options);
 return {prompt,answer,options,visual,wrongAnswer:String(wrongAnswer),missingPrompt,missingAnswer:missingAnswer==null?null:String(missingAnswer),difficulty:d};
}
window.ProblemEngine={make};
})();