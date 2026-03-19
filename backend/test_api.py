import urllib.request
import json
import sys

try:
    response = urllib.request.urlopen('http://localhost:8000/meal-tracking/week/1')
    data = json.loads(response.read())
    print("Status Code: 200")
    print(json.dumps(data, indent=2))
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
