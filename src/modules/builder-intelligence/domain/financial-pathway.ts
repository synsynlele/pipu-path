import {
  validateBuilderPathway,
  type BuilderPathwayStage,
} from "./builder-pathway";

type StageInput = Omit<
  BuilderPathwayStage,
  "order" | "prerequisites" | "evidencePrompts" | "reflectionPrompts"
>;
const stage = (
  order: number,
  input: StageInput,
): BuilderPathwayStage => {
  return {
    ...input,
    order,
    prerequisites: order === 1 ? [] : [financialStagesKeys[order - 2]],
    evidencePrompts: [
      "What decision or small change did you actually put into use?",
      "What did you notice or check? Do not include private names or financial account data.",
    ],
    reflectionPrompts: [
      "What worked or did not work, and why?",
      "What would you change next time?",
    ],
  };
};

const financialStagesKeys = [
  "needs_wants",
  "opportunity_cost",
  "budgeting",
  "saving",
  "value_of_work",
  "honest_earning",
  "cash_flow",
  "scam_awareness",
  "responsible_borrowing",
] as const;

const commonSafety =
  "No spending, bank logins, payments, loans, public sharing or contact with strangers. Ask a trusted adult for help when needed.";

export const financialIntelligencePathway = validateBuilderPathway({
  schemaVersion: "builder-pathway-v1",
  code: "financial_intelligence",
  title: "Financial Intelligence",
  humanReviewVersion: "reviewed-2026-11",
  fallbackVersion: "fallback-v1",
  stages: [
    stage(1, {
      code: "needs_wants",
      title: "Needs and wants",
      competencies: ["Distinguish essential needs from optional wants"],
      minimumAgeBand: "under_13",
      difficulty: 1,
      resources: ["Existing everyday choices"],
      safety: commonSafety,
      city: {
        district: "market",
        scenario: "A city team has ₦5,000 to protect a community water point. A colourful banner would look exciting, but the water containers need replacing.",
        availableNaira: 5000,
        choices: [
          { id: "need", label: "Maintain essential water containers — ₦3,200", cost: 3200, consequence: "The water point stays usable and ₦1,800 remains for other needs.", tradeOff: "The banner has to wait; the practical need is met first." },
          { id: "want", label: "Buy a welcome banner — ₦4,200", cost: 4200, consequence: "Visitors see a banner, but the worn water containers still need attention.", tradeOff: "Only ₦800 remains for an urgent essential task." },
        ],
      },
      quest: {
        topic: "market",
        minutes: 15,
        focus: "I want to put a simple needs-before-wants check into one real everyday choice.",
        challenge: {
          title: "Financial Intelligence 01 — Put needs before wants",
          outcome: "Use a no-cost needs-first check in one ordinary decision and observe whether it helped.",
        }),
    stage(2, {
      code: "opportunity_cost",
      title: "Opportunity cost",
      competencies: ["Recognise what a choice means giving up"],
      minimumAgeBand: "under_13",
      difficulty: 1,
      resources: ["Existing personal routine"],
      safety: commonSafety,
      city: {
        district: "school",
        scenario: "A learning centre has ₦3,000 left. It can repair shared learning materials or pay for decorative signs.",
        availableNaira: 3000,
        choices: [
          { id: "materials", label: "Restore learning materials — ₦1,500", cost: 1500, consequence: "More learners can use the materials, and ₦1,500 stays available.", tradeOff: "Decorations are postponed in favour of everyday learning." },
          { id: "signs", label: "Add decorative signs — ₦2,700", cost: 2700, consequence: "The centre looks brighter but access to learning materials is unchanged.", tradeOff: "Only ₦300 is left to restore worn supplies." },
        ],
      },
      quest: {
        topic: "school",
        minutes: 15,
        focus: "I want to test a better use of existing time or supplies by comparing two options.",
        challenge: {
          title: "Financial Intelligence 02 — Try the better trade-off",
          outcome: "Choose between two safe uses of an existing resource and try the chosen option.",
        }),
    stage(3, {
      code: "budgeting",
      title: "Budgeting in naira",
      competencies: ["Allocate limited resources", "Avoid an unfunded plan"],
      minimumAgeBand: "under_13",
      difficulty: 1,
      resources: ["Hypothetical ₦5,000 exercise", "Normal home or school planning routine"],
      safety: commonSafety,
      city: {
        district: "transport",
        scenario: "Your city team can spend at most ₦5,000 on a community learning day. Transport and basic supplies must both be considered.",
        availableNaira: 5000,
        choices: [
          { id: "funded", label: "Transport ₦1,500 + supplies ₦3,000", cost: 4500, consequence: "The essential trip and supplies are covered, with ₦500 held back.", tradeOff: "The refreshments would need to come from existing resources." },
          { id: "unfunded", label: "Transport ₦3,000 + supplies ₦2,700", cost: 5700, consequence: "The proposal exceeds the available money by ₦700.", tradeOff: "The team must reduce or defer a cost before acting." },
        ],
      },
      quest: {
        topic: "market",
        minutes: 30,
        focus: "I want to use a hypothetical naira budget check in one real planning decision without spending.",
        challenge: {
          title: "Financial Intelligence 03 — Use a budget check",
          outcome: "Use a hypothetical ₦5,000 budget to improve a real no-spend planning conversation or routine.",
        }),
    stage(4, {
      code: "saving",
      title: "Saving and protecting resources",
      competencies: ["Set a practical reserve", "Protect scarce resources"],
      minimumAgeBand: "under_13",
      difficulty: 1,
      resources: ["An existing no-spend habit"],
      safety: commonSafety,
      city: {
        district: "power",
        scenario: "A community has ₦2,500 for the week. Keeping a reserve could help with a later power interruption.",
        availableNaira: 2500,
        choices: [
          { id: "reserve", label: "Use ₦700 for maintenance and keep a reserve", cost: 700, consequence: "The community keeps ₦1,800 available for a later disruption.", tradeOff: "A decorative upgrade is delayed to protect future service." },
          { id: "all_now", label: "Use ₦2,300 on a one-day upgrade", cost: 2300, consequence: "The visible upgrade is complete, but only ₦200 remains.", tradeOff: "A future urgent repair could be difficult to fund." },
        ],
      },
      quest: {
        topic: "technology",
        minutes: 15,
        focus: "I want to practise protecting a limited resource with one safe no-spend routine.",
        challenge: {
          title: "Financial Intelligence 04 — Protect a resource",
          outcome: "Try a real no-spend saving habit and compare its effect on a resource you already use.",
        }),
    stage(5, {
      code: "value_of_work",
      title: "The value of useful work",
      competencies: ["Recognise useful value without equating it to payment"],
      minimumAgeBand: "under_13",
      difficulty: 1,
      resources: ["Existing skill", "Familiar consenting person"],
      safety: commonSafety,
      city: {
        district: "business",
        scenario: "The city has ₦1,500 to help more people understand a confusing process. Clarity matters more than advertising.",
        availableNaira: 1500,
        choices: [
          { id: "teach", label: "Support a short skill demonstration — ₦200", cost: 200, consequence: "People learn a useful routine and ₦1,300 remains.", tradeOff: "The result depends on whether participants can actually use the skill." },
          { id: "advertise", label: "Pay for a poster campaign — ₦1,500", cost: 1500, consequence: "Awareness increases, but nobody has tested whether the skill can be used.", tradeOff: "No resources remain for practical demonstrations." },
        ],
      },
      quest: {
        topic: "school",
        minutes: 30,
        focus: "I want to give someone a useful skill demonstration and test whether it helps.",
        challenge: {
          title: "Financial Intelligence 05 — Demonstrate useful value",
          outcome: "Help a familiar consenting person use a small practical skill with no payment or selling.",
        }),
    stage(6, {
      code: "honest_earning",
      title: "Honest value exchange",
      competencies: ["Recognise fair exchange", "Avoid deceptive promises"],
      minimumAgeBand: "under_13",
      difficulty: 1,
      resources: ["Existing familiar household activity"],
      safety: commonSafety,
      city: {
        district: "market",
        scenario: "Two contractors could improve a city marketplace. One gives accurate terms; another promises too much and cuts corners.",
        availableNaira: 3000,
        choices: [
          { id: "fair", label: "Choose transparent and fair terms — ₦1,700", cost: 1700, consequence: "The scope is honest and the city can inspect the outcome.", tradeOff: "There is less money for appearance, but the work is accountable." },
          { id: "mislead", label: "Choose an unrealistic cheap promise — ₦600", cost: 600, consequence: "The scope is unclear and the work may fail people who rely on it.", tradeOff: "The short-term saving introduces ethical and quality risks." },
        ],
      },
      quest: {
        topic: "governance",
        minutes: 30,
        focus: "I want to practise a fair honest exchange of help in a familiar setting without payments.",
        challenge: {
          title: "Financial Intelligence 06 — Practise honest exchange",
          outcome: "Agree on and complete a clear, useful favour with consent, without exchanging money.",
        }),
    stage(7, {
      code: "cash_flow",
      title: "Cash-flow basics",
      competencies: ["Distinguish cash on hand from future commitments"],
      minimumAgeBand: "13_15",
      difficulty: 1,
      resources: ["Hypothetical naira scenario", "Existing planning routine"],
      safety: commonSafety,
      city: {
        district: "business",
        scenario: "The city workshop has ₦2,500 today. It must keep ₦1,800 for materials due before the next income arrives.",
        availableNaira: 2500,
        choices: [
          { id: "protect_due", label: "Fund materials due now — ₦1,800", cost: 1800, consequence: "The workshop covers the immediate obligation and retains ₦700.", tradeOff: "A new optional feature must wait until resources arrive." },
          { id: "early_upgrade", label: "Start a non-urgent upgrade — ₦1,600", cost: 1600, consequence: "Only ₦900 is available, leaving the ₦1,800 material bill unfunded.", tradeOff: "An attractive upgrade interrupts the working operation." },
        ],
      },
      quest: {
        topic: "business",
        minutes: 30,
        focus: "I want to use a fictional cash-flow timing check to improve a no-spend planning decision.",
        challenge: {
          title: "Financial Intelligence 07 — Check cash-flow timing",
          outcome: "Use a fictional timing check to improve a real resource-scheduling conversation or routine.",
        }),
    stage(8, {
      code: "scam_awareness",
      title: "Spotting suspicious offers",
      competencies: ["Spot unrealistic money claims", "Check offers safely"],
      minimumAgeBand: "13_15",
      difficulty: 1,
      resources: ["A fictional offer", "Trusted adult or existing safe device"],
      safety: commonSafety,
      city: {
        district: "technology",
        scenario: "A city supplier offers equipment at an unbelievable price and demands immediate secret payment.",
        availableNaira: 5000,
        choices: [
          { id: "verify", label: "Pause and verify through known channels — ₦0", cost: 0, consequence: "The team avoids an unverified transaction while checking facts.", tradeOff: "The purchase is delayed; no one is pressured to send money." },
          { id: "rush", label: "Send ₦4,500 immediately", cost: 4500, consequence: "The city risks losing ₦4,500 to an unverified offer.", tradeOff: "Urgency and secrecy displaced careful verification." },
        ],
      },
      quest: {
        topic: "technology",
        minutes: 15,
        focus: "I want to put a safe verification habit into use before trusting suspicious money claims.",
        challenge: {
          title: "Financial Intelligence 08 — Use a scam-safety check",
          outcome: "Practise a no-click scam-safety check in an existing trusted learning activity.",
        }),
    stage(9, {
      code: "responsible_borrowing",
      title: "Borrowing decisions and risk",
      competencies: ["Recognise repayment obligations", "Prefer safe alternatives to debt"],
      minimumAgeBand: "18_24",
      difficulty: 1,
      resources: ["Fictional borrowing scenario", "Existing planning routine"],
      safety: commonSafety,
      city: {
        district: "business",
        scenario: "A city group wants an expansion but cannot responsibly repay a proposed loan. It has ₦10,000 available for current work.",
        availableNaira: 10000,
        choices: [
          { id: "scale_down", label: "Improve the small existing operation — ₦3,200", cost: 3200, consequence: "The group protects essential work and keeps ₦6,800 available.", tradeOff: "Growth is slower, but no unsupported repayment promise is made." },
          { id: "debt_risk", label: "Commit ₦9,800 before reviewing repayment", cost: 9800, consequence: "Almost all current resources are committed without a credible plan for later obligations.", tradeOff: "The expansion creates avoidable cash-flow and repayment risk." },
        ],
      },
      quest: {
        topic: "business",
        minutes: 30,
        focus: "I want to test a no-debt decision checklist on a fictional case before a real planning choice.",
        challenge: {
          title: "Financial Intelligence 09 — Practise a no-debt check",
          outcome: "Use a fictional repayment-risk checklist to improve one safe everyday planning routine.",
        }),
  ],
});

export function getFinancialStage(code: unknown) {
  if (typeof code !== "string") return null;
  return financialIntelligencePathway.stages.find((item) => item.code === code) ?? null;
}
