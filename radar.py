import asyncio
import html
import logging
import random
import re
import uuid
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta

import httpx

from journals import match_journal, search_journal_names

logger = logging.getLogger("radar")

EPMC = "https://www.ebi.ac.uk/europepmc/webservices/rest"
EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
HEADERS = {"User-Agent": "VascularResearchRadar/2.0 (free academic research digest)"}

CATEGORY_TERMS = {
    "Arterial Stiffness": ['"arterial stiffness"', '"pulse wave velocity"', '"vascular ageing"', '"vascular aging"',
                           '"central blood pressure"', '"aortic distensibility"', '"augmentation index"'],
    "Endothelial Function": ['"flow-mediated dilation"', '"endothelial dysfunction"', '"microvascular function"',
                             '"vascular remodeling"'],
    "Cardiovascular Disease": ['"coronary artery disease"', '"heart failure with preserved ejection fraction"',
                               '"atherosclerosis"', '"resistant hypertension"', '"vascular calcification"'],
    "Related Research": ['"vascular biomarkers"', '"arterial compliance"', '"cardiovascular epidemiology"',
                         '"cardiovascular risk prediction"'],
}

TYPE_PRIORITY = [
    ("meta-analysis", "Meta-analysis"),
    ("systematic review", "Systematic review"),
    ("randomized controlled trial", "Randomised controlled trial"),
    ("clinical trial", "Clinical trial"),
    ("observational study", "Observational study"),
    ("review", "Review"),
    ("practice guideline", "Guideline"),
    ("guideline", "Guideline"),
    ("editorial", "Editorial"),
    ("letter", "Letter"),
    ("comment", "Comment"),
]

CONCLUSION_RE = re.compile(r"conclusion|interpretation", re.I)

_lock = asyncio.Lock()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def next_top_of_hour() -> str:
    n = datetime.now(timezone.utc)
    return (n.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)).isoformat()


def clean(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text or "")
    text = re.sub(r"\s+", " ", html.unescape(text)).strip()
    return re.sub(r"\s+([.,;:)\]])", r"\1", re.sub(r"([(\[])\s+", r"\1", text))


def article_type(types: list[str]) -> str:
    low = [t.lower() for t in types]
    for key, label in TYPE_PRIORITY:
        if any(key in t for t in low):
            return label
    return "Research article"


def parse_epmc_abstract(raw: str) -> list[dict]:
    if not raw:
        return []
    parts = re.split(r"<h4>(.*?)</h4>", raw)
    sections = []
    if clean(parts[0]):
        sections.append({"label": "", "text": clean(parts[0])})
    for i in range(1, len(parts) - 1, 2):
        txt = clean(parts[i + 1])
        if txt:
            sections.append({"label": clean(parts[i]).rstrip(":").title(), "text": txt})
    return sections


def itertext(el) -> str:
    return clean(" ".join(el.itertext())) if el is not None else ""


def parse_pubmed_article(art) -> dict:
    """Parses a <PubmedArticle> element into our metadata dict."""
    med = art.find("MedlineCitation")
    a = med.find("Article")
    pmid = med.findtext("PMID", "")
    sections = []
    for at in a.findall("Abstract/AbstractText"):
        txt = itertext(at)
        if txt:
            sections.append({"label": (at.get("Label") or "").title(), "text": txt})
    ids = {i.get("IdType"): (i.text or "") for i in art.findall("PubmedData/ArticleIdList/ArticleId")}
    authors = []
    for au in a.findall("AuthorList/Author"):
        name = " ".join(x for x in [au.findtext("ForeName"), au.findtext("LastName")] if x) or au.findtext("CollectiveName")
        if name:
            authors.append(name)
    date = ""
    ad = a.find("ArticleDate")
    if ad is not None and ad.findtext("Year") and ad.findtext("Month") and ad.findtext("Day"):
        date = f"{ad.findtext('Year')}-{int(ad.findtext('Month')):02d}-{int(ad.findtext('Day')):02d}"
    else:
        date = a.findtext("Journal/JournalIssue/PubDate/Year", "") or ""
    return {
        "title": itertext(a.find("ArticleTitle")).rstrip("."),
        "journal_raw": a.findtext("Journal/Title", ""),
        "authors": authors,
        "publication_date": date,
        "DOI": ids.get("doi", ""),
        "PMID": pmid,
        "PMCID": ids.get("pmc", ""),
        "article_type": article_type([t.text or "" for t in a.findall("PublicationTypeList/PublicationType")]),
        "abstract_sections": sections,
    }


async def get_json(client: httpx.AsyncClient, url: str, params: dict) -> dict | None:
    try:
        r = await client.get(url, params=params, timeout=15)
        return r.json() if r.status_code == 200 else None
    except Exception as exc:
        logger.warning("GET %s failed: %s", url, exc)
        return None


async def pubmed_details(client: httpx.AsyncClient, pmid: str) -> dict | None:
    try:
        r = await client.get(f"{EUTILS}/efetch.fcgi", params={"db": "pubmed", "id": pmid, "retmode": "xml"}, timeout=15)
        art = ET.fromstring(r.text).find("PubmedArticle")
        return parse_pubmed_article(art) if art is not None else None
    except Exception as exc:
        logger.warning("PubMed efetch %s failed: %s", pmid, exc)
        return None


async def citation_count(client: httpx.AsyncClient, pmid: str) -> int | None:
    data = await get_json(client, f"{EPMC}/search", {"query": f"EXT_ID:{pmid} AND SRC:MED", "format": "json", "pageSize": 1})
    res = (data or {}).get("resultList", {}).get("result", [])
    return int(res[0].get("citedByCount", 0)) if res else None


def epmc_to_meta(item: dict) -> dict:
    return {
        "title": clean(item.get("title", "")).rstrip("."),
        "journal_raw": item.get("journalInfo", {}).get("journal", {}).get("title", "") or item.get("journalTitle", ""),
        "authors": [a.get("fullName") for a in item.get("authorList", {}).get("author", []) if a.get("fullName")],
        "publication_date": item.get("firstPublicationDate") or item.get("pubYear") or "",
        "DOI": item.get("doi", ""),
        "PMID": item.get("pmid", ""),
        "PMCID": item.get("pmcid", ""),
        "article_type": article_type(item.get("pubTypeList", {}).get("pubType", [])),
        "abstract_sections": parse_epmc_abstract(item.get("abstractText", "")),
        "citation_count": int(item.get("citedByCount", 0)),
        "is_open_access": item.get("isOpenAccess") == "Y",
    }


async def search_europe_pmc(client, term: str, journals: list[str], strategy: str) -> list[dict]:
    jclause = " OR ".join(f'JOURNAL:"{j}"' for j in journals)
    q = f"({term}) AND ({jclause}) AND HAS_ABSTRACT:Y AND SRC:MED"
    year = datetime.now(timezone.utc).year
    sort = None
    if strategy == "recent":
        q += f" AND PUB_YEAR:[{year - 2} TO {year}]"
    elif strategy == "review":
        q += ' AND (PUB_TYPE:"Review" OR PUB_TYPE:"Meta-Analysis" OR PUB_TYPE:"Systematic Review")'
        sort = "CITED desc"
    else:
        sort = "CITED desc"
    params = {"query": q, "format": "json", "pageSize": 25, "resultType": "core"}
    if sort:
        params["sort"] = sort
    data = await get_json(client, f"{EPMC}/search", params)
    return [epmc_to_meta(i) for i in (data or {}).get("resultList", {}).get("result", [])]


async def search_pubmed(client, term: str, journals: list[str]) -> list[str]:
    jclause = " OR ".join(f'"{j}"[Journal]' for j in journals)
    year = datetime.now(timezone.utc).year
    q = f'({term}) AND ({jclause}) AND hasabstract[text] AND ("{year - 5}"[dp] : "{year}"[dp])'
    data = await get_json(client, f"{EUTILS}/esearch.fcgi", {"db": "pubmed", "term": q, "retmode": "json", "retmax": 20, "sort": "pub_date"})
    return (data or {}).get("esearchresult", {}).get("idlist", [])


async def extract_figures(client: httpx.AsyncClient, pmcid: str) -> list[dict]:
    """Real figures from the PMC open-access record: captions from JATS XML, image URLs from the PMC article page."""
    if not pmcid:
        return []
    num = pmcid.upper().replace("PMC", "")
    article_url = f"https://pmc.ncbi.nlm.nih.gov/articles/PMC{num}/"
    try:
        xr = await client.get(f"{EUTILS}/efetch.fcgi", params={"db": "pmc", "id": num}, timeout=20)
        root = ET.fromstring(xr.text)
        figs = []
        for fig in root.iter("fig"):
            g = fig.find(".//graphic")
            href = g.get("{http://www.w3.org/1999/xlink}href") if g is not None else None
            if href:
                figs.append({"label": itertext(fig.find("label")).rstrip(".:"), "caption": itertext(fig.find("caption")), "href": href})
            if len(figs) >= 3:
                break
        if not figs:
            return []
        page = await client.get(article_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=45, follow_redirects=True)
        urls = re.findall(r"https://cdn\.ncbi\.nlm\.nih\.gov/pmc/blobs/[^\"'\s]+", page.text)
        out = []
        for i, f in enumerate(figs):
            stem = f["href"].rsplit(".", 1)[0]
            img = next((u for u in urls if u.rsplit("/", 1)[-1].rsplit(".", 1)[0] == stem), None)
            if img:
                out.append({"id": f"{pmcid}-fig{i + 1}", "label": f["label"] or f"Figure {i + 1}", "caption": f["caption"],
                            "image_url": img, "article_url": article_url})
        return out
    except Exception as exc:
        logger.warning("Figure extraction for %s failed: %s", pmcid, exc)
        return []


async def find_candidate(db, settings: dict) -> tuple[dict | None, str]:
    allow = settings.get("journal_whitelist", [])
    journals = search_journal_names(allow)
    cats = settings.get("research_categories") or list(CATEGORY_TERMS)
    category = random.choice(cats)
    term = random.choice(CATEGORY_TERMS.get(category, CATEGORY_TERMS["Arterial Stiffness"]))

    async def exists(m):
        ors = [{"PMID": m["PMID"]}] if m.get("PMID") else []
        if m.get("DOI"):
            ors.append({"DOI_lower": m["DOI"].lower()})
        return bool(ors) and await db.papers.find_one({"$or": ors}, {"_id": 1}) is not None

    async with httpx.AsyncClient(headers=HEADERS) as client:
        strategies = ["highly_cited", "recent", "review"]
        random.shuffle(strategies)
        for strategy in strategies:
            for m in await search_europe_pmc(client, term, journals, strategy):
                name = match_journal(m["journal_raw"], allow)
                if not name or not (m["PMID"] or m["DOI"]) or await exists(m):
                    continue
                if m["PMID"]:
                    detail = await pubmed_details(client, m["PMID"])
                    if detail and detail["abstract_sections"]:
                        m["abstract_sections"] = detail["abstract_sections"]
                        m["authors"] = detail["authors"] or m["authors"]
                m.update(journal=name, category=category, search_term=term.strip('"'), source="Europe PMC")
                m["figures"] = await extract_figures(client, m["PMCID"])
                return m, f"Europe PMC ({strategy.replace('_', ' ')}) · term {term}"
        for pmid in await search_pubmed(client, term, journals):
            if await db.papers.find_one({"PMID": pmid}, {"_id": 1}):
                continue
            m = await pubmed_details(client, pmid)
            if not m:
                continue
            name = match_journal(m["journal_raw"], allow)
            if not name or await exists(m):
                continue
            m.update(journal=name, category=category, search_term=term.strip('"'), source="PubMed",
                     citation_count=await citation_count(client, pmid), is_open_access=bool(m["PMCID"]))
            m["figures"] = await extract_figures(client, m["PMCID"])
            return m, f"PubMed · term {term}"
    return None, f"No new eligible paper for {category} / {term}"


def build_record(m: dict) -> dict:
    sections = m.get("abstract_sections", [])
    conclusion = next((s["text"] for s in sections if CONCLUSION_RE.search(s["label"])), "")
    authors = m.get("authors", [])
    return {
        "paper_id": f"paper-{uuid.uuid4().hex[:12]}",
        "title": m["title"],
        "authors": authors[:12],
        "authors_total": len(authors),
        "journal": m["journal"],
        "publication_date": m.get("publication_date", ""),
        "DOI": m.get("DOI", ""),
        "DOI_lower": (m.get("DOI") or "").lower(),
        "PMID": m.get("PMID", ""),
        "PMCID": m.get("PMCID", ""),
        "article_type": m.get("article_type", "Research article"),
        "category": m["category"],
        "search_term": m.get("search_term", ""),
        "abstract_sections": sections,
        "conclusion": conclusion,
        "is_open_access": bool(m.get("is_open_access") or m.get("PMCID")),
        "citation_count": m.get("citation_count"),
        "figures": m.get("figures", []),
        "source": m.get("source", ""),
        "created_at": now_iso(),
    }


async def add_log(db, status: str, paper: str, journal: str = "", category: str = "", details: str = ""):
    await db.logs.insert_one({"id": uuid.uuid4().hex, "execution_time": now_iso(), "execution_status": status,
                              "selected_paper": paper, "journal": journal, "category": category, "details": details})


async def run_cycle(db, get_settings, trigger: str = "scheduled") -> dict:
    if _lock.locked():
        return {"success": False, "message": "A discovery run is already in progress. Please wait a moment."}
    async with _lock:
        settings = await get_settings()
        try:
            m, reason = await find_candidate(db, settings)
            if not m:
                await add_log(db, "warning", "No new paper", details=reason)
                return {"success": True, "message": "No new eligible paper this time. Already-saved papers are skipped."}
            rec = build_record(m)
            await db.papers.insert_one(dict(rec))
            await add_log(db, "success", rec["title"], rec["journal"], rec["category"], f"{trigger} · {reason}")
            rec.pop("_id", None)
            rec.pop("DOI_lower", None)
            return {"success": True, "message": f"New paper added from {rec['journal']}.", "paper": rec}
        except Exception as exc:
            logger.exception("Cycle failed")
            await add_log(db, "error", "Run failed", details=str(exc)[:300])
            return {"success": False, "message": "The discovery run failed. Please try again shortly."}
        finally:
            await db.settings.update_one({"_id": "global"}, {"$set": {"last_run_time": now_iso()}}, upsert=True)
