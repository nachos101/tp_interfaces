/* Un obstaculo es un par de columnas (una colgando del techo y otra
apoyada en el piso) con un hueco en el medio por donde pasa el monstruo.
Solo guarda la posicion y sabe moverse, dibujarse y chocar. */

/* ancho con el que se dibuja la columna (px) */
export const ANCHO_COLUMNA = 90;

/* cuanto se achica el rectangulo de colision a cada lado, porque el
borde de la imagen tiene un poco de aire. Es un % del ancho. */
const MARGEN_COLISION = 0.08;

/* filas de la imagen (de la parte lisa del fuste) que se estiran
cuando la columna es mas larga que la imagen. Como son rayas verticales
no se nota el estiramiento. */
const FILAS_FUSTE = 20;

export class Obstaculo {

    /* x: borde izquierdo de las columnas.
       centro: altura (y) del medio del hueco.
       hueco: alto del espacio libre. */
    constructor(x, centro, hueco) {
        this.x = x;
        this.centro = centro;
        this.hueco = hueco;
        this.ancho = ANCHO_COLUMNA;
    }

    /* limites del hueco */
    get techoHueco() {
        return this.centro - this.hueco / 2;
    }

    get pisoHueco() {
        return this.centro + this.hueco / 2;
    }

    /* se mueve a la izquierda. Se multiplica por dt para que la velocidad
    no dependa de los fps */
    update(dt, velocidad) {
        this.x -= velocidad * dt;
    }

    /* ya salio completo por la izquierda -> se puede descartar */
    estaFuera() {
        return this.x + this.ancho < 0;
    }

    /* Colision AABB (rectangulos alineados a los ejes).
       hitbox = {x, y, w, h} del monstruo.
       Hay choque si coincide en x con la columna y NO esta del todo
       dentro del hueco en y. Como la columna de arriba llega hasta el techo
       y la de abajo hasta el piso, alcanza con comparar contra el hueco. */
    colisiona(hitbox) {
        const inset = this.ancho * MARGEN_COLISION;
        const izquierda = this.x + inset;
        const derecha = this.x + this.ancho - inset;

        if (hitbox.x + hitbox.w <= izquierda || hitbox.x >= derecha) {
            return false;
        }

        return hitbox.y < this.techoHueco ||
               hitbox.y + hitbox.h > this.pisoHueco;
    }

    /* dibuja las dos columnas. imagenes = {arriba, abajo};
    pisoY = altura donde termina el escenario (donde empieza el piso) */
    draw(ctx, imagenes, pisoY) {
        this.dibujarColumnaSuperior(ctx, imagenes.arriba);
        this.dibujarColumnaInferior(ctx, imagenes.abajo, pisoY);
    }

    /* La imagen de arriba tiene el capitel (la parte ancha) abajo,
    pegado al hueco. El resto del fuste sube hasta el techo. */
    dibujarColumnaSuperior(ctx, img) {
        if (!imagenLista(img)) return;

        const largo = this.techoHueco;          // desde y=0 hasta el hueco
        if (largo <= 0) return;

        const escala = this.ancho / img.naturalWidth;
        const altoImg = img.naturalHeight * escala;

        if (largo <= altoImg) {
            // la imagen sobra: recortamos la parte de arriba (fuste)
            const origenH = largo / escala;
            ctx.drawImage(
                img,
                0, img.naturalHeight - origenH, img.naturalWidth, origenH,
                this.x, 0, this.ancho, largo
            );
        } else {
            // la imagen no alcanza: estiramos un poco de fuste arriba
            ctx.drawImage(
                img,
                0, 0, img.naturalWidth, FILAS_FUSTE,
                this.x, 0, this.ancho, largo - altoImg
            );
            ctx.drawImage(img, this.x, largo - altoImg, this.ancho, altoImg);
        }
    }

    /* La imagen de abajo tiene el capitel arriba, pegado al hueco,
    y el fuste baja hasta el piso. */
    dibujarColumnaInferior(ctx, img, pisoY) {
        if (!imagenLista(img)) return;

        const inicio = this.pisoHueco;
        const largo = pisoY - inicio;
        if (largo <= 0) return;

        const escala = this.ancho / img.naturalWidth;
        const altoImg = img.naturalHeight * escala;

        if (largo <= altoImg) {
            // recortamos la parte de abajo (fuste)
            const origenH = largo / escala;
            ctx.drawImage(
                img,
                0, 0, img.naturalWidth, origenH,
                this.x, inicio, this.ancho, largo
            );
        } else {
            // estiramos un poco de fuste abajo
            ctx.drawImage(img, this.x, inicio, this.ancho, altoImg);
            ctx.drawImage(
                img,
                0, img.naturalHeight - FILAS_FUSTE, img.naturalWidth, FILAS_FUSTE,
                this.x, inicio + altoImg, this.ancho, largo - altoImg
            );
        }
    }
}

/* la imagen puede no haber terminado de cargar en los primeros frames */
function imagenLista(img) {
    return img && img.complete && img.naturalWidth > 0;
}
