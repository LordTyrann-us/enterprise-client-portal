from pydantic import BaseModel

class CommentCreate(BaseModel):
    body: str

class CommentOut(BaseModel):
    id: int
    project_id: int
    author_email: str
    body: str

    class Config:
        from_attributes = True
