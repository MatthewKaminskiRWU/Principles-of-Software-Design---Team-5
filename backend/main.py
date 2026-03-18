import os
from typing import Annotated
from enum import Enum
from datetime import datetime, time
from secrets import token_hex
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from sqlmodel import Field, Session, SQLModel, create_engine, select
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

# cors is a pain in the ass so im just gonna allow everything for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this down later for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv() # this loads the .env variables

############ Understanding SQLModel Syntax ##############

"""
CORE CONCEPTS:
- table=True      : this means it represents a real DB table
- table=False     : when we dont have that table=True, we are just making a "model" using the pydantic package. A model is simply a class that allows us to define data schemas 
- Field(default=None) : tells Python "don't send a value," letting the DB use its DEFAULT
Think of Field(...) as the database settings for a certain variable.

COMMON FIELD TYPES:
- primary_key=True  : Marks PK. For ints, this enables AUTO_INCREMENT automatically
- foreign_key="t.c" : Links to 'table_name.column_name'
- index=True        : Adds a DB index for faster lookups 
- unique=True       : Enforces a UNIQUE constraint in the DB
- sa_column_kwargs  : Only use this if Python name != DB column name
                      Example: sa_column_kwargs={"name": "real_db_name"}
"""

#--- Models ---

#___ Users___ 
class UserBase(SQLModel): #I define this here because we will need it in the other classes below. 
    name: str
    email: str | None = None

# this is what is stored in the DB
class User(UserBase, table=True):
    __tablename__ = "users"
    id: int | None = Field(default=None, primary_key=True)
    eventId: int = Field(foreign_key="events.id")

class UserPublic(UserBase):
    id: int
    eventId: int

class UserCreate(UserBase):
    eventId: int

#___ Events___

class EventBase(SQLModel): # shared data
    classTitle: str | None = None
    professor: str | None = None

class Event(EventBase, table=True): # this is a table model
    __tablename__ = "events"
    id: int | None = Field(default=None, primary_key=True)
    hash: str = Field(unique=True, index=True)
    dateCreated: datetime = Field(default_factory=datetime.now) # default_factory allows a callable function (in this case we get most recent time)

class EventPublic(EventBase): # what we are sending back
    id: int
    hash: str

class EventCreate(EventBase): # this accepts what the professor submits
    slotIds: list[int]

#___availability___

class AvailabilityStatus(str, Enum):
    AVAILABLE = "available"
    PREFERRED = "preferred"
    UNAVAILABLE = "unavailable"

class Availability(SQLModel, table=True):
    __tablename__ = "availability"
    userId: int = Field(primary_key=True, foreign_key="users.id")
    slotId: int = Field(primary_key=True, foreign_key="timeSlots.id")
    status: AvailabilityStatus

#___eventSlots___

class EventSlots(SQLModel, table=True):
    __tablename__ = "eventSlots"
    eventId: int = Field(primary_key=True, foreign_key="events.id")
    slotId: int = Field(primary_key=True, foreign_key="timeSlots.id")

#___timeSlots___
class DaysOfWeek(str, Enum):
    MONDAY = "Monday"
    TUESDAY = "Tuesday"
    WEDNESDAY = "Wednesday"
    THURSDAY = "Thursday"
    FRIDAY = "Friday"
    SATURDAY = "Saturday" # lol why do these even exist
    SUNDAY = "Sunday"

class SlotTypes(str, Enum):
    MIN_50 = "50_min"
    MIN_80 = "80_min"
    MIN_170 = "170_min"

class TimeSlots(SQLModel, table=True):
    __tablename__ = "timeSlots"
    id: int | None = Field(default=None, primary_key=True)
    dayOfWeek: DaysOfWeek
    startTime: time
    endTime: time
    slotType: SlotTypes

#--- DB Setup ---
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]


@app.get("/")
def read_root():
    return {"Hello": "World"}



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

# --- Event Endpoints ---
@app.post("/events/", response_model=EventPublic)
def create_event(event: EventCreate, session: SessionDep): # so event: EventCreate takes in the data the professor sends in (defined earlier). session is DB connection
    generatedHash = token_hex(16)
#  creating an instance of Event and passing in the values below. 
    dbEvent = Event(classTitle = event.classTitle, professor = event.professor, hash = generatedHash)
    session.add(dbEvent)
    session.commit() # this writes it to the database
    session.refresh(dbEvent)

    for slotId in event.slotIds:
        dbEventSlot = EventSlots(eventId=dbEvent.id, slotId=slotId)
        session.add(dbEventSlot)
    session.commit()

    return dbEvent
