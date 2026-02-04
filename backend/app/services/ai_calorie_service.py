import re
import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")


def ai_calorie_estimator(food: str) -> int:

    prompt = f"""
    You are a nutrition expert.

    Estimate calories for this food:

    {food}

    Respond with ONLY the calorie number (example: 420)
    """

    try:
        # Try new OpenAI v1.0+ way
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        text = response.choices[0].message.content.strip()
    except Exception as e1:
        # Fallback to old OpenAI < 1.0 way
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            ) 
            text = response.choices[0].message.content.strip()
        except Exception as e2:
            print(f"OpenAI Call Failed: {e1} | {e2}")
            return 0

    # 🔍 Extract first number found
    numbers = re.findall(r"\d+", text)

    if numbers:
        return int(numbers[0])

    return 0
