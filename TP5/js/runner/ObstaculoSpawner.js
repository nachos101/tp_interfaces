/* Esta clase crea los obstaculos cada cierta distancia, los mueve,
descarta los que salieron de pantalla, los dibuja en el canvas y
dice si el monstruo choco con alguno. */
import { Obstaculo } from "./Obstaculo.js";
import { Moneda } from "./Moneda.js";
import { Enemigo, VELOCIDAD_EXTRA_ENEMIGO } from "./Enemigo.js";
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

/* --- monedas ---
Aparecen en el tramo libre entre dos obstaculos, en grupos de 1 a 3 */
const PROB_MONEDAS = 0.75;          // chance de que haya monedas en cada tramo
const MAX_GRUPO = 3;
const SEPARACION_MONEDAS = 50;      // px entre monedas del mismo grupo
const VARIACION_ALTURA_MONEDAS = 70; // +- respecto del hueco anterior (alcanzable sin esfuerzo)
const MARGEN_MONEDAS = 40;          // distancia minima al techo y al piso

/* --- enemigos ---
Para que sea justo, cada murcielago sale con la distancia calculada para que cruce
la posicion del monstruo justo cuando por ahi pasa el tramo libre entre dos columnas */
const TIEMPO_PRIMER_ENEMIGO = 8;    // segundos de juego antes de que aparezca el primero
const PROB_ENEMIGOS = 0.3;          // chance de que haya un murcielago en cada tramo
const MARGEN_ENEMIGOS = 70;         // distancia minima al techo y al piso (incluye el vaiven)
/* El murcielago nunca se pone en el "corredor": la franja de alturas entre un
hueco y el siguiente, que es por donde vuela el jugador. Esta distancia se
suma a cada lado de ese corredor (alcanza el radio del murcielago, el alto del
monstruo y el vaiven, con margen). Si arriba y abajo no queda lugar, ese tramo
no lleva murcielago. */
const DISTANCIA_CORREDOR = 90;

const RUTA_IMAGENES = "../../images/runner/Column/";

export class ObstaculoSpawner {

    /* xJugador: posicion horizontal fija del monstruo (para sincronizar enemigos) */
    constructor(ancho, alto, xJugador) {
        this.ancho = ancho;
        this.alto = alto;
        this.xJugador = xJugador;

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
        this.monedas = [];
        this.enemigos = [];
        /* px que faltan recorrer hasta crear el siguiente. En 0 el primero
        aparece enseguida */
        this.distancia = 0;
        /* segundos jugados: hace que el hueco se achique con el tiempo */
        this.tiempo = 0;
        /* altura del proximo hueco, decidida con anticipacion para poder
        poner los enemigos sin cruzar el camino entre un hueco y el siguiente */
        this.centroPlaneado = null;
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

        /* las monedas tampoco pueden quedar bajo el piso */
        for (const m of this.monedas) {
            m.y = Math.min(m.y, this.pisoY - MARGEN_MONEDAS);
        }

        for (const e of this.enemigos) {
            e.yBase = Math.min(e.yBase, this.pisoY - MARGEN_ENEMIGOS);
        }
    }

    /* separacion: px hasta el proximo obstaculo (ya sorteada), asi sabemos
    donde queda el tramo libre para poner monedas */
    crearObstaculo(adelanto, separacion, velocidad) {
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

        /* el centro ya estaba decidido desde el obstaculo anterior (salvo el
        primero). Se ajusta por si el escenario cambio de tamaño. */
        const centro = Math.min(
            Math.max(
                this.centroPlaneado ?? this.sortearCentro(hueco, null),
                hueco / 2 + MARGEN
            ),
            Math.max(hueco / 2 + MARGEN, pisoY - hueco / 2 - MARGEN)
        );

        /* y se decide el del siguiente. Como todavia no se sabe que tan grande
        va a ser su hueco, se usa el mayor posible (si despues es mas chico, entra igual) */
        const huecoMaximo = Math.min(
            Math.max(HUECO_MIN, HUECO_INICIAL - this.tiempo * ACHICAR_POR_SEG) + VARIACION_HUECO,
            pisoY - MARGEN * 2
        );
        this.centroPlaneado = this.sortearCentro(huecoMaximo, centro);

        /* nace justo afuera del borde derecho. 'adelanto' son los px que ya
        deberia haber avanzado si el frame se pasó de largo */
        const obstaculo = new Obstaculo(this.ancho + adelanto, centro, hueco);
        this.obstaculos.push(obstaculo);

        this.crearMonedas(obstaculo, separacion);
        this.crearEnemigo(obstaculo, separacion, velocidad);
    }

    /* Sortea la altura del centro de un hueco: tiene que entrar entre el techo
    y el piso, y no alejarse mas de MAX_CAMBIO_ALTURA del anterior (sin este
    limite podria aparecer uno arriba de todo y el proximo abajo de todo, y no
    daria el tiempo para llegar). 'anterior' puede ser null. */
    sortearCentro(hueco, anterior) {
        let min = hueco / 2 + MARGEN;
        let max = this.pisoY - hueco / 2 - MARGEN;

        if (anterior !== null) {
            min = Math.max(min, anterior - MAX_CAMBIO_ALTURA);
            max = Math.min(max, anterior + MAX_CAMBIO_ALTURA);
        }

        return azar(min, max);
    }

    /* Un murcielago que va a llegar al monstruo justo cuando el centro del
    tramo libre (entre este obstaculo y el siguiente) pase por su posicion.
    El murcielago es mas rapido que el escenario, asi que tiene que salir
    mas lejos: sale 'extra * tiempo de llegada del tramo' px mas a la derecha. */
    crearEnemigo(obstaculo, separacion, velocidad) {
        if (this.tiempo < TIEMPO_PRIMER_ENEMIGO) return;
        if (Math.random() > PROB_ENEMIGOS) return;

        const xMedio = obstaculo.x + (obstaculo.ancho + separacion) / 2;

        const segundosHastaElTramo = (xMedio - this.xJugador) / velocidad;
        const x = xMedio + VELOCIDAD_EXTRA_ENEMIGO * segundosHastaElTramo;

        /* corredor: de la altura del hueco de este obstaculo a la del siguiente */
        const corredorArriba = Math.min(obstaculo.centro, this.centroPlaneado) - DISTANCIA_CORREDOR;
        const corredorAbajo = Math.max(obstaculo.centro, this.centroPlaneado) + DISTANCIA_CORREDOR;

        /* zonas libres: por encima y por debajo del corredor */
        const zonas = [];
        if (corredorArriba >= MARGEN_ENEMIGOS) {
            zonas.push([MARGEN_ENEMIGOS, corredorArriba]);
        }
        if (corredorAbajo <= this.pisoY - MARGEN_ENEMIGOS) {
            zonas.push([corredorAbajo, this.pisoY - MARGEN_ENEMIGOS]);
        }
        if (zonas.length === 0) return;     // no hay lugar sin molestar: sin murcielago

        const [desde, hasta] = zonas[Math.floor(Math.random() * zonas.length)];
        const y = azar(desde, hasta);

        this.enemigos.push(new Enemigo(x, y));
    }

    /* Pone un grupo de monedas en el tramo libre entre este obstaculo y el
    siguiente (que todavia no existe, pero sabemos a que distancia va a estar).
    La altura se elige cerca del hueco de ESTE obstaculo: asi siempre se
    llega, y como el siguiente hueco tambien esta cerca, queda en el camino. */
    crearMonedas(obstaculo, separacion) {
        if (Math.random() > PROB_MONEDAS) return;

        const cantidad = 1 + Math.floor(Math.random() * MAX_GRUPO);

        const y = Math.min(
            Math.max(
                obstaculo.centro + azar(-VARIACION_ALTURA_MONEDAS, VARIACION_ALTURA_MONEDAS),
                MARGEN_MONEDAS
            ),
            this.pisoY - MARGEN_MONEDAS
        );

        /* punto medio del espacio libre: entre el borde derecho de este
        obstaculo y el borde izquierdo del siguiente */
        const xMedio = obstaculo.x + (obstaculo.ancho + separacion) / 2;

        for (let i = 0; i < cantidad; i++) {
            const x = xMedio + (i - (cantidad - 1) / 2) * SEPARACION_MONEDAS;
            this.monedas.push(new Moneda(x, y));
        }
    }

    update(dt, velocidad) {
        this.tiempo += dt;

        /* cuenta regresiva en PIXELES recorridos (velocidad * dt) */
        this.distancia -= velocidad * dt;

        /* si se paso, el nuevo obstaculo nace un poco mas adentro, asi la
        separacion es siempre la sorteada, sin importar los fps */
        while (this.distancia <= 0) {
            const separacion = azar(DISTANCIA_MIN, DISTANCIA_MAX);
            this.crearObstaculo(this.distancia, separacion, velocidad);
            this.distancia += separacion;
        }

        for (const o of this.obstaculos) {
            o.update(dt, velocidad);
        }

        /* los que ya salieron por la izquierda se descartan */
        this.obstaculos = this.obstaculos.filter(o => !o.estaFuera());

        for (const m of this.monedas) {
            m.update(dt, velocidad);
        }
        this.monedas = this.monedas.filter(m => !m.estaFuera());

        for (const e of this.enemigos) {
            e.update(dt, velocidad);
        }
        this.enemigos = this.enemigos.filter(e => !e.estaFuera());
    }

    /* Devuelve el primer peligro (obstaculo o enemigo) que el hitbox
    ({x, y, w, h}) toca y que todavia no lo habia lastimado, o undefined si
    no hay choque. Todos tienen el flag 'golpeado'. */
    peligroGolpeado(hitbox) {
        return this.obstaculos.find(o => !o.golpeado && o.colisiona(hitbox)) ||
               this.enemigos.find(e => !e.golpeado && e.colisiona(hitbox));
    }

    /* Cuenta los obstaculos que ya quedaron totalmente atras de xCorte
    (el borde izquierdo del monstruo). Cada uno se cuenta una sola vez. */
    contarPasados(xCorte) {
        let cantidad = 0;
        for (const o of this.obstaculos) {
            if (!o.pasado && o.x + o.ancho < xCorte) {
                o.pasado = true;
                cantidad++;
            }
        }
        return cantidad;
    }

    /* Recoge las monedas que toca el hitbox. Las saca del juego y devuelve
    cuantas fueron. */
    recogerMonedas(hitbox) {
        let cantidad = 0;
        for (const m of this.monedas) {
            if (m.colisiona(hitbox)) {
                m.recogido = true;
                cantidad++;
            }
        }
        if (cantidad > 0) {
            this.monedas = this.monedas.filter(m => !m.recogido);
        }
        return cantidad;
    }

    draw(ctx) {
        /* pixel art: sin suavizado. Se setea en cada frame porque cambiar
        el tamaño del canvas reinicia la configuracion del contexto */
        ctx.imageSmoothingEnabled = false;

        for (const o of this.obstaculos) {
            o.draw(ctx, this.imagenes, this.pisoY);
        }

        for (const m of this.monedas) {
            m.draw(ctx);
        }

        /* los murcielagos van al final: vuelan por delante de las columnas */
        for (const e of this.enemigos) {
            e.draw(ctx);
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
