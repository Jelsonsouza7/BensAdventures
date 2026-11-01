// =============================================================================
// 1. CONFIGURAÇÕES GLOBAIS E CANVAS
// =============================================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'menu'; // 'menu', 'cutscene', 'level_select', 'credits', 'playing'
let currentLevel = 1, levelCompleted = false, cameraX = 0, globalWalkTimer = 0, nextLevelAfterCutscene = 1;
const levelWidth = 4000, gravity = 0.6, groundY = canvas.height - 50;

const portal = { x: 3750, y: groundY - 180, width: 180, height: 180 };
const abductionLight = { x: 3500, y: groundY - 230, width: 180, height: 230, flipTimer: 0 };
const inGameMenuBtn = { x: canvas.width - 110, y: 15, width: 90, height: 35 };

let lastFrameTime = 0;
const fpsInterval = 1000 / 60;

// =============================================================================
// 2. VÍDEOS E CUTSCENES
// =============================================================================
const cutsceneVideo = document.getElementById('cutsceneVideo');
const skipCutsceneBtn = document.getElementById('skipCutsceneBtn');

if (cutsceneVideo) cutsceneVideo.addEventListener('ended', endCutscene);
if (skipCutsceneBtn) {
  ['click', 'touchstart'].forEach(evt => skipCutsceneBtn.addEventListener(evt, (e) => { e.preventDefault(); endCutscene(); }));
}

function startCutscene(targetLevel = 1) {
  nextLevelAfterCutscene = targetLevel;
  gameState = 'cutscene';
  updateControlsVisibility();
  let videoSrc = targetLevel === 1 ? './video1.mp4' : (targetLevel === 9 ? './video2.mp4' : '');

  if (cutsceneVideo && videoSrc) {
    cutsceneVideo.src = videoSrc;
    cutsceneVideo.style.display = 'block';
    if (skipCutsceneBtn) skipCutsceneBtn.style.display = 'flex';
    cutsceneVideo.currentTime = 0;
    cutsceneVideo.play().catch(() => endCutscene());
  } else {
    endCutscene();
  }
}

function endCutscene() {
  if (cutsceneVideo) { cutsceneVideo.pause(); cutsceneVideo.style.display = 'none'; }
  if (skipCutsceneBtn) skipCutsceneBtn.style.display = 'none';
  loadLevel(nextLevelAfterCutscene);
}

function updateControlsVisibility() {
  document.querySelectorAll('.game-controls').forEach(ctrl => {
    ctrl.style.display = (gameState === 'playing') ? 'flex' : 'none';
  });
}

// =============================================================================
// 3. CARREGAMENTO DE IMAGENS
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
loadImg('benAttackRight', 'ben_attack_right.png'); loadImg('benAttackLeft', 'ben_attack_left.png');
loadImg('benDefRight', 'ben_right_def.png'); loadImg('benDefLeft', 'ben_left_def.png');
for (let i = 1; i <= 4; i++) {
  loadImg(`benRight${i}`, `ben_right${i}.png`); loadImg(`benLeft${i}`, `ben_left${i}.png`);
  loadImg(`crabLeft${i}`, `crab_left${i}.png`); loadImg(`crabRight${i}`, `crab_right${i}.png`);
  loadImg(`bat${i}`, `bat${i}.png`); loadImg(`bossAlien${i}`, `boss_alien${i}.png`);
}
loadImg('coin', 'moeda.png'); loadImg('portal', 'portal.png'); loadImg('luz', 'luz.png');
loadImg('tree', 'tree.png'); loadImg('cave', 'cave.png');
loadImg('fireball', 'fireball.png'); loadImg('waterfire', 'waterfire.png');
loadImg('zombieLeft', 'zombie_left.png'); loadImg('zombieRight', 'zombie_right.png');
loadImg('spiderLeft', 'spider_left.png'); loadImg('spiderRight', 'spider_right.png');
loadImg('spiderAttack', 'spider_atack.png'); loadImg('web', 'teia.png');
loadImg('eagle1', 'aguia1.png'); loadImg('eagle2', 'aguia2.png');
loadImg('eagleAttack', 'aguia_atack.png'); loadImg('eagleAttack2', 'aguia_atack2.png');
loadImg('esqueletoLeft', 'esqueleto_left.png'); loadImg('esqueletoRight', 'esqueleto_right.png');
loadImg('esqueletoAtk', 'esqueleto_atk.png'); loadImg('esqueletoAtk2', 'esqueleto_atk2.png');
loadImg('flecha', 'flecha.png');
for (let i = 1; i <= 3; i++) loadImg(`sland${i}`, `sland${i}.png`);
loadImg('slandAtk', 'sland_atk.png'); loadImg('tel', 'tel.png');
loadImg('alien1', 'alien1.png'); loadImg('alien2', 'alien2.png'); loadImg('alien3', 'alien3.png');
loadImg('defalien', 'defalien.png'); loadImg('pwralien1', 'pwralien1.png'); loadImg('pwralien2', 'pwralien2.png');
loadImg('bossatck2', 'bossatck2.png'); loadImg('pwrbossAlien1', 'pwrboss_alien1.png');
loadImg('orb', 'orb.png'); loadImg('pwrbossAlien2', 'pwrboss_alien2.png'); loadImg('pwrboss3', 'pwrboss3.png');
for (let i = 1; i <= 10; i++) loadImg(`bg${i}`, `tela${i}.jfif`);

// =============================================================================
// 4. ESTRUTURA DAS FASES (COM TODOS OS INIMIGOS RETORNADOS)
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
      { x: 2800, y: groundY - 45, width: 60, height: 45, speed: 2.5, direction: 1, minX: 2600, maxX: 2950, animTimer: 0, alive: true }
    ]
  },
  2: {
    bgKey: 'bg2',
    caves: [{ x: 500, w: 180, h: 160 }, { x: 1200, w: 200, h: 170 }, { x: 2000, w: 190, h: 165 }, { x: 2800, w: 210, h: 180 }, { x: 3400, w: 180, h: 160 }],
    items: [350, 800, 1300, 1800, 2300, 2900, 3500].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    crabs: [{ x: 550, y: groundY - 45, width: 60, height: 45, speed: 2, direction: 1, minX: 480, maxX: 700, animTimer: 0, alive: true }],
    bats: [
      { x: 650, y: groundY - 110, width: 50, height: 35, speed: 3, animTimer: 0, alive: true },
      { x: 900, y: groundY - 110, width: 50, height: 35, speed: 3, animTimer: 0, alive: true },
      { x: 1500, y: groundY - 120, width: 50, height: 35, speed: 3.2, animTimer: 0, alive: true },
      { x: 1850, y: groundY - 105, width: 50, height: 35, speed: 3.4, animTimer: 0, alive: true },
      { x: 2700, y: groundY - 100, width: 50, height: 35, speed: 4, alive: true }
    ]
  },
  3: {
    bgKey: 'bg3',
    items: [400, 1000, 1800, 2600, 3500].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    lavaPits: [{ x: 650, width: 80, height: 40, offset: 0 }, { x: 1400, width: 90, height: 40, offset: 0 }, { x: 2200, width: 85, height: 40, offset: 0 }, { x: 3000, width: 100, height: 40, offset: 0 }],
    fireballs: [
      { x: 600, y: groundY - 120, width: 45, height: 45, speed: 3.2, alive: true },
      { x: 1400, y: groundY - 130, width: 45, height: 45, speed: 3.8, alive: true },
      { x: 2000, y: groundY - 140, width: 45, height: 45, speed: 4, alive: true },
      { x: 2600, y: groundY - 110, width: 45, height: 45, speed: 4.5, alive: true }
    ]
  },
  4: {
    bgKey: 'bg4',
    items: [500, 1200, 2000, 2800, 3600].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    zombies: [
      { x: 500, y: groundY - 90, width: 90, height: 90, speed: 1.6, direction: -1, turnDelay: 0, alive: true },
      { x: 1400, y: groundY - 90, width: 90, height: 90, speed: 2.0, direction: -1, turnDelay: 0, alive: true },
      { x: 2100, y: groundY - 90, width: 90, height: 90, speed: 2.1, direction: -1, turnDelay: 0, alive: true },
      { x: 2800, y: groundY - 90, width: 90, height: 90, speed: 2.2, direction: -1, turnDelay: 0, alive: true }
    ]
  },
  5: {
    bgKey: 'bg5',
    items: [600, 1400, 2200, 3000, 3600].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    spiders: [
      { x: 500, y: groundY - 70, width: 90, height: 70, speed: 1.8, direction: 1, minX: 400, maxX: 650, isAttacking: false, attackCooldown: 0, alive: true },
      { x: 1400, y: groundY - 70, width: 90, height: 70, speed: 2, direction: -1, minX: 1200, maxX: 1600, isAttacking: false, attackCooldown: 0, alive: true },
      { x: 2800, y: groundY - 70, width: 90, height: 70, speed: 2.5, direction: 1, minX: 2600, maxX: 3000, isAttacking: false, attackCooldown: 0, alive: true }
    ],
    spiderWebs: []
  },
  6: {
    bgKey: 'bg6',
    items: [500, 1200, 2000, 2900, 3500].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    holes: [{ x: 800, width: 100 }, { x: 1600, width: 120 }, { x: 2500, width: 110 }],
    eagles: [
      { x: 600, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 2.8, direction: -1, minX: 400, maxX: 850, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true },
      { x: 1800, y: groundY - 260, baseY: groundY - 260, width: 90, height: 70, speedX: 3.2, direction: -1, minX: 1400, maxX: 2100, state: 'patrol', aimTimer: 0, targetX: 0, targetY: 0, wingFlapTimer: 0, alive: true }
    ]
  },
  7: {
    bgKey: 'bg7',
    items: [400, 1100, 1800, 2500, 3200].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    skeletons: [
      { x: 700, y: groundY - 90, width: 90, height: 90, facing: 'left', lookTimer: 0, attackCooldown: 0, postShootTimer: 0, alive: true },
      { x: 1400, y: groundY - 90, width: 90, height: 90, facing: 'right', lookTimer: 0, attackCooldown: 0, postShootTimer: 0, alive: true },
      { x: 2100, y: groundY - 90, width: 90, height: 90, facing: 'left', lookTimer: 0, attackCooldown: 0, postShootTimer: 0, alive: true }
    ],
    arrows: []
  },
  8: {
    bgKey: 'bg8',
    items: [500, 1200, 1900, 2600, 3300].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    slands: [
      { x: 500, y: groundY - 180, width: 180, height: 180, speed: 2.5, facing: 'left', state: 'chasing', animTimer: 0, stateTimer: 0, telScale: 1, telX: 0, telY: 0, alive: true },
      { x: 1100, y: groundY - 180, width: 180, height: 180, speed: 2.6, facing: 'left', state: 'chasing', animTimer: 0, stateTimer: 0, telScale: 1, telX: 0, telY: 0, alive: true },
      { x: 1800, y: groundY - 180, width: 180, height: 180, speed: 2.7, facing: 'left', state: 'chasing', animTimer: 0, stateTimer: 0, telScale: 1, telX: 0, telY: 0, alive: true }
    ]
  },
  9: {
    bgKey: 'bg9',
    items: [600, 1300, 2100, 2900, 3600].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    aliens: [
      { x: 800, y: groundY - 150, width: 95, height: 150, lives: 3, hitCooldown: 0, defendTimer: 0, attackCooldown: 0, attackStage: 'idle', nextAttackType: 'dash', dashDistance: 0, dashDir: -1, stageTimer: 0, shockwaveRadius: 0, alive: true },
      { x: 1600, y: groundY - 150, width: 95, height: 150, lives: 3, hitCooldown: 0, defendTimer: 0, attackCooldown: 0, attackStage: 'idle', nextAttackType: 'dash', dashDistance: 0, dashDir: -1, stageTimer: 0, shockwaveRadius: 0, alive: true }
    ],
    alienProjectiles: []
  },
  10: {
    bgKey: 'bg10',
    items: [600, 1400, 2200, 3000].map(x => ({ x, y: groundY - 35, size: 32, collected: false })),
    superBoss: { x: 3200, y: groundY - 260, baseY: groundY - 260, width: 140, height: 180, lives: 5, animTimer: 0, floatTimer: 0, attackTimer: 0, attackState: 'idle', stateTimer: 0, alive: true, hitCooldown: 0 },
    bossProjectiles: [], singleOrb: null, screenBeam: null, beamWarning: null
  }
};

let activeLevelData = null;

// =============================================================================
// 5. PERSONAGEM (BEN) E CONTROLES
// =============================================================================
const ben = {
  x: 50, y: 200, width: 90, height: 90, velocityX: 0, velocityY: 0, knockbackX: 0,
  speed: 5, jumpForce: -13.5, grounded: false, facing: 'right', isAttacking: false,
  isDefending: false, attackTimer: 0, animTimer: 0, score: 0, alive: true
};

function isColliding(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function loadLevel(lvl) {
  currentLevel = lvl; levelCompleted = false; cameraX = 0;
  ben.x = 50; ben.y = 200; ben.velocityX = 0; ben.velocityY = 0; ben.knockbackX = 0; ben.animTimer = 0; ben.alive = true; ben.isDefending = false;
  activeLevelData = JSON.parse(JSON.stringify(LEVELS_DATA[lvl]));
  gameState = 'playing';
  updateControlsVisibility();
}

function restartGame() { ben.score = 0; loadLevel(currentLevel); }

function handleAction() {
  if (gameState !== 'playing') return false;
  if (levelCompleted) {
    if (currentLevel === 8) startCutscene(9);
    else if (currentLevel < 10) loadLevel(currentLevel + 1);
    else { gameState = 'menu'; updateControlsVisibility(); }
    return true;
  }
  if (!ben.alive) { restartGame(); return true; }
  return false;
}

// =============================================================================
// 6. INTERAÇÃO E CLIQUES (UI E MENUS)
// =============================================================================
const menuButtons = [
  { label: 'INÍCIO', x: canvas.width / 2 - 110, y: 180, width: 220, height: 55, action: () => startCutscene(1) },
  { label: 'FASES', x: canvas.width / 2 - 110, y: 255, width: 220, height: 55, action: () => { gameState = 'level_select'; updateControlsVisibility(); } },
  { label: 'CRÉDITOS', x: canvas.width / 2 - 110, y: 330, width: 220, height: 55, action: () => { gameState = 'credits'; updateControlsVisibility(); } }
];

function drawTechButton(x, y, width, height, label, fontSize = 22) {
  const cut = 12, grad = ctx.createLinearGradient(x, y, x, y + height);
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
  ctx.fillStyle = '#ffffff'; ctx.font = `bold ${fontSize}px Arial`; ctx.textAlign = 'center';
  ctx.fillText(label, x + width / 2, y + height / 2 + (fontSize / 3));
}

function handleCanvasClick(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const clickX = (clientX - rect.left) * (canvas.width / rect.width);
  const clickY = (clientY - rect.top) * (canvas.height / rect.height);

  if (gameState === 'playing') {
    if (clickX >= inGameMenuBtn.x && clickX <= inGameMenuBtn.x + inGameMenuBtn.width && clickY >= inGameMenuBtn.y && clickY <= inGameMenuBtn.y + inGameMenuBtn.height) {
      gameState = 'menu'; updateControlsVisibility(); return;
    }
    if (levelCompleted || !ben.alive) { handleAction(); return; }
  }

  if (gameState === 'menu') {
    menuButtons.forEach(btn => { if (clickX >= btn.x && clickX <= btn.x + btn.width && clickY >= btn.y && clickY <= btn.y + btn.height) btn.action(); });
  } else if (gameState === 'level_select') {
    const btnW = 65, btnH = 50, gap = 15, startX = canvas.width / 2 - ((5 * btnW + 4 * gap) / 2);
    for (let i = 1; i <= 10; i++) {
      const col = (i - 1) % 5, row = Math.floor((i - 1) / 5);
      if (clickX >= startX + col * (btnW + gap) && clickX <= startX + col * (btnW + gap) + btnW && clickY >= 150 + row * (btnH + gap) && clickY <= 150 + row * (btnH + gap) + btnH) loadLevel(i);
    }
    if (clickX >= canvas.width / 2 - 70 && clickX <= canvas.width / 2 + 70 && clickY >= 360 && clickY <= 405) { gameState = 'menu'; updateControlsVisibility(); }
  } else if (gameState === 'credits') {
    if (clickX >= canvas.width / 2 - 70 && clickX <= canvas.width / 2 + 70 && clickY >= 380 && clickY <= 425) { gameState = 'menu'; updateControlsVisibility(); }
  }
}

canvas.addEventListener('click', (e) => handleCanvasClick(e.clientX, e.clientY));
canvas.addEventListener('touchstart', (e) => { if (e.touches.length > 0) handleCanvasClick(e.touches[0].clientX, e.touches[0].clientY); });

// Controles Teclado
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

// Analógico e Touch
const analogJoystick = document.getElementById('analogJoystick');
const analogStick = document.getElementById('analogStick');
if (analogJoystick) {
  let joystickActive = false;
  function processJoystick(tx, ty) {
    const rect = analogJoystick.getBoundingClientRect();
    const dx = tx - (rect.left + rect.width / 2), dy = ty - (rect.top + rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy), maxD = rect.width / 2 - 10;
    const angle = Math.atan2(dy, dx), moveD = Math.min(dist, maxD);
    analogStick.style.transform = `translate(${Math.cos(angle) * moveD}px, ${Math.sin(angle) * moveD}px)`;
    if (dist > 15) {
      keys.right = dx > 20; keys.left = dx < -20; keys.down = dy > 25;
      if (dy < -30 && ben.grounded && ben.alive && !ben.isDefending) { ben.velocityY = ben.jumpForce; ben.grounded = false; }
    } else { keys.right = false; keys.left = false; keys.down = false; }
  }
  function resetJoystick() { joystickActive = false; analogStick.style.transform = 'translate(0px, 0px)'; keys.right = false; keys.left = false; keys.down = false; }
  analogJoystick.addEventListener('touchstart', (e) => { e.preventDefault(); joystickActive = true; processJoystick(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  window.addEventListener('touchmove', (e) => { if (joystickActive && e.touches.length > 0) processJoystick(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  window.addEventListener('touchend', resetJoystick); window.addEventListener('touchcancel', resetJoystick);
}

const bindTouchBtn = (el, press, release) => {
  if (!el) return;
  el.addEventListener('touchstart', (e) => { e.preventDefault(); press(); }, { passive: false });
  el.addEventListener('touchend', (e) => { e.preventDefault(); release(); }, { passive: false });
};
bindTouchBtn(document.getElementById('btnDefend'), () => { if (ben.alive && gameState === 'playing' && ben.grounded) keys.down = true; }, () => { keys.down = false; });
bindTouchBtn(document.getElementById('btnJump'), () => { if (!handleAction() && ben.grounded && gameState === 'playing' && !ben.isDefending) { ben.velocityY = ben.jumpForce; ben.grounded = false; } }, () => {});
bindTouchBtn(document.getElementById('btnAttack'), () => { if (!handleAction() && !ben.isAttacking && ben.alive && gameState === 'playing' && !ben.isDefending) { ben.isAttacking = true; ben.attackTimer = 15; } }, () => {});

// =============================================================================
// 7. LÓGICA DE ATUALIZAÇÃO (UPDATE)
// =============================================================================
function update() {
  if (gameState !== 'playing' || levelCompleted || !ben.alive) return;
  globalWalkTimer += 0.2;

  ben.knockbackX = Math.abs(ben.knockbackX) > 0.2 ? ben.knockbackX * 0.85 : 0;
  ben.isDefending = keys.down && ben.grounded;
  if (ben.isDefending) ben.velocityX = 0;
  else if (keys.right) { ben.velocityX = ben.speed; ben.facing = 'right'; ben.animTimer += 0.2; }
  else if (keys.left) { ben.velocityX = -ben.speed; ben.facing = 'left'; ben.animTimer += 0.2; }
  else { ben.velocityX = 0; ben.animTimer = 0; }

  ben.x += ben.velocityX + ben.knockbackX;
  ben.y += ben.velocityY;
  if (!ben.grounded) ben.velocityY += gravity;

  if (ben.y + ben.height >= groundY) { ben.y = groundY - ben.height; ben.velocityY = 0; ben.grounded = true; }
  else ben.grounded = false;

  ben.x = Math.max(0, Math.min(levelWidth - ben.width, ben.x));
  cameraX = ben.x > canvas.width / 2 && ben.x < levelWidth - canvas.width / 2 ? ben.x - canvas.width / 2 : (ben.x <= canvas.width / 2 ? 0 : levelWidth - canvas.width);

  const attackArea = ben.isAttacking ? { x: ben.facing === 'right' ? ben.x + ben.width : ben.x - 35, y: ben.y, width: 45, height: ben.height } : null;
  if (ben.isAttacking && --ben.attackTimer <= 0) ben.isAttacking = false;

  const data = activeLevelData;
  data.items?.forEach(item => { if (!item.collected && isColliding(ben, { x: item.x, y: item.y, width: item.size, height: item.size })) { item.collected = true; ben.score += 10; } });

  // Caranguejos
  data.crabs?.forEach(c => {
    if (c.alive) {
      c.x += c.speed * c.direction; c.animTimer += 0.2;
      if (c.x <= c.minX || c.x + c.width >= c.maxX) c.direction *= -1;
      if (isColliding(ben, c)) { if (ben.isDefending) { c.direction *= -1; c.x += c.direction * 30; } else ben.alive = false; }
      if (attackArea && isColliding(attackArea, c) && ((ben.facing === 'right' && c.direction === 1) || (ben.facing === 'left' && c.direction === -1))) { c.alive = false; ben.score += 50; }
    }
  });

  // Morcegos
  data.bats?.forEach(b => {
    if (b.alive) {
      b.x -= b.speed; b.animTimer += 0.2;
      if (b.x + b.width < cameraX) b.x = cameraX + canvas.width + 400;
      if (isColliding(ben, b)) { if (ben.isDefending) b.x += 120; else ben.alive = false; }
      if (attackArea && isColliding(attackArea, b)) { b.alive = false; ben.score += 60; }
    }
  });

  // Bolas de Fogo e Poços de Lava
  data.fireballs?.forEach(fb => {
    if (fb.alive) {
      fb.x -= fb.speed;
      if (fb.x + fb.width < cameraX) fb.x = cameraX + canvas.width + 300;
      if (isColliding(ben, fb)) { if (ben.isDefending) fb.x += 150; else ben.alive = false; }
      if (attackArea && isColliding(attackArea, fb)) { fb.alive = false; ben.score += 70; }
    }
  });
  data.lavaPits?.forEach(pit => {
    pit.offset += 0.08;
    if (ben.x + ben.width > pit.x + 10 && ben.x < pit.x + pit.width - 10 && ben.y + ben.height >= groundY - 10) ben.alive = false;
  });

  // Zumbis
  data.zombies?.forEach(z => {
    if (z.alive) {
      let desiredDir = ben.x > z.x ? 1 : -1;
      if (desiredDir !== z.direction && ++z.turnDelay > 30) { z.direction = desiredDir; z.turnDelay = 0; }
      z.x += z.speed * z.direction;
      let hitbox = { x: z.x + 10, y: z.y + 15, width: z.width - 20, height: z.height - 15 };
      if (isColliding(ben, hitbox)) { if (ben.isDefending) { z.direction *= -1; z.x += z.direction * 40; } else ben.alive = false; }
      if (attackArea && isColliding(attackArea, z)) { z.alive = false; ben.score += 80; }
    }
  });

  // Aranhas e Teias
  data.spiders?.forEach(s => {
    if (s.alive) {
      let dist = Math.abs(ben.x - s.x);
      if (dist < 350) {
        s.isAttacking = true; s.direction = ben.x > s.x ? 1 : -1;
        if (s.attackCooldown <= 0) {
          data.spiderWebs.push({ x: s.direction === 1 ? s.x + s.width : s.x - 40, y: s.y + 20, width: 40, height: 40, speed: 6 * s.direction, alive: true });
          s.attackCooldown = 90;
        }
      } else {
        s.isAttacking = false; s.x += s.speed * s.direction;
        if (s.x <= s.minX || s.x + s.width >= s.maxX) s.direction *= -1;
      }
      if (s.attackCooldown > 0) s.attackCooldown--;
      if (isColliding(ben, s)) { if (ben.isDefending) s.direction *= -1; else ben.alive = false; }
      if (attackArea && isColliding(attackArea, s)) { s.alive = false; ben.score += 100; }
    }
  });
  data.spiderWebs?.forEach(w => {
    if (w.alive) {
      w.x += w.speed;
      if (isColliding(ben, w)) { if (!ben.isDefending) ben.alive = false; w.alive = false; }
    }
  });

  // Águias e Buracos
  data.eagles?.forEach(e => {
    if (e.alive) {
      e.wingFlapTimer += 0.15;
      if (e.state === 'patrol') {
        e.x += e.speedX * e.direction;
        if (e.x <= e.minX || e.x + e.width >= e.maxX) e.direction *= -1;
        if (Math.abs(ben.x - e.x) < 400 && ben.x < e.x) { e.state = 'aiming'; e.aimTimer = 45; e.targetX = ben.x; e.targetY = ben.y; }
      } else if (e.state === 'aiming' && --e.aimTimer <= 0) e.state = 'attacking';
      else if (e.state === 'attacking') {
        let angle = Math.atan2(e.targetY - e.y, e.targetX - e.x);
        e.x += Math.cos(angle) * 8; e.y += Math.sin(angle) * 8;
        if (e.y >= groundY - 80 || e.x <= e.targetX + 20) e.state = 'back_attack';
      } else if (e.state === 'back_attack' && (e.x += 8.5) > ben.x + 350) e.state = 'returning';
      else if (e.state === 'returning' && (e.y -= 4) <= e.baseY) { e.y = e.baseY; e.state = 'patrol'; }
      if (isColliding(ben, e)) { if (ben.isDefending) e.state = 'back_attack'; else ben.alive = false; }
      if (attackArea && isColliding(attackArea, e)) { e.alive = false; ben.score += 120; }
    }
  });

  // Slands (Fase 8)
  data.slands?.forEach(sland => {
    if (sland.alive) {
      sland.animTimer += 0.2;
      if (sland.state === 'chasing') {
        sland.facing = ben.x < sland.x ? 'left' : 'right';
        sland.x += sland.speed * (sland.facing === 'left' ? -1 : 1);
        if (Math.abs((ben.x + ben.width/2) - (sland.x + sland.width/2)) < 220) sland.state = 'teleporting_out', sland.telScale = 1.0, sland.telX = sland.x, sland.telY = sland.y;
      } else if (sland.state === 'teleporting_out' && (sland.telScale -= 0.12) <= 0) {
        sland.x = ben.facing === 'right' ? ben.x - sland.width + 30 : ben.x + ben.width - 30;
        sland.facing = ben.facing; sland.state = 'teleporting_in'; sland.telScale = 1.0; sland.telX = sland.x; sland.telY = sland.y;
      } else if (sland.state === 'teleporting_in' && (sland.telScale -= 0.12) <= 0) { sland.state = 'waiting_behind'; sland.stateTimer = 35; }
      else if (sland.state === 'waiting_behind' && --sland.stateTimer <= 0) { sland.state = 'attacking'; sland.stateTimer = 25; }
      else if (sland.state === 'attacking') {
        sland.stateTimer--; sland.x += (sland.facing === 'right' ? 1 : -1) * 12;
        if (isColliding(ben, sland)) {
          if (ben.isDefending && ((sland.x < ben.x && ben.facing === 'left') || (sland.x >= ben.x && ben.facing === 'right'))) {
            sland.x += sland.facing === 'left' ? 140 : -140; sland.state = 'rebound'; sland.telScale = 1.0; sland.telX = sland.x; sland.telY = sland.y;
          } else ben.alive = false;
        }
        if (sland.stateTimer <= 0) { sland.state = 'rebound'; sland.telScale = 1.0; sland.telX = sland.x; sland.telY = sland.y; }
      } else if (sland.state === 'rebound' && (sland.telScale -= 0.12) <= 0) {
        sland.x = Math.max(100, Math.min(levelWidth - 250, ben.x + ((Math.random() < 0.5 ? -1 : 1) * (250 + Math.random() * 200))));
        sland.state = 'chasing';
      }
      if (attackArea && isColliding(attackArea, sland) && sland.state !== 'teleporting_out' && sland.state !== 'teleporting_in') { sland.alive = false; ben.score += 200; }
    }
  });

  // Fase 10 (Super Chefe com 1 Orb que aumenta e pisca 2 vezes)
  if (data.superBoss && data.superBoss.alive) {
    const sb = data.superBoss;
    sb.animTimer += 0.15; sb.floatTimer = (sb.floatTimer || 0) + 0.04;
    sb.y = sb.baseY + Math.sin(sb.floatTimer) * 25;
    if (sb.hitCooldown > 0) sb.hitCooldown--;

    if (sb.attackState === 'idle') { sb.attackState = 'casting_stones'; sb.stateTimer = 60; sb.animTimer = 0; }
    else if (sb.attackState === 'casting_stones' && --sb.stateTimer <= 0) {
      for (let i = 0; i < 3; i++) data.bossProjectiles.push({ x: sb.x + (i - 1) * 50, y: sb.y, width: 50, height: 50, vx: (Math.random() - 0.5) * 4, vy: -8, type: 'upward_stone', alive: true });
      sb.attackState = 'summoning_single_orb'; sb.stateTimer = 65;
    }
    else if (sb.attackState === 'summoning_single_orb') {
      sb.stateTimer--;
      if (!data.singleOrb) {
        let safeOrbX = ben.x > cameraX + 300 ? cameraX + 150 : cameraX + canvas.width - 250;
        data.singleOrb = { x: safeOrbX, y: 65, baseWidth: 50, baseHeight: 50, width: 50, height: 50, timer: 65, alive: true };
      } else {
        data.singleOrb.timer--;
        let blinkPhase = Math.sin(data.singleOrb.timer * 0.9);
        data.singleOrb.width = data.singleOrb.baseWidth + (blinkPhase > 0 ? 25 : 0);
        data.singleOrb.height = data.singleOrb.baseHeight + (blinkPhase > 0 ? 25 : 0);
      }
      if (sb.stateTimer <= 0) {
        data.beamWarning = { x: data.singleOrb.x - 45, y: 0, width: 140, height: canvas.height, alive: true };
        sb.attackState = 'waiting_beam'; sb.stateTimer = 35;
      }
    }
    else if (sb.attackState === 'waiting_beam' && --sb.stateTimer <= 0) {
      data.screenBeam = { x: data.beamWarning ? data.beamWarning.x : cameraX + 200, y: 0, width: 140, height: canvas.height, timer: 120, alive: true };
      data.beamWarning = null; data.singleOrb = null; sb.attackState = 'beam_active';
    }
    else if (sb.attackState === 'beam_active' && data.screenBeam && data.screenBeam.alive) {
      if (--data.screenBeam.timer <= 0) { data.screenBeam.alive = false; sb.attackState = 'shield_attack'; sb.stateTimer = 70; }
    }
    else if (sb.attackState === 'shield_attack' && --sb.stateTimer <= 0) {
      let dir = ben.x < sb.x ? -1 : 1;
      data.bossProjectiles.push({ x: dir === -1 ? sb.x - 60 : sb.x + sb.width, y: sb.y + 60, width: 60, height: 60, vx: 8.5 * dir, vy: 0, type: 'shield_req', alive: true });
      sb.attackState = 'idle';
    }
    if (isColliding(ben, sb) && !ben.isDefending) ben.alive = false;
  }

  // Projéteis e Feixes Finais
  data.bossProjectiles?.forEach(p => {
    if (p.alive) {
      p.x += p.vx; p.y += p.vy; if (p.type === 'upward_stone') p.vy += 0.3;
      if (isColliding(ben, p)) {
        if (p.type === 'shield_req' && ben.isDefending && ((ben.facing === 'right' && p.vx < 0) || (ben.facing === 'left' && p.vx > 0))) { p.vx *= -1.5; p.type = 'reflected'; }
        else ben.alive = false;
      }
      if (p.type === 'reflected' && data.superBoss && isColliding(p, data.superBoss) && data.superBoss.hitCooldown <= 0) {
        data.superBoss.lives--; data.superBoss.hitCooldown = 40; p.alive = false;
        if (data.superBoss.lives <= 0) { data.superBoss.alive = false; ben.score += 2000; levelCompleted = true; }
      }
      if (p.y > groundY + 100 || p.x < cameraX - 200 || p.x > cameraX + canvas.width + 200) p.alive = false;
    }
  });

  if (data.screenBeam && data.screenBeam.alive && isColliding(ben, data.screenBeam)) ben.alive = false;

  const benCX = ben.x + ben.width / 2, benCY = ben.y + ben.height / 2;
  if (currentLevel === 8 && data.slands?.filter(s => s.alive).length === 0 && benCX >= abductionLight.x + 20 && benCX <= abductionLight.x + abductionLight.width - 20 && benCY >= abductionLight.y) levelCompleted = true;
  else if (currentLevel === 10 && data.superBoss && !data.superBoss.alive) levelCompleted = true;
  else if (currentLevel < 10 && benCX >= portal.x + 30 && benCX <= portal.x + portal.width - 30 && benCY >= portal.y + 30) levelCompleted = true;
}

// =============================================================================
// 8. RENDERIZAÇÃO NA TELA (DRAW)
// =============================================================================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (gameState === 'cutscene') { updateControlsVisibility(); return; }

  if (gameState === 'menu' || gameState === 'level_select' || gameState === 'credits') {
    updateControlsVisibility();
    ctx.fillStyle = '#0a0f24'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (gameState === 'menu') {
      if (images.menuBg?.complete && images.menuBg.naturalWidth !== 0) ctx.drawImage(images.menuBg, 0, 0, canvas.width, canvas.height);
      menuButtons.forEach(btn => drawTechButton(btn.x, btn.y, btn.width, btn.height, btn.label));
    } else if (gameState === 'level_select') {
      const btnW = 65, btnH = 50, gap = 15, startX = canvas.width / 2 - ((5 * btnW + 4 * gap) / 2);
      for (let i = 1; i <= 10; i++) {
        const col = (i - 1) % 5, row = Math.floor((i - 1) / 5);
        drawTechButton(startX + col * (btnW + gap), 150 + row * (btnH + gap), btnW, btnH, `${i}`, 18);
      }
      drawTechButton(canvas.width / 2 - 70, 360, 140, 45, 'VOLTAR', 18);
    } else {
      ctx.fillStyle = '#00ffff'; ctx.font = 'bold 32px Arial'; ctx.textAlign = 'center';
      ctx.fillText('CRÉDITOS', canvas.width / 2, 120);
      ctx.fillStyle = '#ffffff'; ctx.font = '20px Arial'; ctx.fillText("Desenvolvido para Ben's Adventures", canvas.width / 2, 200);
      drawTechButton(canvas.width / 2 - 70, 380, 140, 45, 'VOLTAR', 18);
      ctx.textAlign = 'left';
    }
    return;
  }

  updateControlsVisibility();
  ctx.save();
  ctx.translate(-cameraX, 0);

  const data = activeLevelData;
  ctx.drawImage(images[data.bgKey], 0, 0, levelWidth, canvas.height);
  data.trees?.forEach(t => ctx.drawImage(images.tree, t.x, groundY - t.h, t.w, t.h));
  data.items?.forEach(item => { if (!item.collected) ctx.drawImage(images.coin, item.x, item.y, item.size, item.size); });
  
  if (currentLevel !== 10) ctx.drawImage(images.portal, portal.x, portal.y, portal.width, portal.height);

  // Desenho de Inimigos e Obstáculos
  data.crabs?.forEach(c => {
    if (c.alive) {
      let frame = (Math.floor(c.animTimer) % 4) + 1;
      ctx.drawImage(images[`${c.direction === 1 ? 'crabRight' : 'crabLeft'}${frame}`], c.x, c.y, c.width, c.height);
    }
  });

  data.bats?.forEach(b => {
    if (b.alive) {
      let frame = (Math.floor(b.animTimer) % 4) + 1;
      ctx.drawImage(images[`bat${frame}`], b.x, b.y, b.width, b.height);
    }
  });

  data.fireballs?.forEach(fb => { if (fb.alive) ctx.drawImage(images.fireball, fb.x, fb.y, fb.width, fb.height); });
  
  data.zombies?.forEach(z => {
    if (z.alive) ctx.drawImage(z.direction === 1 ? images.zombieRight : images.zombieLeft, z.x, z.y, z.width, z.height);
  });

  data.spiders?.forEach(s => {
    if (s.alive) ctx.drawImage(s.isAttacking ? images.spiderAttack : (s.direction === 1 ? images.spiderRight : images.spiderLeft), s.x, s.y, s.width, s.height);
  });
  data.spiderWebs?.forEach(w => { if (w.alive) ctx.drawImage(images.web, w.x, w.y, w.width, w.height); });

  data.eagles?.forEach(e => {
    if (e.alive) {
      let img = Math.floor(e.wingFlapTimer) % 2 === 0 ? images.eagle1 : images.eagle2;
      if (e.state === 'attacking') img = images.eagleAttack;
      else if (e.state === 'back_attack') img = images.eagleAttack2;
      ctx.drawImage(img, e.x, e.y, e.width, e.height);
    }
  });

  data.slands?.forEach(sland => {
    if (sland.alive && sland.state !== 'teleporting_out' && sland.state !== 'teleporting_in') {
      ctx.save();
      let imgKey = sland.state === 'attacking' ? 'slandAtk' : `sland${(Math.floor(sland.animTimer) % 3) + 1}`;
      if (sland.facing === 'right') {
        ctx.translate(sland.x + sland.width, sland.y); ctx.scale(-1, 1);
        ctx.drawImage(images[imgKey], 0, 0, sland.width, sland.height);
      } else {
        ctx.drawImage(images[imgKey], sland.x, sland.y, sland.width, sland.height);
      }
      ctx.restore();
    }
  });

  // Renderização Super Chefe e Ataques (Fase 10)
  if (data.superBoss && data.superBoss.alive) {
    let sb = data.superBoss;
    ctx.drawImage(images[`bossAlien${(Math.floor(sb.animTimer) % 4) + 1}`], sb.x, sb.y, sb.width, sb.height);
    ctx.fillStyle = '#1e293b'; ctx.fillRect(sb.x, sb.y - 25, sb.width, 10);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(sb.x, sb.y - 25, (sb.width / 5) * sb.lives, 10);
  }

  if (data.singleOrb?.alive) {
    ctx.save();
    ctx.translate(data.singleOrb.x + data.singleOrb.width / 2, data.singleOrb.y + data.singleOrb.height / 2);
    ctx.drawImage(images.orb, -data.singleOrb.width / 2, -data.singleOrb.height / 2, data.singleOrb.width, data.singleOrb.height);
    ctx.restore();
  }

  if (data.beamWarning?.alive) {
    ctx.save();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)'; ctx.fillRect(data.beamWarning.x, data.beamWarning.y, data.beamWarning.width, data.beamWarning.height);
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3; ctx.setLineDash([10, 10]);
    ctx.strokeRect(data.beamWarning.x, data.beamWarning.y, data.beamWarning.width, data.beamWarning.height);
    ctx.restore();
  }

  if (data.screenBeam?.alive) {
    ctx.save();
    if (Math.floor(data.screenBeam.timer / 5) % 2 === 0) {
      ctx.translate(data.screenBeam.x + data.screenBeam.width, data.screenBeam.y); ctx.scale(-1, 1);
      ctx.drawImage(images.pwrbossAlien2, 0, 0, data.screenBeam.width, data.screenBeam.height);
    } else ctx.drawImage(images.pwrbossAlien2, data.screenBeam.x, data.screenBeam.y, data.screenBeam.width, data.screenBeam.height);
    ctx.restore();
  }

  data.bossProjectiles?.forEach(p => { if (p.alive) ctx.drawImage(p.type === 'shield_req' || p.type === 'reflected' ? images.pwrboss3 : images.pwrbossAlien1, p.x, p.y, p.width, p.height); });

  // Ben (Herói)
  if (ben.alive) {
    if (ben.isDefending) ctx.drawImage(images[ben.facing === 'right' ? 'benDefRight' : 'benDefLeft'], ben.x, ben.y, ben.width, ben.height);
    else if (ben.isAttacking) ctx.drawImage(images[ben.facing === 'right' ? 'benAttackRight' : 'benAttackLeft'], ben.facing === 'right' ? ben.x : ben.x - 20, ben.y, ben.width + 20, ben.height);
    else if (ben.velocityX !== 0) {
      let frame = (Math.floor(ben.animTimer) % 4) + 1;
      ctx.drawImage(images[`${ben.facing === 'right' ? 'benRight' : 'benLeft'}${frame}`], ben.x, ben.y, ben.width, ben.height);
    } else {
      ctx.save();
      if (ben.facing === 'left') { ctx.translate(ben.x + ben.width, ben.y); ctx.scale(-1, 1); ctx.drawImage(images.ben, 0, 0, ben.width, ben.height); }
      else ctx.drawImage(images.ben, ben.x, ben.y, ben.width, ben.height);
      ctx.restore();
    }
  }

  ctx.restore();
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px Arial';
  ctx.fillText(`Fase: ${currentLevel} | Pontos: ${ben.score}`, 20, 30);
  drawTechButton(inGameMenuBtn.x, inGameMenuBtn.y, inGameMenuBtn.width, inGameMenuBtn.height, 'MENU', 15);

  if (!ben.alive || levelCompleted) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = !ben.alive ? '#ef4444' : '#fde047'; ctx.font = 'bold 36px Arial'; ctx.textAlign = 'center';
    ctx.fillText(!ben.alive ? 'VOCÊ MORREU!' : (currentLevel < 10 ? `FASE ${currentLevel} CONCLUÍDA!` : 'PARABÉNS! JOGO CONCLUÍDO!'), canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = '#ffffff'; ctx.font = '18px Arial';
    ctx.fillText(!ben.alive ? 'Toque na tela ou pressione PULAR/ESPAÇO para tentar novamente' : 'Toque na tela para continuar!', canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = 'left';
  }
}

// =============================================================================
// 9. GAME LOOP
// =============================================================================
function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);
  if (!lastFrameTime) lastFrameTime = timestamp;
  const elapsed = timestamp - lastFrameTime;
  if (elapsed > fpsInterval) {
    lastFrameTime = timestamp - (elapsed % fpsInterval);
    update(); draw();
  }
}
requestAnimationFrame(gameLoop);