from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.comment import Comment
from app.schemas.comment import CommentCreate

router = APIRouter(tags=["comments"])

def _can_access_project(user: User, project: Project) -> bool:
    return user.role == "admin" or (project.client_id == user.id)

@router.get("/projects/{project_id}/comments")
def list_comments(project_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="project not found")
    if not _can_access_project(user, project):
        raise HTTPException(status_code=403, detail="forbidden")

    rows = db.scalars(select(Comment).where(Comment.project_id == project_id).order_by(Comment.id.asc())).all()
    return [
        {"id": c.id, "project_id": c.project_id, "author_email": c.author.email, "body": c.body}
        for c in rows
    ]

@router.post("/projects/{project_id}/comments")
def add_comment(project_id: int, payload: CommentCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="project not found")
    if not _can_access_project(user, project):
        raise HTTPException(status_code=403, detail="forbidden")

    c = Comment(project_id=project_id, author_id=user.id, body=payload.body)
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"id": c.id}
