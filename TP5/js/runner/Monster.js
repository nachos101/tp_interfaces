/* Esta clase controla el movimiento vertical del personaje */

export class Monster{
    
    constructor(element, gameHeight) {
        this.element = element;

        /* pos vertical inicial */
        this.y = gameHeight / 2;

        /* velocidad vertical (que tan rapido sube/baja) */
        this.velocityY = 0;

        /* fisicas
        gravedad: aumenta la velocidad hacia abajo
        jumpForce cambia instantaneamente la velocidad para impulsar el pj */
        this.gravity = 1600; // px/s^2 
        this.jumpForce = -520; // px/s 

        this.gameHeight = gameHeight;

        /* dibujamos la posicion inicial */
        this.draw();

        this.element.addEventListener("animationend", () => {
            this.element.classList.remove("is-flapping");
        });
    }

    /* impulso hacia arriba */
    jump(){
        this.velocityY = this.jumpForce;
            // Reiniciamos la animación si ya estaba ejecutándose
        this.element.classList.remove("is-flapping");
        void this.element.offsetWidth;
        this.element.classList.add("is-flapping");
    }

    /* actualiza la fisica. dt es el tiempo transcurrido desde el ultimo fotograma
    por eso se multiplica la gravedad y desplazamiento por ese valor. La fisica deja de 
    depender de los fps q ejecua la compu */
    update(dt){
        /* aceleracion, gravedad modifica la velocidad */
        this.velocityY += this.gravity * dt;

        /*movimiento, actualiza pos y segun la velocidad..
        Multiplicar por dt asegura que el juego vaya a la mima velocidad
        independientemente de los fps que corran en la pc */
        this.y += this.velocityY * dt;

        /* limites del escenario */
        const halfHeight = this.element.getBoundingClientRect().height / 2;

        /* topes de techo y piso. Si llega al tope frena al pj
        en el borde y pone velocidad 0 para que no acumule velocidad de caida
        mientras toca el piso */
        if (this.y < halfHeight){
            this.y = halfHeight;
            this.velocityY = 0;
        }

        const floorHeight = this.gameHeight * 0.1;
        const floorY = this.gameHeight - floorHeight;

        if (this.y > floorY - halfHeight) {
            this.y = floorY - halfHeight;
            this.velocityY = 0;
        }

        this.draw();
    }

    /* actualiza la pos visual, "mueve" al personaje.*/
    draw(){
        this.element.style.top = `${this.y}px`;
    }


    /* actualiza el tamaño del escenario segun la ventana del navegador*/
    resize(gameHeight){
        this.gameHeight = gameHeight;

        this.y = Math.min(
            Math.max(this.y, this.element.offsetHeight),
            gameHeight - this.element.offsetHeight
        );

        this.draw();
    }
}