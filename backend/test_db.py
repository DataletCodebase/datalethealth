import urllib.request
try:
    resp = urllib.request.urlopen("http://localhost:8001/patient/1", timeout=3)
    print(resp.read().decode('utf-8')[:200])
except Exception as e:
    print("Error:", e)
