"""ContextShield AI — Analysis Service
Combines local detection, scoring, and sanitization.
Uses the AI provider for deeper contextual analysis when available.
"""

from typing import List
from dataclasses import dataclass
import re

from app.providers.base import AIProvider, AnalysisResult, Entity


# Local detection patterns (mirrors the frontend LocalAnalyzer)
PATTERNS = [
    (r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', "direct_identifier", "critical", "Phone numbers can directly identify you.", "Phone number"),
    (r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b', "direct_identifier", "high", "Email addresses are direct identifiers.", "Email address"),
    (r'\b(?:student|employee|staff)\s*id[:\s#]*[A-Z0-9-]{3,}\b', "direct_identifier", "critical", "Institutional IDs can identify and track you.", "Student/Employee ID"),
    (r'\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b', "direct_identifier", "critical", "SSN-like number — extremely sensitive.", "SSN-like number"),
    (r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b', "direct_identifier", "critical", "16-digit card number — financial identifier.", "Card-like number"),
    (r'\b\d{1,5}\s+[A-Z][a-zA-Z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)\b', "location", "high", "Street address pinpoints your location.", "Street address"),
    (r'\b(?:Royal\s+Hospital|Al\s+Khoudh|Muscat|Dubai|Cairo)\b', "location", "medium", "Specific location narrows your geographic identity.", "Specific location"),
    (r'\bmy\s+(?:mother|father|mom|dad|sister|brother|wife|husband|parents)\b', "personal_context", "medium", "Family details can be exploited for social engineering.", "Family information"),
    (r'\b(?:I\s+(?:work|am\s+employed|got\s+fired)|my\s+(?:job|boss|company|salary))\b', "personal_context", "medium", "Employment details reveal professional identity.", "Employment info"),
    (r'\b(?:my\s+(?:mother|father|parents)\s+(?:is\s+)?(?:sick|ill|hospitalized|receiving\s+treatment|diagnosed))\b', "sensitive_context", "high", "Family medical info is highly sensitive.", "Medical/family health"),
    (r'\b(?:I\s+(?:have|was\s+diagnosed\s+with|suffer\s+from)|my\s+(?:diagnosis|condition|medication))\b', "sensitive_context", "high", "Personal medical info is extremely sensitive.", "Medical info"),
    (r'\b(?:I'?m\s+(?:depressed|anxious|in\s+therapy)|my\s+(?:therapist|mental\s+health))\b', "sensitive_context", "high", "Mental health info can cause discrimination.", "Mental health"),
    (r'\b(?:I'?m\s+(?:being\s+sued|facing\s+charges)|my\s+(?:lawyer|legal\s+case))\b', "sensitive_context", "high", "Legal info can affect employment and reputation.", "Legal issues"),
    (r'\b(?:I\s+(?:owe|earn|make\s+\$)|my\s+(?:salary|bank\s+account|balance))\b', "sensitive_context", "high", "Financial info can be exploited for fraud.", "Financial info"),
]

SEVERITY_WEIGHTS = {"critical": 30, "high": 20, "medium": 12, "low": 6}

GENERALIZATIONS = [
    (r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', "[phone number]", "Phone number"),
    (r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b', "[email]", "Email address"),
    (r'\b(?:student|employee)\s*id[:\s#]*[A-Z0-9-]{3,}\b', "[student ID]", "Student identifier"),
    (r'\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b', "[ID number]", "SSN-like number"),
    (r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b', "[card number]", "Card-like number"),
    (r'\b(?:Royal\s+Hospital|Al\s+Khoudh|Muscat|Dubai)\b', "my city", "Precise location"),
    (r'\bmy\s+(?:mother|father|parents)\s+(?:is\s+)?(?:sick|ill|hospitalized|receiving\s+treatment)\b', "a family medical situation", "Family medical details"),
    (r'\bmy\s+(?:mother|father|mom|dad|parents)\b', "a family member", "Family details"),
    (r'\b(?:I\s+(?:have|was\s+diagnosed)|my\s+(?:diagnosis|condition|medication))\b', "a medical condition", "Medical information"),
    (r'\b(?:I'?m\s+(?:depressed|anxious)|my\s+(?:therapist|mental\s+health))\b', "a personal health matter", "Mental health details"),
    (r'\b(?:I'?m\s+(?:being\s+sued|facing\s+charges)|my\s+(?:lawyer|legal\s+case))\b', "a legal matter", "Legal issue details"),
    (r'\b(?:I\s+(?:owe|earn)|my\s+(?:salary|bank\s+account|balance))\b', "a financial situation", "Financial information"),
    (r'\b(?:I\s+(?:work|am\s+employed|got\s+fired)|my\s+(?:job|boss|company|salary))\b', "my work situation", "Employment details"),
]


class AnalysisService:
    def __init__(self, provider: AIProvider):
        self.provider = provider

    async def analyze(self, prompt: str) -> AnalysisResult:
        # Step 1: Local detection (always runs first)
        local_entities = self._detect_locally(prompt)
        local_score = self._calculate_score(local_entities)

        # Step 2: If AI provider is available and not local-only, use it for deeper analysis
        if not self.provider.is_local:
            try:
                ai_result = await self.provider.analyze(prompt)
                # Merge AI results with local detection
                entities = self._merge_entities(local_entities, ai_result.entities)
                score = max(local_score, ai_result.risk_score)
                safe_prompt = ai_result.safe_prompt
                removed = ai_result.removed_information
            except Exception:
                # Fall back to local-only on AI error
                entities = local_entities
                score = local_score
                safe_prompt, removed = self._sanitize(prompt)
        else:
            entities = local_entities
            score = local_score
            safe_prompt, removed = self._sanitize(prompt)

        safe_score = self._calculate_score(self._detect_locally(safe_prompt))
        intent = self._detect_intent(prompt)

        return AnalysisResult(
            intent=intent,
            risk_score=score,
            entities=entities,
            safe_prompt=safe_prompt,
            removed_information=removed,
            intent_preserved=len(safe_prompt) > len(prompt) * 0.3,
        )

    def _detect_locally(self, prompt: str) -> List[Entity]:
        entities = []
        for pattern, cat, sev, reason, label in PATTERNS:
            for match in re.finditer(pattern, prompt, re.IGNORECASE):
                # Skip overlapping matches
                if any(match.start() < e_end and match.end() > e_start
                       for _, e_start, e_end, *_ in [(e, e.start_index, e.end_index) for e in entities]):
                    continue
                entities.append(Entity(
                    text=match.group(),
                    category=cat,
                    severity=sev,
                    reason=reason,
                    start_index=match.start(),
                    end_index=match.end(),
                    label=label,
                ))
        return entities

    def _calculate_score(self, entities: List[Entity]) -> int:
        if not entities:
            return 0
        score = sum(SEVERITY_WEIGHTS.get(e.severity, 0) for e in entities)
        id_count = sum(1 for e in entities if e.category == "direct_identifier")
        score += id_count * 8
        return min(100, max(0, score))

    def _sanitize(self, prompt: str) -> tuple:
        safe = prompt
        removed = set()
        for pattern, replacement, info in GENERALIZATIONS:
            new_safe = re.sub(pattern, replacement, safe, flags=re.IGNORECASE)
            if new_safe != safe:
                removed.add(info)
            safe = new_safe
        safe = re.sub(r'\s+', ' ', safe).strip()
        return safe, list(removed)

    def _detect_intent(self, prompt: str) -> str:
        lower = prompt.lower()
        verbs = ["write", "draft", "compose", "create", "generate", "help", "plan", "explain"]
        for verb in verbs:
            if verb in lower:
                idx = lower.index(verb)
                rest = prompt[idx:]
                end = re.search(r'[.!?\n]', rest)
                phrase = rest[:end.start()] if end else rest
                return phrase[:120] + ("..." if len(phrase) > 120 else "")
        return prompt[:120] + ("..." if len(prompt) > 120 else "")

    def _merge_entities(self, local: List[Entity], ai: List[Entity]) -> List[Entity]:
        seen = set()
        merged = []
        for e in local + ai:
            key = (e.text.lower(), e.category)
            if key not in seen:
                seen.add(key)
                merged.append(e)
        return merged
