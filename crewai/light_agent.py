"""
RozgarScout — Lightweight Agent Runner
Works on Windows without crewAI's heavy dependency chain.
Uses OpenRouter API directly with requests.

Usage: python crewai/light_agent.py <agent> [task]
"""
import os, sys, json, requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

API_KEY = os.getenv("OPENROUTER_API_KEY", "")
API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "nvidia/nemotron-3-super-120b-a12b:free"

# ── Project Context ──
CONTEXT = """RozgarScout is an Indian government job notification portal.
Tech: React 18 + Vite + Tailwind (frontend), NestJS + Prisma 5 + MySQL 8.4 + Redis 5.0 (backend).
Auth: Google OAuth SSO + email/password, JWT 15min + 7d refresh, argon2 hashing.
Features: Auth, Jobs (14 seeded, 10 sources), Document Wallet, Bug Reports, State/Qual pages.
Schema: 18 tables (User, Profile, Job, Source, Tracker, MockTest, MockQuestion, UserDocument, BugReport, etc.)
Tests: 50/50 passing, TypeScript clean.
Competitors: Testbook, Adda247, Sarkari Result, FreeJobAlert, Gradeup.
Free API keys: OpenRouter, Groq, Gemini, Cohere, Mistral, Cerebras, HuggingFace."""

AGENTS = {
    "pm": "Product Manager — writes PRDs, prioritizes features, defines user stories",
    "architect": "Solution Architect — designs API architecture, schemas, caching, deployment",
    "dev": "Senior Developer — writes clean TypeScript code for NestJS backend and React frontend",
    "qa": "QA Engineer — writes Jest tests, validates quality, reports bugs",
    "devops": "DevOps Engineer — Docker, CI/CD, nginx, SSL, VPS deployment",
    "security": "Security Engineer — OWASP audits, vulnerability scanning, security review",
    "data": "Data Engineer — crawlers, scraping, RSS parsing, data normalization",
    "ux": "UX Designer — UI/UX review, accessibility, responsive design, Lighthouse",
    "research": "Competitive Intelligence — competitor monitoring, market analysis, feature gaps",
    "scrum": "Scrum Master — sprint planning, progress tracking, blocker resolution",
}

def call_llm(system_prompt: str, user_prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": 4096,
        "temperature": 0.7,
    }
    r = requests.post(API_URL, headers=headers, json=payload, timeout=120)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]

def run_agent(agent_name: str, task: str = None):
    if agent_name not in AGENTS:
        print(f"Unknown agent: {agent_name}")
        print(f"Available: {', '.join(AGENTS.keys())}")
        sys.exit(1)

    role_desc = AGENTS[agent_name]
    system = f"You are a {role_desc} for RozgarScout.\n\n{CONTEXT}\n\nWrite detailed, actionable output. Use markdown formatting."
    
    if not task:
        task = f"Perform your role as {role_desc}. Review the current project state and provide recommendations."
    
    print(f"Running {agent_name} agent...")
    result = call_llm(system, task)
    
    # Save output
    outdir = Path(__file__).parent.parent / "docs" / "agent-outputs"
    outdir.mkdir(exist_ok=True)
    outfile = outdir / f"{agent_name}-output.md"
    with open(outfile, "w", encoding="utf-8") as f:
        f.write(f"# {role_desc} Output\n\n")
        f.write(result)
    
    print(f"\n{'='*60}")
    try:
        print(result[:500] + "..." if len(result) > 500 else result)
    except UnicodeEncodeError:
        safe = result[:500].encode("ascii", "replace").decode()
        print(safe + "...")
    print(f"{'='*60}")
    print(f"Full output saved to: {outfile}")
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        print(f"\nAgents: {', '.join(AGENTS.keys())}")
        sys.exit(1)
    
    agent = sys.argv[1].lower()
    task = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else None
    run_agent(agent, task)
