from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.analytics import get_lead_analytics

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


@router.get("/")
def analytics(db: Session = Depends(get_db)):
    return get_lead_analytics(db)