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
    
    // --- 3. BOTÓN COMPARTIR (Corregido) ---
    const btnCompartir = document.getElementById("btn-compartir");
    const popupCompartir = document.getElementById("popup-compartir");

    if (btnCompartir && popupCompartir) {
        btnCompartir.addEventListener("click", (evento) => {
            popupCompartir.classList.toggle("is-visible");
            evento.stopPropagation(); 
        });

        document.addEventListener("click", (evento) => {
            // Comprueba si el clic fue AFUERA del botón y del popup
            if (!popupCompartir.contains(evento.target) && !btnCompartir.contains(evento.target)) {
                popupCompartir.classList.remove("is-visible");
            }
        });
    }

    // Lógica para los botones de Me Gusta / No Me Gusta
    const botonesOpinion = document.querySelectorAll(".opinion-btn .icon-btn");
    
    botonesOpinion.forEach(boton => {
        boton.addEventListener("click", () => {
            // Alterna la clase que creamos en CSS para rellenar/vaciar el dedo
            boton.classList.toggle("is-selected");
            
            // Truco pro: desmarca el botón contrario automáticamente
            botonesOpinion.forEach(otroBoton => {
                if (otroBoton !== boton) {
                    otroBoton.classList.remove("is-selected");
                }
            });
        });
    });
});