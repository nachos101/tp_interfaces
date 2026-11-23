# Flying Monster — cómo funciona el código

Juego tipo Flappy Bird: un monstruo vuela y esquiva columnas, junta monedas y evita murciélagos. Tiene 3 vidas y un puntaje que cuenta las columnas pasadas.

Todo el código del juego está en esta carpeta (`js/runner/`). Los estilos están en `css/runner/` y las páginas en `pages/runner/`.

---

## 1. Cómo ejecutarlo

El juego usa módulos de JavaScript (`import` / `export`), y los navegadores **no los cargan desde `file://`**. Si abrís `game.html` con doble click se ve el fondo quieto y nada más (error de CORS en la consola). Hay que servirlo por http:

```bash
cd TP5
python3 -m http.server 8000
# abrir http://localhost:8000/pages/runner/index.html
```

También sirve la extensión *Live Server* de VS Code. En GitHub Pages anda sin hacer nada, porque ahí ya se sirve por https.

**Controles:** `Espacio` o click/toque = aletear. Tras perder, lo mismo reinicia.

---

## 2. Mapa de archivos

| Archivo | Qué hace |
|---|---|
| `Main.js` | Punto de entrada. Crea todo, escucha el teclado/mouse, corre el game loop y decide qué pasa al chocar. |
| `Monster.js` | El personaje: física del vuelo, hitbox e invulnerabilidad. |
| `Parallax.js` | Mueve las 4 capas del fondo a distintas velocidades. |
| `ObstaculoSpawner.js` | Crea, mueve y descarta columnas, monedas y murciélagos. Decide dónde van. |
| `Obstaculo.js` | Un par de columnas con un hueco: dibujo y colisión. |
| `Entity.js` | Base de todo lo que no es columna (círculo que se mueve con el escenario). |
| `Item.js` | Entidad que se puede recoger. |
| `Moneda.js` | Moneda animada (extiende `Item`). |
| `Enemigo.js` | Murciélago (extiende `Entity`). |
| `HUD.js` | Puntaje, monedas, vidas, récord y pantalla de Game Over. |
| `index.js` | Botón *Play* de la portada. |
| `InputHandler.js`, `ParallaxLayer.js` | **Vacíos**: se crearon pero no se usan (ver sección 14). |

Otros archivos relacionados:

| Archivo | Para qué |
|---|---|
| `pages/runner/index.html` + `css/runner/portada.css` | Portada con el botón Play. |
| `pages/runner/game.html` | El juego en sí (carga `Main.js`). |
| `css/runner/bg.css` | Escenario y las 4 capas del fondo. |
| `css/runner/runner.css` | El monstruo y su animación de aleteo. |
| `pages/runner.html` | Página del juego dentro del sitio (comentarios, descripción, etc.). |
| `js/inGame.js` | Carga el juego en un `<iframe>` al apretar "Jugar". |
| `pages/home.html` | Slide del carrusel grande que lleva a `runner.html`. |

---

## 3. Cómo se llega al juego

```
home.html (carrusel grande, slide "Flying Monster")
   └─► runner.html            página del sitio con descripción y comentarios
         └─ botón "Jugar" ─► inGame.js carga un <iframe>
               └─► runner/index.html   portada, botón Play (index.js)
                     └─► runner/game.html   el juego (Main.js)
```

`Main.js` solo se carga en `game.html`. En la portada no existen `.game-world` ni `#gameCanvas`, así que cargarlo ahí daría error.

---

## 4. Arquitectura: DOM + canvas

El juego combina HTML/CSS y `<canvas>` según lo que conviene:

```
.game-world (position: absolute, ocupa todo)
 ├─ .bg  ─ 4 divs .layer-4 … .layer-1   z-index 0..3   → fondo parallax (CSS background)
 ├─ <canvas id="gameCanvas">            z-index 4      → columnas, monedas, murciélagos, HUD
 └─ <div id="monster">                  z-index 5      → el monstruo (sprite sheet en CSS)
```

- **Fondo:** `div`s con `background-image` que se desplazan cambiando `background-position-x`.
- **Monstruo:** un `div` con su sprite sheet. El aleteo es una animación CSS (`@keyframes flutter`, 5 cuadros). La posición vertical la mueve JS con `style.top`.
- **Todo lo demás:** se dibuja en el canvas en cada frame (columnas, monedas, murciélagos y HUD). Como el canvas está *detrás* del monstruo, el HUD queda por debajo de él.
- El canvas tiene `pointer-events: none`: los clicks los recibe `.game-world`.
- El canvas se escala con `devicePixelRatio` para verse nítido en pantallas HiDPI (`resizeCanvas()`). Dibujamos siempre en **píxeles CSS**, sin pensar en el DPR.

### Unidades

- Posiciones y tamaños en **píxeles CSS**. Velocidades en **px/s**. Tiempos en **segundos**.
- El origen está arriba a la izquierda; `y` crece hacia abajo.
- El piso ocupa el **10 % inferior** del alto (`FLOOR_RATIO = 0.1`, definido en `Monster.js` y usado también por el spawner).
- Todo se mueve con `posición += velocidad * dt`, donde `dt` son los segundos entre frames. Así el juego va igual de rápido a 60 que a 144 fps.

---

## 5. El game loop (`Main.js`)

`requestAnimationFrame(gameLoop)` llama a `gameLoop` en cada frame:

```
gameLoop(timestamp)
 ├─ dt = segundos desde el frame anterior (máximo 0.05: evita saltos si la pestaña estuvo en segundo plano)
 ├─ update(dt)
 └─ draw()
```

### `update(dt)`, en este orden

1. `monster.update(dt)` — gravedad, límites y parpadeo. **Siempre corre**, incluso en Game Over (el monstruo cae al piso).
2. Si `gameOver`: suma `tiempoGameOver` y **termina** (el escenario queda congelado).
3. `parallax.update(dt, GAME_SPEED)` — mueve el fondo.
4. `spawner.update(dt, GAME_SPEED)` — mueve y crea columnas, monedas y enemigos.
5. **Choque:** si el monstruo no es invulnerable y `spawner.peligroGolpeado(hitbox)` devuelve algo → pierde una vida (sección 8).
6. **Puntaje:** `hud.sumar(spawner.contarPasados(hitbox.x))`.
7. **Monedas:** `hud.sumarMonedas(spawner.recogerMonedas(hitbox))`.

El orden importa: el choque va antes que el puntaje, así que si perdés la última vida en ese frame no sumás el punto.

### `draw()`

```
clearRect
spawner.draw(ctx)   → columnas, luego monedas, luego murciélagos (quedan por delante)
hud.draw(ctx)       → corazones, monedas, puntaje, récord
si gameOver: hud.drawGameOver(ctx)
```

### Estados

| Estado | Cuándo | Qué pasa |
|---|---|---|
| Jugando | normal | todo se mueve; espacio/click = aletear |
| Invulnerable | 1,5 s tras un golpe | el monstruo parpadea y los choques no cuentan |
| Game Over | vidas = 0 | escenario congelado; espacio/click reinicia **pasados 0,5 s** (`ESPERA_REINICIO`, evita reiniciar sin querer con el mismo espacio) |

---

## 6. El personaje (`Monster.js`)

**Física del vuelo**, con un solo estado vertical (`y`) y la velocidad `velocityY`:

```
velocityY += gravity * dt       // gravity = 1600 px/s²
y         += velocityY * dt
jump():  velocityY = -520       // jumpForce: cambia la velocidad de golpe, no la suma
```

Un aleteo sube unos 84 px (`520² / (2·1600)`). Al llegar al techo o al piso, `y` se corta y `velocityY` vuelve a 0. Tocar el piso **no** es un choque.

**Posición horizontal:** fija. Se lee una vez del DOM en el constructor (`this.x`, unos 160 px, definida por el `translateX` del CSS). El monstruo no se mueve a los costados: lo que se mueve es el mundo hacia la izquierda.

**Hitbox:** un rectángulo de **44×36 px** centrado en `(x, y)`, más chico que el sprite (128 px visuales) para que no parezca que chocás con algo que no tocaste. Lo devuelve `getHitbox()` como `{x, y, w, h}`.

**Invulnerabilidad:** `herir()` pone `invulnerable = 1.5` (segundos). `update()` lo va bajando y alterna la opacidad entre 1 y 0,3 diez veces por segundo. Se hace en JS y no en CSS porque la animación CSS del aleteo usa la propiedad `animation` y se pisaría.

**Aleteo visual:** `jump()` también reinicia la animación CSS (saca la clase `is-flapping`, fuerza un reflow con `offsetWidth` y la vuelve a poner).

---

## 7. Generación del mundo (`ObstaculoSpawner.js`)

Es el archivo más grande. Cada obstáculo nace en el borde derecho y se mueve hacia la izquierda a `GAME_SPEED` (180 px/s), igual que la capa más cercana del fondo.

### Cuándo nace cada obstáculo

`this.distancia` es una **cuenta regresiva en píxeles**. En cada frame se le resta `velocidad * dt`. Cuando llega a 0:

1. Se sortea la `separacion` hasta el siguiente (280–360 px, unos 1,5–2 s).
2. Se crea el obstáculo.
3. `distancia += separacion` (se **suma**, no se reinicia, así el sobrante del frame no se pierde y la separación es exacta sin importar los fps).

El primero aparece al instante porque `distancia` empieza en 0.

### Tamaño y altura del hueco

- **Hueco:** `max(HUECO_MIN, HUECO_INICIAL − tiempo·3 + azar(±20))`. Empieza en 240 px y se achica 3 px por segundo jugado hasta 150 px. El `max` va *después* del azar, así nunca baja de 150.
- **Centro del hueco:** se sortea entre el techo y el piso con un margen, y **no más de 180 px de diferencia** con el hueco anterior (`MAX_CAMBIO_ALTURA`). Sin ese límite podría haber un hueco arriba de todo y el siguiente abajo de todo, y no daría el tiempo para llegar.
- **Centro planificado:** al crear un obstáculo ya se sortea la altura del *siguiente* (`centroPlaneado`). Hace falta para ubicar bien a los enemigos (ver abajo).

### Tramo libre y monedas

El **tramo libre** es el espacio entre el borde derecho de un obstáculo y el izquierdo del siguiente. Su punto medio es:

```
xMedio = obstaculo.x + (ancho + separacion) / 2
```

Las monedas se ponen ahí: con 75 % de probabilidad, un grupo de 1 a 3, separadas 50 px, a una altura cercana (±70 px) al hueco del obstáculo que acaba de nacer. Así siempre se llega a ellas y quedan en el camino hacia el hueco siguiente.

### Enemigos (murciélagos)

Aparecen después de 8 s de juego, con 30 % de probabilidad por tramo. Son más rápidos que el escenario (+60 px/s), y esa velocidad extra es la parte delicada:

**Sincronización.** El murciélago sale con la distancia calculada para cruzar la posición del monstruo justo cuando el centro del tramo libre pasa por ahí:

```
segundos    = (xMedio − xJugador) / velocidad
x_de_salida = xMedio + VELOCIDAD_EXTRA × segundos
```

Así, cuando el murciélago llega al monstruo, hay una columna a unos 95 px de cada lado como mínimo, y nunca está dentro de un hueco angosto.

**Corredor.** El murciélago nunca se pone en la franja de alturas entre un hueco y el siguiente (por donde vuela el jugador), más 90 px a cada lado. Se elige al azar entre las zonas libres de arriba y de abajo; si no hay lugar en ninguna, ese tramo no lleva murciélago. Con esto casi nunca obliga a elegir entre esquivarlo y entrar al hueco siguiente.

### Mantenimiento

- Lo que sale por la izquierda se descarta (`estaFuera()`), así las listas no crecen.
- `reset()` vacía todo y reinicia `tiempo`, `distancia` y `centroPlaneado` (para reiniciar la partida).
- `resize()` ajusta las alturas si cambia el tamaño de la ventana.
- Las imágenes de columnas se cargan una sola vez en el constructor. Las rutas usan `import.meta.url`, así son relativas al archivo JS y no a la página.

---

## 8. Colisiones

Hay dos tipos de colisión, ambas contra el hitbox rectangular del monstruo.

**Columnas — rectángulo contra rectángulo (`Obstaculo.colisiona`).** Hay choque si el monstruo coincide en *x* con la columna (que se achica 8 % por lado porque el borde de la imagen tiene aire) y **no está del todo dentro del hueco** en *y*. Como la columna de arriba llega hasta el techo y la de abajo hasta el piso, alcanza con comparar contra el hueco: no hace falta calcular los dos rectángulos de las columnas.

**Monedas y murciélagos — círculo contra rectángulo (`Entity.colisiona`).** Se busca el punto del rectángulo más cercano al centro del círculo; si está a menos de `radio`, se tocan.

| Entidad | Radio de colision |
|---|---|
| Moneda | 18 px |
| Murciélago | 16 px (el dibujo mide 64 px) |

### Qué pasa al chocar

En `Main.update`, solo si `!monster.esInvulnerable`:

```
golpe = spawner.peligroGolpeado(hitbox)   // primer obstáculo o enemigo tocado que aún no hizo daño
si golpe:
    golpe.golpeado = true                  // no lastima dos veces
    hud.perderVida()
    si sinVidas → Game Over (guarda récord)
    si no       → monster.herir()          // parpadeo 1,5 s
```

El flag `golpeado` evita que una misma columna siga quitando vidas aunque la invulnerabilidad termine mientras el monstruo todavía la toca.

### Puntaje y monedas

- **Puntaje:** +1 por cada obstáculo cuyo borde derecho quedó a la izquierda del monstruo (`contarPasados`). El flag `pasado` hace que cuente una sola vez. Si chocás con una columna pero te quedan vidas, igual cuenta como pasada.
- **Monedas:** se cuentan **aparte** del puntaje. Cada moneda tocada se saca del juego (`recogerMonedas`). Si querés que sumen al puntaje, es una línea en `Main.js`.

---

## 9. Entidades (`Entity.js`, `Item.js`, `Moneda.js`, `Enemigo.js`)

```
Entity            x, y (centro), radio · update · estaFuera · colisiona · draw
 ├─ Item          + recogido
 │   └─ Moneda    sprite animado, ícono para el HUD
 └─ Enemigo       + golpeado, vaivén vertical, sprite animado
```

`Entity` hace todo el trabajo común. Las subclases solo agregan su comportamiento y su dibujo:

| | Sprite | Animación |
|---|---|---|
| **Moneda** | `coinsheet.png`, 9 cuadros en fila | 12 fps, escala ×1,5. Cada moneda arranca en un punto distinto para que no giren sincronizadas |
| **Enemigo** | `32x32-bat-sprite.png`, grilla 4×4 de 32 px; usa la fila 3 (mira a la izquierda) | 4 cuadros a 10 fps, escala ×2. La altura es `yBase + sin(t·3)·25` |

Las imágenes se cargan de forma *perezosa*, una sola vez, la primera vez que se dibuja. En el primer frame no se ve nada, pero el murciélago o la moneda todavía están fuera de pantalla.

`Obstaculo` no extiende `Entity` porque no es un círculo: es un par de columnas con una geometría y una colisión propias. Para dibujarlas, si la imagen (247×1036 px) es más corta que la columna necesaria, estira un tramo liso del fuste. Como son rayas verticales, no se nota.

---

## 10. HUD (`HUD.js`)

El HUD guarda el estado de la partida (`puntaje`, `monedas`, `vidas`) y lo dibuja:

- **Arriba a la izquierda:** 3 corazones (`hearts.png`, cuadro 0). Los perdidos se dibujan al 25 % de opacidad. Debajo, la moneda con "x N".
- **Arriba al centro:** el puntaje, grande.
- **Arriba a la derecha:** `Mejor: N`.
- **Game Over:** título, puntaje, monedas y "¡Nuevo récord!" si lo superaste.

**Récord:** se guarda en `localStorage` con la clave `flyingMonster.mejorPuntaje`. Está protegido con `try/catch`: si el navegador no permite almacenar (modo privado, por ejemplo), el juego anda igual pero sin récord guardado.

Los textos se dibujan con borde blanco para que se lean sobre cualquier fondo.

---

## 11. Fondo parallax (`Parallax.js`)

Cuatro capas (`layer-4` la más lejana → `layer-1` la más cercana) que se desplazan a una fracción de la velocidad del mundo:

| Capa | Velocidad (× `GAME_SPEED`) |
|---|---|
| `layer-4` | 0,15 |
| `layer-3` | 0,30 |
| `layer-2` | 0,60 |
| `layer-1` | 1,00 |

Cada capa guarda su `offset`, que crece con `velocidad × dt` y se reduce con `% tileWidth` para que no crezca sin límite. Se aplica como `background-position-x = -offset`.

`tileWidth = alto × 2`, porque las imágenes tienen relación 2:1 y el CSS las muestra con `background-size: auto 100%`. La capa 3 es de otra proporción (16:9, se agregó después), por eso usa `112.5 %` de alto y queda igual de ancha. En `resize()` se recalcula `tileWidth`.

---

## 12. Dificultad: dónde ajustarla

Todos los números están como constantes al principio de cada archivo.

| Qué | Constante | Valor | Archivo |
|---|---|---|---|
| Velocidad del mundo | `GAME_SPEED` | 180 px/s | `Main.js` |
| Gravedad / fuerza de aleteo | `gravity` / `jumpForce` | 1600 / −520 | `Monster.js` |
| Vidas iniciales | `VIDAS_INICIALES` | 3 | `HUD.js` |
| Invulnerabilidad tras un golpe | `TIEMPO_INVULNERABLE` | 1,5 s | `Monster.js` |
| Hueco al empezar / mínimo | `HUECO_INICIAL` / `HUECO_MIN` | 240 / 150 px | `ObstaculoSpawner.js` |
| Cuánto se achica el hueco | `ACHICAR_POR_SEG` | 3 px/s | `ObstaculoSpawner.js` |
| Separación entre columnas | `DISTANCIA_MIN` / `MAX` | 280 / 360 px | `ObstaculoSpawner.js` |
| Cambio máximo de altura | `MAX_CAMBIO_ALTURA` | 180 px | `ObstaculoSpawner.js` |
| Probabilidad de monedas | `PROB_MONEDAS` | 0,75 | `ObstaculoSpawner.js` |
| Probabilidad de murciélago | `PROB_ENEMIGOS` | 0,3 | `ObstaculoSpawner.js` |
| Cuándo aparece el primero | `TIEMPO_PRIMER_ENEMIGO` | 8 s | `ObstaculoSpawner.js` |
| Margen del corredor | `DISTANCIA_CORREDOR` | 90 px | `ObstaculoSpawner.js` |
| Velocidad extra del murciélago | `VELOCIDAD_EXTRA_ENEMIGO` | 60 px/s | `Enemigo.js` |

---

## 13. Decisiones de diseño

- **Por qué `dt`:** todo el movimiento depende del tiempo transcurrido, no de los frames, así el juego no se acelera en pantallas de 144 Hz.
- **Por qué el spawner cuenta píxeles y no segundos:** la separación entre columnas queda fija aunque cambie la velocidad.
- **Por qué hay límite de cambio de altura entre huecos:** un hueco arriba y el siguiente abajo, a 1,5 s, es físicamente imposible de alcanzar. Con 180 px siempre se llega.
- **Por qué el corredor de los murciélagos:** con alturas al azar, esquivar un murciélago y entrar al hueco siguiente competían por unos 0,5 s y el juego era injusto. Se probó con un bot: con el corredor, uno que **ignora** a los murciélagos recibe pocos golpes y uno que los esquiva casi ninguno.
- **Por qué el hitbox es más chico que el sprite:** para que cada choque se sienta merecido.
- **Por qué el parpadeo está en JS:** la animación CSS del aleteo ya usa la propiedad `animation` y se pisarían.

---

## 14. Pendientes y cosas a saber

- `InputHandler.js` y `ParallaxLayer.js` están **vacíos**. `Main.js` maneja el teclado directamente y `Parallax.js` maneja sus capas como objetos simples. Se pueden borrar, o mover la lógica ahí si el enunciado pide esas clases.
- `ObstaculoSpawner` creció: maneja obstáculos, monedas y enemigos. Si sigue creciendo, conviene separarlo, pero comparten el cálculo del tramo libre.
- El sprite `hearts.png` es un corazón girando de 6 cuadros; solo se usa el primero. Los demás servirían para un ítem de vida extra.
- Al abrir `runner.html` aparece en consola un error en `api_games.js` (el carrusel de la API). No es del juego, pasa igual en `inGame.html` y `blocka.html`.
- El juego no tiene sonido ni pausa.
