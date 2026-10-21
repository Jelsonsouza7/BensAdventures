const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Carregar Imagens do Ben
const benImg = new Image();
benImg.src = 'ben.png';

const benAttackRightImg = new Image();
benAttackRightImg.src = 'ben_attack_right.png';

const benAttackLeftImg = new Image();
benAttackLeftImg.src = 'ben_attack_left.png';

// Carregar Imagem da Moeda
const coinImg = new Image();
coinImg.src = 'moeda.png';

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
  score: 0
};

// Configurações Globais e Câmera
let cameraX = 0;
const levelWidth = 4000; // Fase bem mais longa! (Era 2400)
const gravity = 0.6;
const groundY = canvas.height - 50;
let levelCompleted = false;

// Portal do Fim da Fase
const portal = {
  x: 3880,
  y: groundY - 80,
  width: 50,
  height: 80
};

// Plataformas / Coqueiros (Distribuídos ao longo dos 4000px)
const palmTrees = [
  { x: 400, trunkWidth: 20, height: 120, topWidth: 100 },
  { x: 900, trunkWidth: 20, height: 140, topWidth: 110 },
  { x: 1500, trunkWidth: 20, height: 130, topWidth: 100 },
  { x: 2100, trunkWidth: 20, height: 150, topWidth: 120 },
  { x: 2700, trunkWidth: 20, height: 130, topWidth: 100 },
  { x: 3300, trunkWidth: 20, height: 140, topWidth: 110 }
];

// Plataformas no topo dos coqueiros
const platforms = palmTrees.map(tree => ({
  x: tree.x - tree.topWidth / 2 + tree.trunkWidth / 2,
  y: groundY - tree.height,
  width: tree.topWidth,
  height: 15
}));

// Obstáculos do Chão (Pedras na areia)
const obstacles = [
  { x: 250, width: 30, height: 20 },
  { x: 750, width: 35, height: 25 },
  { x: 1300, width: 40, height: 25 },
  { x: 1800, width: 30, height: 20 },
  { x: 2400, width: 35, height: 25 },
  { x: 3000, width: 40, height: 25 },
  { x: 3500, width: 30, height: 20 }
];

// Moedas Colecionáveis (Aumentadas para size: 32)
const items = [
  { x: 300, y: groundY - 35, size: 32, collected: false },
  { x: 400, y: groundY - 140, size: 32, collected: false },
  { x: 700, y: groundY - 35, size: 32, collected: false },
  { x: 900, y: groundY - 160, size: 32, collected: false },
  { x: 1200, y: groundY - 35, size: 32, collected: false },
  { x: 1500, y: groundY - 150, size: 32, collected: false },
  { x: 1700, y: groundY - 35, size: 32, collected: false },
  { x: 2100, y: groundY - 170, size: 32, collected: false },
  { x: 2500, y: groundY - 35, size: 32, collected: false },
  { x: 2700, y: groundY - 150, size: 32, collected: false },
  { x: 3100, y: groundY - 35, size: 32, collected: false },
  { x: 3300, y: groundY - 160, size: 32, collected: false },
  { x: 3600, y: groundY - 35, size: 32, collected: false }
];

// Inimigos (Caranguejos)
const enemies = [
  { x: 550, y: groundY - 25, width: 35, height: 25, speed: 2, direction: 1, minX: 480, maxX: 700, alive: true },
  { x: 1050, y: groundY - 25, width: 35, height: 25, speed: 2.5, direction: 1, minX: 980, maxX: 1250, alive: true },
  { x: 1600, y: groundY - 25, width: 35, height: 25, speed: 2, direction: -1, minX: 1400, maxX: 1750, alive: true },
  { x: 2150, y: groundY - 25, width: 35, height: 25, speed: 3, direction: 1, minX: 1950, maxX: 2300, alive: true },
  { x: 2800, y: groundY - 25, width: 35, height: 25, speed: 2.5, direction: 1, minX: 2600, maxX: 2950, alive: true },
  { x: 3400, y: groundY - 25, width: 35, height: 25, speed: 3, direction: -1, minX: 3200, maxX: 3600, alive: true }
];

// Controles do Teclado
const keys = { right: false, left: false };

window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  
  if ((e.code === 'ArrowUp' || e.code === 'KeyW') && ben.grounded) {
    ben.velocityY = ben.jumpForce;
    ben.grounded = false;
  }

  if (e.code === 'Space' && !ben.isAttacking) {
    ben.isAttacking = true;
    ben.attackTimer = 15;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
});

// Eventos de Toque (Telemóvel)
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');
const btnJump = document.getElementById('btnJump');
const btnAttack = document.getElementById('btnAttack');

if (btnLeft && btnRight && btnJump) {
  btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); keys.left = true; });
  btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); keys.left = false; });

  btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); keys.right = true; });
  btnRight.addEventListener('touchend', (e) => { e.preventDefault(); keys.right = false; });

  btnJump.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (ben.grounded) {
      ben.velocityY = ben.jumpForce;
      ben.grounded = false;
    }
  });
}

if (btnAttack) {
  btnAttack.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!ben.isAttacking) {
      ben.isAttacking = true;
      ben.attackTimer = 15;
    }
  });
}

// Lógica de Atualização
function update() {
  if (levelCompleted) return; // Trava movimentação ao terminar a fase

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

  let onAnySurface = false;
  if (ben.y + ben.height >= groundY) {
    ben.y = groundY - ben.height;
    ben.velocityY = 0;
    ben.grounded = true;
    onAnySurface = true;
  }

  platforms.forEach(plat => {
    if (ben.velocityY >= 0 &&
        ben.x + ben.width > plat.x &&
        ben.x < plat.x + plat.width &&
        ben.y + ben.height >= plat.y &&
        ben.y + ben.height <= plat.y + 15) {
      ben.y = plat.y - ben.height;
      ben.velocityY = 0;
      ben.grounded = true;
      onAnySurface = true;
    }
  });

  if (!onAnySurface) {
    ben.grounded = false;
  }

  if (ben.x < 0) ben.x = 0;
  if (ben.x + ben.width > levelWidth) ben.x = levelWidth - ben.width;

  // Ataque de Espada
  if (ben.isAttacking) {
    ben.attackTimer--;
    if (ben.attackTimer <= 0) {
      ben.isAttacking = false;
    }

    const attackArea = {
      x: ben.facing === 'right' ? ben.x + ben.width : ben.x - 30,
      y: ben.y,
      width: 35,
      height: ben.height
    };

    enemies.forEach(enemy => {
      if (enemy.alive &&
          attackArea.x < enemy.x + enemy.width &&
          attackArea.x + attackArea.width > enemy.x &&
          attackArea.y < enemy.y + enemy.height &&
          attackArea.y + attackArea.height > enemy.y) {
        enemy.alive = false;
        ben.score += 50;
      }
    });
  }

  // Movimento dos Inimigos
  enemies.forEach(enemy => {
    if (enemy.alive) {
      enemy.x += enemy.speed * enemy.direction;
      if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) {
        enemy.direction *= -1;
      }
    }
  });

  // Acompanhamento da Câmera
  if (ben.x > canvas.width / 2 && ben.x < levelWidth - canvas.width / 2) {
    cameraX = ben.x - canvas.width / 2;
  } else if (ben.x <= canvas.width / 2) {
    cameraX = 0;
  } else if (ben.x >= levelWidth - canvas.width / 2) {
    cameraX = levelWidth - canvas.width;
  }

  // Coleta de Moedas
  items.forEach(item => {
    if (!item.collected &&
        ben.x < item.x + item.size &&
        ben.x + ben.width > item.x &&
        ben.y < item.y + item.size &&
        ben.y + ben.height > item.y) {
      item.collected = true;
      ben.score += 10;
    }
  });

  // Entrada no Portal (Fim da Fase 1)
  if (ben.x + ben.width > portal.x &&
      ben.x < portal.x + portal.width &&
      ben.y + ben.height > portal.y) {
    levelCompleted = true;
  }
}

// Renderização
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-cameraX, 0);

  // Mar
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, groundY - 30, levelWidth, 30);

  // Areia
  ctx.fillStyle = '#fde047';
  ctx.fillRect(0, groundY, levelWidth, 50);

  // Coqueiros
  palmTrees.forEach(tree => {
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(tree.x, groundY - tree.height, tree.trunkWidth, tree.height);

    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(
      tree.x + tree.trunkWidth / 2,
      groundY - tree.height,
      tree.topWidth / 2,
      20,
      0, 0, Math.PI * 2
    );
    ctx.fill();
  });

  // Pedras
  obstacles.forEach(obs => {
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.roundRect(obs.x, groundY - obs.height, obs.width, obs.height, [8, 8, 0, 0]);
    ctx.fill();
  });

  // Desenhar Portal da Fase 2 (Brilhante e roxo)
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
  ctx.fillStyle = '#c084fc';
  ctx.fillRect(portal.x + 5, portal.y + 5, portal.width - 10, portal.height - 10);

  // Moedas (Tamanho Ajustado)
  items.forEach(item => {
    if (!item.collected) {
      ctx.drawImage(coinImg, item.x, item.y, item.size, item.size);
    }
  });

  // Inimigos
  enemies.forEach(enemy => {
    if (enemy.alive) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
  });

  // Desenhar o Ben
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

  ctx.restore();

  // Interface Fixa
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial';
  ctx.fillText(`Pontos: ${ben.score}`, 20, 30);

  // Tela de Vitória ao entrar no Portal
  if (levelCompleted) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FASE 1 CONCLUÍDA!', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`Pontuação Total: ${ben.score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Prepare-se para a Fase 2...', canvas.width / 2, canvas.height / 2 + 60);
    ctx.textAlign = 'left';
  }
}

// Loop Principal
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();