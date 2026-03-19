import os
import httpx
from typing import Optional, Literal

AI_MODE: Literal["gpt", "gemini", "search"] = os.getenv("AI_MODE", "search")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# 🧠 Fallback summary in case of API/network failure
FALLBACK_MSG = (
    "Unable to fetch detailed nutrition data right now. "
    "Please consult your dietician before consuming this item."
)


# 🧩 MAIN FUNCTION
async def analyze_food_for_kidney_patient(food_name: str, labs: dict) -> str:
    """
    Dynamically analyze whether a given food/drink is kidney-safe.
    Uses GPT, Gemini, or DuckDuckGo search (fallback).
    """

    # Create medical context based on lab data
    context = []
    if labs.get("creatinine", 0) > 1.5:
        context.append("The patient has impaired kidney function.")
    if labs.get("potassium", 0) > 5.0:
        context.append("The patient has hyperkalemia (high potassium).")
    if labs.get("urea", 0) > 40:
        context.append("The patient has elevated urea levels.")
    if labs.get("sodium", 0) < 135:
        context.append("The patient has low sodium levels.")

    medical_context = " ".join(context) or "Kidney parameters are stable."

    # Choose reasoning source
    if AI_MODE == "gpt" and OPENAI_API_KEY:
        return await _ask_openai(food_name, medical_context)
    elif AI_MODE == "gemini" and GEMINI_API_KEY:
        return await _ask_gemini(food_name, medical_context)
    else:
        return await _fallback_search(food_name, medical_context)


# ---------------- GPT Integration ---------------- #
async def _ask_openai(food_name: str, context: str) -> str:
    try:
        import openai
        openai.api_key = OPENAI_API_KEY

        prompt = f"""
        You are a nephrology diet assistant. Analyze if "{food_name}" is safe for a kidney patient.
        Consider this context: {context}.
        Respond in this format:
        - Composition summary (key nutrients)
        - Risk level (Safe / Moderate / Avoid)
        - Reason for decision (especially focusing on potassium, sodium, protein, phosphorus, sugar)
        """

        completion = await openai.ChatCompletion.acreate(
            model="gpt-4-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
        )

        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"OpenAI error: {e}"


# ---------------- Gemini Integration ---------------- #
async def _ask_gemini(food_name: str, context: str) -> str:
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}",
                json={
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": f"Analyze if {food_name} is safe for kidney patient with context: {context}. "
                                            f"Include composition, risk level (Safe/Moderate/Avoid), and reasoning."
                                }
                            ]
                        }
                    ]
                },
                timeout=20,
            )
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        return f"Gemini error: {e}"


# ---------------- Fallback Web Search ---------------- #
async def _fallback_search(food_name: str, context: str) -> str:
    try:
        url = f"https://api.duckduckgo.com/?q={food_name}+nutrition+facts&format=json"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=10)
            data = resp.json()
            abstract = data.get("AbstractText")
            return (
                f"Search summary: {abstract or 'No detailed info found.'}\n\n"
                f"Medical context: {context}\n"
                f"Recommendation: Consume moderately and consult your doctor."
            )
    except Exception:
        return FALLBACK_MSG
