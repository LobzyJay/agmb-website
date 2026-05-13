# AG Mortgage Bank — Marketing Website

Public marketing website for **AG Mortgage Bank Plc**, a Central Bank of Nigeria-licensed Primary Mortgage Bank serving Nigerians since 2004.

Live: **[lobzyjay.github.io/agmb-website](https://lobzyjay.github.io/agmb-website/)**

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Brand hero, product overview, stats, partners |
| Mortgages | `agmb-mortgages.html` | Five mortgage products overview |
| NHF Mortgage | `agmb-products-nhf.html` | National Housing Fund product |
| M-REIF | `agmb-products-m-reif.html` | Mortgage Refinancing product |
| REIF | `agmb-products-reif.html` | Real Estate Investment Finance |
| Construction | `agmb-products-construction.html` | Construction Finance |
| Commercial | `agmb-products-commercial.html` | Commercial Mortgage |
| Calculator | `agmb-calculator.html` | Affordability + repayment calculator |
| About | `agmb-about.html` | Company history, leadership, offices |
| Insights | `agmb-insights.html` | News and articles |
| Contact | `agmb-contact.html` | Get in touch |
| Apply | `agmb-apply.html` | Application start |

---

## Tech Stack

- **[Eleventy 3.1.5](https://www.11ty.dev/)** — Static site generator. HTML + Nunjucks templates.
- **[GSAP 3.12.7](https://gsap.com/)** — Hero entrance animations (line-by-line heading reveal) and ScrollTrigger scroll-reveal.
- **Google Fonts** — Inter (400/500/600), Inter Tight (400/500), Libre Baskerville (400) — loaded with `display=swap` and `preconnect`.
- **GitHub Actions** — CI/CD via `.github/workflows/pages.yml`, deploys to GitHub Pages on every push to `main`.

---

## Project Structure

```
agmb-website/
├── index.html                    # Home page
├── agmb-*.html                   # 11 inner pages
│
├── _includes/
│   ├── header.njk                # Shared nav (GSAP CDN, shared.css, site.js)
│   ├── footer.njk                # Shared footer
│   └── partners-track.njk        # Partner logos marquee (single source of truth)
│
├── assets/
│   ├── css/
│   │   └── shared.css            # Nav, transitions, scroll-reveal, FOUC prevention
│   ├── js/
│   │   └── site.js               # GSAP animations (heading reveal, scroll, fallback)
│   └── images/                   # All site images (28 files)
│
├── partners/                     # Partner logo files (9 logos × SVG/PNG)
│
├── .github/
│   └── workflows/
│       └── pages.yml             # GitHub Pages deploy workflow
│
├── .eleventy.js                  # Eleventy config (flat URLs, asset passthrough)
├── .eleventyignore               # Excludes node_modules, _site, markdown docs
├── .gitignore
└── package.json                  # @11ty/eleventy dependency
```

---

## Local Development

```bash
# Install dependencies
npm install

# Build once
npx @11ty/eleventy

# Preview built site
npm run preview          # → http://localhost:8765

# Live-reload dev server
npm run dev              # → http://localhost:8080
```

---

## Deployment

Pushes to `main` trigger the GitHub Actions workflow automatically:

1. Checkout → install Node 20 → `npm ci`
2. `npx @11ty/eleventy` → builds to `_site/`
3. Upload `_site/` as Pages artifact → deploy

**First-time setup:** GitHub → Settings → Pages → Source → **GitHub Actions**

---

## Partner Logos

All 9 partner logos live in `partners/`. To update a logo:

1. Replace the file in `partners/` (keep the same filename)
2. If the new file has a **white background** (not transparent), add `class="logo--has-bg"` to its `<img>` in `_includes/partners-track.njk` — this applies a CSS filter that makes the white background invisible on the dark marquee

Both home and about pages pull from the same `partners-track.njk` partial — update once, both pages update.

---

## Branding

| Token | Value |
|-------|-------|
| Navy deep | `#061A2E` |
| Cream warm | `#FAF3E8` |
| Gold vivid | `#C8972A` |
| Navy vivid | `#1F4FA8` |
| Forest green | `#14613A` |

Fonts: **Inter** (body, UI) · **Libre Baskerville** (editorial `<em>` accents)

---

*AG Mortgage Bank Plc · CBN-licensed PMB · ISO 9001:2015 certified · NDIC insured*
