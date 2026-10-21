const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Carregar a Imagem do Ben
const benImg = new Image();
benImg.src = 'ben.png';

// Personagem Principal: BEN
const ben = {
  x: 50,
  y: 200,
  width: 170,    // Tamanho ajustado para dar boa visibilidade
  height: 170,   // Proporção ideal
  velocityX: 0,
  velocityY: 0,
  speed: 5,
  jumpForce: -12,
  grounded: false,
  facing: 'right', // Controla a direção em que o Ben está virado
  score: 0
};

// Configurações da Câmera e do Mapa
let cameraX = 0;
const levelWidth = 2400; // Tamanho total da fase (3x a tela)
const gravity = 0.6;
const groundY = canvas.height - 50;

// Elementos da Fase 1 (Praia)
const items = [
  { x: 300, y: groundY - 30, size: 16, collected: false },
  { x: 700, y: groundY - 30, size: 16, collected: false },
  { x: 1200, y: groundY - 30, size: 16, collected: false },
  { x: 1700, y: groundY - 30, size: 16, collected: false },
  { x: 2100, y: groundY - 30, size: 16, collected: false }
];

const enemy = {
  x: 600,
  y: groundY - 25,
  width: 35,
  height: 25,
  speed: 2,
  direction: 1
};

// Mapeamento dos Controles
const keys = { right: false, left: false };

// Eventos de Teclado (PC)
window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if ((e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') && ben.grounded) {
    ben.velocityY = ben.jumpForce;
    ben.grounded = false;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
});

// Eventos de Toque (Telemóvel / Touch)
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');
const btnJump = document.getElementById('btnJump');

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

// Lógica Principal de Atualização
function update() {
  // Movimento Horizontal e Direção
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

  // Gravidade
  if (!ben.grounded) {
    ben.velocityY += gravity;
  }

  // Colisão com o Chão (Areia)
  if (ben.y + ben.height >= groundY) {
    ben.y = groundY - ben.height;
    ben.velocityY = 0;
    ben.grounded = true;
  }

  // Limites Globais da Fase
  if (ben.x < 0) ben.x = 0;
  if (ben.x + ben.width > levelWidth) ben.x = levelWidth - ben.width;

  // Atualização da Câmera
  if (ben.x > canvas.width / 2 && ben.x < levelWidth - canvas.width / 2) {
    cameraX = ben.x - canvas.width / 2;
  } else if (ben.x <= canvas.width / 2) {
    cameraX = 0;
  } else if (ben.x >= levelWidth - canvas.width / 2) {
    cameraX = levelWidth - canvas.width;
  }

  // Movimento do Inimigo (Caranguejo)
  enemy.x += enemy.speed * enemy.direction;
  if (enemy.x <= 500 || enemy.x + enemy.width >= 900) {
    enemy.direction *= -1;
  }

  // Colisão com os Colecionáveis (Água de Coco)
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
}

// Função de Renderização / Desenho
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // --- ELEMENTOS DO MUNDO (Movem-se com a câmera) ---
  ctx.save();
  ctx.translate(-cameraX, 0);

  // Mar ao Fundo
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, groundY - 30, levelWidth, 30);

  // Areia da Praia
  ctx.fillStyle = '#fde047';
  ctx.fillRect(0, groundY, levelWidth, 50);

  // Águas de Coco (Verdes)
  items.forEach(item => {
    if (!item.collected) {
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Caranguejo (Vermelho)
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

  // Desenhar o Ben (Com Inversão de Lado)
  ctx.save();
  if (ben.facing === 'left') {
    ctx.translate(ben.x + ben.width, ben.y);
    ctx.scale(-1, 1);
    ctx.drawImage(benImg, 0, 0, ben.width, ben.height);
  } else {
    ctx.drawImage(benImg, ben.x, ben.y, ben.width, ben.height);
  }
  ctx.restore();

  ctx.restore(); // Restaura para coordenadas normais da tela

  // --- INTERFACE FIXA (Não se move com a câmera) ---
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial';
  ctx.fillText(`Pontos: ${ben.score}`, 20, 30);
}

// Loop Principal
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Iniciar o Jogo
gameLoop();