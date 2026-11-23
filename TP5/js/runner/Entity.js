/* Clase base de todo lo que se mueve con el escenario y no es una columna:
items (monedas) y enemigos. Una entidad es un circulo: x e y son el CENTRO
y 'radio' su tamaño de colision. Las subclases definen como se dibujan. */
export class Entity {

    constructor(x, y, radio) {
        this.x = x;
        this.y = y;
        this.radio = radio;
    }

    /* se mueve igual que el resto del mundo. dt evita depender de los fps */
    update(dt, velocidad) {
        this.x -= velocidad * dt;
    }

    /* ya salio por la izquierda -> se puede descartar */
    estaFuera() {
        return this.x + this.radio < 0;
    }

    /* Colision circulo contra rectangulo: buscamos el punto del rectangulo
    mas cercano al centro del circulo; si esta a menos de 'radio', se tocan. */
    colisiona(hitbox) {
        const cercanoX = Math.min(Math.max(this.x, hitbox.x), hitbox.x + hitbox.w);
        const cercanoY = Math.min(Math.max(this.y, hitbox.y), hitbox.y + hitbox.h);

        const dx = this.x - cercanoX;
        const dy = this.y - cercanoY;

        return dx * dx + dy * dy <= this.radio * this.radio;
    }

    /* cada subclase lo implementa */
    draw(ctx) {}
}
