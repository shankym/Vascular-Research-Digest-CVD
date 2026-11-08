# Vascular Research Radar

A free web app that finds one new arterial stiffness or cardiovascular research paper every hour from PubMed and Europe PMC, both free. It keeps only papers from a curated list of high-impact journals and shows each paper's real abstract, with the conclusion highlighted, plus its real figures when the paper is free to read.

It has no AI, no paid APIs and no sign-in.

## Structure
- `backend/` is the FastAPI server, using Python 3.11 and MongoDB.
  - `server.py` contains the API routes, all under `/api`.
  - `radar.py` does the discovery: Europe PMC and PubMed search, abstract parsing and figure extraction.
  - `journals.py` holds the curated journal list.
- `frontend/` is the React app, using Create React App and Tailwind. Saved papers, read marks and notes are kept in the browser's localStorage.
- `.emergent/crons.yml` sets up the hourly schedule on Emergent. It calls `POST /api/cron/discover`.

## Run it yourself
1. Backend:
   ```
   cd backend
   pip install -r requirements.txt
   cp .env.example .env    # then fill in the values
   uvicorn server:app --host 0.0.0.0 --port 8001
   ```
2. Frontend:
   ```
   cd frontend
   yarn install
   cp .env.example .env    # set REACT_APP_BACKEND_URL to your backend URL
   yarn start
   ```
3. Hourly search: outside Emergent, use any scheduler (cron, GitHub Actions, cron-job.org) to send a request every hour:
   ```
   curl -X POST "$BACKEND_URL/api/cron/discover" -H "Authorization: Bearer $WEBHOOK_CRON_SECRET"
   ```
   You can also tap "Run now" in the app at any time.

On first start, the backend fetches about 6 real papers automatically.

For research reading only. Not medical advice.
