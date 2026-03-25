import os
from datetime import datetime, time
from enum import Enum
from secrets import token_hex
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlmodel import Field, Session, SQLModel, create_engine, select

app = FastAPI()

# cors is a pain in the ass so im just gonna allow everything for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this down later for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()  # this loads the .env variables

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

# --- Models ---


# ___ Users___
class UserBase(
    SQLModel
):  # I define this here because we will need it in the other classes below.
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


# ___ Events___


class EventBase(SQLModel):  # shared data
    classTitle: str | None = None
    professor: str | None = None


class Event(EventBase, table=True):  # this is a table model
    __tablename__ = "events"
    id: int | None = Field(default=None, primary_key=True)
    hash: str = Field(unique=True, index=True)
    dateCreated: datetime = Field(
        default_factory=datetime.now
    )  # default_factory allows a callable function (in this case we get most recent time)


class EventPublic(EventBase):  # what we are sending back
    id: int
    hash: str


class EventCreate(EventBase):  # this accepts what the professor submits
    slotIds: list[int]


class EventWithSlots(EventBase):
    id: int
    hash: str
    slotIds: list[int]


# ___availability___


class AvailabilityStatus(str, Enum):
    available = "available"
    preferred = "preferred"
    unavailable = "unavailable"


class Availability(SQLModel, table=True):
    __tablename__ = "availability"
    userId: int = Field(primary_key=True, foreign_key="users.id")
    slotId: int = Field(primary_key=True, foreign_key="timeSlots.id")
    status: AvailabilityStatus


class AvailabilityItem(
    SQLModel
):  # combine the slotId with the enum we defined a few lines earlier
    slotId: int
    status: AvailabilityStatus


class AvailabilitySubmission(SQLModel):  # this is the full submission
    eventHash: str
    user: UserBase
    availability: list[AvailabilityItem]


# ___eventSlots___


class EventSlots(SQLModel, table=True):
    __tablename__ = "eventSlots"
    eventId: int = Field(primary_key=True, foreign_key="events.id")
    slotId: int = Field(primary_key=True, foreign_key="timeSlots.id")


# ___timeSlots___
class DaysOfWeek(str, Enum):
    Monday = "Monday"
    Tuesday = "Tuesday"
    Wednesday = "Wednesday"
    Thursday = "Thursday"
    Friday = "Friday"
    Saturday = "Saturday"  # lol why do these even exist
    Sunday = "Sunday"


class SlotTypes(str, Enum):
    min_50 = "min_50"
    min_80 = "min_80"
    min_170 = "min_170"


class TimeSlots(SQLModel, table=True):
    __tablename__ = "timeSlots"
    id: int | None = Field(default=None, primary_key=True)
    dayOfWeek: DaysOfWeek
    startTime: time
    endTime: time
    # slotType: SlotTypes
    slotType: str


# ___ResultSlots___
# this is the model for the result that the teacher gets shown


class ResultSlots(SQLModel):
    slotId: int
    dayOfWeek: DaysOfWeek
    startTime: time
    endTime: time
    available: int
    preferred: int
    unavailable: int


# --- DB Setup ---
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
@app.post(
    "/users/", response_model=UserPublic
)  # the response_model tells FastAPI what to return. remember we defined UserPublic earlier
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
def create_event(
    event: EventCreate, session: SessionDep
):  # so event: EventCreate takes in the data the professor sends in (defined earlier). session is DB connection
    generatedHash = token_hex(16)
    #  creating an instance of Event and passing in the values below.
    dbEvent = Event(
        classTitle=event.classTitle, professor=event.professor, hash=generatedHash
    )
    session.add(dbEvent)
    session.commit()  # this writes it to the database
    session.refresh(dbEvent)

    for slotId in event.slotIds:
        dbEventSlot = EventSlots(eventId=dbEvent.id, slotId=slotId)
        session.add(dbEventSlot)
    session.commit()

    return dbEvent


# this endpoint returns the json for a specific event based on the hash
@app.get(
    "/events/{hash}", response_model=EventWithSlots
)  # fastAPI will see {hash} and match it to the hash: str below
def get_event_by_hash(hash: str, session: SessionDep):
    # get event
    event = session.exec(
        select(Event).where(Event.hash == hash)
    ).first()  # gets the event by hash.
    # .first() selects the first result (there should not be duplicates anyway)
    if not event:  # throw error if we cant find an event with that hash
        raise HTTPException(
            status_code=404,
            detail=f"We were unable to retrieve event with a hash of {hash}",
        )
    slots = session.exec(select(EventSlots).where(EventSlots.eventId == event.id)).all()
    slotIds = [slot.slotId for slot in slots]  # this gets just the slotId for each row

    return EventWithSlots(
        id=event.id,
        hash=event.hash,
        classTitle=event.classTitle,
        professor=event.professor,
        slotIds=slotIds,
    )


# --- Availability Endpoints ---


@app.post("/availability")
def submit_availability(submission: AvailabilitySubmission, session: SessionDep):

    # get event (we can re-use logic from GET endpoint). this time however grab the hash from the request body
    event = session.exec(
        select(Event).where(Event.hash == submission.eventHash)
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found!")

    dbUser = User(
        eventId=event.id, name=submission.user.name, email=submission.user.email
    )

    session.add(dbUser)
    session.commit()
    session.refresh(dbUser)

    for item in submission.availability:
        dbAvailability = Availability(
            userId=dbUser.id, slotId=item.slotId, status=item.status
        )
        session.add(dbAvailability)
    session.commit()
    return {"message": "Availability submitted successfully"}


# --- Results Endpoints ---


@app.get("/events/{hash}/results", response_model=list[ResultSlots])
def get_results(hash: str, session: SessionDep):
    event = session.exec(select(Event).where(Event.hash == hash)).first()
    if not event:  # throw error if we cant find an event with that hash
        raise HTTPException(
            status_code=404,
            detail=f"We were unable to retrieve results for event with a hash: {hash}",
        )

    slots = session.exec(select(EventSlots).where(EventSlots.eventId == event.id)).all()
    slotIds = [slot.slotId for slot in slots]  # this gets just the slotId for each row
    results = []  # blank array to store the results
    for slotId in slotIds:  # this gets the time slot details
        timeSlot = session.get(TimeSlots, slotId)
        availabilityRows = session.exec(
            select(Availability).where(Availability.slotId == slotId)
        ).all()

        # decided to opt for using the func method from sqlalchemy which allows us to call SQL functions.
        #     calling func.count() is the equivalant to doing an actual query:
        #     SELECT COUNT(*) FROM availability WHERE slotId = 1 AND status = 'available'

        # get available
        available = session.exec(
            select(func.count()).where(
                Availability.slotId == slotId,
                Availability.status == AvailabilityStatus.available,
            )
        ).one()
        # get preferred
        preferred = session.exec(
            select(func.count()).where(
                Availability.slotId == slotId,
                Availability.status == AvailabilityStatus.preferred,
            )
        ).one()
        # get unavailable (im not even sure right now our frontend produces any unavailable, and im not sure that it should.
        # nonetheless this could prove important???)
        unavailable = session.exec(
            select(func.count()).where(
                Availability.slotId == slotId,
                Availability.status == AvailabilityStatus.unavailable,
            )
        ).one()

        results.append(
            ResultSlots(
                slotId=slotId,
                dayOfWeek=timeSlot.dayOfWeek,
                startTime=timeSlot.startTime,
                endTime=timeSlot.endTime,
                available=available,
                preferred=preferred,
                unavailable=unavailable,
            )
        )
    return results
