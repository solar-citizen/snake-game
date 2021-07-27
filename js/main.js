"use strict";

// setting up canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// getting canvas' height and width
let width = canvas.width;
let height = canvas.height;

// block grid variables
const blockSize = 10;
const widthInBlocks = width / blockSize;
const heightInBlocks = height / blockSize;

// set score variable
let score = 0;

// draw border func
function drawBorder() {
  ctx.fillStyle = "Gray";
  ctx.fillRect(0, 0, width, blockSize);
  ctx.fillRect(0, height - blockSize, width, blockSize);
  ctx.fillRect(0, 0, blockSize, height);
  ctx.fillRect(width - blockSize, 0, blockSize, height);
}

// draw score func
function drawScore() {
  ctx.font = "20px Courier";
  ctx.fillStyle = "Black";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Score: " + score, blockSize + 5, blockSize + 5);
}

// game over
function gameOver() {
  //clearInterval(intervalId)
  gameContinues = false;
  ctx.font = "60px Courier";
  ctx.fillStyle = "Black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Game over", width / 2, height / 2);
}

function circle(x, y, radius, fillCircle) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  if (fillCircle) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

// Block constructor
function Block(col, row) {
  this.col = col;
  this.row = row;
}

// method to draw square
Block.prototype.drawSquare = function (color) {
  let x = this.col * blockSize;
  let y = this.row * blockSize;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, blockSize, blockSize);
};

// method to draw circle
Block.prototype.drawCircle = function (color) {
  let centerX = this.col * blockSize + blockSize / 2;
  let centerY = this.row * blockSize + blockSize / 2;

  ctx.fillStyle = color;

  circle(centerX, centerY, blockSize / 2, true);
};

// method to compare blocks
Block.prototype.equal = function (otherBlock) {
  return this.col === otherBlock.col && this.row === otherBlock.row;
};

// snake constructor
function Snake() {
  this.segments = [new Block(7, 5), new Block(6, 5), new Block(5, 5)];

  this.direction = "right";
  this.nextDirection = "right";
}

// method to draw snake
Snake.prototype.draw = function () {
  this.segments[0].drawSquare("Black");
  let evenSegment = false;

  for (let i = 1; i < this.segments.length; i++) {
    if (evenSegment) {
      this.segments[i].drawSquare("Blue");
    } else {
      this.segments[i].drawSquare("Yellow");
    }

    evenSegment = !evenSegment;
  }
};

// method to move snake by creating new
// head and adding it at beginning of the snake
Snake.prototype.move = function () {
  const head = this.segments[0];
  let newHead = null;

  this.direction = this.nextDirection;

  if (this.direction === "right") {
    newHead = new Block(head.col + 1, head.row);
  } else if (this.direction === "down") {
    newHead = new Block(head.col, head.row + 1);
  } else if (this.direction === "left") {
    newHead = new Block(head.col - 1, head.row);
  } else if (this.direction === "up") {
    newHead = new Block(head.col, head.row - 1);
  }

  if (this.checkCollision(newHead)) {
    gameOver();
    return;
  }

  this.segments.unshift(newHead);

  if (newHead.equal(apple.position)) {
    score++;
    animationTime--;
    console.log(animationTime);
    apple.move(this.segments);
  } else {
    this.segments.pop();
  }
};

// method to check snake's collision with wall
// and with itself
Snake.prototype.checkCollision = function (head) {
  const leftCollision = head.col === 0;
  const topCollision = head.row === 0;
  const rightCollision = head.col === widthInBlocks - 1;
  const bottomCollision = head.row === heightInBlocks - 1;

  const wallCollision =
    leftCollision || topCollision || rightCollision || bottomCollision;

  let selfCollision = false;

  for (let i = 0; i < this.segments.length; i++) {
    if (head.equal(this.segments[i])) {
      selfCollision = true;
    }
  }

  return wallCollision || selfCollision;
};

// method to set snake's direction
// according to pressed button
Snake.prototype.setDirection = function (newDirection) {
  if (this.direction === "left" && newDirection === "right") {
    return;
  } else if (this.direction === "up" && newDirection === "down") {
    return;
  } else if (this.direction === "right" && newDirection === "left") {
    return;
  } else if (this.direction === "down" && newDirection === "up") {
    return;
  }

  this.nextDirection = newDirection;
};

// Apple constructor
function Apple() {
  this.position = new Block(10, 10);
}

// method to draw apple
Apple.prototype.draw = function () {
  this.position.drawCircle("LimeGreen");
};

// method to move apple
Apple.prototype.move = function (occupiedBlocks) {
  let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
  let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;

  this.position = new Block(randomCol, randomRow);

  // check if we moved the apple to the cell
  // currently occupied by the snake's body
  let index = occupiedBlocks.length - 1;
  while (index >= 0) {
    if (this.position.equal(occupiedBlocks[index])) {
      // call apple.move() again if
      // apple is on occupied cell
      this.move(occupiedBlocks);
      return;
    }
    index--;
  }
};

// setting up animation speed
let animationTime = 100;
// setting game state (until gameOver())
let gameContinues = true;
// creating default snake and apple
let snake = new Snake();
let apple = new Apple();

// animation function/game cycle
function gameLoop() {
  ctx.clearRect(0, 0, width, height);
  drawScore();
  snake.move();
  snake.draw();
  apple.draw();
  drawBorder();

  if (gameContinues) {
    setTimeout(gameLoop, animationTime);
  }
}

// starting game cycle
gameLoop();

// object for translating key codes into key names(arrows)
let directions = {
  37: "left",
  38: "up",
  39: "right",
  40: "down",
};

// keydown event handler called every time
// key pressed
$("body").keydown(function (event) {
  let newDirection = directions[event.keyCode];

  if (newDirection !== undefined) {
    snake.setDirection(newDirection);
  }
});
