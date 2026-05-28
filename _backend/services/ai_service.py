from __future__ import annotations

"""AI client service for question generation."""

from openai import OpenAI
from config import config


class AIService:
    """Service for interacting with AI APIs (Moonshot / OpenAI)."""

    def __init__(self):
        api_key = config.api_key
        if not api_key:
            raise ValueError(
                f"No API key configured for provider '{config.AI_PROVIDER}'. "
                "Set MOONSHOT_API_KEY or OPENAI_API_KEY in .env"
            )

        client_kwargs = {"api_key": api_key}
        if config.base_url:
            client_kwargs["base_url"] = config.base_url

        self.client = OpenAI(**client_kwargs)
        self.model = config.AI_MODEL

    def generate_questions(
        self,
        system_prompt: str,
        user_content: list[dict] | str,
        temperature: float = 0.3,
    ) -> str:
        """Generate questions using the AI model.

        Args:
            system_prompt: System instructions for the AI.
            user_content: Either a plain text string or a list of content blocks
                for multimodal input (text + images).
            temperature: Sampling temperature (lower = more deterministic).

        Returns:
            Raw response content from the AI.
        """
        if isinstance(user_content, str):
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ]
        else:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ]

        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
        )
        return response.choices[0].message.content or ""
