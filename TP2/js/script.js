"use strict";

//Menu Plegable

const menuBoton = document.querySelector("#menu-toggle");
const menu = document.querySelector("#menu-lateral");
const menuFondo = document.querySelector(".menu-overlay");
const header = document.querySelector(".site-header");

function abrirMenu(abrir) {
  menu.classList.toggle("abierto", abrir);
  menuFondo.classList.toggle("abierto", abrir);
  document.body.classList.toggle("menu-abierto", abrir);

  // Para lectores de pantalla: avisa si el menú está abierto o cerrado
  menuBoton.setAttribute("aria-expanded", abrir);
  menuBoton.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
}


menuBoton.addEventListener("click", () => {
  abrirMenu(!menu.classList.contains("abierto"));
});

menuFondo.addEventListener("click", () => abrirMenu(false));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu.classList.contains("abierto")) {
    abrirMenu(false);
    menuBoton.focus();
  }
});

new ResizeObserver(() => {
  document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
}).observe(header);
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.querySelector(".button.login");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    if (loginBtn && usernameInput && passwordInput) {
        loginBtn.addEventListener("click", (e) => {
            if (usernameInput.value.trim() !== "" && passwordInput.value.trim() !== "") {
                e.preventDefault();
                window.location.href = "pages/home.html";
            }
        });
    }
});