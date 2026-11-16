// Botón para ingresar al juego
const playBtn = document.getElementById('playBtn');

if (playBtn) {
    playBtn.addEventListener('click', () => {
        window.location.href = 'game.html';
    });
}