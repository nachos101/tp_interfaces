// Espacio libre alrededor de cada ficha dentro de su casilla (px).
// Solo afecta el dibujo: el área para agarrarla sigue siendo la casilla entera.
const PIECE_PADDING = 5;

export class Piece{
    constructor(x, y, size, character){
        this.x = x;
        this.y = y;
        this.size = size;
        this.image = character.image;
        this.bgColor = character.bgColor;
        this.borderColor = character.borderColor;
        this.selected = false;
    }

    //dibujo la ficha. Si esta seleccionada se le da un borde acorde
    draw(ctx){
        //como los circulos se dibujan desde el centro
        //calculamos el centro y el radio basados en x, y y size.
        //el centro es el de la casilla; el radio se achica para dejar espacio entre fichas
        const radius = (this.size / 2) - PIECE_PADDING;
        const centerX = this.x + (this.size / 2);
        const centerY = this.y + (this.size / 2);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.bgColor;
        ctx.fill();

        //drawImage tira error si la imagen no se pudo cargar
        if (this.image.complete && this.image.naturalWidth > 0) {
            //como achico la imagen calculo el offset para centrarla
            const imgSize = (radius * 2) * 0.8;
            const offset = (this.size - imgSize) / 2;
            
            ctx.drawImage(
                this.image,
                this.x + offset,
                this.y + offset,
                imgSize,
                imgSize
            );
        }

        if (this.selected) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }
}