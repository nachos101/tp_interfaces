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
        const radius = this.size / 2;
        const centerX = this.x + radius;
        const centerY = this.y + radius;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.bgColor;
        ctx.fill();

        //drawImage tira error si la imagen no se pudo cargar
        if (this.image.complete && this.image.naturalWidth > 0) {
            //como achico la imagen calculo el offset para centrarla
            const imgSize = this.size * 0.8;
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