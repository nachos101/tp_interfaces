const IMAGE_BANK = [];
const BANK_SIZE = 6;
const CANVAS_SIZE = 400;

function initImageBank() {
  const themes = [
    (ctx) => {
      const grad = ctx.createLinearGradient(0,0,0,400);
      grad.addColorStop(0, '#0284c7'); grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad; ctx.fillRect(0,0,400,400);
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(200, 200, 80, 0, Math.PI*2); ctx.fill();
    },
    (ctx) => {
      ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0,0,400,400);
      ctx.fillStyle = '#ec4899'; ctx.fillRect(40,40,140,140);
      ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(300, 110, 70, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.moveTo(200, 220); ctx.lineTo(350, 360); ctx.lineTo(50, 360); ctx.closePath(); ctx.fill();
    },
    (ctx) => {
      const grad = ctx.createLinearGradient(0,0,0,400);
      grad.addColorStop(0, '#f97316'); grad.addColorStop(0.7, '#818cf8'); grad.addColorStop(1, '#312e81');
      ctx.fillStyle = grad; ctx.fillRect(0,0,400,400);
      ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 300, 400, 100);
    },
    (ctx) => {
      const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
      for(let i=0; i<4; i++) {
        for(let j=0; j<4; j++) {
          ctx.fillStyle = colors[(i+j)%4];
          ctx.fillRect(i*100, j*100, 100, 100);
        }
      }
    },
    (ctx) => {
      ctx.fillStyle = '#090d16'; ctx.fillRect(0,0,400,400);
      for(let i=0; i<10; i++) {
        ctx.strokeStyle = `hsl(${i * 36}, 80%, 60%)`;
        ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(200, 200, i*18, 0, Math.PI*1.5); ctx.stroke();
      }
    },
    (ctx) => {
      ctx.fillStyle = '#111827'; ctx.fillRect(0,0,400,400);
      ctx.fillStyle = '#06b6d4'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(400,400); ctx.lineTo(0,400); ctx.fill();
      ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(200,200,60,0,Math.PI*2); ctx.fill();
    }
  ];

  IMAGE_BANK.length = 0;
  themes.forEach((drawFn) => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext('2d');
    drawFn(ctx);
    IMAGE_BANK.push(canvas);
  });
}

const Filters = {
  grayscale: (ctx, width, height) => {
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
      d[i] = gray; d[i+1] = gray; d[i+2] = gray;
    }
    ctx.putImageData(imgData, 0, 0);
  },
  brightness: (ctx, width, height) => {
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;
    const factor = 1.3;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.min(255, d[i] * factor);
      d[i+1] = Math.min(255, d[i+1] * factor);
      d[i+2] = Math.min(255, d[i+2] * factor);
    }
    ctx.putImageData(imgData, 0, 0);
  },
  negative: (ctx, width, height) => {
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = 255 - d[i];
      d[i+1] = 255 - d[i+1];
      d[i+2] = 255 - d[i+2];
    }
    ctx.putImageData(imgData, 0, 0);
  },
  mixed: (ctx, width, height, pieceIndex) => {
    const filterList = [Filters.grayscale, Filters.brightness, Filters.negative];
    filterList[pieceIndex % filterList.length](ctx, width, height);
  }
};

class BlockaGame {
  constructor() {
    this.level = 1;
    this.pieceCount = 4;
    this.currentImage = null;
    this.pieces = [];
    this.isPlaying = false;
    this.timer = 0;
    this.timerInterval = null;
    this.maxTime = null;
    
    this.boardContainer = document.getElementById('board-container');
    this.timerDisplay = document.getElementById('timer-display');
    this.levelDisplay = document.getElementById('level-display');
    this.filterDisplay = document.getElementById('filter-display');
    
    this.initUI();
  }

  initUI() {
    const gallery = document.getElementById('gallery-preview');
    if (gallery) {
      gallery.innerHTML = '';
      IMAGE_BANK.forEach((c) => {
        const clone = document.createElement('canvas');
        clone.width = 100; clone.height = 100;
        clone.getContext('2d').drawImage(c, 0, 0, 100, 100);
        gallery.appendChild(clone);
      });
    }

    this.renderThumbnailsGrid();

    const piecesSelect = document.getElementById('pieces-select');
    if (piecesSelect) {
      piecesSelect.addEventListener('change', (e) => {
        this.pieceCount = parseInt(e.target.value);
        this.setupLevel();
      });
    }

    const btnStart = document.getElementById('btn-start');
    if (btnStart) btnStart.addEventListener('click', () => this.startAnimatedSelection());

    const btnReset = document.getElementById('btn-reset');
    if (btnReset) btnReset.addEventListener('click', () => this.setupLevel());

    const btnHelp = document.getElementById('btn-help');
    if (btnHelp) btnHelp.addEventListener('click', () => this.useHelp());
    
    const btnNextLevel = document.getElementById('btn-next-level');
    if (btnNextLevel) {
      btnNextLevel.addEventListener('click', () => {
        this.closeModal();
        this.level++;
        this.setupLevel();
      });
    }

    const btnMenu = document.getElementById('btn-menu');
    if (btnMenu) {
      btnMenu.addEventListener('click', () => {
        this.closeModal();
        this.level = 1;
        this.setupLevel();
      });
    }
  }

  renderThumbnailsGrid() {
    const thumbnailsGrid = document.getElementById('thumbnails-grid');
    if (!thumbnailsGrid) return;
    thumbnailsGrid.innerHTML = '';
    IMAGE_BANK.forEach((imgCanvas) => {
      const img = document.createElement('img');
      img.src = imgCanvas.toDataURL();
      img.className = 'thumb-card';
      thumbnailsGrid.appendChild(img);
    });
  }

  startAnimatedSelection() {
    if (this.isPlaying) return;
    
    const btnStart = document.getElementById('btn-start');
    if (btnStart) btnStart.disabled = true;
    const thumbElements = document.querySelectorAll('.thumb-card');

    let counter = 0;
    const totalCycles = 15;
    const selectedIndex = Math.floor(Math.random() * BANK_SIZE);

    const interval = setInterval(() => {
      thumbElements.forEach(t => t.classList.remove('active'));
      if (thumbElements.length > 0) {
        const currentIdx = counter % BANK_SIZE;
        if (thumbElements[currentIdx]) {
          thumbElements[currentIdx].classList.add('active');
        }
      }
      counter++;

      if (counter > totalCycles) {
        clearInterval(interval);
        this.currentImage = IMAGE_BANK[selectedIndex];
        setTimeout(() => {
          this.startGamePlay();
        }, 300);
      }
    }, 110);
  }

  setupLevel() {
    this.stopTimer();
    this.isPlaying = false;
    const btnHelp = document.getElementById('btn-help');
    if (btnHelp) btnHelp.style.display = 'none';

    const btnStart = document.getElementById('btn-start');
    if (btnStart) btnStart.disabled = false;

    if (this.levelDisplay) this.levelDisplay.innerText = this.level;
    if (this.timerDisplay) {
      this.timerDisplay.innerText = '00:00';
      this.timerDisplay.classList.remove('warning');
    }

    if (this.level >= 3) {
      this.maxTime = 40;
      if (this.timerDisplay) this.timerDisplay.innerText = `00:${this.maxTime}`;
    } else {
      this.maxTime = null;
    }

    const filterNames = ['Escala de Grises', 'Brillo (+30%)', 'Negativo', 'Filtro Múltiple'];
    if (this.filterDisplay) {
      this.filterDisplay.innerText = filterNames[Math.min(this.level - 1, filterNames.length - 1)];
    }

    const thumbElements = document.querySelectorAll('.thumb-card');
    thumbElements.forEach(t => t.classList.remove('active'));

    if (this.boardContainer) {
      this.boardContainer.innerHTML = '<div class="board-placeholder">Haz clic en <strong>"Comenzar"</strong> para sortear la imagen del nivel.</div>';
    }
  }

  startGamePlay() {
    this.isPlaying = true;
    const btnStart = document.getElementById('btn-start');
    if (btnStart) btnStart.disabled = true;

    const btnHelp = document.getElementById('btn-help');
    if (btnHelp) btnHelp.style.display = 'inline-block';

    this.renderBoard(false);
    this.startTimer();
  }

  renderBoard(removeFilters = false) {
    if (!this.boardContainer) return;
    this.boardContainer.innerHTML = '';
    this.pieces = [];

    let cols = 2;
    let rows = this.pieceCount / 2;
    if (this.pieceCount === 4) { cols = 2; rows = 2; }
    else if (this.pieceCount === 6) { cols = 3; rows = 2; }
    else if (this.pieceCount === 8) { cols = 4; rows = 2; }

    this.boardContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    this.boardContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    const pieceWidth = CANVAS_SIZE / cols;
    const pieceHeight = CANVAS_SIZE / rows;

    let index = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = pieceWidth;
        pieceCanvas.height = pieceHeight;
        pieceCanvas.className = 'blocka-piece';

        const ctx = pieceCanvas.getContext('2d');
        ctx.drawImage(this.currentImage, c * pieceWidth, r * pieceHeight, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);

        if (!removeFilters) {
          if (this.level === 1) Filters.grayscale(ctx, pieceWidth, pieceHeight);
          else if (this.level === 2) Filters.brightness(ctx, pieceWidth, pieceHeight);
          else if (this.level === 3) Filters.negative(ctx, pieceWidth, pieceHeight);
          else Filters.mixed(ctx, pieceWidth, pieceHeight, index);
        }

        const angles = [90, 180, 270];
        const initialRotation = removeFilters ? 0 : angles[Math.floor(Math.random() * angles.length)];

        const pieceData = {
          element: pieceCanvas,
          rotation: initialRotation,
          isLocked: false,
          id: index
        };

        this.updatePieceTransform(pieceData);

        pieceCanvas.addEventListener('click', () => this.rotatePiece(pieceData, -90));
        pieceCanvas.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.rotatePiece(pieceData, 90);
        });

        this.boardContainer.appendChild(pieceCanvas);
        this.pieces.push(pieceData);
        index++;
      }
    }
  }

  rotatePiece(piece, angle) {
    if (!this.isPlaying || piece.isLocked) return;

    piece.rotation = (piece.rotation + angle) % 360;
    if (piece.rotation < 0) piece.rotation += 360;

    this.updatePieceTransform(piece);
    this.checkWinCondition();
  }

  updatePieceTransform(piece) {
    piece.element.style.transform = `rotate(${piece.rotation}deg)`;
  }

  useHelp() {
    if (!this.isPlaying) return;

    const wrongPieces = this.pieces.filter(p => p.rotation !== 0 && !p.isLocked);
    if (wrongPieces.length === 0) return;

    const targetPiece = wrongPieces[Math.floor(Math.random() * wrongPieces.length)];
    targetPiece.rotation = 0;
    targetPiece.isLocked = true;
    targetPiece.element.classList.add('locked');
    this.updatePieceTransform(targetPiece);

    this.timer += 5;
    this.updateTimerDisplay();

    this.checkWinCondition();
  }

  startTimer() {
    this.timer = 0;
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.timer++;
      this.updateTimerDisplay();

      if (this.maxTime !== null) {
        const remaining = this.maxTime - this.timer;
        if (remaining <= 10 && this.timerDisplay) {
          this.timerDisplay.classList.add('warning');
        }
        if (remaining <= 0) {
          this.gameOver();
        }
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  updateTimerDisplay() {
    if (!this.timerDisplay) return;
    let displaySeconds = this.timer;
    if (this.maxTime !== null) {
      displaySeconds = Math.max(0, this.maxTime - this.timer);
    }

    const mins = Math.floor(displaySeconds / 60).toString().padStart(2, '0');
    const secs = (displaySeconds % 60).toString().padStart(2, '0');
    this.timerDisplay.innerText = `${mins}:${secs}`;
  }

  checkWinCondition() {
    const isSolved = this.pieces.every(p => p.rotation === 0);
    if (isSolved) {
      this.stopTimer();
      this.isPlaying = false;

      setTimeout(() => {
        this.renderBoard(true);
        this.showModal('¡Nivel Completado!', `Has resuelto la blocka en ${this.timer} segundos.`);
      }, 300);
    }
  }

  gameOver() {
    this.stopTimer();
    this.isPlaying = false;
    this.showModal('¡Tiempo Agotado!', 'No lograste resolver el rompecabezas a tiempo.', false);
  }

  showModal(title, desc, isWin = true) {
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) modalTitle.innerText = title;

    const modalDesc = document.getElementById('modal-desc');
    if (modalDesc) modalDesc.innerText = desc;

    const btnNextLevel = document.getElementById('btn-next-level');
    if (btnNextLevel) btnNextLevel.style.display = isWin ? 'inline-block' : 'none';

    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.add('active');
  }

  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('active');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initImageBank();
  const game = new BlockaGame();
  game.setupLevel();
});