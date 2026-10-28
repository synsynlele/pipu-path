import { CASE_BUILD_SITES, visualTone } from "./feedback.mjs";
import { getChoice } from "./cases.mjs";
import { OUTER_DISTRICTS } from "./districts.mjs";
import {
  infrastructurePlan,
  constructInfrastructure,
} from "./infrastructure.mjs";

export function createCaseSceneEffects({ T, scene, box, cyl, mat }) {
  const effects = new Map();
  const palette = { improving: 0x6bab85, mixed: 0xe0bd65, strained: 0xcf7963 };
  function build(spec) {
    const group = new T.Group();
    group.position.set(spec.x, 0.12, spec.z);
    group.userData.ignoreNavigation = true;
    scene.add(group);
    const outer = OUTER_DISTRICTS.some((d) => d.id === spec.district);
    const variants = new Map();
    const light = box(
      outer ? 4.6 : 1.2,
      0.07,
      0.1,
      0x709e7b,
      0,
      0.08,
      outer ? 2 : 0.6,
      group,
    );
    light.userData.ignoreNavigation = true;
    const buildChoice = (caseId, choiceId) => {
      const plan = infrastructurePlan(caseId, choiceId);
      const variant = new T.Group();
      variant.userData.plan = plan;
      variant.userData.pieces = constructInfrastructure({
        plan,
        T,
        box,
        cyl,
        mat,
        parent: variant,
        scale: outer ? 2 : 1,
      });
      variant.visible = false;
      group.add(variant);
      variants.set(choiceId, variant);
    };
    group.visible = false;
    return { group, light, variants, buildChoice, choiceId: null, started: 0 };
  }
  for (const [id, spec] of Object.entries(CASE_BUILD_SITES))
    effects.set(id, build(spec));
  function sync(decisions, preview = null) {
    for (const [id, effect] of effects) {
      const choiceId =
        preview?.caseId === id ? preview.choiceId : decisions[id];
      if (effect.choiceId !== choiceId) effect.started = performance.now();
      effect.choiceId = choiceId;
      effect.plan = infrastructurePlan(id, choiceId);
      effect.group.visible = Boolean(effect.plan?.assets.length);
      if (choiceId && !effect.variants.has(choiceId))
        effect.buildChoice(id, choiceId);
      for (const [variantId, variant] of effect.variants)
        variant.visible = variantId === choiceId;
      if (choiceId)
        effect.light.material = mat(
          palette[visualTone(getChoice(id, choiceId))],
        );
    }
  }
  function setTone(id, option) {
    if (effects.has(id) && option)
      effects.get(id).light.material = mat(palette[visualTone(option)]);
  }
  function setFocus(focus, overview = false, range = 30) {
    for (const effect of effects.values())
      effect.group.visible =
        Boolean(effect.plan?.assets.length) &&
        (overview ||
          !focus ||
          Math.hypot(
            effect.group.position.x - focus.x,
            effect.group.position.z - focus.z,
          ) < range);
  }
  function animate(now, reducedMotion) {
    for (const effect of effects.values()) {
      if (!effect.group.visible) continue;
      const variant = effect.variants.get(effect.choiceId);
      const pieces = variant.userData.pieces;
      const progress = reducedMotion
        ? 1
        : Math.max(0, Math.min(1, (now - effect.started) / 1400));
      // Components assemble in height order: foundation, walls, equipment, roof.
      pieces.forEach((piece, index) => {
        piece.visible = progress >= index / pieces.length;
      });
    }
  }
  return { sync, setTone, setFocus, animate, effects };
}
