$(document).ready(function () {
    const $grid = $('#game');
    const $retryButton = $('#retry');
    const difficulty = {
        easy: { width: 5, height: 5, minesCount: 5 },
        medium: { width: 10, height: 10, minesCount: 20 },
        hard: { width: 15, height: 15, minesCount: 50 },
    };
    let width, height, minesCount, cells, isGameOver, flags, squaresRevealed, isFirstClick;

    function initializeGame() {
        $grid.css('gridTemplateColumns', `repeat(${width}, 40px)`).empty();
        $retryButton.hide();
        cells = [];
        isGameOver = false;
        flags = 0;
        squaresRevealed = 0;
        isFirstClick = true;
        createEmptyBoard();
    }

    function startGame(level) {
        ({ width, height, minesCount } = difficulty[level]);
        initializeGame();
    }

    window.startGame = startGame;

    function createEmptyBoard() {
        for (let i = 0; i < width * height; i++) {
            const $cell = $('<div>', {
                id: i,
                class: 'cell empty'
            }).on('click', () => clickCell($cell))
              .on('contextmenu', (e) => { e.preventDefault(); addFlag($cell); });

            $grid.append($cell);
            cells.push($cell);
        }
    }

    function generateMines(excludeIndex) {
        const minePositions = new Set();
        while (minePositions.size < minesCount) {
            const index = Math.floor(Math.random() * width * height);
            if (index !== excludeIndex) {
                minePositions.add(index);
            }
        }

        minePositions.forEach(index => {
            cells[index].removeClass('empty').addClass('mine');
        });

        cells.forEach(($cell, i) => {
            if ($cell.hasClass('empty')) {
                $cell.attr('data', getAdjacentMines(i));
            }
        });
    }

    function getAdjacentMines(i) {
        const directions = [
            -1, 1, -width, width, -width - 1, -width + 1, width - 1, width + 1
        ];
        const isLeftEdge = (i % width === 0);
        const isRightEdge = (i % width === width - 1);

        return directions.reduce((count, dir) => {
            const idx = i + dir;
            if (
                idx >= 0 &&
                idx < width * height &&
                !((dir === -1 || dir === -width - 1 || dir === width - 1) && isLeftEdge) &&
                !((dir === 1 || dir === -width + 1 || dir === width + 1) && isRightEdge)
            ) {
                return count + (cells[idx].hasClass('mine') ? 1 : 0);
            }
            return count;
        }, 0);
    }

    function clickCell($cell) {
        if (isGameOver || $cell.hasClass('revealed') || $cell.hasClass('flag')) return;

        if (isFirstClick) {
            generateMines(parseInt($cell.attr('id')));
            isFirstClick = false;
        }

        if ($cell.hasClass('mine')) {
            gameOver($cell);
        } else {
            const total = $cell.attr('data');
            $cell.addClass('revealed').text(total != 0 ? total : '');
            squaresRevealed++;
            if (total == 0) revealAdjacentCells(parseInt($cell.attr('id')));
            checkForWin();
        }
    }

    function revealAdjacentCells(id) {
        const directions = [-1, 1, -width, width, -width - 1, -width + 1, width - 1, width + 1];
        directions.forEach(dir => {
            const idx = id + dir;
            if (idx >= 0 && idx < width * height && !cells[idx].hasClass('revealed')) {
                clickCell(cells[idx]);
            }
        });
    }

    function addFlag($cell) {
        if (isGameOver || $cell.hasClass('revealed')) return;
        $cell.toggleClass('flag').html($cell.hasClass('flag') ? '🚩' : '');
        flags += $cell.hasClass('flag') ? 1 : -1;
        checkForWin();
    }

    function checkForWin() {
        const matches = cells.filter($cell => $cell.hasClass('flag') && $cell.hasClass('mine')).length;
        if (matches === minesCount && squaresRevealed + minesCount === width * height) {
            alert('Congratulations! You won!');
            isGameOver = true;
        }
    }

    function gameOver($cell) {
        isGameOver = true;
        cells.forEach($cell => {
            if ($cell.hasClass('mine')) {
                $cell.html('💣').removeClass('empty').addClass('revealed');
            }
        });
        $cell.addClass('active');
        alert('Game Over! You clicked on a mine.');
        $retryButton.show();
    }

    window.retryGame = () => startGame('easy');  
});