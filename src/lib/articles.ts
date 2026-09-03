export type Article = {
  slug: string;
  category: string;
  title: string;
  description: string;
  updated: string;
  readMinutes: number;
  body: string[];
  faqs: { q: string; a: string }[];
};

export const categories: {
  slug: string;
  title: string;
  description: string;
}[] = [
  {
    slug: "arizona-building-permits",
    title: "Arizona building permits",
    description:
      "How permitting actually works in Arizona — state licensing versus city review.",
  },
  {
    slug: "phoenix-permits",
    title: "Phoenix permits",
    description: "Planning & Development, notices of violation, and Phoenix review culture.",
  },
  {
    slug: "scottsdale-permits",
    title: "Scottsdale permits",
    description: "Design review, custom residential, and Scottsdale development services.",
  },
  {
    slug: "residential-permits",
    title: "Residential permits",
    description: "What usually needs a permit on an Arizona house — and what usually does not.",
  },
  {
    slug: "commercial-permits",
    title: "Commercial permits",
    description: "Occupancy, TIs, and why commercial review is a different sport.",
  },
  {
    slug: "red-tags",
    title: "Red tags",
    description: "What a red tag is, what it is not, and what to do in the first 48 hours.",
  },
  {
    slug: "stop-work-orders",
    title: "Stop-work orders",
    description: "Why work was stopped and how projects get back into an inspection cycle.",
  },
  {
    slug: "owner-builder",
    title: "Owner-builder construction",
    description: "The Arizona exemption, the affidavit, and the construction reality behind it.",
  },
  {
    slug: "building-inspections",
    title: "Building inspections",
    description: "Roughs, finals, rechecks, and why covering work early is expensive.",
  },
  {
    slug: "construction-drawings",
    title: "Construction drawings",
    description: "CAD sets, as-builts, and the documents a reviewer can actually stamp.",
  },
  {
    slug: "adu-permits",
    title: "ADU permits",
    description: "Guest houses, casitas, and accessory dwellings by Arizona city.",
  },
  {
    slug: "home-additions",
    title: "Home additions",
    description: "Adding space without creating a setback, structural, or permit problem.",
  },
  {
    slug: "commercial-tenant-improvements",
    title: "Commercial tenant improvements",
    description: "Suite build-outs, occupancy, and the opening-date problem.",
  },
  {
    slug: "unpermitted-construction",
    title: "Unpermitted construction",
    description: "What happens when work was done without a permit — including after you buy.",
  },
  {
    slug: "hiring-a-contractor",
    title: "Hiring a contractor",
    description: "ROC numbers, qualifying parties, and how to read a bid.",
  },
  {
    slug: "construction-consulting",
    title: "Construction consulting",
    description: "When you need knowledge more than you need another crew.",
  },
];

export const articles: Article[] = [
  {
    slug: "how-arizona-building-permits-actually-work",
    category: "arizona-building-permits",
    title: "How Arizona building permits actually work",
    description:
      "The state licenses contractors. Cities and counties permit work. Confusing the two is how projects stall.",
    updated: "2026-09-01",
    readMinutes: 8,
    body: [
      "Arizona has two systems that owners constantly collapse into one word: 'permit.' The Arizona Registrar of Contractors licenses the people and companies allowed to contract. Cities and counties permit the work on a specific property. A licensed contractor without the right city permit is still out of compliance. An owner with a city permit and an unlicensed contractor can still have a state problem.",
      "The ROC number on a truck is not a Phoenix permit, a Scottsdale permit, or a Pima County permit. It is proof the entity is allowed to contract in the classification on the license. JLS Development Enterprises Inc. holds Arizona ROC #167786, a KB-2 Dual classification covering residential and small commercial work. That license is verified on roc.az.gov. It does not replace plan review.",
      "Each jurisdiction adopts building codes and administrative provisions. Phoenix is not Scottsdale. Tucson is not unincorporated Pima County. Maricopa County islands are not the nearest city. The first competent question on any project is: which counter owns this parcel?",
      "A permit application is a scope, a valuation, a set of documents, and a series of inspections. Owners who treat it as a fee at the cashier are the owners who get comment letters. Reviewers do not infer intent. They review what was submitted.",
      "If work that required a permit was already done, the application is no longer a clean 'proposed' file. It is a legalization or enforcement file. That changes drawings, fees, and how the inspector will look at the property. Pretending otherwise wastes months.",
      "JLS does not tell owners that every city behaves the same. The useful service is naming the jurisdiction, naming the likely path, and coordinating the documents that path requires.",
    ],
    faqs: [
      {
        q: "Who issues building permits in Arizona?",
        a: "Cities and counties. The Arizona ROC licenses contractors. It does not stamp your house.",
      },
      {
        q: "Can I pull my own permit?",
        a: "Sometimes, as an owner-builder or owner, depending on the jurisdiction and the work. That does not remove inspections, drawings, or the conditions on the exemption.",
      },
    ],
  },
  {
    slug: "phoenix-red-tags-and-notices-of-violation",
    category: "phoenix-permits",
    title: "Phoenix red tags, stop-work, and notices of violation",
    description:
      "Phoenix publishes an enforcement path for unpermitted work. Here is how owners should read it.",
    updated: "2026-09-01",
    readMinutes: 7,
    body: [
      "The City of Phoenix Planning & Development Department can issue a notice of violation and a stop-work order when work that required a permit proceeds without one, or when work is unsafe or out of compliance. Phoenix's own administrative provisions say cited work shall cease. The order is supposed to state the reason and the conditions under which work may resume.",
      "That last sentence is the entire job: find the conditions. Not the neighbor's theory. Not the contractor's excuse. The written reason.",
      "Phoenix has used civil sanctions for owners who continue after a stop-work order, who refuse to address unsafe conditions, or who treat unpermitted work as a lifestyle. Continuing after the tag is how a permit problem becomes a citation problem.",
      "Some Phoenix residential scopes move through Permit by Inspection. That program is not 'no review.' It is a different review intensity. An inspector can still require drawings, opening of finished work, or a standard plan-review path once they see the field.",
      "If you were handed a complaint number — Phoenix often references complaint files on related permits — keep it. The city already has a narrative. Your response should be a file, not a speech at the counter.",
      "John's work in Phoenix is the same as anywhere else: read the notice, match it to the property, determine what the city will require, and coordinate drawings, engineering, and inspections until the project can move again. No one who is being honest will promise the city a date.",
    ],
    faqs: [
      {
        q: "Is a Phoenix red tag the same as a stop-work order?",
        a: "Owners use 'red tag' for posted stop-work and violation notices. Read the document. The legal name and the conditions are on the paper.",
      },
    ],
  },
  {
    slug: "what-scottsdale-reviews-that-other-cities-might-not",
    category: "scottsdale-permits",
    title: "What Scottsdale reviews that other cities might not",
    description:
      "Custom lots, desert character, and design review change the permit path in Scottsdale.",
    updated: "2026-09-01",
    readMinutes: 6,
    body: [
      "Scottsdale is not a harder Phoenix. It is a different review culture. Custom residential work in north Scottsdale regularly meets design, hillside, fire, and drainage requirements that a production remodel in another city never sees.",
      "Owners arrive with a beautiful rendering and a thin construction set. Reviewers do not occupy renderings. They occupy sheets: structure, energy, mechanical, site. If the set is incomplete, the comment letter will be complete.",
      "Guest houses and casitas are a frequent Scottsdale problem. A structure that is lived in is not a storage shed because the owner prefers that word. If it has sleeping, cooking, or a separate living use, expect the city to treat it as a dwelling conversation.",
      "Commercial work in older Scottsdale buildings has the usual TI issues — occupancy, accessibility, leftover mechanical — plus a city that has heard every 'we just need to open next month' speech already.",
      "The advantage of hiring someone who has stood on both sides of a Scottsdale job is not charm. It is knowing which missing sheet will cost you a review cycle.",
    ],
    faqs: [
      {
        q: "Does HOA approval replace a Scottsdale permit?",
        a: "No. Architectural committees do not issue building permits.",
      },
    ],
  },
  {
    slug: "does-my-arizona-remodel-need-a-permit",
    category: "residential-permits",
    title: "Does my Arizona remodel need a permit?",
    description:
      "Cosmetic work is one thing. Moving structure, plumbing, or electrical is another.",
    updated: "2026-09-01",
    readMinutes: 7,
    body: [
      "Paint, cabinet refacing in the same footprint, and finish flooring often do not need a building permit. That sentence is where bad advice starts — because owners apply it to everything in the room.",
      "Moving a sink, adding a circuit, changing a range hood, opening a load-bearing wall, enclosing a patio, or adding square footage usually does need a permit. The city decides. A contractor who says 'we never pull those' is describing their risk tolerance, not the code.",
      "Arizona's dollar threshold for contracting without a license is low — work of $1,000 or more in labor and materials is the commonly cited line for licensure, and the handyman exemption does not cover permitted work. Licensing and permitting are still different questions.",
      "The practical test: if an inspector would need to see it before it is covered, you probably needed a permit before you started. If you already covered it, the city may require you to open it. That is not punishment for asking. That is how inspections work.",
      "If you are planning a remodel, bring the city and the scope to a review before demo. It is cheaper than bringing a red tag later.",
    ],
    faqs: [
      {
        q: "What if my contractor said it was cosmetic?",
        a: "Ask what trades will change. If plumbing, electrical, mechanical, or structure move, get a second opinion before the wall comes down.",
      },
    ],
  },
  {
    slug: "why-commercial-permits-are-a-different-job",
    category: "commercial-permits",
    title: "Why commercial permits are a different job",
    description:
      "Occupancy classification, accessibility, and fire show up earlier than finishes.",
    updated: "2026-09-01",
    readMinutes: 6,
    body: [
      "A house is usually Occupancy R. A suite might be B, M, A, or something that triggers a different set of rules the moment the use changes. Commercial permitting starts with use — not with the paint color in the brand deck.",
      "Tenant improvements fail review because the set describes furniture and finishes and forgets exiting, restrooms, and mechanical leftover from the last tenant. The city is not being difficult. The city is reviewing a building, not a brand.",
      "Lease dates are not a review expedite. Some cities offer expedite products. They still require a complete file. A thin set on an expedite path is still a thin set.",
      "JLS treats commercial work as coordination among the owner, the design team, and the municipality. Labor is downstream of that.",
    ],
    faqs: [
      {
        q: "Can I occupy while the TI permit is in review?",
        a: "Doing work that requires a permit — or occupying a changed space — without the required approvals is how commercial jobs collect stop-work orders. Ask the city, in writing, what is allowed.",
      },
    ],
  },
  {
    slug: "you-have-a-red-tag-now-what",
    category: "red-tags",
    title: "You have a red tag. Now what?",
    description:
      "Stop the cited work. Read the notice. Do not guess. Build a plan the city can accept.",
    updated: "2026-09-01",
    readMinutes: 8,
    body: [
      "Photograph the notice, the posting location, and the work. Do not remove the tag to 'keep the neighbors calm.' Do not finish the last bit of drywall because it was 'almost done.' Cited work stops.",
      "Read every line. The useful parts are the alleged violation, the code reference if present, the complaint or case number, the inspector or officer name, and the conditions for resuming. If those parts are vague, the first professional task is to get them less vague — through the department, not through a group text.",
      "Then establish facts the notice does not care about but the solution does: city or county, residential or commercial, whether any permit exists, whether plans exist, whether a contractor of record exists, and whether the work matches any approved set.",
      "Typical paths include applying for the permit that should have been pulled, submitting as-builts or new drawings, opening finished work for inspection, hiring engineering, or removing work that cannot be legalized. Which path applies is a property-specific answer.",
      "What does not work: arguing that other houses on the street did the same thing. The city is not grading on a curve.",
      "JLS's red-tag process is review, identify, determine requirements, coordinate drawings, address the municipality, prepare for recheck, and get the project moving again. That is a sequence. It is not a slogan that replaces the city's decision.",
    ],
    faqs: [
      {
        q: "How fast can a red tag be lifted?",
        a: "When the conditions on the order are met and the department agrees. That can be days or months. Anyone who quotes a guarantee without seeing the notice is selling comfort.",
      },
    ],
  },
  {
    slug: "stop-work-orders-in-arizona",
    category: "stop-work-orders",
    title: "Stop-work orders in Arizona",
    description:
      "A stop-work order is an instruction. The project resumes when the stated conditions are met.",
    updated: "2026-09-01",
    readMinutes: 6,
    body: [
      "A stop-work order is usually written and served on the owner, the agent, or the person doing the work. Upon issuance, the cited work is supposed to stop. The order should state why and under what conditions work may continue.",
      "There are at least three common flavors: work with no permit, work that exceeds or contradicts an existing permit, and work that is unsafe. The correction is different for each. Applying for a brand-new permit will not fix a job that simply needs a revision. A revision will not fix a job that was never legal to begin with.",
      "Fees and penalties vary by city. Some departments double permit fees on after-the-fact work. Some issue civil sanctions for continuing. None of that is a reason to panic. It is a reason to stop improvising.",
      "Getting a stop-work order lifted is a documentation and inspection problem. Treat it like one.",
    ],
    faqs: [
      {
        q: "Can I do 'cleanup' after a stop-work order?",
        a: "Ask the issuing department what is allowed. Cleanup that looks like continuing construction is how owners collect a second notice.",
      },
    ],
  },
  {
    slug: "arizona-owner-builder-what-the-exemption-actually-says",
    category: "owner-builder",
    title: "Arizona owner-builder: what the exemption actually says",
    description:
      "A.R.S. § 32-1121 has conditions. The city still expects a competent permit path.",
    updated: "2026-09-01",
    readMinutes: 8,
    body: [
      "Arizona law allows certain property owners to improve or build for their own occupancy without holding a contractor license. The commonly used citation is A.R.S. § 32-1121(A)(5). Cities and towns will ask you to sign an owner-builder affidavit when you apply for a permit under that exemption.",
      "The conditions matter. The property is intended for your occupancy. Offering it for sale or rent within a year after completion or certificate of occupancy is treated as evidence that the exemption did not apply. There is a separate owner-developer path that requires a licensed general contractor on the construction.",
      "The handyman exemption is not a loophole for permitted projects or for work at or above the statutory dollar threshold. Falsifying an affidavit to evade licensing law is described in city forms as a criminal matter. Do not get cute with the form.",
      "None of this means the city will let you skip drawings, inspections, or trade competence. Owner-builder means you are wearing the general contractor hat. You still need to know what that hat requires: sequencing, subcontractor scopes, hold-points, and how an inspector will fail a sloppy job.",
      "JLS offers owner-builder consulting for people who want control and still want a contractor's brain in the room. It is not a promise you will spend less. It is a way to keep from learning the expensive lessons in the field.",
      "This is not legal advice. If your occupancy, sale, or rental plans are complicated, talk to an Arizona attorney as well as a builder.",
    ],
    faqs: [
      {
        q: "Can I owner-build a house I plan to flip next year?",
        a: "The exemption is built around owner occupancy and a one-year restriction on sale or rent after completion. If you plan to sell immediately, assume the exemption is the wrong tool and get counsel.",
      },
    ],
  },
  {
    slug: "why-inspections-fail-and-what-to-do",
    category: "building-inspections",
    title: "Why building inspections fail — and what to do",
    description:
      "A failed inspection is a list. Treat it like a list.",
    updated: "2026-09-01",
    readMinutes: 6,
    body: [
      "Inspections exist because the city cannot see covered work later. Underground, rough electrical, rough plumbing, framing, insulation, and finals are a sequence. Skip one and the next one is theater.",
      "Failures cluster around three causes: the work does not match the approved plans, the work is incomplete, or the work violates a code provision the inspector is required to enforce. Personality is rarely the third cause, even when it feels like it.",
      "The correction notice is the asset. Photograph it. Translate each item into a trade and a location. Do the work. Call the recheck. Do not call the recheck as a negotiation strategy.",
      "If you do not understand the list, that is a consulting moment — not a reason to cover the work and hope.",
    ],
    faqs: [
      {
        q: "Can I talk the inspector out of an item?",
        a: "You can ask for clarification. You cannot charm a required grounding electrode out of existence. Bring facts and the approved plan.",
      },
    ],
  },
  {
    slug: "as-builts-cad-and-what-cities-will-stamp",
    category: "construction-drawings",
    title: "As-builts, CAD, and what cities will stamp",
    description:
      "If the drawings are fiction, the permit is fiction.",
    updated: "2026-09-01",
    readMinutes: 6,
    body: [
      "A construction drawing is a set of instructions the city can review and the field can build. A napkin is not that. A furniture plan is not that. A 2004 scan that no longer matches the house is not that.",
      "As-builts record what exists. They are how you start a conversation about unpermitted rooms, missing originals, or a commercial suite that has been chopped up for twenty years. Without as-builts, every meeting is a guess.",
      "CAD is the modern way those sheets get produced and revised. Engineering is what you add when the structure, soils, or the reviewer require a stamp the drafter cannot provide.",
      "JLS coordinates drawings. That may mean producing, directing, or bringing the right people to the table. The goal is a set the jurisdiction will review — not a prettier PDF of the same problem.",
    ],
    faqs: [
      {
        q: "Do I always need an architect?",
        a: "Not always. Some scopes need an architect, some need an engineer, some need a competent construction set. The jurisdiction and the work decide.",
      },
    ],
  },
  {
    slug: "adu-and-guest-house-permits-in-arizona",
    category: "adu-permits",
    title: "ADU and guest-house permits in Arizona",
    description:
      "A casita is a small house in the city's eyes. Permit it like one.",
    updated: "2026-09-01",
    readMinutes: 6,
    body: [
      "Accessory dwelling units, guest houses, and casitas are not one statewide product. Phoenix, Scottsdale, Tucson, and the towns each write their own allowance: size, height, setbacks, parking, utilities, and whether a kitchen makes it a dwelling.",
      "Owners get into trouble by building 'storage' with a bathroom and a microwave and then being surprised that the inspector can read. If people will sleep there, start the conversation as a dwelling.",
      "HOA rules may be stricter than the city — or the reverse. You need both answers. Neither one substitutes for the other.",
      "JLS treats ADU work as small residential construction with a zoning preface. That preface is where most of these jobs die.",
    ],
    faqs: [
      {
        q: "Can I convert my garage to an ADU?",
        a: "Sometimes. Parking, setbacks, and the city's ADU rules decide. Converting first and asking later is how garages get red-tagged.",
      },
    ],
  },
  {
    slug: "home-additions-that-do-not-get-red-tagged",
    category: "home-additions",
    title: "Home additions that do not get red-tagged",
    description:
      "An addition is new construction attached to an old house. Permit it that way.",
    updated: "2026-09-01",
    readMinutes: 6,
    body: [
      "Additions trigger setbacks, lot coverage, structure, energy, and sometimes fire sprinklers. They also trigger a collision with whatever unpermitted work already exists on the house — because the reviewer and the inspector will see the whole property, not just your new rectangle.",
      "A patio cover becoming livable space is an addition in real life even if the owner still calls it a patio. The city will use the livable word.",
      "Drawings have to show how the new work meets the old work: roof, foundation, lateral system, and utilities. 'We'll figure it out in the field' is how additions collect correction lists.",
      "If construction already started, stop treating it as a future permit. It is an after-the-fact file. That is a different temperature.",
    ],
    faqs: [
      {
        q: "Can I add a second story without engineering?",
        a: "Assume no until a design professional and the city say otherwise. Gravity is not optional.",
      },
    ],
  },
  {
    slug: "commercial-ti-permits-and-opening-dates",
    category: "commercial-tenant-improvements",
    title: "Commercial TI permits and the opening-date problem",
    description:
      "The lease is not the critical path. The complete set is.",
    updated: "2026-09-01",
    readMinutes: 6,
    body: [
      "A tenant improvement is a permitted alteration of a commercial interior. The city's questions are use, occupancy load, exiting, accessibility, mechanical, electrical, and whether the last tenant's leftovers are still legal for the new use.",
      "Opening dates slip when the set is incomplete, when review comments sit, or when the field covers work that was never inspected. Adding labor at the end does not recover a missed rough.",
      "Landlords and tenants fight about who 'handles permits.' Someone still has to produce a file the city will stamp. Name that person early.",
      "JLS coordinates commercial TIs and rescues the ones that are already late. The honest conversation includes the possibility that the date on the lease is already dead.",
    ],
    faqs: [
      {
        q: "Is a furniture plan enough for a TI?",
        a: "Almost never, if you are changing walls, trades, or use. Ask the city what they want for that scope.",
      },
    ],
  },
  {
    slug: "i-bought-a-house-with-unpermitted-work",
    category: "unpermitted-construction",
    title: "I bought a house with unpermitted work",
    description:
      "The previous owner is gone. The city is not. Here is the adult path.",
    updated: "2026-09-01",
    readMinutes: 7,
    body: [
      "Unpermitted rooms, conversions, and additions travel with the property. Title companies, lenders, and listing agents may or may not have flagged them. The city can still flag them — on a complaint, a new permit application, or a sale years from now.",
      "Your options are some mix of legalize, correct, or remove. Legalize means drawings, permits, and inspections of work that already exists — sometimes after opening finished surfaces. Correct means bringing work up to the standard the city will accept, which may be current code. Remove means taking it down. None of those is theoretical once an inspector is involved.",
      "Do not start a new remodel on top of unpermitted work and hope the city only looks at the new part. They will look at what they can see.",
      "Bring the listing documents, any old plans, and photographs to a review. The first deliverable is a description of what you are actually dealing with.",
    ],
    faqs: [
      {
        q: "Will this kill my sale later?",
        a: "Unpermitted work is a classic escrow problem. Resolving it on purpose is usually better than discovering it under a buyer's inspector.",
      },
    ],
  },
  {
    slug: "how-to-read-an-arizona-contractor",
    category: "hiring-a-contractor",
    title: "How to read an Arizona contractor",
    description:
      "The ROC number is the start of due diligence, not the end of it.",
    updated: "2026-09-01",
    readMinutes: 7,
    body: [
      "Look up the license on roc.az.gov. Confirm the entity name matches the contract, the classification matches the work, and the status is Active. A number on a card that belongs to a different LLC is not your protection.",
      "The qualifying party is the person the state holds as the technical qualifier. On JLS Development Enterprises Inc., that is John Samuel Scatterday for ROC #167786. If you are hiring a different company, read that company's record — not a person's reputation borrowed from another license.",
      "Arizona requires the license number on contracts, bids, and advertising. Someone who will not print it is giving you information.",
      "Bids that are dramatically low are often missing permits, drawings, or a trade. The ROC recommends multiple written bids. Read them for scope, not just for the number on the last page.",
      "JLS is not every job's right contractor. Complicated, stuck, or owner-controlled work is the point of this practice. A straightforward paint-and-carpet job does not need this website.",
    ],
    faqs: [
      {
        q: "Where do I verify ROC #167786?",
        a: "The official search is the Arizona Registrar of Contractors contractor search at roc.az.gov.",
      },
    ],
  },
  {
    slug: "when-you-need-a-construction-consultant",
    category: "construction-consulting",
    title: "When you need a construction consultant — not another bid",
    description:
      "Some projects need knowledge, access, and a plan more than they need a crew.",
    updated: "2026-09-01",
    readMinutes: 6,
    body: [
      "Hire a consultant when the problem is a file, a city, a dispute, or a decision — not a shortage of labor. Red tags, unpermitted history, owner-builder intent, and commercial coordination are consulting problems first.",
      "A consultant who has built will tell you when you actually need a contractor, an architect, or an attorney. A consultant who has only facilitated meetings will tell you to have another meeting.",
      "John works both sides: how projects get built, and how permits, inspectors, and municipalities affect them. That is the product. It is not a slogan about passion or quality.",
      "If you already know the next physical step and only need a crew, say that. If you do not know the next legal step, say that instead. Those are different engagements.",
    ],
    faqs: [
      {
        q: "Is consulting confidential?",
        a: "Treat the first review as a professional conversation about your property. Do not send documents you are unwilling to have discussed for the purpose of helping the project.",
      },
    ],
  },
];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function articlesIn(category: string) {
  return articles.filter((article) => article.category === category);
}

export function getArticle(category: string, slug: string) {
  return articles.find(
    (article) => article.category === category && article.slug === slug,
  );
}
