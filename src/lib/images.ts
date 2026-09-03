export type Photo = {
  src: string;
  alt: string;
  credit: string;
};

const u = (id: string, extras = "") =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2400&q=75${extras}`;

export const photos = {
  hero: {
    src: u("photo-1600585154526-990dced4db0d"),
    alt: "Modern desert-adjacent residence with deep overhangs and stone walls at dusk",
    credit: "Unsplash",
  },
  heroSecondary: {
    src: u("photo-1487958449943-2429e8be8625"),
    alt: "Concrete and glass commercial architecture",
    credit: "Unsplash",
  },
  plans: {
    src: u("photo-1503387762-592deb58ef4e"),
    alt: "Architectural construction drawings on a table",
    credit: "Unsplash",
  },
  site: {
    src: u("photo-1541888946425-d81bb19240f5"),
    alt: "Active structural construction with steel and formwork",
    credit: "Unsplash",
  },
  kitchen: {
    src: u("photo-1600585152220-90363fe7e115"),
    alt: "Contemporary kitchen with stone, wood, and architectural lighting",
    credit: "Unsplash",
  },
  bath: {
    src: u("photo-1600566753190-17f0baa2a6c3"),
    alt: "Modern bathroom with stone surfaces and restrained detailing",
    credit: "Unsplash",
  },
  living: {
    src: u("photo-1600210492486-724fe5c67fb0"),
    alt: "Luxury residential interior with architectural volume",
    credit: "Unsplash",
  },
  commercial: {
    src: u("photo-1486406149926-2bb2c78fb3f0"),
    alt: "Commercial building facade in glass and steel",
    credit: "Unsplash",
  },
  meeting: {
    src: u("photo-1454165804606-c3d57bc86b40"),
    alt: "Project review meeting over drawings and documents",
    credit: "Unsplash",
  },
  framing: {
    src: u("photo-1504307651254-35680f356dfd"),
    alt: "Wood framing on an active residential construction site",
    credit: "Unsplash",
  },
  ti: {
    src: u("photo-1497366216548-37526070297c"),
    alt: "Commercial tenant improvement interior",
    credit: "Unsplash",
  },
  desert: {
    src: u("photo-1542314831-068cd1dbfeeb"),
    alt: "Arizona desert landscape at dusk",
    credit: "Unsplash",
  },
  facade: {
    src: u("photo-1613490493576-7fde63acd811"),
    alt: "Luxury modern residence with pool and architectural massing",
    credit: "Unsplash",
  },
  concrete: {
    src: u("photo-1511818966892-06d74d0c5d3f"),
    alt: "Raw concrete architectural structure",
    credit: "Unsplash",
  },
  night: {
    src: u("photo-1600047509807-ba8f99d2cdbc"),
    alt: "Night view of a contemporary house with warm interior light",
    credit: "Unsplash",
  },
} as const satisfies Record<string, Photo>;
