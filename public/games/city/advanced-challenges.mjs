// Authored fictional simulations: 16 genuinely different tasks, not renamed relay puzzles.
// The same deterministic rules power the test button and saved-progress validation.
const mission=(id,district,title,brief,kind,guide,board)=>({id,district,title,brief,kind,guide,board});
export const ADVANCED_CHAPTERS=[
{number:5,title:"Repair and Upgrade",missions:[
mission("repair-triage","workshop","The repair backlog","Four repairs are waiting; the city has one team.","triage","Order work by public safety and essential need, not convenience.",{cards:["Exposed cable by homes","Community pump stopped","Classroom tablets","Faded street signs"],needed:[0,1],icons:["⚡","🚰","💻","🚧"]}),
mission("fault-investigation","power","Investigate before replacing","The learning centre loses power at dusk. New batteries are expensive.","investigate","Select useful checks without buying unneeded equipment.",{cards:["Read demand by hour","Buy batteries immediately","Test evening relay","Ask when lights fail","Ignore the complaint"],cost:[1,4,2,1,0],budget:4,needed:[0,2,3],bad:[1,4],icons:["📊","🔋","🔧","🕒","🙈"]})]},
{number:6,title:"A Growing City",missions:[
mission("site-planning","housing","Plan a new neighbourhood","Families need homes, a clinic and public space without building in a flood basin.","site","Choose three safe plots on the district grid.",{cards:["High ground","Flood channel","Raised clinic land","Market road","Central square","Flood basin","School approach","Open park","Industrial noise"],safe:[0,2,4,6,7],required:[0,2],count:3,icons:["🏘️","🌊","🏥","🚚","🟩","🌧️","🎓","🌳","🏭"]}),
mission("route-finding","transport","Find a safe route","A bridge and nearby streets are blocked. Get from workshop to clinic.","path","Tap adjacent streets to make a route around blocks; undo a wrong turn.",{size:4,blocked:[5,6,9],start:0,end:15,maxMoves:7})]},
{number:7,title:"Connected Crises",missions:[
mission("crisis-chain","health","Three hours before the storm","Power, shelter and the clinic depend on each other's decisions.","cascade","Respond across three hours. Your decisions change the city's resilience.",{prompts:["Before rain","During the outage","When the flooding settles"],choices:[["Wait until rain starts","Warn residents and protect critical equipment","Close the clinic"],["Protect clinic power and check safe routes","Repaint damaged signs","Use emergency fuel on decorative lighting"],["Check vulnerable neighbours and reopen safely","Announce all fixed without testing","Ignore flooded homes"]],effects:[[0,3,-4],[3,-2,-3],[3,-3,-4]],minScore:8}),
mission("supply-dependencies","market","Build the food supply chain","Farms need checked water; markets depend on food quality and safe transport.","chain","Arrange the five real dependencies into a working chain.",{cards:["Check farm water","Grow and harvest","Inspect food quality","Prepare safe transport","Deliver to market"],prerequisites:[[],[0],[1],[2],[3]],icons:["💧","🌾","🔬","🚚","🛍️"]})]},
{number:8,title:"Build for Everyone",missions:[
mission("accessible-city","school","Make the city accessible","The clinic and school exist, but unsafe crossings and missing access routes exclude residents.","access","Spend your access budget to connect the clinic, crossing and walkway.",{cards:["Clinic ramp","Advertising board","Accessible walkway","Decorative arch","Raised crossing","Extra road signs"],cost:[2,1,2,1,2,1],budget:7,needed:[0,2,4],icons:["♿","📣","🚶","🎀","🚸","🪧"]}),
mission("fair-access","business","Share support fairly","Four groups need practical support and a small reserve for emergencies.","equity","Distribute limited support tokens while protecting each group's essential minimum.",{cards:["Clinic access","Food-short families","Students without transport","Traders restarting"],minimum:[4,3,2,1],budget:12,reserve:1,icons:["🏥","🥬","🚌","🏪"]})]},
{number:9,title:"Use Less, Serve More",missions:[
mission("circular-repairs","environment","Rescue the repair market","Mixed waste includes repairable goods and dangerous materials.","sort","Sort every item into reuse, recycling or qualified collection.",{cards:["Repairable chair","Lithium phone battery","Clean bottles","Fluorescent lamp","Scrap metal","Usable schoolbooks"],answers:[1,3,2,3,2,1],categories:["Not sorted","Repair or reuse","Recycle safely","Qualified collection"],icons:["🪑","🔋","🧴","💡","🔩","📚"]}),
mission("energy-timetable","power","Share power across the day","Solar peaks in daytime; evening learning needs protected storage.","schedule","Schedule four loads without wasting evening capacity.",{cards:["Heavy workshop tools","Farm pumping","Evening learning","Cold-storage recharge"],options:["Not scheduled","Morning","Afternoon","Evening"],ideal:[1,2,3,2],icons:["🛠️","💦","📖","🧊"]})]},
{number:10,title:"Lead Through Pressure",missions:[
mission("stakeholder-agreement","council","Lead the town meeting","Workers need safety, residents need fair prices, nature needs protection.","negotiate","Build a council agreement within the limited negotiating budget.",{cards:["Worker safety","Public affordability","Environment"],minimum:[3,3,2],budget:10,icons:["🦺","🤝","🌿"]}),
mission("emergency-dispatch","health","Send the right responders","A medical emergency, a live cable and a damaged bridge all need different specialists.","dispatch","Assign each skilled team only once, to an appropriate emergency.",{cards:["Emergency at clinic","Downed live cable","Unsafe footbridge"],options:["Unassigned","Medical team","Electrician team","Civil works team"],ideal:[1,2,3],icons:["🚑","⚡","🌉"]})]},
{number:11,title:"Design for Reliability",missions:[
mission("failure-audit","industry","Audit a failing service","Reports show five possible faults, but some parts are healthy.","audit","Identify real fault sources from the inspection board.",{cards:["Loose spare-power connection","Healthy clean filter","Corroded terminal","Tested pressure valve","Overheated motor"],needed:[0,2,4],icons:["🔌","✅","⚙️","🧰","🔥"]}),
mission("independent-backup","water","Protect service from a single failure","Two pumps on one failing grid are not independent backup.","backup","Choose two truly independent protections within budget.",{cards:["Solar-backed pump","Pump on the same grid","Protected gravity storage","Second cable on same grid","Generator with separate fuel"],cost:[3,2,3,1,4],budget:7,independent:[0,2,4],icons:["☀️","🔌","🛢️","🪢","🧯"]})]},
{number:12,title:"The Final Challenge",missions:[
mission("investment-portfolio","council","Shape the city's next decade","Decide how limited investments protect health, housing, water and learning.","portfolio","Fund essential minimums, but keep money for an emergency.",{cards:["Health and safety","Homes and shelter","Public water access","Learning and skills"],minimum:[4,3,4,3],budget:18,reserve:2,icons:["🏥","🏘️","🚰","🎓"]}),
mission("city-showcase","transport","The city must stand on its own","New residents arrive during heavy rain and a market shortage. Can the systems hold together?","showcase","Lead four linked decisions and simulate the city's recovery.",{prompts:["New families arrive","Heavy rain blocks roads","Market supplies run short","Train the next builders"],choices:[["Ignore housing reports","Open safe temporary shelter","Build an ornamental gate"],["Map safe routes and deploy repairs","Use the flooded road","Shut down communication"],["Prioritise food and stock tracking","Hide the shortage","Serve only the biggest customer"],["Train local teams and publish plans","Depend on one leader","Stop checking systems"]],effects:[[0,3,-3],[3,-4,-3],[3,-4,-2],[3,-2,-3]],minScore:10})]}
];
export const ALL_ADVANCED_MISSIONS=ADVANCED_CHAPTERS.flatMap(ch=>ch.missions.map((m,i)=>({...m,chapter:ch.number,chapterTitle:ch.title,index:(ch.number-5)*2+i})));
export function missionAt(index){return ALL_ADVANCED_MISSIONS[index]??null;}
export function newPlan(m){
 if(!m)return [];
 if(["triage","chain","path"].includes(m.kind))return [];
 if(["cascade","showcase"].includes(m.kind))return Array(m.board.prompts.length).fill(-1);
 if(m.kind==="site")return Array(9).fill(0);
 return Array(m.board.cards.length).fill(0);
}
export function validPlanShape(m,p){
 if(!m||!Array.isArray(p)||p.length>24||!p.every(n=>Number.isInteger(n)&&n>=-1&&n<=30))return false;
 const k=m.kind;
 if(k==="triage"||k==="chain")return p.length<=m.board.cards.length&&new Set(p).size===p.length&&p.every(n=>n>=0&&n<m.board.cards.length);
 if(k==="path")return p.length<=16&&new Set(p).size===p.length&&p.every(n=>n>=0&&n<16);
 if(p.length!==newPlan(m).length)return false;
 if(["site","investigate","access","audit","backup"].includes(k))return p.every(n=>n===0||n===1);
 if(k==="sort"||k==="schedule"||k==="dispatch")return p.every(n=>n>=0&&n<=3);
 if(k==="cascade"||k==="showcase")return p.every(n=>n>=-1&&n<=2);
 return p.every(n=>n>=0&&n<=18);
}
const outcome=(ok,message,score)=>({ok,message,score:Math.max(0,Math.min(100,Math.round(score)))});
export function testChallenge(m,p){
 if(!validPlanShape(m,p))return outcome(false,"Reset this board and make a valid plan.",0);
 const b=m.board,k=m.kind;
 if(k==="triage"){const ok=p.length===4&&b.needed.every(i=>p.indexOf(i)<2);return outcome(ok,ok?"Safety and essential services come first. Your team can begin safely.":"Arrange all four jobs; the exposed cable and community pump are critical.",ok?95:p.length*10);}
 if(k==="investigate"){const sel=p.map((v,i)=>v?i:-1).filter(i=>i>=0),cost=sel.reduce((s,i)=>s+b.cost[i],0),ok=b.needed.every(i=>sel.includes(i))&&!b.bad.some(i=>sel.includes(i))&&cost<=b.budget;return outcome(ok,ok?"You found evidence before spending on equipment.":"Check demand timing, test the relay and speak to people. Avoid guesses and unnecessary purchases. Checks cost "+cost+"/"+b.budget+".",ok?95:25);}
 if(k==="site"){const sel=p.map((v,i)=>v?i:-1).filter(i=>i>=0),ok=sel.length===b.count&&sel.every(i=>b.safe.includes(i))&&b.required.every(i=>sel.includes(i));return outcome(ok,ok?"Homes, healthcare and open space now have safe sites.":"Select exactly three safe plots. Protect high-ground housing and raised clinic land; avoid flood sites.",ok?95:sel.length*14);}
 if(k==="path"){const n=b.size,adjacent=p.every((cell,i)=>i===0||Math.abs(Math.floor(cell/n)-Math.floor(p[i-1]/n))+Math.abs(cell%n-p[i-1]%n)===1),blocked=p.some(i=>b.blocked.includes(i)),ok=p[0]===b.start&&p.at(-1)===b.end&&adjacent&&!blocked&&p.length-1<=b.maxMoves;return outcome(ok,ok?"A safe street route reaches the clinic in "+(p.length-1)+" moves.":!p.length?"Start from the workshop.":blocked?"Blocked streets cannot be used.":!adjacent?"Move one adjacent square at a time.":"Reach the clinic in seven moves or fewer.",ok?96:15);}
 if(k==="cascade"||k==="showcase"){const missing=p.filter(n=>n<0).length,score=p.reduce((n,v,i)=>n+(v<0?0:b.effects[i][v]),0),ok=!missing&&score>=b.minScore;return outcome(ok,missing?"Make a decision for each stage before running the simulation.":ok?"City simulation survived with "+score+" resilience points. People and recovery were protected.":"The city scored "+score+"/"+b.minScore+" resilience points. Revisit decisions that abandon people or block recovery.",missing?0:Math.max(5,score/b.minScore*90));}
 if(k==="chain"){const placed=new Set(),bad=[];for(const i of p){for(const prerequisite of b.prerequisites[i])if(!placed.has(prerequisite))bad.push(b.cards[i]);placed.add(i);}const ok=p.length===b.cards.length&&!bad.length;return outcome(ok,ok?"The chain works from checked water through safe delivery.":p.length!==b.cards.length?"Arrange all five steps. "+p.length+"/5 selected.":"Missing dependencies before "+bad.join(", ")+".",ok?98:p.length*12-bad.length*8);}
 if(k==="access"||k==="backup"){const sel=p.map((v,i)=>v?i:-1).filter(i=>i>=0),cost=sel.reduce((s,i)=>s+b.cost[i],0),ok=k==="access"?b.needed.every(i=>sel.includes(i))&&cost<=b.budget:sel.length===2&&sel.every(i=>b.independent.includes(i))&&cost<=b.budget;return outcome(ok,ok?k==="access"?"The key public routes are accessible.":"Two independent systems protect against a single failure.":k==="access"?"Fit the clinic ramp, walkway and crossing within "+b.budget+" tokens.":"Choose two independent systems within "+b.budget+" tokens. The shared failing grid is not backup.",ok?95:30);}
 if(["equity","negotiate","portfolio"].includes(k)){const spent=p.reduce((a,v)=>a+v,0),remaining=b.budget-spent,gaps=b.minimum.map((n,i)=>Math.max(0,n-p[i])),ok=remaining>=(b.reserve??0)&&gaps.every(n=>!n);return outcome(ok,ok?"Essential needs were protected and "+remaining+" tokens remain.":"Used "+spent+"/"+b.budget+" tokens. Reserve: "+(b.reserve??0)+". Unmet minimums: "+gaps.map((n,i)=>n?b.cards[i]+" "+n:null).filter(Boolean).join(", ")+".",ok?95:Math.max(10,55-gaps.reduce((a,v)=>a+v,0)*7));}
 if(k==="sort"){const correct=p.filter((n,i)=>n===b.answers[i]).length;return outcome(correct===p.length,correct===p.length?"Repair, recycling and qualified collection are correctly separated.":correct+"/"+p.length+" sorted correctly. Batteries and fluorescent lamps need qualified handling.",correct/p.length*100);}
 if(k==="schedule"){const ok=p.every(n=>n>0)&&p[2]===3&&[0,1,3].every(i=>p[i]!==3)&&[1,2].every(slot=>p.filter((n,i)=>n===slot&&i!==2).length<=2);return outcome(ok,ok?"Daylight loads are spread safely; evening learning is protected.":"Move heavy loads and charging to daylight. Keep power for evening learning without overloading a daytime slot.",ok?95:35);}
 if(k==="dispatch"){const correct=p.filter((n,i)=>n===b.ideal[i]).length,ok=correct===3;return outcome(ok,ok?"Every urgent incident has the right specialist, with no double booking.":correct+"/3 incidents assigned competently. Match each hazard to the trained crew.",correct/3*100);}
 if(k==="audit"){const sel=p.map((v,i)=>v?i:-1).filter(i=>i>=0),ok=sel.length===b.needed.length&&b.needed.every(i=>sel.includes(i));return outcome(ok,ok?"All genuine faults identified; healthy components are spared.":"Check loose connections, corroded terminals and overheating without replacing tested healthy parts.",ok?96:20);}
 return outcome(false,"This challenge is unavailable.",0);
}
// Regression-only solved cases; these are not displayed by the game UI.
export const SAMPLE_SOLUTIONS={
 "repair-triage":[0,1,2,3],"fault-investigation":[1,0,1,1,0],
 "site-planning":[1,0,1,0,1,0,0,0,0],"route-finding":[0,4,8,12,13,14,15],
 "crisis-chain":[1,0,0],"supply-dependencies":[0,1,2,3,4],
 "accessible-city":[1,0,1,0,1,0],"fair-access":[4,3,2,1],
 "circular-repairs":[1,3,2,3,2,1],"energy-timetable":[1,2,3,2],
 "stakeholder-agreement":[4,3,2],"emergency-dispatch":[1,2,3],
 "failure-audit":[1,0,1,0,1],"independent-backup":[1,0,1,0,0],
 "investment-portfolio":[4,3,4,3],"city-showcase":[1,0,0,0]
};
