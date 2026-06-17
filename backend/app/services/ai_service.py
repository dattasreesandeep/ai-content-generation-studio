"""
AI Service — the ONLY place in the codebase that talks to Gemini.

All generation endpoints call this service. If you swap to OpenAI or another
provider in the future, you only change this file.
"""
import json
import re
from typing import Any

import google.generativeai as genai

from app.core.config import settings

# Configure the Gemini client once at import time
genai.configure(api_key=settings.GEMINI_API_KEY)

MODEL_NAME = "models/gemini-2.5-flash"   # Free-tier model per TDD


def _clean_json_response(raw: str) -> str:
    """
    Gemini sometimes wraps JSON in markdown fences (```json ... ```).
    Strip them so json.loads() works cleanly.
    """
    raw = raw.strip()
    # Remove ```json ... ``` or ``` ... ``` wrappers
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


def _call_gemini(prompt: str) -> str:
    """
    Send a prompt to Gemini and return the raw text response.
    Raises RuntimeError on API failure.
    """
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        return response.text
    except Exception as exc:
        raise RuntimeError(f"Gemini API call failed: {exc}") from exc


def generate_and_parse(prompt: str, attempt: int = 1) -> dict[str, Any]:
    """
    Call Gemini, clean the response, and parse it as JSON.

    Per TDD: if parsing fails on the first attempt, retry once before raising.
    Returns a dict on success.
    Raises ValueError if JSON is invalid after retries.
    Raises RuntimeError if the API itself fails.
    """
    raw = _call_gemini(prompt)
    cleaned = _clean_json_response(raw)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        if attempt < 2:
            # TDD requirement: retry once on validation failure
            return generate_and_parse(prompt, attempt=2)
        raise ValueError(
            f"Gemini returned invalid JSON after {attempt} attempt(s). "
            f"Raw response: {cleaned[:300]}"
        ) from exc
