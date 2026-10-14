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

const userBoton = document.querySelector("#user-toggle");
const userMenu = document.querySelector("#user-menu");
const userFondo = document.querySelector(".user-overlay");

if (userBoton && userMenu && userFondo) {
  function abrirUserMenu(abrir) {
    userMenu.classList.toggle("abierto", abrir);
    userFondo.classList.toggle("abierto", abrir);
    document.body.classList.toggle("user-menu-abierto", abrir);
    userBoton.setAttribute("aria-expanded", String(abrir));
    userBoton.setAttribute("aria-label", abrir ? "Cerrar menú de usuario" : "Abrir menú de usuario");
  }

  userBoton.addEventListener("click", () => {
    abrirUserMenu(!userMenu.classList.contains("abierto"));
  });

  userFondo.addEventListener("click", () => abrirUserMenu(false));

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && userMenu.classList.contains("abierto")) {
      abrirUserMenu(false);
      userBoton.focus();
    }
  });

  if (header && typeof ResizeObserver !== "undefined") {
    new ResizeObserver(() => {
      document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
    }).observe(header);
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
