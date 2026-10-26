// =============================================================================
// 1. CONFIGURAÇÕES INICIAIS, CANVAS E CUTSCENE
// =============================================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'menu'; // 'menu', 'cutscene', 'level_select', 'credits', 'playing'
let currentLevel = 1;
let levelCompleted = false;
let cameraX = 0;
let globalWalkTimer = 0;

const levelWidth = 4000;
const gravity = 0.6;
const groundY = canvas.height - 50;

const portal = { x: 3750, y: groundY - 180, width: 180, height: 180 };
const abductionLight = { x: 3500, y: groundY - 230, width: 180, height: 230, flipTimer: 0 };
const inGameMenuBtn = { x: canvas.width - 110, y: 15, width: 90, height: 35 };

let lastFrameTime = 0;
const fpsInterval = 1000 / 60;

// Elementos da Cutscene
const cutsceneVideo = document.getElementById('cutsceneVideo');
const skipCutsceneBtn = document.getElementById('skipCutsceneBtn');

cutsceneVideo.addEventListener('ended', () => {
  endCutscene();
});

skipCutsceneBtn.addEventListener('click', () => {
  endCutscene();
});
skipCutsceneBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  endCutscene();
}, { passive: false });

function startCutscene() {
  gameState = 'cutscene';
  skipCutsceneBtn.style.display = 'flex';
  cutsceneVideo.currentTime = 0;
  
  cutsceneVideo.play().catch(err => {
    console.log("Autoplay bloqueado ou vídeo ausente, avançando para a Fase 1:", err);
    endCutscene();
  });
}

function endCutscene() {
  cutsceneVideo.pause();
  skipCutsceneBtn.style.display = 'none';
  loadLevel(1);
}

// =============================================================================
// 2. CARREGAMENTO DE IMAGENS
// =============================================================================
const images = {};
function loadImg(key, src) {
  const img = new Image();
  img.src = './' + src;
  images[key] = img;
  return img;
}

loadImg('menuBg', 'inicio.png');
loadImg('ben', 'ben.png');
loadImg('benAttackRight', 'ben_attack_right.png');
loadImg('benAttackLeft', 'ben_attack_left.png');
loadImg('benDefRight', 'ben_right_def.png');
loadImg('benDefLeft', 'ben_left_def.png');

for (let i = 1; i <= 4; i++) {
  loadImg(`benRight${i}`, `ben_right${i}.png`);
  loadImg(`benLeft${i}`, `ben_left${i}.png`);
}

loadImg('coin', 'moeda.png');
loadImg('portal', 'portal.png');
loadImg('luz', 'luz.png');

for (let i = 1; i <= 4; i++) {
  loadImg(`crabLeft${i}`, `crab_left${i}.png`);
  loadImg(`crabRight${i}`, `crab_right${i}.png`);
  loadImg(`bat${i}`, `bat${i}.png`);
}

loadImg('tree', 'tree.png'); loadImg('cave', 'cave.png');
loadImg('fireball', 'fireball.png'); loadImg('waterfire', 'waterfire.png');
loadImg('zombieLeft', 'zombie_left.png'); loadImg('zombieRight', 'zombie_right.png');
loadImg('spiderLeft', 'spider_left.png'); loadImg('spiderRight', 'spider_right.png');
loadImg('spiderAttack', 'spider_atack.png'); loadImg('web', 'teia.png');
loadImg('eagle1', 'aguia1.png'); loadImg('eagle2', 'aguia2.png');
loadImg('eagleAttack', 'aguia_atack.png'); loadImg('eagleAttack2', 'aguia_atack2.png');

loadImg('esqueletoLeft', 'esqueleto_left.png');
loadImg('esqueletoRight', 'esqueleto_right.png');
loadImg('esqueletoAtk', 'esqueleto_atk.png');
loadImg('esqueletoAtk2', 'esqueleto_atk2.png');
loadImg('flecha', 'flecha.png');

for (let i = 1; i <= 3; i++) {
  loadImg(`sland${i}`, `sland${i}.png`);
}
loadImg('slandAtk', 'sland_atk.png');
loadImg('tel', 'tel.png');

for (let i = 1; i <= 8; i++) {
  loadImg(`bg${i}`, `tela${i}.jfif`);
}

// =============================================================================
// 3. ESTRUTURA DAS FASES
// =============================================================================
const LEVELS_DATA = {
  1: {
    bgKey: 'bg1',
    trees: [{ x: 400, w: 140, h: 180 }, { x: 900, w: 150, h: 190 }, { x: 1500, w: 140, h: 180 }, { x: 2100, w: 160, h: 200 }, { x: 2700, w: 140, h: 180 }, { x: 3300, w: 150, h: 190 }],
    items: [300, 700, 1200, 1700, 2150, 2750, 3350].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    crabs: [
      { x: 450, y: groundY - 45, width: 60, height: 45, speed: 2, direction: 1, minX: 380, maxX: 600, animTimer: 0, alive: true },
      { x: 750, y: groundY - 45, width: 60, height: 45, speed: 2.2, direction: -1, minX: 680, maxX: 900, animTimer: 0, alive: true },
      { x: 1050, y: groundY - 45, width: 60, height: 45, speed: 2.5, direction: 1, minX: 980, maxX: 1250, animTimer: 0, alive: true },
      { x: 1600, y: groundY - 45, width: 60, height: 45, speed: 2, direction: -1, minX: 1400, maxX: 1750, animTimer: 0, alive: true },
      { x: 2150, y: groundY - 45, width: 60, height: 45, speed: 3, direction: 1, minX: 1950, maxX: 2300, animTimer: 0, alive: true },
      { x: 2500, y: groundY - 45, width: 60, height: 45, speed: 2.4, direction: -1, minX: 2350, maxX: 2650, animTimer: 0, alive: true },
      { x: 2800, y: groundY - 45, width: 60, height: 45, speed: 2.5, direction: 1, minX: 2600, maxX: 2950, animTimer: 0, alive: true },
      { x: 3200, y: groundY - 45, width: 60, height: 45, speed: 2.8, direction: 1, minX: 3000, maxX: 3350, animTimer: 0, alive: true },
      { x: 3600, y: groundY - 45, width: 60, height: 45, speed: 3, direction: -1, minX: 3400, maxX: 3750, animTimer: 0, alive: true }
    ]
  },
  2: {
    bgKey: 'bg2',
    caves: [{ x: 500, w: 180, h: 160 }, { x: 1200, w: 200, h: 170 }, { x: 2000, w: 190, h: 165 }, { x: 2800, w: 210, h: 180 }, { x: 3400, w: 180, h: 160 }],
    items: [350, 800, 1300, 1800, 2300, 2900, 3500].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    crabs: [
      { x: 550, y: groundY - 45, width: 60, height: 45, speed: 2, direction: 1, minX: 480, maxX: 700, animTimer: 0, alive: true },
      { x: 2400, y: groundY - 45, width: 60, height: 45, speed: 2.5, direction: -1, minX: 2200, maxX: 2600, animTimer: 0, alive: true }
    ],
    bats: [
      { x: 650, y: groundY - 110, width: 50, height: 35, speed: 3, animTimer: 0, alive: true },
      { x: 900, y: groundY - 110, width: 50, height: 35, speed: 3, animTimer: 0, alive: true },
      { x: 1500, y: groundY - 120, width: 50, height: 35, speed: 3.2, animTimer: 0, alive: true },
      { x: 1850, y: groundY - 105, width: 50, height: 35, speed: 3.4, animTimer: 0, alive: true },
      { x: 2100, y: groundY - 130, width: 50, height: 35, speed: 3.5, animTimer: 0, alive: true },
      { x: 2700, y: groundY - 100, width: 50, height: 35, speed: 4, animTimer: 0, alive: true },
      { x: 3300, y: groundY - 140, width: 50, height: 35, speed: 3.5, animTimer: 0, alive: true }
    ]
  },
  3: {
    bgKey: 'bg3',
    items: [400, 1000, 1800, 2600, 3500].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    lavaPits: [{ x: 650, width: 80, height: 40, offset: 0 }, { x: 1400, width: 90, height: 40, offset: 0 }, { x: 2200, width: 85, height: 40, offset: 0 }, { x: 3000, width: 100, height: 40, offset: 0 }],
    fireballs: [
      { x: 600, y: groundY - 120, width: 45, height: 45, speed: 3.2, alive: true },
      { x: 800, y: groundY - 120, width: 45, height: 45, speed: 3.5, alive: true },
      { x: 1400, y: groundY - 130, width: 45, height: 45, speed: 3.8, alive: true },
      { x: 1750, y: groundY - 125, width: 45, height: 45, speed: 4.1, alive: true },
      { x: 2000, y: groundY - 140, width: 45, height: 45, speed: 4, alive: true },
      { x: 2600, y: groundY - 110, width: 45, height: 45, speed: 4.5, alive: true },
      { x: 3200, y: groundY - 150, width: 45, height: 45, speed: 4, alive: true }
    ]
  },
  4: {
    bgKey: 'bg4',
    items: [500, 1200, 2000, 2800, 3600].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    zombies: [
      { x: 500, y: groundY - 90, width: 90, height: 90, speed: 1.6, direction: -1, turnDelay: 0, alive: true },
      { x: 700, y: groundY - 90, width: 90, height: 90, speed: 1.8, direction: -1, turnDelay: 0, alive: true },
      { x: 1400, y: groundY - 90, width: 90, height: 90, speed: 2.0, direction: -1, turnDelay: 0, alive: true },
      { x: 1800, y: groundY - 90, width: 90, height: 90, speed: 2.1, direction: -1, turnDelay: 0, alive: true },
      { x: 2100, y: groundY - 90, width: 90, height: 90, speed: 2.1, direction: -1, turnDelay: 0, alive: true },
      { x: 2800, y: groundY - 90, width: 90, height: 90, speed: 2.2, direction: -1, turnDelay: 0, alive: true },
      { x: 3400, y: groundY - 90, width: 90, height: 90, speed: 2.0, direction: -1, turnDelay: 0, alive: true }
    ]
  },
  5: {
    bgKey: 'bg5',
    items: [600, 1400, 2200, 3000, 3600].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    spiders: [
      { x: 500, y: groundY - 70, width: 90, height: 70, speed: 1.8, direction: 1, minX: 400, maxX: 650, isAttacking: false, attackCooldown: 0, alive: true },
      { x: 700, y: groundY - 70, width: 90, height: 70, speed: 2, direction: 1, minX: 550, maxX: 900, isAttacking: false, attackCooldown: 0, alive: true },
      { x: 1400, y: groundY - 70, width: 90, height: 70, speed: 2, direction: -1, minX: 1200, maxX: 1600, isAttacking: false, attackCooldown: 0, alive: true },
      { x: 1800, y: groundY - 70, width: 90, height: 70, speed: 2.2, direction: -1, minX: 1650, maxX: 2000, isAttacking: false, attackCooldown: 0, alive: true },
      { x: 2100, y: groundY - 70, width: 90, height: 70, speed: 2.2, direction: 1, minX: 1900, maxX: 2300, isAttacking: false, attackCooldown: 0, alive: true },
      { x: 2800, y: groundY - 70, width: 90, height: 70, speed: 2.5, direction: 1, minX: 2600, maxX: 3000, isAttacking: false, attackCooldown: 0, alive: true },
      { x: 3400, y: groundY - 70, width: 90, height: 70, speed: 2.5, direction: -1, minX: 3200, maxX: 3600, isAttacking: false, attackCooldown: 0, alive: true }
    ],
    spiderWebs: []
  },
  6: {
    bgKey: 'bg6',
    items: [500, 1200, 2000, 2900, 3500].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    holes: [{ x: 800, width: 100 }, { x: 1600, width: 120 }, { x: 2500, width: 110 }, { x: 3200, width: 130 }],
    eagles: [
      { x: 600, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 2.8, direction: -1, minX: 400, maxX: 850, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true },
      { x: 900, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 3, direction: -1, minX: 600, maxX: 1200, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true },
      { x: 1800, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 3.2, direction: -1, minX: 1400, maxX: 2100, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true },
      { x: 2200, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 3.3, direction: -1, minX: 1950, maxX: 2450, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true },
      { x: 2600, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 3.5, direction: -1, minX: 2200, maxX: 2900, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true },
      { x: 3400, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 3.5, direction: -1, minX: 3000, maxX: 3700, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true }
    ]
  },
  7: {
    bgKey: 'bg7',
    items: [400, 1100, 1800, 2500, 3200].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    skeletons: [
      { x: 700, y: groundY - 90, width: 90, height: 90, facing: 'left', lookTimer: 0, attackCooldown: 0, postShootTimer: 0, alive: true },
      { x: 1400, y: groundY - 90, width: 90, height: 90, facing: 'right', lookTimer: 0, attackCooldown: 0, postShootTimer: 0, alive: true },
      { x: 2100, y: groundY - 90, width: 90, height: 90, facing: 'left', lookTimer: 0, attackCooldown: 0, postShootTimer: 0, alive: true },
      { x: 2800, y: groundY - 90, width: 90, height: 90, facing: 'right', lookTimer: 0, attackCooldown: 0, postShootTimer: 0, alive: true },
      { x: 3400, y: groundY - 90, width: 90, height: 90, facing: 'left', lookTimer: 0, attackCooldown: 0, postShootTimer: 0, alive: true }
    ],
    arrows: []
  },
  8: {
    bgKey: 'bg8',
    items: [500, 1200, 1900, 2600, 3300].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    slands: [
      { x: 500, y: groundY - 180, width: 180, height: 180, speed: 2.5, facing: 'left', state: 'chasing', animTimer: 0, stateTimer: 0, telScale: 1, telX: 0, telY: 0, alive: true },
      { x: 800, y: groundY - 180, width: 180, height: 180, speed: 2.5, facing: 'left', state: 'chasing', animTimer: 0, stateTimer: 0, telScale: 1, telX: 0, telY: 0, alive: true },
      { x: 1100, y: groundY - 180, width: 180, height: 180, speed: 2.6, facing: 'left', state: 'chasing', animTimer: 0, stateTimer: 0, telScale: 1, telX: 0, telY: 0, alive: true },
      { x: 1400, y: groundY - 180, width: 180, height: 180, speed: 2.6, facing: 'left', state: 'chasing', animTimer: 0, stateTimer: 0, telScale: 1, telX: 0, telY: 0, alive: true },
      { x: 1800, y: groundY - 180, width: 180, height: 180, speed: 2.7, facing: 'left', state: 'chasing', animTimer: 0, stateTimer: 0, telScale: 1, telX: 0, telY: 0, alive: true },
      { x: 2200, y: groundY - 180, width: 180, height: 180, speed: 2.8, facing: 'left', state: 'chasing', animTimer: 0, stateTimer: 0, telScale: 1, telX: 0, telY: 0, alive: true },
      { x: 2600, y: groundY - 180, width: 180, height: 180, speed: 2.8, facing: 'left', state: 'chasing', animTimer: 0, stateTimer: 0, telScale: 1, telX: 0, telY: 0, alive: true },
      { x: 3000, y: groundY - 180, width: 180, height: 180, speed: 2.9, facing: 'left', state: 'chasing', animTimer: 0, stateTimer: 0, telScale: 1, telX: 0, telY: 0, alive: true },
      { x: 3300, y: groundY - 180, width: 180, height: 180, speed: 3.0, facing: 'left', state: 'chasing', animTimer: 0, stateTimer: 0, telScale: 1, telX: 0, telY: 0, alive: true },
      { x: 3600, y: groundY - 180, width: 180, height: 180, speed: 3.1, facing: 'left', state: 'chasing', animTimer: 0, stateTimer: 0, telScale: 1, telX: 0, telY: 0, alive: true }
    ]
  }
};

let activeLevelData = null;

// =============================================================================
// 4. BEN E COLISÕES
// =============================================================================
const ben = {
  x: 50, y: 200, width: 90, height: 90,
  velocityX: 0, velocityY: 0, speed: 5, jumpForce: -13.5,
  grounded: false, facing: 'right', isAttacking: false, isDefending: false,
  attackTimer: 0, animTimer: 0, score: 0, alive: true
};

function isColliding(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

function loadLevel(lvl) {
  currentLevel = lvl;
  levelCompleted = false;
  ben.x = 50; ben.y = 200; ben.velocityX = 0; ben.velocityY = 0; ben.animTimer = 0; ben.alive = true; ben.isDefending = false;
  cameraX = 0;

  activeLevelData = JSON.parse(JSON.stringify(LEVELS_DATA[lvl]));
  gameState = 'playing';
}

function restartGame() {
  ben.score = 0;
  loadLevel(currentLevel);
}

function handleAction() {
  if (gameState !== 'playing') return false;
  if (levelCompleted) {
    if (currentLevel < 8) loadLevel(currentLevel + 1);
    else gameState = 'menu';
    return true;
  }
  if (!ben.alive) {
    restartGame();
    return true;
  }
  return false;
}

// =============================================================================
// 5. MENUS E CONTROLES DE TOQUE
// =============================================================================
const menuButtons = [
  { label: 'INÍCIO', x: canvas.width / 2 - 110, y: 180, width: 220, height: 55, action: () => startCutscene() },
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
  ctx.restore();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(label, x + width / 2, y + height / 2 + (fontSize / 3));
}

function handleCanvasClick(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const clickX = (clientX - rect.left) * scaleX;
  const clickY = (clientY - rect.top) * scaleY;

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
      if (clickX >= btn.x && clickX <= btn.x + btn.width && clickY >= btn.y && clickY <= btn.y + btn.height) btn.action();
    });
  } else if (gameState === 'level_select') {
    const btnW = 65, btnH = 50, gap = 15;
    const startX = canvas.width / 2 - ((5 * btnW + 4 * gap) / 2);

    for (let i = 1; i <= 10; i++) {
      const col = (i - 1) % 5, row = Math.floor((i - 1) / 5);
      const btnX = startX + col * (btnW + gap), btnY = 150 + row * (btnH + gap);
      if (clickX >= btnX && clickX <= btnX + btnW && clickY >= btnY && clickY <= btnY + btnH) {
        if (i <= 8) loadLevel(i);
      }
    }
    if (clickX >= canvas.width / 2 - 70 && clickX <= canvas.width / 2 + 70 && clickY >= 360 && clickY <= 405) gameState = 'menu';
  } else if (gameState === 'credits') {
    if (clickX >= canvas.width / 2 - 70 && clickX <= canvas.width / 2 + 70 && clickY >= 380 && clickY <= 425) gameState = 'menu';
  }
}

canvas.addEventListener('click', (e) => handleCanvasClick(e.clientX, e.clientY));
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) handleCanvasClick(e.touches[0].clientX, e.touches[0].clientY);
});

// Controles Teclado
const keys = { right: false, left: false, down: false };
window.addEventListener('keydown', (e) => {
  if (gameState !== 'playing' || handleAction()) return;

  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = true;

  if ((e.code === 'ArrowUp' || e.code === 'KeyW') && ben.grounded && ben.alive && !ben.isDefending) {
    ben.velocityY = ben.jumpForce; ben.grounded = false;
  }

  if (e.code === 'Space' && !ben.isAttacking && ben.alive && !ben.isDefending) {
    ben.isAttacking = true; ben.attackTimer = 15;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = false;
});

// Controles Touch Botoes
const btnLeft = document.getElementById('btnLeft'), btnRight = document.getElementById('btnRight');
const btnJump = document.getElementById('btnJump'), btnAttack = document.getElementById('btnAttack');

function bindTouchBtn(el, onPress, onRelease) {
  if (!el) return;
  el.addEventListener('touchstart', (e) => { e.preventDefault(); onPress(); }, { passive: false });
  el.addEventListener('touchend', (e) => { e.preventDefault(); onRelease(); }, { passive: false });
}

bindTouchBtn(btnLeft, () => { if (ben.alive && gameState === 'playing') keys.left = true; }, () => keys.left = false);
bindTouchBtn(btnRight, () => { if (ben.alive && gameState === 'playing') keys.right = true; }, () => keys.right = false);

bindTouchBtn(btnJump, () => {
  if (!handleAction() && ben.grounded && gameState === 'playing' && !ben.isDefending) {
    ben.velocityY = ben.jumpForce; ben.grounded = false;
  }
}, () => {});

bindTouchBtn(btnAttack, () => {
  if (!handleAction() && !ben.isAttacking && ben.alive && gameState === 'playing' && !ben.isDefending) {
    ben.isAttacking = true; ben.attackTimer = 15;
  }
}, () => {});

// =============================================================================
// 6. LÓGICA DE ATUALIZAÇÃO DO JOGO (UPDATE)
// =============================================================================
function update() {
  if (gameState !== 'playing' || levelCompleted || !ben.alive) return;

  globalWalkTimer += 0.2;

  if (keys.down && ben.grounded) {
    ben.isDefending = true;
    ben.velocityX = 0;
  } else {
    ben.isDefending = false;
  }

  if (!ben.isDefending) {
    if (keys.right) {
      ben.velocityX = ben.speed; ben.facing = 'right'; ben.animTimer += 0.2;
    } else if (keys.left) {
      ben.velocityX = -ben.speed; ben.facing = 'left'; ben.animTimer += 0.2;
    } else {
      ben.velocityX = 0; ben.animTimer = 0;
    }
  }

  ben.x += ben.velocityX;
  ben.y += ben.velocityY;

  if (!ben.grounded) ben.velocityY += gravity;

  if (ben.y + ben.height >= groundY) {
    ben.y = groundY - ben.height; ben.velocityY = 0; ben.grounded = true;
  } else {
    ben.grounded = false;
  }

  ben.x = Math.max(0, Math.min(levelWidth - ben.width, ben.x));

  if (ben.x > canvas.width / 2 && ben.x < levelWidth - canvas.width / 2) cameraX = ben.x - canvas.width / 2;
  else if (ben.x <= canvas.width / 2) cameraX = 0;
  else if (ben.x >= levelWidth - canvas.width / 2) cameraX = levelWidth - canvas.width;

  const attackArea = ben.isAttacking ? {
    x: ben.facing === 'right' ? ben.x + ben.width : ben.x - 35,
    y: ben.y, width: 45, height: ben.height
  } : null;

  if (ben.isAttacking) {
    ben.attackTimer--;
    if (ben.attackTimer <= 0) ben.isAttacking = false;
  }

  const data = activeLevelData;

  data.items?.forEach(item => {
    if (!item.collected && isColliding(ben, { x: item.x, y: item.y, width: item.size, height: item.size })) {
      item.collected = true; ben.score += 10;
    }
  });

  data.crabs?.forEach(crab => {
    if (crab.alive) {
      crab.x += crab.speed * crab.direction;
      crab.animTimer += 0.2;
      if (crab.x <= crab.minX || crab.x + crab.width >= crab.maxX) crab.direction *= -1;

      if (isColliding(ben, crab)) {
        if (ben.isDefending) {
          crab.direction *= -1; crab.x += crab.direction * 30;
        } else {
          ben.alive = false;
        }
      }

      if (attackArea && isColliding(attackArea, crab)) {
        const isBackAttack = (ben.facing === 'right' && crab.direction === 1) || (ben.facing === 'left' && crab.direction === -1);
        if (isBackAttack) { crab.alive = false; ben.score += 50; }
      }
    }
  });

  data.bats?.forEach(bat => {
    if (bat.alive) {
      bat.x -= bat.speed;
      bat.animTimer += 0.2;
      if (bat.x + bat.width < cameraX) bat.x = cameraX + canvas.width + 400;

      if (isColliding(ben, bat)) {
        if (ben.isDefending) bat.x += 120;
        else ben.alive = false;
      }

      if (attackArea && isColliding(attackArea, bat)) { bat.alive = false; ben.score += 60; }
    }
  });

  data.lavaPits?.forEach(pit => {
    pit.offset += 0.08;
    if (ben.x + ben.width > pit.x + 10 && ben.x < pit.x + pit.width - 10 && ben.y + ben.height >= groundY - 10) {
      ben.alive = false;
    }
  });

  data.fireballs?.forEach(fb => {
    if (fb.alive) {
      fb.x -= fb.speed;
      if (fb.x + fb.width < cameraX) fb.x = cameraX + canvas.width + 300;

      if (isColliding(ben, fb)) {
        if (ben.isDefending) fb.x += 150;
        else ben.alive = false;
      }

      if (attackArea && isColliding(attackArea, fb)) { fb.alive = false; ben.score += 70; }
    }
  });

  data.zombies?.forEach(zombie => {
    if (zombie.alive) {
      const desiredDir = ben.x > zombie.x ? 1 : -1;
      if (desiredDir !== zombie.direction) {
        if (++zombie.turnDelay > 30) { zombie.direction = desiredDir; zombie.turnDelay = 0; }
      } else zombie.turnDelay = 0;

      zombie.x += zombie.speed * zombie.direction;
      const hitbox = { x: zombie.x + 10, y: zombie.y + 15, width: zombie.width - 20, height: zombie.height - 15 };

      if (isColliding(ben, hitbox)) {
        if (ben.isDefending) { zombie.direction *= -1; zombie.x += zombie.direction * 40; }
        else ben.alive = false;
      }

      if (attackArea && isColliding(attackArea, zombie)) { zombie.alive = false; ben.score += 80; }
    }
  });

  data.spiders?.forEach(spider => {
    if (spider.alive) {
      const dist = Math.abs(ben.x - spider.x);
      if (dist < 350) {
        spider.isAttacking = true;
        spider.direction = ben.x > spider.x ? 1 : -1;
        if (spider.attackCooldown <= 0) {
          data.spiderWebs.push({
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

      if (isColliding(ben, spider)) {
        if (ben.isDefending) { spider.direction *= -1; spider.x += spider.direction * 30; }
        else ben.alive = false;
      }

      if (attackArea && isColliding(attackArea, spider)) { spider.alive = false; ben.score += 100; }
    }
  });

  data.spiderWebs?.forEach(web => {
    if (web.alive) {
      web.x += web.speed;
      if (isColliding(ben, web)) {
        if (!ben.isDefending) ben.alive = false;
        web.alive = false;
      }
      if (web.x < cameraX - 100 || web.x > cameraX + canvas.width + 100) web.alive = false;
    }
  });

  data.holes?.forEach(hole => {
    if (ben.x + ben.width > hole.x + 20 && ben.x < hole.x + hole.width - 20 && ben.y + ben.height >= groundY - 5) {
      ben.alive = false;
    }
  });

  data.eagles?.forEach(eagle => {
    if (eagle.alive) {
      eagle.wingFlapTimer += 0.15;
      if (eagle.state === 'patrol') {
        eagle.x += eagle.speedX * eagle.direction;
        if (eagle.x <= eagle.minX || eagle.x + eagle.width >= eagle.maxX) eagle.direction *= -1;
        if (Math.abs(ben.x - eagle.x) < 400 && ben.x < eagle.x) {
          eagle.state = 'aiming'; eagle.aimTimer = 45; eagle.targetX = ben.x; eagle.targetY = ben.y;
        }
      } else if (eagle.state === 'aiming') {
        if (--eagle.aimTimer <= 0) eagle.state = 'attacking';
      } else if (eagle.state === 'attacking') {
        const angle = Math.atan2(eagle.targetY - eagle.y, eagle.targetX - eagle.x);
        eagle.x += Math.cos(angle) * 8; eagle.y += Math.sin(angle) * 8;
        if (eagle.y >= groundY - 80 || eagle.x <= eagle.targetX + 20) eagle.state = 'back_attack';
      } else if (eagle.state === 'back_attack') {
        eagle.x += 8.5;
        if (eagle.x > ben.x + 350) eagle.state = 'returning';
      } else if (eagle.state === 'returning') {
        eagle.y -= 4;
        if (eagle.y <= eagle.baseY) { eagle.y = eagle.baseY; eagle.state = 'patrol'; }
      }

      if (isColliding(ben, eagle)) {
        if (ben.isDefending) eagle.state = 'back_attack';
        else ben.alive = false;
      }

      if (attackArea && isColliding(attackArea, eagle)) { eagle.alive = false; ben.score += 120; }
    }
  });

  data.skeletons?.forEach(skel => {
    if (skel.alive) {
      const dist = Math.abs(ben.x - skel.x);

      skel.lookTimer += 0.05;
      if (dist >= 500 && Math.floor(skel.lookTimer) % 2 === 0) {
        skel.facing = (Math.floor(skel.lookTimer / 2) % 2 === 0) ? 'left' : 'right';
      }

      if (dist < 500) {
        skel.facing = ben.x < skel.x ? 'left' : 'right';
        skel.isAttacking = true;

        if (skel.attackCooldown <= 0) {
          const startX = skel.facing === 'left' ? skel.x - 20 : skel.x + skel.width;
          const startY = skel.y + 25;
          const targetX = ben.x + ben.width / 2;
          const targetY = ben.y + ben.height / 2;

          const dx = targetX - startX;
          const arrowGrav = 0.22;
          const timeToTarget = Math.max(30, Math.min(60, Math.abs(dx) / 8));
          
          const calculatedVx = dx / timeToTarget;
          const calculatedVy = ((targetY - startY) - (0.5 * arrowGrav * timeToTarget * timeToTarget)) / timeToTarget;

          data.arrows.push({
            x: startX, y: startY, width: 60, height: 22,
            vx: calculatedVx, vy: calculatedVy, gravity: arrowGrav, alive: true
          });

          skel.attackCooldown = 110;
          skel.postShootTimer = 25;
        }
      } else {
        skel.isAttacking = false;
      }

      if (skel.attackCooldown > 0) skel.attackCooldown--;
      if (skel.postShootTimer > 0) skel.postShootTimer--;

      if (isColliding(ben, skel)) {
        if (ben.isDefending) skel.x += (skel.x > ben.x ? 30 : -30);
        else ben.alive = false;
      }

      if (attackArea && isColliding(attackArea, skel)) { skel.alive = false; ben.score += 150; }
    }
  });

  data.arrows?.forEach(arrow => {
    if (arrow.alive) {
      arrow.x += arrow.vx;
      arrow.y += arrow.vy;
      arrow.vy += arrow.gravity;

      if (isColliding(ben, arrow)) {
        if (!ben.isDefending) ben.alive = false;
        arrow.alive = false;
      }

      if (arrow.y >= groundY - 10 || arrow.x < cameraX - 100 || arrow.x > cameraX + canvas.width + 100) {
        arrow.alive = false;
      }
    }
  });

  data.slands?.forEach(sland => {
    if (sland.alive) {
      const slandCenterX = sland.x + sland.width / 2;
      const benCenterX = ben.x + ben.width / 2;
      const distToBen = Math.abs(benCenterX - slandCenterX);

      sland.animTimer += 0.2;

      if (sland.state === 'chasing') {
        sland.facing = ben.x < sland.x ? 'left' : 'right';
        const dir = sland.facing === 'left' ? -1 : 1;
        sland.x += sland.speed * dir;

        if (distToBen < 220) {
          sland.state = 'teleporting_out';
          sland.telScale = 1.0;
          sland.telX = sland.x;
          sland.telY = sland.y;
        }
      } 
      else if (sland.state === 'teleporting_out') {
        sland.telScale -= 0.12; 
        if (sland.telScale <= 0) {
          if (ben.facing === 'right') {
            sland.x = ben.x - sland.width + 30;
            sland.facing = 'right';
          } else {
            sland.x = ben.x + ben.width - 30;
            sland.facing = 'left';
          }

          sland.state = 'teleporting_in';
          sland.telScale = 1.0;
          sland.telX = sland.x;
          sland.telY = sland.y;
        }
      } 
      else if (sland.state === 'teleporting_in') {
        sland.telScale -= 0.12;
        if (sland.telScale <= 0) {
          sland.state = 'waiting_behind';
          sland.stateTimer = 35;
        }
      } 
      else if (sland.state === 'waiting_behind') {
        sland.stateTimer--;
        if (sland.stateTimer <= 0) {
          sland.state = 'attacking';
          sland.stateTimer = 25;
        }
      } 
      else if (sland.state === 'attacking') {
        sland.stateTimer--;
        const rushDir = sland.facing === 'right' ? 1 : -1;
        sland.x += rushDir * 12;

        if (isColliding(ben, sland)) {
          const attackFromLeft = sland.x < ben.x;
          const isDefendingCorrectly = ben.isDefending && ((attackFromLeft && ben.facing === 'left') || (!attackFromLeft && ben.facing === 'right'));

          if (isDefendingCorrectly) {
            sland.x += (sland.facing === 'left' ? 140 : -140);
            sland.state = 'rebound';
            sland.telScale = 1.0;
            sland.telX = sland.x;
            sland.telY = sland.y;
          } else {
            ben.alive = false;
          }
        }

        if (sland.stateTimer <= 0 && sland.state === 'attacking') {
          sland.state = 'rebound';
          sland.telScale = 1.0;
          sland.telX = sland.x;
          sland.telY = sland.y;
        }
      }
      else if (sland.state === 'rebound') {
        sland.telScale -= 0.12;
        if (sland.telScale <= 0) {
          const side = Math.random() < 0.5 ? -1 : 1;
          const offset = 250 + Math.random() * 200;
          sland.x = Math.max(100, Math.min(levelWidth - 250, ben.x + (side * offset)));
          sland.state = 'chasing';
        }
      }

      if (attackArea && isColliding(attackArea, sland) && sland.state !== 'teleporting_out' && sland.state !== 'teleporting_in') {
        sland.alive = false;
        ben.score += 200;
      }
    }
  });

  const remainingSlands = data.slands ? data.slands.filter(s => s.alive).length : 0;
  const benCenterX = ben.x + ben.width / 2, benCenterY = ben.y + ben.height / 2;

  if (currentLevel === 8) {
    if (remainingSlands === 0 &&
        benCenterX >= abductionLight.x + 20 && benCenterX <= abductionLight.x + abductionLight.width - 20 &&
        benCenterY >= abductionLight.y && benCenterY <= abductionLight.y + abductionLight.height) {
      levelCompleted = true;
    }
  } else {
    if (benCenterX >= portal.x + 30 && benCenterX <= portal.x + portal.width - 30 &&
        benCenterY >= portal.y + 30 && benCenterY <= portal.y + portal.height) {
      levelCompleted = true;
    }
  }
}

// =============================================================================
// 7. DESENHO NA TELA (DRAW)
// =============================================================================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === 'cutscene') {
    if (!cutsceneVideo.paused && !cutsceneVideo.ended) {
      ctx.drawImage(cutsceneVideo, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    return;
  }

  if (gameState === 'menu') {
    ctx.drawImage(images.menuBg, 0, 0, canvas.width, canvas.height);
    menuButtons.forEach(btn => drawTechButton(btn.x, btn.y, btn.width, btn.height, btn.label));
    return;
  }

  if (gameState === 'level_select') {
    ctx.fillStyle = '#0a0f24'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const btnW = 65, btnH = 50, gap = 15;
    const startX = canvas.width / 2 - ((5 * btnW + 4 * gap) / 2);

    for (let i = 1; i <= 10; i++) {
      const col = (i - 1) % 5, row = Math.floor((i - 1) / 5);
      drawTechButton(startX + col * (btnW + gap), 150 + row * (btnH + gap), btnW, btnH, `${i}`, 18);
    }
    drawTechButton(canvas.width / 2 - 70, 360, 140, 45, 'VOLTAR', 18);
    return;
  }

  if (gameState === 'credits') {
    ctx.fillStyle = '#0a0f24'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ffff'; ctx.font = 'bold 32px Arial'; ctx.textAlign = 'center';
    ctx.fillText('CRÉDITOS', canvas.width / 2, 120);
    ctx.fillStyle = '#ffffff'; ctx.font = '20px Arial';
    ctx.fillText("Desenvolvido para Ben's Adventures", canvas.width / 2, 200);
    drawTechButton(canvas.width / 2 - 70, 380, 140, 45, 'VOLTAR', 18);
    ctx.textAlign = 'left';
    return;
  }

  ctx.save();
  ctx.translate(-cameraX, 0);

  const data = activeLevelData;

  ctx.drawImage(images[data.bgKey], 0, 0, levelWidth, canvas.height);

  data.trees?.forEach(t => ctx.drawImage(images.tree, t.x, groundY - t.h, t.w, t.h));
  data.caves?.forEach(c => ctx.drawImage(images.cave, c.x, groundY - c.h, c.w, c.h));
  data.lavaPits?.forEach(pit => {
    ctx.fillStyle = '#171717'; ctx.fillRect(pit.x, groundY, pit.width, 50);
    const waveY = Math.sin(pit.offset) * 3, slideX = (pit.offset * 8) % 15;
    ctx.drawImage(images.waterfire, pit.x - slideX, groundY + waveY, pit.width + 15, pit.height);
  });
  data.holes?.forEach(hole => {
    ctx.fillStyle = '#000000'; ctx.fillRect(hole.x, groundY, hole.width, 50);
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 3; ctx.strokeRect(hole.x, groundY, hole.width, 50);
  });

  const remainingSlands = data.slands ? data.slands.filter(s => s.alive).length : 0;
  if (currentLevel === 8) {
    if (remainingSlands === 0) {
      abductionLight.flipTimer += 0.12;
      const isFlipped = Math.floor(abductionLight.flipTimer) % 2 === 0;

      ctx.save();
      if (isFlipped) {
        ctx.translate(abductionLight.x + abductionLight.width, abductionLight.y);
        ctx.scale(-1, 1);
        ctx.drawImage(images.luz, 0, 0, abductionLight.width, abductionLight.height);
      } else {
        ctx.drawImage(images.luz, abductionLight.x, abductionLight.y, abductionLight.width, abductionLight.height);
      }
      ctx.restore();
    }
  } else {
    ctx.drawImage(images.portal, portal.x, portal.y, portal.width, portal.height);
  }

  data.items?.forEach(item => { if (!item.collected) ctx.drawImage(images.coin, item.x, item.y, item.size, item.size); });

  data.crabs?.forEach(crab => {
    if (crab.alive) {
      const frame = (Math.floor(crab.animTimer) % 4) + 1;
      const dirKey = crab.direction === 1 ? 'crabRight' : 'crabLeft';
      ctx.drawImage(images[`${dirKey}${frame}`], crab.x, crab.y, crab.width, crab.height);
    }
  });

  data.bats?.forEach(bat => {
    if (bat.alive) {
      const frame = (Math.floor(bat.animTimer) % 4) + 1;
      ctx.drawImage(images[`bat${frame}`], bat.x, bat.y, bat.width, bat.height);
    }
  });

  data.fireballs?.forEach(fb => { if (fb.alive) ctx.drawImage(images.fireball, fb.x, fb.y, fb.width, fb.height); });
  data.zombies?.forEach((z, idx) => {
    if (z.alive) {
      const img = z.direction === 1 ? images.zombieRight : images.zombieLeft;
      ctx.drawImage(img, z.x, z.y - Math.abs(Math.sin(globalWalkTimer * 1.5 + idx)) * 5, z.width, z.height);
    }
  });
  data.spiders?.forEach((s, idx) => {
    if (s.alive) {
      let img = s.direction === 1 ? images.spiderRight : images.spiderLeft;
      if (s.isAttacking) img = images.spiderAttack;
      ctx.drawImage(img, s.x, s.y - (s.isAttacking ? 0 : Math.abs(Math.sin(globalWalkTimer * 2.5 + idx)) * 4), s.width, s.height);
    }
  });
  data.spiderWebs?.forEach(web => { if (web.alive) ctx.drawImage(images.web, web.x, web.y, web.width, web.height); });
  data.eagles?.forEach(e => {
    if (e.alive) {
      let img = Math.floor(e.wingFlapTimer) % 2 === 0 ? images.eagle1 : images.eagle2;
      if (e.state === 'attacking') img = images.eagleAttack;
      else if (e.state === 'back_attack') img = images.eagleAttack2;
      ctx.drawImage(img, e.x, e.y, e.width, e.height);
    }
  });

  data.skeletons?.forEach(skel => {
    if (skel.alive) {
      let img = skel.facing === 'left' ? images.esqueletoLeft : images.esqueletoRight;
      if (skel.isAttacking) {
        img = skel.postShootTimer > 0 ? images.esqueletoAtk2 : images.esqueletoAtk;
      }
      ctx.drawImage(img, skel.x, skel.y, skel.width, skel.height);
    }
  });

  data.arrows?.forEach(arrow => {
    if (arrow.alive) {
      ctx.save();
      ctx.translate(arrow.x + arrow.width / 2, arrow.y + arrow.height / 2);
      let angle = Math.atan2(arrow.vy, arrow.vx);
      ctx.rotate(angle);
      ctx.scale(-1, 1);
      ctx.drawImage(images.flecha, -arrow.width / 2, -arrow.height / 2, arrow.width, arrow.height);
      ctx.restore();
    }
  });

  data.slands?.forEach(sland => {
    if (sland.alive) {
      if ((sland.state === 'teleporting_out' || sland.state === 'teleporting_in' || sland.state === 'rebound') && sland.telScale > 0) {
        ctx.save();
        const currentW = sland.width * sland.telScale;
        const currentH = sland.height * sland.telScale;
        const drawX = sland.telX + (sland.width - currentW) / 2;
        const drawY = sland.telY + (sland.height - currentH) / 2;

        ctx.drawImage(images.tel, drawX, drawY, currentW, currentH);
        ctx.restore();
      }

      if (sland.state === 'chasing' || sland.state === 'waiting_behind' || sland.state === 'attacking') {
        ctx.save();

        let imgKey = 'sland1';
        if (sland.state === 'attacking') imgKey = 'slandAtk';
        else if (sland.state === 'waiting_behind') imgKey = 'sland1';
        else {
          const frame = (Math.floor(sland.animTimer) % 3) + 1;
          imgKey = `sland${frame}`;
        }

        if (sland.facing === 'right') {
          ctx.translate(sland.x + sland.width, sland.y);
          ctx.scale(-1, 1);
          ctx.drawImage(images[imgKey], 0, 0, sland.width, sland.height);
        } else {
          ctx.drawImage(images[imgKey], sland.x, sland.y, sland.width, sland.height);
        }

        ctx.restore();
      }
    }
  });

  if (ben.alive) {
    if (ben.isDefending) {
      const img = ben.facing === 'right' ? images.benDefRight : images.benDefLeft;
      ctx.drawImage(img, ben.x, ben.y, ben.width, ben.height);
    } else if (ben.isAttacking) {
      const img = ben.facing === 'right' ? images.benAttackRight : images.benAttackLeft;
      ctx.drawImage(img, ben.facing === 'right' ? ben.x : ben.x - 20, ben.y, ben.width + 20, ben.height);
    } else if (ben.velocityX !== 0) {
      const frame = (Math.floor(ben.animTimer) % 4) + 1;
      const dirKey = ben.facing === 'right' ? 'benRight' : 'benLeft';
      ctx.drawImage(images[`${dirKey}${frame}`], ben.x, ben.y, ben.width, ben.height);
    } else {
      ctx.save();
      if (ben.facing === 'left') {
        ctx.translate(ben.x + ben.width, ben.y); ctx.scale(-1, 1);
        ctx.drawImage(images.ben, 0, 0, ben.width, ben.height);
      } else {
        ctx.drawImage(images.ben, ben.x, ben.y, ben.width, ben.height);
      }
      ctx.restore();
    }
  }

  ctx.restore();

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
    if (currentLevel < 8) {
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

// =============================================================================
// 8. LOOP PRINCIPAL
// =============================================================================
function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  if (!lastFrameTime) lastFrameTime = timestamp;
  const elapsed = timestamp - lastFrameTime;

  if (elapsed > fpsInterval) {
    lastFrameTime = timestamp - (elapsed % fpsInterval);
    update();
    draw();
  }
}

requestAnimationFrame(gameLoop);