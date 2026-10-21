// Carregar a imagem do Ben
const benImg = new Image();
benImg.src = 'ben.png';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Personagem Principal: BEN
const ben = {
  x: 50,
  y: 200,
  width: 50,
  height: 75,
  color: '#2563eb', // Roupa do Ben
  velocityX: 0,
  velocityY: 0,
  speed: 5,
  jumpForce: -12,
  grounded: false,
  score: 0
};

// Configurações do Ambiente
const gravity = 0.6;
const groundY = canvas.height - 50;

// Elementos da Fase 1 (Praia)
const items = [
  { x: 200, y: groundY - 30, size: 15, collected: false },
  { x: 400, y: groundY - 30, size: 15, collected: false },
  { x: 600, y: groundY - 30, size: 15, collected: false }
];

const enemy = {
  x: 500,
  y: groundY - 25,
  width: 30,
  height: 25,
  speed: 2,
  direction: 1
};

// Controles
const keys = { right: false, left: false };

// Eventos de Teclado (PC)
window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if ((e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') && ben.grounded) {
    ben.velocityY = ben.jumpForce;
    ben.grounded = false;
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

// Atualização da Lógica
function update() {
  // Movimento do Ben
  if (keys.right) ben.velocityX = ben.speed;
  else if (keys.left) ben.velocityX = -ben.speed;
  else ben.velocityX = 0;

  ben.x += ben.velocityX;
  ben.y += ben.velocityY;

  // Gravidade
  if (!ben.grounded) {
    ben.velocityY += gravity;
  }

  // Colisão com a Areia (Chão)
  if (ben.y + ben.height >= groundY) {
    ben.y = groundY - ben.height;
    ben.velocityY = 0;
    ben.grounded = true;
  }

  // Limites da tela
  if (ben.x < 0) ben.x = 0;
  if (ben.x + ben.width > canvas.width) ben.x = canvas.width - ben.width;

  // Movimento do Caranguejo (Inimigo)
  enemy.x += enemy.speed * enemy.direction;
  if (enemy.x <= 350 || enemy.x + enemy.width >= 700) {
    enemy.direction *= -1; // Inverte direção
  }

  // Colisão do Ben com Águas de Coco (Colecionáveis)
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

// Desenho na Tela
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenhar Mar ao fundo
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, groundY - 30, canvas.width, 30);

  // Desenhar Areia da Praia
  ctx.fillStyle = '#fde047';
  ctx.fillRect(0, groundY, canvas.width, 50);

  // Desenhar Águas de Coco (Verdes)
  items.forEach(item => {
    if (!item.collected) {
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Desenhar Caranguejo (Vermelho)
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

  // Desenhar o Ben
  ctx.drawImage(benImg, ben.x, ben.y, ben.width, ben.height);

  // Placar de Pontos
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

gameLoop();