class Piece{
    constructor(x, y, size, image){
        this.x = x;
        this.y = y;
        this.size = size;
        this.image = image;
        this.bgColor = bgColor;
        this.borderColor = borderColor;
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

        ctx.drawImage(
            this.image,
            this.x,
            this.y,
            this.size,
            this.size
        );

        if (this.selected) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }
}