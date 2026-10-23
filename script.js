const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Estado do Jogo
let currentLevel = 1; // 1 = Praia, 2 = Selva, 3 = Vulcão, 4 = Castelo, 5 = Templo da Aranha
let levelCompleted = false;

// Carregar Imagens do Personagem e Objetos Base
const benImg = new Image(); benImg.src = 'ben.png';
const benAttackRightImg = new Image(); benAttackRightImg.src = 'ben_attack_right.png';
const benAttackLeftImg = new Image(); benAttackLeftImg.src = 'ben_attack_left.png';
const coinImg = new Image(); coinImg.src = 'moeda.png';
const crabLeftImg = new Image(); crabLeftImg.src = 'crab_left.png';
const crabRightImg = new Image(); crabRightImg.src = 'crab_right.png';
const treeImg = new Image(); treeImg.src = 'tree.png';

// Imagem do Portal Personalizado (2x o tamanho do Ben: 180x180)
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

// Personagem Principal: BEN (width: 90, height: 90)
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

// Portal do Fim da Fase (2x o tamanho do Ben: 180px x 180px)
const portal = { x: 3800, y: groundY - 180, width: 180, height: 180 };

// --- ELEMENTOS DA FASE 1 (PRAIA) ---
const treesFase1 = [
  { x: 400, width: 140, height: 180 },
  { x: 900, width: 150, height: 190 },
  { x: 1500, width: 140, height: 180 },
  { x: 2100, width: 160, height: 200 },
  { x: 2700, width: 140, height: 180 },
  { x: 3300, width: 150, height: 190 }
];

const itemsFase1 = [
  { x: 300, y: groundY - 35, size: 32, collected: false },
  { x: 700, y: groundY - 35, size: 32, collected: false },
  { x: 1200, y: groundY - 35, size: 32, collected: false },
  { x: 1700, y: groundY - 35, size: 32, collected: false },
  { x: 2150, y: groundY - 35, size: 32, collected: false },
  { x: 2750, y: groundY - 35, size: 32, collected: false },
  { x: 3350, y: groundY - 35, size: 32, collected: false }
];

const enemiesFase1 = [
  { x: 550, y: groundY - 45, width: 60, height: 45, speed: 2, direction: 1, minX: 480, maxX: 700, alive: true },
  { x: 1050, y: groundY - 45, width: 60, height: 45, speed: 2.5, direction: 1, minX: 980, maxX: 1250, alive: true },
  { x: 1600, y: groundY - 45, width: 60, height: 45, speed: 2, direction: -1, minX: 1400, maxX: 1750, alive: true },
  { x: 2150, y: groundY - 45, width: 60, height: 45, speed: 3, direction: 1, minX: 1950, maxX: 2300, alive: true },
  { x: 2800, y: groundY - 45, width: 60, height: 45, speed: 2.5, direction: 1, minX: 2600, maxX: 2950, alive: true },
  { x: 3400, y: groundY - 45, width: 60, height: 45, speed: 3, direction: -1, minX: 3200, maxX: 3600, alive: true }
];

// --- ELEMENTOS DA FASE 2 (SELVA & CAVERNAS) ---
const cavesFase2 = [
  { x: 500, width: 180, height: 160 },
  { x: 1200, width: 200, height: 170 },
  { x: 2000, width: 190, height: 165 },
  { x: 2800, width: 210, height: 180 },
  { x: 3400, width: 180, height: 160 }
];

const itemsFase2 = [
  { x: 350, y: groundY - 35, size: 32, collected: false },
  { x: 800, y: groundY - 35, size: 32, collected: false },
  { x: 1300, y: groundY - 35, size: 32, collected: false },
  { x: 1800, y: groundY - 35, size: 32, collected: false },
  { x: 2300, y: groundY - 35, size: 32, collected: false },
  { x: 2900, y: groundY - 35, size: 32, collected: false },
  { x: 3500, y: groundY - 35, size: 32, collected: false }
];

const initialBatPositions = [
  { x: 900, y: groundY - 110, width: 50, height: 35, speed: 3 },
  { x: 1700, y: groundY - 130, width: 50, height: 35, speed: 3.5 },
  { x: 2500, y: groundY - 100, width: 50, height: 35, speed: 4 },
  { x: 3300, y: groundY - 140, width: 50, height: 35, speed: 3.5 }
];

let batsFase2 = initialBatPositions.map(bat => ({ ...bat, alive: true }));

// --- ELEMENTOS DA FASE 3 (VULCÃO & LAVA) ---
const lavaPitsFase3 = [
  { x: 650, width: 80, height: 40, offset: 0 },
  { x: 1400, width: 90, height: 40, offset: 0 },
  { x: 2200, width: 85, height: 40, offset: 0 },
  { x: 3000, width: 100, height: 40, offset: 0 }
];

const initialFireballPositions = [
  { x: 800, y: groundY - 120, width: 45, height: 45, speed: 3.5 },
  { x: 1600, y: groundY - 140, width: 45, height: 45, speed: 4 },
  { x: 2400, y: groundY - 110, width: 45, height: 45, speed: 4.5 },
  { x: 3200, y: groundY - 150, width: 45, height: 45, speed: 4 }
];

let fireballsFase3 = initialFireballPositions.map(fb => ({ ...fb, alive: true }));

const itemsFase3 = [
  { x: 400, y: groundY - 35, size: 32, collected: false },
  { x: 1000, y: groundY - 35, size: 32, collected: false },
  { x: 1800, y: groundY - 35, size: 32, collected: false },
  { x: 2600, y: groundY - 35, size: 32, collected: false },
  { x: 3500, y: groundY - 35, size: 32, collected: false }
];

// --- ELEMENTOS DA FASE 4 (CASTELO & ZUMBIS) ---
const initialZombiePositions = [
  { x: 800, y: groundY - 90, width: 90, height: 90, speed: 1.8, direction: -1, turnDelay: 0, alive: true },
  { x: 1700, y: groundY - 90, width: 90, height: 90, speed: 2.0, direction: -1, turnDelay: 0, alive: true },
  { x: 2600, y: groundY - 90, width: 90, height: 90, speed: 2.2, direction: -1, turnDelay: 0, alive: true },
  { x: 3400, y: groundY - 90, width: 90, height: 90, speed: 2.0, direction: -1, turnDelay: 0, alive: true }
];

let zombiesFase4 = initialZombiePositions.map(z => ({ ...z }));

const itemsFase4 = [
  { x: 500, y: groundY - 35, size: 32, collected: false },
  { x: 1200, y: groundY - 35, size: 32, collected: false },
  { x: 2000, y: groundY - 35, size: 32, collected: false },
  { x: 2800, y: groundY - 35, size: 32, collected: false },
  { x: 3600, y: groundY - 35, size: 32, collected: false }
];

// --- ELEMENTOS DA FASE 5 (TEMPLO DA ARANHA) ---
const initialSpiderPositions = [
  { x: 900, y: groundY - 70, width: 90, height: 70, speed: 2, direction: 1, minX: 750, maxX: 1100, isAttacking: false, attackCooldown: 0, alive: true },
  { x: 1800, y: groundY - 70, width: 90, height: 70, speed: 2, direction: -1, minX: 1600, maxX: 2000, isAttacking: false, attackCooldown: 0, alive: true },
  { x: 2700, y: groundY - 70, width: 90, height: 70, speed: 2.5, direction: 1, minX: 2500, maxX: 2900, isAttacking: false, attackCooldown: 0, alive: true },
  { x: 3400, y: groundY - 70, width: 90, height: 70, speed: 2.5, direction: -1, minX: 3200, maxX: 3600, isAttacking: false, attackCooldown: 0, alive: true }
];

let spidersFase5 = initialSpiderPositions.map(s => ({ ...s }));
let spiderWebsFase5 = []; // Projéteis de teia em jogo

const itemsFase5 = [
  { x: 600, y: groundY - 35, size: 32, collected: false },
  { x: 1400, y: groundY - 35, size: 32, collected: false },
  { x: 2200, y: groundY - 35, size: 32, collected: false },
  { x: 3000, y: groundY - 35, size: 32, collected: false },
  { x: 3600, y: groundY - 35, size: 32, collected: false }
];

let currentItems = itemsFase1;
let currentEnemies = enemiesFase1;

function resetBats() { batsFase2 = initialBatPositions.map(bat => ({ ...bat, alive: true })); }
function resetFireballs() { fireballsFase3 = initialFireballPositions.map(fb => ({ ...fb, alive: true })); }
function resetZombies() { zombiesFase4 = initialZombiePositions.map(z => ({ ...z })); }
function resetSpiders() {
  spidersFase5 = initialSpiderPositions.map(s => ({ ...s }));
  spiderWebsFase5 = [];
}

function startLevel2() {
  currentLevel = 2; levelCompleted = false;
  ben.x = 50; ben.y = 200; ben.velocityX = 0; ben.velocityY = 0; ben.alive = true;
  cameraX = 0; currentItems = itemsFase2; currentEnemies = enemiesFase1;
  resetBats();
}

function startLevel3() {
  currentLevel = 3; levelCompleted = false;
  ben.x = 50; ben.y = 200; ben.velocityX = 0; ben.velocityY = 0; ben.alive = true;
  cameraX = 0; currentItems = itemsFase3; currentEnemies = [];
  resetFireballs();
}

function startLevel4() {
  currentLevel = 4; levelCompleted = false;
  ben.x = 50; ben.y = 200; ben.velocityX = 0; ben.velocityY = 0; ben.alive = true;
  cameraX = 0; currentItems = itemsFase4; currentEnemies = [];
  resetZombies();
}

function startLevel5() {
  currentLevel = 5; levelCompleted = false;
  ben.x = 50; ben.y = 200; ben.velocityX = 0; ben.velocityY = 0; ben.alive = true;
  cameraX = 0; currentItems = itemsFase5; currentEnemies = [];
  resetSpiders();
}

function restartGame() {
  ben.x = 50; ben.y = 200; ben.velocityX = 0; ben.velocityY = 0; ben.alive = true;
  ben.score = 0; levelCompleted = false;

  itemsFase1.forEach(item => item.collected = false);
  enemiesFase1.forEach(enemy => enemy.alive = true);

  itemsFase2.forEach(item => item.collected = false); resetBats();
  itemsFase3.forEach(item => item.collected = false); resetFireballs();
  itemsFase4.forEach(item => item.collected = false); resetZombies();
  itemsFase5.forEach(item => item.collected = false); resetSpiders();

  if (currentLevel === 2) startLevel2();
  if (currentLevel === 3) startLevel3();
  if (currentLevel === 4) startLevel4();
  if (currentLevel === 5) startLevel5();
}

function handleAction() {
  if (levelCompleted) {
    if (currentLevel === 1) { startLevel2(); return true; }
    if (currentLevel === 2) { startLevel3(); return true; }
    if (currentLevel === 3) { startLevel4(); return true; }
    if (currentLevel === 4) { startLevel5(); return true; }
  }
  if (!ben.alive) {
    restartGame();
    return true;
  }
  return false;
}

// Controles Teclado
const keys = { right: false, left: false };

window.addEventListener('keydown', (e) => {
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
  btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); if (ben.alive) keys.left = true; });
  btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); keys.left = false; });

  btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); if (ben.alive) keys.right = true; });
  btnRight.addEventListener('touchend', (e) => { e.preventDefault(); keys.left = false; });

  btnJump.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (handleAction()) return;
    if (ben.grounded) {
      ben.velocityY = ben.jumpForce;
      ben.grounded = false;
    }
  });
}

if (btnAttack) {
  btnAttack.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (handleAction()) return;
    if (!ben.isAttacking && ben.alive) {
      ben.isAttacking = true;
      ben.attackTimer = 15;
    }
  });
}

canvas.addEventListener('click', () => { handleAction(); });

// Lógica de Atualização
function update() {
  if (levelCompleted || !ben.alive) return;

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
          if (zombie.turnDelay > 30) {
            zombie.direction = desiredDirection;
            zombie.turnDelay = 0;
          }
        } else {
          zombie.turnDelay = 0;
        }

        zombie.x += zombie.speed * zombie.direction;

        const zombieHitboxY = zombie.y + 15;
        const zombieHitboxHeight = zombie.height - 15;

        if (ben.x < zombie.x + zombie.width - 10 &&
            ben.x + ben.width > zombie.x + 10 &&
            ben.y < zombieHitboxY + zombieHitboxHeight &&
            ben.y + ben.height > zombieHitboxY) {
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

        // Se o Ben estiver próximo (alcance de 350px), a aranha arma o ataque
        if (distanceToBen < 350) {
          spider.isAttacking = true;
          spider.direction = ben.x > spider.x ? 1 : -1; // Olha para o Ben

          // Disparar teia a cada tempo de recarga
          if (spider.attackCooldown <= 0) {
            spiderWebsFase5.push({
              x: spider.direction === 1 ? spider.x + spider.width : spider.x - 40,
              y: spider.y + 20,
              width: 40,
              height: 40,
              speed: 6 * spider.direction,
              alive: true
            });
            spider.attackCooldown = 90; // Recarga entre tiros (~1.5 seg)
          }
        } else {
          spider.isAttacking = false;
          spider.x += spider.speed * spider.direction;
          if (spider.x <= spider.minX || spider.x + spider.width >= spider.maxX) {
            spider.direction *= -1;
          }
        }

        if (spider.attackCooldown > 0) spider.attackCooldown--;

        // Colisão direta com o corpo da aranha
        if (ben.x < spider.x + spider.width - 10 &&
            ben.x + ben.width > spider.x + 10 &&
            ben.y < spider.y + spider.height &&
            ben.y + ben.height > spider.y) {
          ben.alive = false;
        }
      }
    });

    // Atualização dos Projéteis de Teia
    spiderWebsFase5.forEach(web => {
      if (web.alive) {
        web.x += web.speed;

        // Colisão da Teia com o Ben (Se encostar morre!)
        if (ben.x < web.x + web.width &&
            ben.x + ben.width > web.x &&
            ben.y < web.y + web.height &&
            ben.y + ben.height > web.y) {
          ben.alive = false;
        }

        // Remover teia se sair da tela
        if (web.x < cameraX - 100 || web.x > cameraX + canvas.width + 100) {
          web.alive = false;
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

  if (ben.x + ben.width > portal.x && ben.x < portal.x + portal.width && ben.y + ben.height > portal.y) {
    levelCompleted = true;
  }
}

// Desenhar Sol/Lua Pixelados
function drawPixelSun() {
  const p = 5; const startX = canvas.width - 90; const startY = 20;
  ctx.fillStyle = '#facc15'; ctx.fillRect(startX + p * 2, startY + p * 2, p * 8, p * 8);
  ctx.fillRect(startX + p * 5, startY, p * 2, p * 2); ctx.fillRect(startX + p * 5, startY + p * 10, p * 2, p * 2);
  ctx.fillRect(startX, startY + p * 5, p * 2, p * 2); ctx.fillRect(startX + p * 10, startY + p * 5, p * 2, p * 2);
}

function drawPixelMoon() {
  const p = 5; const startX = canvas.width - 80; const startY = 20;
  ctx.fillStyle = '#e2e8f0';
  const moonMatrix = [[0, 0, 1, 1, 1, 0],[0, 1, 1, 1, 0, 0],[1, 1, 1, 0, 0, 0],[1, 1, 1, 0, 0, 0],[1, 1, 1, 1, 0, 0],[0, 1, 1, 1, 1, 0],[0, 0, 1, 1, 1, 0]];
  for (let r = 0; r < moonMatrix.length; r++) {
    for (let c = 0; c < moonMatrix[r].length; c++) {
      if (moonMatrix[r][c] === 1) ctx.fillRect(startX + c * p, startY + r * p, p, p);
    }
  }
}

function drawPixelFireSun() {
  const p = 5; const startX = canvas.width - 90; const startY = 20;
  ctx.fillStyle = '#ef4444'; ctx.fillRect(startX + p * 2, startY + p * 2, p * 8, p * 8);
  ctx.fillStyle = '#f97316'; ctx.fillRect(startX + p * 5, startY, p * 2, p * 2); ctx.fillRect(startX + p * 5, startY + p * 10, p * 2, p * 2);
}

function drawPixelStar() {
  const p = 5; const startX = canvas.width - 80; const startY = 20;
  ctx.fillStyle = '#fde047'; ctx.fillRect(startX + p * 3, startY, p * 2, p * 8); ctx.fillRect(startX, startY + p * 3, p * 8, p * 2);
}

// Desenhar Cenas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-cameraX, 0);

  // Imagens de Fundo
  if (currentLevel === 1) {
    if (bg1Loaded) ctx.drawImage(bg1Img, 0, 0, levelWidth, canvas.height);
    else { ctx.fillStyle = '#0284c7'; ctx.fillRect(0, groundY - 30, levelWidth, 30); ctx.fillStyle = '#fde047'; ctx.fillRect(0, groundY, levelWidth, 50); }
    treesFase1.forEach(tree => ctx.drawImage(treeImg, tree.x, groundY - tree.height, tree.width, tree.height));
  } else if (currentLevel === 2) {
    if (bg2Loaded) ctx.drawImage(bg2Img, 0, 0, levelWidth, canvas.height);
    else { ctx.fillStyle = '#064e3b'; ctx.fillRect(0, 0, levelWidth, canvas.height); ctx.fillStyle = '#15803d'; ctx.fillRect(0, groundY, levelWidth, 10); ctx.fillStyle = '#78350f'; ctx.fillRect(0, groundY + 10, levelWidth, 40); }
    cavesFase2.forEach(cave => { if (caveLoaded) ctx.drawImage(caveImg, cave.x, groundY - cave.height, cave.width, cave.height); });
  } else if (currentLevel === 3) {
    if (bg3Loaded) ctx.drawImage(bg3Img, 0, 0, levelWidth, canvas.height);
    else { ctx.fillStyle = '#450a0a'; ctx.fillRect(0, 0, levelWidth, canvas.height); ctx.fillStyle = '#262626'; ctx.fillRect(0, groundY, levelWidth, 50); }
    lavaPitsFase3.forEach(pit => {
      ctx.fillStyle = '#171717'; ctx.fillRect(pit.x, groundY, pit.width, 50);
      const waveY = Math.sin(pit.offset) * 3; const slideX = (pit.offset * 8) % 15;
      if (waterfireLoaded) ctx.drawImage(waterfireImg, pit.x - slideX, groundY + waveY, pit.width + 15, pit.height);
    });
  } else if (currentLevel === 4) {
    if (bg4Loaded) ctx.drawImage(bg4Img, 0, 0, levelWidth, canvas.height);
    else { ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0, 0, levelWidth, canvas.height); ctx.fillStyle = '#e2e8f0'; ctx.fillRect(0, groundY, levelWidth, 50); }
  } else if (currentLevel === 5) {
    if (bg5Loaded) ctx.drawImage(bg5Img, 0, 0, levelWidth, canvas.height);
    else { ctx.fillStyle = '#312e81'; ctx.fillRect(0, 0, levelWidth, canvas.height); ctx.fillStyle = '#1e293b'; ctx.fillRect(0, groundY, levelWidth, 50); }
  }

  // Desenhar Imagem do Portal (2x o tamanho do Ben: 180px x 180px)
  if (portalLoaded) {
    ctx.drawImage(portalImg, portal.x, portal.y, portal.width, portal.height);
  } else {
    ctx.fillStyle = '#a855f7'; ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
    ctx.fillStyle = '#c084fc'; ctx.fillRect(portal.x + 5, portal.y + 5, portal.width - 10, portal.height - 10);
  }

  // Moedas
  currentItems.forEach(item => { if (!item.collected) ctx.drawImage(coinImg, item.x, item.y, item.size, item.size); });

  // Caranguejos
  currentEnemies.forEach(enemy => {
    if (enemy.alive) {
      const currentCrabImg = enemy.direction === 1 ? crabRightImg : crabLeftImg;
      ctx.drawImage(currentCrabImg, enemy.x, enemy.y, enemy.width, enemy.height);
    }
  });

  // Morcegos
  if (currentLevel === 2) {
    batsFase2.forEach(bat => { if (bat.alive && batLoaded) ctx.drawImage(batImg, bat.x, bat.y, bat.width, bat.height); });
  }

  // Bolas de Fogo
  if (currentLevel === 3) {
    fireballsFase3.forEach(fb => { if (fb.alive && fireballLoaded) ctx.drawImage(fireballImg, fb.x, fb.y, fb.width, fb.height); });
  }

  // Zumbis Perseguidores (Fase 4)
  if (currentLevel === 4) {
    zombiesFase4.forEach(zombie => {
      if (zombie.alive) {
        const currentZombieImg = zombie.direction === 1 ? zombieRightImg : zombieLeftImg;
        const isLoaded = zombie.direction === 1 ? zombieRightLoaded : zombieLeftLoaded;

        if (isLoaded) {
          ctx.drawImage(currentZombieImg, zombie.x, zombie.y, zombie.width, zombie.height);
        } else {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(zombie.x, zombie.y, zombie.width, zombie.height);
        }
      }
    });
  }

  // Aranha e Teias (Fase 5)
  if (currentLevel === 5) {
    spidersFase5.forEach(spider => {
      if (spider.alive) {
        let currentSpiderImg = spider.direction === 1 ? spiderRightImg : spiderLeftImg;
        if (spider.isAttacking && spiderAttackLoaded) {
          currentSpiderImg = spiderAttackImg;
        }

        ctx.drawImage(currentSpiderImg, spider.x, spider.y, spider.width, spider.height);
      }
    });

    spiderWebsFase5.forEach(web => {
      if (web.alive) {
        if (webLoaded) {
          ctx.drawImage(webImg, web.x, web.y, web.width, web.height);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(web.x + web.width / 2, web.y + web.height / 2, web.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }

  // Desenhar Ben
  if (ben.alive) {
    if (ben.isAttacking) {
      if (ben.facing === 'right') {
        ctx.drawImage(benAttackRightImg, ben.x, ben.y, ben.width + 20, ben.height);
      } else {
        ctx.drawImage(benAttackLeftImg, ben.x - 20, ben.y, ben.width + 20, ben.height);
      }
    } else {
      ctx.save();
      if (ben.facing === 'left') {
        ctx.translate(ben.x + ben.width, ben.y);
        ctx.scale(-1, 1);
        ctx.drawImage(benImg, 0, 0, ben.width, ben.height);
      } else {
        ctx.drawImage(benImg, ben.x, ben.y, ben.width, ben.height);
      }
      ctx.restore();
    }
  }

  ctx.restore();

  // Interface Fixa
  if (currentLevel === 1) drawPixelSun();
  else if (currentLevel === 2) drawPixelMoon();
  else if (currentLevel === 3) drawPixelFireSun();
  else if (currentLevel === 4 || currentLevel === 5) drawPixelStar();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial';
  ctx.fillText(`Fase: ${currentLevel} | Pontos: ${ben.score}`, 20, 30);

  // Game Over
  if (!ben.alive) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 36px Arial'; ctx.textAlign = 'center';
    ctx.fillText('VOCÊ MORREU!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = '#ffffff'; ctx.font = '18px Arial';
    ctx.fillText('Toque na tela ou pressione PULAR/ESPAÇO para tentar novamente', canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = 'left';
  }

  // Vitória
  if (levelCompleted) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fde047'; ctx.font = 'bold 32px Arial'; ctx.textAlign = 'center';

    if (currentLevel === 1) {
      ctx.fillText('FASE 1 CONCLUÍDA!', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillStyle = '#ffffff'; ctx.font = '20px Arial';
      ctx.fillText('Toque na tela ou aperte PULAR/ESPAÇO para ir para a Fase 2 (Selva)!', canvas.width / 2, canvas.height / 2 + 30);
    } else if (currentLevel === 2) {
      ctx.fillText('FASE 2 CONCLUÍDA!', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillStyle = '#ffffff'; ctx.font = '20px Arial';
      ctx.fillText('Toque na tela ou aperte PULAR/ESPAÇO para ir para a Fase 3 (Vulcão)!', canvas.width / 2, canvas.height / 2 + 30);
    } else if (currentLevel === 3) {
      ctx.fillText('FASE 3 CONCLUÍDA!', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillStyle = '#ffffff'; ctx.font = '20px Arial';
      ctx.fillText('Toque na tela ou aperte PULAR/ESPAÇO para ir para a Fase 4 (Castelo)!', canvas.width / 2, canvas.height / 2 + 30);
    } else if (currentLevel === 4) {
      ctx.fillText('FASE 4 CONCLUÍDA!', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillStyle = '#ffffff'; ctx.font = '20px Arial';
      ctx.fillText('Toque na tela ou aperte PULAR/ESPAÇO para ir para a Fase 5 (Templo da Aranha)!', canvas.width / 2, canvas.height / 2 + 30);
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