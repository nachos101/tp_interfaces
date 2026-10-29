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
                                                         

class Main {
    constructor() {
        this.canvas = document.getElementById('pegCanva');
        this.ctx = this.canvas.getContext('2d');
        this.game = new Game(this.canvas.width, this.canvas.height, 60);
        this.images = {}; // Acá cargarías tus imágenes
        
        // Timer
        this.timeLeft = 300; // 5 minutos en segundos
        this.timerInterval = null;

        this.setupEvents();
        this.startLoop();
    }

    start() {
        this.game.init(this.images); // Pasar las imágenes de tus personajes
        this.startTimer();
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timeLeft = 300;
        this.timerInterval = setInterval(() => {
            if (!this.game.isGameOver && this.timeLeft > 0) {
                this.timeLeft--;
                document.getElementById('timerDisplay').innerText = this.formatTime(this.timeLeft);
            } else if (this.timeLeft === 0) {
                this.game.isGameOver = true;
                clearInterval(this.timerInterval);
            }
        }, 1000);
    }

    setupEvents() {
        // Requisito 6: Clic de mouse y soltar
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.game.onMouseDown(e.clientX - rect.left, e.clientY - rect.top);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.game.onMouseMove(e.clientX - rect.left, e.clientY - rect.top);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.game.onMouseUp(e.clientX - rect.left, e.clientY - rect.top);
        });

        // Requisito 7: Botón de reinicio
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.game = new Game(this.canvas.width, this.canvas.height, 60);
            this.start();
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
                this.ctx.fillText("Juego Terminado", this.canvas.width/2 - 150, this.canvas.height/2);
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



//==================================
// Constantes y configuracion.
//==================================

const charactersConfig = {
    kitty: {
        image: imgKitty, // Asumiendo que ya la cargaste en JS
        bgColor: "#FFD1DC", // Rosa pastel
        borderColor: "#FF6699" // Rosa fuerte
    },
    keroppi: {
        image: imgKeroppi,
        bgColor: "#C1E1C1", // Verde pastel
        borderColor: "#4CBB17" // Verde fuerte
    },
    pompompurin: {
        image: imgPompompurin,
        bgColor: "#FFFACD", // Amarillo pastel
        borderColor: "#FFD700" // Amarillo fuerte
    }
};

//=================================
// estado del juego
//=================================
/* matriz 7x7, 33 fichas.
    0: espacios donde no se puede jugar
    1: Hay ficha
    2: Espacio vacio */
const nonPlayable = 0;
const token = 1;
const empty = 2;

let board = [
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 2, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0]
]

let selectedToken = null;

//estado de la partida
let movements = 0;
let finishedGame = false;

//=================================
// funciones de dibujo
//=================================

function drawBoard (){
    //se limpia el canvas antes de dibujar
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /*se recorre la matriz para poder dibujarla,
    ademas se agrega el desplazamiento en x e y para
    que el tablero quede centrado.*/
    for (let row = 0; row < boardSize; row++){
        for (let col = 0; col< boardSize; col++){
            //si no es jugable salta la celda
            if (board[row][col] === nonPlayable){
                continue;
            }
            
            const x = offSetX + (col * cellSize);
            const y = offSetY + (row * cellSize);

            //dibujo el espacio jugable

            ctx.beginPath();
            ctx.arc(150, 150, 50, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function drawGame() {
    // Limpiar el canvas y dibujar todos los elementos
}


// ========================================
// logica del juego
// ========================================

function isValidMove(origen, destino) {
    // Comprobar las reglas del Peg Solitaire
}

function moveToken(origen, destino) {
    // Actualizar el estado del tablero
}

function checkEndOfGame() {
    // Comprobar victoria o ausencia de movimientos
}


// ========================================
// manejo de interacciones
// ========================================

function manejarClickCanvas(event) {
    // Convertir el clic en una posición del tablero
    // Seleccionar una ficha o intentar moverla
}

function restartGames() {
    // Restablecer el estado inicial
}


// ========================================
// event listeners
// ========================================

canvas.addEventListener("click", manejarClickCanvas);

// Agregar acá los listeners de los botones


// ========================================
// inicializacion
// ========================================

function startGame() {
    // Crear el tablero inicial
    drawGame();
}

startGame();