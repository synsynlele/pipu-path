// Varied hands-on challenge workspaces. Accessible tap controls; no identical
// wire board or supply slider repeated through every advanced chapter.
import {
  ADVANCED_CHAPTERS, advancedMission, initialAdvancedPlan,
  newAdvanced, sanitizeAdvanced, testAdvanced, deployAdvanced, canStartAdvanced,
} from "./advanced.mjs";
export function createAdvancedDesk({ getState,change,prepare,reveal,save }) {
  const $=id=>document.getElementById(id), panel=$("advanced-panel");
  let tested=false;
  const current=()=>sanitizeAdvanced(getState().advanced)??newAdvanced(getState().resilience);
  function write(value){change(value);save();}
  function close(){document.body.classList.remove("advanced-configuring");panel.hidden=true;$("advanced-toggle").setAttribute("aria-expanded","false");}
  function title(m){return m?"Chapter "+m.chapter+" · "+m.chapterTitle:"Chapter 12 complete · Your city showcase";}
  function next(){
    const state=current(),plan=initialAdvancedPlan(state);
    write({...state,cursor:{phase:"configure",plan}});
    open();
  }
  function showResult(value){
    const i=value.records.length-1,m=ADVANCED_CHAPTERS[Math.floor(i/2)]?.missions[i%2];
    if(!m)return;
    const record=value.records[i];
    const result=record.legacy ? "Completed in the previous edition of this city. Your progress is preserved." :
      testAdvanced({...value,records:value.records.slice(0,-1)},record.plan).message;
    reveal({chapter:m.chapter??Math.floor(i/2)+5,title:m.title,district:m.district,
      summary:"City project completed. "+result,complete:value.records.length===16,next});
  }
  function element(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el;}
  function button(label,handler,selected=false){
    const b=element("button","challenge-choice",label);
    b.type="button";b.setAttribute("aria-pressed",String(selected));b.onclick=handler;return b;
  }
  function makeSelect(options,value,onChange,placeholder="Choose..."){
    const s=document.createElement("select");
    s.className="challenge-select";
    s.setAttribute("aria-label",placeholder);
    const p=document.createElement("option");
    p.value="-1";p.textContent=placeholder;s.append(p);
    options.forEach((label,i)=>{const o=document.createElement("option");o.value=String(i);o.textContent=label;s.append(o);});
    s.value=String(value);
    s.onchange=()=>onChange(Number(s.value));
    return s;
  }
  function render(){
    tested=false;
    const previousScroll=panel.scrollTop,value=current(),m=advancedMission(value);
    $("advanced-review").hidden=true;
    $("advanced-title").textContent=title(m);
    $("advanced-progress").textContent="City challenges "+value.records.length+"/16 · "+(m?"Challenge "+(m.index+1)+" of 16":"All chapters complete");
    $("advanced-complete").hidden=Boolean(m);
    $("advanced-mission").hidden=!m;
    document.body.classList.toggle("advanced-configuring",Boolean(m));
    if(!m)return;
    $("advanced-brief").textContent=m.title+" — "+m.brief;
    $("advanced-diagnosis").hidden=true; // no repetitive preliminary multiple-choice quiz
    $("advanced-work").hidden=false;
    $("advanced-rules").textContent=m.prompt;
    $("advanced-message").textContent="Try your plan, examine the outcome, then improve it if needed.";
    $("advanced-deploy").disabled=true;
    $("advanced-deploy").textContent="Apply tested solution →";
    const controls=$("advanced-controls");
    controls.replaceChildren();
    controls.className="challenge-workspace challenge-"+m.kind;
    const prior=value.cursor.plan;
    const plan=prior.length===initialAdvancedPlan(value).length?[...prior]:initialAdvancedPlan(value);
    const instruction=(copy)=>controls.append(element("p","challenge-hint",copy));
    const savePlan=()=>{tested=false;$("advanced-deploy").disabled=true;
      $("advanced-message").textContent="Plan changed. Test your solution to see its consequences.";
      write({...value,cursor:{phase:"configure",plan:[...plan]}});};
    const update=(index,v,repaint=false)=>{
      plan[index]=v;savePlan();
      if(repaint){const sc=controls.scrollTop;const ps=panel.scrollTop;render();controls.scrollTop=sc;panel.scrollTop=ps;}
    };
    const card=(title,subtitle)=>{
      const box=element("div","challenge-card");
      box.append(element("strong","",title));
      if(subtitle)box.append(element("small","",subtitle));
      controls.append(box);return box;
    };
    if(m.kind==="evidence"){
      instruction("Tap findings that support a cause. Selecting everything wastes investigation time.");
      m.labels.forEach((label,i)=>{
        const b=button((plan[i]?"☑ ":"□ ")+label,()=>update(i,plan[i]?0:1,true),Boolean(plan[i]));
        b.classList.add("evidence-clue");controls.append(b);
      });
    } else if(m.kind==="sequence"){
      instruction("Use the arrows to move each step into the correct repair order.");
      plan.forEach((id,i)=>{
        const row=card((i+1)+". "+m.labels[id],"Stage "+(i+1));
        const actions=element("div","challenge-inline");
        const up=button("↑ Earlier",()=>{if(i){[plan[i-1],plan[i]]=[plan[i],plan[i-1]];savePlan();render();}});
        const down=button("↓ Later",()=>{if(i<plan.length-1){[plan[i+1],plan[i]]=[plan[i],plan[i+1]];savePlan();render();}});
        up.disabled=i===0;down.disabled=i===plan.length-1;
        actions.append(up,down);row.append(actions);
      });
    } else if(m.kind==="site"||m.kind==="zoning"){
      instruction("Select which service to place, then tap a plot on the town map. Avoid flooded ground.");
      let active=plan[0]<0?0:1;
      const roleBar=element("div","challenge-inline");
      const grid=element("div","challenge-town-map");
      const draw=()=>{
        roleBar.replaceChildren();grid.replaceChildren();
        m.roles.forEach((role,i)=>roleBar.append(button(role+(plan[i]>=0?" · Plot "+(plan[i]+1):" · not placed"),()=>{
          active=i;draw();},active===i)));
        m.labels.forEach((name,index)=>{
          const chosen=plan.indexOf(index),flood=/flood|river/i.test(name);
          const b=button((index+1)+". "+name+(chosen>=0?" · "+m.roles[chosen]:""),()=>{
            plan[active]=index;savePlan();if(active===0&&plan[1]<0)active=1;draw();},
            chosen>=0);
          b.classList.add("challenge-plot");
          if(flood)b.classList.add("plot-risk");
          grid.append(b);
        });
      };controls.append(roleBar,grid);draw();
    } else if(m.kind==="schedule"){
      instruction("Only one vehicle can use the loading bay in each half-hour slot.");
      m.labels.forEach((job,i)=>{
        const row=card(job,"Must arrive by "+m.slots[m.deadlines[i]]);
        row.append(makeSelect(m.slots,plan[i],v=>update(i,v,true),"Choose an arrival time for "+job));
      });
    } else if(["scenario","negotiation","risk"].includes(m.kind)){
      instruction("Each situation needs its own decision. Consequences depend on the action, not the wording.");
      m.rounds.forEach((round,i)=>{
        const row=card((i+1)+". "+round.event,"Choose one action");
        const options=element("div","challenge-options");
        round.options.forEach((name,j)=>options.append(button(name,()=>update(i,j,true),plan[i]===j)));
        row.append(options);
      });
    } else if(["inventory","energy"].includes(m.kind)){
      instruction("Move each slider. Watch your total and reserve so later services can still operate.");
      const total=element("p","challenge-budget","");
      controls.append(total);
      const totalBudget=m.available??m.budget;
      const repaintTotals=()=>{
        const used=plan.reduce((a,b)=>a+b,0);
        total.textContent="Used: "+used+"/"+totalBudget+" · Remaining: "+(totalBudget-used)+" · Reserve needed: "+m.reserve;
        total.dataset.over=String(used>totalBudget-m.reserve);
      };
      m.labels.forEach((label,i)=>{
        const row=card(label,"Minimum "+m.minimum[i]+" · useful maximum "+m.maximum[i]);
        const slider=document.createElement("input");
        slider.type="range";slider.min="0";slider.max=String(m.maximum[i]+2);slider.step="1";slider.value=String(plan[i]);
        slider.setAttribute("aria-label",label);
        const count=element("strong","challenge-number",String(plan[i]));
        slider.oninput=()=>{plan[i]=Number(slider.value);count.textContent=String(plan[i]);savePlan();repaintTotals();};
        row.append(slider,count);
      });repaintTotals();
    } else if(["access","portfolio","capstone"].includes(m.kind)){
      instruction("Build a package that covers residents' needs while respecting the budget.");
      const total=element("p","challenge-budget","");
      controls.append(total);
      const refreshBudget=()=>{
        const chosen=m.options.filter((_,i)=>plan[i]===1);
        const used=chosen.reduce((n,opt)=>n+opt.cost,0);
        const covered=new Set(chosen.flatMap(opt=>opt.covers));
        total.textContent="Spent "+used+"/"+m.budget+" · Needs covered: "+m.needs.filter(n=>covered.has(n)).join(", ")+(m.needs.some(n=>!covered.has(n))?" · Some needs remain":"");
        total.dataset.over=String(used>m.budget);
      };
      m.options.forEach((opt,i)=>{
        const b=button((plan[i]?"☑ ":"□ ")+opt.name+" · "+opt.cost+" credits of public budget",()=>update(i,plan[i]?0:1,true),Boolean(plan[i]));
        b.classList.add("challenge-investment");controls.append(b);
      });refreshBudget();
    } else if(m.kind==="sorting"){
      instruction("Each material has a different recovery route. Batteries require safe disposal.");
      m.labels.forEach((name,i)=>{
        const row=card(name,"Choose a recovery stream");
        row.append(makeSelect(m.bins,plan[i],v=>update(i,v,true),"Recovery for "+name));
      });
    } else if(m.kind==="crews"){
      instruction("Only specialists with the right skills should perform hazardous repairs.");
      m.jobs.forEach((job,i)=>{
        const row=card(job,"Choose the specialist team");
        row.append(makeSelect(m.crews,plan[i],v=>update(i,v,true),"Team for "+job));
      });
    } else if(m.kind==="forecast"){
      instruction("Compare recent demand in each district. Set a sensible forecast for the next period.");
      m.labels.forEach((name,i)=>{
        const row=card(name,"Recent needs: "+m.history[i].join(" → "));
        const slider=document.createElement("input");
        slider.type="range";slider.min="0";slider.max="9";slider.step="1";slider.value=String(plan[i]);
        slider.setAttribute("aria-label","Forecast "+name);
        const count=element("strong","challenge-number",String(plan[i]));
        slider.oninput=()=>{plan[i]=Number(slider.value);count.textContent=String(plan[i]);savePlan();};
        row.append(slider,count);
      });
    } else instruction("This challenge is being configured.");
    $("advanced-test").onclick=()=>{
      const result=testAdvanced(value,plan);
      tested=result.ok;$("advanced-deploy").disabled=!result.ok;
      $("advanced-message").textContent=(result.ok?"✓ ":"Try another approach: ")+result.message+
        (result.ok?" · City outcome score "+result.score+"/100.":"");
      $("advanced-message").dataset.success=String(result.ok);
    };
    $("advanced-deploy").onclick=()=>{
      if(!tested)return;
      const result=deployAdvanced(current(),plan);
      if(!result)return;
      write(result);close();showResult(result);
    };
    panel.scrollTop=previousScroll;
  }
  function openChapter(chapter){
    if(!canStartAdvanced(getState().resilience))return;
    const value=current(),start=(chapter-5)*2;
    if(chapter<5||chapter>12||value.records.length<start)return;
    if(value.records.length<start+2)return open();
    prepare();render();
    if(chapter===12&&value.records.length===16){panel.hidden=false;$("advanced-close").focus();return;}
    document.body.classList.remove("advanced-configuring");
    $("advanced-mission").hidden=true;$("advanced-complete").hidden=true;
    const review=$("advanced-review");
    review.replaceChildren();review.hidden=false;
    $("advanced-title").textContent="Chapter "+chapter+" · "+ADVANCED_CHAPTERS[chapter-5].title+" · Completed";
    for(let i=start;i<start+2;i++){
      const m=ADVANCED_CHAPTERS[chapter-5].missions[i-start],record=value.records[i];
      review.append(element("h3","",m.title),element("p","",record.legacy?
        "Completed in the previous edition. Your progress and city upgrades are preserved.":
        testAdvanced({...value,records:value.records.slice(0,i)},record.plan).message));
    }
    const back=button("Return to my current challenge →",open);
    review.append(back);panel.hidden=false;$("advanced-close").focus();
  }
  function open(){
    if(!canStartAdvanced(getState().resilience))return;
    prepare();
    const value=current();
    if(!getState().advanced)write(value);
    if(value.cursor.phase==="result"&&value.records.length){showResult(value);return;}
    render();panel.hidden=false;$("advanced-toggle").setAttribute("aria-expanded","true");
    $("advanced-close").focus();
  }
  $("advanced-toggle").onclick=open;
  $("chapter-five-start").onclick=open;
  $("advanced-close").onclick=close;
  $("advanced-back-city").onclick=close;
  $("advanced-replay").onclick=()=>{
    if(!confirm("Replay Chapters 5–12 with the new varied challenges? Your Chapters 1–4 city remains. Existing advanced progress will be replaced."))return;
    write(newAdvanced(getState().resilience));open();
  };
  return {open,close,next,openChapter};
}
