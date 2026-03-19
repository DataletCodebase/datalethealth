import base64
import json
import os
import re
from openai import OpenAI


def analyze_food_image(image_bytes: bytes):
    if not image_bytes:
        return {"is_food_visible": False, "food_name": None, "estimated_calories": 0, "confidence": "low"}

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a professional nutrition expert."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """
Analyze this food image.

Return ONLY valid JSON:
{
  "is_food_visible": true/false,
  "food_name": "string",
  "estimated_calories": number,
  "confidence": "low/medium/high"
}

If image is blurry or food not visible clearly,
set is_food_visible to false.
"""
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        temperature=0
    )

    content = response.choices[0].message.content.strip()

    if not content:
        return {"is_food_visible": False, "food_name": None, "estimated_calories": 0, "confidence": "low"}

    # Strip ```json ... ``` or ``` ... ``` wrappers
    content = re.sub(r'^```(?:json)?\s*', '', content)
    content = re.sub(r'\s*```$', '', content)

    return json.loads(content)
