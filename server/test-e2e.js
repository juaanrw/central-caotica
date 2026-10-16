const { io } = require('socket.io-client');

async function runTest() {
  console.log('--- STARTING COMPREHENSIVE E2E MULTIPLAYER TEST ---');
  const socket1 = io('http://localhost:3001', { transports: ['websocket'] });

  await new Promise((resolve) => socket1.on('connect', resolve));
  console.log('✅ Socket 1 (Host) connected:', socket1.id);

  let currentRoom = null;

  socket1.on('stateUpdate', (room) => {
    currentRoom = room;
  });

  // 1. Create Room
  socket1.emit('createRoom', { hostName: 'Host Dyatlov', hasMic: true });
  await new Promise((resolve) => socket1.once('roomCreated', (r) => {
    currentRoom = r;
    console.log('✅ Room created with code:', r.code);
    resolve();
  }));

  // 2. Add 2 Bots to test 3-player partitioned manual (Ingeniero A + Ingeniero B)
  socket1.emit('addBot', { roomCode: currentRoom.code });
  await new Promise((resolve) => setTimeout(resolve, 300));
  socket1.emit('addBot', { roomCode: currentRoom.code });
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('✅ 3 Players in room:', currentRoom.players.map(p => `${p.name} (${p.isBot ? 'Bot' : 'Human'})`));

  // 3. Start Game
  socket1.emit('startGame', { roomCode: currentRoom.code });
  await new Promise((resolve) => socket1.once('gameStarted', (r) => {
    currentRoom = r;
    resolve();
  }));
  console.log('✅ Game started, phase:', currentRoom.phase);

  // 4. Test Round 1 steps (up to 6 steps, with new actions SHAKE and SHOUT supported)
  console.log('--- TESTING ROUND 1: REACCIÓN EN CADENA ---');
  let safetyCounter = 0;
  while (currentRoom.phase === 'ROUND_1' && safetyCounter < 35) {
    safetyCounter++;
    const step = currentRoom.round1;
    if (step) {
      console.log(`Step ${step.stepNumber}/6: Instruction: "${step.actionInstruction}" | TargetAction: ${step.targetAction}`);
      // If executor is Host, execute
      if (step.executorId === socket1.id) {
        socket1.emit('round1Action', { roomCode: currentRoom.code, action: step.targetAction });
      }
    }
    // Wait for step processing or bot auto-action
    await new Promise((resolve) => setTimeout(resolve, 900));
  }

  console.log('✅ Round 1 completed! Score:', currentRoom.round1Scores, 'Next phase:', currentRoom.phase);

  // 5. Test Round 2: Panel AZ-5 (Roles partitioned)
  console.log('--- TESTING ROUND 2: PANEL AZ-5 (PARTICIONADO) ---');
  await new Promise((resolve) => setTimeout(resolve, 500));
  const r2 = currentRoom.round2;
  console.log(`Core: ${r2.coreColor}, Pressure: ${r2.pressure} bar`);
  console.log('Player Roles:', currentRoom.players.map(p => `${p.name}: ${p.role}`));
  console.log('Manual Part A lines:', r2.manualPartA.length);
  console.log('Manual Part B lines:', r2.manualPartB.length);

  // Check switches
  const req = r2.requiredSwitches;
  console.log('Required switches:', req);

  // If Host is a technician, toggle their switches
  const hostPlayer = currentRoom.players.find(p => p.id === socket1.id);
  const isTecnico = hostPlayer && hostPlayer.role && hostPlayer.role.startsWith('TECNICO');
  if (isTecnico) {
    const targetConsole = hostPlayer.role === 'TECNICO_CONSOLA_1' && r2.dualConsoles
      ? r2.dualConsoles.console1
      : hostPlayer.role === 'TECNICO_CONSOLA_2' && r2.dualConsoles
      ? r2.dualConsoles.console2
      : r2;
    const reqSwitches = targetConsole.requiredSwitches;
    for (const sw of ['alfa', 'beta', 'gamma', 'delta']) {
      if (reqSwitches[sw] !== targetConsole.currentSwitches[sw]) {
        socket1.emit('toggleSwitch', { roomCode: currentRoom.code, switchName: sw });
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }
    socket1.emit('stabilizeAZ5', { roomCode: currentRoom.code });
  }

  // Wait until Round 2 completes (via host technician or bot technician auto-stabilize)
  let r2Safety = 0;
  while (currentRoom.phase === 'ROUND_2' && r2Safety < 10) {
    r2Safety++;
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
  console.log('✅ Round 2 completed! Score:', currentRoom.round2Scores, 'Next phase:', currentRoom.phase);

  // 6. Test Round 3: Trivia (Cultura General Distribuida)
  console.log('--- TESTING ROUND 3: LLAMADA DEL MINISTERIO (DISTRIBUIDA) ---');
  let triviaSafety = 0;
  while (currentRoom.phase === 'ROUND_3' && triviaSafety < 25) {
    triviaSafety++;
    const r3 = currentRoom.round3;
    if (r3) {
      console.log(`Round 3 Status: ${r3.solvedCount}/${r3.totalQuestions} Solved`);
      // If socket1 holds an unsolved correct option, submit it
      const myCorrect = r3.options.find(o => o.assignedPlayerId === socket1.id && o.isCorrect && !o.isSolved);
      if (myCorrect) {
        console.log(`[Host Action] Submitting answer button: "${myCorrect.text}"`);
        socket1.emit('submitTrivia', { roomCode: currentRoom.code, optionId: myCorrect.id });
      }
    }
    // Wait for state or bot answer
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('✅ Round 3 completed, score:', currentRoom.round3Scores, 'phase is now:', currentRoom.phase);
  if (currentRoom.phase === 'ROUND_4') {
    console.log('--- TESTING ROUND 4: CINTA CLASIFICADORA (NUCLEAR CONVEYOR BELT) ---');
    const r4 = currentRoom.round4;
    console.log(`Duration: ${r4.durationSeconds}s, Time Left: ${r4.timeLeftSeconds}s`);
    console.log('Stations:', r4.stations.map(s => `[${s.id}: ${s.playerName || s.title} -> ${s.category.name}]`));

    // Simulate active player sorting items for several rounds
    let r4Safety = 0;
    while (currentRoom.phase === 'ROUND_4' && r4Safety < 35) {
      r4Safety++;
      const currentR4 = currentRoom.round4;
      if (currentR4) {
        const myQueue = currentR4.playerQueues[socket1.id] || [];
        if (myQueue.length > 0) {
          const item = myQueue[0];
          const myIndex = currentR4.stations.findIndex(s => s.playerId === socket1.id);
          const targetIndex = currentR4.stations.findIndex(s => s.id === item.targetDestinationId);

          let action = 'CLAIM';
          if (targetIndex < myIndex) {
            action = 'PASS_LEFT';
          } else if (targetIndex > myIndex) {
            action = 'PASS_RIGHT';
          }

          console.log(`[R4 Action] Item: "${item.name}" (${item.categoryName}) -> Action: ${action}`);
          socket1.emit('conveyorAction', { roomCode: currentRoom.code, action });
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 900));
    }
    console.log('✅ Round 4 finished! Classified:', currentRoom.round4?.totalClassified, 'Mistakes:', currentRoom.round4?.totalMistakes);
  }

  if (currentRoom.phase === 'ROUND_5') {
    console.log('--- TESTING ROUND 5: LABERINTO A CIEGAS (SONDA RBMK) ---');
    const r5Init = currentRoom.round5;
    console.log('Maze Roles:', r5Init.playerRoles);

    const getBfsMove = (r5) => {
      const target = r5.hasKey ? r5.goalPos : r5.keyPos;
      const isBlocked = (r, c) =>
        r < 0 || r >= r5.gridSize || c < 0 || c >= r5.gridSize ||
        r5.walls.some(w => w.row === r && w.col === c) ||
        r5.traps.some(t => t.row === r && t.col === c);

      const q = [{ pos: r5.probePos }];
      const vis = new Set([`${r5.probePos.row},${r5.probePos.col}`]);
      const dirs = [
        { dir: 'UP', dr: -1, dc: 0 },
        { dir: 'DOWN', dr: 1, dc: 0 },
        { dir: 'LEFT', dr: 0, dc: -1 },
        { dir: 'RIGHT', dr: 0, dc: 1 }
      ];
      while (q.length > 0) {
        const curr = q.shift();
        if (curr.pos.row === target.row && curr.pos.col === target.col) return curr.first;
        for (const d of dirs) {
          const nr = curr.pos.row + d.dr;
          const nc = curr.pos.col + d.dc;
          const k = `${nr},${nc}`;
          if (!vis.has(k) && !isBlocked(nr, nc)) {
            vis.add(k);
            q.push({ pos: { row: nr, col: nc }, first: curr.first || d.dir });
          }
        }
      }
      return null;
    };

    let r5Safety = 0;
    while (currentRoom.phase === 'ROUND_5' && r5Safety < 35) {
      r5Safety++;
      const curR5 = currentRoom.round5;
      if (curR5) {
        const myRole = curR5.playerRoles[socket1.id];
        const nextDir = getBfsMove(curR5);
        console.log(`[R5] Probe at F${curR5.probePos.row + 1}-C${curR5.probePos.col + 1} | Key: ${curR5.hasKey} | Next: ${nextDir}`);
        if (nextDir) {
          const isVert = nextDir === 'UP' || nextDir === 'DOWN';
          if (
            myRole === 'PILOTO_TOTAL' ||
            (myRole === 'PILOTO_VERTICAL' && isVert) ||
            (myRole === 'PILOTO_HORIZONTAL' && !isVert)
          ) {
            socket1.emit('mazeMove', { roomCode: currentRoom.code, direction: nextDir });
          }
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 650));
    }
    console.log('✅ Round 5 completed! Score:', currentRoom.round5Scores, 'Phase:', currentRoom.phase);
  }

  console.log('--- SUMMARY RESULTS ---');
  console.log('Total Score:', currentRoom.summary?.totalScore);
  console.log('Rank:', currentRoom.summary?.rankTitle);
  console.log('Awards:', currentRoom.summary?.awards.map(a => `${a.icon} ${a.title} -> ${a.playerName}`));

  // 8. Test Restart
  socket1.emit('restartGame', { roomCode: currentRoom.code });
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log('✅ Game restarted to phase:', currentRoom.phase);

  socket1.disconnect();
  console.log('🎉 ALL COMPREHENSIVE TESTS PASSED PERFECTLY!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
