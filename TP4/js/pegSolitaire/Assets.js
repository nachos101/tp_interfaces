export const pieceImages = {
    helloKitty: new Image(),
    keroppi: new Image(),
    hangyodon: new Image()
};

// Las rutas de Image se resuelven desde el HTML (pages/inGame.html), no desde este archivo
pieceImages.helloKitty.src =
    "../../images/peg/helloKittyToken.png";

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