import urllib.request, json, urllib.error
req = urllib.request.Request(
    'http://127.0.0.1:8003/ask-agent/ask/', 
    data=json.dumps({'patient_id': 1, 'question': 'What should I eat?', 'language': 'en', 'condition_context': []}).encode('utf-8'), 
    headers={'Content-Type': 'application/json'}
)
try:
    resp = urllib.request.urlopen(req, timeout=20)
    print(resp.read().decode('utf-8'))
except Exception as e:
    print('ERROR:', e)
