const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path'); // (추가) 파일 경로를 다루기 위한 'path' 모듈

const app = express();

// (추가) 루트 경로('/')로 접속하면 현재 폴더의 index.html 파일을 보내주는 기능
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;

// 게임 로직 관련 변수
const rooms = {}; // 각 방의 정보를 저장할 객체
let waitingPlayerSocket = null; // 대기 중인 플레이어의 소켓

function createPieceSequence(count) {
    const sequence = [];
    const bag = [1, 2, 3, 4, 5, 6, 7];
    for (let i = 0; i < Math.ceil(count / 7); i++) {
        const shuffledBag = [...bag].sort(() => Math.random() - 0.5);
        sequence.push(...shuffledBag);
    }
    return sequence.slice(0, count);
}

io.on('connection', (socket) => {
    console.log(`사용자 연결됨: ${socket.id}`);

    if (waitingPlayerSocket) {
        const room = `room_${socket.id}_#_${waitingPlayerSocket.id}`;
        
        // 방 정보를 서버에 저장
        rooms[room] = {
            players: [waitingPlayerSocket, socket]
        };

        waitingPlayerSocket.join(room);
        socket.join(room);

        const initialPieces = createPieceSequence(100);

        io.to(room).emit('gameStart', {
            room: room,
            pieceSequence: initialPieces
        });
        console.log(`게임 시작. 룸: ${room}`);

        waitingPlayerSocket = null;

    } else {
        waitingPlayerSocket = socket;
        socket.emit('waiting');
        console.log(`플레이어 대기 중: ${socket.id}`);
    }

    socket.on('boardState', (data) => {
        socket.to(data.room).emit('opponentState', data);
    });

    socket.on('lineClear', (data) => {
        const garbageLines = data.lines - 1;
        if (garbageLines > 0) {
            socket.to(data.room).emit('addGarbage', garbageLines);
        }
    });

    socket.on('gameOver', (data) => {
        socket.to(data.room).emit('opponentWin');
    });

    // ## 여기가 핵심적인 수정 부분입니다! ##
    socket.on('requestMorePieces', (data) => {
        const roomInfo = rooms[data.room];
        if (!roomInfo) return; // 방 정보가 없으면 무시

        console.log(`'${data.room}' 방에서 추가 블록 요청됨.`);
        const newPieces = createPieceSequence(50);
        
        // io.to(room) 대신 각 플레이어의 소켓에 직접 emit
        roomInfo.players.forEach(playerSocket => {
            if (playerSocket) {
                playerSocket.emit('addMorePieces', { newPieces });
            }
        });
    });

    socket.on('disconnect', () => {
        console.log(`사용자 연결 끊김: ${socket.id}`);
        if (waitingPlayerSocket === socket) {
            waitingPlayerSocket = null;
            console.log('대기 중인 플레이어 나감.');
        }
        // (추가) 룸에서 나가는 로직 추가 가능
    });
});

server.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});