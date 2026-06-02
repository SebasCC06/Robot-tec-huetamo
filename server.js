const express = require("express");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// -------------------------------
// ESTADO ACTUAL
// -------------------------------

let comandoActual  = "detener";
let velocidadActual = 50;

// -------------------------------
// PAGINA PRINCIPAL
// -------------------------------

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta charset="UTF-8">
  <title>Robot ESP32</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;900&family=Exo+2:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg:      #080c14;
      --panel:   rgba(255,255,255,0.04);
      --border:  rgba(255,255,255,0.09);
      --green:   #00e676;
      --blue:    #448aff;
      --orange:  #ff9100;
      --purple:  #d500f9;
      --pink:    #ff69b4;
      --red:     #ff1744;
      --text:    #e8eaf6;
      --muted:   rgba(255,255,255,0.4);
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Exo 2', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow-x: hidden;
    }
    body::before {
      content: '';
      position: fixed; inset: 0;
      background-image:
        linear-gradient(rgba(68,138,255,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(68,138,255,0.06) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
      z-index: 0;
    }
    body::after {
      content: '';
      position: fixed; inset: 0;
      background: repeating-linear-gradient(
        0deg, transparent, transparent 2px,
        rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px
      );
      pointer-events: none;
      z-index: 0;
    }
    .screen {
      position: relative; z-index: 1;
      width: 100%; max-width: 480px;
      padding: 24px 20px 36px;
      display: none;
      animation: fadeIn .35s ease;
    }
    .screen.active { display: flex; flex-direction: column; align-items: center; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .brand { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 28px; }
    .logo-wrap { width: 150px; height: 150px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .logo-wrap img { width: 100%; height: 100%; object-fit: contain; }
    .logo-wrap .logo-fallback { font-size: 38px; display: none; }
    .brand h1 {
      font-family: 'Orbitron', monospace;
      font-size: clamp(1.5rem, 5vw, 2rem);
      letter-spacing: 4px;
      background: linear-gradient(90deg, var(--blue), var(--green));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .conn-badge {
      display: flex; align-items: center; gap: 8px;
      background: var(--panel); border: 1px solid var(--border);
      border-radius: 20px; padding: 6px 16px;
      font-size: .75rem; letter-spacing: 1px;
      color: var(--muted); margin-bottom: 28px;
    }
    .conn-dot { width: 8px; height: 8px; border-radius: 50%; background: #555; transition: background .4s, box-shadow .4s; }
    .conn-dot.online  { background: var(--green); box-shadow: 0 0 8px var(--green); }
    .conn-dot.offline { background: var(--red);   box-shadow: 0 0 8px var(--red); }
    .menu-btn {
      width: 100%; max-width: 320px; height: 62px; margin: 10px 0;
      font-family: 'Orbitron', monospace; font-size: .85rem; letter-spacing: 3px;
      border: 1px solid; border-radius: 8px; background: var(--panel);
      cursor: pointer; position: relative; overflow: hidden;
      transition: transform .15s, box-shadow .15s;
    }
    .menu-btn::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity .2s; }
    .menu-btn:hover { transform: translateY(-2px); }
    .menu-btn:hover::before { opacity: 1; }
    .menu-btn:active { transform: scale(.97); }
    .menu-btn.green { color: var(--green); border-color: var(--green); }
    .menu-btn.green::before { background: linear-gradient(135deg,rgba(0,230,118,.15),transparent); }
    .menu-btn.green:hover { box-shadow: 0 0 18px rgba(0,230,118,.45); }
    .menu-btn.blue  { color: var(--blue);  border-color: var(--blue); }
    .menu-btn.blue::before  { background: linear-gradient(135deg,rgba(68,138,255,.15),transparent); }
    .menu-btn.blue:hover  { box-shadow: 0 0 18px rgba(68,138,255,.45); }
    .sec-title {
      font-family: 'Orbitron', monospace;
      font-size: clamp(.9rem, 3vw, 1.1rem);
      letter-spacing: 4px; color: var(--blue);
      text-transform: uppercase; margin-bottom: 28px; text-align: center;
    }
    .sec-title::after {
      content: ''; display: block; height: 2px; width: 60px;
      background: linear-gradient(90deg, var(--blue), transparent);
      margin: 8px auto 0;
    }
    .dpad {
      display: grid;
      grid-template-columns: repeat(3, 82px);
      grid-template-rows: repeat(3, 82px);
      gap: 8px; margin-bottom: 22px;
    }
    @media(max-width:400px) {
      .dpad { grid-template-columns: repeat(3, 68px); grid-template-rows: repeat(3, 68px); gap: 6px; }
    }
    .dpad-btn {
      border: none; border-radius: 10px; font-size: 26px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform .1s, filter .1s;
      user-select: none; -webkit-tap-highlight-color: transparent;
      position: relative; overflow: hidden;
    }
    .dpad-btn:active { transform: scale(.88); filter: brightness(1.2); }
    .dpad-btn.empty  { background: transparent; cursor: default; pointer-events: none; }
    .dpad-btn.holding { filter: brightness(1.35); transform: scale(.92); }
    .dpad-btn.up     { grid-column:2; grid-row:1; background:linear-gradient(145deg,#00c853,#00e676); box-shadow:0 4px 14px rgba(0,200,83,.4); color:white; }
    .dpad-btn.left   { grid-column:1; grid-row:2; background:linear-gradient(145deg,#1565c0,#448aff); box-shadow:0 4px 14px rgba(68,138,255,.4); color:white; }
    .dpad-btn.center { grid-column:2; grid-row:2; background:linear-gradient(145deg,#b71c1c,#ff1744); box-shadow:0 4px 14px rgba(255,23,68,.4); font-size:14px; font-family:'Orbitron',monospace; font-weight:900; letter-spacing:1px; color:white; }
    .dpad-btn.right  { grid-column:3; grid-row:2; background:linear-gradient(145deg,#4a148c,#d500f9); box-shadow:0 4px 14px rgba(213,0,249,.4); color:white; }
    .dpad-btn.down   { grid-column:2; grid-row:3; background:linear-gradient(145deg,#880e4f,#ff69b4); box-shadow:0 4px 14px rgba(255,105,180,.4); color:white; }
    /* Speed slider */
    .speed-wrap { width: 100%; max-width: 280px; margin-bottom: 18px; }
    .speed-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .speed-label { font-family: 'Orbitron', monospace; font-size: .7rem; letter-spacing: 2px; color: var(--muted); }
    .speed-value { font-family: 'Orbitron', monospace; font-size: .85rem; font-weight: 700; color: var(--green); }
    .speed-track { position: relative; height: 36px; display: flex; align-items: center; }
    .speed-track input[type=range] {
      -webkit-appearance: none; appearance: none;
      width: 100%; height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px; outline: none;
      position: relative; z-index: 2; cursor: pointer;
    }
    .speed-track input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 22px; height: 22px; border-radius: 50%;
      background: var(--green); box-shadow: 0 0 10px rgba(0,230,118,.6);
      cursor: pointer; transition: transform .15s;
    }
    .speed-track input[type=range]::-webkit-slider-thumb:active { transform: scale(1.2); }
    .speed-fill {
      position: absolute; left: 0; top: 50%; transform: translateY(-50%);
      height: 6px; background: linear-gradient(90deg, var(--blue), var(--green));
      border-radius: 3px; pointer-events: none; z-index: 1; transition: width .05s;
    }
    .speed-ticks { display: flex; justify-content: space-between; margin-top: 4px; font-size: .6rem; letter-spacing: 1px; color: var(--muted); }
    .status-bar {
      background: var(--panel); border: 1px solid var(--border);
      border-radius: 8px; padding: 10px 20px;
      font-size: .8rem; letter-spacing: 2px; color: var(--muted);
      margin-bottom: 28px; min-width: 260px; text-align: center;
    }
    .status-bar span { color: var(--green); font-weight: 600; }
    .back-btn {
      background: transparent; border: 1px solid var(--border);
      border-radius: 8px; color: var(--muted);
      font-family: 'Exo 2', sans-serif; font-size: .8rem;
      letter-spacing: 2px; padding: 10px 28px; cursor: pointer;
      text-transform: uppercase; transition: color .2s, border-color .2s;
    }
    .back-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.3); }
    .collab-section { width: 100%; margin-bottom: 20px; }
    .collab-section h2 {
      font-family: 'Orbitron', monospace; font-size: .72rem;
      letter-spacing: 3px; color: var(--muted); text-transform: uppercase;
      margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid var(--border);
    }
    .collab-card {
      display: flex; align-items: center; gap: 14px;
      background: var(--panel); border: 1px solid var(--border);
      border-radius: 10px; padding: 11px 16px; margin-bottom: 7px;
      transition: border-color .2s, transform .15s;
    }
    .collab-card:hover { border-color: rgba(68,138,255,.4); transform: translateX(4px); }
    .collab-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; font-family: 'Orbitron', monospace; flex-shrink: 0;
    }
    .av-green  { background:rgba(0,230,118,.15);  color:var(--green);  border:1px solid var(--green); }
    .av-blue   { background:rgba(68,138,255,.15); color:var(--blue);   border:1px solid var(--blue); }
    .av-purple { background:rgba(213,0,249,.15);  color:var(--purple); border:1px solid var(--purple); }
    .av-orange { background:rgba(255,145,0,.15);  color:var(--orange); border:1px solid var(--orange); }
    .av-pink   { background:rgba(255,105,180,.15);color:var(--pink);   border:1px solid var(--pink); }
    .collab-name { font-weight: 600; font-size: .88rem; }
    .collab-role { font-size: .68rem; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
    #toast {
      position: fixed; bottom: 28px; left: 50%;
      transform: translateX(-50%) translateY(60px);
      background: rgba(10,20,40,.95); border: 1px solid var(--border);
      border-radius: 8px; padding: 10px 24px;
      font-size: .8rem; letter-spacing: 1px; color: var(--text);
      z-index: 100; opacity: 0; transition: transform .3s, opacity .3s; white-space: nowrap;
    }
    #toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
  </style>
</head>
<body>

<!-- MENU -->
<div id="menuScreen" class="screen active">
  <div class="brand">
    <div class="logo-wrap">
      <img src="logo.png" alt="Logo"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <span class="logo-fallback">🤖</span>
    </div>
    <h1>Bienvenido</h1>
  </div>
  <div class="conn-badge">
    <div class="conn-dot" id="connDot"></div>
    <span id="connText">VERIFICANDO...</span>
  </div>
  <button class="menu-btn green" onclick="ir('controlScreen')">▶ &nbsp; CONTROL</button>
  <button class="menu-btn blue"  onclick="ir('collabScreen')">◈ &nbsp; COLABORADORES</button>
</div>

<!-- CONTROL -->
<div id="controlScreen" class="screen">
  <div class="sec-title">CONTROL ROBOT</div>
  <div class="dpad">
    <div class="dpad-btn empty"></div>
    <button class="dpad-btn up"
      ontouchstart="iniciarMantener(event,'adelante',this)" ontouchend="soltarMantener(event)"
      onmousedown="iniciarMantener(event,'adelante',this)"  onmouseup="soltarMantener(event)" onmouseleave="soltarMantener(event)">▲</button>
    <div class="dpad-btn empty"></div>

    <button class="dpad-btn left"
      ontouchstart="iniciarMantener(event,'izquierda',this)" ontouchend="soltarMantener(event)"
      onmousedown="iniciarMantener(event,'izquierda',this)"  onmouseup="soltarMantener(event)" onmouseleave="soltarMantener(event)">◀</button>
    <button class="dpad-btn center"
      ontouchstart="iniciarMantener(event,'detener',this)" ontouchend="soltarMantener(event)"
      onmousedown="iniciarMantener(event,'detener',this)"  onmouseup="soltarMantener(event)" onmouseleave="soltarMantener(event)">STOP</button>
    <button class="dpad-btn right"
      ontouchstart="iniciarMantener(event,'derecha',this)" ontouchend="soltarMantener(event)"
      onmousedown="iniciarMantener(event,'derecha',this)"  onmouseup="soltarMantener(event)" onmouseleave="soltarMantener(event)">▶</button>

    <div class="dpad-btn empty"></div>
    <button class="dpad-btn down"
      ontouchstart="iniciarMantener(event,'atras',this)" ontouchend="soltarMantener(event)"
      onmousedown="iniciarMantener(event,'atras',this)"  onmouseup="soltarMantener(event)" onmouseleave="soltarMantener(event)">▼</button>
    <div class="dpad-btn empty"></div>
  </div>

  <div class="speed-wrap">
    <div class="speed-header">
      <span class="speed-label">VELOCIDAD</span>
      <span class="speed-value" id="speedVal">50%</span>
    </div>
    <div class="speed-track">
      <input type="range" id="speedSlider" min="0" max="100" value="50"
             oninput="actualizarVelocidad(this.value)">
      <div class="speed-fill" id="speedFill" style="width:50%"></div>
    </div>
    <div class="speed-ticks"><span>LENTO</span><span>MEDIO</span><span>RÁPIDO</span></div>
  </div>

  <div class="status-bar">
    COMANDO: <span id="cmdActual">DETENER</span>
  </div>
  <button class="back-btn" onclick="ir('menuScreen')">← VOLVER</button>
</div>

<!-- COLABORADORES -->
<div id="collabScreen" class="screen">
  <div class="sec-title">COLABORADORES</div>
  <div class="collab-section">
    <h2>Alumnos</h2>
    <div class="collab-card"><div class="collab-avatar av-green">SC</div><div><div class="collab-name">Sebastian Salvador Cortes Castillo</div><div class="collab-role">Alumno · Robótica</div></div></div>
    <div class="collab-card"><div class="collab-avatar av-blue">LM</div><div><div class="collab-name">Luis Angel Mejia Santibañez</div><div class="collab-role">Alumno · Robótica</div></div></div>
    <div class="collab-card"><div class="collab-avatar av-orange">AB</div><div><div class="collab-name">Armando Betancourt Silva</div><div class="collab-role">Alumno · Robótica</div></div></div>
    <div class="collab-card"><div class="collab-avatar av-purple">GR</div><div><div class="collab-name">Gahel Reynoso Franco</div><div class="collab-role">Alumno · Robótica</div></div></div>
    <div class="collab-card"><div class="collab-avatar av-pink">CC</div><div><div class="collab-name">Critopher Cisneros Marin</div><div class="collab-role">Alumno · Robótica</div></div></div>
  </div>
  <div class="collab-section">
    <h2>Docentes</h2>
    <div class="collab-card"><div class="collab-avatar av-blue">ML</div><div><div class="collab-name">Manuel Loeza González</div><div class="collab-role">Docente · Encargado</div></div></div>
    <div class="collab-card"><div class="collab-avatar av-purple">EC</div><div><div class="collab-name">Edgar de Jesús Chávez Damián</div><div class="collab-role">Docente · Encargado</div></div></div>
  </div>
  <button class="back-btn" onclick="ir('menuScreen')">← VOLVER</button>
</div>

<div id="toast"></div>

<script>
  function ir(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  let toastTimer;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  let velocidad = 50;
  function actualizarVelocidad(val) {
    velocidad = parseInt(val);
    document.getElementById('speedVal').textContent = val + '%';
    document.getElementById('speedFill').style.width = val + '%';
  }

  async function enviar(cmd) {
    document.getElementById('cmdActual').textContent = cmd.toUpperCase();
    try {
      const res = await fetch('/comando', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd, velocidad })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
    } catch (e) {
      toast('⚠ Sin respuesta del robot');
      setConexion(false);
    }
  }

  let holdInterval = null;
  let holdBtn = null;
  function iniciarMantener(e, cmd, btn) {
    e.preventDefault();
    if (holdInterval) return;
    holdBtn = btn;
    btn.classList.add('holding');
    enviar(cmd);
    holdInterval = setInterval(() => enviar(cmd), 150);
  }
  function soltarMantener(e) {
    if (!holdInterval) return;
    e.preventDefault();
    clearInterval(holdInterval);
    holdInterval = null;
    if (holdBtn) { holdBtn.classList.remove('holding'); holdBtn = null; }
    enviar('detener');
  }

  const keyMap = { ArrowUp:'adelante', ArrowDown:'atras', ArrowLeft:'izquierda', ArrowRight:'derecha', ' ':'detener' };
  const keyHeld = {};
  document.addEventListener('keydown', e => {
    if (!keyMap[e.key] || keyHeld[e.key]) return;
    e.preventDefault(); keyHeld[e.key] = true; enviar(keyMap[e.key]);
  });
  document.addEventListener('keyup', e => {
    if (!keyMap[e.key]) return;
    keyHeld[e.key] = false;
    if (e.key !== ' ') enviar('detener');
  });

  function setConexion(online) {
    document.getElementById('connDot').className = 'conn-dot ' + (online ? 'online' : 'offline');
    document.getElementById('connText').textContent = online ? 'ROBOT CONECTADO' : 'SIN CONEXIÓN';
  }
  async function checkConexion() {
    try {
      const res = await fetch('/ping', { method: 'GET', signal: AbortSignal.timeout(2000) });
      setConexion(res.ok);
    } catch { setConexion(false); }
  }
  checkConexion();
  setInterval(checkConexion, 5000);
</script>
</body>
</html>
  `);
});

// -------------------------------
// PING — verifica conexion
// -------------------------------

app.get("/ping", (req, res) => {
  res.send("OK");
});

// -------------------------------
// RECIBIR COMANDO DEL HTML
// -------------------------------

app.post("/comando", (req, res) => {
  comandoActual   = req.body.cmd;
  velocidadActual = req.body.velocidad ?? 50;
  console.log("Comando:", comandoActual, "| Velocidad:", velocidadActual + "%");
  res.send("OK");
});

// -------------------------------
// ENTREGAR COMANDO AL ESP32
// -------------------------------

app.get("/comando", (req, res) => {
  res.json({
    comando:   comandoActual,
    velocidad: velocidadActual
  });
});

// -------------------------------
// INICIAR SERVIDOR
// -------------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor iniciado en puerto", PORT);
});
