/**
 * ICS4U - Final Project
 *
 * Description:
 *
 * Author: Wadley Moise
 */

'use strict';


const canvas = document.getElementById('poolCanvas');
const ctx = canvas.getContext('2d');
// This helps set the Timer
let firstTime = true
// Radius of the billiard balls
let radius = 10;
// Trigger the GameOver Screen
let GameOver = false
// Trigger the game Won Screen
let GameWon = false
// Will hold the setInterval
let interval = 0
let startTime = 0
let timeElapsed = 0

// How I slow down every object
const FRICTION = 0.98;
// Holds colors for the billiard balls
const COLORS = [
    '#ffffff', '#ff0000', '#0000ff', '#00ff00', '#ff00ff',
    '#00ffff', '#ffff00', '#ffa500', '#800080', '#808080',
    '#8b4513', '#000000', '#ff6347', '#4682b4', '#d2691e',
    '#b22222'
];

class Ball {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
        // Visible controls wether or not the object is interactable
        // Helps deal with pocketed billiard balls making it not visible and non-interactable
        this.visible = true
        
    }

    draw() {
        // Draws the billard balls
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    move(index) {
        let i = index
        this.vx *= FRICTION;
        this.vy *= FRICTION;
        this.x += this.vx;
        this.y += this.vy;

        // Typical wall collisions
        if (this.x + radius > canvas.width - 20 && !this.doesBallPassThrough(i)) {
            this.x = canvas.width - radius - 21
            this.vx = -this.vx;
        }
        if (this.x - radius < + 20 && !this.doesBallPassThrough(i)){

          this.x = radius + 21
          this.vx = -this.vx;
        }

        if (this.y + radius > canvas.height - 20 && !this.doesBallPassThrough(i)) {
            this.y = canvas.height - radius - 21
            this.vy = -this.vy;
        }

        if (this.y - radius < 20 && !this.doesBallPassThrough(i)){

          this.y = radius + 21
          this.vy = -this.vy;
        }
    }

    // Allows the billiard balls to ignore collisions with walls to be pocketed
    doesBallPassThrough (index) {
      
      for (let i = 0; i < pockets.length; i += 2) {

          // Calculate distance between pocket and billiard ball
          let dx = this.x - pockets[i];
          let dy = this.y - pockets[i+1];
          let distance = Math.sqrt(dx * dx + dy * dy);

          // Allow the ball to move further if it's close to a pocket
          if (distance < 15 + 10) {

              // Pocketed get outta here
              balls[index].visible = false
              // if the Cueball is pocketed trigger the GameOver Screen
              if (balls[0].visible == false){
                GameOver = true
              }
              return true;
          }
      }
      return false;
  }

    checkCollision(otherBall) {
      // Distances between both balls
      let dx = otherBall.x - this.x;
      let dy = otherBall.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < radius * 2) {
    // Calculate the angle of the collision, angle between centers
    let collisionAngle = Math.atan2(dy, dx);

    // Calculate initial velocities in the direction of the collision
    let v1 = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    let v2 = Math.sqrt(otherBall.vx * otherBall.vx + otherBall.vy * otherBall.vy);
    // Angles of the velocties
    let direction1 = Math.atan2(this.vy, this.vx);
    let direction2 = Math.atan2(otherBall.vy, otherBall.vx);

    // Get the velocities from to center to center (normal) (collision) direction
    let v1x = v1 * Math.cos(direction1 - collisionAngle);
    let v1y = v1 * Math.sin(direction1 - collisionAngle);
    let v2x = v2 * Math.cos(direction2 - collisionAngle);
    let v2y = v2 * Math.sin(direction2 - collisionAngle);


    // Conservation of Momentum - Thank you God for this Formula
    this.vx = Math.cos(collisionAngle) * v2x + Math.cos(collisionAngle + Math.PI / 2) * v1y
    this.vy = Math.sin(collisionAngle) * v2x + Math.sin(collisionAngle + Math.PI / 2) * v1y
    otherBall.vx = Math.cos(collisionAngle) * v1x + Math.cos(collisionAngle + Math.PI / 2) * v2y
    otherBall.vy = Math.sin(collisionAngle) * v1x + Math.sin(collisionAngle + Math.PI / 2) * v2y

    // How much Overlap
    let overlap = (radius * 2 - distance) / 2;
    let nx = dx / distance;
    let ny = dy / distance;
    // Adjust the billiard balls away
    this.x -= overlap * nx;
    this.y -= overlap * ny;
    otherBall.x += overlap * nx;
    otherBall.y += overlap * ny;




    }
  }
}

const balls = [];
let cueBall = new Ball(100, 200, COLORS[0]);
balls[0]= cueBall;

// Pocket Locations; adjacent indexes are pair i.e pockets[0] and pockets 1; pockets[2] and pockets[3]
// Oddly done yeah, but I've come too far
let pockets = [
  30, 30,                                 // Top-left pocket
  canvas.width / 2, 15,                   // Top-center pocket
  canvas.width - 30, 30,                  // Top-right pocket
  30, canvas.height - 30,                 // Bottom-left pocket
  canvas.width / 2, canvas.height - 15,   // Bottom-center pocket
  canvas.width - 30, canvas.height - 30  // Bottom-right pocket
];
// Positioning the balls in a triangle rack
let startX = 600;
let startY = 200;
let x;
let y;
let row = 0;
let count = 0;
// 5 rows
for (let i = 1; i < 6; i++) {
  // Height of each row grows by 1 per each row
    for (let j = 0; j < i; j++) {

         x = startX + (radius* 2 + 1) * row;
         // I and J are used for centering the billiard balls
         y = startY - (radius * 2 + 1) * (i / 2) + j * (radius* 2 + 1);
        balls.push(new Ball(x, y, COLORS[count + 1]));
        count++;
    }
    row++;
}

function drawTable() {
  // Draw table surface
  ctx.fillStyle = '#008000'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw railings (borders)
  ctx.strokeStyle = '#964B00';  
  ctx.lineWidth = 20;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Draw pockets (sockets)
  ctx.fillStyle = '#000';  
  for (let i = 0; i < pockets.length; i += 2) {


    ctx.beginPath();
    ctx.arc(pockets[i], pockets[i + 1], 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}
}



function update() {
  // Make sure game doesn't update when you lose
  if (!GameOver){
    
    // clear the canvas do be redrawn
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    drawTable();
    
    // Check each for for a wall collion and redraw
    for (let i = 0; i < balls.length; i++){

      if (balls[i].visible == true){
      balls[i].move(i)
      // Make sure to stop new non-visible billiard balls
      if (balls[i].visible == true )
      balls[i].draw()
      
    }
    }



    // Check collisions between balls
   for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          if (balls[i].visible == true && balls[j].visible == true){
            balls[i].checkCollision(balls[j]);
          }
        }
    }

    didGameWin()
  }
  else{
    drawGameOverScreen()
  }

    requestAnimationFrame(update);
}

// Where we calculate the power of the cueBall
canvas.addEventListener('click', (event) => {
  
  if (!GameOver){
    // Start the Timer
    if (firstTime){
      startTime = Date.now() - timeElapsed
      interval = setInterval(function () {timeElapsed = Date.now() - startTime},1000)
    }
    firstTime = false
    
    // Get accurate mouseX and mouseY
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Make sure the cueBall is still
    if ((Math.abs(balls[0].vx) < 0.07 && Math.abs(balls[0].vy) < 0.07)){
    // Calculate velocity based on distance to mouse click
    cueBall.vx = (mouseX - cueBall.x) / 10;
    cueBall.vy = (mouseY - cueBall.y) / 10;
    
  }
  
  }
});



function drawGameOverScreen() {
  //Draw the red screen of doom
  clearInterval(interval)
  ctx.fillStyle = "#FF474D";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  

  ctx.font = '30px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = '20px Arial';
  ctx.fillText('Press any key to play again', canvas.width / 2, canvas.height / 2 + 20);
}

function drawGameWinScreen(timeElapsed){
// Draw the winning screen
  ctx.fillStyle = 'rgba(144, 238, 144, 1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  

  ctx.font = '30px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('You Won', canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = '20px Arial';
  ctx.fillText('Press any key to play again', canvas.width / 2, canvas.height / 2 + 20);
  ctx.fillText('Your time was ' + timeElapsed + " seconds!", canvas.width / 2, canvas.height / 2 + 40);
}

document.addEventListener('keydown', function(event) {
  // Whenever were in GameOver or GameWon phase keydown will restart the game
  if (GameOver || GameWon) {
      resetGame();
  }
});

function didGameWin(){
  // If all of the balls are not visible
  for (let i = 1; i < balls.length; i++){
    if (balls[i].visible == true){
      return
    }
  }
  // Yayyyyy
  GameWon = true
  clearInterval(interval)
  drawGameWinScreen(timeElapsed/1000)
}

function resetGame() {
  GameOver = false;
  GameWon = false;
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Default all stats for the next game
  interval;
  timeElapsed = 0
  startTime = 0
  firstTime = true
  startX = 600;
  startY = 200;
  x;
  y;
  row = 0;
  count = 1;
  cueBall.x = 100
  cueBall.y = 200
  for (let i = 0; i < balls.length; i++){
    balls[i].visible = true
    balls[i].vx = 0
    balls[i].vy = 0
    
  }
  // Redraw the triangle
  for (let i = 1; i < 6; i++) {
    for (let j = 0; j < i; j++) {
         x = startX + (radius* 2 + 1) * row;
         y = startY - (radius * 2 + 1) * (i / 2) + j * (radius* 2 + 1);
        balls[count].x = x
        balls[count].y = y
        count++
        
    }
    row++;
}
 
}
update();
