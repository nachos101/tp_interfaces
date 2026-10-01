"use strict";

const menuBoton = document.querySelector("#menu-toggle");
const menu = document.querySelector("#menu-lateral");
const menuFondo = document.querySelector(".menu-overlay");
const header = document.querySelector(".site-header");

if (menuBoton && menu && menuFondo) {
  function abrirMenu(abrir) {
    menu.classList.toggle("abierto", abrir);
    menuFondo.classList.toggle("abierto", abrir);
    document.body.classList.toggle("menu-abierto", abrir);
    menuBoton.setAttribute("aria-expanded", String(abrir));
    menuBoton.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
  }

  menuBoton.addEventListener("click", () => {
    abrirMenu(!menu.classList.contains("abierto"));
  });

  menuFondo.addEventListener("click", () => abrirMenu(false));

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && menu.classList.contains("abierto")) {
      abrirMenu(false);
      menuBoton.focus();
    }
  });

  if (header && typeof ResizeObserver !== "undefined") {
    new ResizeObserver(() => {
      document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
    }).observe(header);
  }
} else {
  const navbar = document.querySelector(".navbar");

  if (menuBoton && navbar) {
    menuBoton.addEventListener("click", (evento) => {
      evento.stopPropagation();
      navbar.classList.toggle("show");
    });

    document.addEventListener("click", (evento) => {
      if (!menuBoton.contains(evento.target) && !navbar.contains(evento.target)) {
        navbar.classList.remove("show");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector(".button.login");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  if (loginBtn && usernameInput && passwordInput) {
    loginBtn.addEventListener("click", (evento) => {
      if (usernameInput.value.trim() !== "" && passwordInput.value.trim() !== "") {
        evento.preventDefault();
        window.location.href = "pages/home.html";
      }
    });
  }
});
