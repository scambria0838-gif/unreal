export type Service = {
  slug: string;
  title: string;
  group: "core" | "residential" | "commercial";
  eyebrow: string;
  summary: string;
  problem: string;
  approach: string[];
  who: string;
  cta: { href: string; label: string };
  related: string[];
  faqs: { q: string; a: string }[];
};

export const coreServices: Service[] = [
  {
    slug: "red-tag-rescue",
    title: "Red-tag and stop-work resolution",
    group: "core",
    eyebrow: "Project rescue",
    summary:
      "When the city posts a red tag or stop-work order, the property does not need another guess. It needs a plan the jurisdiction can accept.",
    problem:
      "A notice of violation or stop-work order means cited work must stop. Owners often tear things out, keep building, or hire the first person who promises to 'talk to the inspector.' That usually makes the file worse.",
    approach: [
      "Read the notice and identify the actual violation — not the rumor about the violation.",
      "Establish what was built, what was permitted, and what the current drawings show.",
      "Determine the likely permit, plan, and inspection path in that municipality.",
      "Coordinate drawings or engineering if the city will not review without them.",
      "Prepare the project for recheck — then get the work back into a legal sequence.",
    ],
    who: "Homeowners, investors, and commercial owners who have been contacted by the city or found a red tag on the property.",
    cta: { href: "/review?focus=red-tag", label: "Start my red-tag review" },
    related: ["permits", "plans-drawings", "project-rescue", "code-compliance"],
    faqs: [
      {
        q: "Should I keep working after a red tag?",
        a: "No. Continuing cited work can turn a permit problem into a citation. Stop the cited work and get the notice reviewed before anyone returns to the job.",
      },
      {
        q: "Can you guarantee the city will lift the order?",
        a: "No. Requirements differ by jurisdiction and by the work in place. JLS builds the path and coordinates the file. The municipality decides when the order is released.",
      },
    ],
  },
  {
    slug: "permits",
    title: "Permit acquisition and coordination",
    group: "core",
    eyebrow: "Permits",
    summary:
      "Residential, commercial, remodel, addition, ADU, and tenant-improvement permits — coordinated against the city that will actually review them.",
    problem:
      "People apply for the wrong permit, submit incomplete drawings, or start work while the application sits. The delay is rarely the fee. It is the missing piece the reviewer will not ignore.",
    approach: [
      "Define the real scope — not the scope someone hoped would avoid review.",
      "Identify the jurisdiction and the portals, affidavits, and trade permits that apply.",
      "Coordinate construction documents the reviewer can actually use.",
      "Track comments, revisions, and inspection sequencing after issuance.",
    ],
    who: "Owners who need a permit pulled correctly the first time — or a stalled application unstuck.",
    cta: { href: "/review?focus=permit", label: "Get permit help" },
    related: ["plans-drawings", "code-compliance", "owner-builder-consulting"],
    faqs: [
      {
        q: "Do all remodels need a permit in Arizona?",
        a: "No. Cosmetic work may not. Structural, electrical, plumbing, mechanical, additions, and occupancy changes usually do. The city — not the contractor's opinion — decides.",
      },
      {
        q: "Can JLS pull a permit in every Arizona city?",
        a: "JLS works across Arizona. Each municipality has its own portal, forms, and review culture. The first question is always which city or county holds the property.",
      },
    ],
  },
  {
    slug: "plans-drawings",
    title: "Construction drawings, CAD, and as-builts",
    group: "core",
    eyebrow: "Plans",
    summary:
      "Cities review drawings. Inspectors inspect against drawings. If the plans are wrong, missing, or fictional, the project will stall.",
    problem:
      "Unpermitted rooms, additions built from a napkin, and commercial TIs with a furniture plan instead of a construction set all fail the same way: there is nothing the city can stamp.",
    approach: [
      "Establish what exists on the property — as-builts when the original set is gone.",
      "Produce or coordinate CAD construction drawings for the required scope.",
      "Bring in engineering when the jurisdiction or the structure requires it.",
      "Keep the drawing set aligned with the permit and the field.",
    ],
    who: "Owners who need a set the city will review, or a record of what was actually built.",
    cta: { href: "/review?focus=drawings", label: "Discuss my drawings" },
    related: ["permits", "construction-consulting", "code-compliance"],
    faqs: [
      {
        q: "What is an as-built drawing?",
        a: "A drawing that records the building as it exists — not as someone once intended. Cities often require as-builts when work was done without a current approved set.",
      },
    ],
  },
  {
    slug: "owner-builder-consulting",
    title: "Owner-builder consulting",
    group: "core",
    eyebrow: "Consulting",
    summary:
      "Keep control of your project. Put a general contractor's experience in your corner for permits, sequencing, subcontractors, and inspections.",
    problem:
      "Qualified owners sometimes do not want to hand an entire job to a traditional GC. The exemption exists in Arizona. The city, the trades, and the inspection sequence still do. Owners who skip that reality pay for it in change orders and failed inspections.",
    approach: [
      "Clarify whether owner-builder is even available for your property and intent.",
      "Map permits, drawings, and inspection hold-points before you hire trades.",
      "Help you read subcontractor scopes the way a GC would.",
      "Stay in the room for construction decisions that are expensive to reverse.",
    ],
    who: "Owners who will occupy the property and want control — with someone who has built from both sides of the table.",
    cta: {
      href: "/review?focus=owner-builder",
      label: "Talk to John about owner-builder consulting",
    },
    related: ["construction-consulting", "permits", "project-rescue"],
    faqs: [
      {
        q: "Will consulting save me money?",
        a: "It can reduce expensive mistakes. It is not a promise of savings. Owner-builder work still costs what the trades, materials, and city require.",
      },
      {
        q: "Is owner-builder legal in Arizona?",
        a: "Certain owners may qualify for a licensing exemption under A.R.S. § 32-1121. Conditions apply, including occupancy and sale/rental restrictions. John can help you understand the construction side. He is not your attorney.",
      },
    ],
  },
  {
    slug: "construction-consulting",
    title: "Construction consulting",
    group: "core",
    eyebrow: "Consulting",
    summary:
      "A clear-eyed read on a stuck, disputed, or about-to-start project — from someone who understands field work and municipal process.",
    problem:
      "Owners get advice from people who only see one slice: the architect, the trade, the city comment, or the contractor's bid. Someone has to put the slices back together.",
    approach: [
      "Review the documents you already have — permits, plans, emails, notices.",
      "Walk the problem, not the sales pitch.",
      "Separate what the city will require from what a contractor prefers.",
      "Give you a next step you can act on.",
    ],
    who: "Homeowners, investors, developers, and business owners who want a second brain before the next check is written.",
    cta: { href: "/review?focus=consult", label: "Schedule consultation" },
    related: ["owner-builder-consulting", "second-opinion", "project-rescue"],
    faqs: [
      {
        q: "Is this the same as hiring JLS to build?",
        a: "No. Consulting can stand alone. If the project later needs contracting, that is a separate conversation.",
      },
    ],
  },
  {
    slug: "project-rescue",
    title: "Unfinished and unpermitted project rescue",
    group: "core",
    eyebrow: "Rescue",
    summary:
      "Contractor gone. Work half-done. Previous owner built without permits. The file and the field no longer match.",
    problem:
      "Rescue jobs fail when someone starts finishing cosmetics before they reconstruct the approval path. The city will not sign off a pretty room that was never legal.",
    approach: [
      "Rebuild the paper trail: permit, plans, inspections, complaints.",
      "Document what is in the field.",
      "Decide what can be permitted, what must be corrected, and what must be opened up.",
      "Coordinate the trades and the city until the project can move again.",
    ],
    who: "Buyers of distressed properties, owners of abandoned jobs, and anyone who inherited someone else's construction problem.",
    cta: { href: "/review?focus=rescue", label: "Request project review" },
    related: ["red-tag-rescue", "permits", "plans-drawings"],
    faqs: [
      {
        q: "Can unpermitted work always be legalized?",
        a: "No. Some work cannot meet current code without major reconstruction. The honest answer comes after the property and the jurisdiction are reviewed.",
      },
    ],
  },
  {
    slug: "code-compliance",
    title: "Code compliance and inspector coordination",
    group: "core",
    eyebrow: "Compliance",
    summary:
      "Code is not a personality conflict with an inspector. It is a set of adopted requirements — plus the way that city enforces them.",
    problem:
      "Owners treat a failed inspection as an argument. Inspectors treat it as a list. The list is what gets the project moving.",
    approach: [
      "Translate the correction notice into work that can actually be completed.",
      "Coordinate rechecks instead of hoping the same condition passes twice.",
      "Keep the conversation with the city factual and documented.",
    ],
    who: "Anyone staring at a correction list they do not fully understand.",
    cta: { href: "/review?focus=compliance", label: "Get a second opinion" },
    related: ["permits", "red-tag-rescue", "construction-consulting"],
    faqs: [
      {
        q: "Will John call the inspector for me?",
        a: "When it helps the file, yes. The goal is a clean inspection path — not a confrontation.",
      },
    ],
  },
];

export const residentialServices: Service[] = [
  {
    slug: "custom-homes",
    title: "Custom homes",
    group: "residential",
    eyebrow: "Residential",
    summary:
      "Custom residential construction treated as a permit path, a structural sequence, and a finished house — not a mood board.",
    problem:
      "Custom homes stall when design, engineering, and the city are not in the same conversation. Fire sprinklers, drainage, and energy compliance show up late and expensive.",
    approach: [
      "Align the design intent with what the jurisdiction will actually permit.",
      "Sequence trades the way inspections will be called.",
      "Keep the field matched to the approved set.",
    ],
    who: "Owners building a home they intend to occupy — or who want consulting while they keep more control.",
    cta: { href: "/review?focus=build", label: "Discuss my build" },
    related: ["new-construction", "owner-builder-consulting", "permits"],
    faqs: [
      {
        q: "Do you only build luxury homes?",
        a: "JLS is built for complicated residential work. Complexity — not a price tag — is the filter.",
      },
    ],
  },
  {
    slug: "new-construction",
    title: "New construction",
    group: "residential",
    eyebrow: "Residential",
    summary:
      "Ground-up residential construction with the municipal and inspection sequence designed in from the start.",
    problem:
      "New construction fails finals because someone skipped a required inspection months earlier. You cannot inspect a trench after the slab is poured.",
    approach: [
      "Confirm zoning, overlays, and submittal requirements before mobilization.",
      "Hold the inspection sequence. Do not bury work that has to be seen.",
      "Close the job against the approved documents.",
    ],
    who: "Owners and investors starting from dirt, not from an existing floor plan.",
    cta: { href: "/review?focus=build", label: "Discuss my build" },
    related: ["custom-homes", "permits", "guest-houses-adus"],
    faqs: [],
  },
  {
    slug: "whole-home-remodeling",
    title: "Whole-home remodeling",
    group: "residential",
    eyebrow: "Residential",
    summary:
      "Whole-house work is where hidden structure, old unpermitted rooms, and city thresholds collide.",
    problem:
      "A 'full remodel' often triggers drawings, energy, and sometimes fire-sprinkler conversations the owner never budgeted. Opening everything at once without a permit plan is how whole-home jobs become rescue jobs.",
    approach: [
      "Define what is cosmetic and what will be reviewed.",
      "Hunt for previous unpermitted work before it becomes the city's surprise.",
      "Permit and sequence the job so inspections can be called in order.",
    ],
    who: "Owners taking a house down to the decisions that matter.",
    cta: { href: "/review?focus=remodel", label: "Discuss my remodel" },
    related: ["kitchen-remodeling", "bathroom-remodeling", "structural-changes"],
    faqs: [],
  },
  {
    slug: "additions",
    title: "Additions",
    group: "residential",
    eyebrow: "Residential",
    summary:
      "Adding space is new construction attached to an old house — with all of the permit and structural consequences that implies.",
    problem:
      "Additions get red-tagged when someone treats them like a patio cover. Setbacks, lot coverage, structure, and utility capacity all get reviewed.",
    approach: [
      "Check the lot and the jurisdiction before the footprint is romanticized.",
      "Coordinate structure and the existing house — not just the new rooms.",
      "Permit the addition as the city will classify it.",
    ],
    who: "Owners who need more house without buying another one.",
    cta: { href: "/review?focus=remodel", label: "Discuss my addition" },
    related: ["guest-houses-adus", "structural-changes", "permits"],
    faqs: [],
  },
  {
    slug: "kitchen-remodeling",
    title: "Kitchen remodeling",
    group: "residential",
    eyebrow: "Residential",
    summary:
      "Kitchens look like finish work. They are often electrical, plumbing, mechanical, and sometimes structural work wearing cabinet doors.",
    problem:
      "Moving a sink, opening a wall, or changing a range hood can require a permit the cabinet quote never mentioned. That is how kitchen jobs get stopped mid-demo.",
    approach: [
      "Separate finish from the work the city will want to see.",
      "Permit the trades that actually change the house.",
      "Keep the inspection path from getting buried behind new stone.",
    ],
    who: "Owners remodeling a kitchen who want the job to finish — and to survive a future sale.",
    cta: { href: "/review?focus=remodel", label: "Discuss my kitchen" },
    related: ["bathroom-remodeling", "whole-home-remodeling", "permits"],
    faqs: [],
  },
  {
    slug: "bathroom-remodeling",
    title: "Bathroom remodeling",
    group: "residential",
    eyebrow: "Residential",
    summary:
      "Bathrooms concentrate plumbing, waterproofing, ventilation, and accessibility into the smallest room in the house.",
    problem:
      "A bath remodel done without the right inspections is a future leak and a future title problem. Moving fixtures is not 'just tile.'",
    approach: [
      "Identify fixture moves and wet-wall work that will be reviewed.",
      "Coordinate the trade permits the city requires.",
      "Do not cover work an inspector still needs to see.",
    ],
    who: "Owners remodeling one bath or several.",
    cta: { href: "/review?focus=remodel", label: "Discuss my bathroom" },
    related: ["kitchen-remodeling", "whole-home-remodeling"],
    faqs: [],
  },
  {
    slug: "guest-houses-adus",
    title: "Guest houses and ADUs",
    group: "residential",
    eyebrow: "Residential",
    summary:
      "Accessory dwellings are popular. They are also a zoning, utility, and permit problem if treated like a shed with a kitchen.",
    problem:
      "Arizona cities differ on ADUs, casitas, and guest houses. Parking, setbacks, separate utilities, and fire access show up as soon as someone calls it livable.",
    approach: [
      "Confirm what the specific city allows on that lot.",
      "Permit the structure as an accessory dwelling if that is what it is.",
      "Coordinate drawings and inspections as a small house — because that is how the city will see it.",
    ],
    who: "Owners adding a casita, guest house, or ADU in a metro-Phoenix or Arizona market.",
    cta: { href: "/review?focus=build", label: "Discuss my ADU" },
    related: ["additions", "permits", "new-construction"],
    faqs: [],
  },
  {
    slug: "structural-changes",
    title: "Structural changes",
    group: "residential",
    eyebrow: "Residential",
    summary:
      "Removing a wall, opening a room, or changing a roof is engineering and a permit — not a weekend decision.",
    problem:
      "Load-bearing is not a vibe. Opening a wall without knowing the load path is how remodelers create the next red tag.",
    approach: [
      "Establish what is carrying what.",
      "Coordinate engineering when the jurisdiction or the structure requires it.",
      "Permit and inspect the structural work before finishes hide it.",
    ],
    who: "Owners changing the bones of the house.",
    cta: { href: "/review?focus=drawings", label: "Get a structural review" },
    related: ["plans-drawings", "whole-home-remodeling", "additions"],
    faqs: [],
  },
  {
    slug: "project-completion",
    title: "Project completion and rescue",
    group: "residential",
    eyebrow: "Residential",
    summary:
      "Finish the house someone else started — or stop the bleeding on a job that has gone sideways.",
    problem:
      "Completion is not 'send a new crew.' It is reconstructing the approved scope and the remaining inspections.",
    approach: [
      "Audit the file and the field.",
      "Identify what can be finished versus what must be corrected.",
      "Get the remaining sequence moving.",
    ],
    who: "Owners of incomplete residential work.",
    cta: { href: "/review?focus=rescue", label: "Request project review" },
    related: ["project-rescue", "red-tag-rescue", "whole-home-remodeling"],
    faqs: [],
  },
  {
    slug: "renovations",
    title: "Renovations",
    group: "residential",
    eyebrow: "Residential",
    summary:
      "Renovation is the broad word owners use. The city will use a more specific one — alteration, addition, repair — and that word decides the review.",
    problem:
      "Calling everything a renovation hides the permit question. JLS names the work the way the jurisdiction will name it.",
    approach: [
      "Classify the work before anyone prices it.",
      "Permit what requires a permit.",
      "Keep the renovation from becoming an enforcement file.",
    ],
    who: "Owners improving an existing house with more than paint.",
    cta: { href: "/review?focus=remodel", label: "Discuss my renovation" },
    related: ["whole-home-remodeling", "permits", "construction-consulting"],
    faqs: [],
  },
];

export const commercialServices: Service[] = [
  {
    slug: "renovations",
    title: "Commercial renovations",
    group: "commercial",
    eyebrow: "Commercial",
    summary:
      "Commercial renovation is occupancy, exiting, accessibility, and a building official — with finishes coming last.",
    problem:
      "Owners budget a refresh and discover they triggered a change of occupancy or an accessibility upgrade. That is a coordination problem, not a tile problem.",
    approach: [
      "Establish occupancy, construction type, and what the renovation actually changes.",
      "Coordinate the drawings and the permit path before demolition.",
      "Keep inspectors, designers, and trades on the same set.",
    ],
    who: "Property owners, tenants, and developers renovating existing commercial space.",
    cta: { href: "/review?focus=commercial", label: "Discuss my commercial project" },
    related: ["tenant-improvements", "permit-consulting", "code-compliance"],
    faqs: [],
  },
  {
    slug: "tenant-improvements",
    title: "Tenant improvements",
    group: "commercial",
    eyebrow: "Commercial",
    summary:
      "A TI is a permitted alteration of a suite. Furniture plans and weekend labor are not a substitute.",
    problem:
      "Lease dates do not impress plan review. Incomplete TI sets, missing accessibility, and mechanical leftover from the last tenant are why openings slip.",
    approach: [
      "Read the lease scope against what the city will require.",
      "Coordinate the TI set, trades, and inspections.",
      "Treat the certificate of occupancy — or the equivalent sign-off — as the finish line.",
    ],
    who: "Tenants and landlords who need a suite opened legally.",
    cta: { href: "/review?focus=commercial", label: "Discuss my TI" },
    related: ["build-outs", "permit-consulting", "plan-coordination"],
    faqs: [],
  },
  {
    slug: "build-outs",
    title: "Build-outs",
    group: "commercial",
    eyebrow: "Commercial",
    summary:
      "Build-outs fail when the vanilla shell and the tenant's use were never reconciled.",
    problem:
      "A shell is not a restaurant, a clinic, or a shop until the city agrees. Use, grease, occupancy load, and restrooms are decided on paper first.",
    approach: [
      "Confirm the intended use against the building and the zoning.",
      "Coordinate the build-out documents and the permit.",
      "Sequence inspections to the opening date — not the other way around.",
    ],
    who: "Tenants taking raw or vanilla space.",
    cta: { href: "/review?focus=commercial", label: "Discuss my build-out" },
    related: ["tenant-improvements", "plan-coordination"],
    faqs: [],
  },
  {
    slug: "permit-consulting",
    title: "Commercial permit consulting",
    group: "commercial",
    eyebrow: "Commercial",
    summary:
      "Commercial permitting is a conversation among the city, the drawings, and the use. Someone has to run that conversation.",
    problem:
      "Applications sit because comments are not answered, or because the wrong permit type was opened. Time is lost in the portal, not on the jobsite.",
    approach: [
      "Identify the correct permit path for the use and the building.",
      "Respond to review comments with documents, not optimism.",
      "Keep the owner informed about what is actually holding the stamp.",
    ],
    who: "Developers, owners, and design teams who need the municipal side managed.",
    cta: { href: "/review?focus=permit", label: "Get permit help" },
    related: ["plan-coordination", "code-compliance", "inspection-coordination"],
    faqs: [],
  },
  {
    slug: "plan-coordination",
    title: "Plan coordination",
    group: "commercial",
    eyebrow: "Commercial",
    summary:
      "Architects, engineers, and contractors produce pieces. The city reviews a set. Plan coordination is making those into one file.",
    problem:
      "Conflicting sheets are how commercial jobs collect comment letters. Someone has to own the coordination.",
    approach: [
      "Collect the current set and the city's comments.",
      "Identify conflicts before the next submittal.",
      "Keep field changes from orphaning the approved drawings.",
    ],
    who: "Teams with drawings that are not yet a coherent submittal.",
    cta: { href: "/review?focus=drawings", label: "Discuss plan coordination" },
    related: ["permit-consulting", "tenant-improvements"],
    faqs: [],
  },
  {
    slug: "code-compliance",
    title: "Commercial code-compliance issues",
    group: "commercial",
    eyebrow: "Commercial",
    summary:
      "Code-compliance issues on commercial property are rarely one trade. They are occupancy, fire, accessibility, and the last inspector's list.",
    problem:
      "A compliance letter that sits unanswered becomes an enforcement file. The response has to be specific.",
    approach: [
      "Parse the city's written comments.",
      "Separate immediate life-safety from documentation gaps.",
      "Coordinate the corrections the building official will accept.",
    ],
    who: "Owners who received a commercial compliance or correction notice.",
    cta: { href: "/review?focus=compliance", label: "Request project review" },
    related: ["permit-consulting", "inspection-coordination", "project-rescue"],
    faqs: [],
  },
  {
    slug: "inspection-coordination",
    title: "Inspection coordination",
    group: "commercial",
    eyebrow: "Commercial",
    summary:
      "Commercial inspections are scheduled, sequenced, and unforgiving of covered work.",
    problem:
      "Calling a final when roughs were never closed is how openings get delayed. Coordination is a calendar with consequences.",
    approach: [
      "Build the inspection list from the permit, not from memory.",
      "Keep work visible until it has been seen.",
      "Treat failed items as a punch list, not a debate.",
    ],
    who: "Teams approaching inspections or stuck on a failed one.",
    cta: { href: "/review?focus=commercial", label: "Coordinate inspections" },
    related: ["permit-consulting", "code-compliance"],
    faqs: [],
  },
  {
    slug: "project-rescue",
    title: "Commercial project rescue",
    group: "commercial",
    eyebrow: "Commercial",
    summary:
      "A commercial job that has gone sideways still has a file, a use, and a city. Rescue starts there.",
    problem:
      "Halfway TIs, abandoned build-outs, and contractor disputes leave landlords with a suite they cannot occupy and a permit they cannot ignore.",
    approach: [
      "Reconstruct the approved scope and the current condition.",
      "Identify the shortest legal path to a sign-off.",
      "Put a competent sequence back on the project.",
    ],
    who: "Landlords, tenants, and developers inheriting a stalled commercial job.",
    cta: { href: "/review?focus=rescue", label: "Request project review" },
    related: ["tenant-improvements", "permit-consulting", "construction-consulting"],
    faqs: [],
  },
  {
    slug: "construction-consulting",
    title: "Commercial construction consulting",
    group: "commercial",
    eyebrow: "Commercial",
    summary:
      "Consulting for people who already have architects and contractors — and still need someone who has stood in the inspection.",
    problem:
      "Commercial teams can be well-staffed and still miss the municipal reality. A consultant who has built is useful in that gap.",
    approach: [
      "Review the file as a builder and as a coordinator.",
      "Say what is likely to stall the city.",
      "Advise without pretending to replace the design team.",
    ],
    who: "Developers, owners, and project managers who want a field-literate read.",
    cta: { href: "/review?focus=consult", label: "Schedule consultation" },
    related: ["permit-consulting", "plan-coordination", "project-rescue"],
    faqs: [],
  },
];

export function allServices(): Service[] {
  return [...coreServices, ...residentialServices, ...commercialServices];
}

export function getService(
  group: Service["group"],
  slug: string,
): Service | undefined {
  const pool =
    group === "core"
      ? coreServices
      : group === "residential"
        ? residentialServices
        : commercialServices;
  return pool.find((service) => service.slug === slug);
}

export function servicePath(service: Service): string {
  if (service.group === "core") return `/services/${service.slug}`;
  if (service.group === "residential") return `/residential/${service.slug}`;
  return `/commercial/${service.slug}`;
}
