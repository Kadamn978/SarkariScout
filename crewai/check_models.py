import requests, os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path("crewai/.env"))
key = os.getenv("OPENROUTER_API_KEY", "")
headers = {"Authorization": f"Bearer {key}"}
r = requests.get("https://openrouter.ai/api/v1/models", headers=headers)
models = r.json().get("data", [])

free = []
for m in models:
    p = m.get("pricing", {})
    prompt_price = p.get("prompt", "1")
    completion_price = p.get("completion", "1")
    try:
        if float(prompt_price) == 0 or float(completion_price) == 0:
            free.append(m)
    except:
        pass

print(f"Found {len(free)} free models on OpenRouter:\n")
for m in free[:30]:
    mid = m["id"]
    name = m.get("name", "?")
    print(f"  {mid}  ({name})")
