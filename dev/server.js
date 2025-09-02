// 백엔드 서버

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let gameRooms = {};
let waitingPlayer = null;

io.on('connection', (socket) => {
    console.log(`플레이어 연결됨: ${socket.id}`);

    if (waitingPlayer) {
        const room = `room_${socket.id}_${waitingPlayer.id}`;
        waitingPlayer.join(room);
        socket.join(room);
        gameRooms[room] = { players: [waitingPlayer.id, socket.id] };
        io.to(room).emit('gameStart', { room });
        console.log(`게임 시작: 방 ${room}`);
        waitingPlayer = null;
    } else {
        waitingPlayer = socket;
        socket.emit('waiting');
    }

    socket.on('boardState', ({ board, score, player, room }) => {
        const roomData = gameRooms[room];
        if (roomData) {
            const opponentId = roomData.players.find(id => id !== socket.id);
            if (opponentId) {
                // 상대방에게 board, score, player가 모두 포함된 객체를 전달
                socket.to(opponentId).emit('opponentState', { board, score, player });
            }
        }
    });

    socket.on('lineClear', ({ lines, room }) => {
        const roomData = gameRooms[room];
        if (roomData) {
            const opponentId = roomData.players.find(id => id !== socket.id);
            if (opponentId) {
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
                socket.to(opponentId).emit('opponentWin');
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`플레이어 연결 끊김: ${socket.id}`);
        if (waitingPlayer && waitingPlayer.id === socket.id) {
            waitingPlayer = null;
        }
    });
});

server.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});

