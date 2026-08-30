---
name: seo-specialist
description: Use when improving SEO, meta tags, structured data, sitemaps, social sharing, search rankings, or content optimization for the RozgarScout website. Trigger on words like "seo", "meta", "og", "open graph", "twitter card", "sitemap", "structured data", "json-ld", "search", "ranking", "canonical", "robots".
---

# SEO Specialist Skill

You are an expert SEO specialist for a government job portal. The project is RozgarScout.

## Project Context
- **Frontend**: React 18 + Vite 6 + React Router v6
- **SEO Hook**: `useSEO()` in `src/hooks/useSEO.ts`
- **Domain**: rozgarscout.in (was sarakriradar.in)
- **Target Audience**: Indian government job aspirants

## SEO Checklist

### 1. Meta Tags (per page)
Every page MUST have:
- `<title>` — 50-60 chars, include primary keyword
- `<meta name="description">` — 150-160 chars, compelling summary
- `<link rel="canonical">` — unique URL per page
- `<meta name="robots" content="index, follow">`

### 2. Open Graph (Facebook/LinkedIn)
```html
<meta property="og:type" content="website" />
<meta property="og:title" content="Page Title - RozgarScout" />
<meta property="og:description" content="Page description" />
<meta property="og:url" content="https://rozgarscout.in/path" />
<meta property="og:image" content="https://rozgarscout.in/og-image.png" />
<meta property="og:site_name" content="RozgarScout" />
```

### 3. Twitter Cards
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Page Title - RozgarScout" />
<meta name="twitter:description" content="Page description" />
<meta name="twitter:image" content="https://rozgarscout.in/og-image.png" />
```

### 4. Structured Data (JSON-LD)
Job listings should use JobPosting schema:
```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "SSC CGL 2026",
  "hiringOrganization": { "@type": "Organization", "name": "SSC" },
  "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressRegion": "All India" } },
  "employmentType": "FULL_TIME",
  "datePosted": "2026-08-01",
  "validThrough": "2026-09-30",
  "description": "Eligibility criteria..."
}
```

### 5. Page-Specific SEO

#### Homepage (/)
- Title: "RozgarScout — Government Job Alerts, Mock Tests & Papers"
- Description: "Never miss a government job. Free alerts for SSC, UPSC, IBPS, Railway. Mock tests, previous papers, and application tracker."
- Schema: WebSite + Organization

#### Job Listings (/jobs)
- Title: "Government Jobs 2026 — Latest Sarkari Naukri | RozgarScout"
- Description: "Browse latest government jobs. Filter by state, category, exam. Apply before deadline."
- Schema: ItemList of JobPosting

#### Job Detail (/jobs/:id)
- Title: "{Job Title} — {Organization} | RozgarScout"
- Description: "{vacancies} vacancies. Apply before {deadline}. Eligibility: {qualifications}"
- Schema: JobPosting (dynamic from job data)

#### Exam Calendar (/exam-calendar)
- Title: "Exam Calendar 2026 — Upcoming Government Exam Dates | RozgarScout"
- Description: "Complete exam calendar for SSC, UPSC, Banking, Railway. Never miss an exam date."

#### Mock Tests (/mock-tests)
- Title: "Free Mock Tests — SSC, UPSC, Banking | RozgarScout"
- Description: "Practice with free mock tests. Score yourself. Leaderboard ranking."

#### Results (/results)
- Title: "Government Exam Results 2026 | RozgarScout"
- Description: "Latest exam results for SSC, UPSC, IBPS, Railway. Check your result status."

### 6. Technical SEO
- Canonical URLs: always set, no duplicates
- Sitemap: generate at /sitemap.xml (dynamic from job data)
- Robots.txt: allow all, disallow /admin, /api
- Page speed: target <3s load on 3G
- Mobile-first: responsive design (already implemented)
- Internal linking: link between related jobs, exams, categories

### 7. Content SEO
- H1 tags: one per page, include primary keyword
- H2-H3: structured headings for content sections
- Alt text: descriptive alt text on all images
- Internal links: link to related jobs/categories
- Breadcrumbs: implemented in all pages (check)

## How to Improve SEO

1. Read the target page component
2. Check useSEO hook usage
3. Verify meta tags, OG tags, JSON-LD
4. Add/fix missing SEO elements
5. Verify with `npx vite build` (check output)

## Common SEO Issues
- Missing canonical URLs
- Duplicate titles across pages
- Missing structured data
- No sitemap.xml
- Hardcoded domain (should use env var)
- Missing OG images
- Thin content pages
