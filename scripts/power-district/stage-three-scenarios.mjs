import assert from "node:assert/strict";
import {
  STAGE_THREE_CASES, STAGE_THREE_CHOICES,
  stageThreeCase, stageThreeAvailable,
  sanitizeStageThree,criticalServiceLinks,beginStageThree,finishStageThree,
} from "../../public/games/city/stage-three-scenarios.mjs";
import { CITY_CASES } from "../../public/games/city/cases.mjs";
import { emptyLabBoard,labMission,placeLabPiece,evaluateLab,sanitizeLab } from "../../public/games/city/build-lab.mjs";
import { serviceFor } from "../../public/games/city/city-service-system.mjs";
assert.equal(STAGE_THREE_CASES.length,12);
assert.equal(new Set(STAGE_THREE_CASES.map(x=>x.id)).size,12);
for(let i=0;i<100;i++){
 const a=stageThreeCase(i),b=stageThreeCase(i+1);
 assert.notEqual(a.missionId,b.missionId,"Consecutive challenges must change districts");
 assert(a.situation.length>55);
 assert(a.question.includes("respond"));
}
assert.equal(stageThreeCase(0).id,"workshop-pump");
assert.equal(stageThreeCase(12).id,"workshop-pump");
assert.notEqual(stageThreeCase(0).shift,stageThreeCase(12).shift);
assert(STAGE_THREE_CHOICES.every(x=>x.assumedPeriods>0));
const decisions=Object.fromEntries(CITY_CASES.map(c=>[c.id,c.options[0].id]));
assert(!stageThreeAvailable({},null));
let lab=sanitizeLab(null);
assert(!stageThreeAvailable(decisions,lab));
// Independent routes author a valid certified prototype for each mission.
function route(board,mission,cells) {
 for(let i=1;i<cells.length-1;i++) {
  const cell=cells[i], dir=(x)=>x===cell-5?0:x===cell+1?1:x===cell+5?2:3;
  const need=new Set([dir(cells[i-1]),dir(cells[i+1])]);
  if(board[cell]) {
   const old=board[cell],basis=old.kind==="straight"?[0,2]:old.kind==="bend"?[0,1]:[0,1,3];
   for(const d of basis)need.add((d+old.turn)%4);
  }
  let piece;
  for(const [kind,basis] of Object.entries({straight:[0,2],bend:[0,1],junction:[0,1,3]}))
   for(let turn=0;turn<4;turn++){
    const ports=basis.map(d=>(d+turn)%4);
    if(ports.length===need.size&&ports.every(d=>need.has(d)))piece={kind,turn};
   }
  assert(piece);
  board=placeLabPiece(mission,board,cell,piece);
 }
 return board;
}
const proven={
 "workshop-link":[[10,5,6,7,8,9,14]],
 "clinic-power":[[2,1,0,5,10,15,20,21,22]],
 "shared-services":[[10,11,6,1,2,3,4],[10,11,16,21,22,23,24]],
 "backup-water":[[10,5,6,7,8,9,14],[10,15,16,17,18,19,14]],
 "shared-recovery":[[12,11,10,5,0,1,2,3,4],[12,11,10,15,20]],
};
for(const [id,routes] of Object.entries(proven)){
 const m=labMission(id);
 let board=emptyLabBoard();
 for(const points of routes) board=route(board,m,points);
 assert(evaluateLab(m,board).success,"Every authored build is physically solvable: "+id);
 lab.boards[id]=board;
 lab.tested.push(id);
}
assert(stageThreeAvailable(decisions,lab));
for(let round=0;round<12;round++){
 const stage={round,active:null};
 const scenario=stageThreeCase(round);
 assert(criticalServiceLinks(lab,scenario.missionId).length>0);
 assert.equal(beginStageThree(stage,{},lab,"protect").status,"locked");
 assert.equal(beginStageThree(stage,decisions,lab,"fake").status,"choose-plan");
 const response=beginStageThree(stage,decisions,lab,round%2?"inspect":"protect");
 assert.equal(response.status,"repair-required");
 assert.equal(serviceFor(response.lab,scenario.missionId).served,response.after.served);
 assert(response.before.served>response.after.served);
 assert(response.estimate.unmetRequestPeriods>0);
 assert.equal(beginStageThree(response.stage,decisions,response.lab,"protect").status,"in-progress");
 assert.equal(finishStageThree(response.stage,response.lab,scenario.missionId).status,"not-finished");
 const restored=sanitizeLab(response.lab);
 restored.faults[scenario.missionId]=null;
 const done=finishStageThree(response.stage,restored,scenario.missionId);
 assert.equal(done.status,"complete");
 assert.equal(done.stage.round,round+1);
 assert.equal(done.stage.active,null);
}
assert.deepEqual(sanitizeStageThree({round:-1,active:{id:"fake"}},lab),{round:0,active:null});
assert.equal(sanitizeStageThree({round:999999,active:null},lab).round,0);
assert.equal(sanitizeStageThree({round:0,active:{id:"workshop-pump",choiceId:"protect",cell:25}},lab).active,null);
console.log("PASS: 12 reviewed replay scenarios; rotating shifts and districts; model-derived breakpoints, solvability, anti-repeat, gated decisions, real repairs and safe save state.");
