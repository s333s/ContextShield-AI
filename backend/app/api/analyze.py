"""ContextShield AI — Analyze API Router"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import List, Literal

from app.services.analyzer import AnalysisService
from app.services.provider import get_provider

router = APIRouter()


class Entity(BaseModel):
    text: str
    category: str
    severity: Literal["critical", "high", "medium", "low"]
    reason: str


class AnalyzeRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=10000)


class AnalyzeResponse(BaseModel):
    intent: str
    risk_score: int
    entities: List[Entity]
    safe_prompt: str
    removed_information: List[str]
    intent_preserved: bool
    provider: str
    is_local: bool


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_prompt(request: AnalyzeRequest):
    """Analyze a prompt for privacy risks and generate a safer version."""
    provider = get_provider()
    service = AnalysisService(provider)
    result = await service.analyze(request.prompt)
    return AnalyzeResponse(
        intent=result.intent,
        risk_score=result.risk_score,
        entities=[Entity(**e) for e in result.entities],
        safe_prompt=result.safe_prompt,
        removed_information=result.removed_information,
        intent_preserved=result.intent_preserved,
        provider=provider.name,
        is_local=provider.is_local,
    )
