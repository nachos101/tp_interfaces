/* Esta clase crea los obstaculos cada cierta distancia, los mueve,
descarta los que salieron de pantalla, los dibuja en el canvas y
dice si el monstruo choco con alguno. */
import { Obstaculo } from "./Obstaculo.js";
import { FLOOR_RATIO } from "./Monster.js";

/* --- ajustes de dificultad (todo en px y segundos) --- */
const HUECO_INICIAL = 240;      // tamaño del hueco al empezar
const HUECO_MIN = 150;          // el hueco nunca baja de esto
const ACHICAR_POR_SEG = 3;      // cuantos px se achica el hueco por segundo jugado
const VARIACION_HUECO = 20;     // +- de azar para que no sean todos iguales

/* separacion entre obstaculos (de borde izquierdo a borde izquierdo).
A 180 px/s son entre 1.5 y 2 segundos entre columnas */
const DISTANCIA_MIN = 280;
const DISTANCIA_MAX = 360;

/* cuanto puede cambiar la altura del hueco entre un obstaculo y el siguiente.
Sin este limite podria aparecer uno arriba de todo y el proximo abajo de todo,
y no daria el tiempo para llegar */
const MAX_CAMBIO_ALTURA = 180;

/* espacio minimo entre el hueco y el techo/piso para que se vea columna */
const MARGEN = 20;

const RUTA_IMAGENES = "../../images/runner/Column/";

export class ObstaculoSpawner {

    constructor(ancho, alto) {
        this.ancho = ancho;
        this.alto = alto;

        /* las imagenes se cargan una sola vez, no en cada obstaculo */
        this.imagenes = {
            arriba: cargarImagen("topColumn.png"),
            abajo: cargarImagen("bottomColumn.png"),
        };

        this.reset();
    }

    /* vuelve al estado inicial (para reiniciar la partida) */
    reset() {
        this.obstaculos = [];
        /* px que faltan recorrer hasta crear el siguiente. En 0 el primero
        aparece enseguida */
        this.distancia = 0;
        /* segundos jugados: hace que el hueco se achique con el tiempo */
        this.tiempo = 0;
        this.ultimoCentro = null;
    }

    get pisoY() {
        return this.alto - this.alto * FLOOR_RATIO;
    }

    resize(ancho, alto) {
        this.ancho = ancho;
        this.alto = alto;

        /* si la ventana se achico, evitamos que algun hueco quede fuera del escenario */
        for (const o of this.obstaculos) {
            const min = o.hueco / 2;
            const max = this.pisoY - o.hueco / 2;
            o.centro = Math.min(Math.max(o.centro, min), Math.max(min, max));
        }
    }

    crearObstaculo(adelanto) {
        const pisoY = this.pisoY;

        /* el hueco se achica con el tiempo. El max va DESPUES del azar para
        que nunca quede menor que HUECO_MIN. Tampoco puede ser mas grande
        que el escenario. */
        const hueco = Math.min(
            Math.max(
                HUECO_MIN,
                HUECO_INICIAL - this.tiempo * ACHICAR_POR_SEG + azar(-VARIACION_HUECO, VARIACION_HUECO)
            ),
            pisoY - MARGEN * 2
        );

        /* rango donde puede estar el centro para que el hueco entre
        entre el techo y el piso */
        let min = hueco / 2 + MARGEN;
        let max = pisoY - hueco / 2 - MARGEN;

        /* ademas, no se aleja mas de MAX_CAMBIO_ALTURA del anterior */
        if (this.ultimoCentro !== null) {
            min = Math.max(min, this.ultimoCentro - MAX_CAMBIO_ALTURA);
            max = Math.min(max, this.ultimoCentro + MAX_CAMBIO_ALTURA);
        }

        const centro = azar(min, max);
        this.ultimoCentro = centro;

        /* nace justo afuera del borde derecho. 'adelanto' son los px que ya
        deberia haber avanzado si el frame se pasó de largo */
        this.obstaculos.push(new Obstaculo(this.ancho + adelanto, centro, hueco));
    }

    update(dt, velocidad) {
        this.tiempo += dt;

        /* cuenta regresiva en PIXELES recorridos (velocidad * dt) */
        this.distancia -= velocidad * dt;

        /* si se paso, el nuevo obstaculo nace un poco mas adentro, asi la
        separacion es siempre la sorteada, sin importar los fps */
        while (this.distancia <= 0) {
            this.crearObstaculo(this.distancia);
            this.distancia += azar(DISTANCIA_MIN, DISTANCIA_MAX);
        }

        for (const o of this.obstaculos) {
            o.update(dt, velocidad);
        }

        /* los que ya salieron por la izquierda se descartan */
        this.obstaculos = this.obstaculos.filter(o => !o.estaFuera());
    }

    /* true si el hitbox ({x, y, w, h}) toca algun obstaculo */
    colisiona(hitbox) {
        return this.obstaculos.some(o => o.colisiona(hitbox));
    }

    draw(ctx) {
        /* pixel art: sin suavizado. Se setea en cada frame porque cambiar
        el tamaño del canvas reinicia la configuracion del contexto */
        ctx.imageSmoothingEnabled = false;

        for (const o of this.obstaculos) {
            o.draw(ctx, this.imagenes, this.pisoY);
        }
    }
}

/* numero al azar entre a y b. Si el rango es invalido (pantalla muy
chica) devuelve el punto medio */
function azar(a, b) {
    if (b < a) return (a + b) / 2;
    return a + Math.random() * (b - a);
}

function cargarImagen(nombre) {
    const img = new Image();
    /* import.meta.url hace que la ruta sea relativa a este archivo
    y no a la pagina HTML que lo cargue */
    img.src = new URL(RUTA_IMAGENES + nombre, import.meta.url).href;
    return img;
}
