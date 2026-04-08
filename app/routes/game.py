from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import database
from app.models import models
from app.schemas import schemas
import random

router = APIRouter()

def check_winner(board: str):
    winning_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
        [0, 4, 8], [2, 4, 6]              # Diagonals
    ]
    for combo in winning_combinations:
        if board[combo[0]] == board[combo[1]] == board[combo[2]] and board[combo[0]] != " ":
            return board[combo[0]]
    if " " not in board:
        return "Draw"
    return None

def ai_move(board: str):
    """Minimax algorithm for unbeatable AI."""
    def get_score(b: str):
        winner = check_winner(b)
        if winner == "O": return 1
        if winner == "X": return -1
        return 0

    def minimax(b: str, is_maximizing: bool):
        score = get_score(b)
        if score != 0 or " " not in b:
            return score

        if is_maximizing:
            best_score = -float('inf')
            for i in range(9):
                if b[i] == " ":
                    new_board = b[:i] + "O" + b[i+1:]
                    s = minimax(new_board, False)
                    best_score = max(s, best_score)
            return best_score
        else:
            best_score = float('inf')
            for i in range(9):
                if b[i] == " ":
                    new_board = b[:i] + "X" + b[i+1:]
                    s = minimax(new_board, True)
                    best_score = min(s, best_score)
            return best_score

    best_val = -float('inf')
    best_move = -1
    for i in range(9):
        if board[i] == " ":
            new_board = board[:i] + "O" + board[i+1:]
            move_val = minimax(new_board, False)
            if move_val > best_val:
                best_val = move_val
                best_move = i
    return best_move

@router.post("/start-game", response_model=schemas.GameState)
def start_game(game: schemas.GameCreate, db: Session = Depends(database.get_db)):
    new_game = models.Game(
        player_x=game.player_x,
        player_o=game.player_o,
        board="         ",
        current_turn="X",
        status="ongoing"
    )
    db.add(new_game)
    db.commit()
    db.refresh(new_game)
    return new_game

@router.post("/make-move", response_model=schemas.GameState)
def make_move(move: schemas.Move, db: Session = Depends(database.get_db)):
    game = db.query(models.Game).filter(models.Game.id == move.game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.status != "ongoing":
        raise HTTPException(status_code=400, detail="Game already completed")

    if game.current_turn != move.player:
        raise HTTPException(status_code=400, detail="Not your turn")

    board_list = list(game.board)
    if board_list[move.position] != " ":
        raise HTTPException(status_code=400, detail="Invalid move")

    board_list[move.position] = move.player
    game.board = "".join(board_list)
    
    # Track move history
    current_history = game.moves_history.split(",") if game.moves_history else []
    current_history.append(str(move.position))
    game.moves_history = ",".join(current_history)
    
    winner = check_winner(game.board)
    if winner:
        game.winner = winner
        game.status = "completed"
    else:
        game.current_turn = "O" if move.player == "X" else "X"

        # AI Turn
        if game.current_turn == "O" and game.player_o == "AI":
            pos = ai_move(game.board)
            if pos is not None:
                board_list = list(game.board)
                board_list[pos] = "O"
                game.board = "".join(board_list)
                winner = check_winner(game.board)
                if winner:
                    game.winner = winner
                    game.status = "completed"
                else:
                    game.current_turn = "X"
                
                # Track AI move history
                current_history = game.moves_history.split(",") if game.moves_history else []
                current_history.append(str(pos))
                game.moves_history = ",".join(current_history)

    db.commit()
    db.refresh(game)
    return game

@router.get("/game-state/{game_id}", response_model=schemas.GameState)
def get_game_state(game_id: int, db: Session = Depends(database.get_db)):
    game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(database.get_db)):
    games = db.query(models.Game).filter(models.Game.status == "completed").all()
    stats = {}
    for g in games:
        if g.winner == "X":
            stats[g.player_x] = stats.get(g.player_x, 0) + 1
        elif g.winner == "O":
            stats[g.player_o] = stats.get(g.player_o, 0) + 1
    
    sorted_stats = sorted(stats.items(), key=lambda item: item[1], reverse=True)
    return [{"player": player, "wins": wins} for player, wins in sorted_stats]

@router.get("/games/recent", response_model=list[schemas.GameState])
def get_recent_games(db: Session = Depends(database.get_db)):
    return db.query(models.Game).order_by(models.Game.created_at.desc()).limit(10).all()
