from app.models.project import Project  # noqa
from app.models.comment import Comment  # noqa
from app.models.user import User  # noqa

from fastapi import FastAPI
from app.db.session import Base, engine
from app.routers import auth

app = FastAPI(
    title="Enterprise Client Portal API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/api")
from app.routers import projects, comments, dashboard
app.include_router(projects.router, prefix="/api")
app.include_router(comments.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/health")
def api_health():
    return {"status": "ok"}
