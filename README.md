# Full-Stack Tic Tac Toe App

A modern, responsive, and fully functional Tic Tac Toe web application built with a **Vanilla HTML/CSS/JS** frontend and a **Python FastAPI** backend powered by **SQLite / SQLAlchemy**.

## Features

- **Modern UI**: Clean aesthetic, hover effects, CSS animations, glassmorphism-inspired cards.
- **Two-Player & AI Modes**: Play against another human or against a basic AI opponent (simply type "AI" as the Player O name).
- **Persistent Game State**: All games are stored in an SQLite database using SQLAlchemy ORM.
- **Leaderboard**: Track how many wins each player has over time.
- **API Backend**: Real RESTful API built with FastAPI and validated by Pydantic.
- **Development Log**: Check out the [Prompt History](PROMPT_HISTORY.md) to see how this project was built!

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

---

## 🚀 Professional Deployment Guide (Free)

To deploy this project to the public internet for free, we recommend using **Render**.

### Step 1: Prepare Your Code
1. Mirror these files to a **GitHub Repository**.
2. Ensure you do NOT push a `.env` file (the `.env.example` is provided for reference).

### Step 2: Deploy to Render
1. Create a free account at [Render.com](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Configure the following:
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`
5. Click **Deploy Web Service**.

### Step 3: Access Your Game
Once the build is complete, Render will provide a URL like:
`https://tic-tac-toe-xyz.onrender.com`

**This is the direct link your users and clients will hit to play the game!**

---

> [!NOTE]
> **Persistence**: This app uses SQLite. On Render's free tier, the database resets when the service restarts. For permanent leaderboards, consider connecting a managed PostgreSQL database.
