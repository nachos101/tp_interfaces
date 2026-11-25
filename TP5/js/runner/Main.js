/* esta clase: crea el pj, el parallax, escucha entradas
de usuario, ejecuta el gameloop y actualiza todos los elementos en cada fotograma */
import { Monster } from "./Monster.js";
import { Parallax } from "./Parallax.js";
import { ObstaculoSpawner } from "./ObstaculoSpawner.js";
import { HUD } from "./HUD.js";

/* elementos del HTML */
const gameWorld = document.querySelector(".game-world");
const monsterElement = document.querySelector("#monster");

const canvas = document.querySelector("#gameCanvas");

const ctx = canvas.getContext("2d");

/* configuracion del juego */
const GAME_SPEED = 180;


/* inicializacion */
let monster;
let parallax;
let spawner;
let hud;

/* estado de la partida */
let gameOver = false;
/* segundos desde que perdiste. Evita que el mismo espacio con el que
chocaste (o uno apretado de mas) reinicie la partida al instante */
let tiempoGameOver = 0;
const ESPERA_REINICIO = 0.5;

function init() {

    // Creamos el personaje
    monster = new Monster(
        monsterElement,
        gameWorld.clientHeight
    );

    // Creamos el fondo
    parallax = new Parallax(gameWorld);

    // Creamos los obstaculos (usa el tamaño del escenario)
    spawner = new ObstaculoSpawner(
        gameWorld.clientWidth,
        gameWorld.clientHeight,
        monster.x
    );

    // Puntaje
    hud = new HUD();

    // Configuramos el canvas
    resizeCanvas();

    // Eventos
    window.addEventListener("keydown", handleKeyDown);

    gameWorld.addEventListener("pointerdown", handlePointerDown);

    window.addEventListener("resize", handleResize);

    // Si el juego esta dentro de un iframe, pedimos el foco para que
    // el teclado (espacio) llegue aca y no a la pagina de afuera
    window.focus();

    // Comenzamos el juego
    requestAnimationFrame(gameLoop);
}


/* controles */
function handleKeyDown(event) {
    if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        handleAction();
    }
}

function handlePointerDown() {
    handleAction();
}

/* espacio y click hacen lo mismo: aletear, o reiniciar si ya perdiste */
function handleAction() {
    if (gameOver) {
        if (tiempoGameOver >= ESPERA_REINICIO) {
            restart();
        }
        return;
    }
    monster.jump();
}

function restart() {
    gameOver = false;
    tiempoGameOver = 0;
    monster.reset();
    spawner.reset();
    hud.reset();
}


/* redimensiones */
function resizeCanvas() {
    const width = gameWorld.clientWidth;
    const height = gameWorld.clientHeight;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function handleResize() {
    resizeCanvas();

    monster.resize(gameWorld.clientHeight);

    parallax.resize();

    spawner.resize(gameWorld.clientWidth, gameWorld.clientHeight);
}


/* game loop */
let lastTime = 0;

function gameLoop(timestamp) {
    if (lastTime === 0) {
        lastTime = timestamp;
    }

    /* tiempo transcurrido entre fotogramas (segundos) */
    let dt = (timestamp - lastTime) / 1000;

    lastTime = timestamp;
    /*se evitan saltos bruscos su la pestaña pierde foco */
    dt = Math.min(dt, 0.05);

    update(dt);
    draw();

    requestAnimationFrame(gameLoop);
}


/* actualizacion */
function update(dt) {
    /* si perdiste, el escenario se congela*/
    if (gameOver) {
        tiempoGameOver += dt;
        return;
    }

    /* movimiento vertical del personaje */
    const tocoPiso = monster.update(dt);

    /*movimiento del escenario */
    parallax.update(dt, GAME_SPEED);

    /* los obstaculos se mueven a la misma velocidad que la capa mas cercana */
    spawner.update(dt, GAME_SPEED);

    const hitbox = monster.getHitbox();

    /* Choque con una columna o piso: pierde una vida.
    mientras parpadea (invulnerable) los choques no cuentan, y cada peligro lastima una sola vez. */
    if (!monster.esInvulnerable) {
        const columna = spawner.columnaGolpeada(hitbox);

        if (columna || tocoPiso) {
                if (columna) {
                    columna.golpeado = true;
                }

                hud.perderVida();

                if (hud.sinVidas) {
                    gameOver = true;
                    tiempoGameOver = 0;

                    monster.die();

                    hud.terminarPartida();
                    return;
                }

                monster.herir();
        }
    }

    /* choque con murcielago: quita monedas */
    const enemigo = spawner.enemigoGolpeado(hitbox);

    if (enemigo){
        enemigo.golpeado = true;
        hud.restarMonedas(4);
    }

    /* un punto por cada obstaculo que quedo completamente atras del monstruo.
    Va despues del choque: si perdes la ultima vida en este frame no sumas. */
    hud.sumar(spawner.contarPasados(hitbox.x));

    /* las monedas se recogen al tocarlas */
    hud.sumarMonedas(spawner.recogerMonedas(hitbox));

    /* los corazones recuperan vida al tocarlos */
    if (spawner.recogerCorazones(hitbox) > 0) {
        hud.recuperarVida();
    }
}


/* dibujado */

function draw() {

    ctx.clearRect(
        0,
        0,
        gameWorld.clientWidth,
        gameWorld.clientHeight
    );

    spawner.draw(ctx);

    hud.draw(ctx, gameWorld.clientWidth);

    if (gameOver) {
        hud.drawGameOver(
            ctx,
            gameWorld.clientWidth,
            gameWorld.clientHeight
        );
    }
}

/* iniciar */
init();