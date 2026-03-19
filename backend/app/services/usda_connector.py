# backend/app/services/usda_connector.py
import os
import re
import json
import logging
import difflib
from typing import Optional, Dict, Any, List

import httpx

logger = logging.getLogger("usda_connector")
logger.setLevel(logging.INFO)

USDA_API_KEY = os.getenv("USDA_API_KEY")
USDA_API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"


def _normalize_text(s: Optional[str]) -> str:
    if not s:
        return ""
    s = s.lower()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _tokenize(s: str) -> List[str]:
    return [t for t in re.findall(r"[a-z0-9]+", s.lower()) if len(t) > 1]


def _extract_nutrients(food_obj: Dict[str, Any]) -> Dict[str, Optional[float]]:
    """
    Extract numeric nutrient values from USDA food object.
    Handles typical nutrientName variants (Protein, Potassium, Phosphorus, Sodium).
    Returns values or None.
    """
    nutrients = {}
    entries = food_obj.get("foodNutrients") or []
    # Map keys we care about to possible substrings in nutrientName
    mapping = {
        "protein": ["protein"],
        "potassium": ["potassium", "k"],
        "phosphorus": ["phosphorus", "phosphorous"],
        "sodium": ["sodium", "salt"],
    }
    # build a name->value map (last occurrence wins)
    name_map = {}
    for n in entries:
        name = n.get("nutrientName") or n.get("name") or ""
        value = n.get("value")
        # skip non-numeric
        try:
            val = float(value) if value is not None else None
        except Exception:
            val = None
        name_map[name.lower()] = val

    # helper: find nutrient by substring match
    for key, substrs in mapping.items():
        found = None
        for nm, val in name_map.items():
            for sub in substrs:
                if sub in nm:
                    found = val
                    break
            if found is not None:
                break
        nutrients[key] = found

    return nutrients


def _score_candidate(query_tokens: List[str], desc: str) -> float:
    """
    Score candidate by:
     - token overlap (each token present in desc contributes)
     - fuzzy similarity between joined tokens and description
    """
    desc_norm = _normalize_text(desc)
    desc_tokens = set(_tokenize(desc_norm))
    token_score = sum(1.0 for t in query_tokens if t in desc_tokens)

    # fuzzy score (0..1)
    q_join = " ".join(query_tokens)
    if not q_join:
        fuzzy = 0.0
    else:
        fuzzy = difflib.SequenceMatcher(None, q_join, desc_norm).ratio()

    # weighted sum (token presence more important)
    return token_score * 3.0 + fuzzy


async def get_usda_nutrition(food_name: str) -> Optional[Dict[str, Optional[float]]]:
    """
    Query USDA FoodData Central for a food_name, choose best match, and return:
      { description, protein (g), potassium (mg), phosphorus (mg), sodium (mg) }
    Returns None if no suitable result found or on error.
    """
    if not USDA_API_KEY:
        logger.warning("USDA_API_KEY not configured.")
        return None

    if not food_name or not food_name.strip():
        return None

    params = {
        "query": food_name,
        "pageSize": 50,      # fetch more candidates so we can pick best match
        "api_key": USDA_API_KEY,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(USDA_API_URL, params=params)
            if resp.status_code != 200:
                logger.warning("USDA API returned status %s: %s", resp.status_code, resp.text[:300])
                return None
            data = resp.json()
    except Exception as e:
        logger.exception("Error querying USDA API: %s", e)
        return None

    foods = data.get("foods") or []
    if not foods:
        logger.info("USDA: no foods found for query '%s'", food_name)
        return None

    # prepare query tokens
    q_norm = _normalize_text(food_name)
    q_tokens = _tokenize(q_norm)

    # Score each candidate and pick best one
    scored = []
    for f in foods:
        desc = f.get("description") or f.get("lowercaseDescription") or f.get("name") or ""
        score = _score_candidate(q_tokens, desc)
        scored.append((score, f))

    # sort by score desc
    scored.sort(key=lambda x: x[0], reverse=True)

    # pick top candidate
    top_score, top_food = scored[0]
    # if score is very low, no good match
    if top_score <= 0 and len(q_tokens) > 0:
        # fallback: try exact substring match
        for s, f in scored:
            d = (f.get("description") or "").lower()
            if any(t in d for t in q_tokens):
                top_food = f
                break
        else:
            logger.info("USDA: top candidate score low (%.3f) for '%s'; returning None", top_score, food_name)
            return None

    # extract nutrients
    nutrients = _extract_nutrients(top_food)

    # Build normalized result
    result = {
        "description": top_food.get("description") or top_food.get("lowercaseDescription") or top_food.get("name"),
        "protein": nutrients.get("protein"),
        "potassium": nutrients.get("potassium"),
        "phosphorus": nutrients.get("phosphorus"),
        "sodium": nutrients.get("sodium"),
        # include the raw USDA object for debugging if needed
        "_raw": top_food,
    }

    logger.info("USDA selected '%s' (score=%.3f) for query '%s'", result["description"], top_score, food_name)
    return result
