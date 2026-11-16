import {CELL, BOARD_SIZE} from './constants.js';

const BOARD_COLOR = "#F1DCB1";   // color de respaldo si la imagen del tablero no cargó
const BOARD_CORNER_RADIUS = 20;  // redondeo de las esquinas de la cruz (px)

// Contorno de la cruz en unidades de celda (col, fila), en sentido horario.
// Corresponde al tablero inglés de 7x7 definido en this.grid.
const BOARD_OUTLINE = [
    [2, 0], [5, 0], [5, 2], [7, 2], [7, 5], [5, 5],
    [5, 7], [2, 7], [2, 5], [0, 5], [0, 2], [2, 2]
];

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

    //traza el contorno de la cruz con las esquinas redondeadas (las de afuera y las de adentro)
    traceShape(ctx, cornerRadius) {
        const points = BOARD_OUTLINE.map(([col, row]) => ({
            x: this.offsetX + col * this.cellSize,
            y: this.offsetY + row * this.cellSize
        }));

        ctx.beginPath();
        //arrancamos a mitad del primer lado para que todas las esquinas pasen por arcTo
        ctx.moveTo((points[0].x + points[1].x) / 2, (points[0].y + points[1].y) / 2);

        for (let i = 1; i <= points.length; i++) {
            const corner = points[i % points.length];
            const next = points[(i + 1) % points.length];
            ctx.arcTo(corner.x, corner.y, next.x, next.y, cornerRadius);
        }
        ctx.closePath();
    }

    //dibuja el tablero vacio
    draw(ctx, bgImage) {
        //fondo: la imagen recortada con la forma de la cruz
        ctx.save();
        this.traceShape(ctx, BOARD_CORNER_RADIUS);

        if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
            ctx.clip();
            ctx.drawImage(bgImage, this.offsetX, this.offsetY, this.cellSize * BOARD_SIZE, this.cellSize * BOARD_SIZE);
        } else {
            //si la imagen todavía no cargó (o falló), se pinta el mismo color
            ctx.fillStyle = BOARD_COLOR;
            ctx.fill();
        }
        ctx.restore();

        //hoyos de cada casilla jugable
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (this.grid[r][c] !== CELL.NON_PLAYABLE) {
                    const pos = this.getPixelPosition(r, c);

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