/* Moneda: item que gira (animacion del sprite sheet) y suma al recogerla. */
import { Item } from "./Item.js";

/* el sprite sheet tiene 9 cuadros en una sola fila (382 x 42 px) */
const CUADROS = 9;
const CUADRO_FRONTAL = 4;   // el cuadro donde se ve la moneda de frente
const FPS_ANIMACION = 12;

/* el dibujo original es chico: se agranda para que se lea bien */
const ESCALA = 1.5;
const RADIO = 18;           // radio de colision (px)

let imagen = null;

/* se carga una sola vez, la primera vez que se necesita */
function getImagen() {
    if (!imagen) {
        imagen = new Image();
        /* import.meta.url: ruta relativa a este archivo, no a la pagina */
        imagen.src = new URL("../../images/runner/coinsheet.png", import.meta.url).href;
    }
    return imagen;
}

/* dibuja un cuadro del sprite centrado en (x, y) */
function dibujarCuadro(ctx, cuadro, x, y) {
    const img = getImagen();
    if (!img.complete || img.naturalWidth === 0) return;

    const anchoCuadro = img.naturalWidth / CUADROS;
    const sx = Math.round(cuadro * anchoCuadro);
    const sw = Math.round(anchoCuadro);
    const sh = img.naturalHeight;

    ctx.drawImage(
        img,
        sx, 0, sw, sh,
        x - (sw * ESCALA) / 2, y - (sh * ESCALA) / 2,
        sw * ESCALA, sh * ESCALA
    );
}

export class Moneda extends Item {

    constructor(x, y) {
        super(x, y, RADIO);
        /* cada moneda arranca en un punto distinto de la animacion
        para que no giren todas sincronizadas */
        this.tiempo = Math.random() * CUADROS / FPS_ANIMACION;
    }

    update(dt, velocidad) {
        super.update(dt, velocidad);
        this.tiempo += dt;
    }

    draw(ctx) {
        const cuadro = Math.floor(this.tiempo * FPS_ANIMACION) % CUADROS;
        dibujarCuadro(ctx, cuadro, this.x, this.y);
    }

    /* icono estatico, lo usa el HUD */
    static dibujarIcono(ctx, x, y) {
        dibujarCuadro(ctx, CUADRO_FRONTAL, x, y);
    }
}
