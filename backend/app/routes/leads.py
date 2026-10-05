from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.lead import Lead
from app.schemas.lead import (
    FollowUpStatus,
    LeadCreate,
    LeadResponse,
    LeadUpdate,
    LeadScoreResponse,
    LeadSummaryResponse,
    RestoreBackupRequest
)
from app.services.lead_scoring import calculate_lead_score
from app.services.ai_service import summarize_notes, draft_follow_up


router = APIRouter(
    prefix="/api/leads",
    tags=["Leads"]
)

@router.get("/{lead_id}", response_model=LeadResponse)

@router.post("/restore")
def restore_backup(
    backup: RestoreBackupRequest,
    db: Session = Depends(get_db)
):
    if backup.app != "EventLead AI":
        raise HTTPException(
            status_code=400,
            detail="Invalid backup file"
        )

    created = 0
    updated = 0

    for backup_lead in backup.leads:
        lead = (
            db.query(Lead)
            .filter(Lead.id == backup_lead.id)
            .first()
        )

        if lead:
            lead.name = backup_lead.name
            lead.company = backup_lead.company
            lead.email = backup_lead.email
            lead.event = backup_lead.event
            lead.notes = backup_lead.notes
            lead.follow_up_status = backup_lead.follow_up_status

            updated += 1

        else:
            new_lead = Lead(
                id=backup_lead.id,
                name=backup_lead.name,
                company=backup_lead.company,
                email=backup_lead.email,
                event=backup_lead.event,
                notes=backup_lead.notes,
                follow_up_status=backup_lead.follow_up_status
            )

            db.add(new_lead)

            created += 1

    try:
        db.commit()
    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Failed to restore backup"
        )

    return {
        "message": "Backup restored successfully",
        "created": created,
        "updated": updated,
        "total": len(backup.leads)
    }

@router.post("/", response_model=LeadResponse)
def create_lead(
    lead: LeadCreate,
    db: Session = Depends(get_db)
):
    new_lead = Lead(
        name=lead.name,
        company=lead.company,
        email=lead.email,
        event=lead.event,
        notes=lead.notes,
        follow_up_status=lead.follow_up_status
    )

    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)

    return new_lead


@router.get("/", response_model=list[LeadResponse])
def get_leads(
    search: str | None = Query(default=None),
    status: FollowUpStatus | None = Query(default=None),
    event: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Lead)

    if search:
        search_term = f"%{search}%"

        query = query.filter(
            Lead.name.ilike(search_term)
            | Lead.company.ilike(search_term)
            | Lead.email.ilike(search_term)
            | Lead.event.ilike(search_term)
            | Lead.notes.ilike(search_term)
        )

    if status:
        query = query.filter(
            Lead.follow_up_status == status.value
        )

    if event:
        query = query.filter(
            Lead.event.ilike(event)
        )

    return query.order_by(
        Lead.created_at.desc()
    ).all()


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    return lead


@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    lead_data: LeadUpdate,
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    update_data = lead_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(lead, field, value)

    db.commit()
    db.refresh(lead)

    return lead


@router.delete("/{lead_id}")
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    db.delete(lead)
    db.commit()

    return {
        "message": "Lead deleted successfully"
    }


@router.get(
    "/{lead_id}/score",
    response_model=LeadScoreResponse
)
def score_lead(
    lead_id: int,
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    return calculate_lead_score(lead)


@router.get(
    "/{lead_id}/summary",
    response_model=LeadSummaryResponse
)
def summarize_lead(
    lead_id: int,
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    summary = summarize_notes(lead)

    return {
        "summary": summary
    }


@router.get("/{lead_id}/follow-up")
def generate_follow_up(
    lead_id: int,
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    message = draft_follow_up(lead)

    return {
        "message": message
    }

