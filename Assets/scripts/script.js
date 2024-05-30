document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('game');
    const retryButton = document.getElementById('retry');
    const difficulty = {
        easy: { width: 5, height: 5, minesCount: 5 },
        medium: { width: 10, height: 10, minesCount: 20 },
        hard: { width: 20, height: 20, minesCount: 50 },
    };
    let width, height, minesCount;
    let cells = [];
    let isGameOver = false;
    let flags = 0;
    let squaresRevealed = 0;

    window.startGame = function (level) {
        const config = difficulty[level];
        width = config.width;
        height = config.height;
        minesCount = config.minesCount;
        grid.style.gridTemplateColumns = `repeat(${width}, 40px)`;
        grid.innerHTML = '';
        retryButton.style.display = 'none';
        cells = [];
        isGameOver = false;
        flags = 0;
        squaresRevealed = 0;
        createBoard();
    };

    function createBoard() {
        const minesArray = Array(minesCount).fill('mine');
        const emptyArray = Array(width * height - minesCount).fill('empty');
        const gameArray = emptyArray.concat(minesArray).sort(() => Math.random() - 0.5);

        for (let i = 0; i < width * height; i++) {
            const cell = document.createElement('div');
            cell.setAttribute('id', i);
            cell.classList.add('cell');
            cell.classList.add(gameArray[i]);
            grid.appendChild(cell);
            cells.push(cell);

            cell.addEventListener('click', () => clickCell(cell));
            cell.oncontextmenu = (e) => {
                e.preventDefault();
                addFlag(cell);
            };
        }

        for (let i = 0; i < cells.length; i++) {
            const isLeftEdge = (i % width === 0);
            const isRightEdge = (i % width === width - 1);

            if (cells[i].classList.contains('empty')) {
                let total = 0;
                if (i > 0 && !isLeftEdge && cells[i - 1].classList.contains('mine')) total++;
                if (i > width - 1 && !isRightEdge && cells[i + 1 - width].classList.contains('mine')) total++;
                if (i > width && cells[i - width].classList.contains('mine')) total++;
                if (i > width + 1 && !isLeftEdge && cells[i - 1 - width].classList.contains('mine')) total++;
                if (i < width * height - 1 && !isRightEdge && cells[i + 1].classList.contains('mine')) total++;
                if (i < width * height - width && !isLeftEdge && cells[i - 1 + width].classList.contains('mine')) total++;
                if (i < width * height - width - 2 && !isRightEdge && cells[i + 1 + width].classList.contains('mine')) total++;
                if (i < width * height - width - 1 && cells[i + width].classList.contains('mine')) total++;
                cells[i].setAttribute('data', total);
            }
        }
    }

    function clickCell(cell) {
        if (isGameOver) return;
        if (cell.classList.contains('revealed') || cell.classList.contains('flag')) return;

        if (cell.classList.contains('mine')) {
            gameOver(cell);
        } else {
            const total = cell.getAttribute('data');
            if (total != 0) {
                cell.classList.add('revealed');
                cell.innerHTML = total;
                squaresRevealed++;
                checkForWin();
                return;
            }
            revealCell(cell);
        }
        cell.classList.add('revealed');
        squaresRevealed++;
        checkForWin();
    }

    function revealCell(cell) {
        const id = parseInt(cell.id);
        const isLeftEdge = (id % width === 0);
        const isRightEdge = (id % width === width - 1);

        setTimeout(() => {
            if (id > 0 && !isLeftEdge) clickCell(cells[id - 1]);
            if (id > width - 1 && !isRightEdge) clickCell(cells[id + 1 - width]);
            if (id > width) clickCell(cells[id - width]);
            if (id > width + 1 && !isLeftEdge) clickCell(cells[id - 1 - width]);
            if (id < width * height - 1 && !isRightEdge) clickCell(cells[id + 1]);
            if (id < width * height - width && !isLeftEdge) clickCell(cells[id - 1 + width]);
            if (id < width * height - width - 2 && !isRightEdge) clickCell(cells[id + 1 + width]);
            if (id < width * height - width - 1) clickCell(cells[id + width]);
        }, 10);
    }

    function addFlag(cell) {
        if (isGameOver) return;
        if (!cell.classList.contains('revealed') && cell.classList.contains('flag')) {
            cell.classList.remove('flag');
            cell.innerHTML = '';
            flags--;
        } else if (!cell.classList.contains('revealed')) {
            cell.classList.add('flag');
            cell.innerHTML = '🚩';
            flags++;
        }
        checkForWin();
    }

    function checkForWin() {
        let match = 0;
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].classList.contains('flag') && cells[i].classList.contains('mine')) {
                match++;
            }
        }
        if (match === minesCount && squaresRevealed + minesCount === width * height) {
            alert('Congratulations! You won!');
            isGameOver = true;
        }
    }

    function gameOver(cell) {
        isGameOver = true;
        cell.classList.add('mine', 'active');
        cells.forEach(cell => {
            if (cell.classList.contains('mine')) {
                cell.innerHTML = '💣';
                cell.classList.add('revealed', 'active');
            }
        });
        alert('Game Over! You clicked on a mine.');
        retryButton.style.display = 'block';
    }
});