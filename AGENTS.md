# AGENTS.md

## Cursor Cloud specific instructions

### Repository overview

TechResumeAI is a **Python FastAPI** application with a small static web UI. The resume enhancement endpoint uses a **local stub** (`src/techresumeai/resume.py`) so development and tests work without an OpenAI or other LLM API key.

### Services

| Service | Command | Port |
|---------|---------|------|
| API + web UI | `uvicorn techresumeai.main:app --reload --host 0.0.0.0 --port 8000` | 8000 |

Only one process is required for local development.

### Environment

- Activate the venv before running commands: `source .venv/bin/activate`
- Install deps: `pip install -r requirements-dev.txt && pip install -e .`
- No database, Docker, or external services are required for the current stub implementation.

### Lint and test

```bash
ruff check src tests
pytest
```

### Notes

- Package is installed in editable mode (`pip install -e .`) so `techresumeai` imports resolve from `src/`.
- Uvicorn `--reload` watches Python files; changes to `static/index.html` may require a manual server restart to appear in the browser.
