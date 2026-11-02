(async () => {
    const passed = [];
    const check = (name, condition) => {
        if (!condition) throw new Error(name);
        passed.push(name);
    };
    AudioEngine.muted = true;
    const shoot = (element, button = 0, pointerType = 'mouse') => {
        element.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true, button, isPrimary: true, pointerType
        }));
    };
    for (const key of ['easy', 'medium', 'expert']) {
        setDifficulty(key);
        check(`${key}: board dimensions`, document.querySelectorAll('.ms-cell').length === currentDiff.rows * currentDiff.cols);
        handleCellClick(0, 0);
        check(`${key}: mine count`, board.flat().filter(cell => cell.isMine).length === currentDiff.mines);
        check(`${key}: safe first click`, board[0][0].isRevealed && board[0][0].neighborMines === 0);
        check(`${key}: neighbor counts`, board.flat().filter(cell => !cell.isMine).every(cell => cell.neighborMines === countNeighborMines(cell.r, cell.c)));
        const cell = board.flat().find(cell => !cell.isRevealed);
        handleCellRightClick(cell.r, cell.c);
        handleCellClick(cell.r, cell.c);
        check(`${key}: flag protects cell`, cell.isFlagged && !cell.isRevealed && flagsCount === 1);
        handleCellRightClick(cell.r, cell.c);
        check(`${key}: unflag`, !cell.isFlagged && flagsCount === 0);
    }
    resetGame();
    const target = document.getElementById(soldiers[0].id);
    shoot(target, 2);
    shoot(document.getElementById('battlefield'), 2);
    check('right click does not shoot or start', shotsFired === 0 && soldiers[0].hp === 2 && gameState === 'READY');
    shoot(target, 0, 'touch');
    check('touch shoots once', shotsFired === 1 && shotsHit === 1 && soldiers[0].hp === 1);
    shoot(target);
    shoot(target);
    check('dead soldier cannot be killed twice', troopsKilled === 1 && shotsFired === 2 && soldiers.length === 0);
    shoot(document.getElementById('battlefield'));
    check('miss counted once', shotsFired === 3 && shotsHit === 2);
    resetGame();
    startGameTimer();
    while (soldiers.length < 15) spawnSoldier();
    check('15 troops trigger defeat', gameState === 'LOST' && !document.getElementById('airstrike-overlay').classList.contains('hidden'));
    resetGame();
    await new Promise(resolve => setTimeout(resolve, 2400));
    check('restart cancels old defeat', gameState === 'READY' && gameTime === 0 && document.getElementById('end-modal').classList.contains('hidden') && document.getElementById('airstrike-overlay').classList.contains('hidden') && !document.body.classList.contains('shake') && pendingEffects.size === 0);
    setDifficulty('easy');
    handleCellClick(0, 0);
    const mine = board.flat().find(cell => cell.isMine);
    handleCellClick(mine.r, mine.c);
    const before = revealedCount;
    handleCellClick(8, 8);
    startGameTimer();
    check('mine defeat locks game', gameState === 'LOST' && revealedCount === before && !document.getElementById('end-modal').classList.contains('hidden'));
    resetGame();
    handleCellClick(0, 0);
    for (const cell of board.flat()) {
        if (!cell.isMine) handleCellClick(cell.r, cell.c);
    }
    check('all safe cells win', gameState === 'WON' && revealedCount === 71);
    resetGame();
    if (typeof currentWave !== 'undefined') {
        startGameTimer();
        triggerWave1Reinforcements();
        spawnSoldier();
        check('wave 1 armor and speed', soldiers[1].hp === 3 && Math.abs(Math.hypot(soldiers[1].vx, soldiers[1].vy) - 7) < 0.001);
        triggerWave2Reinforcements();
        spawnSoldier();
        check('wave 2 is 50 percent faster', soldiers[2].hp === 4 && Math.abs(Math.hypot(soldiers[2].vx, soldiers[2].vy) - 10.5) < 0.001);
        resetGame();
    }
    return { page: location.pathname, count: passed.length, passed };
})();
