/* esta clase mueve las cuatro capas del fondo */
export class Parallax {

    constructor(gameWorld){
        this.gameWorld = gameWorld;

        /* se guardan las capas*/
        this.layers = [
            {element: document.querySelector(".layer-4"), speed: 0.15, offset: 0},
            {element: document.querySelector(".layer-3"), speed: 0.30, offset: 0},
            {element: document.querySelector(".layer-2"), speed: 0.60, offset: 0},
            {element: document.querySelector(".layer-1"), speed: 1.00, offset: 0},
        ]

        /* guarda el ancho del contenedor del juego en pixeles */
        this.tileWidth = gameWorld.clientHeight * 2;
    }

    update(dt, worldSpeed){
        this.layers.forEach(layer => {
            /* calcula cuanto debe desplazarse exactamente la capa en el frame*/
            const movement = worldSpeed * layer.speed * dt;

            /* suma movimiento al off */
            layer.offset = (layer.offset + movement) % this.tileWidth;
            /* desplazamiento hortizontal*/
            layer.element.style.backgroundPositionX = 
            `${-layer.offset}px`;
        });
    }

    resize(){
        this.tileWidth = gameWorld.clientHeight * 2;
        // Evita que el desplazamiento supere el nuevo ancho
        this.layers.forEach(layer => {
            layer.offset %= this.tileWidth;
        });
    }
}