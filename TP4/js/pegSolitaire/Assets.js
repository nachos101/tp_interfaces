export const pieceImages = {
    helloKitty: new Image(),
    keroppi: new Image(),
    hangyodon: new Image()
};

// Las rutas de Image se resuelven desde el HTML (pages/pegSolitaire/game.html), no desde este archivo.
// Ojo con mayúsculas: en Linux / GitHub Pages "hellokitty" y "helloKitty" son archivos distintos.
pieceImages.helloKitty.src =
    "../../images/peg/hellokittyToken.png";

pieceImages.keroppi.src =
    "../../images/peg/keroppiToken.png";

pieceImages.hangyodon.src =
    "../../images/peg/hangyodonToken.png";

export const characters = [
    {
        id: "kitty",
        image: pieceImages.helloKitty,
        bgColor: "#FFD1DC", // Rosa pastel
        borderColor: "#FF6699" // Rosa fuerte
    },
    {
        id: "keroppi",
        image: pieceImages.keroppi,
        bgColor: "#C1E1C1", // Verde pastel
        borderColor: "#4CBB17" // Verde fuerte
    },
    {
        id: "hangyodon",
        image: pieceImages.hangyodon,
        bgColor: "#BFE3F5", // Celeste pastel
        borderColor: "#2E9BD6" // Celeste fuerte
    }
];

export const bgImage = {
    general : new Image()
}

bgImage.general.src =
    "../../images/peg/background.jpg";

// Fondo de la cruz del tablero (mismo color crema que antes: #F1DCB1)
export const boardImage = new Image();
boardImage.src = "../../images/peg/boardBg.png";