"use strict";
//scroll grande
document.querySelectorAll(".featured").forEach((featured) => {
  const track = featured.querySelector(".featured__track");
  const prev = featured.querySelector(".carousel-btn--prev");
  const next = featured.querySelector(".carousel-btn--next");
  const slides = [...track.children];
  if (!slides.length) return;

  // Posición de scroll que deja una slide centrada
  const centerOf = (slide) =>
    slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;

  // Índice de la slide que está más cerca del centro ahora
  const currentIndex = () => {
    let best = 0;
    slides.forEach((slide, i) => {
      if (Math.abs(centerOf(slide) - track.scrollLeft) <
          Math.abs(centerOf(slides[best]) - track.scrollLeft)) {
        best = i;
      }
    });
    return best;
  };

  const goTo = (i, behavior = "smooth") => {
    const index = Math.max(0, Math.min(i, slides.length - 1));
    track.scrollTo({ left: centerOf(slides[index]), behavior });
  };

  // Oculta la flecha que no tiene a dónde ir
  const updateButtons = () => {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
  };

  prev.addEventListener("click", () => goTo(currentIndex() - 1));
  next.addEventListener("click", () => goTo(currentIndex() + 1));
  track.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);

  // Arranca en la 2.ª slide para que asomen juegos a ambos lados
  goTo(1, "instant");
  updateButtons();
});


//scroll pequeño
// Muestra u oculta cada flecha según haya lugar hacia donde moverse
function conectarFlechas(track, prev, next, onPrev, onNext) {
  const updateButtons = () => {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
  };
 
  prev.addEventListener("click", onPrev);
  next.addEventListener("click", onNext);
  track.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);
 
  return updateButtons;
}
 
// ---------- "Destacados de la semana": de a un juego, siempre centrado ----------
document.querySelectorAll(".featured").forEach((featured) => {
  const track = featured.querySelector(".featured__track");
  const prev = featured.querySelector(".carousel-btn--prev");
  const next = featured.querySelector(".carousel-btn--next");
  const slides = [...track.children];
  if (!slides.length) return;
 
  // Posición de scroll que deja una slide centrada
  const centerOf = (slide) =>
    slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
 
  // Índice de la slide que está más cerca del centro ahora
  const currentIndex = () => {
    let best = 0;
    slides.forEach((slide, i) => {
      if (Math.abs(centerOf(slide) - track.scrollLeft) <
          Math.abs(centerOf(slides[best]) - track.scrollLeft)) {
        best = i;
      }
    });
    return best;
  };
 
  const goTo = (i, behavior = "smooth") => {
    const index = Math.max(0, Math.min(i, slides.length - 1));
    track.scrollTo({ left: centerOf(slides[index]), behavior });
  };
 
  const updateButtons = conectarFlechas(
    track, prev, next,
    () => goTo(currentIndex() - 1),
    () => goTo(currentIndex() + 1)
  );
 
  // Arranca en la 2.ª slide para que asomen juegos a ambos lados
  goTo(1, "instant");
  updateButtons();
});
 
// ---------- Filas de juegos: de a una "página" (los que entran en pantalla) ----------
document.querySelectorAll(".shelf").forEach((shelf) => {
  const track = shelf.querySelector(".shelf__track");
  const prev = shelf.querySelector(".carousel-btn--prev");
  const next = shelf.querySelector(".carousel-btn--next");
  const first = track.firstElementChild;
  if (!first || !prev || !next) return;
 
  // Cuánto avanzar: tantas cards completas como entren en pantalla
  const pageWidth = () => {
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap) || 0;
    const padding = parseFloat(styles.paddingLeft) || 0;
    const step = first.offsetWidth + gap;
    const visibles = Math.max(1, Math.floor((track.clientWidth - padding * 2 + gap) / step));
    return visibles * step;
  };
 
  const updateButtons = conectarFlechas(
    track, prev, next,
    () => track.scrollBy({ left: -pageWidth(), behavior: "smooth" }),
    () => track.scrollBy({ left: pageWidth(), behavior: "smooth" })
  );
 
  updateButtons();
});