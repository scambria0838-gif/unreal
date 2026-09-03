# JLS Development Enterprises

Premium website for **John Scatterday** and **JLS Development Enterprises Inc.**

Arizona ROC #167786 · 602-526-2299

Positioning: *The expert you call when the project gets complicated.*  
Phrase: *From red tag to green light.*

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion (reduced-motion aware)
- File-based content for services, cities, and intelligence
- Zod-validated review intake and Ask John concierge

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
```

## What is verified vs pending

Published on the site:

- Legal name, ROC #167786, KB-2 Dual classification
- License originally issued August 21, 2001
- John Samuel Scatterday as qualifying party / officer
- Phone 602-526-2299
- Scottsdale mailing address from public corporate records
- 30+ years in construction (owner-provided in the brief)

Not published until John authorizes each claim:

- Celebrity or corporate client names
- Project counts, dollar totals, “zero complaints”
- Testimonials (none manufactured)
- Carlina Home Remodeling LLC (separate legal entity; left off the public site)

Portfolio and case-study templates are designed and empty on purpose.

## Lead system

- `/review` — project triage
- `/ask-john` — construction concierge (not a building official)
- `tel:+16025262299` and `sms:+16025262299`
- Sticky mobile call bar
- Hostinger intake: `POST /review-intake.php` (writes `leads/reviews.log` and emails `review@jlsprojects.com`)

## Hostinger (jlsprojects.com)

The production build is a static export (`out/`) for Hostinger shared hosting.

```bash
npm run build
# upload the contents of out/ into public_html
```

Or, with FTP credentials in the environment:

```bash
export HOSTINGER_FTP_HOST=ftp.jlsprojects.com
export HOSTINGER_FTP_USER=...
export HOSTINGER_FTP_PASSWORD=...
export HOSTINGER_FTP_DIR=/public_html
bash scripts/deploy-hostinger.sh
```

Point the domain A record to the Hostinger server IP in hPanel (or Cloudflare DNS). Enable SSL.

## SEO

- Organization, LocalBusiness/GeneralContractor, Service, FAQ, Breadcrumb, Article schema
- `sitemap.ts` + `robots.ts`
- Canonical URLs and Open Graph image
- Unique location pages for 12 Arizona markets

## License verification

[Arizona ROC contractor search](https://roc.az.gov/contractor-search) — look up **167786**.
