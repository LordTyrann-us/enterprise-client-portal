from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate

router = APIRouter(tags=["projects"])

VALID_STATUS = {"active", "completed", "on-hold"}

def _assign_client(db: Session, email: str | None) -> int | None:
    if not email:
        return None
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        raise HTTPException(status_code=404, detail="client not found")
    if user.role != "client":
        raise HTTPException(status_code=400, detail="assigned user must have role client")
    return user.id

@router.get("/projects")
def list_projects(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role == "admin":
        projects = db.scalars(select(Project).order_by(Project.id.desc())).all()
    else:
        projects = db.scalars(select(Project).where(Project.client_id == user.id).order_by(Project.id.desc())).all()

    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "status": p.status,
            "client_email": p.client.email if p.client else None,
        }
        for p in projects
    ]

@router.post("/projects")
def create_project(payload: ProjectCreate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    if payload.status not in VALID_STATUS:
        raise HTTPException(status_code=400, detail="invalid status")
    client_id = _assign_client(db, payload.client_email)

    p = Project(
        name=payload.name,
        description=payload.description,
        status=payload.status,
        client_id=client_id,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"id": p.id}

@router.patch("/projects/{project_id}")
def update_project(project_id: int, payload: ProjectUpdate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="project not found")

    if payload.status and payload.status not in VALID_STATUS:
        raise HTTPException(status_code=400, detail="invalid status")

    if payload.name is not None:
        p.name = payload.name
    if payload.description is not None:
        p.description = payload.description
    if payload.status is not None:
        p.status = payload.status
    if payload.client_email is not None:
        p.client_id = _assign_client(db, payload.client_email)

    db.commit()
    return {"ok": True}

@router.delete("/projects/{project_id}")
def delete_project(project_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="project not found")
    db.delete(p)
    db.commit()
    return {"ok": True}
