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
        check(`${key}: board dimensions`, document.querySelectorAll('#minefield-grid button').length === currentDiff.rows * currentDiff.cols);
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
    if (typeof triggerWave === 'function') {
        startGameTimer();
        triggerWave(1);
        spawnSoldier();
        const s1 = soldiers[soldiers.length - 1];
        check('wave 1 armor and speed', s1.hp === 3 && Math.abs(Math.hypot(s1.vx, s1.vy) - 8) < 0.001);
        triggerWave(2);
        spawnSoldier();
        const s2 = soldiers[soldiers.length - 1];
        check('wave 2 is 50 percent faster', s2.hp === 4 && Math.abs(Math.hypot(s2.vx, s2.vy) - 12) < 0.001);
        resetGame();
        setDifficulty('easy');
        handleCellClick(0, 0);
        const wrong = board.flat().find(cell => !cell.isMine && !cell.isRevealed);
        handleCellRightClick(wrong.r, wrong.c);
        intelCount = 1;
        isIntelMode = true;
        useIntelligence(wrong.r, wrong.c);
        const area = board.flat().filter(cell => Math.abs(cell.r - wrong.r) <= 1 && Math.abs(cell.c - wrong.c) <= 1);
        check('intel clears wrong flag and reveals safe cells', wrong.isRevealed && !wrong.isFlagged && area.every(cell => cell.isMine ? cell.isFlagged : cell.isRevealed) && intelCount === 0 && !isIntelMode);
        check('mine counter matches flags', document.getElementById('mines-counter').textContent === formatCounter(10 - flagsCount));
        resetGame();
        handleCellClick(0, 0);
        const spare = board.flat().filter(cell => !cell.isRevealed).slice(0, 12);
        spare.forEach(cell => handleCellRightClick(cell.r, cell.c));
        check('negative mine counter readable', document.getElementById('mines-counter').textContent === '-02');
        resetGame();
        spawnSpy();
        const spy = spies[0];
        shoot(document.getElementById(spy.id), 2);
        check('right click does not scare spy', spies.length === 1);
        shoot(document.getElementById(spy.id));
        check('clicking spy removes it without shot count', spies.length === 0 && shotsFired === 0);
        isFlagMode = false;
        resetGame();
        const cellBtn = document.getElementById('cell-4-4');
        cellBtn.dispatchEvent(new Event('touchstart'));
        await new Promise(resolve => setTimeout(resolve, 400));
        cellBtn.dispatchEvent(new Event('touchend'));
        cellBtn.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
        cellBtn.click();
        check('long press flags once despite contextmenu and click', board[4][4].isFlagged && flagsCount === 1);
        resetGame();
    }
    return { page: location.pathname, count: passed.length, passed };
})();
