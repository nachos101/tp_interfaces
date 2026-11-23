/* Un item es una entidad que se puede recoger (por ahora solo monedas).
Todo el movimiento y la colision vienen de Entity. */
import { Entity } from "./Entity.js";

export class Item extends Entity {

    constructor(x, y, radio) {
        super(x, y, radio);
        this.recogido = false;
    }
}
