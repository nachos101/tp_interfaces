/* esta clase: crea el pj, el parallax, escucha entradas
de usuario, ejecuta el gameloop y actualiza todos los elementos en cada fotograma */
import { Monster } from "./Monster.js";
import { Parallax } from "./Parallax.js";

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

function init() {

    // Creamos el personaje
    monster = new Monster(
        monsterElement,
        gameWorld.clientHeight
    );

    // Creamos el fondo
    parallax = new Parallax(gameWorld);

    // Configuramos el canvas
    resizeCanvas();

    // Eventos
    window.addEventListener("keydown", handleKeyDown);

    gameWorld.addEventListener("pointerdown", handlePointerDown);

    window.addEventListener("resize", handleResize);

    // Comenzamos el juego
    requestAnimationFrame(gameLoop);
}


/* controles */
function handleKeyDown(event) {
    if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        monster.jump();
    }
}

function handlePointerDown() {
    monster.jump();
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

    /*movimiento del escenario */
    parallax.update(dt, GAME_SPEED);

}


/* dibujado */

function draw() {

    ctx.clearRect(
        0,
        0,
        gameWorld.clientWidth,
        gameWorld.clientHeight
    );

}

/* iniciar */
init();