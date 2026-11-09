// N값 지내력 환산 시스템 매뉴얼 화면 캡처 — usage: node capture_sb.js <repoDir> <outDir>
// 규격(옹벽 capture_rw.js 와 같음): 1440×900 · DSF 1.25 · serviceWorkers block · _marks.json · _example.json
const {chromium}=require(process.env.MM_PW||'playwright');const fs=require('fs');const path=require('path');const {setup,server}=require('./serve');
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
const VW=+(process.env.MM_VW||1440),VH=+(process.env.MM_VH||900),DSF=+(process.env.MM_DSF||1.25),PORT=8981;
const HIDE='#pwa-install-banner,#pwa-banner,.pwa-banner,.pwa-update-bar,#sw-update-bar,.toast,#fab-group,.bottom-bar,.net-toast,.pwa-done-toast,#mm-ios-tip{display:none!important} *{animation:none!important;transition:none!important} .main-wrap{padding-bottom:20px!important} .two-col>div{position:static!important;max-height:none!important;overflow:visible!important}';
const HELP=`window.__vis=e=>e&&e.getClientRects().length>0;
window.__find=sel=>{
 if(sel.startsWith('card:')){const t=sel.slice(5);return [...document.querySelectorAll('.card')].find(c=>__vis(c)&&c.querySelector('.card-tit')&&c.querySelector('.card-tit').textContent.includes(t))||null;}
 if(sel.startsWith('fg:')){const t=sel.slice(3);return [...document.querySelectorAll('.fgrp')].find(g=>__vis(g)&&g.querySelector('.flbl')&&g.querySelector('.flbl').textContent.includes(t))||null;}
 if(sel.startsWith('chk:')){const t=sel.slice(4);return [...document.querySelectorAll('.sb-chk')].find(g=>__vis(g)&&g.textContent.includes(t))||null;}
 if(sel.startsWith('row:')){const [q,t]=sel.slice(4).split('|');return [...document.querySelectorAll(q+' tr')].find(g=>__vis(g)&&g.textContent.includes(t))||null;}
 if(sel.startsWith('nth:')){const [q,i]=sel.slice(4).split('|');return [...document.querySelectorAll(q)].filter(__vis)[+i]||null;}
 for(const s of sel.split(',')){const e=[...document.querySelectorAll(s)].find(__vis);if(e)return e;}return null;};
window.__date=()=>{const e=document.getElementById('p-date');if(e)e.value='2026-11-09';};
window.__set=(o)=>Object.keys(o).forEach(k=>{const e=document.getElementById(k);if(e.type==='checkbox')e.checked=o[k];else e.value=o[k];});
window.__clr=()=>__set({'p-qd':'','p-plY':'','p-plU':'','p-cu':'','p-evid':true,'p-site':'전북 ○○시 ○○동 123'});
window.__exA=()=>{switchTab('calc');__clr();sbExample(1);__set({'p-qd':'150'});__date();calcAll();};
window.__exN=()=>{__exA();__set({'p-evid':false});calcAll();};
window.__exB=()=>{switchTab('calc');__clr();sbExample(2);__set({'p-qd':'70'});__date();calcAll();};
window.__exC=()=>{switchTab('calc');__clr();sbExample(3);__set({'p-qd':'150'});__date();calcAll();};
window.__exP=()=>{__exA();__set({'p-plY':'300','p-plU':'500'});calcAll();};
window.__a4=()=>{switchTab('a4preview');window.scrollTo(0,0);};
window.__help=t=>{if(!_helpOpen)toggleHelp();switchHelpTab(t);};`;
const GA="__exA();window.scrollTo(0,0)";
const SHOTS=[
 {id:'s01_overview',pre:GA,clip:'viewport',m:[['nth:.tb|0','탭 — 입력 · 계산 / A4 계산서'],['#mm-manual-btn','📘 매뉴얼'],['.sum-bar','요약 바'],['nth:#panel-calc .nb|0','참고용 안내'],['card:기본 정보','입력(STEP 1 ~ 5)'],['#sb-result .result-hero','결과']]},
 {id:'s02_header',clip:'.hdr-shell',m:[['.hdr-h1','도구 이름 · Ver-1.0'],['.hdr-right','KDS 41 19 00 · KDS 11 50 05'],['.tab-bar-inner','탭'],['#mm-manual-btn','📘 매뉴얼 — 탭 막대 끝']]},
 {id:'s03_basic',clip:'card:기본 정보',m:[['fg:사업명','사업명'],['fg:작성자','작성자'],['fg:위치','위치'],['fg:작성일','작성일'],['fg:지반조사 보고서','보고서 이름(계산서에 표기)']]},
 {id:'s04_table',clip:'card:표준관입시험',m:[['#p-table','공번 · 심도 · N · 토질 붙여 넣기'],['.sb-hint','관입 불능 50/x · 토질 인식'],['.sb-btnrow','예제 ① ② ③']]},
 {id:'s05_found',clip:'card:기초 · 지하수위',m:[['fg:기초 형식','기초 형식'],['fg:근입깊이','근입깊이 Df'],['fg:기초 폭 B','폭 B(짧은 변)'],['fg:기초 길이 L','길이 L'],['fg:지하수위','지하수위'],['fg:습윤 단위중량','γt'],['fg:포화 단위중량','γsat'],['fg:설계 접지압','설계 접지압 — 판정']]},
 {id:'s06_corr',clip:'card:N값 보정 · 환산식',m:[['fg:해머 에너지','ER (기본 60 %)'],['fg:대표 N값','평균 / 최솟값'],['fg:N값 상한','N 상한 50'],['fg:φ 상한','φ 상한 40°'],['fg:사질토 φ','φ 환산식'],['fg:Dunham 입자','Dunham 계수'],['fg:안전계수','SF ≥ 3'],['fg:허용 침하량','Se 25 mm'],['chk:롯드 길이','CR 보정'],['chk:침하 기준식','Cw 보정'],['chk:세립 모래','세립 모래 보정'],['chk:깊이계수','깊이계수']]},
 {id:'s07_test',clip:'card:시험값 · 입증자료',m:[['fg:항복하중','평판재하 qy'],['fg:극한하중','평판재하 qult'],['fg:비배수 전단강도','cu 시험값'],['chk:입증','입증자료 · 승인']]},
 {id:'s08_hero',clip:'#sb-result .result-hero',to:'#sb-result .stat-grid',m:[['#sb-result .rh-num','채택 qa'],['#sb-result .rh-badge','접지압 판정'],['nth:#sb-result .sbox|0','대표 N₆₀'],['nth:#sb-result .sbox|1','φ'],['nth:#sb-result .sbox|3','지지력 기준 qa'],['nth:#sb-result .sbox|4','침하 기준 qa'],['nth:#sb-result .sbox|5','표 4.2-1']]},
 {id:'s09_chart',clip:'card:심도 - N',m:[]},
 {id:'s10_phi',clip:'card:φ 환산식 비교',m:[]},
 {id:'s11_rows',clip:'card:N값 보정표',m:[]},
 {id:'s12_noevid',pre:"__exN()",clip:'#sb-result .result-hero',to:'#sb-result .stat-grid',m:[['#sb-result .rh-label','표 4.2-1 값 채택'],['#sb-result .rh-badge','접지압 150 > 100 — NG'],['nth:#sb-result .sbox|5','표 4.2-1 모래 100']]},
 {id:'s12b_note',clip:'#sb-result .nb.blue',post:"__exA()",m:[]},
 {id:'s13_holes',pre:"__exC()",clip:'card:시추공별 결과',m:[]},
 {id:'s14_clay',pre:"__exB()",clip:'#sb-result .result-hero',to:'#sb-result .stat-grid',m:[['#sb-result .rh-num','채택 qa'],['nth:#sb-result .sbox|1','점착력 cu'],['nth:#sb-result .sbox|4','침하 기준 — 점성토 없음']]},
 {id:'s15_clay_warn',clip:'#sb-result .nb.amber',post:"__exA()",m:[]},
 {id:'s16_plate',pre:"__exP()",clip:'#sb-result .result-hero',to:'#sb-result .stat-grid',post:"__exA()",m:[['#sb-result .rh-label','평판재하시험 채택'],['#sb-result .rh-num','min(qy/2, qult/3)']]},
 {id:'s17_a4bar',pre:"__exA();__a4()",wait:900,clip:'viewport',m:[['.mm-btn-print','인쇄 · PDF'],['#btn-jpg','JPG 저장'],['#a4iso-content','A4 계산서']]},
 {id:'s18_a4page',clip:'#a4iso-content',m:[]},
 {id:'s19_help_law',pre:"__help('law')",wait:500,fixed:true,clip:'#help-panel',m:[]},
 {id:'s20_help_formula',pre:"__help('formula')",wait:400,fixed:true,clip:'#help-panel',post:"toggleHelp();__exA()",m:[]},
 {id:"s23_proj_menu",pre:"__exA();localStorage.setItem('MANMIN_PROJECT_V1',JSON.stringify({\"사업명\": \"○○ 지식산업센터 신축공사\", \"위치\": \"전북 ○○시 ○○동 123\", \"작성자\": \"김만민 건축사\", \"updated\": \"2026-11-09 10:00\", \"from\": \"옹벽\"}));window.scrollTo(0,0);document.querySelector('.mm-proj-btn').click()",wait:700,clip:'viewport',post:"document.querySelectorAll('.mm-proj-menu').forEach(e=>e.remove())",m:[[".mm-proj-btn", "「🏢 건물개요」 단추(오른쪽 아래)"], [".mm-proj-menu button[data-a=\"save\"]", "저장 — 지금 값 담기"], [".mm-proj-menu button[data-a=\"load\"]", "불러오기"], [".mm-proj-menu button[data-a=\"exp\"]", "파일로 내보내기(.json)"], [".mm-proj-menu button[data-a=\"imp\"]", "파일 가져오기"]]},
 {id:"s24_proj_load",pre:"(()=>{window.__mmK=MMProject.keys;window.__mmB=__mmK.map(k=>MMProject.fields(k).map(e=>e.value));const __sv=(e,v)=>{const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');d.set.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));};const e=MMProject.fields('사업명')[0];if(e)__sv(e,'');localStorage.setItem('MANMIN_PROJECT_V1',JSON.stringify({\"사업명\": \"○○ 지식산업센터 신축공사\", \"위치\": \"전북 ○○시 ○○동 123\", \"작성자\": \"김만민 건축사\", \"updated\": \"2026-11-09 10:00\", \"from\": \"옹벽\"}));MMProject.load();})()",wait:900,fixed:true,clip:'.mm-proj-dlg',post:"(()=>{document.querySelectorAll('.mm-proj-back').forEach(e=>e.remove());const __sv=(e,v)=>{const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');d.set.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));};__mmK.forEach((k,i)=>MMProject.fields(k).forEach((e,j)=>{if(e.value!==__mmB[i][j])__sv(e,__mmB[i][j]);}));localStorage.removeItem('MANMIN_PROJECT_V1');})()",m:[[".mm-proj-dlg input[type=checkbox]", "체크한 항목만 채움(빈 칸은 체크된 채로)"], [".mm-proj-dlg .mm-proj-warn", "이미 입력된 칸 — 직접 체크해야 덮어씀"], [".mm-proj-dlg .mm-proj-ok", "채우기"]]},
];
const PICK=`(R)=>{if(!R||!R.ok)return {ok:false};const g=R.gov;const o={adopt:R.adopt,adoptSrc:R.adoptSrc,qaCalc:R.qaCalc,tblQ:R.tblQ,pass:R.pass,qd:R.qd,overTbl:R.overTbl,qaPlate:R.qaPlate,warn:R.warn,
 gov:{hole:g.hole,soilNm:g.soilNm,grp:g.grp,rock:g.rock,N60:g.N60,N1:g.N1,phi:g.phi,cu:g.cu,qu:g.qu,qaStr:g.qaStr,qaSet:isFinite(g.qaSet)?g.qaSet:null,z1:g.z1,z2:g.z2,phis:g.phis},
 holes:R.holes.map(h=>({hole:h.hole,soilNm:h.soilNm,qa:h.qaCalc,N60:h.N60}))};return o;}`;
(async()=>{
 const s=await server(repo,PORT);const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DSF,serviceWorkers:'block',locale:'ko-KR'});await setup(ctx);
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('dialog',d=>{errs.push('dialog '+d.message());d.dismiss();});
 await pg.goto(`http://127.0.0.1:${PORT}/index.html`);await pg.waitForFunction(()=>window.SBENG);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(1200);
 await pg.addStyleTag({content:HIDE});await pg.evaluate(HELP);await pg.evaluate('__date()');await pg.waitForTimeout(300);
 const meta={};
 for(const S of SHOTS){
  if(S.pre){try{await pg.evaluate(S.pre);}catch(e){errs.push(S.id+' pre '+e.message);}}
  await pg.evaluate('__date()');
  await pg.waitForTimeout(S.wait||450);
  if(S.clip!=='viewport'&&!S.fixed){await pg.evaluate(c=>{const e=__find(c);if(e){window.scrollTo(0,e.getBoundingClientRect().top+scrollY-40);}},S.clip);await pg.waitForTimeout(350);}
  const info=await pg.evaluate(({S,VW,VH})=>{
   const abs=e=>{const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};};
   let clip;
   if(S.clip==='viewport'){clip={x:0,y:scrollY,width:VW,height:VH};}
   else{const el=__find(S.clip);if(!el)return {err:'clip '+S.clip};const a=abs(el);const P=S.fixed?0:10;clip={x:Math.max(0,a.x-P),y:Math.max(0,a.y-P),width:a.w+2*P,height:a.h+2*P};
     if(S.to){const t=__find(S.to);if(t){const r=abs(t);clip.height=r.y+r.h+P-clip.y;}}}
   const marks=[];(S.m||[]).forEach(([sel,label],i)=>{const e=__find(sel);if(!e){marks.push({n:i+1,label,miss:sel});return;}const a=abs(e);
     marks.push({n:i+1,label,x:+((a.x-clip.x)/clip.width*100).toFixed(2),y:+((a.y-clip.y)/clip.height*100).toFixed(2),w:+(Math.min(a.w,clip.x+clip.width-a.x)/clip.width*100).toFixed(2),h:+(Math.min(a.h,clip.y+clip.height-a.y)/clip.height*100).toFixed(2)});});
   return {clip,marks};},{S,VW,VH});
  if(info.err){errs.push(S.id+' '+info.err);continue;}
  const c=info.clip;const cl={x:Math.max(0,c.x),y:Math.max(0,c.y),width:Math.min(c.width,VW-Math.max(0,c.x)),height:c.height};
  if(S.clip==='viewport'){await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:0,y:0,width:VW,height:VH}});}
  else if(S.fixed){const sy=await pg.evaluate(()=>scrollY),sx=await pg.evaluate(()=>scrollX);await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:Math.max(0,c.x-sx),y:Math.max(0,c.y-sy),width:Math.min(c.width,VW),height:Math.min(c.height,VH-Math.max(0,c.y-sy))}});}
  else{await pg.screenshot({path:path.join(out,S.id+'.png'),clip:cl,fullPage:true});}
  meta[S.id]={w:Math.round(cl.width),h:Math.round(Math.min(cl.height,S.fixed?VH:1e9)),marks:info.marks};
  if(S.post){try{await pg.evaluate(S.post);}catch(e){errs.push(S.id+' post '+e.message);}await pg.waitForTimeout(300);}
 }
 const EX=await pg.evaluate(`(()=>{const pk=${PICK};const o={};__exA();o.A=pk(SB.result);__exN();o.N=pk(SB.result);__exB();o.B=pk(SB.result);__exC();o.C=pk(SB.result);__exP();o.P=pk(SB.result);__exA();return o;})()`);
 fs.writeFileSync(path.join(out,'_example.json'),JSON.stringify(EX,null,1));
 const mctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',isMobile:true,hasTouch:true,locale:'ko-KR'});await setup(mctx);
 const mp=await mctx.newPage();await mp.goto(`http://127.0.0.1:${PORT}/index.html`);await mp.waitForFunction(()=>window.SBENG);await mp.waitForTimeout(1200);await mp.addStyleTag({content:HIDE});await mp.evaluate(HELP);
 await mp.evaluate(GA);await mp.waitForTimeout(400);
 await mp.screenshot({path:path.join(out,'s21_mobile_main.png')});meta['s21_mobile_main']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{const e=document.querySelector('#sb-result .result-hero');window.scrollTo(0,e.getBoundingClientRect().top+scrollY-12);});await mp.waitForTimeout(400);
 await mp.screenshot({path:path.join(out,'s22_mobile_result.png')});meta['s22_mobile_result']={w:390,h:844,marks:[]};
 const mob=await mp.evaluate(()=>({page:document.documentElement.scrollWidth,vw:innerWidth}));
 fs.writeFileSync(path.join(out,'_marks.json'),JSON.stringify(meta,null,1));
 const miss=[];Object.entries(meta).forEach(([k,v])=>v.marks.forEach(m=>{if(m.miss)miss.push(k+':'+m.miss);else if(m.x<0||m.y<0||m.x+m.w>100.5||m.y+m.h>100.5||m.w<=0||m.h<=0)miss.push(k+':OUT '+m.label+' '+m.x+','+m.y+','+m.w+','+m.h);}));
 console.log(JSON.stringify({mobile:mob,sizes:Object.fromEntries(Object.entries(meta).map(([k,v])=>[k,v.w+'x'+v.h])),miss,errs:errs.slice(0,15)},null,1));
 await b.close();s.close();
})();
