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
});