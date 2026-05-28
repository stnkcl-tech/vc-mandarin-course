from __future__ import annotations

"""FastAPI backend for Mandarin Mastery Review System."""

from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import config
from services.session_generator import generate_session

app = FastAPI(
    title="Mandarin Mastery Review API",
    description="AI-powered question generation for Mandarin learning",
    version="0.1.0",
)

# CORS — allow frontend running on Vite dev server or static file server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:8080",   # Static file server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ───────────────────────────────────────────────────────────────
# Request/Response Models
# ───────────────────────────────────────────────────────────────

class SessionConfig(BaseModel):
    includeSpeaking: bool = True
    includeReadingComprehension: bool = True
    includeCharacterWriting: bool = True
    includeShortEssay: bool = True
    difficulty: str = "Beginner"
    strictness: str = "Normal"
    focusArea: str = "Balanced"


class ContextFileInfo(BaseModel):
    name: str
    type: str
    path: str


class GenerateSessionRequest(BaseModel):
    config: SessionConfig
    selectedDays: list[int]
    availableFiles: dict[str, list[ContextFileInfo]]


class GenerateSessionResponse(BaseModel):
    questions: list[dict[str, Any]]
    metadata: dict[str, Any]


class SetContextPathRequest(BaseModel):
    path: str


class HealthResponse(BaseModel):
    status: str
    version: str
    ai_provider: str
    ai_model: str
    ai_configured: bool
    context_path: Optional[str]


# ───────────────────────────────────────────────────────────────
# Routes
# ───────────────────────────────────────────────────────────────

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        version="0.1.0",
        ai_provider=config.AI_PROVIDER,
        ai_model=config.AI_MODEL,
        ai_configured=config.api_key is not None and len(config.api_key) > 0,
        context_path=config.CONTEXT_PATH or None,
    )


@app.post("/api/set-context-path")
async def set_context_path(request: SetContextPathRequest):
    """Set the path to the _context folder."""
    path = Path(request.path)
    if not path.exists():
        raise HTTPException(status_code=400, detail=f"Path does not exist: {request.path}")
    config.CONTEXT_PATH = str(path.resolve())
    return {"success": True, "contextPath": config.CONTEXT_PATH}


@app.post("/api/generate-session", response_model=GenerateSessionResponse)
async def generate_session_endpoint(request: GenerateSessionRequest):
    """Generate a review session with AI-powered questions."""
    try:
        config_dict = request.config.model_dump()
        result = generate_session(
            selected_days=request.selectedDays,
            config_dict=config_dict,
        )
        return GenerateSessionResponse(
            questions=result["questions"],
            metadata=result["metadata"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session generation failed: {str(e)}")


@app.post("/api/extract-pdf")
async def extract_pdf(request: dict[str, str]):
    """Debug endpoint: extract text from a PDF file path."""
    from services.pdf_service import extract_text_from_pdf

    pdf_path = request.get("path", "")
    if not pdf_path:
        raise HTTPException(status_code=400, detail="Missing 'path' in request body")

    text = extract_text_from_pdf(pdf_path)
    return {"path": pdf_path, "text": text[:5000], "length": len(text)}


# ───────────────────────────────────────────────────────────────
# Startup
# ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=config.PORT, reload=True)
