/* El HUD (heads-up display) lleva el puntaje y lo dibuja arriba de todo
en el canvas. Tambien dibuja la pantalla de Game Over. */

import { Moneda } from "./Moneda.js";

/* vidas con las que se empieza cada partida */
export const VIDAS_INICIALES = 3;

/* hearts.png es un corazon girando: 6 cuadros de 16 x 15 px en una fila.
El cuadro 0 es el corazon de frente */
const ANCHO_CUADRO_CORAZON = 16;
const ALTO_CORAZON = 15;
const ESCALA_CORAZON = 2.5;
const ESPACIO_CORAZONES = 8;

let imagenCorazon = null;

/* se carga una sola vez, la primera vez que se necesita */
function getImagenCorazon() {
    if (!imagenCorazon) {
        imagenCorazon = new Image();
        imagenCorazon.src = new URL("../../images/runner/hearts.png", import.meta.url).href;
    }
    return imagenCorazon;
}

const CLAVE_RECORD = "flyingMonster.mejorPuntaje";

const COLOR_TEXTO = "#4F2D1C";
const COLOR_BORDE = "#FFFFFF";

export class HUD {

    constructor() {
        this.puntaje = 0;
        this.monedas = 0;
        this.vidas = VIDAS_INICIALES;
        this.mejor = leerRecord();
        /* true si en esta partida se supero el record anterior */
        this.nuevoRecord = false;
    }

    /* empieza una partida nueva (el record se conserva) */
    reset() {
        this.puntaje = 0;
        this.monedas = 0;
        this.vidas = VIDAS_INICIALES;
        this.nuevoRecord = false;
    }

    sumar(cantidad) {
        this.puntaje += cantidad;
    }

    sumarMonedas(cantidad) {
        this.monedas += cantidad;
    }

    perderVida() {
        this.vidas = Math.max(0, this.vidas - 1);
    }

    get sinVidas() {
        return this.vidas === 0;
    }

    /* se llama una vez al perder: guarda el record si corresponde */
    terminarPartida() {
        if (this.puntaje > this.mejor) {
            this.mejor = this.puntaje;
            this.nuevoRecord = true;
            guardarRecord(this.mejor);
        }
    }

    /* vidas y monedas arriba a la izquierda, puntaje grande arriba al
    centro y record chico arriba a la derecha */
    draw(ctx, ancho) {
        /* pixel art: sin suavizado */
        ctx.imageSmoothingEnabled = false;

        this.dibujarVidas(ctx, 20, 12);

        Moneda.dibujarIcono(ctx, 40, 80);
        dibujarTexto(ctx, `x ${this.monedas}`, 72, 80, 28, "left");

        dibujarTexto(ctx, String(this.puntaje), ancho / 2, 50, 56, "center");
        dibujarTexto(ctx, `Mejor: ${this.mejor}`, ancho - 20, 28, 22, "right");
    }

    /* un corazon por cada vida inicial: los que se perdieron quedan
    apagados (transparentes) para que se vea cuantas se gastaron */
    dibujarVidas(ctx, x, y) {
        const img = getImagenCorazon();
        if (!img.complete || img.naturalWidth === 0) return;

        const ancho = ANCHO_CUADRO_CORAZON * ESCALA_CORAZON;
        const alto = ALTO_CORAZON * ESCALA_CORAZON;

        ctx.save();
        for (let i = 0; i < VIDAS_INICIALES; i++) {
            ctx.globalAlpha = i < this.vidas ? 1 : 0.25;
            ctx.drawImage(
                img,
                0, 0, ANCHO_CUADRO_CORAZON, ALTO_CORAZON,
                x + i * (ancho + ESPACIO_CORAZONES), y, ancho, alto
            );
        }
        ctx.restore();
    }

    drawGameOver(ctx, ancho, alto) {
        const cx = ancho / 2;
        const cy = alto / 2;

        dibujarTexto(ctx, "Game Over", cx, cy - 70, 64, "center");
        dibujarTexto(ctx, `Puntaje: ${this.puntaje}`, cx, cy - 15, 32, "center");
        dibujarTexto(ctx, `Monedas: ${this.monedas}`, cx, cy + 22, 26, "center");

        const linea = this.nuevoRecord
            ? "¡Nuevo récord!"
            : `Mejor: ${this.mejor}`;
        dibujarTexto(ctx, linea, cx, cy + 56, 26, "center");

        dibujarTexto(ctx, "Espacio o click para reiniciar", cx, cy + 98, 22, "center");
    }
}

/* texto con borde blanco para que se lea sobre cualquier fondo */
function dibujarTexto(ctx, texto, x, y, tamano, alineacion) {
    ctx.textAlign = alineacion;
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.font = `bold ${tamano}px sans-serif`;
    ctx.lineWidth = Math.max(4, tamano / 8);
    ctx.strokeStyle = COLOR_BORDE;
    ctx.fillStyle = COLOR_TEXTO;
    ctx.strokeText(texto, x, y);
    ctx.fillText(texto, x, y);
}

/* localStorage puede fallar (modo privado, sin permisos): en ese caso
el juego sigue andando, solo que sin record guardado */
function leerRecord() {
    try {
        return Number(localStorage.getItem(CLAVE_RECORD)) || 0;
    } catch {
        return 0;
    }
}

function guardarRecord(valor) {
    try {
        localStorage.setItem(CLAVE_RECORD, String(valor));
    } catch {
        /* sin almacenamiento: no pasa nada */
    }
}
