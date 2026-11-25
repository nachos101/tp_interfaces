import { Item } from "./Item.js";

/* el sprite sheet tiene 6 cuadros en una sola fila (98 x 15 px) */
const CUADROS = 6;
const FPS_ANIMACION = 8;

/* escala entera (x3 -> ~48x45 px) para mantener el pixel art nitido */
const ESCALA = 3;
const RADIO = 20;           // radio de colision (px)

let imagen = null;

/* se carga una sola vez, la primera vez que se necesita */
function getImagen() {
    if (!imagen) {
        imagen = new Image();
        imagen.src = new URL("../../images/runner/hearts.png", import.meta.url).href;
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

export class Corazon extends Item {

    constructor(x, y) {
        super(x, y, RADIO);
        this.tiempo = 0;
    }

    update(dt, velocidad) {
        super.update(dt, velocidad);
        this.tiempo += dt;
    }

    draw(ctx) {
        const cuadro = Math.floor(this.tiempo * FPS_ANIMACION) % CUADROS;
        dibujarCuadro(ctx, cuadro, this.x, this.y);
    }

    static dibujarIcono(ctx, x, y) {
        dibujarCuadro(ctx, CUADRO_ICONO, x, y);
    }
}