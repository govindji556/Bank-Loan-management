from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine,Base

@asynccontextmanager
async def lifespan(app:FastAPI):

    async with engine.begin() as conn:
        conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="Bank Loan API",
    description="API for managing bank loans",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def index():
    return {"message": "Hello World"}
