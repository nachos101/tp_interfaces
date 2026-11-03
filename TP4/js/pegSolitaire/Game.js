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
        //variables de las ayudas
        this.showHint = false;
        this.hintPiece = null;
        this.hintMove = null;
        this.hintTimeout = null;
        this.animationFrame = null;
    }

    // inicializa las fichas leyendo el tablero.
    init(selectedCharacter) {
        this.pieces = [];

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (this.board.grid[r][c] === CELL.TOKEN) {
                    const pos = this.board.getPixelPosition(r, c);

                    let piece = new Piece(
                        pos.x,
                        pos.y,
                        this.board.cellSize,
                        selectedCharacter
                    );

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
            // El usuario arrastra la ficha
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

            // Si el destino está dentro de la grilla, está vacío, y hay una ficha en el medio
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

    showHints() {
        /* Este metodo busca una ficha que pueda moverse y elige uno de sus movimientos posibles */
        //limpiar una pista anterior    
        this.clearHint();

        //buscar fichas con movimientos vlaidos
        for (const piece of this.pieces){
            const moves = this.calculateValidMoves(piece);

            if (moves.length > 0){
            /*  showHint indica si hay pista visible
                hintPiece guarda la ficha a resaltar
                hintMove guarda el movimiento sugerido*/
                this.hintPiece = piece;
                this.hintMove = moves[0];
                this.showHint = true;
                break;
            }
        }
        //redibujar para mostrar la pista
        this.startHintAnimation();

        //ocultar la pista luego de 3 segundos
        this.hintTimeout = setTimeout(() =>{
            this.clearHint();
            this.draw();
        }, 3000);
    }

    clearHint() {
        this.showHint = false;
        this.hintPiece = null;
        this.hintMove = null;

        clearTimeout(this.hintTimeout);

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    startHintAnimation() {
        const animate = () => {
            if (!this.showHint) return;

            this.draw(this.ctx);

            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    }

    draw(ctx, bgImage) {
        this.board.draw(ctx, bgImage);

        //Dibujar fichas que no estan activas
        this.pieces.forEach(p => {
            if (p !== this.draggedPiece){
                const wasSelected = p.selected;

                //resaltar la ficha sugerida por la pista
                if (this.showHint && p === this.hintPiece){
                    p.selected = true;
                }
            }

            p.draw(ctx);

            //restaurar el estado origiinal
            p.selected = was.selected;
        });

        //dibujar el destino sugerido por la pista
        if (this.showHint && this.hintMove){
            this.drawHint(ctx);
        }

        //dibujar la ficha arrastrada por encima de todo
        if (this.draggedPiece) {
            this.draggedPiece.draw(ctx);
        }
    }

    drawHint(ctx){
        const move = this.hintMove;

        const pos = this.board.getPixelPosition(
            move.row,
            move.col
        );

        const centerX = pos.x + this.board.cellSize / 2;
        const centerY = pos.y + this.board.cellSize / 2;

        //resaltar el casillero destino
        ctx.save();

        ctx.beginPath();
        ctx.arc(
            centerX,
            centerY,
            this.board.cellSize * 0.35,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle = "#FF4F91";
        ctx.lineWidth = 4;
        ctx.stroke();

        // circulo rojo animado
        const pulse = Math.abs(Math.sin(Date.now() / 200));

        ctx.globalAlpha = 0.4 + pulse * 0.6;
        ctx.fillStyle = "#FF0000";

        ctx.beginPath();
        ctx.arc(
            centerX,
            centerY,
            12 + pulse * 7,
            0,
            Math.PI * 2
        );

        ctx.fill();
        ctx.restore();
    }
    
}