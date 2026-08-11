#schema.py


from pydantic import BaseModel, Field
from typing import Literal


class ConversationTurn(BaseModel):
    speaker: Literal["agent", "customer"]
    text: str


class CallAnalysis(BaseModel):

    sentiment: Literal[
        "positive",
        "negative",
        "neutral",
        "mixed"
    ]

    sentiment_score: float = Field(
        description="Score from -1 (very negative) to 1 (very positive)"
    )

    key_topics: list[str] = Field(
        description="Main topics discussed in the call"
    )

    compliance_flags: list[str] = Field(
        description="Any compliance, regulatory, or KYC-related issues mentioned or missed"
    )

    agent_performance_notes: str = Field(
        description="Brief note on how well the agent handled the call"
    )

    escalation_risk: bool = Field(
        description="True if this call needs follow-up or escalation"
    )

    summary: str = Field(
        description="2-3 sentence summary of the call"
    )

    detected_language: str = Field(
        description="Primary language(s) spoken in the call"
    )

    conversation: list[ConversationTurn] = Field(
        description="Conversation broken into agent and customer turns"
    )