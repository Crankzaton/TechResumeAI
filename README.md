# TechResumeAI

AI-assisted resume builder for tech professionals.

## Development setup

Requires **Python 3.11+**.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
pip install -e .
```

## Run the dev server

```bash
source .venv/bin/activate
uvicorn techresumeai.main:app --reload --host 0.0.0.0 --port 8000
```

Open [http://localhost:8000](http://localhost:8000) — paste a resume bullet and click **Enhance**.

## Lint and test

```bash
ruff check src tests
pytest
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/resume/enhance` | POST | Polish a resume bullet (local stub) |
| `/` | GET | Web UI |
