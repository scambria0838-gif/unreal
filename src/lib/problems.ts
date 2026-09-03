export type ProblemId =
  | "red-tag"
  | "need-permit"
  | "city-stopped"
  | "contractor-no-permit"
  | "drawings"
  | "owner-builder"
  | "remodel"
  | "building-home"
  | "commercial"
  | "contractor-left"
  | "second-opinion"
  | "unknown";

export type Problem = {
  id: ProblemId;
  label: string;
  short: string;
  headline: string;
  body: string;
  next: string;
  href: string;
  serviceHref: string;
};

export const problems: Problem[] = [
  {
    id: "red-tag",
    label: "I have a red tag",
    short: "Red tag",
    headline: "A red tag is a stop — not a verdict.",
    body: "The city posted a notice because something on the property is out of compliance: unpermitted work, a failed inspection, or a condition they will not let continue. The next move is not guessing, tearing things out, or arguing with the inspector. The next move is reading the notice, identifying the actual violation, and building a path back to inspections.",
    next: "John reviews the tag, the work, and the jurisdiction — then tells you what the city is likely to require before anyone swings another hammer.",
    href: "/review?focus=red-tag",
    serviceHref: "/services/red-tag-rescue",
  },
  {
    id: "need-permit",
    label: "I need a permit",
    short: "Permit",
    headline: "A permit is a process, not a form.",
    body: "Most people think a permit is a piece of paper you buy. In Arizona it is a sequence: scope, drawings, zoning checks, trade permits, fees, and inspections. The jurisdiction decides what that sequence looks like. Phoenix is not Scottsdale. Scottsdale is not unincorporated Maricopa County.",
    next: "JLS maps the actual permit path for your property and your scope — residential or commercial — and coordinates what has to be submitted before work starts.",
    href: "/review?focus=permit",
    serviceHref: "/services/permits",
  },
  {
    id: "city-stopped",
    label: "The city stopped my project",
    short: "Stop-work",
    headline: "When the city stops the job, the job is not the problem.",
    body: "A stop-work order means the municipality has decided the work cannot continue as-is. Continuing anyway can turn a permit problem into a citation. The order will usually state a reason. That reason is the starting point — not the finish line.",
    next: "We identify why the work was stopped, what documents or corrections the jurisdiction wants, and how to get the project back into a legal inspection cycle.",
    href: "/review?focus=red-tag",
    serviceHref: "/services/red-tag-rescue",
  },
  {
    id: "contractor-no-permit",
    label: "My contractor didn't pull a permit",
    short: "No permit",
    headline: "Unpermitted work does not disappear because the contractor left.",
    body: "If work that required a permit was done without one, the property owner is the one the city can hold. The contractor may be gone. The notice, the inspector, and the title issue at sale stay with the house or the suite.",
    next: "John reviews what was built, what should have been permitted, and what it takes to document, correct, or legalize the work in that jurisdiction.",
    href: "/review?focus=unpermitted",
    serviceHref: "/services/project-rescue",
  },
  {
    id: "drawings",
    label: "I need drawings or plans",
    short: "Plans",
    headline: "Inspectors do not inspect ideas. They inspect plans.",
    body: "Many stuck projects are stuck because the drawings do not match the work, the work does not match the permit, or there are no drawings at all. As-builts, CAD sets, and engineering coordination are how you give the city something they can review.",
    next: "JLS coordinates construction drawings, as-builts, and the engineering the jurisdiction is likely to require for your scope.",
    href: "/review?focus=drawings",
    serviceHref: "/services/plans-drawings",
  },
  {
    id: "owner-builder",
    label: "I want to be my own general contractor",
    short: "Owner-builder",
    headline: "You can keep control. You still need a contractor's brain.",
    body: "Arizona allows certain owners to act as owner-builder under A.R.S. § 32-1121. That exemption has conditions — occupancy, sale and rental restrictions, and the fact that the city still expects a competent permit and inspection path. Control is not the same as knowing sequencing, subcontractors, or what an inspector will fail.",
    next: "Owner-builder consulting puts decades of GC experience in your corner without forcing you to hand the entire project to a traditional general contractor.",
    href: "/review?focus=owner-builder",
    serviceHref: "/services/owner-builder-consulting",
  },
  {
    id: "remodel",
    label: "I'm planning a remodel",
    short: "Remodel",
    headline: "A remodel becomes expensive when the permit path is an afterthought.",
    body: "Kitchens, baths, and whole-home work look simple until you open a wall and find unpermitted history, a load path, or a city that wants drawings for what you thought was cosmetic. Planning the jurisdiction first keeps the job from becoming a rescue later.",
    next: "Tell John the property, the city, and the scope. He will tell you what usually needs a permit — and what usually does not — in that market.",
    href: "/review?focus=remodel",
    serviceHref: "/residential/whole-home-remodeling",
  },
  {
    id: "building-home",
    label: "I'm building a home",
    short: "New home",
    headline: "A custom home is a permit, a sequence, and a thousand decisions.",
    body: "New construction is not just a set of plans and a crew. It is soils, drainage, fire sprinklers in some Arizona jurisdictions, energy compliance, inspections, and a city that will not issue a certificate of occupancy because someone skipped a step six months ago.",
    next: "JLS works new construction as a builder and as a consultant — depending on how much control you want to keep.",
    href: "/review?focus=build",
    serviceHref: "/residential/custom-homes",
  },
  {
    id: "commercial",
    label: "I have a commercial project",
    short: "Commercial",
    headline: "Commercial work lives or dies on occupancy, exiting, and the inspector.",
    body: "Tenant improvements, build-outs, and commercial renovations have a different review path than a house. Occupancy classification, accessibility, mechanical, and fire all show up earlier. A suite that 'just needs new finishes' can still require a full TI permit.",
    next: "John works with owners, developers, architects, and municipalities on commercial coordination — not just labor.",
    href: "/review?focus=commercial",
    serviceHref: "/commercial",
  },
  {
    id: "contractor-left",
    label: "My contractor left the project",
    short: "Abandoned",
    headline: "An unfinished job is a documentation problem first.",
    body: "When a contractor walks, you inherit their permits, their incomplete inspections, their missing as-builts, and their unfinished trades. The city does not restart the clock because you are frustrated. Someone has to reconstruct what was approved and what was actually built.",
    next: "Project rescue starts with the file: permit, plans, inspections, and the physical work. Then a plan to finish or correct it.",
    href: "/review?focus=rescue",
    serviceHref: "/services/project-rescue",
  },
  {
    id: "second-opinion",
    label: "I need a second opinion",
    short: "Second opinion",
    headline: "A second opinion is cheaper than a wrong next step.",
    body: "You may already have a contractor, an architect, or a city comment letter. You still may not know whether the advice you were given is complete. Construction problems compound when the first answer is treated as the only answer.",
    next: "Bring John the documents. He will tell you what he sees — and what he would want confirmed before you spend more money.",
    href: "/review?focus=second-opinion",
    serviceHref: "/services/construction-consulting",
  },
  {
    id: "unknown",
    label: "I don't know what I need",
    short: "Not sure",
    headline: "If you cannot name the problem, start with the facts.",
    body: "Property type. City. Whether work has started. Whether the city has contacted you. Whether plans exist. Those five facts usually tell an experienced contractor more than a long story.",
    next: "Use the project review form or Ask John. Describe what is in front of you. John will tell you which lane you are in.",
    href: "/review",
    serviceHref: "/ask-john",
  },
];

export function getProblem(id: string): Problem | undefined {
  return problems.find((problem) => problem.id === id);
}
