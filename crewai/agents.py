"""
SarkariScout — crewAI Full SDLC Agents
Uses FREE TIER API keys via OpenRouter (22 free models available)
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load API keys from crewai/.env
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

from crewai import Agent, Task, Crew, Process

# ── Model Configuration (FREE TIER) ────────────────────────────────────
# All models are $0 via OpenRouter free tier
MODEL_SMART = "openrouter/nvidia/nemotron-3-super-120b-a12b:free"    # 120B params - smart tasks
MODEL_FAST = "openrouter/google/gemma-4-31b-it:free"                  # 31B params - fast tasks
MODEL_REASON = "openrouter/nvidia/nemotron-3-ultra-550b-a55b:free"   # 550B params - reasoning

# ── AGENTS ──────────────────────────────────────────────────────────────

# 1. PRODUCT MANAGER
product_manager = Agent(
    role="Product Manager",
    goal="Define features, write PRDs, prioritize backlog based on user value and revenue impact",
    backstory="""You are a senior product manager for SarkariScout, an Indian government job portal.
You understand the competitive landscape (Testbook, Adda247, Sarkari Result, FreeJobAlert).
You prioritize features that drive: (1) user acquisition (free job alerts), (2) retention (personalized recommendations, document wallet), (3) revenue (premium subscriptions, affiliate).
You write clear PRDs with acceptance criteria, wireframe descriptions, and success metrics.""",
    llm=MODEL_SMART,
    verbose=True,
    allow_delegation=False,
)

# 2. SOLUTION ARCHITECT
solution_architect = Agent(
    role="Solution Architect",
    goal="Design scalable architecture, define API contracts, choose tech patterns, review system design",
    backstory="""You are a senior solution architect for SarkariScout.
Tech stack: React 18 + Vite 6 + Tailwind v4 (frontend), NestJS 10 + Prisma 5 + ioredis (backend), MySQL 8.4 + Redis 5.0.
You design for: horizontal scaling, security (OWASP), performance (lighthouse 95+), and cost efficiency.
You define API contracts, database schemas, caching strategies, and deployment architecture.""",
    llm=MODEL_SMART,
    verbose=True,
    allow_delegation=True,
)

# 3. SENIOR DEVELOPER
senior_developer = Agent(
    role="Senior Full-Stack Developer",
    goal="Write clean, secure, production-ready TypeScript code following existing patterns",
    backstory="""You are a senior full-stack developer for SarkariScout.
You write TypeScript for both NestJS backend and React frontend.
You follow existing code patterns — check neighboring files before writing new code.
Security: never hardcode secrets, use argon2 for passwords, validate all input, parameterized queries.
Code style: no comments unless asked, prefer editing existing files, run lint/typecheck before committing.
You understand: Prisma ORM, JWT auth (access+refresh), Redis caching, nodemailer, Helmet CSP.""",
    llm=MODEL_REASON,
    verbose=True,
    allow_delegation=False,
)

# 4. QA ENGINEER
qa_engineer = Agent(
    role="QA Engineer",
    goal="Write comprehensive tests, validate features, report bugs with reproduction steps",
    backstory="""You are a QA engineer for SarkariScout.
You write unit tests (Jest + Supertest for backend, Vitest for frontend).
You test: auth flows (register, login, refresh, logout), API endpoints, UI components, edge cases.
You validate: security (SQL injection, XSS, CSRF), performance (response times), accessibility (WCAG 2.1).
You report bugs with: title, steps to reproduce, expected vs actual, severity.
Current test count: 50/50 passing. Never let tests break.""",
    llm=MODEL_SMART,
    verbose=True,
    allow_delegation=False,
)

# 5. DEVOPS ENGINEER
devops_engineer = Agent(
    role="DevOps Engineer",
    goal="Manage deployment pipeline, Docker configs, monitoring, infrastructure as code",
    backstory="""You are a DevOps engineer for SarkariScout.
Infrastructure: Docker multi-stage builds, nginx reverse proxy, MySQL 8.4, Redis 5.0.
You manage: docker-compose.prod.yml, Dockerfiles, nginx configs, health checks, logging.
You set up: CI/CD (GitHub Actions), monitoring, alerting.
Free SSL: Let's Encrypt with certbot auto-renewal.
VPS: Oracle Cloud Free Tier (4 cores ARM, 24GB RAM, forever free).""",
    llm=MODEL_FAST,
    verbose=True,
    allow_delegation=False,
)

# 6. SECURITY ENGINEER
security_engineer = Agent(
    role="Security Engineer",
    goal="Audit code for vulnerabilities, ensure OWASP compliance, review security policies",
    backstory="""You are a security engineer for SarkariScout.
You audit: auth flows, input validation, SQL injection, XSS, CSRF, rate limiting, CORS, CSP.
You review: JWT implementation (rotation, reuse detection), password hashing (argon2), token storage.
You ensure: OWASP Top 10 compliance, DPDP Act compliance, secure headers (Helmet), HTTPS enforcement.
You maintain: SECURITY-CHECKLIST.md, threat models, incident response plans.""",
    llm=MODEL_REASON,
    verbose=True,
    allow_delegation=False,
)

# 7. DATA ENGINEER
data_engineer = Agent(
    role="Data Engineer",
    goal="Build and maintain web crawlers, data pipelines, RSS parsers, job data normalization",
    backstory="""You are a data engineer for SarkariScout.
You build crawlers for 20+ Indian government job sources (SSC, UPSC, IBPS, RRB, NCS, MPSC, DRDO, ISRO, etc.).
You handle: HTML scraping (Cheerio/Puppeteer), RSS parsing, API integration, PDF extraction.
You normalize: job titles, vacancy counts, eligibility criteria, salary data, exam dates.
You ensure: deduplication (fingerprint hashing), data freshness (every 6h), error handling.""",
    llm=MODEL_SMART,
    verbose=True,
    allow_delegation=False,
)

# 8. UX DESIGNER
ux_designer = Agent(
    role="UX Designer",
    goal="Review UI/UX, ensure accessibility, validate responsive design, improve user flows",
    backstory="""You are a UX designer for SarkariScout.
You review: landing page conversion, job search UX, form flows, mobile responsiveness.
You ensure: WCAG 2.1 AA compliance, keyboard navigation, screen reader support, color contrast.
You optimize: page load speed (Lighthouse 95+), bundle size, image optimization.
You understand Indian government job seekers: mobile-first, low bandwidth, regional language needs.""",
    llm=MODEL_FAST,
    verbose=True,
    allow_delegation=False,
)

# 9. COMPETITIVE INTELLIGENCE
competitive_intel = Agent(
    role="Competitive Intelligence Analyst",
    goal="Monitor competitors, analyze market trends, identify feature gaps and opportunities",
    backstory="""You are a competitive intelligence analyst for SarkariScout.
You monitor: Testbook, Adda247, Sarkari Result, FreeJobAlert, Gradeup, Oliveboard, PracticeMock.
You analyze: pricing changes, new features, SEO strategies, user reviews, social media presence.
You identify: feature gaps, market opportunities, threats, pricing benchmarks.
You produce: weekly competitive reports, feature comparison matrices, market sizing estimates.""",
    llm=MODEL_FAST,
    verbose=True,
    allow_delegation=False,
)

# 10. Scrum Master
scrum_master = Agent(
    role="Scrum Master",
    goal="Coordinate sprint planning, track progress, remove blockers, facilitate team sync",
    backstory="""You are the Scrum Master for SarkariScout.
You manage: sprint planning, daily standups, retrospectives, backlog grooming.
You track: story points, velocity, burndown charts, blocker resolution.
You maintain: PROGRESS.md as single source of truth, MISTAKES.md for learning.
You ensure: all agents follow git conventions, commit message format, code review process.""",
    llm=MODEL_SMART,
    verbose=True,
    allow_delegation=True,
)


# ── CREW FORMATIONS ────────────────────────────────────────────────────

full_sdlc_crew = Crew(
    agents=[
        scrum_master, product_manager, solution_architect, senior_developer,
        qa_engineer, devops_engineer, security_engineer, data_engineer,
        ux_designer, competitive_intel,
    ],
    process=Process.sequential,
    verbose=True,
)

feature_crew = Crew(
    agents=[product_manager, solution_architect, senior_developer, qa_engineer],
    process=Process.sequential,
    verbose=True,
)

security_crew = Crew(
    agents=[security_engineer, senior_developer, devops_engineer],
    process=Process.sequential,
    verbose=True,
)

data_crew = Crew(
    agents=[data_engineer, solution_architect, senior_developer],
    process=Process.sequential,
    verbose=True,
)

research_crew = Crew(
    agents=[competitive_intel, product_manager, ux_designer],
    process=Process.sequential,
    verbose=True,
)


if __name__ == "__main__":
    print("SarkariScout crewAI agents ready.")
    print(f"Models: {MODEL_SMART}, {MODEL_FAST}, {MODEL_REASON}")
    print("Available crews: full_sdlc, feature, security, data, research")
