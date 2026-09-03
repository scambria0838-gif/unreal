export type Location = {
  slug: string;
  name: string;
  county: string;
  department: string;
  portal: string;
  portalUrl: string;
  character: string;
  permitting: string;
  commonProblems: string[];
  johnNote: string;
  nearby: string[];
};

export const locations: Location[] = [
  {
    slug: "phoenix",
    name: "Phoenix",
    county: "Maricopa County",
    department: "Planning & Development Department",
    portal: "SHAPE PHX / City of Phoenix permit systems",
    portalUrl: "https://www.phoenix.gov/pdd",
    character:
      "Phoenix is the largest permitting environment in Arizona. Neighborhoods range from historic central-city lots to far-north desert subdivisions. The same city can treat a 1940s bungalow alteration and a new custom home as completely different files.",
    permitting:
      "Phoenix issues notices of violation and stop-work orders under its building construction code administrative provisions. Unpermitted work is a documented enforcement path, not a rumor. Residential Permit by Inspection exists for some scopes; it is not a shortcut around the work an inspector still has to see. Plan review, trade permits, and inspection scheduling all run through city systems. A Phoenix file that is missing drawings, or that does not match the field, will sit.",
    commonProblems: [
      "Unpermitted room additions and converted patios discovered at sale or complaint",
      "Remodels that opened walls without electrical or plumbing permits",
      "Stop-work after a neighbor complaint on active construction",
      "Commercial tenant improvements in older strip and industrial buildings",
    ],
    johnNote:
      "Phoenix is large enough that the inspector, the reviewer, and the complaint officer may never be the same person. The file has to make sense without a speech.",
    nearby: ["glendale", "scottsdale", "tempe", "peoria"],
  },
  {
    slug: "scottsdale",
    name: "Scottsdale",
    county: "Maricopa County",
    department: "Planning, Building and Development Services",
    portal: "SPUR / Scottsdale permit portal",
    portalUrl: "https://www.scottsdaleaz.gov/planning-development",
    character:
      "Scottsdale pairs high-value residential work with a design and desert-character culture that Phoenix does not always share. North Scottsdale, hillside, and custom lots bring extra eyes. Downtown and South Scottsdale bring commercial TIs and mixed-use complications.",
    permitting:
      "Scottsdale's review is often less about whether you can build and more about whether the submittal matches what that lot is allowed to be. Design review, hillside, Native Plant, and fire requirements show up on custom residential work. Owners who treat Scottsdale like a rubber stamp find out otherwise in comment letters.",
    commonProblems: [
      "Custom homes and additions that undercooked fire, drainage, or design review",
      "Guest houses and ADU-style casitas that were never permitted as dwellings",
      "Owner-builder custom work that needs a contractor's sequencing brain",
      "Commercial interiors in older Scottsdale buildings with occupancy questions",
    ],
    johnNote:
      "In Scottsdale the drawings have to be as serious as the house. A beautiful project with a thin set still fails review.",
    nearby: ["phoenix", "cave-creek", "tempe"],
  },
  {
    slug: "cave-creek",
    name: "Cave Creek",
    county: "Maricopa County",
    department: "Town of Cave Creek Development Services",
    portal: "Town of Cave Creek permit counter and portal",
    portalUrl: "https://www.cavecreekaz.gov",
    character:
      "Cave Creek is a small town with desert, septic, wash, and rural-lot realities. Projects here are often custom, hillside-adjacent, or tied to older structures that never had a complete modern file.",
    permitting:
      "A town this size does not have Phoenix's volume, and that is not the same as informal. Setbacks, septic, grading, and desert vegetation can stop a project that would have been routine on a Scottsdale subdivision lot. County and town lines also get confused by owners who assume 'north of the city' is one jurisdiction.",
    commonProblems: [
      "Unpermitted guest quarters on large lots",
      "Grading and drainage work done without the town",
      "Septic and well complications on additions",
      "Custom residential work that needs drawings the town can review",
    ],
    johnNote:
      "Confirm the jurisdiction before you confirm the design. Cave Creek, Carefree, and unincorporated county are not interchangeable.",
    nearby: ["scottsdale", "phoenix"],
  },
  {
    slug: "glendale",
    name: "Glendale",
    county: "Maricopa County",
    department: "Development Services",
    portal: "City of Glendale permit services",
    portalUrl: "https://www.glendaleaz.com",
    character:
      "Glendale mixes older residential fabric, West Valley growth, and major commercial/sports-adjacent development. The permit path depends entirely on which Glendale you are in.",
    permitting:
      "Residential remodels in older Glendale neighborhoods often uncover unpermitted history. Commercial work near entertainment and sports districts has a different intensity than a house permit on a quiet street. The city still expects a complete application.",
    commonProblems: [
      "Residential additions on older lots with incomplete original permits",
      "Commercial build-outs racing a lease date",
      "Contractor-abandoned remodels",
      "Unpermitted garage and patio conversions",
    ],
    johnNote:
      "Glendale jobs go sideways when the team copies a Phoenix playbook without checking Glendale's forms and inspection culture.",
    nearby: ["phoenix", "peoria", "surprise"],
  },
  {
    slug: "peoria",
    name: "Peoria",
    county: "Maricopa County",
    department: "Development & Engineering",
    portal: "City of Peoria permit portal",
    portalUrl: "https://www.peoriaaz.gov",
    character:
      "Peoria stretches from established West Valley neighborhoods to the Lake Pleasant growth edge. A lot of the work is residential addition, remodel, and new production-adjacent custom.",
    permitting:
      "Peoria is a full-service city, not a county afterthought. Additions, pool barriers, and residential alterations still need the right permit type. Owners moving from county islands into city limits are often surprised that the rules changed with the address.",
    commonProblems: [
      "Additions that ignore lot coverage and setbacks",
      "Remodels started by a handyman who could not pull the permit",
      "New construction inspection sequencing",
      "Commercial pads and small commercial alterations",
    ],
    johnNote:
      "If the property is on the city/county line, bring the parcel — not the marketing map.",
    nearby: ["glendale", "surprise", "phoenix"],
  },
  {
    slug: "tempe",
    name: "Tempe",
    county: "Maricopa County",
    department: "Development Services",
    portal: "Tempe Citizen Access / permit portal",
    portalUrl: "https://www.tempe.gov",
    character:
      "Tempe is dense, university-adjacent, and commercially active. Small lots, older houses, and a high volume of tenant improvements define the work.",
    permitting:
      "Tempe does not have leftover desert to absorb a sloppy addition. Setbacks, parking, and lot coverage matter immediately. Commercial TIs around Mill, Apache, and the industrial edges have occupancy and accessibility issues that a residential GC may not see coming.",
    commonProblems: [
      "Residential additions on tight lots",
      "Unpermitted student-housing style conversions",
      "Commercial TIs with aggressive opening dates",
      "Older buildings with incomplete as-builts",
    ],
    johnNote:
      "In Tempe, the lot is the constraint. Drawings that ignore the lot fail before they fail structurally.",
    nearby: ["phoenix", "mesa", "chandler", "scottsdale"],
  },
  {
    slug: "mesa",
    name: "Mesa",
    county: "Maricopa County",
    department: "Development Services",
    portal: "City of Mesa building permits",
    portalUrl: "https://www.mesaaz.gov",
    character:
      "Mesa is one of the largest cities in the country and does not behave like a suburb. East Mesa, downtown, and employment corridors all produce different permit files.",
    permitting:
      "Mesa runs a serious development-services operation. Residential and commercial permits are ordinary city business. Owners who assume a smaller-town counter will be disappointed. Incomplete commercial TIs and unpermitted residential work both show up in volume.",
    commonProblems: [
      "Whole-home remodels in older Mesa neighborhoods",
      "Medical and retail tenant improvements",
      "Unpermitted additions discovered in escrow",
      "Projects split across related permit numbers that no one is tracking",
    ],
    johnNote:
      "Mesa files get messy when related permits are treated as one job. The city tracks the numbers. You should too.",
    nearby: ["tempe", "gilbert", "chandler", "phoenix"],
  },
  {
    slug: "chandler",
    name: "Chandler",
    county: "Maricopa County",
    department: "Development Services",
    portal: "City of Chandler permit services",
    portalUrl: "https://www.chandleraz.gov",
    character:
      "Chandler is master-planned, employment-heavy, and commercially sophisticated. A lot of the complicated work is TI, industrial accessory, and residential alteration inside HOA and city overlays.",
    permitting:
      "Chandler expects a clean commercial set. Residential work still needs permits when the scope crosses the city's line. HOA approval is not a building permit. Owners confuse the two constantly.",
    commonProblems: [
      "Commercial TIs in business parks",
      "Residential remodels that needed drawings and did not have them",
      "Accessory structures built as if they were sheds",
      "Inspection failures on jobs that skipped roughs",
    ],
    johnNote:
      "If an HOA already said yes, you still do not have a city permit. Start the city conversation on purpose.",
    nearby: ["gilbert", "tempe", "mesa"],
  },
  {
    slug: "gilbert",
    name: "Gilbert",
    county: "Maricopa County",
    department: "Town of Gilbert Development Services",
    portal: "Gilbert permit portal",
    portalUrl: "https://www.gilbertaz.gov",
    character:
      "Gilbert looks suburban and regulated. That is accurate. Master-planned communities, HOAs, and a town that enforces its process define most residential files.",
    permitting:
      "Gilbert is not informal. Residential additions, casitas, and remodels are reviewed. Commercial work follows a town process that still surprises teams used to Phoenix volume. The cleanest jobs here are the ones that admitted the town exists before demo day.",
    commonProblems: [
      "Casitas and backyard structures built without a dwelling permit",
      "Kitchen and bath remodels that moved plumbing without a permit",
      "HOA-approved work that the town never saw",
      "Small commercial interiors",
    ],
    johnNote:
      "Gilbert owners often have good intentions and a contractor who treated the town as optional. The town is not optional.",
    nearby: ["chandler", "mesa", "tempe"],
  },
  {
    slug: "surprise",
    name: "Surprise",
    county: "Maricopa County",
    department: "Community Development",
    portal: "City of Surprise permit services",
    portalUrl: "https://www.surpriseaz.gov",
    character:
      "Surprise is a growth-edge West Valley city. Newer housing stock, active residential alteration, and expanding commercial pads.",
    permitting:
      "Newer houses still collect unpermitted patio enclosures, extra rooms, and contractor shortcuts. Growth cities are not automatically lenient. They are busy. Incomplete applications wait in line like everyone else.",
    commonProblems: [
      "Enclosed patios turned into living space",
      "Additions on production lots with tight setbacks",
      "Contractor-left remodels",
      "Small commercial tenant work",
    ],
    johnNote:
      "A ten-year-old house can still have a five-year-old unpermitted room. Age of the subdivision is not a clean title.",
    nearby: ["peoria", "glendale", "goodyear"],
  },
  {
    slug: "goodyear",
    name: "Goodyear",
    county: "Maricopa County",
    department: "Development Services",
    portal: "City of Goodyear permit portal",
    portalUrl: "https://www.goodyearaz.gov",
    character:
      "Goodyear sits on the I-10 growth corridor: master-planned residential, logistics and industrial, and commercial that follows rooftops.",
    permitting:
      "Residential work looks familiar to any West Valley city. Commercial and industrial accessory work does not. Canvas structures, storage, and tenant uses get reviewed as commercial files — because they are.",
    commonProblems: [
      "Residential additions and unpermitted conversions",
      "Commercial accessory and industrial structures",
      "Tenant improvements racing occupancy",
      "Projects that needed engineering and arrived with sketches",
    ],
    johnNote:
      "If the use is commercial, do not walk it in as a residential favor. Goodyear will classify the work by what it is.",
    nearby: ["surprise", "phoenix", "glendale"],
  },
  {
    slug: "tucson",
    name: "Tucson",
    county: "Pima County",
    department: "Planning & Development Services (City) / Pima County Development Services",
    portal: "Tucson Development Center Online / Pima County permits",
    portalUrl: "https://www.tucsonaz.gov/pdsd",
    character:
      "Tucson is a different metro, a different county, and often a different code conversation than Maricopa. Historic neighborhoods, desert lots, and a city/county split that owners get wrong.",
    permitting:
      "The first Tucson question is jurisdiction: City of Tucson or unincorporated Pima County. They are not the same counter. Owner-builder affidavits, historic overlays, and flood or wash constraints show up more often than Valley owners expect. A Maricopa playbook copied south will miss a form.",
    commonProblems: [
      "City versus county confusion on the parcel",
      "Historic or older-neighborhood alterations",
      "Owner-builder custom and addition work",
      "Unpermitted construction found at sale",
    ],
    johnNote:
      "Do not assume the Valley's portal, affidavit, or inspection culture applies. Tucson starts with the jurisdiction line.",
    nearby: [],
  },
];

export function getLocation(slug: string): Location | undefined {
  return locations.find((location) => location.slug === slug);
}
