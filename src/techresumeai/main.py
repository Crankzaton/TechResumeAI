from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

from techresumeai.resume import enhance_bullet

app = FastAPI(title="TechResumeAI", version="0.1.0")

STATIC_DIR = Path(__file__).resolve().parent / "static"


class EnhanceRequest(BaseModel):
    bullet: str = Field(..., min_length=1, max_length=2000)


class EnhanceResponse(BaseModel):
    enhanced: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/resume/enhance", response_model=EnhanceResponse)
def enhance_resume_bullet(body: EnhanceRequest) -> EnhanceResponse:
    return EnhanceResponse(enhanced=enhance_bullet(body.bullet))


@app.get("/", response_class=HTMLResponse)
def index() -> HTMLResponse:
    html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
    return HTMLResponse(content=html)
