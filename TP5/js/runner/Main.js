/* esta clase: crea el pj, el parallax, escucha entradas
de usuario, ejecuta el gameloop y actualiza todos los elementos en cada fotograma */
import { Monster } from "./Monster.js";
import { Parallax } from "./Parallax.js";
import { ObstaculoSpawner } from "./ObstaculoSpawner.js";

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
        gameWorld.clientHeight
    );

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
    /* movimiento vertical del personaje */
    monster.update(dt);

    /* si perdiste, el escenario se congela y el monstruo solo cae */
    if (gameOver) {
        tiempoGameOver += dt;
        return;
    }

    /*movimiento del escenario */
    parallax.update(dt, GAME_SPEED);

    /* los obstaculos se mueven a la misma velocidad que la capa mas cercana */
    spawner.update(dt, GAME_SPEED);

    if (spawner.colisiona(monster.getHitbox())) {
        gameOver = true;
        tiempoGameOver = 0;
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

    if (gameOver) {
        drawGameOver();
    }
}

function drawGameOver() {
    const cx = gameWorld.clientWidth / 2;
    const cy = gameWorld.clientHeight / 2;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#FFFFFF";
    ctx.fillStyle = "#4F2D1C";

    ctx.font = "bold 64px sans-serif";
    ctx.strokeText("Game Over", cx, cy - 20);
    ctx.fillText("Game Over", cx, cy - 20);

    ctx.font = "bold 24px sans-serif";
    ctx.lineWidth = 5;
    ctx.strokeText("Espacio o click para reiniciar", cx, cy + 40);
    ctx.fillText("Espacio o click para reiniciar", cx, cy + 40);
}

/* iniciar */
init();