from sqlalchemy import Column, Integer, String
from app.database.database import Base

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    player_x = Column(String, default="Player X")
    player_o = Column(String, default="AI")
    board = Column(String, default="         ")  # 9 spaces
    current_turn = Column(String, default="X")
    winner = Column(String, nullable=True)  # "X", "O", "Draw", or None
    status = Column(String, default="ongoing")
