import {CELL, BOARD_SIZE} from './constants.js';

export class Board {
    constructor(canvasWidth, canvasHeight, cellSize) {
        this.cellSize = cellSize;
        // Calculamos el centro para dibujar la matriz
        this.offsetX = (canvasWidth - (BOARD_SIZE * cellSize)) / 2;
        this.offsetY = (canvasHeight - (BOARD_SIZE * cellSize)) / 2;
        
this.grid = [
            [CELL.NON_PLAYABLE, CELL.NON_PLAYABLE, CELL.TOKEN, CELL.TOKEN, CELL.TOKEN, CELL.NON_PLAYABLE, CELL.NON_PLAYABLE],
            [CELL.NON_PLAYABLE, CELL.NON_PLAYABLE, CELL.TOKEN, CELL.TOKEN, CELL.TOKEN, CELL.NON_PLAYABLE, CELL.NON_PLAYABLE],
            [CELL.TOKEN, CELL.TOKEN, CELL.TOKEN, CELL.TOKEN, CELL.TOKEN, CELL.TOKEN, CELL.TOKEN],
            [CELL.TOKEN, CELL.TOKEN, CELL.TOKEN, CELL.EMPTY, CELL.TOKEN, CELL.TOKEN, CELL.TOKEN],
            [CELL.TOKEN, CELL.TOKEN, CELL.TOKEN, CELL.TOKEN, CELL.TOKEN, CELL.TOKEN, CELL.TOKEN],
            [CELL.NON_PLAYABLE, CELL.NON_PLAYABLE, CELL.TOKEN, CELL.TOKEN, CELL.TOKEN, CELL.NON_PLAYABLE, CELL.NON_PLAYABLE],
            [CELL.NON_PLAYABLE, CELL.NON_PLAYABLE, CELL.TOKEN, CELL.TOKEN, CELL.TOKEN, CELL.NON_PLAYABLE, CELL.NON_PLAYABLE]
        ];
    }

    //convierte coordenadas x y del mouse a fila col de la matriz
    getGridPosition(x, y) {
        const col = Math.floor((x - this.offsetX) / this.cellSize);
        const row = Math.floor((y - this.offsetY) / this.cellSize);
        return { row, col };
    }

    //convierte fila col a coordenadas x y para dibujar
    getPixelPosition(row, col) {
        return {
            x: this.offsetX + (col * this.cellSize),
            y: this.offsetY + (row * this.cellSize)
        };
    }

    //dibuja el tablero vacio
    draw(ctx, bgImage) {
        if (bgImage) {
            ctx.drawImage(bgImage, this.offsetX, this.offsetY, this.cellSize * BOARD_SIZE, this.cellSize * BOARD_SIZE);
        }

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (this.grid[r][c] !== CELL.NON_PLAYABLE) {
                    const pos = this.getPixelPosition(r, c);

                    //sin imagen de fondo, la cruz se dibuja celda por celda
                    if (!bgImage) {
                        ctx.fillStyle = "#F1DCB1";
                        ctx.fillRect(pos.x, pos.y, this.cellSize, this.cellSize);
                    }

                    const radius = (this.cellSize / 2) - 4; // con un margen
                    const centerX = pos.x + (this.cellSize / 2);
                    const centerY = pos.y + (this.cellSize / 2);

                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    
                    //fondo
                    ctx.fillStyle = "rgba(0, 0, 0, 0.15)"; 
                    ctx.fill();
                    
                    //borde
                    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }
    }

}