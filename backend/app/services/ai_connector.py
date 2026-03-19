# backend/app/services/ai_connector.py
import os
import aiohttp
import json
import asyncio
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

AI_MODE = os.getenv("AI_MODE", "gemini").lower()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

SEARCH_API_URL = "https://api.duckduckgo.com/?q={query}&format=json&no_html=1"

# Use the model names listed from /v1/models; you found gemini-2.5-flash available.
GEMINI_MODEL_CANDIDATES = [
    "v1beta/models/gemini-2.5-flash:generateContent",
    "v1/models/gemini-2.5-flash:generateContent",
]

# ===== helpers =====
def _flatten_text_from_dict(d: dict) -> str:
    """Collect strings from nested JSON as a last-resort fallback."""
    parts = []
    def rec(obj):
        if isinstance(obj, str):
            parts.append(obj)
        elif isinstance(obj, dict):
            for v in obj.values():
                rec(v)
        elif isinstance(obj, list):
            for i in obj:
                rec(i)
    rec(d)
    return " ".join(p for p in parts if p)[:2500] if parts else ""


async def extract_gemini_text(data: dict) -> Optional[str]:
    """
    Robust extractor for multiple Gemini JSON shapes.
    Returns None if it cannot extract readable text.
    """
    if not isinstance(data, dict):
        return None

    # quick guard: if error present, return helpful string so caller can fallback
    if "error" in data:
        # return an informative message rather than a raw KeyError
        try:
            err_obj = data["error"]
            if isinstance(err_obj, dict):
                err_message = err_obj.get("message") or err_obj.get("status") or str(err_obj)
            else:
                err_message = str(err_obj)
            return f"__GEMINI_ERROR__:{err_message}"
        except Exception:
            return "__GEMINI_ERROR__"

    try:
        # 1) New-style top-level 'output_text' (some Gemini responses)
        if "output_text" in data and isinstance(data["output_text"], str):
            return data["output_text"].strip()

        # 2) Some responses have top-level 'text'
        if "text" in data and isinstance(data["text"], str):
            return data["text"].strip()

        # 3) Old/new "candidates" structures (common)
        if "candidates" in data and isinstance(data["candidates"], list) and data["candidates"]:
            first = data["candidates"][0]
            # sometimes candidate stores content -> parts -> text
            content = first.get("content") if isinstance(first, dict) else None
            if isinstance(content, dict):
                parts = content.get("parts")
                if isinstance(parts, list) and parts:
                    p0 = parts[0]
                    if isinstance(p0, dict):
                        # look for 'text' or 'message'
                        if "text" in p0 and isinstance(p0["text"], str):
                            return p0["text"].strip()
                        if "message" in p0 and isinstance(p0["message"], str):
                            return p0["message"].strip()
            # candidate may be structured differently; try flattening candidate
            cand_flat = _flatten_text_from_dict(first)
            if cand_flat:
                return cand_flat

        # 4) nested 'response' -> 'candidates'
        if "response" in data and isinstance(data["response"], dict):
            resp = data["response"]
            if "candidates" in resp and isinstance(resp["candidates"], list) and resp["candidates"]:
                c0 = resp["candidates"][0]
                content = c0.get("content") if isinstance(c0, dict) else None
                if isinstance(content, dict):
                    parts = content.get("parts")
                    if isinstance(parts, list) and parts:
                        p0 = parts[0]
                        if isinstance(p0, dict) and "text" in p0 and isinstance(p0["text"], str):
                            return p0["text"].strip()
                # flatten fallback
                flat = _flatten_text_from_dict(c0)
                if flat:
                    return flat

        # 5) 'output' array
        if "output" in data:
            out = data["output"]
            if isinstance(out, list):
                texts = [str(x) for x in out if isinstance(x, (str, int, float))]
                if texts:
                    return " ".join(texts)[:2500]
            if isinstance(out, str):
                return out.strip()

        # 6) safety/promptFeedback quick check
        if "promptFeedback" in data and isinstance(data["promptFeedback"], dict):
            pf = data["promptFeedback"]
            reason = pf.get("blockReason") or pf.get("safetyReason")
            if reason:
                return f"__GEMINI_SAFETY__:{reason}"

    except Exception as e:
        # don't crash extraction; return None so caller falls back
        print("⚠️ extract_gemini_text exception:", e)

    # final flatten fallback (collect strings)
    flat = _flatten_text_from_dict(data)
    return flat if flat else None


# ===== network calls =====
async def try_gemini_endpoint(endpoint_path: str, api_key: str, query: str, timeout: int = 12):
    base = "https://generativelanguage.googleapis.com/"
    url = base + endpoint_path + f"?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": (
                            f"You are a concise clinical nutritionist for kidney patients. "
                            f"Provide a short factual summary about '{query}' focusing on potassium, sodium, protein and phosphorus. "
                            f"State 'SAFE', 'LIMIT', or 'AVOID' where appropriate for kidney patients."
                        )
                    }
                ]
            }
        ]
    }
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(url, headers=headers, json=payload, timeout=timeout) as resp:
                # attempt to parse JSON (most responses are JSON)
                try:
                    data = await resp.json()
                except aiohttp.ContentTypeError:
                    text = await resp.text()
                    raise RuntimeError(f"Non-JSON response (status={resp.status}): {text[:1000]}")
                return data
        except Exception as e:
            raise RuntimeError(f"Gemini request failed ({endpoint_path}): {e}")


async def call_openai_gpt(query: str, timeout: int = 18, retries: int = 2) -> str:
    if not OPENAI_API_KEY:
        raise RuntimeError("OpenAI API key not configured.")
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": "You are a medical nutritionist focusing on kidney-safe diets."},
            {"role": "user", "content": query},
        ],
        "temperature": 0.2,
        "max_tokens": 500,
    }
    last_err = None
    for _ in range(retries):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload, timeout=timeout) as resp:
                    data = await resp.json()
                    # typical OpenAI shape
                    if isinstance(data, dict) and "choices" in data and data["choices"]:
                        msg = data["choices"][0].get("message") or {}
                        content = msg.get("content") or msg.get("text")
                        if content:
                            return content.strip()
                    # fallback: return JSON truncated
                    return json.dumps(data)[:1500]
        except Exception as e:
            last_err = e
            await asyncio.sleep(0.5)
            continue
    raise RuntimeError(f"OpenAI GPT call failed: {last_err}")


async def web_search_fallback(query: str) -> str:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(SEARCH_API_URL.format(query=query), timeout=8) as resp:
                data = await resp.json()
                return data.get("AbstractText") or "No detailed info found."
    except Exception as e:
        return f"Search error: {e}"


# ===== unified interface =====
async def get_dynamic_nutrition_info(question: str) -> str:
    """
    Try Gemini first (if configured). If Gemini returns:
      - parsed text -> return that
      - '__GEMINI_ERROR__:' prefix -> treat as failure and fallback
      - '__GEMINI_SAFETY__:' -> return a safety notice (you may want to handle differently)
      - None/unparseable -> fallback to OpenAI or search
    """
    q = (question or "").strip()
    if not q:
        return "No query provided."

    # 1) if AI_MODE explicitly set to 'gpt' or 'search', honor it
    if AI_MODE == "gpt" and OPENAI_API_KEY:
        try:
            return await call_openai_gpt(q)
        except Exception as e:
            return f"GPT error: {e}"
    if AI_MODE == "search":
        return await web_search_fallback(q)

    # 2) Try Gemini (preferred) if key present
    if GEMINI_API_KEY and AI_MODE == "gemini":
        for endpoint in GEMINI_MODEL_CANDIDATES:
            try:
                raw = await try_gemini_endpoint(endpoint, GEMINI_API_KEY, q, timeout=12)
            except Exception as e:
                # log and try next model
                print(f"⚠️ Gemini request error for {endpoint}: {e}")
                continue

            # print trimmed raw JSON to logs for debugging (you can remove later)
            try:
                print("🔍 GEMINI RAW RESPONSE (trimmed):")
                print(json.dumps(raw, indent=2)[:2000])
            except Exception:
                print("🔍 GEMINI RAW RESPONSE (unprintable)")

            extracted = await extract_gemini_text(raw)
            if extracted:
                # check if it's an explicit error token from extractor
                if isinstance(extracted, str) and extracted.startswith("__GEMINI_ERROR__:"):
                    print("⚠️ Gemini returned error message:", extracted)
                    # try next endpoint or fallback
                    continue
                if isinstance(extracted, str) and extracted.startswith("__GEMINI_SAFETY__:"):
                    # safety triggered — return an informative safety message
                    return ("Gemini safety filter triggered for this content. "
                            "Please consult your clinician or try a different query.")
                # good extracted text -> return it
                return extracted

            # otherwise no usable text found - try next model
            print(f"⚠️ Gemini endpoint {endpoint} returned unparseable structure; trying next.")

        # After trying all Gemini endpoints, fall back
        print("🔁 All Gemini endpoints exhausted, falling back to OpenAI (if configured) or web search.")

    # 3) Fallback to OpenAI GPT
    if OPENAI_API_KEY:
        try:
            return await call_openai_gpt(q)
        except Exception as e:
            print("⚠️ OpenAI GPT error:", e)
            # final fallback to web search

    # 4) Final fallback: web search (DuckDuckGo)
    return await web_search_fallback(q)


# ===== Translation helpers & unified translate_text =====

async def call_openai_translate(text: str, target_language: str, timeout: int = 12) -> Optional[str]:
    """
    Use OpenAI Chat Completions to translate (if OPENAI_API_KEY is configured).
    Returns translated text or None on failure.
    """
    if not OPENAI_API_KEY:
        return None

    url = "https://api.openai.com/v1/chat/completions"
    prompt = (
        f"Translate the following text to {target_language}. Return only the translated text, without commentary.\n\n"
        f"Text:\n{text}"
    )
    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": "You are a precise translator. Preserve numeric and measurement values."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.0,
        "max_tokens": 800,
    }
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=payload, timeout=timeout) as resp:
                data = await resp.json()
                if isinstance(data, dict) and "choices" in data and data["choices"]:
                    msg = data["choices"][0].get("message") or {}
                    content = msg.get("content") or msg.get("text")
                    if content:
                        return content.strip()
                # fallback: return flattened JSON chunk
                return json.dumps(data)[:1500]
    except Exception as e:
        print("⚠️ OpenAI translate error:", e)
        return None


async def call_gemini_translate(text: str, target_language: str, timeout: int = 12) -> Optional[str]:
    """
    Use Gemini generative endpoint to ask for translation. Returns translated text or None.
    """
    if not GEMINI_API_KEY:
        return None

    instruction = (
        f"Translate the following text into {target_language}. Keep numeric values and measurements unchanged. "
        f"Return only the translated text.\n\nText:\n{text}"
    )

    for endpoint in GEMINI_MODEL_CANDIDATES:
        try:
            raw = await try_gemini_endpoint(endpoint, GEMINI_API_KEY, instruction, timeout=timeout)
        except Exception as e:
            print(f"⚠️ Gemini translate endpoint error ({endpoint}): {e}")
            continue

        try:
            extracted = await extract_gemini_text(raw)
            if extracted:
                # Many Gemini outputs may include extra newlines or metadata; return the main chunk
                return extracted.strip()
        except Exception as e:
            print("⚠️ Gemini translate extraction error:", e)
            continue

    return None


async def translate_text(text: str, target_language: str = "hi") -> str:
    """
    Unified translation function used by ask_agent.
    - tries OpenAI first if configured, then Gemini.
    - if both fail or no API keys, returns the original text.
    """
    if not text:
        return text or ""

    code = (target_language or "en").strip()
    # If english requested or no-op, return
    if code.lower() in ("en", "english"):
        return text

    # 1) OpenAI
    if OPENAI_API_KEY:
        try:
            translated = await call_openai_translate(text, code)
            if translated:
                return translated
        except Exception as e:
            print("⚠️ translate_text: OpenAI translation failed:", e)

    # 2) Gemini
    if GEMINI_API_KEY:
        try:
            translated = await call_gemini_translate(text, code)
            if translated:
                return translated
        except Exception as e:
            print("⚠️ translate_text: Gemini translation failed:", e)

    # 3) Fallback: return original
    return text
