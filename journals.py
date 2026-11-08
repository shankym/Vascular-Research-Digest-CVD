import re

# Curated high-impact journal list carried over from the original repo (names only, no claimed metrics).
CURATED_JOURNALS = [
    {"name": "Circulation", "aliases": ["circulation", "circ"], "category": "Cardiac & Cardiovascular Systems"},
    {"name": "European Heart Journal", "aliases": ["european heart journal", "eur heart j"], "category": "Cardiac & Cardiovascular Systems"},
    {"name": "Journal of the American College of Cardiology", "aliases": ["journal of the american college of cardiology", "j am coll cardiol"], "category": "Cardiac & Cardiovascular Systems"},
    {"name": "Circulation Research", "aliases": ["circulation research", "circ res"], "category": "Vascular Biology"},
    {"name": "Nature Reviews Cardiology", "aliases": ["nature reviews cardiology", "nat rev cardiol", "nature reviews. cardiology"], "category": "Cardiac & Cardiovascular Systems"},
    {"name": "Cardiovascular Research", "aliases": ["cardiovascular research", "cardiovasc res"], "category": "Cardiac & Cardiovascular Systems"},
    {"name": "Hypertension", "aliases": ["hypertension"], "category": "Peripheral Vascular Disease"},
    {"name": "Arteriosclerosis, Thrombosis, and Vascular Biology", "aliases": ["arteriosclerosis, thrombosis, and vascular biology", "arterioscler thromb vasc biol"], "category": "Vascular Biology"},
    {"name": "Journal of Hypertension", "aliases": ["journal of hypertension", "j hypertens"], "category": "Peripheral Vascular Disease"},
    {"name": "Atherosclerosis", "aliases": ["atherosclerosis"], "category": "Peripheral Vascular Disease"},
    {"name": "European Journal of Preventive Cardiology", "aliases": ["european journal of preventive cardiology", "eur j prev cardiol"], "category": "Cardiac & Cardiovascular Systems"},
    {"name": "Journal of the American Heart Association", "aliases": ["journal of the american heart association", "j am heart assoc"], "category": "Cardiac & Cardiovascular Systems"},
    {"name": "The Lancet", "aliases": ["the lancet", "lancet"], "category": "General Medicine"},
    {"name": "JACC: Cardiovascular Imaging", "aliases": ["jacc: cardiovascular imaging", "jacc. cardiovascular imaging", "jacc cardiovasc imaging"], "category": "Cardiac & Cardiovascular Systems"},
    {"name": "JACC: Heart Failure", "aliases": ["jacc: heart failure", "jacc. heart failure", "jacc heart fail"], "category": "Cardiac & Cardiovascular Systems"},
]


def normalize(title: str) -> str:
    t = re.sub(r"\(.*?\)", "", title or "").strip().lower()
    return re.sub(r"\s+", " ", t).rstrip(".").strip()


def match_journal(title: str, allow_list: list[str]) -> str | None:
    """Returns the display name if the journal is on the curated list or the allow-list."""
    n = normalize(title)
    if not n:
        return None
    for j in CURATED_JOURNALS:
        if n in j["aliases"] or n == j["name"].lower():
            return j["name"]
    for w in allow_list:
        if normalize(w) == n:
            return w
    return None


def search_journal_names(allow_list: list[str]) -> list[str]:
    names = [j["name"] for j in CURATED_JOURNALS]
    return names + [w for w in allow_list if w not in names]
