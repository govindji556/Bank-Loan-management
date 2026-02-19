from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine,Base
from app.features.users.router import router as users_router
from app.features.auth.router import router as auth_router

@asynccontextmanager
async def lifespan(app:FastAPI):

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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

app.include_router(users_router) 
app.include_router(auth_router)

@app.get("/")
async def index():
    return {"message": "Hello World"}
