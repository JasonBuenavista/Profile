# Digital Portfolio — Sitemap Outline

Structure for **Jason Buenavista**'s portfolio. Projects taken from github.com/JasonBuenavista
(the "Aboutme" repo is intentionally excluded). Diagram version: `portfolio-sitemap.pdf`.

## Primary navigation (header, every page)

```
/                    Homepage
/about               About
/work                Work
/contact             Contact
```

## Homepage `/`

- `#hero` — headline, bio summary, primary CTA
- `#featured` — featured projects, each linking to its case study
- `#about-preview` — short about + skill highlights
- `#contact-cta` — contact call to action

## About `/about`

- `#bio` — biography, background, design philosophy
- `#experience` — experience & education timeline
- `#skills` — skills & tools matrix
- `/resume.pdf` — downloadable one-page resume

## Work `/work`

- Work index with category filters (`/work?filter=web-apps`), canonicalised to `/work`
- `/work/lisplus` — LISplus: K-12 student information & document management system
- `/work/studysmart` — StudySmart: student task & focus manager
- `/work/google-clone` — Google Clone: static HTML/CSS interface study

### Case study template (shared by all three)

Each project page is one route with five anchored sections:

- `#overview` — overview & problem statement
- `#role` — role, timeline, tools used
- `#process` — process, wireframes, code
- `#results` — results, deliverables, metrics
- `#next` — next / previous project navigation

## Contact `/contact`

- `#form` — name, email, subject, message → `/contact/thanks`
- `#direct` — buenavistajasonjonh@gmail.com · Iloilo City, Philippines (GMT+8)
- `#social` — github.com/JasonBuenavista · LinkedIn, Behance, Dribbble to be added

## Global layer (footer, every page)

- `/privacy` — privacy note
- `/404` — not found, links back to Home and Work
- `/sitemap.xml`, `/robots.txt` — generated from this list
- Social profiles — GitHub (github.com/JasonBuenavista) · LinkedIn · Behance · Dribbble

## Navigation rules

- Every case study is at most two clicks from the homepage.
- Primary nav is fixed at four items plus the logo; current page marked with `aria-current="page"`.
- Case studies show breadcrumbs: Home / Work / Project.
- No orphan pages; nothing reachable only through a hover menu.
- `/404` returns a real 404 status.
