/*
    tamanio canva
    width: 1280px;
    height: 640px;

    elegir entre
    -kitty
    -keroppi
    -pochacco
    -hangyodon

    limites de tiempo
    -principiante : sin limite de tiempo
    -casual: 10 minutos
    -speedrun: 3 minutos

    ganar: queda una sola ficha en el medio
    perder: No quedan movimientos ---> movimientos posibles
        -en linea recta, todas las direcciones
        -debo mover mi ficha a un espacio vacio
        -debe haber una ficha entre mi espacio y el espacio que voy a ocupar.
        me "como" la ficha saltandole por encima


    se debe poder reiniciar el juego (cruz completa)
    opcional de rompebolas: boton que deshaga el ultimo movimiento

    Pasos:
    -defir el tamanio del canva
    -definir la matriz 7x7, ocultar las 4x4 de las puntas --> 1,1 - 1,2 - 1,6- 1,7
                                                            2,1 - 2,2 - 2,6 - 2,7
                                                            6,1 - 6,2 - 6,6 - 6,7
                                                            7,1 - 7,2 - 7,6 - 7,7

    */

import {Game} from './Game.js';
import {characters} from './Assets.js';

const CELL_SIZE = 80; // 7 celdas de 80px = tablero de 560px, entra en los 640px de alto

class Main {
    //recibe el personaje y la dificultad elegida al intanciarse
    constructor(characterValue, difficultyValue) {
        this.canvas = document.getElementById('pegCanva');
        this.ctx = this.canvas.getContext('2d');
        this.game = new Game(this.canvas.width, this.canvas.height, CELL_SIZE);

        //busca el personaje en el arreglo segun el value del html.
        //hello kitty poor defecto
        this.selectedCharacter = characters.find(c => c.id === characterValue) || characters[0]; 
        
        this.images = {}; // Acá iría boardBg si se agrega una imagen de fondo

        // Timer
        this.difficulty = difficultyValue;
        this.timerInterval = null;
        this.timerDisplay = document.getElementById('timerDisplay');

        this.setupEvents();
        this.startLoop();
    }

    start() {
        this.game.init(this.selectedCharacter);
        this.startTimer();
    }

    startTimer() {
        clearInterval(this.timerInterval);

        //html ya manda los segundos en el value del input
        const timeLimit = parseInt(this.difficulty, 10);
        
        if (timeLimit === 0){
            this.timerDisplay.innerText = 'Sin limite';
            return;
        }
        
        this.timeLeft = timeLimit
        this.timerDisplay.innerHTML = `${this.formatTime(this.timeLeft)}<br><span>Tiempo restante</span>`;

        this.timerInterval = setInterval(() => {
            if (this.game.isGameOver) {
                clearInterval(this.timerInterval);
                return;
            }

            this.timeLeft--;
            this.timerDisplay.innerHTML = `${this.formatTime(this.timeLeft)}<br><span>Tiempo restante</span>`;
            if (this.timeLeft <= 0) {
                this.game.isGameOver = true;
                this.game.endMessage = "Se acabó el tiempo";
                clearInterval(this.timerInterval);
            }
        }, 1000);
    }

    // Pasa del tamaño en pantalla (CSS) al tamaño interno del canvas
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    setupEvents() {

        //click de mouse y soltar
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Evita seleccionar texto de la página al arrastrar
            const pos = this.getMousePos(e);
            this.game.onMouseDown(pos.x, pos.y);
        });

        // En window para no perder la ficha si el mouse sale del canvas
        window.addEventListener('mousemove', (e) => {
            const pos = this.getMousePos(e);
            this.game.onMouseMove(pos.x, pos.y);
        });

        window.addEventListener('mouseup', (e) => {
            const pos = this.getMousePos(e);
            this.game.onMouseUp(pos.x, pos.y);
        });

        // boton de reinicio
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.game.clearHint();
            this.game = new Game(this.canvas.width, this.canvas.height, CELL_SIZE);
            this.start();
        });

        //boton de pistas
        document.getElementById('hintsBtn').addEventListener('click', () => {
            this.game.showHints();
        });

        //boton return a la configuracion de la partida
        const backBtn = document.getElementById('backBtn');

        backBtn.addEventListener('click', () => {
            window.location.href = 'game.html';
        });

    }

    // El corazón visual del juego
    startLoop() {
        const loop = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.game.draw(this.ctx, this.images.boardBg);

            // Requisito 5: Fin del juego visual
            if (this.game.isGameOver) {
                this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = "white";
                this.ctx.font = "40px Arial";
                this.ctx.textAlign = "center";
                this.ctx.fillText(this.game.endMessage, this.canvas.width/2, this.canvas.height/2);
            }

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }
}

//configuracion paraa game.html
const btnJugar = document.getElementById('btnJugar');
const configScreen = document.getElementById('configScreen');
const gameScreen = document.getElementById('gameScreen');

if (btnJugar) {
    btnJugar.addEventListener('click', () => {
        // 1. leer opciones seleccionadas por el usuario
        const selectedCharValue = document.querySelector('input[name="character"]:checked').value;
        const selectedDiffValue = document.querySelector('input[name="difficulty"]:checked').value;

        // 2. ocultar pantalla de configuración
        configScreen.hidden = true;
        configScreen.style.display = 'none';
        
        // 3. mostrar juego
        gameScreen.hidden = false;
        gameScreen.style.display = 'block'; 
        
        // 4. iniciar juego pasando los datos
        const main = new Main(selectedCharValue, selectedDiffValue);
        main.start();
    });
}
