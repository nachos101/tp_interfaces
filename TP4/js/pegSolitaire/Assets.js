const assetUrl = (fileName) =>
    new URL(`../../images/peg/${fileName}`, import.meta.url).href;

export const TOKEN_DEFINITIONS = [
    {
        id: "helloKitty",
        label: "Hello Kitty",
        fileName: "hellokittyToken.png",
        bgColor: "#FFD1DC",
        borderColor: "#FF6699"
    },
    {
        id: "keroppi",
        label: "Keroppi",
        fileName: "keroppiToken.png",
        bgColor: "#C1E1C1",
        borderColor: "#4CBB17"
    },
    {
        id: "hangyodon",
        label: "Hangyodon",
        fileName: "hangyodonToken.png",
        bgColor: "#BFE3F5",
        borderColor: "#2E9BD6"
    }
];

const allowedTokenFiles = new Set([
    "hellokittyToken.png",
    "keroppiToken.png",
    "hangyodonToken.png"
]);
const invalidTokenDefinition = TOKEN_DEFINITIONS.find(
    ({id, label, fileName}) =>
        !id || !label || !allowedTokenFiles.has(fileName)
);

if (invalidTokenDefinition) {
    throw new Error(`Configuración de Token inválida: ${invalidTokenDefinition.id || "sin id"}`);
}

export const pieceImages = Object.fromEntries(
    TOKEN_DEFINITIONS.map(({id, fileName}) => {
        const image = new Image();
        image.src = assetUrl(fileName);
        return [id, image];
    })
);

Object.entries(pieceImages).forEach(([id, image]) => {
    image.addEventListener("error", () => {
        console.error(`No se pudo cargar el recurso del Token "${id}".`);
    });
});

export const characters = TOKEN_DEFINITIONS.map(({id, label, bgColor, borderColor}) => ({
    id,
    label,
    image: pieceImages[id],
    bgColor,
    borderColor
}));

export const bgImage = {
    general: new Image()
};

bgImage.general.src = assetUrl("background.jpg");