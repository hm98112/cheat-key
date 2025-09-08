import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // ⭐️ useNavigate 추가
import { useAuth } from '../context/AuthContext.jsx';
import apiClient from '../api/axiosConfig.js';

const TetrisStyles = () => (
    <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Roboto', sans-serif; background-color: #1a1a2e; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
        body.shake { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        .main-container { position: relative; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; }
        .content-box { background-color: rgba(26, 26, 46, 0.8); border: 1px solid rgba(255, 255, 255, 0.2); padding: 30px; border-radius: 15px; text-align: center; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); width: 95%; max-width: 900px; }
        .status-text { font-size: 1.5em; margin-bottom: 20px; color: #e0e0e0; height: 30px; }
        .game-container { display: flex; gap: 20px; justify-content: center; align-items: flex-start; }
        .player-area { position: relative; text-align: center; color: #ccc; }
        .side-area { display: flex; flex-direction: column; align-items: center; margin-top: 50px; width: 120px; }
        .side-area h3 { margin-top: 0; margin-bottom: 10px; color: #9BF6FF; font-weight: 400; }
        h2 { margin-top: 0; margin-bottom: 15px; font-weight: 400; }
        canvas { border: 2px solid #4f4f8e; background-color: #0f0f1e; border-radius: 8px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); }
        .info { background-color: #0f0f1e; border: 1px solid #4f4f8e; border-radius: 8px; padding: 8px 15px; margin-top: 15px; font-size: 1.1em; display: inline-block; }
        .opponent-overlay { position: absolute; top: 42px; left: 0; width: 100%; height: calc(100% - 42px); background-color: rgba(0, 0, 0, 0.7); color: white; display: flex; justify-content: center; align-items: center; font-size: 1.2em; border-radius: 8px; z-index: 10; }
        
        /* ⭐️ 게임 결과 모달 스타일 추가 */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.75); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background: #1e1e3f; padding: 30px 40px; border-radius: 12px; text-align: center; color: #fff; border: 1px solid #4f4f8e; box-shadow: 0 5px 25px rgba(0,0,0,0.5); }
        .modal-content h2 { font-size: 2em; margin-bottom: 15px; color: #9BF6FF; }
        .modal-content p { margin: 8px 0; font-size: 1.1em; }
        .modal-content .rating-info { margin: 20px 0; border-top: 1px solid #4f4f8e; border-bottom: 1px solid #4f4f8e; padding: 15px 0; }
        .rating-up { color: #57F287; font-weight: bold; }
        .rating-down { color: #ED4245; font-weight: bold; }
        .countdown-message { margin-top: 25px; font-size: 1em; color: #ccc; }
    `}</style>
);

// --- ⭐️ 게임 결과 모달 컴포넌트 ---
const GameResultModal = ({ isOpen, result, countdown }) => {
    if (!isOpen || !result) {
        return null;
    }
    const { ratingChange, newRating } = result;
    const isWin = ratingChange >= 0;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{isWin ? '🎉 승리! 🎉' : '😥 패배 😥'}</h2>
                <div className="rating-info">
                    <p>레이팅 변동: <span className={isWin ? 'rating-up' : 'rating-down'}>{isWin ? '+' : ''}{ratingChange}</span></p>
                    <h3>현재 레이팅: {newRating}</h3>
                </div>
                <p className="countdown-message">
                    {countdown}초 후에 로비로 이동합니다...
                </p>
            </div>
        </div>
    );
};


// --- 게임 상수 ---
const COLS = 10, ROWS = 20, BLOCK_SIZE = 24;
const COLORS = [null, '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#606060'];
const SHAPES = [[], [[1, 1, 1, 1]], [[2, 2], [2, 2]], [[0, 3, 3], [3, 3, 0]], [[4, 4, 0], [0, 4, 4]], [[5, 0, 0], [5, 5, 5]], [[0, 0, 6], [6, 6, 6]], [[0, 7, 0], [7, 7, 7]]];
const SRS_KICK_DATA = { JLSTZ: { '0-1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], '1-0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]], '1-2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]], '2-1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], '2-3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]], '3-2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]], '3-0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]], '0-3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]] }, I: { '0-1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]], '1-0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]], '1-2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]], '2-1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]], '2-3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]], '3-2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]], '3-0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]], '0-3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]] } };
const DAS_DELAY = 160, DAS_INTERVAL = 40;
const createEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));


const TetrisPage = () => {
    const { socket, user } = useAuth();
    const { gameId } = useParams();
    const navigate = useNavigate(); // ⭐️ 페이지 이동을 위한 hook

    // 🐛 DEBUG: user 객체가 렌더링마다 어떻게 변하는지 확인
    console.log('[렌더링] 현재 user 객체:', user);

    const [status, setStatus] = useState('게임을 준비 중입니다...');
    const [playerScore, setPlayerScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [isOpponentWaiting, setIsOpponentWaiting] = useState(true);

    // --- ⭐️ 결과 모달 관련 상태 추가 ---
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [gameResultData, setGameResultData] = useState(null);
    const [countdown, setCountdown] = useState(5);


    const playerCanvasRef = useRef(null);
    const opponentCanvasRef = useRef(null);
    const nextPieceCanvasRef = useRef(null);
    const holdCanvasRef = useRef(null);
    const contexts = useRef({});

    // --- 게임 관련 정보 저장을 위한 Ref ---
    const opponentInfoRef = useRef(null);
    const gameStartTimeRef = useRef(null);
    const resultSentRef = useRef(false); // 결과 중복 전송 방지 플래그

    const gameState = useRef({
        board: createEmptyBoard(),
        player: null,
        nextPiece: null,
        holdPieceType: null,
        ghostPiece: null,
        canHold: true,
        gameOver: false,
        room: null,
        pieceSequence: [],
        pieceIndex: 0,
        isRequestingPieces: false,
        dropCounter: 0,
        dropInterval: 1000,
        lastTime: 0,
        floatingTexts: [],
    });

    const keysDown = useRef({});
    const dasTimer = useRef(0);
    const gameLoopId = useRef(null);
    const stateIntervalId = useRef(null);

    // --- 그리기 관련 함수 ---
    const drawBlock = useCallback((x, y, value, ctx, isGhost = false) => {
        if (!ctx) return;
        ctx.fillStyle = COLORS[value];
        if (isGhost) ctx.globalAlpha = 0.3;
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        if (isGhost) ctx.globalAlpha = 1.0;
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }, []);

    const drawMatrix = useCallback((matrix, offset, ctx, isGhost = false) => {
        matrix.forEach((row, y) => row.forEach((value, x) => {
            if (value !== 0) drawBlock(x + offset.x, y + offset.y, value, ctx, isGhost);
        }));
    }, [drawBlock]);

    const drawBoard = useCallback((boardData, ctx) => {
        if (!ctx) return;
        ctx.fillStyle = '#0f0f1e';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        boardData.forEach((row, y) => row.forEach((value, x) => {
            if (value !== 0) drawBlock(x, y, value, ctx);
        }));
    }, [drawBlock]);

    const drawSideCanvas = useCallback((piece, ctx) => {
        if (!ctx) return;
        ctx.fillStyle = '#0f0f1e';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        if (piece) {
            const matrix = piece.matrix;
            const offsetX = (ctx.canvas.width / BLOCK_SIZE - matrix[0].length) / 2;
            const offsetY = (ctx.canvas.height / BLOCK_SIZE - matrix.length) / 2;
            drawMatrix(matrix, { x: offsetX, y: offsetY }, ctx);
        }
    }, [drawMatrix]);

    const drawFloatingTexts = useCallback((ctx) => {
        if (!ctx) return;
        const gs = gameState.current;
        ctx.font = 'bold 24px Roboto';
        ctx.textAlign = 'center';
        for (let i = gs.floatingTexts.length - 1; i >= 0; i--) {
            const ft = gs.floatingTexts[i];
            ctx.fillStyle = `rgba(255, 255, 255, ${ft.life})`;
            ctx.fillText(ft.text, ft.x, ft.y);
            ft.y -= 1;
            ft.life -= 0.02;
            if (ft.life <= 0) gs.floatingTexts.splice(i, 1);
        }
    }, []);

    const draw = useCallback(() => {
        const { playerCtx, nextPieceCtx, holdCtx } = contexts.current;
        if (!playerCtx) return;
        const { board, player, ghostPiece, nextPiece, holdPieceType } = gameState.current;

        drawBoard(board, playerCtx);
        if (ghostPiece) drawMatrix(ghostPiece.matrix, ghostPiece.pos, playerCtx, true);
        if (player) drawMatrix(player.matrix, player.pos, playerCtx);
        drawFloatingTexts(playerCtx);
        drawSideCanvas(nextPiece, nextPieceCtx);
        drawSideCanvas(holdPieceType ? { matrix: SHAPES[holdPieceType] } : null, holdCtx);
    }, [drawBoard, drawMatrix, drawSideCanvas, drawFloatingTexts]);

    // --- 게임 로직 함수 ---
    const isColliding = useCallback((board, piece) => {
        for (let y = 0; y < piece.matrix.length; y++) {
            for (let x = 0; x < piece.matrix[y].length; x++) {
                if (piece.matrix[y][x] !== 0) {
                    let newX = piece.pos.x + x;
                    let newY = piece.pos.y + y;
                    if (newX < 0 || newX >= COLS || newY >= ROWS || (board[newY] && board[newY][newX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }, []);

    const updateGhostPiece = useCallback(() => {
        const gs = gameState.current;
        if (!gs.player) return;
        gs.ghostPiece = JSON.parse(JSON.stringify(gs.player));
        while (!isColliding(gs.board, gs.ghostPiece)) {
            gs.ghostPiece.pos.y++;
        }
        gs.ghostPiece.pos.y--;
    }, [isColliding]);

    // --- ⭐️ 게임 결과 전송 함수 (수정) ---
    const sendGameResult = useCallback(async (winnerId) => {
        if (resultSentRef.current) {
            console.log('[결과 전송] 이미 결과가 전송되었거나 전송 중입니다.');
            return;
        }
        const opponent = opponentInfoRef.current;
        const startTime = gameStartTimeRef.current;
        const myUser = user;

        if (!winnerId || !myUser?.userId || !opponent?.id || !startTime) {
            console.error('게임 결과 전송에 필요한 정보가 부족합니다.');
            return;
        }
        resultSentRef.current = true;
        const loserId = (winnerId === myUser.userId) ? opponent.id : myUser.userId;

        const resultPayload = {
            gameTypeId: 1,
            winnerUserId: winnerId,
            loserUserId: loserId,
            participantUserIds: [myUser.userId, opponent.id],
            startedAt: startTime.toISOString(),
            endedAt: new Date().toISOString(),
            gameId: gameId,
        };
        console.log('--- [결과 전송 시도] ---', resultPayload);

        try {
            // ⭐️ API 엔드포인트를 `/games/result`로 수정
            const response = await apiClient.post('/games/result', resultPayload);
            console.log('--- [결과 전송 성공!] ---', response.data);

            // ⭐️ 서버로부터 받은 결과로 상태 업데이트
            setGameResultData(response.data); // { oldRating, newRating, ratingChange }
            setIsResultModalOpen(true); // 모달 열기
        } catch (error) {
            console.error('--- [결과 전송 실패!] ---', error.response ? error.response.data : error.message);
            resultSentRef.current = false;
        }
    }, [user, gameId]);


    // --- ⭐️ 카운트다운 및 리다이렉트 로직 추가 ---
    useEffect(() => {
        if (isResultModalOpen) {
            const timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isResultModalOpen]);

    useEffect(() => {
        if (countdown <= 0) {
            navigate('/lobby');
        }
    }, [countdown, navigate]);

    useEffect(() => {
        if (!socket || !gameId || !user || !user.userId) {
            setStatus('소켓, 게임 ID 또는 유저 정보를 기다리는 중...');
            return;
        }

        console.log(`[TetrisPage] 모든 준비 완료! 게임방 참여 요청 (Game ID: ${gameId}, User: ${user.username})`);
        socket.emit('joinGameRoom', { gameId });

        contexts.current = {
            playerCtx: playerCanvasRef.current.getContext('2d'),
            opponentCtx: opponentCanvasRef.current.getContext('2d'),
            nextPieceCtx: nextPieceCanvasRef.current.getContext('2d'),
            holdCtx: holdCanvasRef.current.getContext('2d'),
        };
        const gs = gameState.current;

        const addFloatingText = (text, x, y) => gs.floatingTexts.push({ text, x: x + 40, y, life: 1 });
        const triggerScreenShake = () => {
            document.body.classList.add('shake');
            setTimeout(() => document.body.classList.remove('shake'), 300);
        };
        const merge = (board, player) => {
            player.matrix.forEach((row, y) => row.forEach((value, x) => {
                if (value !== 0) board[y + player.pos.y][x + player.pos.x] = value;
            }));
        };

        const resetPlayer = async () => {
            if (gs.pieceSequence.length - gs.pieceIndex <= 10 && !gs.isRequestingPieces) {
                gs.isRequestingPieces = true;
                socket.emit('requestMorePieces', { room: gs.room });
            }
            while (gs.pieceIndex >= gs.pieceSequence.length) {
                if (gs.gameOver) return;
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            const typeId = gs.pieceSequence[gs.pieceIndex++];
            if (gs.pieceIndex > 0 && gs.pieceIndex % 15 === 0) gs.dropInterval = Math.max(100, gs.dropInterval - 75);
            const matrix = SHAPES[typeId];
            gs.player = { pos: { x: Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2), y: 0 }, matrix, typeId, rotationState: 0 };
            const nextTypeId = gs.pieceSequence[gs.pieceIndex];
            gs.nextPiece = nextTypeId ? { matrix: SHAPES[nextTypeId] } : null;

            if (isColliding(gs.board, gs.player)) {
                gs.gameOver = true;
                setStatus('게임 오버! 당신이 졌습니다.');
                socket.emit('gameOver', { room: gs.room });
                const opponent = opponentInfoRef.current;
                if (opponent) {
                    console.log('[게임 로직] 패배 감지. 결과 전송을 시작합니다.');
                    sendGameResult(opponent.id);
                } else {
                    console.error('[게임 로직] 패배했으나, 상대방 정보가 없어 결과를 전송할 수 없습니다.');
                }
            }
            gs.canHold = true;
            updateGhostPiece();
        };

        const clearLines = async () => {
            let clearedLines = 0;
            outer: for (let y = gs.board.length - 1; y >= 0; y--) {
                for (let x = 0; x < gs.board[y].length; x++) if (gs.board[y][x] === 0) continue outer;
                gs.board.splice(y, 1);
                gs.board.unshift(Array(COLS).fill(0));
                y++;
                clearedLines++;
            }
            if (clearedLines > 0) {
                const lineScore = [0, 100, 300, 500, 800][clearedLines];
                setPlayerScore(prev => prev + lineScore);
                addFloatingText(['', 'SINGLE', 'DOUBLE', 'TRIPLE', 'TETRIS!'][clearedLines], gs.player.pos.x * BLOCK_SIZE, gs.player.pos.y * BLOCK_SIZE);
                addFloatingText(`+${lineScore}`, gs.player.pos.x * BLOCK_SIZE, gs.player.pos.y * BLOCK_SIZE + 30);
                if (clearedLines >= 2) triggerScreenShake();
                socket.emit('lineClear', { lines: clearedLines, room: gs.room });
            }
        };

        const playerDrop = async () => {
            if (gs.gameOver || !gs.player) return;
            gs.player.pos.y++;
            if (isColliding(gs.board, gs.player)) {
                gs.player.pos.y--;
                merge(gs.board, gs.player);
                await clearLines();
                await resetPlayer();
            }
            gs.dropCounter = 0;
        };

        const playerMove = (dir) => {
            if (gs.gameOver || !gs.player) return;
            gs.player.pos.x += dir;
            if (isColliding(gs.board, gs.player)) {
                gs.player.pos.x -= dir;
            } else {
                updateGhostPiece();
            }
        };

        const gameLoop = (time = 0) => {
            if (gs.gameOver) return;
            const deltaTime = time - gs.lastTime;
            gs.lastTime = time;
            const moveDir = (keysDown.current.ArrowLeft ? -1 : 0) + (keysDown.current.ArrowRight ? 1 : 0);
            if (moveDir !== 0) {
                dasTimer.current += deltaTime;
                if (dasTimer.current > DAS_DELAY) playerMove(moveDir);
            }
            const currentDropInterval = keysDown.current.ArrowDown ? 50 : gs.dropInterval;
            gs.dropCounter += deltaTime;
            if (gs.dropCounter > currentDropInterval) playerDrop();
            draw();
            gameLoopId.current = requestAnimationFrame(gameLoop);
        };

        const playerHardDrop = async () => {
            if (gs.gameOver || !gs.player) return;
            gs.player.pos.y = gs.ghostPiece.pos.y;
            merge(gs.board, gs.player);
            await clearLines();
            await resetPlayer();
            gs.dropCounter = 0;
        };

      const playerRotate = (direction) => {
        if (gs.gameOver || !gs.player || gs.player.typeId === 2) return;
        const originalPos = gs.player.pos;
        const originalMatrix = gs.player.matrix;
        const originalRotationState = gs.player.rotationState;
        let rotatedMatrix = originalMatrix;
        const rotationCount = direction === 1 ? 1 : 3;
        for (let i = 0; i < rotationCount; i++) {
            rotatedMatrix = rotatedMatrix[0].map((_, colIndex) =>
                rotatedMatrix.map(row => row[colIndex]).reverse()
            );
        }
        const newRotationState = (originalRotationState + direction + 4) % 4;
        const kickTableType = (gs.player.typeId === 1) ? 'I' : 'JLSTZ';
        const transitionKey = `${originalRotationState}-${newRotationState}`;
        const kickTests = SRS_KICK_DATA[kickTableType][transitionKey] || [[0, 0]];
        for (const [kickX, kickY] of kickTests) {
            const testPos = { x: originalPos.x + kickX, y: originalPos.y - kickY };
            if (!isColliding(gs.board, { matrix: rotatedMatrix, pos: testPos })) {
                gs.player.matrix = rotatedMatrix;
                gs.player.pos = testPos;
                gs.player.rotationState = newRotationState;
                updateGhostPiece();
                return;
            }
        }
        };
        const playerHold = async () => {
            if (gs.gameOver || !gs.canHold) return;
            if (gs.holdPieceType === null) {
                gs.holdPieceType = gs.player.typeId;
                await resetPlayer();
            } else {
                [gs.holdPieceType, gs.player.typeId] = [gs.player.typeId, gs.holdPieceType];
                const matrix = SHAPES[gs.player.typeId];
                gs.player = { pos: { x: Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2), y: 0 }, matrix, typeId: gs.player.typeId, rotationState: 0 };
                if (isColliding(gs.board, gs.player)) {
                    gs.gameOver = true;
                    setStatus('게임 오버!');
                    socket.emit('gameOver', { room: gs.room });
                }
            }
            gs.canHold = false;
            updateGhostPiece();
        };

        const handleKeyDown = (e) => {
            if (!gs.player || gs.gameOver) return;
            if (!keysDown.current[e.key]) {
                if (e.key === 'ArrowLeft') playerMove(-1);
                else if (e.key === 'ArrowRight') playerMove(1);
                else if (e.key === 'ArrowUp') playerRotate(1);
                else if (e.key === 'c' || e.key === 'C') playerHold();
                else if (e.key === ' ') { e.preventDefault(); playerHardDrop(); }
            }
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'c', 'C'].includes(e.key)) e.preventDefault();
            keysDown.current[e.key] = true;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') dasTimer.current = 0;
        };
        const handleKeyUp = (e) => {
            keysDown.current[e.key] = false;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') dasTimer.current = 0;
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        const handleGameStart = (data) => {
            console.log('Game Start Data:', data);
            const opponent = data.players.find(p => p.id !== user.userId);
            if (opponent) {
                opponentInfoRef.current = opponent;
                console.log('상대방 정보:', opponent);
            } else {
                console.error("상대방 정보를 찾을 수 없습니다.");
            }

            gameStartTimeRef.current = new Date();
            console.log('게임 시작 시간:', gameStartTimeRef.current);
            gs.room = data.room;
            gs.pieceSequence = data.pieceSequence;
            gs.pieceIndex = 0;
            resultSentRef.current = false;

            setStatus('게임 시작!');
            setIsOpponentWaiting(false);
            resetPlayer();
            gameLoopId.current = requestAnimationFrame(gameLoop);
            if (stateIntervalId.current) clearInterval(stateIntervalId.current);
            stateIntervalId.current = setInterval(() => {
                if (!gs.gameOver) socket.emit('boardState', { board: gs.board, score: playerScore, player: gs.player, room: gs.room, senderId: socket.id });
            }, 50);
        };

        const handleOpponentState = (opponentState) => {
            if (socket.id !== opponentState.senderId) {
                drawBoard(opponentState.board, contexts.current.opponentCtx);
                if (opponentState.player) drawMatrix(opponentState.player.matrix, opponentState.player.pos, contexts.current.opponentCtx);
                setOpponentScore(opponentState.score);
            }
        };
        const handleAddMorePieces = (data) => {
            gs.pieceSequence.push(...data.newPieces);
            gs.isRequestingPieces = false;
        };
        const handleAddGarbage = (count) => {
            for (let i = 0; i < count; i++) {
                const row = Array(COLS).fill(8);
                row[Math.floor(Math.random() * COLS)] = 0;
                gs.board.shift();
                gs.board.push(row);
            }
            updateGhostPiece();
        };

        const handleOpponentWin = () => {
            gs.gameOver = true;
            setStatus('승리했습니다!');
            const opponent = opponentInfoRef.current;
            if (opponent) {
                console.log('[게임 로직] 승리 감지. 결과 전송을 시작합니다.');
                sendGameResult(user.userId);
            } else {
                console.error('[게임 로직] 승리했으나, 상대방 정보가 없어 결과를 전송할 수 없습니다.');
            }
        };

        socket.on('gameStart', handleGameStart);
        socket.on('opponentState', handleOpponentState);
        socket.on('addMorePieces', handleAddMorePieces);
        socket.on('addGarbage', handleAddGarbage);
        socket.on('opponentWin', handleOpponentWin);

        return () => {
            if (stateIntervalId.current) clearInterval(stateIntervalId.current);
            cancelAnimationFrame(gameLoopId.current);
            socket.off('gameStart', handleGameStart);
            socket.off('opponentState', handleOpponentState);
            socket.off('addMorePieces', handleAddMorePieces);
            socket.off('addGarbage', handleAddGarbage);
            socket.off('opponentWin', handleOpponentWin);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [socket, gameId, user, playerScore, draw, isColliding, updateGhostPiece, sendGameResult, navigate]);

    return (
        <>
            <TetrisStyles />
            <div className="main-container">
                <div className="content-box">
                    <h1 className="status-text">{status}</h1>
                    <div className="game-container">
                        <div className="side-area">
                            <h3>홀드 (C)</h3>
                            <canvas ref={holdCanvasRef} width="96" height="96"></canvas>
                        </div>
                        <div className="player-area">
                            <h2>나 ({user ? user.username : 'You'})</h2>
                            <canvas ref={playerCanvasRef} width={COLS * BLOCK_SIZE} height={ROWS * BLOCK_SIZE}></canvas>
                            <div className="info">점수: <span>{playerScore}</span></div>
                        </div>
                        <div className="side-area">
                            <h3>다음 블록</h3>
                            <canvas ref={nextPieceCanvasRef} width="96" height="96"></canvas>
                        </div>
                        <div className="player-area">
                            <h2>상대방 ({opponentInfoRef.current ? opponentInfoRef.current.username : 'Opponent'})</h2>
                            <canvas ref={opponentCanvasRef} width={COLS * BLOCK_SIZE} height={ROWS * BLOCK_SIZE}></canvas>
                            {isOpponentWaiting && <div className="opponent-overlay">상대방을 기다리는 중...</div>}
                            <div className="info">점수: <span>{opponentScore}</span></div>
                        </div>
                    </div>
                </div>
            </div>
            {/* ⭐️ 모달 렌더링 부분 추가 */}
            <GameResultModal 
                isOpen={isResultModalOpen} 
                result={gameResultData} 
                countdown={countdown} 
            />
        </>
    );
};

export default TetrisPage;