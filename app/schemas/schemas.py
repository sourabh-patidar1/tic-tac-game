from pydantic import BaseModel
from typing import Optional

class GameCreate(BaseModel):
    player_x: str
    player_o: str

class GameState(BaseModel):
    id: int
    player_x: str
    player_o: str
    board: str
    current_turn: str
    winner: Optional[str] = None
    status: str

    model_config = {"from_attributes": True}

class Move(BaseModel):
    game_id: int
    position: int  # 0 to 8
    player: str  # "X" or "O"
