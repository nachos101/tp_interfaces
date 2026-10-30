import {CELL, BOARD_SIZE} from './constants.js';
import {Board} from './Board.js';
import {Piece} from './Piece.js';

export class Game {
    constructor(canvasWidth, canvasHeight, cellSize) {
        this.board = new Board(canvasWidth, canvasHeight, cellSize);
        this.pieces = [];
        this.draggedPiece = null;
        this.validMovesForDrag = []; // Guarda las celdas destino válidas para los hints
        this.isGameOver = false;
        this.endMessage = "";
    }

    // inicializa las fichas leyendo el tablero.
    init(characters) {
        this.pieces = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (this.board.grid[r][c] === CELL.TOKEN) {
                    const pos = this.board.getPixelPosition(r, c);
                    // Requisito 9: Diferentes tipos de fichas, intercaladas según la fila
                    let character = characters[r % characters.length];

                    let piece = new Piece(pos.x, pos.y, this.board.cellSize, character);
                    piece.row = r;
                    piece.col = c;
                    this.pieces.push(piece);
                }
            }
        }
    }

    // Lógica del Drag & Drop
    onMouseDown(x, y) {
        if (this.isGameOver) return;

        // Buscar si clickeó una ficha (de la última a la primera para respetar el z-index visual)
        for (let i = this.pieces.length - 1; i >= 0; i--) {
            let p = this.pieces[i];
            if (x >= p.x && x <= p.x + p.size && y >= p.y && y <= p.y + p.size) {
                this.draggedPiece = p;
                p.selected = true;
                // Guardamos posición original por si el movimiento es inválido
                p.startX = p.x; 
                p.startY = p.y;
                // Calculamos los saltos válidos para mostrar los hints animados
                this.validMovesForDrag = this.calculateValidMoves(p);
                break;
            }
        }
    }

    onMouseMove(x, y) {
        if (this.draggedPiece) {
            // Requisito 3 y 6: El usuario arrastra la ficha
            // Centramos la ficha en el cursor
            this.draggedPiece.x = x - (this.draggedPiece.size / 2);
            this.draggedPiece.y = y - (this.draggedPiece.size / 2);
        }
    }

    onMouseUp(x, y) {
        if (!this.draggedPiece) return;

        const dropPos = this.board.getGridPosition(x, y);
        
        // Verificar si dropPos está dentro de validMovesForDrag (si se acabó el tiempo arrastrando, ya no vale)
        const isValid = !this.isGameOver && this.validMovesForDrag.find(m => m.row === dropPos.row && m.col === dropPos.col);

        if (isValid) {
            // Movimiento válido: Actualizar grilla
            this.board.grid[this.draggedPiece.row][this.draggedPiece.col] = CELL.EMPTY; //se vacia el origen
            this.board.grid[isValid.middleRow][isValid.middleCol] = CELL.EMPTY; //pieza comida
            this.board.grid[dropPos.row][dropPos.col] = CELL.TOKEN; //destino ahora con ficha

            // Eliminar la ficha comida del array de pieces
            this.pieces = this.pieces.filter(p => !(p.row === isValid.middleRow && p.col === isValid.middleCol));

            // Actualizar la ficha movida
            this.draggedPiece.row = dropPos.row;
            this.draggedPiece.col = dropPos.col;
            const newPos = this.board.getPixelPosition(dropPos.row, dropPos.col);
            this.draggedPiece.x = newPos.x;
            this.draggedPiece.y = newPos.y;

            // Requisito 5: Chequear fin del juego
            this.checkGameOver();
        } else {
            // Movimiento inválido: Vuelve a su lugar
            this.draggedPiece.x = this.draggedPiece.startX;
            this.draggedPiece.y = this.draggedPiece.startY;
        }

        // Soltar ficha y limpiar hints
        this.draggedPiece.selected = false;
        this.draggedPiece = null;
        this.validMovesForDrag = [];
    }

    // Calcula adónde puede saltar una ficha específica
    calculateValidMoves(piece) {
        const moves = [];
        const directions = [
            { r: -2, c: 0 }, { r: 2, c: 0 }, { r: 0, c: -2 }, { r: 0, c: 2 } // Arriba, Abajo, Izq, Der
        ];

        directions.forEach(dir => {
            const destRow = piece.row + dir.r;
            const destCol = piece.col + dir.c;
            const midRow = piece.row + (dir.r / 2);
            const midCol = piece.col + (dir.c / 2);

            // Si el destino está dentro de la grilla, está vacío (2), y hay una ficha (1) en el medio
            if (destRow >= 0 && destRow < BOARD_SIZE && destCol >= 0 && destCol < BOARD_SIZE) {
                if (this.board.grid[destRow][destCol] === CELL.EMPTY && this.board.grid[midRow][midCol] === CELL.TOKEN) {
                    moves.push({ row: destRow, col: destCol, middleRow: midRow, middleCol: midCol });
                }
            }
        });
        return moves;
    }

    checkGameOver() {
        let hasMoves = false;
        for (let p of this.pieces) {
            if (this.calculateValidMoves(p).length > 0) {
                hasMoves = true;
                break;
            }
        }
        if (!hasMoves) {
            this.isGameOver = true;
            // Se gana solo si la última ficha queda en el centro del tablero
            const center = Math.floor(BOARD_SIZE / 2);
            const won = this.pieces.length === 1 && this.pieces[0].row === center && this.pieces[0].col === center;
            this.endMessage = won ? "¡Ganaste!" : "Sin movimientos";
        }
    }

    draw(ctx, bgImage) {
        this.board.draw(ctx, bgImage);

        // Dibujar las piezas inactivas
        this.pieces.forEach(p => {
            if (p !== this.draggedPiece) p.draw(ctx);
        });

        // Requisito 3: Hints Animados
        if (this.draggedPiece && this.validMovesForDrag.length > 0) {
            // Usamos Date.now() y Math.sin para generar un efecto de "latido" (pulsing)
            const pulse = Math.abs(Math.sin(Date.now() / 200)); 
            
            this.validMovesForDrag.forEach(move => {
                const pos = this.board.getPixelPosition(move.row, move.col);
                ctx.save();
                ctx.globalAlpha = 0.4 + (pulse * 0.6); // Oscila entre 0.4 y 1.0
                ctx.fillStyle = "#FF0000"; // Color del hint
                ctx.beginPath();
                ctx.arc(pos.x + this.board.cellSize/2, pos.y + this.board.cellSize/2, 15 + (pulse * 5), 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }

        // Dibujar la ficha arrastrada al final para que quede por encima de todo (z-index)
        if (this.draggedPiece) {
            this.draggedPiece.draw(ctx);
        }
    }
}