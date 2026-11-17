// Generates sitemap.html — a 3-page A4 landscape portfolio sitemap (diagram, inventory, pathways).
// Content reflects Jason Buenavista's public repos (github.com/JasonBuenavista), excluding "Aboutme".
// Layout is hand-composed on a fixed 1123 x 794 px canvas (A4 landscape @96dpi) so the
// printed PDF is pixel-predictable. Run: node build/build-sitemap.mjs [--pages]
import { writeFileSync, mkdirSync } from "node:fs";

const W = 1123, H = 794;

// ---------- geometry ----------
const C1 = { x: 34, w: 196 };   // homepage
const C2 = { x: 260, w: 190 };  // primary pages
const C3 = { x: 482, w: 208 };  // sub-pages / projects
const C4 = { x: 722, w: 344 };  // shared case-study template sections

const HOME = { y: 332, h: 176 };
const ABOUT_P = { y: 161, h: 62 };
const WORK_P = { y: 384, h: 62 };
const CONTACT_P = { y: 599, h: 62 };

const ABOUT_LINKS = [
  { y: 100, title: "Biography &amp; Background", url: "#bio", sub: "Story, motivation, design philosophy", dashed: true },
  { y: 148, title: "Experience &amp; Education", url: "#experience", sub: "Roles and study, newest first", dashed: true },
  { y: 196, title: "Skills &amp; Tools", url: "#skills", sub: "Capability matrix: design, code, tools", dashed: true },
  { y: 243, h: 42, title: "Resume", url: "/resume.pdf", sub: "Downloadable PDF, opens in new tab", badge: "PDF" },
];

const CONTACT_LINKS = [
  { y: 546, h: 52, title: "Contact Form", url: "#form", sub: "Name · Email · Subject · Message", extra: "on submit → /contact/thanks" },
  { y: 602, h: 48, title: "Direct Contact", url: "#direct", sub: "<span class=\"mono\">buenavistajasonjonh@gmail.com</span>", extra: "Iloilo City, Philippines · GMT+8" },
  { y: 654, h: 48, title: "Social &amp; Professional", url: "#social", sub: "<span class=\"mono\">github.com/JasonBuenavista</span>", extra: "LinkedIn · Behance · Dribbble — add when live" },
];

const PROJECTS = [
  { y: 392, name: "LISplus", url: "/work/lisplus", sub: "K-12 student records · JavaScript · team of 4" },
  { y: 446, name: "StudySmart", url: "/work/studysmart", sub: "Tasks, files, Pomodoro · Supabase" },
  { y: 500, name: "Google Clone", url: "/work/google-clone", sub: "Static HTML + CSS · interface study" },
];

const CASE_SECTIONS = [
  { y: 302, title: "Overview &amp; problem statement", url: "#overview", n: "01" },
  { y: 349, title: "Role, timeline &amp; tools used", url: "#role", n: "02" },
  { y: 396, title: "Process, wireframes, code", url: "#process", n: "03" },
  { y: 443, title: "Results, deliverables, metrics", url: "#results", n: "04" },
  { y: 490, title: "Next / previous project", url: "#next", n: "05" },
];

// ---------- helpers ----------
const cy = (n) => n.y + n.h / 2;
const curve = (x1, y1, x2, y2, dashed = false) => {
  const dx = (x2 - x1) * 0.5;
  return `<path d="M${x1} ${y1} C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}" fill="none" stroke="#C9C6BD" stroke-width="1" ${dashed ? 'stroke-dasharray="2 3"' : ""} stroke-linecap="round"/>`;
};

const leaf = (n) => `
<div class="node leaf${n.dashed ? " anchor" : ""}" style="left:${C3.x}px;top:${n.y}px;width:${C3.w}px;height:${n.h || 40}px">
  <div class="leaf-top">
    <span class="leaf-title">${n.title}</span>
    <span class="url">${n.url}</span>
    ${n.badge ? `<span class="badge">${n.badge}</span>` : ""}
  </div>
  <div class="leaf-sub">${n.sub}</div>
  ${n.extra ? `<div class="leaf-extra">${n.extra}</div>` : ""}
</div>`;

const clink = (n) => `
<div class="node leaf${n.dashed ? " anchor" : ""}" style="left:${C3.x}px;top:${n.y}px;width:${C3.w}px;height:${n.h || 40}px">
  <div class="leaf-top">
    <span class="leaf-title">${n.title}</span>
    <span class="url">${n.url}</span>
  </div>
  <div class="leaf-sub">${n.sub}</div>
  ${n.extra ? `<div class="leaf-extra">${n.extra}</div>` : ""}
</div>`;

const primary = (p, num, title, sub, url) => `
<div class="node primary" style="left:${C2.x}px;top:${p.y}px;width:${C2.w}px;height:${p.h}px">
  <div class="node-top"><span class="num">${num}</span><span class="url">${url}</span></div>
  <div class="node-title">${title}</div>
  <div class="node-sub">${sub}</div>
</div>`;

const project = (p, i) => `
<div class="node project" style="left:${C3.x}px;top:${p.y}px;width:${C3.w}px;height:48px">
  <div class="leaf-top"><span class="leaf-title">${p.name}</span><span class="url">${p.url}</span></div>
  <div class="leaf-sub">${p.sub}</div>
</div>`;

const svg = [];
// homepage trunk (one fan to the three primary pages)
svg.push(`<path d="M${C1.x + C1.w} ${cy(HOME)} H245 M245 192 V630 M245 192 H${C2.x} M245 415 H${C2.x} M245 630 H${C2.x}" fill="none" stroke="#C9C6BD" stroke-width="1" stroke-linecap="round"/>`);
ABOUT_LINKS.forEach((n) => svg.push(curve(C2.x + C2.w, cy(ABOUT_P), C3.x, n.y + (n.h || 40) / 2, !!n.dashed)));
// work -> index/filters + the three project pages (bus, so four children stay legible)
svg.push(`<path d="M${C2.x + C2.w} 415 H466 M466 342 V524 M466 342 H${C3.x} M466 416 H${C3.x} M466 470 H${C3.x} M466 524 H${C3.x}" fill="none" stroke="#C9C6BD" stroke-width="1" stroke-linecap="round"/>`);
// shared case-study template brace
svg.push(`<path d="M${C4.x - 16} 302 V528 ${CASE_SECTIONS.map((n) => `M${C4.x - 16} ${n.y + 19} H${C4.x}`).join(" ")}" fill="none" stroke="#D3D0C7" stroke-width="1" stroke-dasharray="2 3" stroke-linecap="round"/>`);
CONTACT_LINKS.forEach((n) => svg.push(curve(C2.x + C2.w, cy(CONTACT_P), C3.x, n.y + (n.h || 40) / 2)));

const legendItem = (mark, label) => `<span class="lg"><span class="sw">${mark}</span>${label}</span>`;

const page1 = `
<section class="page">
  <header class="p-head">
    <div class="eyebrow">Portfolio architecture · site map</div>
    <h1>Digital Portfolio — Site Map</h1>
    <div class="meta">Primary navigation: Home · About · Work · Contact &nbsp;&nbsp;4 primary pages · 3 case studies · 1 shared case-study template · 15 in-page sections</div>
    <div class="pmark">01 <span>/ 03</span></div>
    <div class="ver">v1.2 · Nov 2026</div>
  </header>

  <svg class="links" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${svg.join("")}</svg>

  <!-- homepage -->
  <div class="node home" style="left:${C1.x}px;top:${HOME.y}px;width:${C1.w}px;height:${HOME.h}px">
    <div class="node-top"><span class="num light">01</span><span class="url light">/</span></div>
    <div class="node-title lg">Homepage</div>
    <div class="node-sub light">Identity, value proposition, route into the work</div>
    <div class="home-rule"></div>
    <div class="home-sec"><span class="dash"></span>Hero — headline, bio, primary CTA<span class="a">#hero</span></div>
    <div class="home-sec"><span class="dash"></span>Featured projects → case studies<span class="a">#featured</span></div>
    <div class="home-sec"><span class="dash"></span>About &amp; skills snapshot<span class="a">#about-preview</span></div>
    <div class="home-sec"><span class="dash"></span>Contact CTA band<span class="a">#contact-cta</span></div>
  </div>

  ${primary(ABOUT_P, "02", "About", "Story, background, credentials", "/about")}
  ${primary(WORK_P, "03", "Work", "3 projects · 1 shared template", "/work")}
  ${primary(CONTACT_P, "04", "Contact", "Turn interest into a conversation", "/contact")}

  ${ABOUT_LINKS.map(leaf).join("")}

  <!-- work: index + filters -->
  <div class="node leaf filters" style="left:${C3.x}px;top:300px;width:${C3.w}px;height:84px">
    <div class="leaf-top"><span class="leaf-title">Work Index</span><span class="url">/work</span></div>
    <div class="filterline">All &nbsp;·&nbsp; Web Apps &nbsp;·&nbsp; UI Studies &nbsp;·&nbsp; Coursework</div>
    <div class="leaf-extra">filters resolve to <span class="mono">/work?filter=web-apps</span></div>
    <div class="leaf-extra">three project cards, newest first</div>
  </div>

  ${PROJECTS.map(project).join("")}

  <div class="c4-caption">Shared case-study template — all three project pages</div>
  ${CASE_SECTIONS.map((n) => `
  <div class="srow" style="left:${C4.x}px;top:${n.y}px;width:${C4.w}px;height:38px">
    <span class="idx">${n.n}</span><span class="srow-title">${n.title}</span><span class="url">${n.url}</span>
  </div>`).join("")}

  ${CONTACT_LINKS.map(clink).join("")}

  <!-- global / utility layer -->
  <div class="band">
    <div class="band-label">Global layer<span>linked from the footer on every page</span></div>
    <div class="band-links">
      <span class="mono">/privacy</span><span class="sep">·</span>
      <span class="mono">/404</span><span class="sep">·</span>
      <span class="mono">/sitemap.xml</span><span class="sep">·</span>
      <span class="mono">/robots.txt</span><span class="sep">·</span>
      <span>LinkedIn · GitHub · Behance · Dribbble</span>
    </div>
  </div>

  <div class="legend">
    ${legendItem(`<span class="l-fill-dark"></span>`, "Primary page — header nav")}
    ${legendItem(`<span class="l-hair"></span>`, "Case study — nested route")}
    ${legendItem(`<span class="l-rule"></span>`, "In-page section — anchor")}
    ${legendItem(`<span class="l-dash"></span>`, "Utility — footer, legal, SEO files")}
  </div>
</section>`;

// ---------- page 2: inventory ----------
const rows = [
  ["1", "Homepage", "/", "Primary", "Establish identity and value proposition; route visitors into the work.", "Hero (headline, bio, CTA) · featured projects (all 3) · about/skills snapshot · contact CTA band", "Positioning in &lt;h1&gt; + &lt;title&gt;; Person JSON-LD; LCP = hero"],
  ["2", "About", "/about", "Primary", "Share story, background, philosophy, credentials.", "Bio · experience &amp; education timeline · skills matrix · resume download · contact CTA", "&lt;title&gt; built for name searches; Person schema"],
  ["2.1", "↳ Biography", "/about#bio", "Section", "Answer who you are and how you think.", "Portrait, 2–3 paragraphs, design philosophy", "Included in About's crawlable HTML — no tab-only content"],
  ["2.2", "↳ Experience", "/about#experience", "Section", "Prove credibility with roles and study.", "Timeline: organisation, role, dates, one outcome each", "Keep dates in text, not images"],
  ["2.3", "↳ Skills", "/about#skills", "Section", "Let recruiters match you to a brief.", "Matrix: HTML/CSS, JavaScript, Supabase, documentation", "Text-based, not a JPEG chart"],
  ["2.4", "↳ Resume", "/resume.pdf", "Secondary", "Give a printable one-pager.", "PDF, one page, matching the on-site facts", "Unique title in metadata; link with download; HTML summary stays on-page"],
  ["3", "Work index", "/work", "Primary", "Exhibit the projects and allow quick scanning.", "3 case-study cards · category filters (Web Apps, UI Studies, Coursework)", "Filtered views canonicalise to /work"],
  ["3.1", "↳ LISplus", "/work/lisplus", "Case study", "Show a full system: records, documents, roles, reports.", "Lead developer / DBA in a team of 4 · JavaScript + LocalStorage · RBAC · LRN search · SF10 / SF9 / PSA document previews · printable principal reports", "Live at protoype-for-li-splus.vercel.app · credit the three collaborators · state plainly that it is a prototype without a real database"],
  ["3.2", "↳ StudySmart", "/work/studysmart", "Case study", "Show product thinking and auth/storage integration.", "Supabase Auth + Storage · per-user data filtering · Pomodoro timer · PDF and image previews", "Live on GitHub Pages · say isolation is client-side, not database RLS — the README is honest about it"],
  ["3.3", "↳ Google Clone", "/work/google-clone", "Case study", "Prove UI precision: layout, type and spacing.", "HTML + CSS only, no JavaScript · search-homepage replica", "Label it a study, not client work; no audience or metrics to claim"],
  ["3.x", "↳ Shared sections", "/work/[slug]#overview …#next", "Section", "Keep the three projects comparable.", "5 anchored sections + sticky section nav + next/previous", "Every page must fill its own Results section; no boilerplate copy"],
  ["4", "Contact", "/contact", "Primary", "Make it effortless to get in touch.", "Form (name, email, subject, message) · buenavistajasonjonh@gmail.com · Iloilo City, GMT+8 · github.com/JasonBuenavista", "Form labels tied to inputs; success page is noindex"],
  ["4.1", "↳ Form success", "/contact/thanks", "Secondary", "Confirm receipt and set expectations.", "Confirmation copy · reply time · link back to work", "noindex, follow; excluded from sitemap.xml"],
  ["5", "Utility", "/privacy · /404", "Utility", "Trust, legal and error recovery.", "Privacy note (analytics, form data) · 404 with links to Home and Work", "404 returns a real 404 status"],
  ["6", "Site files", "/sitemap.xml · /robots.txt", "Utility", "Make the structure machine-readable.", "XML sitemap generated from this page list", "Resubmit in Search Console after slug changes"],
];

const table = `
<table class="inv">
  <thead><tr>
    <th class="c-num">#</th><th class="c-page">Page &amp; URL</th><th class="c-lvl">Level</th>
    <th class="c-purp">Purpose</th><th class="c-comp">Key components</th><th class="c-seo">SEO / UX notes</th>
  </tr></thead>
  <tbody>
  ${rows.map(([n, name, url, lvl, purp, comp, seo]) => `
    <tr class="${lvl.toLowerCase().replace(/\\s+/g, "")}">
      <td class="c-num">${n}</td>
      <td class="c-page"><b>${name.replace(/^↳+ ?/, "")}</b><span class="turl">${url}</span></td>
      <td class="c-lvl"><span class="lv">${lvl}</span></td>
      <td>${purp}</td>
      <td>${comp}</td>
      <td class="dim">${seo}</td>
    </tr>`).join("")}
  </tbody>
</table>`;

const page2 = `
<section class="page">
  <header class="p-head">
    <div class="eyebrow">Inventory · page by page</div>
    <h1>Page Specification</h1>
    <div class="meta">Every route, its navigation level, its job, and what has to be on it — written around the three projects in github.com/JasonBuenavista.</div>
    <div class="pmark">02 <span>/ 03</span></div>
  </header>
  ${table}
  <div class="pfoot">
    <div><span class="pf-label">Footer, every page</span>About · Work · Contact · Resume (PDF) · Privacy · Email &nbsp;—&nbsp; GitHub · LinkedIn · Behance · Dribbble</div>
    <div><span class="pf-label">Header</span>Logo → / &nbsp;·&nbsp; Home &nbsp;·&nbsp; About &nbsp;·&nbsp; Work &nbsp;·&nbsp; Contact &nbsp;—&nbsp; current page marked with <span class="mono">aria-current="page"</span></div>
  </div>
</section>`;

// ---------- page 3: pathways ----------
const step = (label, url, act = false, ext = false) =>
  `<span class="pc${act ? " act" : ""}${ext ? " ext" : ""}"><b>${label}</b><span class="purl">${url}</span></span>`;
const arrow = `<span class="parrow">→</span>`;

const pathways = [
  {
    name: "Recruiter / hiring manager", goal: "Screen fast, verify credentials, make contact.",
    chain: [step("Home", "/"), step("About", "/about"), step("Resume", "/resume.pdf", true), step("Contact", "/contact", true)],
    note: "Resume downloadable above the fold in About. The form asks for nothing a CV already answers. Target: 3 clicks, under 90 seconds.",
    signal: "Signal — resume download, or a message that references the About page.",
  },
  {
    name: "Prospective client", goal: "Judge the thinking, then enquire about a project.",
    chain: [step("Home", "/"), step("Featured: LISplus", "/work/lisplus"), step("Results", "/work/lisplus#results"), step("Next: StudySmart", "/work/studysmart"), step("Contact", "/contact#form", true)],
    note: "Next/previous links keep a client reading instead of hitting the nav. Every case study ends with results plus a persistent contact CTA.",
    signal: "Signal — an enquiry that names the project they read about.",
  },
  {
    name: "Recruiter from GitHub", goal: "Arrive from the profile, judge the code, then read the story.",
    chain: [step("GitHub profile", "external", false, true), step("StudySmart", "/work/studysmart"), step("Work index", "/work"), step("About", "/about#bio")],
    note: "GitHub is your strongest referral source: each repo links to its case study, and the case study links back to the index and to you.",
    signal: "Signal — referral traffic that continues into the index or About instead of bouncing.",
  },
  {
    name: "Returning visitor", goal: "Re-find one project, filtered by discipline.",
    chain: [step("Home", "/"), step("Work index", "/work"), step("Filter", "/work?filter=web-apps"), step("StudySmart", "/work/studysmart")],
    note: "Filters persist in the URL so a shortlist can be bookmarked or shared. Filter state never hides content from crawlers.",
    signal: "Signal — a filtered view revisited, bookmarked, or forwarded.",
  },
];

const page3 = `
<section class="page">
  <header class="p-head">
    <div class="eyebrow">Pathways · rules</div>
    <h1>User Pathways &amp; Navigation Rules</h1>
    <div class="meta">Who arrives, what they need, and the shortest route the structure gives them.</div>
    <div class="pmark">03 <span>/ 03</span></div>
  </header>

  <div class="flows">
    ${pathways.map((p, i) => `
      <div class="flow">
        <div class="flow-head"><span class="fnum">0${i + 1}</span><span class="flow-name">${p.name}</span><span class="flow-goal">${p.goal}</span></div>
        <div class="flow-chain">${p.chain.join(arrow)}</div>
        <div class="flow-note">${p.note}</div>
        <div class="flow-signal">${p.signal}</div>
      </div>`).join("")}
  </div>

  <div class="cols">
    <div class="col">
      <h3>Navigation rules</h3>
      <ul>
        <li>Every case study is reachable from the homepage in <b>two clicks</b>.</li>
        <li>Primary nav never changes between pages and never exceeds four items plus the logo.</li>
        <li>Case studies carry breadcrumbs: <span class="mono">Home / Work / LISplus</span>.</li>
        <li>No orphan pages: every project is linked from <span class="mono">/work</span> and the homepage.</li>
        <li>The 404 page returns a real 404 status and offers Home and Work.</li>
        <li>Mobile keeps the same four items in a drawer; nothing lives only in a hover menu.</li>
      </ul>
    </div>
    <div class="col">
      <h3>Technical &amp; SEO checklist</h3>
      <ul>
        <li><span class="mono">sitemap.xml</span> lists the three project pages; referenced in <span class="mono">robots.txt</span>.</li>
        <li>One canonical URL per page; <span class="mono">?filter=</span> views canonicalise to <span class="mono">/work</span>.</li>
        <li>Unique title and meta description per project; OG image (1200×630) per case study.</li>
        <li>JSON-LD: Person on Home/About, CreativeWork + BreadcrumbList on each project.</li>
        <li>Screenshots of LISplus and StudySmart get descriptive alt text; below-fold images lazy-load.</li>
        <li>Slug changes ship with a 301 map; unfinished projects stay out of the index.</li>
      </ul>
    </div>
  </div>

  <div class="signoff">Structure drawn to A4 landscape · regenerate with <span class="mono">node build/build-sitemap.mjs</span></div>
</section>`;

const pages = [page1, page2, page3];

const CSS = `
  @page { size: 297mm 210mm; margin: 0; }
  * { box-sizing: border-box; }
  :root {
    --ink:#17181A; --ink2:#5B5F66; --muted:#8E8B84; --faint:#ABA79E;
    --hair:#E3E0D8; --hair2:#EDEAE3; --paper:#FFFFFF; --wash:#F6F5F2;
  }
  html, body { margin:0; padding:0; }
  body {
    font-family:"Segoe UI", "Inter", system-ui, -apple-system, sans-serif;
    color:var(--ink); background:#E9E7E1;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
    font-variant-numeric: tabular-nums;
    display:flex; flex-direction:column; align-items:center; gap:22px; padding:22px 0;
  }
  .page {
    position:relative; width:${W}px; height:${H}px; background:var(--paper); overflow:hidden;
    box-shadow:0 6px 20px rgba(23,24,26,.12); page-break-after:always; break-after:page;
  }
  .page:last-child { page-break-after:auto; break-after:auto; }
  @media print {
    body { background:#fff; gap:0; padding:0; display:block; }
    .page { box-shadow:none; }
  }

  /* ---------- header ---------- */
  .p-head { position:absolute; left:34px; right:34px; top:24px; height:68px; }
  .eyebrow { font-size:7px; letter-spacing:2.2px; text-transform:uppercase; color:var(--muted); }
  .p-head h1 {
    font-family: Georgia, "Times New Roman", serif; font-weight:400; font-size:25px;
    letter-spacing:-.3px; margin:7px 0 0; line-height:1.05;
  }
  .p-head .meta { font-size:7.8px; color:var(--ink2); margin-top:7px; letter-spacing:.05px; }
  .pmark { position:absolute; right:0; top:1px; font-family: Georgia, serif; font-size:16px; color:var(--ink); }
  .pmark span { color:#C4C0B6; font-size:11px; }
  .ver { position:absolute; right:0; top:25px; font-size:6.6px; letter-spacing:1.5px; text-transform:uppercase; color:var(--faint); }
  .page::after { content:""; position:absolute; left:34px; right:34px; top:94px; height:1px; background:var(--hair); }

  /* ---------- connectors ---------- */
  svg.links { position:absolute; inset:0; z-index:0; }

  /* ---------- nodes ---------- */
  .node {
    position:absolute; z-index:1; background:#fff; border:1px solid var(--hair); border-radius:2px;
    padding:8px 10px;
  }
  .node-top { display:flex; justify-content:space-between; align-items:baseline; gap:6px; }
  .num { font-family: ui-monospace, Consolas, monospace; font-size:6.4px; letter-spacing:.6px; color:var(--faint); }
  .num.light { color:rgba(255,255,255,.4); }
  .url { font-family: ui-monospace, Consolas, "Courier New", monospace; font-size:7px; color:var(--faint); white-space:nowrap; letter-spacing:-.1px; }
  .url.light { color:rgba(255,255,255,.45); }
  .node-title { font-size:14px; font-weight:600; letter-spacing:-.25px; margin-top:4px; line-height:1.1; }
  .node-title.lg { font-size:17px; }
  .node-sub { font-size:7.4px; line-height:1.35; color:var(--ink2); margin-top:4px; }
  .node-sub.light { color:rgba(255,255,255,.66); }

  .node.home { background:#17181A; border-color:#17181A; color:#FAFAF8; padding:11px 12px; }
  .node.home .node-title { color:#fff; }
  .home-rule { height:1px; background:rgba(255,255,255,.14); margin:9px 0 4px; }
  .home-sec {
    display:flex; align-items:center; gap:6px; font-size:7.4px; color:rgba(255,255,255,.76);
    padding:4.5px 0; border-bottom:1px solid rgba(255,255,255,.07); line-height:1.2;
  }
  .home-sec:last-child { border-bottom:0; }
  .home-sec .dash { width:6px; height:1px; background:rgba(255,255,255,.35); flex:0 0 6px; }
  .home-sec .a { margin-left:auto; font-family: ui-monospace, Consolas, monospace; font-size:6.4px; color:rgba(255,255,255,.36); }

  .node.leaf { padding:7px 9px; }
  .leaf-top { display:flex; align-items:baseline; gap:6px; }
  .leaf-title { font-size:9.2px; font-weight:600; letter-spacing:-.05px; line-height:1.2; }
  .leaf-top .url { margin-left:auto; }
  .leaf-sub { font-size:7.2px; color:var(--ink2); line-height:1.3; margin-top:3px; }
  .leaf-extra { font-size:6.8px; color:var(--faint); margin-top:2px; line-height:1.3; }
  .node.anchor { background:#FCFBF9; border-color:var(--hair2); }
  .mono { font-family: ui-monospace, Consolas, monospace; font-size:.95em; }

  .node.project .leaf-title { font-size:9.6px; }
  .filterline { font-size:7px; color:var(--ink2); margin-top:5px; letter-spacing:.1px; }

  /* case-study template rows: rules only, no boxes */
  .srow {
    position:absolute; z-index:1; display:flex; align-items:center; gap:8px;
    border-top:1px solid var(--hair); padding-top:8px;
  }
  .srow .idx { font-family: ui-monospace, Consolas, monospace; font-size:6.4px; color:var(--faint); }
  .srow-title { font-size:9px; color:var(--ink); letter-spacing:-.05px; }
  .srow .url { margin-left:auto; }
  .c4-caption {
    position:absolute; left:${C4.x}px; top:288px; z-index:2; font-size:6.2px; letter-spacing:1.6px;
    text-transform:uppercase; color:var(--faint);
  }

  .badge { font-family: ui-monospace, Consolas, monospace; font-size:6.2px; letter-spacing:.8px; color:var(--muted); margin-left:6px; }

  /* ---------- global band + legend ---------- */
  .band {
    position:absolute; left:34px; right:57px; top:712px; height:28px; z-index:1;
    display:flex; align-items:center; gap:0; padding:0; border-top:1px solid var(--hair);
  }
  .band-label { display:flex; flex-direction:column; line-height:1.2; }
  .band-label { font-size:6.6px; letter-spacing:1.7px; text-transform:uppercase; color:var(--ink); }
  .band-label span { font-size:6.4px; letter-spacing:0; text-transform:none; color:var(--faint); }
  .band-links { display:flex; align-items:center; gap:7px; margin-left:auto; font-size:6.7px; color:var(--muted); }
  .band-links .sep { color:#D5D2C9; }

  .legend {
    position:absolute; left:34px; right:57px; top:750px; height:38px; z-index:1;
    display:flex; align-items:center; gap:26px; border-top:1px solid var(--hair); padding-top:10px;
  }
  .lg { display:flex; align-items:center; gap:7px; font-size:6.9px; color:var(--muted); letter-spacing:.1px; }
  .lg .sw { display:flex; align-items:center; }
  .l-fill-dark { display:inline-block; width:13px; height:7px; background:#17181A; border-radius:1px; }
  .l-hair { display:inline-block; width:13px; height:7px; border:1px solid #C9C6BD; border-radius:1px; background:#fff; }
  .l-rule { display:inline-block; width:13px; height:7px; border-top:1px solid #C9C6BD; }
  .l-dash { display:inline-block; width:13px; height:7px; border-top:1px dashed #C9C6BD; }

  /* ---------- page 2 ---------- */
  table.inv {
    position:absolute; left:34px; right:57px; top:108px; width:${W - 34 - 57}px;
    border-collapse:collapse; table-layout:fixed;
  }
  table.inv th {
    text-align:left; font-size:6.4px; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted);
    font-weight:400; padding:0 8px 7px 8px; border-bottom:1px solid var(--ink); vertical-align:bottom;
  }
  table.inv td {
    font-size:7.3px; line-height:1.4; color:#45494F; padding:7px 8px; border-bottom:1px solid var(--hair2);
    vertical-align:top;
  }
  table.inv td.c-page b { font-size:8px; color:var(--ink); font-weight:600; display:block; letter-spacing:-.05px; }
  table.inv .turl { display:block; font-family: ui-monospace, Consolas, monospace; font-size:6.9px; color:var(--faint); margin-top:2px; }
  table.inv .c-num { width:32px; font-family: ui-monospace, Consolas, monospace; font-size:6.8px; color:var(--faint); }
  table.inv .c-page { width:146px; }
  table.inv .c-lvl { width:66px; }
  table.inv .c-purp { width:190px; }
  table.inv .c-comp { width:306px; }
  table.inv .dim { color:#6E7278; }
  .lv { font-size:6.1px; letter-spacing:1.3px; text-transform:uppercase; color:var(--faint); white-space:nowrap; }
  tr.primary .lv { color:var(--ink); }
  tr.casestudy .lv { color:#3A3D42; letter-spacing:1.3px; }
  tr.section .lv { color:#B4B0A7; }
  .pfoot {
    position:absolute; left:34px; right:57px; top:706px; border-top:1px solid var(--hair); padding-top:10px;
    font-size:7.1px; line-height:1.75; color:#6E7278;
  }
  .pf-label { font-size:6.3px; letter-spacing:1.4px; text-transform:uppercase; color:var(--ink); margin-right:8px; }

  /* ---------- page 3 ---------- */
  .flows { position:absolute; left:34px; right:57px; top:104px; }
  .flow { border-top:1px solid var(--hair); padding:14px 0 15px; }
  .flow:last-child { border-bottom:1px solid var(--hair); }
  .flow-head { display:flex; align-items:baseline; gap:11px; }
  .fnum { font-family: ui-monospace, Consolas, monospace; font-size:6.4px; color:var(--faint); }
  .flow-name { font-size:9.4px; font-weight:600; letter-spacing:-.05px; }
  .flow-goal { font-size:7.3px; color:var(--muted); }
  .flow-chain { display:flex; align-items:baseline; gap:9px; flex-wrap:wrap; margin:9px 0 7px; }
  .pc { display:flex; align-items:baseline; gap:6px; }
  .pc b { font-size:7.8px; font-weight:500; color:var(--ink); }
  .pc .purl { font-family: ui-monospace, Consolas, monospace; font-size:6.6px; color:var(--faint); }
  .pc.act b { border-bottom:1px solid var(--ink); padding-bottom:1px; }
  .pc.ext b { border-bottom:1px dotted #C4C0B6; padding-bottom:1px; }
  .parrow { color:#CFCBC1; font-size:8px; }
  .flow-note { font-size:7.3px; color:#55595F; line-height:1.5; }
  .flow-signal { font-size:6.8px; color:var(--faint); line-height:1.4; margin-top:4px; letter-spacing:.15px; }

  .cols { position:absolute; left:34px; right:57px; top:522px; display:flex; gap:44px; }
  .col { flex:1; }
  .col h3 {
    font-size:6.6px; letter-spacing:1.9px; text-transform:uppercase; color:var(--ink); font-weight:400;
    margin:0 0 9px; padding-bottom:7px; border-bottom:1px solid var(--ink);
  }
  .col ul { margin:0; padding:0; list-style:none; }
  .col li { font-size:7.3px; line-height:1.55; color:#55595F; padding-left:13px; position:relative; margin-bottom:7px; }
  .col li::before { content:""; position:absolute; left:0; top:5px; width:5px; height:1px; background:#C4C0B6; }
  .col li b { color:var(--ink); font-weight:600; }
  .signoff { position:absolute; left:34px; right:57px; top:748px; font-size:6.6px; color:var(--faint); letter-spacing:.2px;
    border-top:1px solid var(--hair); padding-top:10px; }
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Digital Portfolio — Site Map</title>
<style>${CSS}</style>
</head>
<body>
${pages.join("\n")}
</body>
</html>
`;

writeFileSync("sitemap.html", html, "utf8");
console.log("wrote sitemap.html", html.length, "bytes");

// Exact-size single-page files, used for visual QA and headless screenshots.
if (process.argv.includes("--pages")) {
  mkdirSync("build/preview", { recursive: true });
  pages.forEach((p, i) => {
    writeFileSync(
      `build/preview/page-${i + 1}.html`,
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Page ${i + 1}</title>
<style>${CSS}
body { display:block; padding:0; background:#fff; gap:0; }
.page { box-shadow:none; }
</style></head><body>${p}</body></html>`,
      "utf8"
    );
  });
  console.log("wrote build/preview/page-1..3.html");
}
