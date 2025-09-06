import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import apiClient from '../api/axiosConfig';

// CSS를 컴포넌트 내에 직접 포함합니다.
const TetrisStyles = () => (
    <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Roboto', sans-serif; }
        body.shake { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .main-container { position: relative; width: 100vw; height: 100vh; background-color: #1a1a2e; display: flex; flex-direction: column; justify-content: center; align-items: center; overflow: hidden; }
        .content-box { position: relative; background-color: rgba(26, 26, 46, 0.8); border: 1px solid rgba(255, 255, 255, 0.2); padding: 30px; border-radius: 15px; text-align: center; color: white; z-index: 10; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); width: 95%; max-width: 900px; overflow: hidden; }
        .content-box::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: conic-gradient(transparent, rgba(168, 85, 247, 0.8), rgba(79, 70, 229, 0.8), transparent 30%); animation: rotate 6s linear infinite; }
        @keyframes rotate { 100% { transform: rotate(360deg); } }
        .inner-content { position: relative; background-color: #1a1a2e; padding: 20px; border-radius: 10px; z-index: 1; }
        .status-text { font-size: 1.5em; margin-bottom: 20px; color: #e0e0e0; height: 30px; text-shadow: 0 0 5px #fff; }
        .game-container { display: flex; gap: 20px; justify-content: center; align-items: flex-start; }
        .player-area, .side-area { text-align: center; color: #ccc; }
        .side-area { display: flex; flex-direction: column; align-items: center; margin-top: 50px; width: 120px; }
        .side-box { width: 100%; margin-bottom: 20px; }
        .side-box h3 { margin-top: 0; margin-bottom: 10px; color: #9BF6FF; font-weight: 400; }
        h2 { margin-top: 0; margin-bottom: 15px; font-weight: 400; }
        canvas { border: 2px solid #4f4f8e; background-color: #0f0f1e; border-radius: 8px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); }
        .info { background-color: #0f0f1e; border: 1px solid #4f4f8e; border-radius: 8px; padding: 8px 15px; margin-top: 15px; font-size: 1.1em; display: inline-block; }
        .loading-container { color: white; font-size: 1.5em; }
    `}</style>
);

// --- 게임 상수들 ---
const COLS = 10, ROWS = 20, BLOCK_SIZE = 24;
const COLORS = [null, '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#606060'];
const SHAPES = [[], [[1,1,1,1]], [[2,2],[2,2]], [[0,3,3],[3,3,0]], [[4,4,0],[0,4,4]], [[5,0,0],[5,5,5]], [[0,0,6],[6,6,6]], [[0,7,0],[7,7,7]]];
const T_PIECE_ID = 7;
const DAS_DELAY = 160;
const DAS_INTERVAL = 40;

const createEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const TetrisPage = () => {
    // --- 페이지 라우팅 및 권한 확인용 상태 ---
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- UI 상태 관리 (화면 갱신용) ---
    const [status, setStatus] = useState('게임 권한 확인 중...');
    const [playerScore, setPlayerScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);

    // --- DOM 요소 및 Canvas Context 참조 ---
    const playerCanvasRef = useRef(null);
    const opponentCanvasRef = useRef(null);
    const nextPieceCanvasRef = useRef(null);
    const holdCanvasRef = useRef(null);
    const contexts = useRef({});

    // --- 게임 상태 및 로직 참조 (리렌더링 방지용) ---
    const gameState = useRef({
        board: createEmptyBoard(),
        player: null,
        nextPiece: null,
        holdPieceType: null,
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
        lastMoveWasRotation: false,
    });
    const keysDown = useRef({});
    const dasTimer = useRef(0);
    const gameLoopId = useRef();
    const socketRef = useRef(null);

    // --- 1. 컴포넌트 마운트 시, 게임 참여 권한 확인 ---
    useEffect(() => {
        const verifyAccess = async () => {
            try {
                await apiClient.get(`/games/${gameId}/verify`);
                setIsLoading(false);
                setStatus('서버에 연결 중...');
            } catch (err) {
                console.error("접근 권한 없음:", err.response?.data?.message);
                setError("이 게임에 참여할 권한이 없습니다.");
                setIsLoading(false);
                setTimeout(() => navigate('/lobby'), 3000);
            }
        };
        verifyAccess();
    }, [gameId, navigate]);

    // 그리기 관련 함수들
    const drawBlock = useCallback((x, y, value, ctx, isGhost = false) => {
        if (!ctx) return;
        ctx.fillStyle = COLORS[value];
        if (isGhost) ctx.globalAlpha = 0.3;
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        if (isGhost) ctx.globalAlpha = 1.0;
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
            drawMatrix(matrix, {x: offsetX, y: offsetY}, ctx);
        }
    }, [drawMatrix]);

    const drawFloatingTexts = useCallback((ctx) => {
        if (!ctx) return;
        ctx.font = 'bold 24px Roboto';
        ctx.textAlign = 'center';
        for (let i = gameState.current.floatingTexts.length - 1; i >= 0; i--) {
            const ft = gameState.current.floatingTexts[i];
            ctx.fillStyle = `rgba(255, 255, 255, ${ft.alpha})`;
            ctx.fillText(ft.text, ft.x, ft.y);
            ft.y -= 1;
            ft.life -= 0.02;
            ft.alpha = ft.life;
            if (ft.life <= 0) gameState.current.floatingTexts.splice(i, 1);
        }
    }, []);

    const isColliding = (board, player) => {
        for (let y = 0; y < player.matrix.length; y++) {
            for (let x = 0; x < player.matrix[y].length; x++) {
                if (player.matrix[y][x] !== 0 && 
                    (board[y + player.pos.y] && board[y + player.pos.y][x + player.pos.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    };

    const draw = useCallback(() => {
        const { playerCtx } = contexts.current;
        const { board, player, floatingTexts, nextPiece, holdPieceType } = gameState.current;
        
        drawBoard(board, playerCtx);
        
        if (player) {
            const ghostPiece = { ...player, pos: { ...player.pos } };
            while (!isColliding(board, ghostPiece)) ghostPiece.pos.y++;
            ghostPiece.pos.y--;
            drawMatrix(ghostPiece.matrix, ghostPiece.pos, playerCtx, true);
            drawMatrix(player.matrix, player.pos, playerCtx);
        }

        if (floatingTexts.length > 0) drawFloatingTexts(playerCtx);
        
        drawSideCanvas(nextPiece, contexts.current.nextPieceCtx);
        drawSideCanvas(holdPieceType ? { matrix: SHAPES[holdPieceType] } : null, contexts.current.holdCtx);
    }, [drawBoard, drawFloatingTexts, drawMatrix, drawSideCanvas]);

    const resetPlayer = useCallback(() => {
        // ... (rest of the function is the same, no changes needed)
        const gs = gameState.current;
        if (gs.pieceSequence.length - gs.pieceIndex <= 10 && !gs.isRequestingPieces) {
            gs.isRequestingPieces = true;
            socketRef.current.emit('requestMorePieces', { room: gs.room });
        }

        const typeId = gs.pieceSequence[gs.pieceIndex++];
        if (!typeId) {
            console.error("No more pieces. Waiting for server...");
            setTimeout(resetPlayer, 500);
            return;
        }

        if (gs.pieceIndex > 0 && gs.pieceIndex % 10 === 0) {
            gs.dropInterval = Math.max(100, gs.dropInterval - 75);
        }

        const matrix = SHAPES[typeId];
        gs.player = { 
            pos: { x: Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2), y: 0 },
            matrix: matrix, 
            typeId: typeId 
        };
        
        const nextTypeId = gs.pieceSequence[gs.pieceIndex];
        gs.nextPiece = nextTypeId ? { matrix: SHAPES[nextTypeId] } : null;

        if (isColliding(gs.board, gs.player)) {
            gs.gameOver = true;
            socketRef.current.emit('gameOver', { room: gs.room });
            setStatus('게임 오버! 당신이 졌습니다.');
        }

        gs.canHold = true;
        gs.lastMoveWasRotation = false;
    }, []);

    const playerDrop = useCallback(() => {
        // ... (rest of the function is the same, no changes needed)
        const gs = gameState.current;
        if (gs.gameOver || !gs.player) return;
        
        gs.player.pos.y++;
        if (isColliding(gs.board, gs.player)) {
            gs.player.pos.y--;
            merge(gs.board, gs.player);
            clearLines();
            resetPlayer();
        } else {
            gs.lastMoveWasRotation = false;
        }
        gs.dropCounter = 0;
    }, [resetPlayer]);

    const gameLoop = useCallback((time = 0) => {
        // ... (rest of the function is the same, no changes needed)
        const gs = gameState.current;
        if (gs.gameOver) return;

        const deltaTime = time - gs.lastTime;
        gs.lastTime = time;

        handleDAS(deltaTime);

        const currentDropInterval = keysDown.current.ArrowDown ? 50 : gs.dropInterval;
        gs.dropCounter += deltaTime;
        if (gs.dropCounter > currentDropInterval) {
            playerDrop();
        }

        draw();
        gameLoopId.current = requestAnimationFrame(gameLoop);
    }, [draw, playerDrop]);

    // --- 2. 권한 확인이 끝나면, 게임 및 소켓 초기화 ---
    useEffect(() => {
        if (isLoading || error) {
            return; // 로딩 중이거나 에러가 있으면 아무것도 하지 않음
        }

        contexts.current = {
            playerCtx: playerCanvasRef.current.getContext('2d'),
            opponentCtx: opponentCanvasRef.current.getContext('2d'),
            nextPieceCtx: nextPieceCanvasRef.current.getContext('2d'),
            holdCtx: holdCanvasRef.current.getContext('2d'),
        };

        // 소켓 연결 시 인증 토큰과 gameId를 함께 보냅니다.
        const token = localStorage.getItem('accessToken');
        socketRef.current = io('http://localhost:8080', {
            query: { gameId },
            auth: { token }
        });
        const socket = socketRef.current;

        socket.on('connect', () => setStatus('연결 성공! 다른 플레이어를 기다리는 중...'));
        
        socket.on('gameStart', (data) => {
            gameState.current.room = data.room;
            gameState.current.pieceSequence = data.pieceSequence;
            gameState.current.pieceIndex = 0;
            gameState.current.board = createEmptyBoard();
            setPlayerScore(0);
            setOpponentScore(0);
            gameState.current.gameOver = false;
            
            setStatus('게임 시작!');
            resetPlayer();
            
            cancelAnimationFrame(gameLoopId.current);
            gameLoopId.current = requestAnimationFrame(gameLoop);
        });
        
        socket.on('addMorePieces', (data) => {
            gameState.current.pieceSequence.push(...data.newPieces);
            gameState.current.isRequestingPieces = false;
        });

        socket.on('opponentState', (opponentState) => {
            const { opponentCtx } = contexts.current;
            drawBoard(opponentState.board, opponentCtx);
            if (opponentState.player) drawMatrix(opponentState.player.matrix, opponentState.player.pos, opponentCtx);
            setOpponentScore(opponentState.score);
        });
        
        socket.on('addGarbage', count => addGarbageLines(count));
        
        socket.on('opponentWin', () => {
            gameState.current.gameOver = true;
            setStatus('승리했습니다!');
        });
        
        const handleKeyDown = (e) => {
            // ... (function body is the same)
            if (gameState.current.gameOver || !gameState.current.player) return;
            
            if (!keysDown.current[e.key]) {
                switch(e.key) {
                    case 'ArrowUp': playerRotate(); break;
                    case ' ': e.preventDefault(); playerHardDrop(); break;
                    case 'c': case 'C': playerHold(); break;
                    default: break;
                }
            }
             if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'c', 'C'].includes(e.key)) e.preventDefault();
            keysDown.current[e.key] = true;
        };

        const handleKeyUp = e => {
            // ... (function body is the same)
            keysDown.current[e.key] = false;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') dasTimer.current = 0;
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // 클린업 함수
        return () => {
            if (socket) socket.disconnect();
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(gameLoopId.current);
        };
    }, [isLoading, error, gameId, gameLoop, resetPlayer, drawBoard, drawMatrix]);

    // --- 나머지 게임 로직 함수들 ---
    // (이 함수들은 컴포넌트 내부 어디에 있어도 괜찮습니다. 변경사항 없음)
    function merge(board, player) {
        player.matrix.forEach((row, y) => row.forEach((value, x) => {
            if (value !== 0) board[y + player.pos.y][x + player.pos.x] = value;
        }));
    }
    function addFloatingText(text, x, y) {
        gameState.current.floatingTexts.push({ text, x, y, life: 1, alpha: 1 });
    }
    function triggerScreenShake() {
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 300);
    }
    function clearLines() {
        const gs = gameState.current;
        let clearedLines = 0;
        let isTSpin = false;
        if (gs.lastMoveWasRotation && gs.player.typeId === T_PIECE_ID) {
            const {x, y} = gs.player.pos;
            const corners = [[y, x], [y, x+2], [y+2, x], [y+2, x+2]];
            let filledCorners = 0;
            corners.forEach(([cy, cx]) => {
                if (cy >= ROWS || cx < 0 || cx >= COLS || (gs.board[cy] && gs.board[cy][cx] !== 0)) {
                    filledCorners++;
                }
            });
            if (filledCorners >= 3) isTSpin = true;
        }
        outer: for (let y = gs.board.length - 1; y >= 0; y--) {
            for (let x = 0; x < gs.board[y].length; x++) if (gs.board[y][x] === 0) continue outer;
            gs.board.splice(y, 1);
            gs.board.unshift(Array(COLS).fill(0));
            y++;
            clearedLines++;
        }
        if (clearedLines > 0) {
            let lineScore = 0;
            let eventText = "";
            if (isTSpin) {
                lineScore = [0, 800, 1200, 1600][clearedLines];
                eventText = `T-SPIN ${['', 'SINGLE', 'DOUBLE', 'TRIPLE'][clearedLines]}!`;
            } else {
                lineScore = [0, 100, 300, 500, 800][clearedLines];
                eventText = ['', 'SINGLE', 'DOUBLE', 'TRIPLE', 'TETRIS!'][clearedLines];
            }
            setPlayerScore(prev => prev + lineScore);
            addFloatingText(eventText, gs.player.pos.x * BLOCK_SIZE, gs.player.pos.y * BLOCK_SIZE);
            addFloatingText(`+${lineScore}`, gs.player.pos.x * BLOCK_SIZE, gs.player.pos.y * BLOCK_SIZE + 30);
            if (clearedLines >= 2 || isTSpin) triggerScreenShake();
            if (clearedLines > 1) {
                socketRef.current.emit('lineClear', { lines: clearedLines, room: gs.room });
            }
        }
    }
    function addGarbageLines(count) {
        const gs = gameState.current;
        for (let i = 0; i < count; i++) {
            const row = Array(COLS).fill(8);
            row[Math.floor(Math.random() * COLS)] = 0;
            gs.board.shift();
            gs.board.push(row);
        }
    }
    function playerMove(dir) {
        const gs = gameState.current;
        if (gs.gameOver || !gs.player) return;
        gs.player.pos.x += dir;
        if (isColliding(gs.board, gs.player)) {
            gs.player.pos.x -= dir;
        } else {
            gs.lastMoveWasRotation = false;
        }
    }
    function handleDAS(deltaTime) {
        const moveDir = (keysDown.current.ArrowLeft ? -1 : 0) + (keysDown.current.ArrowRight ? 1 : 0);
        if (moveDir !== 0) {
            if (dasTimer.current === 0) playerMove(moveDir);
            dasTimer.current += deltaTime;
            if (dasTimer.current > DAS_DELAY) {
                const steps = Math.floor((dasTimer.current - DAS_DELAY) / DAS_INTERVAL);
                for (let i = 0; i < steps; i++) playerMove(moveDir);
                dasTimer.current = DAS_DELAY + (dasTimer.current - DAS_DELAY) % DAS_INTERVAL;
            }
        } else {
            dasTimer.current = 0;
        }
    }
    function playerHardDrop() {
        const gs = gameState.current;
        if (gs.gameOver || !gs.player) return;
        while (!isColliding(gs.board, gs.player)) {
            gs.player.pos.y++;
        }
        gs.player.pos.y--;
        merge(gs.board, gs.player);
        clearLines();
        resetPlayer();
        gs.dropCounter = 0;
    }
    function playerRotate() {
        const gs = gameState.current;
        if (gs.gameOver || !gs.player) return;
        const originalMatrix = gs.player.matrix;
        const rotated = originalMatrix[0].map((_, colIndex) => originalMatrix.map(row => row[colIndex]).reverse());
        gs.player.matrix = rotated;
        let offset = 1;
        while(isColliding(gs.board, gs.player)) {
            gs.player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (Math.abs(offset) > gs.player.matrix[0].length) {
                gs.player.pos.x -= (offset > 0 ? offset -1 : offset + 1);
                gs.player.matrix = originalMatrix;
                return;
            }
        }
        gs.lastMoveWasRotation = true;
    }
    function playerHold() {
        const gs = gameState.current;
        if (gs.gameOver || !gs.canHold) return;
        if (gs.holdPieceType === null) {
            gs.holdPieceType = gs.player.typeId;
            resetPlayer();
        } else {
            [gs.holdPieceType, gs.player.typeId] = [gs.player.typeId, gs.holdPieceType];
            const matrix = SHAPES[gs.player.typeId];
            gs.player.matrix = matrix;
            gs.player.pos = { x: Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2), y: 0 };
            if (isColliding(gs.board, gs.player)) {
                gs.gameOver = true;
                socketRef.current.emit('gameOver', { room: gs.room });
                setStatus('게임 오버! 당신이 졌습니다.');
            }
        }
        gs.canHold = false;
    }

    // --- 3. 조건부 렌더링 ---
    if (isLoading) {
        return (
            <div className="main-container">
                <div className="loading-container">게임 정보를 확인하는 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-container">
                <div className="loading-container">{error} (3초 후 로비로 이동합니다.)</div>
            </div>
        );
    }

    return (
        <>
            <TetrisStyles />
            <div className="main-container">
                <div className="content-box">
                    <div className="inner-content">
                        <h1 className="status-text">{status}</h1>
                        <div className="game-container">
                            <div className="side-area">
                                <div className="side-box">
                                    <h3>홀드 (C)</h3>
                                    <canvas ref={holdCanvasRef} width="96" height="96"></canvas>
                                </div>
                            </div>
                            <div className="player-area">
                                <h2>나 (You)</h2>
                                <canvas ref={playerCanvasRef} width={COLS * BLOCK_SIZE} height={ROWS * BLOCK_SIZE}></canvas>
                                <div className="info">점수: <span>{playerScore}</span></div>
                            </div>
                            <div className="side-area">
                                <div className="side-box">
                                    <h3>다음 블록</h3>
                                    <canvas ref={nextPieceCanvasRef} width="96" height="96"></canvas>
                                </div>
                            </div>
                            <div className="player-area">
                                <h2>상대방 (Opponent)</h2>
                                <canvas ref={opponentCanvasRef} width={COLS * BLOCK_SIZE} height={ROWS * BLOCK_SIZE}></canvas>
                                <div className="info">점수: <span>{opponentScore}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TetrisPage;

