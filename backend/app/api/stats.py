"""ContextShield AI — Stats API Router
Returns anonymized aggregate statistics only. Never raw prompts.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# In production these would come from a database.
# For the demo, we return static anonymized data.
DEMO_STATS = {
    "prompts_analyzed": 27,
    "sensitive_details_detected": 14,
    "prompts_protected": 19,
    "average_exposure_reduced": 63,
}


class StatsResponse(BaseModel):
    prompts_analyzed: int
    sensitive_details_detected: int
    prompts_protected: int
    average_exposure_reduced: int


@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    """Get anonymized aggregate privacy statistics."""
    return StatsResponse(**DEMO_STATS)
