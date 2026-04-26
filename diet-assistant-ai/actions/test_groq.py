import requests

API_KEY = "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"

url = "https://api.groq.com/openai/v1/chat/completions"

payload = {
    "model": "llama-3.1-8b-instant",
    "messages": [
        {"role": "user", "content": "Hello"}
    ]
}

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.status_code)
print(response.text)
