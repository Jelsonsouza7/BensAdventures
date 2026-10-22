const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Estado do Jogo
let currentLevel = 1; // 1 = Praia, 2 = Selva, 3 = Vulcão
let levelCompleted = false;

// Carregar Imagens Base
const benImg = new Image(); benImg.src = 'ben.png';
const benAttackRightImg = new Image(); benAttackRightImg.src = 'ben_attack_right.png';
const benAttackLeftImg = new Image(); benAttackLeftImg.src = 'ben_attack_left.png';
const coinImg = new Image(); coinImg.src = 'moeda.png';
const crabLeftImg = new Image(); crabLeftImg.src = 'crab_left.png';
const crabRightImg = new Image(); crabRightImg.src = 'crab_right.png';
const treeImg = new Image(); treeImg.src = 'tree.png';

// Imagens da Fase 2 (Selva)
let batLoaded = false;
const batImg = new Image(); batImg.src = 'bat.png';
batImg.onload = () => { batLoaded = true; };

let caveLoaded = false;
const caveImg = new Image(); caveImg.src = 'cave.png';
caveImg.onload = () => { caveLoaded = true; };

// Imagens da Fase 3 (Vulcão)
let fireballLoaded = false;
const fireballImg = new Image(); fireballImg.src = 'fireball.png';
fireballImg.onload = () => { fireballLoaded = true; };

let waterfireLoaded = false;
const waterfireImg = new Image(); waterfireImg.src = 'waterfire.png';
waterfireImg.onload = () => { waterfireLoaded = true; };

// Personagem Principal: BEN
const ben = {
  x: 50,
  y: 200,
  width: 50,
  height: 75,
  velocityX: 0,
  velocityY: 0,
  speed: 5,
  jumpForce: -12,
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

// Portal do Fim da Fase
const portal = { x: 3880, y: groundY - 80, width: 50, height: 80 };

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
// Poços de Lava no chão (waterfire.png vai animar dentro deles)
const lavaPitsFase3 = [
  { x: 600, width: 180, height: 40, offset: 0 },
  { x: 1400, width: 220, height: 40, offset: 0 },
  { x: 2200, width: 200, height: 40, offset: 0 },
  { x: 3000, width: 250, height: 40, offset: 0 }
];

// Bolas de Fogo Voadoras (fireball.png)
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

let currentItems = itemsFase1;
let currentEnemies = enemiesFase1;

function resetBats() {
  batsFase2 = initialBatPositions.map(bat => ({ ...bat, alive: true }));
}

function resetFireballs() {
  fireballsFase3 = initialFireballPositions.map(fb => ({ ...fb, alive: true }));
}

function startLevel2() {
  currentLevel = 2;
  levelCompleted = false;
  ben.x = 50; ben.y = 200;
  ben.velocityX = 0; ben.velocityY = 0; ben.alive = true;
  cameraX = 0;
  currentItems = itemsFase2;
  currentEnemies = enemiesFase1;
  resetBats();
}

function startLevel3() {
  currentLevel = 3;
  levelCompleted = false;
  ben.x = 50; ben.y = 200;
  ben.velocityX = 0; ben.velocityY = 0; ben.alive = true;
  cameraX = 0;
  currentItems = itemsFase3;
  currentEnemies = []; // Sem caranguejos na lava
  resetFireballs();
}

function restartGame() {
  ben.x = 50; ben.y = 200;
  ben.velocityX = 0; ben.velocityY = 0; ben.alive = true;
  ben.score = 0;
  levelCompleted = false;

  itemsFase1.forEach(item => item.collected = false);
  enemiesFase1.forEach(enemy => enemy.alive = true);

  itemsFase2.forEach(item => item.collected = false);
  resetBats();

  itemsFase3.forEach(item => item.collected = false);
  resetFireballs();

  if (currentLevel === 2) startLevel2();
  if (currentLevel === 3) startLevel3();
}

function handleAction() {
  if (levelCompleted) {
    if (currentLevel === 1) { startLevel2(); return true; }
    if (currentLevel === 2) { startLevel3(); return true; }
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

  // Lógica da Fase 3: Animação da Lava (waterfire) e Queda nos Poços
  if (currentLevel === 3) {
    lavaPitsFase3.forEach(pit => {
      // Animação contínua da lava se movendo dentro do poço
      pit.offset += 0.08;

      // Se o Ben pisar dentro do poço de lava, morre na hora
      if (ben.x + ben.width > pit.x &&
          ben.x < pit.x + pit.width &&
          ben.y + ben.height >= groundY - 10) {
        ben.alive = false;
      }
    });

    // Movimento das Bolas de Fogo Voadoras (fireball)
    fireballsFase3.forEach(fb => {
      if (fb.alive) {
        fb.x -= fb.speed;

        if (fb.x + fb.width < cameraX) {
          fb.x = cameraX + canvas.width + 300;
        }

        if (ben.x < fb.x + fb.width &&
            ben.x + ben.width > fb.x &&
            ben.y < fb.y + fb.height &&
            ben.y + ben.height > fb.y) {
          ben.alive = false;
        }
      }
    });
  }

  // Ataque de Espada
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
      if (enemy.alive &&
          attackArea.x < enemy.x + enemy.width &&
          attackArea.x + attackArea.width > enemy.x &&
          attackArea.y < enemy.y + enemy.height &&
          attackArea.y + attackArea.height > enemy.y) {
        
        const isBackAttack = (ben.facing === 'right' && enemy.direction === 1) ||
                             (ben.facing === 'left' && enemy.direction === -1);

        if (isBackAttack) {
          enemy.alive = false;
          ben.score += 50;
        }
      }
    });

    if (currentLevel === 2) {
      batsFase2.forEach(bat => {
        if (bat.alive &&
            attackArea.x < bat.x + bat.width &&
            attackArea.x + attackArea.width > bat.x &&
            attackArea.y < bat.y + bat.height &&
            attackArea.y + attackArea.height > bat.y) {
          bat.alive = false;
          ben.score += 60;
        }
      });
    }

    if (currentLevel === 3) {
      fireballsFase3.forEach(fb => {
        if (fb.alive &&
            attackArea.x < fb.x + fb.width &&
            attackArea.x + attackArea.width > fb.x &&
            attackArea.y < fb.y + fb.height &&
            attackArea.y + attackArea.height > fb.y) {
          fb.alive = false;
          ben.score += 70;
        }
      });
    }
  }

  currentEnemies.forEach(enemy => {
    if (enemy.alive) {
      enemy.x += enemy.speed * enemy.direction;
      if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) {
        enemy.direction *= -1;
      }

      if (ben.x < enemy.x + enemy.width &&
          ben.x + ben.width > enemy.x &&
          ben.y < enemy.y + enemy.height &&
          ben.y + ben.height > enemy.y) {
        ben.alive = false;
      }
    }
  });

  if (currentLevel === 2) {
    batsFase2.forEach(bat => {
      if (bat.alive) {
        bat.x -= bat.speed;

        if (bat.x + bat.width < cameraX) {
          bat.x = cameraX + canvas.width + 400;
        }

        if (ben.x < bat.x + bat.width &&
            ben.x + ben.width > bat.x &&
            ben.y < bat.y + bat.height &&
            ben.y + ben.height > bat.y) {
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
    if (!item.collected &&
        ben.x < item.x + item.size &&
        ben.x + ben.width > item.x &&
        ben.y < item.y + item.size &&
        ben.y + ben.height > item.y) {
      item.collected = true;
      ben.score += 10;
    }
  });

  if (ben.x + ben.width > portal.x &&
      ben.x < portal.x + portal.width &&
      ben.y + ben.height > portal.y) {
    levelCompleted = true;
  }
}

// Desenhar Sol (Fase 1)
function drawPixelSun() {
  const p = 5;
  const startX = canvas.width - 90;
  const startY = 20;

  ctx.fillStyle = '#facc15';
  ctx.fillRect(startX + p * 2, startY + p * 2, p * 8, p * 8);

  ctx.fillRect(startX + p * 5, startY, p * 2, p * 2);
  ctx.fillRect(startX + p * 5, startY + p * 10, p * 2, p * 2);
  ctx.fillRect(startX, startY + p * 5, p * 2, p * 2);
  ctx.fillRect(startX + p * 10, startY + p * 5, p * 2, p * 2);
  
  ctx.fillRect(startX + p, startY + p, p * 2, p * 2);
  ctx.fillRect(startX + p * 9, startY + p, p * 2, p * 2);
  ctx.fillRect(startX + p, startY + p * 9, p * 2, p * 2);
  ctx.fillRect(startX + p * 9, startY + p * 9, p * 2, p * 2);
}

// Desenhar Lua (Fase 2)
function drawPixelMoon() {
  const p = 5;
  const startX = canvas.width - 80;
  const startY = 20;

  ctx.fillStyle = '#e2e8f0';

  const moonMatrix = [
    [0, 0, 1, 1, 1, 0],
    [0, 1, 1, 1, 0, 0],
    [1, 1, 1, 0, 0, 0],
    [1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0]
  ];

  for (let r = 0; r < moonMatrix.length; r++) {
    for (let c = 0; c < moonMatrix[r].length; c++) {
      if (moonMatrix[r][c] === 1) {
        ctx.fillRect(startX + c * p, startY + r * p, p, p);
      }
    }
  }
}

// Desenhar Sol de Fogo / Vulcão (Fase 3)
function drawPixelFireSun() {
  const p = 5;
  const startX = canvas.width - 90;
  const startY = 20;

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(startX + p * 2, startY + p * 2, p * 8, p * 8);

  ctx.fillStyle = '#f97316';
  ctx.fillRect(startX + p * 5, startY, p * 2, p * 2);
  ctx.fillRect(startX + p * 5, startY + p * 10, p * 2, p * 2);
  ctx.fillRect(startX, startY + p * 5, p * 2, p * 2);
  ctx.fillRect(startX + p * 10, startY + p * 5, p * 2, p * 2);
}

// Desenhar Cenas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-cameraX, 0);

  if (currentLevel === 1) {
    // Fase 1: Praia
    ctx.fillStyle = '#0284c7'; ctx.fillRect(0, groundY - 30, levelWidth, 30);
    ctx.fillStyle = '#fde047'; ctx.fillRect(0, groundY, levelWidth, 50);

    treesFase1.forEach(tree => {
      ctx.drawImage(treeImg, tree.x, groundY - tree.height, tree.width, tree.height);
    });
  } else if (currentLevel === 2) {
    // Fase 2: Selva & Cavernas
    ctx.fillStyle = '#064e3b'; ctx.fillRect(0, 0, levelWidth, canvas.height);
    ctx.fillStyle = '#15803d'; ctx.fillRect(0, groundY, levelWidth, 10);
    ctx.fillStyle = '#78350f'; ctx.fillRect(0, groundY + 10, levelWidth, 40);

    cavesFase2.forEach(cave => {
      if (caveLoaded) {
        ctx.drawImage(caveImg, cave.x, groundY - cave.height, cave.width, cave.height);
      } else {
        ctx.fillStyle = '#374151';
        ctx.fillRect(cave.x, groundY - cave.height, cave.width, cave.height);
      }
    });
  } else if (currentLevel === 3) {
    // Fase 3: Vulcão
    ctx.fillStyle = '#450a0a'; ctx.fillRect(0, 0, levelWidth, canvas.height); // Céu vermelho/escuro
    ctx.fillStyle = '#262626'; ctx.fillRect(0, groundY, levelWidth, 50);       // Chão de pedra vulcânica

    // Desenhar Poços de Lava com a imagem 'waterfire.png' animada em movimento
    lavaPitsFase3.forEach(pit => {
      // Abertura do buraco escuro
      ctx.fillStyle = '#171717';
      ctx.fillRect(pit.x, groundY, pit.width, 50);

      const waveY = Math.sin(pit.offset) * 4; // Efeito de onda suave para cima e para baixo
      const slideX = (pit.offset * 10) % 20;  // Movimento deslizante contínuo

      if (waterfireLoaded) {
        ctx.drawImage(waterfireImg, pit.x - slideX, groundY + waveY, pit.width + 20, pit.height);
      } else {
        // Substituto caso a imagem ainda não tenha carregado
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(pit.x, groundY + waveY, pit.width, pit.height);
      }
    });
  }

  // Portal
  ctx.fillStyle = '#a855f7'; ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
  ctx.fillStyle = '#c084fc'; ctx.fillRect(portal.x + 5, portal.y + 5, portal.width - 10, portal.height - 10);

  // Moedas
  currentItems.forEach(item => {
    if (!item.collected) {
      ctx.drawImage(coinImg, item.x, item.y, item.size, item.size);
    }
  });

  // Caranguejos
  currentEnemies.forEach(enemy => {
    if (enemy.alive) {
      const currentCrabImg = enemy.direction === 1 ? crabRightImg : crabLeftImg;
      ctx.drawImage(currentCrabImg, enemy.x, enemy.y, enemy.width, enemy.height);
    }
  });

  // Morcegos
  if (currentLevel === 2) {
    batsFase2.forEach(bat => {
      if (bat.alive) {
        if (batLoaded) {
          ctx.drawImage(batImg, bat.x, bat.y, bat.width, bat.height);
        } else {
          ctx.fillStyle = '#6b21a8';
          ctx.fillRect(bat.x, bat.y, bat.width, bat.height);
        }
      }
    });
  }

  // Bolas de Fogo (fireball.png - Fase 3)
  if (currentLevel === 3) {
    fireballsFase3.forEach(fb => {
      if (fb.alive) {
        if (fireballLoaded) {
          ctx.drawImage(fireballImg, fb.x, fb.y, fb.width, fb.height);
        } else {
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(fb.x + fb.width / 2, fb.y + fb.height / 2, fb.width / 2, 0, Math.PI * 2);
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

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial';
  ctx.fillText(`Fase: ${currentLevel} | Pontos: ${ben.score}`, 20, 30);

  // Game Over
  if (!ben.alive) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VOCÊ MORREU!', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.fillText('Toque na tela ou pressione PULAR/ESPAÇO para tentar novamente', canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = 'left';
  }

  // Vitória / Transição
  if (levelCompleted) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';

    if (currentLevel === 1) {
      ctx.fillText('FASE 1 CONCLUÍDA!', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('Toque na tela ou aperte PULAR/ESPAÇO para ir para a Fase 2 (Selva)!', canvas.width / 2, canvas.height / 2 + 30);
    } else if (currentLevel === 2) {
      ctx.fillText('FASE 2 CONCLUÍDA!', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('Toque na tela ou aperte PULAR/ESPAÇO para ir para a Fase 3 (Vulcão)!', canvas.width / 2, canvas.height / 2 + 30);
    } else {
      ctx.fillText('PARABÉNS! ZEROU O VULCÃO!', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText(`Pontuação Final: ${ben.score}`, canvas.width / 2, canvas.height / 2 + 30);
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