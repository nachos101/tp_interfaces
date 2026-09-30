"use strict";
// =========================================================
// JUEGOS: trae los datos de la API y arma las cards
// =========================================================
const API_URL = "https://vj.interfaces.jima.com.ar/api/v2";

// ---------- Plantillas HTML (una por tipo de card) ----------

// Slide del carrusel grande: usa la imagen en alta resolución
function slideHTML(game) {
  return `
    <li class="featured__slide">
      <a class="featured__link" href="#">
        <img src="${game.background_image}" alt="${game.name}">
      </a>
    </li>`;
}

// Card de las filas: usa la imagen liviana y carga diferida
function cardHTML(game) {
  return `
    <li>
      <a class="card" href="#">
        <span class="card__thumb">
          <img src="${game.background_image_low_res}" alt="" loading="lazy">
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