// Every chapter presents two different simulation challenges, not renamed
// versions of the same pipe or supply-switch exercise. Entirely fictional.
export const ADVANCED_CHAPTERS = [
  { number: 5, title: "Repair and Upgrade", missions: [
    { id:"investigate-clinic",title:"Find the real cause",district:"health",kind:"evidence",
      brief:"After rainfall, clinic water smells strange. Identify TWO findings that actually explain the risk. Popular complaints are not always evidence.",
      prompt:"Inspect the evidence and select the two causes you would investigate first.",
      labels:["Rainwater leaks into a cracked storage tank","The clinic entrance sign looks old","Disinfection records are missing for two deliveries","A new nurse joined the team","The waiting room needs fresh paint"],causes:[0,2],
      diagnosis:"Follow evidence to its source, rather than replacing everything.",answerOptions:["Replace all equipment without investigation","Follow evidence to its source, rather than replacing everything","Ignore the test results"] },
    { id:"pump-sequence",title:"Repair the pump without hurting anyone",district:"workshop",kind:"sequence",
      brief:"The neighbourhood pump has failed. Plan a safe restoration before residents use it again.",
      prompt:"Put the four actions in their correct order.",
      labels:["Test water quality before reopening","Isolate the power and warn users","Inspect the fault with trained maintenance staff","Fix the verified problem and clean the system"],order:[1,2,3,0],initial:[3,0,2,1],
      diagnosis:"Make the system safe, investigate, repair, then test.",answerOptions:["Restart first, investigate later","Make the system safe, investigate, repair, then test","Replace every pipe immediately"] },
  ]},
  { number: 6, title: "A Growing City", missions: [
    { id:"site-homes",title:"Place new homes above floodwater",district:"housing",kind:"site",
      brief:"New residents need homes and a safe route to school. The cheapest land is flooded every rainy season.",
      prompt:"Choose a home plot and an accessible school meeting point on this 3 × 3 town map.",
      labels:["High ridge","Safe avenue","Dry junction","Flood basin","Town square","School road","River edge","Old depot","Quiet park"],roles:["New homes","School meeting point"],
      safe:[[0,1,2,4],[1,2,4,5]],maxDistance:2,
      diagnosis:"Check flood risk and walking distance before you build.",answerOptions:["Build on the flooded riverbank","Choose the cheapest land only","Check flood risk and walking distance before you build"] },
    { id:"schedule-services",title:"Organise the morning transport rush",district:"transport",kind:"schedule",
      brief:"Two routes share a single narrow loading bay. Time each visit to prevent dangerous queues, while the school and clinic remain on time.",
      prompt:"Assign one time slot per service. The loading bay cannot handle two at once.",
      labels:["School bus","Clinic shuttle","Market delivery","Repair van"],slots:["07:00","07:30","08:00","08:30"],deadlines:[0,1,3,3],
      diagnosis:"Schedule urgent trips first and prevent crowding.",answerOptions:["Send every vehicle together","Schedule urgent trips first and prevent crowding","Cancel the clinic shuttle"] },
  ]},
  { number: 7, title: "Connected Crises", missions: [
    { id:"storm-response",title:"Make decisions during a city storm",district:"health",kind:"scenario",
      brief:"Three urgent reports arrive. Each response changes whether people get help before damage spreads.",
      prompt:"For each report, pick the immediate action that best protects people.",
      rounds:[
        {event:"A family is trapped beside rising water.",options:["Move them to higher, safe ground","Protect the market's decorative sign","Ask them to wait until the road reopens"],safe:0},
        {event:"The clinic's backup supply is failing.",options:["Post an announcement on social media","Activate emergency clinical support and backup","Close the clinic without redirecting patients"],safe:1},
        {event:"A blocked road delays emergency access.",options:["Paint lane markings tomorrow","Hold a meeting next week","Clear a safe emergency corridor with trained staff"],safe:2}],
      diagnosis:"Act on threats to life first, then stabilise services.",answerOptions:["Protect the decorations","Act on threats to life first, then stabilise services","Wait until every incident stops"] },
    { id:"rescue-harvest",title:"Save the market's harvest",district:"market",kind:"inventory",
      brief:"Twelve crates arrived ahead of market day. Sell what people can use, preserve some and direct surplus to community kitchens.",
      prompt:"Share the twelve crates before the fresh produce spoils.",
      labels:["Sell today","Preserve safely","Share with community kitchens"],available:12,minimum:[4,2,2],maximum:[7,5,4],reserve:1,
      diagnosis:"Balance today's demand, storage and community needs.",answerOptions:["Store everything without cooling","Discard the older produce","Balance today's demand, storage and community needs"] },
  ]},
  { number: 8, title: "Build for Everyone", missions: [
    { id:"accessible-school",title:"Remove the barriers to learning",district:"school",kind:"access",
      brief:"Learners report three barriers: steps, difficult text and language. Your improvement budget is limited.",
      prompt:"Choose improvements that cover all three needs without exceeding 7 units.",
      options:[
        {name:"Step-free entrance",cost:3,covers:["mobility"]},
        {name:"Plain-language visual guides",cost:2,covers:["reading"]},
        {name:"Bilingual support and demonstrations",cost:2,covers:["language"]},
        {name:"A decorative banner",cost:2,covers:[]},
        {name:"Premium office chairs",cost:4,covers:[]},
        {name:"Group demonstrations",cost:2,covers:["reading","language"]}],
      needs:["mobility","reading","language"],budget:7,
      diagnosis:"Remove barriers based on who cannot participate.",answerOptions:["Require learners to adapt alone","Remove barriers based on who cannot participate","Spend everything on decoration"] },
    { id:"zoning-tradeoff",title:"Plan a healthier neighbourhood",district:"housing",kind:"zoning",
      brief:"A noisy industrial road, housing blocks, a school and public space compete for limited land. Place a clinic and a small park away from the flood zone.",
      prompt:"Choose safe plots for the clinic and park. The clinic should remain close to residents.",
      labels:["Homes","Homes","Road junction","Flood basin","Community centre","School","River edge","Industrial yard","Quiet courtyard"],
      roles:["Clinic","Neighbourhood park"],allowed:[[0,1,4,5],[1,4,5,8]],forbiddenPair:[[5,5]],maxDistance:2,
      diagnosis:"Balance safe access, green space and exposure to hazards.",answerOptions:["Place everything beside heavy industry","Balance safe access, green space and exposure to hazards","Use the flood basin as a clinic"] },
  ]},
  { number: 9, title: "Use Less, Serve More", missions: [
    { id:"circular-city",title:"Turn waste into something useful",district:"industry",kind:"sorting",
      brief:"Your city's repair centre receives mixed discarded materials. Different materials need different recovery methods.",
      prompt:"Sort each item to repair/reuse, compost or safe disposal.",
      labels:["Broken chair with reusable wood","Vegetable peels","Damaged phone battery","Reusable glass jars","Dry leaves"],
      bins:["Repair or reuse","Compost","Safe disposal"],correct:[0,1,2,0,1],
      diagnosis:"Choose recovery based on material and risk.",answerOptions:["Burn all rubbish","Choose recovery based on material and risk","Throw every material in the same bin"] },
    { id:"power-shift",title:"Keep energy available through peak hours",district:"power",kind:"energy",
      brief:"The city has limited clean power. Spread available energy between morning clinics, market cooling and evening learning instead of causing another outage.",
      prompt:"Choose how much power each period receives. Keep at least one unit in reserve.",
      labels:["Morning care","Daytime cooling","Evening learning","Night-time safety"],minimum:[2,3,2,1],maximum:[4,5,4,3],budget:11,reserve:1,
      diagnosis:"Protect essential loads while leaving a safety margin.",answerOptions:["Use the whole budget before nightfall","Protect essential loads while leaving a safety margin","Give every unit to decorative lights"] },
  ]},
  { number: 10, title: "Lead Through Pressure", missions: [
    { id:"community-budget",title:"Choose what the city can afford",district:"business",kind:"portfolio",
      brief:"The council has 9 investment units and many requests. Fund a combination that improves health, access and livelihoods, not just the most visible building.",
      prompt:"Pick investments that fit the budget and address at least three distinct community needs.",
      options:[
        {name:"Clinic medicine storage",cost:3,covers:["health"]},
        {name:"Safe school crossing",cost:2,covers:["access"]},
        {name:"Market stall repairs",cost:3,covers:["livelihood"]},
        {name:"Fresh paint for mayor's office",cost:3,covers:[]},
        {name:"Shared clean-water points",cost:4,covers:["health","access"]},
        {name:"Worker training",cost:2,covers:["livelihood"]}],
      needs:["health","access","livelihood"],budget:9,
      diagnosis:"Measure public benefit, not how impressive a project looks.",answerOptions:["Fund only the biggest monument","Measure public benefit, not how impressive a project looks","Spend everything on advertising"] },
    { id:"stakeholder-negotiation",title:"Resolve a conflict over public space",district:"governance",kind:"negotiation",
      brief:"Market traders, families and cyclists disagree over a road redesign. Find a workable agreement that keeps emergency access.",
      prompt:"Respond to three stakeholders. Avoid choices that silence or endanger a group.",
      rounds:[
        {event:"Traders fear losing delivery access.",options:["Move them away without discussion","Agree timed delivery windows with traders","Remove emergency vehicle access"],safe:1},
        {event:"Parents need a safe school crossing.",options:["Plan a marked crossing and traffic calming","Tell children to run across quickly","Close all shops permanently"],safe:0},
        {event:"Cyclists need safe travel.",options:["Ignore anyone without a car","Use the emergency lane as parking","Mark a protected cycle route without blocking ambulances"],safe:2}],
      diagnosis:"Negotiate fair access without trading away safety.",answerOptions:["Choose the loudest group only","Negotiate fair access without trading away safety","Cancel public consultation"] },
  ]},
  { number: 11, title: "Design for Reliability", missions: [
    { id:"risk-preparedness",title:"Prepare for three different disasters",district:"health",kind:"risk",
      brief:"Heavy rain, extreme heat and power interruptions each threaten the city in a different way. Choose prevention matched to each hazard.",
      prompt:"Pair each hazard with the protection that actually reduces its impact.",
      rounds:[
        {event:"Flash flooding near homes",options:["Improve drainage and create safe evacuation routes","Build new homes in the riverbed","Paint warning signs only"],safe:0},
        {event:"Severe heat affecting older residents",options:["Close every shaded public space","Provide cooling spaces, drinking water and check-ins","Increase the price of water"],safe:1},
        {event:"Clinic power failure",options:["Keep one untested extension cable","Assume the grid returns immediately","Test essential backup power and emergency care procedures"],safe:2}],
      diagnosis:"Different threats need different, tested protections.",answerOptions:["One fix will solve every disaster","Different threats need different, tested protections","Wait until after a disaster to plan"] },
    { id:"repair-triage",title:"Send the right repair teams",district:"workshop",kind:"crews",
      brief:"A pump, school crossing and phone mast need attention. Assign each of three specialists to the correct task to avoid unsafe repairs.",
      prompt:"Match each repair with a capable team and ensure every urgent job has someone qualified.",
      jobs:["Pump safety","School crossing","Communications mast"],
      crews:["Water engineer","Road safety team","Electrical technician"],correct:[0,1,2],
      diagnosis:"Match competence to the hazard, not speed alone.",answerOptions:["Send whoever is closest to every job","Match competence to the hazard, not speed alone","Leave the pump energised during repair"] },
  ]},
  { number: 12, title: "The Final Challenge", missions: [
    { id:"population-forecast",title:"Plan for the next wave of families",district:"market",kind:"forecast",
      brief:"Three districts are growing at different rates. Forecast needs for the next term so families have services without wasting the budget.",
      prompt:"Estimate each district's additional needs from its recent trend. Plans close to the trend protect stock and prevent shortages.",
      labels:["Growing homes","School enrolment","Market demand"],history:[[2,3,4],[1,2,3],[3,3,4]],expected:[5,4,5],tolerance:1,
      diagnosis:"Use actual trends and preserve flexibility.",answerOptions:["Assume there will be no new residents","Use actual trends and preserve flexibility","Double every facility without data"] },
    { id:"whole-city-builder",title:"Build a city that can withstand tomorrow",district:"transport",kind:"capstone",
      brief:"Your final decisions face heat, flooding, limited funds and unequal service access. Assemble a practical city-wide plan and test how it protects people.",
      prompt:"Choose a city package within 11 units. Your actions must protect health, safe movement, food and emergency readiness.",
      options:[
        {name:"Clinic emergency backup",cost:3,covers:["health","readiness"]},
        {name:"Flood-safe walking routes",cost:3,covers:["mobility","readiness"]},
        {name:"Market cold-storage co-op",cost:3,covers:["food"]},
        {name:"Rainwater harvesting network",cost:3,covers:["food","health"]},
        {name:"Neighbourhood response volunteers",cost:2,covers:["readiness","mobility"]},
        {name:"Promotional city monument",cost:5,covers:[]},
        {name:"Repairable solar street lighting",cost:2,covers:["mobility"]},
        {name:"Community clinic outreach",cost:2,covers:["health"]}],
      needs:["health","mobility","food","readiness"],budget:11,
      diagnosis:"Balance resilience, inclusion and the public budget.",answerOptions:["Spend everything on one landmark","Balance resilience, inclusion and the public budget","Ignore the poorest districts"] },
  ]},
];
export const ADVANCED_MISSIONS = ADVANCED_CHAPTERS.flatMap((chapter) =>
  chapter.missions.map((m, within) => ({
    ...m, chapter:chapter.number,chapterTitle:chapter.title,index:(chapter.number - 5)*2 + within,
    answers:m.answerOptions, // retained compatibility with chapter review and test helpers
  })),
);
export function challengeAt(index) { return ADVANCED_MISSIONS[index] ?? null; }
export function initialChallengePlan(m) {
  if (!m) return [];
  switch(m.kind) {
    case "sequence": return [...m.initial];
    case "evidence": case "access": case "portfolio": case "capstone": return Array((m.labels ?? m.options).length).fill(0);
    case "site": case "zoning": return [-1,-1];
    case "schedule": case "crews": return Array(m.labels?.length ?? m.jobs.length).fill(-1);
    case "scenario": case "negotiation": case "risk": return Array(m.rounds.length).fill(-1);
    case "inventory": case "energy": return Array(m.labels.length).fill(0);
    case "sorting": return Array(m.labels.length).fill(-1);
    case "forecast": return Array(m.labels.length).fill(0);
    default: return [];
  }
}
