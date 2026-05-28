"""Backend configuration loaded from environment variables."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load .env file if present
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)


class Config:
    """Application configuration."""

    # AI Provider
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "moonshot")
    AI_MODEL: str = os.getenv("AI_MODEL", "kimi-k2.6")
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    MOONSHOT_API_KEY: Optional[str] = os.getenv("MOONSHOT_API_KEY")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")

    # Context path
    CONTEXT_PATH: str = os.getenv("CONTEXT_PATH", "")

    # Server
    PORT: int = int(os.getenv("PORT", "8000"))
    MOCK_MODE: bool = os.getenv("MOCK_MODE", "false").lower() == "true"

    # Derived
    @property
    def api_key(self) -> Optional[str]:
        if self.AI_PROVIDER == "gemini":
            return self.GEMINI_API_KEY
        if self.AI_PROVIDER == "moonshot":
            return self.MOONSHOT_API_KEY
        return self.OPENAI_API_KEY

    @property
    def base_url(self) -> Optional[str]:
        if self.AI_PROVIDER == "gemini":
            return "https://generativelanguage.googleapis.com/v1beta/openai/"
        if self.AI_PROVIDER == "moonshot":
            return "https://api.moonshot.ai/v1"
        return None  # OpenAI uses default


config = Config()
