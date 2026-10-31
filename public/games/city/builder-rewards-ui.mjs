// One chapter celebration and one virtual shop; never stack reward cards.
import {
  BUILDER_ITEMS,
  awardCompletedChapters,
  builderBalance,
  purchaseBuilderItem,
  toggleBuilderItem,
  acknowledgeChapter,
  nextCelebration,
  MAX_DISTRICT_DECOR,
  MAX_ITEM_PER_DISTRICT,
  MAX_TOTAL_DECOR,
} from "./builder-rewards.mjs";
import { CITY_DISTRICTS } from "./districts.mjs";

export function mountBuilderRewards({
  getState,
  setRewards,
  getChapterItems,
  getBuiltDistrictIds,
  getChapterImpact,
  isJourneyRunning,
  isPlaying,
  isBlockingCelebration,
  pauseForReward,
  continueBuilding,
  viewCity,
  playSuccess,
}) {
  const $ = (id) => document.getElementById(id);
  let category = "city",
    timer = null,
    activeChapter = null,
    shopWasRunning = false;
  const shop = $("builder-shop"),
    celebration = $("chapter-celebration");
  const fmt = (value) => new Intl.NumberFormat("en").format(value);
  function updateBalances() {
    const credits = fmt(builderBalance(getState().rewards));
    $("builder-credit-balance").textContent = credits;
    $("shop-credit-balance").textContent = credits;
  }
  function notify(message) {
    $("shop-message").textContent = message;
  }
  function availableDistricts() {
    const allowed = new Set(getBuiltDistrictIds());
    return CITY_DISTRICTS.filter((district) => allowed.has(district.id));
  }
  function renderShop() {
    const rewards=getState().rewards;
    updateBalances();
    $("shop-city-tab").setAttribute("aria-pressed",String(category==="city"));
    $("shop-builder-tab").setAttribute("aria-pressed",String(category==="builder"));
    const districts=availableDistricts(),select=$("shop-district"),selected=select.value;
    select.replaceChildren();
    for(const d of districts){
      const option=document.createElement("option");
      option.value=d.id;option.textContent=d.emoji+" "+d.name;select.append(option);
    }
    if(districts.some(d=>d.id===selected))select.value=selected;
    select.onchange=()=>{notify("");renderShop();};
    $("shop-district-label").hidden=category!=="city";
    select.hidden=category!=="city";
    const district=select.value;
    const cityPurchases=rewards.purchases.filter(p=>BUILDER_ITEMS.find(item=>item.id===p.id)?.category==="city");
    const districtCount=cityPurchases.filter(p=>p.district===district).length;
    const owned=new Set(rewards.purchases.filter(p=>p.district==null).map(p=>p.id));
    const list=$("shop-items");list.replaceChildren();
    if(category==="city"&&districts.length){
      const guide=document.createElement("p");
      guide.className="shop-placed-count";
      guide.textContent="Placed in this district: "+districtCount+"/"+MAX_DISTRICT_DECOR+
        " · You can buy more than one decoration and decorate every neighbourhood.";
      list.append(guide);
    }
    for(const item of BUILDER_ITEMS.filter(i=>i.category===category)){
      const card=document.createElement("article");card.className="builder-shop-product";
      const icon=document.createElement("span");icon.className="product-icon";
      icon.textContent=item.icon;icon.setAttribute("aria-hidden","true");
      const title=document.createElement("strong");title.textContent=item.name;
      const detail=document.createElement("p");detail.textContent=item.detail;
      const button=document.createElement("button");button.type="button";
      const equipped=rewards.equipped.includes(item.id);
      if(item.category==="builder"&&owned.has(item.id)){
        button.textContent=equipped?"Wearing · Take off":"Put on";
        button.onclick=()=>{
          setRewards(toggleBuilderItem(getState().rewards,item.id));
          renderShop();notify(equipped?"Item removed from your Builder.":"Your Builder is wearing this item.");
        };
      } else {
        const count=cityPurchases.filter(p=>p.district===district&&p.id===item.id).length;
        if(item.category==="city"){
          const note=document.createElement("small");
          note.textContent="Placed here: "+count+"/"+MAX_ITEM_PER_DISTRICT;
          card.append(icon,title,detail,note);
        } else card.append(icon,title,detail);
        button.textContent=(item.category==="city"&&count?"Buy another · ":"Unlock · ")+item.cost+" ✦";
        const full=item.category==="city"&&(
          !districts.length||districtCount>=MAX_DISTRICT_DECOR||
          count>=MAX_ITEM_PER_DISTRICT||cityPurchases.length>=MAX_TOTAL_DECOR);
        button.disabled=builderBalance(rewards)<item.cost||full;
        button.onclick=()=>{
          const place=item.category==="city"?$("shop-district").value:null;
          const result=purchaseBuilderItem(getState().rewards,item.id,place,
            availableDistricts().map(d=>d.id));
          if(!result.ok){notify(result.reason);return;}
          setRewards(result.rewards);
          renderShop();
          notify(item.category==="city"?
            "Another "+item.name+" now appears in "+(districts.find(d=>d.id===place)?.name??"your city")+"!":
            item.name+" unlocked and equipped!");
          playSuccess();
        };
        card.append(button);list.append(card);continue;
      }
      card.append(icon,title,detail,button);list.append(card);
    }
    if(category==="city"&&!districts.length)notify("Make your first district decision before placing a decoration.");
    if(category==="city"&&districtCount>=MAX_DISTRICT_DECOR)
      notify("This district looks lovely. Choose another district to keep decorating.");
  }
  function openShop() {
    if (!isPlaying()) return;
    shopWasRunning = isJourneyRunning();
    if (celebration.open) closeCelebration(false);
    pauseForReward();
    category = "city";
    $("city-menu").open = false;
    notify("");
    renderShop();
    if (!shop.open) shop.showModal();
  }
  function closeCelebration(mark = true) {
    if (!celebration.open) return;
    const chapter = activeChapter;
    activeChapter = null;
    celebration.close();
    if (mark && chapter) {
      setRewards(acknowledgeChapter(getState().rewards, chapter));
      updateBalances();
    }
  }
  function showCelebration() {
    timer = null;
    const pending = nextCelebration(getState().rewards);
    if (!pending || !isPlaying() || document.hidden) return;
    if (shop.open || celebration.open || isBlockingCelebration()) {
      schedule();
      return;
    }
    pauseForReward();
    activeChapter = pending.chapter;
    const item = getChapterItems().find((c) => c.chapter === pending.chapter);
    const title =
      pending.tier === "thriving"
        ? "A city worth celebrating!"
        : pending.tier === "growing"
          ? "Your city is getting stronger!"
          : "A builder never stops improving.";
    celebration.dataset.tier = pending.tier;
    $("celebration-kicker").textContent =
      "✦ CHAPTER " +
      pending.chapter +
      " COMPLETE · " +
      (item?.title ?? "CITY BUILDER") +
      " ✦";
    $("celebration-title").textContent = title;
    $("celebration-description").textContent = {
      thriving:
        "Your decisions helped more people and strengthened city services.",
      growing:
        "You made meaningful progress, and your city still has challenges to solve.",
      repair:
        "You finished the chapter. Your city needs better solutions—and you can build them.",
    }[pending.tier];
    $("celebration-impact").textContent = getChapterImpact(pending.chapter);
    $("celebration-credits").textContent = "+" + pending.credits;
    $("celebration-balance").textContent = fmt(
      builderBalance(getState().rewards),
    );
    $("celebration-continue").textContent =
      pending.chapter === 12
        ? "Explore my finished city →"
        : "Continue building →";
    $("celebration-view").textContent =
      pending.tier === "repair" ? "See what needs repair" : "Admire my city";
    celebration.showModal();
    playSuccess();
  }
  function schedule() {
    if (timer !== null || !nextCelebration(getState().rewards) || !isPlaying())
      return;
    timer = setTimeout(showCelebration, 1700);
  }
  $("menu-shop").onclick = openShop;
  $("shop-close").onclick = () => shop.close();
  $("shop-city-tab").onclick = () => {
    category = "city";
    notify("");
    renderShop();
  };
  $("shop-builder-tab").onclick = () => {
    category = "builder";
    notify("");
    renderShop();
  };
  $("celebration-continue").onclick = () => {
    const chapter = activeChapter;
    closeCelebration();
    if (chapter === 12) viewCity();
    else continueBuilding();
    schedule();
  };
  $("celebration-view").onclick = () => {
    closeCelebration();
    viewCity();
  };
  $("celebration-shop").onclick = () => {
    closeCelebration();
    openShop();
  };
  celebration.addEventListener("cancel", (event) => event.preventDefault());
  shop.addEventListener("close", () => {
    const resume = shopWasRunning;
    shopWasRunning = false;
    if (resume && !nextCelebration(getState().rewards)) continueBuilding();
    else schedule();
  });
  function sync() {
    const state = getState(),
      before = state.rewards;
    const { rewards, newly } = awardCompletedChapters(
      before,
      getChapterItems(),
      state,
    );
    if (newly.length) {
      // Older saved cities receive their earned rewards, but only one catch-up
      // celebration so returning players are not trapped in twelve pop-ups.
      if (!before?.awards?.length && newly.length > 1) {
        rewards.viewed.push(...newly.slice(0, -1).map((item) => item.chapter));
      }
      setRewards(rewards);
    }
    updateBalances();
    if (shop.open) renderShop();
    schedule();
  }
  return { sync, openShop, schedule, closeCelebration, updateBalances };
}
