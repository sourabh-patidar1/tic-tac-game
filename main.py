from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import database
from app.models import models
from app.routes import game

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Tic Tac Toe API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(game.router, prefix="/api")

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
