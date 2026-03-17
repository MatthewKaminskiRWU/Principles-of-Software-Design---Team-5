import os
from typing import Annotated
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from sqlmodel import Field, Session, SQLModel, create_engine, select
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this down later for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

#--- Models ---

class UserBase(SQLModel):
    name: str
    email: str | None = None

# this is what is stored in the DB
class User(UserBase, table=True):
    __tablename__ = "users"
    id: int | None = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="events.id", sa_column_kwargs={"name": "eventId"})

class UserPublic(UserBase):
    id: int
    event_id: int

class UserCreate(UserBase):
    event_id: int

class Event(SQLModel, table=True):
    __tablename__ = "events"
    id: int | None = Field(default=None, primary_key=True)
    hash: str
    class_title: str = Field(sa_column_kwargs={"name": "classTitle"})
    professor: str

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]


@app.get("/")
def read_root():
    return {"Hello": "World"}

#--- DB Setup ---
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)


# --- User Endpoints ---
@app.post("/users/", response_model=UserPublic)
def create_user(user: UserCreate, session: SessionDep):
    db_user = User.model_validate(user)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@app.get("/users/", response_model=list[UserPublic])
def read_users(session: SessionDep):
    return session.exec(select(User)).all()

@app.get("/users/{user_id}", response_model=UserPublic)
def read_user(user_id: int, session: SessionDep):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
