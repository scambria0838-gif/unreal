import { problems, type ProblemId } from "@/lib/problems";

export type ConciergeRole = "user" | "assistant";

export type ConciergeMessage = {
  role: ConciergeRole;
  content: string;
};

export type LeadDraft = {
  name?: string;
  phone?: string;
  city?: string;
  propertyType?: string;
  category: string;
};

const disclaimer =
  "I am not a building official and I cannot promise a permit, a lifted red tag, or a legal outcome. Requirements differ by city and county. This is a construction conversation, not legal advice.";

type Rule = {
  id: ProblemId;
  keys: string[];
};

const rules: Rule[] = [
  { id: "red-tag", keys: ["red tag", "redtag", "red-tag", "nov", "notice of violation"] },
  {
    id: "city-stopped",
    keys: ["stop work", "stop-work", "stopped my", "shut down", "shut my"],
  },
  {
    id: "contractor-no-permit",
    keys: ["didn't pull", "did not pull", "never pulled", "no permit", "without a permit"],
  },
  {
    id: "contractor-left",
    keys: ["left the project", "walked off", "abandoned", "contractor left", "gc left"],
  },
  { id: "drawings", keys: ["drawing", "as-built", "as built", "cad", "plans", "blueprint"] },
  {
    id: "owner-builder",
    keys: ["owner builder", "owner-builder", "my own gc", "own general", "be my own"],
  },
  { id: "commercial", keys: ["tenant improvement", "ti ", "commercial", "suite", "build-out", "buildout"] },
  { id: "building-home", keys: ["building a home", "custom home", "new construction", "new house"] },
  { id: "remodel", keys: ["remodel", "renovation", "kitchen", "bathroom", "addition"] },
  { id: "need-permit", keys: ["need a permit", "pull a permit", "permit help"] },
  { id: "second-opinion", keys: ["second opinion", "not sure if", "review my"] },
];

export function classify(text: string): ProblemId {
  const hay = text.toLowerCase();
  for (const rule of rules) {
    if (rule.keys.some((key) => hay.includes(key))) {
      return rule.id;
    }
  }
  return "unknown";
}

function extractCity(text: string): string | undefined {
  const cities = [
    "phoenix",
    "scottsdale",
    "cave creek",
    "glendale",
    "peoria",
    "tempe",
    "mesa",
    "chandler",
    "gilbert",
    "surprise",
    "goodyear",
    "tucson",
    "buckeye",
    "maricopa",
  ];
  const hay = text.toLowerCase();
  return cities.find((city) => hay.includes(city));
}

export function replyTo(history: ConciergeMessage[], incoming: string): {
  reply: string;
  category: ProblemId;
  leadReady: boolean;
  lead: LeadDraft;
} {
  const category = classify(
    `${incoming} ${history.map((message) => message.content).join(" ")}`,
  );
  const problem = problems.find((item) => item.id === category) ?? problems[11];
  const city = extractCity(incoming);
  const askedContact = history.some((message) =>
    message.content.toLowerCase().includes("name and a direct number"),
  );
  const phoneMatch = incoming.match(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  const nameMatch = incoming.match(
    /(?:i'm|i am|name is|this is)\s+([A-Za-z][A-Za-z'-]{1,20}(?:\s+[A-Za-z][A-Za-z'-]{1,20})?)/i,
  );

  if (askedContact && (phoneMatch || nameMatch)) {
    return {
      reply: `Received. John or the office will use that to follow up. If this is urgent — red tag, stop-work, or a city deadline — call 602-526-2299 now.\n\nYou can also send photos, the notice, and plans through the project review form. ${disclaimer}`,
      category,
      leadReady: true,
      lead: {
        name: nameMatch?.[1],
        phone: phoneMatch?.[0],
        city,
        category: problem.label,
      },
    };
  }

  const turns = history.filter((message) => message.role === "user").length;

  if (turns === 0) {
    return {
      reply: `${problem.headline}\n\n${problem.body}\n\n${problem.next}\n\nTo point this at the right path: which city or county is the property in, and has construction already started?\n\n${disclaimer}`,
      category,
      leadReady: false,
      lead: { city, category: problem.label },
    };
  }

  if (turns === 1) {
    return {
      reply: `${city ? `If this is ${city[0].toUpperCase()}${city.slice(1)}, the local review culture matters. ` : ""}I still need two facts before a consultation is useful: residential or commercial, and whether the city has already posted a notice, called, or emailed you.\n\nIf you have the tag, permit paperwork, or photos, upload them on the project review form. If you want John on the calendar, leave a name and a direct number.\n\n${disclaimer}`,
      category,
      leadReady: false,
      lead: { city, category: problem.label },
    };
  }

  return {
    reply: `That is enough to know this belongs in a live review, not a longer chat. Use Request Project Review, or call John at 602-526-2299.\n\nLeave a name and a direct number here if you want a callback. ${disclaimer}`,
    category,
    leadReady: false,
    lead: { city, category: problem.label },
  };
}

export const starterPrompts = [
  "The city red-tagged my addition.",
  "My contractor never pulled permits.",
  "I want to remodel but be my own GC.",
  "I bought a house with an unpermitted room.",
];
