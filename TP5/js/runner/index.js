// Boton para ingresar al juego (portada de Flying Monster)
const playBtn = document.getElementById('playBtn');

if (playBtn) {
    playBtn.addEventListener('click', () => {
        window.location.href = 'game.html';
    });
}
