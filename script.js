// ==================== VARIABLES GLOBALES ====================
const fondoCanvas = document.getElementById('fondoCanvas');
const ctxFondo = fondoCanvas.getContext('2d');
const corazonCanvas = document.getElementById('corazonCanvas');
const ctxCorazon = corazonCanvas.getContext('2d');

let ancho, alto;
let estrellas = [];
let corazones = [];

// ==================== REDIMENSIONAR CANVAS ====================
function redimensionar() {
    ancho = window.innerWidth;
    alto = window.innerHeight;
    fondoCanvas.width = ancho;
    fondoCanvas.height = alto;
    corazonCanvas.width = ancho;
    corazonCanvas.height = alto;
}

window.addEventListener('resize', redimensionar);
redimensionar();

// ==================== ESTRELLAS DE FONDO ====================
function crearEstrellas() {
    estrellas = [];
    for (let i = 0; i < 180; i++) {
        estrellas.push({
            x: Math.random() * ancho,
            y: Math.random() * alto,
            r: Math.random() * 2 + 0.5,
            fase: Math.random() * Math.PI * 2
        });
    }
}
crearEstrellas();

// ==================== CORAZONES FLOTANTES ====================
function crearCorazon() {
    return {
        x: Math.random() * ancho,
        y: alto + 20,
        tam: Math.random() * 10 + 8,
        vel: Math.random() * 1 + 0.5,
        balanceo: Math.random() * Math.PI * 2,
        velBalanceo: Math.random() * 0.03 + 0.02,
        alpha: Math.random() * 0.5 + 0.3
    };
}

for (let i = 0; i < 15; i++) {
    const c = crearCorazon();
    c.y = Math.random() * alto;
    corazones.push(c);
}

// ==================== DIBUJAR FONDO ====================
let tiempo = 0;

function dibujarFondo() {
    tiempo += 0.016;

    // Degradado
    const grad = ctxFondo.createLinearGradient(0, 0, 0, alto);
    grad.addColorStop(0, '#0a0f28');
    grad.addColorStop(1, '#280a3c');
    ctxFondo.fillStyle = grad;
    ctxFondo.fillRect(0, 0, ancho, alto);

    // Estrellas
    estrellas.forEach(e => {
        const brillo = 120 + 135 * Math.sin(tiempo * 3 + e.fase);
        const r = Math.max(0, Math.min(255, brillo));
        ctxFondo.fillStyle = `rgb(${r},${r},255)`;
        ctxFondo.beginPath();
        ctxFondo.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctxFondo.fill();
    });

    // Corazones flotantes
    corazones.forEach(c => {
        c.y -= c.vel;
        c.balanceo += c.velBalanceo;
        c.x += Math.sin(c.balanceo) * 0.8;

        if (c.y < -30) {
            Object.assign(c, crearCorazon());
        }

        ctxFondo.fillStyle = `rgba(255, 105, 180, ${c.alpha})`;
        // Dibujar corazón (2 círculos + triángulo)
        ctxFondo.beginPath();
        ctxFondo.arc(c.x - c.tam * 0.4, c.y - c.tam * 0.3, c.tam * 0.55, 0, Math.PI * 2);
        ctxFondo.arc(c.x + c.tam * 0.4, c.y - c.tam * 0.3, c.tam * 0.55, 0, Math.PI * 2);
        ctxFondo.fill();
        ctxFondo.beginPath();
        ctxFondo.moveTo(c.x - c.tam, c.y - c.tam * 0.1);
        ctxFondo.lineTo(c.x + c.tam, c.y - c.tam * 0.1);
        ctxFondo.lineTo(c.x, c.y + c.tam);
        ctxFondo.closePath();
        ctxFondo.fill();
    });

    requestAnimationFrame(dibujarFondo);
}

dibujarFondo();

// ==================== CAMBIO DE PANTALLAS ====================
function mostrarPantalla(id) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    document.getElementById(id).classList.add('activa');
}

document.getElementById('btnAbrir').addEventListener('click', () => {
    mostrarPantalla('animacion');

    // Activar animación
    setTimeout(() => {
        document.getElementById('solapaAnim').classList.add('abierta');
        document.getElementById('cartaSaliendo').classList.add('subida');
        document.getElementById('avisoAnim').classList.add('visible');
    }, 100);

    // Cambiar a la carta
    setTimeout(() => {
        mostrarPantalla('carta');
    }, 2300);
});

document.getElementById('btnTeAmo').addEventListener('click', () => {
    mostrarPantalla('corazonPantalla');
    iniciarCorazon3D();
});

// ==================== CORAZÓN 3D CON DISPERSIÓN ====================
let corazonIniciado = false;
let particulasCorazon = [];
let anguloRotacion = 0;
let tiempoInicioCorazon = 0;
let faseCorazon = "girando"; // "girando" -> "dispersando" -> "fotos"
const DURACION_CORAZON = 5000; // 5 segundos
const DURACION_DISPERSION = 2500; // 2.5 segundos para dispersarse

function generarParticulasCorazon(n) {
    const arr = [];
    for (let i = 0; i < n; i++) {
        const t = Math.random() * Math.PI * 2;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        let z = (Math.random() - 0.5) * 10;

        const escala = 0.8 + Math.random() * 0.4;
        x *= escala;
        y *= escala;
        x += (Math.random() - 0.5) * 0.6;
        y += (Math.random() - 0.5) * 0.6;

        arr.push({
            x, y, z,
            // Dirección de dispersión
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            vz: (Math.random() - 0.5) * 20,
            tamBase: Math.random() * 1.5 + 1.5
        });
    }
    return arr;
}

function iniciarCorazon3D() {
    if (corazonIniciado) return;
    corazonIniciado = true;
    particulasCorazon = generarParticulasCorazon(1800);
    tiempoInicioCorazon = performance.now();
    faseCorazon = "girando";
    animarCorazon();
}

function animarCorazon() {
    const ahora = performance.now();
    const tiempoTranscurrido = ahora - tiempoInicioCorazon;

    ctxCorazon.clearRect(0, 0, ancho, alto);

    // Fondo espacial
    const grad = ctxCorazon.createLinearGradient(0, 0, 0, alto);
    grad.addColorStop(0, '#0a0f28');
    grad.addColorStop(1, '#280a3c');
    ctxCorazon.fillStyle = grad;
    ctxCorazon.fillRect(0, 0, ancho, alto);

    // Estrellas de fondo
    estrellas.forEach(e => {
        const brillo = 120 + 135 * Math.sin(tiempo * 3 + e.fase);
        const r = Math.max(0, Math.min(255, brillo));
        ctxCorazon.fillStyle = `rgb(${r},${r},255)`;
        ctxCorazon.beginPath();
        ctxCorazon.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctxCorazon.fill();
    });

    // Lógica de fases
    if (tiempoTranscurrido > DURACION_CORAZON && faseCorazon === "girando") {
        faseCorazon = "dispersando";
        // Ocultar el título "Te Amo"
        document.getElementById('tituloFinal').style.opacity = '0';
        document.getElementById('tituloFinal').style.transition = 'opacity 1s';
    }

    if (faseCorazon === "dispersando" && tiempoTranscurrido > DURACION_CORAZON + DURACION_DISPERSION) {
        faseCorazon = "fotos";
        // Mostrar fotos
        document.getElementById('fotosFinales').classList.add('visible');
        document.querySelectorAll('.foto-final').forEach(f => f.classList.add('visible'));
    }

    // Progreso de dispersión (0 a 1)
    let progresoDisp = 0;
    if (faseCorazon === "dispersando" || faseCorazon === "fotos") {
        progresoDisp = Math.min(1, (tiempoTranscurrido - DURACION_CORAZON) / DURACION_DISPERSION);
    }

    // Latido
    const latido = 1 + 0.05 * Math.sin(tiempo * 3);
    const escala = Math.min(ancho, alto) / 60 * latido;
    const cx = ancho / 2;
    const cy = alto / 2;

    anguloRotacion += 0.02;

    // Ordenar por Z
    const ordenadas = [...particulasCorazon].sort((a, b) => {
        const za = a.x * Math.sin(anguloRotacion) + a.z * Math.cos(anguloRotacion);
        const zb = b.x * Math.sin(anguloRotacion) + b.z * Math.cos(anguloRotacion);
        return za - zb;
    });

    ordenadas.forEach(p => {
        let xRot = p.x * Math.cos(anguloRotacion) - p.z * Math.sin(anguloRotacion);
        let zRot = p.x * Math.sin(anguloRotacion) + p.z * Math.cos(anguloRotacion);
        let yRot = p.y;

        // Aplicar dispersión: mover cada partícula hacia su dirección con velocidad creciente
        const factorDisp = progresoDisp * progresoDisp; // ease-in
        xRot += p.vx * factorDisp * 15;
        yRot += p.vy * factorDisp * 15;
        zRot += p.vz * factorDisp * 15;

        const factor = 200 / (200 + zRot);
        const px = cx + xRot * escala * factor;
        const py = cy - yRot * escala * factor;

        const tam = Math.max(0.5, p.tamBase * factor * 0.8);
        const brillo = Math.floor(150 + 105 * Math.sin(tiempo * 4 + p.x));

        // Alpha se reduce con la dispersión
        const alpha = Math.max(0, 1 - progresoDisp * 0.9);

        ctxCorazon.fillStyle = `rgba(0,${Math.min(255, brillo)},255,${alpha})`;
        ctxCorazon.beginPath();
        ctxCorazon.arc(px, py, tam, 0, Math.PI * 2);
        ctxCorazon.fill();
    });

    requestAnimationFrame(animarCorazon);
}
