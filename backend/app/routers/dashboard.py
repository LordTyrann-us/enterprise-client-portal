from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.core.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.user import User
from app.models.project import Project

router = APIRouter(tags=["dashboard"])

@router.get("/dashboard")
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role == "admin":
        rows = db.execute(
            select(Project.status, func.count(Project.id)).group_by(Project.status)
        ).all()
        return {"role": "admin", "by_status": {status: count for status, count in rows}}
    else:
        projects = db.scalars(select(Project).where(Project.client_id == user.id)).all()
        return {"role": "client", "projects": [{"id": p.id, "name": p.name, "status": p.status} for p in projects]}
