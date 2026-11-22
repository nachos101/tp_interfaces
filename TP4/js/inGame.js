document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. FLECHAS GALERÍA HORIZONTAL ---
    const galeria = document.querySelector(".gallery-track");
    const btnPrevH = document.querySelector(".gameDescription .carousel-btn--prev");
    const btnNextH = document.querySelector(".gameDescription .carousel-btn--next");
    
    if (galeria && btnPrevH && btnNextH) {
        btnPrevH.addEventListener("click", () => {
            galeria.scrollBy({ left: -250, behavior: "smooth" });
        });
        btnNextH.addEventListener("click", () => {
            galeria.scrollBy({ left: 250, behavior: "smooth" });
        });
    }

    // --- 2. FLECHAS CARRUSEL VERTICAL ---
    const vertical = document.querySelector(".vertical-track");
    const btnUp = document.querySelector(".carousel-btn--up");
    const btnDown = document.querySelector(".carousel-btn--down");
    
    if (vertical && btnUp && btnDown) {
        btnUp.addEventListener("click", () => {
            vertical.scrollBy({ top: -300, behavior: "smooth" });
        });
        btnDown.addEventListener("click", () => {
            vertical.scrollBy({ top: 300, behavior: "smooth" });
        });
    }
    
    // Lógica para los botones de Me Gusta / No Me Gusta
    const btnLike = document.getElementById('btn-like');
        const btnDislike = document.getElementById('btn-dislike');

        // Función principal para manejar los clics
        function handleOpinionClick(btnClickeado, elOtroBtn) {
            // 1. Cambiamos el estado (si estaba apagado se prende, y viceversa)
            btnClickeado.classList.toggle('active');
            
            // 2. Si encendimos este botón, nos aseguramos de apagar el otro
            if (btnClickeado.classList.contains('active')) {
                elOtroBtn.classList.remove('active');
            }

            // 3. Reiniciamos y disparamos la animación de rebote
            btnClickeado.classList.remove('pop-animation');
            
            // (Un pequeño truco técnico para que el navegador vuelva a lanzar la animación)
            void btnClickeado.offsetWidth; 
            
            btnClickeado.classList.add('pop-animation');
        }

        // Le asignamos la función a los clics de cada botón
        btnLike.addEventListener('click', () => handleOpinionClick(btnLike, btnDislike));
        btnDislike.addEventListener('click', () => handleOpinionClick(btnDislike, btnLike));

    
        // Lógica para los corazones en los comentarios
    const heartButtons = document.querySelectorAll('.heart-btn');

    heartButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Encuentra el span con el contador dentro del mismo comentario
            const likesCountElement = this.nextElementSibling;
            let currentLikes = parseInt(likesCountElement.textContent);

            if (this.classList.contains('active')) {
                // Si ya está activo, lo desactiva y resta 1
                this.classList.remove('active');
                likesCountElement.textContent = currentLikes - 1;
            } else {
                // Si no está activo, lo activa y suma 1
                this.classList.add('active');
                likesCountElement.textContent = currentLikes + 1;
            }
        });
    });

    // --- JUEGOS DISPONIBLES ---
    // Cada botón "Jugar" trae un valor en data-game que indica qué juego mostrar.
    const GAME_PEG = 1;      // Peg Solitaire
    const GAME_BLOCKA = 2;   // Blocka
    const GAME_RUNNER = 3;   // Flying Monster (runner)

    function loadInIframe(container, src, title) {
        container.innerHTML = `
            <iframe
                src="${src}"
                title="${title}"
                style="width: 100%; height: 100%; border: none; display: block;"
                allowfullscreen>
            </iframe>
        `;
    }

    // Decide qué se muestra dentro del contenedor según el valor recibido
    function launchGame(gameId, container) {
        switch (gameId) {
            case GAME_PEG:
                loadInIframe(container, 'pegSolitaire/index.html', 'Hello Kitty Peg Solitaire');
                break;
            case GAME_BLOCKA:
                // Blocka ya viene armado dentro del contenedor (blocka.js lo controla): no hay nada que inyectar
                break;
            case GAME_RUNNER:
                loadInIframe(container, 'runner/index.html', 'Flying Monster');
                break;
            default:
                console.warn('Juego desconocido (data-game):', gameId);
        }
    }

    //logica boton jugar en frame
    const btnPlay = document.getElementById('btn-play-game');
    const gameCover = document.getElementById('game-cover');
    const gameContainer = document.getElementById('game-container');

    if (btnPlay && gameCover && gameContainer) {
        btnPlay.addEventListener('click', () => {
            // 1. Ocultamos la portada y el botón
            gameCover.style.display = 'none';

            // 2. Mostramos el contenedor
            gameContainer.style.display = 'block';
            gameContainer.style.width = '100%';
            gameContainer.style.height = '100%';

            // 3. Cargamos el juego que indica el valor del botón
            launchGame(parseInt(btnPlay.dataset.game, 10), gameContainer);
        });
    }
});
