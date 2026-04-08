const API_URL = '/api';

// DOM Elements
const setupSection = document.getElementById('setup-section');
const gameSection = document.getElementById('game-section');
const playerXInput = document.getElementById('player-x');
const playerOInput = document.getElementById('player-o');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const cells = document.querySelectorAll('.cell');
const turnIndicator = document.getElementById('turn-indicator');
const gameIdSpan = document.querySelector('#game-id-display span');
const leaderboardList = document.getElementById('leaderboard-list');
const historyList = document.getElementById('history-list'); // Added
const winnerModal = document.getElementById('winner-modal');
const winnerText = document.getElementById('winner-text');
const winnerSubtext = document.getElementById('winner-subtext');
const modalCloseBtn = document.getElementById('modal-close-btn');
const loadingOverlay = document.getElementById('loading');

// Game State
let currentGameId = null;
let currentTurnPlayer = 'X';
let gameStatus = 'ongoing';
let playerNames = { X: '', O: '' };

// Show/Hide Loading
function setLoading(isLoad) {
    if (isLoad) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

// Fetch Leaderboard
async function fetchLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/leaderboard`);
        const data = await response.json();
        
        leaderboardList.innerHTML = '';
        if (data.length === 0) {
            leaderboardList.innerHTML = '<li style="justify-content:center;color:#94A3B8">No games played yet.</li>';
        } else {
            data.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${item.player}</span><span>${item.wins} Wins</span>`;
                leaderboardList.appendChild(li);
            });
        }
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
    }
}

// Fetch History
async function fetchHistory() {
    try {
        const response = await fetch(`${API_URL}/games/recent`);
        const data = await response.json();
        
        historyList.innerHTML = '';
        if (data.length === 0) {
            historyList.innerHTML = '<li style="justify-content:center;color:#94A3B8">No history found.</li>';
        } else {
            data.forEach(game => {
                const li = document.createElement('li');
                li.onclick = () => viewGame(game);
                
                const date = new Date(game.created_at).toLocaleDateString();
                const resultText = game.winner === 'Draw' ? 'Draw' : (game.winner === 'X' ? 'X Won' : 'O Won');
                const resultClass = game.winner === 'Draw' ? 'result-draw' : (game.winner === 'X' ? 'result-win' : 'result-loss');

                li.innerHTML = `
                    <div class="history-info">
                        <span class="history-players">${game.player_x} vs ${game.player_o}</span>
                        <span class="history-meta">${date} • Game #${game.id}</span>
                    </div>
                    <span class="history-result ${resultClass}">${resultText}</span>
                `;
                historyList.appendChild(li);
            });
        }
    } catch (err) {
        console.error('Error fetching history:', err);
    }
}

// View Past Game (with Replay)
async function viewGame(game) {
    currentGameId = game.id;
    currentTurnPlayer = 'X'; // Start sequence from X
    gameStatus = 'viewing'; 
    playerNames.X = game.player_x;
    playerNames.O = game.player_o;

    gameIdSpan.textContent = `#${game.id} (Replaying...)`;
    
    setupSection.classList.add('hidden');
    gameSection.classList.remove('hidden');

    // Clear board for replay
    updateBoardUI("         ");
    
    if (game.moves_history) {
        const moves = game.moves_history.split(',');
        let turn = 'X';
        for (const posIdx of moves) {
            await new Promise(resolve => setTimeout(resolve, 600)); // Delay for animation
            const pos = parseInt(posIdx);
            
            // Minimal UI update for replay
            cells[pos].textContent = turn;
            cells[pos].classList.add(turn.toLowerCase());
            
            turn = (turn === 'X' ? 'O' : 'X');
            turnIndicator.textContent = `Replaying... (${turn}'s move)`;
            turnIndicator.className = turn === 'X' ? 'turn-x' : 'turn-o';
        }
    }

    gameStatus = 'completed'; // Lock board
    turnIndicator.textContent = game.winner === 'Draw' ? 'Final: Draw!' : `Final: ${game.winner} Won`;
    gameIdSpan.textContent = `#${game.id} (Viewed)`;
}

// Start Game
startBtn.addEventListener('click', async () => {
    const xName = playerXInput.value.trim() || 'Player X';
    const oName = playerOInput.value.trim() || 'AI';

    setLoading(true);
    try {
        const response = await fetch(`${API_URL}/start-game`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player_x: xName, player_o: oName })
        });
        const data = await response.json();
        
        setupGameUI(data);
    } catch (err) {
        alert('Failed to start game');
        console.error(err);
    } finally {
        setLoading(false);
    }
});

function setupGameUI(data) {
    currentGameId = data.id;
    currentTurnPlayer = data.current_turn;
    gameStatus = data.status;
    playerNames.X = data.player_x;
    playerNames.O = data.player_o;

    localStorage.setItem('ttt_game_id', data.id); // Save for session tracking
    localStorage.setItem('ttt_player_x', data.player_x);
    localStorage.setItem('ttt_player_o', data.player_o);

    gameIdSpan.textContent = `#${data.id}`;
    updateBoardUI(data.board);
    updateTurnIndicator();

    setupSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
}

function updateBoardUI(boardString) {
    for (let i = 0; i < 9; i++) {
        const cellVal = boardString[i];
        cells[i].textContent = cellVal !== ' ' ? cellVal : '';
        cells[i].className = 'cell'; // Reset classes
        if (cellVal === 'X') cells[i].classList.add('x');
        if (cellVal === 'O') cells[i].classList.add('o');
    }
}

function updateTurnIndicator() {
    turnIndicator.textContent = `Turn: ${currentTurnPlayer}`;
    turnIndicator.className = currentTurnPlayer === 'X' ? 'turn-x' : 'turn-o';
}

// Handle Cell Click
cells.forEach((cell, index) => {
    cell.addEventListener('click', async () => {
        if (gameStatus !== 'ongoing') return;
        if (cell.textContent !== '') return; // cell occupied
        
        // Optimistic UI Update purely for instant feel, reverted if failed
        cell.textContent = currentTurnPlayer;
        cell.classList.add(currentTurnPlayer.toLowerCase());
        
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/make-move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game_id: currentGameId,
                    position: index,
                    player: currentTurnPlayer
                })
            });
            const data = await response.json();
            
            if (!response.ok) {
                alert(data.detail);
                updateBoardUI(data.board || "         "); // reset
                return;
            }

            currentGameId = data.id;
            currentTurnPlayer = data.current_turn;
            gameStatus = data.status;
            
            updateBoardUI(data.board);
            updateTurnIndicator();

            if (gameStatus === 'completed') {
                localStorage.removeItem('ttt_game_id'); // Clear session
                localStorage.removeItem('ttt_player_x');
                localStorage.removeItem('ttt_player_o');
                showWinner(data.winner);
            }

        } catch (err) {
            console.error('Move failed:', err);
        } finally {
            setLoading(false);
        }
    });
});

// Show Winner Modal
function showWinner(winner) {
    if (winner === 'Draw') {
        winnerText.textContent = "It's a Draw!";
        winnerText.style.background = "linear-gradient(to right, #94A3B8, #CBD5E1)";
        winnerText.style.webkitBackgroundClip = "text";
        winnerText.style.backgroundClip = "text";
        winnerSubtext.textContent = "Nobody wins this time. Try again!";
    } else {
        winnerText.textContent = `${winner} Wins!`;
        if (winner === 'X') {
            winnerText.style.background = "linear-gradient(to right, #ef4444, #f87171)";
        } else {
            winnerText.style.background = "linear-gradient(to right, #3b82f6, #60a5fa)";
        }
        winnerText.style.webkitBackgroundClip = "text";
        winnerText.style.backgroundClip = "text";
        winnerSubtext.textContent = `Congratulations ${playerNames[winner]}!`;
    }
    
    winnerModal.classList.remove('hidden');
    fetchLeaderboard(); // Update leaderboard behind the scenes
}

// Modal Close
modalCloseBtn.addEventListener('click', () => {
    winnerModal.classList.add('hidden');
});

// Restart Game Button (goes back to setup screen)
restartBtn.addEventListener('click', () => {
    gameSection.classList.add('hidden');
    setupSection.classList.remove('hidden');
    currentGameId = null;
    currentTurnPlayer = 'X';
    gameStatus = 'ongoing';
    localStorage.removeItem('ttt_game_id'); // Clear session
});

// Resume Game on Load
async function checkResumeGame() {
    const savedId = localStorage.getItem('ttt_game_id');
    const savedX = localStorage.getItem('ttt_player_x');
    const savedO = localStorage.getItem('ttt_player_o');

    if (savedX) playerXInput.value = savedX;
    if (savedO) playerOInput.value = savedO;

    if (savedId) {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/game-state/${savedId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ongoing') {
                    setupGameUI(data);
                } else {
                    localStorage.removeItem('ttt_game_id');
                }
            } else {
                localStorage.removeItem('ttt_game_id');
            }
        } catch (err) {
            console.error('Failed to resume:', err);
        } finally {
            setLoading(false);
        }
    }
}

// Initial Fetch
fetchLeaderboard();
fetchHistory();
checkResumeGame();
