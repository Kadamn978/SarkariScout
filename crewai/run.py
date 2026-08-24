"""
SarkariScout — crewAI Runner
Run specific crews for different tasks.

Usage:
  python crewai/run.py research    # Competitive research
  python crewai/run.py security    # Security audit
  python crewai/run.py feature     # New feature development
  python crewai/run.py data        # Data pipeline
  python crewai/run.py sprint      # Full sprint (all agents)
"""
import sys
import os
from datetime import datetime

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents import (
    full_sdlc_crew,
    feature_crew,
    security_crew,
    data_crew,
    research_crew,
)


def run_research():
    """Weekly competitive research."""
    task = (
        "Analyze the current competitive landscape for Indian government job portals. "
        "Check: Testbook, Adda247, Sarkari Result, FreeJobAlert, Gradeup, Oliveboard. "
        "Report: new features launched, pricing changes, SEO strategies, user sentiment. "
        "Identify top 3 opportunities for SarkariScout this week. "
        "Save report to docs/research/YYYY-MM-DD.md"
    )
    result = research_crew.kickoff(inputs={"task": task})
    return result


def run_security():
    """Security audit of codebase."""
    task = (
        "Perform a comprehensive security audit of the SarkariScout codebase. "
        "Check: auth flows (JWT rotation, reuse detection), input validation, SQL injection, "
        "XSS, CSRF, rate limiting, CORS, CSP, secret management, dependency vulnerabilities. "
        "Update SECURITY-CHECKLIST.md with findings. "
        "Report critical/high issues to scrum master."
    )
    result = security_crew.kickoff(inputs={"task": task})
    return result


def run_feature(feature_description: str):
    """Develop a new feature end-to-end."""
    task = (
        f"Develop the following feature: {feature_description}\n"
        "Follow the full SDLC: PRD → Architecture → Implementation → Tests → Review. "
        "Write unit tests. Ensure TypeScript compiles. Follow existing code patterns. "
        "Commit with proper message format."
    )
    result = feature_crew.kickoff(inputs={"task": task})
    return result


def run_data():
    """Run data pipeline — crawlers, normalization."""
    task = (
        "Review and improve the job data crawling pipeline. "
        "Check: source health, data freshness, deduplication, normalization accuracy. "
        "Fix any broken crawlers. Add error handling for failed sources. "
        "Update seed data if new sources are added."
    )
    result = data_crew.kickoff(inputs={"task": task})
    return result


def run_sprint(sprint_goal: str):
    """Run a full sprint with all agents."""
    result = full_sdlc_crew.kickoff(inputs={
        "sprint_goal": sprint_goal,
        "date": datetime.now().isoformat(),
    })
    return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1].lower()
    extra = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else ""

    runners = {
        "research": run_research,
        "security": run_security,
        "data": run_data,
    }

    if command in runners:
        result = runners[command]()
        print(f"\nResult: {result}")
    elif command == "feature":
        if not extra:
            print("Usage: python run.py feature <description>")
            sys.exit(1)
        result = run_feature(extra)
        print(f"\nResult: {result}")
    elif command == "sprint":
        goal = extra or "General improvement and bug fixes"
        result = run_sprint(goal)
        print(f"\nResult: {result}")
    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)
