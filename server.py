import asyncio
import hmac
import logging
import os
from contextlib import suppress
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, BackgroundTasks, FastAPI, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pymongo import ASCENDING, DESCENDING, IndexModel
from starlette.middleware.cors import CORSMiddleware

from journals import CURATED_JOURNALS
from radar import CATEGORY_TERMS, next_top_of_hour, run_cycle

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

INDEXES: dict[str, list[IndexModel]] = {
    "papers": [
        IndexModel([("paper_id", ASCENDING)], name="paper_id", unique=True),
        IndexModel([("PMID", ASCENDING)], name="pmid"),
        IndexModel([("DOI_lower", ASCENDING)], name="doi_lower"),
        IndexModel([("created_at", DESCENDING)], name="created_desc"),
    ],
    "logs": [IndexModel([("execution_time", DESCENDING)], name="time_desc")],
    "cron_runs": [IndexModel([("run_id", ASCENDING)], name="run_id", unique=True)],
}

DEFAULT_SETTINGS = {
    "journal_whitelist": [],
    "research_categories": list(CATEGORY_TERMS),
    "scheduling_enabled": True,
    "last_run_time": "",
}
PAPER_PROJECTION = {"_id": 0, "DOI_lower": 0}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:
                logger.error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)


async def get_settings() -> dict:
    doc = await db.settings.find_one({"_id": "global"}, {"_id": 0}) or {}
    return {**DEFAULT_SETTINGS, **doc}


async def seed_if_empty() -> None:
    """First boot: fill the library with a few real papers fetched live."""
    attempts = 0
    while await db.papers.count_documents({}) < 6 and attempts < 12:
        attempts += 1
        await run_cycle(db, get_settings, "initial")


app = FastAPI()
api = APIRouter(prefix="/api")


class SettingsUpdate(BaseModel):
    journal_whitelist: list[str] | None = None
    research_categories: list[str] | None = None
    scheduling_enabled: bool | None = None


@api.get("/status")
async def status():
    s = await get_settings()
    papers = await db.papers.find({}, {"category": 1, "journal": 1, "figures": 1}).to_list(5000)
    cats = {c: 0 for c in CATEGORY_TERMS}
    journals: dict[str, int] = {}
    for p in papers:
        cats[p["category"]] = cats.get(p["category"], 0) + 1
        journals[p["journal"]] = journals.get(p["journal"], 0) + 1
    return {
        "status": "healthy",
        "stats": {
            "totalPapers": len(papers),
            "categoryCounts": cats,
            "journalCounts": journals,
            "totalFigures": sum(len(p.get("figures", [])) for p in papers),
            "lastRunTime": s["last_run_time"],
            "nextRunTime": next_top_of_hour() if s["scheduling_enabled"] else "",
            "schedulingEnabled": s["scheduling_enabled"],
        },
    }


@api.get("/papers")
async def list_papers():
    papers = await db.papers.find({}, PAPER_PROJECTION).sort("created_at", -1).to_list(5000)
    return {"papers": papers, "total": len(papers)}


@api.get("/papers/{paper_id}")
async def get_paper(paper_id: str):
    p = await db.papers.find_one({"paper_id": paper_id}, PAPER_PROJECTION)
    if not p:
        raise HTTPException(404, "Paper not found")
    return p


@api.get("/logs")
async def logs(limit: int = 50):
    items = await db.logs.find({}, {"_id": 0}).sort("execution_time", -1).limit(min(limit, 200)).to_list(200)
    return {"logs": items}


@api.get("/settings")
async def read_settings():
    return await get_settings()


@api.put("/settings")
async def write_settings(body: SettingsUpdate):
    updates = body.model_dump(exclude_none=True)
    if "journal_whitelist" in updates:
        cleaned = {j.strip() for j in updates["journal_whitelist"] if j.strip()}
        if len(cleaned) > 30 or any(len(j) > 120 or '"' in j for j in cleaned):
            raise HTTPException(400, "Up to 30 journals, each under 120 characters, without quote marks")
        updates["journal_whitelist"] = sorted(cleaned)
    if "research_categories" in updates:
        updates["research_categories"] = [c for c in updates["research_categories"] if c in CATEGORY_TERMS] or list(CATEGORY_TERMS)
    await db.settings.update_one({"_id": "global"}, {"$set": updates}, upsert=True)
    return await get_settings()


@api.post("/automation/run")
async def run_now():
    return await run_cycle(db, get_settings, "manual")


@api.get("/journals")
async def journals():
    return {"journals": [{"name": j["name"], "category": j["category"]} for j in CURATED_JOURNALS]}


@api.get("/export")
async def export():
    return {
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "papers": await db.papers.find({}, PAPER_PROJECTION).to_list(5000),
        "logs": await db.logs.find({}, {"_id": 0}).sort("execution_time", -1).to_list(500),
        "settings": await get_settings(),
    }


async def scheduled_cycle():
    if (await get_settings())["scheduling_enabled"]:
        await run_cycle(db, get_settings, "scheduled")


@api.post("/cron/discover")
async def cron_discover(request: Request, background: BackgroundTasks):
    # Cron endpoints must ack 2xx immediately; enqueue/background the actual work.
    auth = request.headers.get("authorization", "")
    secret = os.environ["WEBHOOK_CRON_SECRET"]
    if not auth.startswith("Bearer ") or not hmac.compare_digest(auth[7:], secret):
        raise HTTPException(401, "Unauthorized")
    try:
        body = await request.json()
    except Exception:
        body = {}
    if not isinstance(body, dict):
        raise HTTPException(400, "Invalid body")
    run_id = request.headers.get("x-webhook-id") or body.get("run_id")
    if run_id:
        res = await db.cron_runs.update_one({"run_id": run_id}, {"$setOnInsert": {"run_id": run_id}}, upsert=True)
        if not res.upserted_id:
            return {"accepted": True, "duplicate": True}
    background.add_task(scheduled_cycle)
    return {"accepted": True}


DOWNLOAD_DIR = ROOT_DIR / "downloads"


@api.get("/code-download/{name}")
async def code_download(name: str):
    path = DOWNLOAD_DIR / name
    if not name.endswith(".zip") or "/" in name or not path.is_file():
        raise HTTPException(404, "Not found")
    return FileResponse(path, filename="vascular-research-radar.zip", media_type="application/zip")


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    app.state.index_task = asyncio.create_task(ensure_indexes())
    app.state.seed_task = asyncio.create_task(seed_if_empty())


@app.on_event("shutdown")
async def shutdown():
    for t in (app.state.index_task, app.state.seed_task):
        t.cancel()
        with suppress(asyncio.CancelledError):
            await t
    client.close()
