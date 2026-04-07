# Full-Stack Tic Tac Toe App

A modern, responsive, and fully functional Tic Tac Toe web application built with a **Vanilla HTML/CSS/JS** frontend and a **Python FastAPI** backend powered by **SQLite / SQLAlchemy**.

## Features

- **Modern UI**: Clean aesthetic, hover effects, CSS animations, glassmorphism-inspired cards.
- **Two-Player & AI Modes**: Play against another human or against a basic AI opponent (simply type "AI" as the Player O name).
- **Persistent Game State**: All games are stored in an SQLite database using SQLAlchemy ORM.
- **Leaderboard**: Track how many wins each player has over time.
- **API Backend**: Real RESTful API built with FastAPI and validated by Pydantic.

## Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (Fetch API)
- **Backend**: Python 3.9+, FastAPI, Uvicorn
- **Database**: SQLite, SQLAlchemy
- **Data Validation**: Pydantic

## Project Structure

```text
├── app/
│   ├── database/
│   │   └── database.py    # Database engine and session config
│   ├── models/
│   │   └── models.py      # SQLAlchemy ORM models
│   ├── schemas/
│   │   └── schemas.py     # Pydantic validation schemas
│   ├── routes/
│   │   └── game.py        # FastAPI API router endpoints for game logic
├── frontend/
│   ├── index.html         # Main UI
│   ├── style.css          # Styling, UI components, animations
│   └── script.js          # Client-side logic, API calls
├── main.py                # FastAPI entry point
├── run.py                 # Convenience script to run Uvicorn
├── requirements.txt       # Python dependencies
└── README.md              # Project documentation
```

## Setup & Running the Application

### 1. Install Dependencies

Ensure you have Python installed. It is recommended to use a virtual environment.

```bash
# Create and activate virtual environment (optional but recommended)
python -m venv .venv
# source .venv/bin/activate  # On Linux/macOS
# .venv\Scripts\activate     # On Windows

# Install requirements
pip install -r requirements.txt
```

### 2. Run the Application

You can start the backend by directly calling the `run.py` script:

```bash
python run.py
```

Alternatively, you can start the application using `uvicorn`:

```bash
uvicorn main:app --reload
```

### 3. Access the Game

Open your web browser and navigate to:

**http://localhost:8000**

- The frontend is served statically by FastAPI.
- Complete API documentation (Swagger UI) is automatically available at: **http://localhost:8000/docs**
