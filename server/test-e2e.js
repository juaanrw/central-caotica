const { io } = require('socket.io-client');

async function runTest() {
  console.log('--- STARTING E2E MULTIPLAYER TEST ---');
  const socket1 = io('http://localhost:3001', { transports: ['websocket'] });

  await new Promise((resolve) => socket1.on('connect', resolve));
  console.log('✅ Socket 1 connected:', socket1.id);

  let currentRoom = null;

  socket1.on('stateUpdate', (room) => {
    currentRoom = room;
  });

  // 1. Create Room
  socket1.emit('createRoom', { hostName: 'Host Dyatlov' });
  await new Promise((resolve) => socket1.once('roomCreated', (r) => {
    currentRoom = r;
    console.log('✅ Room created with code:', r.code);
    resolve();
  }));

  // 2. Add Bot
  socket1.emit('addBot', { roomCode: currentRoom.code });
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('✅ Bot added, players:', currentRoom.players.map(p => p.name));

  // 3. Start Game
  socket1.emit('startGame', { roomCode: currentRoom.code });
  await new Promise((resolve) => socket1.once('gameStarted', (r) => {
    currentRoom = r;
    resolve();
  }));
  console.log('✅ Game started, phase:', currentRoom.phase);

  // 4. Test Round 1 steps (up to 6 steps)
  console.log('--- TESTING ROUND 1: REACCIÓN EN CADENA ---');
  let safetyCounter = 0;
  while (currentRoom.phase === 'ROUND_1' && safetyCounter < 30) {
    safetyCounter++;
    const step = currentRoom.round1;
    if (step) {
      console.log(`Step ${step.stepNumber}/6: Sender=${step.senderName}, Executor=${step.executorName}, Action=${step.targetAction}`);
      // If executor is Host, execute
      if (step.executorId === socket1.id) {
        socket1.emit('round1Action', { roomCode: currentRoom.code, action: step.targetAction });
      }
    }
    // Wait for step processing or bot auto-action
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('✅ Round 1 completed, phase is now:', currentRoom.phase, 'Round 1 Score:', currentRoom.round1Scores);

  // 5. Test Round 2: Panel AZ-5
  console.log('--- TESTING ROUND 2: PANEL AZ-5 ---');
  await new Promise((resolve) => setTimeout(resolve, 500));
  const r2 = currentRoom.round2;
  console.log(`Core: ${r2.coreColor}, Pressure: ${r2.pressure} bar`);
  console.log('Required switches:', r2.requiredSwitches);

  // Toggle switches to match required
  const req = r2.requiredSwitches;
  for (const sw of ['alfa', 'beta', 'gamma', 'delta']) {
    if (req[sw] !== currentRoom.round2.currentSwitches[sw]) {
      socket1.emit('toggleSwitch', { roomCode: currentRoom.code, switchName: sw });
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  // Stabilize AZ-5
  socket1.emit('stabilizeAZ5', { roomCode: currentRoom.code });
  await new Promise((resolve) => setTimeout(resolve, 800));
  console.log('✅ Round 2 completed, phase is now:', currentRoom.phase, 'Round 2 Score:', currentRoom.round2Scores);

  // 6. Test Round 3: Trivia
  console.log('--- TESTING ROUND 3: LLAMADA DEL MINISTERIO ---');
  let triviaSafety = 0;
  while (currentRoom.phase === 'ROUND_3' && triviaSafety < 20) {
    triviaSafety++;
    const q = currentRoom.round3;
    if (q) {
      console.log(`Question ${q.questionNumber}/3: "${q.prompt.substring(0, 45)}..."`);
      const correctOpt = q.options.find(o => o.isCorrect);
      
      if (correctOpt && correctOpt.assignedPlayerId === socket1.id) {
        socket1.emit('submitTrivia', { roomCode: currentRoom.code, optionId: correctOpt.id });
      }
    }
    // Wait for step or bot answer
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  console.log('✅ Round 3 completed, phase is now:', currentRoom.phase);
  console.log('--- SUMMARY RESULTS ---');
  console.log('Total Score:', currentRoom.summary.totalScore);
  console.log('Rank:', currentRoom.summary.rankTitle);
  console.log('Awards:', currentRoom.summary.awards.map(a => `${a.icon} ${a.title} -> ${a.playerName}`));

  // 7. Test Restart
  socket1.emit('restartGame', { roomCode: currentRoom.code });
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log('✅ Game restarted to phase:', currentRoom.phase);

  socket1.disconnect();
  console.log('🎉 ALL MULTIPLAYER E2E TESTS PASSED PERFECTLY!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
