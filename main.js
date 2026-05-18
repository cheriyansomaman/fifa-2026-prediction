import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, getDoc, updateDoc, deleteField } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import bcrypt from "https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/+esm";

// ── Firebase ──────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: "fifa-2026-prediction",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Static Data ───────────────────────────────────────────────────────────────
const GROUPS = {
  A:["Mexico","South Africa","South Korea","Czechia"],
  B:["Canada","Bosnia & Herzegovina","Qatar","Switzerland"],
  C:["Brazil","Morocco","Haiti","Scotland"],
  D:["United States","Paraguay","Australia","Türkiye"],
  E:["Germany","Curaçao","Ivory Coast","Ecuador"],
  F:["Netherlands","Japan","Sweden","Tunisia"],
  G:["Belgium","Egypt","Iran","New Zealand"],
  H:["Spain","Cape Verde","Saudi Arabia","Uruguay"],
  I:["France","Senegal","Iraq","Norway"],
  J:["Argentina","Algeria","Austria","Jordan"],
  K:["Portugal","Congo DR","Uzbekistan","Colombia"],
  L:["England","Croatia","Ghana","Panama"],
};
const FLAGS = {
  "Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czechia":"🇨🇿",
  "Canada":"🇨🇦","Bosnia & Herzegovina":"🇧🇦","Qatar":"🇶🇦","Switzerland":"🇨🇭",
  "Brazil":"🇧🇷","Morocco":"🇲🇦","Haiti":"🇭🇹","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "United States":"🇺🇸","Paraguay":"🇵🇾","Australia":"🇦🇺","Türkiye":"🇹🇷",
  "Germany":"🇩🇪","Curaçao":"🇨🇼","Ivory Coast":"🇨🇮","Ecuador":"🇪🇨",
  "Netherlands":"🇳🇱","Japan":"🇯🇵","Sweden":"🇸🇪","Tunisia":"🇹🇳",
  "Belgium":"🇧🇪","Egypt":"🇪🇬","Iran":"🇮🇷","New Zealand":"🇳🇿",
  "Spain":"🇪🇸","Cape Verde":"🇨🇻","Saudi Arabia":"🇸🇦","Uruguay":"🇺🇾",
  "France":"🇫🇷","Senegal":"🇸🇳","Iraq":"🇮🇶","Norway":"🇳🇴",
  "Argentina":"🇦🇷","Algeria":"🇩🇿","Austria":"🇦🇹","Jordan":"🇯🇴",
  "Portugal":"🇵🇹","Congo DR":"🇨🇩","Uzbekistan":"🇺🇿","Colombia":"🇨🇴",
  "England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croatia":"🇭🇷","Ghana":"🇬🇭","Panama":"🇵🇦","TBD":"⚽",
};
const FLAG_CODES = {
  "Mexico":"mx","South Africa":"za","South Korea":"kr","Czechia":"cz",
  "Canada":"ca","Bosnia & Herzegovina":"ba","Qatar":"qa","Switzerland":"ch",
  "Brazil":"br","Morocco":"ma","Haiti":"ht","Scotland":"gb-sct",
  "United States":"us","Paraguay":"py","Australia":"au","Türkiye":"tr",
  "Germany":"de","Curaçao":"cw","Ivory Coast":"ci","Ecuador":"ec",
  "Netherlands":"nl","Japan":"jp","Sweden":"se","Tunisia":"tn",
  "Belgium":"be","Egypt":"eg","Iran":"ir","New Zealand":"nz",
  "Spain":"es","Cape Verde":"cv","Saudi Arabia":"sa","Uruguay":"uy",
  "France":"fr","Senegal":"sn","Iraq":"iq","Norway":"no",
  "Argentina":"ar","Algeria":"dz","Austria":"at","Jordan":"jo",
  "Portugal":"pt","Congo DR":"cd","Uzbekistan":"uz","Colombia":"co",
  "England":"gb-eng","Croatia":"hr","Ghana":"gh","Panama":"pa",
};
function buildGroupFixtures(){
  // Official match numbers by chronological play order (source: FIFA 2026 schedule)
  const MN=[
    1,2,25,28,54,53,   // A
    3,5,49,50,26,27,   // B
    6,7,52,51,30,31,   // C
    4,29,32,8,59,60,   // D
    9,11,34,35,56,55,  // E
    10,12,33,36,57,58, // F
    14,16,38,40,65,66, // G
    37,39,13,15,64,63, // H
    42,43,17,18,61,62, // I
    19,20,41,44,72,71, // J
    21,24,45,48,69,70, // K
    22,23,46,47,67,68, // L
  ];
  return [
    {group:"A",home:"Mexico",away:"South Africa",date:"2026-06-11T19:00:00Z",venue:"Mexico City"},
    {group:"A",home:"South Korea",away:"Czechia",date:"2026-06-12T02:00:00Z",venue:"Guadalajara"},
    {group:"A",home:"Czechia",away:"South Africa",date:"2026-06-18T16:00:00Z",venue:"Atlanta"},
    {group:"A",home:"Mexico",away:"South Korea",date:"2026-06-19T01:00:00Z",venue:"Guadalajara"},
    {group:"A",home:"Czechia",away:"Mexico",date:"2026-06-25T01:00:00Z",venue:"Mexico City"},
    {group:"A",home:"South Africa",away:"South Korea",date:"2026-06-25T01:00:00Z",venue:"Monterrey"},
    {group:"B",home:"Canada",away:"Bosnia & Herzegovina",date:"2026-06-12T19:00:00Z",venue:"Toronto"},
    {group:"B",home:"Qatar",away:"Switzerland",date:"2026-06-13T19:00:00Z",venue:"Los Angeles"},
    {group:"B",home:"Switzerland",away:"Canada",date:"2026-06-19T19:00:00Z",venue:"Vancouver"},
    {group:"B",home:"Bosnia & Herzegovina",away:"Qatar",date:"2026-06-19T19:00:00Z",venue:"Seattle"},
    {group:"B",home:"Switzerland",away:"Bosnia & Herzegovina",date:"2026-06-23T23:00:00Z",venue:"Los Angeles"},
    {group:"B",home:"Canada",away:"Qatar",date:"2026-06-23T22:00:00Z",venue:"Vancouver"},
    {group:"C",home:"Brazil",away:"Morocco",date:"2026-06-13T22:00:00Z",venue:"New York/NJ"},
    {group:"C",home:"Haiti",away:"Scotland",date:"2026-06-14T01:00:00Z",venue:"Boston"},
    {group:"C",home:"Scotland",away:"Brazil",date:"2026-06-19T22:00:00Z",venue:"Miami"},
    {group:"C",home:"Morocco",away:"Haiti",date:"2026-06-19T22:00:00Z",venue:"Atlanta"},
    {group:"C",home:"Scotland",away:"Morocco",date:"2026-06-24T01:00:00Z",venue:"Miami"},
    {group:"C",home:"Brazil",away:"Haiti",date:"2026-06-24T01:00:00Z",venue:"Boston"},
    {group:"D",home:"United States",away:"Paraguay",date:"2026-06-12T22:00:00Z",venue:"Los Angeles"},
    {group:"D",home:"United States",away:"Australia",date:"2026-06-20T22:00:00Z",venue:"Dallas"},
    {group:"D",home:"Paraguay",away:"Türkiye",date:"2026-06-20T19:00:00Z",venue:"Houston"},
    {group:"D",home:"Australia",away:"Türkiye",date:"2026-06-15T22:00:00Z",venue:"San Francisco"},
    {group:"D",home:"Türkiye",away:"United States",date:"2026-06-25T22:00:00Z",venue:"San Francisco"},
    {group:"D",home:"Paraguay",away:"Australia",date:"2026-06-25T22:00:00Z",venue:"Kansas City"},
    {group:"E",home:"Germany",away:"Curaçao",date:"2026-06-14T22:00:00Z",venue:"Dallas"},
    {group:"E",home:"Ivory Coast",away:"Ecuador",date:"2026-06-14T19:00:00Z",venue:"Houston"},
    {group:"E",home:"Germany",away:"Ivory Coast",date:"2026-06-20T17:00:00Z",venue:"Kansas City"},
    {group:"E",home:"Ecuador",away:"Curaçao",date:"2026-06-21T03:00:00Z",venue:"Kansas City"},
    {group:"E",home:"Germany",away:"Ecuador",date:"2026-06-26T01:00:00Z",venue:"Dallas"},
    {group:"E",home:"Ivory Coast",away:"Curaçao",date:"2026-06-26T01:00:00Z",venue:"Houston"},
    {group:"F",home:"Netherlands",away:"Japan",date:"2026-06-14T01:00:00Z",venue:"Philadelphia"},
    {group:"F",home:"Sweden",away:"Tunisia",date:"2026-06-15T17:00:00Z",venue:"Houston"},
    {group:"F",home:"Netherlands",away:"Sweden",date:"2026-06-21T17:00:00Z",venue:"Houston"},
    {group:"F",home:"Japan",away:"Tunisia",date:"2026-06-22T03:00:00Z",venue:"Monterrey"},
    {group:"F",home:"Netherlands",away:"Tunisia",date:"2026-06-26T21:00:00Z",venue:"Dallas"},
    {group:"F",home:"Japan",away:"Sweden",date:"2026-06-26T21:00:00Z",venue:"Philadelphia"},
    {group:"G",home:"Belgium",away:"Egypt",date:"2026-06-15T01:00:00Z",venue:"Los Angeles"},
    {group:"G",home:"Iran",away:"New Zealand",date:"2026-06-15T19:00:00Z",venue:"Seattle"},
    {group:"G",home:"Belgium",away:"Iran",date:"2026-06-21T19:00:00Z",venue:"Los Angeles"},
    {group:"G",home:"Egypt",away:"New Zealand",date:"2026-06-22T01:00:00Z",venue:"Vancouver"},
    {group:"G",home:"Belgium",away:"New Zealand",date:"2026-06-27T01:00:00Z",venue:"Seattle"},
    {group:"G",home:"Egypt",away:"Iran",date:"2026-06-27T01:00:00Z",venue:"Los Angeles"},
    {group:"H",home:"Spain",away:"Saudi Arabia",date:"2026-06-16T16:00:00Z",venue:"Atlanta"},
    {group:"H",home:"Cape Verde",away:"Uruguay",date:"2026-06-16T22:00:00Z",venue:"Miami"},
    {group:"H",home:"Spain",away:"Cape Verde",date:"2026-06-21T22:00:00Z",venue:"Boston"},
    {group:"H",home:"Uruguay",away:"Saudi Arabia",date:"2026-06-22T22:00:00Z",venue:"Miami"},
    {group:"H",home:"Spain",away:"Uruguay",date:"2026-06-27T22:00:00Z",venue:"Miami"},
    {group:"H",home:"Cape Verde",away:"Saudi Arabia",date:"2026-06-27T22:00:00Z",venue:"Atlanta"},
    {group:"I",home:"France",away:"Iraq",date:"2026-06-17T17:00:00Z",venue:"Houston"},
    {group:"I",home:"Senegal",away:"Norway",date:"2026-06-17T01:00:00Z",venue:"New York/NJ"},
    {group:"I",home:"France",away:"Senegal",date:"2026-06-22T17:00:00Z",venue:"New York/NJ"},
    {group:"I",home:"Norway",away:"Iraq",date:"2026-06-23T01:00:00Z",venue:"Dallas"},
    {group:"I",home:"France",away:"Norway",date:"2026-06-28T21:00:00Z",venue:"Philadelphia"},
    {group:"I",home:"Senegal",away:"Iraq",date:"2026-06-28T21:00:00Z",venue:"New York/NJ"},
    {group:"J",home:"Argentina",away:"Algeria",date:"2026-06-16T19:00:00Z",venue:"Dallas"},
    {group:"J",home:"Austria",away:"Jordan",date:"2026-06-17T04:00:00Z",venue:"San Francisco"},
    {group:"J",home:"Argentina",away:"Austria",date:"2026-06-23T17:00:00Z",venue:"Dallas"},
    {group:"J",home:"Jordan",away:"Algeria",date:"2026-06-24T03:00:00Z",venue:"San Francisco"},
    {group:"J",home:"Argentina",away:"Jordan",date:"2026-06-28T21:00:00Z",venue:"Atlanta"},
    {group:"J",home:"Algeria",away:"Austria",date:"2026-06-28T21:00:00Z",venue:"Seattle"},
    {group:"K",home:"Portugal",away:"Congo DR",date:"2026-06-17T17:00:00Z",venue:"Houston"},
    {group:"K",home:"Uzbekistan",away:"Colombia",date:"2026-06-18T02:00:00Z",venue:"Mexico City"},
    {group:"K",home:"Portugal",away:"Uzbekistan",date:"2026-06-23T17:00:00Z",venue:"Houston"},
    {group:"K",home:"Colombia",away:"Congo DR",date:"2026-06-23T02:00:00Z",venue:"Guadalajara"},
    {group:"K",home:"Portugal",away:"Colombia",date:"2026-06-27T21:00:00Z",venue:"Kansas City"},
    {group:"K",home:"Congo DR",away:"Uzbekistan",date:"2026-06-27T21:00:00Z",venue:"Dallas"},
    {group:"L",home:"England",away:"Croatia",date:"2026-06-13T20:00:00Z",venue:"New York/NJ"},
    {group:"L",home:"Ghana",away:"Panama",date:"2026-06-13T23:00:00Z",venue:"Toronto"},
    {group:"L",home:"England",away:"Ghana",date:"2026-06-20T20:00:00Z",venue:"Boston"},
    {group:"L",home:"Panama",away:"Croatia",date:"2026-06-20T23:00:00Z",venue:"Toronto"},
    {group:"L",home:"England",away:"Panama",date:"2026-06-25T21:00:00Z",venue:"Toronto"},
    {group:"L",home:"Croatia",away:"Ghana",date:"2026-06-25T21:00:00Z",venue:"New York/NJ"},
  ].map((m,i)=>({...m,id:i+1,matchNum:MN[i],stage:"group"}));
}
const GF = buildGroupFixtures();

// ── Logic ─────────────────────────────────────────────────────────────────────
function standings(group, results){
  const teams = GROUPS[group].map(n=>({name:n,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0}));
  const tm = Object.fromEntries(teams.map(t=>[t.name,t]));
  GF.filter(f=>f.group===group).forEach(f=>{
    const r=results[f.id]; if(!r) return;
    const h=tm[f.home],a=tm[f.away]; if(!h||!a) return;
    const hg=parseInt(r.homeGoals,10),ag=parseInt(r.awayGoals,10);
    if(isNaN(hg)||isNaN(ag)) return;
    h.p++;a.p++;h.gf+=hg;h.ga+=ag;h.gd+=hg-ag;a.gf+=ag;a.ga+=hg;a.gd+=ag-hg;
    if(hg>ag){h.w++;h.pts+=3;a.l++;}else if(hg<ag){a.w++;a.pts+=3;h.l++;}
    else{h.d++;h.pts++;a.d++;a.pts++;}
  });
  return teams.sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
}
function buildKO(results){
  const gw={},gr={},thirds=[];
  Object.keys(GROUPS).forEach(g=>{
    const groupMatches=GF.filter(f=>f.group===g);
    const allPlayed=groupMatches.every(f=>results[f.id]);
    if(allPlayed){
      const s=standings(g,results);
      gw[g]=s[0]?.name||"TBC"; gr[g]=s[1]?.name||"TBC";
      if(s[2]) thirds.push({team:s[2].name,pts:s[2].pts,gd:s[2].gd,gf:s[2].gf});
    } else {
      gw[g]="TBC"; gr[g]="TBC";
    }
  });
  thirds.sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
  const t=i=>thirds[i]?.team||"TBC";
  const allKO=[];
  const w=id=>{
    const r=results[id]; if(!r) return "TBC";
    const hg=parseInt(r.homeGoals,10),ag=parseInt(r.awayGoals,10);
    if(isNaN(hg)||isNaN(ag)) return r.winner||"TBC";
    const fix=allKO.find(f=>f.id===id); if(!fix) return "TBC";
    if(hg>ag) return fix.home; if(ag>hg) return fix.away;
    if(r.homePenGoals!=null&&r.awayPenGoals!=null)
      return r.homePenGoals>r.awayPenGoals?fix.home:fix.away;
    return r.penaltyWinner||"TBC";
  };

  const r32=[
    {id:101,home:gw.A,away:t(4),date:"2026-06-29T20:00:00Z",stage:"r32",label:"R32 #1",venue:"Mexico City"},
    {id:102,home:gw.C,away:gr.F,date:"2026-06-29T17:00:00Z",stage:"r32",label:"R32 #2",venue:"Houston"},
    {id:103,home:gw.F,away:gr.C,date:"2026-06-29T01:00:00Z",stage:"r32",label:"R32 #3",venue:"Guadalajara"},
    {id:104,home:gw.E,away:t(0),date:"2026-06-29T21:30:00Z",stage:"r32",label:"R32 #4",venue:"Boston"},
    {id:105,home:gr.E,away:gr.I,date:"2026-06-30T17:00:00Z",stage:"r32",label:"R32 #5",venue:"Dallas"},
    {id:106,home:gw.I,away:t(1),date:"2026-06-30T21:00:00Z",stage:"r32",label:"R32 #6",venue:"New York/NJ"},
    {id:107,home:gw.L,away:t(2),date:"2026-07-01T16:00:00Z",stage:"r32",label:"R32 #7",venue:"Atlanta"},
    {id:108,home:gw.G,away:t(3),date:"2026-07-01T20:00:00Z",stage:"r32",label:"R32 #8",venue:"Seattle"},
    {id:109,home:gw.D,away:t(5),date:"2026-07-02T01:00:00Z",stage:"r32",label:"R32 #9",venue:"San Francisco"},
    {id:110,home:gw.B,away:gr.G,date:"2026-07-02T19:00:00Z",stage:"r32",label:"R32 #10",venue:"Kansas City"},
    {id:111,home:gw.J,away:gr.H,date:"2026-07-03T01:00:00Z",stage:"r32",label:"R32 #11",venue:"Miami"},
    {id:112,home:gw.K,away:t(6),date:"2026-07-03T01:30:00Z",stage:"r32",label:"R32 #12",venue:"Dallas"},
    {id:113,home:gw.H,away:gr.J,date:"2026-07-02T01:00:00Z",stage:"r32",label:"R32 #13",venue:"Los Angeles"},
    {id:114,home:gr.D,away:gr.B,date:"2026-07-02T17:00:00Z",stage:"r32",label:"R32 #14",venue:"Philadelphia"},
    {id:115,home:gr.A,away:t(7),date:"2026-07-01T20:00:00Z",stage:"r32",label:"R32 #15",venue:"Toronto"},
    {id:116,home:gr.L,away:gr.K,date:"2026-07-03T17:00:00Z",stage:"r32",label:"R32 #16",venue:"Vancouver"},
  ];
  allKO.push(...r32);

  const r16=[
    {id:201,home:w(101),away:w(102),date:"2026-07-05T17:00:00Z",stage:"r16",label:"R16 #1",venue:"Dallas"},
    {id:202,home:w(103),away:w(104),date:"2026-07-05T21:00:00Z",stage:"r16",label:"R16 #2",venue:"New York/NJ"},
    {id:203,home:w(105),away:w(106),date:"2026-07-06T17:00:00Z",stage:"r16",label:"R16 #3",venue:"Los Angeles"},
    {id:204,home:w(107),away:w(108),date:"2026-07-06T21:00:00Z",stage:"r16",label:"R16 #4",venue:"Atlanta"},
    {id:205,home:w(109),away:w(110),date:"2026-07-07T17:00:00Z",stage:"r16",label:"R16 #5",venue:"Houston"},
    {id:206,home:w(111),away:w(112),date:"2026-07-07T21:00:00Z",stage:"r16",label:"R16 #6",venue:"Seattle"},
    {id:207,home:w(113),away:w(114),date:"2026-07-08T17:00:00Z",stage:"r16",label:"R16 #7",venue:"Miami"},
    {id:208,home:w(115),away:w(116),date:"2026-07-08T21:00:00Z",stage:"r16",label:"R16 #8",venue:"Vancouver"},
  ];
  allKO.push(...r16);

  const qf=[
    {id:301,home:w(201),away:w(202),date:"2026-07-11T19:00:00Z",stage:"qf",label:"QF #1",venue:"Kansas City"},
    {id:302,home:w(203),away:w(204),date:"2026-07-11T23:00:00Z",stage:"qf",label:"QF #2",venue:"Dallas"},
    {id:303,home:w(205),away:w(206),date:"2026-07-12T19:00:00Z",stage:"qf",label:"QF #3",venue:"Los Angeles"},
    {id:304,home:w(207),away:w(208),date:"2026-07-12T23:00:00Z",stage:"qf",label:"QF #4",venue:"Boston"},
  ];
  allKO.push(...qf);

  const sf=[
    {id:401,home:w(301),away:w(302),date:"2026-07-15T23:00:00Z",stage:"sf",label:"SF #1",venue:"Atlanta"},
    {id:402,home:w(303),away:w(304),date:"2026-07-16T23:00:00Z",stage:"sf",label:"SF #2",venue:"New York/NJ"},
  ];
  allKO.push(...sf);

  const fin=[
    {id:501,home:w(401),away:w(402),date:"2026-07-19T23:00:00Z",stage:"final",label:"Final",venue:"New York/NJ"},
  ];

  return [...r32,...r16,...qf,...sf,...fin];
}
function predOpen(kickoff){ return Date.now() < new Date(kickoff).getTime()-3600000; }
function fmtDate(iso){ return new Date(iso).toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit",timeZoneName:"short"}); }
function calcPts(pred,res,fixture){
  if(!res||!pred) return 0;
  const stage=fixture.stage||fixture;
  const hg=parseInt(res.homeGoals,10),ag=parseInt(res.awayGoals,10);
  const phg=parseInt(pred.homeGoals,10),pag=parseInt(pred.awayGoals,10);
  if(isNaN(hg)||isNaN(ag)||isNaN(phg)||isNaN(pag)) return 0;
  const ao=hg>ag?"H":ag>hg?"A":"D",po=phg>pag?"H":pag>phg?"A":"D";
  if(stage==="group"){
    if(phg===hg&&pag===ag) return 5;
    if(ao===po) return ao==="D"?3:hg-ag===phg-pag?4:3;
    return ao==="D"?1:0;
  }
  // KO stage
  if(ao!=="D"){
    // decisive at 90 min
    if(phg===hg&&pag===ag) return 5;
    if(ao===po) return hg-ag===phg-pag?4:3;
    return 0;
  }
  // draw at 90 min → penalties
  const penWinner=res.homePenGoals!=null&&res.awayPenGoals!=null
    ?(res.homePenGoals>res.awayPenGoals?fixture.home:fixture.away)
    :res.penaltyWinner||null;
  if(po==="D"){
    let pts=(phg===hg&&pag===ag)?4:3;
    const predPenWinner=pred.homePenGoals!=null&&pred.awayPenGoals!=null
      ?(pred.homePenGoals>pred.awayPenGoals?fixture.home:fixture.away)
      :pred.penaltyWinner||null;
    if(penWinner&&predPenWinner===penWinner) pts+=1;
    return pts;
  }
  // predicted a decisive winner but went to pens
  const predWinner=po==="H"?fixture.home:fixture.away;
  return penWinner===predWinner?4:1;
}
const flag = n => FLAGS[n]||"⚽";
function mkStepper(label,initVal,accent,cb,size="lg"){
  let val=Number.isFinite(Number(initVal))?Number(initVal):0;
  const sm=size==="sm";
  const dim=sm?"32px":"60px"; const btnW=sm?"26px":"42px"; const fs=sm?15:28; const btnFs=sm?14:20; const br=sm?7:12;
  const disp=h("span",[css({width:sm?"36px":"58px",textAlign:"center",fontSize:fs+"px",fontWeight:900,color:"#fff",display:"inline-block",lineHeight:dim,userSelect:"none",flexShrink:0})],[String(val)]);
  const mkB=(sym,d)=>{
    const b=h("button",[css({width:btnW,height:dim,fontSize:btnFs+"px",fontWeight:900,background:"rgba(255,255,255,0.04)",border:"none",color:accent,cursor:"pointer",flexShrink:0,transition:"background .12s",lineHeight:dim,borderRadius:d<0?`${br}px 0 0 ${br}px`:`0 ${br}px ${br}px 0`}),on("click",()=>{
      val=Math.max(0,Math.min(20,val+d));
      disp.textContent=String(val); cb(val);
    })],[sym]);
    b.onmouseenter=()=>{b.style.background=accent+"22";};
    b.onmouseleave=()=>{b.style.background="rgba(255,255,255,0.04)";};
    return b;
  };
  cb(val);
  const row=h("div",[css({display:"flex",alignItems:"center",border:`2px solid #1e3a5f`,borderRadius:br+"px",background:"#0f1f3d",overflow:"hidden"})],[mkB("−",-1),disp,mkB("+",1)]);
  if(!label) return row;
  return h("div",[css({textAlign:"center"})],[
    h("div",[css({fontSize:11,color:accent,letterSpacing:2,textTransform:"uppercase",marginBottom:8,lineHeight:1.4})],[label]),
    row
  ]);
}
function flagImg(name,size=28){
  const code=FLAG_CODES[name];
  if(!code) return h("span",[css({fontSize:size*0.85,lineHeight:1,flexShrink:0})],[FLAGS[name]||"⚽"]);
  return h("img",[["src",`https://flagcdn.com/w40/${code}.png`],["alt",name],css({
    width:size+"px",height:size+"px",objectFit:"cover",borderRadius:"4px",display:"block",flexShrink:0
  })],[]);
}

// ── Session persistence (15 days) ────────────────────────────────────────────
const _sess=(()=>{try{const s=JSON.parse(localStorage.getItem("fifa_session")||"null");return s&&s.expiry>Date.now()?s:null;}catch(e){return null;}})();
function saveSession(uid,isAdmin){localStorage.setItem("fifa_session",JSON.stringify({uid,isAdmin,expiry:Date.now()+15*24*60*60*1000}));}
function clearSession(){localStorage.removeItem("fifa_session");}

// ── App State ─────────────────────────────────────────────────────────────────
let S={
  tab:"fixtures",grpTab:"A",
  uid:_sess?.uid||null,isAdmin:_sess?.isAdmin||false,
  users:{},preds:{},results:{},ko:[],
  modal:null,nameVal:"",pwVal:"",
  loading:true,saving:false,msg:"",loginError:"",
  mustChangePassword:false,newPwVal:"",confirmPwVal:"",changeError:"",
  tempPwDisplay:null,
};

function set(patch){ S={...S,...patch}; draw(); }

// ── Firestore ─────────────────────────────────────────────────────────────────
onSnapshot(collection(db,"users"), snap=>{
  const users={};
  snap.forEach(d=>{ users[d.id]=d.data().name; });
  set({users});
});
onSnapshot(doc(db,"app","results"), snap=>{
  const results=snap.exists()?snap.data():{};
  set({results, ko:buildKO(results)});
});
onSnapshot(collection(db,"predictions"), snap=>{
  const preds={};
  snap.forEach(d=>{ preds[d.id]=d.data(); });
  set({preds,loading:false});
});

async function fsSet(path,data){
  const parts=path.split("/");
  await setDoc(doc(db,...parts),data,{merge:true});
}

async function login(){
  const name=S.nameVal.trim();
  const pw=S.pwVal.trim();
  if(!name||!pw){
    set({loginError:"Name and password required"});
    return;
  }
  const uid=name.toLowerCase().replace(/\s+/g,"_");
  set({saving:true,loginError:""});

  try{
    const userDoc=await getDoc(doc(db,"users",uid));
    if(userDoc.exists()){
      const stored=userDoc.data();
      const valid=await bcrypt.compare(pw,stored.hashed);
      if(valid){
        saveSession(uid,stored.role==="admin");
        set({uid,isAdmin:stored.role==="admin",saving:false,pwVal:"",nameVal:"",loginError:"",mustChangePassword:false});
        return;
      }
      // Try temp password
      if(stored.tempHashed){
        const tempValid=await bcrypt.compare(pw,stored.tempHashed);
        if(tempValid){
          saveSession(uid,stored.role==="admin");
          set({uid,isAdmin:stored.role==="admin",saving:false,pwVal:"",nameVal:"",loginError:"",mustChangePassword:true,newPwVal:"",confirmPwVal:"",changeError:""});
          return;
        }
      }
      set({saving:false,loginError:"Invalid password"});
    } else {
      // New user, hash and create
      const hashed=await bcrypt.hash(pw,10);
      await setDoc(doc(db,"users",uid),{name,hashed,created:Date.now()});
      saveSession(uid,false);
      set({uid,isAdmin:false,saving:false,pwVal:"",nameVal:"",loginError:"",mustChangePassword:false});
    }
  } catch(e){
    set({saving:false,loginError:e.message});
  }
}
function genTempPw(){
  const chars="ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const arr=new Uint8Array(10);
  crypto.getRandomValues(arr);
  return Array.from(arr,n=>chars[n%chars.length]).join("");
}
async function generateTempForUser(uid){
  const pw=genTempPw();
  const tempHashed=await bcrypt.hash(pw,10);
  await updateDoc(doc(db,"users",uid),{tempHashed});
  set({tempPwDisplay:{uid,pw}});
}
async function changePassword(){
  const np=S.newPwVal.trim(), cp=S.confirmPwVal.trim();
  if(!np){ set({changeError:"Enter new password"}); return; }
  if(np.length<6){ set({changeError:"Min 6 characters"}); return; }
  if(np!==cp){ set({changeError:"Passwords don't match"}); return; }
  set({saving:true,changeError:""});
  try{
    const hashed=await bcrypt.hash(np,10);
    await updateDoc(doc(db,"users",S.uid),{hashed,tempHashed:deleteField()});
    set({saving:false,mustChangePassword:false,newPwVal:"",confirmPwVal:"",changeError:""});
  } catch(e){
    set({saving:false,changeError:e.message});
  }
}
async function predict(fixture,pred){
  set({saving:true,modal:null});
  await fsSet(`predictions/${S.uid}`,{[fixture.id]:pred});
  set({saving:false,msg:"✓ Prediction saved"});
  setTimeout(()=>set({msg:""}),2500);
}
async function enterResult(fixture,res){
  set({saving:true,modal:null});
  await fsSet("app/results",{[fixture.id]:res});
  set({saving:false,msg:"✓ Result saved"});
  setTimeout(()=>set({msg:""}),2500);
}

// ── DOM helpers ───────────────────────────────────────────────────────────────
function h(tag,attrs,children){
  const el=document.createElement(tag);
  (attrs||[]).forEach(([k,v])=>{
    if(k==="style") Object.assign(el.style,v);
    else if(k==="class") el.className=v;
    else if(typeof v==="function") el.addEventListener(k,v);
    else el.setAttribute(k,v);
  });
  (children||[]).forEach(c=>{
    if(c==null||c===false) return;
    el.appendChild(typeof c==="string"||typeof c==="number"?document.createTextNode(String(c)):c);
  });
  return el;
}
const css=obj=>["style",obj];
const on=(ev,fn)=>[ev,fn];
const cls=c=>["class",c];
const ICONS={
  lock:["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"],
  list:["M8 6h13","M8 12h13","M8 18h13","M3 6h.01","M3 12h.01","M3 18h.01"],
  edit:["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
};
function svgIcon(paths,size=13,extraStyle={}){
  const ns="http://www.w3.org/2000/svg";
  const s=document.createElementNS(ns,"svg");
  s.setAttribute("width",size);s.setAttribute("height",size);
  s.setAttribute("viewBox","0 0 24 24");s.setAttribute("fill","none");
  s.setAttribute("stroke","currentColor");s.setAttribute("stroke-width","2");
  s.setAttribute("stroke-linecap","round");s.setAttribute("stroke-linejoin","round");
  Object.assign(s.style,{display:"inline-block",verticalAlign:"middle",flexShrink:0,...extraStyle});
  (Array.isArray(paths)?paths:[paths]).forEach(d=>{const p=document.createElementNS(ns,"path");p.setAttribute("d",d);s.appendChild(p);});
  return s;
}

function ripple(el){
  el.style.position='relative';el.style.overflow='hidden';
  el.addEventListener('click',function(e){
    const rect=el.getBoundingClientRect();
    const size=Math.max(rect.width,rect.height)*2.5;
    const x=e.clientX-rect.left-size/2, y=e.clientY-rect.top-size/2;
    const s=document.createElement('span');
    Object.assign(s.style,{position:'absolute',width:size+'px',height:size+'px',borderRadius:'50%',background:'rgba(255,255,255,0.18)',left:x+'px',top:y+'px',transform:'scale(0)',animation:'rippleAnim 0.55s ease-out forwards',pointerEvents:'none'});
    el.appendChild(s);setTimeout(()=>s.remove(),700);
  });
  return el;
}
function sportInput(el){
  el.addEventListener('focus',()=>{el.style.borderColor='#16a34a';el.style.boxShadow='0 0 0 3px rgba(22,163,74,0.2)';});
  el.addEventListener('blur',()=>{el.style.borderColor='#1e3a5f';el.style.boxShadow='';});
  return el;
}

function pill(label,active,onclick){
  const shadow=active?"0 2px 8px rgba(22,163,74,0.35)":"none";
  const bg=active?"linear-gradient(135deg,#18b352,#14803d)":"transparent";
  const b=h("button",[css({padding:"7px 16px",fontSize:11,fontWeight:700,borderRadius:4,border:`1px solid ${active?"transparent":"#1e3a5f"}`,background:bg,color:active?"#fff":"#94a3b8",cursor:"pointer",whiteSpace:"nowrap",transition:"all .15s",fontFamily:"'Barlow',sans-serif",textTransform:"uppercase",letterSpacing:1,boxShadow:shadow}),on("click",onclick)],[label]);
  b.onmouseenter=()=>{ if(!active){b.style.borderColor="#4ade80";b.style.color="#e2e8f0";b.style.background="rgba(22,163,74,0.08)";} };
  b.onmouseleave=()=>{ if(!active){b.style.borderColor="#1e3a5f";b.style.color="#94a3b8";b.style.background="transparent";} };
  ripple(b);
  return b;
}

function tabBtn(label,key){
  const active=S.tab===key;
  const b=ripple(h("button",[css({padding:"14px 22px",fontSize:13,fontWeight:800,letterSpacing:3,textTransform:"uppercase",whiteSpace:"nowrap",border:"none",borderBottom:`3px solid ${active?"#16a34a":"transparent"}`,background:active?"rgba(22,163,74,0.08)":"transparent",cursor:"pointer",color:active?"#4ade80":"#64748b",transition:"all .15s",fontFamily:"'Barlow Condensed',sans-serif"}),on("click",()=>set({tab:key}))],[label]));
  if(!active){b.onmouseenter=()=>{b.style.color="#94a3b8";b.style.background="rgba(30,58,95,0.3)";};b.onmouseleave=()=>{b.style.color="#64748b";b.style.background="transparent";};}
  return b;
}

// ── Match Card ────────────────────────────────────────────────────────────────
function matchCard(fixture){
  const userPred = S.uid ? S.preds[S.uid]?.[fixture.id] : null;
  const res = S.results[fixture.id];
  const open = predOpen(fixture.date);
  const hasPred=!!userPred, hasRes=!!res;
  const pts = hasRes&&hasPred ? calcPts(userPred,res,fixture) : null;

  const isTBC = fixture.home==="TBC"||fixture.away==="TBC";
  const bdr = hasRes?"#16a34a":hasPred?"#1d4ed8":isTBC?"#0f1f3d":open?"#1e3a5f":"#7f1d1d";
  const bg  = hasRes?"rgba(22,163,74,0.1)":hasPred?"rgba(29,78,216,0.08)":isTBC?"rgba(5,11,20,0.5)":open?"rgba(10,22,40,0.6)":"rgba(127,29,29,0.08)";

  // score / VS
  let scoreNode;
  if(hasRes){
    if(res.homeGoals!==undefined){
      const penNote=parseInt(res.homeGoals)===parseInt(res.awayGoals)&&(res.homePenGoals!=null||res.penaltyWinner)?h("div",[css({fontSize:11,color:"#94a3b8",marginTop:2,textAlign:"center"})],[res.homePenGoals!=null?`Pen: ${res.homePenGoals} – ${res.awayPenGoals}`:`Pen: ${res.penaltyWinner}`]):null;
      scoreNode=h("div",[css({textAlign:"center"})],[h("span",[css({fontSize:32,fontWeight:900,color:"#4ade80",fontFamily:"'Barlow Condensed',sans-serif"})],[`${res.homeGoals} – ${res.awayGoals}`]),...(penNote?[penNote]:[])]);
    } else {
      scoreNode=h("div",[css({textAlign:"center",fontSize:13,color:"#4ade80",fontWeight:700})],[`Winner: ${flag(res.winner)} ${res.winner}`]);
    }
  } else {
    scoreNode=h("span",[css({fontSize:22,fontWeight:900,color:"#475569",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:3})],["VS"]);
  }

  const badgeRight=[];
  if(fixture.label) badgeRight.push(h("span",[css({fontSize:11,color:"#94a3b8",fontWeight:700})],[fixture.label]));
  if(hasRes&&pts!==null) badgeRight.push(h("span",[css({fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:4,background:pts>0?"#14532d":"#0f1f3d",color:pts>0?"#86efac":"#94a3b8",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,textTransform:"uppercase"})],[`+${pts} pts`]));
  if(isTBC) badgeRight.push(h("span",[css({fontSize:11,color:"#64748b",fontWeight:700})],["COMING SOON"]));
  else if(hasRes) badgeRight.push(h("span",[css({fontSize:11,color:"#f87171",fontWeight:700})],["CLOSED"]));
  else badgeRight.push(h("span",[cls("pulse"),css({fontSize:11,color:"#4ade80",fontWeight:700})],["● OPEN"]));

  const card=h("div",[cls("match-card"),css({border:`1px solid ${bdr}`,background:bg,borderRadius:8,padding:"18px 22px",marginBottom:16})],[
    h("div",[css({display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14})],[
      h("span",[css({fontSize:11,color:"#64748b",lineHeight:1.4})],[`${fmtDate(fixture.date)} · ${fixture.venue||""}`]),
      h("div",[css({display:"flex",gap:10,alignItems:"center",flexShrink:0,marginLeft:10})],badgeRight)
    ]),
    h("div",[css({display:"flex",alignItems:"center",justifyContent:"space-between",gap:12})],[
      h("div",[css({flex:1,textAlign:"right",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:10})],[
        h("span",[css({fontWeight:700,fontSize:16,fontFamily:"'Barlow Condensed',sans-serif",textTransform:"uppercase",letterSpacing:0.5,lineHeight:1.2})],[fixture.home]),
        flagImg(fixture.home)
      ]),
      h("div",[css({minWidth:96,textAlign:"center"})],[scoreNode]),
      h("div",[css({flex:1,textAlign:"left",display:"flex",alignItems:"center",gap:10})],[
        flagImg(fixture.away),
        h("span",[css({fontWeight:700,fontSize:16,fontFamily:"'Barlow Condensed',sans-serif",textTransform:"uppercase",letterSpacing:0.5,lineHeight:1.2})],[fixture.away])
      ])
    ])
  ]);

  // Prediction area — only show when there's something to display
  if(S.uid && !isTBC && (hasPred || !hasRes)){
    const section=h("div",[css({marginTop:14,paddingTop:12,borderTop:"1px solid rgba(30,58,95,0.4)"})],[]);
    if(hasPred){
      section.appendChild(h("div",[css({textAlign:"center",marginBottom:10,padding:"7px 14px",background:"rgba(29,78,216,0.1)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:6,fontSize:13,color:"#93c5fd",lineHeight:1.5,fontWeight:700})],[
        userPred.homeGoals!==undefined?`Your pick: ${userPred.homeGoals} – ${userPred.awayGoals}`+(userPred.homePenGoals!=null?` | Pen: ${userPred.homePenGoals}–${userPred.awayPenGoals}`:userPred.penaltyWinner?` | Pen: ${userPred.penaltyWinner}`:""):`Your pick: ${flag(userPred.winner)} ${userPred.winner} to win`
      ]));
    }
    if(open && !hasRes){
      const pb=h("button",[css({width:"100%",padding:"11px 0",fontSize:12,fontWeight:800,letterSpacing:3,textTransform:"uppercase",borderRadius:6,border:"2px solid #16a34a",background:"transparent",color:"#4ade80",cursor:"pointer",transition:"all .18s",fontFamily:"'Barlow Condensed',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7}),on("click",()=>set({modal:{type:"predict",fixture}}))],hasPred?[svgIcon(ICONS.edit,14),"Edit Prediction"]:["⚽ Predict"]);
      pb.onmouseenter=()=>{pb.style.background="linear-gradient(135deg,#18b352,#14803d)";pb.style.color="#fff";pb.style.boxShadow="0 4px 14px rgba(22,163,74,0.4)";pb.style.borderColor="transparent";};
      pb.onmouseleave=()=>{pb.style.background="transparent";pb.style.color="#4ade80";pb.style.boxShadow="";pb.style.borderColor="#16a34a";};
      ripple(pb);
      section.appendChild(pb);
    }
    if(!hasPred && !open && !hasRes){
      section.appendChild(h("div",[css({textAlign:"center",fontSize:11,color:"#475569",fontStyle:"italic",padding:"3px 0"})],["Prediction window closed"]));
    }
    card.appendChild(section);
  }
  if(S.isAdmin&&!hasRes&&!isTBC){
    const rb=h("button",[css({width:"100%",padding:"11px 0",fontSize:12,fontWeight:800,letterSpacing:3,textTransform:"uppercase",borderRadius:6,border:"2px solid #d97706",background:"transparent",color:"#fbbf24",cursor:"pointer",marginTop:8,transition:"all .18s",fontFamily:"'Barlow Condensed',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7}),on("click",()=>set({modal:{type:"result",fixture}}))],[svgIcon(ICONS.list,13),"Enter Result"]);
    rb.onmouseenter=()=>{rb.style.background="linear-gradient(135deg,#f59e0b,#b45309)";rb.style.color="#fff";rb.style.boxShadow="0 4px 14px rgba(217,119,6,0.4)";rb.style.borderColor="transparent";};
    rb.onmouseleave=()=>{rb.style.background="transparent";rb.style.color="#fbbf24";rb.style.boxShadow="";rb.style.borderColor="#d97706";};
    ripple(rb);
    card.appendChild(rb);
  }
  return card;
}

// ── Predict Modal ─────────────────────────────────────────────────────────────
function predictModal(fixture){
  const existing = S.uid ? S.preds[S.uid]?.[fixture.id] : null;
  const isGroup = fixture.stage==="group";
  let hg=existing?.homeGoals??0, ag=existing?.awayGoals??0;
  let homePen=existing?.homePenGoals??0, awayPen=existing?.awayPenGoals??0;

  const overlay=h("div",[cls("modal-overlay"),css({position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"24px"}),on("click",e=>{if(e.target===overlay)set({modal:null});})],[]);

  const box=h("div",[cls("modal-box"),css({background:"#080f1e",border:"1px solid #1e3a5f",borderTop:"3px solid #16a34a",borderRadius:12,padding:28,width:"min(380px, calc(100vw - 48px))",maxHeight:"88vh",overflowY:"auto",flexShrink:0})],[
    h("h3",[css({margin:"0 0 4px",fontSize:20,fontWeight:900,color:"#fff"})],["Your Prediction"]),
    h("div",[css({margin:"0 0 22px",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontSize:13,color:"#64748b",flexWrap:"wrap",lineHeight:1.4})],[
      flagImg(fixture.home,20),h("span",null,[fixture.home]),h("span",[css({color:"#1e3a5f",padding:"0 4px"})],["vs"]),flagImg(fixture.away,20),h("span",null,[fixture.away])
    ])
  ]);

  const sepStyle=css({fontSize:28,fontWeight:900,color:"#475569",alignSelf:"flex-end",paddingBottom:8});
  if(isGroup){
    box.appendChild(h("div",[css({display:"flex",alignItems:"flex-end",justifyContent:"center",gap:12})],[
      mkStepper(fixture.home,hg,"#4ade80",v=>hg=v),
      h("span",[sepStyle],["–"]),
      mkStepper(fixture.away,ag,"#4ade80",v=>ag=v),
    ]));
  } else {
    // KO: score inputs + conditional penalty score inputs
    const penSection=h("div",[css({marginTop:14,display:"none"})],[
      h("p",[css({fontSize:12,color:"#94a3b8",textAlign:"center",margin:"0 0 14px",letterSpacing:1,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif"})],["Penalty Shootout"])
    ]);
    const penSepStyle=css({fontSize:22,fontWeight:900,color:"#475569",alignSelf:"flex-end",paddingBottom:6});
    penSection.appendChild(h("div",[css({display:"flex",alignItems:"flex-end",justifyContent:"center",gap:10})],[
      mkStepper(fixture.home,homePen,"#4ade80",v=>homePen=v),
      h("span",[penSepStyle],["–"]),
      mkStepper(fixture.away,awayPen,"#4ade80",v=>awayPen=v),
    ]));
    const checkPen=()=>{
      penSection.style.display=hg===ag?"block":"none";
      if(hg!==ag){ homePen=0; awayPen=0; }
    };
    box.appendChild(h("div",[css({display:"flex",alignItems:"flex-end",justifyContent:"center",gap:12})],[
      mkStepper(fixture.home,hg,"#4ade80",v=>{hg=v;checkPen();}),
      h("span",[sepStyle],["–"]),
      mkStepper(fixture.away,ag,"#4ade80",v=>{ag=v;checkPen();}),
    ]));
    box.appendChild(penSection);
    checkPen();
  }

  const cancelBtn=ripple(h("button",[css({flex:1,padding:"10px 0",borderRadius:6,border:"1px solid #1e3a5f",background:"transparent",color:"#94a3b8",fontWeight:700,cursor:"pointer",fontSize:15,fontFamily:"'Barlow',sans-serif",transition:"background 150ms,color 150ms"}),on("click",()=>set({modal:null}))],["Cancel"]));
  cancelBtn.onmouseenter=()=>{cancelBtn.style.background="rgba(30,58,95,0.3)";cancelBtn.style.color="#e2e8f0";};
  cancelBtn.onmouseleave=()=>{cancelBtn.style.background="transparent";cancelBtn.style.color="#94a3b8";};
  const saveBtn=ripple(h("button",[css({flex:1,padding:"10px 0",borderRadius:6,border:"none",background:"linear-gradient(135deg,#18b352,#14803d)",color:"#fff",fontWeight:900,cursor:"pointer",fontSize:15,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,textTransform:"uppercase",boxShadow:"0 4px 14px rgba(22,163,74,0.4)"}),on("click",()=>{
    if(isGroup){ predict(fixture,{homeGoals:hg,awayGoals:ag}); }
    else {
      const pred={homeGoals:hg,awayGoals:ag};
      if(hg===ag){ pred.homePenGoals=homePen; pred.awayPenGoals=awayPen; }
      predict(fixture,pred);
    }
  })],["Save ✓"]));
  box.appendChild(h("div",[css({display:"flex",gap:10,marginTop:20})],[cancelBtn,saveBtn]));
  overlay.appendChild(box);
  return overlay;
}

// ── Result Modal ──────────────────────────────────────────────────────────────
function resultModal(fixture){
  const isGroup=fixture.stage==="group";
  const ex=S.results[fixture.id];
  let hg=ex!=null?ex.homeGoals:0, ag=ex!=null?ex.awayGoals:0;
  let homePen=ex?.homePenGoals??0, awayPen=ex?.awayPenGoals??0;
  const overlay=h("div",[cls("modal-overlay"),css({position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"24px"}),on("click",e=>{if(e.target===overlay)set({modal:null});})],[]);
  const box=h("div",[cls("modal-box"),css({background:"#080f1e",border:"1px solid #92400e",borderTop:"3px solid #d97706",borderRadius:12,padding:28,width:"min(380px, calc(100vw - 48px))",maxHeight:"88vh",overflowY:"auto",flexShrink:0})],[
    h("h3",[css({margin:"0 0 4px",fontSize:20,fontWeight:900,color:"#fbbf24"})],["Enter Result (Admin)"]),
    h("div",[css({margin:"0 0 22px",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontSize:13,color:"#64748b",flexWrap:"wrap",lineHeight:1.4})],[
      flagImg(fixture.home,20),h("span",null,[fixture.home]),h("span",[css({color:"#1e3a5f",padding:"0 4px"})],["vs"]),flagImg(fixture.away,20),h("span",null,[fixture.away])
    ])
  ]);

  const rSep=css({fontSize:28,fontWeight:900,color:"#475569",alignSelf:"flex-end",paddingBottom:8});
  if(isGroup){
    box.appendChild(h("div",[css({display:"flex",alignItems:"flex-end",justifyContent:"center",gap:12})],[
      mkStepper(fixture.home,hg,"#fbbf24",v=>hg=v),
      h("span",[rSep],["–"]),
      mkStepper(fixture.away,ag,"#fbbf24",v=>ag=v),
    ]));
  } else {
    // KO: score inputs + conditional penalty score inputs
    const rPenSection=h("div",[css({marginTop:14,display:"none"})],[
      h("p",[css({fontSize:12,color:"#94a3b8",textAlign:"center",margin:"0 0 14px",letterSpacing:1,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif"})],["Penalty Shootout"])
    ]);
    const rPenSepStyle=css({fontSize:22,fontWeight:900,color:"#475569",alignSelf:"flex-end",paddingBottom:6});
    rPenSection.appendChild(h("div",[css({display:"flex",alignItems:"flex-end",justifyContent:"center",gap:10})],[
      mkStepper(fixture.home,homePen,"#fbbf24",v=>homePen=v),
      h("span",[rPenSepStyle],["–"]),
      mkStepper(fixture.away,awayPen,"#fbbf24",v=>awayPen=v),
    ]));
    const checkRPen=()=>{
      rPenSection.style.display=hg===ag?"block":"none";
      if(hg!==ag){ homePen=0; awayPen=0; }
    };
    box.appendChild(h("div",[css({display:"flex",alignItems:"flex-end",justifyContent:"center",gap:12})],[
      mkStepper(fixture.home,hg,"#fbbf24",v=>{hg=v;checkRPen();}),
      h("span",[rSep],["–"]),
      mkStepper(fixture.away,ag,"#fbbf24",v=>{ag=v;checkRPen();}),
    ]));
    box.appendChild(rPenSection);
    checkRPen();
  }

  const cancelBtn=ripple(h("button",[css({flex:1,padding:"10px 0",borderRadius:6,border:"1px solid #1e3a5f",background:"transparent",color:"#94a3b8",fontWeight:700,cursor:"pointer",fontSize:15,fontFamily:"'Barlow',sans-serif",transition:"background 150ms,color 150ms"}),on("click",()=>set({modal:null}))],["Cancel"]));
  cancelBtn.onmouseenter=()=>{cancelBtn.style.background="rgba(30,58,95,0.3)";cancelBtn.style.color="#e2e8f0";};
  cancelBtn.onmouseleave=()=>{cancelBtn.style.background="transparent";cancelBtn.style.color="#94a3b8";};
  const saveBtn=ripple(h("button",[css({flex:1,padding:"10px 0",borderRadius:6,border:"none",background:"linear-gradient(135deg,#f59e0b,#b45309)",color:"#fff",fontWeight:900,cursor:"pointer",fontSize:15,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,textTransform:"uppercase",boxShadow:"0 4px 14px rgba(217,119,6,0.4)"}),on("click",()=>{
    if(isGroup){ enterResult(fixture,{homeGoals:hg,awayGoals:ag}); }
    else {
      const res={homeGoals:hg,awayGoals:ag};
      if(hg===ag){ res.homePenGoals=homePen; res.awayPenGoals=awayPen; }
      enterResult(fixture,res);
    }
  })],["Confirm ✓"]));
  box.appendChild(h("div",[css({display:"flex",gap:10,marginTop:20})],[cancelBtn,saveBtn]));
  overlay.appendChild(box);
  return overlay;
}

// ── Standings Table ───────────────────────────────────────────────────────────
function standingsTable(group,resultsOverride){
  const rows=standings(group,resultsOverride!==undefined?resultsOverride:S.results);
  return h("table",[css({width:"100%",fontSize:13,borderCollapse:"collapse"})],[
    h("thead",null,[h("tr",null,
      ["#","Team","P","W","D","L","GD","Pts"].map((c,i)=>
        h("th",[css({padding:"11px 8px",textAlign:i===1?"left":"center",color:"#64748b",textTransform:"uppercase",letterSpacing:1,fontSize:11,fontWeight:700})],[c])
      )
    )]),
    h("tbody",null,rows.map((team,i)=>{
      const color=i<2?"#4ade80":i===2?"#fbbf24":"#94a3b8";
      const data=[i+1,null,team.p,team.w,team.d,team.l,team.gd>0?`+${team.gd}`:team.gd,team.pts];
      return h("tr",[css({borderTop:"1px solid rgba(30,58,95,0.4)",color})],
        data.map((v,ci)=>{
          const tdCss=css({padding:"11px 8px",textAlign:ci===1?"left":"center",fontWeight:ci===7?900:400,color:ci===7?"#fff":color,lineHeight:1.3});
          if(ci===1) return h("td",[tdCss],[h("div",[css({display:"flex",alignItems:"center",gap:8})],[flagImg(team.name,16),h("span",null,[team.name])])]);
          return h("td",[tdCss],[String(v)]);
        })
      );
    }))
  ]);
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function leaderboard(){
  const scores=Object.entries(S.users).map(([uid,name])=>{
    const up=S.preds[uid]||{}; let pts=0;
    GF.forEach(f=>{ const pr=up[f.id],re=S.results[f.id]; if(pr&&re) pts+=calcPts(pr,re,f); });
    S.ko.forEach(f=>{ const pr=up[f.id],re=S.results[f.id]; if(pr&&re) pts+=calcPts(pr,re,f); });
    return {name,pts};
  }).sort((a,b)=>b.pts-a.pts);
  if(!scores.length) return h("p",[css({textAlign:"center",color:"#64748b",padding:"40px 0"})],["No players yet. Share the link to invite friends!"]);
  return h("div",[cls("lb-grid")],scores.map(({name,pts},i)=>{
    const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":String(i+1);
    const lbShadow=i===0?"0 4px 18px rgba(245,158,11,0.35),0 2px 6px rgba(0,0,0,0.45)":i===1?"0 3px 12px rgba(148,163,184,0.2),0 1px 4px rgba(0,0,0,0.4)":i===2?"0 3px 12px rgba(184,115,51,0.2),0 1px 4px rgba(0,0,0,0.4)":"0 2px 6px rgba(0,0,0,0.4)";
    return h("div",[css({display:"flex",alignItems:"center",gap:20,padding:"16px 20px",borderRadius:8,border:`1px solid ${i===0?"#f59e0b":i===1?"#94a3b8":i===2?"#b87333":"#1e3a5f"}`,background:i===0?"rgba(245,158,11,0.12)":i===1?"rgba(148,163,184,0.06)":i===2?"rgba(184,115,51,0.08)":"rgba(10,22,40,0.5)",marginBottom:8,boxShadow:lbShadow})],[
      h("span",[css({fontSize:26,width:36,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900})],[medal]),
      h("span",[css({flex:1,fontWeight:700,fontSize:20,color:"#f1f5f9",fontFamily:"'Barlow Condensed',sans-serif",textTransform:"uppercase",letterSpacing:1})],[name]),
      h("span",[css({fontSize:32,fontWeight:900,color:"#4ade80",fontFamily:"'Barlow Condensed',sans-serif"})],[String(pts)]),
      h("span",[css({fontSize:12,color:"#64748b",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,textTransform:"uppercase"})],["pts"])
    ]);
  }));
}

// ── Results Admin Page ────────────────────────────────────────────────────────
function resultsPage(){
  const wrap=h("div",null,[]);

  wrap.appendChild(h("div",[css({display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12})],[
    h("div",null,[
      h("h2",[css({margin:"0 0 4px",fontSize:22,fontWeight:900})],["Enter Results"]),
      h("p",[css({margin:0,fontSize:12,color:"#64748b"})],["Exact=5pts · Correct winner+GD=4pts · Correct winner=3pts · Draw miss=1pt · Updates live"])
    ]),
    h("span",[css({fontSize:11,background:"#78350f",color:"#fde68a",padding:"4px 10px",borderRadius:99,fontWeight:700,display:"inline-flex",alignItems:"center",gap:5,lineHeight:1})],[svgIcon(ICONS.lock,12),"ADMIN"])
  ]));

  function mkRow(f){
    const ex=S.results[f.id]; const saved=!!ex;
    const rowEl=h("div",[css({
      display:"flex",alignItems:"center",gap:12,padding:"14px 18px",
      borderRadius:8,marginBottom:10,flexWrap:"wrap",
      background:saved?"rgba(22,163,74,0.08)":"rgba(10,22,40,0.5)",
      border:`1px solid ${saved?"#16a34a":"rgba(30,58,95,0.3)"}`,
      boxShadow:saved?"0 2px 8px rgba(22,163,74,0.15)":"0 1px 4px rgba(0,0,0,0.3)"
    })],[
      h("span",[css({fontSize:10,color:"#475569",fontFamily:"monospace",width:104,flexShrink:0})],[fmtDate(f.date)])
    ]);

    if(f.stage==="group"){
      let hv=ex!=null?ex.homeGoals:0;
      let av=ex!=null?ex.awayGoals:0;
      const hI=mkStepper(null,hv,"#fbbf24",v=>hv=v,"sm");
      const aI=mkStepper(null,av,"#fbbf24",v=>av=v,"sm");
      const sb=ripple(h("button",[css({padding:"6px 12px",fontSize:11,fontWeight:700,letterSpacing:1,
        textTransform:"uppercase",borderRadius:6,border:"1px solid #d97706",
        background:"transparent",color:"#fbbf24",cursor:"pointer",transition:"all .15s",flexShrink:0,fontFamily:"'Barlow Condensed',sans-serif"}),
        on("click",()=>enterResult(f,{homeGoals:hv,awayGoals:av}))],[saved?"Update":"Save"]));
      sb.onmouseenter=()=>{sb.style.background="linear-gradient(135deg,#f59e0b,#b45309)";sb.style.color="#fff";sb.style.borderColor="transparent";sb.style.boxShadow="0 3px 10px rgba(217,119,6,0.35)";};
      sb.onmouseleave=()=>{sb.style.background="transparent";sb.style.color="#fbbf24";sb.style.borderColor="#d97706";sb.style.boxShadow="";};

      rowEl.appendChild(h("div",[css({flex:1,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:10})],[
        h("span",[css({fontSize:13,fontWeight:700,textAlign:"right",lineHeight:1.3})],[`${flag(f.home)} ${f.home}`]),hI
      ]));
      rowEl.appendChild(h("span",[css({color:"#475569",fontWeight:900,flexShrink:0,padding:"0 4px"})],["–"]));
      rowEl.appendChild(h("div",[css({flex:1,display:"flex",alignItems:"center",gap:10})],[
        aI,h("span",[css({fontSize:13,fontWeight:700,lineHeight:1.3})],[`${flag(f.away)} ${f.away}`])
      ]));
      rowEl.appendChild(sb);
    } else {
      // KO: score inputs inline + penalty section when draw
      let koHg=ex!=null?ex.homeGoals:0;
      let koAg=ex!=null?ex.awayGoals:0;
      let koHomePen=ex?.homePenGoals??0, koAwayPen=ex?.awayPenGoals??0;
      rowEl.appendChild(h("span",[css({fontSize:11,color:"#94a3b8",fontWeight:700,minWidth:42,flexShrink:0})],[f.label||""]));
      const penRow=h("div",[css({display:"flex",gap:6,alignItems:"center",flexShrink:0,flexWrap:"nowrap"})],[]);
      const checkKOPen=()=>{
        penRow.innerHTML="";
        if(koHg!==koAg) return;
        penRow.appendChild(h("span",[css({fontSize:10,color:"#64748b",marginRight:2,flexShrink:0})],["Pen:"]));
        penRow.appendChild(mkStepper(null,koHomePen,"#fbbf24",v=>koHomePen=v,"sm"));
        penRow.appendChild(h("span",[css({color:"#475569",fontWeight:900,fontSize:14,flexShrink:0})],["-"]));
        penRow.appendChild(mkStepper(null,koAwayPen,"#fbbf24",v=>koAwayPen=v,"sm"));
      };
      const hI=mkStepper(null,koHg,"#fbbf24",v=>{koHg=v;checkKOPen();},"sm");
      const aI=mkStepper(null,koAg,"#fbbf24",v=>{koAg=v;checkKOPen();},"sm");
      rowEl.appendChild(h("div",[css({flex:1,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8})],[
        h("span",[css({fontSize:12,fontWeight:700,lineHeight:1.3})],[`${flag(f.home)} ${f.home}`]),hI
      ]));
      rowEl.appendChild(h("span",[css({color:"#475569",fontWeight:900,flexShrink:0,padding:"0 4px"})],["–"]));
      rowEl.appendChild(h("div",[css({flex:1,display:"flex",alignItems:"center",gap:8})],[
        aI,h("span",[css({fontSize:12,fontWeight:700,lineHeight:1.3})],[`${flag(f.away)} ${f.away}`])
      ]));
      rowEl.appendChild(penRow);
      checkKOPen();
      const sb=ripple(h("button",[css({padding:"6px 10px",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",
        borderRadius:6,border:"1px solid #d97706",background:"transparent",color:"#fbbf24",cursor:"pointer",flexShrink:0,fontFamily:"'Barlow Condensed',sans-serif",transition:"all .15s"}),
        on("click",()=>{
          const res={homeGoals:koHg,awayGoals:koAg};
          if(koHg===koAg){ res.homePenGoals=koHomePen; res.awayPenGoals=koAwayPen; }
          enterResult(f,res);
        })],[saved?"Update":"Save"]));
      sb.onmouseenter=()=>{sb.style.background="linear-gradient(135deg,#f59e0b,#b45309)";sb.style.color="#fff";sb.style.borderColor="transparent";sb.style.boxShadow="0 3px 10px rgba(217,119,6,0.35)";};
      sb.onmouseleave=()=>{sb.style.background="transparent";sb.style.color="#fbbf24";sb.style.borderColor="#d97706";sb.style.boxShadow="";};
      rowEl.appendChild(sb);
    }
    return rowEl;
  }

  // Group stage
  wrap.appendChild(h("p",[css({fontSize:12,fontWeight:700,color:"#64748b",letterSpacing:2,textTransform:"uppercase",marginBottom:16,lineHeight:1.5})],["Group Stage"]));
  Object.keys(GROUPS).forEach(g=>{
    wrap.appendChild(h("div",[css({fontSize:14,fontWeight:800,color:"#4ade80",letterSpacing:4,textTransform:"uppercase",marginBottom:10,marginTop:24,fontFamily:"'Barlow Condensed',sans-serif"})],[`Group ${g}`]));
    GF.filter(f=>f.group===g).forEach(f=>wrap.appendChild(mkRow(f)));
  });

  // KO stage
  if(S.ko.length){
    wrap.appendChild(h("p",[css({fontSize:12,fontWeight:700,color:"#64748b",letterSpacing:2,textTransform:"uppercase",margin:"28px 0 16px",lineHeight:1.5})],["Knockout Stage"]));
    S.ko.forEach(f=>wrap.appendChild(mkRow(f)));
  }

  return wrap;
}

// ── Users Admin Page ─────────────────────────────────────────────────────────
function usersPage(){
  const wrap=h("div",null,[]);
  wrap.appendChild(h("div",[css({display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12})],[
    h("h2",[css({margin:0,fontSize:22,fontWeight:900})],["Manage Users"]),
    h("span",[css({fontSize:11,background:"#78350f",color:"#fde68a",padding:"4px 10px",borderRadius:99,fontWeight:700,display:"inline-flex",alignItems:"center",gap:5,lineHeight:1})],[svgIcon(ICONS.lock,12),"ADMIN"])
  ]));

  // Temp pw display (one-time)
  if(S.tempPwDisplay){
    const {uid:tuid,pw}=S.tempPwDisplay;
    const name=S.users[tuid]||tuid;
    wrap.appendChild(h("div",[css({background:"rgba(5,150,105,0.12)",border:"1px solid #16a34a",borderRadius:12,padding:"14px 16px",marginBottom:20})],[
      h("div",[css({fontSize:12,color:"#4ade80",fontWeight:700,marginBottom:6})],[`Temporary password for ${name}:`]),
      h("div",[css({fontSize:24,fontWeight:900,fontFamily:"monospace",color:"#fff",letterSpacing:4,marginBottom:10})],[pw]),
      h("p",[css({fontSize:11,color:"#94a3b8",margin:"0 0 10px"})],["Share this with the user. It will not be shown again."]),
      h("button",[css({padding:"6px 14px",fontSize:12,fontWeight:700,borderRadius:8,border:"1px solid #1e3a5f",background:"transparent",color:"#94a3b8",cursor:"pointer"}),on("click",()=>set({tempPwDisplay:null}))],["Dismiss"])
    ]));
  }

  Object.entries(S.users).forEach(([uid,name])=>{
    const row=h("div",[css({display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderRadius:8,border:"1px solid #1e3a5f",background:"rgba(10,22,40,0.5)",marginBottom:10,flexWrap:"wrap",boxShadow:"0 2px 6px rgba(0,0,0,0.4)"})],[
      h("span",[css({flex:1,fontWeight:700,fontSize:14,color:"#f1f5f9"})],[name]),
      h("span",[css({fontSize:11,color:"#475569",fontFamily:"monospace"})],[uid])
    ]);
    const btn=ripple(h("button",[css({padding:"6px 14px",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",borderRadius:6,border:"1px solid #d97706",background:"transparent",color:"#fbbf24",cursor:"pointer",flexShrink:0,transition:"all .15s",fontFamily:"'Barlow Condensed',sans-serif"}),
      on("click",async()=>{
        btn.disabled=true; btn.textContent="Generating...";
        await generateTempForUser(uid);
        btn.disabled=false; btn.textContent="Gen Temp PW";
      })],["Gen Temp PW"]));
    btn.onmouseenter=()=>{btn.style.background="linear-gradient(135deg,#f59e0b,#b45309)";btn.style.color="#fff";btn.style.borderColor="transparent";btn.style.boxShadow="0 3px 10px rgba(217,119,6,0.35)";};
    btn.onmouseleave=()=>{btn.style.background="transparent";btn.style.color="#fbbf24";btn.style.borderColor="#d97706";btn.style.boxShadow="";};
    row.appendChild(btn);
    wrap.appendChild(row);
  });
  if(!Object.keys(S.users).length)
    wrap.appendChild(h("p",[css({textAlign:"center",color:"#64748b",padding:"40px 0"})],["No users yet."]));
  return wrap;
}

// ── Rules Modal ───────────────────────────────────────────────────────────────
function rulesModal(){
  const overlay=h("div",[cls("modal-overlay"),css({position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"24px"}),on("click",e=>{if(e.target===overlay)set({modal:null});})],[]);
  const box=h("div",[cls("modal-box"),css({background:"#080f1e",border:"1px solid #1e3a5f",borderTop:"3px solid #16a34a",borderRadius:12,padding:28,width:"min(580px, calc(100vw - 48px))",maxHeight:"88vh",overflowY:"auto",flexShrink:0})],[]);

  box.appendChild(h("div",[css({display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6})],[
    h("h3",[css({margin:0,fontSize:20,fontWeight:900,color:"#fff",letterSpacing:2,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",display:"flex",alignItems:"center",gap:8})],[svgIcon(ICONS.list,18),"Scoring Rules"]),
    h("button",[css({background:"none",border:"none",color:"#64748b",fontSize:20,cursor:"pointer",padding:"0 4px",lineHeight:1}),on("click",()=>set({modal:null}))],["✕"])
  ]));
  box.appendChild(h("p",[css({margin:"0 0 24px",fontSize:12,color:"#64748b",lineHeight:1.6})],["Points awarded automatically after admin enters official results. Predictions lock 1 hour before kickoff."]));

  const ptColor=pts=>({5:"#4ade80",4:"#4ade80","4+1":"#4ade80",3:"#fbbf24","3+1":"#fbbf24",1:"#94a3b8",0:"#f87171"})[pts]||"#94a3b8";

  function section(title,rows){
    const sec=h("div",[css({marginBottom:28})],[
      h("div",[css({fontSize:12,fontWeight:800,color:"#4ade80",letterSpacing:3,textTransform:"uppercase",marginBottom:12,fontFamily:"'Barlow Condensed',sans-serif",paddingBottom:6,borderBottom:"1px solid #1e3a5f"})],[title])
    ]);
    rows.forEach(([outcome,pts,example],i)=>{
      sec.appendChild(h("div",[css({display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,padding:"9px 0",borderBottom:"1px solid rgba(30,58,95,0.25)",background:"transparent"})],[
        h("div",[css({flex:1})],[
          h("div",[css({fontSize:13,color:"#e2e8f0",lineHeight:1.5})],[outcome]),
          h("div",[css({fontSize:11,color:"#475569",marginTop:2,fontFamily:"monospace"})],[example])
        ]),
        h("div",[css({fontSize:18,fontWeight:900,color:ptColor(pts),fontFamily:"'Barlow Condensed',sans-serif",whiteSpace:"nowrap",flexShrink:0,minWidth:48,textAlign:"right"})],[String(pts)+" pts"])
      ]));
    });
    return sec;
  }

  box.appendChild(section("Group Stage",[
    ["Exact score","5","e.g. predict 3–1, result 3–1"],
    ["Correct winner + same goal diff","4","e.g. predict 5–2 (GD+3), result 3–0 (GD+3)"],
    ["Correct winner + different goal diff","3","e.g. predict 5–2, result 4–1"],
    ["Predict draw, result draw, exact score","5","e.g. predict 1–1, result 1–1"],
    ["Predict draw, result draw, different score","3","e.g. predict 1–1, result 0–0"],
    ["Predict winner or loser, result is draw","1","e.g. predict 2–1, result 1–1"],
    ["Predict draw, result is decisive","0","e.g. predict 1–1, result 2–1"],
    ["Wrong winner","0","e.g. predict 1–2, result 3–0"],
  ]));

  box.appendChild(section("Knockout Stage",[
    ["Exact score (90 min)","5","e.g. predict 3–1, result 3–1"],
    ["Correct winner + same goal diff","4","e.g. predict 5–2 (GD+3), result 3–0 (GD+3)"],
    ["Correct winner + different goal diff","3","e.g. predict 5–2, result 4–1"],
    ["Predict draw (exact score) + correct pen winner","4+1","e.g. predict 1–1 pen 4–5, result 1–1 pen 4–5"],
    ["Predict draw (diff score) + correct pen winner","3+1","e.g. predict 1–1 pen 4–5, result 0–0 pen 4–5"],
    ["Predict draw, wrong pen winner","4","e.g. predict 1–1 pen 5–4, result 1–1 pen 4–5"],
    ["Predict winner via pen (draw at 90')","4","e.g. predict 1–2, result 1–1 pen 4–5 (away wins)"],
    ["Predict winner or loser, result is draw","1","e.g. predict 2–1, result 1–1"],
    ["Predict draw, result is decisive","0","e.g. predict 1–1, result 2–1"],
    ["Wrong winner","0","e.g. predict 1–2, result 3–0"],
  ]));

  const closeBtn=ripple(h("button",[css({width:"100%",padding:"10px 0",borderRadius:6,border:"1px solid #1e3a5f",background:"transparent",color:"#94a3b8",fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"'Barlow',sans-serif",transition:"background 150ms,color 150ms"}),on("click",()=>set({modal:null}))],["Close"]));
  closeBtn.onmouseenter=()=>{closeBtn.style.background="rgba(30,58,95,0.3)";closeBtn.style.color="#e2e8f0";};
  closeBtn.onmouseleave=()=>{closeBtn.style.background="transparent";closeBtn.style.color="#94a3b8";};
  box.appendChild(closeBtn);
  overlay.appendChild(box);
  return overlay;
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function draw(){
  const root=document.getElementById("root");
  root.innerHTML="";

  if(S.loading){
    root.appendChild(h("div",[css({display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",flexDirection:"column",gap:16})],[
      h("span",[cls("spin"),css({fontSize:48})],["⚽"]),
      h("span",[css({fontSize:22,fontWeight:800,color:"#4ade80",letterSpacing:5,fontFamily:"'Barlow Condensed',sans-serif"})],["LOADING..."])
    ]));
    return;
  }

  // Header
  const hdrRight=[];
  if(S.saving) hdrRight.push(h("span",[cls("toast-msg"),css({fontSize:12,color:"#fbbf24",fontFamily:"monospace"})],["⏳ Saving..."]));
  if(S.msg) hdrRight.push(h("span",[cls("toast-msg"),css({fontSize:12,color:"#4ade80",fontFamily:"monospace"})],[S.msg]));
  if(S.uid){
    if(S.isAdmin) hdrRight.push(h("span",[css({fontSize:11,background:"#78350f",color:"#fde68a",padding:"4px 8px",borderRadius:99,fontWeight:700,display:"inline-flex",alignItems:"center",gap:5,lineHeight:1})],[svgIcon(ICONS.lock,11),"ADMIN"]));
    hdrRight.push(h("span",[css({fontSize:13,color:"#94a3b8"})],[S.users[S.uid]||S.uid]));
    const lb=h("button",[css({fontSize:12,color:"#64748b",background:"none",border:"none",cursor:"pointer"}),on("click",()=>{clearSession();set({uid:null,isAdmin:false,loginError:""});})],["Logout"]);
    hdrRight.push(lb);
  }

  root.appendChild(h("header",[css({background:"linear-gradient(135deg,#020c1b 0%,#041a0f 50%,#020c1b 100%)",borderBottom:"2px solid #16a34a",padding:"12px 16px",position:"sticky",top:0,zIndex:40})],[
    h("div",[cls("app-inner")],[
      h("div",[css({display:"flex",alignItems:"center",gap:14})],[
        h("img",[["src","wc2026-logo.png"],["alt","FIFA WC 2026"],css({height:"44px",width:"auto",flexShrink:0})],[]),
        h("div",[css({display:"flex",flexDirection:"column",gap:4})],[
          h("div",[css({fontSize:20,fontWeight:900,lineHeight:1,color:"#fff",letterSpacing:3,fontFamily:"'Barlow Condensed',sans-serif",textTransform:"uppercase"})],["Prediction League"]),
          h("div",[css({fontSize:11,color:"#4ade80",letterSpacing:4,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1})],["FIFA World Cup 2026"])
        ])
      ]),
      h("div",[css({display:"flex",alignItems:"center",gap:14})],hdrRight)
    ])
  ]));

  // Login
  if(!S.uid){
    const ni=sportInput(h("input",[["type","text"],["placeholder","Username"],["value",S.nameVal],css({width:"100%",background:"#0f1f3d",border:"1.5px solid #1e3a5f",borderRadius:6,padding:"12px 16px",color:"#fff",fontSize:15,marginBottom:10,boxSizing:"border-box",transition:"border-color 180ms,box-shadow 180ms"}),on("input",e=>S.nameVal=e.target.value),on("keydown",e=>e.key==="Enter"&&login())],[]));
    const pi=sportInput(h("input",[["type","password"],["placeholder","Password"],["value",S.pwVal],css({width:"100%",background:"#0f1f3d",border:"1.5px solid #1e3a5f",borderRadius:6,padding:"12px 16px",color:"#fff",fontSize:15,marginBottom:16,boxSizing:"border-box",transition:"border-color 180ms,box-shadow 180ms"}),on("input",e=>S.pwVal=e.target.value),on("keydown",e=>e.key==="Enter"&&login())],[]));
    const errMsg=S.loginError?h("div",[css({fontSize:12,color:"#f87171",marginBottom:12,textAlign:"center"})],[S.loginError]):null;
    const gb=ripple(h("button",[css({width:"100%",padding:"15px 0",background:"linear-gradient(135deg,#18b352,#14803d)",border:"none",borderRadius:6,color:"#fff",fontSize:20,fontWeight:900,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",boxShadow:"0 5px 18px rgba(22,163,74,0.45)"}),on("click",login)],["Let's Go ⚽"]));
    const content=[
      h("div",null,[
        h("img",[["src","wc2026-logo.png"],["alt","FIFA World Cup 2026"],css({height:"100px",width:"auto",marginBottom:12})],[]),
        h("h2",[css({margin:"0 0 6px",fontSize:32,fontWeight:900})],["Join the League"]),
        h("p",[css({margin:"0 0 24px",fontSize:13,color:"#64748b",fontFamily:"'Barlow',sans-serif",letterSpacing:0.5})],["New here? Pick a username and password — your account is created automatically."])
      ]),
      ni,pi
    ];
    if(errMsg) content.push(errMsg);
    content.push(gb);
    root.appendChild(h("div",[css({minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"})],[
      h("div",[cls("login-card"),css({background:"#080f1e",border:"1px solid #1e3a5f",borderTop:"3px solid #16a34a",borderRadius:12,padding:32,textAlign:"center",width:"min(420px, calc(100vw - 48px))",boxShadow:"0 8px 32px rgba(0,0,0,0.7),0 0 0 1px rgba(22,163,74,0.1)"})],content)
    ]));
    return;
  }

  // Force password change
  if(S.mustChangePassword){
    const np=sportInput(h("input",[["type","password"],["placeholder","New password (min 6 chars)"],["value",S.newPwVal],css({width:"100%",background:"#0f1f3d",border:"1.5px solid #1e3a5f",borderRadius:6,padding:"12px 16px",color:"#fff",fontSize:15,marginBottom:10,boxSizing:"border-box",transition:"border-color 180ms,box-shadow 180ms"}),on("input",e=>S.newPwVal=e.target.value),on("keydown",e=>e.key==="Enter"&&changePassword())],[]));
    const cp=sportInput(h("input",[["type","password"],["placeholder","Confirm new password"],["value",S.confirmPwVal],css({width:"100%",background:"#0f1f3d",border:"1.5px solid #1e3a5f",borderRadius:6,padding:"12px 16px",color:"#fff",fontSize:15,marginBottom:16,boxSizing:"border-box",transition:"border-color 180ms,box-shadow 180ms"}),on("input",e=>S.confirmPwVal=e.target.value),on("keydown",e=>e.key==="Enter"&&changePassword())],[]));
    const errEl=S.changeError?h("div",[css({fontSize:12,color:"#f87171",marginBottom:12,textAlign:"center"})],[S.changeError]):null;
    const sb=ripple(h("button",[css({width:"100%",padding:"14px 0",background:"linear-gradient(135deg,#18b352,#14803d)",border:"none",borderRadius:6,color:"#fff",fontSize:18,fontWeight:900,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",boxShadow:"0 5px 18px rgba(22,163,74,0.45)"}),on("click",changePassword)],[S.saving?"Saving...":"Set Password ✓"]));
    const content=[
      h("div",null,[
        h("h2",[css({margin:"0 0 6px",fontSize:22,fontWeight:900})],["Set New Password"]),
        h("p",[css({margin:"0 0 20px",fontSize:13,color:"#64748b"})],["You logged in with a temporary password. Set a permanent one to continue."])
      ]),
      np,cp
    ];
    if(errEl) content.push(errEl);
    content.push(sb);
    content.push(h("button",[css({marginTop:10,width:"100%",padding:"8px 0",background:"none",border:"none",color:"#64748b",fontSize:13,cursor:"pointer"}),on("click",()=>set({uid:null,mustChangePassword:false,newPwVal:"",confirmPwVal:"",changeError:""}))],["← Back to login"]));
    root.appendChild(h("div",[css({minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"})],[
      h("div",[cls("login-card"),css({background:"#080f1e",border:"1px solid #1e3a5f",borderTop:"3px solid #16a34a",borderRadius:12,padding:32,textAlign:"center",width:"min(420px, calc(100vw - 48px))",boxShadow:"0 8px 32px rgba(0,0,0,0.7),0 0 0 1px rgba(22,163,74,0.1)"})],content)
    ]));
    return;
  }

  // Nav
  root.appendChild(h("nav",[css({background:"#020c14",borderBottom:"2px solid #0f1f3d",padding:"0 16px",position:"sticky",top:68,zIndex:30,overflowX:"auto"})],[
    h("div",[cls("nav-inner")],[
      tabBtn("Fixtures","fixtures"),tabBtn("Groups","groups"),tabBtn("Knockout","knockout"),tabBtn("Leaderboard","leaderboard"),...(S.isAdmin?[tabBtn("Results","results"),tabBtn("Users","users")]:[])
    ])
  ]));

  const main=h("main",[cls("main-wrap")],[]);

  if(S.tab==="fixtures"){
    main.appendChild(h("div",[css({display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28})],[
      h("h2",[css({margin:0,fontSize:22,fontWeight:900})],["Group Stage Fixtures"]),
      h("span",[css({fontSize:11,color:"#64748b",marginLeft:12})],["🔒 Closes 1hr before kickoff"])
    ]));
    const pills=h("div",[cls("pills-row"),css({marginBottom:24})],[
      pill("All",S.grpTab==="ALL",()=>set({grpTab:"ALL"})),
      ...Object.keys(GROUPS).map(g=>pill(`Grp ${g}`,S.grpTab===g,()=>set({grpTab:g})))
    ]);
    main.appendChild(pills);
    const cols=h("div",[cls("fixtures-cols")],[]);
    const matchList=h("div",null,[]);
    const filteredGF=GF.filter(f=>S.grpTab==="ALL"||f.group===S.grpTab);
    if(S.grpTab==="ALL") filteredGF.sort((a,b)=>a.matchNum-b.matchNum);
    filteredGF.forEach(f=>matchList.appendChild(matchCard(f)));
    cols.appendChild(matchList);
    const sideGrp=S.grpTab==="ALL"?"A":S.grpTab;
    const userPreds=S.uid?(S.preds[S.uid]||{}):S.results;
    const hasActual=Object.keys(S.results).some(id=>parseInt(id)<=72);
    const sideResults=hasActual?S.results:userPreds;
    const sideLabel=hasActual?"Standings":"Predicted Standings";
    const sideNote=hasActual?"Based on actual results":"Based on your predictions";
    const sidebar=h("div",[cls("desktop-sidebar")],[
      h("div",[css({background:"#080f1e",border:"1px solid #0f1f3d",borderRadius:8,padding:20,marginBottom:20,boxShadow:"0 4px 12px rgba(0,0,0,0.5),0 1px 4px rgba(0,0,0,0.35)"})],[
        h("h3",[css({margin:"0 0 4px",fontSize:16,fontWeight:900})],[`Group ${sideGrp}`]),
        h("p",[css({fontSize:11,color:"#64748b",marginBottom:16,letterSpacing:1,textTransform:"uppercase",lineHeight:1.5})],[sideNote]),
        standingsTable(sideGrp,sideResults)
      ]),
      h("div",[css({display:"flex",gap:12,fontSize:11,color:"#64748b"})],[
        h("span",null,[h("span",[css({display:"inline-block",width:7,height:7,background:"#16a34a",borderRadius:"50%",marginRight:4})]),  "1st/2nd qualify"]),
        h("span",null,[h("span",[css({display:"inline-block",width:7,height:7,background:"#d97706",borderRadius:"50%",marginRight:4})]),  "Best 3rd"])
      ])
    ]);
    cols.appendChild(sidebar);
    main.appendChild(cols);
  }

  if(S.tab==="groups"){
    const hasActualGrp=Object.keys(S.results).some(id=>parseInt(id)<=72);
    const grpResults=hasActualGrp?S.results:(S.uid?(S.preds[S.uid]||{}):S.results);
    const grpNote=hasActualGrp?"Based on actual results":"Based on your predictions";
    main.appendChild(h("div",[css({display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28})],[
      h("h2",[css({margin:0,fontSize:22,fontWeight:900})],["Group Standings"]),
      h("div",[css({display:"flex",gap:14,fontSize:11,color:"#64748b",alignItems:"center"})],[
        h("span",[css({color:"#475569",fontStyle:"italic"})],[grpNote]),
        h("span",null,[h("span",[css({display:"inline-block",width:7,height:7,background:"#16a34a",borderRadius:"50%",marginRight:4})]),  "Qualify"]),
        h("span",null,[h("span",[css({display:"inline-block",width:7,height:7,background:"#d97706",borderRadius:"50%",marginRight:4})]),  "Best 3rd"])
      ])
    ]));
    const grid=h("div",[cls("groups-grid")],[]);
    Object.keys(GROUPS).forEach(g=>{
      grid.appendChild(h("div",[css({background:"#080f1e",border:"1px solid #0f1f3d",borderRadius:8,padding:20,boxShadow:"0 4px 12px rgba(0,0,0,0.5),0 1px 4px rgba(0,0,0,0.35)"})],[
        h("h3",[css({margin:"0 0 16px",fontSize:16,fontWeight:900})],[`Group ${g}`]),
        standingsTable(g,grpResults)
      ]));
    });
    main.appendChild(grid);
  }

  if(S.tab==="knockout"){
    main.appendChild(h("div",[css({display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28})],[
      h("h2",[css({margin:0,fontSize:22,fontWeight:900})],["Knockout Stage"]),
      h("span",[css({fontSize:11,color:"#64748b"})],["Auto-generated · Live"])
    ]));
    const KO_ROUNDS=[
      {stage:"r32",label:"Round of 32"},
      {stage:"r16",label:"Round of 16"},
      {stage:"qf",label:"Quarter Finals"},
      {stage:"sf",label:"Semi Finals"},
      {stage:"final",label:"Final"},
    ];
    KO_ROUNDS.forEach(({stage,label})=>{
      const matches=S.ko.filter(f=>f.stage===stage);
      if(!matches.length) return;
      main.appendChild(h("div",[css({fontSize:15,fontWeight:800,color:"#4ade80",letterSpacing:4,textTransform:"uppercase",margin:"28px 0 16px",fontFamily:"'Barlow Condensed',sans-serif"})],[label]));
      const grid=h("div",[cls(stage==="final"?"":"ko-grid")],[]);
      matches.forEach(f=>grid.appendChild(matchCard(f)));
      main.appendChild(grid);
    });
  }

  if(S.tab==="leaderboard"){
    const rulesBtn=ripple(h("button",[css({padding:"7px 16px",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",borderRadius:6,border:"1px solid #16a34a",background:"transparent",color:"#4ade80",cursor:"pointer",transition:"all .15s",fontFamily:"'Barlow Condensed',sans-serif",flexShrink:0,display:"inline-flex",alignItems:"center",gap:6}),on("click",()=>set({modal:{type:"rules"}}))],[svgIcon(ICONS.list,12),"Scoring Rules"]));
    rulesBtn.onmouseenter=()=>{rulesBtn.style.background="rgba(22,163,74,0.12)";rulesBtn.style.boxShadow="0 0 0 1px rgba(74,222,128,0.3)";};
    rulesBtn.onmouseleave=()=>{rulesBtn.style.background="transparent";rulesBtn.style.boxShadow="";};
    main.appendChild(h("div",[css({display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28})],[
      h("h2",[css({margin:0,fontSize:22,fontWeight:900})],["🏆 Leaderboard"]),
      rulesBtn
    ]));
    main.appendChild(leaderboard());
  }

  if(S.tab==="results"&&S.isAdmin){
    main.appendChild(resultsPage());
  }

  if(S.tab==="users"&&S.isAdmin){
    main.appendChild(usersPage());
  }

  root.appendChild(main);

  // Modals
  if(S.modal?.type==="predict") root.appendChild(predictModal(S.modal.fixture));
  if(S.modal?.type==="result")  root.appendChild(resultModal(S.modal.fixture));
  if(S.modal?.type==="rules")   root.appendChild(rulesModal());
}

draw();
