// --- 백엔드 (지후, 하민 담당) ---
// 이 파일은 게임 매칭, 실시간 통신, 게임 로직 판정을 담당합니다.

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const path = require('path');
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// 게임 방 관리를 위한 객체
let gameRooms = {};
// 매칭을 기다리는 플레이어
let waitingPlayer = null;

io.on('connection', (socket) => {
    console.log(`플레이어 연결됨: ${socket.id}`);

    // --- 매칭 로직 ---
    if (waitingPlayer) {
        // 이미 기다리는 사람이 있으면, 방을 만들고 게임 시작
        const room = `room_${socket.id}_${waitingPlayer.id}`;
        
        // 두 플레이어를 같은 방에 join 시킴
        waitingPlayer.join(room);
        socket.join(room);

        gameRooms[room] = { players: [waitingPlayer.id, socket.id] };

        // 두 플레이어 모두에게 게임 시작 신호 전송
        io.to(room).emit('gameStart', { room });
        
        console.log(`게임 시작: 방 ${room}`);
        waitingPlayer = null; // 대기열 비우기
    } else {
        // 기다리는 사람이 없으면, 대기열에 추가
        waitingPlayer = socket;
        socket.emit('waiting');
    }

    // --- 게임 진행 이벤트 핸들러 ---

    // ✨ 수정된 부분: 이제 클라이언트는 보드와 점수를 함께 보냅니다.
    socket.on('boardState', ({ board, score, room }) => {
        const roomData = gameRooms[room];
        if (roomData) {
            const opponentId = roomData.players.find(id => id !== socket.id);
            if (opponentId) {
                // 상대방에게 'board'와 'score'가 모두 포함된 객체를 전달합니다.
                socket.to(opponentId).emit('opponentState', { board, score });
            }
        }
    });

    socket.on('lineClear', ({ lines, room }) => {
        const roomData = gameRooms[room];
        if (roomData) {
            const opponentId = roomData.players.find(id => id !== socket.id);
            if (opponentId) {
                // 2줄 이상 없애면 공격 (lines - 1)
                const garbageCount = lines > 1 ? lines - 1 : 0;
                if (garbageCount > 0) {
                    socket.to(opponentId).emit('addGarbage', garbageCount);
                }
            }
        }
    });

    socket.on('gameOver', ({ room }) => {
        const roomData = gameRooms[room];
        if (roomData) {
            const opponentId = roomData.players.find(id => id !== socket.id);
            if (opponentId) {
                // 진 사람의 상대방(이긴 사람)에게 승리 신호 전송
                socket.to(opponentId).emit('opponentWin');
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`플레이어 연결 끊김: ${socket.id}`);
        // 대기중인 플레이어가 나갔을 경우
        if (waitingPlayer && waitingPlayer.id === socket.id) {
            waitingPlayer = null;
        }
        // TODO: 게임 중 나간 경우 처리 로직 추가 (Phase 3)
    });
});

// 서버 실행
server.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});

