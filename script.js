// =============================================================================
// 1. CONFIGURAÇÕES INICIAIS E CANVAS
// =============================================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Estados globais de controle do jogo
let gameState = 'menu'; // 'menu', 'level_select', 'credits', 'playing'
let currentLevel = 1;   // Nível atual (1 a 6 disponíveis)
let levelCompleted = false;
let cameraX = 0;
let globalWalkTimer = 0; // Temporizador para animações de caminhada

const levelWidth = 4000;
const gravity = 0.6;
const groundY = canvas.height - 50;

// Portal de fim de fase (posição e dimensão padrão)
const portal = { x: 3750, y: groundY - 180, width: 180, height: 180 };

// Botão fixo de retorno ao menu durante a partida
const inGameMenuBtn = { x: canvas.width - 110, y: 15, width: 90, height: 35 };

// =============================================================================
// 2. SISTEMA COMPACTO DE CARREGAMENTO DE IMAGENS
// =============================================================================
const images = {};
function loadImg(key, src) {
  const img = new Image();
  img.src = src;
  images[key] = img;
  return img;
}

// Carregamento de Sprites Globais e do Personagem Ben
loadImg('menuBg', 'inicio.png');
loadImg('ben', 'ben.png'); // Pose parado
loadImg('benAttackRight', 'ben_attack_right.png');
loadImg('benAttackLeft', 'ben_attack_left.png');
loadImg('benDefRight', 'ben_right_def.png');
loadImg('benDefLeft', 'ben_left_def.png');

// Sprites de Animação de Corrida do Ben (4 Quadros para cada direção)
for (let i = 1; i <= 4; i++) {
  loadImg(`benRight${i}`, `ben_right${i}.png`);
  loadImg(`benLeft${i}`, `ben_left${i}.png`);
}

loadImg('coin', 'moeda.png');
loadImg('portal', 'portal.png');

// Sprites de Caranguejos (Animação de 4 Quadros)
for (let i = 1; i <= 4; i++) {
  loadImg(`crabLeft${i}`, `crab_left${i}.png`);
  loadImg(`crabRight${i}`, `crab_right${i}.png`);
}

// Outros Elementos das Fases
loadImg('tree', 'tree.png'); loadImg('cave', 'cave.png');

// Morcegos da Fase 2 (Animação de 4 Quadros)
for (let i = 1; i <= 4; i++) {
  loadImg(`bat${i}`, `bat${i}.png`);
}

loadImg('fireball', 'fireball.png'); loadImg('waterfire', 'waterfire.png');
loadImg('zombieLeft', 'zombie_left.png'); loadImg('zombieRight', 'zombie_right.png');
loadImg('spiderLeft', 'spider_left.png'); loadImg('spiderRight', 'spider_right.png');
loadImg('spiderAttack', 'spider_atack.png'); loadImg('web', 'teia.png');
loadImg('eagle1', 'aguia1.png'); loadImg('eagle2', 'aguia2.png');
loadImg('eagleAttack', 'aguia_atack.png'); loadImg('eagleAttack2', 'aguia_atack2.png');

// Imagens de Fundo das Fases (.jfif)
for (let i = 1; i <= 6; i++) {
  loadImg(`bg${i}`, `tela${i}.jfif`);
}

// =============================================================================
// 3. ESTRUTURA CENTRALIZADA DE DADOS DAS FASES (LEVELS_DATA)
// =============================================================================
const LEVELS_DATA = {
  1: {
    bgKey: 'bg1',
    trees: [{ x: 400, w: 140, h: 180 }, { x: 900, w: 150, h: 190 }, { x: 1500, w: 140, h: 180 }, { x: 2100, w: 160, h: 200 }, { x: 2700, w: 140, h: 180 }, { x: 3300, w: 150, h: 190 }],
    items: [300, 700, 1200, 1700, 2150, 2750, 3350].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    crabs: [
      { x: 550, y: groundY - 45, width: 60, height: 45, speed: 2, direction: 1, minX: 480, maxX: 700, animTimer: 0, alive: true },
      { x: 1050, y: groundY - 45, width: 60, height: 45, speed: 2.5, direction: 1, minX: 980, maxX: 1250, animTimer: 0, alive: true },
      { x: 1600, y: groundY - 45, width: 60, height: 45, speed: 2, direction: -1, minX: 1400, maxX: 1750, animTimer: 0, alive: true },
      { x: 2150, y: groundY - 45, width: 60, height: 45, speed: 3, direction: 1, minX: 1950, maxX: 2300, animTimer: 0, alive: true },
      { x: 2800, y: groundY - 45, width: 60, height: 45, speed: 2.5, direction: 1, minX: 2600, maxX: 2950, animTimer: 0, alive: true },
      { x: 3200, y: groundY - 45, width: 60, height: 45, speed: 2.8, direction: 1, minX: 3000, maxX: 3350, animTimer: 0, alive: true },
      { x: 3600, y: groundY - 45, width: 60, height: 45, speed: 3, direction: -1, minX: 3400, maxX: 3750, animTimer: 0, alive: true }
    ]
  },
  2: {
    bgKey: 'bg2',
    caves: [{ x: 500, w: 180, h: 160 }, { x: 1200, w: 200, h: 170 }, { x: 2000, w: 190, h: 165 }, { x: 2800, w: 210, h: 180 }, { x: 3400, w: 180, h: 160 }],
    items: [350, 800, 1300, 1800, 2300, 2900, 3500].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    crabs: [{ x: 550, y: groundY - 45, width: 60, height: 45, speed: 2, direction: 1, minX: 480, maxX: 700, animTimer: 0, alive: true }],
    bats: [
      { x: 900, y: groundY - 110, width: 50, height: 35, speed: 3, animTimer: 0, alive: true },
      { x: 1500, y: groundY - 120, width: 50, height: 35, speed: 3.2, animTimer: 0, alive: true },
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
      { x: 800, y: groundY - 120, width: 45, height: 45, speed: 3.5, alive: true },
      { x: 1400, y: groundY - 130, width: 45, height: 45, speed: 3.8, alive: true },
      { x: 2000, y: groundY - 140, width: 45, height: 45, speed: 4, alive: true },
      { x: 2600, y: groundY - 110, width: 45, height: 45, speed: 4.5, alive: true },
      { x: 3200, y: groundY - 150, width: 45, height: 45, speed: 4, alive: true }
    ]
  },
  4: {
    bgKey: 'bg4',
    items: [500, 1200, 2000, 2800, 3600].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    zombies: [
      { x: 700, y: groundY - 90, width: 90, height: 90, speed: 1.8, direction: -1, turnDelay: 0, alive: true },
      { x: 1400, y: groundY - 90, width: 90, height: 90, speed: 2.0, direction: -1, turnDelay: 0, alive: true },
      { x: 2100, y: groundY - 90, width: 90, height: 90, speed: 2.1, direction: -1, turnDelay: 0, alive: true },
      { x: 2800, y: groundY - 90, width: 90, height: 90, speed: 2.2, direction: -1, turnDelay: 0, alive: true },
      { x: 3400, y: groundY - 90, width: 90, height: 90, speed: 2.0, direction: -1, turnDelay: 0, alive: true }
    ]
  },
  5: {
    bgKey: 'bg5',
    items: [600, 1400, 2200, 3000, 3600].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    spiders: [
      { x: 700, y: groundY - 70, width: 90, height: 70, speed: 2, direction: 1, minX: 550, maxX: 900, isAttacking: false, attackCooldown: 0, alive: true },
      { x: 1400, y: groundY - 70, width: 90, height: 70, speed: 2, direction: -1, minX: 1200, maxX: 1600, isAttacking: false, attackCooldown: 0, alive: true },
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
      { x: 900, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 3, direction: -1, minX: 600, maxX: 1200, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true },
      { x: 1800, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 3.2, direction: -1, minX: 1400, maxX: 2100, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true },
      { x: 2600, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 3.5, direction: -1, minX: 2200, maxX: 2900, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true },
      { x: 3400, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 3.5, direction: -1, minX: 3000, maxX: 3700, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true }
    ]
  }
};

let activeLevelData = null;

// =============================================================================
// 4. ATRIBUTOS DO PERSONAGEM BEN
// =============================================================================
const ben = {
  x: 50, y: 200, width: 90, height: 90,
  velocityX: 0, velocityY: 0, speed: 5, jumpForce: -13.5,
  grounded: false, facing: 'right', isAttacking: false, isDefending: false,
  attackTimer: 0, animTimer: 0, score: 0, alive: true
};

// =============================================================================
// 5. FUNÇÕES DE SUPORTE E COLISÃO
// =============================================================================
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
    if (currentLevel < 6) loadLevel(currentLevel + 1);
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
// 6. INTERFACE DE BOTÕES E MENUS
// =============================================================================
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
      if (clickX >= btn.x && clickX <= btn.x + btn.width && clickY >= btn.y && clickY <= btn.y + btn.height) btn.action();
    });
  } else if (gameState === 'level_select') {
    const btnW = 65, btnH = 50, gap = 15;
    const startX = canvas.width / 2 - ((5 * btnW + 4 * gap) / 2);

    for (let i = 1; i <= 10; i++) {
      const col = (i - 1) % 5, row = Math.floor((i - 1) / 5);
      const btnX = startX + col * (btnW + gap), btnY = 150 + row * (btnH + gap);
      if (clickX >= btnX && clickX <= btnX + btnW && clickY >= btnY && clickY <= btnY + btnH) {
        if (i <= 6) loadLevel(i);
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

// Controles Teclado (Inclusão da Tecla "Down" para Defesa)
const keys = { right: false, left: false, down: false };
window.addEventListener('keydown', (e) => {
  if (gameState !== 'playing' || handleAction()) return;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = true;
  if ((e.code === 'ArrowUp' || e.code === 'KeyW') && ben.grounded && ben.alive && !ben.isDefending) { ben.velocityY = ben.jumpForce; ben.grounded = false; }
  if (e.code === 'Space' && !ben.isAttacking && ben.alive && !ben.isDefending) { ben.isAttacking = true; ben.attackTimer = 15; }
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = false;
});

// Controles Touch
const btnLeft = document.getElementById('btnLeft'), btnRight = document.getElementById('btnRight');
const btnJump = document.getElementById('btnJump'), btnAttack = document.getElementById('btnAttack');

if (btnLeft && btnRight && btnJump) {
  btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); if (ben.alive && gameState === 'playing') keys.left = true; });
  btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); keys.left = false; });
  btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); if (ben.alive && gameState === 'playing') keys.right = true; });
  btnRight.addEventListener('touchend', (e) => { e.preventDefault(); keys.left = false; });
  btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); if (!handleAction() && ben.grounded && gameState === 'playing' && !ben.isDefending) { ben.velocityY = ben.jumpForce; ben.grounded = false; } });
}
if (btnAttack) {
  btnAttack.addEventListener('touchstart', (e) => { e.preventDefault(); if (!handleAction() && !ben.isAttacking && ben.alive && gameState === 'playing' && !ben.isDefending) { ben.isAttacking = true; ben.attackTimer = 15; } });
}

// =============================================================================
// 7. LÓGICA DE ATUALIZAÇÃO DO JOGO (UPDATE)
// =============================================================================
function update() {
  if (gameState !== 'playing' || levelCompleted || !ben.alive) return;

  globalWalkTimer += 0.2;

  // Lógica da Defesa (Seta para baixo no chão trava o movimento e ativa defesa)
  if (keys.down && ben.grounded) {
    ben.isDefending = true;
    ben.velocityX = 0;
  } else {
    ben.isDefending = false;
  }

  // Movimento de caminhada (Apenas se não estiver defendendo)
  if (!ben.isDefending) {
    if (keys.right) {
      ben.velocityX = ben.speed;
      ben.facing = 'right';
      ben.animTimer += 0.2;
    } else if (keys.left) {
      ben.velocityX = -ben.speed;
      ben.facing = 'left';
      ben.animTimer += 0.2;
    } else {
      ben.velocityX = 0;
      ben.animTimer = 0;
    }
  }

  ben.x += ben.velocityX;
  ben.y += ben.velocityY;

  if (!ben.grounded) ben.velocityY += gravity;

  if (ben.y + ben.height >= groundY) {
    ben.y = groundY - ben.height;
    ben.velocityY = 0;
    ben.grounded = true;
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

  // Moedas
  data.items?.forEach(item => {
    if (!item.collected && isColliding(ben, { x: item.x, y: item.y, width: item.size, height: item.size })) {
      item.collected = true; ben.score += 10;
    }
  });

  // Caranguejos (Repelidos ao acertar a defesa)
  data.crabs?.forEach(crab => {
    if (crab.alive) {
      crab.x += crab.speed * crab.direction;
      crab.animTimer += 0.2;
      if (crab.x <= crab.minX || crab.x + crab.width >= crab.maxX) crab.direction *= -1;

      if (isColliding(ben, crab)) {
        if (ben.isDefending) {
          // Repelar: Empurra o caranguejo para trás e inverte o rumo
          crab.direction *= -1;
          crab.x += crab.direction * 30;
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

  // Morcegos (Repelidos ao bater no escudo)
  data.bats?.forEach(bat => {
    if (bat.alive) {
      bat.x -= bat.speed;
      bat.animTimer += 0.2;
      if (bat.x + bat.width < cameraX) bat.x = cameraX + canvas.width + 400;

      if (isColliding(ben, bat)) {
        if (ben.isDefending) {
          bat.x += 120; // Empurrado para trás
        } else {
          ben.alive = false;
        }
      }

      if (attackArea && isColliding(attackArea, bat)) { bat.alive = false; ben.score += 60; }
    }
  });

  // Lava e Bolas de Fogo
  data.lavaPits?.forEach(pit => {
    pit.offset += 0.08;
    if (ben.x + ben.width > pit.x + 10 && ben.x < pit.x + pit.width - 10 && ben.y + ben.height >= groundY - 10) ben.alive = false;
  });

  data.fireballs?.forEach(fb => {
    if (fb.alive) {
      fb.x -= fb.speed;
      if (fb.x + fb.width < cameraX) fb.x = cameraX + canvas.width + 300;

      if (isColliding(ben, fb)) {
        if (ben.isDefending) {
          fb.x += 150; // Bola de fogo e repelida
        } else {
          ben.alive = false;
        }
      }

      if (attackArea && isColliding(attackArea, fb)) { fb.alive = false; ben.score += 70; }
    }
  });

  // Zumbis
  data.zombies?.forEach(zombie => {
    if (zombie.alive) {
      const desiredDir = ben.x > zombie.x ? 1 : -1;
      if (desiredDir !== zombie.direction) {
        if (++zombie.turnDelay > 30) { zombie.direction = desiredDir; zombie.turnDelay = 0; }
      } else zombie.turnDelay = 0;

      zombie.x += zombie.speed * zombie.direction;
      const hitbox = { x: zombie.x + 10, y: zombie.y + 15, width: zombie.width - 20, height: zombie.height - 15 };

      if (isColliding(ben, hitbox)) {
        if (ben.isDefending) {
          zombie.direction *= -1;
          zombie.x += zombie.direction * 40; // Zumbi empurrado
        } else {
          ben.alive = false;
        }
      }

      if (attackArea && isColliding(attackArea, zombie)) { zombie.alive = false; ben.score += 80; }
    }
  });

  // Aranhas e Teias
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
        if (ben.isDefending) {
          spider.direction *= -1;
          spider.x += spider.direction * 30;
        } else {
          ben.alive = false;
        }
      }

      if (attackArea && isColliding(attackArea, spider)) { spider.alive = false; ben.score += 100; }
    }
  });

  data.spiderWebs?.forEach(web => {
    if (web.alive) {
      web.x += web.speed;
      if (isColliding(ben, web)) {
        if (ben.isDefending) {
          web.alive = false; // Teia e destruida/repelida pelo escudo
        } else {
          ben.alive = false;
        }
      }
      if (web.x < cameraX - 100 || web.x > cameraX + canvas.width + 100) web.alive = false;
    }
  });

  // Buracos e Águias
  data.holes?.forEach(hole => {
    if (ben.x + ben.width > hole.x + 20 && ben.x < hole.x + hole.width - 20 && ben.y + ben.height >= groundY - 5) ben.alive = false;
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
        if (ben.isDefending) {
          eagle.state = 'back_attack'; // Repelida para o segundo ataque
        } else {
          ben.alive = false;
        }
      }

      if (attackArea && isColliding(attackArea, eagle)) { eagle.alive = false; ben.score += 120; }
    }
  });

  // Portal
  const benCenterX = ben.x + ben.width / 2, benCenterY = ben.y + ben.height / 2;
  if (benCenterX >= portal.x + 30 && benCenterX <= portal.x + portal.width - 30 &&
      benCenterY >= portal.y + 30 && benCenterY <= portal.y + portal.height) {
    levelCompleted = true;
  }
}

// =============================================================================
// 8. DESENHO NA TELA (DRAW)
// =============================================================================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    ctx.fillText("Arte, Código e Design Criativo", canvas.width / 2, 250);
    drawTechButton(canvas.width / 2 - 70, 380, 140, 45, 'VOLTAR', 18);
    ctx.textAlign = 'left';
    return;
  }

  // Jogo
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

  ctx.drawImage(images.portal, portal.x, portal.y, portal.width, portal.height);
  data.items?.forEach(item => { if (!item.collected) ctx.drawImage(images.coin, item.x, item.y, item.size, item.size); });

  // Caranguejos
  data.crabs?.forEach(crab => {
    if (crab.alive) {
      const frame = (Math.floor(crab.animTimer) % 4) + 1;
      const dirKey = crab.direction === 1 ? 'crabRight' : 'crabLeft';
      ctx.drawImage(images[`${dirKey}${frame}`], crab.x, crab.y, crab.width, crab.height);
    }
  });

  // Morcegos (Fase 2)
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

  // Desenhar Ben (Prioridade: Defesa -> Ataque -> Corrida -> Parado)
  if (ben.alive) {
    if (ben.isDefending) {
      // Ben Defendendo com ben_left_def.png ou ben_right_def.png
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

// =============================================================================
// 9. LOOP PRINCIPAL DE EXECUÇÃO
// =============================================================================
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();