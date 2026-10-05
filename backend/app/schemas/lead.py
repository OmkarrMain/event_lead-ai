from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class FollowUpStatus(str, Enum):
    PENDING = "PENDING"
    CONTACTED = "CONTACTED"
    FOLLOW_UP = "FOLLOW_UP"
    CONVERTED = "CONVERTED"
    CLOSED = "CLOSED"


class LeadCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    company: str = Field(min_length=2, max_length=150)
    email: EmailStr
    event: str = Field(min_length=2, max_length=150)
    notes: str | None = None
    follow_up_status: FollowUpStatus = FollowUpStatus.PENDING


class LeadUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    company: str | None = Field(default=None, min_length=2, max_length=150)
    email: EmailStr | None = None
    event: str | None = Field(default=None, min_length=2, max_length=150)
    notes: str | None = None
    follow_up_status: FollowUpStatus | None = None


class LeadResponse(BaseModel):
    id: int
    name: str
    company: str
    email: EmailStr
    event: str
    notes: str | None
    follow_up_status: FollowUpStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LeadScoreResponse(BaseModel):
    score: int
    category: str
    reasons: list[str]
    recommendation: str

class LeadSummaryResponse(BaseModel):
    summary: str

class FollowUpRecommendationResponse(BaseModel):
    priority: str
    action: str
    timing: str
    channel: str
    reason: str

class LeadAnalysisResponse(BaseModel):
    intent: str
    potential: str
    analysis: str
    recommendation: str

class BackupLead(BaseModel):
    id: int
    name: str
    company: str
    email: EmailStr
    event: str
    notes: str | None = None
    follow_up_status: FollowUpStatus


class RestoreBackupRequest(BaseModel):
    app: str
    version: int
    created_at: datetime
    leads: list[BackupLead]