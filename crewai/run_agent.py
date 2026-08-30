"""
Run individual crewAI agents for RozgarScout.
Usage: python crewai/run_agent.py <agent> [task]
Agents: pm, architect, dev, qa, devops, security, data, ux, research, scrum
"""
import os, sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
os.environ["OPENAI_API_BASE"] = "https://openrouter.ai/api/v1"
os.environ["OPENAI_API_KEY"] = os.getenv("OPENROUTER_API_KEY", "")

from crewai import Agent, Task, Crew, Process

# ── Models (FREE) ──
SMART = "openrouter/nvidia/nemotron-3-super-120b-a12b:free"
FAST = "openrouter/nvidia/nemotron-3-super-120b-a12b:free"
REASON = "openrouter/nvidia/nemotron-3-super-120b-a12b:free"

# ── Project Context ──
CONTEXT = """RozgarScout is an Indian government job notification portal.
Tech: React 18 + Vite + Tailwind (frontend), NestJS + Prisma + MySQL + Redis (backend).
Features: Auth (Google SSO + email), Jobs (20+ sources), Document Wallet, Bug Reports.
Schema: 18 tables (User, Job, Profile, MockTest, MockQuestion, PreviousPaper, UserDocument, BugReport, etc.)
Tests: 50/50 passing, TypeScript clean.
Competitors: Testbook, Adda247, Sarkari Result, FreeJobAlert, Gradeup."""

# ── Agent Definitions ──
agents = {
    "pm": Agent(
        role="Product Manager",
        goal="Write PRDs, prioritize features",
        backstory=f"You are a PM for RozgarScout. {CONTEXT}",
        llm=SMART, verbose=True, allow_delegation=False,
    ),
    "architect": Agent(
        role="Solution Architect",
        goal="Design architecture, API contracts, tech patterns",
        backstory=f"You are a Solution Architect for RozgarScout. {CONTEXT}",
        llm=SMART, verbose=True, allow_delegation=True,
    ),
    "dev": Agent(
        role="Senior Developer",
        goal="Write clean, secure TypeScript code",
        backstory=f"You are a Senior Dev for RozgarScout. {CONTEXT} You write NestJS + React code.",
        llm=REASON, verbose=True, allow_delegation=False,
    ),
    "qa": Agent(
        role="QA Engineer",
        goal="Write tests, validate quality, report bugs",
        backstory=f"You are a QA Engineer for RozgarScout. {CONTEXT} Current: 50/50 tests pass.",
        llm=SMART, verbose=True, allow_delegation=False,
    ),
    "devops": Agent(
        role="DevOps Engineer",
        goal="Docker, CI/CD, deployment, monitoring",
        backstory=f"You are a DevOps Engineer for RozgarScout. {CONTEXT} Free SSL: Let's Encrypt. Free VPS: Oracle Cloud.",
        llm=FAST, verbose=True, allow_delegation=False,
    ),
    "security": Agent(
        role="Security Engineer",
        goal="OWASP audits, vulnerability scanning, security review",
        backstory=f"You are a Security Engineer for RozgarScout. {CONTEXT} OWASP Top 10, DPDP Act compliance.",
        llm=REASON, verbose=True, allow_delegation=False,
    ),
    "data": Agent(
        role="Data Engineer",
        goal="Crawlers, scraping, data normalization, RSS parsing",
        backstory=f"You are a Data Engineer for RozgarScout. {CONTEXT} 20+ job sources to crawl.",
        llm=SMART, verbose=True, allow_delegation=False,
    ),
    "ux": Agent(
        role="UX Designer",
        goal="UI/UX review, accessibility, responsive design",
        backstory=f"You are a UX Designer for RozgarScout. {CONTEXT} Mobile-first, WCAG 2.1 AA.",
        llm=FAST, verbose=True, allow_delegation=False,
    ),
    "research": Agent(
        role="Competitive Intelligence",
        goal="Monitor competitors, market trends, feature gaps",
        backstory=f"You are a Competitive Intel Analyst for RozgarScout. {CONTEXT}",
        llm=FAST, verbose=True, allow_delegation=False,
    ),
    "scrum": Agent(
        role="Scrum Master",
        goal="Sprint planning, progress tracking, blocker resolution",
        backstory=f"You are the Scrum Master for RozgarScout. {CONTEXT} PROGRESS.md is single source of truth.",
        llm=SMART, verbose=True, allow_delegation=True,
    ),
}

# ── Default Tasks ──
default_tasks = {
    "pm": "Write a PRD for the Mock Test Engine feature. Schema has MockTest, MockQuestion, MockTestAttempt tables. Cover: user stories, API endpoints, frontend pages, free vs premium tiers, success metrics.",
    "architect": "Design the API architecture for the Mock Test Engine. Define endpoints, request/response schemas, database queries, caching strategy. Review existing NestJS patterns.",
    "dev": "Implement the Mock Test Engine backend: create mock-test.module.ts, mock-test.service.ts, mock-test.controller.ts with CRUD operations for MockTest and MockQuestion.",
    "qa": "Write unit tests for the Mock Test Engine: test CRUD operations, test attempt scoring, test time limits, test question randomization.",
    "devops": "Create Docker configuration for production deployment: docker-compose.prod.yml with MySQL 8.4, Redis 5.0, nginx reverse proxy, certbot SSL.",
    "security": "Perform a security audit of the authentication module. Check JWT rotation, timing-safe comparison, token reuse detection, CORS config, CSP headers.",
    "data": "Design the job crawler architecture for 20+ Indian government sources. Define source registry, normalization pipeline, dedup strategy, error handling.",
    "ux": "Review the landing page UX. Analyze: conversion funnel, mobile responsiveness, accessibility, page speed, content hierarchy.",
    "research": "Analyze the top 3 competitors (Testbook, Adda247, Sarkari Result): features, pricing, SEO strategy, user reviews. Identify 3 opportunities for RozgarScout.",
    "scrum": "Create a sprint plan for the next 2 weeks. Prioritize: Mock Test Engine, Previous Papers, Premium subscriptions. Define story points and acceptance criteria.",
}

def run_agent(agent_name, task_text=None):
    if agent_name not in agents:
        print(f"Unknown agent: {agent_name}")
        print(f"Available: {', '.join(agents.keys())}")
        sys.exit(1)

    agent = agents[agent_name]
    task_text = task_text or default_tasks[agent_name]

    task = Task(
        description=task_text,
        expected_output="Detailed, actionable output appropriate for the role",
        agent=agent,
    )

    crew = Crew(agents=[agent], tasks=[task], process=Process.sequential, verbose=True)
    result = crew.kickoff()

    print(f"\n{'='*60}")
    print(f"AGENT: {agent.role}")
    print(f"{'='*60}")
    try:
        print(result)
    except UnicodeEncodeError:
        print(str(result).encode("ascii", "replace").decode())
    print(f"{'='*60}\n")

    # Save to file
    outdir = Path(__file__).parent.parent / "docs" / "agent-outputs"
    outdir.mkdir(exist_ok=True)
    outfile = outdir / f"{agent_name}-output.md"
    with open(outfile, "w", encoding="utf-8") as f:
        f.write(f"# {agent.role} Output\n\n")
        f.write(str(result))
    print(f"Saved to: {outfile}")

    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    agent_name = sys.argv[1].lower()
    task_text = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else None
    run_agent(agent_name, task_text)
