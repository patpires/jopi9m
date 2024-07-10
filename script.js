const boardSize = 10;
let board = [];
let ships = [];
let hits = 0;
let misses = 0;
let timeLeft = 84;
let timer;

document.addEventListener('DOMContentLoaded', () => {
    showStartScreen();
});

function showStartScreen() {
    document.getElementById('startScreen').classList.add('active');
    document.getElementById('gameScreen').classList.remove('active');
}

function startGame() {
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    createBoard();
    placeShips();
    startTimer();
}

function createBoard() {
    const gameBoard = document.getElementById('gameBoard');
    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
            board[i][j] = cell;
        }
    }
}

function placeShips() {
    const shipTypes = [
        { name: "Hidro-avião", size: 4, special: true },
        { name: "Encouraçado", size: 5 },
        { name: "Cruzador", size: 4 },
        { name: "Cruzador", size: 4 },
        { name: "Destroyer", size: 2 },
        { name: "Destroyer", size: 2 },
        { name: "Destroyer", size: 2 },
        { name: "Submarino", size: 1 },
        { name: "Submarino", size: 1 },
        { name: "Submarino", size: 1 },
        { name: "Submarino", size: 1 }
    ];

    for (let ship of shipTypes) {
        placeShip(ship);
    }
}

function placeShip(ship) {
    let placed = false;
    while (!placed) {
        const isVertical = Math.random() < 0.5;
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);
        if (ship.special) {
            placed = placeSpecialShip(row, col, isVertical);
        } else {
            if (canPlaceShip(row, col, ship.size, isVertical)) {
                const shipCells = [];
                for (let i = 0; i < ship.size; i++) {
                    const newRow = row + (isVertical ? i : 0);
                    const newCol = col + (!isVertical ? i : 0);
                    board[newRow][newCol].dataset.ship = ship.name;
                    shipCells.push(board[newRow][newCol]);
                }
                ships.push({ name: ship.name, cells: shipCells, hits: 0, notifiedHit: false, notifiedSunk: false });
                placed = true;
            }
        }
    }
}

function placeSpecialShip(row, col, isVertical) {
    const positions = isVertical
        ? [[0, 0], [1, 0], [2, 0], [1, -1]]
        : [[0, 0], [0, 1], [0, 2], [-1, 1]];

    for (let [dRow, dCol] of positions) {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize || board[newRow][newCol].dataset.ship) {
            return false;
        }
    }

    const shipCells = [];
    for (let [dRow, dCol] of positions) {
        const newRow = row + dRow;
        const newCol = col + dCol;
        board[newRow][newCol].dataset.ship = "Hidro-avião";
        shipCells.push(board[newRow][newCol]);
    }
    ships.push({ name: "Hidro-avião", cells: shipCells, hits: 0, notifiedHit: false, notifiedSunk: false });
    return true;
}

function canPlaceShip(row, col, size, isVertical) {
    for (let i = 0; i < size; i++) {
        const newRow = row + (isVertical ? i : 0);
        const newCol = col + (!isVertical ? i : 0);

        if (newRow >= boardSize || newCol >= boardSize || board[newRow][newCol].dataset.ship) {
            return false;
        }

        // Check surrounding cells to ensure no ships are touching
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                const checkRow = newRow + x;
                const checkCol = newCol + y;
                if (checkRow >= 0 && checkRow < boardSize && checkCol >= 0 && checkCol < boardSize) {
                    if (board[checkRow][checkCol].dataset.ship) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

function handleCellClick(event) {
    const cell = event.target;
    if (cell.classList.contains('hit') || cell.classList.contains('miss')) {
        return;
    }
    if (cell.dataset.ship) {
        cell.classList.add('hit');
        hits++;
        const ship = ships.find(s => s.cells.includes(cell));
        ship.hits++;
        if (!ship.notifiedHit) {
            alert(`Você acertou um ${ship.name}!`);
            ship.notifiedHit = true;
        }
        if (ship.hits === ship.cells.length && !ship.notifiedSunk) {
            ship.cells.forEach(c => c.classList.add('sunk'));
            alert(`Você afundou um ${ship.name}!`);
            ship.notifiedSunk = true;
        }
        if (ships.every(s => s.hits === s.cells.length)) {
            endGame(true);
        }
    } else {
        cell.classList.add('miss');
        misses++;
    }
    checkForEndGame();
}

function checkForEndGame() {
    if (ships.every(s => s.hits === s.cells.length)) {
        endGame(true);
    } else if (Array.from(document.querySelectorAll('.cell')).every(cell => cell.classList.contains('hit') || cell.classList.contains('miss'))) {
        endGame(false);
    }
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('time').innerText = timeLeft;
        if (timeLeft === 0) {
            endGame(false);
        }
    }, 1000);
}

function endGame(won) {
    clearInterval(timer);
    const message = document.getElementById('message');
    if (won) {
        message.innerText = "Parabéns pela batalha! Você foi um sucesso!";
    } else {
        message.innerText = "Oh, que pena, você perdeu... Tente novamente!";
    }
    revealAllCells();
    document.getElementById('restartBtn').style.display = 'block';
}

function revealAllCells() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = board[i][j];
            if (!cell.classList.contains('hit') && !cell.classList.contains('miss')) {
                if (cell.dataset.ship) {
                    cell.classList.add('hit');
                } else {
                    cell.classList.add('miss');
                }
            }
        }
    }
}

function restartGame() {
    board = [];
    ships = [];
    hits = 0;
    misses = 0;
    timeLeft = 84;
    document.getElementById('gameBoard').innerHTML = '';
    document.getElementById('message').innerText = '';
    document.getElementById('restartBtn').style.display = 'none';
    createBoard();
    placeShips();
    startTimer();
}