from sqlalchemy.orm import Session

from app.models.lead import Lead


def get_lead_analytics(db: Session):
    leads = db.query(Lead).all()

    total = len(leads)

    pending = sum(
        1 for lead in leads
        if lead.follow_up_status == "PENDING"
    )

    contacted = sum(
        1 for lead in leads
        if lead.follow_up_status == "CONTACTED"
    )

    follow_up = sum(
        1 for lead in leads
        if lead.follow_up_status == "FOLLOW_UP"
    )

    converted = sum(
        1 for lead in leads
        if lead.follow_up_status == "CONVERTED"
    )

    closed = sum(
        1 for lead in leads
        if lead.follow_up_status == "CLOSED"
    )

    conversion_rate = (
        round((converted / total) * 100, 2)
        if total > 0
        else 0
    )

    events = {}

    for lead in leads:
        events[lead.event] = events.get(lead.event, 0) + 1

    return {
        "total": total,
        "pending": pending,
        "contacted": contacted,
        "follow_up": follow_up,
        "converted": converted,
        "closed": closed,
        "conversion_rate": conversion_rate,
        "events": events
    }