const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Estados do Jogo: 'menu', 'level_select', 'credits', 'playing'
let gameState = 'menu';
let currentLevel = 1; // 1 = Praia, 2 = Selva, 3 = Vulcão, 4 = Castelo, 5 = Templo da Aranha, 6 = Pico das Águias
let levelCompleted = false;

// Imagem do Menu Inicial
let menuBgLoaded = false;
const menuBgImg = new Image();
menuBgImg.src = 'inicio.png';
menuBgImg.onload = () => { menuBgLoaded = true; };

// Carregar Imagens do Personagem e Objetos Base
const benImg = new Image(); benImg.src = 'ben.png';
const benAttackRightImg = new Image(); benAttackRightImg.src = 'ben_attack_right.png';
const benAttackLeftImg = new Image(); benAttackLeftImg.src = 'ben_attack_left.png';
const coinImg = new Image(); coinImg.src = 'moeda.png';
const crabLeftImg = new Image(); crabLeftImg.src = 'crab_left.png';
const crabRightImg = new Image(); crabRightImg.src = 'crab_right.png';
const treeImg = new Image(); treeImg.src = 'tree.png';

// Imagem do Portal Personalizado (180x180)
let portalLoaded = false;
const portalImg = new Image();
portalImg.src = 'portal.png';
portalImg.onload = () => { portalLoaded = true; };

// Imagens de Fundo das Fases (.jfif)
let bg1Loaded = false; const bg1Img = new Image(); bg1Img.src = 'tela1.jfif'; bg1Img.onload = () => { bg1Loaded = true; };
let bg2Loaded = false; const bg2Img = new Image(); bg2Img.src = 'tela2.jfif'; bg2Img.onload = () => { bg2Loaded = true; };
let bg3Loaded = false; const bg3Img = new Image(); bg3Img.src = 'tela3.jfif'; bg3Img.onload = () => { bg3Loaded = true; };
let bg4Loaded = false; const bg4Img = new Image(); bg4Img.src = 'tela4.jfif'; bg4Img.onload = () => { bg4Loaded = true; };
let bg5Loaded = false; const bg5Img = new Image(); bg5Img.src = 'tela5.jfif'; bg5Img.onload = () => { bg5Loaded = true; };
let bg6Loaded = false; const bg6Img = new Image(); bg6Img.src = 'tela6.jfif'; bg6Img.onload = () => { bg6Loaded = true; };

// Imagens da Fase 2
let batLoaded = false; const batImg = new Image(); batImg.src = 'bat.png'; batImg.onload = () => { batLoaded = true; };
let caveLoaded = false; const caveImg = new Image(); caveImg.src = 'cave.png'; caveImg.onload = () => { caveLoaded = true; };

// Imagens da Fase 3
let fireballLoaded = false; const fireballImg = new Image(); fireballImg.src = 'fireball.png'; fireballImg.onload = () => { fireballLoaded = true; };
let waterfireLoaded = false; const waterfireImg = new Image(); waterfireImg.src = 'waterfire.png'; waterfireImg.onload = () => { waterfireLoaded = true; };

// Imagens do Zumbi (Fase 4)
let zombieLeftLoaded = false; const zombieLeftImg = new Image(); zombieLeftImg.src = 'zombie_left.png'; zombieLeftImg.onload = () => { zombieLeftLoaded = true; };
let zombieRightLoaded = false; const zombieRightImg = new Image(); zombieRightImg.src = 'zombie_right.png'; zombieRightImg.onload = () => { zombieRightLoaded = true; };

// Imagens da Aranha e Teia (Fase 5)
let spiderLeftLoaded = false; const spiderLeftImg = new Image(); spiderLeftImg.src = 'spider_left.png'; spiderLeftImg.onload = () => { spiderLeftLoaded = true; };
let spiderRightLoaded = false; const spiderRightImg = new Image(); spiderRightImg.src = 'spider_right.png'; spiderRightImg.onload = () => { spiderRightLoaded = true; };
let spiderAttackLoaded = false; const spiderAttackImg = new Image(); spiderAttackImg.src = 'spider_atack.png'; spiderAttackImg.onload = () => { spiderAttackLoaded = true; };
let webLoaded = false; const webImg = new Image(); webImg.src = 'teia.png'; webImg.onload = () => { webLoaded = true; };

// Imagens da Águia (Fase 6)
let eagle1Loaded = false; const eagle1Img = new Image(); eagle1Img.src = 'aguia1.png'; eagle1Img.onload = () => { eagle1Loaded = true; };
let eagle2Loaded = false; const eagle2Img = new Image(); eagle2Img.src = 'aguia2.png'; eagle2Img.onload = () => { eagle2Loaded = true; };
let eagleAttackLoaded = false; const eagleAttackImg = new Image(); eagleAttackImg.src = 'aguia_atack.png'; eagleAttackImg.onload = () => { eagleAttackLoaded = true; };
let eagleAttack2Loaded = false; const eagleAttack2Img = new Image(); eagleAttack2Img.src = 'aguia_atack2.png'; eagleAttack2Img.onload = () => { eagleAttack2Loaded = true; };

// Personagem Principal: BEN
const ben = {
  x: 50,
  y: 200,
  width: 90,
  height: 90,
  velocityX: 0,
  velocityY: 0,
  speed: 5,
  jumpForce: -13.5,
  grounded: false,
  facing: 'right',
  isAttacking: false,
  attackTimer: 0,
  score: 0,
  alive: true
};

// Configurações Globais
let cameraX = 0;
const levelWidth = 4000;
const gravity = 0.6;
const groundY = canvas.height - 50;
let globalWalkTimer = 0;

// Portal do Fim da Fase (180px x 180px)
const portal = { x: 3750, y: groundY - 180, width: 180, height: 180 };

// Botão de Voltar ao Menu durante a Partida
const inGameMenuBtn = { x: canvas.width - 110, y: 15, width: 90, height: 35 };

// --- ELEMENTOS DA FASE 1 ---
const treesFase1 = [
  { x: 400, width: 140, height: 180 }, { x: 900, width: 150, height: 190 },
  { x: 1500, width: 140, height: 180 }, { x: 2100, width: 160, height: 200 },
  { x: 2700, width: 140, height: 180 }, { x: 3300, width: 150, height: 190 }
];

const itemsFase1 = [
  { x: 300, y: groundY - 35, size: 32, collected: false }, { x: 700, y: groundY - 35, size: 32, collected: false },
  { x: 1200, y: groundY - 35, size: 32, collected: false }, { x: 1700, y: groundY - 35, size: 32, collected: false },
  { x: 2150, y: groundY - 35, size: 32, collected: false }, { x: 2750, y: groundY - 35, size: 32, collected: false },
  { x: 3350, y: groundY - 35, size: 32, collected: false }
];

const enemiesFase1 = [
  { x: 550, y: groundY - 45, width: 60, height: 45, speed: 2, direction: 1, minX: 480, maxX: 700, alive: true },
  { x: 1050, y: groundY - 45, width: 60, height: 45, speed: 2.5, direction: 1, minX: 980, maxX: 1250, alive: true },
  { x: 1600, y: groundY - 45, width: 60, height: 45, speed: 2, direction: -1, minX: 1400, maxX: 1750, alive: true },
  { x: 2150, y: groundY - 45, width: 60, height: 45, speed: 3, direction: 1, minX: 1950, maxX: 2300, alive: true },
  { x: 2800, y: groundY - 45, width: 60, height: 45, speed: 2.5, direction: 1, minX: 2600, maxX: 2950, alive: true },
  { x: 3200, y: groundY - 45, width: 60, height: 45, speed: 2.8, direction: 1, minX: 3000, maxX: 3350, alive: true },
  { x: 3600, y: groundY - 45, width: 60, height: 45, speed: 3, direction: -1, minX: 3400, maxX: 3750, alive: true }
];

// --- ELEMENTOS DA FASE 2 ---
const cavesFase2 = [
  { x: 500, width: 180, height: 160 }, { x: 1200, width: 200, height: 170 },
  { x: 2000, width: 190, height: 165 }, { x: 2800, width: 210, height: 180 },
  { x: 3400, width: 180, height: 160 }
];

const itemsFase2 = [
  { x: 350, y: groundY - 35, size: 32, collected: false }, { x: 800, y: groundY - 35, size: 32, collected: false },
  { x: 1300, y: groundY - 35, size: 32, collected: false }, { x: 1800, y: groundY - 35, size: 32, collected: false },
  { x: 2300, y: groundY - 35, size: 32, collected: false }, { x: 2900, y: groundY - 35, size: 32, collected: false },
  { x: 3500, y: groundY - 35, size: 32, collected: false }
];

const initialBatPositions = [
  { x: 900, y: groundY - 110, width: 50, height: 35, speed: 3 },
  { x: 1500, y: groundY - 120, width: 50, height: 35, speed: 3.2 },
  { x: 2100, y: groundY - 130, width: 50, height: 35, speed: 3.5 },
  { x: 2700, y: groundY - 100, width: 50, height: 35, speed: 4 },
  { x: 3300, y: groundY - 140, width: 50, height: 35, speed: 3.5 }
];
let batsFase2 = initialBatPositions.map(bat => ({ ...bat, alive: true }));

// --- ELEMENTOS DA FASE 3 ---
const lavaPitsFase3 = [
  { x: 650, width: 80, height: 40, offset: 0 }, { x: 1400, width: 90, height: 40, offset: 0 },
  { x: 2200, width: 85, height: 40, offset: 0 }, { x: 3000, width: 100, height: 40, offset: 0 }
];

const initialFireballPositions = [
  { x: 800, y: groundY - 120, width: 45, height: 45, speed: 3.5 },
  { x: 1400, y: groundY - 130, width: 45, height: 45, speed: 3.8 },
  { x: 2000, y: groundY - 140, width: 45, height: 45, speed: 4 },
  { x: 2600, y: groundY - 110, width: 45, height: 45, speed: 4.5 },
  { x: 3200, y: groundY - 150, width: 45, height: 45, speed: 4 }
];
let fireballsFase3 = initialFireballPositions.map(fb => ({ ...fb, alive: true }));

const itemsFase3 = [
  { x: 400, y: groundY - 35, size: 32, collected: false }, { x: 1000, y: groundY - 35, size: 32, collected: false },
  { x: 1800, y: groundY - 35, size: 32, collected: false }, { x: 2600, y: groundY - 35, size: 32, collected: false },
  { x: 3500, y: groundY - 35, size: 32, collected: false }
];

// --- ELEMENTOS DA FASE 4 ---
const initialZombiePositions = [
  { x: 700, y: groundY - 90, width: 90, height: 90, speed: 1.8, direction: -1, turnDelay: 0, alive: true },
  { x: 1400, y: groundY - 90, width: 90, height: 90, speed: 2.0, direction: -1, turnDelay: 0, alive: true },
  { x: 2100, y: groundY - 90, width: 90, height: 90, speed: 2.1, direction: -1, turnDelay: 0, alive: true },
  { x: 2800, y: groundY - 90, width: 90, height: 90, speed: 2.2, direction: -1, turnDelay: 0, alive: true },
  { x: 3400, y: groundY - 90, width: 90, height: 90, speed: 2.0, direction: -1, turnDelay: 0, alive: true }
];
let zombiesFase4 = initialZombiePositions.map(z => ({ ...z }));

const itemsFase4 = [
  { x: 500, y: groundY - 35, size: 32, collected: false }, { x: 1200, y: groundY - 35, size: 32, collected: false },
  { x: 2000, y: groundY - 35, size: 32, collected: false }, { x: 2800, y: groundY - 35, size: 32, collected: false },
  { x: 3600, y: groundY - 35, size: 32, collected: false }
];

// --- ELEMENTOS DA FASE 5 ---
const initialSpiderPositions = [
  { x: 700, y: groundY - 70, width: 90, height: 70, speed: 2, direction: 1, minX: 550, maxX: 900, isAttacking: false, attackCooldown: 0, alive: true },
  { x: 1400, y: groundY - 70, width: 90, height: 70, speed: 2, direction: -1, minX: 1200, maxX: 1600, isAttacking: false, attackCooldown: 0, alive: true },
  { x: 2100, y: groundY - 70, width: 90, height: 70, speed: 2.2, direction: 1, minX: 1900, maxX: 2300, isAttacking: false, attackCooldown: 0, alive: true },
  { x: 2800, y: groundY - 70, width: 90, height: 70, speed: 2.5, direction: 1, minX: 2600, maxX: 3000, isAttacking: false, attackCooldown: 0, alive: true },
  { x: 3400, y: groundY - 70, width: 90, height: 70, speed: 2.5, direction: -1, minX: 3200, maxX: 3600, isAttacking: false, attackCooldown: 0, alive: true }
];
let spidersFase5 = initialSpiderPositions.map(s => ({ ...s }));
let spiderWebsFase5 = [];

const itemsFase5 = [
  { x: 600, y: groundY - 35, size: 32, collected: false }, { x: 1400, y: groundY - 35, size: 32, collected: false },
  { x: 2200, y: groundY - 35, size: 32, collected: false }, { x: 3000, y: groundY - 35, size: 32, collected: false },
  { x: 3600, y: groundY - 35, size: 32, collected: false }
];

// --- ELEMENTOS DA FASE 6 (4 ÁGUIAS & BURACOS NO CHÃO) ---
const holesFase6 = [
  { x: 800, width: 100 },
  { x: 1600, width: 120 },
  { x: 2500, width: 110 },
  { x: 3200, width: 130 }
];

const initialEagles = [
  { x: 900, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 3, direction: -1, minX: 600, maxX: 1200, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true },
  { x: 1800, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 3.2, direction: -1, minX: 1400, maxX: 2100, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true },
  { x: 2600, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 3.5, direction: -1, minX: 2200, maxX: 2900, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true },
  { x: 3400, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 3.5, direction: -1, minX: 3000, maxX: 3700, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true }
];

let eaglesFase6 = initialEagles.map(e => ({ ...e }));

const itemsFase6 = [
  { x: 500, y: groundY - 35, size: 32, collected: false }, { x: 1200, y: groundY - 35, size: 32, collected: false },
  { x: 2000, y: groundY - 35, size: 32, collected: false }, { x: 2900, y: groundY - 35, size: 32, collected: false },
  { x: 3500, y: groundY - 35, size: 32, collected: false }
];

let currentItems = itemsFase1;
let currentEnemies = enemiesFase1;

function resetBats() { batsFase2 = initialBatPositions.map(bat => ({ ...bat, alive: true })); }
function resetFireballs() { fireballsFase3 = initialFireballPositions.map(fb => ({ ...fb, alive: true })); }
function resetZombies() { zombiesFase4 = initialZombiePositions.map(z => ({ ...z })); }
function resetSpiders() { spidersFase5 = initialSpiderPositions.map(s => ({ ...s })); spiderWebsFase5 = []; }
function resetEagles() { eaglesFase6 = initialEagles.map(e => ({ ...e })); }

function loadLevel(lvl) {
  currentLevel = lvl; levelCompleted = false;
  ben.x = 50; ben.y = 200; ben.velocityX = 0; ben.velocityY = 0; ben.alive = true;
  cameraX = 0;

  if (lvl === 1) { currentItems = itemsFase1; currentEnemies = enemiesFase1; }
  else if (lvl === 2) { currentItems = itemsFase2; currentEnemies = enemiesFase1; resetBats(); }
  else if (lvl === 3) { currentItems = itemsFase3; currentEnemies = []; resetFireballs(); }
  else if (lvl === 4) { currentItems = itemsFase4; currentEnemies = []; resetZombies(); }
  else if (lvl === 5) { currentItems = itemsFase5; currentEnemies = []; resetSpiders(); }
  else if (lvl === 6) { currentItems = itemsFase6; currentEnemies = []; resetEagles(); }

  gameState = 'playing';
}

function restartGame() {
  ben.score = 0;
  itemsFase1.forEach(item => item.collected = false); enemiesFase1.forEach(enemy => enemy.alive = true);
  itemsFase2.forEach(item => item.collected = false); resetBats();
  itemsFase3.forEach(item => item.collected = false); resetFireballs();
  itemsFase4.forEach(item => item.collected = false); resetZombies();
  itemsFase5.forEach(item => item.collected = false); resetSpiders();
  itemsFase6.forEach(item => item.collected = false); resetEagles();
  loadLevel(currentLevel);
}

function handleAction() {
  if (gameState !== 'playing') return false;

  if (levelCompleted) {
    if (currentLevel < 6) { loadLevel(currentLevel + 1); return true; }
    else { gameState = 'menu'; return true; }
  }
  if (!ben.alive) {
    restartGame();
    return true;
  }
  return false;
}

// Botões do Menu Inicial
const menuButtons = [
  { label: 'INÍCIO', x: canvas.width / 2 - 110, y: 180, width: 220, height: 55, action: () => loadLevel(1) },
  { label: 'FASES', x: canvas.width / 2 - 110, y: 255, width: 220, height: 55, action: () => gameState = 'level_select' },
  { label: 'CRÉDITOS', x: canvas.width / 2 - 110, y: 330, width: 220, height: 55, action: () => gameState = 'credits' }
];

function drawTechButton(x, y, width, height, label, fontSize = 22) {
  const cut = 12;
  const grad = ctx.createLinearGradient(x, y, x, y + height);
  grad.addColorStop(0, '#0050d0'); grad.addColorStop(0.5, '#002060'); grad.addColorStop(1, '#001035');

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + cut, y); ctx.lineTo(x + width - cut, y); ctx.lineTo(x + width, y + cut);
  ctx.lineTo(x + width, y + height - cut); ctx.lineTo(x + width - cut, y + height);
  ctx.lineTo(x + cut, y + height); ctx.lineTo(x, y + height - cut); ctx.lineTo(x, y + cut);
  ctx.closePath();

  ctx.fillStyle = grad; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#00ffff'; ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 10; ctx.stroke();
  ctx.lineWidth = 2; ctx.strokeStyle = '#80e5ff'; ctx.beginPath();
  ctx.moveTo(x + 5, y + height / 2 - 8); ctx.lineTo(x + 5, y + height / 2 + 8);
  ctx.moveTo(x + width - 5, y + height / 2 - 8); ctx.lineTo(x + width - 5, y + height / 2 + 8);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(label, x + width / 2, y + height / 2 + (fontSize / 3));
}

function handleCanvasClick(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const clickX = (clientX - rect.left) * (canvas.width / rect.width);
  const clickY = (clientY - rect.top) * (canvas.height / rect.height);

  if (gameState === 'playing') {
    if (clickX >= inGameMenuBtn.x && clickX <= inGameMenuBtn.x + inGameMenuBtn.width &&
        clickY >= inGameMenuBtn.y && clickY <= inGameMenuBtn.y + inGameMenuBtn.height) {
      gameState = 'menu';
      return;
    }
    handleAction();
    return;
  }

  if (gameState === 'menu') {
    menuButtons.forEach(btn => {
      if (clickX >= btn.x && clickX <= btn.x + btn.width && clickY >= btn.y && clickY <= btn.y + btn.height) {
        btn.action();
      }
    });
  } else if (gameState === 'level_select') {
    const btnW = 65, btnH = 50, gap = 15;
    const startX = canvas.width / 2 - ((5 * btnW + 4 * gap) / 2);

    for (let i = 1; i <= 10; i++) {
      const col = (i - 1) % 5; const row = Math.floor((i - 1) / 5);
      const btnX = startX + col * (btnW + gap); const btnY = 150 + row * (btnH + gap);

      if (clickX >= btnX && clickX <= btnX + btnW && clickY >= btnY && clickY <= btnY + btnH) {
        if (i <= 6) loadLevel(i);
      }
    }

    if (clickX >= canvas.width / 2 - 70 && clickX <= canvas.width / 2 + 70 && clickY >= 360 && clickY <= 405) {
      gameState = 'menu';
    }
  } else if (gameState === 'credits') {
    if (clickX >= canvas.width / 2 - 70 && clickX <= canvas.width / 2 + 70 && clickY >= 380 && clickY <= 425) {
      gameState = 'menu';
    }
  }
}

canvas.addEventListener('click', (e) => handleCanvasClick(e.clientX, e.clientY));
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) handleCanvasClick(e.touches[0].clientX, e.touches[0].clientY);
});

// Controles Teclado
const keys = { right: false, left: false };

window.addEventListener('keydown', (e) => {
  if (gameState !== 'playing') return;
  if (handleAction()) return;

  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  
  if ((e.code === 'ArrowUp' || e.code === 'KeyW') && ben.grounded && ben.alive) {
    ben.velocityY = ben.jumpForce;
    ben.grounded = false;
  }

  if (e.code === 'Space' && !ben.isAttacking && ben.alive) {
    ben.isAttacking = true;
    ben.attackTimer = 15;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
});

// Controles Touch
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');
const btnJump = document.getElementById('btnJump');
const btnAttack = document.getElementById('btnAttack');

if (btnLeft && btnRight && btnJump) {
  btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); if (ben.alive && gameState === 'playing') keys.left = true; });
  btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); keys.left = false; });

  btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); if (ben.alive && gameState === 'playing') keys.right = true; });
  btnRight.addEventListener('touchend', (e) => { e.preventDefault(); keys.left = false; });

  btnJump.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (handleAction()) return;
    if (ben.grounded && gameState === 'playing') {
      ben.velocityY = ben.jumpForce;
      ben.grounded = false;
    }
  });
}

if (btnAttack) {
  btnAttack.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (handleAction()) return;
    if (!ben.isAttacking && ben.alive && gameState === 'playing') {
      ben.isAttacking = true;
      ben.attackTimer = 15;
    }
  });
}

// Lógica de Atualização
function update() {
  if (gameState !== 'playing' || levelCompleted || !ben.alive) return;

  globalWalkTimer += 0.2;

  if (keys.right) {
    ben.velocityX = ben.speed;
    ben.facing = 'right';
  } else if (keys.left) {
    ben.velocityX = -ben.speed;
    ben.facing = 'left';
  } else {
    ben.velocityX = 0;
  }

  ben.x += ben.velocityX;
  ben.y += ben.velocityY;

  if (!ben.grounded) {
    ben.velocityY += gravity;
  }

  if (ben.y + ben.height >= groundY) {
    ben.y = groundY - ben.height;
    ben.velocityY = 0;
    ben.grounded = true;
  } else {
    ben.grounded = false;
  }

  if (ben.x < 0) ben.x = 0;
  if (ben.x + ben.width > levelWidth) ben.x = levelWidth - ben.width;

  // Fase 3: Lava & Bolas de Fogo
  if (currentLevel === 3) {
    lavaPitsFase3.forEach(pit => {
      pit.offset += 0.08;
      if (ben.x + ben.width > pit.x + 10 && ben.x < pit.x + pit.width - 10 && ben.y + ben.height >= groundY - 10) {
        ben.alive = false;
      }
    });

    fireballsFase3.forEach(fb => {
      if (fb.alive) {
        fb.x -= fb.speed;
        if (fb.x + fb.width < cameraX) fb.x = cameraX + canvas.width + 300;
        if (ben.x < fb.x + fb.width && ben.x + ben.width > fb.x && ben.y < fb.y + fb.height && ben.y + ben.height > fb.y) {
          ben.alive = false;
        }
      }
    });
  }

  // Fase 4: Zumbi Perseguidor
  if (currentLevel === 4) {
    zombiesFase4.forEach(zombie => {
      if (zombie.alive) {
        const desiredDirection = ben.x > zombie.x ? 1 : -1;
        if (desiredDirection !== zombie.direction) {
          zombie.turnDelay++;
          if (zombie.turnDelay > 30) { zombie.direction = desiredDirection; zombie.turnDelay = 0; }
        } else zombie.turnDelay = 0;

        zombie.x += zombie.speed * zombie.direction;
        const zombieHitboxY = zombie.y + 15;
        const zombieHitboxHeight = zombie.height - 15;

        if (ben.x < zombie.x + zombie.width - 10 && ben.x + ben.width > zombie.x + 10 &&
            ben.y < zombieHitboxY + zombieHitboxHeight && ben.y + ben.height > zombieHitboxY) {
          ben.alive = false;
        }
      }
    });
  }

  // Fase 5: Aranha Atiradora de Teias
  if (currentLevel === 5) {
    spidersFase5.forEach(spider => {
      if (spider.alive) {
        const distanceToBen = Math.abs(ben.x - spider.x);
        if (distanceToBen < 350) {
          spider.isAttacking = true;
          spider.direction = ben.x > spider.x ? 1 : -1;
          if (spider.attackCooldown <= 0) {
            spiderWebsFase5.push({
              x: spider.direction === 1 ? spider.x + spider.width : spider.x - 40,
              y: spider.y + 20, width: 40, height: 40, speed: 6 * spider.direction, alive: true
            });
            spider.attackCooldown = 90;
          }
        } else {
          spider.isAttacking = false;
          spider.x += spider.speed * spider.direction;
          if (spider.x <= spider.minX || spider.x + spider.width >= spider.maxX) spider.direction *= -1;
        }
        if (spider.attackCooldown > 0) spider.attackCooldown--;

        if (ben.x < spider.x + spider.width - 10 && ben.x + ben.width > spider.x + 10 &&
            ben.y < spider.y + spider.height && ben.y + ben.height > spider.y) {
          ben.alive = false;
        }
      }
    });

    spiderWebsFase5.forEach(web => {
      if (web.alive) {
        web.x += web.speed;
        if (ben.x < web.x + web.width && ben.x + ben.width > web.x && ben.y < web.y + web.height && ben.y + ben.height > web.y) {
          ben.alive = false;
        }
        if (web.x < cameraX - 100 || web.x > cameraX + canvas.width + 100) web.alive = false;
      }
    });
  }

  // Fase 6: 4 Águias - Ataque Contínuo Fluido (Sem Travar)
  if (currentLevel === 6) {
    holesFase6.forEach(hole => {
      if (ben.x + ben.width > hole.x + 20 && ben.x < hole.x + hole.width - 20 && ben.y + ben.height >= groundY - 5) {
        ben.alive = false;
      }
    });

    eaglesFase6.forEach(eagle => {
      if (eagle.alive) {
        eagle.wingFlapTimer += 0.15;

        if (eagle.state === 'patrol') {
          eagle.x += eagle.speedX * eagle.direction;
          if (eagle.x <= eagle.minX || eagle.x + eagle.width >= eagle.maxX) {
            eagle.direction *= -1;
          }

          const distToBen = Math.abs(ben.x - eagle.x);
          if (distToBen < 400 && ben.x < eagle.x) {
            eagle.state = 'aiming';
            eagle.aimTimer = 40; // Pausa no ar para mirar
            eagle.targetX = ben.x;
            eagle.targetY = ben.y;
          }
        } else if (eagle.state === 'aiming') {
          eagle.aimTimer--;
          if (eagle.aimTimer <= 0) {
            eagle.state = 'attacking';
          }
        } else if (eagle.state === 'attacking') {
          // Primeiro Rasante (aguia_atack.png)
          const dx = eagle.targetX - eagle.x;
          const dy = eagle.targetY - eagle.y;
          const angle = Math.atan2(dy, dx);

          eagle.x += Math.cos(angle) * 8.5;
          eagle.y += Math.sin(angle) * 8.5;

          // CORREÇÃO AQUI: Troca de estado assim que chegar perto do chão ou passar pela posição do alvo
          if (eagle.y >= groundY - 90 || eagle.x <= eagle.targetX + 20) {
            eagle.state = 'back_attack';
          }
        } else if (eagle.state === 'back_attack') {
          // Segundo Ataque de Retorno (aguia_atack2.png) - Parte EXATAMENTE de onde parou!
          eagle.x += 9;

          // Se passar do herói em 300px, sobe de volta para o céu
          if (eagle.x > ben.x + 300) {
            eagle.state = 'returning';
          }
        } else if (eagle.state === 'returning') {
          eagle.y -= 4;
          if (eagle.y <= eagle.baseY) {
            eagle.y = eagle.baseY;
            eagle.state = 'patrol';
          }
        }

        // Colisão da Águia com o Ben
        if (ben.x < eagle.x + eagle.width - 10 && ben.x + ben.width > eagle.x + 10 &&
            ben.y < eagle.y + eagle.height - 10 && ben.y + ben.height > eagle.y + 10) {
          ben.alive = false;
        }
      }
    });
  }

  // Ataque de Espada do Ben
  if (ben.isAttacking) {
    ben.attackTimer--;
    if (ben.attackTimer <= 0) ben.isAttacking = false;

    const attackArea = {
      x: ben.facing === 'right' ? ben.x + ben.width : ben.x - 35,
      y: ben.y,
      width: 45,
      height: ben.height
    };

    currentEnemies.forEach(enemy => {
      if (enemy.alive && attackArea.x < enemy.x + enemy.width && attackArea.x + attackArea.width > enemy.x && attackArea.y < enemy.y + enemy.height && attackArea.y + attackArea.height > enemy.y) {
        const isBackAttack = (ben.facing === 'right' && enemy.direction === 1) || (ben.facing === 'left' && enemy.direction === -1);
        if (isBackAttack) { enemy.alive = false; ben.score += 50; }
      }
    });

    if (currentLevel === 2) {
      batsFase2.forEach(bat => {
        if (bat.alive && attackArea.x < bat.x + bat.width && attackArea.x + attackArea.width > bat.x && attackArea.y < bat.y + bat.height && attackArea.y + attackArea.height > bat.y) {
          bat.alive = false; ben.score += 60;
        }
      });
    }

    if (currentLevel === 3) {
      fireballsFase3.forEach(fb => {
        if (fb.alive && attackArea.x < fb.x + fb.width && attackArea.x + attackArea.width > fb.x && attackArea.y < fb.y + fb.height && attackArea.y + attackArea.height > fb.y) {
          fb.alive = false; ben.score += 70;
        }
      });
    }

    if (currentLevel === 4) {
      zombiesFase4.forEach(zombie => {
        if (zombie.alive && attackArea.x < zombie.x + zombie.width && attackArea.x + attackArea.width > zombie.x && attackArea.y < zombie.y + zombie.height && attackArea.y + attackArea.height > zombie.y) {
          zombie.alive = false; ben.score += 80;
        }
      });
    }

    if (currentLevel === 5) {
      spidersFase5.forEach(spider => {
        if (spider.alive && attackArea.x < spider.x + spider.width && attackArea.x + attackArea.width > spider.x && attackArea.y < spider.y + spider.height && attackArea.y + attackArea.height > spider.y) {
          spider.alive = false; ben.score += 100;
        }
      });
    }

    if (currentLevel === 6) {
      eaglesFase6.forEach(eagle => {
        if (eagle.alive && attackArea.x < eagle.x + eagle.width && attackArea.x + attackArea.width > eagle.x && attackArea.y < eagle.y + eagle.height && attackArea.y + attackArea.height > eagle.y) {
          eagle.alive = false; ben.score += 120;
        }
      });
    }
  }

  currentEnemies.forEach(enemy => {
    if (enemy.alive) {
      enemy.x += enemy.speed * enemy.direction;
      if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) enemy.direction *= -1;
      if (ben.x < enemy.x + enemy.width && ben.x + ben.width > enemy.x && ben.y < enemy.y + enemy.height && ben.y + ben.height > enemy.y) {
        ben.alive = false;
      }
    }
  });

  if (currentLevel === 2) {
    batsFase2.forEach(bat => {
      if (bat.alive) {
        bat.x -= bat.speed;
        if (bat.x + bat.width < cameraX) bat.x = cameraX + canvas.width + 400;
        if (ben.x < bat.x + bat.width && ben.x + ben.width > bat.x && ben.y < bat.y + bat.height && ben.y + ben.height > bat.y) {
          ben.alive = false;
        }
      }
    });
  }

  if (ben.x > canvas.width / 2 && ben.x < levelWidth - canvas.width / 2) {
    cameraX = ben.x - canvas.width / 2;
  } else if (ben.x <= canvas.width / 2) {
    cameraX = 0;
  } else if (ben.x >= levelWidth - canvas.width / 2) {
    cameraX = levelWidth - canvas.width;
  }

  currentItems.forEach(item => {
    if (!item.collected && ben.x < item.x + item.size && ben.x + ben.width > item.x && ben.y < item.y + item.size && ben.y + ben.height > item.y) {
      item.collected = true; ben.score += 10;
    }
  });

  const benCenterX = ben.x + ben.width / 2;
  const benCenterY = ben.y + ben.height / 2;
  if (benCenterX >= portal.x + 30 && benCenterX <= portal.x + portal.width - 30 &&
      benCenterY >= portal.y + 30 && benCenterY <= portal.y + portal.height) {
    levelCompleted = true;
  }
}

// Desenhar Cenas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === 'menu') {
    if (menuBgLoaded) ctx.drawImage(menuBgImg, 0, 0, canvas.width, canvas.height);
    else { ctx.fillStyle = '#0a0f24'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    menuButtons.forEach(btn => drawTechButton(btn.x, btn.y, btn.width, btn.height, btn.label));
    ctx.textAlign = 'left';
    return;
  }

  if (gameState === 'level_select') {
    ctx.fillStyle = '#0a0f24'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const btnW = 65, btnH = 50, gap = 15;
    const startX = canvas.width / 2 - ((5 * btnW + 4 * gap) / 2);

    for (let i = 1; i <= 10; i++) {
      const col = (i - 1) % 5; const row = Math.floor((i - 1) / 5);
      const btnX = startX + col * (btnW + gap); const btnY = 150 + row * (btnH + gap);
      drawTechButton(btnX, btnY, btnW, btnH, `${i}`, 18);
    }
    drawTechButton(canvas.width / 2 - 70, 360, 140, 45, 'VOLTAR', 18);
    ctx.textAlign = 'left';
    return;
  }

  if (gameState === 'credits') {
    ctx.fillStyle = '#0a0f24'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ffff'; ctx.font = 'bold 32px Arial'; ctx.textAlign = 'center';
    ctx.fillText('CRÉDITOS', canvas.width / 2, 120);
    ctx.fillStyle = '#ffffff'; ctx.font = '20px Arial';
    ctx.fillText("Desenvolvido para Ben's Adventures", canvas.width / 2, 200);
    ctx.fillText("Arte, Código e Design Criativo", canvas.width / 2, 250);
    drawTechButton(canvas.width / 2 - 70, 380, 140, 45, 'VOLTAR', 18);
    ctx.textAlign = 'left';
    return;
  }

  // CENA DE JOGO
  ctx.save();
  ctx.translate(-cameraX, 0);

  if (currentLevel === 1) {
    if (bg1Loaded) ctx.drawImage(bg1Img, 0, 0, levelWidth, canvas.height);
    treesFase1.forEach(tree => ctx.drawImage(treeImg, tree.x, groundY - tree.height, tree.width, tree.height));
  } else if (currentLevel === 2) {
    if (bg2Loaded) ctx.drawImage(bg2Img, 0, 0, levelWidth, canvas.height);
    cavesFase2.forEach(cave => { if (caveLoaded) ctx.drawImage(caveImg, cave.x, groundY - cave.height, cave.width, cave.height); });
  } else if (currentLevel === 3) {
    if (bg3Loaded) ctx.drawImage(bg3Img, 0, 0, levelWidth, canvas.height);
    lavaPitsFase3.forEach(pit => {
      ctx.fillStyle = '#171717'; ctx.fillRect(pit.x, groundY, pit.width, 50);
      const waveY = Math.sin(pit.offset) * 3; const slideX = (pit.offset * 8) % 15;
      if (waterfireLoaded) ctx.drawImage(waterfireImg, pit.x - slideX, groundY + waveY, pit.width + 15, pit.height);
    });
  } else if (currentLevel === 4) {
    if (bg4Loaded) ctx.drawImage(bg4Img, 0, 0, levelWidth, canvas.height);
  } else if (currentLevel === 5) {
    if (bg5Loaded) ctx.drawImage(bg5Img, 0, 0, levelWidth, canvas.height);
  } else if (currentLevel === 6) {
    if (bg6Loaded) ctx.drawImage(bg6Img, 0, 0, levelWidth, canvas.height);
    else { ctx.fillStyle = '#0284c7'; ctx.fillRect(0, 0, levelWidth, canvas.height); ctx.fillStyle = '#334155'; ctx.fillRect(0, groundY, levelWidth, 50); }

    holesFase6.forEach(hole => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(hole.x, groundY, hole.width, 50);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.strokeRect(hole.x, groundY, hole.width, 50);
    });
  }

  // Portal
  if (portalLoaded) ctx.drawImage(portalImg, portal.x, portal.y, portal.width, portal.height);

  // Moedas
  currentItems.forEach(item => { if (!item.collected) ctx.drawImage(coinImg, item.x, item.y, item.size, item.size); });

  // Caranguejos
  currentEnemies.forEach((enemy, index) => {
    if (enemy.alive) {
      const currentCrabImg = enemy.direction === 1 ? crabRightImg : crabLeftImg;
      const walkBounce = Math.abs(Math.sin(globalWalkTimer * 2 + index)) * 4;
      ctx.drawImage(currentCrabImg, enemy.x, enemy.y - walkBounce, enemy.width, enemy.height);
    }
  });

  if (currentLevel === 2) batsFase2.forEach(bat => { if (bat.alive && batLoaded) ctx.drawImage(batImg, bat.x, bat.y, bat.width, bat.height); });
  if (currentLevel === 3) fireballsFase3.forEach(fb => { if (fb.alive && fireballLoaded) ctx.drawImage(fireballImg, fb.x, fb.y, fb.width, fb.height); });

  if (currentLevel === 4) {
    zombiesFase4.forEach((zombie, index) => {
      if (zombie.alive) {
        const currentZombieImg = zombie.direction === 1 ? zombieRightImg : zombieLeftImg;
        const walkBounce = Math.abs(Math.sin(globalWalkTimer * 1.5 + index)) * 5;
        if (zombieRightLoaded) ctx.drawImage(currentZombieImg, zombie.x, zombie.y - walkBounce, zombie.width, zombie.height);
      }
    });
  }

  if (currentLevel === 5) {
    spidersFase5.forEach((spider, index) => {
      if (spider.alive) {
        let currentSpiderImg = spider.direction === 1 ? spiderRightImg : spiderLeftImg;
        if (spider.isAttacking && spiderAttackLoaded) currentSpiderImg = spiderAttackImg;
        const walkBounce = spider.isAttacking ? 0 : Math.abs(Math.sin(globalWalkTimer * 2.5 + index)) * 4;
        ctx.drawImage(currentSpiderImg, spider.x, spider.y - walkBounce, spider.width, spider.height);
      }
    });
    spiderWebsFase5.forEach(web => { if (web.alive && webLoaded) ctx.drawImage(webImg, web.x, web.y, web.width, web.height); });
  }

  // Desenhar 4 Águias (Fase 6)
  if (currentLevel === 6) {
    eaglesFase6.forEach(eagle => {
      if (eagle.alive) {
        let currentEagleImg = Math.floor(eagle.wingFlapTimer) % 2 === 0 ? eagle1Img : eagle2Img;

        if (eagle.state === 'attacking' && eagleAttackLoaded) {
          currentEagleImg = eagleAttackImg;
        } else if (eagle.state === 'back_attack' && eagleAttack2Loaded) {
          currentEagleImg = eagleAttack2Img;
        }

        ctx.drawImage(currentEagleImg, eagle.x, eagle.y, eagle.width, eagle.height);
      }
    });
  }

  // Desenhar Ben
  if (ben.alive) {
    if (ben.isAttacking) {
      if (ben.facing === 'right') ctx.drawImage(benAttackRightImg, ben.x, ben.y, ben.width + 20, ben.height);
      else ctx.drawImage(benAttackLeftImg, ben.x - 20, ben.y, ben.width + 20, ben.height);
    } else {
      ctx.save();
      if (ben.facing === 'left') {
        ctx.translate(ben.x + ben.width, ben.y);
        ctx.scale(-1, 1);
        ctx.drawImage(benImg, 0, 0, ben.width, ben.height);
      } else ctx.drawImage(benImg, ben.x, ben.y, ben.width, ben.height);
      ctx.restore();
    }
  }

  ctx.restore();

  // Interface Fixa
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px Arial';
  ctx.fillText(`Fase: ${currentLevel} | Pontos: ${ben.score}`, 20, 30);
  drawTechButton(inGameMenuBtn.x, inGameMenuBtn.y, inGameMenuBtn.width, inGameMenuBtn.height, 'MENU', 15);

  if (!ben.alive) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 36px Arial'; ctx.textAlign = 'center';
    ctx.fillText('VOCÊ MORREU!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = '#ffffff'; ctx.font = '18px Arial';
    ctx.fillText('Toque na tela ou pressione PULAR/ESPAÇO para tentar novamente', canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = 'left';
  }

  if (levelCompleted) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fde047'; ctx.font = 'bold 32px Arial'; ctx.textAlign = 'center';
    if (currentLevel < 6) {
      ctx.fillText(`FASE ${currentLevel} CONCLUÍDA!`, canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillStyle = '#ffffff'; ctx.font = '20px Arial';
      ctx.fillText(`Toque na tela ou aperte PULAR/ESPAÇO para ir para a Fase ${currentLevel + 1}!`, canvas.width / 2, canvas.height / 2 + 30);
    } else {
      ctx.fillText('PARABÉNS! ZEROU O JOGO COMPLETO!', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillStyle = '#ffffff'; ctx.font = '20px Arial';
      ctx.fillText(`Pontuação Final Épica: ${ben.score}`, canvas.width / 2, canvas.height / 2 + 30);
    }
    ctx.textAlign = 'left';
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
