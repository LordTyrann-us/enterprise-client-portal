from pydantic import BaseModel

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    status: str = "active"
    client_email: str | None = None  # assign by email (admin only)

class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None
    client_email: str | None = None

class ProjectOut(BaseModel):
    id: int
    name: str
    description: str | None
    status: str
    client_email: str | None

    class Config:
        from_attributes = True
