import urllib.request, json, urllib.error
req = urllib.request.Request(
    'http://localhost:8001/ask-agent/ask/', 
    data=json.dumps({'patient_id': 1, 'question': 'What should I eat?', 'language': 'en', 'condition_context': []}).encode('utf-8'), 
    headers={'Content-Type': 'application/json'}
)
try:
    resp = urllib.request.urlopen(req, timeout=40)
    print(resp.read().decode('utf-8')[:500])
except Exception as e:
    print('ERROR:', e)
