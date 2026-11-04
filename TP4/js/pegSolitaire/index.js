// Botón para ingresar al juego
console.log("entre al js");
const playBtn = document.getElementById('playBtn');

if (playBtn) {
    playBtn.addEventListener('click', () => {
        console.log("clickeado");
        window.location.href = 'game.html';
        console.log("xd");

    });
}