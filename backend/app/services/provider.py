"""ContextShield AI — AI Provider Factory
Returns the appropriate provider based on environment configuration.
Falls back to local mode if no API key is set.
"""

import os
from app.providers.base import AIProvider
from app.providers.local import LocalProvider
from app.providers.openai_provider import OpenAIProvider

_provider: AIProvider | None = None


def get_provider() -> AIProvider:
    global _provider
    if _provider is not None:
        return _provider

    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        _provider = OpenAIProvider(api_key)
    else:
        _provider = LocalProvider()

    return _provider
