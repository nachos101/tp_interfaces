"use strict"

const DURACION = 5000; // 5 segundos
const loader = document.querySelector('.loader');
const relleno = document.querySelector('.relleno');
const porcentaje = document.querySelector('.porcentaje');
const inicio = Date.now();

const intervalo = setInterval(() => {
  const transcurrido = Date.now() - inicio;
  const p = Math.min(100, Math.floor(transcurrido / DURACION * 100));

  relleno.style.width = p + '%';
  porcentaje.textContent = p + '%';

  if (p === 100) {
    clearInterval(intervalo);
    loader.classList.add('oculto');
  }
}, 50);