/* Enemigo: murcielago que cruza la pantalla. Vuela mas rapido que el
escenario y se mueve un poco hacia arriba y abajo. Si lo tocas pierdes
una vida (igual que con una columna). */
import { Entity } from "./Entity.js";

/* 32x32-bat-sprite.png es una grilla de 4x4 cuadros de 32 px.
La fila 3 es el aleteo mirando a la izquierda (hacia donde vuela) */
const TAM_CUADRO = 32;
const FILA = 3;
const CUADROS = 4;
const FPS_ANIMACION = 10;
const ESCALA = 2;

const RADIO = 16;           // radio de colision (px), menor al dibujo para ser justo

/* velocidad EXTRA respecto del escenario (px/s). Se exporta porque el spawner
la necesita para calcular cuando tiene que salir cada murcielago */
export const VELOCIDAD_EXTRA_ENEMIGO = 60;

const AMPLITUD = 25;        // cuanto sube y baja (px)
const FRECUENCIA = 3;       // rad/s del vaiven

let imagen = null;

/* se carga una sola vez, la primera vez que se necesita */
function getImagen() {
    if (!imagen) {
        imagen = new Image();
        imagen.src = new URL("../../images/runner/32x32-bat-sprite.png", import.meta.url).href;
    }
    return imagen;
}

export class Enemigo extends Entity {

    constructor(x, y) {
        super(x, y, RADIO);
        /* y alrededor de la cual oscila */
        this.yBase = y;
        /* cada murcielago arranca en un punto distinto del vaiven y del aleteo */
        this.tiempo = Math.random() * Math.PI * 2;
        /* true si ya le quito una vida al monstruo (no lastima dos veces) */
        this.golpeado = false;
    }

    update(dt, velocidad) {
        super.update(dt, velocidad + VELOCIDAD_EXTRA_ENEMIGO);
        this.tiempo += dt;
        this.y = this.yBase + Math.sin(this.tiempo * FRECUENCIA) * AMPLITUD;
    }

    draw(ctx) {
        const img = getImagen();
        if (!img.complete || img.naturalWidth === 0) return;

        const cuadro = Math.floor(this.tiempo * FPS_ANIMACION) % CUADROS;
        const tam = TAM_CUADRO * ESCALA;

        ctx.drawImage(
            img,
            cuadro * TAM_CUADRO, FILA * TAM_CUADRO, TAM_CUADRO, TAM_CUADRO,
            this.x - tam / 2, this.y - tam / 2, tam, tam
        );
    }
}
