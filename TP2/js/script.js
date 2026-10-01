"use strict";

// Seleccionamos el SVG y el menú
const menuToggle = document.getElementById("menu-toggle");
const navbar = document.querySelector(".navbar");

if (menuToggle && navbar) {
    // 1. Abrir/Cerrar al tocar el SVG
    menuToggle.addEventListener("click", function(evento) {
        evento.stopPropagation(); // Evita que el clic interfiera con el documento
        navbar.classList.toggle("show");
    });

    // 2. Cerrar el menú si se hace clic afuera de él
    document.addEventListener("click", function(evento) {
        // Si el clic NO fue en el SVG y NO fue dentro del menú...
        if (!menuToggle.contains(evento.target) && !navbar.contains(evento.target)) {
            navbar.classList.remove("show"); // Lo cerramos
        }
    });
}