# Vascular Research Radar — PRD

## Original request
"If I connect to GitHub repo can u build an app?" — continue `shankym/Vascular-Research-Digest-CVD` as a free app (no AI, no paid services, no sign-in), real content only, larger mobile-friendly reading type.

## Architecture
- Backend: FastAPI (`/app/backend/server.py`, `radar.py`, `journals.py`), MongoDB collections `papers`, `logs`, `settings`, `cron_runs`.
- Discovery: Europe PMC search (highly cited / recent / review strategies) → PubMed efetch for structured abstract → PMC JATS + PMC page for real figure images. PubMed esearch fallback.
- Hourly schedule: platform cron `.emergent/crons.yml` → `POST /api/cron/discover` (Bearer WEBHOOK_CRON_SECRET, idempotent by run id, background work).
- First boot seeds ~6 real papers live.
- Frontend: React (CRA) + Tailwind, routes `/`, `/today`, `/paper/:id`, `/library`, `/saved`, `/settings`. Literata reading font (18–19px), Public Sans UI, IBM Plex Mono. Dark mode.
- Saved / read / notes in localStorage (`vrr-history-v1`), per device. Settings shared server-side.

## Personas
Clinicians, researchers, students following vascular / CVD research, often on phones.

## Implemented (Nov 2026)
- Ported all screens: Dashboard, Today, Library (search + topic/journal/type/year filters + sorts), Saved & notes, Paper detail (conclusion highlight, labelled abstract sections, real figures or "View figures in full paper", source links, citation modal APA/Vancouver/BibTeX, print), Settings (hourly on/off, Run now, topics, extra journals, curated list, JSON backup incl. device data, search history logs).
- Audit fixes: removed Gemini + template analysis, fake authenticity badge, placeholder figures, fake abstracts, fake dates/authors, hard-coded "1,790 citations", "Clarivate JCR" + impact-factor claims, unused IF threshold, curated registry/seed papers with unverifiable text; per-device saved/notes.
- Tested: backend 11/11, frontend flows pass; mobile overflow + settings race fixed.

## Backlog
- P1: Shareable / printable weekly digest page
- P1: "New since last visit" marker
- P2: More topic presets and custom search terms
- P2: Push updated code to GitHub (user via Save to GitHub)
