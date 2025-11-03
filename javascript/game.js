
const canvas = document.getElementById('game');
const ctx = canvas.getContext("2d");
const jump = new Audio("javascript/skok.mp3")
const trombom = new Audio("javascript/trombon.mp3")
const yay = new Audio("javascript/lal.mp3")
const yes = new Audio("javascript/yes.mp3")
const boom = new Audio("javascript/boom.mp3")
canvas.width = 1000;
canvas.height = 600;


const STATE_MENU = 0;
const STATE_PLAYING = 1;
const STATE_GAME_OVER = 2;

let gameState = STATE_MENU;
let player1Score = 0;
let player2Score = 0;
const WINNING_SCORE = 5;

const keysPressed = {};
window.addEventListener('keydown', function(e) {
    keysPressed[e.key] = true;
    
    
    if (gameState === STATE_MENU && e.key === ' ') {
        gameState = STATE_PLAYING;
        resetGame();
    }
    
    
    if (gameState === STATE_GAME_OVER && e.key === ' ') {
        gameState = STATE_PLAYING;
        resetGame();
    }
});

window.addEventListener('keyup', function(e) {
    keysPressed[e.key] = false;
});

function vector2(x, y) {
    return {x: x, y: y};
}

// Load ball image
const ballImage = new Image();
ballImage.src = "https://media.discordapp.net/attachments/1047855244031311904/1434582108898070729/image.png?ex=6908da34&is=690788b4&hm=bc87a20094275cdea5a157af56026daa7f5d7f87f846652564f5413d18d2c66b&=&format=webp&quality=lossless&width=405&height=350";

// Load avatar images (placeholder URLs - replace with actual avatars)
const avatar1 = new Image();
avatar1.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // placeholder
const avatar2 = new Image();
avatar2.src = "https://cdn-icons-png.flaticon.com/512/14061/14061790.png"; // placeholder



class Ball {
    constructor(pos, velocity, radius) {
        this.pos = pos;
        this.velocity = velocity;
        this.radius = radius;
        this.width = radius * 2;
        this.height = radius * 2;
        this.initialPos = {x: pos.x, y: pos.y};
        this.initialVelocity = {x: velocity.x, y: velocity.y};
    }

    update() {
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
    }

    draw() {
        if (ballImage.complete) {
            ctx.drawImage(ballImage, this.pos.x - this.radius, this.pos.y - this.radius, this.width, this.height);
        } else {
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
        }
    }
    
    reset() {
        this.pos.x = this.initialPos.x;
        this.pos.y = this.initialPos.y;
        this.velocity.x = this.initialVelocity.x * (Math.random() > 0.5 ? 1 : -1);
        this.velocity.y = this.initialVelocity.y * (Math.random() > 0.5 ? 1 : -1);
    }
}


class Paddle {
    constructor(pos, width, height, isPlayer1) {
        this.pos = pos;
        this.velocity = 8;
        this.width = width;
        this.height = height;
        this.isPlayer1 = isPlayer1;
        this.initialPos = {x: pos.x, y: pos.y};
        this.reactionDelay = 0; 
        this.predictionError = 0; 
    }

    update() {
        if (this.isPlayer1) {
            
            if (keysPressed['w'] && this.pos.y > 0) {
                this.pos.y -= this.velocity;
            }
            if (keysPressed['s'] && this.pos.y + this.height < canvas.height) {
                this.pos.y += this.velocity;
            }
        } else {
            
            this.botAI();
        }
    }

    // I NERFED THIS SHIT
    botAI() {
        
        if (Math.random() < 0.6) return;
        
        
        this.predictionError = (Math.random() - 0.55) * 90;
        
        
        const ballFutureY = ball.pos.y + (ball.velocity.y * 3) + this.predictionError;
        
        
        const paddleCenter = this.pos.y + this.height / 2;
        
        
        const diff = ballFutureY - paddleCenter;
        
        
        if (ball.velocity.x > 0 && ball.pos.x > canvas.width / 2) {
            
            const botSpeed = this.velocity * 0.7;
            
            
            const directionError = Math.random() < 0.1 ? -1 : 1;
            
            if (Math.abs(diff) > 15) { 
                if (diff * directionError > 0 && this.pos.y + this.height < canvas.height) {
                    this.pos.y += Math.min(botSpeed, Math.abs(diff) / 4);
                } else if (diff * directionError < 0 && this.pos.y > 0) {
                    this.pos.y -= Math.min(botSpeed, Math.abs(diff) / 4);
                }
            }
        } else {
            
            const centerY = canvas.height / 2 - this.height / 2;
            if (Math.random() < 0.5) { 
                if (this.pos.y < centerY - 10) {
                    this.pos.y += this.velocity * 0.5;
                } else if (this.pos.y > centerY + 10) {
                    this.pos.y -= this.velocity * 0.5;
                }
            }
        }
        
        
        if (Math.random() < 0.1) {
            return;
        }
    }

    draw() {
        ctx.fillStyle = this.isPlayer1 ? "#3498db" : "#e74c3c";
        ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
        
        
        ctx.fillStyle = "#fff";
        ctx.fillRect(this.pos.x + 5, this.pos.y + 10, this.width - 10, 5);
        ctx.fillRect(this.pos.x + 5, this.pos.y + this.height - 15, this.width - 10, 5);
    }
    
    reset() {
        this.pos.x = this.initialPos.x;
        this.pos.y = this.initialPos.y;
    }
}

function BallColisionWithEdges(ball) {
    
    if (ball.pos.y + ball.radius >= canvas.height) {
        ball.velocity.y *= -1;
        ball.pos.y = canvas.height - ball.radius; 
        jump.play()
    }

    if (ball.pos.y - ball.radius <= 0) {
        ball.velocity.y *= -1;
        ball.pos.y = ball.radius; 
        jump.play()
    }

    
    if (ball.pos.x - ball.radius <= 0) {
        player2Score++;
        boom.play()
        ball.reset();
        paddle1.reset();
        paddle2.reset();
        checkGameOver();
    }

    if (ball.pos.x + ball.radius >= canvas.width) {
        player1Score++;
        yes.play()
        ball.reset();
        paddle1.reset();
        paddle2.reset();
        checkGameOver();
    }
}

function checkPaddleCollision(ball, paddle) {
    
    let testX = ball.pos.x;
    let testY = ball.pos.y;
    
    
    if (ball.pos.x < paddle.pos.x) testX = paddle.pos.x;
    else if (ball.pos.x > paddle.pos.x + paddle.width) testX = paddle.pos.x + paddle.width;
    
    if (ball.pos.y < paddle.pos.y) testY = paddle.pos.y;
    else if (ball.pos.y > paddle.pos.y + paddle.height) testY = paddle.pos.y + paddle.height;
    
    
    let distX = ball.pos.x - testX;
    let distY = ball.pos.y - testY;
    let distance = Math.sqrt(distX * distX + distY * distY);
    
    
    if (distance <= ball.radius) {
        
        let hitPos = (ball.pos.y - paddle.pos.y) / paddle.height;
        let angle = hitPos * Math.PI - Math.PI / 2; 
        
        
        let speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y) * 1.05;
        
        
        let direction = paddle.isPlayer1 ? 1 : -1;
        
        ball.velocity.x = direction * speed * Math.cos(angle);
        ball.velocity.y = speed * Math.sin(angle);
        
        return true;
    }
    return false;
}

function checkGameOver() {
    if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
        gameState = STATE_GAME_OVER;
    }
}

function resetGame() {
    player1Score = 0;
    player2Score = 0;
    ball.reset();
    paddle1.reset();
    paddle2.reset();
}


function drawGUI() {
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height - 60);
    ctx.stroke();
    ctx.setLineDash([]);
    
    
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#3498db";
    ctx.fillText(player1Score, canvas.width / 2 - 50, canvas.height - 15);
    ctx.fillStyle = "#e74c3c";
    ctx.fillText(player2Score, canvas.width / 2 + 50, canvas.height - 15);
    
    
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, Math.PI * 2);
    ctx.fill();
    
    
    const avatarSize = 40;
    if (avatar1.complete) {
        ctx.drawImage(avatar1, canvas.width / 2 - 100, canvas.height - 50, avatarSize, avatarSize);
    }
    if (avatar2.complete) {
        ctx.drawImage(avatar2, canvas.width / 2 + 60, canvas.height - 50, avatarSize, avatarSize);
    }
}


function drawMenu() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#fff";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SAVE THE WORLD", canvas.width / 2, canvas.height / 2 - 100);
    ctx.fillStyle = "#ff0000ff";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("THE WORLD IS IN DANGER! DEFEAT THE ROBOT", canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("TO SAVE WORLD FROM AI TAKEOVER!!!!!", canvas.width / 2, canvas.height / 2 - 15);
    ctx.fillStyle = "#ffffffff";
    ctx.font = "30px Arial";
        ctx.fillStyle = "#000000ff";
    ctx.fillText("Player 1: W/S Keys", canvas.width / 2, canvas.height / 2 + 25);
        ctx.fillStyle = "#ffffffff";
    
    ctx.fillText("You : W/S Keys", canvas.width / 2, canvas.height / 2 + 25);
    ctx.fillText("Player 2: **... AI Bot", canvas.width / 2, canvas.height / 2 + 80);
    
    ctx.fillStyle = "#3498db";
    ctx.fillText("Press SPACE to Start", canvas.width / 2, canvas.height / 2 + 150);
}


function drawGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#fff";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    
    if (player1Score >= WINNING_SCORE) {
        ctx.fillStyle = "#3498db";
        ctx.fillText("YOU WIN! WORLD SAVED!!!", canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillStyle = "#ffffffff";
        ctx.fillText("YOU SAVED THE WORLD!!! THANK YOOOO", canvas.width / 2, canvas.height / 2 - 15);
        trombom.pause()
        yay.play()
    } else {
        ctx.fillStyle = "#e74c3c";
        ctx.fillText("AI BOT WINS! WORLD IS DOOMED", canvas.width / 2, canvas.height / 2 - 50);
        trombom.play()
        yes.pause()
    }
    
    ctx.fillStyle = "#fff";
    ctx.font = "40px Arial";
    ctx.fillText(`Final Score: ${player1Score} - ${player2Score}`, canvas.width / 2, canvas.height / 2 + 50);
    
    ctx.fillStyle = "#2ecc71";
    ctx.fillText("Press SPACE to Play Again", canvas.width / 2, canvas.height / 2 + 150);
}


const ball = new Ball(vector2(canvas.width / 2, canvas.height / 2), vector2(5, 5), 20);
const paddle1 = new Paddle(vector2(30, canvas.height / 2 - 80), 20, 160, true); 
const paddle2 = new Paddle(vector2(canvas.width - 50, canvas.height / 2 - 80), 20, 160, false); 

function gameUpdate() {
    if (gameState === STATE_PLAYING) {
        ball.update();
        paddle1.update();
        paddle2.update();
        BallColisionWithEdges(ball);
        
        
        checkPaddleCollision(ball, paddle1);
        checkPaddleCollision(ball, paddle2);
    }
}

function gameDraw() {
    
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === STATE_MENU) {
        drawMenu();
    } else if (gameState === STATE_PLAYING) {
        ball.draw();
        paddle1.draw();
        paddle2.draw();
        drawGUI();
    } else if (gameState === STATE_GAME_OVER) {
        ball.draw();
        paddle1.draw();
        paddle2.draw();
        drawGUI();
        drawGameOver();
    }
}

function gameLoop() {
    gameUpdate();
    gameDraw();
    window.requestAnimationFrame(gameLoop);
}


ballImage.onload = function() {
    gameLoop();
};


setTimeout(function() {
    if (!ballImage.complete) {
        console.log("Image loading timeout, starting game without image");
        gameLoop();
    }
}, 1000);