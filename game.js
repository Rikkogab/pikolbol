const canvas = document.getElementById('game-canvas');
const court = document.getElementById('court');
const context = canvas.getContext('2d');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const ball = {
    x: 0,
    y: 0,
    vx: 205,
    vy: 148,
    radius: 20,
    rotation: 0
};

let width = 0;
let height = 0;
let previousFrame = 0;
let animationFrame = 0;
let isVisible = true;

function resizeCanvas() {
    const bounds = court.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const wasInitialized = width > 0 && height > 0;
    const previousX = wasInitialized ? ball.x / width : 0.38;
    const previousY = wasInitialized ? ball.y / height : 0.42;

    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    ball.radius = Math.max(12, Math.min(22, width * 0.022));
    ball.x = Math.max(ball.radius, Math.min(width - ball.radius, width * previousX));
    ball.y = Math.max(ball.radius, Math.min(height - ball.radius, height * previousY));
    draw();
}

function drawPickleball() {
    context.save();
    context.translate(ball.x, ball.y);
    context.rotate(ball.rotation);
    context.shadowColor = 'rgba(17, 42, 27, 0.36)';
    context.shadowBlur = 13;
    context.shadowOffsetY = 6;

    const fill = context.createRadialGradient(
        -ball.radius * 0.38,
        -ball.radius * 0.42,
        ball.radius * 0.08,
        ball.radius * 0.08,
        ball.radius * 0.08,
        ball.radius * 1.15
    );
    fill.addColorStop(0, '#e8ff83');
    fill.addColorStop(0.64, '#c5eb45');
    fill.addColorStop(1, '#91c72a');

    context.beginPath();
    context.fillStyle = fill;
    context.arc(0, 0, ball.radius, 0, Math.PI * 2);
    context.fill();
    context.shadowColor = 'transparent';

    const holes = [
        [-0.42, -0.42], [0, -0.52], [0.42, -0.42],
        [-0.58, 0], [-0.2, -0.1], [0.2, -0.1], [0.58, 0],
        [-0.42, 0.42], [0, 0.52], [0.42, 0.42]
    ];

    holes.forEach(([x, y]) => {
        context.beginPath();
        context.fillStyle = 'rgba(56, 101, 41, 0.46)';
        context.arc(x * ball.radius, y * ball.radius, ball.radius * 0.075, 0, Math.PI * 2);
        context.fill();
    });

    context.restore();
}

function drawNet() {
    const netY = height / 2;
    const left = width * 0.042;
    const right = width * 0.958;

    context.save();
    context.strokeStyle = 'rgba(19, 58, 37, 0.56)';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(left, netY);
    context.lineTo(right, netY);
    context.stroke();

    context.strokeStyle = 'rgba(228, 247, 208, 0.18)';
    context.lineWidth = 1;
    for (let x = left + 12; x < right; x += 16) {
        context.beginPath();
        context.moveTo(x, netY - 6);
        context.lineTo(x, netY + 6);
        context.stroke();
    }
    context.restore();
}

function draw() {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    drawNet();
    drawPickleball();
}

function animate(timestamp) {
    animationFrame = 0;
    if (!isVisible || document.hidden || reducedMotion.matches) return;

    const elapsed = Math.min((timestamp - (previousFrame || timestamp)) / 1000, 0.04);
    previousFrame = timestamp;
    ball.x += ball.vx * elapsed;
    ball.y += ball.vy * elapsed;
    ball.rotation += elapsed * 1.8;

    if (ball.x + ball.radius >= width || ball.x - ball.radius <= 0) {
        ball.x = Math.max(ball.radius, Math.min(width - ball.radius, ball.x));
        ball.vx *= -1;
    }
    if (ball.y + ball.radius >= height || ball.y - ball.radius <= 0) {
        ball.y = Math.max(ball.radius, Math.min(height - ball.radius, ball.y));
        ball.vy *= -1;
    }

    draw();
    animationFrame = window.requestAnimationFrame(animate);
}

function updateAnimation() {
    if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
    }
    previousFrame = 0;

    if (reducedMotion.matches || !isVisible || document.hidden) {
        draw();
        return;
    }
    animationFrame = window.requestAnimationFrame(animate);
}

const observer = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
    updateAnimation();
});

observer.observe(court);
window.addEventListener('resize', resizeCanvas);
document.addEventListener('visibilitychange', updateAnimation);
reducedMotion.addEventListener('change', updateAnimation);

resizeCanvas();
updateAnimation();
