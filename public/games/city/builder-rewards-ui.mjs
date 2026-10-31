// One chapter celebration and one virtual shop; never stack reward cards.
import {
  BUILDER_ITEMS,
  awardCompletedChapters,
  builderBalance,
  chapterRating,
  purchaseBuilderItem,
  toggleBuilderItem,
  acknowledgeChapter,
  nextCelebration,
} from "./builder-rewards.mjs";
import { CITY_DISTRICTS } from "./districts.mjs";

export function mountBuilderRewards({
  getState,
  setRewards,
  getChapterItems,
  getBuiltDistrictIds,
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
    activeChapter = null;
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
    const rewards = getState().rewards;
    updateBalances();
    $("shop-city-tab").setAttribute(
      "aria-pressed",
      String(category === "city"),
    );
    $("shop-builder-tab").setAttribute(
      "aria-pressed",
      String(category === "builder"),
    );
    const districts = availableDistricts();
    const select = $("shop-district"),
      selected = select.value;
    select.replaceChildren();
    for (const district of districts) {
      const option = document.createElement("option");
      option.value = district.id;
      option.textContent = district.emoji + " " + district.name;
      select.append(option);
    }
    if (districts.some((district) => district.id === selected))
      select.value = selected;
    $("shop-district-label").hidden = category !== "city";
    select.hidden = category !== "city";
    const list = $("shop-items");
    list.replaceChildren();
    const owned = new Set(rewards.purchases.map((purchase) => purchase.id));
    for (const item of BUILDER_ITEMS.filter(
      (item) => item.category === category,
    )) {
      const card = document.createElement("article");
      card.className = "builder-shop-product";
      const icon = document.createElement("span");
      icon.className = "product-icon";
      icon.textContent = item.icon;
      icon.setAttribute("aria-hidden", "true");
      const title = document.createElement("strong");
      title.textContent = item.name;
      const detail = document.createElement("p");
      detail.textContent = item.detail;
      const button = document.createElement("button");
      button.type = "button";
      const purchased = owned.has(item.id);
      const equipped = rewards.equipped.includes(item.id);
      if (purchased && item.category === "builder") {
        button.textContent = equipped ? "Wearing · Take off" : "Put on";
        button.onclick = () => {
          setRewards(toggleBuilderItem(getState().rewards, item.id));
          renderShop();
          notify(
            equipped
              ? "Item removed from your Builder."
              : "Your Builder is wearing this item.",
          );
        };
      } else if (purchased) {
        const district = CITY_DISTRICTS.find(
          (d) =>
            d.id === rewards.purchases.find((p) => p.id === item.id)?.district,
        );
        button.textContent = "✓ Placed in " + (district?.short ?? "your city");
        button.disabled = true;
      } else {
        button.textContent = item.cost + " ✦ · Unlock";
        button.disabled =
          builderBalance(rewards) < item.cost ||
          (item.category === "city" && !districts.length);
        button.onclick = () => {
          const result = purchaseBuilderItem(
            getState().rewards,
            item.id,
            item.category === "city" ? select.value : null,
            availableDistricts().map((district) => district.id),
          );
          if (!result.ok) {
            notify(result.reason);
            return;
          }
          setRewards(result.rewards);
          renderShop();
          notify(
            item.category === "city"
              ? item.name + " now appears in your city!"
              : item.name + " unlocked and equipped!",
          );
          playSuccess();
        };
      }
      card.append(icon, title, detail, button);
      list.append(card);
    }
    if (category === "city" && !districts.length)
      notify("Make your first district decision before placing a decoration.");
  }
  function openShop() {
    if (!isPlaying()) return;
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
    const rating = chapterRating(pending.chapter, getState());
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
    $("celebration-impact").textContent =
      "Your choices shaped a real-looking fictional city. Look at the structures, working services and remaining needs you created.";
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
  shop.addEventListener("close", () => schedule());
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
