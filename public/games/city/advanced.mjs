// Chapters 5–12: independent, deterministic simulation challenges.
// Keep verified real-world evidence separate. Existing v1 players preserve
// completed missions through the legacy validator, not fabricated new plans.
import { resilienceReport } from "./resilience.mjs";
import { CITY_DISTRICTS } from "./districts.mjs";
import { ADVANCED_CHAPTERS, ADVANCED_MISSIONS, challengeAt, initialChallengePlan } from "./advanced-missions.mjs";
import { sanitizeAdvanced as sanitizeLegacy, advancedUpgrades as legacyUpgrades } from "./advanced-legacy.mjs";

export { ADVANCED_CHAPTERS } from "./advanced-missions.mjs";
const MAX_PLAN = 30;
const isInt = (n) => Number.isInteger(n) && n >= -1 && n <= MAX_PLAN;
const sum = (numbers) => numbers.reduce((a,b) => a+b, 0);
const fail = (message, metrics={}) => ({ok:false,score:0,message,metrics});
const pass = (message,score=100,metrics={}) => ({ok:true,score,message,metrics});
const selected = (plan) => plan.map((v,i)=>v===1?i:-1).filter((i)=>i>=0);
const distance = (a,b) => Math.abs(Math.floor(a/3)-Math.floor(b/3))+Math.abs(a%3-b%3);
const coverage = (m, plan) => {
  const choices = selected(plan);
  const spent = sum(choices.map((i)=>m.options[i].cost));
  const covered = new Set(choices.flatMap((i)=>m.options[i].covers));
  return {choices,spent,covered,missing:m.needs.filter((need)=>!covered.has(need))};
};
export function advancedMission(value) { return challengeAt(value?.records?.length ?? 0); }
export function initialAdvancedPlan(value) { return initialChallengePlan(advancedMission(value)); }
export function canStartAdvanced(resilience) { return resilienceReport(resilience)?.completed === true; }
export function newAdvanced(resilience) {
  return {
    version:2,
    seed:Math.min(10,Math.max(0,resilience?.seed?.capacity?.water ?? 0)),
    records:[],
    cursor:{phase:"configure",plan:initialChallengePlan(challengeAt(0))},
  };
}
export function advancedRules(value) {
  const m = advancedMission(value);
  if(!m)return null;
  return {kind:m.kind,chapter:m.chapter,prompt:m.prompt,model:m};
}
function evaluate(m, plan) {
  const p = plan;
  switch(m.kind){
    case "evidence": {
      if(!p.every(v=>v===0||v===1))return fail("Select the evidence you want to investigate.");
      const chosen=selected(p), missed=m.causes.filter(i=>!chosen.includes(i)),extra=chosen.filter(i=>!m.causes.includes(i));
      if(missed.length)return fail("You missed a real risk. Check the water storage and disinfection records.",{found:m.causes.length-missed.length});
      if(extra.length>1)return fail("Too many unrelated clues would waste the repair budget. Focus on the sources of risk.");
      return pass(extra.length?"Both causes found. One extra clue adds some investigation cost.":"Both contamination risks identified. The clinic can now address the causes.",extra.length?80:100,{causes:2,extra:extra.length});
    }
    case "sequence":{
      const right=m.order.every((id,i)=>p[i]===id);
      if(!right)return fail("The steps are unsafe or out of order. Isolate the equipment before diagnosing or reopening.");
      return pass("Safe repair sequence completed: isolate, inspect, fix, test.",100,{steps:4});
    }
    case "site": case "zoning":{
      const [a,b]=p;
      if(a===b || a<0 || b<0)return fail("Choose two different plots for the two community uses.");
      if(!m.safe?.[0]?.includes(a) && !m.allowed?.[0]?.includes(a))return fail("The first site has a flood or access hazard. Pick safer ground.");
      if(!m.safe?.[1]?.includes(b) && !m.allowed?.[1]?.includes(b))return fail("The second site exposes residents to unnecessary hazards.");
      if(distance(a,b)>m.maxDistance)return fail("The two places are too far apart for accessible everyday journeys.");
      return pass("Both sites are safe and close enough for a practical walking connection.",distance(a,b)===1?100:85,{walkingSteps:distance(a,b),plots:2});
    }
    case "schedule":{
      if(p.includes(-1)||new Set(p).size!==p.length)return fail("Assign each service its own loading-bay time.");
      const late=p.findIndex((v,i)=>v>m.deadlines[i]);
      if(late>=0)return fail(m.labels[late]+" arrives after its required window. Protect essential early trips.");
      return pass("School, care, market and repairs have workable arrival times without loading-bay conflict.",100,{scheduled:4,conflicts:0});
    }
    case "scenario": case "negotiation": case "risk":{
      if(p.some(v=>v<0||v>2))return fail("Respond to all three situations before testing your plan.");
      const right=p.filter((v,i)=>v===m.rounds[i].safe).length;
      const priority=m.kind==="scenario"?0:m.kind==="negotiation"?1:2;
      if(p[priority]!==m.rounds[priority].safe)return fail("A critical safety or access need is still exposed. Review the most urgent situation.",{protected:right});
      if(right<2)return fail("Too many people or services remain at risk. Reconsider the trade-offs.",{protected:right});
      const words={scenario:"The immediate threats are addressed",negotiation:"The agreement protects essential access",risk:"The city has usable protections against the hazards"};
      return pass(words[m.kind]+". "+right+" of 3 responses protect residents.",right===3?100:75,{protected:right,total:3});
    }
    case "inventory": case "energy":{
      if(p.some(v=>v<0))return fail("Set all allocation controls.");
      const left=(m.available??m.budget)-sum(p);
      if(left<m.reserve)return fail("Too much stock is committed. Keep at least "+m.reserve+" units for emergencies.");
      const miss=m.minimum.findIndex((v,i)=>p[i]<v);
      if(miss>=0)return fail(m.labels[miss]+" needs at least "+m.minimum[miss]+" units. Adjust your plan.");
      const excess=m.maximum.findIndex((v,i)=>p[i]>v);
      if(excess>=0)return fail(m.labels[excess]+" cannot handle that many units without waste or overload.");
      return pass(m.kind==="inventory"?
        "The harvest is sold, preserved and shared without overloading storage.":
        "Essential power needs are supplied with an emergency reserve.",
        left===m.reserve?88:100,{used:sum(p),reserve:left,minimumsMet:m.minimum.length});
    }
    case "access": case "portfolio": case "capstone":{
      if(p.some(v=>v!==0&&v!==1))return fail("Choose an investment package.");
      const c=coverage(m,p);
      if(c.spent>m.budget)return fail("Your proposals cost "+c.spent+" units but the budget is only "+m.budget+".");
      if(c.missing.length)return fail("Unmet priorities: "+c.missing.join(", ")+". Find a more balanced package.",{covered:m.needs.length-c.missing.length});
      const savings=m.budget-c.spent;
      return pass("The plan covers "+m.needs.join(", ")+" and saves "+savings+" units for future needs.",
        Math.min(100,85+savings*3),{covered:m.needs.length,budgetLeft:savings,projects:c.choices.length});
    }
    case "sorting":{
      if(p.some(v=>v<0||v>2))return fail("Sort all the materials before sending them to recovery centres.");
      if(p[2]!==m.correct[2])return fail("Damaged batteries require safe disposal. Do not place hazardous waste with ordinary materials.");
      const right=p.filter((v,i)=>v===m.correct[i]).length;
      if(right<4)return fail("Several materials would be wasted or mishandled. Check what can be repaired or composted.",{sorted:right});
      return pass(right+" of 5 materials will be handled appropriately.",right===5?100:80,{sorted:right,total:5});
    }
    case "crews":{
      if(p.some(v=>v<0||v>2))return fail("Assign a qualified team to every job.");
      if(new Set(p).size!==p.length)return fail("A single team cannot be at two urgent jobs at once.");
      const wrong=p.findIndex((v,i)=>v!==m.correct[i]);
      if(wrong>=0)return fail(m.jobs[wrong]+" needs an appropriately trained specialist, not an available but unqualified worker.");
      return pass("All three hazards have skilled teams without double-booking.",100,{safeRepairs:3});
    }
    case "forecast":{
      const errors=p.map((n,i)=>Math.abs(n-m.expected[i]));
      if(errors.some(e=>e>m.tolerance))return fail("Your forecast misses a recent trend. Compare each district's last three observations.",{variance:sum(errors)});
      return pass("Services are prepared for anticipated growth. Total forecast difference: "+sum(errors)+" units.",100-sum(errors)*10,{variance:sum(errors),forecast:p});
    }
    default:return fail("This challenge is not available.");
  }
}
export function testAdvanced(value,plan){
  const m=advancedMission(value);
  if(!m)return fail("The city story is complete. Explore your work and start a real-world Quest.");
  if(!Array.isArray(plan)||plan.length!==initialChallengePlan(m).length||!plan.every(isInt))
    return fail("Check your plan. Each control needs a valid choice.");
  return evaluate(m,plan);
}
export function sanitizeAdvanced(value) {
  if(!value || !Array.isArray(value.records) || value.records.length>ADVANCED_MISSIONS.length)return null;
  if(value.version===1) {
    const legacy=sanitizeLegacy(value);
    if(!legacy)return null;
    const records=legacy.records.map(r=>({legacy:true,plan:[...r.plan]}));
    return {version:2,seed:legacy.seed,records,cursor:{
      phase:"configure",plan:initialChallengePlan(challengeAt(records.length))}};
  }
  if(value.version!==2)return null;
  const seed=Number.isInteger(value.seed)&&value.seed>=0&&value.seed<=10?value.seed:0;
  const records=[],legacy=[];
  for(let i=0;i<value.records.length;i++) {
    const record=value.records[i];
    if(!record||!Array.isArray(record.plan))return null;
    if(record.legacy===true) {
      // Old records may only be a prefix, and their actual old simulations
      // must validate. Do not award credit for a synthetic migrated marker.
      if(records.length!==legacy.length)return null;
      legacy.push({plan:record.plan});
      if(!sanitizeLegacy({version:1,seed,records:legacy,cursor:{phase:"diagnose",plan:[]}}))return null;
      records.push({legacy:true,plan:[...record.plan]});
    } else {
      if(!testAdvanced({version:2,seed,records},record.plan).ok)return null;
      const result=testAdvanced({version:2,seed,records},record.plan);
      records.push({plan:[...record.plan],score:result.score});
    }
  }
  const m=challengeAt(records.length);
  let plan=Array.isArray(value.cursor?.plan)&&value.cursor.plan.length===initialChallengePlan(m).length&&value.cursor.plan.every(isInt)?
    [...value.cursor.plan]:initialChallengePlan(m);
  const phase=value.cursor?.phase==="result"&&records.length?"result":"configure";
  if(!m)plan=[];
  return {version:2,seed,records,cursor:{phase,plan}};
}
export function deployAdvanced(value,plan) {
  const safe=sanitizeAdvanced(value);
  if(!safe)return null;
  const check=testAdvanced(safe,plan);
  if(!check.ok)return null;
  return {...safe,records:[...safe.records,{plan:[...plan],score:check.score}],
    cursor:{phase:"result",plan:[]}};
}
export function advancedUpgrades(value) {
  const districts=Object.fromEntries(CITY_DISTRICTS.map(d=>[d.id,0]));
  if(!value?.records?.length)return districts;
  const count=Math.min(ADVANCED_MISSIONS.length,value.records.length);
  for(let i=0;i<count;i++){
    const m=challengeAt(i);
    if(m)districts[m.district]=(districts[m.district]??0)+1;
    // Cross-system service results reflect the district, but cannot be bought.
    if(["market","health","workshop","power"].includes(m.district))
      districts.water=Math.max(1,districts.water??0);
  }
  // Keep legacy service upgrades for already completed v1 repairs.
  const legacyCount=value.records.findIndex(r=>r.legacy!==true);
  const n=legacyCount<0?count:legacyCount;
  if(n) {
    const old=legacyUpgrades({records:value.records.slice(0,n)});
    for(const [id,v] of Object.entries(old))districts[id]=Math.max(districts[id]??0,v);
  }
  return districts;
}
export function advancedCityActivity(economy,resilience,value){
  if(!value?.records?.length)return null;
  const lastIndex=value.records.length-1;
  const m=challengeAt(lastIndex),record=value.records[lastIndex];
  if(!m)return null;
  const prior=resilienceReport(resilience)?.last?.requests??{
    clinic:{requested:3,served:0},farms:{requested:2,served:0},
    repairs:{requested:2,served:0},shops:{requested:2,served:0},
  };
  const requests=Object.fromEntries(Object.entries(prior).map(([id,row])=>[id,{...row}]));
  const affected={
    health:["clinic"],workshop:["repairs"],market:["farms","shops"],
    industry:["repairs"],business:["shops"],school:["clinic"],
    housing:["clinic"],transport:["shops"],governance:["shops"],
    power:["clinic","farms"],water:["clinic","farms"],
  }[m.district]??[];
  // New tested plans contribute a concrete simulated improvement, never a
  // promise that all people or all prior system failures have been fixed.
  if(!record.legacy)for(const id of affected) {
    if(requests[id])requests[id].served=Math.min(requests[id].requested,Math.max(requests[id].served,Math.floor(requests[id].requested*record.score/100)));
  }
  return {...economy,day:Math.max(1,economy?.day??1),upgrades:advancedUpgrades(value),
    last:{...(economy?.last??{}),requests,shipments:[
      {from:"water",to:"health",units:requests.clinic?.served??0},
      {from:"water",to:"market",units:requests.farms?.served??0},
      {from:"industry",to:"workshop",units:requests.repairs?.served??0},
      {from:"market",to:"business",units:requests.shops?.served??0},
    ],advancedDistrict:m.district,advancedProject:m.id,
    advancedScore:record.legacy?null:record.score}};
}
