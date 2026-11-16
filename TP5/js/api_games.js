"use strict";
// =========================================================
// JUEGOS: trae los datos de la API y arma las cards
// =========================================================
const API_URL = "https://vj.interfaces.jima.com.ar/api/v2";

// ---------- Juegos premium ----------
// La API no trae precios, así que los definimos acá: id del juego → precio.
// Los juegos que no están en esta lista son gratis.
// (Los precios son de ejemplo: cambialos o agregá los juegos que quieras.)
const PRECIOS = {
  3498: 29.99,  // Grand Theft Auto V
  3328: 19.99,  // The Witcher 3: Wild Hunt
  28: 59.99,    // Red Dead Redemption 2
  58175: 49.99, // God of War (2018)
  41494: 39.99, // Cyberpunk 2077
  278: 19.99,   // Horizon Zero Dawn
  3287: 14.99,  // Batman: Arkham Knight
  2551: 29.99,  // Dark Souls III
  9767: 9.99,   // Hollow Knight
  654: 14.99,   // Stardew Valley
};

// ---------- Íconos ----------
// La corona se arma con tu SVG (que es media corona) + la misma mitad espejada
const MEDIA_CORONA = "M19.4119 29.8944C21.1981 20.9162 21.9181 11.7506 19.2425 2.83188C18.9375 1.81688 18.8575 0.870625 18.9456 0C17.2331 0.480625 15.9675 2.17875 15.9675 4.20875C15.9675 6.26688 17.2706 7.99 19.0212 8.4375C17.6163 13.0181 15.05 18.9669 11.8837 15.3056C11.8837 15.3056 8.39312 11.9719 4.63313 9.8125C4.7787 9.46377 4.85409 9.08977 4.855 8.71187C4.855 7.24188 3.7675 6.04875 2.4275 6.04875C1.0875 6.04875 0 7.24188 0 8.71187C0 10.1856 1.0875 11.3788 2.4275 11.3788C2.8775 11.3788 3.29188 11.2344 3.65438 11.0013C5.05688 13.9238 7.03687 19.1825 6.00312 24.0019C6.00312 24.0019 7.4875 29.9062 19.4119 29.8962";

const CORONA_SVG = `
  <svg class="badge-premium__corona" viewBox="0 0 37.7 30" fill="#F19D43" aria-hidden="true">
    <path d="${MEDIA_CORONA}"/>
    <path d="${MEDIA_CORONA}" transform="translate(37.7 0) scale(-1 1)"/>
  </svg>`;

const CARRITO_SVG = `
  <svg class="btn-carrito__icono" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>`;

// ---------- Piezas reutilizables ----------

// Corona + precio (abajo a la izquierda). Si el juego es gratis, no devuelve nada.
function badgePremiumHTML(precio) {
  if (precio === undefined) return "";
  return `
    <span class="badge-premium">
      ${CORONA_SVG}
      <span class="badge-premium__precio">$${precio.toFixed(2)}</span>
    </span>`;
}

// Contenido del botón central: "Jugar" o carrito + "Agregar al carrito"
function textoBoton(precio) {
  return precio === undefined ? "Jugar" : `${CARRITO_SVG}<span>Agregar al carrito</span>`;
}

// ---------- Plantillas HTML (una por tipo de card) ----------

// Slide del carrusel grande: usa la imagen en alta resolución
function slideHTML(game) {
  const precio = PRECIOS[game.id];
  const premium = precio !== undefined ? " es-premium" : "";
  return `
    <li class="featured__slide${premium}">
      <a class="featured__link" href="#">
        <img src="${game.background_image}" alt="${game.name}">
        ${badgePremiumHTML(precio)}
        <span class="featured__play" aria-hidden="true">${textoBoton(precio)}</span>
      </a>
    </li>`;
}

// Card de las filas: usa la imagen liviana y carga diferida
function cardHTML(game) {
  const precio = PRECIOS[game.id];
  const premium = precio !== undefined ? " es-premium" : "";
  return `
    <li>
      <a class="card${premium}" href="#">
        <span class="card__thumb">
          <img src="${game.background_image_low_res}" alt="" loading="lazy">
          ${badgePremiumHTML(precio)}
          <span class="card__play" aria-hidden="true">${textoBoton(precio)}</span>
        </span>
        <span class="card__name">${game.name}</span>
      </a>
    </li>`;
}

// ¿El juego tiene alguno de estos géneros? (géneros = ["Action", "Shooter"])
function tieneGenero(game, generos) {
  return game.genres.some((genre) => generos.includes(genre.name));
}

// ---------- Carga y armado ----------
fetch(API_URL)
  .then((response) => {
    if (!response.ok) throw new Error(`La API respondió ${response.status}`);
    return response.json();
  })
  .then((games) => {
    // Copia ordenada por rating, de mayor a menor
    const mejoresPrimero = [...games].sort((a, b) => b.rating - a.rating);

    // Carrusel grande: el juego fijo del HTML queda, y los 5 mejor puntuados
    // se agregan alrededor (1 antes y 4 después) para que asomen a ambos lados.
    // Se usa insertAdjacentHTML en vez de innerHTML para NO borrar la slide fija.
    const featured = document.querySelector(".featured__track");
    const destacados = mejoresPrimero.slice(0, 5).map(slideHTML);
    featured.insertAdjacentHTML("afterbegin", destacados.slice(0, 1).join(""));
    featured.insertAdjacentHTML("beforeend", destacados.slice(1).join(""));

    // Filas: cada una se llena según su atributo data-genre
    document.querySelectorAll(".shelf__track").forEach((track) => {
      const lista = track.dataset.genre
        ? games.filter((game) =>
            tieneGenero(game, track.dataset.genre.split(",").map((g) => g.trim()))
          )
        : mejoresPrimero.slice(5); // sin data-genre = "Recomendado"

      track.innerHTML = lista.map(cardHTML).join("");
    });

    // Recién ahora existen las cards: se activan las flechas
    iniciarCarruseles();
  })
  .catch((error) => {
    console.error("Error al obtener los juegos:", error);
    document.querySelector(".featured__track").innerHTML =
      `<li class="api-error">No pudimos cargar los juegos. Probá recargar la página.</li>`;
  });