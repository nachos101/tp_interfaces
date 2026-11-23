/* Esta clase controla el movimiento vertical del personaje */

/* el piso ocupa el 10% inferior del escenario. Se exporta para que
los obstaculos usen exactamente el mismo piso */
export const FLOOR_RATIO = 0.1;

/* caja de colision (px). Es mas chica que el sprite (128px escalado)
porque el monstruo dibujado no ocupa todo el cuadro: si usaramos el cuadro
completo se sentiria que chocas con cosas que no tocaste */
/* segundos que el monstruo no puede ser lastimado despues de un golpe.
A 180 px/s son 270 px: alcanza de sobra para salir de la columna */
const TIEMPO_INVULNERABLE = 1.5;
const VELOCIDAD_PARPADEO = 10;      // cambios de visibilidad por segundo

const HITBOX_W = 44;
const HITBOX_H = 36;

export class Monster{
    
    constructor(element, gameHeight) {
        this.element = element;

        /* pos vertical inicial */
        this.y = gameHeight / 2;

        /* pos horizontal del centro. Es fija: la define el translateX del css,
        el monstruo solo se mueve en vertical. Se lee una vez del DOM */
        const rect = element.getBoundingClientRect();
        const worldLeft = element.parentElement
            ? element.parentElement.getBoundingClientRect().left
            : 0;
        this.x = rect.left - worldLeft + rect.width / 2;

        /* velocidad vertical (que tan rapido sube/baja) */
        this.velocityY = 0;

        /* fisicas
        gravedad: aumenta la velocidad hacia abajo
        jumpForce cambia instantaneamente la velocidad para impulsar el pj */
        this.gravity = 1600; // px/s^2 
        this.jumpForce = -520; // px/s 

        this.gameHeight = gameHeight;

        /* segundos de invulnerabilidad que le quedan (0 = vulnerable) */
        this.invulnerable = 0;

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
        this.actualizarInvulnerabilidad(dt);

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

        const floorHeight = this.gameHeight * FLOOR_RATIO;
        const floorY = this.gameHeight - floorHeight;

        if (this.y > floorY - halfHeight) {
            this.y = floorY - halfHeight;
            this.velocityY = 0;
        }

        this.draw();
    }

    /* un golpe lo vuelve invulnerable un rato */
    herir(){
        this.invulnerable = TIEMPO_INVULNERABLE;
    }

    get esInvulnerable(){
        return this.invulnerable > 0;
    }

    /* cuenta regresiva y parpadeo: mientras es invulnerable alterna entre
    transparente y visible para que el jugador lo note */
    actualizarInvulnerabilidad(dt){
        if (this.invulnerable <= 0) return;

        this.invulnerable = Math.max(0, this.invulnerable - dt);

        const oculto = Math.floor(this.invulnerable * VELOCIDAD_PARPADEO) % 2 === 1;
        this.element.style.opacity = this.invulnerable > 0 && oculto ? "0.3" : "1";
    }

    /* rectangulo de colision centrado en el personaje */
    getHitbox(){
        return {
            x: this.x - HITBOX_W / 2,
            y: this.y - HITBOX_H / 2,
            w: HITBOX_W,
            h: HITBOX_H,
        };
    }

    /* vuelve a la posicion inicial (reiniciar partida) */
    reset(){
        this.y = this.gameHeight / 2;
        this.velocityY = 0;
        this.invulnerable = 0;
        this.element.style.opacity = "1";
        this.element.classList.remove("is-flapping");
        this.draw();
    }

    /* actualiza la pos visual, "mueve" al personaje.*/
    draw(){
        this.element.style.top = `${this.y}px`;
    }


    /* actualiza el tamaño del escenario segun la ventana del navegador*/
    resize(gameHeight){
        this.gameHeight = gameHeight;

        /* mismos limites que en update(): techo y piso */
        const halfHeight = this.element.getBoundingClientRect().height / 2;
        const floorY = gameHeight - gameHeight * FLOOR_RATIO;

        this.y = Math.min(
            Math.max(this.y, halfHeight),
            floorY - halfHeight
        );

        this.draw();
    }
}