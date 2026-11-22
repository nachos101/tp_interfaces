/* ==========================================================================
   BLOCKA - rompecabezas de imágenes rotadas con filtros
   --------------------------------------------------------------------------
   Piezas del código:
   - IMAGE_PATHS / ImageBank : banco de imágenes (se elige una al azar por nivel)
   - Filters                : filtros de píxeles (patrón Strategy: cada filtro es
                              intercambiable y el nivel decide cuál usar)
   - LEVELS                 : configuración declarativa de cada nivel
   - Piece                  : una subimagen (canvas cuadrado + rotación)
   - BlockaGame             : controlador del juego (estado, timer, UI)
   ========================================================================== */

/* Para sumar imágenes al banco alcanza con agregar su ruta acá (mínimo 6). */
const IMAGE_PATHS = [
  '../images/blocka_images/Gemini_Generated_Image_46q0yi46q0yi46q0.jpeg',
  '../images/blocka_images/Gemini_Generated_Image_a07kcqa07kcqa07k.jpeg',
  '../images/blocka_images/Gemini_Generated_Image_hzskqshzskqshzsk.jpeg',
  '../images/blocka_images/Gemini_Generated_Image_j6krjmj6krjmj6kr.jpeg',
  '../images/blocka_images/Gemini_Generated_Image_2o34o52o34o52o34.jpeg',
  '../images/blocka_images/Gemini_Generated_Image_b4xl9zb4xl9zb4xl.jpeg'
];

const PIECE_PX = 320;        // resolución interna de cada subimagen (cuadrada)
const HELP_PENALTY_SEC = 5;  // segundos que suma la "Ayudita"

/* ---------- Banco de imágenes ---------- */
const ImageBank = {
  images: [], // { src, img }

  load() {
    const loadOne = (src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ src, img });
      img.onerror = () => resolve(null); // una imagen rota no tumba el juego
      img.src = src;
    });
    return Promise.all(IMAGE_PATHS.map(loadOne)).then((list) => {
      this.images = list.filter(Boolean);
      return this.images;
    });
  },

  random() {
    return Math.floor(Math.random() * this.images.length);
  }
};

/* ---------- Filtros (Strategy) ----------
   `pixels` trabaja sobre el ImageData (tiempo de carga del nivel).
   `css` es un respaldo por si el navegador bloquea getImageData
   (por ejemplo al abrir el HTML con file:// en vez de un servidor). */
const Filters = {
  none: {
    name: 'Sin filtro',
    css: 'none',
    pixels: () => {}
  },
  grayscale: {
    name: 'Escala de grises',
    css: 'grayscale(1)',
    pixels: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = d[i + 1] = d[i + 2] = g;
      }
    }
  },
  brightness: {
    name: 'Brillo (+30%)',
    css: 'brightness(1.3)',
    pixels: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        d[i] = Math.min(255, d[i] * 1.3);
        d[i + 1] = Math.min(255, d[i + 1] * 1.3);
        d[i + 2] = Math.min(255, d[i + 2] * 1.3);
      }
    }
  },
  negative: {
    name: 'Negativo',
    css: 'invert(1)',
    pixels: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 - d[i];
        d[i + 1] = 255 - d[i + 1];
        d[i + 2] = 255 - d[i + 2];
      }
    }
  }
};

/* Aplica un filtro a un canvas ya dibujado. Devuelve false si no pudo leer píxeles. */
function applyPixelFilter(ctx, filter) {
  if (filter === Filters.none) return true;
  try {
    const imgData = ctx.getImageData(0, 0, PIECE_PX, PIECE_PX);
    filter.pixels(imgData.data);
    ctx.putImageData(imgData, 0, 0);
    return true;
  } catch (e) {
    return false;
  }
}

/* ---------- Niveles ----------
   filter: un filtro, o 'mixed' = cada subimagen con un filtro distinto.
   time:   tiempo máximo en segundos para 4 piezas (null = sin límite).
           Se escala según la cantidad de piezas. */
const LEVELS = [
  { filter: 'grayscale',  label: 'Escala de grises',    time: null },
  { filter: 'brightness', label: 'Brillo (+30%)',       time: null },
  { filter: 'negative',   label: 'Negativo',            time: 90 },
  { filter: 'mixed',      label: 'Filtros combinados',  time: 75 },
  { filter: 'mixed',      label: 'Combinados + reloj',  time: 55 }
];

const GRID_BY_PIECES = {
  4: { cols: 2, rows: 2 },
  6: { cols: 3, rows: 2 },
  8: { cols: 4, rows: 2 }
};

/* ---------- Piece: una subimagen de la blocka ---------- */
class Piece {
  constructor(id, source, filter, initialRotation) {
    this.id = id;
    this.source = source;     // { img, sx, sy, size } recorte dentro de la imagen
    this.filter = filter;
    this.angle = initialRotation; // acumulado: evita giros de "vuelta larga" en la animación
    this.locked = false;

    this.canvas = document.createElement('canvas');
    this.canvas.width = PIECE_PX;
    this.canvas.height = PIECE_PX;
    this.canvas.className = 'blocka-piece';
    this.ctx = this.canvas.getContext('2d');

    this.cell = document.createElement('div');
    this.cell.className = 'blocka-cell';
    this.cell.tabIndex = 0;
    this.cell.setAttribute('role', 'button');
    this.cell.appendChild(this.canvas);

    this.draw(true);
    this.applyTransform();
  }

  get rotation() {
    return ((this.angle % 360) + 360) % 360;
  }

  get isCorrect() {
    return this.rotation === 0;
  }

  /* Dibuja la subimagen; con filtro (estado de juego) o sin él (imagen final RGB). */
  draw(withFilter) {
    const { img, sx, sy, size } = this.source;
    this.ctx.filter = 'none';
    this.ctx.clearRect(0, 0, PIECE_PX, PIECE_PX);
    this.ctx.drawImage(img, sx, sy, size, size, 0, 0, PIECE_PX, PIECE_PX);
    if (!withFilter || this.filter === Filters.none) return;

    if (!applyPixelFilter(this.ctx, this.filter)) {
      // Respaldo: redibujar usando el filtro nativo del canvas
      this.ctx.clearRect(0, 0, PIECE_PX, PIECE_PX);
      this.ctx.filter = this.filter.css;
      this.ctx.drawImage(img, sx, sy, size, size, 0, 0, PIECE_PX, PIECE_PX);
      this.ctx.filter = 'none';
    }
  }

  rotate(delta) {
    if (this.locked) return;
    this.angle += delta;
    this.applyTransform();
  }

  /* Gira por el camino más corto hasta la posición correcta y la deja fija. */
  snapAndLock() {
    let delta = (360 - this.rotation) % 360;
    if (delta > 180) delta -= 360;
    this.angle += delta;
    this.locked = true;
    this.cell.classList.add('locked');
    this.applyTransform();
  }

  applyTransform() {
    this.canvas.style.transform = `rotate(${this.angle}deg)`;
    this.cell.setAttribute('aria-label',
      `Pieza ${this.id + 1}, rotada ${this.rotation} grados${this.locked ? ', fija' : ''}`);
  }
}

/* ---------- Controlador del juego ---------- */
class BlockaGame {
  constructor() {
    this.levelIndex = 0;
    this.pieceCount = 4;
    this.pieces = [];
    this.state = 'idle'; // idle | selecting | playing | finished

    this.imageIndex = null;
    this.maxTime = null;       // segundos, o null
    this.startTime = 0;
    this.penalty = 0;          // segundos sumados por ayuditas
    this.timerInterval = null;
    this.animTimeout = null;
    this.revealTimeout = null;

    this.el = {
      board: document.getElementById('board-container'),
      level: document.getElementById('level-display'),
      timer: document.getElementById('timer-display'),
      timerLabel: document.getElementById('timer-label'),
      record: document.getElementById('record-display'),
      filter: document.getElementById('filter-display'),
      thumbs: document.getElementById('thumbnails-grid'),
      select: document.getElementById('pieces-select'),
      btnStart: document.getElementById('btn-start'),
      btnReset: document.getElementById('btn-reset'),
      btnHelp: document.getElementById('btn-help'),
      overlay: document.getElementById('modal-overlay'),
      modalTitle: document.getElementById('modal-title'),
      modalDesc: document.getElementById('modal-desc'),
      btnNext: document.getElementById('btn-next-level'),
      btnRetry: document.getElementById('btn-retry')
    };

    this.bindEvents();
    this.renderThumbnails();
    this.setupLevel();
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  /* ---------- Eventos ---------- */
  bindEvents() {
    const { el } = this;

    el.btnStart.addEventListener('click', () => this.startAnimatedSelection());
    el.btnReset.addEventListener('click', () => this.setupLevel());
    el.btnHelp.addEventListener('click', () => this.useHelp());

    el.select.addEventListener('change', (e) => {
      this.pieceCount = parseInt(e.target.value, 10);
      this.setupLevel();
    });

    el.btnNext.addEventListener('click', () => {
      this.closeModal();
      this.levelIndex = Math.min(this.levelIndex + 1, LEVELS.length - 1);
      this.setupLevel();
    });

    el.btnRetry.addEventListener('click', () => {
      this.closeModal();
      this.setupLevel();
    });

    // Nunca mostrar el menú contextual del navegador sobre el tablero
    el.board.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /* ---------- Banco de imágenes: thumbnails ---------- */
  renderThumbnails() {
    this.el.thumbs.innerHTML = '';
    ImageBank.images.forEach(({ src }, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Imagen ${i + 1} del banco`;
      img.className = 'thumb-card';
      this.el.thumbs.appendChild(img);
    });
  }

  get thumbElements() {
    return this.el.thumbs.querySelectorAll('.thumb-card');
  }

  setActiveThumb(index) {
    this.thumbElements.forEach((t, i) => t.classList.toggle('active', i === index));
  }

  /* ---------- Preparación del nivel ---------- */
  setupLevel() {
    this.cancelPending();
    this.state = 'idle';
    this.imageIndex = null;

    const level = this.level;
    this.maxTime = level.time ? Math.round(level.time * this.pieceCount / 4) : null;
    this.penalty = 0;

    this.el.level.textContent = `${this.levelIndex + 1}/${LEVELS.length}`;
    this.el.filter.textContent = level.label;
    this.el.timerLabel.textContent = this.maxTime ? 'Restante' : 'Tiempo';
    this.el.timer.classList.remove('warning');
    this.el.timer.textContent = this.formatTime(this.maxTime || 0);
    this.updateRecordDisplay();
    this.setActiveThumb(-1);

    this.el.btnStart.disabled = ImageBank.images.length === 0;
    this.el.btnHelp.hidden = true;
    this.el.btnHelp.disabled = false;

    const grid = GRID_BY_PIECES[this.pieceCount];
    this.el.board.style.setProperty('--cols', grid.cols);
    this.el.board.style.setProperty('--rows', grid.rows);
    this.el.board.classList.remove('solved');

    const limitMsg = this.maxTime
      ? `<br>Tenés <strong>${this.maxTime} segundos</strong> para resolverla.`
      : '';
    this.el.board.innerHTML = ImageBank.images.length === 0
      ? '<div class="board-placeholder">No se pudieron cargar las imágenes del juego.</div>'
      : `<div class="board-placeholder">
           <div>
             <strong>Nivel ${this.levelIndex + 1}: ${level.label}</strong><br>
             Rotá cada pieza hasta reconstruir la imagen.<br>
             <span class="hint-line">Click izquierdo: gira a la izquierda · Click derecho: gira a la derecha</span>
             ${limitMsg}<br><br>
             Presioná <strong>Comenzar</strong> para sortear la imagen.
           </div>
         </div>`;
  }

  cancelPending() {
    this.stopTimer();
    clearTimeout(this.animTimeout);
    clearTimeout(this.revealTimeout);
    this.animTimeout = null;
    this.revealTimeout = null;
  }

  /* ---------- Sorteo animado de la imagen (extra 1) ---------- */
  startAnimatedSelection() {
    if (this.state !== 'idle' || ImageBank.images.length === 0) return;
    this.state = 'selecting';
    this.el.btnStart.disabled = true;

    const total = ImageBank.images.length;
    const target = ImageBank.random();
    const steps = total * 3 + target + 1; // 3 vueltas completas y frena sobre `target`
    let step = 0;

    const tick = () => {
      this.setActiveThumb(step % total);
      step++;
      if (step >= steps) {
        this.animTimeout = setTimeout(() => this.startGamePlay(target), 700);
        return;
      }
      // Frena progresivamente hacia el final
      const remaining = steps - step;
      const delay = remaining < 6 ? 110 + (6 - remaining) * 60 : 90;
      this.animTimeout = setTimeout(tick, delay);
    };
    tick();
  }

  /* ---------- Arranque de la partida ---------- */
  startGamePlay(imageIndex) {
    this.imageIndex = imageIndex;
    this.buildBoard();
    this.state = 'playing';
    this.el.btnHelp.hidden = false;
    this.startTimer();
  }

  /* Elige el filtro de cada subimagen (los filtros se aplican acá, al armar el nivel). */
  pickFilters(count) {
    const key = this.level.filter;
    if (key !== 'mixed') return Array(count).fill(Filters[key]);

    const pool = [Filters.grayscale, Filters.brightness, Filters.negative];
    const list = Array.from({ length: count }, (_, i) => pool[i % pool.length]);
    // Mezcla para que no siempre queden en el mismo orden
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  buildBoard() {
    const { cols, rows } = GRID_BY_PIECES[this.pieceCount];
    const { img } = ImageBank.images[this.imageIndex];

    // Recorte centrado con la proporción del tablero => piezas siempre cuadradas
    const targetRatio = cols / rows;
    let cropW = img.naturalWidth;
    let cropH = cropW / targetRatio;
    if (cropH > img.naturalHeight) {
      cropH = img.naturalHeight;
      cropW = cropH * targetRatio;
    }
    const cropX = (img.naturalWidth - cropW) / 2;
    const cropY = (img.naturalHeight - cropH) / 2;
    const size = cropW / cols;

    const filters = this.pickFilters(cols * rows);
    const rotations = [90, 180, 270];

    this.el.board.innerHTML = '';
    this.el.board.classList.remove('solved');
    this.pieces = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const id = r * cols + c;
        const piece = new Piece(
          id,
          { img, sx: cropX + c * size, sy: cropY + r * size, size },
          filters[id],
          rotations[Math.floor(Math.random() * rotations.length)] // nunca arranca resuelta
        );
        this.bindPiece(piece);
        this.el.board.appendChild(piece.cell);
        this.pieces.push(piece);
      }
    }
  }

  bindPiece(piece) {
    // click izquierdo: izquierda | click derecho: derecha
    piece.cell.addEventListener('click', () => this.rotatePiece(piece, -90));
    piece.cell.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.rotatePiece(piece, 90);
    });
    // Accesibilidad por teclado
    piece.cell.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.rotatePiece(piece, -90); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.rotatePiece(piece, 90);
      }
    });
  }

  rotatePiece(piece, delta) {
    if (this.state !== 'playing' || piece.locked) return;
    piece.rotate(delta);
    this.checkWin();
  }

  /* ---------- Ayudita (extra 3) ---------- */
  useHelp() {
    if (this.state !== 'playing') return;
    const wrong = this.pieces.filter((p) => !p.isCorrect && !p.locked);
    if (wrong.length === 0) return;

    wrong[Math.floor(Math.random() * wrong.length)].snapAndLock();
    this.penalty += HELP_PENALTY_SEC;
    this.updateTimerDisplay();

    if (!this.checkTimeUp()) this.checkWin();
  }

  /* ---------- Cronómetro ---------- */
  get elapsed() {
    return (Date.now() - this.startTime) / 1000 + this.penalty;
  }

  startTimer() {
    this.stopTimer();
    this.penalty = 0;
    this.startTime = Date.now();
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.updateTimerDisplay();
      this.checkTimeUp();
    }, 200);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  formatTime(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const mins = String(Math.floor(s / 60)).padStart(2, '0');
    const secs = String(s % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }

  updateTimerDisplay() {
    if (this.maxTime !== null) {
      const remaining = this.maxTime - this.elapsed;
      this.el.timer.textContent = this.formatTime(Math.ceil(remaining));
      this.el.timer.classList.toggle('warning', remaining <= 10);
    } else {
      this.el.timer.textContent = this.formatTime(this.elapsed);
    }
  }

  checkTimeUp() {
    if (this.state !== 'playing' || this.maxTime === null) return false;
    if (this.elapsed >= this.maxTime) {
      this.gameOver();
      return true;
    }
    return false;
  }

  /* ---------- Récords por nivel (y cantidad de piezas) ---------- */
  get recordKey() {
    return `blocka:record:L${this.levelIndex + 1}:P${this.pieceCount}`;
  }

  getRecord() {
    try {
      const v = parseFloat(localStorage.getItem(this.recordKey));
      return Number.isFinite(v) ? v : null;
    } catch (e) {
      return null;
    }
  }

  saveRecord(seconds) {
    try {
      localStorage.setItem(this.recordKey, String(seconds));
    } catch (e) { /* sin almacenamiento: el récord dura solo la sesión */ }
  }

  updateRecordDisplay() {
    const rec = this.getRecord();
    this.el.record.textContent = rec === null ? '--:--' : this.formatTime(rec);
  }

  /* ---------- Victoria / derrota ---------- */
  checkWin() {
    if (!this.pieces.every((p) => p.isCorrect)) return;

    this.stopTimer();
    this.state = 'finished';
    const time = Math.round(this.elapsed * 10) / 10;

    const previous = this.getRecord();
    const isRecord = previous === null || time < previous;
    if (isRecord) this.saveRecord(time);
    this.updateRecordDisplay();
    this.el.timer.textContent = this.formatTime(time);
    this.el.timer.classList.remove('warning');
    this.el.btnHelp.hidden = true;

    // Se quitan los filtros: la imagen vuelve a su color original (RGB)
    this.revealTimeout = setTimeout(() => {
      this.pieces.forEach((p) => p.draw(false));
      this.el.board.classList.add('solved');

      this.revealTimeout = setTimeout(() => {
        const isLast = this.levelIndex === LEVELS.length - 1;
        const recordMsg = isRecord
          ? '¡Nuevo récord para este nivel!'
          : `Tu récord es ${previous.toFixed(1)} s.`;
        this.showModal({
          title: isLast ? '¡Completaste Blocka!' : '¡Nivel completado!',
          desc: `Resolviste la blocka en ${time.toFixed(1)} segundos. ${recordMsg}`,
          canAdvance: !isLast
        });
      }, 1400);
    }, 350);
  }

  gameOver() {
    this.stopTimer();
    this.state = 'finished';
    this.el.timer.textContent = this.formatTime(0);
    this.el.btnHelp.hidden = true;
    this.showModal({
      title: '¡Tiempo agotado!',
      desc: 'No lograste resolver la blocka a tiempo. ¡Probá de nuevo!',
      canAdvance: false
    });
  }

  /* ---------- Modal ---------- */
  showModal({ title, desc, canAdvance }) {
    this.el.modalTitle.textContent = title;
    this.el.modalDesc.textContent = desc;
    this.el.btnNext.hidden = !canAdvance;
    this.el.overlay.classList.add('active');
    (canAdvance ? this.el.btnNext : this.el.btnRetry).focus();
  }

  closeModal() {
    this.el.overlay.classList.remove('active');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('board-container')) return;
  ImageBank.load().then(() => new BlockaGame());
});
